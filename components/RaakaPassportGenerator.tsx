"use client";

import { useState } from "react";
import QRCode from "qrcode";

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

function safeText(value: string | undefined, fallback = "—") {
  const text = (value || "").trim();
  return text || fallback;
}

function cleanUsername(value?: string) {
  return (value || "")
    .trim()
    .replace(/^@/, "")
    .replace(/^https?:\/\/(www\.)?(x\.com|twitter\.com|instagram\.com)\//i, "")
    .replace(/\/.*$/, "");
}

function formatDate(value?: string) {
  if (!value) return "29 SEP 2026";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) {
    return value.toUpperCase();
  }

  return d
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
}

function levelName(level: number) {
  if (level >= 10) return "RAAKA IMMORTAL";
  if (level >= 8) return "RAAKA LEGEND";
  if (level >= 6) return "COSMIC WARRIOR";
  if (level >= 4) return "DIVINE WARRIOR";
  if (level >= 2) return "RAAKA WARRIOR";
  return "NEW INITIATE";
}

function drawLabelValue(
  ctx: CanvasRenderingContext2D,
  label: string,
  value: string,
  x: number,
  y: number,
  valueSize = 27
) {
  ctx.font = "12px Georgia, serif";
  ctx.fillStyle = "#d9b778";
  ctx.fillText(label.toUpperCase(), x, y);

  ctx.font = `600 ${valueSize}px Georgia, serif`;
  ctx.fillStyle = "#f2dfbb";
  ctx.fillText(value, x, y + 28);
}

async function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.crossOrigin = "anonymous";

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Image failed: ${src}`));

    image.src = src;
  });
}

/*
 * Priority:
 * 1. Explicit profileImageUrl
 * 2. X / Twitter username
 * 3. Instagram username
 */
function getProfileImageUrl(data: RaakaPassportData) {
  if (data.profileImageUrl?.trim()) {
    return data.profileImageUrl.trim();
  }

  const twitter = cleanUsername(data.twitterUsername);

  if (twitter) {
    return `https://unavatar.io/x/${encodeURIComponent(twitter)}?fallback=false`;
  }

  const instagram = cleanUsername(data.instagramUsername);

  if (instagram) {
    return `https://unavatar.io/instagram/${encodeURIComponent(
      instagram
    )}?fallback=false`;
  }

  return "";
}

async function drawProfilePhoto(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement
) {
  /*
   * Passport photo box:
   * x = 70
   * y = 302
   * width = 358
   * height = 430
   */

  const boxX = 70;
  const boxY = 302;
  const boxW = 358;
  const boxH = 430;

  const imageRatio = image.width / image.height;
  const boxRatio = boxW / boxH;

  let drawW;
  let drawH;
  let drawX;
  let drawY;

  if (imageRatio > boxRatio) {
    // Image is wider -> crop left/right
    drawH = boxH;
    drawW = drawH * imageRatio;
    drawX = boxX - (drawW - boxW) / 2;
    drawY = boxY;
  } else {
    // Image is taller -> crop top/bottom
    drawW = boxW;
    drawH = drawW / imageRatio;
    drawX = boxX;
    drawY = boxY - (drawH - boxH) / 2;
  }

  ctx.save();

  // Rounded passport photo mask
  const radius = 30;

  ctx.beginPath();
  ctx.moveTo(boxX + radius, boxY);
  ctx.lineTo(boxX + boxW - radius, boxY);
  ctx.quadraticCurveTo(
    boxX + boxW,
    boxY,
    boxX + boxW,
    boxY + radius
  );
  ctx.lineTo(boxX + boxW, boxY + boxH - radius);
  ctx.quadraticCurveTo(
    boxX + boxW,
    boxY + boxH,
    boxX + boxW - radius,
    boxY + boxH
  );
  ctx.lineTo(boxX + radius, boxY + boxH);
  ctx.quadraticCurveTo(
    boxX,
    boxY + boxH,
    boxX,
    boxY + boxH - radius
  );
  ctx.lineTo(boxX, boxY + radius);
  ctx.quadraticCurveTo(boxX, boxY, boxX + radius, boxY);
  ctx.closePath();

  ctx.clip();

  ctx.drawImage(image, drawX, drawY, drawW, drawH);

  ctx.restore();

  // Gold border
  ctx.save();

  ctx.strokeStyle = "#d9b778";
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.moveTo(boxX + radius, boxY);
  ctx.lineTo(boxX + boxW - radius, boxY);
  ctx.quadraticCurveTo(
    boxX + boxW,
    boxY,
    boxX + boxW,
    boxY + radius
  );
  ctx.lineTo(boxX + boxW, boxY + boxH - radius);
  ctx.quadraticCurveTo(
    boxX + boxW,
    boxY + boxH,
    boxX + boxW - radius,
    boxY + boxH
  );
  ctx.lineTo(boxX + radius, boxY + boxH);
  ctx.quadraticCurveTo(
    boxX,
    boxY + boxH,
    boxX,
    boxY + boxH - radius
  );
  ctx.lineTo(boxX, boxY + radius);
  ctx.quadraticCurveTo(boxX, boxY, boxX + radius, boxY);
  ctx.closePath();

  ctx.stroke();

  ctx.restore();
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

      // -----------------------------------------
      // TEMPLATE
      // -----------------------------------------

      const template = await loadImage(templateUrl);

      ctx.drawImage(
        template,
        0,
        0,
        canvas.width,
        canvas.height
      );

      /*
       * Cover dynamic zones from the template.
       * Artwork remains untouched.
       */

      ctx.fillStyle = "rgba(8, 7, 6, 0.94)";

      ctx.fillRect(448, 305, 610, 405);

      ctx.fillRect(1240, 595, 215, 190);

      ctx.fillRect(35, 835, 900, 125);

      // -----------------------------------------
      // PROFILE PHOTO
      // -----------------------------------------

      const profileUrl = getProfileImageUrl(data);

      if (profileUrl) {
        try {
          const profileImage = await loadImage(profileUrl);

          await drawProfilePhoto(ctx, profileImage);
        } catch (photoError) {
          console.warn(
            "Profile image could not be loaded:",
            photoError
          );
        }
      }

      // -----------------------------------------
      // IDENTITY
      // -----------------------------------------

      drawLabelValue(
        ctx,
        "NAME",
        safeText(data.name).toUpperCase(),
        458,
        330,
        25
      );

      drawLabelValue(
        ctx,
        "COUNTRY",
        safeText(data.country, "RAAKA").toUpperCase(),
        458,
        405,
        25
      );

      drawLabelValue(
        ctx,
        "CITIZEN ID",
        safeText(data.passportCode).toUpperCase(),
        458,
        480,
        24
      );

      if (data.dateOfBirth) {
        drawLabelValue(
          ctx,
          "DATE OF BIRTH",
          formatDate(data.dateOfBirth),
          458,
          555,
          24
        );
      } else {
        drawLabelValue(
          ctx,
          "QUIZ SCORE",
          `${data.score ?? 0} / ${data.totalQuestions ?? 10}`,
          458,
          555,
          24
        );
      }

      drawLabelValue(
        ctx,
        "FAN LEVEL",
        `LEVEL ${data.level ?? 1} · ${levelName(
          data.level ?? 1
        )}`,
        458,
        630,
        18
      );

      // -----------------------------------------
      // SOCIAL HANDLE
      // -----------------------------------------

      ctx.font = "12px Georgia, serif";
      ctx.fillStyle = "#d9b778";

      ctx.fillText(
        data.twitterUsername
          ? "TWITTER (X) HANDLE"
          : data.instagramUsername
          ? "INSTAGRAM HANDLE"
          : "SOCIAL HANDLE",
        458,
        705
      );

      ctx.font = "600 20px Georgia, serif";
      ctx.fillStyle = "#f2dfbb";

      let socialHandle = "NOT PROVIDED";

      if (data.twitterUsername?.trim()) {
        socialHandle = `@${cleanUsername(
          data.twitterUsername
        )}`;
      } else if (data.instagramUsername?.trim()) {
        socialHandle = `@${cleanUsername(
          data.instagramUsername
        )}`;
      }

      ctx.fillText(socialHandle, 458, 733);

      // -----------------------------------------
      // ISSUE / VALIDITY
      // -----------------------------------------

      ctx.font = "11px Georgia, serif";
      ctx.fillStyle = "#d9b778";

      ctx.fillText("ISSUE DATE", 458, 770);
      ctx.fillText("VALID UNTIL", 650, 770);

      ctx.font = "600 18px Georgia, serif";
      ctx.fillStyle = "#f2dfbb";

      const issue = formatDate(data.quizDate);

      ctx.fillText(issue, 458, 795);

      const valid = new Date();

      valid.setFullYear(valid.getFullYear() + 10);

      ctx.fillText(
        formatDate(valid.toISOString()),
        650,
        795
      );

      // -----------------------------------------
      // QUIZ BADGE
      // -----------------------------------------

      ctx.strokeStyle = "rgba(217,183,120,.75)";
      ctx.lineWidth = 2;

      ctx.beginPath();

      ctx.arc(
        1015,
        720,
        65,
        0,
        Math.PI * 2
      );

      ctx.stroke();

      ctx.textAlign = "center";

      ctx.font = "11px Georgia, serif";
      ctx.fillStyle = "#d9b778";

      ctx.fillText("QUIZ", 1015, 700);

      ctx.font = "700 25px Georgia, serif";
      ctx.fillStyle = "#f2dfbb";

      ctx.fillText(
        `${data.score ?? 0}/${data.totalQuestions ?? 10}`,
        1015,
        730
      );

      ctx.font = "10px Georgia, serif";

      ctx.fillText(
        `+${data.xp ?? 0} XP`,
        1015,
        750
      );

      ctx.textAlign = "left";

      // -----------------------------------------
      // QR VERIFICATION
      // -----------------------------------------

      const verifyUrl =
        `${window.location.origin}/fan-passport?code=${encodeURIComponent(
          data.passportCode
        )}`;

      const qrDataUrl = await QRCode.toDataURL(
        verifyUrl,
        {
          width: 170,
          margin: 1,
          errorCorrectionLevel: "M",
          color: {
            dark: "#16110b",
            light: "#e8d4a9",
          },
        }
      );

      const qr = await loadImage(qrDataUrl);

      ctx.drawImage(
        qr,
        1260,
        610,
        155,
        155
      );

      ctx.font = "11px Georgia, serif";
      ctx.fillStyle = "#d9b778";

      ctx.textAlign = "center";

      ctx.fillText(
        data.passportCode.toUpperCase(),
        1337,
        785
      );

      ctx.textAlign = "left";

      // -----------------------------------------
      // FICTIONAL MRZ
      // -----------------------------------------

      ctx.font =
        "14px 'Courier New', monospace";

      ctx.fillStyle = "#d9b778";

      const mrzName = safeText(data.name)
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "<");

      const mrzCode = safeText(data.passportCode)
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");

      ctx.fillText(
        `P<WORLDOFRAAKA<<${mrzName}`
          .slice(0, 75)
          .padEnd(75, "<"),
        55,
        880
      );

      ctx.fillText(
        `${mrzCode}<<${formatDate(data.quizDate)
          .replace(/ /g, "")}<<<RAAKA`
          .slice(0, 75)
          .padEnd(75, "<"),
        55,
        915
      );

      // -----------------------------------------
      // DISCLAIMER
      // -----------------------------------------

      ctx.font = "10px Georgia, serif";
      ctx.fillStyle = "#b99862";

      ctx.fillText(
        "FICTIONAL DOCUMENT · WORLD OF RAAKA · FAN UNIVERSE",
        1040,
        945
      );

      // -----------------------------------------
      // DOWNLOAD
      // -----------------------------------------

      const link = document.createElement("a");

      link.download =
        `RAAKA-PASSPORT-${data.passportCode}.png`;

      link.href =
        canvas.toDataURL("image/png", 1);

      link.click();

    } catch (err) {
      console.error(
        "Passport generation failed:",
        err
      );

      setError(
        "Passport generate nahi ho paaya. Template ya profile image check karo."
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

      {/* Required attribution for Unavatar free usage */}
      <a
        href="https://unavatar.io"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block text-[9px] text-white/20 hover:text-white/40"
      >
        Avatars provided by Unavatar
      </a>

    </div>
  );
}