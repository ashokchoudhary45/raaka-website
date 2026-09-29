"use client";

import RaakaPassportGenerator from "@/components/RaakaPassportGenerator";

import { useEffect, useMemo, useRef, useState } from "react";

type Question = {
  id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
};

type Answer = {
  questionId: number;
  answer: string;
};

type QuizResult = {
  correctAnswers: number;
  totalQuestions: number;
  score: number;
  xpEarned: number;
  timeTaken: number;
};

type Passport = {
  passportCode: string;
  fanName: string;
  xp: number;
  level: number;
  quizScore: number;
  quizzesPlayed: number;
};

type LeaderboardUser = {
  rank: number;
  name: string;
  twitterUsername: string | null;
  country: string | null;
  score: number;
  quizzesPlayed: number;
  xp: number;
  level: number;
  timeTaken: number;
  profileImage: string | null;
};

type Screen =
  | "loading"
  | "intro"
  | "quiz"
  | "submitting"
  | "result";

export default function DailyQuizPage() {
  const QUESTION_TIME_LIMIT = 15;

  const [screen, setScreen] = useState<Screen>("loading");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizDate, setQuizDate] = useState("");

  const [name, setName] = useState("");
  const [twitterUsername, setTwitterUsername] = useState("");
  const [instagramUsername, setInstagramUsername] = useState("");
  const [country, setCountry] = useState("");

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);

  const quizStartedAtRef = useRef<number | null>(null);
  const handlingTimeUpRef = useRef(false);

  const [visitorId, setVisitorId] = useState("");

  const [result, setResult] = useState<QuizResult | null>(null);
  const [passport, setPassport] = useState<Passport | null>(null);

  const [leaderboard, setLeaderboard] = useState<
    LeaderboardUser[]
  >([]);

  const [error, setError] = useState("");

  /*
   * ------------------------------------------
   * VISITOR ID
   * ------------------------------------------
   */

  useEffect(() => {
    let id = localStorage.getItem("raaka_visitor_id");

    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("raaka_visitor_id", id);
    }

    setVisitorId(id);
  }, []);

  /*
   * ------------------------------------------
   * INITIAL LOAD
   * ------------------------------------------
   */

  useEffect(() => {
    async function initialize() {
      await Promise.all([
        loadDailyQuiz(),
        loadLeaderboard(),
      ]);

      setScreen("intro");
    }

    initialize();
  }, []);

  /*
   * ------------------------------------------
   * LOAD DAILY QUIZ
   * ------------------------------------------
   */

  async function loadDailyQuiz() {
    try {
      setError("");

      const response = await fetch(
        "/api/quiz/daily",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data: any = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to load today's quiz."
        );
      }

      if (
        !Array.isArray(data.questions) ||
        data.questions.length === 0
      ) {
        throw new Error(
          "Today's quiz questions are not available."
        );
      }

      setQuestions(data.questions);
      setQuizDate(data.date);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load today's quiz."
      );
    }
  }

  /*
   * ------------------------------------------
   * LOAD LEADERBOARD
   * ------------------------------------------
   */

  async function loadLeaderboard() {
    try {
      const response = await fetch(
        "/api/quiz/leaderboard",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data: any = await response.json();

      if (data.success) {
        setLeaderboard(
          Array.isArray(data.leaderboard)
            ? data.leaderboard
            : []
        );
      }
    } catch (err) {
      console.error(
        "Leaderboard loading failed:",
        err
      );
    }
  }

  /*
   * ------------------------------------------
   * START QUIZ
   * ------------------------------------------
   */

  function startQuiz(event: React.FormEvent) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!country.trim()) {
      setError("Please enter your country.");
      return;
    }

    if (!twitterUsername.trim() && !instagramUsername.trim()) {
      setError("Please enter either your Twitter/X or Instagram username.");
      return;
    }

    if (questions.length !== 10) {
      setError(
        "Today's quiz is not ready yet. Please refresh the page."
      );
      return;
    }

    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedAnswer("");
    setTimeLeft(QUESTION_TIME_LIMIT);

    quizStartedAtRef.current = Date.now();
    handlingTimeUpRef.current = false;

    setScreen("quiz");
  }

  /*
   * ------------------------------------------
   * QUESTION TIMER
   * ------------------------------------------
   */

  useEffect(() => {
    if (screen !== "quiz" || !question) {
      return;
    }

    handlingTimeUpRef.current = false;
    setTimeLeft(QUESTION_TIME_LIMIT);

    const deadline = Date.now() + QUESTION_TIME_LIMIT * 1000;

    const timer = window.setInterval(() => {
      const remaining = Math.ceil(
        (deadline - Date.now()) / 1000
      );

      if (remaining <= 0) {
        setTimeLeft(0);
        window.clearInterval(timer);
        return;
      }

      setTimeLeft(remaining);
    }, 200);

    return () => {
      window.clearInterval(timer);
    };
  }, [screen, currentQuestion, questions.length]);

  /*
   * ------------------------------------------
   * CURRENT QUESTION
   * ------------------------------------------
   */

  const question = questions[currentQuestion];

  /*
   * ------------------------------------------
   * TIME UP
   * ------------------------------------------
   */

  useEffect(() => {
    if (
      screen !== "quiz" ||
      !question ||
      timeLeft > 0 ||
      handlingTimeUpRef.current
    ) {
      return;
    }

    handlingTimeUpRef.current = true;
    setError("Time's up! Moving to the next question.");

    const updatedAnswers = [
      ...answers.filter(
        (item) => item.questionId !== question.id
      ),
      {
        questionId: question.id,
        answer: selectedAnswer || "",
      },
    ];

    setAnswers(updatedAnswers);

    if (currentQuestion < questions.length - 1) {
      const nextIndex = currentQuestion + 1;
      const nextQuestionData = questions[nextIndex];

      const previousAnswer = updatedAnswers.find(
        (item) => item.questionId === nextQuestionData.id
      );

      setCurrentQuestion(nextIndex);
      setSelectedAnswer(previousAnswer?.answer || "");
      return;
    }

    submitQuiz(updatedAnswers);
  }, [
    timeLeft,
    screen,
    question,
    answers,
    selectedAnswer,
    currentQuestion,
    questions,
  ]);

  const progress = useMemo(() => {
    if (!questions.length) return 0;

    return Math.round(
      ((currentQuestion + 1) /
        questions.length) *
        100
    );
  }, [currentQuestion, questions.length]);

  /*
   * ------------------------------------------
   * SELECT ANSWER
   * ------------------------------------------
   */

  function chooseAnswer(answer: string) {
    setSelectedAnswer(answer);
    setError("");
  }

  /*
   * ------------------------------------------
   * NEXT QUESTION
   * ------------------------------------------
   */

  function nextQuestion() {
    if (!question) return;

    if (!selectedAnswer) {
      setError("Please select an answer.");
      return;
    }

    setError("");

    const updatedAnswers = [
      ...answers.filter(
        (item) =>
          item.questionId !== question.id
      ),
      {
        questionId: question.id,
        answer: selectedAnswer,
      },
    ];

    setAnswers(updatedAnswers);

    if (
      currentQuestion <
      questions.length - 1
    ) {
      const nextIndex =
        currentQuestion + 1;

      const nextQuestionData =
        questions[nextIndex];

      const previousAnswer =
        updatedAnswers.find(
          (item) =>
            item.questionId ===
            nextQuestionData.id
        );

      setCurrentQuestion(nextIndex);
      setSelectedAnswer(
        previousAnswer?.answer || ""
      );

      return;
    }

    submitQuiz(updatedAnswers);
  }

  /*
   * ------------------------------------------
   * SUBMIT QUIZ
   * ------------------------------------------
   */

  async function submitQuiz(
    finalAnswers: Answer[]
  ) {
    if (!visitorId) {
      setError(
        "Your fan ID is still loading. Please try again."
      );
      return;
    }

    try {
      setError("");
      setScreen("submitting");

      const timeTaken = Math.max(
        1,
        Math.ceil(
          ((Date.now() - (quizStartedAtRef.current || Date.now())) / 1000)
        )
      );

      const response = await fetch(
        "/api/quiz/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            visitorId,
            fanName: name.trim(),
            twitterUsername:
              twitterUsername.trim(),
            instagramUsername:
              instagramUsername.trim(),
            country: country.trim(),
            answers: finalAnswers,
            timeTaken,
          }),
        }
      );

      const data: any = await response.json();

      if (!response.ok) {
        if (data.alreadyCompleted) {
          setError(
            "You have already completed today's quiz."
          );

          setScreen("intro");
          return;
        }

        throw new Error(
          data.error ||
            "Unable to submit the quiz."
        );
      }

      if (!data.success) {
        throw new Error(
          data.error ||
            "Unable to submit the quiz."
        );
      }

      setResult(data.result);
      setPassport(data.passport);

      await loadLeaderboard();

      setScreen("result");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit the quiz."
      );

      setScreen("quiz");
    }
  }

  /*
   * ------------------------------------------
   * RESET
   * ------------------------------------------
   */

  function resetToIntro() {
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedAnswer("");
    setResult(null);
    setPassport(null);
    setError("");
    setTimeLeft(QUESTION_TIME_LIMIT);
    quizStartedAtRef.current = null;
    handlingTimeUpRef.current = false;
    setScreen("intro");
  }

  /*
   * ------------------------------------------
   * LOADING
   * ------------------------------------------
   */

  if (screen === "loading") {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-6">
        <div className="text-center">

          <div className="text-amber-400 text-xs tracking-[0.5em] mb-5">
            WORLD OF RAAKA
          </div>

          <div className="text-2xl font-semibold">
            Loading Daily Quiz
          </div>

          <div className="mt-4 text-white/40 text-sm animate-pulse">
            Preparing today's challenge...
          </div>

        </div>
      </main>
    );
  }

  /*
   * ------------------------------------------
   * INTRO SCREEN
   * ------------------------------------------
   */

  if (screen === "intro") {
    return (
      <main className="min-h-screen bg-[#050505] text-white px-5 py-16">

        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-12">

            <div className="text-amber-400 text-xs tracking-[0.5em]">
              WORLD OF RAAKA
            </div>

            <h1 className="mt-5 text-5xl md:text-7xl font-black tracking-tight">
              DAILY QUIZ
            </h1>

            <p className="mt-5 text-white/50 max-w-2xl mx-auto leading-relaxed">
              Ten questions. One daily challenge.
              Earn XP for your Fan Passport and climb
              the RAAKA Fan Leaderboard.
            </p>

            {quizDate && (
              <div className="mt-4 text-sm text-amber-400/70">
                TODAY • {quizDate}
              </div>
            )}

          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <div className="text-3xl font-black text-amber-400">
                10
              </div>

              <div className="mt-2 text-sm text-white/40">
                Questions
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <div className="text-3xl font-black text-amber-400">
                +100
              </div>

              <div className="mt-2 text-sm text-white/40">
                Maximum XP
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <div className="text-3xl font-black text-amber-400">
                DAILY
              </div>

              <div className="mt-2 text-sm text-white/40">
                New Challenge
              </div>
            </div>

          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.025] p-7 md:p-10">

            <div className="mb-8">

              <div className="text-amber-400 text-xs tracking-[0.3em]">
                FAN ARENA
              </div>

              <h2 className="mt-3 text-3xl font-bold">
                Enter the RAAKA Fan Arena
              </h2>

              <p className="mt-2 text-sm text-white/40">
                These details appear on your quiz
                leaderboard and Fan Passport.
              </p>

            </div>

            <form
              onSubmit={startQuiz}
              className="space-y-4"
            >

              <div>
                <label className="block text-xs text-white/40 mb-2">
                  NAME *
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Enter your name"
                  autoComplete="name"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs text-white/40 mb-2">
                  TWITTER / X USERNAME
                </label>

                <input
                  type="text"
                  value={twitterUsername}
                  onChange={(e) =>
                    setTwitterUsername(
                      e.target.value
                    )
                  }
                  placeholder="@username"
                  autoComplete="username"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs text-white/40 mb-2">
                  INSTAGRAM USERNAME
                </label>

                <input
                  type="text"
                  value={instagramUsername}
                  onChange={(e) =>
                    setInstagramUsername(
                      e.target.value
                    )
                  }
                  placeholder="@username"
                  autoComplete="off"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition focus:border-amber-400"
                />

                <p className="mt-2 text-[11px] text-white/25">
                  Twitter/X ya Instagram me se koi ek de sakte ho.
                </p>
              </div>

              <div>
                <label className="block text-xs text-white/40 mb-2">
                  COUNTRY *
                </label>

                <input
                  type="text"
                  value={country}
                  onChange={(e) =>
                    setCountry(e.target.value)
                  }
                  placeholder="India"
                  autoComplete="country-name"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white outline-none transition focus:border-amber-400"
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  !name.trim() ||
                  !country.trim() ||
                  (!twitterUsername.trim() &&
                    !instagramUsername.trim()) ||
                  questions.length !== 10
                }
                className="w-full rounded-2xl bg-amber-400 px-6 py-4 font-black text-black transition hover:bg-amber-300 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {questions.length === 10
                  ? "START TODAY'S QUIZ"
                  : "LOADING QUIZ..."}
              </button>

            </form>

          </div>

          <Leaderboard
            leaderboard={leaderboard}
          />

        </div>
      </main>
    );
  }

  /*
   * ------------------------------------------
   * SUBMITTING
   * ------------------------------------------
   */

  if (screen === "submitting") {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-6">

        <div className="text-center">

          <div className="text-amber-400 text-xs tracking-[0.4em] mb-5">
            RAAKA DAILY QUIZ
          </div>

          <h1 className="text-4xl font-black">
            Calculating Result
          </h1>

          <p className="mt-4 text-white/40">
            Updating your Fan Passport...
          </p>

        </div>

      </main>
    );
  }

  /*
   * ------------------------------------------
   * RESULT
   * ------------------------------------------
   */

  if (
    screen === "result" &&
    result &&
    passport
  ) {
    return (
      <main className="min-h-screen bg-[#050505] text-white px-5 py-16">

        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-12">

            <div className="text-amber-400 text-xs tracking-[0.4em]">
              RAAKA DAILY QUIZ
            </div>

            <h1 className="mt-4 text-5xl md:text-6xl font-black">
              QUIZ COMPLETE
            </h1>

            <p className="mt-4 text-white/40">
              {quizDate}
            </p>

          </div>

          <div className="grid md:grid-cols-2 gap-5">

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-center">

              <div className="text-xs tracking-[0.25em] text-white/40">
                YOUR SCORE
              </div>

              <div className="mt-5 text-7xl font-black text-amber-400">
                {result.correctAnswers}
                <span className="text-3xl text-white/30">
                  /{result.totalQuestions}
                </span>
              </div>

              <div className="mt-4 text-white/50">
                {result.score} points
              </div>

              <div className="mt-2 font-bold text-emerald-400">
                +{result.xpEarned} XP
              </div>

              <div className="mt-5 border-t border-white/10 pt-5">
                <div className="text-xs text-white/30">
                  TOTAL TIME
                </div>
                <div className="mt-2 text-2xl font-black text-white">
                  {Math.floor(result.timeTaken / 60)}m{" "}
                  {String(result.timeTaken % 60).padStart(2, "0")}s
                </div>
              </div>

            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">

              <div className="text-xs tracking-[0.25em] text-white/40">
                FAN PASSPORT
              </div>

              <h2 className="mt-4 text-2xl font-bold">
                {passport.fanName}
              </h2>

              <div className="grid grid-cols-2 gap-3 mt-6">

                <div className="rounded-2xl bg-black/30 p-5">
                  <div className="text-xs text-white/30">
                    LEVEL
                  </div>

                  <div className="mt-2 text-3xl font-black">
                    {passport.level}
                  </div>
                </div>

                <div className="rounded-2xl bg-black/30 p-5">
                  <div className="text-xs text-white/30">
                    TOTAL XP
                  </div>

                  <div className="mt-2 text-3xl font-black text-amber-400">
                    {passport.xp}
                  </div>
                </div>

              </div>

              <div className="mt-6 text-xs text-white/30">
                PASSPORT CODE
              </div>

              <div className="mt-1 font-mono text-amber-300">
                {passport.passportCode}
              </div>

            </div>

          </div>

          <Leaderboard
            leaderboard={leaderboard}
          />

          <div className="mt-12">
            <RaakaPassportGenerator
              data={{
                name: name.trim(),
                country: country.trim(),
                twitterUsername: twitterUsername.trim(),
                instagramUsername: instagramUsername.trim(),
                passportCode: passport.passportCode,
                score: result.score,
                totalQuestions: result.totalQuestions,
                xp: result.xpEarned,
                level: passport.level,
                quizDate,
              }}
            />
          </div>

          <div className="text-center mt-10">

            <button
              type="button"
              onClick={resetToIntro}
              className="rounded-2xl border border-white/10 px-7 py-4 text-sm font-bold text-white/70 hover:bg-white/5 transition"
            >
              BACK TO QUIZ
            </button>

          </div>

        </div>
      </main>
    );
  }

  /*
   * ------------------------------------------
   * QUIZ SCREEN
   * ------------------------------------------
   */

  if (screen === "quiz" && question) {
    const options = [
      {
        letter: "A",
        text: question.option_a,
      },
      {
        letter: "B",
        text: question.option_b,
      },
      {
        letter: "C",
        text: question.option_c,
      },
      {
        letter: "D",
        text: question.option_d,
      },
    ];

    return (
      <main className="min-h-screen bg-[#050505] text-white px-5 py-12 md:py-16">

        <div className="max-w-3xl mx-auto">

          <div className="flex items-center justify-between mb-7">

            <div>
              <div className="text-amber-400 text-xs tracking-[0.3em]">
                RAAKA DAILY QUIZ
              </div>

              <div className="mt-2 text-sm text-white/30">
                {quizDate}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div
                className={`rounded-xl border px-4 py-2 text-sm font-black tabular-nums ${
                  timeLeft <= 5
                    ? "border-red-400/40 bg-red-400/10 text-red-300"
                    : "border-amber-400/20 bg-amber-400/5 text-amber-300"
                }`}
              >
                ⏱ {timeLeft}s
              </div>

              <div className="font-bold text-white/50">
                {currentQuestion + 1}
                <span className="text-white/20">
                  /{questions.length}
                </span>
              </div>
            </div>

          </div>

          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-3">
            <div
              className="h-full bg-amber-400 transition-all duration-500"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <div className="mb-8 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-white/30">
            <span>15 SEC / QUESTION</span>
            <span className={timeLeft <= 5 ? "text-red-300" : "text-white/30"}>
              Answer before the timer ends
            </span>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.025] p-7 md:p-10">

            <div className="text-xs tracking-[0.25em] text-amber-400">
              QUESTION {currentQuestion + 1}
            </div>

            <h1 className="mt-5 text-2xl md:text-3xl font-bold leading-tight">
              {question.question}
            </h1>

            <div className="mt-9 space-y-3">

              {options.map((option) => {
                const selected =
                  selectedAnswer ===
                  option.letter;

                return (
                  <button
                    key={option.letter}
                    type="button"
                    onClick={() =>
                      chooseAnswer(
                        option.letter
                      )
                    }
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-amber-400 bg-amber-400/10"
                        : "border-white/10 bg-white/[0.025] hover:border-amber-400/40 hover:bg-white/[0.05]"
                    }`}
                  >

                    <span
                      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border mr-3 font-bold ${
                        selected
                          ? "border-amber-400 text-amber-400"
                          : "border-white/10 text-white/40"
                      }`}
                    >
                      {option.letter}
                    </span>

                    <span
                      className={
                        selected
                          ? "text-amber-300"
                          : "text-white/80"
                      }
                    >
                      {option.text}
                    </span>

                  </button>
                );
              })}

            </div>

            {error && (
              <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={nextQuestion}
              className="mt-8 w-full rounded-2xl bg-amber-400 py-4 font-black text-black transition hover:bg-amber-300 active:scale-[0.99]"
            >
              {currentQuestion ===
              questions.length - 1
                ? "FINISH QUIZ"
                : "NEXT QUESTION"}
            </button>

          </div>

        </div>

      </main>
    );
  }

  return null;
}


/*
 * ============================================
 * LEADERBOARD COMPONENT
 * ============================================
 */

function Leaderboard({
  leaderboard,
}: {
  leaderboard: LeaderboardUser[];
}) {
  return (
    <section className="mt-16">

      <div className="text-center mb-8">

        <div className="text-amber-400 text-xs tracking-[0.35em]">
          GLOBAL FAN RANKING
        </div>

        <h2 className="mt-3 text-3xl md:text-4xl font-black">
          RAAKA LEADERBOARD
        </h2>

      </div>

      <div className="space-y-3">

        {leaderboard
          .slice(0, 10)
          .map((fan) => (
            <div
              key={`${fan.rank}-${fan.name}-${fan.twitterUsername || ""}`}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4"
            >

              <div className="w-8 shrink-0 text-center font-bold text-white/30">
                #{fan.rank}
              </div>

              {fan.profileImage ? (
                <img
                  src={fan.profileImage}
                  alt=""
                  className="h-11 w-11 shrink-0 rounded-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />
              ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-400/10 font-bold text-amber-400">
                  {fan.name
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}

              <div className="min-w-0 flex-1">

                <div className="truncate font-semibold">
                  {fan.name}
                </div>

                <div className="mt-0.5 truncate text-xs text-white/35">

                  {fan.twitterUsername
                    ? `@${fan.twitterUsername.replace(
                        /^@/,
                        ""
                      )}`
                    : "RAAKA Fan"}

                  {fan.country
                    ? ` • ${fan.country}`
                    : ""}

                </div>

              </div>

              <div className="text-right">
                <div className="font-black text-amber-400">
                  {fan.score}
                </div>

                <div className="text-[9px] uppercase tracking-wider text-white/25">
                  points
                </div>

                <div className="mt-1 text-[9px] tabular-nums text-emerald-300/60">
                  {fan.timeTaken > 0
                    ? `${Math.floor(fan.timeTaken / 60)}m ${String(
                        fan.timeTaken % 60
                      ).padStart(2, "0")}s`
                    : "—"}
                </div>
              </div>

            </div>
          ))}

        {leaderboard.length === 0 && (
          <div className="rounded-2xl border border-white/10 py-12 text-center text-sm text-white/30">
            No fans have completed the quiz yet.
            <br />
            Be the first one!
          </div>
        )}

      </div>

    </section>
  );
}