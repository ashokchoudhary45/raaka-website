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
          live?: {
            visitors?: number;
          };
        };

        if (!stopped && result?.success) {
          setLive(Number(result.live?.visitors || 0));
        }
      } catch {
        // Keep the last live count if a request temporarily fails.
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

  const isFire = live >= 50;
  const isInferno = live >= 100;

  return (
    <>
      <style jsx>{`
        @keyframes raakaFirePulse {
          0%, 100% {
            transform: scale(1);
            filter: brightness(1);
          }
          50% {
            transform: scale(1.035);
            filter: brightness(1.22);
          }
        }

        @keyframes raakaEmber {
          0% {
            opacity: 0;
            transform: translateY(8px) scale(0.5) rotate(0deg);
          }
          20% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(-34px) scale(1) rotate(35deg);
          }
        }

        @keyframes raakaFlame {
          0%, 100% {
            transform: scaleY(0.85) rotate(-1deg);
            opacity: 0.75;
          }
          50% {
            transform: scaleY(1.18) rotate(2deg);
            opacity: 1;
          }
        }

        .raaka-live-fire {
          animation: raakaFirePulse 1.35s ease-in-out infinite;
        }

        .raaka-ember {
          position: absolute;
          bottom: 5px;
          width: 3px;
          height: 3px;
          border-radius: 999px;
          background: #ffb000;
          box-shadow: 0 0 8px #ff5a00;
          animation: raakaEmber 1.5s ease-out infinite;
          pointer-events: none;
        }

        .raaka-flame {
          position: absolute;
          left: 50%;
          bottom: -3px;
          width: 78%;
          height: 14px;
          transform: translateX(-50%);
          background: radial-gradient(
            ellipse at center bottom,
            rgba(255, 80, 0, 0.72),
            rgba(255, 140, 0, 0.35) 42%,
            transparent 72%
          );
          filter: blur(4px);
          animation: raakaFlame 0.9s ease-in-out infinite;
          pointer-events: none;
        }

        @media (prefers-reduced-motion: reduce) {
          .raaka-live-fire,
          .raaka-ember,
          .raaka-flame {
            animation: none;
          }
        }
      `}</style>

      <div className="fixed bottom-24 left-5 z-[9999] sm:bottom-5">
        <div
          className={`relative ${
            isFire ? "raaka-live-fire" : ""
          }`}
        >
          {isFire && (
            <>
              <span className="raaka-flame" />

              <span className="raaka-ember" style={{ left: "18%", animationDelay: "0s" }} />
              <span className="raaka-ember" style={{ left: "34%", animationDelay: "0.35s" }} />
              <span className="raaka-ember" style={{ left: "52%", animationDelay: "0.7s" }} />
              <span className="raaka-ember" style={{ left: "70%", animationDelay: "0.2s" }} />
              <span className="raaka-ember" style={{ left: "84%", animationDelay: "0.9s" }} />
            </>
          )}

          <div
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-2xl backdrop-blur-xl transition-all duration-500 ${
              isInferno
                ? "border-red-500/80 bg-red-950/70 shadow-[0_0_30px_rgba(255,60,0,0.55)]"
                : isFire
                  ? "border-orange-500/70 bg-orange-950/65 shadow-[0_0_24px_rgba(255,90,0,0.45)]"
                  : "border-red-500/20 bg-black/80"
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

            {isInferno && <span className="text-base leading-none">🔥</span>}
            {isFire && !isInferno && <span className="text-sm leading-none">🔥</span>}

            <span>{live} Live Now</span>

            {isInferno && <span className="text-base leading-none">🔥</span>}
          </div>
        </div>
      </div>
    </>
  );
}
