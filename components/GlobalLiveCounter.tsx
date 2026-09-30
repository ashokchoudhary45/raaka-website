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

  const isFire = live >= 1;
  const isInferno = live >= 2;

  return (
    <>
      <style jsx>{`
        @keyframes livePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.035); }
        }

        @keyframes fireWave {
          0%, 100% {
            transform: translateX(-50%) scaleY(.75);
            opacity: .55;
          }
          50% {
            transform: translateX(-50%) scaleY(1.15);
            opacity: 1;
          }
        }

        @keyframes flameLeft {
          0%, 100% { transform: rotate(-18deg) scaleY(.75); }
          50% { transform: rotate(-7deg) scaleY(1.2); }
        }

        @keyframes flameRight {
          0%, 100% { transform: rotate(18deg) scaleY(.75); }
          50% { transform: rotate(7deg) scaleY(1.2); }
        }

        @keyframes sparkUp {
          0% {
            opacity: 0;
            transform: translate(0, 8px) scale(.45) rotate(0deg);
          }
          20% { opacity: 1; }
          100% {
            opacity: 0;
            transform: translate(var(--sx), -30px) scale(.85) rotate(40deg);
          }
        }

        @keyframes infernoGlow {
          0%, 100% {
            box-shadow:
              0 0 12px rgba(255, 65, 0, .35),
              0 0 30px rgba(255, 80, 0, .18);
          }
          50% {
            box-shadow:
              0 0 22px rgba(255, 65, 0, .65),
              0 0 55px rgba(255, 80, 0, .35);
          }
        }

        .live-fire-pulse {
          animation: livePulse 1.25s ease-in-out infinite;
        }

        .live-inferno {
          animation:
            livePulse 1.05s ease-in-out infinite,
            infernoGlow 1.05s ease-in-out infinite;
        }

        .live-flame {
          position: absolute;
          bottom: -7px;
          left: 50%;
          width: 88%;
          height: 17px;
          transform: translateX(-50%);
          border-radius: 50%;
          background: radial-gradient(
            ellipse at center bottom,
            rgba(255, 210, 60, .9) 0%,
            rgba(255, 85, 0, .75) 28%,
            rgba(255, 30, 0, .35) 55%,
            transparent 75%
          );
          filter: blur(4px);
          animation: fireWave .72s ease-in-out infinite;
          pointer-events: none;
        }

        .live-flame-top {
          position: absolute;
          bottom: 5px;
          width: 10px;
          height: 19px;
          border-radius: 70% 30% 65% 35%;
          background: linear-gradient(to top, #ff3b00, #ffbd32, #fff1a0);
          filter: blur(.4px);
          box-shadow: 0 0 10px rgba(255, 75, 0, .8);
          transform-origin: bottom center;
          pointer-events: none;
        }

        .live-flame-left {
          left: 16%;
          animation: flameLeft .7s ease-in-out infinite;
        }

        .live-flame-center {
          left: 46%;
          height: 23px;
          animation: fireWave .62s ease-in-out infinite;
        }

        .live-flame-right {
          right: 16%;
          animation: flameRight .8s ease-in-out infinite;
        }

        .live-spark {
          position: absolute;
          bottom: 9px;
          width: 3px;
          height: 3px;
          border-radius: 999px;
          background: #ffc04a;
          box-shadow: 0 0 7px #ff4d00;
          animation: sparkUp 1.35s ease-out infinite;
          pointer-events: none;
        }

        @media (prefers-reduced-motion: reduce) {
          .live-fire-pulse,
          .live-inferno,
          .live-flame,
          .live-flame-top,
          .live-spark {
            animation: none;
          }
        }
      `}</style>

      <div className="fixed bottom-5 left-5 z-[9999]">
        <div className={isInferno ? "live-inferno" : isFire ? "live-fire-pulse" : ""}>
          {isFire && (
            <>
              <span className="live-flame" />
              <span className="live-flame-top live-flame-left" />
              <span className="live-flame-top live-flame-center" />
              <span className="live-flame-top live-flame-right" />

              <span className="live-spark" style={{ left: "22%", ["--sx" as string]: "-7px" }} />
              <span className="live-spark" style={{ left: "37%", animationDelay: ".25s", ["--sx" as string]: "5px" }} />
              <span className="live-spark" style={{ left: "58%", animationDelay: ".5s", ["--sx" as string]: "-4px" }} />
              <span className="live-spark" style={{ left: "76%", animationDelay: ".15s", ["--sx" as string]: "7px" }} />
            </>
          )}

          <div
            className={`relative flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-xl transition-all duration-500 ${
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
