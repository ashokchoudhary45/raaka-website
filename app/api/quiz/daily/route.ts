import { getD1 } from "@/lib/d1";

export const dynamic = "force-dynamic";

function getIndiaDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function GET() {
  try {
    const db = getD1();
    const today = getIndiaDate();

    const existing = await db
      .prepare(
        `SELECT question_ids
         FROM quiz_daily
         WHERE quiz_date = ?`
      )
      .bind(today)
      .first<{ question_ids: string }>();

    let questionIds: number[];

    if (existing) {
      questionIds = JSON.parse(existing.question_ids);
    } else {
      const day1 = "2026-09-29";
      const day2 = "2026-09-30";
      const day3 = "2026-10-01";

      if (today === day1) {
        questionIds = Array.from({ length: 10 }, (_, i) => i + 1);
      } else if (today === day2) {
        questionIds = Array.from({ length: 10 }, (_, i) => i + 11);
      } else if (today === day3) {
        questionIds = Array.from({ length: 10 }, (_, i) => i + 21);
      } else {
        const result = await db
          .prepare(
            `SELECT id
             FROM quiz_questions
             WHERE active = 1
             ORDER BY RANDOM()
             LIMIT 10`
          )
          .all<{ id: number }>();

        questionIds = result.results.map((row) => row.id);
      }

      await db
        .prepare(
          `INSERT INTO quiz_daily
           (quiz_date, question_ids)
           VALUES (?, ?)`
        )
        .bind(today, JSON.stringify(questionIds))
        .run();
    }

    const placeholders = questionIds.map(() => "?").join(",");

    const questions = await db
      .prepare(
        `SELECT
          id,
          question,
          option_a,
          option_b,
          option_c,
          option_d
         FROM quiz_questions
         WHERE id IN (${placeholders})
         ORDER BY id`
      )
      .bind(...questionIds)
      .all();

    return Response.json({
      success: true,
      date: today,
      totalQuestions: questions.results.length,
      questions: questions.results,
    });
  } catch (error) {
    console.error("Daily quiz error:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to load daily quiz.",
      },
      { status: 500 }
    );
  }
}