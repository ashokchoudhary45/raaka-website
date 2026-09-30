import { NextResponse } from "next/server";
import { getD1 } from "@/lib/d1";
import {
  createSession,
  sessionCookie,
  verifyPassword,
} from "@/lib/social-auth";

type LoginBody = {
  email?: unknown;
  password?: unknown;
};

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody;

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!email || !password) {
      return json(
        {
          success: false,
          error: "Email and password are required.",
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
           password_hash,
           verified_at
         FROM social_auth_users
         WHERE email = ?
         LIMIT 1`
      )
      .bind(email)
      .first<{
        user_id: string;
        email: string;
        password_hash: string;
        verified_at: string | null;
      }>();

    if (!user) {
      return json(
        {
          success: false,
          error: "Invalid email or password.",
        },
        401
      );
    }

    const passwordValid = await verifyPassword(
      password,
      user.password_hash
    );

    if (!passwordValid) {
      return json(
        {
          success: false,
          error: "Invalid email or password.",
        },
        401
      );
    }

    if (!user.verified_at) {
      return json(
        {
          success: false,
          error: "Please verify your email before logging in.",
          needsVerification: true,
        },
        403
      );
    }

    const session = await createSession(user.user_id);

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: "Login successful.",
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
    console.error("Social login error:", error);

    return json(
      {
        success: false,
        error: "Something went wrong while logging in.",
      },
      500
    );
  }
}