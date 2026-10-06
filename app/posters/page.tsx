"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react";

const cssVars = (o: Record<string, string | number>) => o as unknown as CSSProperties;

/* =====================================================================
   POSTER ARCHIVE: DATA
   To add a new poster later, append one object to PLATES. Everything
   (plate counter, plate rail, viewer arrows, keyboard) switches on by itself.
   ===================================================================== */
type Plate = { no: string; title: string; date: string; src: string; alt: string };

const PLATES: Plate[] = [
  { no: "001", title: "First Look", date: "08 APRIL 2026", src: "/images/RAAKAFL.jpg", alt: "RAAKA First Look poster" },
];

const FACTS: [string, string][] = [
  ["Language", "Telugu"],
  ["Genre", "Sci-Fi"],
  ["Director", "Atlee Kumar"],
  ["Lead", "Allu Arjun"],
  ["Revealed", "08 April 2026"],
  ["Status", "Coming Soon"],
];
const fact = (k: string) => FACTS.find(([l]) => l === k)?.[1] ?? "";

/* the logo is used exactly twice on this page: <Logo> in the nav and <Logo> in the closing scene */
const Logo = ({ className, decorative }: { className: string; decorative?: boolean }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src="/images/raaka-logo.png" alt={decorative ? "" : "RAAKA"} aria-hidden={decorative || undefined} draggable={false} className={className} />
);

const Letters = ({ w }: { w: string }) => (
  <>
    {w.split("").map((c, i) => (
      <span key={i} className="lt-w" aria-hidden="true"><span className="lt" style={cssVars({ "--i": i })}>{c}</span></span>
    ))}
  </>
);

export default function RaakaPosterPage() {
  const [plateIdx, setPlateIdx] = useState(0);
  const [go, setGo] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [viewer, setViewer] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [year, setYear] = useState(2026);

  const heroRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const progRef = useRef<HTMLDivElement>(null);
  const vImgRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const plate = PLATES[plateIdx];
  const multi = PLATES.length > 1;

  /* start the "developing" intro once the poster is in (or after a safety delay) */
  const ready = () => setGo(true);
  useEffect(() => { setYear(new Date().getFullYear()); const t = window.setTimeout(ready, 2500); return () => window.clearTimeout(t); }, []);

  /* scroll loop, reveals, pointer-driven 3D tilt */
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canHover = window.matchMedia("(hover: hover)").matches;
    let raf = 0;
    const run = () => {
      raf = 0;
      const h = document.documentElement, max = h.scrollHeight - h.clientHeight;
      progRef.current?.style.setProperty("transform", "scaleX(" + (max > 0 ? h.scrollTop / max : 0) + ")");
      setScrolled(h.scrollTop > 40);
      if (!reduce) heroRef.current?.style.setProperty("--sy", Math.min(h.scrollTop, 900) + "px");
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(run); };
    run();
    window.addEventListener("scroll", on, { passive: true });

    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    document.querySelectorAll("[data-r]").forEach((el) => io.observe(el));

    const stage = stageRef.current;
    const cur = { rx: 0, ry: 0, gx: 50, gy: 30, px: 0, py: 0 };
    const tgt = { ...cur };
    let praf = 0;
    const loop = () => {
      let moving = false;
      (Object.keys(cur) as (keyof typeof cur)[]).forEach((k) => {
        cur[k] += (tgt[k] - cur[k]) * 0.08;
        if (Math.abs(tgt[k] - cur[k]) > 0.01) moving = true;
        stage?.style.setProperty("--" + k, k === "rx" || k === "ry" ? cur[k].toFixed(2) + "deg" : k === "gx" || k === "gy" ? cur[k].toFixed(1) + "%" : cur[k].toFixed(3));
      });
      praf = moving ? requestAnimationFrame(loop) : 0;
    };
    const move = (e: PointerEvent) => {
      if (!stage) return;
      const r = stage.getBoundingClientRect();
      const x = Math.min(1, Math.max(-1, ((e.clientX - r.left) / r.width - 0.5) * 2));
      const y = Math.min(1, Math.max(-1, ((e.clientY - r.top) / r.height - 0.5) * 2));
      tgt.rx = -y * 7; tgt.ry = x * 9; tgt.gx = 50 + x * 45; tgt.gy = 45 + y * 45; tgt.px = x; tgt.py = y;
      if (!praf) praf = requestAnimationFrame(loop);
    };
    const leave = () => { Object.assign(tgt, { rx: 0, ry: 0, gx: 50, gy: 30, px: 0, py: 0 }); if (!praf) praf = requestAnimationFrame(loop); };
    if (canHover && !reduce) { stage?.addEventListener("pointermove", move); stage?.addEventListener("pointerleave", leave); }

    return () => {
      window.removeEventListener("scroll", on);
      if (raf) cancelAnimationFrame(raf); if (praf) cancelAnimationFrame(praf);
      stage?.removeEventListener("pointermove", move); stage?.removeEventListener("pointerleave", leave);
      io.disconnect();
    };
  }, []);

  /* viewer */
  const openViewer = () => { lastFocus.current = document.activeElement as HTMLElement; setZoomed(false); setViewer(true); };
  const closeViewer = () => {
    setLeaving(true);
    window.setTimeout(() => { setViewer(false); setLeaving(false); setZoomed(false); lastFocus.current?.focus(); }, 380);
  };
  const stepPlate = (d: number) => setPlateIdx((i) => (i + d + PLATES.length) % PLATES.length);

  useEffect(() => { document.body.style.overflow = viewer ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [viewer]);
  useEffect(() => {
    if (!viewer) return;
    closeRef.current?.focus();
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeViewer();
      if (multi && e.key === "ArrowRight") stepPlate(1);
      if (multi && e.key === "ArrowLeft") stepPlate(-1);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewer, multi]);

  const panZoom = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!zoomed) return;
    const r = e.currentTarget.getBoundingClientRect();
    vImgRef.current?.style.setProperty("transform-origin", `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
  };
  const toggleZoom = (e: ReactMouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    vImgRef.current?.style.setProperty("transform-origin", `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
    setZoomed((z) => !z);
  };

  const callout = (label: string, i: number) => (
    <div className="co" style={cssVars({ "--i": i })}><small>{label}</small><b className="xp">{fact(label)}</b></div>
  );

  return (
    <main className="pp">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="progress" ref={progRef} aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      {/* ============ NAV (logo, use 1 of 2) ============ */}
      <header className={"nav" + (scrolled ? " s" : "") + (go ? " go" : "")}>
        <div className="nav-in">
          <Link href="/" className="brand" aria-label="World of RAAKA, back to home">
            <Logo className="logo-s" />
            <span className="brand-t">Poster Archive</span>
          </Link>
          <Link href="/" className="back">← Back to World</Link>
        </div>
      </header>

      {/* ============ HERO: the plate ============ */}
      <section ref={heroRef} className={"hero" + (go ? " go" : "")} aria-labelledby="pp-h1">
        <div className="amb" aria-hidden="true">
          <div className="amb-in"><Image src={plate.src} alt="" fill sizes="50vw" className="object-cover" /></div>
        </div>
        <div className="shaft" aria-hidden="true" />
        <div className="vig" aria-hidden="true" />

        <div ref={stageRef} className="stage">
          <h1 id="pp-h1" className="giant xp" aria-label="RAAKA"><Letters w="RAAKA" /></h1>

          <aside className="col l" aria-label="Plate">
            <div className="co plate-no" style={cssVars({ "--i": 0 })}>
              <small>Plate</small>
              <b className="xp">{plate.no}</b>
              <em>{plate.title}</em>
              {multi && (
                <div className="rail" role="group" aria-label="Posters">
                  {PLATES.map((p, i) => (
                    <button key={p.no} type="button" className={i === plateIdx ? "on" : ""} onClick={() => setPlateIdx(i)} aria-label={`Poster ${p.no}: ${p.title}`} aria-pressed={i === plateIdx}>{p.no}</button>
                  ))}
                </div>
              )}
            </div>
            <div className="pair">{callout("Language", 1)}{callout("Genre", 2)}</div>
          </aside>

          <div className="wrap-p">
            <div className="tilt">
              <button type="button" className="frame" onClick={openViewer} aria-label="Open RAAKA poster full screen">
                <Image src={plate.src} alt={plate.alt} fill priority sizes="(max-width: 900px) 72vw, 460px" className="p-img" onLoad={ready} />
                <span className="sheen" aria-hidden="true" />
                <span className="foil" aria-hidden="true" />
                <span className="dev-bar" aria-hidden="true" />
                <span className="hint" aria-hidden="true">Tap to inspect</span>
              </button>
              <span className="cast" aria-hidden="true" />
            </div>
          </div>

          <aside className="col r" aria-label="Details">
            <div className="co rev" style={cssVars({ "--i": 1 })}><small>Revealed</small><b className="xp">{plate.date.replace("APRIL", "APR")}</b></div>
            <div className="pair">{callout("Director", 2)}{callout("Status", 3)}</div>
          </aside>
        </div>

        <div className="h-bar">
          <p className="h-tag">A new world begins</p>
          <div className="h-cta">
            <button type="button" className="btn btn-s" onClick={openViewer}>Inspect the poster <i aria-hidden="true">↗</i></button>
            <a className="btn btn-g" href="#details">Explore details <i aria-hidden="true">↓</i></a>
          </div>
        </div>
      </section>

      <div className="mq" aria-hidden="true">
        <div className="mq-t xp">
          {Array.from({ length: 2 }).flatMap((_, k) => ["The First Look", "RAAKA", "A new world begins", fact("Language"), fact("Genre"), fact("Status")].map((t, i) => (<span key={k + "-" + i}>{t}<em>●</em></span>)))}
        </div>
      </div>

      {/* ============ DETAILS ============ */}
      <section id="details" className="det">
        <div className="wrap">
          <p className="kk" data-r="up">Poster Archive / {plate.no}</p>
          <div className="det-top">
            <h2 className="h2 xp">
              <span data-r="line"><span>The First</span></span>
              <span data-r="line" className="dim"><span style={cssVars({ "--l": 1 })}>Look.</span></span>
            </h2>
            <p className="copy" data-r="up">
              The first-look poster of RAAKA, revealed on {fact("Revealed")} together with the film&apos;s official title. {fact("Lead")} leads a {fact("Language")} {fact("Genre")} directed by {fact("Director")}. Status: {fact("Status").toLowerCase()}.
            </p>
          </div>

          <dl className="facts">
            {FACTS.map(([l, v], i) => (
              <div key={l} data-r="up" style={cssVars({ "--i": i % 3 })}>
                <dt><span className="tnum">{String(i + 1).padStart(2, "0")}</span>{l}</dt>
                <dd className="xp">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="look" data-r="up">
            <p className="look-t xp">Look closer.</p>
            <button type="button" className="btn btn-s" onClick={openViewer}>Open the poster <i aria-hidden="true">↗</i></button>
          </div>
        </div>
      </section>

      {/* ============ CLOSING (logo, use 2 of 2) ============ */}
      <section className="end" aria-label="RAAKA">
        <div className="end-shaft" aria-hidden="true" />
        <div className="end-in">
          <div className="logo-b" data-r="logo"><Logo className="logo-l" decorative /></div>
          <p className="end-t" data-r="up" style={cssVars({ "--i": 2 })}>A new world begins</p>
          <div data-r="up" style={cssVars({ "--i": 3 })}><Link href="/" className="btn btn-s">Back to World of RAAKA</Link></div>
        </div>
      </section>

      <footer className="foot">
        <span>World of RAAKA</span><span>Poster Archive / {plate.no}</span><span className="tnum">{year}</span>
      </footer>

      {/* ============ VIEWER ============ */}
      {viewer && (
        <div className={"vw" + (leaving ? " out" : "")} role="dialog" aria-modal="true" aria-label={plate.alt} onClick={closeViewer}>
          <div className="vw-top" onClick={(e) => e.stopPropagation()}>
            <span className="tnum">{plate.no} / {String(PLATES.length).padStart(3, "0")}</span>
            <span>{plate.title}</span>
            <button ref={closeRef} type="button" className="vw-x" onClick={closeViewer} aria-label="Close poster"><i /><i /></button>
          </div>
          <div className={"vw-poster" + (zoomed ? " z" : "")} onClick={(e) => { e.stopPropagation(); toggleZoom(e); }} onPointerMove={panZoom}>
            <div className="vw-img" ref={vImgRef}>
              <Image src={plate.src} alt={plate.alt + " enlarged"} fill sizes="92vw" className="object-contain" priority />
            </div>
          </div>
          <p className="vw-hint" onClick={(e) => e.stopPropagation()}>{zoomed ? "Move to pan, click to zoom out" : "Click the poster to zoom in"}</p>
          {multi && (
            <>
              <button type="button" className="vw-nav p" onClick={(e) => { e.stopPropagation(); stepPlate(-1); }} aria-label="Previous poster">←</button>
              <button type="button" className="vw-nav n" onClick={(e) => { e.stopPropagation(); stepPlate(1); }} aria-label="Next poster">→</button>
            </>
          )}
        </div>
      )}
    </main>
  );
}

const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@400;500&display=swap");
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#030304}
.pp{--ink:#030304;--moon:#E8ECF3;--steel:#8A93A3;--ember:#E5303A;--line:rgba(232,236,243,.12);--ease:cubic-bezier(.2,.7,.2,1);--cine:cubic-bezier(.77,0,.18,1);position:relative;min-height:100vh;overflow-x:hidden;background:var(--ink);color:var(--moon);font-family:"Archivo",ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.pp button{font:inherit;color:inherit;cursor:pointer;background:none;border:0;padding:0}.pp a{color:inherit;text-decoration:none}
.pp ::selection{background:rgba(229,48,58,.45)}
.xp{font-stretch:125%;font-variation-settings:"wdth" 125;text-transform:uppercase}.tnum{font-variant-numeric:tabular-nums}
.pp a:focus-visible,.pp button:focus-visible{outline:2px solid var(--moon);outline-offset:3px}
.wrap{max-width:80rem;margin:0 auto;padding:0 1.25rem}@media(min-width:768px){.wrap{padding:0 3rem}}
.progress{position:fixed;top:0;left:0;right:0;height:2px;z-index:90;transform-origin:left;transform:scaleX(0);background:linear-gradient(90deg,var(--ember),var(--moon))}
.grain{position:fixed;inset:0;z-index:70;pointer-events:none;opacity:.07;mix-blend-mode:overlay;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}

/* reveal system */
[data-r="up"]{opacity:0;transform:translateY(26px);transition:opacity .9s ease calc(var(--i,0)*.1s),transform .9s var(--ease) calc(var(--i,0)*.1s)}
[data-r="line"]{display:block;overflow:hidden;padding-bottom:.1em}
[data-r="line"]>span{display:block;transform:translateY(108%);transition:transform 1.1s var(--ease) calc(var(--l,0)*.14s)}
[data-r="logo"]{opacity:0;clip-path:inset(0 50% 0 50%);filter:blur(14px);transition:clip-path 1.5s var(--cine),opacity 1s,filter 1.4s var(--ease)}
[data-r="up"].in{opacity:1;transform:none}[data-r="line"].in>span{transform:none}[data-r="logo"].in{opacity:1;clip-path:inset(-20px);filter:none}

/* nav */
.nav{position:fixed;inset:0 0 auto 0;z-index:60;padding:1.2rem 1.25rem;border-bottom:1px solid transparent;opacity:0;transition:padding .5s var(--ease),background .5s,backdrop-filter .5s,border-color .5s}
.nav.go{animation:fade 1.2s ease 2.4s both}.nav.s{padding:.65rem 1.25rem;background:rgba(3,3,4,.78);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-color:var(--line)}
@media(min-width:768px){.nav,.nav.s{padding-inline:3rem}}
@keyframes fade{from{opacity:0}to{opacity:1}}
.nav-in{display:flex;max-width:80rem;margin:0 auto;align-items:center;justify-content:space-between}
.brand{display:flex;align-items:center;gap:1rem}.logo-s{display:block;height:30px;width:auto}
.brand-t{padding-left:1rem;border-left:1px solid var(--line);font:500 .62rem "DM Mono",monospace;letter-spacing:.24em;text-transform:uppercase;color:var(--steel)}
.back{font:500 .62rem "DM Mono",monospace;letter-spacing:.22em;text-transform:uppercase;color:rgba(232,236,243,.55);transition:color .3s,transform .4s var(--ease)}.back:hover{color:#fff;transform:translateX(-4px)}
@media(max-width:520px){.brand-t{display:none}}

/* hero */
.hero{position:relative;min-height:100svh;display:flex;flex-direction:column;overflow:hidden;padding-top:5.5rem;isolation:isolate;--sy:0px}
.amb{position:absolute;inset:0;z-index:-3;opacity:0}
.amb-in{position:absolute;inset:-12%;filter:blur(80px) saturate(1.4) brightness(.8);transform:translate3d(calc(var(--px,0)*-24px),calc(var(--py,0)*-18px),0)}
.hero.go .amb{animation:amb 6s ease-in-out 1.4s infinite alternate;opacity:.4}
@keyframes amb{from{opacity:.28}to{opacity:.55}}
.shaft{position:absolute;z-index:-2;top:-20%;bottom:-20%;left:44%;width:16%;mix-blend-mode:screen;background:linear-gradient(90deg,transparent,rgba(190,205,230,.08),transparent);transform:rotate(14deg);animation:shaft 18s ease-in-out infinite alternate}
@keyframes shaft{from{transform:translateX(-14vw) rotate(14deg)}to{transform:translateX(16vw) rotate(14deg)}}
.vig{position:absolute;inset:0;z-index:-1;background:radial-gradient(ellipse at 50% 46%,transparent 38%,rgba(0,0,0,.78))}

.stage{--rx:0deg;--ry:0deg;--gx:50%;--gy:30%;--px:0;--py:0;position:relative;flex:1;display:grid;grid-template-columns:1fr;place-items:center;gap:1.8rem;padding:1.2rem 1.25rem;min-height:30rem}
@media(min-width:1000px){.stage{grid-template-columns:1fr auto 1fr;gap:3rem;padding:1.5rem 3rem;max-width:84rem;margin:0 auto;width:100%}}

/* giant outlined title behind the poster */
.giant{position:absolute;left:50%;top:50%;z-index:0;margin:0;display:flex;font-weight:900;line-height:.8;letter-spacing:-.04em;font-size:clamp(5.2rem,24vw,31rem);white-space:nowrap;pointer-events:none;user-select:none;transform:translate3d(calc(-50% + var(--px,0)*-14px + var(--sy)*-.2),calc(-50% + var(--py,0)*-8px),0)}
.lt-w{display:inline-block;overflow:hidden;padding:.03em .02em .08em}
.lt{display:inline-block;color:rgba(232,236,243,.025);-webkit-text-stroke:1.5px rgba(232,236,243,.34);transform:translateY(106%);transition:none}
.hero.go .lt{animation:lt 1.5s var(--ease) both;animation-delay:calc(1.5s + var(--i)*.11s)}
@keyframes lt{from{transform:translateY(106%) skewY(7deg)}to{transform:none}}

.wrap-p{position:relative;z-index:2;width:min(68vw,330px);transform:translate3d(0,calc(var(--sy)*.12),0) scale(calc(1 - var(--sy)/5200))}
@media(min-width:1000px){.wrap-p{width:calc(min(66vh,720px)*.6667)}}
@media(min-width:1000px) and (max-height:700px){.wrap-p{width:calc(60vh*.6667)}}
.tilt{position:relative;transform:perspective(1300px) rotateX(var(--rx)) rotateY(var(--ry));transform-style:preserve-3d;will-change:transform}
.frame{position:relative;display:block;width:100%;aspect-ratio:2/3;overflow:hidden;background:#0a0a0d;clip-path:inset(0 0 100% 0);box-shadow:0 0 0 1px rgba(232,236,243,.16)}
.hero.go .frame{animation:dev 2s cubic-bezier(.65,0,.35,1) .45s both}
@keyframes dev{from{clip-path:inset(0 0 100% 0)}to{clip-path:inset(0 0 0 0)}}
.p-img{object-fit:cover;filter:brightness(.35) contrast(1.5) saturate(.2) blur(8px);transform:scale(1.08)}
.hero.go .p-img{animation:develop 3.4s var(--ease) .6s both}
@keyframes develop{to{filter:brightness(1) contrast(1.04) saturate(1);transform:scale(1)}}
.dev-bar{position:absolute;left:0;right:0;top:0;height:2px;z-index:4;opacity:0;background:linear-gradient(90deg,transparent,#fff 20%,#fff 80%,transparent);box-shadow:0 0 22px 4px rgba(232,236,243,.7)}
.hero.go .dev-bar{animation:bar 2s cubic-bezier(.65,0,.35,1) .45s both}
@keyframes bar{0%{top:0;opacity:1}92%{top:100%;opacity:1}100%{top:100%;opacity:0}}
.foil{position:absolute;inset:0;z-index:3;pointer-events:none;mix-blend-mode:soft-light;background:radial-gradient(480px circle at var(--gx) var(--gy),rgba(255,255,255,.55),transparent 55%)}
.sheen{position:absolute;inset:0;z-index:3;pointer-events:none;mix-blend-mode:screen;opacity:.8;background:linear-gradient(115deg,transparent 36%,rgba(205,222,255,.18) 47%,rgba(255,196,170,.13) 53%,transparent 64%);background-size:260% 100%;background-position:calc(var(--gx)*1.1) 0}
.hint{position:absolute;left:50%;bottom:1rem;z-index:5;padding:.4rem .9rem;border-radius:9999px;background:rgba(3,3,4,.6);backdrop-filter:blur(8px);font:500 .56rem "DM Mono",monospace;letter-spacing:.24em;text-transform:uppercase;color:rgba(232,236,243,.8);opacity:0;transform:translate(-50%,8px);transition:opacity .5s,transform .6s var(--ease)}
.frame:hover .hint,.frame:focus-visible .hint{opacity:1;transform:translate(-50%,0)}
.cast{position:absolute;left:8%;right:8%;bottom:-6%;height:12%;z-index:-1;background:radial-gradient(ellipse,rgba(0,0,0,.85),transparent 70%);filter:blur(14px);transform:translateX(calc(var(--ry)*-2))}
@media(hover:none){.tilt{animation:sway 9s ease-in-out 3s infinite}.sheen{animation:sheen 7s ease-in-out 3s infinite}.hint{display:none}}
@keyframes sway{0%,100%{transform:perspective(1300px) rotateX(1.5deg) rotateY(-4deg)}50%{transform:perspective(1300px) rotateX(-1deg) rotateY(4deg)}}
@keyframes sheen{0%,100%{background-position:10% 0}50%{background-position:90% 0}}

/* annotation columns */
.col{position:relative;z-index:3;display:flex;flex-direction:column;gap:1.2rem;width:100%}
@media(min-width:1000px){.col{align-self:stretch;justify-content:space-between;padding:1rem 0}.col.l{align-items:flex-end;text-align:right}.col.r{align-items:flex-start;text-align:left}}
@media(max-width:999px){.col{display:contents}}
@media(max-width:999px){.stage{grid-template-columns:repeat(2,1fr);place-items:start;row-gap:1.6rem}.wrap-p{order:-1;grid-column:1/-1;justify-self:center}.giant{top:30%}.plate-no{grid-column:1/-1}.col .pair{display:contents}}
.co{position:relative;opacity:0}.hero.go .co{animation:coIn 1s var(--ease) both;animation-delay:calc(2.6s + var(--i)*.13s)}
@keyframes coIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.co small{display:block;font:500 .6rem "DM Mono",monospace;letter-spacing:.26em;text-transform:uppercase;color:var(--steel)}
.co b{display:block;margin-top:.45rem;font-size:clamp(1.05rem,1.5vw,1.4rem);font-weight:700;letter-spacing:-.01em;line-height:1.1}
@media(min-width:1000px){.pair{display:flex;flex-direction:column;gap:1.4rem}}
@media(min-width:1000px){.co::after{content:"";position:absolute;top:.5rem;width:0;height:1px;background:linear-gradient(90deg,transparent,var(--moon))}
  .col.l .co::after{right:-3rem}.col.r .co::after{left:-3rem;transform:scaleX(-1)}
  .hero.go .co::after{animation:lineDraw 1.2s var(--ease) both;animation-delay:calc(2.9s + var(--i)*.13s)}
  .plate-no::after{display:none}}
@keyframes lineDraw{to{width:2.4rem}}
.plate-no b{font-size:clamp(3rem,6vw,5.4rem);line-height:.85;color:transparent;-webkit-text-stroke:1px rgba(232,236,243,.55);letter-spacing:-.05em}
.plate-no em{display:block;margin-top:.6rem;font:italic 400 1.3rem "Instrument Serif",Georgia,serif;color:var(--moon)}
.rev b{color:var(--ember)}
.rail{display:flex;gap:.4rem;margin-top:1rem}.col.l .rail{justify-content:flex-end}
.rail button{padding:.3rem .7rem;border:1px solid var(--line);border-radius:9999px;font:500 .6rem "DM Mono",monospace;letter-spacing:.14em;color:var(--steel);transition:border-color .3s,color .3s}.rail button.on,.rail button:hover{border-color:var(--moon);color:var(--moon)}

.h-bar{position:relative;z-index:5;max-width:80rem;width:100%;margin:0 auto;padding:1rem 1.25rem 2rem;display:flex;flex-direction:column;gap:1.2rem;align-items:center;opacity:0}
.hero.go .h-bar{animation:coIn 1.1s var(--ease) 3.1s both}
@media(min-width:768px){.h-bar{padding:1rem 3rem 2.4rem;flex-direction:row;justify-content:space-between}}
.h-tag{margin:0;font:italic 400 1.7rem "Instrument Serif",Georgia,serif;color:var(--steel);display:flex;align-items:center;gap:1rem}.h-tag::before{content:"";width:2.6rem;height:1px;background:var(--ember)}
.h-cta{display:flex;flex-wrap:wrap;gap:.7rem;justify-content:center}
.btn{position:relative;overflow:hidden;display:inline-flex;align-items:center;gap:.7rem;border-radius:9999px;padding:.95rem 1.6rem;font-size:.66rem;font-weight:700;letter-spacing:.22em;text-transform:uppercase;transition:transform .4s var(--ease),background .3s,border-color .3s,color .3s}
.btn i{font-style:normal;transition:transform .4s var(--ease)}.btn:hover{transform:translateY(-2px)}.btn:hover i{transform:translate(2px,-2px)}
.btn::after{content:"";position:absolute;top:0;bottom:0;width:40%;left:-60%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.35),transparent);transform:skewX(-20deg)}.btn:hover::after{left:130%;transition:left .8s}
.btn-s{background:var(--moon);color:var(--ink)}.btn-s:hover{background:#fff}
.btn-g{border:1px solid var(--line);background:rgba(232,236,243,.05);backdrop-filter:blur(8px)}.btn-g:hover{border-color:var(--moon)}

.mq{overflow:hidden;border-block:1px solid var(--line);padding:1rem 0;background:#020203}
.mq-t{display:flex;width:max-content;gap:2rem;animation:mq 90s linear infinite;font-size:1.9rem;font-weight:800;color:transparent;-webkit-text-stroke:1px rgba(232,236,243,.28)}
.mq-t span{display:flex;align-items:center;gap:2rem;white-space:nowrap}.mq-t em{font-style:normal;font-size:.55rem;color:var(--ember);-webkit-text-stroke:0}
@keyframes mq{to{transform:translateX(-50%)}}

/* details */
.det{padding:7rem 0 6rem;background:radial-gradient(ellipse at 15% 0,rgba(138,147,163,.08),transparent 50%)}@media(min-width:768px){.det{padding:11rem 0 9rem}}
.kk{display:flex;align-items:center;gap:.9rem;margin:0;font:500 .66rem "DM Mono",monospace;letter-spacing:.26em;text-transform:uppercase;color:var(--steel)}.kk::before{content:"";width:0;height:1px;background:var(--ember);transition:width 1.1s var(--ease) .2s}.kk.in::before{width:2.8rem}
.det-top{display:grid;gap:2.2rem;margin-top:1.4rem}@media(min-width:900px){.det-top{grid-template-columns:1.2fr .8fr;align-items:end;gap:5rem}}
.h2{margin:0;font-weight:800;font-size:clamp(3rem,10vw,8rem);line-height:.9;letter-spacing:-.04em}.h2 .dim{color:transparent;-webkit-text-stroke:1px rgba(232,236,243,.5)}
.copy{margin:0;max-width:26rem;font-size:.95rem;line-height:1.9;color:rgba(232,236,243,.52)}
.facts{display:grid;margin:5rem 0 0;border-top:1px solid var(--line)}@media(min-width:700px){.facts{grid-template-columns:repeat(2,1fr)}}@media(min-width:1000px){.facts{grid-template-columns:repeat(3,1fr)}}
.facts>div{position:relative;padding:2rem 1.2rem 2.2rem 0;border-bottom:1px solid var(--line);transition:padding .5s var(--ease)}
.facts dt{display:flex;gap:1rem;font:500 .62rem "DM Mono",monospace;letter-spacing:.26em;text-transform:uppercase;color:var(--steel)}.facts dt span{color:var(--ember)}
.facts dd{margin:1rem 0 0;font-size:clamp(1.5rem,2.6vw,2.3rem);font-weight:800;line-height:1;letter-spacing:-.03em}
.facts>div::after{content:"";position:absolute;left:0;bottom:-1px;height:1px;width:100%;background:var(--ember);transform:scaleX(0);transform-origin:left;transition:transform .8s var(--ease)}.facts>div:hover::after{transform:scaleX(1)}.facts>div:hover{padding-left:.8rem}
.look{margin-top:6rem;display:flex;flex-direction:column;gap:1.6rem;align-items:flex-start}@media(min-width:768px){.look{flex-direction:row;align-items:center;justify-content:space-between}}
.look-t{margin:0;font-weight:800;font-size:clamp(2rem,6vw,4.4rem);line-height:.9;letter-spacing:-.04em;color:transparent;-webkit-text-stroke:1px rgba(232,236,243,.55)}

/* closing */
.end{position:relative;overflow:hidden;border-top:1px solid var(--line);padding:9rem 1.25rem;text-align:center;background:radial-gradient(ellipse at 50% 55%,rgba(229,48,58,.09),transparent 55%)}@media(min-width:768px){.end{padding:13rem 3rem}}
.end-shaft{position:absolute;top:-20%;bottom:-20%;left:0;width:22%;background:linear-gradient(90deg,transparent,rgba(210,222,245,.06),transparent);transform:rotate(14deg);animation:endshaft 14s ease-in-out infinite alternate}
@keyframes endshaft{from{left:-10%}to{left:90%}}
.end-in{position:relative;display:flex;flex-direction:column;align-items:center;gap:1.8rem}
.logo-b{position:relative}.logo-l{display:block;width:min(72vw,440px);height:auto;filter:drop-shadow(0 0 40px rgba(229,48,58,.25));animation:breathe 5s ease-in-out infinite}
@keyframes breathe{50%{filter:drop-shadow(0 0 60px rgba(232,236,243,.28))}}
.end-t{margin:.6rem 0 1.2rem;font:italic 400 clamp(1.5rem,3.4vw,2.4rem) "Instrument Serif",Georgia,serif;color:var(--steel)}
.foot{display:flex;flex-wrap:wrap;justify-content:space-between;gap:.8rem;max-width:80rem;margin:0 auto;padding:1.8rem 1.25rem 2.4rem;border-top:1px solid var(--line);font:500 .58rem "DM Mono",monospace;letter-spacing:.24em;text-transform:uppercase;color:rgba(232,236,243,.3)}@media(min-width:768px){.foot{padding-inline:3rem}}

/* viewer */
.vw{position:fixed;inset:0;z-index:100;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;padding:4.5rem 1rem 3.5rem;background:rgba(2,2,3,.95);backdrop-filter:blur(18px);animation:fade .4s ease}
.vw.out{animation:fadeOut .38s ease forwards}.vw.out .vw-poster{transition:transform .38s,opacity .38s;transform:scale(.94);opacity:0}
@keyframes fadeOut{to{opacity:0}}
.vw-top{position:absolute;top:0;left:0;right:0;display:flex;align-items:center;justify-content:space-between;padding:1.2rem 1.25rem;font:500 .62rem "DM Mono",monospace;letter-spacing:.24em;text-transform:uppercase;color:var(--steel)}@media(min-width:768px){.vw-top{padding:1.5rem 2.5rem}}
.vw-x{position:relative;width:2.8rem;height:2.8rem;border:1px solid var(--line)!important;border-radius:50%;transition:transform .5s var(--ease),border-color .3s}.vw-x:hover{transform:rotate(90deg);border-color:var(--moon)!important}
.vw-x i{position:absolute;left:50%;top:50%;width:16px;height:1px;background:var(--moon);transform:translate(-50%,-50%) rotate(45deg)}.vw-x i+i{transform:translate(-50%,-50%) rotate(-45deg)}
.vw-poster{position:relative;height:min(82vh,900px);aspect-ratio:2/3;max-width:92vw;overflow:hidden;cursor:zoom-in;box-shadow:0 40px 120px rgba(0,0,0,.9);animation:vin .7s var(--ease);touch-action:none}
.vw-poster.z{cursor:zoom-out}
.vw-img{position:absolute;inset:0;transition:transform .7s var(--ease)}.vw-poster.z .vw-img{transform:scale(2.4)}
@keyframes vin{from{opacity:0;transform:scale(.94)}}
.vw-hint{margin:0;font:500 .58rem "DM Mono",monospace;letter-spacing:.24em;text-transform:uppercase;color:var(--steel)}
.vw-nav{position:absolute;top:50%;width:3rem;height:3rem;margin-top:-1.5rem;border:1px solid var(--line)!important;border-radius:50%;transition:border-color .3s}.vw-nav:hover{border-color:var(--moon)!important}.vw-nav.p{left:1rem}.vw-nav.n{right:1rem}

@media(max-width:600px){.mq-t{font-size:1.4rem}.h-tag{font-size:1.4rem}.logo-s{height:26px}}
@media (prefers-reduced-motion:reduce){
html{scroll-behavior:auto}.grain,.shaft,.dev-bar{display:none}
.hero .frame{clip-path:none!important;animation:none!important}.hero .p-img{filter:none!important;transform:none!important;animation:none!important}
.hero .lt,.hero .co,.hero .h-bar,.nav,.amb,.mq-t,.tilt,.sheen,.logo-l,.end-shaft{animation:none!important}
.lt{transform:none!important}.co,.h-bar,.nav,.amb{opacity:1!important}.amb{opacity:.35!important}
[data-r]{opacity:1!important;transform:none!important;clip-path:none!important;filter:none!important;transition:opacity .4s!important}[data-r="line"]>span{transform:none!important;transition:none!important}
.giant,.wrap-p{transform:translate(-50%,-50%)!important}.wrap-p{transform:none!important}
}
`;
