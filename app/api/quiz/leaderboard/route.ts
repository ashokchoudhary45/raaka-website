import { getD1 } from "@/lib/d1";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getD1();

    const result = await db
      .prepare(
        `SELECT
          fan_name,
          twitter_username,
          country,
          quiz_score,
          quizzes_played,
          xp,
          level
         FROM fan_passports
         WHERE quizzes_played > 0
         ORDER BY quiz_score DESC, xp DESC, updated_at ASC
         LIMIT 100`
      )
      .all<{
        fan_name: string;
        twitter_username: string | null;
        country: string | null;
        quiz_score: number;
        quizzes_played: number;
        xp: number;
        level: number;
      }>();

    const leaderboard = result.results.map((fan, index) => ({
      rank: index + 1,
      name: fan.fan_name,
      twitterUsername: fan.twitter_username,
      country: fan.country,
      score: fan.quiz_score,
      quizzesPlayed: fan.quizzes_played,
      xp: fan.xp,
      level: fan.level,
      profileImage: fan.twitter_username
        ? `https://unavatar.io/x/${encodeURIComponent(
            fan.twitter_username.replace(/^@/, "")
          )}`
        : null,
    }));

    return Response.json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    console.error("Leaderboard error:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to load leaderboard.",
      },
      { status: 500 }
    );
  }
}