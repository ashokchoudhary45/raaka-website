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

/**
 * Get ALL object keys from a prefix.
 *
 * Important:
 * This uses pagination for the R2 LIST operation,
 * but does NOT download every metadata JSON.
 */
async function listKeys(prefix: string): Promise<string[]> {
  const keys: string[] = [];
  let token: string | undefined;

  do {
    const result = await r2.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: prefix,
        ContinuationToken: token,
      }),
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

/**
 * Read one metadata JSON.
 */
async function readMeta(key: string): Promise<Meta | null> {
  try {
    const result = await r2.send(
      new GetObjectCommand({
        Bucket: BUCKET,
        Key: key,
      }),
    );

    if (!result.Body) {
      return null;
    }

    const text = await result.Body.transformToString();

    return JSON.parse(text) as Meta;
  } catch (error) {
    console.error(`Failed to read fan-art metadata: ${key}`, error);
    return null;
  }
}

/**
 * Extract numeric ID from:
 *
 * fan-art-meta/1760000000000.jpg.json
 */
function getIdFromMetaKey(key: string): number {
  const filename = key.split("/").pop() || "";
  const match = filename.match(/^(\d+)/);

  return match ? Number(match[1]) : 0;
}

export async function GET(request: Request) {
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
        { status: 500 },
      );
    }

    const url = new URL(request.url);

    /*
     * Keep every gallery request safely below
     * Cloudflare Workers Free subrequest limits.
     *
     * 40 metadata GETs + 1 metadata LIST
     * = maximum 41 R2 subrequests.
     */
    const requestedLimit = Number(
      url.searchParams.get("limit") || "40",
    );

    const limit = Math.min(
      Math.max(requestedLimit, 1),
      40,
    );

    const page = Math.max(
      Number(url.searchParams.get("page") || "1"),
      1,
    );

    /*
     * R2 remains the source of truth.
     */
    const metadataKeys = await listKeys("fan-art-meta/");

    const metadataFiles = metadataKeys
      .filter((key) => key.endsWith(".json"))
      .sort(
        (a, b) =>
          getIdFromMetaKey(b) -
          getIdFromMetaKey(a),
      );

    const totalMetadata = metadataFiles.length;

    /*
     * Pagination happens BEFORE GetObject.
     *
     * So if there are 500 artworks,
     * we don't download 500 metadata files.
     *
     * We only download the requested 40.
     */
    const start = (page - 1) * limit;

    const pageKeys = metadataFiles.slice(
      start,
      start + limit,
    );

    /*
     * Maximum 40 GetObject calls.
     */
    const metadataResults = await Promise.all(
      pageKeys.map((key) => readMeta(key)),
    );

    /*
     * Only approved artworks are public.
     */
    const items = metadataResults
      .filter(
        (item): item is Meta =>
          !!item && item.status === "approved",
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
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

    const totalPages = Math.ceil(
      totalMetadata / limit,
    );

    return NextResponse.json(
      {
        success: true,

        total: totalMetadata,

        page,

        limit,

        totalPages,

        hasNextPage: page < totalPages,

        items,
      },
      {
        headers: {
          /*
           * Don't cache approval/rejection changes.
           */
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error: unknown) {
    console.error(
      "R2 fan art gallery error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load fan art gallery.",
      },
      { status: 500 },
    );
  }
}