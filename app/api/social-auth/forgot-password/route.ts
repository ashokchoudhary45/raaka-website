import { NextResponse } from "next/server";
import { getD1 } from "@/lib/d1";
import { hashToken } from "@/lib/social-auth";

export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createResetToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: unknown };
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !EMAIL_REGEX.test(email) || email.length > 254) {
      return json({ success: false, error: "Enter a valid email address." }, 400);
    }

    const db = getD1();
    const user = await db
      .prepare("SELECT user_id, email FROM social_auth_users WHERE email = ? LIMIT 1")
      .bind(email)
      .first<{ user_id: string; email: string }>();

    // Do not disclose whether an account exists.
    const genericMessage = "If an account exists for that email, a password reset link will be sent shortly.";
    if (!user) return json({ success: true, message: genericMessage });

    const resetToken = createResetToken();
    const tokenHash = await hashToken(resetToken);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    // Requires migration 0008_social_password_resets.sql.
    await db.batch([
      db.prepare("DELETE FROM social_password_resets WHERE user_id = ?").bind(user.user_id),
      db.prepare(
        `INSERT INTO social_password_resets (token_hash, user_id, expires_at, created_at)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
      ).bind(tokenHash, user.user_id, expiresAt),
    ]);

    const resetUrl = new URL("https://worldofraaka.online/social/reset-password");
    resetUrl.searchParams.set("token", resetToken);

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("RAAKA password reset: RESEND_API_KEY is missing.");
      return json({ success: false, error: "Password reset email service is temporarily unavailable." }, 503);
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || "RAAKA Social <noreply@worldofraaka.online>";
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [user.email],
        subject: "Reset your RAAKA Social password",
        html: `
          <div style="margin:0;padding:36px 16px;background:#f5f5f5;color:#171717;font-family:Arial,Helvetica,sans-serif">
            <div style="max-width:560px;margin:0 auto;padding:32px;border-radius:18px;background:#fff;border:1px solid #e5e5e5">
              <div style="font-size:12px;letter-spacing:3px;font-weight:bold;color:#d94841">WORLD OF RAAKA</div>
              <h1 style="font-size:28px;line-height:1.25;margin:22px 0 12px">Reset your password</h1>
              <p style="font-size:15px;line-height:1.7;color:#444">We received a request to reset your RAAKA Social password. Use the button below to choose a new password. This link expires in 30 minutes.</p>
              <a href="${escapeHtml(resetUrl.toString())}" style="display:inline-block;margin:16px 0;padding:13px 22px;background:#e94b43;color:#fff;text-decoration:none;border-radius:9px;font-weight:bold">Reset password</a>
              <p style="font-size:13px;line-height:1.6;color:#666">If you did not request this, you can ignore this email. Your current password will remain unchanged.</p>
            </div>
          </div>`,
      }),
    });

    if (!emailResponse.ok) {
      const details = await emailResponse.text();
      console.error("RAAKA password reset email failed:", details);
      return json({ success: false, error: "Could not send the reset email. Please try again later." }, 502);
    }

    return json({ success: true, message: genericMessage });
  } catch (error) {
    console.error("RAAKA forgot-password error:", error);
    return json({ success: false, error: "Could not process the password reset request." }, 500);
  }
}
