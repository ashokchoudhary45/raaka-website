import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ACCOUNT = process.env.R2_ACCOUNT_ID;
const ACCESS = process.env.R2_ACCESS_KEY_ID;
const SECRET = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET = process.env.R2_BUCKET_NAME;
const PUBLIC_URL = process.env.R2_PUBLIC_URL;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: ACCESS || "", secretAccessKey: SECRET || "" },
});

type Status = "pending" | "approved" | "rejected";
type Meta = {
  id: number;
  r2Key: string;
  imageUrl: string;
  fanName: string;
  title: string;
  socialLink: string | null;
  status: Status;
  createdAt: string;
};

function metadataKey(imageKey: string) {
  return `fan-art-meta/${imageKey.replace(/^fan-art\//, "")}.json`;
}

function configError() {
  return !ACCOUNT || !ACCESS || !SECRET || !BUCKET || !PUBLIC_URL;
}

async function listKeys(prefix: string) {
  const keys: string[] = [];
  let token: string | undefined;
  do {
    const result = await r2.send(new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: prefix,
      ContinuationToken: token,
    }));
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

async function writeMeta(meta: Meta) {
  await r2.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: metadataKey(meta.r2Key),
    Body: JSON.stringify(meta, null, 2),
    ContentType: "application/json; charset=utf-8",
    CacheControl: "no-store",
  }));
}

async function requireAdmin(request: Request) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { error: "Supabase authentication environment variables are missing." };
  }

  const header = request.headers.get("authorization") || "";
  const token = header.replace(/^Bearer\s+/i, "").trim();
  if (!token) return { error: "Authentication required." };

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return { error: "Invalid or expired admin session." };

  const allowed = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map(v => v.trim().toLowerCase())
    .filter(Boolean);

  if (allowed.length && (!data.user.email || !allowed.includes(data.user.email.toLowerCase()))) {
    return { error: "You are not authorized to access the fan-art admin panel." };
  }

  return { user: data.user };
}

function publicItem(meta: Meta) {
  return {
    id: meta.id,
    created_at: meta.createdAt,
    fan_name: meta.fanName,
    title: meta.title,
    image_url: meta.imageUrl,
    social_link: meta.socialLink,
    status: meta.status,
  };
}

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });
    if (configError()) return NextResponse.json({ error: "R2 environment variables are missing." }, { status: 500 });

    const status = new URL(request.url).searchParams.get("status") as Status | null;
    const allowedStatus: Status[] = ["pending", "approved", "rejected"];
    const filter = status && allowedStatus.includes(status) ? status : "pending";

    const keys = await listKeys("fan-art-meta/");
    const metas = (await Promise.all(keys.filter(k => k.endsWith(".json")).map(readMeta)))
      .filter((item): item is Meta => !!item && item.status === filter)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, items: metas.map(publicItem) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    console.error("Fan-art admin GET error:", error);
    return NextResponse.json({ error: error?.message || "Failed to load fan-art submissions." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: 401 });
    if (configError()) return NextResponse.json({ error: "R2 environment variables are missing." }, { status: 500 });

    const body = (await request.json()) as { action?: string; id?: number };
    const action = body.action;

    if (action === "sync") {
      const imageKeys = (await listKeys("fan-art/")).filter(k => !k.endsWith("/") && !k.endsWith(".json"));
      const metaKeys = new Set(await listKeys("fan-art-meta/"));
      let inserted = 0;
      let alreadyKnown = 0;

      for (const imageKey of imageKeys) {
        const mk = metadataKey(imageKey);
        if (metaKeys.has(mk)) {
          alreadyKnown++;
          continue;
        }

        const id = Date.now() + inserted;
        const createdAt = new Date().toISOString();
        const meta: Meta = {
          id,
          r2Key: imageKey,
          imageUrl: `${PUBLIC_URL!.replace(/\/$/, "")}/${imageKey}`,
          fanName: "Unknown fan",
          title: "RAAKA Fan Art",
          socialLink: null,
          status: "pending",
          createdAt,
        };
        await writeMeta(meta);
        inserted++;
      }

      return NextResponse.json({ success: true, r2Total: imageKeys.length, inserted, alreadyKnown });
    }

    if (!body.id) return NextResponse.json({ error: "Fan-art ID is required." }, { status: 400 });

    const metaKeys = await listKeys("fan-art-meta/");
    let found: Meta | null = null;
    let foundKey: string | null = null;

    for (const key of metaKeys.filter(k => k.endsWith(".json"))) {
      const meta = await readMeta(key);
      if (meta?.id === body.id) {
        found = meta;
        foundKey = key;
        break;
      }
    }

    if (!found || !foundKey) return NextResponse.json({ error: "Fan-art submission not found." }, { status: 404 });

    if (action === "approve") {
      found.status = "approved";
      await writeMeta(found);
      return NextResponse.json({ success: true, item: publicItem(found) });
    }

    if (action === "reject") {
      await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: found.r2Key }));
      await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: foundKey }));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown admin action." }, { status: 400 });
  } catch (error: any) {
    console.error("Fan-art admin POST error:", error);
    return NextResponse.json({ error: error?.message || "Fan-art admin action failed." }, { status: 500 });
  }
}
