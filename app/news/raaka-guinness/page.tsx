"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";

const cssVars = (o: Record<string, string | number>) => o as unknown as CSSProperties;
const pad = (n: number) => String(n).padStart(2, "0");

/* =====================================================================
   ARTICLE CONTENT
   Text, images, video and credits are unchanged from the original page.
   Body blocks render in order; [[double brackets]] mark the highlighted phrase.
   ===================================================================== */
const ARTICLE = {
  kicker: "RAAKA NEWS",
  date: "22 September 2026",
  headline: ["RAAKA Makes History", "with a Guinness World Record", "for Real-Time Motion Capture"],
  deck: "37 performers were captured simultaneously in real time as Allu Arjun and Atlee's ambitious project achieves a major technological milestone for Indian cinema.",
  video: { id: "CmVA9ifXBx4", title: "RAAKA Motion Capture Behind The Scenes", kicker: "Behind The Scenes", heading: "Inside RAAKA's Motion-Capture Process", caption: "RAAKA motion-capture behind-the-scenes footage." },
  images: {
    one: { src: "/images/raaka-guinness-1.jpg", alt: "RAAKA Guinness World Records achievement", caption: "RAAKA's Guinness World Records achievement.", credit: "Image Credit: Sun Pictures" },
    two: { src: "/images/raaka-guinness-2.jpg", alt: "Allu Arjun and Atlee with Guinness World Records certificate", caption: "Allu Arjun and Atlee with the Guinness World Records certificate.", credit: "Image Credit: Sun Pictures" },
  },
  stat: { value: 37, label: "Performers • Captured Simultaneously" },
  closing: {
    quote: ["37 performers.", "One real-time motion-capture session.", "One Guinness World Records milestone for RAAKA."],
    note: "The number that once raised questions around RAAKA now has its answer — and it has become part of the film's production history.",
  },
  credits: ["Images: Sun Pictures", "Published by World of RAAKA"],
};

type Block =
  | { t: "lead"; text: string }
  | { t: "p"; text: string }
  | { t: "h2"; id: string; text: string }
  | { t: "stat" }
  | { t: "video" }
  | { t: "image"; which: "one" | "two" }
  | { t: "closing" };

const BODY: Block[] = [
  { t: "lead", text: "RAAKA has officially added a Guinness World Records achievement to its production journey. The film has set the record for [[“Most People Motion-Captured in Real-Time”]], with 37 performers captured simultaneously." },
  { t: "p", text: "The achievement was formally recognised with Allu Arjun and director Atlee receiving the Guinness World Records certificate. What makes the moment particularly significant for RAAKA is that the record is directly connected to the film's production technology rather than being a promotional milestone." },
  { t: "h2", id: "mystery", text: "The mystery behind 37" },
  { t: "p", text: "The number 37 had already appeared in RAAKA's promotional campaign, creating curiosity among fans without an immediate explanation. The latest announcement finally provides the answer." },
  { t: "p", text: "The number refers to the 37 performers who were brought together for the simultaneous real-time motion-capture session. Their performances were recorded digitally at the same time, creating the foundation for the record-setting achievement." },
  { t: "stat" },
  { t: "h2", id: "record", text: "What the record actually represents" },
  { t: "p", text: "Motion capture allows the physical movements of performers to be recorded and translated into digital performances. It is widely used in films that rely on digital characters, creatures and effects-heavy environments." },
  { t: "p", text: "Capturing 37 performers simultaneously adds another level of coordination to the process. The performers, tracking systems, cameras and production technology have to work together within the same capture environment." },
  { t: "p", text: "For RAAKA, the achievement provides a rare glimpse into the technological scale of the project while the film continues to keep much of its actual visual world under wraps." },
  { t: "video" },
  { t: "h2", id: "milestone", text: "A major milestone for the team" },
  { t: "p", text: "The Guinness recognition gives a tangible achievement to one of RAAKA's most technically ambitious aspects. For Allu Arjun and Atlee, the certificate marks a production milestone achieved long before audiences see the finished film on screen." },
  { t: "p", text: "It also puts the mysterious number 37 into context. What initially appeared as a cryptic element of the campaign has now been revealed as a reference to the scale of the film's real-time motion-capture work." },
  { t: "image", which: "two" },
  { t: "h2", id: "story", text: "The story behind the record" },
  { t: "p", text: "RAAKA has kept its story and many of its visual details closely guarded, making production reveals such as this particularly interesting. The motion-capture record does not reveal the film's narrative, but it does show the level of technology being used behind the scenes." },
  { t: "p", text: "With 37 performers captured simultaneously, the production has achieved a Guinness World Records milestone that is now permanently attached to the making of RAAKA." },
  { t: "closing" },
];

/* contents rail: every h2 plus the video section, numbered in reading order */
const SECTIONS = BODY.flatMap((b) => (b.t === "h2" ? [{ id: b.id, text: b.text }] : b.t === "video" ? [{ id: "bts", text: ARTICLE.video.heading }] : []));
const WORDS = [...BODY.flatMap((b) => (b.t === "lead" || b.t === "p" || b.t === "h2" ? [b.text] : [])), ARTICLE.deck, ...ARTICLE.headline].join(" ").split(/\s+/).length;
const READ_MIN = Math.max(1, Math.round(WORDS / 200));
const N = ARTICLE.stat.value;

/* 37 marker points in a sunflower (phyllotaxis) spiral: one point per performer */
const POINTS = Array.from({ length: N }, (_, i) => {
  const r = 47 * Math.sqrt((i + 0.5) / N), a = i * 2.399963229728653;
  return { x: (50 + r * Math.cos(a)).toFixed(2), y: (50 + r * Math.sin(a)).toFixed(2) };
});

/* the logo is used exactly twice on this page: <Logo> in the nav and <Logo> in the ending */
const Logo = ({ className, decorative }: { className: string; decorative?: boolean }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src="/images/raaka-logo.png" alt={decorative ? "" : "RAAKA"} aria-hidden={decorative || undefined} draggable={false} className={className} />
);

const Markers = ({ count, className }: { count: number; className: string }) => (
  <div className={"mk " + className} aria-hidden="true">
    {POINTS.map((p, i) => (<i key={i} className={i < count ? "on" : ""} style={cssVars({ left: p.x + "%", top: p.y + "%", "--i": i })} />))}
  </div>
);

/* thumbnail with fallback chain so the video poster never shows a broken image */
function Thumb({ id }: { id: string }) {
  const sizes = ["maxresdefault", "sddefault", "hqdefault"];
  const [i, setI] = useState(0);
  const next = () => setI((n) => Math.min(n + 1, sizes.length - 1));
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`https://i.ytimg.com/vi/${id}/${sizes[i]}.jpg`} alt="" loading="lazy" onError={next}
      onLoad={(e: { currentTarget: HTMLImageElement }) => { if (e.currentTarget.naturalWidth <= 120 && i < sizes.length - 1) next(); }} />
  );
}

const pt = (e: ReactPointerEvent<HTMLElement>) => {
  const el = e.currentTarget, r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
  el.style.setProperty("--rx", ((0.5 - y) * 3).toFixed(2) + "deg");
  el.style.setProperty("--ry", ((x - 0.5) * 4).toFixed(2) + "deg");
  el.style.setProperty("--mx", x * 100 + "%");
  el.style.setProperty("--my", y * 100 + "%");
};
const unpt = (e: ReactPointerEvent<HTMLElement>) => { e.currentTarget.style.setProperty("--rx", "0deg"); e.currentTarget.style.setProperty("--ry", "0deg"); };

const Marked = ({ text }: { text: string }) => (
  <>
    {text.split(/(\[\[.*?\]\])/).map((s, i) => s.startsWith("[[") ? <mark key={i} className="hl" data-r="mark">{s.slice(2, -2)}</mark> : <span key={i}>{s}</span>)}
  </>
);

export default function RaakaGuinnessPage() {
  const [go, setGo] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const [heroCount, setHeroCount] = useState(0);
  const [statCount, setStatCount] = useState(0);
  const [playing, setPlaying] = useState(false);
  const progRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const statRef = useRef<HTMLDivElement>(null);

  /* hero: the 37 points light up one by one while the counter climbs, then the headline lands */
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setHeroCount(N); setGo(true); return; }
    let n = 0, iv = 0;
    const start = window.setTimeout(() => {
      iv = window.setInterval(() => { n += 1; setHeroCount(n); if (n >= N) { window.clearInterval(iv); window.setTimeout(() => setGo(true), 250); } }, 52);
    }, 500);
    return () => { window.clearTimeout(start); window.clearInterval(iv); };
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tracked = Array.from(document.querySelectorAll<HTMLElement>("[data-p]"));
    let raf = 0;
    const run = () => {
      raf = 0;
      const h = document.documentElement, max = h.scrollHeight - h.clientHeight, vh = window.innerHeight;
      progRef.current?.style.setProperty("transform", "scaleX(" + (max > 0 ? h.scrollTop / max : 0) + ")");
      setScrolled(h.scrollTop > 40);
      if (reduce) return;
      heroRef.current?.style.setProperty("--sy", Math.min(h.scrollTop, 900) + "px");
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
    const so = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive((e.target as HTMLElement).dataset.sec || "")), { rootMargin: "-40% 0px -55% 0px" });
    document.querySelectorAll("[data-sec]").forEach((el) => so.observe(el));
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); if (raf) cancelAnimationFrame(raf); io.disconnect(); so.disconnect(); };
  }, []);

  /* the number block counts up again when it scrolls into view */
  useEffect(() => {
    const el = statRef.current;
    if (!el) return;
    let iv = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setStatCount(N); return; }
      let n = 0;
      iv = window.setInterval(() => { n += 1; setStatCount(n); if (n >= N) window.clearInterval(iv); }, 55);
    }, { threshold: 0.45 });
    io.observe(el);
    return () => { io.disconnect(); window.clearInterval(iv); };
  }, []);

  const railOn = active !== "";
  let h2n = 0;

  return (
    <main className="ar">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="progress" ref={progRef} aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      {/* ============ NAV (logo, use 1 of 2) ============ */}
      <header className={"nav" + (scrolled ? " s" : "") + (go ? " go" : "")}>
        <div className="nav-in">
          <Link href="/" className="brand" aria-label="World of RAAKA, back to home">
            <Logo className="logo-s" />
            <span className="brand-t">News</span>
          </Link>
          <Link href="/" className="back">← Back to World</Link>
        </div>
      </header>

      {/* contents rail */}
      <nav className={"rail" + (railOn ? " on" : "")} aria-label="In this article">
        {SECTIONS.map((s, i) => (
          <a key={s.id} href={"#" + s.id} className={active === s.id ? "on" : ""} aria-current={active === s.id ? "true" : undefined}>
            <span className="tnum">{pad(i + 1)}</span><b>{s.text}</b>
          </a>
        ))}
      </nav>

      {/* ============ HERO: 37 points ============ */}
      <header ref={heroRef} className={"hero" + (go ? " go" : "")}>
        <div className="field" aria-hidden="true">
          <span className={"ghost xp" + (heroCount >= N ? " full" : "")}>{pad(heroCount)}</span>
          <Markers count={heroCount} className="mk-hero" />
        </div>
        <div className="vig" aria-hidden="true" />

        <div className="hero-in">
          <p className="meta">
            <span>{ARTICLE.kicker}</span><i />
            <time dateTime="2026-09-22">{ARTICLE.date}</time><i />
            <span>{READ_MIN} min read</span>
          </p>
          <h1 className="h1">
            {ARTICLE.headline.map((l, i) => (
              <span key={i} className={"hl-l" + (i === 1 ? " dim" : "")}><span style={cssVars({ "--l": i })}>{l}</span></span>
            ))}
          </h1>
          <p className="deck">{ARTICLE.deck}</p>
          <a href="#story-start" className="cue">Read the story <i aria-hidden="true">↓</i></a>
        </div>
      </header>

      {/* ============ IMAGE 1: full-bleed ============ */}
      <figure className="wide fig" id="story-start">
        <div className="fig-box" data-r="mask" data-p>
          <div className="px"><Image src={ARTICLE.images.one.src} alt={ARTICLE.images.one.alt} width={1800} height={1100} priority className="im" /></div>
          <span className="fig-shade" aria-hidden="true" />
        </div>
        <figcaption data-r="up">{ARTICLE.images.one.caption} <span>{ARTICLE.images.one.credit}</span></figcaption>
      </figure>

      {/* ============ ARTICLE ============ */}
      <article className="body">
        {BODY.map((b, idx) => {
          if (b.t === "lead") return (<div key={idx} className="tx"><p className="lead" data-r="up"><Marked text={b.text} /></p></div>);
          if (b.t === "p") return (<div key={idx} className="tx"><p className="p" data-r="up">{b.text}</p></div>);
          if (b.t === "h2") {
            h2n += 1;
            return (
              <div key={idx} className="tx">
                <h2 id={b.id} data-sec={b.id} className="h2">
                  <span className="h2-n tnum" data-r="up">{pad(h2n)}</span>
                  <span data-r="line"><span>{b.text}</span></span>
                </h2>
              </div>
            );
          }
          if (b.t === "stat") return (
            <div key={idx} className="wide stat" ref={statRef}>
              <Markers count={statCount} className="mk-stat" />
              <div className="stat-c">
                <div className={"stat-n xp" + (statCount >= N ? " full" : "")} aria-label={String(N)}>{pad(statCount)}</div>
                <p className="stat-l" data-r="up">{ARTICLE.stat.label}</p>
              </div>
            </div>
          );
          if (b.t === "video") {
            h2n += 1;
            const v = ARTICLE.video;
            return (
              <section key={idx} className="wide vid" id="bts" data-sec="bts" aria-labelledby="bts-h">
                <div className="vid-head">
                  <span className="h2-n tnum" data-r="up">{pad(h2n)}</span>
                  <div>
                    <p className="k" data-r="up">{v.kicker}</p>
                    <h2 id="bts-h" className="h2 h2-v"><span data-r="line"><span>{v.heading}</span></span></h2>
                  </div>
                </div>
                <div className="screen-wrap" data-r="mask" data-p>
                  <div className="screen">
                    {playing ? (
                      <iframe className="player" src={`https://www.youtube.com/embed/${v.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`} title={v.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
                    ) : (
                      <button type="button" className="facade" onClick={() => setPlaying(true)} aria-label={`Play video: ${v.title}`}>
                        <Thumb id={v.id} />
                        <span className="f-shade" /><span className="f-sweep" />
                        <span className="f-play" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M8 5.2v13.6L19.2 12z" fill="currentColor" /></svg></span>
                        <span className="f-hint">Play</span>
                      </button>
                    )}
                  </div>
                </div>
                <p className="cap" data-r="up">{v.caption} <a href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer">Watch on YouTube ↗</a></p>
              </section>
            );
          }
          if (b.t === "image") {
            const im = ARTICLE.images[b.which];
            return (
              <figure key={idx} className="wide fig2">
                <div className="cert" data-r="mask-l" onPointerMove={pt} onPointerLeave={unpt}>
                  <div className="cert-in"><Image src={im.src} alt={im.alt} width={1800} height={1100} className="im" /><span className="sweep" aria-hidden="true" /><span className="glare" aria-hidden="true" /></div>
                </div>
                <figcaption data-r="up">{im.caption} <span>{im.credit}</span></figcaption>
              </figure>
            );
          }
          /* closing */
          return (
            <div key={idx} className="wide closing">
              <blockquote className="pull xp">
                {ARTICLE.closing.quote.map((l, i) => (<span key={i} data-r="line" className={i === 2 ? "em" : ""}><span style={cssVars({ "--l": i })}>{l}</span></span>))}
              </blockquote>
              <p className="note" data-r="up">{ARTICLE.closing.note}</p>
            </div>
          );
        })}
      </article>

      {/* ============ ENDING (logo, use 2 of 2) ============ */}
      <section className="end" aria-label="RAAKA">
        <div className="end-shaft" aria-hidden="true" />
        <div className="end-in">
          <div className="logo-b" data-r="logo"><Logo className="logo-l" decorative /></div>
          <div className="credits" data-r="up" style={cssVars({ "--i": 2 })}>{ARTICLE.credits.map((c) => (<p key={c}>{c}</p>))}</div>
          <div data-r="up" style={cssVars({ "--i": 3 })}><Link href="/" className="btn">Back to World of RAAKA</Link></div>
        </div>
      </section>
    </main>
  );
}

const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;1,8..60,400&family=DM+Mono:wght@400;500&display=swap");
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#030304}
.ar{--ink:#030304;--moon:#E8ECF3;--steel:#8A93A3;--ember:#E5303A;--line:rgba(232,236,243,.12);--ease:cubic-bezier(.2,.7,.2,1);--cine:cubic-bezier(.77,0,.18,1);position:relative;min-height:100vh;overflow-x:clip;background:var(--ink);color:var(--moon);font-family:"Archivo",ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.ar button{font:inherit;color:inherit;cursor:pointer;background:none;border:0;padding:0}.ar a{color:inherit;text-decoration:none}
.ar ::selection{background:rgba(229,48,58,.45)}
.xp{font-stretch:125%;font-variation-settings:"wdth" 125;text-transform:uppercase}.tnum{font-variant-numeric:tabular-nums}
.ar a:focus-visible,.ar button:focus-visible{outline:2px solid var(--moon);outline-offset:3px}
.progress{position:fixed;top:0;left:0;right:0;height:2px;z-index:90;transform-origin:left;transform:scaleX(0);background:linear-gradient(90deg,var(--ember),var(--moon))}
.grain{position:fixed;inset:0;z-index:70;pointer-events:none;opacity:.07;mix-blend-mode:overlay;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}

/* reveal system */
[data-r="up"]{opacity:0;transform:translateY(24px);transition:opacity .9s ease calc(var(--i,0)*.1s),transform .9s var(--ease) calc(var(--i,0)*.1s)}
[data-r="line"]{display:block;overflow:hidden;padding-bottom:.12em}
[data-r="line"]>span{display:block;transform:translateY(108%);transition:transform 1.1s var(--ease) calc(var(--l,0)*.14s)}
[data-r="mask"]{clip-path:inset(0 0 100% 0);transition:clip-path 1.4s var(--cine)}
[data-r="mask-l"]{clip-path:inset(0 100% 0 0);transition:clip-path 1.5s var(--cine)}
[data-r="logo"]{opacity:0;clip-path:inset(0 50% 0 50%);filter:blur(14px);transition:clip-path 1.5s var(--cine),opacity 1s,filter 1.4s var(--ease)}
[data-r="up"].in{opacity:1;transform:none}[data-r="line"].in>span{transform:none}
[data-r="mask"].in,[data-r="mask-l"].in{clip-path:inset(-30px)}[data-r="logo"].in{opacity:1;clip-path:inset(-20px);filter:none}

/* nav */
.nav{position:fixed;inset:0 0 auto 0;z-index:60;padding:1.2rem 1.25rem;border-bottom:1px solid transparent;opacity:0;transition:padding .5s var(--ease),background .5s,backdrop-filter .5s,border-color .5s}
.nav.go{animation:fade 1.2s ease .4s both}.nav.s{padding:.65rem 1.25rem;background:rgba(3,3,4,.78);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-color:var(--line)}
@media(min-width:768px){.nav,.nav.s{padding-inline:3rem}}
@keyframes fade{from{opacity:0}to{opacity:1}}
.nav-in{display:flex;max-width:84rem;margin:0 auto;align-items:center;justify-content:space-between}
.brand{display:flex;align-items:center;gap:1rem}.logo-s{display:block;height:30px;width:auto}
.brand-t{padding-left:1rem;border-left:1px solid var(--line);font:500 .62rem "DM Mono",monospace;letter-spacing:.24em;text-transform:uppercase;color:var(--steel)}
.back{font:500 .62rem "DM Mono",monospace;letter-spacing:.22em;text-transform:uppercase;color:rgba(232,236,243,.55);transition:color .3s,transform .4s var(--ease)}.back:hover{color:#fff;transform:translateX(-4px)}

/* contents rail */
.rail{position:fixed;z-index:55;left:1.6rem;top:50%;display:none;flex-direction:column;gap:.2rem;width:12.5rem;transform:translate(-16px,-50%);opacity:0;pointer-events:none;transition:opacity .6s,transform .8s var(--ease)}
.rail.on{opacity:1;transform:translate(0,-50%);pointer-events:auto}
.rail a{display:flex;gap:.8rem;padding:.55rem 0;color:var(--steel);transition:color .4s}
.rail a span{font:500 .6rem "DM Mono",monospace;letter-spacing:.1em;padding-top:.15rem;color:inherit}
.rail a b{font-size:.74rem;font-weight:500;line-height:1.3;opacity:.85}
.rail a::before{content:"";width:12px;height:1px;margin-top:.55rem;background:currentColor;order:-1;transition:width .5s var(--ease),background .4s}
.rail a:hover,.rail a.on{color:var(--moon)}.rail a.on::before{width:26px;background:var(--ember)}
@media(min-width:1380px){.rail{display:flex}}

/* hero */
.hero{position:relative;min-height:100svh;display:flex;align-items:flex-end;overflow:hidden;isolation:isolate;--sy:0px}
.field{position:absolute;z-index:-2;right:max(-6vw,-5rem);top:50%;width:min(88vw,760px);aspect-ratio:1;transform:translate3d(0,calc(-50% + var(--sy)*.16),0)}
@media(max-width:800px){.field{right:50%;margin-right:calc(min(88vw,760px)/-2);top:34%;opacity:.7}}
.ghost{position:absolute;inset:0;display:grid;place-items:center;font-size:clamp(9rem,36vw,28rem);font-weight:900;letter-spacing:-.06em;line-height:1;color:transparent;-webkit-text-stroke:1px rgba(232,236,243,.14);transition:color .9s,-webkit-text-stroke-color .9s}
.ghost.full{-webkit-text-stroke-color:rgba(232,236,243,.3)}
.mk{position:absolute;inset:0}
.mk i{position:absolute;width:var(--dot,10px);height:var(--dot,10px);margin:calc(var(--dot,10px)/-2) 0 0 calc(var(--dot,10px)/-2);border-radius:50%;background:rgba(232,236,243,.14);transition:background .35s,box-shadow .5s,transform .5s var(--ease)}
.mk i.on{background:var(--moon);box-shadow:0 0 0 3px rgba(229,48,58,.28),0 0 22px 2px rgba(232,236,243,.5);transform:scale(1.15)}
.mk i.on:last-child{background:var(--ember)}
.mk-hero{--dot:11px}.hero.go .mk-hero i.on{animation:breathe 5s ease-in-out infinite;animation-delay:calc(var(--i)*-.13s)}
@keyframes breathe{50%{transform:scale(.8);box-shadow:0 0 0 2px rgba(229,48,58,.12),0 0 10px 0 rgba(232,236,243,.3)}}
.vig{position:absolute;inset:0;z-index:-1;background:radial-gradient(ellipse at 40% 55%,transparent 30%,rgba(0,0,0,.82)),linear-gradient(0deg,#030304 2%,transparent 40%)}
.hero-in{width:100%;max-width:84rem;margin:0 auto;padding:8rem 1.25rem 3.4rem}@media(min-width:768px){.hero-in{padding:9rem 3rem 4.4rem}}
.meta{display:flex;flex-wrap:wrap;align-items:center;gap:.9rem;margin:0;font:500 .62rem "DM Mono",monospace;letter-spacing:.26em;text-transform:uppercase;color:var(--steel);opacity:0}.meta span:first-child{color:var(--ember)}.meta i{width:1.6rem;height:1px;background:var(--steel)}
.hero.go .meta{animation:rise 1.1s var(--ease) both}
@keyframes rise{from{opacity:0;transform:translateY(18px);filter:blur(5px)}to{opacity:1;transform:none;filter:none}}
.h1{margin:1.6rem 0 0;max-width:62rem;font-weight:800;line-height:.98;letter-spacing:-.04em;font-size:clamp(2.3rem,6.6vw,5.8rem)}
.hl-l{display:block;overflow:hidden;padding-bottom:.12em}.hl-l>span{display:block;transform:translateY(110%);filter:brightness(.35)}
.hl-l.dim{color:transparent;-webkit-text-stroke:1.3px rgba(232,236,243,.7)}
.hero.go .hl-l>span{animation:lit 1.4s var(--ease) both;animation-delay:calc(.15s + var(--l)*.17s)}
@keyframes lit{from{transform:translateY(110%);filter:brightness(.35)}to{transform:none;filter:none}}
.deck{margin:2rem 0 0;max-width:36rem;font:400 1.2rem/1.7 "Source Serif 4",Georgia,serif;color:rgba(232,236,243,.62);opacity:0}.hero.go .deck{animation:rise 1.2s var(--ease) .9s both}
.cue{display:inline-flex;align-items:center;gap:.8rem;margin-top:2.2rem;font:500 .62rem "DM Mono",monospace;letter-spacing:.26em;text-transform:uppercase;color:rgba(232,236,243,.7);opacity:0;transition:color .3s}.hero.go .cue{animation:rise 1.2s var(--ease) 1.2s both}
.cue i{font-style:normal;display:inline-block;animation:bob 2s ease-in-out infinite}.cue:hover{color:#fff}@keyframes bob{50%{transform:translateY(4px)}}

/* layout */
.wide{max-width:76rem;margin:0 auto;padding:0 1.25rem}@media(min-width:768px){.wide{padding:0 3rem}}
.tx{max-width:45rem;margin:0 auto;padding:0 1.25rem}
.body{padding:5rem 0 4rem}@media(min-width:768px){.body{padding:8rem 0 6rem}}
.fig{margin:0;padding-top:1rem}
.fig-box{position:relative;overflow:hidden;border-radius:2px;box-shadow:0 60px 120px -50px rgba(0,0,0,.95)}
.px{transform:translate3d(0,calc((var(--p,.5) - .5)*-7%),0) scale(1.1)}
.im{display:block;width:100%;height:auto}
.fig-shade{position:absolute;inset:0;pointer-events:none;background:linear-gradient(0deg,rgba(3,3,4,.55),transparent 35%)}
.ar figcaption,.cap{margin:.9rem 0 0;font:500 .62rem "DM Mono",monospace;letter-spacing:.14em;line-height:1.7;color:var(--steel)}.ar figcaption span{color:rgba(232,236,243,.6);margin-left:.4rem}
.cap a{margin-left:.5rem;color:var(--moon);border-bottom:1px solid var(--ember);transition:color .3s}.cap a:hover{color:#fff}

/* type */
.lead{margin:0;font:400 clamp(1.35rem,2.4vw,1.75rem)/1.6 "Source Serif 4",Georgia,serif;color:rgba(232,236,243,.9)}
.lead::first-letter{float:left;margin:.08em .12em 0 0;font:900 4.6em/.8 "Archivo",sans-serif;font-stretch:125%;color:var(--ember)}
.hl{color:#fff;background:linear-gradient(var(--ember),var(--ember)) 0 100%/0 .12em no-repeat;transition:background-size 1.4s var(--ease) .5s;padding-bottom:.05em}.hl.in{background-size:100% .12em}
.p{margin:1.7rem 0 0;font:400 1.15rem/1.95 "Source Serif 4",Georgia,serif;color:rgba(232,236,243,.64)}@media(min-width:768px){.p{font-size:1.22rem}}
.h2{display:flex;gap:1.1rem;align-items:flex-start;margin:6rem 0 0;font-weight:800;line-height:1.02;letter-spacing:-.035em;font-size:clamp(1.7rem,3.6vw,2.7rem)}
.h2>span:last-child{flex:1}
.h2-n{margin-top:.5em;font:500 .66rem "DM Mono",monospace;letter-spacing:.14em;color:var(--ember)}
.k{margin:0;font:500 .62rem "DM Mono",monospace;letter-spacing:.3em;text-transform:uppercase;color:var(--steel)}

/* the number */
.stat{position:relative;margin-top:7rem;padding-block:5rem;border-block:1px solid var(--line);max-width:none;overflow:hidden;background:radial-gradient(ellipse at 50% 50%,rgba(229,48,58,.1),transparent 60%)}
.mk-stat{--dot:8px;position:absolute;left:50%;top:50%;width:min(78vw,560px);height:min(78vw,560px);inset:auto;transform:translate(-50%,-50%);opacity:.9}
.stat-c{position:relative;text-align:center}
.stat-n{font-weight:900;line-height:.85;letter-spacing:-.07em;font-size:clamp(7rem,26vw,19rem);color:transparent;-webkit-text-stroke:1.5px rgba(232,236,243,.75);transition:color .8s,text-shadow .8s;mix-blend-mode:normal}
.stat-n.full{color:var(--moon);-webkit-text-stroke-color:transparent;text-shadow:0 0 60px rgba(229,48,58,.4)}
.stat-l{margin:1.6rem 0 0;font:500 .62rem "DM Mono",monospace;letter-spacing:.32em;text-transform:uppercase;color:var(--steel)}

/* video */
.vid{margin-top:7rem}
.vid-head{display:flex;gap:1.1rem;align-items:flex-start;margin-bottom:2rem}.vid-head .h2{margin:.6rem 0 0}.vid-head .h2-n{margin-top:.2rem}
.screen-wrap{transform:scale(clamp(.92,calc(.88 + var(--p,.5)*.24),1));transform-origin:50% 100%}
.screen{position:relative;aspect-ratio:16/9;background:#000;box-shadow:0 0 0 1px rgba(232,236,243,.16),0 60px 120px -40px rgba(229,48,58,.2),0 40px 90px -40px rgba(0,0,0,.95)}
.screen::before{content:"";position:absolute;inset:-9px;border:1px solid rgba(232,236,243,.06);pointer-events:none}
.player{position:absolute;inset:0;width:100%;height:100%;border:0;background:#000;animation:fade .6s}
.facade{position:absolute;inset:0;width:100%;display:block;overflow:hidden}
.facade img{width:100%;height:100%;object-fit:cover;filter:saturate(.9) contrast(1.04);transform:scale(1.04);transition:transform 1.6s var(--ease),filter .6s}
.f-shade{position:absolute;inset:0;background:linear-gradient(0deg,rgba(3,3,4,.75),transparent 55%),rgba(3,3,4,.15)}
.f-sweep,.sweep{position:absolute;inset:0;pointer-events:none;background:linear-gradient(112deg,transparent 30%,rgba(235,240,255,.2) 48%,transparent 64%);transform:translateX(-130%)}
.f-play{position:absolute;left:50%;top:50%;width:4.6rem;height:4.6rem;margin:-2.3rem 0 0 -2.3rem;display:grid;place-items:center;border:1px solid rgba(232,236,243,.5);border-radius:50%;background:rgba(3,3,4,.35);backdrop-filter:blur(6px);transition:transform .6s var(--ease),background .4s,color .4s}.f-play svg{margin-left:3px}
.f-hint{position:absolute;left:1.1rem;bottom:1rem;font:500 .6rem "DM Mono",monospace;letter-spacing:.3em;text-transform:uppercase;color:rgba(232,236,243,.75)}
@media(hover:hover){.facade:hover img{transform:scale(1.09);filter:saturate(1.05)}.facade:hover .f-sweep{transform:translateX(130%);transition:transform 1.2s var(--ease)}.facade:hover .f-play{transform:scale(1.1);background:var(--moon);color:var(--ink)}}

/* certificate image */
.fig2{margin:6rem auto 0;max-width:62rem}
.cert{perspective:1200px;--rx:0deg;--ry:0deg;--mx:50%;--my:50%}
.cert-in{position:relative;overflow:hidden;border-radius:2px;transform:rotateX(var(--rx)) rotateY(var(--ry));transition:transform .7s var(--ease),box-shadow .6s;box-shadow:0 50px 100px -40px rgba(0,0,0,.95),0 0 0 1px rgba(232,236,243,.1)}
.glare{position:absolute;inset:0;pointer-events:none;mix-blend-mode:soft-light;opacity:0;transition:opacity .5s;background:radial-gradient(420px circle at var(--mx) var(--my),rgba(255,255,255,.5),transparent 60%)}
@media(hover:hover){.cert:hover .glare{opacity:1}.cert:hover .sweep{transform:translateX(130%);transition:transform 1.2s var(--ease)}.cert:hover .cert-in{box-shadow:0 60px 110px -40px rgba(0,0,0,1),0 0 0 1px rgba(232,236,243,.25)}}

/* closing */
.closing{margin-top:8rem;padding-top:4rem;border-top:1px solid var(--line)}
.pull{margin:0;font-weight:800;line-height:.98;letter-spacing:-.04em;font-size:clamp(1.8rem,5.4vw,4.6rem);max-width:60rem}.pull [data-r="line"]{padding-bottom:.14em}
.pull .em{color:transparent;-webkit-text-stroke:1.3px rgba(232,236,243,.7)}
.note{margin:2.4rem 0 0;max-width:34rem;font:italic 400 1.15rem/1.8 "Source Serif 4",Georgia,serif;color:rgba(232,236,243,.5)}

.end{position:relative;overflow:hidden;border-top:1px solid var(--line);padding:8rem 1.25rem 5rem;text-align:center;background:radial-gradient(ellipse at 50% 55%,rgba(229,48,58,.09),transparent 55%)}@media(min-width:768px){.end{padding:11rem 3rem 6rem}}
.end-shaft{position:absolute;top:-20%;bottom:-20%;left:0;width:22%;background:linear-gradient(90deg,transparent,rgba(210,222,245,.06),transparent);transform:rotate(14deg);animation:endshaft 14s ease-in-out infinite alternate}
@keyframes endshaft{from{left:-10%}to{left:90%}}
.end-in{position:relative;display:flex;flex-direction:column;align-items:center;gap:1.8rem}
.logo-b{position:relative}.logo-l{display:block;width:min(72vw,420px);height:auto;filter:drop-shadow(0 0 40px rgba(229,48,58,.25));animation:glow 5s ease-in-out infinite}
@keyframes glow{50%{filter:drop-shadow(0 0 60px rgba(232,236,243,.28))}}
.credits p{margin:.3rem 0;font:500 .6rem "DM Mono",monospace;letter-spacing:.24em;text-transform:uppercase;color:rgba(232,236,243,.38)}
.btn{position:relative;overflow:hidden;display:inline-flex;border-radius:9999px;padding:1rem 1.8rem;background:var(--moon);color:var(--ink);font-size:.64rem;font-weight:700;letter-spacing:.22em;text-transform:uppercase;transition:transform .4s var(--ease),background .3s}
.btn:hover{transform:translateY(-3px);background:#fff}
.btn::after{content:"";position:absolute;top:0;bottom:0;width:40%;left:-60%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.5),transparent);transform:skewX(-20deg)}.btn:hover::after{left:130%;transition:left .8s}

@media(max-width:600px){.logo-s{height:26px}.brand-t{display:none}.f-play{width:3.8rem;height:3.8rem;margin:-1.9rem 0 0 -1.9rem}.h2{margin-top:4.5rem}.stat{margin-top:5rem;padding-block:3.5rem}}
@media (prefers-reduced-motion:reduce){
html{scroll-behavior:auto}.grain{display:none}
.nav,.meta,.hl-l>span,.deck,.cue,.cue i,.mk-hero i,.player,.logo-l,.end-shaft{animation:none!important}
.meta,.deck,.cue,.nav{opacity:1!important}.hl-l>span{transform:none!important;filter:none!important}
.field,.px,.screen-wrap{transform:none!important}.field{transform:translateY(-50%)!important}
[data-r]{opacity:1!important;transform:none!important;clip-path:none!important;filter:none!important;transition:opacity .4s!important}[data-r="line"]>span{transform:none!important;transition:none!important}
.hl{background-size:100% .12em!important;transition:none!important}
}
`;
