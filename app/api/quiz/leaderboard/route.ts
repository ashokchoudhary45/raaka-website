import { getD1 } from "@/lib/d1";

export const dynamic = "force-dynamic";

type FanRow = {
  visitor_id: string;
  fan_name: string;
  twitter_username: string | null;
  instagram_username: string | null;
  country: string | null;
  quiz_score: number;
  quizzes_played: number;
  xp: number;
  level: number;
  time_taken: number;
  updated_at: string | null;
};

function normalizeSocial(value: string | null | undefined) {
  return (value || "")
    .trim()
    .replace(/^@/, "")
    .toLowerCase();
}

function isBetterFan(candidate: FanRow, current: FanRow) {
  if (Number(candidate.quiz_score || 0) !== Number(current.quiz_score || 0)) {
    return Number(candidate.quiz_score || 0) > Number(current.quiz_score || 0);
  }

  if (Number(candidate.time_taken || 0) !== Number(current.time_taken || 0)) {
    return Number(candidate.time_taken || 0) < Number(current.time_taken || 0);
  }

  if (Number(candidate.xp || 0) !== Number(current.xp || 0)) {
    return Number(candidate.xp || 0) > Number(current.xp || 0);
  }

  if (
    Number(candidate.quizzes_played || 0) !==
    Number(current.quizzes_played || 0)
  ) {
    return (
      Number(candidate.quizzes_played || 0) >
      Number(current.quizzes_played || 0)
    );
  }

  return String(candidate.updated_at || "") > String(current.updated_at || "");
}

export async function GET() {
  try {
    const db = getD1();

    const schema = await db
      .prepare(`PRAGMA table_info(fan_passports)`)
      .all<{ name: string }>();

    const hasInstagramColumn = schema.results.some(
      (column) => column.name === "instagram_username"
    );

    const instagramSelect = hasInstagramColumn
      ? "instagram_username"
      : "NULL AS instagram_username";

    const result = await db
      .prepare(
        `SELECT
          visitor_id,
          fan_name,
          twitter_username,
          ${instagramSelect},
          country,
          quiz_score,
          quizzes_played,
          xp,
          level,
          updated_at,
          COALESCE(
            (
              SELECT qa.time_taken
              FROM quiz_attempts qa
              WHERE qa.visitor_id = fan_passports.visitor_id
              ORDER BY qa.quiz_date DESC, qa.id DESC
              LIMIT 1
            ),
            0
          ) AS time_taken
         FROM fan_passports
         WHERE quizzes_played > 0
         ORDER BY quiz_score DESC, xp DESC, quizzes_played DESC, updated_at DESC
         LIMIT 500`
      )
      .all<FanRow>();

    const uniqueFans = new Map<string, FanRow>();

    for (const fan of result.results) {
      const twitter = normalizeSocial(fan.twitter_username);
      const instagram = normalizeSocial(fan.instagram_username);

      const keys: string[] = [];

      if (twitter) keys.push(`twitter:${twitter}`);
      if (instagram) keys.push(`instagram:${instagram}`);

      if (keys.length === 0) {
        keys.push(`visitor:${fan.visitor_id}`);
      }

      const existingMatches = keys
        .map((key) => uniqueFans.get(key))
        .filter((value): value is FanRow => Boolean(value));

      const current = existingMatches[0];

      if (!current) {
        for (const key of keys) {
          uniqueFans.set(key, fan);
        }
        continue;
      }

      const better = isBetterFan(fan, current);

      if (better) {
        for (const key of keys) {
          uniqueFans.set(key, fan);
        }
      } else {
        for (const key of keys) {
          uniqueFans.set(key, current);
        }
      }
    }

    const finalFans = Array.from(
      new Map(
        Array.from(uniqueFans.values()).map((fan) => [fan.visitor_id, fan])
      ).values()
    )
      .sort((a, b) => {
        const scoreDiff =
          Number(b.quiz_score || 0) - Number(a.quiz_score || 0);

        if (scoreDiff !== 0) return scoreDiff;

        const timeA = Number(a.time_taken || 0);
        const timeB = Number(b.time_taken || 0);

        // Legacy entries have time_taken = 0. Keep them after timed entries.
        const normalizedTimeA = timeA > 0 ? timeA : Number.POSITIVE_INFINITY;
        const normalizedTimeB = timeB > 0 ? timeB : Number.POSITIVE_INFINITY;

        if (normalizedTimeA !== normalizedTimeB) {
          return normalizedTimeA - normalizedTimeB;
        }

        const xpDiff = Number(b.xp || 0) - Number(a.xp || 0);

        if (xpDiff !== 0) return xpDiff;

        const quizDiff =
          Number(b.quizzes_played || 0) -
          Number(a.quizzes_played || 0);

        if (quizDiff !== 0) return quizDiff;

        return String(b.updated_at || "").localeCompare(
          String(a.updated_at || "")
        );
      })
      .slice(0, 100);

    const leaderboard = finalFans.map((fan, index) => {
      const twitter = normalizeSocial(fan.twitter_username);
      const instagram = normalizeSocial(fan.instagram_username);

      let profileImage: string | null = null;

      if (twitter) {
        profileImage = `https://unavatar.io/x/${encodeURIComponent(twitter)}`;
      } else if (instagram) {
        profileImage = `https://unavatar.io/instagram/${encodeURIComponent(
          instagram
        )}`;
      }

      return {
        rank: index + 1,
        name: fan.fan_name,
        twitterUsername: fan.twitter_username,
        instagramUsername: fan.instagram_username,
        country: fan.country,
        score: fan.quiz_score,
        quizzesPlayed: fan.quizzes_played,
        xp: fan.xp,
        level: fan.level,
        timeTaken: Number(fan.time_taken || 0),
        profileImage,
      };
    });

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
