import { GetObjectCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

const ACCOUNT = process.env.R2_ACCOUNT_ID;
const ACCESS = process.env.R2_ACCESS_KEY_ID;
const SECRET = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET = process.env.R2_BUCKET_NAME;
const PUBLIC_URL = process.env.R2_PUBLIC_URL;

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: ACCESS || "", secretAccessKey: SECRET || "" },
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
    const result = await r2.send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefix, ContinuationToken: token }));
    for (const item of result.Contents || []) if (item.Key) keys.push(item.Key);
    token = result.IsTruncated ? result.NextContinuationToken : undefined;
  } while (token);
  return keys;
}

async function readMeta(key: string): Promise<Meta | null> {
  try {
    const result = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    if (!result.Body) return null;
    return JSON.parse(await result.Body.transformToString()) as Meta;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    if (!ACCOUNT || !ACCESS || !SECRET || !BUCKET || !PUBLIC_URL) {
      return NextResponse.json({ error: "R2 environment variables are missing." }, { status: 500 });
    }

    const keys = await listKeys("fan-art-meta/");
    const all = (await Promise.all(keys.filter(k => k.endsWith(".json")).map(readMeta)))
      .filter((item): item is Meta => !!item && item.status === "approved")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(item => ({
        id: item.id,
        created_at: item.createdAt,
        fan_name: item.fanName,
        title: item.title,
        image_url: item.imageUrl || `${PUBLIC_URL!.replace(/\/$/, "")}/${item.r2Key}`,
        social_link: item.socialLink,
        status: item.status,
      }));

    return NextResponse.json({ success: true, total: all.length, items: all }, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (error: any) {
    console.error("R2 fan art gallery error:", error);
    return NextResponse.json({ error: error?.message || "Failed to load fan art gallery." }, { status: 500 });
  }
}
