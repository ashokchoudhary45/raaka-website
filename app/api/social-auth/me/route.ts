import { NextResponse } from "next/server";
import { getD1 } from "@/lib/d1";
import { getCurrentUser } from "@/lib/social-auth";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
        },
        { status: 401 }
      );
    }

    if (!user.verifiedAt) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          verified: false,
          error: "Email verification required.",
        },
        { status: 403 }
      );
    }

    const db = getD1();

    const profile = await db
      .prepare(
        `SELECT
           visitor_id,
           handle,
           display_name,
           bio,
           followers_count,
           following_count,
           posts_count,
           created_at
         FROM social_profiles
         WHERE visitor_id = ?
         LIMIT 1`
      )
      .bind(user.userId)
      .first<{
        visitor_id: string;
        handle: string;
        display_name: string;
        bio: string;
        followers_count: number;
        following_count: number;
        posts_count: number;
        created_at: string;
      }>();

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          error: "Social profile not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      verified: true,
      user: {
        userId: user.userId,
        email: user.email,
      },
      profile: {
        visitorId: profile.visitor_id,
        handle: profile.handle,
        displayName: profile.display_name,
        bio: profile.bio,
        followers: profile.followers_count,
        following: profile.following_count,
        posts: profile.posts_count,
        createdAt: profile.created_at,
      },
    });
  } catch (error) {
    console.error("Social auth me error:", error);

    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        error: "Unable to load account.",
      },
      { status: 500 }
    );
  }
}