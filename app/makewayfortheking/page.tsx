"use client";

import {
  memo, useCallback, useEffect, useMemo, useRef, useState,
  type ChangeEvent, type MutableRefObject, type RefObject,
} from "react";
import raw from "./raaka_lyrics_timestamps_partial.json";

/* ================= DATA ================= */
const AUDIO_SRC = "/sounds/king.mp3"; // existing file, never copied or modified
// No `type` attribute is set on <audio>: the browser sniffs the real codec/container itself.

type RawSeg = { start: number | null; end: number | null; text: string; needs_timing?: boolean };
type Seg = { id: number; start: number; end: number; text: string };

const ALL = (raw.segments as RawSeg[]).map((s, id) => ({ ...s, id }));
// To add timing later: fill `start`/`end` in the JSON. Timed lines sync automatically; untimed ones stay listed.
const TIMED: Seg[] = ALL.filter(
  (s): s is RawSeg & { start: number; end: number; id: number } =>
    typeof s.start === "number" && typeof s.end === "number" && s.end > s.start,
).sort((a, b) => a.start - b.start);
const AWAITING = ALL.filter((s) => !TIMED.some((t) => t.id === s.id));
const TITLE: string = raw.title ?? "Make Way for the King (RAAKA)";

const fmt = (s: number) =>
  Number.isFinite(s) && s >= 0 ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "-:--";
const isHero = (t: string) => /raaka|make way for the king/i.test(t);
const sizeOf = (t: string) => (t.length > 34 ? "s" : t.length > 18 ? "m" : "l");
const findActive = (t: number) => TIMED.findIndex((s) => t >= s.start && t < s.end); // gaps -> -1

const IC = {
  play: "M8 5v14l11-7z",
  pause: "M6 5h4v14H6zM14 5h4v14h-4z",
  prev: "M6 5h2v14H6zM20 5v14L9 12z",
  next: "M16 5h2v14h-2zM4 5l11 7L4 19z",
  list: "M4 6h2v2H4zM9 6h11v2H9zM4 11h2v2H4zM9 11h11v2H9zM4 16h2v2H4zM9 16h11v2H9z",
  x: "M6 5l6 6 6-6 1.4 1.4-6 6 6 6L18 20l-6-6-6 6-1.4-1.4 6-6-6-6z",
};
const Icon = ({ n }: { n: keyof typeof IC }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d={IC[n]} /></svg>
);

/* ================= EMBERS (canvas) ================= */
const Embers = memo(function Embers({ energy, playing, pulse }: {
  energy: MutableRefObject<number>; playing: MutableRefObject<boolean>; pulse: RefObject<HTMLDivElement | null>;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const sp = document.createElement("canvas"); sp.width = sp.height = 64;
    const sc = sp.getContext("2d");
    if (sc) {
      const g = sc.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, "rgba(255,244,205,1)"); g.addColorStop(0.2, "rgba(255,196,80,.85)");
      g.addColorStop(0.55, "rgba(200,120,20,.25)"); g.addColorStop(1, "rgba(160,80,0,0)");
      sc.fillStyle = g; sc.fillRect(0, 0, 64, 64);
    }
    type P = { x: number; y: number; vx: number; vy: number; s: number; a: number; t: number; k: number };
    let ps: P[] = []; let w = 0, h = 0, raf = 0, last = 0;
    const mk = (anywhere: boolean): P => ({
      x: Math.random() * w, y: anywhere ? Math.random() * h : h + 20, vx: (Math.random() - 0.5) * 0.25,
      vy: -(0.25 + Math.random() * 0.8), s: 3 + Math.random() * 14, a: 0.25 + Math.random() * 0.75,
      t: Math.random() * 6.28, k: 0.6 + Math.random() * 1.6,
    });
    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      cv.width = Math.floor(w * dpr); cv.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(110, Math.max(36, (w * h) / 15000)));
      ps = Array.from({ length: n }, () => mk(true));
    };
    const draw = (dt: number, e: number) => {
      ctx.clearRect(0, 0, w, h); ctx.globalCompositeOperation = "lighter";
      for (const p of ps) {
        p.x += p.vx * dt * 60 * (1 + e * 2); p.y += p.vy * dt * 60 * (1 + e * 2.5); p.t += dt * p.k;
        if (p.y < -30) Object.assign(p, mk(false));
        const sz = p.s * (1 + e * 0.6);
        ctx.globalAlpha = Math.min(1, p.a * (0.5 + 0.5 * Math.sin(p.t)) * (0.7 + e * 1.1));
        ctx.drawImage(sp, p.x - sz / 2, p.y - sz / 2, sz, sz);
      }
      ctx.globalAlpha = 1;
    };
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!playing.current) energy.current *= 0.94; // decay when paused
      pulse.current?.style.setProperty("--e", energy.current.toFixed(3));
      draw(dt, energy.current);
    };
    const start = () => { if (!raf && !reduce) raf = requestAnimationFrame(frame); };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const vis = () => (document.hidden ? stop() : start());
    resize();
    if (reduce) draw(0.016, 0); else start();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", vis);
    return () => { stop(); window.removeEventListener("resize", resize); document.removeEventListener("visibilitychange", vis); };
  }, [energy, playing, pulse]);
  return <canvas ref={ref} className="rk-cv" aria-hidden="true" />;
});

/* ================= LYRIC LINE ================= */
function Line({ seg, i, state }: { seg: Seg; i: number; state: "in" | "out" }) {
  const hero = isHero(seg.text);
  return (
    <p className={`ln ${state} ${i % 2 ? "zo" : "zi"} ${sizeOf(seg.text)}${hero ? " hero" : ""}`} aria-hidden="true">
      <span className="gold">{hero ? seg.text.toUpperCase() : seg.text}</span>
    </p>
  );
}

/* ================= PAGE ================= */
export default function LyricsPage() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const anRef = useRef<AnalyserNode | null>(null);
  const dataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const energy = useRef(0);
  const playingRef = useRef(false);
  const activeRef = useRef(-1);
  const prevRef = useRef(-1);
  const uiTick = useRef(0);

  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [active, setActive] = useState(-1);
  const [leaving, setLeaving] = useState(-1);
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState("");

  const sync = useCallback((t: number) => {
    const i = findActive(t);
    if (i !== activeRef.current) { activeRef.current = i; setActive(i); }
    setTime(t);
  }, []);

  /* audio analysis: created once, only after a user gesture, reusing the same <audio> element */
  const ensureAnalyser = useCallback(() => {
    if (ctxRef.current) { if (ctxRef.current.state === "suspended") void ctxRef.current.resume(); return; }
    const a = audioRef.current;
    if (!a) return;
    try {
      const w = window as unknown as { webkitAudioContext?: typeof AudioContext };
      const AC = window.AudioContext ?? w.webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      const src = ctx.createMediaElementSource(a);
      const an = ctx.createAnalyser();
      an.fftSize = 256; an.smoothingTimeConstant = 0.8;
      src.connect(an); an.connect(ctx.destination);
      ctxRef.current = ctx; anRef.current = an; dataRef.current = new Uint8Array(an.frequencyBinCount);
      void ctx.resume();
    } catch { /* playback continues without analysis */ }
  }, []);

  const toggle = useCallback(async () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      ensureAnalyser(); setStarted(true); setErr("");
      if (a.ended) a.currentTime = 0;
      try { await a.play(); } catch { setErr("Playback was blocked or this audio format is not supported by your browser."); }
    } else a.pause();
  }, [ensureAnalyser]);

  const seekTo = useCallback((t: number, play = false) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = t; sync(t);
    if (play && a.paused) void toggle();
  }, [sync, toggle]);

  const jump = (dir: 1 | -1) => {
    const a = audioRef.current;
    if (!a) return;
    const t = a.currentTime;
    if (dir === 1) {
      const n = TIMED.find((s) => s.start > t + 0.05);
      if (n) seekTo(n.start);
    } else {
      const p = [...TIMED].reverse().find((s) => s.start < t - 0.9);
      seekTo(p ? p.start : 0);
    }
  };

  /* frame loop while playing: precise lyric sync + level analysis */
  useEffect(() => {
    playingRef.current = playing;
    if (!playing) return;
    let raf = 0;
    const loop = () => {
      const a = audioRef.current;
      if (a) {
        const t = a.currentTime;
        const i = findActive(t);
        if (i !== activeRef.current) { activeRef.current = i; setActive(i); }
        const now = performance.now();
        if (now - uiTick.current > 100) { uiTick.current = now; setTime(t); }
      }
      const an = anRef.current; const d = dataRef.current;
      if (an && d) {
        an.getByteFrequencyData(d);
        let s = 0; const n = Math.min(10, d.length);
        for (let k = 0; k < n; k++) s += d[k];
        const target = Math.min(1, (s / n / 255) * 1.25);
        energy.current += (target - energy.current) * 0.3;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  /* entrance / exit handling */
  useEffect(() => {
    const prev = prevRef.current; prevRef.current = active;
    if (prev >= 0 && prev !== active) {
      setLeaving(prev);
      const id = setTimeout(() => setLeaving(-1), 700);
      return () => clearTimeout(id);
    }
  }, [active]);

  /* keep active lyric centered in the list */
  useEffect(() => {
    if (!open || active < 0) return;
    const box = listRef.current;
    const el = box?.querySelector<HTMLElement>(`[data-i="${active}"]`);
    if (!box || !el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    box.scrollTo({ top: el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2, behavior: reduce ? "auto" : "smooth" });
  }, [active, open]);

  /* keyboard + unmount cleanup */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (e.code === "Space" && tag !== "BUTTON" && tag !== "INPUT") { e.preventDefault(); void toggle(); }
    };
    window.addEventListener("keydown", onKey);
    const a = audioRef.current;
    return () => {
      window.removeEventListener("keydown", onKey);
      a?.pause();
      anRef.current?.disconnect();
      void ctxRef.current?.close();
      ctxRef.current = null; anRef.current = null;
    };
  }, [toggle]);

  const onSeek = (e: ChangeEvent<HTMLInputElement>) => seekTo(Number(e.target.value));
  const total = duration || TIMED[TIMED.length - 1]?.end || 0;
  const cur = active >= 0 ? TIMED[active] : null;
  const pct = total ? Math.min(100, (time / total) * 100) : 0;
  const idle = useMemo(() => !started, [started]);

  return (
    <main className="rk">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <h1 className="sr">{TITLE}</h1>
      <audio
        ref={audioRef} src={AUDIO_SRC} preload="metadata"
        onLoadedMetadata={(e) => { const d = e.currentTarget.duration; if (Number.isFinite(d)) setDuration(d); }}
        onTimeUpdate={(e) => { if (!playingRef.current) sync(e.currentTarget.currentTime); }}
        onPlay={() => { setPlaying(true); setEnded(false); }}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setEnded(true); }}
        onError={() => setErr(`Could not load ${AUDIO_SRC}. Check that the file exists in public/sounds.`)}
      />

      {/* atmosphere */}
      <div className="bg" aria-hidden="true" />
      <div className="sm a" aria-hidden="true" /><div className="sm b" aria-hidden="true" /><div className="sm c" aria-hidden="true" />
      <div className="bm a" aria-hidden="true" /><div className="bm b" aria-hidden="true" />
      <div className="pulse" ref={pulseRef} aria-hidden="true" />
      <Embers energy={energy} playing={playingRef} pulse={pulseRef} />
      <div className="grain" aria-hidden="true" /><div className="vig" aria-hidden="true" />

      {/* lyric stage */}
      <div className="stage" aria-live="polite" aria-atomic="true">
        <span className="sr">{cur ? cur.text : ""}</span>
        {leaving >= 0 && leaving !== active && <Line key={`o${leaving}`} seg={TIMED[leaving]} i={leaving} state="out" />}
        {active >= 0 && <Line key={`i${active}`} seg={TIMED[active]} i={active} state="in" />}
      </div>

      {idle && (
        <div className="intro">
          <p className="by">RAAKA</p>
          <h2 className="gold big">MAKE WAY<br />FOR THE KING</h2>
          <button className="start" onClick={() => void toggle()}>Play song</button>
        </div>
      )}
      {ended && !playing && (
        <div className="intro out">
          <h2 className="gold big">RAAKA</h2>
          <button className="start" onClick={() => void toggle()}>Play again</button>
        </div>
      )}
      {err && <p className="err" role="alert">{err}</p>}

      {/* player */}
      <div className="bar" role="group" aria-label="Player controls">
        <input
          className="seek" type="range" min={0} max={total || 1} step={0.05} value={Math.min(time, total || 1)}
          onChange={onSeek} aria-label="Seek" aria-valuetext={`${fmt(time)} of ${fmt(total)}`}
          style={{ ["--p" as string]: `${pct}%` }}
        />
        <button className="ib" onClick={() => jump(-1)} aria-label="Previous lyric"><Icon n="prev" /></button>
        <button className="ib main" onClick={() => void toggle()} aria-label={playing ? "Pause" : "Play"}><Icon n={playing ? "pause" : "play"} /></button>
        <button className="ib" onClick={() => jump(1)} aria-label="Next lyric"><Icon n="next" /></button>
        <span className="tm">{fmt(time)} / {fmt(total)}</span>
        <button className="ib end" onClick={() => setOpen((o) => !o)} aria-label="Lyrics list" aria-expanded={open} aria-controls="rk-list"><Icon n={open ? "x" : "list"} /></button>
      </div>

      {/* lyric list */}
      <aside id="rk-list" className={`dr${open ? " open" : ""}`} aria-label="All lyrics">
        <h2 className="dh">Lyrics</h2>
        <ol className="lst" ref={listRef}>
          {TIMED.map((s, i) => (
            <li key={s.id} data-i={i}>
              <button className={`it${i === active ? " on" : ""}`} aria-current={i === active ? "true" : undefined} onClick={() => seekTo(s.start, true)}>
                <time>{fmt(s.start)}</time><span>{s.text}</span>
              </button>
            </li>
          ))}
          {AWAITING.length > 0 && (
            <li className="aw">
              <h3>Awaiting Timestamps ({AWAITING.length})</h3>
              <p>These lines have no timing yet, so they are not part of synchronized playback.</p>
              <ul>{AWAITING.map((s) => <li key={s.id} aria-disabled="true">{s.text}</li>)}</ul>
            </li>
          )}
        </ol>
      </aside>
    </main>
  );
}

/* ================= STYLES ================= */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Cormorant+Garamond:wght@500;600&display=swap');
.rk{--gold:#e9bd5a;--deep:#6b4709;--ink:#050403;position:fixed;inset:0;overflow:hidden;background:var(--ink);color:#f3e3b8;font-family:'Cormorant Garamond',Georgia,serif;-webkit-tap-highlight-color:transparent}
.rk *{box-sizing:border-box}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.bg{position:absolute;inset:0;background:radial-gradient(ellipse 70% 55% at 50% 48%,#2a1c06 0%,#0d0802 55%,#030201 100%)}
.sm{position:absolute;width:80vmax;height:60vmax;border-radius:50%;background:radial-gradient(closest-side,rgba(255,196,100,.11),transparent);will-change:transform}
.sm.a{left:-25vmax;top:-10vmax;animation:dr 38s ease-in-out infinite alternate}
.sm.b{right:-30vmax;bottom:-20vmax;animation:dr 46s ease-in-out -12s infinite alternate-reverse}
.sm.c{left:20vmax;top:25vmax;opacity:.7;animation:dr 52s ease-in-out -20s infinite alternate}
.bm{position:absolute;top:-35%;left:50%;width:16vmax;height:170%;background:linear-gradient(to bottom,transparent,rgba(255,205,110,.15) 45%,transparent);mix-blend-mode:screen;will-change:transform}
.bm.a{transform:rotate(24deg);animation:bm 16s ease-in-out infinite alternate}
.bm.b{width:8vmax;margin-left:-22vmax;transform:rotate(-30deg);animation:bm2 21s ease-in-out -6s infinite alternate}
.pulse{--e:0;position:absolute;left:50%;top:50%;width:90vmin;height:90vmin;margin:-45vmin 0 0 -45vmin;border-radius:50%;background:radial-gradient(closest-side,rgba(255,190,80,.5),rgba(255,150,30,.12) 55%,transparent);opacity:calc(.12 + var(--e)*.7);transform:scale(calc(.9 + var(--e)*.35));will-change:transform,opacity;mix-blend-mode:screen}
.rk-cv{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;mix-blend-mode:screen}
.grain{position:absolute;inset:-50%;opacity:.08;pointer-events:none;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 .85  0 0 0 0 .5  0 0 0 .9 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");animation:gr .9s steps(6) infinite}
.vig{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at center,transparent 38%,rgba(0,0,0,.82) 100%)}
.stage{position:absolute;inset:0 0 110px 0;display:grid;place-items:center;padding:0 5vw;perspective:900px;pointer-events:none}
.ln{grid-area:1/1;margin:0;max-width:min(92vw,1300px);text-align:center;text-wrap:balance;font-family:Cinzel,'Trajan Pro',Georgia,serif;font-weight:900;line-height:1.08;letter-spacing:.03em;will-change:transform,opacity}
.ln.l{font-size:clamp(46px,11.5vw,180px)}.ln.m{font-size:clamp(34px,7.8vw,118px)}.ln.s{font-size:clamp(26px,5.2vw,80px)}
.ln.hero{letter-spacing:.09em}.ln.hero.l{font-size:clamp(54px,14vw,230px)}.ln.hero.m{font-size:clamp(40px,9.6vw,150px)}
.ln.in.zi{animation:iz .85s cubic-bezier(.16,1,.3,1) both}.ln.in.zo{animation:io .85s cubic-bezier(.16,1,.3,1) both}
.ln.out.zi{animation:oz .6s ease-in both}.ln.out.zo{animation:oo .6s ease-in both}
.ln.hero.in::before{content:"";position:absolute;left:50%;top:50%;width:140%;height:2px;margin-left:-70%;background:linear-gradient(90deg,transparent,#fff3c4,transparent);box-shadow:0 0 40px 12px rgba(255,200,90,.65);animation:fl 1s ease-out both}
.gold{display:inline-block;background:linear-gradient(180deg,#fff7d6 0%,#f7d97f 26%,#c8942c 50%,#6e4a0c 53%,#d9a640 72%,#fff0b0 100%);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;filter:drop-shadow(0 1px 0 #8a5d14) drop-shadow(0 3px 0 #5b3b0a) drop-shadow(0 6px 0 #34200a) drop-shadow(0 24px 24px rgba(0,0,0,.85)) drop-shadow(0 0 38px rgba(255,185,60,.3));animation:bt 7s ease-in-out infinite alternate;will-change:transform}
.intro{position:absolute;inset:0;z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px;text-align:center;padding:24px 24px 110px;background:radial-gradient(circle,rgba(5,4,3,.35),rgba(3,2,1,.88));animation:fi .9s ease-out both}
.intro.out{background:rgba(3,2,1,.7)}
.by{margin:0;font:600 clamp(18px,2.4vw,26px)/1 'Cormorant Garamond',serif;letter-spacing:.7em;color:var(--gold);padding-left:.7em}
.big{margin:0;font:900 clamp(44px,10vw,150px)/1.02 Cinzel,Georgia,serif;letter-spacing:.06em}
.rk .start{padding:16px 44px;border:1px solid var(--gold);background:linear-gradient(180deg,rgba(233,189,90,.18),rgba(107,71,9,.18));color:#fff3cf;font:700 16px Cinzel,serif;letter-spacing:.28em;cursor:pointer;transition:background .25s,transform .25s,box-shadow .25s}
.rk .start:hover{background:rgba(233,189,90,.3);box-shadow:0 0 36px rgba(233,189,90,.45);transform:scale(1.04)}
.rk button:focus-visible,.rk input:focus-visible{outline:2px solid #ffe08a;outline-offset:3px}
.err{position:absolute;z-index:8;left:50%;top:18px;transform:translateX(-50%);margin:0;max-width:92vw;padding:10px 18px;border:1px solid #c55;background:rgba(40,8,8,.92);color:#ffc9c9;font:600 16px 'Cormorant Garamond',serif;text-align:center}
.bar{position:absolute;z-index:6;left:0;right:0;bottom:0;display:flex;align-items:center;gap:10px;padding:14px max(20px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom)) max(20px,env(safe-area-inset-left));background:linear-gradient(to top,rgba(0,0,0,.92),rgba(0,0,0,.55) 70%,transparent);border-top:1px solid rgba(233,189,90,.28)}
.seek{position:absolute;left:0;right:0;top:-9px;width:100%;height:18px;margin:0;appearance:none;-webkit-appearance:none;background:transparent;cursor:pointer}
.seek::-webkit-slider-runnable-track{height:3px;background:linear-gradient(90deg,#f7d97f var(--p,0%),rgba(233,189,90,.2) var(--p,0%))}
.seek::-moz-range-track{height:3px;background:rgba(233,189,90,.2)}.seek::-moz-range-progress{height:3px;background:#f7d97f}
.seek::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;margin-top:-5.5px;border-radius:50%;background:#fff3c4;box-shadow:0 0 14px 3px rgba(255,200,90,.9)}
.seek::-moz-range-thumb{width:14px;height:14px;border:0;border-radius:50%;background:#fff3c4;box-shadow:0 0 14px 3px rgba(255,200,90,.9)}
.rk .ib{display:grid;place-items:center;width:44px;height:44px;border:1px solid rgba(233,189,90,.4);background:none;color:var(--gold);cursor:pointer;transition:background .2s,color .2s}
.rk .ib:hover{background:rgba(233,189,90,.2);color:#fff3c4}
.rk .ib.main{width:52px;height:52px;border-radius:50%;border-color:var(--gold);box-shadow:0 0 18px rgba(233,189,90,.3)}
.rk .ib.end{margin-left:auto}
.tm{font:600 17px 'Cormorant Garamond',serif;letter-spacing:.06em;color:#e8d29a;font-variant-numeric:tabular-nums;margin-left:6px}
.dr{position:absolute;z-index:7;top:0;right:0;bottom:0;width:min(420px,100%);display:flex;flex-direction:column;background:linear-gradient(180deg,rgba(10,7,2,.97),rgba(4,3,1,.98));border-left:1px solid rgba(233,189,90,.4);visibility:hidden;transform:translateX(100%);transition:transform .45s cubic-bezier(.2,.8,.2,1),visibility 0s .45s}
.dr.open{visibility:visible;transform:none;transition:transform .45s cubic-bezier(.2,.8,.2,1)}
.dh{margin:0;padding:22px 24px 12px;font:700 22px Cinzel,serif;letter-spacing:.14em;color:var(--gold)}
.lst{position:relative;flex:1;overflow:auto;margin:0;padding:0 12px 130px;list-style:none;overscroll-behavior:contain}
.rk .it{display:grid;grid-template-columns:48px 1fr;gap:10px;width:100%;padding:11px 12px;border:0;border-left:2px solid transparent;background:none;color:#cdb98a;text-align:left;font:500 19px/1.25 'Cormorant Garamond',serif;cursor:pointer;transition:background .2s,color .2s}
.rk .it:hover{background:rgba(233,189,90,.1);color:#fff0c0}
.rk .it.on{border-left-color:#f7d97f;background:rgba(233,189,90,.16);color:#fff7d6;font-weight:600}
.it time{color:var(--gold);font-variant-numeric:tabular-nums;font-size:16px}
.aw{margin-top:22px;padding:14px;border:1px dashed rgba(233,189,90,.5);color:#bda878}
.aw h3{margin:0 0 6px;font:700 14px Cinzel,serif;letter-spacing:.14em;color:var(--gold)}
.aw p{margin:0 0 10px;font-size:16px}.aw ul{margin:0;padding-left:18px;font-size:18px;opacity:.85}
@keyframes fi{from{opacity:0}to{opacity:1}}
@keyframes dr{from{transform:translate3d(0,0,0) scale(1)}to{transform:translate3d(9vmax,5vmax,0) scale(1.18)}}
@keyframes bm{from{transform:rotate(20deg) translateX(-4vmax)}to{transform:rotate(30deg) translateX(8vmax)}}
@keyframes bm2{from{transform:rotate(-34deg) translateX(0)}to{transform:rotate(-24deg) translateX(10vmax)}}
@keyframes gr{0%{transform:translate(0,0)}20%{transform:translate(-3%,2%)}40%{transform:translate(2%,-3%)}60%{transform:translate(-2%,-1%)}80%{transform:translate(3%,3%)}100%{transform:translate(0,0)}}
@keyframes iz{from{opacity:0;transform:scale(.7) translateZ(-120px)}to{opacity:1;transform:none}}
@keyframes io{from{opacity:0;transform:scale(1.35) translateZ(120px)}to{opacity:1;transform:none}}
@keyframes oz{to{opacity:0;transform:scale(1.2)}}
@keyframes oo{to{opacity:0;transform:scale(.82)}}
@keyframes bt{from{transform:scale(1)}to{transform:scale(1.035)}}
@keyframes fl{0%{opacity:0;transform:scaleX(.1)}30%{opacity:1}100%{opacity:0;transform:scaleX(1.2)}}
@media (max-width:640px){.bar{flex-wrap:wrap;gap:8px;padding-top:20px}.tm{font-size:15px}.stage{inset:0 0 150px 0}.rk .ib{width:42px;height:42px}.rk .start{padding:14px 30px}.dr{width:100%}}
@media (prefers-reduced-motion:reduce){.sm,.bm,.grain,.gold{animation:none}.ln.in,.ln.out{animation-duration:.01ms}.ln.hero.in::before{display:none}.dr,.dr.open{transition:none}}
`;
