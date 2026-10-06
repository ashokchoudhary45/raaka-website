"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

const cssVars = (o: Record<string, string | number>) => o as unknown as CSSProperties;
const pad = (n: number) => String(n).padStart(2, "0");

/* =====================================================================
   VIDEO DATA
   Add a new video by appending one object. `embed` accepts any YouTube
   link style (embed/, watch?v=, youtu.be/, shorts/): the 11-character id
   is extracted automatically, and an invalid link is skipped instead of
   breaking the page.
   ===================================================================== */
type VideoItem = {
  no: string;
  title: string;
  subtitle: string;
  category: string;
  date: string;
  embed: string;
  accent: string;
};

const VIDEOS: VideoItem[] = [
  { no: "01", title: "GEAR UP FOR RAAKA", subtitle: "The world begins to move.", category: "ANNOUNCEMENT", date: "08 APRIL 2025", embed: "https://www.youtube.com/embed/SI_PhNII7Mc", accent: "#ff6a24" },
  { no: "02", title: "WELCOME ON BOARD DEEPIKA PADUKONE", subtitle: "A new presence enters the RAAKA universe.", category: "ANNOUNCEMENT", date: "07 JUNE 2025", embed: "https://www.youtube.com/embed/jlmT4apm1oI", accent: "#e8b86a" },
  { no: "03", title: "RAAKA: MOTION CAPTURE", subtitle: "Behind the movement. Behind the illusion.", category: "BEHIND THE SCENES", date: "21 SEPTEMBER 2026", embed: "https://www.youtube.com/embed/CmVA9ifXBx4", accent: "#a98cff" },
  { no: "04", title: "MAKE WAY FOR THE KING", subtitle: "The soundtrack enters the arena.", category: "MUSIC", date: "08 APRIL 2026", embed: "https://www.youtube.com/embed/3UKmHZOGon4", accent: "#ff3f55" },
];

const ytId = (url: string) => url.match(/(?:embed\/|youtu\.be\/|[?&]v=|shorts\/)([\w-]{11})/)?.[1] ?? "";
const FILMS = VIDEOS.map((v) => ({ ...v, id: ytId(v.embed) })).filter((v) => v.id);
const CATEGORIES = ["ALL", ...Array.from(new Set(FILMS.map((f) => f.category)))];
const FIRST_YEAR = Math.min(...FILMS.map((f) => Number(f.date.split(" ").pop())).filter(Boolean));
type Film = (typeof FILMS)[number];

/* the logo is used exactly twice on this page: <Logo> in the nav and <Logo> in the closing scene */
const Logo = ({ className, decorative }: { className: string; decorative?: boolean }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src="/images/raaka-logo.png" alt={decorative ? "" : "RAAKA"} aria-hidden={decorative || undefined} draggable={false} className={className} />
);

/* thumbnail with a safe fallback chain: if a size does not exist, step down instead of showing a broken image */
function Thumb({ id, sizes = ["maxresdefault", "sddefault", "hqdefault"], className }: { id: string; sizes?: string[]; className?: string }) {
  const [i, setI] = useState(0);
  useEffect(() => setI(0), [id]);
  const next = () => setI((n) => Math.min(n + 1, sizes.length - 1));
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src={`https://i.ytimg.com/vi/${id}/${sizes[i]}.jpg`}
      alt=""
      loading="lazy"
      onError={next}
      onLoad={(e: { currentTarget: HTMLImageElement }) => { if (e.currentTarget.naturalWidth <= 120 && i < sizes.length - 1) next(); }}
    />
  );
}

const Claws = () => (
  <span className="claws" aria-hidden="true">{[0, 1, 2, 3].map((n) => (<i key={n} style={cssVars({ "--i": n })} />))}</span>
);
const PlayIcon = () => (<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M8 5.2v13.6L19.2 12z" fill="currentColor" /></svg>);

export default function RaakaVideosPage() {
  const [go, setGo] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [sel, setSel] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [year, setYear] = useState(2026);
  const progRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  const visible = useMemo(() => FILMS.filter((f) => filter === "ALL" || f.category === filter), [filter]);
  const film: Film | undefined = FILMS[sel];
  const pos = film ? visible.findIndex((f) => f.id === film.id) : -1;

  useEffect(() => {
    setYear(new Date().getFullYear());
    const t = requestAnimationFrame(() => setGo(true));
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
    return () => { cancelAnimationFrame(t); if (raf) cancelAnimationFrame(raf); window.removeEventListener("scroll", on); window.removeEventListener("resize", on); io.disconnect(); };
  }, []);

  /* picking from the queue is an explicit click, so it starts playing right away (no autoplay on page load) */
  const choose = (f: Film) => { setSel(FILMS.indexOf(f)); setPlaying(true); };
  const step = (d: number) => {
    if (!visible.length) return;
    choose(visible[(Math.max(pos, 0) + d + visible.length) % visible.length]);
  };
  const changeFilter = (c: string) => {
    setFilter(c);
    const list = FILMS.filter((f) => c === "ALL" || f.category === c);
    if (list.length && !list.some((f) => f.id === film?.id)) { setSel(FILMS.indexOf(list[0])); setPlaying(false); }
  };

  return (
    <main className="vp">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="progress" ref={progRef} aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      {/* ============ NAV (logo, use 1 of 2) ============ */}
      <header className={"nav" + (scrolled ? " s" : "") + (go ? " go" : "")}>
        <div className="nav-in">
          <Link href="/" className="brand" aria-label="World of RAAKA, back to home">
            <Logo className="logo-s" />
            <span className="brand-t">Videos</span>
          </Link>
          <Link href="/" className="back">← Back to World</Link>
        </div>
      </header>

      {/* ============ HERO: projector start-up ============ */}
      <section ref={heroRef} className={"hero" + (go ? " go" : "")} aria-labelledby="vp-h1">
        <div className="beam" aria-hidden="true" />
        <div className="beam b2" aria-hidden="true" />
        <div className="vig" aria-hidden="true" />
        <div className="hero-in">
          <p className="kick">The RAAKA archive</p>
          <h1 id="vp-h1" className="h1 xp">
            <span className="hl"><span style={cssVars({ "--l": 0 })}>Screening</span></span>
            <span className="hl dim"><span style={cssVars({ "--l": 1 })}>Room</span></span>
          </h1>
          <div className="hero-row">
            <p className="lead">Announcements, behind-the-scenes footage and music from the world of RAAKA, gathered in one screening room.</p>
            <dl className="stats">
              <div><dt>Videos</dt><dd className="xp tnum">{pad(FILMS.length)}</dd></div>
              <div><dt>Categories</dt><dd className="xp tnum">{pad(CATEGORIES.length - 1)}</dd></div>
              <div><dt>Since</dt><dd className="xp tnum">{FIRST_YEAR}</dd></div>
            </dl>
          </div>
          <a href="#theatre" className="cue">Enter the room <i aria-hidden="true">↓</i></a>
        </div>
      </section>

      {/* ============ THEATRE ============ */}
      <section id="theatre" className="th" aria-labelledby="th-h">
        <div className="wrap">
          <header className="th-head">
            <div>
              <p className="kk" data-r="up">The film library</p>
              <h2 id="th-h" className="h2 xp">
                <span data-r="line"><span>Now</span></span>
                <span data-r="line" className="dim"><span style={cssVars({ "--l": 1 })}>Showing</span></span>
              </h2>
            </div>
            <div className="filters" role="group" aria-label="Filter videos" data-r="up">
              {CATEGORIES.map((c) => (
                <button key={c} type="button" className={"chip" + (filter === c ? " on" : "")} aria-pressed={filter === c} onClick={() => changeFilter(c)}>{c}</button>
              ))}
            </div>
          </header>

          {film ? (
            <div className="th-grid">
              <div className="main">
                {/* bias light: the current thumbnail, blurred behind the screen */}
                <div className="amb" aria-hidden="true">
                  <div key={film.id} className="amb-in"><Thumb id={film.id} sizes={["hqdefault"]} /></div>
                  <span className="amb-tint" style={{ background: film.accent }} />
                </div>

                <div className="screen-wrap" data-p>
                  <div className="screen">
                    <div key={film.id + (playing ? "-p" : "-s")} className="screen-in">
                      {playing ? (
                        <iframe
                          className="player"
                          src={`https://www.youtube.com/embed/${film.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                          title={film.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                        />
                      ) : (
                        <button type="button" className="facade" onClick={() => setPlaying(true)} aria-label={`Play video: ${film.title}`}>
                          <Thumb id={film.id} />
                          <span className="f-shade" />
                          <span className="f-sweep" />
                          <span className="f-tag">Screen {film.no}</span>
                          <span className="f-play" aria-hidden="true"><PlayIcon /></span>
                          <span className="f-hint">Play</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="bar"><span>Screen {film.no}</span><i /><span>{film.category}</span></p>
                </div>

                <div className="info" key={film.id}>
                  <div className="meta">
                    <b className="no xp">{film.no}</b>
                    <span className="pill" style={{ borderColor: film.accent }}>{film.category}</span>
                    <time>{film.date}</time>
                  </div>
                  <h3 className="title xp"><span>{film.title}</span></h3>
                  <p className="sub">{film.subtitle}</p>
                  <div className="acts">
                    <button type="button" className="btn btn-s" onClick={() => setPlaying((p) => !p)}>{playing ? "Back to poster" : "Play film"} <i aria-hidden="true">{playing ? "×" : "▶"}</i></button>
                    <a className="btn btn-g" href={`https://www.youtube.com/watch?v=${film.id}`} target="_blank" rel="noopener noreferrer">Watch on YouTube <i aria-hidden="true">↗</i></a>
                    {visible.length > 1 && (
                      <span className="stepper">
                        <button type="button" onClick={() => step(-1)} aria-label="Previous video">←</button>
                        <span className="tnum">{pad(Math.max(pos, 0) + 1)} / {pad(visible.length)}</span>
                        <button type="button" onClick={() => step(1)} aria-label="Next video">→</button>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <aside className="queue" aria-label="Video queue">
                <p className="q-h">Queue<span className="tnum">{pad(visible.length)}</span></p>
                <ul>
                  {visible.map((f, i) => {
                    const active = f.id === film.id;
                    return (
                      <li key={f.id} data-r="up" style={cssVars({ "--i": i })}>
                        <button type="button" className={"row" + (active ? " act" : "")} onClick={() => choose(f)} aria-current={active ? "true" : undefined} aria-label={`Play ${f.title}`}>
                          <span className="th-img"><Thumb id={f.id} sizes={["hqdefault"]} /><span className="th-no tnum">{f.no}</span></span>
                          <span className="row-t">
                            <small>{f.category}</small>
                            <b className="xp">{f.title}</b>
                            <em>{active ? <>Now showing {playing && <Claws />}</> : f.date}</em>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </aside>
            </div>
          ) : (
            <p className="empty">No videos yet.</p>
          )}
        </div>
      </section>

      {/* ============ CLOSING (logo, use 2 of 2) ============ */}
      <section className="end" aria-label="RAAKA">
        <div className="end-shaft" aria-hidden="true" />
        <div className="end-in">
          <div className="logo-b" data-r="logo"><Logo className="logo-l" decorative /></div>
          <p className="quote" data-r="up" style={cssVars({ "--i": 2 })}>Every frame is a <em>signal.</em></p>
          <div data-r="up" style={cssVars({ "--i": 3 })}><Link href="/" className="btn btn-s">Back to World of RAAKA</Link></div>
        </div>
      </section>

      <footer className="foot">
        <span>World of RAAKA</span><span>Fan-created video archive</span><span className="tnum">{year}</span>
      </footer>
    </main>
  );
}

const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@400;500&display=swap");
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#030304}
.vp{--ink:#030304;--moon:#E8ECF3;--steel:#8A93A3;--ember:#E5303A;--line:rgba(232,236,243,.12);--ease:cubic-bezier(.2,.7,.2,1);--cine:cubic-bezier(.77,0,.18,1);position:relative;min-height:100vh;overflow-x:hidden;background:var(--ink);color:var(--moon);font-family:"Archivo",ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.vp button{font:inherit;color:inherit;cursor:pointer;background:none;border:0;padding:0}.vp a{color:inherit;text-decoration:none}.vp ul{list-style:none;margin:0;padding:0}
.vp ::selection{background:rgba(229,48,58,.45)}
.xp{font-stretch:125%;font-variation-settings:"wdth" 125;text-transform:uppercase}.tnum{font-variant-numeric:tabular-nums}
.vp a:focus-visible,.vp button:focus-visible{outline:2px solid var(--moon);outline-offset:3px}
.wrap{max-width:84rem;margin:0 auto;padding:0 1.25rem}@media(min-width:768px){.wrap{padding:0 3rem}}
.progress{position:fixed;top:0;left:0;right:0;height:2px;z-index:90;transform-origin:left;transform:scaleX(0);background:linear-gradient(90deg,var(--ember),var(--moon))}
.grain{position:fixed;inset:0;z-index:70;pointer-events:none;opacity:.07;mix-blend-mode:overlay;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}

[data-r="up"]{opacity:0;transform:translateY(26px);transition:opacity .9s ease calc(var(--i,0)*.1s),transform .9s var(--ease) calc(var(--i,0)*.1s)}
[data-r="line"]{display:block;overflow:hidden;padding-bottom:.1em}
[data-r="line"]>span{display:block;transform:translateY(108%);transition:transform 1.1s var(--ease) calc(var(--l,0)*.14s)}
[data-r="logo"]{opacity:0;clip-path:inset(0 50% 0 50%);filter:blur(14px);transition:clip-path 1.5s var(--cine),opacity 1s,filter 1.4s var(--ease)}
[data-r="up"].in{opacity:1;transform:none}[data-r="line"].in>span{transform:none}[data-r="logo"].in{opacity:1;clip-path:inset(-20px);filter:none}

.nav{position:fixed;inset:0 0 auto 0;z-index:60;padding:1.2rem 1.25rem;border-bottom:1px solid transparent;opacity:0;transition:padding .5s var(--ease),background .5s,backdrop-filter .5s,border-color .5s}
.nav.go{animation:fade 1.2s ease 1.6s both}.nav.s{padding:.65rem 1.25rem;background:rgba(3,3,4,.78);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-color:var(--line)}
@media(min-width:768px){.nav,.nav.s{padding-inline:3rem}}
@keyframes fade{from{opacity:0}to{opacity:1}}
.nav-in{display:flex;max-width:84rem;margin:0 auto;align-items:center;justify-content:space-between}
.brand{display:flex;align-items:center;gap:1rem}.logo-s{display:block;height:30px;width:auto}
.brand-t{padding-left:1rem;border-left:1px solid var(--line);font:500 .62rem "DM Mono",monospace;letter-spacing:.24em;text-transform:uppercase;color:var(--steel)}
.back{font:500 .62rem "DM Mono",monospace;letter-spacing:.22em;text-transform:uppercase;color:rgba(232,236,243,.55);transition:color .3s,transform .4s var(--ease)}.back:hover{color:#fff;transform:translateX(-4px)}

/* hero: the projector comes on */
.hero{position:relative;min-height:88svh;display:flex;align-items:flex-end;overflow:hidden;isolation:isolate;--sy:0px;background:radial-gradient(ellipse at 50% -10%,rgba(138,147,163,.1),transparent 55%)}
.beam{position:absolute;z-index:-2;top:-5%;left:50%;width:150%;height:130%;margin-left:-75%;mix-blend-mode:screen;opacity:0;clip-path:polygon(47% 0,53% 0,100% 100%,0 100%);background:linear-gradient(180deg,rgba(220,230,250,.28),rgba(190,205,235,.07) 60%,transparent);transform:translate3d(0,calc(var(--sy)*.18),0)}
.beam.b2{clip-path:polygon(49% 0,51% 0,78% 100%,22% 100%);background:linear-gradient(180deg,rgba(255,255,255,.2),transparent 80%)}
.hero.go .beam{animation:beamOn 2.4s var(--ease) .2s both,beamLive 7s ease-in-out 2.6s infinite alternate}
@keyframes beamOn{0%{opacity:0}30%{opacity:.75}42%{opacity:.35}70%{opacity:.9}100%{opacity:.7}}
@keyframes beamLive{from{opacity:.6}to{opacity:.85}}
.vig{position:absolute;inset:0;z-index:-1;background:radial-gradient(ellipse at 50% 55%,transparent 35%,rgba(0,0,0,.8))}
.hero-in{width:100%;max-width:84rem;margin:0 auto;padding:8rem 1.25rem 3.2rem}@media(min-width:768px){.hero-in{padding:9rem 3rem 4rem}}
.kick{margin:0;display:flex;align-items:center;gap:1rem;font:italic 400 1.5rem "Instrument Serif",Georgia,serif;color:var(--steel);opacity:0}.kick::before{content:"";width:3rem;height:1px;background:var(--ember)}
.hero.go .kick{animation:rise 1.2s var(--ease) 1.2s both}
@keyframes rise{from{opacity:0;transform:translateY(20px);filter:blur(5px)}to{opacity:1;transform:none;filter:none}}
.h1{margin:.6rem 0 0;font-weight:900;line-height:.86;letter-spacing:-.045em;font-size:clamp(3.4rem,15vw,14rem)}
.hl{display:block;overflow:hidden;padding:.04em .02em .1em}.hl>span{display:block;transform:translateY(110%);filter:brightness(.3)}
.hero.go .hl>span{animation:lit 1.5s var(--ease) both;animation-delay:calc(1.3s + var(--l)*.18s)}
@keyframes lit{from{transform:translateY(110%);filter:brightness(.3)}60%{filter:brightness(.6)}to{transform:none;filter:none}}
.hl.dim{color:transparent;-webkit-text-stroke:1.5px rgba(232,236,243,.55)}
.hero-row{margin-top:2.4rem;padding-top:1.6rem;border-top:1px solid var(--line);display:flex;flex-direction:column;gap:1.8rem;opacity:0}.hero.go .hero-row{animation:rise 1.2s var(--ease) 2.3s both}
@media(min-width:900px){.hero-row{flex-direction:row;align-items:flex-end;justify-content:space-between}}
.lead{margin:0;max-width:30rem;font-size:.95rem;line-height:1.85;color:rgba(232,236,243,.55)}
.stats{margin:0;display:flex;gap:2.4rem}.stats dt{font:500 .6rem "DM Mono",monospace;letter-spacing:.26em;text-transform:uppercase;color:var(--steel)}.stats dd{margin:.45rem 0 0;font-size:1.5rem;font-weight:800;white-space:nowrap}
.cue{display:inline-flex;align-items:center;gap:.8rem;margin-top:2rem;font:500 .64rem "DM Mono",monospace;letter-spacing:.26em;text-transform:uppercase;color:rgba(232,236,243,.7);opacity:0;transition:color .3s}.hero.go .cue{animation:rise 1.2s var(--ease) 2.7s both}
.cue i{font-style:normal;display:inline-block;animation:bob 2s ease-in-out infinite}.cue:hover{color:#fff}
@keyframes bob{50%{transform:translateY(4px)}}

/* theatre */
.th{padding:5rem 0 7rem;border-top:1px solid var(--line)}@media(min-width:768px){.th{padding:8rem 0 9rem}}
.th-head{display:flex;flex-direction:column;gap:1.8rem;margin-bottom:3rem}@media(min-width:900px){.th-head{flex-direction:row;align-items:flex-end;justify-content:space-between;margin-bottom:4rem}}
.kk{display:flex;align-items:center;gap:.9rem;margin:0;font:italic 400 1.3rem "Instrument Serif",Georgia,serif;color:var(--steel)}.kk::before{content:"";width:0;height:1px;background:var(--ember);transition:width 1.1s var(--ease) .2s}.kk.in::before{width:2.8rem}
.h2{margin:.7rem 0 0;font-weight:800;font-size:clamp(2.8rem,8vw,6.5rem);line-height:.9;letter-spacing:-.04em}.h2 .dim{color:transparent;-webkit-text-stroke:1px rgba(232,236,243,.5)}
.filters{display:flex;flex-wrap:wrap;gap:.5rem}
.chip{padding:.6rem 1rem;border:1px solid var(--line)!important;border-radius:9999px;font:500 .6rem "DM Mono",monospace;letter-spacing:.2em;color:var(--steel);transition:border-color .3s,color .3s,background .3s}
.chip:hover{color:var(--moon);border-color:rgba(232,236,243,.4)!important}.chip.on{background:var(--moon);color:var(--ink);border-color:var(--moon)!important}
.th-grid{display:grid;gap:3rem}@media(min-width:1024px){.th-grid{grid-template-columns:minmax(0,1fr) 23rem;gap:3.5rem;align-items:start}}
.main{position:relative;isolation:isolate;min-width:0}
.amb{position:absolute;z-index:-1;inset:-6% -5% 28% -5%;pointer-events:none}
.amb-in{position:absolute;inset:0;filter:blur(70px) saturate(1.5);opacity:.5;animation:ambIn 1.2s ease both}.amb-in img{width:100%;height:100%;object-fit:cover}
.amb-tint{position:absolute;inset:0;opacity:.1;mix-blend-mode:screen;filter:blur(60px);transition:background .8s}
@keyframes ambIn{from{opacity:0}to{opacity:.5}}
.screen-wrap{transform:scale(clamp(.9,calc(.86 + var(--p,.5)*.3),1));transform-origin:50% 100%}
.screen{position:relative;aspect-ratio:16/9;background:#000;box-shadow:0 0 0 1px rgba(232,236,243,.16),0 50px 110px -40px rgba(0,0,0,.95)}
.screen::before{content:"";position:absolute;inset:-9px;border:1px solid rgba(232,236,243,.06);pointer-events:none}
.screen-in{position:absolute;inset:0;overflow:hidden;animation:cut .8s var(--cine) both}
@keyframes cut{from{clip-path:inset(0 0 100% 0);filter:brightness(.3)}to{clip-path:inset(0);filter:none}}
.player{position:absolute;inset:0;width:100%;height:100%;border:0;background:#000}
.facade{position:absolute;inset:0;width:100%;display:block;overflow:hidden}
.facade img{width:100%;height:100%;object-fit:cover;filter:saturate(.9) contrast(1.04);transform:scale(1.04);transition:transform 1.6s var(--ease),filter .6s}
.f-shade{position:absolute;inset:0;background:linear-gradient(0deg,rgba(3,3,4,.75),transparent 55%),rgba(3,3,4,.15)}
.f-sweep{position:absolute;inset:0;pointer-events:none;background:linear-gradient(112deg,transparent 30%,rgba(235,240,255,.18) 48%,transparent 64%);transform:translateX(-130%)}
.f-tag{position:absolute;top:1rem;left:1rem;padding:.35rem .8rem;border:1px solid rgba(232,236,243,.25);border-radius:9999px;background:rgba(3,3,4,.6);backdrop-filter:blur(8px);font:500 .56rem "DM Mono",monospace;letter-spacing:.24em;text-transform:uppercase}
.f-play{position:absolute;left:50%;top:50%;width:4.6rem;height:4.6rem;margin:-2.3rem 0 0 -2.3rem;display:grid;place-items:center;border:1px solid rgba(232,236,243,.5);border-radius:50%;background:rgba(3,3,4,.35);backdrop-filter:blur(6px);transition:transform .6s var(--ease),background .4s,color .4s}
.f-play svg{margin-left:3px}
.f-hint{position:absolute;left:1.1rem;bottom:1rem;font:500 .6rem "DM Mono",monospace;letter-spacing:.3em;text-transform:uppercase;color:rgba(232,236,243,.75)}
@media(hover:hover){.facade:hover img{transform:scale(1.09);filter:saturate(1.05)}.facade:hover .f-sweep{transform:translateX(130%);transition:transform 1.2s var(--ease)}.facade:hover .f-play{transform:scale(1.1);background:var(--moon);color:var(--ink)}}
.bar{display:flex;align-items:center;gap:1rem;margin:1.4rem 0 0;font:500 .6rem "DM Mono",monospace;letter-spacing:.26em;text-transform:uppercase;color:var(--steel)}.bar i{width:2rem;height:1px;background:var(--steel)}

.info{margin-top:1.8rem;animation:infoIn .9s var(--ease) both}
@keyframes infoIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
.meta{display:flex;flex-wrap:wrap;align-items:center;gap:1rem}
.no{font-size:3rem;font-weight:900;line-height:.8;letter-spacing:-.05em;color:transparent;-webkit-text-stroke:1px rgba(232,236,243,.55)}
.pill{padding:.35rem .8rem;border:1px solid;border-radius:9999px;font:500 .58rem "DM Mono",monospace;letter-spacing:.22em}
.meta time{font:500 .62rem "DM Mono",monospace;letter-spacing:.22em;color:var(--steel)}
.title{margin:1.2rem 0 0;font-weight:800;font-size:clamp(1.8rem,4vw,3.4rem);line-height:.98;letter-spacing:-.035em}
.sub{margin:1rem 0 0;font:italic 400 1.35rem "Instrument Serif",Georgia,serif;color:rgba(232,236,243,.6)}
.acts{display:flex;flex-wrap:wrap;align-items:center;gap:.7rem;margin-top:1.8rem}
.btn{position:relative;overflow:hidden;display:inline-flex;align-items:center;gap:.7rem;border-radius:9999px;padding:.95rem 1.5rem;font-size:.64rem;font-weight:700;letter-spacing:.22em;text-transform:uppercase;transition:transform .4s var(--ease),background .3s,border-color .3s}
.btn i{font-style:normal}.btn:hover{transform:translateY(-2px)}
.btn::after{content:"";position:absolute;top:0;bottom:0;width:40%;left:-60%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.35),transparent);transform:skewX(-20deg)}.btn:hover::after{left:130%;transition:left .8s}
.btn-s{background:var(--moon);color:var(--ink)}.btn-s:hover{background:#fff}
.btn-g{border:1px solid var(--line);background:rgba(232,236,243,.05)}.btn-g:hover{border-color:var(--moon)}
.stepper{display:inline-flex;align-items:center;gap:.8rem;margin-left:auto;font:500 .62rem "DM Mono",monospace;letter-spacing:.18em;color:var(--steel)}
.stepper button{width:2.6rem;height:2.6rem;border:1px solid var(--line)!important;border-radius:50%;transition:border-color .3s,transform .4s var(--ease)}.stepper button:hover{border-color:var(--moon)!important;transform:scale(1.08)}

/* queue */
.queue{min-width:0}@media(min-width:1024px){.queue{position:sticky;top:5.5rem}}
.q-h{display:flex;justify-content:space-between;margin:0 0 .8rem;padding-bottom:.9rem;border-bottom:1px solid var(--line);font:500 .6rem "DM Mono",monospace;letter-spacing:.28em;text-transform:uppercase;color:var(--steel)}
.row{position:relative;display:grid;grid-template-columns:8.4rem 1fr;gap:1rem;width:100%;padding:.8rem;text-align:left;border-bottom:1px solid var(--line);transition:background .4s,padding .5s var(--ease)}
.row::before{content:"";position:absolute;left:0;top:0;bottom:0;width:2px;background:var(--ember);transform:scaleY(0);transition:transform .6s var(--ease)}
.row:hover,.row.act{background:rgba(232,236,243,.04)}.row.act::before{transform:scaleY(1)}
.th-img{position:relative;aspect-ratio:16/9;overflow:hidden;background:#0a0a0d}.th-img img{width:100%;height:100%;object-fit:cover;filter:saturate(.8);transition:transform 1s var(--ease),filter .5s}
.row:hover .th-img img{transform:scale(1.08);filter:none}.row.act .th-img img{filter:none}
.th-no{position:absolute;left:.4rem;bottom:.3rem;font:500 .56rem "DM Mono",monospace;letter-spacing:.14em;text-shadow:0 1px 6px #000}
.row-t{min-width:0;display:flex;flex-direction:column;justify-content:center;gap:.35rem}
.row-t small{font:500 .52rem "DM Mono",monospace;letter-spacing:.22em;color:var(--steel)}
.row-t b{font-size:.8rem;font-weight:700;line-height:1.15;letter-spacing:-.01em;overflow-wrap:anywhere}
.row-t em{display:flex;align-items:center;gap:.6rem;font:italic 400 1rem "Instrument Serif",Georgia,serif;color:var(--steel)}.row.act .row-t em{color:var(--ember)}
.claws{display:flex;align-items:flex-end;gap:2px;height:11px}.claws i{display:block;width:2px;height:100%;border-radius:2px;background:linear-gradient(var(--moon),var(--ember));transform:skewX(-20deg) scaleY(.25);transform-origin:bottom;animation:claw .9s ease-in-out infinite;animation-delay:calc(var(--i)*-.2s)}
@keyframes claw{50%{transform:skewX(-20deg) scaleY(1)}}
.empty{margin:0;padding:3rem 0;color:var(--steel)}

/* closing */
.end{position:relative;overflow:hidden;border-top:1px solid var(--line);padding:9rem 1.25rem;text-align:center;background:radial-gradient(ellipse at 50% 55%,rgba(229,48,58,.09),transparent 55%)}@media(min-width:768px){.end{padding:13rem 3rem}}
.end-shaft{position:absolute;top:-20%;bottom:-20%;left:0;width:22%;background:linear-gradient(90deg,transparent,rgba(210,222,245,.06),transparent);transform:rotate(14deg);animation:endshaft 14s ease-in-out infinite alternate}
@keyframes endshaft{from{left:-10%}to{left:90%}}
.end-in{position:relative;display:flex;flex-direction:column;align-items:center;gap:1.8rem}
.logo-b{position:relative}.logo-l{display:block;width:min(72vw,440px);height:auto;filter:drop-shadow(0 0 40px rgba(229,48,58,.25));animation:breathe 5s ease-in-out infinite}
@keyframes breathe{50%{filter:drop-shadow(0 0 60px rgba(232,236,243,.28))}}
.quote{margin:.6rem 0 1.2rem;font:400 clamp(1.8rem,4.4vw,3.2rem) "Instrument Serif",Georgia,serif;color:var(--moon)}.quote em{color:var(--ember)}
.foot{display:flex;flex-wrap:wrap;justify-content:space-between;gap:.8rem;max-width:84rem;margin:0 auto;padding:1.8rem 1.25rem 2.4rem;border-top:1px solid var(--line);font:500 .58rem "DM Mono",monospace;letter-spacing:.24em;text-transform:uppercase;color:rgba(232,236,243,.3)}@media(min-width:768px){.foot{padding-inline:3rem}}

@media(max-width:600px){.logo-s{height:26px}.brand-t{display:none}.row{grid-template-columns:6.6rem 1fr}.stepper{margin-left:0}.f-play{width:3.8rem;height:3.8rem;margin:-1.9rem 0 0 -1.9rem}.stats{gap:1.4rem}}
@media (prefers-reduced-motion:reduce){
html{scroll-behavior:auto}.grain{display:none}
.beam,.kick,.hl>span,.hero-row,.cue,.cue i,.nav,.screen-in,.info,.amb-in,.claws i,.logo-l,.end-shaft{animation:none!important}
.beam{opacity:.6}.kick,.hero-row,.cue,.nav{opacity:1!important}.hl>span{transform:none!important;filter:none!important}
.screen-wrap{transform:none!important}
[data-r]{opacity:1!important;transform:none!important;clip-path:none!important;filter:none!important;transition:opacity .4s!important}[data-r="line"]>span{transform:none!important;transition:none!important}
}
`;
