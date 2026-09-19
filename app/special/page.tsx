"use client";

import { useEffect, useState } from "react";

const styles = `
.special-page {
  all: initial;
  position: relative;
  display: block;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: #020203;
  color: #fff;
  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    monospace;
}

.special-page *,
.special-page *::before,
.special-page *::after {
  box-sizing: border-box;
}

.special-page h1,
.special-page h2,
.special-page h3,
.special-page p {
  margin: 0;
}

.special-page button {
  font: inherit;
}

/* =========================================
   BACKGROUND
========================================= */

.special-stars {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.7;

  background-image:
    radial-gradient(circle at 12% 18%, #fff 0 1px, transparent 1.5px),
    radial-gradient(circle at 72% 12%, #fff 0 1px, transparent 1.5px),
    radial-gradient(circle at 44% 78%, #fff 0 1px, transparent 1.5px),
    radial-gradient(circle at 84% 70%, #fff 0 1px, transparent 1.5px),
    radial-gradient(circle at 24% 62%, #fff 0 1px, transparent 1.5px),
    radial-gradient(circle at 92% 34%, #fff 0 1px, transparent 1.5px),
    radial-gradient(circle at 52% 38%, #fff 0 1px, transparent 1.5px);

  background-size: 260px 260px;
  animation: specialStarsMove 25s linear infinite;
}

.special-stars-two {
  opacity: 0.22;
  background-size: 170px 170px;
  animation-duration: 40s;
}

@keyframes specialStarsMove {
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(-120px);
  }
}

/* =========================================
   SCANLINES
========================================= */

.special-scanlines {
  position: absolute;
  inset: 0;
  z-index: 15;
  pointer-events: none;
  opacity: 0.09;

  background: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent 3px,
    rgba(255,255,255,0.08) 4px
  );
}

/* =========================================
   GLITCH
========================================= */

.special-glitch-block {
  position: absolute;
  z-index: 30;
  pointer-events: none;
  opacity: 0;
  background: #fff;
  mix-blend-mode: difference;
}

.special-glitch-block-one {
  width: 19%;
  height: 3px;
  top: 31%;
  left: 4%;
}

.special-glitch-block-two {
  width: 13%;
  height: 6px;
  top: 67%;
  right: 3%;
}

.special-glitch-block-three {
  width: 23%;
  height: 2px;
  top: 49%;
  left: 44%;
}

.special-glitch-active .special-glitch-block-one {
  opacity: 0.8;
  animation: specialGlitchOne 130ms steps(2);
}

.special-glitch-active .special-glitch-block-two {
  opacity: 0.6;
  animation: specialGlitchTwo 130ms steps(2);
}

.special-glitch-active .special-glitch-block-three {
  opacity: 0.7;
  animation: specialGlitchThree 130ms steps(2);
}

.special-glitch-active .special-experience {
  animation: specialScreenGlitch 130ms steps(2);
}

@keyframes specialGlitchOne {
  0% { transform: translateX(0); }
  50% { transform: translateX(65px); }
  100% { transform: translateX(-30px); }
}

@keyframes specialGlitchTwo {
  0% { transform: translateX(0); }
  50% { transform: translateX(-75px); }
  100% { transform: translateX(35px); }
}

@keyframes specialGlitchThree {
  0% { transform: translateX(0); }
  50% { transform: translateX(110px); }
  100% { transform: translateX(-45px); }
}

@keyframes specialScreenGlitch {
  0% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  50% { transform: translateX(4px); }
  75% { transform: translateX(-2px); }
  100% { transform: translateX(0); }
}

/* =========================================
   ENTRY
========================================= */

.special-entry {
  position: relative;
  z-index: 20;

  min-height: 100vh;
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 30px;
}

.special-entry-content {
  position: relative;
  z-index: 5;

  width: 100%;
  max-width: 800px;

  text-align: center;
}

.special-system-label {
  margin-bottom: 28px;

  font-size: 10px;
  letter-spacing: 0.45em;
  opacity: 0.45;
}

.special-entry-line {
  width: 80px;
  height: 1px;

  margin: 0 auto 35px;

  background: rgba(255,255,255,0.4);
}

.special-entry h1 {
  font-family: Georgia, "Times New Roman", serif;

  font-size: clamp(48px, 8vw, 105px);

  line-height: 0.87;

  font-weight: 400;

  letter-spacing: -0.065em;
}

.special-entry p {
  margin-top: 38px;

  font-size: 11px;
  line-height: 2;

  letter-spacing: 0.15em;

  opacity: 0.45;
}

.special-enter-button {
  margin-top: 42px;

  min-width: 250px;

  padding: 15px 20px;

  display: inline-flex;
  align-items: center;
  justify-content: space-between;

  gap: 30px;

  border: 1px solid rgba(255,255,255,0.25);

  background: rgba(255,255,255,0.025);

  color: #fff;

  cursor: pointer;

  font-size: 10px;
  letter-spacing: 0.18em;

  transition:
    transform 0.3s ease,
    background 0.3s ease,
    border-color 0.3s ease;
}

.special-enter-button:hover {
  transform: translateY(-2px);

  background: rgba(255,255,255,0.08);

  border-color: rgba(255,255,255,0.55);
}

.special-enter-button b {
  font-size: 17px;
  font-weight: 400;
}

.special-entry-content small {
  display: block;

  margin-top: 18px;

  font-size: 7px;
  letter-spacing: 0.3em;

  opacity: 0.25;
}

.special-entry-orbit {
  position: absolute;

  width: 520px;
  height: 520px;

  border: 1px solid rgba(255,255,255,0.035);

  border-radius: 50%;

  animation: specialOrbit 20s linear infinite;
}

.special-entry-orbit::before {
  content: "";

  position: absolute;

  inset: 50px;

  border: 1px solid rgba(255,255,255,0.025);

  border-radius: 50%;
}

.special-entry-orbit::after {
  content: "";

  position: absolute;

  inset: 115px;

  border: 1px solid rgba(255,255,255,0.018);

  border-radius: 50%;
}

.special-entry-orbit span {
  position: absolute;

  width: 4px;
  height: 4px;

  border-radius: 50%;

  background: #fff;
}

.special-entry-orbit span:nth-child(1) {
  top: 15%;
  left: 18%;
}

.special-entry-orbit span:nth-child(2) {
  right: 12%;
  bottom: 20%;
}

.special-entry-orbit span:nth-child(3) {
  top: 40%;
  right: -2px;
}

@keyframes specialOrbit {
  to {
    transform: rotate(360deg);
  }
}

/* =========================================
   EXPERIENCE
========================================= */

.special-experience {
  position: relative;
  z-index: 5;

  width: 100%;
  min-height: 100vh;
}

.special-stage {
  width: 100%;
  min-height: 100vh;

  padding: 90px 30px;
}

.special-stage-center {
  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  text-align: center;
}

.special-fade {
  animation: specialFade 1.35s ease both;
}

@keyframes specialFade {
  from {
    opacity: 0;
    transform: translateY(18px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* =========================================
   STAGE 0
========================================= */

.special-signal-dot {
  width: 8px;
  height: 8px;

  border-radius: 50%;

  background: #fff;

  box-shadow:
    0 0 10px rgba(255,255,255,0.8),
    0 0 40px rgba(255,255,255,0.2);

  animation: specialPulse 1.5s infinite;
}

@keyframes specialPulse {
  50% {
    transform: scale(1.8);
    opacity: 0.35;
  }
}

.special-overline {
  margin-bottom: 26px;

  font-size: 9px;
  letter-spacing: 0.43em;

  opacity: 0.4;
}

.special-big-code {
  margin-top: 25px;

  font-family: Georgia, "Times New Roman", serif;

  font-size: clamp(58px, 12vw, 150px);

  font-weight: 400;

  line-height: 0.85;

  letter-spacing: -0.08em;
}

.special-big-code span {
  margin: 0 10px;
  opacity: 0.18;
}

.special-status {
  margin-top: 30px;

  font-size: 9px;
  letter-spacing: 0.3em;

  opacity: 0.35;
}

/* =========================================
   STAGE 1
========================================= */

.special-terminal {
  margin-bottom: 30px;

  font-size: 9px;
  letter-spacing: 0.35em;

  opacity: 0.4;
}

.special-huge-text {
  font-family: Georgia, "Times New Roman", serif;

  font-size: clamp(55px, 10vw, 140px);

  line-height: 0.86;

  letter-spacing: -0.07em;
}

.special-bottom-status {
  margin-top: 45px;

  font-size: 9px;
  letter-spacing: 0.25em;

  opacity: 0.3;
}

/* =========================================
   STAGE 2
========================================= */

.special-scan-box {
  width: min(600px, 90vw);

  border-top: 1px solid rgba(255,255,255,0.22);
  border-bottom: 1px solid rgba(255,255,255,0.22);
}

.special-scan-row {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 40px;

  padding: 15px 5px;

  border-bottom: 1px solid rgba(255,255,255,0.06);

  font-size: 9px;
  letter-spacing: 0.15em;
}

.special-scan-row:last-child {
  border-bottom: 0;
}

.special-scan-row span {
  opacity: 0.3;
}

.special-scan-row strong {
  font-weight: 400;
}

.special-warning {
  margin-top: 30px;

  font-size: 8px;
  letter-spacing: 0.3em;

  opacity: 0.3;
}

/* =========================================
   STAGE 3
========================================= */

.special-family {
  display: flex;
  align-items: center;

  gap: 24px;

  font-family: Georgia, "Times New Roman", serif;

  font-size: clamp(34px, 6vw, 75px);

  letter-spacing: -0.05em;
}

.special-family span {
  font-family: monospace;

  font-size: 20px;

  opacity: 0.3;
}

.special-arrow {
  margin: 35px 0;

  font-size: 27px;

  opacity: 0.3;
}

.special-code-name {
  font-size: clamp(28px, 6vw, 68px);

  letter-spacing: 0.08em;
}

.special-small-message {
  margin-top: 35px;

  font-size: 9px;

  line-height: 2;

  letter-spacing: 0.23em;

  opacity: 0.4;
}

/* =========================================
   STAGE 4
========================================= */

.special-orbit-star {
  margin-bottom: 25px;

  font-size: 65px;

  animation: specialStarFloat 2.8s ease-in-out infinite;
}

@keyframes specialStarFloat {
  50% {
    transform: translateY(-10px) scale(1.05);
  }
}

.special-final-line {
  font-size: 10px;

  letter-spacing: 0.4em;

  opacity: 0.4;
}

.special-final-message {
  display: flex;
  flex-direction: column;

  gap: 10px;

  margin-top: 40px;

  font-family: Georgia, "Times New Roman", serif;

  font-size: clamp(25px, 4vw, 45px);

  line-height: 1.15;
}

.special-final-message span {
  opacity: 0.25;
}

.special-final-message strong {
  font-size: 1.4em;

  font-weight: 400;
}

/* =========================================
   STAGE 5
========================================= */

.special-star-large {
  margin-bottom: 30px;

  font-size: 65px;

  animation: specialStarPulse 2.3s ease-in-out infinite;
}

@keyframes specialStarPulse {
  50% {
    transform: scale(1.14);

    text-shadow:
      0 0 50px rgba(255,255,255,0.4);
  }
}

.special-baby-title {
  font-family: Georgia, "Times New Roman", serif;

  font-size: clamp(62px, 13vw, 170px);

  line-height: 0.8;

  font-weight: 400;

  letter-spacing: -0.08em;
}

.special-baby-subtitle {
  margin-top: 35px;

  font-family: Georgia, "Times New Roman", serif;

  font-size: clamp(21px, 4vw, 42px);

  line-height: 1.1;

  opacity: 0.65;
}

.special-date {
  margin-top: 35px;

  font-size: 9px;

  letter-spacing: 0.38em;

  opacity: 0.3;
}

/* =====================================================
   STAGE 6
   THE ACTUAL EMOTIONAL REVEAL
===================================================== */

.special-sister-reveal {
  position: relative;

  min-height: 100vh;

  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  text-align: center;

  overflow: hidden;
}

/* large soft light */

.special-sister-reveal::before {
  content: "";

  position: absolute;

  width: 520px;
  height: 520px;

  left: 50%;
  top: 50%;

  transform: translate(-50%, -50%);

  border-radius: 50%;

  background: radial-gradient(
    circle,
    rgba(255,255,255,0.075) 0%,
    rgba(255,255,255,0.025) 32%,
    transparent 70%
  );

  filter: blur(8px);

  pointer-events: none;
}

/* tiny floating particles */

.special-sister-reveal::after {
  content: "✦     ·       ✧          ·       ✦";

  position: absolute;

  left: 50%;
  top: 19%;

  transform: translateX(-50%);

  width: 100%;

  font-size: 8px;

  letter-spacing: 1.2em;

  opacity: 0.16;

  white-space: nowrap;

  animation: specialParticleFloat 5s ease-in-out infinite;
}

@keyframes specialParticleFloat {
  50% {
    transform:
      translateX(-50%)
      translateY(-8px);
    opacity: 0.28;
  }
}

/* top text */

.special-sister-reveal .special-overline {
  position: relative;
  z-index: 2;

  margin-bottom: 22px;

  font-size: 8px;

  letter-spacing: 0.5em;

  opacity: 0.3;

  animation: specialSisterTop 1.2s ease both;
}

@keyframes specialSisterTop {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 0.3;
    transform: translateY(0);
  }
}

/* DUA */

.special-dua-name {
  position: relative;
  z-index: 2;

  font-family: Georgia, "Times New Roman", serif;

  font-size: clamp(75px, 14vw, 165px);

  line-height: 0.78;

  font-weight: 400;

  letter-spacing: -0.08em;

  text-shadow:
    0 0 45px rgba(255,255,255,0.07);

  animation: specialDuaReveal 1.4s ease both;
}

@keyframes specialDuaReveal {
  from {
    opacity: 0;
    transform: scale(0.92);
    filter: blur(5px);
  }

  to {
    opacity: 1;
    transform: scale(1);
    filter: blur(0);
  }
}

/* Daughter -> Big Sister */

.special-status-change {
  position: relative;
  z-index: 2;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 15px;

  margin-top: 27px;

  font-size: 8px;

  letter-spacing: 0.2em;
}

.special-status-change span {
  opacity: 0.2;
}

.special-status-change b {
  font-size: 15px;

  font-weight: 400;

  opacity: 0.25;
}

.special-status-change strong {
  font-weight: 400;

  letter-spacing: 0.23em;

  opacity: 0.8;
}

/* divider */

.special-sister-line {
  position: relative;
  z-index: 2;

  display: flex;
  align-items: center;

  width: min(300px, 70vw);

  gap: 14px;

  margin: 35px 0 30px;
}

.special-sister-line span {
  flex: 1;

  height: 1px;

  background:
    linear-gradient(
      to right,
      transparent,
      rgba(255,255,255,0.17)
    );
}

.special-sister-line span:last-child {
  background:
    linear-gradient(
      to left,
      transparent,
      rgba(255,255,255,0.17)
    );
}

.special-sister-line i {
  font-style: normal;

  font-size: 13px;

  opacity: 0.5;

  animation: specialLittleStar 2.2s ease-in-out infinite;
}

@keyframes specialLittleStar {
  50% {
    transform: scale(1.4);
    opacity: 0.9;
  }
}

/* AND THEN */

.special-little-sister {
  position: relative;
  z-index: 2;

  animation:
    specialLittleSisterReveal
    1.8s
    ease
    0.35s
    both;
}

@keyframes specialLittleSisterReveal {
  from {
    opacity: 0;
    transform: translateY(22px);
    filter: blur(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

.special-little-sister small {
  display: block;

  margin-bottom: 17px;

  font-size: 7px;

  letter-spacing: 0.4em;

  opacity: 0.25;
}

.special-little-sister h2 {
  font-family: Georgia, "Times New Roman", serif;

  font-size: clamp(40px, 7vw, 80px);

  line-height: 0.88;

  font-weight: 400;

  letter-spacing: -0.06em;
}

.special-arrived {
  margin-top: 19px;

  font-size: 8px;

  letter-spacing: 0.42em;

  opacity: 0.55;
}

.special-sister-date {
  position: relative;
  z-index: 2;

  margin-top: 32px;

  font-size: 7px;

  letter-spacing: 0.42em;

  opacity: 0.18;
}

/* =========================================
   FINAL STAGE
========================================= */

.special-final-stage {
  min-height: 100vh;

  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  padding: 70px 25px;

  text-align: center;

  animation: specialFade 2s ease both;
}

.special-final-stars {
  margin-bottom: 28px;

  font-size: 55px;

  animation: specialStarPulse 3s ease-in-out infinite;
}

.special-system-message {
  font-size: 8px;

  letter-spacing: 0.45em;

  opacity: 0.3;
}

.special-welcome {
  margin-top: 30px;

  font-family: Georgia, "Times New Roman", serif;

  font-size: clamp(58px, 11vw, 145px);

  line-height: 0.83;

  letter-spacing: -0.075em;
}

.special-final-divider {
  width: 100px;
  height: 1px;

  margin: 42px auto;

  background: rgba(255,255,255,0.25);
}

.special-congrats {
  font-family: Georgia, "Times New Roman", serif;

  font-size: clamp(21px, 4vw, 40px);

  line-height: 1.1;

  opacity: 0.6;
}

.special-family-final {
  display: flex;
  flex-wrap: wrap;

  align-items: center;
  justify-content: center;

  gap: 12px;

  margin-top: 45px;

  font-size: 8px;

  letter-spacing: 0.17em;

  opacity: 0.4;
}

.special-family-final b {
  font-weight: 400;
  opacity: 0.3;
}

.special-thin-message {
  margin-top: 35px;

  font-size: 7px;

  line-height: 2;

  letter-spacing: 0.3em;

  opacity: 0.25;
}

.special-raaka-signature {
  margin-top: 55px;

  font-size: 7px;

  letter-spacing: 0.48em;

  opacity: 0.18;
}

/* =========================================
   CORNER UI
========================================= */

.special-corner {
  position: fixed;

  z-index: 50;

  font-size: 6px;

  letter-spacing: 0.24em;

  opacity: 0.22;

  pointer-events: none;
}

.special-corner-top-left {
  top: 22px;
  left: 25px;
}

.special-corner-top-right {
  top: 22px;
  right: 25px;
}

.special-corner-bottom-left {
  bottom: 22px;
  left: 25px;
}

.special-corner-bottom-right {
  bottom: 22px;
  right: 25px;
}

/* =========================================
   MOBILE
========================================= */

@media (max-width: 600px) {

  .special-entry {
    padding: 25px;
  }

  .special-entry-orbit {
    width: 330px;
    height: 330px;
  }

  .special-entry h1 {
    font-size: 51px;
  }

  .special-big-code {
    font-size: 60px;
  }

  .special-family {
    flex-direction: column;
    gap: 9px;
  }

  .special-family span {
    font-size: 15px;
  }

  .special-sister-reveal {
    padding: 30px 20px;
  }

  .special-sister-reveal::after {
    font-size: 6px;
    letter-spacing: 0.7em;
  }

  .special-dua-name {
    font-size: 84px;
  }

  .special-status-change {
    gap: 9px;
    font-size: 7px;
  }

  .special-status-change b {
    font-size: 12px;
  }

  .special-little-sister h2 {
    font-size: 48px;
  }

  .special-sister-line {
    width: 74vw;
  }

  .special-welcome {
    font-size: 61px;
  }

  .special-corner {
    font-size: 5px;
  }
}
`;

export default function SpecialPage() {
  const [started, setStarted] = useState(false);
  const [stage, setStage] = useState(0);
  const [glitch, setGlitch] = useState(false);

  /* =========================================
     CINEMATIC TIMELINE
  ========================================= */

  useEffect(() => {
    if (!started) return;

    const timers = [
      window.setTimeout(() => setStage(1), 4500),
      window.setTimeout(() => setStage(2), 10500),
      window.setTimeout(() => setStage(3), 18000),
      window.setTimeout(() => setStage(4), 27000),
      window.setTimeout(() => setStage(5), 35000),
      window.setTimeout(() => setStage(6), 42500),
      window.setTimeout(() => setStage(7), 50000),
    ];

    return () => {
      timers.forEach((timer) => {
        window.clearTimeout(timer);
      });
    };
  }, [started]);

  /* =========================================
     GLITCH
  ========================================= */

  useEffect(() => {
    if (!started) return;

    const interval = window.setInterval(() => {
      setGlitch(true);

      window.setTimeout(() => {
        setGlitch(false);
      }, 130);
    }, 2800);

    return () => {
      window.clearInterval(interval);
    };
  }, [started]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <main
        className={`special-page ${
          glitch ? "special-glitch-active" : ""
        }`}
      >

        {/* BACKGROUND */}

        <div className="special-stars" />

        <div className="special-stars special-stars-two" />

        <div className="special-scanlines" />

        <div className="special-glitch-block special-glitch-block-one" />
        <div className="special-glitch-block special-glitch-block-two" />
        <div className="special-glitch-block special-glitch-block-three" />

        {/* =====================================
            ENTRY SCREEN
        ===================================== */}

        {!started && (
          <section className="special-entry">

            <div className="special-entry-orbit">
              <span />
              <span />
              <span />
            </div>

            <div className="special-entry-content">

              <div className="special-system-label">
                PRIVATE TRANSMISSION
              </div>

              <div className="special-entry-line" />

              <h1>
                SOMETHING
                <br />
                BEAUTIFUL
                <br />
                HAS ARRIVED.
              </h1>

              <p>
                A special transmission
                <br />
                from the world of RAAKA.
              </p>

              <button
                type="button"
                className="special-enter-button"
                onClick={() => setStarted(true)}
              >
                <span>
                  ENTER TRANSMISSION
                </span>

                <b>↗</b>
              </button>

              <small>
                HEADPHONES RECOMMENDED
              </small>

            </div>
          </section>
        )}

        {/* =====================================
            CINEMATIC EXPERIENCE
        ===================================== */}

        {started && (
          <section className="special-experience">

            {/* =================================
                STAGE 0
            ================================= */}

            {stage === 0 && (
              <div className="special-stage special-stage-center">

                <div className="special-signal-dot" />

                <div className="special-overline">
                  INCOMING TRANSMISSION
                </div>

                <div className="special-big-code">
                  19
                  <span>/</span>
                  09
                  <span>/</span>
                  2026
                </div>

                <div className="special-status">
                  SIGNAL DETECTED
                </div>

              </div>
            )}

            {/* =================================
                STAGE 1
            ================================= */}

            {stage === 1 && (
              <div className="special-stage special-stage-center special-fade">

                <div className="special-terminal">
                  CONNECTION ESTABLISHED
                </div>

                <div className="special-huge-text">
                  SOMETHING
                  <br />
                  HAS ARRIVED.
                </div>

                <div className="special-bottom-status">
                  STATUS // NEW LIFE DETECTED
                </div>

              </div>
            )}

            {/* =================================
                STAGE 2
            ================================= */}

            {stage === 2 && (
              <div className="special-stage special-stage-center special-fade">

                <div className="special-overline">
                  SYSTEM SCAN
                </div>

                <div className="special-scan-box">

                  <div className="special-scan-row">
                    <span>SUBJECT</span>
                    <strong>UNKNOWN</strong>
                  </div>

                  <div className="special-scan-row">
                    <span>ORIGIN</span>
                    <strong>LOVE</strong>
                  </div>

                  <div className="special-scan-row">
                    <span>STATUS</span>
                    <strong>POSITIVE</strong>
                  </div>

                  <div className="special-scan-row">
                    <span>SIZE</span>
                    <strong>VERY SMALL</strong>
                  </div>

                  <div className="special-scan-row">
                    <span>IMPACT</span>
                    <strong>INFINITE</strong>
                  </div>

                </div>

                <div className="special-warning">
                  IDENTITY UNKNOWN
                </div>

              </div>
            )}

            {/* =================================
                STAGE 3
            ================================= */}

            {stage === 3 && (
              <div className="special-stage special-stage-center special-fade">

                <div className="special-overline">
                  FAMILY CONNECTION FOUND
                </div>

                <div className="special-family">

                  <div>DEEPIKA</div>

                  <span>×</span>

                  <div>RANVEER</div>

                </div>

                <div className="special-arrow">
                  ↓
                </div>

                <div className="special-code-name">
                  B4BY_G1RL
                </div>

                <div className="special-small-message">
                  A NEW LITTLE SOUL
                  <br />
                  HAS ENTERED THE FAMILY.
                </div>

              </div>
            )}

            {/* =================================
                STAGE 4
            ================================= */}

            {stage === 4 && (
              <div className="special-stage special-stage-center special-fade">

                <div className="special-overline">
                  FINAL IDENTIFICATION
                </div>

                <div className="special-orbit-star">
                  ✦
                </div>

                <div className="special-final-line">
                  ONE LAST SIGNAL
                </div>

                <div className="special-final-message">
                  <span>NOT A GLITCH.</span>
                  <span>NOT A DREAM.</span>
                  <strong>REAL.</strong>
                </div>

              </div>
            )}

            {/* =================================
                STAGE 5
            ================================= */}

            {stage === 5 && (
              <div className="special-stage special-stage-center special-fade">

                <div className="special-overline">
                  TRANSMISSION CONFIRMED
                </div>

                <div className="special-star-large">
                  ✦
                </div>

                <h1 className="special-baby-title">
                  BABY GIRL
                </h1>

                <div className="special-baby-subtitle">
                  A LITTLE STAR
                  <br />
                  HAS ARRIVED.
                </div>

                <div className="special-date">
                  19 · 09 · 2026
                </div>

              </div>
            )}

            {/* =========================================
                STAGE 6 — FINAL SISTER REVEAL
            ========================================= */}

            {stage === 6 && (
              <div className="special-stage special-sister-reveal special-fade">

                <div className="special-overline">
                  ONE MORE LITTLE HEART
                </div>

                <div className="special-dua-name">
                  DUA
                </div>

                <div className="special-status-change">

                  <span>
                    DAUGHTER
                  </span>

                  <b>
                    →
                  </b>

                  <strong>
                    BIG SISTER
                  </strong>

                </div>

                <div className="special-sister-line">

                  <span />

                  <i>
                    ✦
                  </i>

                  <span />

                </div>

                <div className="special-little-sister">

                  <small>
                    AND THEN...
                  </small>

                  <h2>
                    A LITTLE
                    <br />
                    SISTER
                  </h2>

                  <div className="special-arrived">
                    HAS ARRIVED
                  </div>

                </div>

                <div className="special-sister-date">
                  19 · 09 · 2026
                </div>

              </div>
            )}

            {/* =================================
                STAGE 7
            ================================= */}

            {stage === 7 && (
              <div className="special-final-stage">

                <div className="special-final-stars">
                  ✦
                </div>

                <div className="special-system-message">
                  SYSTEM MESSAGE
                </div>

                <div className="special-welcome">
                  WELCOME,
                  <br />
                  LITTLE ONE.
                </div>

                <div className="special-final-divider" />

                <div className="special-congrats">
                  A NEW CHAPTER
                  <br />
                  HAS BEGUN.
                </div>

                <div className="special-family-final">

                  <span>DEEPIKA</span>

                  <b>×</b>

                  <span>RANVEER</span>

                  <b>×</b>

                  <span>DUA</span>

                  <b>×</b>

                  <span>✦</span>

                </div>

                <div className="special-thin-message">
                  FOUR HEARTS.
                  <br />
                  ONE BEAUTIFUL FAMILY.
                </div>

                <div className="special-raaka-signature">
                  WORLD OF RAAKA
                </div>

              </div>
            )}

          </section>
        )}

        {/* =====================================
            CORNER UI
        ===================================== */}

        {started && (
          <>
            <div className="special-corner special-corner-top-left">
              RAAKA // SPECIAL
            </div>

            <div className="special-corner special-corner-top-right">
              001
            </div>

            <div className="special-corner special-corner-bottom-left">
              TRANSMISSION ACTIVE
            </div>

            <div className="special-corner special-corner-bottom-right">
              19.09.26
            </div>
          </>
        )}

      </main>
    </>
  );
}