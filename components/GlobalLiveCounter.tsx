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

  if (live === null) return null;

  // TEST MODE:
  // 2 Live = Fire
  // 3 Live = Inferno
  //
  // Production:
  // 50 Live = Fire
  // 100 Live = Inferno

  const isFire = live >= 50;
  const isInferno = live >= 100;

  return (
    <>
      <style jsx>{`
        @keyframes livePulse {
          0%,
          100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.012);
          }
        }

        @keyframes fireBreath {
          0%,
          100% {
            transform: translateY(2px) scaleX(0.98) scaleY(0.96);
            opacity: 0.88;
          }

          35% {
            transform: translateY(-3px) scaleX(1.04) scaleY(1.04);
            opacity: 1;
          }

          68% {
            transform: translateY(1px) scaleX(0.94) scaleY(1.02);
            opacity: 0.94;
          }
        }

        @keyframes fireBreath2 {
          0%,
          100% {
            transform: translateY(1px) scaleX(1.03) rotate(-1deg);
            opacity: 0.9;
          }

          45% {
            transform: translateY(-5px) scaleX(0.94) rotate(2deg);
            opacity: 1;
          }

          75% {
            transform: translateY(0) scaleX(1.06) rotate(-2deg);
            opacity: 0.95;
          }
        }

        @keyframes emberRise {
          0% {
            opacity: 0;
            transform: translate(0, 3px) scale(0.45);
          }

          15% {
            opacity: 1;
          }

          100% {
            opacity: 0;
            transform: translate(var(--drift), -48px) scale(0.7);
          }
        }

        .live-fire-wrap {
          position: relative;
          animation: livePulse 1.1s ease-in-out infinite;
        }

        .live-fire-art {
          position: absolute;
          left: -22px;
          bottom: -49px;
          width: calc(100% + 44px);
          height: 88px;
          overflow: visible;
          pointer-events: none;
          z-index: 0;
        }

        .live-fire-video {
          position: absolute;
          width: 132px;
          height: 120px;
          object-fit: fill;
          object-position: center;

          /*
           * IMPORTANT:
           * Original flame is preserved.
           * Screen blending hides the black background
           * without removing the flame.
           */
          mix-blend-mode: screen;

          filter:
            saturate(1.2)
            contrast(1.08)
            brightness(1.03);

          pointer-events: none;
          user-select: none;
          will-change: transform;
        }

        .fire-left {
          left: -18px;
          bottom: -45px;
          animation: fireBreath 0.78s ease-in-out infinite;
        }

        .fire-center {
          left: 50%;
          bottom: -46px;
          margin-left: -66px;
          animation: fireBreath2 0.66s ease-in-out infinite 0.09s;
        }

        .fire-right {
          right: -18px;
          bottom: -44px;
          animation: fireBreath 0.84s ease-in-out infinite 0.17s;
        }

        .live-fire-pill {
          position: relative;
          z-index: 5;

          border-color: rgba(255, 72, 0, 0.96) !important;

          background: rgba(3, 2, 2, 0.96) !important;

          box-shadow:
            0 0 8px rgba(255, 55, 0, 0.62),
            0 0 22px rgba(255, 45, 0, 0.3);
        }

        .live-ember {
          position: absolute;

          bottom: 8px;

          width: 2px;
          height: 2px;

          border-radius: 999px;

          background: #ffd26a;

          box-shadow:
            0 0 6px #ff6a00,
            0 0 11px #ff2600;

          animation: emberRise 1.05s ease-out infinite;

          z-index: 4;

          pointer-events: none;
        }

        .live-inferno .live-fire-video {
          filter:
            saturate(1.45)
            contrast(1.12)
            brightness(1.08);
        }

        .live-inferno .fire-left,
        .live-inferno .fire-right {
          width: 145px;
          height: 132px;
          bottom: -51px;
        }

        .live-inferno .fire-center {
          width: 154px;
          height: 140px;
          margin-left: -77px;
          bottom: -54px;
        }

        .live-inferno .live-fire-pill {
          border-color: rgba(255, 42, 0, 1) !important;

          box-shadow:
            0 0 11px rgba(255, 55, 0, 0.9),
            0 0 28px rgba(255, 40, 0, 0.52),
            0 0 48px rgba(255, 20, 0, 0.2);
        }

        @media (max-width: 640px) {
          .live-fire-art {
            left: -17px;
            bottom: -47px;
            width: calc(100% + 34px);
            height: 82px;
          }

          .live-fire-video {
            width: 112px;
            height: 104px;
          }

          .fire-left {
            left: -15px;
            bottom: -40px;
          }

          .fire-center {
            margin-left: -56px;
            bottom: -42px;
          }

          .fire-right {
            right: -15px;
            bottom: -40px;
          }

          .live-inferno .fire-left,
          .live-inferno .fire-right {
            width: 124px;
            height: 114px;
            bottom: -45px;
          }

          .live-inferno .fire-center {
            width: 132px;
            height: 122px;
            margin-left: -66px;
            bottom: -48px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .live-fire-wrap,
          .live-fire-video,
          .live-ember {
            animation: none;
          }
        }
      `}</style>

      <div className="fixed bottom-5 left-5 z-[9999]">
        <div
          className={
            isFire
              ? `live-fire-wrap ${
                  isInferno ? "live-inferno" : ""
                }`
              : ""
          }
        >
          {isFire && (
            <div
              className="live-fire-art"
              aria-hidden="true"
            >
              <video
                className="live-fire-video fire-left"
                src="/animations/Fire-cropped.webm"
                autoPlay
                muted
                loop
                playsInline
              />

              <video
                className="live-fire-video fire-center"
                src="/animations/Fire-cropped.webm"
                autoPlay
                muted
                loop
                playsInline
              />

              <video
                className="live-fire-video fire-right"
                src="/animations/Fire-cropped.webm"
                autoPlay
                muted
                loop
                playsInline
              />

              <span
                className="live-ember"
                style={{
                  left: "15%",
                  ["--drift" as string]: "-7px",
                }}
              />

              <span
                className="live-ember"
                style={{
                  left: "34%",
                  animationDelay: ".22s",
                  ["--drift" as string]: "6px",
                }}
              />

              <span
                className="live-ember"
                style={{
                  left: "52%",
                  animationDelay: ".4s",
                  ["--drift" as string]: "-5px",
                }}
              />

              <span
                className="live-ember"
                style={{
                  left: "71%",
                  animationDelay: ".12s",
                  ["--drift" as string]: "8px",
                }}
              />

              <span
                className="live-ember"
                style={{
                  left: "87%",
                  animationDelay: ".55s",
                  ["--drift" as string]: "-6px",
                }}
              />
            </div>
          )}

          <div
            className={`
              relative
              flex
              items-center
              gap-2
              rounded-full
              border
              px-4
              py-2
              text-[10px]
              font-bold
              uppercase
              tracking-[0.18em]
              text-white
              backdrop-blur-xl
              transition-all
              duration-500

              ${
                isFire
                  ? "live-fire-pill"
                  : ""
              }

              ${
                isInferno
                  ? "border-red-500/90 bg-black/90"
                  : isFire
                    ? "border-orange-500/90 bg-black/90"
                    : "border-red-500/30 bg-black/85 shadow-2xl"
              }
            `}
          >
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span
                className={`
                  absolute
                  inline-flex
                  h-full
                  w-full
                  animate-ping
                  rounded-full

                  ${
                    isFire
                      ? "bg-orange-400"
                      : "bg-red-500"
                  }

                  opacity-60
                `}
              />

              <span
                className={`
                  relative
                  inline-flex
                  h-2.5
                  w-2.5
                  rounded-full

                  ${
                    isFire
                      ? "bg-orange-400"
                      : "bg-red-500"
                  }
                `}
              />
            </span>

            <span>
              {live} Live Now
            </span>
          </div>
        </div>
      </div>
    </>
  );
}