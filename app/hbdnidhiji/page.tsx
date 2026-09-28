"use client";

import { useEffect, useMemo, useState } from "react";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
};

const DAY = 24 * 60 * 60 * 1000;

function getNextBirthday() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const thisYear = new Date(
    `${currentYear}-07-19T00:00:00+05:30`
  ).getTime();

  return Date.now() < thisYear + DAY
    ? thisYear
    : new Date(`${currentYear + 1}-07-19T00:00:00+05:30`).getTime();
}

function getTimeLeft(target: number): TimeLeft {
  const total = Math.max(0, target - Date.now());
  return {
    total,
    days: Math.floor(total / DAY),
    hours: Math.floor((total % DAY) / 3600000),
    minutes: Math.floor((total % 3600000) / 60000),
    seconds: Math.floor((total % 60000) / 1000),
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function NidhiBirthdayPage() {
  // Keep the first render identical on server and browser.
  // The countdown is populated after hydration to avoid React hydration errors.
  const target = useMemo(
    () => new Date("2027-07-19T00:00:00+05:30").getTime(),
    []
  );
  const [time, setTime] = useState<TimeLeft>({
    total: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [opened, setOpened] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [wished, setWished] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [letterOpen, setLetterOpen] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [activeMemory, setActiveMemory] = useState(0);
  const [mouse, setMouse] = useState({ x: 50, y: 50 });

  const targetDate = new Date(target);
  const year = targetDate.getFullYear();

  useEffect(() => {
    setHydrated(true);

    const update = () => {
      const next = getTimeLeft(target);
      setTime(next);
      if (next.total <= 0) setOpened(true);
    };

    update();
    const timer = window.setInterval(update, 250);

    return () => window.clearInterval(timer);
  }, [target]);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  const stars = useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => ({
        id: i,
        left: (i * 37.7) % 100,
        top: (i * 61.3) % 100,
        size: 1 + (i % 3),
        delay: (i % 11) * 0.45,
      })),
    []
  );

  const petals = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: (i * 29.1) % 100,
        delay: (i % 10) * 0.9,
        duration: 8 + (i % 6),
        rotate: (i * 43) % 360,
      })),
    []
  );

  const confetti = useMemo(
    () =>
      Array.from({ length: 120 }, (_, i) => ({
        id: i,
        left: (i * 17.3) % 100,
        delay: (i % 24) * 0.055,
        duration: 3 + (i % 8) * 0.35,
        rotate: (i * 41) % 360,
      })),
    []
  );

  const progress = Math.min(
    100,
    Math.max(1, ((365 * DAY - time.total) / (365 * DAY)) * 100)
  );

  if (!hydrated) {
    return (
      <main
        className="nidhi"
        style={
          {
            "--mx": `${mouse.x}%`,
            "--my": `${mouse.y}%`,
          } as React.CSSProperties
        }
      >
        <Ambient stars={stars} />
        <div className="cursor-light" />
        <section className="countdown-page hydration-screen">
          <div className="countdown-top">
            <span className="tiny-orb" />
            A PRIVATE COUNTDOWN FOR NIDHI JI
            <span className="tiny-orb" />
          </div>
          <div className="countdown-orbit">
            <div className="ring ring-a" />
            <div className="ring ring-b" />
            <div className="ring ring-c" />
            <div className="countdown-core">
              <span>THE</span>
              <strong>17</strong>
              <small>CHAPTER</small>
            </div>
          </div>
          <div className="countdown-heading">
            <p>PREPARING YOUR SURPRISE</p>
            <h1>Nidhi&apos;s<br /><em>beautiful day.</em></h1>
          </div>
        </section>
        <style jsx global>{styles}</style>
      </main>
    );
  }

  if (!opened) {
    return (
      <main
        className="nidhi"
        style={
          {
            "--mx": `${mouse.x}%`,
            "--my": `${mouse.y}%`,
          } as React.CSSProperties
        }
      >
        <Ambient stars={stars} />
        <div className="cursor-light" />

        <section className="countdown-page">
          <div className="countdown-top">
            <span className="tiny-orb" />
            A PRIVATE COUNTDOWN FOR NIDHI JI
            <span className="tiny-orb" />
          </div>

          <div className="countdown-orbit">
            <div className="ring ring-a" />
            <div className="ring ring-b" />
            <div className="ring ring-c" />
            <div className="ring-dot dot-a" />
            <div className="ring-dot dot-b" />
            <div className="countdown-core">
              <span>THE</span>
              <strong>17</strong>
              <small>CHAPTER</small>
            </div>
          </div>

          <div className="countdown-heading">
            <p>THE CLOCK IS WAITING</p>
            <h1>
              Nidhi&apos;s
              <br />
              <em>beautiful day.</em>
            </h1>
            <div className="heading-rule" />
            <span>
              19 JULY {year} <i>·</i> A DAY MADE A LITTLE MORE SPECIAL
            </span>
          </div>

          <div className="timer">
            <TimerCell value={time.days} label="DAYS" />
            <TimerCell value={time.hours} label="HOURS" />
            <TimerCell value={time.minutes} label="MINUTES" />
            <TimerCell value={time.seconds} label="SECONDS" />
          </div>

          <div className="progress-area">
            <div className="progress-line">
              <span style={{ width: `${progress}%` }} />
            </div>
            <div>
              <span>COUNTDOWN IN PROGRESS</span>
              <b>{Math.round(progress)}%</b>
            </div>
          </div>

          <div className="countdown-footer">
            <span>✦</span>
            <p>When the clock reaches zero, the celebration begins.</p>
            <span>✦</span>
          </div>
        </section>

        <style jsx global>{styles}</style>
      </main>
    );
  }

  return (
    <main
      className="nidhi birthday-mode"
      style={
        {
          "--mx": `${mouse.x}%`,
          "--my": `${mouse.y}%`,
        } as React.CSSProperties
      }
    >
      <Ambient stars={stars} />
      <div className="cursor-light" />

      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />

      <div className="petals">
        {petals.map((p) => (
          <span
            className="petal"
            key={p.id}
            style={{
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              transform: `rotate(${p.rotate}deg)`,
            }}
          />
        ))}
      </div>

      <div className="confetti">
        {wished &&
          confetti.map((c) => (
            <span
              key={c.id}
              style={{
                left: `${c.left}%`,
                animationDelay: `${c.delay}s`,
                animationDuration: `${c.duration}s`,
                transform: `rotate(${c.rotate}deg)`,
              }}
            />
          ))}
      </div>

      <button
        className={`sound-button ${musicOn ? "active" : ""}`}
        onClick={() => setMusicOn((v) => !v)}
        aria-label="Toggle music"
      >
        <span>{musicOn ? "♪" : "♫"}</span>
        {musicOn ? " SOUND ON" : " SOUND"}
      </button>

      <section className="hero" id="top">
        <div className="hero-badge">
          <span>✦</span> IT&apos;S YOUR DAY <span>✦</span>
        </div>

        <p className="date-line">17 · JULY · {year}</p>

        <h1>
          Happy Birthday
          <br />
          <em>Nidhi Ji</em>
        </h1>

        <p className="hero-copy">
          May this new chapter bring beautiful surprises,
          <br className="desktop-only" />
          peaceful moments, genuine smiles and everything you wish for.
        </p>

        <div className="hero-divider">
          <i />
          <span>✦</span>
          <i />
        </div>

        <Cake />

        <button
          className={`wish-button ${wished ? "wished" : ""}`}
          onClick={() => setWished(true)}
        >
          <span>{wished ? "WISH SENT ✦" : "MAKE A WISH"}</span>
          {!wished && <i>→</i>}
        </button>

        <a className="scroll-cue" href="#letter">
          <span>SCROLL TO OPEN YOUR LITTLE SURPRISE</span>
          <b>↓</b>
        </a>
      </section>

      <section className="chapter-section" id="letter">
        <div className="section-number">01</div>
        <div className="section-label">A LITTLE LETTER</div>
        <div className="letter-layout">
          <div className="section-title">
            <p>FROM THIS LITTLE PAGE</p>
            <h2>
              A few words,
              <br />
              <em>just for you.</em>
            </h2>
          </div>

          <div className={`letter-card ${letterOpen ? "open" : ""}`}>
            <div className="letter-top">
              <span>FOR NIDHI JI</span>
              <b>17 / 07</b>
            </div>
            <div className="letter-seal">N</div>
            <p className="letter-preview">
              There are some wishes that deserve more than a simple “Happy
              Birthday”...
            </p>
            <button onClick={() => setLetterOpen(true)}>
              {letterOpen ? "THE LETTER IS OPEN" : "OPEN THE LETTER →"}
            </button>
            {letterOpen && (
              <div className="letter-full">
                <p>Dear Nidhi Ji,</p>
                <p>
                  Today is a reminder that another beautiful chapter has
                  arrived. I hope this year gives you countless reasons to
                  smile, people who make ordinary days feel special, and
                  moments you will want to remember for a long time.
                </p>
                <p>
                  May your wishes find their way to you, one by one. May the
                  difficult days become lighter and the good days become
                  unforgettable.
                </p>
                <p className="signature">
                  With lots of good wishes,
                  <br />
                  <em>from this little birthday universe ✦</em>
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="chapter-section memories" id="memories">
        <div className="section-number">02</div>
        <div className="section-label">THE MEMORY WALL</div>

        <div className="memory-heading">
          <p>EVERY BEAUTIFUL STORY HAS ITS MOMENTS</p>
          <h2>
            Little moments.
            <br />
            <em>Big memories.</em>
          </h2>
        </div>

        <div className="memory-grid">
          {["A smile worth remembering", "A day to keep forever", "More chapters to come"].map(
            (title, i) => (
              <button
                key={title}
                className={`memory-card memory-${i + 1} ${
                  activeMemory === i ? "selected" : ""
                }`}
                onClick={() => setActiveMemory(i)}
              >
                <span>0{i + 1}</span>
                <div>
                  <small>MEMORY {i + 1}</small>
                  <h3>{title}</h3>
                  <p>
                    {i === activeMemory
                      ? "This little frame is glowing because you selected it."
                      : "Click to bring this memory into focus."}
                  </p>
                </div>
                <b>↗</b>
              </button>
            )
          )}
        </div>

        <div className="memory-caption">
          <span>✦</span>
          <p>Replace these frames with your favourite photos whenever you want.</p>
          <span>✦</span>
        </div>
      </section>

      <section className="chapter-section gift-section" id="gift">
        <div className="section-number">03</div>
        <div className="section-label">ONE LAST SURPRISE</div>

        <div className="gift-heading">
          <p>YOU MADE IT THIS FAR</p>
          <h2>
            There&apos;s still
            <br />
            <em>one little gift.</em>
          </h2>
        </div>

        <div className={`gift-wrap ${giftOpen ? "is-open" : ""}`}>
          <div className="gift-shadow" />
          <div className="gift-lid">
            <span />
          </div>
          <div className="gift-box">
            <i className="ribbon-v" />
            <i className="ribbon-h" />
          </div>
          <div className="gift-bow">
            <i />
            <i />
            <b />
          </div>
          {giftOpen && (
            <div className="gift-message">
              <span>✦</span>
              <strong>You deserve beautiful things.</strong>
              <p>Not just today. Every single day.</p>
              <span>✦</span>
            </div>
          )}
        </div>

        <button className="gift-button" onClick={() => setGiftOpen(true)}>
          {giftOpen ? "GIFT OPENED ✦" : "OPEN THE GIFT"}
        </button>
      </section>

      <section className="final-section">
        <div className="final-stars">✦　✧　✦</div>
        <p>19 JULY · {year}</p>
        <h2>
          This day
          <br />
          <em>is yours.</em>
        </h2>
        <div className="final-line" />
        <p className="final-message">
          Happy Birthday, Nidhi Ji.
          <br />
          May the next chapter be even more beautiful than the last.
        </p>

        <button
          className="final-wish"
          onClick={() => {
            setWished(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          BACK TO THE BEGINNING ↑
        </button>

        <div className="footer-mark">
          <span>N</span>
          <small>A BIRTHDAY UNIVERSE · {year}</small>
        </div>
      </section>

      <style jsx global>{styles}</style>
    </main>
  );
}

function TimerCell({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="timer-cell">
      <strong>{pad(value)}</strong>
      <span>{label}</span>
    </div>
  );
}

function Ambient({
  stars,
}: {
  stars: { id: number; left: number; top: number; size: number; delay: number }[];
}) {
  return (
    <>
      <div className="grain" />
      <div className="stars">
        {stars.map((s) => (
          <span
            key={s.id}
            className="star"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}

function Cake() {
  return (
    <div className="real-cake-stage" aria-label="Realistic 3D birthday cake">
      <div className="cake-light" />
      <div className="cake-shadow" />

      <div className="real-cake">
        <div className="cake-candles">
          {[0, 1, 2, 3, 4].map((i) => (
            <div className="real-candle" key={i}>
              <div className="wick" />
              <div className="real-flame">
                <span />
              </div>
              <div className="candle-body" />
              <div className="candle-highlight" />
            </div>
          ))}
        </div>

        <div className="cake-top-surface">
          <div className="frosting-pool" />
          <span className="strawberry berry-one" />
          <span className="strawberry berry-two" />
          <span className="strawberry berry-three" />
          <span className="berry-leaf leaf-one" />
          <span className="berry-leaf leaf-two" />
          <span className="berry-leaf leaf-three" />
          <div className="cream-swirl swirl-one" />
          <div className="cream-swirl swirl-two" />
          <div className="cream-swirl swirl-three" />
          <div className="cake-letter">N</div>
        </div>

        <div className="cake-layer layer-upper">
          <div className="frosting-drip drip-one" />
          <div className="frosting-drip drip-two" />
          <div className="frosting-drip drip-three" />
          <div className="frosting-drip drip-four" />
          <div className="layer-highlight" />
        </div>

        <div className="cake-layer layer-lower">
          <div className="lower-cream-band" />
          <div className="cake-decoration dec-one" />
          <div className="cake-decoration dec-two" />
          <div className="cake-decoration dec-three" />
          <div className="layer-highlight" />
        </div>

        <div className="cake-base">
          <div className="base-highlight" />
        </div>

        <div className="cake-board">
          <div className="board-highlight" />
        </div>
      </div>
    </div>
  );
}

const styles = `
*{box-sizing:border-box}
html{scroll-behavior:smooth}
html,body{margin:0;padding:0;background:#09070a;color:#f8eee9}
body{overflow-x:hidden}
button{font:inherit}
a{text-decoration:none;color:inherit}

.nidhi{
  --gold:#e7bc8b;
  --gold2:#f7dfc1;
  --rose:#c78982;
  --cream:#fff8f0;
  --ink:#09070a;
  position:relative;
  min-height:100svh;
  overflow:hidden;
  background:
    radial-gradient(circle at 50% 15%,rgba(124,72,67,.20),transparent 32%),
    radial-gradient(circle at 0% 70%,rgba(193,124,90,.08),transparent 30%),
    #09070a;
  color:#f8eee9;
  font-family:Georgia,"Times New Roman",serif;
}

.cursor-light{
  position:fixed;
  z-index:2;
  left:var(--mx);
  top:var(--my);
  width:380px;
  height:380px;
  transform:translate(-50%,-50%);
  pointer-events:none;
  border-radius:50%;
  background:radial-gradient(circle,rgba(224,171,122,.12),transparent 68%);
  filter:blur(4px);
  transition:left .22s ease,top .22s ease;
}

.grain{
  position:fixed;
  inset:0;
  z-index:50;
  pointer-events:none;
  opacity:.045;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.8'/%3E%3C/svg%3E");
  mix-blend-mode:soft-light;
}

.stars{position:fixed;inset:0;z-index:1;pointer-events:none}
.star{
  position:absolute;
  display:block;
  border-radius:50%;
  background:#fff1dc;
  box-shadow:0 0 11px rgba(255,220,178,.9);
  animation:twinkle 3.5s ease-in-out infinite;
}

.hydration-screen{animation:softIn .35s ease both}
.countdown-page{
  position:relative;
  z-index:3;
  min-height:100svh;
  display:flex;
  align-items:center;
  flex-direction:column;
  justify-content:center;
  padding:80px 20px 45px;
  text-align:center;
}

.countdown-top{
  position:absolute;
  top:28px;
  display:flex;
  align-items:center;
  gap:11px;
  color:rgba(255,235,213,.50);
  font-family:Arial,sans-serif;
  font-size:8px;
  font-weight:700;
  letter-spacing:.31em;
}

.tiny-orb{
  width:4px;height:4px;border-radius:50%;
  background:var(--gold);
  box-shadow:0 0 12px var(--gold);
}

.countdown-orbit{
  position:relative;
  width:min(250px,65vw);
  aspect-ratio:1;
  margin-bottom:20px;
}

.ring{
  position:absolute;
  inset:0;
  border:1px solid rgba(231,188,139,.16);
  border-radius:50%;
}
.ring-a{animation:spin 22s linear infinite}
.ring-b{inset:12%;border-style:dashed;animation:spinReverse 15s linear infinite}
.ring-c{inset:25%;border-color:rgba(231,188,139,.28)}
.ring-dot{
  position:absolute;
  width:7px;height:7px;border-radius:50%;
  background:var(--gold);
  box-shadow:0 0 20px var(--gold);
}
.dot-a{left:8%;top:47%}
.dot-b{right:8%;top:47%;animation:pulse 2s infinite}

.countdown-core{
  position:absolute;
  inset:34%;
  display:flex;
  align-items:center;
  justify-content:center;
  flex-direction:column;
  border:1px solid rgba(247,223,193,.3);
  border-radius:50%;
  background:radial-gradient(circle,#2a1919,#100a0c 70%);
  box-shadow:0 0 55px rgba(212,153,113,.13),inset 0 0 35px rgba(255,220,180,.05);
}
.countdown-core span,.countdown-core small{
  color:rgba(255,238,220,.52);
  font-family:Arial,sans-serif;
  font-size:7px;
  font-weight:700;
  letter-spacing:.28em;
}
.countdown-core strong{
  color:var(--gold2);
  font-family:Arial,sans-serif;
  font-size:50px;
  line-height:.9;
  font-weight:200;
  letter-spacing:-.08em;
  margin:2px 0 5px;
}

.countdown-heading p,.section-label,.section-title>p,.memory-heading>p,.gift-heading>p{
  margin:0 0 13px;
  color:var(--gold);
  font-family:Arial,sans-serif;
  font-size:9px;
  font-weight:700;
  letter-spacing:.38em;
}
.countdown-heading h1{
  margin:0;
  color:var(--cream);
  font-size:clamp(48px,9vw,86px);
  font-weight:400;
  line-height:.87;
  letter-spacing:-.055em;
}
.countdown-heading h1 em{
  color:var(--rose);
  font-weight:400;
}
.heading-rule{
  width:75px;height:1px;margin:20px auto 13px;
  background:linear-gradient(90deg,transparent,var(--gold),transparent);
}
.countdown-heading>span{
  color:rgba(255,236,216,.38);
  font-family:Arial,sans-serif;
  font-size:7px;
  letter-spacing:.22em;
}
.countdown-heading>span i{color:var(--gold);font-style:normal;margin:0 8px}

.timer{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  width:min(680px,94vw);
  margin-top:34px;
  border-top:1px solid rgba(231,188,139,.17);
  border-bottom:1px solid rgba(231,188,139,.17);
}
.timer-cell{padding:18px 10px}
.timer-cell+.timer-cell{border-left:1px solid rgba(231,188,139,.11)}
.timer-cell strong{
  display:block;
  color:#f4dbc1;
  font-family:Arial,sans-serif;
  font-size:clamp(27px,5vw,43px);
  font-weight:200;
  letter-spacing:-.06em;
}
.timer-cell span{
  display:block;
  margin-top:5px;
  color:rgba(255,237,217,.32);
  font-family:Arial,sans-serif;
  font-size:7px;
  font-weight:700;
  letter-spacing:.25em;
}

.progress-area{width:min(680px,94vw);margin-top:20px;text-align:left}
.progress-line{height:1px;background:rgba(255,255,255,.08);overflow:hidden}
.progress-line span{
  display:block;height:100%;
  background:linear-gradient(90deg,#9c625c,#efc28f);
  box-shadow:0 0 14px rgba(231,188,139,.65);
  transition:width .4s ease;
}
.progress-area>div:last-child{
  display:flex;justify-content:space-between;margin-top:8px;
  color:rgba(255,237,217,.24);
  font:7px Arial,sans-serif;letter-spacing:.22em
}
.progress-area b{color:rgba(255,224,193,.52);font-weight:500}
.countdown-footer{
  position:absolute;bottom:22px;
  display:flex;align-items:center;gap:13px;
  color:rgba(255,237,218,.25);
  font:8px Arial,sans-serif;letter-spacing:.12em;
}
.countdown-footer span{color:var(--gold)}
.countdown-footer p{margin:0}

.birthday-mode{background:
  radial-gradient(circle at 50% 18%,rgba(132,73,68,.23),transparent 33%),
  radial-gradient(circle at 90% 70%,rgba(205,143,99,.10),transparent 27%),
  #09070a;
}
.aurora{
  position:absolute;
  z-index:0;
  width:58vw;height:58vw;
  border-radius:50%;
  filter:blur(85px);
  opacity:.13;
  pointer-events:none;
}
.aurora-one{left:-25%;top:0;background:#bd766e;animation:drift 12s ease-in-out infinite alternate}
.aurora-two{right:-25%;bottom:-12%;background:#e2aa76;animation:drift 16s ease-in-out infinite alternate-reverse}

.petal{
  position:fixed;
  top:-30px;
  z-index:5;
  width:9px;height:15px;
  border-radius:70% 20% 70% 20%;
  background:linear-gradient(135deg,#dc9d94,#814a53);
  opacity:.55;
  pointer-events:none;
  animation:fall linear infinite;
}
.confetti{position:fixed;inset:0;z-index:30;pointer-events:none;overflow:hidden}
.confetti span{
  position:absolute;top:-25px;width:6px;height:13px;border-radius:2px;
  background:#e7bc8b;animation:confettiFall linear forwards;
}
.confetti span:nth-child(3n){background:#d18a82}
.confetti span:nth-child(4n){background:#fff0d7}

.sound-button{
  position:fixed;z-index:40;right:20px;top:20px;
  display:flex;align-items:center;gap:7px;
  padding:9px 12px;border:1px solid rgba(231,188,139,.22);
  border-radius:999px;color:rgba(255,236,216,.48);
  background:rgba(15,10,12,.55);backdrop-filter:blur(14px);
  cursor:pointer;font:8px Arial,sans-serif;letter-spacing:.16em;
}
.sound-button span{color:var(--gold);font-size:12px}
.sound-button.active{color:var(--gold2);border-color:rgba(231,188,139,.48)}

.hero{
  position:relative;z-index:3;min-height:100svh;
  display:flex;align-items:center;justify-content:center;
  flex-direction:column;padding:80px 20px 55px;text-align:center;
}
.hero-badge{
  display:flex;align-items:center;gap:12px;
  padding:9px 15px;border:1px solid rgba(231,188,139,.24);
  border-radius:999px;background:rgba(255,255,255,.025);
  color:rgba(255,236,216,.64);
  font:8px Arial,sans-serif;font-weight:700;letter-spacing:.29em;
  backdrop-filter:blur(10px);
}
.hero-badge span{color:var(--gold)}
.date-line{
  margin:27px 0 11px;color:var(--gold);
  font:9px Arial,sans-serif;font-weight:700;letter-spacing:.4em;
}
.hero h1{
  margin:0;color:#fff7ef;
  font-size:clamp(57px,10vw,110px);
  font-weight:400;line-height:.80;letter-spacing:-.065em;
  text-shadow:0 18px 60px rgba(0,0,0,.45);
}
.hero h1 em{color:#d2968c;font-weight:400}
.hero-copy{
  margin:25px 0 0;color:rgba(255,241,226,.58);
  font:12px/1.8 Arial,sans-serif;
}
.hero-divider{
  display:flex;align-items:center;gap:14px;margin:20px 0 0;
}
.hero-divider i{width:45px;height:1px;background:linear-gradient(90deg,transparent,rgba(231,188,139,.4))}
.hero-divider i:last-child{background:linear-gradient(90deg,rgba(231,188,139,.4),transparent)}
.hero-divider span{color:var(--gold);font-size:11px}

.cake-stage{position:relative;width:350px;height:235px;margin:-3px auto -5px}
.cake-glow{
  position:absolute;left:50%;top:55%;width:270px;height:160px;
  transform:translate(-50%,-50%);border-radius:50%;
  background:rgba(225,163,111,.14);filter:blur(42px);
}
.cake{position:absolute;left:50%;top:52px;width:235px;height:155px;transform:translateX(-50%)}
.cake-top,.cake-middle,.cake-bottom{
  position:absolute;left:50%;transform:translateX(-50%);
  width:100%;border:1px solid rgba(255,228,194,.22)
}
.cake-top{
  top:25px;height:36px;border-radius:50%;
  background:linear-gradient(180deg,#efd0af,#bb7d6d);
  box-shadow:0 8px 20px rgba(0,0,0,.3)
}
.cake-middle{
  top:43px;height:52px;border-radius:0 0 17px 17px;
  background:linear-gradient(90deg,#975a58,#d8a07e,#975a58)
}
.cake-bottom{
  top:89px;height:46px;border-radius:0 0 22px 22px;
  background:linear-gradient(90deg,#5a3036,#a86464,#5a3036);
  box-shadow:0 17px 35px rgba(0,0,0,.4)
}
.cake-top:after,.cake-middle:after,.cake-bottom:after{
  content:"";position:absolute;left:0;right:0;bottom:5px;height:5px;
  opacity:.45;background:radial-gradient(circle,#ffe7c7 0 2px,transparent 3px) 0 0/18px 10px
}
.cake-top i{
  position:absolute;top:17px;width:31px;height:14px;border-radius:50%;
  background:#fff0dc;box-shadow:0 2px 7px rgba(0,0,0,.18)
}
.cake-top i:nth-child(1){left:27px}
.cake-top i:nth-child(2){left:102px}
.cake-top i:nth-child(3){right:27px}
.cake-top b{
  position:absolute;left:50%;top:7px;transform:translateX(-50%);
  color:#fff4df;font-size:14px
}
.cake-middle span,.cake-bottom span{
  position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
  color:rgba(255,240,220,.72);font:8px Arial,sans-serif;font-weight:700;letter-spacing:.28em
}
.cake-plate{
  position:absolute;left:50%;bottom:0;width:275px;height:20px;
  transform:translateX(-50%);border-radius:50%;
  background:linear-gradient(#d7a27f,#70484b);box-shadow:0 14px 30px rgba(0,0,0,.45)
}
.candles{
  position:absolute;z-index:5;left:50%;top:0;
  display:flex;gap:20px;transform:translateX(-50%)
}
.candle{
  position:relative;width:8px;height:34px;border-radius:2px;
  background:repeating-linear-gradient(-45deg,#e5b985 0 4px,#fff0d8 4px 7px)
}
.candle b{
  position:absolute;left:50%;top:-17px;width:10px;height:17px;
  transform:translateX(-50%);border-radius:50%;
  background:#ffd487;box-shadow:0 0 10px #ffc66e,0 0 24px rgba(255,180,85,.75);
  animation:flame .8s ease-in-out infinite alternate
}
.candle b:after{
  content:"";position:absolute;left:3px;bottom:3px;width:4px;height:8px;
  border-radius:50%;background:#fff9d9
}

.wish-button{
  display:inline-flex;align-items:center;gap:30px;padding:14px 18px 14px 22px;
  border:1px solid rgba(236,192,148,.35);border-radius:999px;
  color:#1a1110;background:linear-gradient(120deg,#efc499,#fff0dc);
  box-shadow:0 15px 45px rgba(216,159,111,.15);cursor:pointer;
  transition:.3s ease;
}
.wish-button:hover{transform:translateY(-3px);box-shadow:0 20px 60px rgba(216,159,111,.28)}
.wish-button span{font:9px Arial,sans-serif;font-weight:800;letter-spacing:.2em}
.wish-button i{
  display:grid;width:27px;height:27px;place-items:center;border-radius:50%;
  color:#fff;background:#5f3939;font-style:normal
}
.wish-button.wished{background:linear-gradient(120deg,#dba87c,#f5d8b7)}

.scroll-cue{
  position:absolute;bottom:24px;display:flex;align-items:center;flex-direction:column;gap:8px;
  color:rgba(255,236,216,.25);font:7px Arial,sans-serif;letter-spacing:.22em
}
.scroll-cue b{font-size:15px;font-weight:400;color:var(--gold);animation:bounce 1.7s infinite}

.chapter-section{
  position:relative;z-index:3;min-height:100svh;
  max-width:1120px;margin:auto;padding:130px 30px;
}
.section-number{
  position:absolute;left:30px;top:70px;color:rgba(231,188,139,.25);
  font:9px Arial,sans-serif;letter-spacing:.25em
}
.section-label{
  text-align:center;margin-bottom:15px
}
.letter-layout{
  display:grid;grid-template-columns:1fr 1fr;gap:70px;align-items:center;
  margin-top:40px
}
.section-title h2,.memory-heading h2,.gift-heading h2{
  margin:0;color:#fff7ef;font-size:clamp(50px,7vw,88px);
  font-weight:400;line-height:.87;letter-spacing:-.06em
}
.section-title h2 em,.memory-heading h2 em,.gift-heading h2 em{color:#c98c83;font-weight:400}
.letter-card{
  position:relative;min-height:420px;padding:35px;
  border:1px solid rgba(231,188,139,.22);border-radius:4px;
  background:linear-gradient(135deg,rgba(255,248,238,.07),rgba(255,255,255,.015));
  box-shadow:0 35px 80px rgba(0,0,0,.3);
  backdrop-filter:blur(18px);
  overflow:hidden
}
.letter-card:before{
  content:"";position:absolute;inset:12px;border:1px solid rgba(231,188,139,.08);pointer-events:none
}
.letter-top{
  display:flex;justify-content:space-between;color:rgba(255,236,216,.35);
  font:8px Arial,sans-serif;letter-spacing:.25em
}
.letter-seal{
  display:grid;width:70px;height:70px;place-items:center;margin:60px auto 25px;
  border:1px solid rgba(231,188,139,.32);border-radius:50%;
  color:var(--gold);font:30px Georgia,serif;
  box-shadow:0 0 35px rgba(231,188,139,.08)
}
.letter-preview{
  max-width:370px;margin:auto;color:rgba(255,241,226,.64);
  font-size:18px;line-height:1.55;text-align:center
}
.letter-card button{
  display:block;margin:27px auto 0;padding:11px 15px;border:1px solid rgba(231,188,139,.25);
  border-radius:999px;color:rgba(255,236,216,.7);background:transparent;
  cursor:pointer;font:8px Arial,sans-serif;letter-spacing:.18em
}
.letter-full{
  margin-top:28px;padding-top:24px;border-top:1px solid rgba(231,188,139,.12);
  color:rgba(255,241,226,.58);font:12px/1.9 Arial,sans-serif;text-align:left
}
.letter-full p{margin:0 0 14px}
.letter-full .signature{color:var(--gold2)}

.memories{min-height:auto;padding-top:90px;padding-bottom:150px}
.memory-heading{text-align:center;margin-bottom:55px}
.memory-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.memory-card{
  position:relative;min-height:320px;padding:27px;display:flex;flex-direction:column;
  justify-content:space-between;text-align:left;border:1px solid rgba(231,188,139,.15);
  color:#fff;background:
  linear-gradient(145deg,rgba(143,86,80,.17),rgba(255,255,255,.025));
  cursor:pointer;overflow:hidden;transition:.4s ease
}
.memory-card:before{
  content:"";position:absolute;width:180px;height:180px;right:-70px;top:-70px;border-radius:50%;
  background:radial-gradient(circle,rgba(231,188,139,.17),transparent 68%)
}
.memory-card:hover,.memory-card.selected{transform:translateY(-7px);border-color:rgba(231,188,139,.4);box-shadow:0 25px 60px rgba(0,0,0,.28)}
.memory-card>span{color:rgba(231,188,139,.55);font:9px Arial,sans-serif;letter-spacing:.2em}
.memory-card div small{color:var(--gold);font:7px Arial,sans-serif;letter-spacing:.2em}
.memory-card h3{max-width:240px;margin:9px 0;color:#fff3e8;font-size:28px;font-weight:400;line-height:1}
.memory-card p{max-width:250px;margin:0;color:rgba(255,236,216,.38);font:10px/1.6 Arial,sans-serif}
.memory-card>b{position:absolute;right:25px;bottom:25px;color:var(--gold);font-size:17px;font-weight:400}
.memory-2{background:linear-gradient(145deg,rgba(97,61,72,.2),rgba(255,255,255,.025))}
.memory-3{background:linear-gradient(145deg,rgba(115,81,57,.18),rgba(255,255,255,.025))}
.memory-caption{display:flex;align-items:center;justify-content:center;gap:15px;margin-top:30px;color:rgba(255,236,216,.25);font:8px Arial,sans-serif;letter-spacing:.08em;text-align:center}
.memory-caption span{color:var(--gold)}

.gift-section{text-align:center}
.gift-heading{margin-bottom:15px}
.gift-wrap{position:relative;width:310px;height:310px;margin:35px auto 10px}
.gift-shadow{
  position:absolute;left:50%;bottom:28px;width:260px;height:38px;transform:translateX(-50%);
  border-radius:50%;background:rgba(0,0,0,.55);filter:blur(18px)
}
.gift-box{
  position:absolute;left:50%;bottom:45px;width:190px;height:150px;transform:translateX(-50%);
  border:1px solid rgba(255,230,200,.22);background:linear-gradient(135deg,#a76565,#5b3037);
  box-shadow:0 35px 55px rgba(0,0,0,.4)
}
.gift-lid{
  position:absolute;z-index:3;left:50%;bottom:177px;width:215px;height:38px;transform:translateX(-50%);
  border:1px solid rgba(255,230,200,.25);background:linear-gradient(135deg,#d49a80,#75434a);
  transition:.7s cubic-bezier(.2,.8,.2,1)
}
.gift-lid span,.gift-box .ribbon-v,.gift-box .ribbon-h{position:absolute;background:rgba(239,193,142,.85)}
.gift-lid span{left:50%;top:0;width:25px;height:100%;transform:translateX(-50%)}
.ribbon-v{left:50%;top:0;width:25px;height:100%;transform:translateX(-50%)}
.ribbon-h{left:0;top:50%;width:100%;height:22px;transform:translateY(-50%)}
.gift-bow{
  position:absolute;z-index:5;left:50%;top:65px;transform:translateX(-50%);
  transition:.7s cubic-bezier(.2,.8,.2,1)
}
.gift-bow i{
  position:absolute;top:0;width:62px;height:43px;border:10px solid #e0b17e;
  border-radius:50% 50% 20% 50%
}
.gift-bow i:first-child{right:2px;transform:rotate(20deg)}
.gift-bow i:nth-child(2){left:2px;transform:scaleX(-1) rotate(20deg)}
.gift-bow b{display:block;position:relative;width:25px;height:25px;border-radius:50%;background:#f1c998}
.gift-wrap.is-open .gift-lid{transform:translate(-50%,-90px) rotate(-5deg)}
.gift-wrap.is-open .gift-bow{transform:translate(-50%,-70px) rotate(-5deg)}
.gift-message{
  position:absolute;z-index:8;left:50%;top:48%;transform:translate(-50%,-50%);
  width:250px;padding:20px;border:1px solid rgba(231,188,139,.25);
  background:rgba(19,12,14,.92);box-shadow:0 25px 70px rgba(0,0,0,.45)
}
.gift-message span{color:var(--gold)}
.gift-message strong{display:block;margin:10px 0;color:#fff1df;font-size:19px;font-weight:400}
.gift-message p{margin:0;color:rgba(255,235,214,.48);font:9px Arial,sans-serif}
.gift-button,.final-wish{
  padding:13px 19px;border:1px solid rgba(231,188,139,.3);border-radius:999px;
  color:rgba(255,236,216,.72);background:rgba(255,255,255,.025);
  cursor:pointer;font:8px Arial,sans-serif;font-weight:700;letter-spacing:.2em;
  transition:.3s ease
}
.gift-button:hover,.final-wish:hover{border-color:rgba(231,188,139,.65);transform:translateY(-2px)}

.final-section{
  position:relative;z-index:3;min-height:90svh;padding:150px 20px 60px;
  display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center;
  background:linear-gradient(180deg,transparent,rgba(100,53,50,.10))
}
.final-stars{color:var(--gold);font-size:15px;letter-spacing:.3em}
.final-section>p:first-of-type{
  margin:22px 0 13px;color:var(--gold);font:8px Arial,sans-serif;letter-spacing:.4em
}
.final-section h2{
  margin:0;color:#fff7ef;font-size:clamp(60px,10vw,110px);
  font-weight:400;line-height:.82;letter-spacing:-.07em
}
.final-section h2 em{color:#c98c83;font-weight:400}
.final-line{width:80px;height:1px;margin:28px auto;background:linear-gradient(90deg,transparent,var(--gold),transparent)}
.final-message{
  color:rgba(255,238,220,.45);font:11px/1.8 Arial,sans-serif
}
.final-wish{margin-top:30px}
.footer-mark{position:absolute;bottom:25px;display:flex;align-items:baseline;gap:8px;color:rgba(255,236,216,.25)}
.footer-mark span{font-size:20px}
.footer-mark small{font:7px Arial,sans-serif;letter-spacing:.2em}

@keyframes softIn{from{opacity:0}to{opacity:1}}
@keyframes twinkle{0%,100%{opacity:.12;transform:scale(.7)}50%{opacity:.95;transform:scale(1.3)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes spinReverse{to{transform:rotate(-360deg)}}
@keyframes pulse{0%,100%{opacity:.4;transform:scale(.8)}50%{opacity:1;transform:scale(1.3)}}
@keyframes drift{from{transform:translate(-4%,-3%) scale(.95)}to{transform:translate(5%,5%) scale(1.08)}}
@keyframes flame{from{transform:rotate(-5deg) scaleY(.93)}to{transform:rotate(5deg) scaleY(1.08)}}
@keyframes fall{0%{top:-30px;opacity:0}12%{opacity:.7}100%{top:110%;opacity:0}}
@keyframes confettiFall{0%{top:-25px;opacity:0}10%{opacity:1}100%{top:110%;opacity:0}}
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(6px)}}


/* --- REALISTIC 3D CAKE --- */
.real-cake-stage{
  position:relative;
  width:min(520px,92vw);
  height:330px;
  margin:-8px auto -10px;
  perspective:1100px;
  perspective-origin:50% 42%;
  isolation:isolate;
}
.cake-light{
  position:absolute;
  left:50%;
  top:42%;
  width:360px;
  height:220px;
  transform:translate(-50%,-50%);
  border-radius:50%;
  background:radial-gradient(ellipse,rgba(244,188,126,.25),transparent 68%);
  filter:blur(28px);
  z-index:-2;
}
.cake-shadow{
  position:absolute;
  left:50%;
  bottom:28px;
  width:360px;
  height:55px;
  transform:translateX(-50%);
  border-radius:50%;
  background:rgba(0,0,0,.58);
  filter:blur(20px);
  z-index:-1;
}
.real-cake{
  position:absolute;
  left:50%;
  bottom:35px;
  width:310px;
  height:245px;
  transform:translateX(-50%) rotateX(5deg) rotateY(-5deg);
  transform-style:preserve-3d;
  animation:cakeFloat 5s ease-in-out infinite;
}
.cake-board{
  position:absolute;
  left:50%;
  bottom:-8px;
  width:360px;
  height:25px;
  transform:translateX(-50%) translateZ(-4px);
  border-radius:50%;
  background:
    radial-gradient(ellipse at 50% 20%,#f5d8b5 0 10%,#b77958 42%,#59343a 75%);
  border:1px solid rgba(255,228,190,.35);
  box-shadow:0 13px 20px rgba(0,0,0,.42),inset 0 3px 4px rgba(255,255,255,.25);
}
.board-highlight{
  position:absolute;
  left:8%;
  top:3px;
  width:84%;
  height:5px;
  border-radius:50%;
  background:rgba(255,239,211,.28);
  filter:blur(2px);
}
.cake-base{
  position:absolute;
  left:50%;
  bottom:8px;
  width:280px;
  height:50px;
  transform:translateX(-50%) translateZ(1px);
  border-radius:12px 12px 28px 28px;
  background:
    linear-gradient(90deg,#522b30 0%,#8e4e50 13%,#bc6d64 38%,#a65b59 62%,#753d45 88%,#4a292f 100%);
  border:1px solid rgba(255,220,193,.2);
  box-shadow:0 15px 25px rgba(0,0,0,.38),inset 8px 0 12px rgba(255,255,255,.07),inset -10px 0 16px rgba(0,0,0,.22);
  overflow:hidden;
}
.base-highlight{
  position:absolute;
  left:10%;
  top:5px;
  width:80%;
  height:8px;
  border-radius:50%;
  background:linear-gradient(90deg,transparent,rgba(255,218,188,.23),transparent);
  filter:blur(1px);
}
.cake-layer{
  position:absolute;
  left:50%;
  width:270px;
  transform:translateX(-50%);
  overflow:hidden;
  border:1px solid rgba(255,227,199,.23);
}
.layer-upper{
  bottom:48px;
  height:78px;
  border-radius:8px 8px 17px 17px;
  background:
    linear-gradient(90deg,#a85e58 0%,#d58b73 16%,#e1a07f 32%,#c87568 53%,#e4a17d 70%,#9b514f 100%);
  box-shadow:inset 8px 0 13px rgba(255,255,255,.12),inset -12px 0 18px rgba(58,25,28,.23),0 10px 20px rgba(0,0,0,.2);
}
.layer-lower{
  bottom:90px;
  height:76px;
  border-radius:10px 10px 15px 15px;
  background:
    linear-gradient(90deg,#6d3a40,#a85d59 17%,#d78c70 36%,#bd7065 57%,#d99073 75%,#68363d);
  box-shadow:inset 9px 0 14px rgba(255,255,255,.09),inset -14px 0 18px rgba(40,16,20,.3);
}
.layer-highlight{
  position:absolute;
  left:3%;
  top:7px;
  width:94%;
  height:17px;
  border-radius:50%;
  background:linear-gradient(90deg,transparent,rgba(255,229,207,.2),transparent);
  filter:blur(3px);
}
.lower-cream-band{
  position:absolute;
  left:-2%;
  top:11px;
  width:104%;
  height:14px;
  border-radius:50%;
  background:linear-gradient(90deg,#fff0dc,#e8b99a 35%,#fff0dc 70%,#d99b82);
  box-shadow:0 2px 4px rgba(61,26,27,.3);
}
.frosting-drip{
  position:absolute;
  top:0;
  width:25px;
  height:34px;
  border-radius:0 0 18px 18px;
  background:linear-gradient(90deg,#fff1df,#eac0a3 50%,#c98872);
  box-shadow:inset 4px 0 5px rgba(255,255,255,.25),0 3px 4px rgba(80,33,33,.18);
}
.drip-one{left:29px;height:30px}
.drip-two{left:91px;height:45px}
.drip-three{right:83px;height:35px}
.drip-four{right:29px;height:52px}
.cake-decoration{
  position:absolute;
  top:43px;
  width:9px;
  height:9px;
  border-radius:50%;
  background:#f3c99e;
  box-shadow:0 0 5px rgba(255,218,179,.28);
}
.dec-one{left:48px}
.dec-two{left:130px}
.dec-three{right:50px}
.cake-top-surface{
  position:absolute;
  z-index:5;
  left:50%;
  top:72px;
  width:272px;
  height:66px;
  transform:translateX(-50%) translateZ(5px);
  border-radius:50%;
  border:1px solid rgba(255,235,212,.38);
  background:
    radial-gradient(ellipse at 42% 32%,#fff3df 0 4%,transparent 5%),
    radial-gradient(ellipse at 68% 44%,#f5d5b7 0 7%,transparent 8%),
    linear-gradient(135deg,#f8dec5,#d9987d 55%,#9d5a57);
  box-shadow:0 8px 13px rgba(0,0,0,.24),inset 0 5px 10px rgba(255,255,255,.35),inset 0 -10px 17px rgba(92,39,40,.15);
}
.frosting-pool{
  position:absolute;
  inset:10px 19px;
  border-radius:50%;
  border:2px solid rgba(255,240,220,.24);
  box-shadow:inset 0 4px 7px rgba(255,255,255,.23);
}
.cream-swirl{
  position:absolute;
  width:65px;
  height:21px;
  border-radius:50%;
  border-top:4px solid rgba(255,242,225,.78);
  filter:drop-shadow(0 2px 2px rgba(75,32,33,.2));
}
.swirl-one{left:25px;top:21px;transform:rotate(8deg)}
.swirl-two{left:104px;top:13px;transform:rotate(-4deg)}
.swirl-three{right:20px;top:24px;transform:rotate(8deg)}
.strawberry{
  position:absolute;
  z-index:3;
  width:19px;
  height:23px;
  border-radius:55% 55% 65% 65%;
  background:linear-gradient(135deg,#e45f5e,#8f2834);
  box-shadow:inset 4px 2px 5px rgba(255,255,255,.2),0 3px 4px rgba(80,25,30,.25);
}
.berry-one{left:57px;top:25px;transform:rotate(-13deg)}
.berry-two{left:177px;top:18px;transform:rotate(15deg)}
.berry-three{left:128px;top:38px;transform:rotate(-2deg) scale(.78)}
.strawberry:after{
  content:"";
  position:absolute;
  left:5px;
  top:8px;
  width:3px;height:3px;border-radius:50%;
  background:#ffd9b4;
  box-shadow:8px 4px 0 #ffd9b4,4px -4px 0 #ffd9b4;
}
.berry-leaf{
  position:absolute;
  z-index:4;
  width:12px;height:6px;
  border-radius:100% 0 100% 0;
  background:#627653;
}
.leaf-one{left:54px;top:20px;transform:rotate(-20deg)}
.leaf-two{left:181px;top:13px;transform:rotate(25deg)}
.leaf-three{left:125px;top:33px;transform:rotate(7deg)}
.cake-letter{
  position:absolute;
  left:50%;
  top:50%;
  transform:translate(-50%,-50%);
  color:rgba(116,58,54,.62);
  font:italic 25px Georgia,serif;
  text-shadow:0 1px 0 rgba(255,255,255,.35);
}
.cake-candles{
  position:absolute;
  z-index:15;
  left:50%;
  top:20px;
  display:flex;
  gap:24px;
  transform:translateX(-50%) translateZ(20px);
}
.real-candle{
  position:relative;
  width:10px;
  height:47px;
}
.candle-body{
  position:absolute;
  left:0;
  bottom:0;
  width:10px;
  height:42px;
  border-radius:3px;
  background:repeating-linear-gradient(115deg,#fff3d9 0 5px,#e7ae73 5px 8px,#fff4dd 8px 12px);
  box-shadow:inset 2px 0 2px rgba(255,255,255,.65),2px 3px 4px rgba(0,0,0,.3);
}
.candle-highlight{
  position:absolute;
  left:2px;
  bottom:3px;
  width:2px;
  height:34px;
  background:rgba(255,255,255,.52);
  border-radius:50%;
}
.wick{
  position:absolute;
  z-index:3;
  left:50%;
  top:-3px;
  width:2px;
  height:8px;
  transform:translateX(-50%);
  background:#392622;
}
.real-flame{
  position:absolute;
  z-index:5;
  left:50%;
  top:-24px;
  width:15px;
  height:25px;
  transform:translateX(-50%);
  border-radius:50% 50% 48% 48% / 65% 65% 40% 40%;
  background:linear-gradient(#fffbd9 8%,#ffd46e 38%,#ef8138 78%,transparent);
  box-shadow:0 0 10px #ffd77d,0 0 24px rgba(255,173,72,.72),0 0 45px rgba(255,139,53,.22);
  animation:realFlame .7s ease-in-out infinite alternate;
}
.real-flame span{
  position:absolute;
  left:4px;
  bottom:4px;
  width:7px;height:12px;
  border-radius:50%;
  background:#fffbe4;
  filter:blur(.3px);
}
@keyframes realFlame{
  from{transform:translateX(-50%) rotate(-4deg) scale(.93)}
  to{transform:translateX(-50%) rotate(5deg) scale(1.08)}
}
@keyframes cakeFloat{
  0%,100%{transform:translateX(-50%) rotateX(5deg) rotateY(-5deg) translateY(0)}
  50%{transform:translateX(-50%) rotateX(5deg) rotateY(-5deg) translateY(-5px)}
}
@media(max-width:600px){
  .real-cake-stage{transform:scale(.76);margin-top:-30px;margin-bottom:-55px}
}

@media(max-width:800px){
  .letter-layout{grid-template-columns:1fr;gap:35px}
  .memory-grid{grid-template-columns:1fr}
  .memory-card{min-height:250px}
  .chapter-section{padding:110px 20px}
  .section-number{left:20px}
}
@media(max-width:600px){
  .cursor-light{display:none}
  .sound-button{top:13px;right:13px}
  .countdown-page{padding-top:70px}
  .countdown-top{top:20px;font-size:7px;letter-spacing:.18em}
  .countdown-orbit{width:205px}
  .countdown-heading h1{font-size:45px}
  .countdown-heading>span{font-size:6px}
  .timer{grid-template-columns:repeat(2,1fr)}
  .timer-cell:nth-child(3){border-left:0;border-top:1px solid rgba(231,188,139,.11)}
  .timer-cell:nth-child(4){border-top:1px solid rgba(231,188,139,.11)}
  .countdown-footer{font-size:7px}
  .hero{padding-top:85px}
  .hero h1{font-size:clamp(48px,14vw,76px)}
  .hero-copy{font-size:10px}
  .desktop-only{display:none}
  .cake-stage{transform:scale(.83);margin-top:-15px;margin-bottom:-25px}
  .chapter-section{min-height:auto;padding:100px 17px}
  .section-title h2,.memory-heading h2,.gift-heading h2{font-size:51px}
  .letter-card{padding:25px;min-height:450px}
  .letter-preview{font-size:16px}
  .final-section{min-height:80svh}
}
@media(prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important}
}
`;