"use client";

import { useEffect, useMemo, useState } from "react";

/* =========================================================
   RAAKA GLIMPSE — ADD YOUR YOUTUBE LINK HERE
   Example:
   https://www.youtube.com/watch?v=XXXXXXXXXXX
   ========================================================= */

const YOUTUBE_URL = "https://youtu.be/SI_PhNII7Mc?si=EIHu4xCOKrSZCzWM";

function getYouTubeId(url: string) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "").split("?")[0];
    }

    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v");
    }

    return null;
  } catch {
    return null;
  }
}

const styles = `
  .raaka-page {
    position: relative;
    min-height: 100vh;
    width: 100%;
    overflow: hidden;
    background:
      radial-gradient(circle at 50% 45%, rgba(120, 10, 10, 0.09), transparent 35%),
      #020202;
    color: #f3f0e8;
    font-family: Arial, Helvetica, sans-serif;
  }

  .raaka-page *,
  .raaka-page *::before,
  .raaka-page *::after {
    box-sizing: border-box;
  }

  .raaka-page::before {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 20;
    opacity: 0.14;
    background:
      repeating-linear-gradient(
        to bottom,
        transparent 0px,
        transparent 3px,
        rgba(255,255,255,0.035) 4px
      );
    mix-blend-mode: screen;
  }

  .raaka-page::after {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 19;
    background:
      radial-gradient(
        ellipse at center,
        transparent 35%,
        rgba(0,0,0,0.58) 100%
      );
  }

  .raaka-stars {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.45;
    background-image:
      radial-gradient(circle, rgba(255,255,255,0.55) 1px, transparent 1px),
      radial-gradient(circle, rgba(255,255,255,0.25) 1px, transparent 1px);
    background-size: 97px 113px, 173px 151px;
    background-position: 12px 24px, 50px 70px;
    animation: starsDrift 20s linear infinite;
  }

  @keyframes starsDrift {
    from {
      transform: translate3d(0,0,0);
    }
    to {
      transform: translate3d(-40px,25px,0);
    }
  }

  .raaka-noise {
    position: absolute;
    inset: -50%;
    pointer-events: none;
    opacity: 0.025;
    background-image:
      repeating-radial-gradient(
        circle at 20% 30%,
        #fff 0,
        #fff 1px,
        transparent 1px,
        transparent 3px
      );
    background-size: 7px 7px;
    animation: noiseMove 0.18s steps(2) infinite;
  }

  @keyframes noiseMove {
    0% { transform: translate(0,0); }
    25% { transform: translate(4px,-3px); }
    50% { transform: translate(-3px,4px); }
    75% { transform: translate(2px,2px); }
    100% { transform: translate(-2px,-3px); }
  }

  .raaka-shell {
    position: relative;
    z-index: 5;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px;
  }

  .raaka-corner {
    position: fixed;
    z-index: 25;
    font-family: "Courier New", monospace;
    font-size: 9px;
    letter-spacing: 3px;
    color: rgba(255,255,255,0.35);
    text-transform: uppercase;
    pointer-events: none;
  }

  .raaka-corner.top-left {
    top: 25px;
    left: 28px;
  }

  .raaka-corner.top-right {
    top: 25px;
    right: 28px;
  }

  .raaka-corner.bottom-left {
    bottom: 24px;
    left: 28px;
  }

  .raaka-corner.bottom-right {
    bottom: 24px;
    right: 28px;
  }

  .raaka-stage {
    width: min(1050px, 100%);
    min-height: 560px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .raaka-stage-inner {
    width: 100%;
    animation: stageIn 1.1s ease both;
  }

  @keyframes stageIn {
    from {
      opacity: 0;
      transform: translateY(16px) scale(0.985);
      filter: blur(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
      filter: blur(0);
    }
  }

  .raaka-micro {
    margin-bottom: 25px;
    font-family: "Courier New", monospace;
    font-size: 10px;
    letter-spacing: 5px;
    color: rgba(255,255,255,0.38);
    text-transform: uppercase;
  }

  .raaka-line {
    width: min(420px, 70vw);
    height: 1px;
    margin: 24px auto;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255,255,255,0.5),
      transparent
    );
  }

  .raaka-terminal {
    font-family: "Courier New", monospace;
    font-size: clamp(11px, 1.2vw, 14px);
    line-height: 2.3;
    letter-spacing: 3px;
    color: rgba(255,255,255,0.62);
    text-transform: uppercase;
  }

  .raaka-terminal strong {
    color: rgba(255,255,255,0.94);
    font-weight: 400;
  }

  .raaka-warning {
    margin-top: 30px;
    font-family: "Courier New", monospace;
    font-size: 10px;
    letter-spacing: 5px;
    color: rgba(180, 20, 20, 0.9);
    text-transform: uppercase;
  }

  .raaka-coordinate {
    margin-top: 30px;
    font-family: "Courier New", monospace;
    font-size: 9px;
    letter-spacing: 4px;
    color: rgba(255,255,255,0.22);
  }

  .raaka-glitch {
    position: relative;
    display: inline-block;
  }

  .raaka-glitch::before,
  .raaka-glitch::after {
    content: attr(data-text);
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .raaka-glitch::before {
    color: rgba(255, 0, 0, 0.65);
    transform: translate(-2px, 0);
    clip-path: inset(15% 0 65% 0);
    animation: glitchOne 3.4s infinite;
  }

  .raaka-glitch::after {
    color: rgba(0, 190, 255, 0.65);
    transform: translate(2px, 0);
    clip-path: inset(65% 0 12% 0);
    animation: glitchTwo 2.7s infinite;
  }

  @keyframes glitchOne {
    0%, 88%, 100% {
      opacity: 0;
    }
    90% {
      opacity: 1;
      transform: translate(-7px, -1px);
    }
    92% {
      opacity: 1;
      transform: translate(4px, 1px);
    }
    94% {
      opacity: 0;
    }
  }

  @keyframes glitchTwo {
    0%, 82%, 100% {
      opacity: 0;
    }
    84% {
      opacity: 1;
      transform: translate(6px, 1px);
    }
    87% {
      opacity: 1;
      transform: translate(-3px, -1px);
    }
    89% {
      opacity: 0;
    }
  }

  .raaka-classified {
    display: inline-block;
    padding: 7px 14px;
    border: 1px solid rgba(255,255,255,0.16);
    font-family: "Courier New", monospace;
    font-size: 9px;
    letter-spacing: 4px;
    color: rgba(255,255,255,0.35);
    text-transform: uppercase;
  }

  .raaka-do-not {
    margin-top: 45px;
    font-size: clamp(20px, 4vw, 48px);
    font-weight: 300;
    letter-spacing: 7px;
    text-transform: uppercase;
    color: #eee;
  }

  .raaka-decrypted {
    margin-bottom: 15px;
    font-family: "Courier New", monospace;
    font-size: 10px;
    letter-spacing: 6px;
    color: rgba(255,255,255,0.45);
    text-transform: uppercase;
  }

  .raaka-title {
    position: relative;
    margin: 0;
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(85px, 19vw, 245px);
    line-height: 0.82;
    font-weight: 400;
    letter-spacing: -9px;
    color: #f4f0e8;
    text-shadow:
      0 0 25px rgba(255,255,255,0.08),
      0 0 90px rgba(120,0,0,0.18);
  }

  .raaka-title-sub {
    margin-top: 30px;
    font-family: "Courier New", monospace;
    font-size: 9px;
    letter-spacing: 7px;
    color: rgba(255,255,255,0.36);
    text-transform: uppercase;
  }

  .raaka-watch {
    margin-top: 52px;
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 16px;
    min-width: 210px;
    justify-content: center;
    padding: 17px 28px;
    border: 1px solid rgba(255,255,255,0.32);
    background: rgba(255,255,255,0.025);
    color: #f4f0e8;
    font-family: "Courier New", monospace;
    font-size: 10px;
    letter-spacing: 4px;
    cursor: pointer;
    text-transform: uppercase;
    transition:
      background 300ms ease,
      border-color 300ms ease,
      transform 300ms ease,
      box-shadow 300ms ease;
  }

  .raaka-watch::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 0;
    height: 1px;
    background: #fff;
    transition: width 400ms ease;
  }

  .raaka-watch:hover {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.75);
    transform: translateY(-3px);
    box-shadow: 0 0 40px rgba(255,255,255,0.08);
  }

  .raaka-watch:hover::before {
    width: 100%;
  }

  .raaka-watch-arrow {
    font-size: 14px;
    transition: transform 300ms ease;
  }

  .raaka-watch:hover .raaka-watch-arrow {
    transform: translateX(5px);
  }

  .raaka-footer-message {
    margin-top: 35px;
    font-family: "Courier New", monospace;
    font-size: 8px;
    letter-spacing: 3px;
    color: rgba(255,255,255,0.2);
    text-transform: uppercase;
  }

  .raaka-video-overlay {
    position: fixed;
    z-index: 100;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30px;
    background: rgba(0,0,0,0.96);
    animation: videoFade 700ms ease both;
  }

  @keyframes videoFade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .raaka-video-wrap {
    position: relative;
    width: min(1200px, 96vw);
  }

  .raaka-video-frame {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #000;
    border: 1px solid rgba(255,255,255,0.18);
    box-shadow:
      0 0 80px rgba(0,0,0,0.9),
      0 0 35px rgba(255,255,255,0.04);
    overflow: hidden;
  }

  .raaka-video-frame iframe {
    width: 100%;
    height: 100%;
    display: block;
    border: 0;
  }

  .raaka-video-top {
    position: absolute;
    left: 0;
    right: 0;
    top: -38px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: "Courier New", monospace;
    font-size: 9px;
    letter-spacing: 3px;
    color: rgba(255,255,255,0.42);
    text-transform: uppercase;
  }

  .raaka-close {
    border: 0;
    background: transparent;
    color: rgba(255,255,255,0.55);
    font-family: "Courier New", monospace;
    font-size: 9px;
    letter-spacing: 3px;
    cursor: pointer;
    text-transform: uppercase;
  }

  .raaka-close:hover {
    color: white;
  }

  .raaka-error {
    margin-top: 35px;
    font-family: "Courier New", monospace;
    font-size: 10px;
    letter-spacing: 3px;
    color: rgba(255,80,80,0.8);
  }

  .raaka-progress {
    position: fixed;
    z-index: 30;
    left: 0;
    bottom: 0;
    height: 1px;
    background: rgba(255,255,255,0.55);
    transition: width 700ms linear;
  }

  .raaka-flash {
    position: fixed;
    z-index: 40;
    inset: 0;
    pointer-events: none;
    background: rgba(255,255,255,0.045);
    animation: flash 160ms ease;
  }

  @keyframes flash {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @media (max-width: 700px) {
    .raaka-shell {
      padding: 22px;
    }

    .raaka-stage {
      min-height: 520px;
    }

    .raaka-corner {
      font-size: 7px;
      letter-spacing: 2px;
    }

    .raaka-corner.top-right,
    .raaka-corner.bottom-right {
      display: none;
    }

    .raaka-title {
      letter-spacing: -5px;
    }

    .raaka-do-not {
      letter-spacing: 4px;
    }

    .raaka-video-overlay {
      padding: 15px;
    }

    .raaka-video-top {
      top: -32px;
    }
  }
`;

export default function RaakaGlimpsePage() {
  const [stage, setStage] = useState(0);
  const [started, setStarted] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [flash, setFlash] = useState(false);

  const videoId = useMemo(
    () => getYouTubeId(YOUTUBE_URL),
    []
  );

  useEffect(() => {
    if (!started) return;

    const timers = [
      window.setTimeout(() => setStage(1), 4200),
      window.setTimeout(() => setStage(2), 8500),
      window.setTimeout(() => setStage(3), 13500),
      window.setTimeout(() => setStage(4), 19500),
      window.setTimeout(() => setStage(5), 27000),
      window.setTimeout(() => setStage(6), 34000),
      window.setTimeout(() => setStage(7), 40500),
    ];

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [started]);

  useEffect(() => {
    if (!started) return;

    const interval = window.setInterval(() => {
      setFlash(true);

      window.setTimeout(() => {
        setFlash(false);
      }, 160);
    }, 4200);

    return () => window.clearInterval(interval);
  }, [started]);

  const progress = Math.min(100, (stage / 7) * 100);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <main className="raaka-page">
        <div className="raaka-stars" />
        <div className="raaka-noise" />

        <div className="raaka-corner top-left">
          WORLD OF RAAKA
        </div>

        <div className="raaka-corner top-right">
          TRANSMISSION // 001
        </div>

        <div className="raaka-corner bottom-left">
          SIGNAL ACTIVE
        </div>

        <div className="raaka-corner bottom-right">
          CLASSIFIED
        </div>

        {flash && <div className="raaka-flash" />}

        {!started ? (
          <section className="raaka-shell">
            <div className="raaka-stage">
              <div className="raaka-stage-inner">
                <div className="raaka-classified">
                  CLASSIFIED TRANSMISSION
                </div>

                <div className="raaka-line" />

                <div className="raaka-micro">
                  WORLD OF RAAKA // ARCHIVE
                </div>

                <div className="raaka-terminal">
                  <div>AN UNKNOWN SIGNAL HAS BEEN DETECTED.</div>
                  <div>ORIGIN <strong>UNKNOWN</strong></div>
                  <div>SUBJECT <strong>REDACTED</strong></div>
                </div>

                <div className="raaka-warning">
                  DO NOT PROCEED
                </div>

                <button
                  className="raaka-watch"
                  onClick={() => {
                    setStarted(true);
                    setStage(0);
                  }}
                >
                  ENTER TRANSMISSION
                  <span className="raaka-watch-arrow">→</span>
                </button>

                <div className="raaka-footer-message">
                  Headphones recommended // Signal may contain unknown material
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="raaka-shell">
            <div className="raaka-stage" key={stage}>
              <div className="raaka-stage-inner">

                {stage === 0 && (
                  <>
                    <div className="raaka-micro">
                      INCOMING SIGNAL // UNKNOWN
                    </div>

                    <div className="raaka-terminal">
                      <div>SEARCHING FOR SOURCE...</div>
                      <div>..............</div>
                      <div>..............</div>
                    </div>

                    <div className="raaka-warning">
                      SIGNAL LOST
                    </div>

                    <div className="raaka-coordinate">
                      17°23'11"N // 78°29'32"E
                    </div>
                  </>
                )}

                {stage === 1 && (
                  <>
                    <div className="raaka-micro">
                      CONNECTION ESTABLISHED
                    </div>

                    <div className="raaka-terminal">
                      <div>FREQUENCY: <strong>37.000</strong></div>
                      <div>CHANNEL: <strong>BLACK</strong></div>
                      <div>STATUS: <strong>UNSTABLE</strong></div>
                    </div>

                    <div className="raaka-line" />

                    <div className="raaka-warning">
                      SOMETHING IS COMING
                    </div>
                  </>
                )}

                {stage === 2 && (
                  <>
                    <div className="raaka-micro">
                      SUBJECT IDENTIFICATION
                    </div>

                    <div className="raaka-terminal">
                      <div>SUBJECT: <strong>RAAKA</strong></div>
                      <div>ORIGIN: <strong>CLASSIFIED</strong></div>
                      <div>AGE: <strong>UNKNOWN</strong></div>
                      <div>THREAT LEVEL: <strong>████████</strong></div>
                    </div>

                    <div className="raaka-warning">
                      DATA CORRUPTED
                    </div>
                  </>
                )}

                {stage === 3 && (
                  <>
                    <div className="raaka-micro">
                      ENTITY DETECTED
                    </div>

                    <div
                      className="raaka-do-not raaka-glitch"
                      data-text="DO NOT OPEN"
                    >
                      DO NOT OPEN
                    </div>

                    <div className="raaka-line" />

                    <div className="raaka-terminal">
                      <div>ARCHIVE ACCESS: <strong>DENIED</strong></div>
                      <div>VISUAL FEED: <strong>LOCKED</strong></div>
                    </div>
                  </>
                )}

                {stage === 4 && (
                  <>
                    <div className="raaka-classified">
                      SECURITY OVERRIDE
                    </div>

                    <div className="raaka-line" />

                    <div className="raaka-terminal">
                      <div>WARNING</div>
                      <div>THIS TRANSMISSION WAS NEVER</div>
                      <div>SUPPOSED TO REACH YOU.</div>
                    </div>

                    <div className="raaka-warning">
                      LAST CHANCE
                    </div>
                  </>
                )}

                {stage === 5 && (
                  <>
                    <div className="raaka-micro">
                      FINAL DECRYPTION
                    </div>

                    <div className="raaka-terminal">
                      <div>REMOVING ENCRYPTION...</div>
                      <div>████████████████████</div>
                      <div>ACCESS GRANTED</div>
                    </div>

                    <div className="raaka-line" />

                    <div className="raaka-warning">
                      TRANSMISSION DECRYPTED
                    </div>
                  </>
                )}

                {stage === 6 && (
                  <>
                    <div className="raaka-decrypted">
                      TRANSMISSION DECRYPTED
                    </div>

                    <h1 className="raaka-title raaka-glitch" data-text="RAAKA">
                      RAAKA
                    </h1>

                    <div className="raaka-title-sub">
                      THE WORLD HAS ONLY JUST BEGUN
                    </div>

                    <button
                      className="raaka-watch"
                      onClick={() => setShowVideo(true)}
                    >
                      WATCH GLIMPSE
                      <span className="raaka-watch-arrow">→</span>
                    </button>
                  </>
                )}

                {stage === 7 && (
                  <>
                    <div className="raaka-decrypted">
                      TRANSMISSION READY
                    </div>

                    <h1 className="raaka-title raaka-glitch" data-text="RAAKA">
                      RAAKA
                    </h1>

                    <div className="raaka-title-sub">
                      ENTER THE UNKNOWN
                    </div>

                    <button
                      className="raaka-watch"
                      onClick={() => setShowVideo(true)}
                    >
                      WATCH GLIMPSE
                      <span className="raaka-watch-arrow">→</span>
                    </button>
                  </>
                )}

              </div>
            </div>
          </section>
        )}

        {started && (
          <div
            className="raaka-progress"
            style={{ width: `${progress}%` }}
          />
        )}

        {showVideo && (
          <div className="raaka-video-overlay">
            <div className="raaka-video-wrap">
              <div className="raaka-video-top">
                <span>RAAKA // GLIMPSE</span>

                <button
                  className="raaka-close"
                  onClick={() => setShowVideo(false)}
                >
                  CLOSE TRANSMISSION ×
                </button>
              </div>

              <div className="raaka-video-frame">
                {videoId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                    title="RAAKA Glimpse"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      gap: "15px",
                      fontFamily: '"Courier New", monospace',
                      letterSpacing: "3px",
                    }}
                  >
                    <div>VIDEO SOURCE NOT CONFIGURED</div>
                    <div className="raaka-error">
                      ADD YOUR YOUTUBE LINK IN YOUTUBE_URL
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}