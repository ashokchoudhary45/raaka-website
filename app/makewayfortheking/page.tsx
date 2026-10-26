"use client";

import {
  memo, useCallback, useEffect, useRef, useState,
  type ChangeEvent, type MutableRefObject, type PointerEvent as RPE,
} from "react";

/* ================= DATA ================= */
const AUDIO_SRC = "/sounds/king.mp3"; // change here if your file is king.mp4
const LOGO_SRC = "/images/raaka-logo.png"; // public/images/raaka-logo.png
const SONG_DURATION = 115.08; // fallback until the audio reports its real length

type LyricSegment = { start: number | null; end: number | null; text: string; needs_timing?: boolean };
type Timed = { start: number; end: number; text: string };

// Supplied source timestamps. Untimed lines are intentionally not guessed and are not shown or played.
const SEGMENTS: LyricSegment[] = [
  { start: 0.0, end: 4.0, text: "Ye yaaaiyee yooo" },
  { start: 4.0, end: 8.0, text: "Say my name, my name" },
  { start: 8.0, end: 11.0, text: "Ye yaaaiyee yooo" },
  { start: 11.0, end: 13.0, text: "Say my name, my name" },
  { start: 13.0, end: 15.0, text: "Raaka" },
  { start: 17.0, end: 19.0, text: "Move side to side" },
  { start: 19.0, end: 21.0, text: "Side to side" },
  { start: 21.0, end: 24.0, text: "Ye ye ye" },
  { start: 24.0, end: 27.0, text: "Say my name" },
  { start: 30.0, end: 31.64, text: "I'm making the crowd move when I strike" },
  { start: 31.64, end: 33.36, text: "I'm making a typhoon when I fight" },
  { start: 33.36, end: 34.96, text: "You know how the crown move when I might" },
  { start: 34.96, end: 36.8, text: "I'm making the night move with the right tool" },
  { start: 36.8, end: 38.4, text: "Crown on my walk, not a thing you can buy" },
  { start: 38.4, end: 40.16, text: "Got every scar that I wear with pride" },
  { start: 40.16, end: 41.8, text: "Name in their mouth like it's part of the prayer" },
  { start: 41.8, end: 43.28, text: "I lit the fire, let smoke in the air" },
  { start: 43.28, end: 45.08, text: "Make way for the king" },
  { start: 45.08, end: 46.76, text: "Back up, let me breathe" },
  { start: 46.76, end: 48.4, text: "I bled for this throne" },
  { start: 48.4, end: 50.16, text: "You just watched from the seats" },
  { start: 50.16, end: 51.76, text: "Make way for the king" },
  { start: 51.76, end: 53.48, text: "Every door, every key" },
  { start: 53.48, end: 55.16, text: "I took it, I claimed it" },
  { start: 55.16, end: 56.88, text: "Now the ground moves under me" },
  { start: 56.88, end: 58.88, text: "Make way for the king" },
  { start: 82.16, end: 85.68, text: "Say my name, my name, my name, my name, my name, my name" },
  { start: 85.68, end: 87.32, text: "Make way for the king" },
  { start: 87.32, end: 89.04, text: "Make way for the king" },
  { start: 89.04, end: 90.64, text: "I bled for this throne" },
  { start: 90.64, end: 92.4, text: "You just watched from the seats" },
  { start: 92.4, end: 94.0, text: "Make way for the king" },
  { start: 94.0, end: 96.0, text: "Every door, every key" },
  { start: 99.12, end: 101.12, text: "Make way for the king" },
  { start: null, end: null, text: "Ayy", needs_timing: true },
  { start: null, end: null, text: "Heads down", needs_timing: true },
  { start: null, end: null, text: "It's arrival time", needs_timing: true },
  { start: null, end: null, text: "Ye ye ye ye", needs_timing: true },
  { start: null, end: null, text: "Make way for the king", needs_timing: true },
  { start: null, end: null, text: "Make way for the king", needs_timing: true },
];

// Only lines with real numeric start/end take part in playback. Add timings above and they sync automatically.
const TIMED: Timed[] = SEGMENTS.filter(
  (s): s is Timed => typeof s.start === "number" && typeof s.end === "number" && s.end > s.start,
).sort((a, b) => a.start - b.start);

const findActive = (t: number) => TIMED.findIndex((s) => t >= s.start && t < s.end); // gaps -> -1
const fmt = (v: number) => {
  const s = Math.max(0, Math.floor(v || 0));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};
const isHero = (t: string) => /raaka|make way for the king/i.test(t);
const MODES = ["ignite", "warp", "scan", "ignite"] as const;
const TITLE_WORDS = ["MAKE", "WAY", "FOR", "THE", "KING"];

const BANDS = 32;
type FX = { e: number; flash: number; spec: Float32Array; playing: boolean; burstId: number; burstPow: number };

const IC = {
  play: "M8 5v14l11-7z",
  pause: "M6 5h4v14H6zM14 5h4v14h-4z",
  prev: "M6 5h2v14H6zM20 5v14L9 12z",
  next: "M16 5h2v14h-2zM4 5l11 7L4 19z",
};
const Icon = ({ n }: { n: keyof typeof IC }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d={IC[n]} /></svg>
);

/* ================= LOGO (falls back to text if the png is missing) ================= */
function Logo({ ok, onFail, cls }: { ok: boolean; onFail: () => void; cls: string }) {
  if (!ok) return <h2 className="mol logo">RAAKA</h2>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={cls} src={LOGO_SRC} alt="RAAKA" draggable={false} onError={onFail} />
  );
}

/* ================= WEBGL FIRE (real-time fbm plasma, driven by audio level) ================= */
const VS = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
const FS = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 r; uniform float t; uniform float e;
float h(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/r;
  float asp=r.x/r.y;
  vec2 p=vec2((uv.x-.5)*asp,uv.y);
  float w=fbm(vec2(p.x*1.6,p.y*1.2-t*.25));
  float f=fbm(vec2(p.x*3.2+w*1.4,p.y*2.6-t*.9+w*1.1));
  float base=1.-uv.y*(1.55-e*.7);
  float heat=clamp(base*(.9+e*.5)+(f-.46)*1.15,0.,1.4);
  vec3 c=vec3(0.);
  c=mix(c,vec3(.45,.02,.0),smoothstep(.18,.42,heat));
  c=mix(c,vec3(1.,.28,.02),smoothstep(.40,.68,heat));
  c=mix(c,vec3(1.,.72,.25),smoothstep(.66,.92,heat));
  c=mix(c,vec3(1.,.95,.8),smoothstep(.95,1.25,heat));
  float rim=smoothstep(.12,.2,heat)*(1.-smoothstep(.2,.3,heat));
  c+=vec3(.05,.25,.9)*rim*.6;
  c*=.55+e*.9;
  gl_FragColor=vec4(c,1.);
}`;

const FireGL = memo(function FireGL({ fx }: { fx: MutableRefObject<FX> }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const gl = cv.getContext("webgl", { alpha: false, antialias: false, powerPreference: "low-power" }) as WebGLRenderingContext | null;
    if (!gl) return; // CSS glow underneath remains as the fallback
    const mk = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src); gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const vs = mk(gl.VERTEX_SHADER, VS); const fs = mk(gl.FRAGMENT_SHADER, FS);
    const prog = gl.createProgram();
    if (!vs || !fs || !prog) return;
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uR = gl.getUniformLocation(prog, "r"); const uT = gl.getUniformLocation(prog, "t"); const uE = gl.getUniformLocation(prog, "e");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, last = 0, phase = reduce ? 3 : 0, heat = reduce ? 0.3 : 0.14;
    const draw = () => {
      gl.uniform2f(uR, cv.width, cv.height); gl.uniform1f(uT, phase); gl.uniform1f(uE, heat);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const resize = () => {
      const s = Math.min(0.55, 900 / Math.max(1, window.innerWidth)); // low internal resolution: fire is soft, GPU stays cool
      cv.width = Math.max(2, Math.floor(window.innerWidth * s)); cv.height = Math.max(2, Math.floor(window.innerHeight * s));
      gl.viewport(0, 0, cv.width, cv.height);
      if (reduce) draw();
    };
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (now - last < 30) return;
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      const f = fx.current;
      heat += (0.14 + f.e * 0.8 + f.flash * 0.55 - heat) * 0.12;
      phase += dt * (0.9 + heat * 1.6);
      draw();
    };
    const start = () => { if (!raf && !reduce) raf = requestAnimationFrame(frame); };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const vis = () => (document.hidden ? stop() : start());
    resize(); start();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", vis);
    return () => {
      stop();
      window.removeEventListener("resize", resize); document.removeEventListener("visibilitychange", vis);
      gl.deleteBuffer(buf); gl.deleteProgram(prog); gl.deleteShader(vs); gl.deleteShader(fs);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [fx]);
  return <canvas ref={ref} className="fire" aria-hidden="true" />;
});

/* ================= SPARKS + SPECTRUM (2D canvas) ================= */
const Overlay = memo(function Overlay({ fx, vars }: { fx: MutableRefObject<FX>; vars: MutableRefObject<HTMLDivElement | null> }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    const sp = document.createElement("canvas"); sp.width = sp.height = 48;
    const sc = sp.getContext("2d");
    if (sc) {
      const g = sc.createRadialGradient(24, 24, 0, 24, 24, 24);
      g.addColorStop(0, "rgba(255,246,220,1)"); g.addColorStop(0.2, "rgba(255,170,60,.9)");
      g.addColorStop(0.6, "rgba(255,70,10,.25)"); g.addColorStop(1, "rgba(255,40,0,0)");
      sc.fillStyle = g; sc.fillRect(0, 0, 48, 48);
    }
    type A = { x: number; y: number; vx: number; vy: number; s: number; a: number; t: number; k: number };
    type S = { x: number; y: number; vx: number; vy: number; life: number; max: number; w: number };
    let amb: A[] = []; const sparks: S[] = [];
    let w = 0, h = 0, raf = 0, last = 0, seenBurst = fx.current.burstId, grad: CanvasGradient | null = null;
    const inset = () => (window.innerWidth <= 640 ? 150 : 118);
    const mk = (anywhere: boolean): A => ({
      x: Math.random() * w, y: anywhere ? Math.random() * h : h + 20, vx: (Math.random() - 0.5) * 0.3,
      vy: -(0.35 + Math.random() * 1.0), s: 3 + Math.random() * 10, a: 0.3 + Math.random() * 0.7, t: Math.random() * 6.28, k: 0.8 + Math.random() * 2,
    });
    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      cv.width = Math.floor(w * dpr); cv.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(70, Math.max(24, (w * h) / 22000)));
      amb = Array.from({ length: n }, () => mk(true));
      const base = h - inset();
      grad = ctx.createLinearGradient(0, base, 0, base - h * 0.2);
      grad.addColorStop(0, "rgba(255,120,30,.95)"); grad.addColorStop(0.5, "rgba(255,70,10,.55)"); grad.addColorStop(1, "rgba(255,40,0,0)");
    };
    const burst = (pow: number) => {
      const big = pow > 0.5; const count = big ? 90 : 14;
      for (let i = 0; i < count && sparks.length < 240; i++) {
        const a = Math.random() * Math.PI * 2; const v = (big ? 4 + Math.random() * 14 : 2 + Math.random() * 5);
        sparks.push({ x: w / 2, y: h * 0.46, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.6, life: 0.5 + Math.random() * 0.9, max: 1.4, w: 1 + Math.random() * 1.8 });
      }
    };
    const draw = (dt: number) => {
      const f = fx.current;
      ctx.clearRect(0, 0, w, h); ctx.globalCompositeOperation = "lighter";
      for (const p of amb) {
        p.x += (p.vx + Math.sin(p.t) * 0.25) * dt * 60; p.y += p.vy * dt * 60 * (1 + f.e * 2.2); p.t += dt * p.k;
        if (p.y < -30) Object.assign(p, mk(false));
        const sz = p.s * (1 + f.e * 0.6);
        ctx.globalAlpha = Math.min(1, p.a * (0.5 + 0.5 * Math.sin(p.t * 2)) * (0.6 + f.e));
        ctx.drawImage(sp, p.x - sz / 2, p.y - sz / 2, sz, sz);
      }
      ctx.lineCap = "round"; ctx.strokeStyle = "#ffb04a";
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx * dt * 60; s.y += s.vy * dt * 60; s.vx *= 0.965; s.vy = s.vy * 0.965 + 0.05; s.life -= dt;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.globalAlpha = Math.min(1, s.life / 0.5); ctx.lineWidth = s.w;
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * 2.2, s.y - s.vy * 2.2); ctx.stroke();
      }
      // reactor spectrum, centre-out (real analyser data; flat when nothing is playing)
      if (grad) {
        const base = h - inset(); const bw = (w * 0.9) / 2 / BANDS; const cx = w / 2;
        ctx.globalAlpha = 1; ctx.fillStyle = grad;
        for (let i = 0; i < BANDS; i++) {
          const bh = 2 + f.spec[i] * h * 0.2;
          ctx.fillRect(cx + i * bw + 1, base - bh, bw - 2, bh);
          ctx.fillRect(cx - (i + 1) * bw + 1, base - bh, bw - 2, bh);
        }
      }
      ctx.globalAlpha = 1;
    };
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const f = fx.current;
      if (!f.playing) { f.e *= 0.94; for (let i = 0; i < BANDS; i++) f.spec[i] *= 0.92; }
      f.flash *= 0.94;
      if (f.burstId !== seenBurst) { seenBurst = f.burstId; burst(f.burstPow); }
      vars.current?.style.setProperty("--e", Math.min(1, f.e + f.flash * 0.6).toFixed(3));
      draw(dt);
    };
    const start = () => { if (!raf && !reduce) raf = requestAnimationFrame(frame); };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const vis = () => (document.hidden ? stop() : start());
    resize();
    if (reduce) draw(0.016); else start();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", vis);
    return () => { stop(); window.removeEventListener("resize", resize); document.removeEventListener("visibilitychange", vis); };
  }, [fx, vars]);
  return <canvas ref={ref} className="spk" aria-hidden="true" />;
});

/* ================= LYRIC LINE (fixed cinematic size; wraps instead of shrinking) ================= */
function Line({ seg, i, state }: { seg: Timed; i: number; state: "in" | "out" }) {
  const hero = isHero(seg.text);
  const mode = hero ? "slam" : MODES[i % MODES.length];
  const text = hero ? seg.text.toUpperCase() : seg.text;

  return (
    <p className={`ln ${state} ${mode}${hero ? " hero" : ""}`} data-text={text} aria-hidden="true">
      {text.split(" ").map((w, k) => (
        <span key={k}>{k > 0 && " "}<span className="w" style={{ ["--d" as string]: `${k * 45}ms` }}>{w}</span></span>
      ))}
    </p>
  );
}

/* ================= PAGE ================= */
export default function RaakaFireLyricsPage() {
  const rootRef = useRef<HTMLElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const lbRef = useRef<HTMLDivElement>(null);
  const varsRef = useRef<HTMLDivElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const anRef = useRef<AnalyserNode | null>(null);
  const dataRef = useRef<Uint8Array | null>(null);
  const fx = useRef<FX>({ e: 0, flash: 0, spec: new Float32Array(BANDS), playing: false, burstId: 0, burstPow: 0 });
  const activeRef = useRef(-1);
  const prevRef = useRef(-1);
  const uiTick = useRef(0);

  const [started, setStarted] = useState(false);
  const [introGone, setIntroGone] = useState(false);
  const [ready, setReady] = useState(false);
  const [logoOk, setLogoOk] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(SONG_DURATION);
  const [active, setActive] = useState(-1);
  const [leaving, setLeaving] = useState(-1);
  const [shock, setShock] = useState(0);
  const [err, setErr] = useState("");

  const failLogo = useCallback(() => setLogoOk(false), []);

  // Opening sequence timing: the Ignite button unlocks once the title card has played.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = setTimeout(() => setReady(true), reduce ? 50 : 3600);
    return () => clearTimeout(id);
  }, []);

  // After ignition, let the zoom-through finish and then remove the intro layer.
  useEffect(() => {
    if (!started) return;
    const id = setTimeout(() => setIntroGone(true), 1600);
    return () => clearTimeout(id);
  }, [started]);

  const applyActive = useCallback((i: number) => {
    activeRef.current = i; setActive(i);
    if (i < 0) return;
    const hero = isHero(TIMED[i].text);
    const f = fx.current;
    f.burstId++; f.burstPow = hero ? 1 : 0.35; f.flash = Math.max(f.flash, hero ? 1 : 0.25);
    if (hero) {
      setShock((k) => k + 1);
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        stageRef.current?.animate(
          [{ transform: "translate3d(0,0,0)" }, { transform: "translate3d(-9px,5px,0)" }, { transform: "translate3d(8px,-6px,0)" },
            { transform: "translate3d(-5px,-3px,0)" }, { transform: "translate3d(3px,2px,0)" }, { transform: "translate3d(0,0,0)" }],
          { duration: 480, easing: "ease-out" },
        );
        // letterbox bars clamp down on every hero hit
        lbRef.current?.querySelectorAll<HTMLElement>(".lb").forEach((b) =>
          b.animate(
            [{ transform: "scaleY(1)" }, { transform: "scaleY(1.7)", offset: 0.18 }, { transform: "scaleY(1)" }],
            { duration: 950, easing: "cubic-bezier(.2,.8,.2,1)" },
          ),
        );
      }
    }
  }, []);

  const sync = useCallback((t: number) => {
    const i = findActive(t);
    if (i !== activeRef.current) applyActive(i);
    setTime(t);
  }, [applyActive]);

  // Web Audio analysis: created once, after the first user gesture, on the same <audio> element.
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
      an.fftSize = 256; an.smoothingTimeConstant = 0.78;
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
      fx.current.flash = 1;
      try { await a.play(); } catch { setErr("Playback was blocked or this audio format is not supported by your browser."); }
    } else a.pause();
  }, [ensureAnalyser]);

  const seekTo = useCallback((t: number) => {
    const a = audioRef.current;
    if (!a) return;
    const v = Math.max(0, Math.min(t, a.duration || duration));
    a.currentTime = v; sync(v);
  }, [duration, sync]);

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
    if (a.paused) void toggle();
  };

  // Frame loop while playing: precise lyric sync + real frequency analysis.
  useEffect(() => {
    fx.current.playing = playing;
    if (!playing) return;
    let raf = 0;
    const loop = () => {
      const a = audioRef.current;
      if (a) {
        const t = a.currentTime;
        const i = findActive(t);
        if (i !== activeRef.current) applyActive(i);
        const now = performance.now();
        if (now - uiTick.current > 100) { uiTick.current = now; setTime(t); }
      }
      const an = anRef.current; const d = dataRef.current; const f = fx.current;
      if (an && d) {
        an.getByteFrequencyData(d as Parameters<AnalyserNode["getByteFrequencyData"]>[0]);
        let s = 0; const n = Math.min(10, d.length);
        for (let k = 0; k < n; k++) s += d[k];
        f.e += (Math.min(1, (s / n / 255) * 1.25) - f.e) * 0.3;
        for (let b = 0; b < BANDS; b++) {
          const bin = Math.min(d.length - 1, Math.floor(Math.pow(b / BANDS, 1.6) * d.length * 0.75));
          f.spec[b] += (d[bin] / 255 - f.spec[b]) * 0.35;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, applyActive]);

  // Exit animation for the previous line.
  useEffect(() => {
    const prev = prevRef.current; prevRef.current = active;
    if (prev >= 0 && prev !== active) {
      setLeaving(prev);
      const id = setTimeout(() => setLeaving(-1), 650);
      return () => clearTimeout(id);
    }
  }, [active]);

  // Keyboard + unmount cleanup.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
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

  const onMove = (e: RPE<HTMLElement>) => {
    const el = rootRef.current;
    if (!el) return;
    el.style.setProperty("--px", (e.clientX / window.innerWidth - 0.5).toFixed(3));
    el.style.setProperty("--py", (e.clientY / window.innerHeight - 0.5).toFixed(3));
  };
  const onSeek = (e: ChangeEvent<HTMLInputElement>) => seekTo(Number(e.target.value));
  const cur = active >= 0 ? TIMED[active] : null;
  const pct = duration ? Math.min(100, (time / duration) * 100) : 0;
  const logoVar = { ["--logo" as string]: `url(${LOGO_SRC})` };

  return (
    <main ref={rootRef} className={`rk${started ? " go" : ""}`} onPointerMove={onMove}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <h1 className="sr">RAAKA — Make Way for the King</h1>
      <audio
        ref={audioRef} src={AUDIO_SRC} preload="metadata"
        onLoadedMetadata={(e) => { const d = e.currentTarget.duration; if (Number.isFinite(d) && d > 0) setDuration(d); }}
        onTimeUpdate={(e) => { if (!fx.current.playing) sync(e.currentTarget.currentTime); }}
        onPlay={() => { setPlaying(true); setEnded(false); }}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setEnded(true); }}
        onError={() => setErr(`Could not load ${AUDIO_SRC}. Check that the file exists in public/sounds.`)}
      />

      <div className="bg" aria-hidden="true" />
      <div className="floor" aria-hidden="true"><i /></div>
      <FireGL fx={fx} />
      <div className="scrim" aria-hidden="true" />
      <div className="vig" aria-hidden="true" />

      {/* cinematic letterbox */}
      <div className="lbw" ref={lbRef} aria-hidden="true"><i className="lb t" /><i className="lb b" /></div>

      <div className="fxv" ref={varsRef} aria-hidden="true">
        <div className="rays" />
        <div className="rv">
          <div className="rings">
            <div className="ring r1" /><div className="ring r2" /><div className="ring r3" /><div className="ring r4" /><div className="core" />
          </div>
        </div>
        <div className="flare" /><div className="flare b" />
        <i className="br tl" /><i className="br tr" /><i className="br bl" /><i className="br brr" />
        <div className="top">
          {logoOk
            // eslint-disable-next-line @next/next/no-img-element
            ? <img className="hl" src={LOGO_SRC} alt="" draggable={false} onError={failLogo} />
            : <span className="wm"><span className="dot" />RAAKA</span>}
          <span className="mtr"><b /></span>
          <span className="tc">{fmt(time)}</span>
        </div>
      </div>

      <Overlay fx={fx} vars={varsRef} />
      {shock > 0 && (
        <div key={shock} className="shock" aria-hidden="true">
          <i /><b />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {logoOk && <img src={LOGO_SRC} alt="" draggable={false} />}
        </div>
      )}

      <div className="stage" ref={stageRef} aria-live="polite" aria-atomic="true">
        <span className="sr">{cur ? cur.text : ""}</span>
        {leaving >= 0 && leaving !== active && <Line key={`o${leaving}`} seg={TIMED[leaving]} i={leaving} state="out" />}
        {active >= 0 && <Line key={`i${active}`} seg={TIMED[active]} i={active} state="in" />}
        {active < 0 && leaving < 0 && introGone && !ended && logoOk && (
          <div className="emb" key="emb" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_SRC} alt="" draggable={false} />
          </div>
        )}
      </div>

      <div className="scr" aria-hidden="true" />
      <div className="flk" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      {!introGone && (
        <div className={`intro${started ? " launch" : ""}${ready ? " rdy" : ""}`}>
          <i className="cur a" /><i className="cur b" />
          <i className="ivl" />
          <i className="ir" />
          <div className="lgw" style={logoVar}>
            <Logo ok={logoOk} onFail={failLogo} cls="lgi" />
            {logoOk && <i className="swp" />}
          </div>
          <p className="pre">RAAKA PRESENTS</p>
          <p className="ttl" aria-label="Make way for the king">
            {TITLE_WORDS.map((w, k) => (
              <span key={w} style={{ ["--k" as string]: k }}>{w}</span>
            ))}
          </p>
          <button className="start" onClick={() => void toggle()} aria-label="Play song">Ignite</button>
          <i className="fl" />
        </div>
      )}
      {ended && !playing && (
        <div className="endc">
          <div className="lgw" style={logoVar}>
            <Logo ok={logoOk} onFail={failLogo} cls="lgi" />
            {logoOk && <i className="swp" />}
          </div>
          <button className="start" onClick={() => void toggle()} aria-label="Play again">Ignite again</button>
        </div>
      )}
      {err && <p className="err" role="alert">{err}</p>}

      <div className="bar" role="group" aria-label="Player controls">
        <input
          className="seek" type="range" min={0} max={duration} step={0.05} value={Math.min(time, duration)}
          onChange={onSeek} aria-label="Seek through song" aria-valuetext={`${fmt(time)} of ${fmt(duration)}`}
          style={{ ["--p" as string]: `${pct}%` }}
        />
        <button className="ib" onClick={() => jump(-1)} aria-label="Previous lyric"><Icon n="prev" /></button>
        <button className="ib main" onClick={() => void toggle()} aria-label={playing ? "Pause" : "Play"}><Icon n={playing ? "pause" : "play"} /></button>
        <button className="ib" onClick={() => jump(1)} aria-label="Next lyric"><Icon n="next" /></button>
        <span className="tm">{fmt(time)} / {fmt(duration)}</span>
      </div>
    </main>
  );
}

/* ================= STYLES ================= */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@600;800&family=Oxanium:wght@500;700&display=swap');
.rk{--hot:#ff5a14;--ion:#4fb6ff;position:fixed;inset:0;overflow:hidden;background:#030305;color:#ffd9b0;font-family:Oxanium,'Segoe UI',system-ui,sans-serif;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none;touch-action:manipulation}
.rk *{box-sizing:border-box}
.rk img{-webkit-user-drag:none}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.bg{position:absolute;inset:0;background:radial-gradient(ellipse 95% 55% at 50% 112%,rgba(255,80,10,.38),transparent 70%),radial-gradient(ellipse 70% 60% at 50% 40%,#0b0d16,#030305 75%)}
.floor{position:absolute;left:-40%;right:-40%;bottom:0;height:46%;overflow:hidden;transform:perspective(520px) rotateX(66deg);transform-origin:50% 100%;-webkit-mask-image:linear-gradient(to top,#000 0%,transparent 85%);mask-image:linear-gradient(to top,#000 0%,transparent 85%);opacity:.5}
.floor i{position:absolute;inset:-64px 0 0 0;background-image:linear-gradient(rgba(79,182,255,.35) 1px,transparent 1px),linear-gradient(90deg,rgba(79,182,255,.35) 1px,transparent 1px);background-size:64px 64px;animation:gm 2.6s linear infinite}
.fire{position:absolute;inset:0;width:100%;height:100%;mix-blend-mode:screen}
.scrim{position:absolute;inset:0;background:radial-gradient(ellipse 65% 42% at 50% 46%,rgba(2,2,6,.62),transparent 70%)}
.vig{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at center,transparent 42%,rgba(0,0,0,.85) 100%)}

/* letterbox */
.lbw{position:absolute;inset:0;pointer-events:none}
.lb{position:absolute;left:0;right:0;background:#000;transform:scaleY(0);will-change:transform;box-shadow:0 0 40px 12px #000}
.lb.t{top:0;height:calc(max(46px,5.5vh) + env(safe-area-inset-top));transform-origin:top}
.lb.b{bottom:0;height:calc(max(30px,4vh) + env(safe-area-inset-bottom));transform-origin:bottom}
.go .lb{animation:lbo 1.8s cubic-bezier(.2,.8,.2,1) .2s forwards}

.fxv{--e:0;position:absolute;inset:0;pointer-events:none}
.rays{position:absolute;left:50%;top:46%;width:120vmax;height:120vmax;margin:-60vmax 0 0 -60vmax;background:repeating-conic-gradient(from 0deg,rgba(255,150,60,0) 0deg 8deg,rgba(255,170,80,.2) 10deg,rgba(255,150,60,0) 13deg);-webkit-mask:radial-gradient(circle,#000 0,transparent 40%);mask:radial-gradient(circle,#000 0,transparent 40%);opacity:calc(.08 + var(--e)*.5);mix-blend-mode:screen;animation:sz 70s linear infinite;will-change:transform}
.rv{position:absolute;inset:0;display:grid;place-items:center;perspective:1000px}
.rings{position:relative;width:min(82vmin,780px);aspect-ratio:1;transform-style:preserve-3d;opacity:calc(.22 + var(--e)*.55);transform:rotateX(calc(var(--py,0)*-14deg)) rotateY(calc(var(--px,0)*18deg));transition:transform .5s cubic-bezier(.2,.8,.2,1)}
.ring{position:absolute;inset:0;border-radius:50%;transform-style:preserve-3d;will-change:transform}
.r1{border:1.5px solid rgba(255,120,40,.9);box-shadow:0 0 22px rgba(255,90,20,.7),inset 0 0 30px rgba(255,90,20,.3);animation:sx 15s linear infinite}
.r2{inset:8%;border:1px dashed rgba(79,182,255,.85);box-shadow:0 0 16px rgba(79,182,255,.5);animation:sy 19s linear infinite reverse}
.r3{inset:15%;background:conic-gradient(rgba(255,150,50,0),rgba(255,230,180,.95) 16%,rgba(255,150,50,0) 34%,rgba(79,182,255,0) 55%,rgba(79,182,255,.9) 74%,rgba(79,182,255,0));-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 5px),#000 calc(100% - 4px));mask:radial-gradient(farthest-side,transparent calc(100% - 5px),#000 calc(100% - 4px));animation:sz 6.5s linear infinite}
.r4{inset:-7%;border:2px dotted rgba(255,140,60,.55);animation:st 26s linear infinite}
.core{position:absolute;inset:36%;border-radius:50%;background:radial-gradient(circle,rgba(255,150,60,.5),rgba(255,70,10,.12) 55%,transparent 70%);animation:pl 3s ease-in-out infinite}
.flare{position:absolute;left:50%;top:46%;width:96vw;height:2px;margin-left:-48vw;background:linear-gradient(90deg,transparent,rgba(79,182,255,.15) 12%,rgba(150,215,255,.85) 40%,#fff 50%,rgba(255,150,60,.85) 62%,rgba(255,90,20,.15) 88%,transparent);box-shadow:0 0 26px 4px rgba(255,120,40,.45);opacity:calc(.12 + var(--e)*.8);transform:scaleX(calc(.45 + var(--e)*.7))}
.flare.b{top:calc(46% + 7px);height:1px;width:60vw;margin-left:-30vw;box-shadow:none;opacity:calc(.05 + var(--e)*.5)}
.br{position:absolute;width:34px;height:34px;border:1.5px solid rgba(255,140,60,.75)}
.tl{top:max(12px,env(safe-area-inset-top));left:max(12px,env(safe-area-inset-left));border-right:0;border-bottom:0}
.tr{top:max(12px,env(safe-area-inset-top));right:max(12px,env(safe-area-inset-right));border-left:0;border-bottom:0}
.bl{bottom:max(12px,env(safe-area-inset-bottom));left:max(12px,env(safe-area-inset-left));border-right:0;border-top:0}
.brr{bottom:max(12px,env(safe-area-inset-bottom));right:max(12px,env(safe-area-inset-right));border-left:0;border-top:0}
.top{position:absolute;top:max(14px,calc(env(safe-area-inset-top) + 8px));left:max(56px,calc(env(safe-area-inset-left) + 44px));right:max(56px,calc(env(safe-area-inset-right) + 44px));display:flex;align-items:center;justify-content:space-between;gap:14px;font:700 13px Oxanium,sans-serif;letter-spacing:.34em;color:#ffb27a;opacity:0;transition:opacity 1.4s ease 1s}
.go .top{opacity:1}
.hl{display:block;height:30px;width:auto;max-width:42vw;object-fit:contain;filter:drop-shadow(0 0 8px rgba(255,100,20,.85)) drop-shadow(0 0 22px rgba(255,60,0,.45))}
.dot{display:inline-block;width:7px;height:7px;margin-right:10px;border-radius:50%;background:var(--hot);box-shadow:0 0 12px var(--hot);animation:bk 1.4s infinite}
.mtr{flex:1;max-width:260px;height:3px;background:rgba(255,140,60,.18)}
.mtr b{display:block;height:100%;background:linear-gradient(90deg,var(--hot),#ffe0a8);box-shadow:0 0 12px var(--hot);transform-origin:left;transform:scaleX(calc(.04 + var(--e)))}
.tc{font-variant-numeric:tabular-nums;letter-spacing:.2em}
.spk{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;mix-blend-mode:screen}
.shock{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.shock i{position:absolute;left:50%;top:46%;width:30vmin;height:30vmin;margin:-15vmin 0 0 -15vmin;border-radius:50%;border:2px solid rgba(255,200,140,.95);box-shadow:0 0 40px 6px rgba(255,100,20,.7),inset 0 0 40px rgba(255,100,20,.5);animation:sk .9s cubic-bezier(.1,.7,.3,1) both}
.shock b{position:absolute;inset:0;background:radial-gradient(circle at 50% 46%,rgba(255,220,170,.55),rgba(255,90,20,.18) 40%,transparent 70%);animation:fh .7s ease-out both}
.shock img{position:absolute;left:50%;top:46%;width:min(70vw,420px);max-height:34vh;object-fit:contain;mix-blend-mode:screen;animation:sl 1s cubic-bezier(.1,.7,.3,1) both}

/* lyrics stage: sits between the top letterbox and the player bar */
.stage{position:absolute;left:0;right:0;top:calc(max(46px,5.5vh) + env(safe-area-inset-top));bottom:120px;display:grid;place-items:center;padding:0 3vw;perspective:900px;pointer-events:none;transform:translate3d(calc(var(--px,0)*-10px),calc(var(--py,0)*-7px),0)}
.ln{grid-area:1/1;position:relative;margin:0;width:min(94vw,1500px);max-width:94vw;text-align:center;text-wrap:balance;white-space:normal;overflow-wrap:normal;word-break:normal;font-family:Unbounded,'Segoe UI',system-ui,sans-serif;font-weight:800;line-height:1.08;letter-spacing:-.025em;will-change:transform,opacity;transform-style:preserve-3d;text-shadow:0 1px 0 #ffdfad,0 2px 0 #d98935,0 3px 0 #9c421b,0 4px 0 #64240f,0 7px 0 rgba(20,5,0,.8),0 12px 20px rgba(0,0,0,.95);filter:drop-shadow(0 0 2px rgba(255,205,130,.9)) drop-shadow(0 0 18px rgba(255,110,20,.75)) drop-shadow(0 0 60px rgba(255,60,0,.45)) drop-shadow(0 18px 22px rgba(0,0,0,.9))}
/* Keep a stable cinematic type scale. Long lyric lines wrap to 2+ lines; they are never auto-shrunk. */
.ln{font-size:clamp(34px,7.3vw,112px)}
.ln.hero{font-size:clamp(42px,9vw,142px);letter-spacing:-.025em;line-height:1.04}
.ln .w{position:relative;transform:translateZ(18px);text-shadow:0 1px 0 #fff0c9,0 2px 0 #e7a34d,0 4px 0 #8d3516,0 8px 12px rgba(0,0,0,.85)}
.mol,.w{display:inline-block;background:linear-gradient(180deg,#fffaf0 0%,#ffe2a0 28%,#ff9a2e 60%,#e8420a 100%);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent}
.w{padding:.07em .03em;vertical-align:baseline}
.ln.in{animation:lyric-arrive .9s cubic-bezier(.16,1,.3,1) both,dl 8s linear .9s both}
.ln.out{animation:lyric-depart .62s cubic-bezier(.65,0,.35,1) both;filter:blur(2px) drop-shadow(0 0 20px rgba(255,110,20,.5))}
.ln.in.ignite .w{animation:wi .75s cubic-bezier(.2,.9,.2,1) var(--d) both}
.ln.in.warp .w{animation:ww .8s cubic-bezier(.16,1,.3,1) var(--d) both}
.ln.in.scan .w{animation:wc .7s cubic-bezier(.2,.9,.2,1) var(--d) both}
.ln.in.slam .w{animation:ws .8s cubic-bezier(.2,1.2,.3,1) var(--d) both}
.ln::before,.ln::after{content:attr(data-text);position:absolute;inset:0;pointer-events:none;opacity:0;mix-blend-mode:screen;text-align:center;-webkit-text-fill-color:currentColor}
.ln::before{color:#3fc6ff}.ln::after{color:#ff2d2d}
.ln.in::before{animation:c1 .65s steps(1) both}.ln.in::after{animation:c2 .65s steps(1) both}

/* logo emblem shown during instrumental gaps */
.emb{grid-area:1/1;width:min(66vw,400px);animation:embin 1s ease-out .6s both}
.emb img{display:block;width:100%;height:auto;max-height:30vh;object-fit:contain;filter:drop-shadow(0 0 22px rgba(255,100,20,.85)) drop-shadow(0 0 70px rgba(255,60,0,.55));animation:pl 2.4s ease-in-out infinite}

/* film layers */
.scr{position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,transparent 12%,rgba(255,235,200,.18) 12.12%,transparent 12.3%,transparent 71%,rgba(255,235,200,.12) 71.1%,transparent 71.25%);opacity:0;animation:scr 2.6s steps(1) infinite}
.flk{position:absolute;inset:0;pointer-events:none;background:#000;opacity:0;animation:flk 4.7s steps(1) infinite}
.grain{position:absolute;inset:-50%;opacity:.07;pointer-events:none;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 .8  0 0 0 0 .6  0 0 0 .9 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");animation:gr .9s steps(6) infinite}

/* ===== opening title sequence ===== */
.intro{position:absolute;inset:0;z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(10px,2.2vh,22px);text-align:center;padding:24px 20px 110px;perspective:1000px;overflow:hidden;background:radial-gradient(circle at 50% 46%,rgba(3,3,6,.2),rgba(2,2,4,.88))}
.intro>*{position:relative;z-index:1}
.intro>.cur{position:absolute;z-index:3;left:0;right:0;height:50.6%;background:#000;animation:cu 1.4s cubic-bezier(.77,0,.18,1) 1s both}
.cur.a{top:0;--d:-1;border-bottom:1px solid #ffd2a0;box-shadow:0 6px 44px 4px rgba(255,100,20,.75)}
.cur.b{bottom:0;--d:1;border-top:1px solid #ffd2a0;box-shadow:0 -6px 44px 4px rgba(255,100,20,.75)}
.intro>.ivl{position:absolute;z-index:4;left:50%;top:50%;height:2px;width:0;margin-top:-1px;transform:translateX(-50%);background:linear-gradient(90deg,transparent,#ffd9a0,#fff,#ffd9a0,transparent);box-shadow:0 0 30px 6px rgba(255,120,30,.85);animation:ivl 1.6s cubic-bezier(.2,.8,.2,1) .15s both}
.intro>.ir{position:absolute;z-index:0;left:50%;top:46%;width:120vmax;height:120vmax;margin:-60vmax 0 0 -60vmax;background:repeating-conic-gradient(from 0deg,rgba(255,150,60,0) 0deg 9deg,rgba(255,180,90,.24) 11deg,rgba(255,150,60,0) 14deg);-webkit-mask:radial-gradient(circle,#000 0,transparent 38%);mask:radial-gradient(circle,#000 0,transparent 38%);mix-blend-mode:screen;opacity:0;animation:ro 2.4s ease 1.7s both,sz 60s linear 1.7s infinite}
.lgw{position:relative;transform:rotateX(calc(var(--py,0)*-16deg)) rotateY(calc(var(--px,0)*22deg));transition:transform .5s cubic-bezier(.2,.8,.2,1);filter:drop-shadow(0 0 22px rgba(255,100,20,.85)) drop-shadow(0 0 80px rgba(255,60,0,.55)) drop-shadow(0 14px 18px #000)}
.lgi{display:block;width:min(80vw,560px);height:auto;max-height:34vh;object-fit:contain;opacity:0;animation:lg 2.4s cubic-bezier(.16,1,.3,1) 1.5s both,pl 3s ease-in-out 4s infinite}
.swp{position:absolute;inset:0;pointer-events:none;-webkit-mask:var(--logo) center/contain no-repeat;mask:var(--logo) center/contain no-repeat;background:linear-gradient(105deg,transparent 42%,rgba(255,255,255,.95) 50%,transparent 58%) 0 0/250% 100% no-repeat;opacity:0;animation:sw 2.8s ease-in-out 3.5s infinite}
.logo{margin:0;font:800 clamp(64px,19vw,270px)/1 Unbounded,sans-serif;letter-spacing:-.01em;padding:.06em .04em;opacity:0;animation:lg 2.4s cubic-bezier(.16,1,.3,1) 1.5s both}
.pre{margin:0;font:700 clamp(11px,1.6vw,15px) Oxanium,sans-serif;color:#ffb27a;padding-left:.3em;opacity:0;animation:pre 1.8s cubic-bezier(.2,.8,.2,1) 2.7s both}
.ttl{margin:0;display:flex;flex-wrap:wrap;justify-content:center;gap:.2em .9em;max-width:92vw;font:700 clamp(15px,3.6vw,26px) Oxanium,sans-serif;color:#ffe3bd;text-shadow:0 0 18px rgba(255,100,20,.8)}
.ttl span{opacity:0;display:inline-block;letter-spacing:.34em;margin-right:-.34em;animation:tw 1.1s cubic-bezier(.2,.8,.2,1) calc(3s + var(--k)*.17s) both}
.rk .start{margin-top:8px;padding:16px 52px;border:1px solid var(--hot);background:linear-gradient(180deg,rgba(255,90,20,.25),rgba(120,20,0,.25));color:#fff0dc;font:700 16px Oxanium,sans-serif;letter-spacing:.34em;padding-left:calc(52px + .34em);cursor:pointer;clip-path:polygon(14px 0,100% 0,100% calc(100% - 14px),calc(100% - 14px) 100%,0 100%,0 14px);transition:background .25s,transform .25s;opacity:0;animation:bi 1s ease 3.6s both,pl 2.4s ease-in-out 4.7s infinite}
.intro:not(.rdy) .start{pointer-events:none}
.rk .start:hover{background:rgba(255,100,30,.45);transform:scale(1.05)}
.rk button:focus-visible,.rk input:focus-visible{outline:2px solid #ffd9a0;outline-offset:3px}
.intro>.fl{position:absolute;z-index:6;inset:0;opacity:0;pointer-events:none;background:radial-gradient(circle at 50% 46%,#fff4dc,rgba(255,140,40,.85) 35%,rgba(255,60,0,.2) 70%,transparent)}

/* ignition: logo punches through the camera */
.intro.launch{pointer-events:none;animation:il 1.6s cubic-bezier(.6,0,.2,1) both}
.intro.launch .lgw,.intro.launch .logo{animation:lz 1.3s cubic-bezier(.7,0,.2,1) both}
.intro.launch .lgi{animation:none;opacity:1}
.intro.launch .swp,.intro.launch .pre,.intro.launch .ttl,.intro.launch .start,.intro.launch .ir{animation:none;opacity:0;transition:opacity .3s}
.intro.launch>.cur,.intro.launch>.ivl{display:none}
.intro.launch>.fl{animation:fl 1.2s ease-out both}

/* end card */
.endc{position:absolute;inset:0;z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px;padding:24px 24px 120px;perspective:1000px;background:radial-gradient(circle at 50% 46%,rgba(2,2,4,.5),rgba(2,2,4,.92));animation:fi 1.2s ease both}
.endc .lgi,.endc .logo{animation:lg 1.8s cubic-bezier(.16,1,.3,1) .2s both,pl 3s ease-in-out 2.2s infinite}
.endc .swp{animation-delay:1.8s}
.endc .start{animation:bi 1s ease 1.3s both,pl 2.4s ease-in-out 2.4s infinite}

.err{position:absolute;z-index:8;left:50%;top:max(60px,calc(env(safe-area-inset-top) + 50px));transform:translateX(-50%);margin:0;max-width:92vw;padding:10px 18px;border:1px solid #ff6a6a;background:rgba(40,6,6,.94);color:#ffd0d0;font:600 14px Oxanium,sans-serif;text-align:center}
.bar{position:absolute;z-index:6;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;gap:12px;padding:22px max(22px,env(safe-area-inset-right)) max(18px,env(safe-area-inset-bottom)) max(22px,env(safe-area-inset-left));background:linear-gradient(to top,rgba(2,2,4,.95),rgba(2,2,4,.55) 70%,transparent)}
.seek{position:absolute;left:0;right:0;top:8px;width:100%;height:18px;margin:0;appearance:none;-webkit-appearance:none;background:transparent;cursor:pointer}
.seek::-webkit-slider-runnable-track{height:3px;background:linear-gradient(90deg,#ff7a2a var(--p,0%),rgba(255,140,60,.2) var(--p,0%))}
.seek::-moz-range-track{height:3px;background:rgba(255,140,60,.2)}.seek::-moz-range-progress{height:3px;background:#ff7a2a}
.seek::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;margin-top:-4.5px;background:#fff1d8;transform:rotate(45deg);box-shadow:0 0 14px 4px rgba(255,110,30,.95)}
.seek::-moz-range-thumb{width:12px;height:12px;border:0;border-radius:0;background:#fff1d8;box-shadow:0 0 14px 4px rgba(255,110,30,.95)}
.rk .ib{display:grid;place-items:center;width:46px;height:46px;border:1px solid rgba(255,120,50,.5);background:rgba(255,90,20,.08);color:#ffb27a;cursor:pointer;clip-path:polygon(9px 0,100% 0,100% calc(100% - 9px),calc(100% - 9px) 100%,0 100%,0 9px);transition:background .2s,color .2s}
.rk .ib:hover{background:rgba(255,100,30,.35);color:#fff}
.rk .ib.main{width:58px;height:58px;color:#fff0dc;background:rgba(255,90,20,.3)}
.tm{position:absolute;right:max(22px,env(safe-area-inset-right));bottom:max(30px,calc(env(safe-area-inset-bottom) + 12px));font:700 14px Oxanium,sans-serif;letter-spacing:.14em;color:#ffb27a;font-variant-numeric:tabular-nums}

@keyframes fi{from{opacity:0}to{opacity:1}}
@keyframes gm{to{transform:translateY(64px)}}
@keyframes sx{to{transform:rotateX(360deg)}}@keyframes sy{to{transform:rotateY(360deg)}}@keyframes sz{to{transform:rotate(360deg)}}
@keyframes st{from{transform:rotateX(68deg) rotateZ(0)}to{transform:rotateX(68deg) rotateZ(360deg)}}
@keyframes pl{0%,100%{opacity:.8;filter:brightness(.92)}50%{opacity:1;filter:brightness(1.35)}}
@keyframes bk{50%{opacity:.25}}
@keyframes gr{0%{transform:translate(0,0)}20%{transform:translate(-3%,2%)}40%{transform:translate(2%,-3%)}60%{transform:translate(-2%,-1%)}80%{transform:translate(3%,3%)}100%{transform:translate(0,0)}}
@keyframes li{from{opacity:0}to{opacity:1}}
@keyframes lyric-arrive{0%{opacity:0;transform:translate3d(0,42px,-180px) rotateX(-24deg) scale(.78);filter:blur(12px)}55%{opacity:1;filter:blur(0)}78%{transform:translate3d(0,-3px,18px) rotateX(2deg) scale(1.015)}100%{opacity:1;transform:translate3d(0,0,0) rotateX(0) scale(1);filter:blur(0)}}
@keyframes lyric-depart{0%{opacity:1;transform:translate3d(0,0,0) rotateX(0) scale(1);filter:blur(0)}100%{opacity:0;transform:translate3d(0,-28px,-90px) rotateX(12deg) scale(.94);filter:blur(8px)}}
@keyframes dl{from{transform:scale(1)}to{transform:scale(1.06)}}
@keyframes lo{to{opacity:0;transform:scale(1.12) translateY(-3%)}}
@keyframes wi{from{opacity:0;transform:translateY(70%) scale(.85);clip-path:inset(100% 0 0 0)}to{opacity:1;transform:none;clip-path:inset(0)}}
@keyframes ww{from{opacity:0;transform:scale(2.4)}to{opacity:1;transform:none}}
@keyframes wc{from{opacity:0;clip-path:inset(0 50% 0 50%);transform:scaleX(1.4)}to{opacity:1;clip-path:inset(0);transform:none}}
@keyframes ws{0%{opacity:0;transform:translateY(-45%) scale(1.9)}55%{opacity:1;transform:translateY(4%) scale(.96)}100%{opacity:1;transform:none}}
@keyframes c1{0%{opacity:.9;transform:translate(-7px,0);clip-path:inset(10% 0 55% 0)}20%{clip-path:inset(60% 0 10% 0);transform:translate(5px,1px)}40%{clip-path:inset(30% 0 40% 0);transform:translate(-4px,0)}60%{opacity:.6;clip-path:inset(0 0 70% 0)}100%{opacity:0}}
@keyframes c2{0%{opacity:.8;transform:translate(7px,0);clip-path:inset(55% 0 10% 0)}25%{clip-path:inset(15% 0 60% 0);transform:translate(-5px,0)}50%{clip-path:inset(40% 0 30% 0);transform:translate(4px,1px)}70%{opacity:.5;clip-path:inset(75% 0 0 0)}100%{opacity:0}}
@keyframes sk{from{opacity:1;transform:scale(.1)}to{opacity:0;transform:scale(6)}}
@keyframes fh{from{opacity:1}to{opacity:0}}
@keyframes sl{from{opacity:.6;transform:translate(-50%,-50%) scale(.6)}to{opacity:0;transform:translate(-50%,-50%) scale(1.9)}}
@keyframes lbo{to{transform:scaleY(1)}}
@keyframes embin{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:none}}
@keyframes scr{0%{opacity:0}8%{opacity:.7;transform:translateX(0)}12%{opacity:0}40%{opacity:.5;transform:translateX(38vw)}44%{opacity:0}72%{opacity:.6;transform:translateX(-22vw)}76%{opacity:0}100%{opacity:0}}
@keyframes flk{0%,100%{opacity:0}12%{opacity:.07}13%{opacity:0}47%{opacity:.1}48%{opacity:0}49%{opacity:.05}50%{opacity:0}83%{opacity:.08}84%{opacity:0}}
/* intro keyframes */
@keyframes cu{to{transform:translateY(calc(var(--d)*101%))}}
@keyframes ivl{0%{width:0;opacity:1}55%{width:100vw;opacity:1}100%{width:100vw;opacity:0}}
@keyframes ro{from{opacity:0}to{opacity:1}}
@keyframes lg{0%{opacity:0;transform:scale(1.5);filter:blur(22px) brightness(4)}30%{opacity:1;filter:blur(8px) brightness(2.6)}46%{opacity:.25}52%{opacity:1}58%{opacity:.4}64%{opacity:1}100%{opacity:1;transform:none;filter:blur(0) brightness(1)}}
@keyframes sw{0%{opacity:1;background-position:0 0}55%,100%{opacity:1;background-position:100% 0}}
@keyframes pre{from{opacity:0;letter-spacing:.1em;filter:blur(6px)}to{opacity:1;letter-spacing:.62em;filter:blur(0)}}
@keyframes tw{from{opacity:0;transform:translateY(14px) scale(1.25);filter:blur(10px)}to{opacity:1;transform:none;filter:blur(0)}}
@keyframes bi{from{opacity:0;transform:translateY(16px) scale(.9)}to{opacity:1;transform:none}}
@keyframes il{0%,60%{opacity:1}100%{opacity:0}}
@keyframes lz{0%{transform:scale(1);opacity:1;filter:brightness(1)}60%{opacity:1}100%{transform:scale(7);opacity:0;filter:brightness(3) blur(10px)}}
@keyframes fl{0%{opacity:0}22%{opacity:1}100%{opacity:0}}

@media (max-width:640px){
  .br{width:24px;height:24px}
  .top{left:44px;right:44px;font-size:11px;letter-spacing:.24em}
  .hl{height:24px}
  .mtr{max-width:90px}
  .stage{bottom:150px;padding:0 2.5vw}
  .ln{width:95vw;max-width:95vw;font-size:clamp(30px,8.1vw,58px);line-height:1.12}
  .ln.hero{font-size:clamp(34px,9.4vw,68px);line-height:1.06}
  .bar{gap:10px;padding-top:28px}
  .tm{position:static;font-size:12px;margin-left:2px}
  .rk .ib{width:44px;height:44px}
  .rk .ib.main{width:54px;height:54px}
  .rk .start{padding:14px 38px;padding-left:calc(38px + .34em)}
  .pre{letter-spacing:.4em}
  .ttl{gap:.2em .7em}
  .intro,.endc{padding-bottom:150px}
}
@media (max-height:480px) and (orientation:landscape){
  .stage{bottom:90px}
  .lgi{max-height:30vh;width:min(44vw,380px)}
  .intro{gap:8px;padding-bottom:90px}
  .endc{padding-bottom:90px}
}
@media (prefers-reduced-motion:reduce){
  .ring,.floor i,.grain,.core,.rays,.scr,.flk,.emb img{animation:none}
  .ln.in,.ln.out,.ln.in .w{animation-duration:.01ms;animation-delay:0s}
  .ln::before,.ln::after{display:none}
  .shock{display:none}
  .intro *,.endc *{animation-duration:.01ms!important;animation-delay:0s!important}
  .intro>.cur,.intro>.ivl{display:none}
}
`;
