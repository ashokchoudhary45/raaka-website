"use client";

import { useEffect, useMemo, useState, type CSSProperties, type PointerEvent as RPE } from "react";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
};

const DAY = 24 * 60 * 60 * 1000;

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
const cssVars = (o: Record<string, string | number>) => o as unknown as CSSProperties;

/* tilt + spotlight vars for glass cards */
const tilt = (e: RPE<HTMLElement>) => {
  const el = e.currentTarget, r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
  el.style.setProperty("--rx", ((0.5 - y) * 7).toFixed(2) + "deg");
  el.style.setProperty("--ry", ((x - 0.5) * 9).toFixed(2) + "deg");
  el.style.setProperty("--mx", x * 100 + "%");
  el.style.setProperty("--my", y * 100 + "%");
};
const untilt = (e: RPE<HTMLElement>) => {
  e.currentTarget.style.setProperty("--rx", "0deg");
  e.currentTarget.style.setProperty("--ry", "0deg");
};

/* Happy Birthday (public domain) as [frequency, beats] */
const MELODY: [number, number][] = [
  [392, 0.75], [392, 0.25], [440, 1], [392, 1], [523, 1], [494, 2],
  [392, 0.75], [392, 0.25], [440, 1], [392, 1], [587, 1], [523, 2],
  [392, 0.75], [392, 0.25], [784, 1], [659, 1], [523, 1], [494, 1], [440, 2],
  [698, 0.75], [698, 0.25], [659, 1], [523, 1], [587, 1], [523, 2],
];

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

  /* cursor light + scroll progress (CSS variables only, no re-render) */
  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        root.style.setProperty("--cx", e.clientX + "px");
        root.style.setProperty("--cy", e.clientY + "px");
      });
    };
    const scroll = () => {
      const m = root.scrollHeight - root.clientHeight;
      root.style.setProperty("--sp", String(m > 0 ? root.scrollTop / m : 0));
    };
    scroll();
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", scroll);
    };
  }, []);

  /* scroll reveals once the birthday page is open */
  useEffect(() => {
    if (!opened) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { threshold: 0.15 }
    );
    document.querySelectorAll("[data-r]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [opened]);

  /* sound toggle plays a soft birthday melody */
  useEffect(() => {
    if (!musicOn) return;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = 0.12;
    master.connect(ctx.destination);
    const play = () => {
      let t = ctx.currentTime + 0.05;
      MELODY.forEach(([f, b]) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "triangle";
        o.frequency.value = f;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(1, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + b * 0.55);
        o.connect(g);
        g.connect(master);
        o.start(t);
        o.stop(t + b * 0.6);
        t += b * 0.55;
      });
      return t - ctx.currentTime;
    };
    const len = play();
    const loop = window.setInterval(play, (len + 2.5) * 1000);
    return () => { window.clearInterval(loop); ctx.close(); };
  }, [musicOn]);

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

  const styleTag = <style dangerouslySetInnerHTML={{ __html: styles }} />;

  /* ---------------- COUNTDOWN (before hydration + before the day) ---------------- */
  if (!hydrated || !opened) {
    return (
      <main className="nidhi">
        {styleTag}
        <Sky stars={stars} />
        <section className="cd">
          <div className="cd-top">
            <span className="tiny-orb" />
            A PRIVATE COUNTDOWN FOR NIDHI JI
            <span className="tiny-orb" />
          </div>

          <div className="orbit">
            <svg viewBox="0 0 100 100" aria-hidden="true">
              <circle className="pg-bg" cx="50" cy="50" r="48.5" />
              <circle className="pg" cx="50" cy="50" r="48.5" pathLength={100} strokeDasharray={`${hydrated ? progress : 0} 100`} />
            </svg>
            <div className="ring ring-a" />
            <div className="ring ring-b" />
            <div className="ring ring-c" />
            <div className="core">
              <span>THE</span>
              <strong>19</strong>
              <small>CHAPTER</small>
            </div>
          </div>

          <div className="cd-head">
            <p className="lbl">{hydrated ? "THE CLOCK IS WAITING" : "PREPARING YOUR SURPRISE"}</p>
            <h1 className="dp">
              <span className="ln"><span style={cssVars({ "--l": 0 })}>Nidhi&apos;s</span></span>
              <span className="ln em"><span style={cssVars({ "--l": 1 })}>beautiful day.</span></span>
            </h1>
            {hydrated && (
              <>
                <div className="rule" />
                <span className="date">
                  19 JULY {year} <i>·</i> A DAY MADE A LITTLE MORE SPECIAL
                </span>
              </>
            )}
          </div>

          {hydrated && (
            <>
              <div className="timer">
                <TimerCell value={time.days} label="DAYS" i={0} />
                <TimerCell value={time.hours} label="HOURS" i={1} />
                <TimerCell value={time.minutes} label="MINUTES" i={2} />
                <TimerCell value={time.seconds} label="SECONDS" i={3} />
              </div>
              <div className="pa">
                <div className="pl"><span style={{ width: `${progress}%` }} /></div>
                <div>
                  <span>COUNTDOWN IN PROGRESS</span>
                  <b>{Math.round(progress)}%</b>
                </div>
              </div>
              <div className="cd-foot">
                <span>✦</span>
                <p>When the clock reaches zero, the celebration begins.</p>
                <span>✦</span>
              </div>
            </>
          )}
        </section>
      </main>
    );
  }

  /* ---------------- BIRTHDAY ---------------- */
  return (
    <main className="nidhi birthday-mode">
      {styleTag}
      <Sky stars={stars} />
      <div className="sprog" aria-hidden="true" />

      <div className="petals" aria-hidden="true">
        {petals.map((p) => (
          <span
            className="petal"
            key={p.id}
            style={cssVars({ left: `${p.left}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s`, "--rot": `${p.rotate}deg` })}
          />
        ))}
      </div>

      <div className="confetti" aria-hidden="true">
        {wished &&
          confetti.map((c) => (
            <span
              key={c.id}
              style={cssVars({ left: `${c.left}%`, animationDelay: `${c.delay}s`, animationDuration: `${c.duration}s`, "--rot": `${c.rotate}deg`, "--dx": `${((c.id % 7) - 3) * 28}px`, "--c": ["#F6DDB0", "#F4A9BE", "#B7A4FF", "#fff6ea", "#ffd1a1"][c.id % 5] })}
            />
          ))}
      </div>
      {wished && <Fireworks />}

      <button
        className={`sound ${musicOn ? "active" : ""}`}
        onClick={() => setMusicOn((v) => !v)}
        aria-label="Toggle music"
      >
        <span>{musicOn ? "♪" : "♫"}</span>
        {musicOn ? " SOUND ON" : " SOUND"}
        {musicOn && <em className="eq"><i /><i /><i /><i /></em>}
      </button>

      {/* HERO */}
      <section className="hero" id="top">
        <div className="hero-badge">
          <span>✦</span> IT&apos;S YOUR DAY <span>✦</span>
        </div>
        <p className="date-line">17 · JULY · {year}</p>
        <h1 className="dp hero-h1">
          <span className="hl"><Letters text="Happy Birthday" /></span>
          <span className="hl em"><Letters text="Nidhi Ji" o={14} /></span>
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
        <Cake out={wished} />
        <button
          className={`wish ${wished ? "wished" : ""}`}
          onClick={() => setWished(true)}
        >
          <span>{wished ? "WISH SENT ✦" : "MAKE A WISH"}</span>
          {!wished && <i>→</i>}
        </button>
        <a className="cue" href="#letter">
          <span>SCROLL TO OPEN YOUR LITTLE SURPRISE</span>
          <b>↓</b>
        </a>
      </section>

      {/* LETTER */}
      <section className="sec" id="letter">
        <div className="num" aria-hidden="true">01</div>
        <div className="slabel" data-r>A LITTLE LETTER</div>
        <div className="letter-layout">
          <div className="stitle" data-r>
            <p>FROM THIS LITTLE PAGE</p>
            <h2 className="dp">
              A few words,
              <br />
              <em>just for you.</em>
            </h2>
          </div>
          <div data-r style={cssVars({ "--i": 1 })}>
            <div className={`lcard ${letterOpen ? "open" : ""}`} onPointerMove={tilt} onPointerLeave={untilt}>
              <div className="lc-top">
                <span>FOR NIDHI JI</span>
                <b>17 / 07</b>
              </div>
              <div className={`seal ${letterOpen ? "broken" : ""}`}>N</div>
              <p className="lc-prev">
                There are some wishes that deserve more than a simple “Happy
                Birthday”...
              </p>
              <button className="lbtn" onClick={() => setLetterOpen(true)}>
                {letterOpen ? "THE LETTER IS OPEN" : "OPEN THE LETTER →"}
              </button>
              {letterOpen && (
                <div className="lc-full">
                  <p style={cssVars({ "--i": 0 })}>Dear Nidhi Ji,</p>
                  <p style={cssVars({ "--i": 1 })}>
                    Today is a reminder that another beautiful chapter has
                    arrived. I hope this year gives you countless reasons to
                    smile, people who make ordinary days feel special, and
                    moments you will want to remember for a long time.
                  </p>
                  <p style={cssVars({ "--i": 2 })}>
                    May your wishes find their way to you, one by one. May the
                    difficult days become lighter and the good days become
                    unforgettable.
                  </p>
                  <p className="signature" style={cssVars({ "--i": 3 })}>
                    With lots of good wishes,
                    <br />
                    <em>Ashok Choudhary ✦</em>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* MEMORIES */}
      <section className="sec" id="memories">
        <div className="num" aria-hidden="true">02</div>
        <div className="slabel" data-r>THE MEMORY WALL</div>
        <div className="mem-head" data-r>
          <p>EVERY BEAUTIFUL STORY HAS ITS MOMENTS</p>
          <h2 className="dp">
            Little moments.
            <br />
            <em>Big memories.</em>
          </h2>
        </div>
        <div className="mem" data-r style={cssVars({ "--i": 1 })}>
          {["A smile worth remembering", "A day to keep forever", "More chapters to come"].map(
            (title, i) => (
              <button
                key={title}
                className={`mc mc-${i + 1} ${activeMemory === i ? "on" : ""}`}
                onClick={() => setActiveMemory(i)}
              >
                <i className="mc-art" />
                <span className="mc-n">0{i + 1}</span>
                <div className="mc-t">
                  <small>MEMORY {i + 1}</small>
                  <h3 className="dp">{title}</h3>
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
        <div className="mem-cap" data-r>
          <span>✦</span>
          <p>Replace these frames with your favourite photos whenever you want.</p>
          <span>✦</span>
        </div>
      </section>

      {/* GIFT */}
      <section className="sec gift-sec" id="gift">
        <div className="num" aria-hidden="true">03</div>
        <div className="slabel" data-r>ONE LAST SURPRISE</div>
        <div className="mem-head" data-r>
          <p>YOU MADE IT THIS FAR</p>
          <h2 className="dp">
            There&apos;s still
            <br />
            <em>one little gift.</em>
          </h2>
        </div>
        <div className={`gift ${giftOpen ? "is-open" : ""}`} data-r style={cssVars({ "--i": 1 })}>
          <div className="g-rays" />
          <div className="g-shadow" />
          <div className="g-box"><i className="rv" /><i className="rh" /></div>
          <div className="g-lid">
            <i className="rv" />
            <div className="g-bow"><i /><i /><b /></div>
          </div>
          {giftOpen && (
            <>
              <Burst />
              <div className="g-msg">
                <span>✦</span>
                <strong className="dp">You deserve beautiful things.</strong>
                <p>Not just today. Every single day.</p>
                <span>✦</span>
              </div>
            </>
          )}
        </div>
        <button className="gbtn" onClick={() => setGiftOpen(true)}>
          {giftOpen ? "GIFT OPENED ✦" : "OPEN THE GIFT"}
        </button>
      </section>

      {/* FINAL */}
      <section className="final">
        <div className="fstars" data-r>✦　✧　✦</div>
        <p data-r>19 JULY · {year}</p>
        <h2 className="dp" data-r style={cssVars({ "--i": 1 })}>
          This day
          <br />
          <em>is yours.</em>
        </h2>
        <div className="fline" data-r />
        <p className="fmsg" data-r style={cssVars({ "--i": 2 })}>
          Happy Birthday, Nidhi Ji.
          <br />
          May the next chapter be even more beautiful than the last.
        </p>
        <button
          className="fwish"
          onClick={() => {
            setWished(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          BACK TO THE BEGINNING ↑
        </button>
        <div className="fmark">
          <span>N</span>
          <small>A BIRTHDAY UNIVERSE · {year}</small>
        </div>
      </section>
    </main>
  );
}

function TimerCell({ value, label, i }: { value: number; label: string; i: number }) {
  return (
    <div className={"cell" + (label === "SECONDS" ? " hot" : "")} style={cssVars({ "--i": i })}>
      <strong key={value} className="flip">{pad(value)}</strong>
      <span>{label}</span>
    </div>
  );
}

function Sky({ stars }: { stars: { id: number; left: number; top: number; size: number; delay: number }[] }) {
  return (
    <>
      <div className="sky" aria-hidden="true">
        <i className="au au1" />
        <i className="au au2" />
        {stars.map((s) => (
          <span key={s.id} className="star" style={{ left: `${s.left}%`, top: `${s.top}%`, width: `${s.size}px`, height: `${s.size}px`, animationDelay: `${s.delay}s` }} />
        ))}
        {[0, 1, 2].map((k) => (
          <i key={k} className="shoot" style={cssVars({ "--t": 8 + k * 22 + "%", "--l": 55 + k * 14 + "%", "--d": k * 2.7 + "s" })} />
        ))}
      </div>
      <div className="grain" aria-hidden="true" />
      <div className="cursor-light" aria-hidden="true" />
    </>
  );
}

const Letters = ({ text, o = 0 }: { text: string; o?: number }) => {
  let n = o;
  return (
    <span aria-label={text}>
      {text.split(" ").map((w, wi) => (
        <span key={wi}>
          <span className="lw" aria-hidden="true">
            {w.split("").map((c, i) => (<span key={i} className="lt" style={cssVars({ "--i": n++ })}>{c}</span>))}
          </span>{" "}
        </span>
      ))}
    </span>
  );
};

function Burst() {
  return (
    <span className="burst" aria-hidden="true">
      {Array.from({ length: 26 }).map((_, i) => (
        <i key={i} style={cssVars({ "--a": (i * 360) / 26 + "deg", "--r": 110 + ((i * 53) % 110) + "px", "--dl": (i % 6) * 0.03 + "s" })} />
      ))}
    </span>
  );
}

function Fireworks() {
  return (
    <div className="fw" aria-hidden="true">
      {[[18, 26], [80, 20], [50, 38], [28, 64], [72, 60]].map(([x, y], b) => (
        <span key={b} className="fw-b" style={{ left: `${x}%`, top: `${y}%` }}>
          {Array.from({ length: 18 }).map((_, i) => (
            <i key={i} style={cssVars({ "--a": i * 20 + "deg", "--d": b * 0.45 + "s", "--c": ["#F6DDB0", "#F4A9BE", "#B7A4FF"][(i + b) % 3] })} />
          ))}
        </span>
      ))}
    </div>
  );
}

function Cake({ out }: { out: boolean }) {
  const xs = [118, 139, 160, 181, 202];
  return (
    <div className={"cake" + (out ? " out" : "")} aria-label="Birthday cake">
      <svg viewBox="0 0 320 270" role="img" aria-hidden="true">
        <defs>
          <linearGradient id="cr" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#E98FA8" /><stop offset=".45" stopColor="#FBC7D4" /><stop offset="1" stopColor="#D9768F" /></linearGradient>
          <linearGradient id="cm" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#F1D3B5" /><stop offset=".5" stopColor="#FFF6EA" /><stop offset="1" stopColor="#E7C4A3" /></linearGradient>
          <linearGradient id="pl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#B98A55" /><stop offset=".5" stopColor="#F6DDB0" /><stop offset="1" stopColor="#B98A55" /></linearGradient>
          <radialGradient id="fl" cx=".5" cy=".7" r=".6"><stop offset="0" stopColor="#fff" /><stop offset=".35" stopColor="#FFE08A" /><stop offset="1" stopColor="#FF8A3D" /></radialGradient>
          <radialGradient id="gl"><stop offset="0" stopColor="#FFD08A" stopOpacity=".7" /><stop offset="1" stopColor="#FFD08A" stopOpacity="0" /></radialGradient>
        </defs>
        <ellipse cx="160" cy="236" rx="146" ry="22" fill="url(#pl)" />
        <ellipse cx="160" cy="232" rx="146" ry="20" fill="#fff6ea" opacity=".16" />
        <path d="M60 172v52a100 17 0 0 0 200 0v-52z" fill="url(#cr)" />
        <ellipse cx="160" cy="172" rx="100" ry="17" fill="url(#cm)" />
        {[78, 98, 120, 142, 164, 186, 208, 230, 248].map((x, i) => (<circle key={x} className="pearl" cx={x} cy={224 + Math.sin(((x - 60) / 200) * Math.PI) * 14} r="3.4" fill="#fff6ea" style={{ animationDelay: i * 0.25 + "s" }} />))}
        <text x="160" y="212" textAnchor="middle" fontFamily="Cormorant Garamond,Georgia,serif" fontStyle="italic" fontWeight="700" fontSize="46" fill="#fff6ea" opacity=".95">N</text>
        <path d="M95 122v46a65 11 0 0 0 130 0v-46z" fill="url(#cm)" />
        <ellipse cx="160" cy="122" rx="65" ry="11" fill="#FFF6EA" />
        {[[108, 14], [134, 22], [160, 12], [188, 24], [212, 14]].map(([x, h]) => (<path key={x} d={`M${x - 7} 124v${h}a7 7 0 0 0 14 0v-${h}z`} fill="#FBC7D4" />))}
        {[[126, 124], [194, 125], [160, 129]].map(([x, y]) => (<g key={x}><circle cx={x} cy={y} r="7" fill="#E5384F" /><circle cx={x - 2} cy={y - 2} r="1.6" fill="#fff" opacity=".7" /><path d={`M${x - 5} ${y - 5}l5-5 5 5z`} fill="#4CA567" /></g>))}
        {xs.map((x, i) => (
          <g key={x}>
            <rect x={x - 3.5} y="88" width="7" height="34" rx="2" fill={i % 2 ? "#F6DDB0" : "#F4A9BE"} />
            <path d={`M${x - 3.5} 96l7 5M${x - 3.5} 106l7 5M${x - 3.5} 116l7 5`} stroke="#fff" strokeOpacity=".5" />
            <path d={`M${x} 88v-5`} stroke="#6b4a3a" strokeWidth="1.4" />
            <circle className="fg" cx={x} cy="76" r="20" fill="url(#gl)" style={{ animationDelay: i * 0.17 + "s" }} />
            <path className="fl" d={`M${x} 64c5 6 6 12 0 18-6-6-5-12 0-18z`} fill="url(#fl)" style={{ animationDelay: i * 0.11 + "s" }} />
            <path className="smoke" d={`M${x} 82c-6-10 6-16 0-28s6-14 2-24`} fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="2" strokeLinecap="round" style={{ animationDelay: i * 0.12 + "s" }} />
          </g>
        ))}
        {[[34, 90], [290, 70], [276, 150], [48, 170]].map(([x, y], i) => (<path key={x} className="spk" d={`M${x} ${y - 9}l2.5 6.5 6.5 2.5-6.5 2.5-2.5 6.5-2.5-6.5-6.5-2.5 6.5-2.5z`} fill="#F6DDB0" style={{ animationDelay: i * 0.7 + "s" }} />))}
      </svg>
    </div>
  );
}

const styles = `
@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600;1,700&family=Jost:wght@300;400;500&display=swap");
*{box-sizing:border-box}
html{scroll-behavior:smooth}
html,body{margin:0;padding:0;background:#07050F;color:#FFF6EA}
body{overflow-x:hidden}
button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}
a{text-decoration:none;color:inherit}
::selection{background:rgba(244,169,190,.4)}

.nidhi{--champ:#F6DDB0;--rose:#F4A9BE;--lilac:#B7A4FF;--disp:"Cormorant Garamond",Georgia,"Times New Roman",serif;position:relative;min-height:100svh;overflow:hidden;font-family:"Jost",ui-sans-serif,system-ui,sans-serif;font-weight:300;color:#FFF6EA}
.dp,.nidhi h1,.nidhi h2,.nidhi h3,.nidhi em{font-family:var(--disp);font-weight:600}
.nidhi em{font-style:italic}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fade{from{opacity:0}to{opacity:1}}
@keyframes rise{from{opacity:0;transform:translate3d(0,28px,0);filter:blur(8px)}to{opacity:1;transform:none;filter:none}}
@keyframes up{from{transform:translateY(112%)}to{transform:none}}
@keyframes breathe{50%{box-shadow:0 0 90px rgba(244,169,190,.4),inset 0 0 40px rgba(246,221,176,.16);transform:scale(1.03)}}
@keyframes sheen{to{background-position:-250% 0}}

/* sky */
.sky{position:fixed;inset:0;z-index:0;overflow:hidden;background:radial-gradient(ellipse at 50% 0,#2A1650 0,transparent 60%),radial-gradient(ellipse at 100% 100%,#3a1431 0,transparent 55%),#07050F}
.au{position:absolute;border-radius:50%;filter:blur(90px);opacity:.5;animation:aur 18s ease-in-out infinite alternate}
.au1{width:60vmax;height:40vmax;left:-15vmax;top:-10vmax;background:linear-gradient(135deg,rgba(183,164,255,.5),rgba(244,169,190,.3))}
.au2{width:50vmax;height:40vmax;right:-15vmax;bottom:-10vmax;background:linear-gradient(135deg,rgba(246,221,176,.28),rgba(244,169,190,.38));animation-delay:-8s}
@keyframes aur{to{transform:translate3d(8vmax,6vmax,0) scale(1.15)}}
.star{position:absolute;border-radius:50%;background:#fff6e4;box-shadow:0 0 10px rgba(255,230,190,.9);animation:tw 3.5s ease-in-out infinite}
@keyframes tw{0%,100%{opacity:.2;transform:scale(.7)}50%{opacity:1;transform:scale(1.2)}}
.shoot{position:absolute;top:var(--t);left:var(--l);width:140px;height:1px;background:linear-gradient(90deg,transparent,#fff,transparent);opacity:0;animation:shoot 8s ease-in infinite var(--d)}
@keyframes shoot{0%{opacity:0;transform:rotate(30deg) translateX(0)}3%{opacity:1}14%{opacity:0;transform:rotate(30deg) translateX(-360px)}100%{opacity:0}}
.grain{position:fixed;inset:0;z-index:50;pointer-events:none;opacity:.06;mix-blend-mode:soft-light;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
.cursor-light{position:fixed;left:0;top:0;z-index:2;width:420px;height:420px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(246,200,160,.14),transparent 68%);transform:translate3d(calc(var(--cx,50vw) - 210px),calc(var(--cy,40vh) - 210px),0);transition:transform .25s ease-out}
@media(hover:none){.cursor-light{display:none}}
.sprog{position:fixed;top:0;left:0;right:0;height:2px;z-index:60;transform-origin:left;transform:scaleX(var(--sp,0));background:linear-gradient(90deg,#B7A4FF,#F4A9BE,#F6DDB0)}

/* countdown */
.cd{position:relative;z-index:3;min-height:100svh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2.1rem;padding:5.5rem 1.25rem 3rem;text-align:center}
.cd-top{position:absolute;top:1.75rem;display:flex;align-items:center;gap:.9rem;font-size:.62rem;letter-spacing:.4em;color:rgba(246,221,176,.8);animation:fade 1.4s ease both}
.tiny-orb{width:6px;height:6px;border-radius:50%;background:var(--champ);box-shadow:0 0 12px var(--champ)}
.orbit{position:relative;width:min(68vw,290px);aspect-ratio:1;animation:rise 1.3s cubic-bezier(.2,.7,.2,1) .1s both}
.orbit svg{position:absolute;inset:-4%;width:108%;height:108%;transform:rotate(-90deg);overflow:visible}
.pg-bg{fill:none;stroke:rgba(246,221,176,.1);stroke-width:.6}
.pg{fill:none;stroke:url(#none);stroke:#F6DDB0;stroke-width:1.1;stroke-linecap:round;filter:drop-shadow(0 0 4px rgba(246,200,150,.9));transition:stroke-dasharray 1.8s cubic-bezier(.2,.7,.2,1) .5s}
.ring{position:absolute;border-radius:50%;border:1px dashed rgba(246,221,176,.25)}
.ring-a{inset:0;animation:spin 40s linear infinite}
.ring-b{inset:10%;border-style:solid;border-color:rgba(244,169,190,.22);animation:spin 28s linear infinite reverse}
.ring-c{inset:21%;border-color:rgba(183,164,255,.32);animation:spin 18s linear infinite}
.ring-a::after,.ring-c::after{content:"";position:absolute;left:50%;top:-4px;width:8px;height:8px;margin-left:-4px;border-radius:50%;background:var(--champ);box-shadow:0 0 16px 3px rgba(246,200,150,.85)}
.ring-c::after{background:var(--rose);box-shadow:0 0 16px 3px rgba(244,169,190,.85)}
.core{position:absolute;inset:28%;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle at 30% 25%,rgba(255,255,255,.16),rgba(255,255,255,.03));border:1px solid rgba(246,221,176,.3);backdrop-filter:blur(8px);box-shadow:0 0 60px rgba(244,169,190,.28),inset 0 0 30px rgba(246,221,176,.1);animation:breathe 4s ease-in-out infinite}
.core span,.core small{font-size:.5rem;letter-spacing:.4em;color:rgba(246,221,176,.85)}
.core strong{font-family:var(--disp);font-size:clamp(2.6rem,11vw,3.8rem);font-weight:600;line-height:1;background:linear-gradient(180deg,#fff,#F6DDB0 60%,#F4A9BE);-webkit-background-clip:text;background-clip:text;color:transparent}
.lbl{margin:0 0 1rem;font-size:.65rem;letter-spacing:.45em;color:var(--rose);animation:fade 1.2s ease .4s both}
.cd-head h1,.final h2,.mem-head h2,.stitle h2{margin:0;line-height:1.02;letter-spacing:-.01em}
.cd-head h1{font-size:clamp(2.8rem,10vw,5.6rem)}
.ln{display:block;overflow:hidden;padding:.06em .1em .14em}
.ln>span{display:block;animation:up 1.2s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(.5s + var(--l,0)*.15s)}
.ln.em{font-style:italic}
.ln.em>span,.nidhi h2 em,.hl.em .lt{background:linear-gradient(100deg,#F4A9BE 20%,#FFF0F3 45%,#F6DDB0 60%,#F4A9BE 85%);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation-name:up,sheen;animation-duration:1.2s,6s;animation-iteration-count:1,infinite;animation-timing-function:cubic-bezier(.2,.7,.2,1),linear}
.rule{width:5.5rem;height:1px;margin:1.4rem auto 1rem;background:linear-gradient(90deg,transparent,var(--champ),transparent);animation:rise 1s ease 1.1s both}
.date{display:block;font-size:.66rem;letter-spacing:.3em;color:rgba(255,246,234,.6);animation:fade 1.2s ease 1.3s both}
.date i{color:var(--champ);font-style:normal}
.timer{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.7rem;width:min(92vw,620px)}
.cell{position:relative;overflow:hidden;padding:1.25rem .3rem 1rem;border-radius:1.25rem;border:1px solid rgba(246,221,176,.18);background:linear-gradient(160deg,rgba(255,255,255,.08),rgba(255,255,255,.02));backdrop-filter:blur(12px);animation:rise 1s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(.9s + var(--i)*.12s)}
.cell::before{content:"";position:absolute;top:0;left:-120%;width:60%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.12),transparent);transform:skewX(-18deg);animation:glide 6s ease-in-out infinite calc(var(--i)*.5s)}
@keyframes glide{0%,60%{left:-120%}100%{left:180%}}
.cell strong{display:block;font-family:var(--disp);font-size:clamp(2rem,9vw,3.8rem);font-weight:600;line-height:1;font-variant-numeric:tabular-nums;color:#fff}
.flip{animation:flip .6s cubic-bezier(.2,.7,.2,1)}
@keyframes flip{0%{opacity:0;transform:perspective(300px) rotateX(-80deg) translateY(-20%)}100%{opacity:1;transform:none}}
.cell span{display:block;margin-top:.55rem;font-size:.5rem;letter-spacing:.3em;color:rgba(246,221,176,.7)}
.cell.hot{border-color:rgba(244,169,190,.5);animation-name:rise,hot;animation-duration:1s,2s;animation-iteration-count:1,infinite;animation-delay:calc(.9s + var(--i)*.12s),2s}
.cell.hot strong{color:var(--rose)}
@keyframes hot{50%{box-shadow:0 0 40px rgba(244,169,190,.3)}}
.pa{width:min(88vw,520px);animation:fade 1.2s ease 1.6s both}
.pl{height:3px;border-radius:9px;background:rgba(255,255,255,.1);overflow:hidden}
.pl span{display:block;height:100%;border-radius:9px;background:linear-gradient(90deg,var(--lilac),var(--rose),var(--champ));box-shadow:0 0 14px rgba(244,169,190,.7);transition:width 1.6s cubic-bezier(.2,.7,.2,1)}
.pa>div:last-child{display:flex;justify-content:space-between;margin-top:.7rem;font-size:.55rem;letter-spacing:.3em;color:rgba(255,246,234,.5)}
.pa b{color:var(--champ);font-weight:500}
.cd-foot{display:flex;align-items:center;gap:.9rem;font-size:.8rem;color:rgba(255,246,234,.55);animation:fade 1.2s ease 1.9s both}
.cd-foot span{color:var(--champ)}.cd-foot p{margin:0}

/* hero */
.hero{position:relative;z-index:3;min-height:100svh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:6rem 1.25rem 4rem;text-align:center}
.hero-badge{display:inline-flex;gap:.8rem;border:1px solid rgba(246,221,176,.3);border-radius:99px;padding:.55rem 1.3rem;font-size:.6rem;letter-spacing:.4em;color:var(--champ);background:rgba(246,221,176,.05);animation:rise 1s ease .2s both}
.hero-badge span{animation:tw 2.4s ease-in-out infinite}
.date-line{margin:1.3rem 0 .4rem;font-size:.7rem;letter-spacing:.45em;color:rgba(255,246,234,.6);animation:fade 1.2s ease .5s both}
.hero-h1{margin:0;font-size:clamp(3rem,12vw,8.4rem);line-height:.95;letter-spacing:-.02em}
.hl{display:block}.hl.em{font-style:italic}
.lw{display:inline-block;white-space:nowrap}
.lt{display:inline-block;padding:0 .02em;background:linear-gradient(180deg,#fff 10%,#F6DDB0 70%,#E9B98F);-webkit-background-clip:text;background-clip:text;color:transparent;animation:letterIn 1.2s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(.4s + var(--i)*.06s)}
.hl.em .lt{animation-name:letterIn,sheen;animation-duration:1.2s,6s;animation-iteration-count:1,infinite;animation-timing-function:cubic-bezier(.2,.7,.2,1),linear}
@keyframes letterIn{from{opacity:0;filter:blur(18px);transform:translate3d(0,44px,0) scale(1.12)}to{opacity:1;filter:blur(0);transform:none}}
.hero-copy{max-width:34rem;margin:1.6rem 0 0;line-height:1.85;color:rgba(255,246,234,.65);animation:rise 1s ease 1.5s both}
.hero-divider{display:flex;align-items:center;gap:1rem;margin:1.6rem 0 .6rem;color:var(--champ);animation:fade 1s ease 1.7s both}
.hero-divider i{width:3.5rem;height:1px;background:linear-gradient(90deg,transparent,var(--champ))}.hero-divider i:last-child{transform:scaleX(-1)}
@media(max-width:700px){.desktop-only{display:none}}

/* cake */
.cake{width:min(86vw,340px);animation:rise 1.2s ease 1.8s both,float 6s ease-in-out 3s infinite;filter:drop-shadow(0 30px 40px rgba(0,0,0,.5))}
@keyframes float{50%{transform:translateY(-8px)}}
.cake svg{display:block;width:100%;overflow:visible}
.fl{transform-box:fill-box;transform-origin:50% 100%;animation:flick .22s ease-in-out infinite alternate;transition:opacity .5s,transform .5s}
@keyframes flick{from{transform:scale(1,.92) rotate(-3deg)}to{transform:scale(.92,1.08) rotate(3deg)}}
.fg{animation:glow 1.2s ease-in-out infinite alternate;transition:opacity .6s}
@keyframes glow{from{opacity:.6;transform:scale(.9)}to{opacity:1;transform:scale(1.08)}}
.fg{transform-box:fill-box;transform-origin:center}
.out .fl,.out .fg{opacity:0;transform:scale(0)}
.smoke{opacity:0;stroke-dasharray:60;stroke-dashoffset:60}
.out .smoke{animation:smoke 2.6s ease-out both}
@keyframes smoke{0%{opacity:.7;stroke-dashoffset:60}60%{opacity:.5}100%{opacity:0;stroke-dashoffset:0;transform:translateY(-22px)}}
.pearl{animation:tw 3s ease-in-out infinite}
.spk{transform-box:fill-box;transform-origin:center;animation:tw 2.6s ease-in-out infinite}

.wish{position:relative;overflow:hidden;display:inline-flex;align-items:center;gap:.8rem;margin-top:1.2rem;padding:1rem 2.2rem;border-radius:99px;font-size:.7rem;letter-spacing:.35em;color:#2a1020;background:linear-gradient(135deg,#F6DDB0,#F4A9BE);box-shadow:0 12px 40px -10px rgba(244,169,190,.7);transition:transform .3s,box-shadow .3s;animation:rise 1s ease 2s both}
.wish:hover{transform:translateY(-3px);box-shadow:0 18px 50px -8px rgba(244,169,190,.9)}
.wish::after{content:"";position:absolute;top:0;bottom:0;left:-60%;width:40%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.6),transparent);transform:skewX(-20deg);animation:shine 3.5s ease-in-out infinite}
@keyframes shine{0%,50%{left:-60%}100%{left:140%}}
.wish i{font-style:normal;transition:transform .3s}.wish:hover i{transform:translateX(5px)}
.wish.wished{color:var(--champ);background:rgba(246,221,176,.08);border:1px solid rgba(246,221,176,.4);box-shadow:none}
.wish.wished::after{display:none}
.cue{display:flex;flex-direction:column;align-items:center;gap:.6rem;margin-top:2.4rem;font-size:.55rem;letter-spacing:.32em;color:rgba(255,246,234,.5);animation:fade 1s ease 2.3s both}
.cue b{font-weight:400;color:var(--champ);animation:bob 1.8s ease-in-out infinite}
@keyframes bob{50%{transform:translateY(7px)}}

.sound{position:fixed;top:1.1rem;right:1.1rem;z-index:55;display:inline-flex;align-items:center;gap:.4rem;padding:.65rem 1.1rem;border-radius:99px;border:1px solid rgba(246,221,176,.25);background:rgba(10,6,20,.55);backdrop-filter:blur(10px);font-size:.55rem;letter-spacing:.28em;color:rgba(255,246,234,.8);transition:border-color .3s,box-shadow .3s}
.sound:hover,.sound.active{border-color:var(--champ);box-shadow:0 0 24px rgba(246,200,150,.25)}
.eq{display:inline-flex;align-items:flex-end;gap:2px;height:12px;margin-left:.3rem}
.eq i{width:2px;height:100%;background:var(--champ);transform-origin:bottom;animation:eq .9s ease-in-out infinite}
.eq i:nth-child(2){animation-delay:.15s}.eq i:nth-child(3){animation-delay:.3s}.eq i:nth-child(4){animation-delay:.45s}
@keyframes eq{0%,100%{transform:scaleY(.25)}50%{transform:scaleY(1)}}

.petals,.confetti,.fw{position:fixed;inset:0;z-index:4;overflow:hidden;pointer-events:none}
.petal{position:absolute;top:-30px;width:12px;height:16px;border-radius:80% 0 80% 0;background:linear-gradient(135deg,rgba(255,200,215,.8),rgba(244,169,190,.35));opacity:0;animation:petal 10s linear infinite}
@keyframes petal{0%{opacity:0;transform:translate3d(0,0,0) rotate(var(--rot))}10%{opacity:.9}100%{opacity:0;transform:translate3d(60px,110vh,0) rotate(calc(var(--rot) + 540deg))}}
.confetti span{position:absolute;top:-20px;width:8px;height:14px;background:var(--c);border-radius:2px;animation:fall linear forwards}
@keyframes fall{to{transform:translate3d(var(--dx),110vh,0) rotate(calc(var(--rot) + 720deg))}}
.fw-b{position:absolute}
.fw-b i{position:absolute;width:4px;height:4px;border-radius:50%;background:var(--c);box-shadow:0 0 8px var(--c);animation:fwx 1.7s cubic-bezier(.1,.7,.2,1) var(--d) both}
@keyframes fwx{0%{transform:rotate(var(--a)) translateX(0);opacity:1}100%{transform:rotate(var(--a)) translateX(110px) translateY(30px);opacity:0}}

/* sections */
.sec{position:relative;z-index:3;max-width:1100px;margin:0 auto;padding:7rem 1.25rem}
.num{position:absolute;right:1.25rem;top:3rem;font-family:var(--disp);font-size:clamp(6rem,20vw,13rem);font-weight:700;line-height:1;color:transparent;-webkit-text-stroke:1px rgba(246,221,176,.1);pointer-events:none}
.slabel{display:flex;align-items:center;gap:1rem;font-size:.62rem;letter-spacing:.42em;color:var(--champ);margin-bottom:2.2rem}
.slabel::before{content:"";width:0;height:1px;background:var(--champ);transition:width 1.1s ease .2s}.slabel.in::before{width:3rem}
[data-r]{opacity:0;transform:translateY(34px);filter:blur(6px);transition:opacity 1s ease calc(var(--i,0)*.15s),transform 1s cubic-bezier(.2,.7,.2,1) calc(var(--i,0)*.15s),filter 1s ease calc(var(--i,0)*.15s)}
[data-r].in{opacity:1;transform:none;filter:none}
.stitle p,.mem-head p{margin:0 0 1rem;font-size:.62rem;letter-spacing:.4em;color:var(--rose)}
.stitle h2,.mem-head h2{font-size:clamp(2.6rem,7vw,4.8rem)}
.letter-layout{display:grid;gap:3rem;align-items:center}
@media(min-width:900px){.letter-layout{grid-template-columns:1fr 1.1fr}}

.lcard{position:relative;overflow:hidden;padding:2rem;border-radius:1.75rem;border:1px solid rgba(246,221,176,.25);background:linear-gradient(160deg,rgba(255,246,234,.09),rgba(255,246,234,.02));backdrop-filter:blur(14px);box-shadow:0 40px 80px -40px rgba(244,169,190,.35);transform:perspective(1000px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));transition:transform .25s ease-out}
.lcard::before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.7;background:radial-gradient(320px circle at var(--mx,50%) var(--my,0%),rgba(246,221,176,.16),transparent 70%)}
.lc-top{display:flex;justify-content:space-between;font-size:.58rem;letter-spacing:.35em;color:rgba(246,221,176,.8)}.lc-top b{font-weight:400}
.seal{display:flex;align-items:center;justify-content:center;width:4.2rem;height:4.2rem;margin:1.6rem auto;border-radius:50%;font-family:var(--disp);font-size:2rem;font-weight:700;color:#fff6ea;background:radial-gradient(circle at 35% 30%,#ff9db3,#b83a5e 70%);box-shadow:0 8px 24px rgba(184,58,94,.55),inset 0 -4px 8px rgba(0,0,0,.25);transition:transform .9s cubic-bezier(.5,-.4,.3,1.4),opacity .9s,margin .9s,height .9s,width .9s}
.seal.broken{transform:rotate(-40deg) scale(0);opacity:0;height:0;width:0;margin:0}
.lc-prev{position:relative;margin:0 0 1.5rem;text-align:center;font-family:var(--disp);font-style:italic;font-size:1.35rem;line-height:1.5;color:rgba(255,246,234,.85)}
.lbtn,.gbtn,.fwish{display:flex;margin:0 auto;padding:.9rem 1.8rem;border-radius:99px;border:1px solid rgba(246,221,176,.4);font-size:.6rem;letter-spacing:.32em;color:var(--champ);transition:background .3s,color .3s,box-shadow .3s,transform .3s}
.lbtn:hover,.gbtn:hover,.fwish:hover{background:var(--champ);color:#2a1020;transform:translateY(-2px);box-shadow:0 12px 36px -8px rgba(246,200,150,.6)}
.lc-full{position:relative;margin-top:2rem;padding-top:1.6rem;border-top:1px solid rgba(246,221,176,.2);animation:unfold 1.4s cubic-bezier(.2,.7,.2,1) both}
@keyframes unfold{from{max-height:0;opacity:0}to{max-height:900px;opacity:1}}
.lc-full p{margin:0 0 1.1rem;line-height:1.9;color:rgba(255,246,234,.8);animation:rise .9s ease both;animation-delay:calc(.5s + var(--i)*.35s)}
.lc-full .signature{margin:0;font-family:var(--disp);font-size:1.2rem;color:var(--champ)}

.mem-head{margin-bottom:3rem}
.mem{display:flex;gap:.9rem;height:26rem}
@media(max-width:800px){.mem{flex-direction:column;height:auto}}
.mc{position:relative;flex:1;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;padding:1.4rem;text-align:left;border-radius:1.5rem;border:1px solid rgba(246,221,176,.15);transition:flex .9s cubic-bezier(.2,.7,.2,1),height .9s cubic-bezier(.2,.7,.2,1),border-color .5s,box-shadow .5s}
.mc.on{flex:2.7;border-color:rgba(246,221,176,.5);box-shadow:0 30px 70px -30px rgba(244,169,190,.5)}
@media(max-width:800px){.mc{flex:none;height:7.5rem}.mc.on{flex:none;height:17rem}}
.mc-art{position:absolute;inset:0;opacity:.55;transition:opacity .6s,transform 1.2s}
.mc.on .mc-art{opacity:1;transform:scale(1.08)}
.mc-1 .mc-art{background:radial-gradient(circle at 30% 25%,rgba(244,169,190,.8),transparent 55%),radial-gradient(circle at 80% 90%,rgba(183,164,255,.5),transparent 55%),#1b0f26}
.mc-2 .mc-art{background:radial-gradient(circle at 70% 20%,rgba(246,221,176,.75),transparent 55%),radial-gradient(circle at 15% 85%,rgba(244,169,190,.5),transparent 55%),#241320}
.mc-3 .mc-art{background:radial-gradient(circle at 25% 80%,rgba(183,164,255,.8),transparent 55%),radial-gradient(circle at 85% 15%,rgba(246,221,176,.5),transparent 55%),#140f2a}
.mc-art::after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,transparent 35%,rgba(255,255,255,.18) 50%,transparent 65%);background-size:250% 100%;animation:sheen 7s linear infinite}
.mc>*:not(.mc-art){position:relative}
.mc::before{content:"";position:absolute;inset:.7rem;z-index:2;border:1px solid rgba(255,246,234,.18);border-radius:1rem;pointer-events:none}
.mc-n{font-family:var(--disp);font-size:2.4rem;font-weight:600;color:rgba(255,246,234,.8)}
.mc-t small{font-size:.55rem;letter-spacing:.35em;color:var(--champ)}
.mc-t h3{margin:.5rem 0;font-size:1.7rem;line-height:1.1;text-shadow:0 2px 20px rgba(0,0,0,.5)}
.mc-t p{margin:0;max-width:18rem;font-size:.82rem;line-height:1.6;color:rgba(255,246,234,.75);transition:opacity .5s}
.mc:not(.on) .mc-t p{opacity:.0}.mc:not(.on):hover .mc-t p{opacity:.8}
.mc b{position:absolute;top:1.2rem;right:1.4rem;font-weight:400;color:var(--champ);transition:transform .4s}.mc:hover b{transform:translate(3px,-3px)}
.mem-cap{display:flex;align-items:center;justify-content:center;gap:1rem;margin-top:2.2rem;font-size:.8rem;color:rgba(255,246,234,.5)}.mem-cap span{color:var(--champ)}.mem-cap p{margin:0}

/* gift */
.gift-sec{text-align:center}.gift-sec .slabel{justify-content:center}
.gift{position:relative;width:260px;height:380px;margin:1rem auto 1.4rem}
.g-shadow{position:absolute;left:50%;bottom:6px;width:190px;height:22px;transform:translateX(-50%);border-radius:50%;background:rgba(0,0,0,.55);filter:blur(10px)}
.g-box{position:absolute;left:50%;bottom:22px;width:170px;height:128px;transform:translateX(-50%);border-radius:6px 6px 14px 14px;background:linear-gradient(135deg,#d85a7d,#8d2a56);box-shadow:inset 0 -14px 24px rgba(0,0,0,.3),0 20px 40px -10px rgba(216,90,125,.5)}
.g-lid{position:absolute;left:50%;bottom:140px;width:192px;height:44px;transform:translateX(-50%);border-radius:8px;background:linear-gradient(135deg,#ee7396,#a1325f);box-shadow:0 10px 20px rgba(0,0,0,.35);transition:transform 1.1s cubic-bezier(.5,-.3,.3,1.2),opacity .9s .3s}
.rv{position:absolute;left:50%;top:0;bottom:0;width:26px;transform:translateX(-50%);background:linear-gradient(90deg,#c9a066,#F6DDB0,#c9a066)}
.rh{position:absolute;top:34%;left:0;right:0;height:20px;background:linear-gradient(180deg,#c9a066,#F6DDB0,#c9a066);opacity:0}
.g-box .rh{opacity:0}
.g-bow{position:absolute;left:50%;top:-30px;width:0;height:0}
.g-bow i{position:absolute;top:-6px;width:42px;height:32px;border:7px solid #F6DDB0;border-radius:50% 50% 50% 8%;box-shadow:inset 0 0 10px rgba(0,0,0,.2)}
.g-bow i:first-child{left:-46px;transform:rotate(-12deg)}.g-bow i:nth-child(2){left:4px;transform:scaleX(-1) rotate(-12deg)}
.g-bow b{position:absolute;left:-9px;top:6px;width:18px;height:18px;border-radius:50%;background:#F6DDB0;box-shadow:0 2px 6px rgba(0,0,0,.35)}
.gift:not(.is-open) .g-box,.gift:not(.is-open) .g-lid{animation:wob 3.5s ease-in-out infinite}
@keyframes wob{0%,80%,100%{transform:translateX(-50%) rotate(0)}85%{transform:translateX(-50%) rotate(-3deg)}90%{transform:translateX(-50%) rotate(3deg)}95%{transform:translateX(-50%) rotate(-2deg)}}
.g-rays{position:absolute;left:50%;bottom:90px;width:380px;height:380px;margin-left:-190px;border-radius:50%;opacity:0;transition:opacity 1.2s ease .3s;background:conic-gradient(from 0deg,transparent 0 8%,rgba(246,221,176,.25) 10%,transparent 12% 25%,rgba(244,169,190,.22) 27%,transparent 29% 50%,rgba(246,221,176,.25) 52%,transparent 54% 75%,rgba(183,164,255,.22) 77%,transparent 79%);-webkit-mask:radial-gradient(circle,#000 20%,transparent 68%);mask:radial-gradient(circle,#000 20%,transparent 68%);animation:spin 18s linear infinite}
.is-open .g-rays{opacity:1}
.is-open .g-lid{transform:translate(-50%,-120px) rotate(-18deg);opacity:0}
.g-msg{position:absolute;left:50%;bottom:150px;width:max-content;max-width:88vw;transform:translateX(-50%);text-align:center;animation:msgUp 1.4s cubic-bezier(.2,.7,.2,1) .4s both}
@keyframes msgUp{from{opacity:0;transform:translate(-50%,60px) scale(.8);filter:blur(10px)}to{opacity:1;transform:translate(-50%,0) scale(1);filter:none}}
.g-msg strong{display:block;font-size:clamp(1.5rem,5vw,2.2rem);color:#fff;text-shadow:0 0 30px rgba(246,200,150,.7)}
.g-msg p{margin:.4rem 0;color:rgba(255,246,234,.75)}.g-msg span{color:var(--champ)}
.burst{position:absolute;left:50%;bottom:150px;pointer-events:none}
.burst i{position:absolute;width:6px;height:6px;border-radius:50%;background:var(--champ);box-shadow:0 0 12px #F4A9BE;animation:burst 1.5s cubic-bezier(.1,.8,.2,1) var(--dl) both}
@keyframes burst{0%{transform:rotate(var(--a)) translateX(0) scale(1);opacity:1}100%{transform:rotate(var(--a)) translateX(var(--r)) scale(.2);opacity:0}}

/* final */
.final{position:relative;z-index:3;display:flex;flex-direction:column;align-items:center;padding:7rem 1.25rem 5rem;text-align:center}
.fstars{color:var(--champ);letter-spacing:.2em}
.final>p:not(.fmsg){margin:1.2rem 0;font-size:.65rem;letter-spacing:.45em;color:var(--rose)}
.final h2{font-size:clamp(3rem,11vw,7.5rem)}
.fline{width:6rem;height:1px;margin:2rem 0;background:linear-gradient(90deg,transparent,var(--champ),transparent)}
.fmsg{max-width:30rem;margin:0 0 2.4rem;line-height:1.9;color:rgba(255,246,234,.7)}
.fmark{display:flex;flex-direction:column;align-items:center;gap:.8rem;margin-top:4rem}
.fmark span{display:flex;align-items:center;justify-content:center;width:3rem;height:3rem;border-radius:50%;border:1px solid rgba(246,221,176,.4);font-family:var(--disp);font-size:1.4rem;color:var(--champ);animation:breathe 4s ease-in-out infinite}
.fmark small{font-size:.5rem;letter-spacing:.38em;color:rgba(255,246,234,.4)}

@media(max-width:560px){.timer{gap:.45rem}.cell{padding:1rem .1rem .8rem;border-radius:1rem}.cell span{letter-spacing:.14em}}
@media (prefers-reduced-motion:reduce){
html{scroll-behavior:auto}
.au,.star,.shoot,.ring,.core,.cell::before,.fl,.fg,.cake,.wish::after,.petal,.eq i,.g-rays,.mc-art::after,.hl.em .lt,.ln.em>span,.nidhi h2 em,.fmark span{animation:none!important}
[data-r]{opacity:1;transform:none;filter:none;transition:none}
.lt,.ln>span,.rise{animation:none!important;opacity:1;transform:none}
.grain{display:none}
}
`;
