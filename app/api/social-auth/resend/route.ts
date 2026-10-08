import { NextResponse } from "next/server";
import { getD1 } from "@/lib/d1";
import {
  createVerificationToken,
} from "@/lib/social-auth";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: unknown;
    };

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (!email) {
      return json(
        {
          success: false,
          error: "Email is required.",
        },
        400
      );
    }

    const db = getD1();

    const user = await db
      .prepare(
        `SELECT
           user_id,
           email,
           verified_at
         FROM social_auth_users
         WHERE email = ?
         LIMIT 1`
      )
      .bind(email)
      .first<{
        user_id: string;
        email: string;
        verified_at: string | null;
      }>();

    /*
      Don't reveal whether an email exists.
      This prevents account enumeration.
    */
    if (!user) {
      return json({
        success: true,
        message:
          "If an account exists for this email, a verification email has been sent.",
      });
    }

    if (user.verified_at) {
      return json({
        success: true,
        message: "This email is already verified.",
      });
    }

    // Create a fresh token without invalidating an older email.
    // This prevents a previously delivered verification email
    // from becoming invalid just because the user requested resend.
    const verification = await createVerificationToken(
      user.user_id
    );

    const verificationUrl = new URL(
      "https://worldofraaka.online/social/verify"
    );
    verificationUrl.searchParams.set(
      "token",
      verification.token
    );

    const resendApiKey = process.env.RESEND_API_KEY;

    const fromEmail =
      process.env.RESEND_FROM_EMAIL ||
      "RAAKA Social <noreply@worldofraaka.online>";

    if (!resendApiKey) {
      return json(
        {
          success: false,
          error: "Email service is not configured.",
        },
        500
      );
    }

    const emailResponse = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [user.email],
          subject: "Verify your RAAKA Social email",
          html: `
            <div style="font-family:Arial,sans-serif;background:#050505;color:#fff;padding:40px">
              <div style="max-width:600px;margin:auto;border:1px solid #222;border-radius:20px;padding:32px;background:#0b0b0b">

                <div style="font-size:12px;letter-spacing:4px;color:#888">
                  WORLD OF RAAKA
                </div>

                <h1 style="font-size:30px;margin:20px 0 10px">
                  Verify your email
                </h1>

                <p style="color:#aaa;line-height:1.7">
                  Click the button below to verify your RAAKA Social account.
                </p>

                <a
                  href="${verificationUrl.toString()}"
                  style="display:inline-block;margin:20px 0;padding:14px 24px;background:#fff;color:#000;text-decoration:none;border-radius:10px;font-weight:bold"
                >
                  Verify Email
                </a>

                <p style="font-size:12px;color:#666;line-height:1.6">
                  This verification link expires in 24 hours.
                </p>

              </div>
            </div>
          `,
        }),
      }
    );

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Resend error:", errorText);

      return json(
        {
          success: false,
          error: "Could not send verification email.",
        },
        502
      );
    }

    return json({
      success: true,
      message:
        "If an account exists for this email, a verification email has been sent.",
    });
  } catch (error) {
    console.error("Resend verification error:", error);

    return json(
      {
        success: false,
        error: "Something went wrong.",
      },
      500
    );
  }
}