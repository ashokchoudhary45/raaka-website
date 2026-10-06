import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

const ACCOUNT = process.env.R2_ACCOUNT_ID;
const ACCESS = process.env.R2_ACCESS_KEY_ID;
const SECRET = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET = process.env.R2_BUCKET_NAME;
const PUBLIC_URL = process.env.R2_PUBLIC_URL;

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS || "",
    secretAccessKey: SECRET || "",
  },
});

type Meta = {
  id: number;
  r2Key: string;
  imageUrl: string;
  fanName: string;
  title: string;
  socialLink: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

async function listKeys(prefix: string) {
  const keys: string[] = [];
  let token: string | undefined;

  do {
    const result = await r2.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: prefix,
        ContinuationToken: token,
      })
    );

    for (const item of result.Contents || []) {
      if (item.Key) {
        keys.push(item.Key);
      }
    }

    token = result.IsTruncated
      ? result.NextContinuationToken
      : undefined;
  } while (token);

  return keys;
}

async function readMeta(key: string): Promise<Meta | null> {
  try {
    const result = await r2.send(
      new GetObjectCommand({
        Bucket: BUCKET,
        Key: key,
      })
    );

    if (!result.Body) {
      return null;
    }

    const text = await result.Body.transformToString();

    return JSON.parse(text) as Meta;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    if (
      !ACCOUNT ||
      !ACCESS ||
      !SECRET ||
      !BUCKET ||
      !PUBLIC_URL
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "R2 environment variables are missing.",
        },
        { status: 500 }
      );
    }

    /*
     * R2 is the source of truth.
     *
     * We read metadata JSON files from:
     * fan-art-meta/
     *
     * Only:
     * status === "approved"
     *
     * artworks are returned to the public gallery.
     */

    const metadataKeys = await listKeys("fan-art-meta/");

    const metadataFiles = metadataKeys.filter((key) =>
      key.endsWith(".json")
    );

    const metadataResults = await Promise.all(
      metadataFiles.map((key) => readMeta(key))
    );

    const approvedMetadata = metadataResults.filter(
      (item): item is Meta =>
        !!item && item.status === "approved"
    );

    /*
     * Important:
     * Also verify that the actual image still exists in R2.
     *
     * This prevents old/orphan metadata JSON files from
     * appearing in the public gallery after their image
     * has been deleted.
     */

    const imageKeys = new Set(
      (await listKeys("fan-art/")).filter(
        (key) => !key.endsWith("/")
      )
    );

    const items = approvedMetadata
      .filter((item) => imageKeys.has(item.r2Key))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
      .map((item) => ({
        id: item.id,

        created_at: item.createdAt,

        fan_name: item.fanName,

        title: item.title,

        image_url:
          item.imageUrl ||
          `${PUBLIC_URL.replace(/\/$/, "")}/${item.r2Key}`,

        social_link: item.socialLink,

        status: item.status,
      }));

    return NextResponse.json(
      {
        success: true,
        total: items.length,
        items,
      },
      {
        headers: {
          /*
           * Do not keep old gallery results cached.
           * R2 approval/rejection should reflect immediately.
           */
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error: unknown) {
    console.error("R2 fan art gallery error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load fan art gallery.",
      },
      { status: 500 }
    );
  }
}