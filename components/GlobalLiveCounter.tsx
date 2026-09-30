"use client";

import { useEffect, useState } from "react";

function getVisitorId() {
  const key = "raaka-live-visitor-id";
  let id = localStorage.getItem(key);

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }

  return id;
}

export default function GlobalLiveCounter() {
  const [live, setLive] = useState<number | null>(null);

  useEffect(() => {
    let stopped = false;

    const fetchLive = async () => {
      try {
        const visitorId = getVisitorId();

        const params = new URLSearchParams({
          visitorId,
          page: window.location.pathname || "/",
        });

        const response = await fetch(`/api/live?${params.toString()}`, {
          method: "GET",
          cache: "no-store",
        });

        const result = (await response.json()) as {
          success?: boolean;
          live?: { visitors?: number };
        };

        if (!stopped && result?.success) {
          setLive(Number(result.live?.visitors || 0));
        }
      } catch {
        // Keep the last successful count.
      }
    };

    fetchLive();
    const interval = setInterval(fetchLive, 20_000);

    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, []);

  if (live === null) return null;

  const isFire = live >= 2;
  const isInferno = live >= 3;

  return (
    <>
      <style jsx>{`
        @keyframes livePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.035); }
        }
        @keyframes fireGlow {
          0%, 100% { box-shadow: 0 0 10px rgba(255,55,0,.45), 0 0 28px rgba(255,55,0,.25); }
          50% { box-shadow: 0 0 20px rgba(255,80,0,.9), 0 0 55px rgba(255,45,0,.5); }
        }
        @keyframes flameA {
          0%,100% { transform: translateX(-50%) rotate(-10deg) scaleY(.7); }
          35% { transform: translateX(-50%) rotate(7deg) scaleY(1.2); }
          70% { transform: translateX(-50%) rotate(-4deg) scaleY(.9); }
        }
        @keyframes flameB {
          0%,100% { transform: translateX(-50%) rotate(8deg) scaleY(.75); }
          40% { transform: translateX(-50%) rotate(-7deg) scaleY(1.3); }
          75% { transform: translateX(-50%) rotate(5deg) scaleY(.9); }
        }
        @keyframes ember {
          0% { opacity:0; transform:translate(0,8px) scale(.3) rotate(0); }
          15% { opacity:1; }
          100% { opacity:0; transform:translate(var(--drift),-45px) scale(.9) rotate(70deg); }
        }
        .live-fire-wrap {
          position: relative;
          isolation: isolate;
          animation: livePulse 1.15s ease-in-out infinite, fireGlow 1.15s ease-in-out infinite;
        }
        .live-fire-wrap::before {
          content:"";
          position:absolute;
          left:3%; right:3%; bottom:-9px; height:28px;
          border-radius:50%;
          background:radial-gradient(ellipse,rgba(255,80,0,.75),rgba(255,40,0,.32) 45%,transparent 75%);
          filter:blur(7px);
          z-index:-1;
        }
        .live-flame {
          position:absolute;
          bottom:-6px;
          width:18px; height:31px;
          border-radius:65% 35% 58% 42%;
          background:linear-gradient(to top,#ff2400 0%,#ff5b00 38%,#ffb21c 72%,#fff1a0 100%);
          box-shadow:0 0 8px rgba(255,70,0,.95),0 0 18px rgba(255,70,0,.65);
          transform-origin:50% 100%;
          z-index:-1;
        }
        .live-flame.a { left:16%; animation:flameA .72s ease-in-out infinite; }
        .live-flame.b { left:38%; height:38px; width:21px; animation:flameB .58s ease-in-out infinite .08s; }
        .live-flame.c { left:60%; height:34px; width:20px; animation:flameA .65s ease-in-out infinite .16s; }
        .live-flame.d { left:80%; height:28px; width:17px; animation:flameB .78s ease-in-out infinite .22s; }
        .live-ember {
          position:absolute; bottom:8px; width:4px; height:4px; border-radius:999px;
          background:#ffc34d; box-shadow:0 0 9px #ff4a00;
          animation:ember 1.35s ease-out infinite;
          z-index:4; pointer-events:none;
        }
        .live-fire-pill {
          position:relative;
          overflow:visible !important;
          border-color:rgba(255,70,0,.9) !important;
          background:rgba(7,3,1,.96) !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .live-fire-wrap,.live-flame,.live-ember { animation:none; }
        }
      `}</style>

      <div className="fixed bottom-5 left-5 z-[9999]">
        <div className={isFire ? "live-fire-wrap" : ""}>
          {isFire && (
            <>
              <span className="live-flame a" />
              <span className="live-flame b" />
              <span className="live-flame c" />
              <span className="live-flame d" />
              <span className="live-ember" style={{ left: "13%", ["--drift" as string]: "-8px" }} />
              <span className="live-ember" style={{ left: "30%", animationDelay: ".2s", ["--drift" as string]: "6px" }} />
              <span className="live-ember" style={{ left: "49%", animationDelay: ".45s", ["--drift" as string]: "-5px" }} />
              <span className="live-ember" style={{ left: "68%", animationDelay: ".12s", ["--drift" as string]: "8px" }} />
              <span className="live-ember" style={{ left: "84%", animationDelay: ".6s", ["--drift" as string]: "-6px" }} />
            </>
          )}

          <div
            className={`relative flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-xl transition-all duration-500 ${isFire ? "live-fire-pill" : ""} ${
              isInferno
                ? "border-red-500/90 bg-black/90 shadow-[0_0_25px_rgba(255,55,0,.65)]"
                : isFire
                  ? "border-orange-500/90 bg-black/90 shadow-[0_0_22px_rgba(255,75,0,.5)]"
                  : "border-red-500/30 bg-black/85 shadow-2xl"
            }`}
          >
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full ${
                  isFire ? "bg-orange-400" : "bg-red-500"
                } opacity-60`}
              />
              <span
                className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                  isFire ? "bg-orange-400" : "bg-red-500"
                }`}
              />
            </span>

            <span>{live} Live Now</span>
          </div>
        </div>
      </div>
    </>
  );
}
