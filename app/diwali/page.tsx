"use client";

import { useEffect, useRef } from "react";

/* The same scene is rendered twice: a dim etched "ghost" and a bright gold "lit"
   copy that is only visible under the moving flame (CSS mask). */
function Scene({ lit }: { lit?: boolean }) {
  return (
    <div className={`layer ${lit ? "lit" : "ghost"}`} aria-hidden={lit ? undefined : true}>
      <svg className="mandala" viewBox="-200 -200 400 400" aria-hidden="true">
        <g className="m1">
          {Array.from({ length: 24 }).map((_, i) => (
            <path key={i} d="M0 -192 Q 15 -160 0 -126 Q -15 -160 0 -192Z" transform={`rotate(${i * 15})`} />
          ))}
        </g>
        <g className="m2">
          {Array.from({ length: 12 }).map((_, i) => (
            <path key={i} d="M0 -118 Q 24 -90 0 -56 Q -24 -90 0 -118Z" transform={`rotate(${i * 30})`} />
          ))}
          <circle r="124" />
          <circle r="198" />
        </g>
      </svg>

      <div className="copy">
        <p className="brand">
          <span className="mark">✦</span> World of Raaka
        </p>
        <h1 className="hi">
          शुभ
          <br />
          दीपावली
        </h1>
        <h2 className="en">Happy Diwali</h2>
        <p className="wish">
          रोशनी का यह पर्व आपके जीवन में सुख, समृद्धि और शांति लाए।
          <br />
          World of Raaka की ओर से आपको और आपके परिवार को
          <br />
          दीपावली की हार्दिक शुभकामनाएँ।
        </p>
        <p className="shloka">तमसो मा ज्योतिर्गमय ॥</p>
      </div>

      <p className="foot">Made with ❤️ by World of Raaka</p>
    </div>
  );
}

export default function DiwaliPage() {
  const mainRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = mainRef.current;
    const canvas = canvasRef.current;
    if (!el || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = window.innerWidth;
    let H = window.innerHeight;
    let raf = 0;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    /* ---- state ---- */
    let x = W / 2, y = H + 140, tx = x, ty = y;
    let manual = false, lastMove = 0, pulse = 0, nextAuto = 1800;

    type P = { x: number; y: number; vx: number; vy: number; a: number; c: string; s: number; d: number; g: number };
    type R = { x: number; y: number; ty: number; v: number; c: string; shape: number };
    const parts: P[] = [];
    const rockets: R[] = [];
    const colors = ["#FFD36B", "#FF8A3D", "#FF4D8D", "#6FE6FF", "#FFF4D6", "#C58BFF"];
    const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

    const dust = Array.from({ length: Math.min(260, Math.round((W * H) / 6500)) }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.2, vy: -0.1 - Math.random() * 0.35,
      s: 0.5 + Math.random() * 1.6, ph: Math.random() * 6.28,
    }));

    const explode = (px: number, py: number, c: string, shape: number) => {
      pulse = Math.min(1, pulse + 0.4);
      const add = (vx: number, vy: number, col: string, g: number) =>
        parts.push({ x: px, y: py, vx, vy, a: 1, c: col, s: Math.random() * 1.6 + 0.8, d: Math.random() * 0.008 + 0.006, g });
      if (shape === 0) {
        for (let i = 0; i < 130; i++) {
          const an = Math.random() * 6.283, sp = Math.random() * 5 + 0.8;
          add(Math.cos(an) * sp, Math.sin(an) * sp, Math.random() > 0.25 ? c : "#fff", 0.04);
        }
      } else if (shape === 1) {
        for (let i = 0; i < 70; i++) {
          const an = (i / 70) * 6.283;
          add(Math.cos(an) * 5, Math.sin(an) * 5, c, 0.02);
          add(Math.cos(an) * 2.6, Math.sin(an) * 2.6, "#FFF4D6", 0.02);
        }
      } else {
        for (let i = 0; i < 90; i++) {
          const t = (i / 90) * 6.283;
          const hx = 16 * Math.pow(Math.sin(t), 3);
          const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
          add(hx * 0.28, hy * 0.28 - 0.4, "#FF4D8D", 0.025);
        }
      }
    };

    const launch = (px?: number, py?: number) =>
      rockets.push({
        x: px ?? W * (0.12 + Math.random() * 0.76),
        y: H + 10,
        ty: py ?? H * (0.1 + Math.random() * 0.35),
        v: 7 + Math.random() * 3,
        c: pick(colors),
        shape: Math.random() < 0.6 ? 0 : Math.random() < 0.6 ? 1 : 2,
      });

    /* ---- input ---- */
    const onMove = (e: PointerEvent) => {
      manual = true; lastMove = performance.now();
      tx = e.clientX; ty = e.clientY;
    };
    const onDown = (e: PointerEvent) => {
      onMove(e);
      launch(e.clientX, e.clientY - 30);
      pulse = 1;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onDown);

    /* ---- loop ---- */
    const frame = (t: number) => {
      if (!manual || t - lastMove > 3500) {
        manual = false;
        tx = W / 2 + Math.sin(t * 0.00055) * W * 0.3;
        ty = H * 0.46 + Math.cos(t * 0.0008) * H * 0.16;
      }
      x += (tx - x) * 0.06;
      y += (ty - y) * 0.06;
      pulse *= 0.93;

      const base = Math.min(Math.max(Math.min(W, H) * 0.42, 190), 380);
      const r = base * Math.min(1, t / 2400) * (1 + pulse * 0.6) * (1 + 0.03 * Math.sin(t / 120));
      el.style.setProperty("--x", `${x}px`);
      el.style.setProperty("--y", `${y}px`);
      el.style.setProperty("--r", `${r}px`);

      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";

      /* flame glow */
      const gr = r * 0.55;
      const g = ctx.createRadialGradient(x, y, 0, x, y, gr);
      g.addColorStop(0, "rgba(255,196,90,0.38)");
      g.addColorStop(1, "rgba(255,140,30,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, gr, 0, 6.283);
      ctx.fill();
      const fl = 1 + 0.12 * Math.sin(t / 70) + 0.08 * Math.sin(t / 37);
      ctx.fillStyle = "#FFF3C4";
      ctx.beginPath();
      ctx.ellipse(x, y, 4 * fl, 8 * fl, 0, 0, 6.283);
      ctx.fill();

      /* golden dust that wakes up near the flame */
      for (const d of dust) {
        d.x += d.vx + Math.sin(t / 1500 + d.ph) * 0.12;
        d.y += d.vy;
        const dx = d.x - x, dy = d.y - y;
        const dist = Math.hypot(dx, dy);
        let a = 0.12 + 0.2 * Math.abs(Math.sin(t / 900 + d.ph));
        if (dist < r * 1.15) {
          const k = 1 - dist / (r * 1.15);
          a += k * 0.75;
          d.x += (-dy / (dist + 1)) * k * 0.9; // gentle swirl around the flame
          d.y += (dx / (dist + 1)) * k * 0.9;
        }
        if (d.y < -10) { d.y = H + 10; d.x = Math.random() * W; }
        if (d.x < -10) d.x = W + 10;
        if (d.x > W + 10) d.x = -10;
        ctx.globalAlpha = Math.min(a, 1);
        ctx.fillStyle = "#FFC766";
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.s, 0, 6.283);
        ctx.fill();
      }

      /* fireworks */
      if (!still && t > nextAuto) {
        launch();
        nextAuto = t + 2200 + Math.random() * 2200;
      }
      for (let i = rockets.length - 1; i >= 0; i--) {
        const k = rockets[i];
        k.y -= k.v;
        k.x += Math.sin(k.y * 0.05) * 0.4;
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#FFF3C4";
        ctx.beginPath();
        ctx.arc(k.x, k.y, 2.2, 0, 6.283);
        ctx.fill();
        parts.push({ x: k.x, y: k.y, vx: (Math.random() - 0.5) * 0.6, vy: Math.random() * 0.8, a: 0.7, c: "#FFB86B", s: 0.9, d: 0.045, g: 0.02 });
        if (k.y <= k.ty) { explode(k.x, k.y, k.c, k.shape); rockets.splice(i, 1); }
      }
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx; p.y += p.vy; p.vy += p.g; p.vx *= 0.99; p.vy *= 0.995; p.a -= p.d;
        if (p.a <= 0) { parts.splice(i, 1); continue; }
        ctx.globalAlpha = p.a;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.s, 0, 6.283);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return (
    <main ref={mainRef} className="noir">
      <Scene />
      <Scene lit />
      <canvas ref={canvasRef} className="fx" />
      <div className="vignette" />
      <div className="grain" />
      <p className="hint">उंगली या माउस से रोशनी घुमाइए · टैप करके आतिशबाज़ी देखिए</p>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@1,9..144,300;1,9..144,600&family=Tiro+Devanagari+Hindi&family=Mukta:wght@300;400&display=swap");

        * { box-sizing: border-box; }
        html, body { margin: 0; background: #050403; }

        .noir {
          position: relative; min-height: 100svh; overflow: hidden; isolation: isolate; color: #fff;
          font-family: "Mukta", "Segoe UI", sans-serif; touch-action: none; cursor: none;
          background:
            radial-gradient(ellipse 70% 55% at 50% 45%, #140d06, transparent 75%),
            #050403;
        }

        .layer { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 24px; }
        .lit {
          --m: radial-gradient(circle var(--r, 0px) at var(--x, 50%) var(--y, 130%), #000 0%, rgba(0,0,0,.9) 30%, rgba(0,0,0,.35) 65%, transparent 100%);
          -webkit-mask-image: var(--m); mask-image: var(--m);
        }

        .mandala { position: absolute; width: min(135vw, 960px); top: 50%; left: 50%; transform: translate(-50%, -50%); }
        .mandala g { transform-origin: 0 0; }
        .m1 { animation: spin 160s linear infinite; }
        .m2 { animation: spin 100s linear infinite reverse; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .mandala path, .mandala circle { fill: none; stroke-width: 0.8; }
        .mandala circle { stroke-dasharray: 2 6; }
        .ghost .mandala path, .ghost .mandala circle { stroke: rgba(230, 170, 80, 0.11); }
        .lit .mandala path, .lit .mandala circle { stroke: #ffcf70; filter: drop-shadow(0 0 4px rgba(255, 170, 40, 0.8)); }

        .copy { position: relative; display: flex; flex-direction: column; align-items: center; }

        .brand { margin: 0 0 22px; font-family: "Fraunces", Georgia, serif; font-style: italic; font-size: 20px; letter-spacing: 3px; }
        .ghost .brand { color: rgba(220, 180, 110, 0.4); }
        .lit .brand { color: #ffe3a1; text-shadow: 0 0 18px rgba(255, 170, 40, 0.7); }
        .mark { margin-right: 6px; }

        .hi {
          margin: 0; font-family: "Tiro Devanagari Hindi", serif; font-weight: 400; line-height: 1.04;
          font-size: clamp(76px, 19vw, 190px);
        }
        .ghost .hi { color: transparent; -webkit-text-stroke: 1px rgba(235, 180, 90, 0.32); }
        .lit .hi {
          background: linear-gradient(100deg, #b9782a 0%, #fff3c9 30%, #f2c76a 45%, #fff 52%, #f2c76a 60%, #b9782a 100%);
          background-size: 250% 100%; animation: shine 6s ease-in-out infinite;
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 28px rgba(255, 150, 30, 0.55));
        }
        @keyframes shine { 0% { background-position: 120% 0; } 60%, 100% { background-position: -120% 0; } }

        .en { margin: 10px 0 0; font-family: "Fraunces", Georgia, serif; font-style: italic; font-weight: 300; font-size: clamp(28px, 6vw, 56px); letter-spacing: 0.18em; }
        .ghost .en { color: rgba(220, 180, 110, 0.34); }
        .lit .en { color: #fff1d2; text-shadow: 0 0 24px rgba(255, 170, 50, 0.6); }

        .wish { margin: 28px 0 0; font-size: 18px; line-height: 1.9; font-weight: 300; max-width: 600px; }
        .ghost .wish { color: rgba(200, 180, 140, 0.4); }
        .lit .wish { color: #ffe9bd; }

        .shloka { margin: 22px 0 0; font-family: "Tiro Devanagari Hindi", serif; font-size: 26px; }
        .ghost .shloka { color: rgba(220, 180, 110, 0.4); }
        .lit .shloka { color: #ffd98a; text-shadow: 0 0 18px rgba(255, 170, 50, 0.7); }

        .foot { position: absolute; bottom: 22px; margin: 0; font-size: 13px; letter-spacing: 2px; }
        .ghost .foot { color: rgba(200, 170, 110, 0.35); }
        .lit .foot { color: #ffd98a; }

        .fx { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 3; pointer-events: none; }
        .vignette { position: absolute; inset: 0; z-index: 4; pointer-events: none; background: radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.8) 100%); }
        .grain {
          position: absolute; inset: -50%; z-index: 5; pointer-events: none; opacity: 0.08;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
          animation: grain 0.9s steps(6) infinite;
        }
        @keyframes grain {
          0% { transform: translate(0, 0); } 20% { transform: translate(-4%, 3%); } 40% { transform: translate(3%, -5%); }
          60% { transform: translate(-6%, -2%); } 80% { transform: translate(5%, 4%); } 100% { transform: translate(0, 0); }
        }

        .hint {
          position: absolute; z-index: 6; left: 50%; bottom: 60px; transform: translateX(-50%); margin: 0; width: max-content; max-width: 92vw;
          text-align: center; font-size: 13px; color: rgba(255, 220, 150, 0.75); pointer-events: none;
          opacity: 0; animation: hintIn 1.2s ease 3s forwards, hintOut 2s ease 14s forwards;
        }
        @keyframes hintIn { to { opacity: 1; } }
        @keyframes hintOut { from { opacity: 1; } to { opacity: 0; } }

        @media (max-width: 600px) {
          .wish { font-size: 15px; }
          .wish br { display: none; }
          .shloka { font-size: 22px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .m1, .m2, .grain, .lit .hi { animation: none !important; }
        }
      `}</style>
    </main>
  );
}
