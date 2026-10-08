import { NextResponse } from "next/server";
import { getD1 } from "@/lib/d1";
import {
  createVerificationToken,
  hashPassword,
} from "@/lib/social-auth";

type SignupBody = {
  email?: unknown;
  password?: unknown;
  handle?: unknown;
  displayName?: unknown;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignupBody;

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    const handle =
      typeof body.handle === "string"
        ? body.handle.trim().replace(/^@/, "").toLowerCase()
        : "";

    const displayName =
      typeof body.displayName === "string"
        ? body.displayName.trim()
        : "";

    // ------------------------------------------
    // VALIDATION
    // ------------------------------------------

    if (!email || !EMAIL_REGEX.test(email)) {
      return json(
        {
          success: false,
          error: "Enter a valid email address.",
        },
        400
      );
    }

    if (password.length < 8) {
      return json(
        {
          success: false,
          error: "Password must be at least 8 characters.",
        },
        400
      );
    }

    if (!/^[a-z0-9_]{3,20}$/.test(handle)) {
      return json(
        {
          success: false,
          error:
            "Username must be 3–20 characters and use only letters, numbers or underscore.",
        },
        400
      );
    }

    if (displayName.length < 2 || displayName.length > 50) {
      return json(
        {
          success: false,
          error: "Display name must be 2–50 characters.",
        },
        400
      );
    }

    const db = getD1();

    // ------------------------------------------
    // CHECK EXISTING EMAIL
    // ------------------------------------------

    const existingEmail = await db
      .prepare(
        `SELECT user_id
         FROM social_auth_users
         WHERE email = ?
         LIMIT 1`
      )
      .bind(email)
      .first<{ user_id: string }>();

    if (existingEmail) {
      return json(
        {
          success: false,
          error: "An account with this email already exists.",
        },
        409
      );
    }

    // ------------------------------------------
    // CHECK EXISTING HANDLE
    // ------------------------------------------

    const existingHandle = await db
      .prepare(
        `SELECT visitor_id
         FROM social_profiles
         WHERE handle = ?
         LIMIT 1`
      )
      .bind(handle)
      .first<{ visitor_id: string }>();

    if (existingHandle) {
      return json(
        {
          success: false,
          error: "That username is already taken.",
        },
        409
      );
    }

    // ------------------------------------------
    // CREATE USER
    // ------------------------------------------

    const userId = crypto.randomUUID();

    const passwordHash = await hashPassword(password);

    await db.batch([
      db
        .prepare(
          `INSERT INTO social_auth_users
           (user_id, email, password_hash)
           VALUES (?, ?, ?)`
        )
        .bind(userId, email, passwordHash),

      db
        .prepare(
          `INSERT INTO social_profiles
           (visitor_id, handle, display_name)
           VALUES (?, ?, ?)`
        )
        .bind(userId, handle, displayName),
    ]);

    // ------------------------------------------
    // CREATE VERIFICATION TOKEN
    // ------------------------------------------

    const verification = await createVerificationToken(userId);

    // Always send users to the real production verification page.
    // URL.searchParams handles token encoding safely.
    const verificationUrl = new URL(
      "https://worldofraaka.online/social/verify"
    );
    verificationUrl.searchParams.set(
      "token",
      verification.token
    );

    // ------------------------------------------
    // EMAIL CONFIG
    // ------------------------------------------

    const resendApiKey = process.env.RESEND_API_KEY;

    const fromEmail =
      process.env.RESEND_FROM_EMAIL ||
      "RAAKA Social <noreply@worldofraaka.online>";

    if (!resendApiKey) {
      console.error(
        "RAAKA Social signup: RESEND_API_KEY is missing."
      );

      return json(
        {
          success: false,
          error:
            "Your account was created, but the email service is temporarily unavailable. Please use Resend verification later.",
        },
        500
      );
    }

    // ------------------------------------------
    // SEND VERIFICATION EMAIL
    // ------------------------------------------

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
          to: [email],
          subject: "Verify your RAAKA Social account",
          html: `
            <div
              style="
                margin:0;
                padding:40px 20px;
                background:#050505;
                color:#ffffff;
                font-family:Arial,Helvetica,sans-serif;
              "
            >
              <div
                style="
                  max-width:600px;
                  margin:0 auto;
                  border:1px solid #222;
                  border-radius:20px;
                  padding:32px;
                  background:#0b0b0b;
                "
              >

                <div
                  style="
                    font-size:12px;
                    letter-spacing:4px;
                    color:#888;
                    font-weight:bold;
                  "
                >
                  WORLD OF RAAKA
                </div>

                <h1
                  style="
                    font-size:32px;
                    line-height:1.2;
                    margin:20px 0 10px;
                    color:#ffffff;
                  "
                >
                  Welcome to RAAKA Social
                </h1>

                <p
                  style="
                    color:#aaaaaa;
                    line-height:1.7;
                    font-size:15px;
                  "
                >
                  Hi ${escapeHtml(displayName)},<br><br>

                  Your RAAKA Social account has been created.
                  Verify your email address to activate your account
                  and join the RAAKA community.
                </p>

                <a
                  href="${verificationUrl.toString()}"
                  style="
                    display:inline-block;
                    margin:20px 0;
                    padding:14px 24px;
                    background:#ffffff;
                    color:#000000;
                    text-decoration:none;
                    border-radius:10px;
                    font-weight:bold;
                    font-size:14px;
                  "
                >
                  Verify Email
                </a>

                <p
                  style="
                    font-size:12px;
                    color:#666666;
                    line-height:1.6;
                  "
                >
                  This verification link expires in 24 hours.
                </p>

                <p
                  style="
                    margin-top:24px;
                    padding-top:20px;
                    border-top:1px solid #222;
                    font-size:11px;
                    color:#555;
                    line-height:1.6;
                  "
                >
                  If you did not create this account, you can safely
                  ignore this email.
                </p>

              </div>
            </div>
          `,
        }),
      }
    );

    // ------------------------------------------
    // RESEND ERROR
    // ------------------------------------------

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();

      console.error(
        "RAAKA Social Resend error:",
        errorText
      );

      return json(
        {
          success: false,
          error:
            "Account created, but the verification email could not be sent. Please use Resend verification.",
        },
        502
      );
    }

    // ------------------------------------------
    // SUCCESS
    // ------------------------------------------

    return json({
      success: true,
      message:
        "Account created. Check your email to verify your account.",
    });
  } catch (error) {
    console.error(
      "RAAKA Social signup error:",
      error
    );

    return json(
      {
        success: false,
        error:
          "Something went wrong while creating your account.",
      },
      500
    );
  }
}