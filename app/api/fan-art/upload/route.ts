import { NextResponse } from "next/server";
import { ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

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

export async function GET() {
  try {
    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
      return NextResponse.json({ error: "R2 environment variables are missing." }, { status: 500 });
    }

    const objects: Array<{ Key?: string; LastModified?: Date; Size?: number }> = [];
    let continuationToken: string | undefined;

    do {
      const result = await r2.send(
        new ListObjectsV2Command({
          Bucket: R2_BUCKET_NAME,
          Prefix: "fan-art/",
          ContinuationToken: continuationToken,
        })
      );

      if (result.Contents) objects.push(...result.Contents);
      continuationToken = result.IsTruncated ? result.NextContinuationToken : undefined;
    } while (continuationToken);

    const items = objects
      .filter((item) => !!item.Key)
      .sort((a, b) => (b.LastModified?.getTime() || 0) - (a.LastModified?.getTime() || 0))
      .map((item) => ({
        key: item.Key!,
        publicUrl: `${R2_PUBLIC_URL!.replace(/\/$/, "")}/${item.Key!}`,
        lastModified: item.LastModified?.toISOString(),
        size: item.Size || 0,
      }));

    return NextResponse.json({ success: true, total: items.length, items }, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error: any) {
    console.error("R2 gallery list error:", error);
    return NextResponse.json(
      { error: error?.message || error?.name || "Failed to load fan art from R2." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (
      !R2_ACCOUNT_ID ||
      !R2_ACCESS_KEY_ID ||
      !R2_SECRET_ACCESS_KEY ||
      !R2_BUCKET_NAME ||
      !R2_PUBLIC_URL
    ) {
      return NextResponse.json(
        {
          error: "R2 environment variables are missing.",
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: "No image file was provided.",
        },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        {
          error: "Only image files are allowed.",
        },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: "Image must be smaller than 10 MB.",
        },
        { status: 400 }
      );
    }

    const extension =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : file.type === "image/gif"
            ? "gif"
            : "jpg";

    const randomPart = crypto.randomUUID();

    const fileName = `fan-art/${Date.now()}-${randomPart}.${extension}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await r2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );

    const publicUrl =
      `${R2_PUBLIC_URL.replace(/\/$/, "")}/${fileName}`;

    return NextResponse.json({
      success: true,
      fileName,
      publicUrl,
    });
  } catch (error: any) {
    console.error("R2 upload error FULL:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          error?.Code ||
          error?.name ||
          "Unknown R2 error",
      },
      { status: 500 }
    );
  }
}