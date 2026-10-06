import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || "",
    secretAccessKey: R2_SECRET_ACCESS_KEY || "",
  },
});

function metaKey(imageKey: string) {
  const basename = imageKey.replace(/^fan-art\//, "");
  return `fan-art-meta/${basename}.json`;
}

export async function POST(request: Request) {
  let uploadedKey: string | null = null;
  let uploadedMetaKey: string | null = null;

  try {
    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
      return NextResponse.json({ error: "R2 environment variables are missing." }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const fanName = String(formData.get("fanName") || "").trim();
    const title = String(formData.get("title") || "").trim();
    const socialLink = String(formData.get("socialLink") || "").trim() || null;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No image file was provided." }, { status: 400 });
    }
    if (!fanName) return NextResponse.json({ error: "Fan name is required." }, { status: 400 });
    if (!title) return NextResponse.json({ error: "Artwork title is required." }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Image must be smaller than 10 MB." }, { status: 400 });

    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : file.type === "image/gif" ? "gif" : "jpg";
    const id = Date.now();
    const imageKey = `fan-art/${id}.${extension}`;
    const imageUrl = `${R2_PUBLIC_URL.replace(/\/$/, "")}/${imageKey}`;
    const createdAt = new Date().toISOString();

    await r2.send(new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: imageKey,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable",
    }));
    uploadedKey = imageKey;

    const metadata = {
      id,
      r2Key: imageKey,
      imageUrl,
      fanName,
      title,
      socialLink,
      status: "pending",
      createdAt,
    };

    uploadedMetaKey = metaKey(imageKey);
    await r2.send(new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: uploadedMetaKey,
      Body: JSON.stringify(metadata, null, 2),
      ContentType: "application/json; charset=utf-8",
      CacheControl: "no-store",
    }));

    return NextResponse.json({ success: true, item: metadata });
  } catch (error: any) {
    console.error("R2 fan art upload error:", error);

    // Do not leave an orphaned image if metadata creation failed.
    if (uploadedKey && R2_BUCKET_NAME) {
      try { await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: uploadedKey })); } catch {}
    }
    if (uploadedMetaKey && R2_BUCKET_NAME) {
      try { await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: uploadedMetaKey })); } catch {}
    }

    return NextResponse.json({ error: error?.message || "Failed to upload fan art to R2." }, { status: 500 });
  }
}
