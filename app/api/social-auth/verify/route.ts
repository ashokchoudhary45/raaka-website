import { NextResponse } from "next/server";
import { getD1 } from "@/lib/d1";
import {
  createSession,
  hashToken,
  sessionCookie,
} from "@/lib/social-auth";

export const dynamic = "force-dynamic";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

/*
 * Keep a local SHA-256 fallback for compatibility with older
 * verification rows that may have been stored using a different
 * digest encoding than the current hashToken() helper.
 */
async function sha256Hex(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256Base64Url(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);

  let binary = "";
  for (const byte of new Uint8Array(digest)) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token")?.trim();

    if (!token) {
      return json(
        {
          success: false,
          error: "Verification token is missing.",
        },
        400
      );
    }

    /*
     * Normal format used by the current auth helper.
     * The two additional formats make verification compatible
     * with tokens created by an older version of the auth code.
     */
    const [currentHash, hexHash, base64UrlHash] = await Promise.all([
      hashToken(token),
      sha256Hex(token),
      sha256Base64Url(token),
    ]);

    const candidateHashes = Array.from(
      new Set([currentHash, hexHash, base64UrlHash].filter(Boolean))
    );

    const db = getD1();

    const placeholders = candidateHashes.map(() => "?").join(", ");

    const verification = await db
      .prepare(
        `SELECT
           token_hash,
           user_id,
           expires_at,
           used_at
         FROM social_email_verifications
         WHERE token_hash IN (${placeholders})
         ORDER BY
           CASE
             WHEN token_hash = ? THEN 0
             ELSE 1
           END
         LIMIT 1`
      )
      .bind(...candidateHashes, currentHash)
      .first<{
        token_hash: string;
        user_id: string;
        expires_at: string;
        used_at: string | null;
      }>();

    if (!verification) {
      return json(
        {
          success: false,
          error:
            "This verification link is invalid or no longer available. Please request a new verification email.",
        },
        400
      );
    }

    if (verification.used_at) {
      return json(
        {
          success: false,
          error: "This verification link has already been used.",
        },
        400
      );
    }

    const expiresAt = new Date(verification.expires_at).getTime();

    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      return json(
        {
          success: false,
          error:
            "This verification link has expired. Please request a new one.",
        },
        400
      );
    }

    const user = await db
      .prepare(
        `SELECT
           user_id,
           email,
           verified_at
         FROM social_auth_users
         WHERE user_id = ?
         LIMIT 1`
      )
      .bind(verification.user_id)
      .first<{
        user_id: string;
        email: string;
        verified_at: string | null;
      }>();

    if (!user) {
      return json(
        {
          success: false,
          error: "Account not found.",
        },
        404
      );
    }

    const now = new Date().toISOString();

    /*
     * Mark the token used and the account verified together.
     * If the account was already verified, we still create a
     * fresh session so a valid verification link remains useful.
     */
    await db.batch([
      db
        .prepare(
          `UPDATE social_auth_users
           SET verified_at = COALESCE(verified_at, ?),
               updated_at = ?
           WHERE user_id = ?`
        )
        .bind(now, now, user.user_id),

      db
        .prepare(
          `UPDATE social_email_verifications
           SET used_at = ?
           WHERE token_hash = ?`
        )
        .bind(now, verification.token_hash),
    ]);

    const session = await createSession(user.user_id);

    const response = json({
      success: true,
      message: "Email verified successfully.",
    });

    response.headers.set(
      "Set-Cookie",
      sessionCookie(session.token, 30 * 24 * 60 * 60)
    );

    return response;
  } catch (error) {
    console.error("Social email verification error:", error);

    return json(
      {
        success: false,
        error: "Something went wrong while verifying your email.",
      },
      500
    );
  }
}
