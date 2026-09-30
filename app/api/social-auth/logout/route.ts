import { NextResponse } from "next/server";
import { getD1 } from "@/lib/d1";
import {
  clearSessionCookie,
  getSessionToken,
  hashToken,
} from "@/lib/social-auth";

export async function POST(request: Request) {
  try {
    const token = getSessionToken(request);

    if (token) {
      const tokenHash = await hashToken(token);
      const db = getD1();

      await db
        .prepare(
          `DELETE FROM social_auth_sessions
           WHERE token_hash = ?`
        )
        .bind(tokenHash)
        .run();
    }

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: "Logged out successfully.",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": clearSessionCookie(),
        },
      }
    );
  } catch (error) {
    console.error("Social logout error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong while logging out.",
      },
      { status: 500 }
    );
  }
}