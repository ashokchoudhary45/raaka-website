"use client";

import { useEffect, useRef, useState } from "react";

type Scene =
  | "black"
  | "countdown"
  | "line1"
  | "line2"
  | "line3"
  | "reveal"
  | "birthday"
  | "end";

export default function HBDAtleePage() {
  const [scene, setScene] = useState<Scene>("black");
  const [count, setCount] = useState(3);
  const [started, setStarted] = useState(false);
  const [flash, setFlash] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setShowControls(false);

    timerRef.current = setTimeout(() => {
      setShowControls(true);
    }, 1500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function startCinema() {
    if (started) return;

    setStarted(true);
    setScene("countdown");
    setCount(3);

    setTimeout(() => setCount(2), 900);
    setTimeout(() => setCount(1), 1800);

    setTimeout(() => {
      setFlash(true);
      setTimeout(() => setFlash(false), 280);
      setScene("line1");
    }, 2700);

    setTimeout(() => {
      setScene("line2");
    }, 5700);

    setTimeout(() => {
      setScene("line3");
    }, 8700);

    setTimeout(() => {
      setFlash(true);
      setTimeout(() => setFlash(false), 350);
      setScene("reveal");
    }, 11700);

    setTimeout(() => {
      setScene("birthday");
    }, 15700);

    setTimeout(() => {
      setScene("end");
    }, 23500);
  }

  function replay() {
    setStarted(false);
    setScene("black");
    setCount(3);

    setTimeout(() => {
      startCinema();
    }, 500);
  }

  return (
    <main className="cinema">
      <div className="film-grain" />
      <div className="vignette" />
      <div className="letterbox top" />
      <div className="letterbox bottom" />

      <div className="dust">
        {Array.from({ length: 55 }).map((_, i) => (
          <span
            key={i}
            style={{
              left: `${(i * 29) % 100}%`,
              top: `${(i * 47) % 100}%`,
              animationDelay: `${(i % 12) * 0.4}s`,
              animationDuration: `${4 + (i % 7)}s`,
            }}
          />
        ))}
      </div>

      <div className="light-leak leak-one" />
      <div className="light-leak leak-two" />

      {flash && <div className="white-flash" />}

      {!started && (
        <section className="opening">
          <div className="projector-line">
            <span />
            <b>WORLD OF RAAKA PRESENTS</b>
            <span />
          </div>

          <div className="opening-title">
            <span>A SPECIAL</span>
            <strong>CINEMATIC</strong>
            <span>CELEBRATION</span>
          </div>

          <div className="opening-date">
            21 / 09
          </div>

          <button onClick={startCinema} className="start">
            <span>ENTER THE FILM</span>
            <i>→</i>
          </button>

          <div className="opening-bottom">
            <span>PRESS TO BEGIN</span>
            <span>PROJECT ATLEE</span>
          </div>
        </section>
      )}

      {started && scene === "countdown" && (
        <section className="countdown scene">
          <div className="count-ring">
            <span>{count}</span>
          </div>

          <div className="count-meta">
            <span>THE CINEMA IS READY</span>
            <span>PROJECT 21.09</span>
          </div>
        </section>
      )}

      {started && scene === "line1" && (
        <CinematicLine
          top="EVERY STORY"
          main="HAS A"
          accent="VISION."
          number="01"
        />
      )}

      {started && scene === "line2" && (
        <CinematicLine
          top="EVERY MOMENT"
          main="NEEDS A"
          accent="MASTER."
          number="02"
        />
      )}

      {started && scene === "line3" && (
        <CinematicLine
          top="EVERY AUDIENCE"
          main="REMEMBERS"
          accent="THE FEELING."
          number="03"
        />
      )}

      {started && scene === "reveal" && (
        <section className="reveal scene">
          <div className="reveal-rays" />

          <div className="reveal-top">
            <span>DIRECTOR</span>
            <span>CREATIVE FORCE</span>
            <span>21 / 09</span>
          </div>

          <div className="reveal-content">
            <div className="pre-reveal">
              AND THEN...
            </div>

            <div className="atlee-word">
              <span>ATLEE</span>
            </div>

            <div className="reveal-line">
              <i />
              <b>✦</b>
              <i />
            </div>

            <div className="reveal-caption">
              THE MAN BEHIND THE MOMENTS
            </div>
          </div>
        </section>
      )}

      {started && scene === "birthday" && (
        <section className="birthday scene">
          <div className="gold-pulse" />
          <div className="gold-circle circle-one" />
          <div className="gold-circle circle-two" />

          <div className="birthday-content">
            <div className="tiny">
              TODAY IS YOUR DAY
            </div>

            <h1>
              <span>HAPPY</span>
              <strong>BIRTHDAY</strong>
              <em>ATLEE</em>
            </h1>

            <div className="gold-divider">
              <i />
              <b>✦</b>
              <i />
            </div>

            <p>
              To the storyteller who turns
              <br />
              imagination into cinema.
            </p>

            <div className="birthday-note">
              KEEP CREATING WORLDS.
              <br />
              KEEP MAKING THEM FEEL.
            </div>

            <div className="from">
              — WORLD OF RAAKA
            </div>
          </div>
        </section>
      )}

      {started && scene === "end" && (
        <section className="end scene">
          <div className="end-stars">
            ✦　✦　✦　✦　✦
          </div>

          <div className="end-top">
            A FILM BY THE WORLD OF RAAKA
          </div>

          <h2>
            THE STORY
            <br />
            <span>CONTINUES.</span>
          </h2>

          <div className="end-name">
            ATLEE
          </div>

          <div className="end-rule">
            <span />
            <b>21 · 09</b>
            <span />
          </div>

          <p>
            HAPPY BIRTHDAY
            <br />
            TO A DIRECTOR WHO MAKES
            <br />
            CINEMA FEEL BIGGER.
          </p>

          <div className="end-actions">
            <button onClick={replay}>
              ↻ WATCH AGAIN
            </button>

            <a href="#message">
              ↓ CONTINUE
            </a>
          </div>
        </section>
      )}

      <section id="message" className="message">
        <div className="message-number">04</div>

        <div className="message-inner">
          <div className="message-label">
            A SMALL NOTE
          </div>

          <h2>
            DEAR
            <br />
            <span>ATLEE,</span>
          </h2>

          <div className="message-line" />

          <p>
            Some filmmakers tell stories.
            <br />
            Some create moments.
            <br />
            Some create worlds.
          </p>

          <p>
            Your cinema has a way of making
            the audience feel like they are
            inside the moment — laughing,
            cheering, feeling and remembering.
          </p>

          <p className="gold-text">
            May the next chapter be even
            bigger than the last.
          </p>

          <div className="signature">
            <span>WITH LOVE</span>
            <strong>WORLD OF RAAKA</strong>
          </div>
        </div>
      </section>

      <footer className="footer">
        <span>WORLD OF RAAKA</span>
        <span>HAPPY BIRTHDAY ATLEE</span>
        <span>21 / 09</span>
      </footer>

      {showControls && started && (
        <div className="cinema-controls">
          <span>PROJECT 21.09</span>
          <span>● CINEMATIC MODE</span>
        </div>
      )}

      <style>{`
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          padding: 0;
          background: #020202;
        }

        .cinema {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 50% 45%,
              #16110a 0%,
              #070604 40%,
              #020202 100%
            );
          color: #f5f0e7;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        .film-grain {
          position: fixed;
          inset: -100%;
          z-index: 100;
          pointer-events: none;
          opacity: .045;
          background-image:
            repeating-radial-gradient(
              circle,
              rgba(255,255,255,.8) 0,
              rgba(255,255,255,.8) 1px,
              transparent 1px,
              transparent 3px
            );
          background-size: 5px 5px;
          animation: grain .18s steps(2) infinite;
        }

        .vignette {
          position: fixed;
          inset: 0;
          z-index: 90;
          pointer-events: none;
          background:
            radial-gradient(
              ellipse at center,
              transparent 35%,
              rgba(0,0,0,.55) 100%
            );
        }

        .letterbox {
          position: fixed;
          left: 0;
          right: 0;
          height: 55px;
          background: #000;
          z-index: 80;
          pointer-events: none;
        }

        .letterbox.top {
          top: 0;
        }

        .letterbox.bottom {
          bottom: 0;
        }

        .dust {
          position: fixed;
          inset: 0;
          z-index: 20;
          pointer-events: none;
          overflow: hidden;
        }

        .dust span {
          position: absolute;
          width: 2px;
          height: 2px;
          border-radius: 50%;
          background: #fff;
          opacity: .15;
          animation: dustMove linear infinite;
        }

        .light-leak {
          position: fixed;
          z-index: 5;
          pointer-events: none;
          width: 40vw;
          height: 80vh;
          filter: blur(80px);
          opacity: .08;
          transform: rotate(25deg);
        }

        .leak-one {
          left: -25vw;
          top: 10vh;
          background: #d6a044;
        }

        .leak-two {
          right: -25vw;
          bottom: -20vh;
          background: #a96c21;
        }

        .white-flash {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: white;
          pointer-events: none;
          animation: flash .35s ease forwards;
        }

        .opening {
          position: relative;
          min-height: 100vh;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 100px 20px;
          text-align: center;
        }

        .projector-line {
          display: flex;
          align-items: center;
          gap: 16px;
          color: #b68b48;
          font-size: 8px;
          letter-spacing: .35em;
        }

        .projector-line span {
          width: 70px;
          height: 1px;
          background: rgba(214,160,68,.45);
        }

        .opening-title {
          margin-top: 55px;
          display: flex;
          flex-direction: column;
          line-height: .82;
        }

        .opening-title span {
          font-size: clamp(11px, 1.4vw, 15px);
          letter-spacing: .6em;
          color: rgba(255,255,255,.35);
        }

        .opening-title strong {
          margin: 20px 0;
          font-size: clamp(60px, 12vw, 150px);
          letter-spacing: -.09em;
          font-weight: 900;
          color: transparent;
          -webkit-text-stroke: 1px rgba(255,255,255,.7);
        }

        .opening-date {
          margin-top: 45px;
          font-size: 11px;
          letter-spacing: .7em;
          color: #d6a044;
        }

        .start {
          margin-top: 65px;
          min-width: 230px;
          padding: 18px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 30px;
          border: 1px solid rgba(214,160,68,.4);
          background: rgba(214,160,68,.03);
          color: #fff;
          cursor: pointer;
          font-size: 8px;
          letter-spacing: .25em;
          transition: .35s ease;
        }

        .start i {
          color: #d6a044;
          font-size: 17px;
          font-style: normal;
        }

        .start:hover {
          background: #d6a044;
          color: #050403;
          transform: translateY(-3px);
        }

        .start:hover i {
          color: #050403;
        }

        .opening-bottom {
          position: absolute;
          bottom: 80px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
          padding: 0 35px;
          color: rgba(255,255,255,.18);
          font-size: 7px;
          letter-spacing: .25em;
        }

        .scene {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }

        .countdown {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          text-align: center;
        }

        .count-ring {
          width: min(42vw, 320px);
          height: min(42vw, 320px);
          min-width: 210px;
          min-height: 210px;
          border: 1px solid rgba(255,255,255,.2);
          border-radius: 50%;
          display: grid;
          place-items: center;
          position: relative;
          animation: ringIn .8s ease;
        }

        .count-ring::before,
        .count-ring::after {
          content: "";
          position: absolute;
          inset: 15px;
          border-radius: 50%;
          border: 1px dashed rgba(214,160,68,.25);
        }

        .count-ring::after {
          inset: 35px;
          border-color: rgba(255,255,255,.08);
        }

        .count-ring span {
          font-size: clamp(90px, 15vw, 180px);
          font-weight: 900;
          letter-spacing: -.12em;
          color: #fff;
        }

        .count-meta {
          position: absolute;
          bottom: 90px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
          padding: 0 50px;
          color: rgba(255,255,255,.25);
          font-size: 7px;
          letter-spacing: .3em;
        }

        .cinematic-line {
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          flex-direction: column;
          padding: 30px;
        }

        .line-number {
          position: absolute;
          top: 100px;
          left: 50px;
          font-size: 9px;
          letter-spacing: .3em;
          color: #b8893f;
        }

        .line-top {
          font-size: 10px;
          letter-spacing: .5em;
          color: rgba(255,255,255,.32);
          margin-bottom: 35px;
        }

        .line-main {
          font-size: clamp(42px, 9vw, 115px);
          line-height: .82;
          font-weight: 900;
          letter-spacing: -.08em;
        }

        .line-accent {
          font-size: clamp(48px, 10vw, 130px);
          line-height: .82;
          font-weight: 900;
          letter-spacing: -.09em;
          color: #d6a044;
          text-shadow: 0 0 70px rgba(214,160,68,.15);
        }

        .line-rule {
          margin-top: 45px;
          width: 180px;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            #d6a044,
            transparent
          );
        }

        .reveal {
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(
              circle at center,
              rgba(214,160,68,.12),
              transparent 48%
            );
        }

        .reveal-rays {
          position: absolute;
          width: 150vw;
          height: 150vw;
          background:
            repeating-conic-gradient(
              from 0deg,
              rgba(214,160,68,.05) 0deg 2deg,
              transparent 2deg 13deg
            );
          animation: rotate 35s linear infinite;
        }

        .reveal-top {
          position: absolute;
          top: 90px;
          left: 50px;
          right: 50px;
          display: flex;
          justify-content: space-between;
          color: rgba(255,255,255,.22);
          font-size: 7px;
          letter-spacing: .3em;
        }

        .reveal-content {
          position: relative;
          z-index: 3;
          text-align: center;
        }

        .pre-reveal {
          margin-bottom: 30px;
          font-size: 9px;
          letter-spacing: .55em;
          color: rgba(255,255,255,.35);
          animation: revealText 1s ease;
        }

        .atlee-word {
          overflow: hidden;
        }

        .atlee-word span {
          display: block;
          font-size: clamp(100px, 22vw, 300px);
          line-height: .72;
          font-weight: 900;
          letter-spacing: -.13em;
          color: transparent;
          -webkit-text-stroke: 1px #e4bd72;
          animation: atleeReveal 1.6s cubic-bezier(.16,1,.3,1);
        }

        .reveal-line {
          margin-top: 55px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
        }

        .reveal-line i {
          width: 100px;
          height: 1px;
          background: rgba(214,160,68,.5);
        }

        .reveal-line b {
          color: #d6a044;
        }

        .reveal-caption {
          margin-top: 18px;
          font-size: 8px;
          letter-spacing: .4em;
          color: rgba(255,255,255,.35);
        }

        .birthday {
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          background:
            radial-gradient(
              circle at center,
              #3a2810 0%,
              #0c0804 30%,
              #020202 72%
            );
        }

        .gold-pulse {
          position: absolute;
          width: 45vw;
          height: 45vw;
          border-radius: 50%;
          background: rgba(214,160,68,.08);
          filter: blur(50px);
          animation: pulse 3s ease-in-out infinite;
        }

        .gold-circle {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(214,160,68,.12);
        }

        .circle-one {
          width: 80vw;
          height: 80vw;
          animation: rotate 30s linear infinite;
        }

        .circle-two {
          width: 55vw;
          height: 55vw;
          border-style: dashed;
          animation: rotateReverse 20s linear infinite;
        }

        .birthday-content {
          position: relative;
          z-index: 5;
        }

        .tiny {
          margin-bottom: 35px;
          color: #d6a044;
          font-size: 8px;
          letter-spacing: .5em;
        }

        .birthday h1 {
          display: flex;
          flex-direction: column;
          line-height: .72;
          margin: 0;
          letter-spacing: -.1em;
        }

        .birthday h1 span {
          font-size: clamp(50px, 10vw, 125px);
        }

        .birthday h1 strong {
          font-size: clamp(55px, 12vw, 150px);
          background:
            linear-gradient(
              100deg,
              #8e6022,
              #ffe5a1,
              #ad782c,
              #fff0bd,
              #8e6022
            );
          background-size: 300%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: goldMove 5s linear infinite;
        }

        .birthday h1 em {
          margin-top: 12px;
          font-size: clamp(75px, 18vw, 220px);
          font-style: normal;
          color: transparent;
          -webkit-text-stroke: 1px rgba(255,255,255,.8);
        }

        .gold-divider {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 14px;
          margin: 45px auto 22px;
        }

        .gold-divider i {
          width: 110px;
          height: 1px;
          background: rgba(214,160,68,.55);
        }

        .gold-divider b {
          color: #d6a044;
        }

        .birthday-content p {
          color: rgba(255,255,255,.45);
          font-size: 12px;
          line-height: 1.8;
        }

        .birthday-note {
          margin-top: 25px;
          color: #d6a044;
          font-size: 8px;
          line-height: 1.9;
          letter-spacing: .28em;
        }

        .from {
          margin-top: 30px;
          color: rgba(255,255,255,.3);
          font-size: 8px;
          letter-spacing: .35em;
        }

        .end {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          text-align: center;
          padding: 100px 20px;
          background:
            radial-gradient(
              circle,
              rgba(214,160,68,.12),
              transparent 45%
            );
        }

        .end-stars {
          color: #d6a044;
          font-size: 11px;
          letter-spacing: .4em;
          margin-bottom: 30px;
        }

        .end-top {
          color: rgba(255,255,255,.3);
          font-size: 8px;
          letter-spacing: .4em;
        }

        .end h2 {
          margin: 45px 0 0;
          font-size: clamp(60px, 12vw, 150px);
          line-height: .76;
          letter-spacing: -.1em;
        }

        .end h2 span {
          color: transparent;
          -webkit-text-stroke: 1px rgba(255,255,255,.7);
        }

        .end-name {
          margin-top: 12px;
          font-size: clamp(90px, 20vw, 230px);
          line-height: .8;
          letter-spacing: -.12em;
          font-weight: 900;
          color: #d6a044;
          text-shadow: 0 0 80px rgba(214,160,68,.15);
        }

        .end-rule {
          margin: 45px auto 25px;
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .end-rule span {
          width: 100px;
          height: 1px;
          background: rgba(214,160,68,.4);
        }

        .end-rule b {
          color: #d6a044;
          font-size: 8px;
          letter-spacing: .3em;
        }

        .end p {
          color: rgba(255,255,255,.35);
          font-size: 10px;
          line-height: 1.8;
          letter-spacing: .08em;
        }

        .end-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 45px;
        }

        .end-actions button,
        .end-actions a {
          padding: 13px 18px;
          border: 1px solid rgba(214,160,68,.3);
          background: transparent;
          color: rgba(255,255,255,.5);
          text-decoration: none;
          font-size: 7px;
          letter-spacing: .2em;
          cursor: pointer;
          transition: .3s ease;
        }

        .end-actions button:hover,
        .end-actions a:hover {
          background: #d6a044;
          color: #050403;
        }

        .message {
          position: relative;
          min-height: 100vh;
          padding: 160px 10vw;
          display: flex;
          align-items: center;
          background: #050403;
          border-top: 1px solid rgba(255,255,255,.06);
        }

        .message-number {
          position: absolute;
          top: 70px;
          left: 10vw;
          color: #d6a044;
          font-size: 8px;
          letter-spacing: .3em;
        }

        .message-inner {
          width: min(850px, 100%);
          margin: auto;
        }

        .message-label {
          color: rgba(255,255,255,.25);
          font-size: 8px;
          letter-spacing: .4em;
        }

        .message h2 {
          margin: 35px 0;
          font-size: clamp(65px, 12vw, 150px);
          line-height: .75;
          letter-spacing: -.1em;
        }

        .message h2 span {
          color: #d6a044;
        }

        .message-line {
          width: 130px;
          height: 1px;
          background: #d6a044;
          margin-bottom: 40px;
        }

        .message p {
          max-width: 650px;
          color: rgba(255,255,255,.4);
          font-size: 13px;
          line-height: 2;
        }

        .message .gold-text {
          color: #d6a044;
          font-size: 16px;
        }

        .signature {
          margin-top: 60px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .signature span {
          color: rgba(255,255,255,.2);
          font-size: 7px;
          letter-spacing: .3em;
        }

        .signature strong {
          color: #d6a044;
          font-size: 10px;
          letter-spacing: .3em;
        }

        .footer {
          position: relative;
          z-index: 10;
          display: flex;
          justify-content: space-between;
          padding: 22px 30px;
          border-top: 1px solid rgba(255,255,255,.06);
          background: #020202;
          color: rgba(255,255,255,.2);
          font-size: 6px;
          letter-spacing: .3em;
        }

        .cinema-controls {
          position: fixed;
          left: 25px;
          right: 25px;
          bottom: 65px;
          z-index: 70;
          display: flex;
          justify-content: space-between;
          color: rgba(255,255,255,.16);
          font-size: 6px;
          letter-spacing: .25em;
          pointer-events: none;
        }

        @keyframes grain {
          0% { transform: translate(0,0); }
          25% { transform: translate(2%,-2%); }
          50% { transform: translate(-2%,2%); }
          75% { transform: translate(1%,2%); }
          100% { transform: translate(0,0); }
        }

        @keyframes dustMove {
          0% {
            transform: translateY(0) scale(.5);
            opacity: 0;
          }
          30% {
            opacity: .35;
          }
          100% {
            transform: translateY(-120px) translateX(40px) scale(1.4);
            opacity: 0;
          }
        }

        @keyframes flash {
          0% { opacity: 0; }
          15% { opacity: 1; }
          100% { opacity: 0; }
        }

        @keyframes ringIn {
          from {
            transform: scale(.7);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes revealText {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes atleeReveal {
          from {
            transform: translateY(100%);
            letter-spacing: .15em;
            opacity: 0;
          }
          to {
            transform: translateY(0);
            letter-spacing: -.13em;
            opacity: 1;
          }
        }

        @keyframes goldMove {
          0% {
            background-position: 0% center;
          }
          100% {
            background-position: 300% center;
          }
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes rotateReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(.85);
            opacity: .4;
          }
          50% {
            transform: scale(1.15);
            opacity: .8;
          }
        }

        @media (max-width: 700px) {
          .letterbox {
            height: 35px;
          }

          .projector-line {
            font-size: 6px;
          }

          .projector-line span {
            width: 25px;
          }

          .opening-title strong {
            font-size: 18vw;
          }

          .opening-bottom {
            padding: 0 15px;
            font-size: 5px;
          }

          .count-meta {
            padding: 0 20px;
            font-size: 5px;
          }

          .line-number {
            left: 20px;
            top: 85px;
          }

          .line-top {
            font-size: 7px;
          }

          .line-main {
            font-size: 14vw;
          }

          .line-accent {
            font-size: 15vw;
          }

          .reveal-top {
            left: 20px;
            right: 20px;
            top: 80px;
            font-size: 5px;
          }

          .atlee-word span {
            font-size: 25vw;
          }

          .birthday h1 span {
            font-size: 14vw;
          }

          .birthday h1 strong {
            font-size: 15vw;
          }

          .birthday h1 em {
            font-size: 23vw;
          }

          .gold-divider i {
            width: 50px;
          }

          .birthday-content p {
            font-size: 9px;
          }

          .message {
            padding: 120px 25px;
          }

          .message h2 {
            font-size: 18vw;
          }

          .footer {
            padding: 15px 12px;
            font-size: 5px;
          }

          .cinema-controls {
            left: 12px;
            right: 12px;
            font-size: 5px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </main>
  );
}

function CinematicLine({
  top,
  main,
  accent,
  number,
}: {
  top: string;
  main: string;
  accent: string;
  number: string;
}) {
  return (
    <section className="cinematic-line scene">
      <div className="line-number">
        {number} / 04
      </div>

      <div className="line-top">
        {top}
      </div>

      <div className="line-main">
        {main}
      </div>

      <div className="line-accent">
        {accent}
      </div>

      <div className="line-rule" />
    </section>
  );
}