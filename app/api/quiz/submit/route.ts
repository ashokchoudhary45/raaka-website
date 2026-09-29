import { getD1 } from "@/lib/d1";

export const dynamic = "force-dynamic";

type Answer = {
  questionId: number;
  answer: string;
};

type SubmitBody = {
  visitorId: string;
  fanName: string;
  twitterUsername?: string;
  instagramUsername?: string;
  country?: string;
  answers: Answer[];
};

function getIndiaDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function calculateLevel(xp: number) {
  if (xp >= 5000) return 10;
  if (xp >= 3500) return 9;
  if (xp >= 2500) return 8;
  if (xp >= 1800) return 7;
  if (xp >= 1300) return 6;
  if (xp >= 1000) return 5;
  if (xp >= 750) return 4;
  if (xp >= 500) return 3;
  if (xp >= 250) return 2;
  return 1;
}

function generatePassportCode() {
  return (
    "RAAKA-" +
    Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubmitBody;

    const {
      visitorId,
      fanName,
      twitterUsername = "",
      instagramUsername = "",
      country = "",
      answers,
    } = body;

    // ------------------------------------------
    // VALIDATION
    // ------------------------------------------

    if (!visitorId) {
      return Response.json(
        {
          success: false,
          error: "Fan ID is missing.",
        },
        { status: 400 }
      );
    }

    if (!fanName?.trim()) {
      return Response.json(
        {
          success: false,
          error: "Fan name is required.",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(answers)) {
      return Response.json(
        {
          success: false,
          error: "Invalid answers format.",
        },
        { status: 400 }
      );
    }

    const db = getD1();
    const quizDate = getIndiaDate();

    // ------------------------------------------
    // GET TODAY'S QUIZ
    // ------------------------------------------

    const dailyQuiz = await db
      .prepare(
        `
        SELECT question_ids
        FROM quiz_daily
        WHERE quiz_date = ?
        LIMIT 1
        `
      )
      .bind(quizDate)
      .first<{ question_ids: string }>();

    if (!dailyQuiz) {
      return Response.json(
        {
          success: false,
          error: "Today's quiz is not available.",
        },
        { status: 404 }
      );
    }

    let questionIds: number[];

    try {
      questionIds = JSON.parse(dailyQuiz.question_ids);
    } catch {
      return Response.json(
        {
          success: false,
          error: "Invalid daily quiz configuration.",
        },
        { status: 500 }
      );
    }

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return Response.json(
        {
          success: false,
          error: "Today's quiz has no questions.",
        },
        { status: 500 }
      );
    }

    // ------------------------------------------
    // PREVENT MULTIPLE ATTEMPTS
    // ------------------------------------------

    const existingAttempt = await db
      .prepare(
        `
        SELECT id
        FROM quiz_attempts
        WHERE visitor_id = ?
        AND quiz_date = ?
        LIMIT 1
        `
      )
      .bind(visitorId, quizDate)
      .first<{ id: number }>();

    if (existingAttempt) {
      return Response.json(
        {
          success: false,
          alreadyCompleted: true,
          error: "You have already completed today's quiz.",
        },
        { status: 409 }
      );
    }

    // ------------------------------------------
    // LOAD CORRECT ANSWERS
    // ------------------------------------------

    const placeholders = questionIds.map(() => "?").join(",");

    const questionResult = await db
      .prepare(
        `
        SELECT
          id,
          correct_answer
        FROM quiz_questions
        WHERE id IN (${placeholders})
        `
      )
      .bind(...questionIds)
      .all<{
        id: number;
        correct_answer: string;
      }>();

    const questionMap = new Map(
      questionResult.results.map((question) => [
        Number(question.id),
        question.correct_answer,
      ])
    );

    // ------------------------------------------
    // CHECK ANSWERS
    // ------------------------------------------

    let correctAnswers = 0;

    for (const submitted of answers) {
      const questionId = Number(submitted.questionId);

      const correctAnswer = questionMap.get(questionId);

      if (!correctAnswer) {
        continue;
      }

      const userAnswer = String(submitted.answer)
        .trim()
        .toUpperCase();

      const expectedAnswer = String(correctAnswer)
        .trim()
        .toUpperCase();

      if (userAnswer === expectedAnswer) {
        correctAnswers++;
      }
    }

    const totalQuestions = questionIds.length;

    // 10 XP / 10 points for every correct answer
    const score = correctAnswers * 10;
    const xpEarned = score;

    // ------------------------------------------
    // FIND FAN PASSPORT
    // ------------------------------------------

    let passport = await db
      .prepare(
        `
        SELECT
          id,
          visitor_id,
          passport_code,
          fan_name,
          twitter_username,
          country,
          xp,
          level,
          quiz_score,
          quizzes_played
        FROM fan_passports
        WHERE visitor_id = ?
        LIMIT 1
        `
      )
      .bind(visitorId)
      .first<{
        id: number;
        visitor_id: string;
        passport_code: string;
        fan_name: string;
        twitter_username: string | null;
        country: string | null;
        xp: number;
        level: number;
        quiz_score: number;
        quizzes_played: number;
      }>();

    // ------------------------------------------
    // CREATE / UPDATE PASSPORT
    // ------------------------------------------

    let newXP: number;
    let newQuizScore: number;
    let newQuizzesPlayed: number;
    let newLevel: number;
    let passportCode: string;

    if (!passport) {
      passportCode = generatePassportCode();

      newXP = xpEarned;
      newQuizScore = score;
      newQuizzesPlayed = 1;
      newLevel = calculateLevel(newXP);

      await db
        .prepare(
          `
          INSERT INTO fan_passports (
            visitor_id,
            passport_code,
            fan_name,
            twitter_username,
            country,
            xp,
            level,
            quiz_score,
            quizzes_played
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `
        )
        .bind(
          visitorId,
          passportCode,
          fanName.trim(),
          twitterUsername.trim(),
          country.trim(),
          newXP,
          newLevel,
          newQuizScore,
          newQuizzesPlayed
        )
        .run();
    } else {
      passportCode = passport.passport_code;

      newXP = Number(passport.xp || 0) + xpEarned;
      newQuizScore = Number(passport.quiz_score || 0) + score;
      newQuizzesPlayed =
        Number(passport.quizzes_played || 0) + 1;

      newLevel = calculateLevel(newXP);

      await db
        .prepare(
          `
          UPDATE fan_passports
          SET
            fan_name = ?,
            twitter_username = ?,
            country = ?,
            xp = ?,
            level = ?,
            quiz_score = ?,
            quizzes_played = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE visitor_id = ?
          `
        )
        .bind(
          fanName.trim(),
          twitterUsername.trim(),
          country.trim(),
          newXP,
          newLevel,
          newQuizScore,
          newQuizzesPlayed,
          visitorId
        )
        .run();
    }

    // ------------------------------------------
    // SAVE QUIZ ATTEMPT
    // ------------------------------------------

    await db
      .prepare(
        `
        INSERT INTO quiz_attempts (
          visitor_id,
          quiz_date,
          score,
          correct_answers,
          total_questions,
          xp_earned,
          time_taken
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `
      )
      .bind(
        visitorId,
        quizDate,
        score,
        correctAnswers,
        totalQuestions,
        xpEarned,
        0
      )
      .run();

    // ------------------------------------------
    // ACHIEVEMENT: FIRST QUIZ
    // ------------------------------------------

    if (newQuizzesPlayed === 1) {
      await db
        .prepare(
          `
          INSERT OR IGNORE INTO fan_passport_achievements (
            visitor_id,
            achievement_key
          )
          VALUES (?, ?)
          `
        )
        .bind(visitorId, "first-quiz")
        .run();
    }

    // ------------------------------------------
    // ACHIEVEMENT: PERFECT SCORE
    // ------------------------------------------

    if (correctAnswers === totalQuestions) {
      await db
        .prepare(
          `
          INSERT OR IGNORE INTO fan_passport_achievements (
            visitor_id,
            achievement_key
          )
          VALUES (?, ?)
          `
        )
        .bind(visitorId, "perfect-score")
        .run();
    }

    // ------------------------------------------
    // FINAL RESPONSE
    // ------------------------------------------

    return Response.json({
      success: true,

      result: {
        correctAnswers,
        totalQuestions,
        score,
        xpEarned,
      },

      passport: {
        visitorId,
        passportCode,
        fanName: fanName.trim(),
        twitterUsername: twitterUsername.trim(),
        instagramUsername: instagramUsername.trim(),
        country: country.trim(),
        xp: newXP,
        level: newLevel,
        quizScore: newQuizScore,
        quizzesPlayed: newQuizzesPlayed,
      },
    });
  } catch (error) {
    console.error("Quiz submit error:", error);

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to submit quiz.",
      },
      { status: 500 }
    );
  }
}