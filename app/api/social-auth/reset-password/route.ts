import { NextResponse } from "next/server";
import { getD1 } from "@/lib/d1";
import { hashPassword, hashToken } from "@/lib/social-auth";

export const dynamic = "force-dynamic";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token?: unknown; password?: unknown };
    const token = typeof body.token === "string" ? body.token.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!token || token.length > 200) {
      return json({ success: false, error: "This reset link is invalid or expired. Request a new one." }, 400);
    }
    if (password.length < 8 || password.length > 128) {
      return json({ success: false, error: "Password must be between 8 and 128 characters." }, 400);
    }

    const db = getD1();
    const tokenHash = await hashToken(token);
    const reset = await db
      .prepare(
        `SELECT token_hash, user_id
         FROM social_password_resets
         WHERE token_hash = ? AND julianday(expires_at) > julianday('now')
         LIMIT 1`,
      )
      .bind(tokenHash)
      .first<{ token_hash: string; user_id: string }>();

    if (!reset) {
      return json({ success: false, error: "This reset link is invalid or expired. Request a new one." }, 400);
    }

    const passwordHash = await hashPassword(password);

    // Consume the reset token, change the password, and revoke existing sessions.
    await db.batch([
      db.prepare("UPDATE social_auth_users SET password_hash = ? WHERE user_id = ?")
        .bind(passwordHash, reset.user_id),
      db.prepare("DELETE FROM social_password_resets WHERE user_id = ?")
        .bind(reset.user_id),
      db.prepare("DELETE FROM social_auth_sessions WHERE user_id = ?")
        .bind(reset.user_id),
    ]);

    return json({ success: true, message: "Password reset successfully. Please log in with your new password." });
  } catch (error) {
    console.error("RAAKA reset-password error:", error);
    return json({ success: false, error: "Could not reset the password. Please try again." }, 500);
  }
}
