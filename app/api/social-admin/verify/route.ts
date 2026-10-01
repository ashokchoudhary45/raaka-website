import { NextRequest, NextResponse } from "next/server";
import { getD1 } from "@/lib/d1";
import { getCurrentUser } from "@/lib/social-auth";

type VerificationType = "blue" | "gold" | "grey" | "none";

type Body = {
  userId?: string;
  verificationType?: VerificationType;
};

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentUser(request);

    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    if (!admin.verifiedAt) {
      return NextResponse.json(
        { success: false, error: "Email verification required" },
        { status: 403 }
      );
    }

    const adminEmail = process.env.SOCIAL_ADMIN_EMAIL?.trim().toLowerCase();

    if (!adminEmail || admin.email.toLowerCase() !== adminEmail) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = (await request.json()) as Body;

    const targetUserId = body.userId?.trim();
    const verificationType = body.verificationType;

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    const allowedTypes: VerificationType[] = [
      "blue",
      "gold",
      "grey",
      "none",
    ];

    if (!verificationType || !allowedTypes.includes(verificationType)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid verification type",
        },
        { status: 400 }
      );
    }

    if (targetUserId === admin.userId) {
      return NextResponse.json(
        {
          success: false,
          error: "You cannot change your own verification status here",
        },
        { status: 400 }
      );
    }

    const db = getD1();

    const profile = await db
      .prepare(
        `
        SELECT
          visitor_id,
          handle,
          display_name,
          verified,
          verification_type,
          verification_label
        FROM social_profiles
        WHERE visitor_id = ?
        LIMIT 1
        `
      )
      .bind(targetUserId)
      .first<{
        visitor_id: string;
        handle: string;
        display_name: string;
        verified: number;
        verification_type: string;
        verification_label: string | null;
      }>();

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          error: "User profile not found",
        },
        { status: 404 }
      );
    }

    if (verificationType === "none") {
      await db
        .prepare(
          `
          UPDATE social_profiles
          SET
            verified = 0,
            verification_type = 'none',
            verification_label = NULL,
            verified_at = NULL,
            verified_by = NULL,
            updated_at = CURRENT_TIMESTAMP
          WHERE visitor_id = ?
          `
        )
        .bind(targetUserId)
        .run();
    } else {
      await db
        .prepare(
          `
          UPDATE social_profiles
          SET
            verified = 1,
            verification_type = ?,
            verification_label = ?,
            verified_at = CURRENT_TIMESTAMP,
            verified_by = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE visitor_id = ?
          `
        )
        .bind(
          verificationType,
          verificationType === "blue"
            ? "Verified"
            : verificationType === "gold"
              ? "Official Organization"
              : "Official Account",
          admin.userId,
          targetUserId
        )
        .run();
    }

    return NextResponse.json({
      success: true,
      user: {
        userId: profile.visitor_id,
        handle: profile.handle,
        displayName: profile.display_name,
        verified: verificationType !== "none",
        verificationType,
        verificationLabel:
          verificationType === "none"
            ? null
            : verificationType === "blue"
              ? "Verified"
              : verificationType === "gold"
                ? "Official Organization"
                : "Official Account",
      },
    });
  } catch (error) {
    console.error("RAAKA Social admin verification error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}