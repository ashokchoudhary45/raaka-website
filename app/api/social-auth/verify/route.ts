import { NextResponse } from "next/server";
import { getD1 } from "@/lib/d1";
import {
  createSession,
  hashToken,
  sessionCookie,
} from "@/lib/social-auth";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
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

    const tokenHash = await hashToken(token);
    const db = getD1();

    const verification = await db
      .prepare(
        `SELECT
           token_hash,
           user_id,
           expires_at,
           used_at
         FROM social_email_verifications
         WHERE token_hash = ?
         LIMIT 1`
      )
      .bind(tokenHash)
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
          error: "Invalid verification link.",
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

    if (
      new Date(verification.expires_at).getTime() <=
      Date.now()
    ) {
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

    await db.batch([
      db
        .prepare(
          `UPDATE social_auth_users
           SET verified_at = ?, updated_at = ?
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

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: "Email verified successfully.",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": sessionCookie(
            session.token,
            30 * 24 * 60 * 60
          ),
        },
      }
    );
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