import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env"
  );
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SECRET_KEY,
  {
    auth: {
      persistSession: false,
    },
  }
);

const BUCKET = "fan-art";
const TARGET_BYTES = 20 * 1024;
const MAX_DIMENSION = 1200;

async function compressTo20KB(inputBuffer) {
  let width = MAX_DIMENSION;
  let quality = 72;

  for (let attempt = 0; attempt < 18; attempt++) {
    const output = await sharp(inputBuffer)
      .rotate()
      .resize({
        width,
        height: width,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({
        quality,
        mozjpeg: true,
        progressive: true,
      })
      .toBuffer();

    if (output.length <= TARGET_BYTES) {
      return output;
    }

    if (quality > 10) {
      quality -= 6;
    } else {
      width = Math.max(240, Math.round(width * 0.78));
      quality = 72;
    }
  }

  return await sharp(inputBuffer)
    .rotate()
    .resize({
      width: 240,
      height: 240,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 10,
      mozjpeg: true,
      progressive: true,
    })
    .toBuffer();
}

async function listAllObjects() {
  const all = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list("", {
        limit,
        offset,
        sortBy: {
          column: "name",
          order: "asc",
        },
      });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      break;
    }

    all.push(...data.filter((item) => item.name));

    if (data.length < limit) {
      break;
    }

    offset += limit;
  }

  return all;
}

async function main() {
  console.log("======================================");
  console.log("RAAKA FAN ART BULK OPTIMIZER");
  console.log("======================================");
  console.log("Target: <= 20 KB per image");
  console.log("");

  const objects = await listAllObjects();

  console.log(
    `Found ${objects.length} object(s) in ${BUCKET}/`
  );

  if (objects.length === 0) {
    console.log("Nothing to process.");
    return;
  }

  let processed = 0;
  let skipped = 0;
  let failed = 0;

  let beforeTotal = 0;
  let afterTotal = 0;

  for (const object of objects) {
    const path = object.name;

    if (!/\.(jpe?g|png|webp|gif|avif)$/i.test(path)) {
      skipped++;
      console.log(
        `SKIP  ${path} (not a supported image)`
      );
      continue;
    }

    try {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .download(path);

      if (error) {
        throw error;
      }

      const inputBuffer = Buffer.from(
        await data.arrayBuffer()
      );

      const originalBytes = inputBuffer.length;

      beforeTotal += originalBytes;

      if (originalBytes <= TARGET_BYTES) {
        afterTotal += originalBytes;

        skipped++;

        console.log(
          `OK    ${path} | ${(originalBytes / 1024).toFixed(1)} KB already <=20 KB`
        );

        continue;
      }

      const compressed = await compressTo20KB(
        inputBuffer
      );

      const { error: uploadError } =
        await supabase.storage
          .from(BUCKET)
          .upload(path, compressed, {
            contentType: "image/jpeg",
            cacheControl: "31536000",
            upsert: true,
          });

      if (uploadError) {
        throw uploadError;
      }

      afterTotal += compressed.length;
      processed++;

      console.log(
        `DONE  ${path} | ${(originalBytes / 1024).toFixed(1)} KB -> ${(compressed.length / 1024).toFixed(1)} KB`
      );
    } catch (error) {
      failed++;

      console.error(
        `FAIL  ${path}`,
        error?.message || error
      );
    }
  }

  console.log("");
  console.log("======================================");
  console.log("COMPLETE");
  console.log("======================================");

  console.log(`Found:      ${objects.length}`);
  console.log(`Compressed: ${processed}`);
  console.log(`Skipped:    ${skipped}`);
  console.log(`Failed:     ${failed}`);

  console.log(
    `Before:     ${(beforeTotal / 1024 / 1024).toFixed(2)} MB`
  );

  console.log(
    `After:      ${(afterTotal / 1024 / 1024).toFixed(2)} MB`
  );

  if (beforeTotal > 0) {
    const saved = beforeTotal - afterTotal;

    console.log(
      `Saved:      ${(saved / 1024 / 1024).toFixed(2)} MB`
    );

    console.log(
      `Reduction:  ${((saved / beforeTotal) * 100).toFixed(1)}%`
    );
  }

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("");
  console.error("FATAL:", error?.message || error);
  process.exitCode = 1;
});