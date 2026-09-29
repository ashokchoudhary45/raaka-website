"use client";

import { useState } from "react";

export type RaakaPassportData = {
  name: string;
  country?: string;
  twitterUsername?: string;
  instagramUsername?: string;
  passportCode: string;
  score?: number;
  totalQuestions?: number;
  xp?: number;
  level?: number;
  quizDate?: string;
  dateOfBirth?: string;
  profileImageUrl?: string;
};

type Props = {
  data: RaakaPassportData;
  templateUrl?: string;
};

function cleanUsername(value?: string) {
  return (value || "")
    .trim()
    .replace(/^@/, "")
    .replace(
      /^https?:\/\/(www\.)?(x\.com|twitter\.com|instagram\.com)\//i,
      ""
    )
    .replace(/\/.*$/, "");
}

function getProfileImageUrl(data: RaakaPassportData) {
  if (data.profileImageUrl?.trim()) {
    return data.profileImageUrl.trim();
  }

  const twitter = cleanUsername(data.twitterUsername);

  if (twitter) {
    return `https://unavatar.io/x/${encodeURIComponent(
      twitter
    )}?fallback=false`;
  }

  const instagram = cleanUsername(data.instagramUsername);

  if (instagram) {
    return `https://unavatar.io/instagram/${encodeURIComponent(
      instagram
    )}?fallback=false`;
  }

  return "";
}

function getSocial(data: RaakaPassportData) {
  const twitter = cleanUsername(data.twitterUsername);

  if (twitter) {
    return {
      label: "TWITTER/X",
      value: `@${twitter}`,
    };
  }

  const instagram = cleanUsername(data.instagramUsername);

  if (instagram) {
    return {
      label: "INSTAGRAM",
      value: `@${instagram}`,
    };
  }

  return {
    label: "TWITTER/X",
    value: "NOT PROVIDED",
  };
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.crossOrigin = "anonymous";

    image.onload = () => resolve(image);

    image.onerror = () =>
      reject(new Error(`Image failed to load: ${src}`));

    image.src = src;
  });
}

function drawProfilePhoto(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement
) {
  const x = 58;
  const y = 378;
  const w = 272;
  const h = 299;

  const imageRatio = image.width / image.height;
  const boxRatio = w / h;

  let drawW: number;
  let drawH: number;
  let drawX: number;
  let drawY: number;

  if (imageRatio > boxRatio) {
    drawH = h;
    drawW = h * imageRatio;
    drawX = x - (drawW - w) / 2;
    drawY = y;
  } else {
    drawW = w;
    drawH = w / imageRatio;
    drawX = x;
    drawY = y - (drawH - h) / 2;
  }

  ctx.save();

  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 24);
  ctx.clip();

  ctx.drawImage(
    image,
    drawX,
    drawY,
    drawW,
    drawH
  );

  ctx.restore();
}

function fitFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startSize = 27
) {
  let size = startSize;

  while (size > 14) {
    ctx.font = `600 ${size}px Georgia, serif`;

    if (ctx.measureText(text).width <= maxWidth) {
      break;
    }

    size -= 1;
  }

  return size;
}

function drawValue(
  ctx: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  maxWidth = 390
) {
  const text = value || "—";

  const size = fitFont(
    ctx,
    text,
    maxWidth
  );

  ctx.font = `600 ${size}px Georgia, serif`;
  ctx.fillStyle = "#f5dda0";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  ctx.fillText(text, x, y);
}

export default function RaakaPassportGenerator({
  data,
  templateUrl = "/images/raaka-passport-template.png",
}: Props) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  async function downloadPassport() {
    setDownloading(true);
    setError("");

    try {
      const canvas = document.createElement("canvas");

      canvas.width = 1536;
      canvas.height = 1024;

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Canvas is not supported.");
      }

      // Load exact RAAKA passport template.
      const template = await loadImage(templateUrl);

      ctx.drawImage(
        template,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // Automatic Twitter/X or Instagram profile picture.
      const profileUrl = getProfileImageUrl(data);

      if (profileUrl) {
        try {
          const profile = await loadImage(profileUrl);

          drawProfilePhoto(
            ctx,
            profile
          );
        } catch (photoError) {
          console.warn(
            "Social profile image could not be loaded:",
            photoError
          );
        }
      }

      // NAME
      drawValue(
        ctx,
        (data.name || "—").toUpperCase(),
        637,
        376
      );

      // COUNTRY
      drawValue(
        ctx,
        (data.country || "—").toUpperCase(),
        637,
        449
      );

      // TWITTER/X OR INSTAGRAM
      const social = getSocial(data);

      drawValue(
        ctx,
        social.value,
        637,
        526
      );

      // QUIZ SCORE
      const score =
        data.score !== undefined
          ? `${Math.round(data.score / 10)} / ${
              data.totalQuestions ?? 10
            }`
          : "—";

      drawValue(
        ctx,
        score,
        637,
        607
      );

      // PASSPORT CODE
      drawValue(
        ctx,
        (
          data.passportCode ||
          "RAAKA-XXXXXX"
        ).toUpperCase(),
        637,
        687
      );

      /*
       * Intentionally NOT adding:
       * QR
       * MRZ
       * XP
       * LEVEL
       * ISSUE DATE
       * VALID UNTIL
       *
       * because the current RAAKA passport artwork
       * does not contain those fields.
       */

      const link =
        document.createElement("a");

      link.download =
        `RAAKA-PASSPORT-${data.passportCode}.png`;

      link.href =
        canvas.toDataURL(
          "image/png",
          1
        );

      link.click();
    } catch (err) {
      console.error(
        "Passport generation failed:",
        err
      );

      setError(
        "Passport generate nahi ho paaya. Template image check karo."
      );
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="mt-8 text-center">

      <button
        type="button"
        onClick={downloadPassport}
        disabled={downloading}
        className="inline-flex items-center justify-center rounded-2xl border border-amber-200/25 bg-gradient-to-r from-amber-100 to-white px-7 py-4 text-sm font-black uppercase tracking-[0.16em] text-black shadow-[0_0_45px_rgba(245,158,11,0.16)] transition hover:scale-[1.02] hover:from-white hover:to-amber-50 disabled:cursor-wait disabled:opacity-60"
      >
        {downloading
          ? "Generating Passport..."
          : "Download My RAAKA Passport"}
      </button>

      {error && (
        <p className="mt-3 text-xs text-red-300">
          {error}
        </p>
      )}

      <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-white/30">
        Fictional fan-universe document
      </p>

    </div>
  );
}