"use client";

import { useEffect, useRef, useState } from "react";

export default function SpecialPage() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [started, setStarted] = useState(false);
  const [stage, setStage] = useState(0);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    if (!started) return;

    const timers = [
      setTimeout(() => setStage(1), 4500),
      setTimeout(() => setStage(2), 10500),
      setTimeout(() => setStage(3), 18000),
      setTimeout(() => setStage(4), 27000),
      setTimeout(() => setStage(5), 35000),
      setTimeout(() => setStage(6), 42500),
      setTimeout(() => setStage(7), 50000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [started]);

  useEffect(() => {
    if (!started) return;

    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 120);
    }, 2800);

    return () => clearInterval(interval);
  }, [started]);

  const startExperience = async () => {
    setStarted(true);

    if (audioRef.current) {
      audioRef.current.volume = 0.35;

      try {
        await audioRef.current.play();
      } catch {}
    }
  };

  return (
    <main className={`special-page ${glitch ? "glitch-active" : ""}`}>
      <audio
        ref={audioRef}
        src="/audio/special-baby-girl.mp3"
        loop
        preload="auto"
      />

      {!started ? (
        <section className="special-enter">
          <div className="special-orbit">
            <span />
            <span />
            <span />
          </div>

          <p className="special-label">
            RAAKA // SPECIAL TRANSMISSION
          </p>

          <h1>
            SOMETHING
            <br />
            BEAUTIFUL
            <br />
            IS COMING.
          </h1>

          <button onClick={startExperience}>
            <span>ENTER TRANSMISSION</span>
            <b>→</b>
          </button>

          <small>SOUND EXPERIENCE RECOMMENDED</small>
        </section>
      ) : (
        <section className="special-experience">
          <div className="special-stars" />
          <div className="special-noise" />
          <div className="special-scanlines" />

          <div className="special-glitch-block block-one" />
          <div className="special-glitch-block block-two" />
          <div className="special-glitch-block block-three" />

          <header className="special-topbar">
            <span>RAAKA // SYSTEM EVENT</span>
            <span>19.09.2026</span>
          </header>

          {stage === 0 && (
            <div className="special-scene">
              <div className="special-signal" />

              <p className="special-label">
                INCOMING TRANSMISSION
              </p>

              <h2>SIGNAL</h2>

              <div className="special-loading">
                <span />
              </div>

              <p className="special-sub">
                ESTABLISHING CONNECTION...
              </p>
            </div>
          )}

          {stage === 1 && (
            <div className="special-scene">
              <p className="special-label">
                CONNECTION ESTABLISHED
              </p>

              <h2 className="special-rgb">
                SOMETHING
                <br />
                HAS ARRIVED
              </h2>

              <div className="special-coordinates">
                <span>UNKNOWN</span>
                <span>UNKNOWN</span>
                <span>UNKNOWN</span>
              </div>
            </div>
          )}

          {stage === 2 && (
            <div className="special-scene">
              <p className="special-label">SYSTEM SCAN</p>

              <h2>
                IDENTITY
                <br />
                UNKNOWN
              </h2>

              <div className="special-data">
                <div>
                  <span>HEARTBEAT</span>
                  <strong>DETECTED</strong>
                </div>

                <div>
                  <span>SPECIES</span>
                  <strong>HUMAN</strong>
                </div>

                <div>
                  <span>THREAT LEVEL</span>
                  <strong>0%</strong>
                </div>

                <div>
                  <span>LOVE LEVEL</span>
                  <strong>∞</strong>
                </div>
              </div>

              <div className="special-scanner">
                <span />
              </div>
            </div>
          )}

          {stage === 3 && (
            <div className="special-scene">
              <p className="special-label">
                FAMILY CONNECTION FOUND
              </p>

              <div className="special-parents">
                <span>DEEPIKA</span>
                <b>×</b>
                <span>RANVEER</span>
              </div>

              <p className="special-decode">
                DECODING...
              </p>

              <div className="special-corrupted">
                B4BY_G1RL
              </div>
            </div>
          )}

          {stage === 4 && (
            <div className="special-scene">
              <p className="special-label">
                FINAL IDENTIFICATION
              </p>

              <h2>
                ONE LAST
                <br />
                SIGNAL...
              </h2>

              <div className="special-heartbeat">
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>

              <p className="special-wait">
                PLEASE WAIT
              </p>
            </div>
          )}

          {stage === 5 && (
            <div className="special-scene special-reveal">
              <div className="special-star">✦</div>

              <p className="special-label">
                IDENTITY CONFIRMED
              </p>

              <h2
                className="special-baby"
                data-text="BABY GIRL"
              >
                BABY GIRL
              </h2>

              <div className="special-line" />

              <p className="special-arrival">
                A LITTLE STAR HAS ARRIVED.
              </p>
            </div>
          )}

          {stage === 6 && (
            <div className="special-scene">
              <div className="special-star">✦</div>

              <p className="special-label">
                FAMILY STATUS UPDATED
              </p>

              <div className="special-family">
                <span>DEEPIKA</span>
                <i>×</i>
                <span>RANVEER</span>
                <i>→</i>
                <strong>DUA</strong>
              </div>

              <div className="special-sister">
                <small>NEW STATUS</small>
                <h3>BIG SISTER</h3>
                <span>✦</span>
              </div>
            </div>
          )}

          {stage === 7 && (
            <div className="special-scene special-final">
              <div className="special-star">✦</div>

              <p className="special-label">
                SYSTEM MESSAGE
              </p>

              <h2>
                WELCOME,
                <br />
                LITTLE ONE.
              </h2>

              <p className="special-description">
                The smallest addition to the family.
                <br />
                The biggest addition to their universe.
              </p>

              <div className="special-heart">♥</div>

              <h3>CONGRATULATIONS</h3>

              <p className="special-names">
                DEEPIKA PADUKONE
                <span> & </span>
                RANVEER SINGH
              </p>

              <div className="special-date">
                19 • 09 • 2026
              </div>
            </div>
          )}

          <footer className="special-footer">
            <span>SPECIAL TRANSMISSION</span>
            <span>
              {stage < 7
                ? "PROCESSING..."
                : "TRANSMISSION COMPLETE ✓"}
            </span>
          </footer>
        </section>
      )}

      <style jsx>{`
        .special-page {
          all: initial;
          position: relative;
          display: block;
          width: 100%;
          min-height: 100vh;
          overflow: hidden;
          background: #020203;
          color: #fff;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco,
            Consolas, monospace;
        }

        .special-page *,
        .special-page *::before,
        .special-page *::after {
          box-sizing: border-box;
        }

        .special-page button,
        .special-page h1,
        .special-page h2,
        .special-page h3,
        .special-page p,
        .special-page small {
          margin: 0;
        }

        .special-enter,
        .special-experience {
          position: relative;
          width: 100%;
          min-height: 100vh;
          overflow: hidden;
        }

        .special-enter {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          background:
            radial-gradient(
              circle at center,
              rgba(255,255,255,.07),
              transparent 30%
            ),
            #020203;
        }

        .special-enter h1 {
          font-family: Georgia, serif;
          font-size: clamp(44px, 8vw, 100px);
          font-weight: 400;
          line-height: .9;
          letter-spacing: -4px;
          color: #fff;
          margin: 35px 0;
        }

        .special-label {
          font-size: 8px;
          letter-spacing: 6px;
          color: rgba(255,255,255,.4);
        }

        .special-enter button {
          display: flex;
          align-items: center;
          gap: 25px;
          padding: 16px 25px;
          margin-top: 30px;
          border: 1px solid rgba(255,255,255,.2);
          background: rgba(255,255,255,.04);
          color: #fff;
          cursor: pointer;
          font-family: inherit;
          font-size: 8px;
          letter-spacing: 3px;
          transition: .4s;
        }

        .special-enter button:hover {
          background: #fff;
          color: #000;
          transform: scale(1.05);
        }

        .special-enter small {
          margin-top: 18px;
          font-size: 6px;
          letter-spacing: 3px;
          color: rgba(255,255,255,.2);
        }

        .special-orbit {
          position: absolute;
          width: 130px;
          height: 130px;
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 50%;
          animation: specialOrbit 15s linear infinite;
        }

        .special-orbit span {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 0 15px #fff;
        }

        .special-orbit span:nth-child(1) {
          top: -2px;
          left: 50%;
        }

        .special-orbit span:nth-child(2) {
          right: 5px;
          bottom: 15px;
        }

        .special-orbit span:nth-child(3) {
          left: 5px;
          bottom: 15px;
        }

        .special-experience {
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(
              circle at center,
              rgba(255,255,255,.055),
              transparent 27%
            ),
            #020203;
        }

        .special-stars {
          position: absolute;
          inset: 0;
          opacity: .3;
          background-image:
            radial-gradient(circle, #fff 1px, transparent 1px);
          background-size: 150px 150px;
          animation: specialStars 25s linear infinite;
        }

        .special-noise {
          position: absolute;
          inset: 0;
          opacity: .035;
          background-image:
            repeating-radial-gradient(
              circle,
              #fff 0,
              transparent 1px,
              transparent 3px
            );
        }

        .special-scanlines {
          position: absolute;
          inset: 0;
          z-index: 20;
          pointer-events: none;
          background:
            repeating-linear-gradient(
              to bottom,
              transparent 0,
              transparent 5px,
              rgba(255,255,255,.025) 6px
            );
        }

        .special-topbar {
          position: absolute;
          top: 22px;
          left: 25px;
          right: 25px;
          z-index: 30;
          display: flex;
          justify-content: space-between;
          font-size: 7px;
          letter-spacing: 3px;
          color: rgba(255,255,255,.3);
        }

        .special-scene {
          position: relative;
          z-index: 10;
          width: min(1000px, 90vw);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          animation: specialSceneIn 1.2s ease;
        }

        .special-scene h2 {
          font-family: Georgia, serif;
          font-size: clamp(55px, 10vw, 125px);
          font-weight: 400;
          line-height: .9;
          letter-spacing: -5px;
          color: #fff;
          margin: 30px 0;
        }

        .special-signal {
          width: 8px;
          height: 8px;
          margin-bottom: 25px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 0 15px #fff, 0 0 45px #fff;
          animation: specialPulse 1.5s infinite;
        }

        .special-loading {
          width: min(400px, 70vw);
          height: 1px;
          margin: 25px;
          overflow: hidden;
          background: rgba(255,255,255,.1);
        }

        .special-loading span {
          display: block;
          width: 30%;
          height: 100%;
          background: #fff;
          box-shadow: 0 0 20px #fff;
          animation: specialLoading 2.5s infinite;
        }

        .special-sub,
        .special-wait,
        .special-decode {
          font-size: 7px;
          letter-spacing: 4px;
          color: rgba(255,255,255,.25);
        }

        .special-rgb {
          text-shadow: -3px 0 #00eaff, 3px 0 #ff003c;
          animation: specialRgb 1.4s infinite;
        }

        .special-coordinates {
          display: flex;
          gap: 40px;
          font-size: 7px;
          letter-spacing: 4px;
          color: rgba(255,255,255,.25);
        }

        .special-data {
          width: min(450px, 90vw);
          margin-top: 30px;
        }

        .special-data div {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,.07);
          font-size: 8px;
          letter-spacing: 2px;
        }

        .special-data span {
          color: rgba(255,255,255,.3);
        }

        .special-data strong {
          font-weight: 400;
        }

        .special-scanner {
          width: min(450px, 90vw);
          height: 1px;
          margin-top: 30px;
          overflow: hidden;
          background: rgba(255,255,255,.1);
        }

        .special-scanner span {
          display: block;
          width: 35%;
          height: 100%;
          background: #fff;
          animation: specialScanner 2s infinite;
        }

        .special-parents {
          display: flex;
          align-items: center;
          gap: 25px;
          margin: 45px 0;
          font-family: Georgia, serif;
          font-size: clamp(30px, 5vw, 60px);
        }

        .special-parents b {
          font-weight: 400;
          opacity: .25;
        }

        .special-corrupted {
          margin-top: 25px;
          font-family: Georgia, serif;
          font-size: clamp(45px, 8vw, 90px);
          letter-spacing: 8px;
          color: #fff;
          text-shadow: -4px 0 #00eaff, 4px 0 #ff003c;
          animation: specialCorruption .25s infinite;
        }

        .special-heartbeat {
          display: flex;
          align-items: center;
          gap: 5px;
          height: 50px;
          margin: 30px;
        }

        .special-heartbeat i {
          display: block;
          width: 2px;
          background: #fff;
          animation: specialBeat 1.2s infinite;
        }

        .special-heartbeat i:nth-child(1) { height: 12px; }
        .special-heartbeat i:nth-child(2) { height: 25px; animation-delay: .1s; }
        .special-heartbeat i:nth-child(3) { height: 50px; animation-delay: .2s; }
        .special-heartbeat i:nth-child(4) { height: 20px; animation-delay: .3s; }
        .special-heartbeat i:nth-child(5) { height: 10px; animation-delay: .4s; }

        .special-star {
          font-family: Georgia, serif;
          font-size: 55px;
          animation: specialStar 2s infinite;
        }

        .special-baby {
          position: relative;
          font-family: Georgia, serif !important;
          font-size: clamp(65px, 13vw, 160px) !important;
          line-height: .8 !important;
          letter-spacing: -8px !important;
          font-weight: 400 !important;
          margin: 35px 0 !important;
          color: #fff !important;
          animation: specialReveal 1.4s;
        }

        .special-baby::before,
        .special-baby::after {
          content: attr(data-text);
          position: absolute;
          inset: 0;
        }

        .special-baby::before {
          color: #ff003c;
          transform: translateX(-4px);
          clip-path: inset(20% 0 55% 0);
        }

        .special-baby::after {
          color: #00eaff;
          transform: translateX(4px);
          clip-path: inset(60% 0 10% 0);
        }

        .special-line {
          width: 100px;
          height: 1px;
          margin: 35px auto;
          background: rgba(255,255,255,.4);
        }

        .special-arrival {
          font-family: Georgia, serif;
          font-size: 16px;
          letter-spacing: 2px;
          color: rgba(255,255,255,.6);
        }

        .special-family {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
          margin: 45px 0;
          font-size: 10px;
          letter-spacing: 4px;
          color: rgba(255,255,255,.55);
        }

        .special-family i {
          opacity: .2;
        }

        .special-family strong {
          color: #fff;
          font-weight: 400;
        }

        .special-sister {
          padding: 25px 40px;
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(255,255,255,.025);
        }

        .special-sister small {
          display: block;
          font-size: 6px;
          letter-spacing: 4px;
          color: rgba(255,255,255,.3);
        }

        .special-sister h3 {
          margin: 10px 0;
          font-family: Georgia, serif;
          font-size: 40px;
          font-weight: 400;
          color: #fff;
        }

        .special-final h2 {
          font-family: Georgia, serif;
          font-size: clamp(55px, 9vw, 100px);
          line-height: .9;
          font-weight: 400;
          color: #fff;
          margin: 25px 0;
        }

        .special-description {
          font-family: Georgia, serif;
          font-size: 15px;
          line-height: 1.8;
          color: rgba(255,255,255,.5);
        }

        .special-heart {
          margin: 25px;
          font-size: 22px;
          animation: specialHeart 1.5s infinite;
        }

        .special-final h3 {
          font-size: 9px;
          letter-spacing: 6px;
          font-weight: 400;
        }

        .special-names {
          margin-top: 18px;
          font-size: 7px;
          letter-spacing: 4px;
          color: rgba(255,255,255,.3);
        }

        .special-date {
          margin-top: 30px;
          font-size: 7px;
          letter-spacing: 5px;
          color: rgba(255,255,255,.2);
        }

        .special-footer {
          position: absolute;
          left: 25px;
          right: 25px;
          bottom: 20px;
          z-index: 30;
          display: flex;
          justify-content: space-between;
          font-size: 6px;
          letter-spacing: 3px;
          color: rgba(255,255,255,.2);
        }

        .special-glitch-block {
          position: absolute;
          height: 2px;
          z-index: 40;
          background: #fff;
          opacity: 0;
        }

        .glitch-active .special-glitch-block {
          opacity: .8;
          animation: specialBlocks .15s infinite;
        }

        .block-one {
          width: 18%;
          top: 35%;
          left: 10%;
        }

        .block-two {
          width: 25%;
          top: 60%;
          right: 10%;
        }

        .block-three {
          width: 12%;
          top: 72%;
          left: 45%;
        }

        .glitch-active .special-experience {
          animation: specialScreenGlitch .12s;
        }

        @keyframes specialSceneIn {
          from {
            opacity: 0;
            transform: scale(.96);
            filter: blur(8px);
          }
          to {
            opacity: 1;
            transform: scale(1);
            filter: blur(0);
          }
        }

        @keyframes specialPulse {
          50% {
            transform: scale(2);
            opacity: .3;
          }
        }

        @keyframes specialLoading {
          from { transform: translateX(-130%); }
          to { transform: translateX(350%); }
        }

        @keyframes specialScanner {
          from { transform: translateX(-150%); }
          to { transform: translateX(400%); }
        }

        @keyframes specialRgb {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-2px); }
          40% { transform: translateX(3px); }
          60% { transform: translateX(-1px); }
        }

        @keyframes specialCorruption {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-7px); }
          50% { transform: translateX(6px); }
          75% { transform: translateX(-3px); }
        }

        @keyframes specialBeat {
          50% { transform: scaleY(.3); }
        }

        @keyframes specialStar {
          50% {
            transform: scale(1.25);
            text-shadow: 0 0 20px #fff, 0 0 60px #fff;
          }
        }

        @keyframes specialReveal {
          0% {
            opacity: 0;
            transform: scale(1.3);
            filter: blur(12px);
          }
          40% {
            opacity: .7;
            transform: translateX(-5px);
          }
          60% {
            transform: translateX(5px);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0);
          }
        }

        @keyframes specialHeart {
          0%, 100% { transform: scale(1); }
          15% { transform: scale(1.3); }
          30% { transform: scale(1); }
          45% { transform: scale(1.2); }
        }

        @keyframes specialStars {
          from { transform: translateY(0); }
          to { transform: translateY(-150px); }
        }

        @keyframes specialOrbit {
          to { transform: rotate(360deg); }
        }

        @keyframes specialBlocks {
          0% { transform: translateX(0); }
          50% { transform: translateX(120px); }
          100% { transform: translateX(-100px); }
        }

        @keyframes specialScreenGlitch {
          0% { transform: translate(0); }
          30% { transform: translate(-3px, 1px); }
          60% { transform: translate(3px, -1px); }
          100% { transform: translate(0); }
        }

        @media (max-width: 600px) {
          .special-topbar {
            left: 18px;
            right: 18px;
            font-size: 6px;
          }

          .special-scene h2 {
            letter-spacing: -3px;
          }

          .special-parents {
            gap: 12px;
          }

          .special-family {
            gap: 10px;
            font-size: 7px;
          }

          .special-sister {
            padding: 20px;
          }

          .special-sister h3 {
            font-size: 30px;
          }

          .special-footer {
            left: 18px;
            right: 18px;
          }
        }
      `}</style>
    </main>
  );
}