"use client";

import RaakaPassportGenerator from "@/components/RaakaPassportGenerator";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

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

  /* keyboard: press A / B / C / D to answer */
  useEffect(() => {
    if (screen !== "quiz") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key.toUpperCase();
      if (key === "A" || key === "B" || key === "C" || key === "D") chooseAnswer(key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen]);

  if (screen === "loading") {
    return <Splash kicker="World of RAAKA" title="Loading Daily Quiz" sub="Preparing today's challenge..." />;
  }

  if (screen === "submitting") {
    return <Splash kicker="RAAKA DAILY QUIZ" title="Calculating Result" sub="Updating your Fan Passport..." />;
  }

  if (screen === "intro") {
    return (
      <Shell>
        <div className="mx-auto max-w-5xl px-5 py-14 md:py-20">
          <Brand />
          <div className="mb-14 text-center">
            <p className="qk shim">World of RAAKA</p>
            <h1 className="q-title f-d"><Letters text="DAILY QUIZ" /></h1>
            <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-white/50">
              Ten questions. One daily challenge. Earn XP for your Fan Passport and climb the RAAKA Fan Leaderboard.
            </p>
            {quizDate && <div className="q-date"><span className="pulse" />TODAY • {quizDate}</div>}
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-3">
            {([[<CountNum key="a" to={10} />, "Questions"], [<CountNum key="b" to={100} prefix="+" />, "Maximum XP"], ["DAILY", "New Challenge"]] as [React.ReactNode, string][]).map(([v, l], i) => (
              <Reveal key={l} delay={i * 110}>
                <div className="q-tile sp ringb" onPointerMove={pt}>
                  <div className="f-d text-4xl font-black text-[#FFB347]">{v}</div>
                  <div className="mt-2 text-sm text-white/40">{l}</div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="q-card ringb">
              <div className="mb-8">
                <p className="qk">Fan Arena</p>
                <h2 className="f-d mt-3 text-3xl font-bold md:text-4xl">Enter the RAAKA Fan Arena</h2>
                <p className="mt-2 text-sm text-white/40">These details appear on your quiz leaderboard and Fan Passport.</p>
              </div>
              <form onSubmit={startQuiz} className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="NAME *" value={name} set={setName} ph="Enter your name" ac="name" />
                  <Field label="COUNTRY *" value={country} set={setCountry} ph="India" ac="country-name" />
                  <Field label="TWITTER / X USERNAME" value={twitterUsername} set={setTwitterUsername} ph="@username" ac="username" />
                  <Field label="INSTAGRAM USERNAME" value={instagramUsername} set={setInstagramUsername} ph="@username" ac="off" />
                </div>
                <p className="text-[11px] text-white/30">You may provide either your Twitter/X or Instagram username.</p>
                {error && <div className="q-err">{error}</div>}
                <button
                  type="submit"
                  disabled={!name.trim() || !country.trim() || (!twitterUsername.trim() && !instagramUsername.trim()) || questions.length !== 10}
                  className="q-go"
                >
                  {questions.length === 10 ? "START TODAY'S QUIZ" : "LOADING QUIZ..."}
                </button>
              </form>
            </div>
          </Reveal>

          <Leaderboard leaderboard={leaderboard} />
        </div>
      </Shell>
    );
  }

  if (screen === "result" && result && passport) {
    const off = 339.3 * (1 - result.correctAnswers / Math.max(1, result.totalQuestions));
    return (
      <Shell>
        <div className="mx-auto max-w-5xl px-5 py-14 md:py-20">
          <Brand />
          <div className="relative mb-12 text-center">
            <Burst />
            <p className="qk shim">RAAKA DAILY QUIZ</p>
            <h1 className="q-title f-d"><Letters text="QUIZ COMPLETE" /></h1>
            <p className="mt-4 text-white/40">{quizDate}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Reveal>
              <div className="q-card ringb h-full text-center">
                <p className="qk justify-center">Your score</p>
                <div className="q-gauge">
                  <svg viewBox="0 0 120 120" aria-hidden="true">
                    <defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FFC44C" /><stop offset="100%" stopColor="#FF4D00" /></linearGradient></defs>
                    <circle className="g-bg" cx="60" cy="60" r="54" />
                    <circle className="g-fg" cx="60" cy="60" r="54" stroke="url(#gg)" style={{ strokeDashoffset: off }} />
                  </svg>
                  <div className="g-num f-d"><CountNum to={result.correctAnswers} /><span>/{result.totalQuestions}</span></div>
                </div>
                <div className="mt-5 text-white/50"><CountNum to={result.score} /> points</div>
                <div className="mt-2 font-bold text-emerald-400">+<CountNum to={result.xpEarned} /> XP</div>
                <div className="mt-5 border-t border-white/10 pt-5">
                  <div className="text-xs text-white/30">TOTAL TIME</div>
                  <div className="f-d mt-2 text-3xl font-black">{Math.floor(result.timeTaken / 60)}m {String(result.timeTaken % 60).padStart(2, "0")}s</div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={140}>
              <div className="pp h-full" onPointerMove={pt} onPointerLeave={unpt}>
                <p className="qk">Fan Passport</p>
                <h2 className="f-d mt-4 text-3xl font-bold">{passport.fanName}</h2>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-black/40 p-5"><div className="text-xs text-white/30">LEVEL</div><div className="f-d mt-2 text-4xl font-black"><CountNum to={passport.level} /></div></div>
                  <div className="rounded-2xl bg-black/40 p-5"><div className="text-xs text-white/30">TOTAL XP</div><div className="f-d mt-2 text-4xl font-black text-[#FFB347]"><CountNum to={passport.xp} /></div></div>
                </div>
                <div className="mt-6 text-xs text-white/30">PASSPORT CODE</div>
                <div className="mt-1 font-mono text-lg tracking-wider text-[#FFC44C]">{passport.passportCode}</div>
              </div>
            </Reveal>
          </div>

          <Leaderboard leaderboard={leaderboard} />

          <Reveal className="mt-14">
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
          </Reveal>

          <div className="mt-10 text-center">
            <button type="button" onClick={resetToIntro} className="q-ghost">BACK TO QUIZ</button>
          </div>
        </div>
      </Shell>
    );
  }

  if (screen === "quiz" && question) {
    const options = [
      { letter: "A", text: question.option_a },
      { letter: "B", text: question.option_b },
      { letter: "C", text: question.option_c },
      { letter: "D", text: question.option_d },
    ];
    const low = timeLeft <= 5;
    return (
      <Shell danger={low}>
        <div className="mx-auto max-w-3xl px-5 py-10 md:py-14">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="qk shim">RAAKA DAILY QUIZ</p>
              <p className="mt-2 text-sm text-white/30">{quizDate}</p>
            </div>
            <div className="flex items-center gap-5">
              <div className="text-right">
                <p className="font-bold text-white/60"><span className="f-d text-3xl text-white">{currentQuestion + 1}</span>/{questions.length}</p>
                <p className="text-[11px] text-white/30">{progress}%</p>
              </div>
              <div className={"q-timer" + (low ? " low" : "")}>
                <svg viewBox="0 0 64 64" aria-hidden="true">
                  <circle className="tr-bg" cx="32" cy="32" r="28" />
                  <circle key={currentQuestion} className="tr-fg" cx="32" cy="32" r="28" />
                </svg>
                <span className="tabular-nums">{timeLeft}<small>s</small></span>
              </div>
            </div>
          </div>

          <div className="pips mb-3">
            {questions.map((_, i) => (<i key={i} className={"pip" + (i < currentQuestion ? " done" : i === currentQuestion ? " cur" : "")} />))}
          </div>
          <div className="mb-7 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-white/30">
            <span>15 SEC / QUESTION</span>
            <span className={low ? "text-red-300" : ""}>Answer before the timer ends</span>
          </div>

          <div key={currentQuestion} className="q-card ringb q-in">
            <span className="q-gn f-d" aria-hidden="true">{String(currentQuestion + 1).padStart(2, "0")}</span>
            <p className="qk">QUESTION {currentQuestion + 1}</p>
            <h1 className="f-d relative mt-5 text-2xl font-bold leading-tight md:text-4xl">{question.question}</h1>
            <div className="mt-9 space-y-3">
              {options.map((option, idx) => {
                const selected = selectedAnswer === option.letter;
                return (
                  <button key={option.letter} type="button" aria-pressed={selected} onClick={() => chooseAnswer(option.letter)} onPointerMove={pt} className={"q-opt sp" + (selected ? " sel" : "")} style={cssVars({ "--i": idx })}>
                    <span className="q-ltr">{option.letter}</span>
                    <span className="q-ot">{option.text}</span>
                    {selected && <span className="q-ck" aria-hidden="true">✓</span>}
                  </button>
                );
              })}
            </div>
            {error && <div className="q-err mt-6">{error}</div>}
            <button type="button" onClick={nextQuestion} className="q-go mt-8">
              {currentQuestion === questions.length - 1 ? "FINISH QUIZ" : "NEXT QUESTION"}
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  return null;
}

/* ============================================
 * SHARED PIECES
 * ============================================ */
const cssVars = (o: Record<string, string | number>) => o as unknown as CSSProperties;

const pt = (e: React.PointerEvent<HTMLElement>) => {
  const el = e.currentTarget, r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
  el.style.setProperty("--rx", ((0.5 - y) * 8).toFixed(2) + "deg");
  el.style.setProperty("--ry", ((x - 0.5) * 10).toFixed(2) + "deg");
  el.style.setProperty("--mx", x * 100 + "%");
  el.style.setProperty("--my", y * 100 + "%");
};
const unpt = (e: React.PointerEvent<HTMLElement>) => {
  e.currentTarget.style.setProperty("--rx", "0deg");
  e.currentTarget.style.setProperty("--ry", "0deg");
};

function Embers({ count = 18, rise = 600 }: { count?: number; rise?: number }) {
  return (
    <span className="embers" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <i key={i} style={cssVars({ "--x": ((i * 37 + 11) % 100) + "%", "--s": 2 + (i % 3) + "px", "--d": (3.6 + (i % 5) * 0.8).toFixed(1) + "s", "--dl": ((i * 0.55) % 5).toFixed(2) + "s", "--dx": (i % 2 ? 1 : -1) * (10 + ((i * 13) % 34)) + "px", "--rise": rise + "px" })} />
      ))}
    </span>
  );
}

function Shell({ children, danger }: { children: React.ReactNode; danger?: boolean }) {
  return (
    <main className={"qz relative min-h-screen overflow-x-hidden bg-black text-white" + (danger ? " danger" : "")}>
      <style dangerouslySetInnerHTML={{ __html: QCSS }} />
      <div className="qz-bg" aria-hidden="true">
        {["raakabg.jpg", "raakabg1.jpg", "raakabg2.jpg"].map((f, i) => (
          <div key={f} className="bgx" style={{ backgroundImage: `url('/images/${f}')`, animationDelay: i * 8 + "s" }} />
        ))}
        <div className="qz-veil" />
      </div>
      <Embers />
      <div className="grain" aria-hidden="true" />
      <div className="relative z-10">{children}</div>
    </main>
  );
}

function Splash({ kicker, title, sub }: { kicker: string; title: string; sub: string }) {
  return (
    <Shell>
      <div className="grid min-h-screen place-items-center px-6 text-center">
        <div>
          <div className="q-orbit"><i /><i /><b className="f-d">R</b></div>
          <p className="qk shim justify-center">{kicker}</p>
          <h1 className="f-d mt-4 text-4xl font-black md:text-6xl">{title}</h1>
          <p className="mt-4 text-white/40">{sub}</p>
          <div className="q-bars">{[0, 1, 2, 3, 4].map((k) => (<i key={k} style={cssVars({ "--k": k })} />))}</div>
        </div>
      </div>
    </Shell>
  );
}

const Brand = () => (
  <div className="mb-10 flex justify-center">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/images/logo2.png" alt="RAAKA" className="h-12 w-auto drop-shadow-[0_0_24px_rgba(255,130,30,0.35)] md:h-14" />
  </div>
);

const Letters = ({ text }: { text: string }) => {
  let n = 0;
  return (
    <span aria-label={text}>
      {text.split(" ").map((w, wi) => (
        <span key={wi}>
          <span className="q-w" aria-hidden="true">
            {w.split("").map((c, i) => (<span key={i} className="q-letter" style={cssVars({ "--i": n++ })}>{c}</span>))}
          </span>{" "}
        </span>
      ))}
    </span>
  );
};

function CountNum({ to, prefix = "" }: { to: number; prefix?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 1400);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{prefix}{n.toLocaleString("en-IN")}</>;
}

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={"qr " + (on ? "in " : "") + className} style={{ transitionDelay: delay + "ms" }}>{children}</div>;
}

function Burst() {
  return (
    <span className="burst" aria-hidden="true">
      {Array.from({ length: 28 }).map((_, i) => (
        <i key={i} style={cssVars({ "--a": (i * 360) / 28 + "deg", "--r": 140 + ((i * 53) % 120) + "px", "--dl": (i % 7) * 0.03 + "s" })} />
      ))}
    </span>
  );
}

function Field({ label, value, set, ph, ac }: { label: string; value: string; set: (v: string) => void; ph: string; ac: string }) {
  return (
    <div className="q-f">
      <label>{label}</label>
      <input type="text" value={value} onChange={(e) => set(e.target.value)} placeholder={ph} autoComplete={ac} />
    </div>
  );
}

/* ============================================
 * LEADERBOARD COMPONENT
 * ============================================ */
const fmtTime = (t: number) => (t > 0 ? `${Math.floor(t / 60)}m ${String(t % 60).padStart(2, "0")}s` : "—");
const handle = (fan: LeaderboardUser) =>
  (fan.twitterUsername ? `@${fan.twitterUsername.replace(/^@/, "")}` : "RAAKA Fan") + (fan.country ? ` • ${fan.country}` : "");

function Avatar({ fan, big }: { fan: LeaderboardUser; big?: boolean }) {
  return (
    <span className={"lb-av" + (big ? " lg" : "")}>
      <b>{fan.name.charAt(0).toUpperCase()}</b>
      {fan.profileImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={fan.profileImage} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} />
      )}
    </span>
  );
}

function Leaderboard({ leaderboard }: { leaderboard: LeaderboardUser[] }) {
  const top = leaderboard.slice(0, 10);
  const podium = top.slice(0, 3);
  const rest = top.slice(3);
  const key = (fan: LeaderboardUser) => `${fan.rank}-${fan.name}-${fan.twitterUsername || ""}`;
  return (
    <section className="mt-20">
      <Reveal className="mb-10 text-center">
        <p className="qk justify-center">GLOBAL FAN RANKING</p>
        <h2 className="f-d mt-3 text-4xl font-black md:text-5xl">RAAKA LEADERBOARD</h2>
      </Reveal>

      {podium.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3 md:items-end">
          {podium.map((fan, i) => (
            <Reveal key={key(fan)} delay={i * 120} className={i === 0 ? "md:order-2" : i === 1 ? "md:order-1" : "md:order-3"}>
              <div className={"lb-p sp m" + (i + 1)} onPointerMove={pt}>
                {i === 0 && (<svg className="crown" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z" /></svg>)}
                <div className="lb-rk f-d">#{fan.rank}</div>
                <Avatar fan={fan} big />
                <div className="mt-3 truncate font-semibold">{fan.name}</div>
                <div className="mt-0.5 truncate text-xs text-white/35">{handle(fan)}</div>
                <div className="f-d mt-4 text-3xl font-black text-[#FFB347]"><CountNum to={fan.score} /></div>
                <div className="text-[10px] uppercase tracking-wider text-white/25">points</div>
                <div className="mt-1 text-[10px] tabular-nums text-emerald-300/60">{fmtTime(fan.timeTaken)}</div>
              </div>
            </Reveal>
          ))}
        </div>
      )}

      <div className="mt-4 space-y-3">
        {rest.map((fan, i) => (
          <Reveal key={key(fan)} delay={i * 60}>
            <div className="lb-r sp" onPointerMove={pt}>
              <div className="w-8 shrink-0 text-center font-bold text-white/30">#{fan.rank}</div>
              <Avatar fan={fan} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{fan.name}</div>
                <div className="mt-0.5 truncate text-xs text-white/35">{handle(fan)}</div>
              </div>
              <div className="text-right">
                <div className="f-d text-xl font-black text-[#FFB347]">{fan.score}</div>
                <div className="text-[9px] uppercase tracking-wider text-white/25">points</div>
                <div className="mt-1 text-[9px] tabular-nums text-emerald-300/60">{fmtTime(fan.timeTaken)}</div>
              </div>
            </div>
          </Reveal>
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

const QCSS = `
.qz{font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased}
.f-d{font-family:ui-serif,Georgia,Cambria,"Times New Roman",serif}
::selection{background:rgba(255,150,60,.35);color:#fff}
.qz button:not(:disabled){cursor:pointer}
.qz :focus-visible{outline:2px solid #FFB347;outline-offset:3px}
@property --ang{syntax:"<angle>";inherits:false;initial-value:0deg}
@keyframes ang{to{--ang:360deg}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes sheen{to{background-position:-250% 0}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.shim{background:linear-gradient(100deg,#FFB347 35%,#fff 50%,#FFB347 65%);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:sheen 4s linear infinite}
.qk{display:flex;align-items:center;gap:.7rem;font-size:.75rem;font-weight:600;letter-spacing:.3em;color:#FFB347}

.qz-bg{position:fixed;inset:0;z-index:0;overflow:hidden;background:#000}
.bgx{position:absolute;inset:0;background-size:cover;background-position:center;opacity:0;animation:bgx 24s ease-in-out infinite both}
@keyframes bgx{0%{opacity:0;transform:scale(1.03)}4%{opacity:1}33%{opacity:1}38%{opacity:0;transform:scale(1.12)}100%{opacity:0;transform:scale(1.12)}}
.qz-veil{position:absolute;inset:0;background:radial-gradient(circle at 48% 28%,rgba(255,76,0,.17),transparent 50%),linear-gradient(rgba(0,0,0,.74),rgba(0,0,0,.9)),radial-gradient(circle at center,transparent 25%,rgba(0,0,0,.8) 100%)}
.danger .qz-veil::after{content:"";position:absolute;inset:0;box-shadow:inset 0 0 160px 40px rgba(255,40,40,.28);animation:alarm 1s ease-in-out infinite}
@keyframes alarm{50%{opacity:.25}}
.grain{position:fixed;top:-50%;left:-50%;width:200%;height:200%;z-index:20;pointer-events:none;opacity:.07;mix-blend-mode:overlay;animation:grain .9s steps(6) infinite;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
@keyframes grain{0%,100%{transform:translate(0,0)}20%{transform:translate(-4%,3%)}40%{transform:translate(3%,-5%)}60%{transform:translate(-5%,-2%)}80%{transform:translate(4%,4%)}}
.embers{position:fixed;inset:0;z-index:1;overflow:hidden;pointer-events:none}
.embers i{position:absolute;bottom:-4px;left:var(--x);width:var(--s);height:var(--s);border-radius:9999px;background:#FFB347;box-shadow:0 0 10px 2px rgba(255,120,30,.8);opacity:0;animation:ember var(--d) ease-out var(--dl) infinite}
@keyframes ember{0%{opacity:0;transform:translate(0,0) scale(1)}12%{opacity:.95}100%{opacity:0;transform:translate(var(--dx),calc(var(--rise)*-1)) scale(.2)}}

.q-title{margin-top:1.25rem;font-size:clamp(2.8rem,11vw,7rem);font-weight:900;line-height:.98;letter-spacing:-.02em}
.q-w{display:inline-block;white-space:nowrap}
.q-letter{display:inline-block;padding:0 .02em;background:linear-gradient(180deg,#FFF1C9 8%,#FFC44C 50%,#FF6A1F 100%);-webkit-background-clip:text;background-clip:text;color:transparent;animation:letterIn 1.1s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(.2s + var(--i)*.07s)}
@keyframes letterIn{from{opacity:0;filter:blur(18px);transform:translate3d(0,40px,0) scale(1.12)}to{opacity:1;filter:blur(0);transform:none}}
.q-date{display:inline-flex;align-items:center;gap:.7rem;margin-top:1.25rem;border:1px solid rgba(255,150,60,.3);border-radius:9999px;background:rgba(255,100,20,.07);padding:.45rem 1.1rem;font-size:.8rem;color:#FFB347}
.pulse{position:relative;width:8px;height:8px;border-radius:9999px;background:#FFB347}
.pulse::after{content:"";position:absolute;inset:0;border-radius:inherit;background:inherit;animation:ping 2s cubic-bezier(0,0,.2,1) infinite}
@keyframes ping{75%,100%{transform:scale(2.8);opacity:0}}

.sp{position:relative;overflow:hidden}
.sp::before{content:"";position:absolute;inset:0;opacity:0;pointer-events:none;transition:opacity .4s;background:radial-gradient(240px circle at var(--mx,50%) var(--my,50%),rgba(255,130,40,.18),transparent 70%)}
.sp:hover::before{opacity:1}
.sp>*{position:relative}
.ringb{position:relative}
.ringb::after{content:"";position:absolute;inset:0;border-radius:inherit;padding:1px;pointer-events:none;opacity:.8;background:conic-gradient(from var(--ang),transparent 62%,#FFB347,#FF4D00,transparent);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:ang 6s linear infinite}
.q-card{position:relative;overflow:hidden;border-radius:2rem;border:1px solid rgba(244,236,221,.1);background:rgba(8,4,3,.64);backdrop-filter:blur(14px);padding:1.75rem}
@media(min-width:768px){.q-card{padding:2.5rem}}
.q-tile{border-radius:1.5rem;border:1px solid rgba(244,236,221,.1);background:rgba(8,4,3,.62);backdrop-filter:blur(10px);padding:1.5rem;transition:transform .4s,border-color .4s}
.q-tile:hover{transform:translateY(-4px);border-color:rgba(255,150,60,.5)}
.qr{opacity:0;transform:translateY(26px);transition:opacity .8s ease,transform .8s cubic-bezier(.2,.7,.2,1)}
.qr.in{opacity:1;transform:none}

.q-f label{display:block;margin-bottom:.5rem;font-size:.7rem;letter-spacing:.14em;color:rgba(255,255,255,.4)}
.q-f input{width:100%;border-radius:1rem;border:1px solid rgba(244,236,221,.12);background:rgba(0,0,0,.45);padding:1rem 1.25rem;color:#fff;outline:none;transition:border-color .3s,box-shadow .3s,background .3s}
.q-f input:focus{border-color:#FFB347;background:rgba(0,0,0,.65);box-shadow:0 0 0 4px rgba(255,150,60,.12),0 0 30px -6px rgba(255,100,20,.45)}
.q-f input::placeholder{color:rgba(255,255,255,.22)}
.q-go{position:relative;overflow:hidden;width:100%;border-radius:1rem;background:linear-gradient(135deg,#FFC44C,#FF6A1F);padding:1rem 1.5rem;font-weight:900;letter-spacing:.04em;color:#1a0a04;transition:transform .3s,box-shadow .3s,opacity .3s}
.q-go:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 12px 40px -8px rgba(255,100,20,.6)}
.q-go:active:not(:disabled){transform:scale(.99)}
.q-go:disabled{opacity:.4;cursor:not-allowed}
.q-go::after{content:"";position:absolute;top:0;bottom:0;width:40%;left:-60%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.4),transparent);transform:skewX(-20deg);animation:shine 3.5s ease-in-out infinite}
@keyframes shine{0%,55%{left:-60%}100%{left:140%}}
.q-ghost{border:1px solid rgba(244,236,221,.15);border-radius:1rem;padding:1rem 1.75rem;font-size:.85rem;font-weight:700;color:rgba(255,255,255,.7);transition:background .3s,border-color .3s}
.q-ghost:hover{background:rgba(255,120,30,.08);border-color:rgba(255,150,60,.5)}
.q-err{border:1px solid rgba(255,80,80,.25);border-radius:1rem;background:rgba(255,60,60,.07);padding:1rem 1.25rem;font-size:.875rem;color:#ff8f8f;animation:shake .5s}
@keyframes shake{20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}

.q-timer{position:relative;display:flex;height:4rem;width:4rem;align-items:center;justify-content:center;font-size:1.2rem;font-weight:900;color:#FFC44C}
.q-timer small{font-size:.65rem;opacity:.6}
.q-timer svg{position:absolute;inset:0;height:100%;width:100%}
.tr-bg{fill:rgba(0,0,0,.4);stroke:rgba(255,255,255,.1);stroke-width:4}
.tr-fg{fill:none;stroke:#FFB347;stroke-width:4;stroke-linecap:round;stroke-dasharray:176;transform:rotate(-90deg);transform-origin:32px 32px;animation:drain 15s linear forwards;filter:drop-shadow(0 0 6px rgba(255,140,40,.7))}
@keyframes drain{to{stroke-dashoffset:176}}
.q-timer.low{color:#ff8a8a;animation:beat .8s ease-in-out infinite}
.q-timer.low .tr-fg{stroke:#ff5d5d;filter:drop-shadow(0 0 8px rgba(255,60,60,.8))}
@keyframes beat{50%{transform:scale(1.1)}}
.pips{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:6px}
.pip{position:relative;height:5px;overflow:hidden;border-radius:9999px;background:rgba(255,255,255,.1)}
.pip.done{background:linear-gradient(90deg,#FF6A1F,#FFC44C)}
.pip.cur::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,#FF6A1F,#FFC44C);transform-origin:left;animation:drainBar 15s linear forwards}
@keyframes drainBar{from{transform:scaleX(1)}to{transform:scaleX(0)}}
.q-in{animation:qIn .7s cubic-bezier(.2,.7,.2,1) both}
@keyframes qIn{from{opacity:0;transform:translate3d(30px,0,0);filter:blur(8px)}}
.q-gn{position:absolute;right:1.5rem;top:.5rem;font-size:7rem;font-weight:900;line-height:1;color:transparent;-webkit-text-stroke:1px rgba(255,200,140,.1);pointer-events:none}
.q-opt{display:flex;width:100%;align-items:center;gap:.9rem;border-radius:1rem;border:1px solid rgba(244,236,221,.12);background:rgba(255,255,255,.03);padding:.9rem 1rem;text-align:left;animation:optIn .6s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(.15s + var(--i)*.08s);transition:border-color .3s,background .3s,transform .3s,box-shadow .3s}
@keyframes optIn{from{opacity:0;transform:translateY(16px)}}
.q-opt:hover{border-color:rgba(255,150,60,.45);transform:translateX(4px)}
.q-opt.sel{border-color:#FFB347;background:rgba(255,150,60,.1);box-shadow:0 0 36px -8px rgba(255,100,20,.5);transform:translateX(6px)}
.q-ltr{display:inline-flex;height:2.5rem;width:2.5rem;flex-shrink:0;align-items:center;justify-content:center;border-radius:9999px;border:1px solid rgba(244,236,221,.15);font-weight:700;color:rgba(255,255,255,.45);transition:all .3s}
.sel .q-ltr{border-color:transparent;background:linear-gradient(135deg,#FFC44C,#FF6A1F);color:#1a0a04;animation:pop .4s}
@keyframes pop{50%{transform:scale(1.25)}}
.q-ot{flex:1;color:rgba(255,255,255,.8)}.sel .q-ot{color:#FFD9A0}
.q-ck{color:#FFB347;font-weight:900;animation:pop .4s}

.q-orbit{position:relative;margin:0 auto 2rem;display:flex;height:7rem;width:7rem;align-items:center;justify-content:center;font-size:2.4rem;font-weight:900;color:#FFC44C;text-shadow:0 0 30px rgba(255,120,30,.6)}
.q-orbit i{position:absolute;inset:0;border-radius:9999px;background:conic-gradient(from 0deg,transparent 55%,#FFB347,transparent);-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 2px),#000 calc(100% - 1px));mask:radial-gradient(farthest-side,transparent calc(100% - 2px),#000 calc(100% - 1px));animation:spin 1.8s linear infinite}
.q-orbit i+i{inset:12px;opacity:.6;animation-duration:2.8s;animation-direction:reverse}
.q-bars{display:flex;height:24px;align-items:flex-end;justify-content:center;gap:5px;margin-top:2rem}
.q-bars i{width:4px;height:100%;border-radius:2px;background:#FFB347;transform-origin:bottom;animation:eq 1s ease-in-out infinite;animation-delay:calc(var(--k)*.12s)}
@keyframes eq{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}

.burst{position:absolute;left:50%;top:40%;pointer-events:none}
.burst i{position:absolute;width:6px;height:6px;border-radius:9999px;background:#FFB347;box-shadow:0 0 12px #FF6A1F;animation:burst 1.5s cubic-bezier(.1,.8,.2,1) var(--dl) both}
@keyframes burst{0%{transform:rotate(var(--a)) translateX(0) scale(1);opacity:1}100%{transform:rotate(var(--a)) translateX(var(--r)) scale(.2);opacity:0}}
.q-gauge{position:relative;margin:1.5rem auto 0;height:11rem;width:11rem}
.q-gauge svg{position:absolute;inset:0;transform:rotate(-90deg)}
.g-bg{fill:none;stroke:rgba(255,255,255,.08);stroke-width:7}
.g-fg{fill:none;stroke-width:7;stroke-linecap:round;stroke-dasharray:339.3;animation:gauge 1.8s cubic-bezier(.2,.7,.2,1) .3s both;filter:drop-shadow(0 0 8px rgba(255,120,30,.7))}
@keyframes gauge{from{stroke-dashoffset:339.3}}
.g-num{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:3.2rem;font-weight:900;color:#FFC44C}
.g-num span{font-size:1.4rem;color:rgba(255,255,255,.3)}
.pp{position:relative;overflow:hidden;border-radius:2rem;border:1px solid rgba(255,196,76,.32);padding:2rem;background:linear-gradient(135deg,rgba(44,22,8,.92),rgba(10,5,3,.96));transform:perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));transition:transform .25s ease-out;box-shadow:0 30px 70px -30px rgba(255,100,20,.35)}
.pp::before{content:"";position:absolute;inset:0;pointer-events:none;background:repeating-radial-gradient(circle at 100% 0,transparent 0 10px,rgba(255,196,76,.05) 10px 11px)}
.pp::after{content:"";position:absolute;inset:0;pointer-events:none;mix-blend-mode:color-dodge;opacity:.5;background:linear-gradient(115deg,transparent 30%,rgba(255,200,120,.35) 45%,rgba(255,120,200,.2) 50%,rgba(120,220,255,.25) 55%,transparent 70%);background-size:250% 100%;background-position:var(--mx,50%) 0;transition:background-position .2s}
.pp>*{position:relative;z-index:1}

.lb-p{border-radius:1.5rem;border:1px solid rgba(244,236,221,.12);background:rgba(8,4,3,.66);backdrop-filter:blur(12px);padding:1.5rem;text-align:center;transition:transform .4s,border-color .4s}
.lb-p:hover{transform:translateY(-4px)}
.lb-p.m1{border-color:rgba(255,196,76,.55);box-shadow:0 0 60px -12px rgba(255,120,20,.45);padding-block:2.25rem}
.lb-rk{font-size:3rem;font-weight:900;line-height:1}
.m1 .lb-rk{color:#FFC44C}.m2 .lb-rk{color:#D8DCE3}.m3 .lb-rk{color:#E0925A}
.crown{display:block;margin:0 auto .4rem;height:2rem;width:2rem;color:#FFC44C;filter:drop-shadow(0 0 10px rgba(255,160,40,.7));animation:float 3s ease-in-out infinite}
@keyframes float{50%{transform:translateY(-5px)}}
.lb-av{position:relative;display:flex;height:2.75rem;width:2.75rem;flex-shrink:0;align-items:center;justify-content:center;overflow:hidden;border-radius:9999px;background:rgba(255,150,60,.12);font-weight:700;color:#FFB347}
.lb-av.lg{height:4rem;width:4rem;margin:.9rem auto 0;font-size:1.4rem}
.lb-av img{position:absolute;inset:0;height:100%;width:100%;object-fit:cover}
.lb-r{display:flex;align-items:center;gap:1rem;border-radius:1rem;border:1px solid rgba(244,236,221,.1);background:rgba(8,4,3,.62);padding:1rem;transition:border-color .3s,transform .3s}
.lb-r:hover{border-color:rgba(255,150,60,.45);transform:translateX(4px)}

@media (prefers-reduced-motion:reduce){
.grain{display:none}
.q-letter,.q-in,.q-opt,.bgx,.embers i,.ringb::after,.q-go::after,.shim,.burst i,.g-fg,.crown,.q-bars i,.q-orbit i,.danger .qz-veil::after,.q-timer.low{animation:none!important}
.bgx:first-child{opacity:1}
.qr{opacity:1;transform:none;transition:none}
}
`;
