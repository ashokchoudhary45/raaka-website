"use client";

import { useEffect, useRef, useState } from "react";

const EN_LINE_1 = "Happy".split("");
const EN_LINE_2 = "Diwali".split("");

export default function DiwaliPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const phaseRef = useRef<"intro" | "show">("intro");
  const burstRef = useRef<(x: number, y: number) => void>(() => {});
  const [phase, setPhase] = useState<"intro" | "flash" | "show">("intro");

  const lightDiya = () => {
    if (phase !== "intro") return;
    setPhase("flash");
    setTimeout(() => {
      phaseRef.current = "show";
      setPhase("show");
    }, 900);
  };

  /* ---------- Fireworks + embers engine ---------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
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

    type P = { x: number; y: number; vx: number; vy: number; a: number; c: string; s: number; d: number; g: number };
    type R = { x: number; y: number; ty: number; v: number; c: string; wait: number; shape: Shape };
    type E = { x: number; y: number; vx: number; vy: number; s: number; ph: number };
    type Shape = "burst" | "ring" | "heart" | "double";

    const parts: P[] = [];
    const rockets: R[] = [];
    const embers: E[] = [];
    const palette = ["#FFD36B", "#FF8A3D", "#FF4D8D", "#5FE3FF", "#FFF4D6", "#C58BFF", "#FFB300"];
    const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

    const emberCount = Math.round(Math.min(70, W / 14));
    for (let i = 0; i < emberCount; i++) {
      embers.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -(0.15 + Math.random() * 0.5),
        s: 0.6 + Math.random() * 1.8,
        ph: Math.random() * 6.28,
      });
    }

    function spawn(x: number, y: number, c: string, shape: Shape) {
      const add = (vx: number, vy: number, col = c, g = 0.04) =>
        parts.push({
          x, y, vx, vy, a: 1, c: col,
          s: Math.random() * 1.8 + 0.8,
          d: Math.random() * 0.008 + 0.006,
          g,
        });
      if (shape === "burst") {
        const n = 90 + Math.random() * 60;
        for (let i = 0; i < n; i++) {
          const an = Math.random() * 6.283;
          const sp = Math.random() * 5 + 0.8;
          add(Math.cos(an) * sp, Math.sin(an) * sp, Math.random() > 0.25 ? c : "#fff");
        }
      } else if (shape === "ring") {
        for (let i = 0; i < 80; i++) {
          const an = (i / 80) * 6.283;
          add(Math.cos(an) * 4.2, Math.sin(an) * 4.2, c, 0.02);
        }
      } else if (shape === "double") {
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
    }

    function launch(x?: number, ty?: number, wait = 0, shape?: Shape) {
      const shapes: Shape[] = ["burst", "burst", "burst", "ring", "double", "heart"];
      rockets.push({
        x: x ?? W * (0.1 + Math.random() * 0.8),
        y: H + 10,
        ty: ty ?? H * (0.1 + Math.random() * 0.4),
        v: 6 + Math.random() * 3,
        c: pick(palette),
        wait,
        shape: shape ?? pick(shapes),
      });
    }

    burstRef.current = (x, y) => launch(x, y, 0, pick<Shape>(["burst", "ring", "double", "heart"]));

    let last = 0;
    let nextVolley = 6000;

    const frame = (t: number) => {
      // motion trails
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";

      const live = phaseRef.current === "show";

      if (live && t - last > 900 + Math.random() * 800) {
        launch();
        last = t;
      }
      if (live && t > nextVolley) {
        // grand finale volley
        for (let i = 0; i < 7; i++) launch(W * (0.1 + (i / 6) * 0.8), H * (0.12 + Math.random() * 0.25), i * 9);
        nextVolley = t + 14000;
      }

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        if (r.wait > 0) { r.wait--; continue; }
        r.y -= r.v;
        r.x += Math.sin(r.y * 0.05) * 0.4;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2.2, 0, 6.283);
        ctx.fillStyle = "#FFF3C4";
        ctx.shadowBlur = 14;
        ctx.shadowColor = r.c;
        ctx.fill();
        // spark tail
        if (Math.random() > 0.3)
          parts.push({ x: r.x, y: r.y, vx: (Math.random() - 0.5) * 0.6, vy: Math.random() * 0.8, a: 0.7, c: "#FFB86B", s: 0.9, d: 0.04, g: 0.02 });
        if (r.y <= r.ty) {
          spawn(r.x, r.y, r.c, r.shape);
          rockets.splice(i, 1);
        }
      }

      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx; p.y += p.vy;
        p.vy += p.g; p.vx *= 0.99; p.vy *= 0.995;
        p.a -= p.d;
        if (p.a <= 0) { parts.splice(i, 1); continue; }
        ctx.globalAlpha = p.a;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.s, 0, 6.283);
        ctx.fillStyle = p.c;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.c;
        ctx.fill();
      }

      // floating embers (always alive, soft)
      for (const e of embers) {
        e.x += e.vx + Math.sin(t / 1200 + e.ph) * 0.15;
        e.y += e.vy;
        if (e.y < -10) { e.y = H + 10; e.x = Math.random() * W; }
        ctx.globalAlpha = 0.25 + 0.35 * Math.abs(Math.sin(t / 900 + e.ph));
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.s, 0, 6.283);
        ctx.fillStyle = "#FFB347";
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#FF9A1F";
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onPointer = (e: PointerEvent) => {
      if (phaseRef.current === "show") burstRef.current(e.clientX, e.clientY);
    };
    canvas.addEventListener("pointerdown", onPointer);

    // parallax on the whole scene
    const main = mainRef.current;
    const onMove = (e: PointerEvent) => {
      if (!main) return;
      main.style.setProperty("--mx", String((e.clientX / W - 0.5) * 2));
      main.style.setProperty("--my", String((e.clientY / H - 0.5) * 2));
    };
    window.addEventListener("pointermove", onMove);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  const showing = phase === "show";

  return (
    <main ref={mainRef} className={`stage phase-${phase}`}>
      <canvas ref={canvasRef} className="fx" />
      <div className="vignette" />
      <div className="grain" />

      {/* Rangoli mandala behind the title */}
      <svg className="mandala" viewBox="-200 -200 400 400" aria-hidden="true">
        <g className="spin-a">
          {Array.from({ length: 24 }).map((_, i) => (
            <path key={i} d="M0 -190 Q 14 -160 0 -130 Q -14 -160 0 -190Z" transform={`rotate(${i * 15})`} />
          ))}
        </g>
        <g className="spin-b">
          {Array.from({ length: 12 }).map((_, i) => (
            <path key={i} d="M0 -118 Q 22 -92 0 -62 Q -22 -92 0 -118Z" transform={`rotate(${i * 30})`} />
          ))}
          <circle r="124" />
          <circle r="196" />
          <circle r="54" />
        </g>
      </svg>

      {/* Curtains */}
      <div className="curtain curtain-top" />
      <div className="curtain curtain-bottom" />

      {/* Light bloom when the diya is lit */}
      <div className="bloom" />

      {/* ACT 1 — the single diya */}
      <section className="intro" aria-hidden={phase === "show"}>
        <div className={`solo-diya ${phase !== "intro" ? "lit" : ""}`}>
          <div className="solo-glow" />
          <div className="solo-flame"><i /></div>
          <div className="solo-bowl" />
        </div>
        <button className="light-btn" onClick={lightDiya} disabled={phase !== "intro"}>
          <span>दीया जलाएँ</span>
          <small>Tap to light the diya</small>
        </button>
      </section>

      {/* ACT 2 — the celebration */}
      <section className={`hero ${showing ? "on" : ""}`}>
        <p className="brand">
          <b>✦</b> World of Raaka
        </p>

        <h1 className="hindi">
          <span className="line l1">शुभ</span>
          <span className="line l2">दीपावली</span>
        </h1>

        <h2 className="english" aria-label="Happy Diwali">
          <span className="row">
            {EN_LINE_1.map((c, i) => (
              <em key={i} style={{ ["--i" as string]: i } as React.CSSProperties}>{c}</em>
            ))}
          </span>
          <span className="row gold">
            {EN_LINE_2.map((c, i) => (
              <em key={i} style={{ ["--i" as string]: i + 5 } as React.CSSProperties}>{c}</em>
            ))}
          </span>
        </h2>

        <div className="rule"><span /><i>✦</i><span /></div>

        <p className="wish">
          Roshni ka yeh tyohaar aapke ghar mein khushiyan, samriddhi
          <br className="br" /> aur sukoon laaye. Aapko aur aapke parivaar ko
          <br className="br" /> World of Raaka ki taraf se dher saari shubhkaamnayein.
        </p>

        <p className="shloka">तमसो मा ज्योतिर्गमय ॥</p>
        <p className="meaning">Andhere se roshni ki ore.</p>

        <div className="diyas">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div className="d" key={i} style={{ ["--k" as string]: i } as React.CSSProperties}>
              <div className="f"><i /></div>
              <div className="b" />
            </div>
          ))}
        </div>

        <p className="year">2026</p>
      </section>

      <footer className={showing ? "on" : ""}>
        <p>Made with ❤️ by World of Raaka</p>
      </footer>

      <div className={`hint ${showing ? "on" : ""}`}>Kahin bhi tap karein, aatishbaazi dekhein</div>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,500;0,700;1,400&family=Tiro+Devanagari+Hindi&family=Mukta:wght@300;400&display=swap");

        :root {
          --gold-1: #fff3c9;
          --gold-2: #f2c76a;
          --gold-3: #b9782a;
          --ink: #070504;
        }
        * { box-sizing: border-box; }
        html, body { margin: 0; background: var(--ink); }
        body { overflow-x: hidden; }

        .stage {
          --mx: 0; --my: 0;
          position: relative;
          min-height: 100svh;
          overflow: hidden;
          isolation: isolate;
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #fff;
          font-family: "Mukta", "Segoe UI", sans-serif;
          background:
            radial-gradient(ellipse 60% 50% at 50% 46%, rgba(140, 70, 12, 0.28), transparent 70%),
            radial-gradient(ellipse 80% 40% at 50% 105%, rgba(160, 80, 10, 0.25), transparent 70%),
            var(--ink);
        }

        .fx { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 1; cursor: crosshair; }
        .vignette {
          position: absolute; inset: 0; z-index: 3; pointer-events: none;
          background: radial-gradient(ellipse at center, transparent 45%, rgba(0, 0, 0, 0.75) 100%);
        }
        .grain {
          position: absolute; inset: -50%; z-index: 4; pointer-events: none; opacity: 0.09;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
          animation: grain 0.9s steps(6) infinite;
        }
        @keyframes grain {
          0% { transform: translate(0, 0); } 20% { transform: translate(-4%, 3%); }
          40% { transform: translate(3%, -5%); } 60% { transform: translate(-6%, -2%); }
          80% { transform: translate(5%, 4%); } 100% { transform: translate(0, 0); }
        }

        /* Mandala */
        .mandala {
          position: absolute; z-index: 2; pointer-events: none;
          width: min(125vw, 900px); top: 50%; left: 50%;
          transform: translate(-50%, -50%) translate(calc(var(--mx) * -14px), calc(var(--my) * -10px));
          opacity: 0; transition: opacity 3s ease 0.6s;
        }
        .phase-show .mandala { opacity: 0.2; }
        .mandala path, .mandala circle {
          fill: none; stroke: #e0a850; stroke-width: 0.7;
        }
        .mandala circle { stroke-dasharray: 2 5; }
        .spin-a { animation: spin 140s linear infinite; }
        .spin-b { animation: spin 90s linear infinite reverse; }
        .mandala g { transform-origin: 0 0; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Curtains */
        .curtain {
          position: absolute; left: 0; right: 0; z-index: 8; pointer-events: none;
          height: 50vh; background: #000;
          transition: transform 2.4s cubic-bezier(0.77, 0, 0.18, 1);
        }
        .curtain-top { top: 0; transform: translateY(0); }
        .curtain-bottom { bottom: 0; transform: translateY(0); }
        .phase-show .curtain-top { transform: translateY(-88%); }
        .phase-show .curtain-bottom { transform: translateY(88%); }
        .phase-intro .curtain, .phase-flash .curtain { transform: translateY(0); height: 0; }

        /* Bloom */
        .bloom {
          position: absolute; z-index: 7; pointer-events: none; inset: 0;
          background: radial-gradient(circle at 50% 50%, #fff2c2 0%, #ffb23f 25%, transparent 60%);
          opacity: 0; transform: scale(0.2);
        }
        .phase-flash .bloom { animation: bloom 1.1s ease-out forwards; }
        @keyframes bloom {
          0% { opacity: 0; transform: scale(0.2); }
          35% { opacity: 0.95; }
          100% { opacity: 0; transform: scale(2.4); }
        }

        /* ACT 1 */
        .intro {
          position: absolute; inset: 0; z-index: 6;
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 56px;
          transition: opacity 1s ease;
        }
        .phase-show .intro { opacity: 0; pointer-events: none; }
        .solo-diya { position: relative; width: 120px; height: 90px; display: flex; justify-content: center; }
        .solo-bowl {
          position: absolute; bottom: 0; width: 120px; height: 48px;
          border-radius: 0 0 60px 60px;
          background: linear-gradient(180deg, #f0ad48, #7a3512 90%);
          border-bottom: 4px solid #ffd58a;
          box-shadow: 0 8px 30px rgba(255, 140, 30, 0.2);
        }
        .solo-glow {
          position: absolute; top: -60px; width: 340px; height: 340px; border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 170, 50, 0.5), transparent 65%);
          opacity: 0; transition: opacity 0.8s ease;
        }
        .solo-flame {
          position: absolute; top: -8px; width: 26px; height: 52px;
          background: linear-gradient(to top, #ff6a00, #ffcf46 60%, #fff7c8);
          border-radius: 50% 50% 50% 50% / 70% 70% 30% 30%;
          transform: scale(0); transform-origin: 50% 100%;
          box-shadow: 0 0 25px #ffad24, 0 0 70px #ff8c16;
        }
        .solo-flame i {
          position: absolute; left: 8px; top: 18px; width: 10px; height: 24px;
          background: #fff; border-radius: 50%; opacity: 0.9;
        }
        .solo-diya.lit .solo-flame { animation: ignite 0.7s ease-out forwards, flicker 0.18s ease-in-out 0.7s infinite alternate; }
        .solo-diya.lit .solo-glow { opacity: 1; }
        @keyframes ignite { 0% { transform: scale(0); } 60% { transform: scale(1.5, 1.8); } 100% { transform: scale(1); } }
        @keyframes flicker {
          from { transform: scale(1, 1) skewX(-2deg); } to { transform: scale(0.95, 1.08) skewX(3deg); }
        }
        .solo-diya:not(.lit)::before {
          content: ""; position: absolute; top: 4px; width: 4px; height: 14px; background: #6e4a2a; border-radius: 2px;
        }

        .light-btn {
          appearance: none; cursor: pointer; background: none; color: #ffe4a0;
          border: 1px solid rgba(240, 190, 100, 0.45); border-radius: 999px;
          padding: 16px 44px 14px; display: flex; flex-direction: column; align-items: center; gap: 4px;
          transition: transform 0.4s ease, box-shadow 0.4s ease, background 0.4s ease, opacity 0.5s ease;
          animation: pulse 2.6s ease-in-out infinite;
        }
        .light-btn span { font-family: "Tiro Devanagari Hindi", serif; font-size: 26px; }
        .light-btn small { font-size: 12px; letter-spacing: 1px; color: #b99a63; }
        .light-btn:hover { background: rgba(255, 190, 80, 0.1); box-shadow: 0 0 40px rgba(255, 160, 40, 0.35); transform: scale(1.04); }
        .light-btn:focus-visible { outline: 2px solid #ffd36b; outline-offset: 5px; }
        .light-btn:disabled { opacity: 0; animation: none; }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 rgba(255, 160, 40, 0); } 50% { box-shadow: 0 0 34px rgba(255, 160, 40, 0.3); }
        }

        /* ACT 2 */
        .hero {
          position: relative; z-index: 5; pointer-events: none;
          display: flex; flex-direction: column; align-items: center; text-align: center;
          padding: 9vh 20px 20px; margin-top: 2vh;
          transform: translate(calc(var(--mx) * 8px), calc(var(--my) * 6px));
        }
        .hero > * { opacity: 0; }

        .brand {
          font-family: "Cormorant Garamond", Georgia, serif; font-size: 20px; letter-spacing: 6px;
          color: #e6c27a; margin: 0 0 18px;
        }
        .brand b { color: #ffd36b; margin-right: 8px; text-shadow: 0 0 16px #ffb53f; }
        .hero.on .brand { animation: rise 1.4s ease 1.2s forwards; }

        .hindi { margin: 0; line-height: 1.02; font-weight: 400; font-family: "Tiro Devanagari Hindi", serif; }
        .hindi .line {
          display: block; opacity: 0;
          background: linear-gradient(100deg, #b9782a 0%, #fff3c9 28%, #f2c76a 45%, #fff 52%, #f2c76a 60%, #b9782a 100%);
          background-size: 250% 100%;
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 22px rgba(255, 160, 40, 0.35));
        }
        .hindi .l1 { font-size: clamp(64px, 13vw, 128px); }
        .hindi .l2 { font-size: clamp(72px, 16vw, 164px); }
        .hero.on .hindi .l1 { animation: titleIn 1.8s cubic-bezier(0.2, 0.8, 0.2, 1) 1.6s forwards, shine 5s ease-in-out 3.6s infinite; }
        .hero.on .hindi .l2 { animation: titleIn 2s cubic-bezier(0.2, 0.8, 0.2, 1) 2s forwards, shine 5s ease-in-out 4s infinite; }
        @keyframes titleIn {
          0% { opacity: 0; transform: scale(1.35) translateY(20px); filter: blur(24px) drop-shadow(0 0 60px #ff9a1f); letter-spacing: 0.25em; }
          100% { opacity: 1; transform: scale(1); filter: blur(0) drop-shadow(0 0 22px rgba(255, 160, 40, 0.35)); letter-spacing: 0; }
        }
        @keyframes shine { 0% { background-position: 120% 0; } 60%, 100% { background-position: -120% 0; } }

        .english {
          margin: 14px 0 0; font-family: "Cormorant Garamond", Georgia, serif; font-weight: 300;
          font-size: clamp(26px, 5.2vw, 48px); line-height: 1.2; color: #fff1d2;
        }
        .english .row { display: block; }
        .english .row.gold { color: #f2c76a; font-weight: 700; font-style: italic; }
        .english em {
          display: inline-block; font-style: inherit; opacity: 0;
          letter-spacing: 0.2em; padding-left: 0.2em; margin-right: -0.2em;
        }
        .hero.on .english { opacity: 1; }
        .hero.on .english em { animation: letter 1s ease forwards; animation-delay: calc(3s + var(--i) * 0.11s); }
        @keyframes letter {
          0% { opacity: 0; transform: translateY(30px) rotateX(70deg); filter: blur(8px); }
          100% { opacity: 1; transform: none; filter: blur(0); }
        }

        .rule { display: flex; align-items: center; gap: 14px; margin: 26px 0 22px; color: #e5b85c; }
        .rule span { width: 0; height: 1px; background: linear-gradient(90deg, transparent, #d1a257); transition: width 1.6s ease 4s; }
        .rule span:last-child { transform: scaleX(-1); }
        .rule i { font-style: normal; text-shadow: 0 0 14px #ffb53f; }
        .hero.on .rule { animation: rise 1s ease 3.8s forwards; }
        .hero.on .rule span { width: min(18vw, 90px); }

        .wish {
          margin: 0; max-width: 560px; font-size: 17px; line-height: 1.85; font-weight: 300; color: #d8ccb6;
        }
        .hero.on .wish { animation: rise 1.6s ease 4.4s forwards; }
        .shloka {
          margin: 26px 0 0; font-family: "Tiro Devanagari Hindi", serif; font-size: 26px; color: #f4d28b;
          text-shadow: 0 0 18px rgba(255, 170, 50, 0.4);
        }
        .hero.on .shloka { animation: rise 1.6s ease 5.2s forwards; }
        .meaning { margin: 6px 0 0; font-family: "Cormorant Garamond", serif; font-style: italic; font-size: 17px; color: #a08c6c; }
        .hero.on .meaning { animation: rise 1.6s ease 5.5s forwards; }

        .diyas { display: flex; gap: clamp(12px, 3.5vw, 40px); margin-top: 44px; align-items: flex-end; }
        .hero.on .diyas { opacity: 1; }
        .d { position: relative; width: 36px; height: 40px; display: flex; justify-content: center; }
        .d:nth-child(4) { transform: scale(1.3); margin: 0 6px; }
        .d .b {
          position: absolute; bottom: 0; width: 36px; height: 17px; border-radius: 0 0 18px 18px;
          background: linear-gradient(180deg, #eaa43c, #7d3a14); border-bottom: 2px solid #ffd58a;
          box-shadow: 0 6px 20px rgba(255, 140, 30, 0.35);
        }
        .d .f {
          position: absolute; top: 2px; width: 12px; height: 24px; opacity: 0; transform: scale(0);
          transform-origin: 50% 100%;
          background: linear-gradient(to top, #ff6a00, #ffcf46 60%, #fff7c8);
          border-radius: 50% 50% 50% 50% / 70% 70% 30% 30%;
          box-shadow: 0 0 14px #ffad24, 0 0 40px #ff8c16, 0 0 80px rgba(255, 140, 20, 0.5);
        }
        .d .f i { position: absolute; left: 4px; top: 8px; width: 4px; height: 10px; background: #fff; border-radius: 50%; }
        .hero.on .d .f {
          animation:
            ignite 0.7s ease-out forwards,
            flicker 0.2s ease-in-out infinite alternate;
          animation-delay: calc(6s + var(--k) * 0.28s), calc(6.7s + var(--k) * 0.28s);
        }

        .year { margin: 30px 0 0; font-family: "Cormorant Garamond", serif; font-size: 18px; letter-spacing: 14px; padding-left: 14px; color: #a98547; }
        .hero.on .year { animation: rise 1.6s ease 7s forwards; }

        @keyframes rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }

        footer {
          position: relative; z-index: 5; margin-top: auto; padding: 28px 16px 22px; text-align: center; opacity: 0;
          pointer-events: none;
        }
        footer.on { animation: rise 1.4s ease 7.4s forwards; }
        footer p { margin: 0; font-size: 13px; letter-spacing: 3px; color: #c9a766; }

        .hint {
          position: absolute; z-index: 5; bottom: 64px; left: 50%; transform: translateX(-50%);
          font-size: 12px; letter-spacing: 1.5px; color: rgba(255, 220, 150, 0.7); white-space: nowrap;
          opacity: 0; pointer-events: none;
        }
        .hint.on { animation: rise 1.2s ease 8s forwards, hintFade 2s ease 16s forwards; }
        @keyframes hintFade { to { opacity: 0.3; } }

        @media (max-width: 600px) {
          .wish { font-size: 15px; }
          .br { display: none; }
          .shloka { font-size: 22px; }
          .brand { font-size: 17px; letter-spacing: 4px; }
          .d { width: 28px; } .d .b { width: 28px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .grain, .spin-a, .spin-b, .light-btn { animation: none !important; }
          .hero.on > *, .hero.on .english em, .hero.on .hindi .line { animation-duration: 0.01s !important; animation-delay: 0s !important; }
        }
      `}</style>
    </main>
  );
}
