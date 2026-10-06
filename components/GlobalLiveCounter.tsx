"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

const FIRE_AT = 50;
const INFERNO_AT = 100;
const cv = (o: Record<string, string | number>) => o as unknown as CSSProperties;

function getVisitorId() {
  const key = "raaka-live-visitor-id";
  let id = localStorage.getItem(key);

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }

  return id;
}

/* real odometer: every digit is a 0-9 reel that rolls to its value */
function Odometer({ value }: { value: number }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const digits = String(value).split("");
  return (
    <span className="lv-od" aria-label={String(value)}>
      {digits.map((d, i) => (
        <span key={digits.length - i} className="lv-col" aria-hidden="true">
          <span className="lv-strip" style={{ transform: `translateY(-${(ready ? Number(d) : 0) * 10}%)` }}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (<i key={n}>{n}</i>))}
          </span>
        </span>
      ))}
    </span>
  );
}

export default function GlobalLiveCounter() {
  const [live, setLive] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [flare, setFlare] = useState<{ key: number; tier: number } | null>(null);
  const prevTier = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let stopped = false;

    const fetchLive = async () => {
      try {
        const visitorId = getVisitorId();

        const params = new URLSearchParams({
          visitorId,
          page: window.location.pathname || "/",
          mode: "count",
        });

        const response = await fetch(`/api/live?${params.toString()}`, {
          method: "GET",
          cache: "no-store",
        });

        const result = (await response.json()) as {
          success?: boolean;
          live?: {
            visitors?: number;
          };
        };

        if (!stopped && result?.success) {
          setLive(Number(result.live?.visitors || 0));
        }
      } catch {
        // Keep the last successful count.
      }
    };

    fetchLive();

    const interval = setInterval(fetchLive, 30_000);

    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, []);

  // Production: 50 Live = Fire, 100 Live = Inferno
  const tier = live === null ? 0 : live >= INFERNO_AT ? 2 : live >= FIRE_AT ? 1 : 0;

  // one-time shockwave + toast the moment the community crosses a tier
  useEffect(() => {
    if (live === null) return;
    if (prevTier.current !== null && tier > prevTier.current) setFlare({ key: Date.now(), tier });
    prevTier.current = tier;
  }, [tier, live]);
  useEffect(() => {
    if (!flare) return;
    const t = setTimeout(() => setFlare(null), 3400);
    return () => clearTimeout(t);
  }, [flare]);

  // tap outside / Esc closes the info card (hover opens it on desktop)
  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => { if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("pointerdown", down);
    window.addEventListener("keydown", key);
    return () => { window.removeEventListener("pointerdown", down); window.removeEventListener("keydown", key); };
  }, [open]);

  const embers = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        x: ((i * 37 + 13) % 88) + 6,
        s: 2 + (i % 3),
        d: 1.1 + ((i * 7) % 13) / 10,
        dl: ((i * 0.37) % 2.4).toFixed(2),
        dx: (i % 2 ? 1 : -1) * (6 + ((i * 11) % 20)),
        rise: 46 + ((i * 17) % 58),
      })),
    []
  );

  if (live === null) return null;

  const isFire = tier >= 1;
  const isInferno = tier === 2;
  // Fire/Inferno thresholds remain internal for the visual effects.
  // They are intentionally NOT shown in the click-open live card.
  const rates = [0.92, 1.08, 1, 0.96, 1.05];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* heat-haze filter used by the flames */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <filter id="lv-heat" x="-20%" y="-30%" width="140%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.015 0.07" numOctaves="2" seed="4" result="n">
              <animate attributeName="baseFrequency" dur="7s" values="0.015 0.07;0.02 0.09;0.015 0.07" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <div ref={rootRef} className="lv" data-tier={tier} data-open={open}>
        {isFire && <div className="lv-scorch" aria-hidden="true" />}

        {isFire && (
          <div className="lv-fire" aria-hidden="true">
            <div className="lv-flames">
              {["lv-f-left", "lv-f-center", "lv-f-right", ...(isInferno ? ["lv-f-l2", "lv-f-r2"] : [])].map((c, i) => (
                <video
                  key={c}
                  className={`lv-video ${c}`}
                  src="/animations/Fire-cropped.webm"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  ref={(el) => { if (el) el.playbackRate = rates[i]; }}
                />
              ))}
            </div>
            {embers.slice(0, isInferno ? 22 : 10).map((e, i) => (
              <span key={i} className="lv-em" style={cv({ "--x": `${e.x}%`, "--s": `${e.s}px`, "--d": `${e.d}s`, "--dl": `${e.dl}s`, "--dx": `${e.dx}px`, "--rise": `${e.rise + (isInferno ? 30 : 0)}px` })}>
                <i />
              </span>
            ))}
          </div>
        )}

        {flare && (
          <>
            <div key={flare.key} className="lv-flare" aria-hidden="true"><i /><i /><i /></div>
            <div key={`t${flare.key}`} className="lv-toast" role="status">
              <b>{flare.tier === 2 ? "🔥 INFERNO MODE" : "🔥 FIRE MODE"}</b>
              <small>{flare.tier === 2 ? "100 fans live. RAAKA is unstoppable." : "50 fans live. The community is heating up."}</small>
            </div>
          </>
        )}

        <button
          type="button"
          className="lv-pill"
          style={cv({ "--lvp": tier === 2 ? 1 : 0 })}
          aria-expanded={open}
          aria-label={`${live} fans live now. Show details`}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="lv-sheen" aria-hidden="true"><i /></span>
          <span className="lv-dot" aria-hidden="true"><i /><i /><b /></span>
          <span className="lv-num"><Odometer value={live} /></span>
          <span className="lv-txt">Live Now</span>
          {isFire && (
            <svg className="lv-flame" viewBox="0 0 24 24" aria-hidden="true">
              <defs>
                <linearGradient id="lv-fg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#ff3d00" /><stop offset=".6" stopColor="#ff9a2e" /><stop offset="1" stopColor="#fff1a8" /></linearGradient>
              </defs>
              <path d="M12 2c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4-1-6 1-9z" fill="url(#lv-fg)" />
            </svg>
          )}
        </button>

        <div className="lv-card" role="status" aria-live="polite">
          <p className="lv-k">LIVE ON RAAKA</p>
          <p className="lv-big"><b>{live}</b> fans exploring right now</p>
        </div>
      </div>
    </>
  );
}

const CSS = `
@property --lvp{syntax:"<number>";inherits:true;initial-value:0}
@keyframes lvIn{from{opacity:0;transform:translateY(24px) scale(.92)}}
@keyframes lvRipple{from{transform:scale(1);opacity:.9}to{transform:scale(3.2);opacity:0}}
@keyframes lvSheen{0%,60%{transform:translateX(-120%) skewX(-20deg)}100%{transform:translateX(320%) skewX(-20deg)}}
@keyframes lvFlick{0%,100%{box-shadow:0 0 8px rgba(255,70,0,.65),0 0 22px rgba(255,45,0,.3)}13%{box-shadow:0 0 12px rgba(255,90,0,.9),0 0 30px rgba(255,60,0,.45)}27%{box-shadow:0 0 6px rgba(255,60,0,.5),0 0 18px rgba(255,40,0,.25)}44%{box-shadow:0 0 14px rgba(255,100,10,.95),0 0 34px rgba(255,60,0,.5)}61%{box-shadow:0 0 9px rgba(255,70,0,.7),0 0 24px rgba(255,45,0,.32)}82%{box-shadow:0 0 13px rgba(255,95,5,.9),0 0 30px rgba(255,55,0,.44)}}
@keyframes lvLivePulse{0%,100%{transform:scale(1)}50%{transform:scale(1.012)}}
@keyframes lvB1{0%,100%{transform:translateY(2px) scaleX(.98) scaleY(.96);opacity:.88}35%{transform:translateY(-3px) scaleX(1.04) scaleY(1.04);opacity:1}68%{transform:translateY(1px) scaleX(.94) scaleY(1.02);opacity:.94}}
@keyframes lvB2{0%,100%{transform:translateY(1px) scaleX(1.03) rotate(-1deg);opacity:.9}45%{transform:translateY(-5px) scaleX(.94) rotate(2deg);opacity:1}75%{transform:translateY(0) scaleX(1.06) rotate(-2deg);opacity:.95}}
@keyframes lvScorch{from{opacity:.65;transform:scale(.96)}to{opacity:1;transform:scale(1.06)}}
@keyframes lvEm{0%{opacity:0;transform:translate(0,4px) scale(.5)}12%{opacity:1}100%{opacity:0;transform:translate(var(--dx),calc(var(--rise)*-1)) scale(.25)}}
@keyframes lvSway{from{transform:translateX(-4px)}to{transform:translateX(4px)}}
@keyframes lvShock{from{transform:scale(1);opacity:.9}to{transform:scale(1.9,2.8);opacity:0}}
@keyframes lvToast{0%{opacity:0;transform:translateX(-14px) scale(.9)}12%,82%{opacity:1;transform:none}100%{opacity:0;transform:translateX(8px)}}
@keyframes lvFlame{0%,100%{transform:scale(1,1) rotate(-3deg)}50%{transform:scale(.9,1.12) rotate(3deg)}}

.lv{position:fixed;left:1.25rem;bottom:1.25rem;z-index:9999;--dc:#ff3b30;--rc:#ff4a3a;font-family:ui-sans-serif,system-ui,sans-serif}
.lv[data-tier="1"]{--dc:#ff9a2e;--rc:#ffb347;animation:lvLivePulse 1.1s ease-in-out infinite}
.lv[data-tier="2"]{--dc:#ffd24a;--rc:#ff3a00;animation:lvLivePulse .9s ease-in-out infinite}

.lv-pill{position:relative;z-index:5;display:flex;align-items:center;gap:.6rem;padding:.6rem 1.05rem;border-radius:999px;border:1px solid rgba(255,70,50,.3);background:rgba(6,3,3,.9);backdrop-filter:blur(18px);color:#fff;font-size:10px;font-weight:700;line-height:1;letter-spacing:.18em;text-transform:uppercase;cursor:pointer;box-shadow:0 14px 40px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.07);transition:--lvp 1.4s cubic-bezier(.2,.8,.2,1),transform .35s cubic-bezier(.2,.8,.2,1),border-color .5s;animation:lvIn .9s cubic-bezier(.2,.8,.2,1) both}
.lv-pill:hover{transform:translateY(-2px) scale(1.03)}.lv-pill:active{transform:scale(.97)}
.lv-pill:focus-visible{outline:2px solid #ffb347;outline-offset:4px}
.lv-pill::before{content:"";position:absolute;inset:-4px;border-radius:inherit;padding:2px;pointer-events:none;background:conic-gradient(from -90deg,var(--rc) calc(var(--lvp)*360deg),rgba(255,255,255,.07) 0);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude}
.lv[data-tier="1"] .lv-pill,.lv[data-tier="2"] .lv-pill{border-color:rgba(255,100,20,.95);background:rgba(3,2,2,.96);animation:lvIn .9s cubic-bezier(.2,.8,.2,1) both,lvFlick 1.5s ease-in-out infinite}
.lv[data-tier="2"] .lv-pill{border-color:rgba(255,42,0,1)}
.lv-sheen{position:absolute;inset:0;overflow:hidden;border-radius:inherit;pointer-events:none}
.lv-sheen i{position:absolute;top:0;bottom:0;left:0;width:34%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.2),transparent);animation:lvSheen 4.5s ease-in-out infinite}
.lv-dot{position:relative;flex:none;width:10px;height:10px}
.lv-dot b{position:absolute;inset:0;border-radius:50%;background:var(--dc);box-shadow:0 0 10px var(--dc),0 0 20px var(--dc)}
.lv-dot i{position:absolute;inset:0;border-radius:50%;border:1px solid var(--dc);animation:lvRipple 2.2s ease-out infinite}.lv-dot i+i{animation-delay:1.1s}
.lv-num{font-size:13px;letter-spacing:.04em;font-variant-numeric:tabular-nums}
.lv-od{display:inline-flex}
.lv-col{display:inline-block;height:1.15em;overflow:hidden;line-height:1.15em}
.lv-strip{display:flex;flex-direction:column;transition:transform 1.1s cubic-bezier(.2,.8,.2,1)}
.lv-strip i{display:block;height:1.15em;font-style:normal;line-height:1.15em}
.lv-txt{opacity:.92}
.lv-flame{width:15px;height:15px;margin-left:-.1rem;filter:drop-shadow(0 0 6px rgba(255,100,0,.9));animation:lvFlame .5s ease-in-out infinite}

/* realistic fire */
.lv-scorch{position:absolute;left:-30px;right:-30px;bottom:-26px;height:92px;border-radius:50%;pointer-events:none;mix-blend-mode:screen;filter:blur(10px);background:radial-gradient(ellipse at 50% 70%,rgba(255,90,10,.55),rgba(255,40,0,.18) 45%,transparent 70%);animation:lvScorch 1.1s ease-in-out infinite alternate}
.lv[data-tier="2"] .lv-scorch{left:-46px;right:-46px;height:120px;background:radial-gradient(ellipse at 50% 70%,rgba(255,120,20,.75),rgba(255,30,0,.3) 45%,transparent 72%)}
.lv-fire{position:absolute;inset:0;z-index:0;pointer-events:none}
.lv-flames{position:absolute;left:-22px;bottom:-49px;width:calc(100% + 44px);height:88px;overflow:visible;filter:url(#lv-heat);-webkit-mask-image:radial-gradient(ellipse at 50% 85%,#000 45%,transparent 78%);mask-image:radial-gradient(ellipse at 50% 85%,#000 45%,transparent 78%)}
.lv-video{position:absolute;width:132px;height:120px;object-fit:fill;object-position:center;mix-blend-mode:screen;filter:saturate(1.2) contrast(1.08) brightness(1.03);pointer-events:none;user-select:none;will-change:transform}
.lv-f-left{left:-18px;bottom:-45px;animation:lvB1 .78s ease-in-out infinite}
.lv-f-center{left:50%;bottom:-46px;margin-left:-66px;animation:lvB2 .66s ease-in-out infinite .09s}
.lv-f-right{right:-18px;bottom:-44px;animation:lvB1 .84s ease-in-out infinite .17s}
.lv-f-l2{left:22%;bottom:-40px;width:104px;height:98px;margin-left:-52px;opacity:.85;animation:lvB2 .72s ease-in-out infinite .3s}
.lv-f-r2{right:22%;bottom:-40px;width:104px;height:98px;margin-right:-52px;opacity:.85;animation:lvB1 .7s ease-in-out infinite .22s}
.lv[data-tier="2"] .lv-video{filter:saturate(1.45) contrast(1.12) brightness(1.08)}
.lv[data-tier="2"] .lv-f-left,.lv[data-tier="2"] .lv-f-right{width:145px;height:132px;bottom:-51px}
.lv[data-tier="2"] .lv-f-center{width:154px;height:140px;margin-left:-77px;bottom:-54px}
.lv-em{position:absolute;bottom:8px;left:var(--x);width:var(--s);height:var(--s);opacity:0;z-index:4;animation:lvEm var(--d) ease-out var(--dl) infinite}
.lv-em i{display:block;width:100%;height:100%;border-radius:50%;background:radial-gradient(circle,#fff6c8,#ffb347 40%,#ff4d00);box-shadow:0 0 6px 1px #ff6a00,0 0 12px #ff2600;animation:lvSway calc(var(--d)*.45) ease-in-out infinite alternate}

/* tier-up flare */
.lv-flare{position:absolute;inset:0;z-index:4;pointer-events:none}
.lv-flare i{position:absolute;inset:-4px;border-radius:999px;border:2px solid #ffb347;box-shadow:0 0 22px rgba(255,120,20,.9);animation:lvShock 1.5s ease-out both}
.lv-flare i:nth-child(2){animation-delay:.25s;border-color:#ff5a14}.lv-flare i:nth-child(3){animation-delay:.5s;border-color:#ffd08a}
.lv-toast{position:absolute;left:calc(100% + .9rem);bottom:.15rem;z-index:6;display:grid;gap:.25rem;width:max-content;max-width:62vw;padding:.7rem 1rem;border-radius:1rem;border:1px solid rgba(255,140,40,.55);background:rgba(8,3,2,.92);backdrop-filter:blur(14px);box-shadow:0 0 30px rgba(255,90,10,.4);animation:lvToast 3.4s cubic-bezier(.2,.8,.2,1) both}
.lv-toast b{font-size:11px;letter-spacing:.16em;color:#ffb347}.lv-toast small{font-size:10px;line-height:1.4;color:rgba(255,241,220,.7)}

/* info card */
.lv-card{position:absolute;left:0;bottom:calc(100% + 14px);z-index:6;width:min(290px,86vw);padding:1rem 1.1rem;border-radius:1.2rem;border:1px solid rgba(255,255,255,.12);background:rgba(8,5,5,.92);backdrop-filter:blur(20px);color:#fff;box-shadow:0 24px 60px rgba(0,0,0,.6);opacity:0;transform:translateY(10px) scale(.96);transform-origin:bottom left;pointer-events:none;transition:opacity .3s,transform .4s cubic-bezier(.2,.8,.2,1)}
.lv[data-tier="1"] .lv-card,.lv[data-tier="2"] .lv-card{border-color:rgba(255,120,30,.4)}
.lv[data-open="true"] .lv-card,.lv:hover .lv-card{opacity:1;transform:none;pointer-events:auto}
.lv-k{margin:0;font-size:9px;font-weight:700;letter-spacing:.24em;color:var(--rc)}
.lv-big{margin:.55rem 0 .9rem;font-size:12px;color:rgba(255,255,255,.65)}.lv-big b{font-size:26px;color:#fff;margin-right:.3rem;font-variant-numeric:tabular-nums}







@media (max-width:640px){
.lv{left:1rem;bottom:1rem}
.lv-flames{left:-17px;width:calc(100% + 34px);bottom:-47px;height:82px}
.lv-video{width:112px;height:104px}
.lv-f-left{left:-15px;bottom:-40px}.lv-f-center{margin-left:-56px;bottom:-42px}.lv-f-right{right:-15px;bottom:-40px}
.lv-f-l2,.lv-f-r2{width:90px;height:84px}
.lv[data-tier="2"] .lv-f-left,.lv[data-tier="2"] .lv-f-right{width:124px;height:114px;bottom:-45px}
.lv[data-tier="2"] .lv-f-center{width:132px;height:122px;margin-left:-66px;bottom:-48px}
.lv-toast{left:0;bottom:calc(100% + 70px)}
}
@media (prefers-reduced-motion:reduce){
.lv,.lv-pill,.lv-sheen i,.lv-dot i,.lv-scorch,.lv-video,.lv-em,.lv-em i,.lv-flame,.lv-flare i,.lv-toast{animation:none!important}
.lv-flames{filter:none}.lv-em{display:none}.lv-strip{transition:none}
}
`;
