"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";

const cssVars = (o: Record<string, string | number>) => o as unknown as CSSProperties;
const fmt = (n: number) => String(n).padStart(2, "0");

/* ====================== DATA ====================== */
type Milestone = {
  number: string;
  date: string;
  year: string;
  title: string;
  subtitle: string;
  description: string;
  videoId?: string;
  videoLabel?: string;
  image?: string;
  tag?: string;
};

const milestones: Milestone[] = [
  {
    number: "01",
    date: "08 APRIL 2025",
    year: "2025",
    title: "THE JOURNEY BEGINS",
    subtitle: "MOVIE ANNOUNCEMENT",
    description:
      "The massive collaboration between Allu Arjun, Atlee and Sun Pictures was officially announced, marking the beginning of a new cinematic journey.",
    videoId: "SI_PhNII7Mc",
    videoLabel: "WATCH ANNOUNCEMENT",
  },
  {
    number: "02",
    date: "07 JUNE 2025",
    year: "2025",
    title: "WELCOME ON BOARD",
    subtitle: "DEEPIKA PADUKONE",
    description:
      "Deepika Padukone officially joined the project, adding another major face to the ambitious cinematic world of RAAKA.",
    videoId: "jlmT4apm1oI",
    videoLabel: "WATCH REVEAL",
  },
  {
    number: "03",
    date: "08 APRIL 2026",
    year: "2026",
    title: "RAAKA",
    subtitle: "TITLE & FIRST LOOK",
    description: "The project entered a new chapter with the reveal of its official title and first-look poster.",
    image: "/images/RAAKAFL.jpg",
    tag: "FIRST LOOK",
  },
  {
    number: "04",
    date: "08 APRIL 2026",
    year: "2026",
    title: "MAKE WAY FOR THE KING",
    subtitle: "OFFICIAL MUSICAL RELEASE",
    description: "The arrival of the King was celebrated with the release of the official musical track, Make Way For The King.",
    videoId: "dYId6xEdG8U",
    videoLabel: "PLAY MUSIC",
  },
  {
    number: "05",
    date: "21 SEPTEMBER 2026",
    year: "2026",
    title: "37 IN REAL TIME",
    subtitle: "BEHIND THE SCENES",
    description:
      "A behind-the-scenes look at RAAKA's motion-capture work, shared on 21 September 2026 after the film earned a Guinness World Record for the most people motion-captured in real time: 37.",
    videoId: "CmVA9ifXBx4",
    videoLabel: "WATCH BEHIND THE SCENES",
    tag: "BEHIND THE SCENES",
  },
];

const upcoming = [
  { number: "06", title: "GLIMPSE", label: "COMING SOON" },
  { number: "07", title: "TEASER", label: "COMING SOON" },
  { number: "08", title: "SONGS", label: "COMING SOON" },
  { number: "09", title: "TRAILER", label: "COMING SOON" },
  { number: "10", title: "MOVIE RELEASE", label: "COMING SOON" },
];

const LATEST = milestones[milestones.length - 1];

/* ====================== COMPONENTS ====================== */
function VideoFrame({ id, title, tag }: { id: string; title: string; tag?: string }) {
  const [playing, setPlaying] = useState(false);
  const [thumb, setThumb] = useState("maxresdefault");
  return (
    <div className="vf">
      {playing ? (
        <iframe
          className="vf-if"
          src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <button type="button" className="vf-btn" onClick={() => setPlaying(true)} aria-label={`Play video: ${title}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${id}/${thumb}.jpg`}
            alt=""
            loading="lazy"
            onError={() => thumb !== "hqdefault" && setThumb("hqdefault")}
          />
          <span className="vf-shade" />
          <span className="vf-sweep" />
          {tag && <span className="vf-tag">{tag}</span>}
          <span className="vf-play" aria-hidden="true"><i /></span>
          <span className="vf-hint">Play</span>
        </button>
      )}
    </div>
  );
}

function Chapter({ item, index }: { item: Milestone; index: number }) {
  const [day, month, year] = item.date.split(" ");
  const flip = index % 2 === 1;
  const latest = item === LATEST;
  return (
    <article id={"ch" + item.number} data-ch={item.number} data-p className={"ch" + (flip ? " flip" : "")}>
      <span className="ch-no" aria-hidden="true">{item.number}</span>
      <div className="ch-grid">
        <div className="ch-media" data-r="mask">
          <div className="frame">
            {item.videoId && <VideoFrame id={item.videoId} title={item.title} tag={item.tag} />}
            {item.image && (
              <div className="img-f">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt="RAAKA first look poster" loading="lazy" />
                <span className="vf-sweep" />
                {item.tag && <span className="vf-tag">{item.tag}</span>}
              </div>
            )}
          </div>
          <p className="fig">Chapter {item.number}<i />{item.subtitle}</p>
        </div>

        <div className="ch-info">
          <time className="date" dateTime={item.date} data-r="up">
            <b className="xp">{day}</b>
            <span><em>{month}</em><em>{year}</em></span>
            {latest && <u className="latest">Latest</u>}
          </time>
          <p className="sub" data-r="up">{item.subtitle}</p>
          <h3 className="ch-title xp" data-r="line"><span>{item.title}</span></h3>
          <p className="desc" data-r="up">{item.description}</p>
          {item.videoId && (
            <a href={`https://www.youtube.com/watch?v=${item.videoId}`} target="_blank" rel="noopener noreferrer" className="yt" data-r="up">
              <span>{item.videoLabel}</span><i aria-hidden="true">↗</i>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

const Letters = ({ w, o = 0 }: { w: string; o?: number }) => (
  <>
    {w.split("").map((c, i) => (
      <span key={i} className="lt-w" aria-hidden="true"><span className="lt" style={cssVars({ "--i": i + o })}>{c}</span></span>
    ))}
  </>
);

export default function TimelinePage() {
  const [year, setYear] = useState(2026);
  const [active, setActive] = useState("hero");
  const heroRef = useRef<HTMLElement>(null);
  const progRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tracked = Array.from(document.querySelectorAll<HTMLElement>("[data-p]"));
    let raf = 0;
    const run = () => {
      raf = 0;
      const h = document.documentElement, max = h.scrollHeight - h.clientHeight, vh = window.innerHeight;
      progRef.current?.style.setProperty("transform", "scaleX(" + (max > 0 ? h.scrollTop / max : 0) + ")");
      if (reduce) return;
      heroRef.current?.style.setProperty("--sy", Math.min(h.scrollTop, 1000) + "px");
      for (const el of tracked) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;
        el.style.setProperty("--p", Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height))).toFixed(3));
      }
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(run); };
    run();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on, { passive: true });

    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    document.querySelectorAll("[data-r]").forEach((el) => io.observe(el));
    const so = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive((e.target as HTMLElement).dataset.ch || "hero")), { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("[data-ch]").forEach((el) => so.observe(el));

    /* hero: eased pointer light, 2 to 6px of depth */
    const hero = heroRef.current;
    let tx = 0, ty = 0, cx = 0, cy = 0, praf = 0;
    const loop = () => {
      cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
      hero?.style.setProperty("--mx", cx.toFixed(3)); hero?.style.setProperty("--my", cy.toFixed(3));
      praf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(loop) : 0;
    };
    const move = (e: PointerEvent) => { if (!hero) return; const r = hero.getBoundingClientRect(); tx = ((e.clientX - r.left) / r.width - 0.5) * 2; ty = ((e.clientY - r.top) / r.height - 0.5) * 2; if (!praf) praf = requestAnimationFrame(loop); };
    const leave = () => { tx = 0; ty = 0; if (!praf) praf = requestAnimationFrame(loop); };
    const canHover = !reduce && window.matchMedia("(hover: hover)").matches;
    if (canHover) { hero?.addEventListener("pointermove", move); hero?.addEventListener("pointerleave", leave); }

    return () => {
      window.removeEventListener("scroll", on); window.removeEventListener("resize", on);
      if (raf) cancelAnimationFrame(raf); if (praf) cancelAnimationFrame(praf);
      hero?.removeEventListener("pointermove", move); hero?.removeEventListener("pointerleave", leave);
      io.disconnect(); so.disconnect();
    };
  }, []);

  const inChron = milestones.some((m) => m.number === active);

  return (
    <main className="rk">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="progress" ref={progRef} aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      <nav className={"rail" + (inChron ? " on" : "")} aria-label="Chapters">
        {milestones.map((m) => (
          <a key={m.number} href={"#ch" + m.number} className={active === m.number ? "on" : ""} aria-label={`Chapter ${m.number}: ${m.title}`} aria-current={active === m.number ? "true" : undefined}>
            <span>{m.number}</span><i />
          </a>
        ))}
      </nav>

      {/* ============ HERO ============ */}
      <section ref={heroRef} className="hero" data-ch="hero" aria-label="RAAKA">
        <div className="h-slit" aria-hidden="true" />
        <div className="h-stage">
          <div className="h-poster">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/RAAKAFL.jpg" alt="RAAKA first look" loading="eager" />
          </div>
          <div className="h-shade" />
          <div className="h-shaft a" aria-hidden="true" />
          <div className="h-shaft b" aria-hidden="true" />
          <div className="h-light" aria-hidden="true" />
          <div className="h-vig" aria-hidden="true" />
        </div>

        <div className="h-top">
          <Link href="/" className="back">← Back to Home</Link>
          <p className="h-range">2025<i />Present</p>
        </div>

        <div className="h-content">
          <p className="h-kick">The journey of</p>
          <h1 className="h-title xp" aria-label="RAAKA"><Letters w="RAAKA" /></h1>
          <div className="h-bar">
            <p className="h-lead">From the first announcement to the latest behind-the-scenes look, follow the journey of RAAKA one milestone at a time.</p>
            <dl className="h-meta">
              <div><dt>Released</dt><dd className="xp">{fmt(milestones.length)}</dd></div>
              <div><dt>Coming</dt><dd className="xp">{fmt(upcoming.length)}</dd></div>
              <div><dt>Latest</dt><dd className="xp">{LATEST.date.replace("SEPTEMBER", "SEP")}</dd></div>
            </dl>
          </div>
        </div>
        <div className="scue" aria-hidden="true"><span>Scroll</span><i /></div>
      </section>

      <div className="mq" aria-hidden="true">
        <div className="mq-t xp">{[...milestones, ...upcoming, ...milestones, ...upcoming].map((m, i) => (<span key={i}>{m.title}<em>●</em></span>))}</div>
      </div>

      {/* ============ CHRONICLE ============ */}
      <section className="chron" aria-labelledby="chron-h">
        <div className="wrap">
          <header className="sec-head">
            <p className="kk" data-r="up">Chapters</p>
            <h2 id="chron-h" className="h2 xp">
              <span data-r="line"><span>The</span></span>
              <span data-r="line" className="dim"><span style={cssVars({ "--l": 1 })}>Timeline</span></span>
            </h2>
            <p className="lead" data-r="up">Every announcement, reveal and major milestone, preserved as part of the RAAKA journey.</p>
          </header>
        </div>
        <div className="chs">
          <span className="spine" aria-hidden="true" />
          {milestones.map((m, i) => (<Chapter key={m.number} item={m} index={i} />))}
        </div>
      </section>

      {/* ============ NEXT CHAPTERS ============ */}
      <section className="next" aria-labelledby="next-h">
        <div className="wrap">
          <header className="sec-head">
            <p className="kk" data-r="up">The story continues</p>
            <h2 id="next-h" className="h2 xp">
              <span data-r="line"><span>Next</span></span>
              <span data-r="line" className="dim"><span style={cssVars({ "--l": 1 })}>Chapters</span></span>
            </h2>
            <p className="lead" data-r="up">The chapters still to come: glimpse, teaser, songs, trailer and the final release.</p>
          </header>
          <div className="ups">
            {upcoming.map((u, i) => (
              <div key={u.number} className="up" data-r="up" style={cssVars({ "--i": i, "--d": i * 1.4 + "s" })}>
                <span className="up-no xp" aria-hidden="true">{u.number}</span>
                <span className="up-sweep" aria-hidden="true" />
                <div className="up-top"><small>Upcoming</small><h3 className="xp">{u.title}</h3></div>
                <div className="up-bot"><i aria-hidden="true" /><span>{u.label}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FINAL ============ */}
      <section className="final" data-p aria-label="Make way for the King">
        <div className="f-shaft" aria-hidden="true" />
        <div className="f-in">
          <p className="kk center" data-r="up">The journey has just begun</p>
          <h2 className="f-t xp">
            <span data-r="line"><span>MAKE WAY</span></span>
            <span data-r="line" className="f-2"><span style={cssVars({ "--l": 1 })}>FOR THE KING</span></span>
          </h2>
          <div data-r="up" style={cssVars({ "--i": 3 })}>
            <Link href="/" className="cta">Back To World Of RAAKA</Link>
          </div>
        </div>
      </section>

      <footer className="foot">
        <div className="wrap foot-in">
          <div>
            <h2 className="xp">WORLD OF RAAKA</h2>
            <p>Everything about RAAKA in one place.</p>
          </div>
          <div className="foot-links">
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy-policy">Privacy Policy</Link>
          </div>
          <p className="foot-c">© {year} The World of RAAKA. Fan-created website.</p>
        </div>
      </footer>
    </main>
  );
}

const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Instrument+Serif:ital@0;1&display=swap");
.rk{--ink:#040405;--moon:#E8ECF3;--steel:#8A93A3;--ember:#C0222B;--line:rgba(232,236,243,.12);--ease:cubic-bezier(.2,.7,.2,1);--cine:cubic-bezier(.77,0,.18,1);position:relative;min-height:100vh;overflow-x:hidden;background:var(--ink);color:var(--moon);font-family:"Archivo",ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
html{scroll-behavior:smooth}.rk ::selection{background:rgba(192,34,43,.45)}
.xp{font-stretch:125%;font-variation-settings:"wdth" 125;text-transform:uppercase}
.rk a:focus-visible,.rk button:focus-visible{outline:2px solid var(--moon);outline-offset:3px}
.wrap{max-width:80rem;margin:0 auto;padding:0 1.25rem}@media(min-width:768px){.wrap{padding:0 3rem}}
.progress{position:fixed;top:0;left:0;right:0;height:2px;z-index:80;transform-origin:left;transform:scaleX(0);background:linear-gradient(90deg,var(--ember),var(--moon))}
.grain{position:fixed;inset:0;z-index:70;pointer-events:none;opacity:.07;mix-blend-mode:overlay;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}

/* reveal system */
[data-r="up"]{opacity:0;transform:translateY(26px);transition:opacity .9s ease calc(var(--i,0)*.1s),transform .9s var(--ease) calc(var(--i,0)*.1s)}
[data-r="mask"]{clip-path:inset(0 0 100% 0);transition:clip-path 1.3s var(--cine)}
[data-r="line"]{display:block;overflow:hidden;padding-bottom:.1em}
[data-r="line"]>span{display:block;transform:translateY(108%);transition:transform 1.1s var(--ease) calc(var(--l,0)*.14s)}
[data-r="up"].in{opacity:1;transform:none}[data-r="mask"].in{clip-path:inset(-30px)}[data-r="line"].in>span{transform:none}

/* chapter rail */
.rail{position:fixed;left:1.2rem;top:50%;z-index:60;display:none;flex-direction:column;gap:.2rem;transform:translate(-20px,-50%);opacity:0;pointer-events:none;transition:opacity .6s,transform .8s var(--ease)}
.rail.on{opacity:1;transform:translate(0,-50%);pointer-events:auto}
.rail a{display:flex;align-items:center;gap:.7rem;padding:.55rem 0;font-size:.7rem;color:var(--steel);font-variant-numeric:tabular-nums;transition:color .4s}
.rail a i{display:block;width:14px;height:1px;background:currentColor;transition:width .5s var(--ease),background .4s}
.rail a:hover,.rail a.on{color:var(--moon)}.rail a.on i{width:38px;background:var(--ember)}
@media(min-width:1280px){.rail{display:flex}}

/* hero */
.hero{position:relative;min-height:100svh;overflow:hidden;background:#000;--mx:0;--my:0}
.h-slit{position:absolute;top:0;bottom:0;left:50%;z-index:6;width:1px;background:linear-gradient(180deg,transparent,#fff 30%,#fff 70%,transparent);box-shadow:0 0 28px 2px rgba(232,236,243,.55);transform:scaleY(0);animation:slit 2s var(--cine) .1s both}
@keyframes slit{0%{transform:scaleY(0);opacity:1}35%{transform:scaleY(1);opacity:1}100%{transform:scaleY(1);opacity:0}}
.h-stage{position:absolute;inset:0;animation:open 2.1s var(--cine) .55s both}
@keyframes open{from{clip-path:inset(0 49.9% 0 49.9%)}to{clip-path:inset(0)}}
.h-poster{position:absolute;top:-3%;bottom:-3%;right:-3%;width:106%;transform:translate3d(calc(var(--mx)*-6px),calc(var(--sy,0px)*.22 + var(--my)*-4px),0);will-change:transform}
@media(min-width:900px){.h-poster{width:72%}}
.h-poster img{width:100%;height:100%;object-fit:cover;object-position:center 18%;animation:focus 3.2s var(--ease) .8s both,drift 24s ease-in-out 4s infinite alternate}
@keyframes focus{from{filter:blur(20px) brightness(.5) saturate(.6);transform:scale(1.14)}to{filter:blur(0) brightness(.92) saturate(.9) contrast(1.06);transform:scale(1.04)}}
@keyframes drift{from{transform:scale(1.04) translateX(0)}to{transform:scale(1.09) translateX(-1.3%)}}
.h-shade{position:absolute;inset:0;background:linear-gradient(90deg,#040405 6%,rgba(4,4,5,.62) 42%,rgba(4,4,5,.1) 80%),linear-gradient(0deg,#040405 4%,rgba(4,4,5,.15) 55%,rgba(4,4,5,.5))}
.h-shaft{position:absolute;top:-20%;bottom:-20%;width:18%;mix-blend-mode:screen;background:linear-gradient(90deg,transparent,rgba(190,205,230,.1),transparent);transform:rotate(14deg);animation:shaft 16s ease-in-out infinite alternate}
.h-shaft.a{left:46%}.h-shaft.b{left:68%;width:9%;animation-duration:22s;animation-delay:-8s;opacity:.7}
@keyframes shaft{from{transform:translateX(-8vw) rotate(14deg)}to{transform:translateX(9vw) rotate(14deg)}}
.h-light{position:absolute;inset:0;mix-blend-mode:screen;opacity:.55;background:radial-gradient(560px circle at calc(66% + var(--mx)*14%) calc(36% + var(--my)*12%),rgba(190,208,240,.16),transparent 62%)}
.h-vig{position:absolute;inset:0;background:radial-gradient(ellipse at 55% 45%,transparent 40%,rgba(0,0,0,.7))}
.h-top{position:absolute;top:0;left:0;right:0;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:1.6rem 1.25rem;animation:fade 1.2s ease 2.6s both}
@media(min-width:768px){.h-top{padding:2rem 3rem}}
@keyframes fade{from{opacity:0}}
.back{font-size:.7rem;font-weight:600;letter-spacing:.26em;text-transform:uppercase;color:rgba(232,236,243,.55);transition:color .3s,transform .4s var(--ease)}.back:hover{color:#fff;transform:translateX(-4px)}
.h-range{display:flex;align-items:center;gap:.9rem;font-size:.7rem;letter-spacing:.3em;text-transform:uppercase;color:var(--steel)}.h-range i{width:2.5rem;height:1px;background:var(--steel)}
.h-content{position:relative;z-index:10;display:flex;min-height:100svh;flex-direction:column;justify-content:flex-end;max-width:80rem;margin:0 auto;padding:7rem 1.25rem 2.6rem}@media(min-width:768px){.h-content{padding:7rem 3rem 3.2rem}}
.h-kick{font-family:"Instrument Serif",Georgia,serif;font-style:italic;font-size:1.5rem;color:var(--steel);display:flex;align-items:center;gap:1rem;animation:rise 1.2s var(--ease) 2.4s both}.h-kick::before{content:"";width:3rem;height:1px;background:var(--ember)}
.h-title{margin-top:.5rem;font-weight:800;line-height:.82;letter-spacing:-.03em;font-size:clamp(4.2rem,21.5vw,27rem);white-space:nowrap;display:flex}
.lt-w{display:inline-block;overflow:hidden;padding:.02em .015em .06em}
.lt{display:inline-block;background:linear-gradient(180deg,#fff 18%,#9AA4B6 100%);-webkit-background-clip:text;background-clip:text;color:transparent;animation:lt 1.4s var(--ease) both;animation-delay:calc(1.9s + var(--i)*.1s)}
@keyframes lt{from{transform:translateY(105%) skewY(6deg);filter:blur(10px)}to{transform:none;filter:none}}
@keyframes rise{from{opacity:0;transform:translate3d(0,22px,0);filter:blur(5px)}to{opacity:1;transform:none;filter:none}}
.h-bar{margin-top:2.2rem;padding-top:1.5rem;border-top:1px solid var(--line);display:flex;flex-direction:column;gap:1.8rem;animation:rise 1.2s var(--ease) 3s both}
@media(min-width:900px){.h-bar{flex-direction:row;align-items:flex-end;justify-content:space-between}}
.h-lead{max-width:30rem;font-size:.95rem;line-height:1.8;color:rgba(232,236,243,.55)}
.h-meta{display:flex;gap:2.2rem}.h-meta dt{font-size:.68rem;letter-spacing:.24em;text-transform:uppercase;color:var(--steel)}.h-meta dd{margin-top:.4rem;font-size:1.25rem;font-weight:700;white-space:nowrap}
.scue{position:absolute;right:1.6rem;bottom:8.5rem;z-index:10;display:none;flex-direction:column;align-items:center;gap:.6rem;font-size:.68rem;letter-spacing:.28em;text-transform:uppercase;color:var(--steel);writing-mode:vertical-rl;animation:fade 1s ease 3.5s both}
.scue i{width:1px;height:56px;background:linear-gradient(var(--moon),transparent);transform-origin:top;animation:scue 2.4s ease-in-out infinite}
@keyframes scue{0%{transform:scaleY(0)}60%{transform:scaleY(1)}100%{transform:scaleY(1);opacity:0}}
@media(min-width:1100px){.scue{display:flex}}

.mq{overflow:hidden;border-block:1px solid var(--line);padding:1rem 0;background:#030304}
.mq-t{display:flex;width:max-content;gap:2rem;animation:mq 110s linear infinite;font-size:2rem;font-weight:800;color:transparent;-webkit-text-stroke:1px rgba(232,236,243,.28)}
.mq-t span{display:flex;align-items:center;gap:2rem;white-space:nowrap}.mq-t em{font-style:normal;font-size:.55rem;color:var(--ember);-webkit-text-stroke:0}
@keyframes mq{to{transform:translateX(-50%)}}

/* headings */
.sec-head{padding:6.5rem 0 3rem;max-width:46rem}
@media(min-width:768px){.sec-head{padding:9rem 0 4.5rem}}
.kk{display:flex;align-items:center;gap:.9rem;font-family:"Instrument Serif",Georgia,serif;font-style:italic;font-size:1.3rem;color:var(--steel)}.kk::before{content:"";width:0;height:1px;background:var(--ember);transition:width 1.1s var(--ease) .2s}.kk.in::before{width:2.8rem}
.kk.center{justify-content:center}
.h2{margin-top:.8rem;font-weight:800;font-size:clamp(2.8rem,9vw,7.2rem);line-height:.9;letter-spacing:-.035em}.h2 .dim{color:transparent;-webkit-text-stroke:1px rgba(232,236,243,.5)}
.lead{margin-top:1.6rem;max-width:30rem;font-size:.95rem;line-height:1.8;color:rgba(232,236,243,.5)}

/* chapters */
.chs{position:relative;padding-bottom:4rem}
.spine{display:none}
@media(min-width:1024px){.spine{display:block;position:absolute;left:50%;top:0;bottom:0;width:1px;background:linear-gradient(var(--line),transparent)}}
.ch{position:relative;padding:5rem 1.25rem}@media(min-width:768px){.ch{padding:7rem 3rem}}
.ch-no{position:absolute;top:2rem;right:1rem;font-size:clamp(9rem,36vw,30rem);font-weight:900;font-stretch:125%;line-height:.8;letter-spacing:-.06em;color:transparent;-webkit-text-stroke:1px rgba(232,236,243,.07);transform:translate3d(0,calc((var(--p,.5) - .5)*-140px),0);pointer-events:none;user-select:none}
.ch.flip .ch-no{right:auto;left:1rem}
.ch-grid{position:relative;max-width:80rem;margin:0 auto;display:grid;gap:2.2rem;align-items:center}
@media(min-width:1024px){.ch-grid{grid-template-columns:1.25fr .75fr;gap:6rem}.ch.flip .ch-grid{grid-template-columns:.75fr 1.25fr}.ch.flip .ch-media{order:2}}
.frame{position:relative;border:1px solid var(--line);background:#000;box-shadow:0 50px 100px -40px rgba(0,0,0,.9)}
.frame::before{content:"";position:absolute;z-index:3;inset:-9px;border:1px solid rgba(232,236,243,.06);pointer-events:none}
.fig{margin-top:1rem;display:flex;align-items:center;gap:1rem;font-size:.68rem;letter-spacing:.26em;text-transform:uppercase;color:var(--steel)}.fig i{width:2rem;height:1px;background:var(--steel)}
.vf{position:relative;aspect-ratio:16/9;overflow:hidden;background:#000}
.vf-btn{position:absolute;inset:0;width:100%;cursor:pointer;overflow:hidden;display:block}
.vf-btn img,.img-f img{width:100%;height:100%;object-fit:cover;filter:saturate(.85) contrast(1.05);transform:scale(calc(1.14 - var(--p,.5)*.1));transition:filter .8s}
.vf-if{position:absolute;inset:0;width:100%;height:100%;border:0;animation:fade .6s}
.vf-shade{position:absolute;inset:0;background:linear-gradient(0deg,rgba(4,4,5,.75),transparent 55%),rgba(4,4,5,.18);transition:background .6s}
.vf-sweep{position:absolute;inset:0;pointer-events:none;background:linear-gradient(112deg,transparent 30%,rgba(235,240,255,.18) 48%,transparent 64%);transform:translateX(-130%)}
.vf-tag{position:absolute;top:1rem;left:1rem;z-index:2;padding:.35rem .8rem;border:1px solid rgba(232,236,243,.25);border-radius:9999px;background:rgba(4,4,5,.6);backdrop-filter:blur(8px);font-size:.62rem;font-weight:600;letter-spacing:.22em}
.vf-play{position:absolute;left:50%;top:50%;z-index:2;width:4.6rem;height:4.6rem;margin:-2.3rem 0 0 -2.3rem;display:grid;place-items:center;border:1px solid rgba(232,236,243,.5);border-radius:50%;background:rgba(4,4,5,.35);backdrop-filter:blur(6px);transition:transform .6s var(--ease),background .4s,border-color .4s}
.vf-play i{width:0;height:0;margin-left:5px;border-left:15px solid var(--moon);border-block:9px solid transparent}
.vf-hint{position:absolute;left:1.1rem;bottom:1rem;z-index:2;font-size:.66rem;letter-spacing:.3em;text-transform:uppercase;color:rgba(232,236,243,.7)}
.img-f{position:relative;overflow:hidden;background:#000}.img-f img{height:auto;max-height:82vh;object-fit:contain}
@media(hover:hover){
  .vf-btn:hover .vf-sweep,.frame:hover .img-f .vf-sweep{transform:translateX(130%);transition:transform 1.2s var(--ease)}
  .vf-btn:hover .vf-play{transform:scale(1.1);background:var(--moon);border-color:var(--moon)}.vf-btn:hover .vf-play i{border-left-color:var(--ink)}
  .vf-btn:hover img{filter:saturate(1.05) contrast(1.05)}.vf-btn:hover .vf-shade{background:linear-gradient(0deg,rgba(4,4,5,.5),transparent 55%)}
}
.date{display:flex;align-items:center;gap:.9rem}
.date b{font-size:clamp(3.6rem,8vw,6.4rem);font-weight:800;line-height:.8;letter-spacing:-.05em}
.date span{display:grid;gap:.25rem}.date em{font-style:normal;font-size:.72rem;letter-spacing:.28em;color:var(--steel)}.date em:first-child{color:var(--moon)}
.latest{margin-left:.6rem;padding:.3rem .8rem;border-radius:9999px;background:var(--ember);font-size:.62rem;font-weight:700;letter-spacing:.24em;text-decoration:none;text-transform:uppercase}
.sub{margin-top:1.8rem;display:flex;align-items:center;gap:.8rem;font-size:.7rem;font-weight:600;letter-spacing:.3em;color:var(--steel)}.sub::before{content:"";width:2rem;height:1px;background:var(--steel)}
.ch-title{margin-top:1.2rem;font-weight:800;font-size:clamp(2.5rem,5.2vw,4.8rem);line-height:.95;letter-spacing:-.03em}
.desc{margin-top:1.5rem;max-width:26rem;font-size:.95rem;line-height:1.85;color:rgba(232,236,243,.52)}
.yt{margin-top:2rem;display:inline-flex;align-items:center;gap:1rem;padding:.9rem 1.5rem;border:1px solid var(--line);border-radius:9999px;font-size:.68rem;font-weight:600;letter-spacing:.24em;color:rgba(232,236,243,.75);transition:border-color .3s,background .3s,color .3s}
.yt i{font-style:normal;display:inline-block;transition:transform .4s var(--ease)}.yt:hover{border-color:var(--moon);background:var(--moon);color:var(--ink)}.yt:hover i{transform:translate(3px,-3px)}

/* upcoming */
.next{position:relative;border-top:1px solid var(--line);padding-bottom:7rem;background:radial-gradient(ellipse at 50% 0,rgba(138,147,163,.09),transparent 55%)}
.ups{display:grid;gap:.9rem}
@media(min-width:640px){.ups{grid-template-columns:repeat(2,1fr)}}
@media(min-width:1100px){.ups{grid-template-columns:repeat(5,1fr);gap:1rem}.up:nth-child(even){margin-top:3.5rem}.up:nth-child(3){margin-top:1.6rem}}
.up{position:relative;overflow:hidden;display:flex;min-height:12rem;flex-direction:column;justify-content:space-between;padding:1.6rem;border:1px solid var(--line);background:linear-gradient(180deg,#09090b,#050506);transition:transform .7s var(--ease),border-color .5s,opacity .9s ease calc(var(--i,0)*.1s)}
@media(min-width:1100px){.up{min-height:27rem;padding:1.8rem}}
.up-no{position:absolute;right:-.4rem;top:-.9rem;font-size:8.5rem;font-weight:900;line-height:1;letter-spacing:-.06em;color:transparent;-webkit-text-stroke:1px rgba(232,236,243,.1);transition:-webkit-text-stroke-color .5s}
.up-sweep{position:absolute;inset:0;pointer-events:none;background:linear-gradient(110deg,transparent 35%,rgba(220,230,255,.07) 50%,transparent 65%);transform:translateX(-130%);animation:upsweep 9s var(--ease) infinite;animation-delay:var(--d,0s)}
@keyframes upsweep{0%,60%{transform:translateX(-130%)}85%,100%{transform:translateX(130%)}}
.up-top{position:relative}.up-top small{font-size:.64rem;letter-spacing:.3em;text-transform:uppercase;color:var(--steel)}.up-top h3{margin-top:1.2rem;font-size:clamp(1.7rem,2.4vw,2.3rem);font-weight:800;line-height:1;letter-spacing:-.03em}
.up-bot{position:relative;display:flex;align-items:center;gap:.7rem;padding-top:1.1rem;border-top:1px solid var(--line);font-size:.64rem;font-weight:600;letter-spacing:.28em;color:var(--steel)}
.up-bot i{width:6px;height:6px;border-radius:50%;background:var(--ember);animation:pulse 2.2s ease-in-out infinite}
@keyframes pulse{50%{opacity:.25;transform:scale(.7)}}
@media(hover:hover){.up:hover{transform:translateY(-8px);border-color:rgba(232,236,243,.3)}.up:hover .up-no{-webkit-text-stroke-color:rgba(232,236,243,.28)}}

/* final */
.final{position:relative;overflow:hidden;border-top:1px solid var(--line);padding:9rem 1.25rem;text-align:center;background:radial-gradient(ellipse at 50% 50%,rgba(138,147,163,.1),transparent 55%)}
@media(min-width:768px){.final{padding:13rem 3rem}}
.f-shaft{position:absolute;top:-20%;bottom:-20%;width:22%;left:0;transform:translateX(calc(var(--p,.5)*480% - 60%)) rotate(14deg);background:linear-gradient(90deg,transparent,rgba(210,222,245,.07),transparent)}
.f-in{position:relative}
.f-t{margin-top:1.8rem;font-weight:800;line-height:.88;letter-spacing:-.045em;font-size:clamp(3rem,13vw,12rem);transform:scale(calc(.92 + var(--p,.5)*.1))}
.f-t [data-r="line"]{padding-inline:.05em}.f-2{color:transparent;-webkit-text-stroke:1.5px rgba(232,236,243,.75);font-size:.58em;margin-top:.15em;letter-spacing:-.02em}
.cta{display:inline-flex;margin-top:3rem;padding:1.05rem 2rem;border-radius:9999px;background:var(--moon);color:var(--ink);font-size:.7rem;font-weight:700;letter-spacing:.24em;text-transform:uppercase;transition:transform .4s var(--ease),background .3s}.cta:hover{transform:translateY(-3px);background:#fff}

.foot{border-top:1px solid var(--line);background:#000;padding:3.2rem 0}
.foot-in{display:flex;flex-direction:column;gap:1.8rem}@media(min-width:768px){.foot-in{flex-direction:row;align-items:center;justify-content:space-between}}
.foot h2{font-size:1.5rem;font-weight:800}.foot p{margin-top:.4rem;font-size:.85rem;color:var(--steel)}
.foot-links{display:flex;flex-wrap:wrap;gap:1.6rem;font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;color:rgba(232,236,243,.5)}.foot-links a{transition:color .3s}.foot-links a:hover{color:#fff}
.foot .foot-c{margin:0;font-size:.7rem;color:rgba(232,236,243,.3)}

@media(max-width:767px){.mq-t{font-size:1.5rem}.vf-play{width:3.6rem;height:3.6rem;margin:-1.8rem 0 0 -1.8rem}.h-meta{gap:1.4rem}.ch-no{opacity:.8}}
@media (prefers-reduced-motion:reduce){
html{scroll-behavior:auto}.grain,.h-slit,.h-shaft{display:none}
.h-stage,.h-poster img,.h-top,.h-kick,.lt,.h-bar,.scue,.scue i,.mq-t,.up-sweep,.up-bot i{animation:none!important}
.h-poster,.ch-no,.f-shaft,.f-t,.vf-btn img,.img-f img{transform:none!important}
[data-r]{opacity:1!important;transform:none!important;clip-path:none!important;transition:opacity .4s!important}[data-r="line"]>span{transform:none!important;transition:none!important}
}
`;
