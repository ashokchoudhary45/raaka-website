"use client";

import { useEffect, useMemo, useState } from "react";

/* =========================================================
   RAAKA GLIMPSE
   Countdown: 21 September 2026 — 11:00 IST

   Later, replace ONLY this URL:
   ========================================================= */

const YOUTUBE_URL = "https://www.youtube.com/watch?v=YOUR_VIDEO_ID";


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
/* =========================================================
   RAAKA GLIMPSE — PAGE ONLY
   No globals.css required
   ========================================================= */

.raaka-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(
      circle at 50% 45%,
      rgba(110, 0, 0, 0.10),
      transparent 34%
    ),
    #010101;
  color: #f3f0e8;
  font-family: Arial, Helvetica, sans-serif;
}

.raaka-page *,
.raaka-page *::before,
.raaka-page *::after {
  box-sizing: border-box;
}


/* =========================================================
   GLOBAL ATMOSPHERE
   ========================================================= */

.raaka-page::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 20;
  pointer-events: none;

  background:
    repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 3px,
      rgba(255,255,255,0.025) 4px
    );

  opacity: 0.45;
  mix-blend-mode: screen;
}


.raaka-page::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 19;
  pointer-events: none;

  background:
    radial-gradient(
      ellipse at center,
      transparent 32%,
      rgba(0,0,0,0.72) 100%
    );
}


/* =========================================================
   STARS
   ========================================================= */

.raaka-stars {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.40;

  background-image:
    radial-gradient(
      circle,
      rgba(255,255,255,0.55) 1px,
      transparent 1px
    ),
    radial-gradient(
      circle,
      rgba(255,255,255,0.25) 1px,
      transparent 1px
    );

  background-size:
    97px 113px,
    173px 151px;

  background-position:
    12px 24px,
    50px 70px;

  animation: raakaStars 20s linear infinite;
}

@keyframes raakaStars {
  from {
    transform: translate3d(0,0,0);
  }

  to {
    transform: translate3d(-40px,25px,0);
  }
}


/* =========================================================
   NOISE
   ========================================================= */

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

  animation: raakaNoise 0.18s steps(2) infinite;
}

@keyframes raakaNoise {
  0% {
    transform: translate(0,0);
  }

  25% {
    transform: translate(4px,-3px);
  }

  50% {
    transform: translate(-3px,4px);
  }

  75% {
    transform: translate(2px,2px);
  }

  100% {
    transform: translate(-2px,-3px);
  }
}


/* =========================================================
   CORNER DATA
   ========================================================= */

.raaka-corner {
  position: fixed;
  z-index: 25;

  font-family: "Courier New", monospace;
  font-size: 9px;
  letter-spacing: 3px;

  color: rgba(255,255,255,0.30);

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


/* =========================================================
   COUNTDOWN SCREEN
   ========================================================= */

.raaka-countdown-screen {
  position: fixed;
  z-index: 200;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;

  background:
    radial-gradient(
      circle at 50% 48%,
      rgba(120,0,0,0.13),
      transparent 30%
    ),
    #010101;

  animation: countdownAppear 1.5s ease both;
}

@keyframes countdownAppear {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.raaka-countdown-screen::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;

  background:
    repeating-linear-gradient(
      0deg,
      transparent 0px,
      transparent 4px,
      rgba(255,255,255,0.025) 5px
    );
}

.raaka-countdown-screen::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;

  background:
    radial-gradient(
      ellipse at center,
      transparent 30%,
      rgba(0,0,0,0.82) 100%
    );
}


.raaka-countdown-noise {
  position: absolute;
  inset: -50%;

  opacity: 0.025;
  pointer-events: none;

  background-image:
    repeating-radial-gradient(
      circle at 20% 30%,
      #fff 0,
      #fff 1px,
      transparent 1px,
      transparent 3px
    );

  background-size: 8px 8px;

  animation: countdownNoise 0.16s steps(2) infinite;
}

@keyframes countdownNoise {
  0% {
    transform: translate(0,0);
  }

  50% {
    transform: translate(-4px,3px);
  }

  100% {
    transform: translate(3px,-3px);
  }
}


.raaka-countdown-content {
  position: relative;
  z-index: 5;

  width: min(900px, 90vw);

  text-align: center;
}


.raaka-countdown-top {
  margin-bottom: 35px;

  font-family: "Courier New", monospace;
  font-size: 9px;
  letter-spacing: 6px;

  color: rgba(255,255,255,0.35);
}


.raaka-countdown-line {
  width: min(460px,70vw);
  height: 1px;

  margin: 0 auto 38px;

  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(255,255,255,0.45),
      transparent
    );
}


.raaka-countdown-label {
  font-family: "Courier New", monospace;
  font-size: 10px;
  letter-spacing: 6px;

  color: rgba(255,255,255,0.40);
}


.raaka-countdown-title {
  margin: 18px 0 12px;

  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(80px,17vw,190px);
  line-height: 0.85;
  font-weight: 400;

  letter-spacing: -8px;

  color: #f1eee7;

  text-shadow:
    0 0 35px rgba(255,255,255,0.06),
    0 0 100px rgba(100,0,0,0.16);
}


.raaka-countdown-subtitle {
  font-family: "Courier New", monospace;
  font-size: 9px;
  letter-spacing: 5px;

  color: rgba(255,255,255,0.28);

  text-transform: uppercase;
}


.raaka-countdown {
  display: flex;
  align-items: center;
  justify-content: center;

  gap: clamp(10px,2vw,28px);

  margin-top: 58px;
}


.raaka-time-unit {
  min-width: 95px;

  display: flex;
  flex-direction: column;

  gap: 11px;
}


.raaka-time-unit span {
  font-family: "Courier New", monospace;

  font-size: clamp(34px,5vw,62px);
  line-height: 1;

  font-weight: 300;
  letter-spacing: 2px;

  color: #f4f1ea;
}


.raaka-time-unit small {
  font-family: "Courier New", monospace;

  font-size: 7px;
  letter-spacing: 3px;

  color: rgba(255,255,255,0.28);
}


.raaka-colon {
  margin-top: -20px;

  font-family: "Courier New", monospace;
  font-size: 30px;

  color: rgba(255,255,255,0.25);
}


.raaka-countdown-status {
  display: flex;
  align-items: center;
  justify-content: center;

  gap: 9px;

  margin-top: 55px;

  font-family: "Courier New", monospace;
  font-size: 8px;
  letter-spacing: 4px;

  color: rgba(255,255,255,0.28);
}


.raaka-status-dot {
  width: 5px;
  height: 5px;

  border-radius: 50%;

  background: rgba(170,20,20,0.9);

  box-shadow:
    0 0 12px rgba(170,20,20,0.8);

  animation: statusPulse 1.2s ease-in-out infinite;
}

@keyframes statusPulse {
  0%,100% {
    opacity: 0.35;
    transform: scale(0.8);
  }

  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}


.raaka-countdown-date {
  margin-top: 22px;

  font-family: "Courier New", monospace;
  font-size: 8px;
  letter-spacing: 3px;

  color: rgba(255,255,255,0.18);
}


/* =========================================================
   MAIN TRANSMISSION
   ========================================================= */

.raaka-shell {
  position: relative;
  z-index: 5;

  min-height: 100vh;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 32px;
}


.raaka-stage {
  width: min(1050px,100%);
  min-height: 560px;

  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  text-align: center;
}


.raaka-stage-inner {
  width: 100%;

  animation:
    stageIn 1.1s ease both;
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
  width: min(420px,70vw);
  height: 1px;

  margin: 24px auto;

  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(255,255,255,0.5),
      transparent
    );
}


.raaka-terminal {
  font-family: "Courier New", monospace;

  font-size: clamp(11px,1.2vw,14px);

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

  color: rgba(180,20,20,0.90);

  text-transform: uppercase;
}


.raaka-coordinate {
  margin-top: 30px;

  font-family: "Courier New", monospace;

  font-size: 9px;
  letter-spacing: 4px;

  color: rgba(255,255,255,0.22);
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


/* =========================================================
   GLITCH
   ========================================================= */

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
  color: rgba(255,0,0,0.65);

  transform: translate(-2px,0);

  clip-path: inset(15% 0 65% 0);

  animation: glitchOne 3.4s infinite;
}


.raaka-glitch::after {
  color: rgba(0,190,255,0.65);

  transform: translate(2px,0);

  clip-path: inset(65% 0 12% 0);

  animation: glitchTwo 2.7s infinite;
}


@keyframes glitchOne {
  0%,88%,100% {
    opacity: 0;
  }

  90% {
    opacity: 1;
    transform: translate(-7px,-1px);
  }

  92% {
    opacity: 1;
    transform: translate(4px,1px);
  }

  94% {
    opacity: 0;
  }
}


@keyframes glitchTwo {
  0%,82%,100% {
    opacity: 0;
  }

  84% {
    opacity: 1;
    transform: translate(6px,1px);
  }

  87% {
    opacity: 1;
    transform: translate(-3px,-1px);
  }

  89% {
    opacity: 0;
  }
}


/* =========================================================
   WARNING TEXT
   ========================================================= */

.raaka-do-not {
  margin-top: 45px;

  font-size: clamp(20px,4vw,48px);
  font-weight: 300;

  letter-spacing: 7px;

  text-transform: uppercase;

  color: #eee;
}


/* =========================================================
   RAAKA TITLE
   ========================================================= */

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

  font-size: clamp(85px,19vw,245px);

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


/* =========================================================
   WATCH BUTTON
   ========================================================= */

.raaka-watch {
  position: relative;

  margin-top: 52px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  gap: 16px;

  min-width: 210px;

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

  box-shadow:
    0 0 40px rgba(255,255,255,0.08);
}


.raaka-watch:hover::before {
  width: 100%;
}


.raaka-watch-arrow {
  font-size: 14px;

  transition:
    transform 300ms ease;
}


.raaka-watch:hover .raaka-watch-arrow {
  transform: translateX(5px);
}


.raaka-footer-message {
  margin-top: 35px;

  font-family: "Courier New", monospace;

  font-size: 8px;
  letter-spacing: 3px;

  color: rgba(255,255,255,0.20);

  text-transform: uppercase;
}


/* =========================================================
   VIDEO
   ========================================================= */

.raaka-video-overlay {
  position: fixed;

  z-index: 100;

  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 30px;

  background: rgba(0,0,0,0.97);

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

  width: min(1200px,96vw);
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


/* =========================================================
   PROGRESS
   ========================================================= */

.raaka-progress {
  position: fixed;

  z-index: 30;

  left: 0;
  bottom: 0;

  height: 1px;

  background: rgba(255,255,255,0.55);

  transition:
    width 700ms linear;
}


/* =========================================================
   FLASH
   ========================================================= */

.raaka-flash {
  position: fixed;

  z-index: 40;

  inset: 0;

  pointer-events: none;

  background: rgba(255,255,255,0.045);

  animation: raakaFlash 160ms ease;
}

@keyframes raakaFlash {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}


/* =========================================================
   MOBILE
   ========================================================= */

@media (max-width:700px) {

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

  .raaka-countdown {
    gap: 5px;
  }

  .raaka-time-unit {
    min-width: 65px;
  }

  .raaka-time-unit span {
    font-size: 30px;
  }

  .raaka-colon {
    font-size: 20px;
  }

  .raaka-countdown-title {
    letter-spacing: -5px;
  }

  .raaka-countdown-subtitle {
    letter-spacing: 3px;
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

  const [countdownDone, setCountdownDone] = useState(false);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [stage, setStage] = useState(0);

  const [started, setStarted] = useState(false);

  const [showVideo, setShowVideo] = useState(false);

  const [flash, setFlash] = useState(false);


  const videoId = useMemo(
    () => getYouTubeId(YOUTUBE_URL),
    []
  );


  /* =========================================================
     COUNTDOWN
     21 SEPTEMBER 2026 — 00:00 IST
     ========================================================= */

  useEffect(() => {

    const target =
      new Date(
        "2026-09-21T00:00:00+05:30"
      ).getTime();


    const updateCountdown = () => {

      const now = Date.now();

      const difference = target - now;


      if (difference <= 0) {

        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });

        setCountdownDone(true);

        setStarted(true);

        setStage(0);

        return;
      }


      const totalSeconds =
        Math.floor(difference / 1000);


      setTimeLeft({

        days:
          Math.floor(
            totalSeconds / 86400
          ),

        hours:
          Math.floor(
            (totalSeconds % 86400) / 3600
          ),

        minutes:
          Math.floor(
            (totalSeconds % 3600) / 60
          ),

        seconds:
          totalSeconds % 60,

      });

    };


    updateCountdown();


    const interval =
      window.setInterval(
        updateCountdown,
        1000
      );


    return () =>
      window.clearInterval(interval);

  }, []);


  /* =========================================================
     TRANSMISSION TIMELINE
     ========================================================= */

  useEffect(() => {

    if (!started) return;


    const timers = [

      window.setTimeout(
        () => setStage(1),
        4200
      ),

      window.setTimeout(
        () => setStage(2),
        8500
      ),

      window.setTimeout(
        () => setStage(3),
        13500
      ),

      window.setTimeout(
        () => setStage(4),
        19500
      ),

      window.setTimeout(
        () => setStage(5),
        27000
      ),

      window.setTimeout(
        () => setStage(6),
        34000
      ),

      window.setTimeout(
        () => setStage(7),
        40500
      ),

    ];


    return () =>
      timers.forEach(
        (timer) =>
          window.clearTimeout(timer)
      );

  }, [started]);


  /* =========================================================
     GLITCH FLASH
     ========================================================= */

  useEffect(() => {

    if (!started) return;


    const interval =
      window.setInterval(() => {

        setFlash(true);

        window.setTimeout(
          () => setFlash(false),
          160
        );

      }, 4200);


    return () =>
      window.clearInterval(interval);

  }, [started]);


  const progress =
    Math.min(
      100,
      (stage / 7) * 100
    );


  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: styles,
        }}
      />


      <main className="raaka-page">

        <div className="raaka-stars" />

        <div className="raaka-noise" />


        {/* =================================================
            CORNERS
            ================================================= */}

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


        {flash && (
          <div className="raaka-flash" />
        )}


        {/* =================================================
            COUNTDOWN
            THIS BLOCK COMPLETELY LOCKS THE PAGE
            ================================================= */}

        {!countdownDone && (

          <section className="raaka-countdown-screen">

            <div className="raaka-countdown-noise" />


            <div className="raaka-countdown-content">

              <div className="raaka-countdown-top">
                WORLD OF RAAKA
              </div>


              <div className="raaka-countdown-line" />


              <div className="raaka-countdown-label">
                NEXT TRANSMISSION
              </div>


              <h1 className="raaka-countdown-title">
                RAAKA
              </h1>


              <div className="raaka-countdown-subtitle">
                THE SIGNAL WILL OPEN AT MIDNIGHT
              </div>


              {/* COUNTDOWN */}

              <div className="raaka-countdown">

                <div className="raaka-time-unit">
                  <span>
                    {String(
                      timeLeft.days
                    ).padStart(2, "0")}
                  </span>

                  <small>
                    DAYS
                  </small>
                </div>


                <div className="raaka-colon">
                  :
                </div>


                <div className="raaka-time-unit">
                  <span>
                    {String(
                      timeLeft.hours
                    ).padStart(2, "0")}
                  </span>

                  <small>
                    HOURS
                  </small>
                </div>


                <div className="raaka-colon">
                  :
                </div>


                <div className="raaka-time-unit">
                  <span>
                    {String(
                      timeLeft.minutes
                    ).padStart(2, "0")}
                  </span>

                  <small>
                    MINUTES
                  </small>
                </div>


                <div className="raaka-colon">
                  :
                </div>


                <div className="raaka-time-unit">
                  <span>
                    {String(
                      timeLeft.seconds
                    ).padStart(2, "0")}
                  </span>

                  <small>
                    SECONDS
                  </small>
                </div>

              </div>


              <div className="raaka-countdown-status">

                <span className="raaka-status-dot" />

                TRANSMISSION LOCKED

              </div>


              <div className="raaka-countdown-date">
                21 · 09 · 2026
                &nbsp;&nbsp;//&nbsp;&nbsp;
                00:00 IST
              </div>

            </div>

          </section>

        )}


        {/* =================================================
            MAIN TRANSMISSION
            ONLY AVAILABLE AFTER COUNTDOWN
            ================================================= */}

        {countdownDone && (

          <section className="raaka-shell">

            <div
              className="raaka-stage"
              key={stage}
            >

              <div className="raaka-stage-inner">


                {/* =========================================
                    STAGE 0
                    ========================================= */}

                {stage === 0 && (

                  <>

                    <div className="raaka-micro">
                      INCOMING SIGNAL // UNKNOWN
                    </div>


                    <div className="raaka-terminal">

                      <div>
                        SEARCHING FOR SOURCE...
                      </div>

                      <div>
                        ..............
                      </div>

                      <div>
                        ..............
                      </div>

                    </div>


                    <div className="raaka-warning">
                      SIGNAL LOST
                    </div>


                    <div className="raaka-coordinate">
                      17°23'11"N // 78°29'32"E
                    </div>

                  </>

                )}


                {/* =========================================
                    STAGE 1
                    ========================================= */}

                {stage === 1 && (

                  <>

                    <div className="raaka-micro">
                      CONNECTION ESTABLISHED
                    </div>


                    <div className="raaka-terminal">

                      <div>
                        FREQUENCY:
                        <strong>
                          {" "}37.000
                        </strong>
                      </div>

                      <div>
                        CHANNEL:
                        <strong>
                          {" "}BLACK
                        </strong>
                      </div>

                      <div>
                        STATUS:
                        <strong>
                          {" "}UNSTABLE
                        </strong>
                      </div>

                    </div>


                    <div className="raaka-line" />


                    <div className="raaka-warning">
                      SOMETHING IS COMING
                    </div>

                  </>

                )}


                {/* =========================================
                    STAGE 2
                    ========================================= */}

                {stage === 2 && (

                  <>

                    <div className="raaka-micro">
                      SUBJECT IDENTIFICATION
                    </div>


                    <div className="raaka-terminal">

                      <div>
                        SUBJECT:
                        <strong>
                          {" "}RAAKA
                        </strong>
                      </div>

                      <div>
                        ORIGIN:
                        <strong>
                          {" "}CLASSIFIED
                        </strong>
                      </div>

                      <div>
                        AGE:
                        <strong>
                          {" "}UNKNOWN
                        </strong>
                      </div>

                      <div>
                        THREAT LEVEL:
                        <strong>
                          {" "}████████
                        </strong>
                      </div>

                    </div>


                    <div className="raaka-warning">
                      DATA CORRUPTED
                    </div>

                  </>

                )}


                {/* =========================================
                    STAGE 3
                    ========================================= */}

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

                      <div>
                        ARCHIVE ACCESS:
                        <strong>
                          {" "}DENIED
                        </strong>
                      </div>

                      <div>
                        VISUAL FEED:
                        <strong>
                          {" "}LOCKED
                        </strong>
                      </div>

                    </div>

                  </>

                )}


                {/* =========================================
                    STAGE 4
                    ========================================= */}

                {stage === 4 && (

                  <>

                    <div className="raaka-classified">
                      SECURITY OVERRIDE
                    </div>


                    <div className="raaka-line" />


                    <div className="raaka-terminal">

                      <div>
                        WARNING
                      </div>

                      <div>
                        THIS TRANSMISSION WAS NEVER
                      </div>

                      <div>
                        SUPPOSED TO REACH YOU.
                      </div>

                    </div>


                    <div className="raaka-warning">
                      LAST CHANCE
                    </div>

                  </>

                )}


                {/* =========================================
                    STAGE 5
                    ========================================= */}

                {stage === 5 && (

                  <>

                    <div className="raaka-micro">
                      FINAL DECRYPTION
                    </div>


                    <div className="raaka-terminal">

                      <div>
                        REMOVING ENCRYPTION...
                      </div>

                      <div>
                        ████████████████████
                      </div>

                      <div>
                        ACCESS GRANTED
                      </div>

                    </div>


                    <div className="raaka-line" />


                    <div className="raaka-warning">
                      TRANSMISSION DECRYPTED
                    </div>

                  </>

                )}


                {/* =========================================
                    STAGE 6
                    MAIN RAAKA REVEAL
                    ========================================= */}

                {stage === 6 && (

                  <>

                    <div className="raaka-decrypted">
                      TRANSMISSION DECRYPTED
                    </div>


                    <h1
                      className="raaka-title raaka-glitch"
                      data-text="RAAKA"
                    >
                      RAAKA
                    </h1>


                    <div className="raaka-title-sub">
                      THE WORLD HAS ONLY JUST BEGUN
                    </div>


                    <button
                      className="raaka-watch"
                      onClick={() =>
                        setShowVideo(true)
                      }
                    >
                      WATCH GLIMPSE

                      <span className="raaka-watch-arrow">
                        →
                      </span>

                    </button>

                  </>

                )}


                {/* =========================================
                    STAGE 7
                    FINAL HOLD
                    ========================================= */}

                {stage === 7 && (

                  <>

                    <div className="raaka-decrypted">
                      TRANSMISSION READY
                    </div>


                    <h1
                      className="raaka-title raaka-glitch"
                      data-text="RAAKA"
                    >
                      RAAKA
                    </h1>


                    <div className="raaka-title-sub">
                      ENTER THE UNKNOWN
                    </div>


                    <button
                      className="raaka-watch"
                      onClick={() =>
                        setShowVideo(true)
                      }
                    >
                      WATCH GLIMPSE

                      <span className="raaka-watch-arrow">
                        →
                      </span>

                    </button>

                  </>

                )}

              </div>

            </div>

          </section>

        )}


        {/* =================================================
            PROGRESS BAR
            ================================================= */}

        {started && (

          <div
            className="raaka-progress"
            style={{
              width: `${progress}%`,
            }}
          />

        )}


        {/* =================================================
            YOUTUBE VIDEO
            ================================================= */}

        {showVideo && (

          <div className="raaka-video-overlay">

            <div className="raaka-video-wrap">

              <div className="raaka-video-top">

                <span>
                  RAAKA // GLIMPSE
                </span>


                <button
                  className="raaka-close"
                  onClick={() =>
                    setShowVideo(false)
                  }
                >
                  CLOSE TRANSMISSION ×
                </button>

              </div>


              <div className="raaka-video-frame">

                {videoId ? (

                  <iframe
                    src={
                      `https://www.youtube.com/embed/${videoId}` +
                      `?autoplay=1&rel=0&modestbranding=1`
                    }
                    title="RAAKA Glimpse"
                    allow="
                      accelerometer;
                      autoplay;
                      clipboard-write;
                      encrypted-media;
                      gyroscope;
                      picture-in-picture;
                      web-share
                    "
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
                      fontFamily:
                        '"Courier New", monospace',
                      letterSpacing: "3px",
                      textAlign: "center",
                      padding: "20px",
                    }}
                  >

                    <div>
                      VIDEO SOURCE NOT CONFIGURED
                    </div>


                    <div className="raaka-error">
                      ADD YOUR YOUTUBE LINK IN
                      YOUTUBE_URL
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