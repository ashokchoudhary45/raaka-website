"use client";

import { useMemo, useState } from "react";

type VideoItem = {
  no: string;
  title: string;
  subtitle: string;
  category: string;
  year: string;
  embed: string;
  accent: string;
};

const VIDEOS: VideoItem[] = [
  {
    no: "01",
    title: "GEAR UP FOR RAAKA",
    subtitle: "The world begins to move.",
    category: "ANNOUNCEMENT",
    year: "2026",
    embed: "https://www.youtube.com/embed/SI_PhNII7Mc",
    accent: "#ff6a24",
  },
  {
    no: "02",
    title: "WELCOME ON BOARD DEEPIKA PADUKONE",
    subtitle: "A new presence enters the RAAKA universe.",
    category: "ANNOUNCEMENT",
    year: "2026",
    embed: "https://www.youtube.com/embed/jlmT4apm1oI",
    accent: "#e8b86a",
  },
  {
    no: "03",
    title: "RAAKA — MOTION CAPTURE",
    subtitle: "Behind the movement. Behind the illusion.",
    category: "BEHIND THE SCENES",
    year: "2026",
    embed: "https://www.youtube.com/embed/CmVA9ifXBx4",
    accent: "#a98cff",
  },
  {
    no: "04",
    title: "MAKE WAY FOR THE KING",
    subtitle: "The soundtrack enters the arena.",
    category: "MUSIC",
    year: "2026",
    embed: "https://www.youtube.com/embed/3UKmHZOGon4",
    accent: "#ff3f55",
  },
];

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 fill-current">
      <path d="M8.1 5.2v13.6L19.2 12z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4">
      <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function VideoStage({ video, active, onPlay }: {
  video: VideoItem;
  active: boolean;
  onPlay: () => void;
}) {
  const id = video.embed.split("/embed/")[1]?.split("?")[0] ?? "";
  const thumbnail = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;

  return (
    <article
      className={`video-card ${active ? "video-card-active" : ""}`}
      style={{ "--accent": video.accent } as React.CSSProperties}
    >
      <div className="video-number">{video.no}</div>

      <div className="video-frame">
        {active ? (
          <iframe
            src={`${video.embed}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            title={video.title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={onPlay}
            className="video-poster"
            aria-label={`Play ${video.title}`}
          >
            <img src={thumbnail} alt="" />
            <span className="poster-vignette" />
            <span className="poster-grid" />
            <span className="poster-topline" />
            <span className="poster-meta">RAAKA / TRANSMISSION / {video.no}</span>

            <span className="luxury-play">
              <span className="play-orbit" />
              <span className="play-orbit play-orbit-2" />
              <span className="play-core"><PlayIcon /></span>
            </span>

            <span className="poster-hint">ENTER TRANSMISSION</span>
          </button>
        )}

        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <div className="corner corner-bl" />
        <div className="corner corner-br" />
      </div>

      <div className="video-copy">
        <div className="video-meta">
          <span>{video.category}</span>
          <i />
          <span>{video.year}</span>
        </div>
        <h2>{video.title}</h2>
        <p>{video.subtitle}</p>
        <button type="button" onClick={onPlay} className="watch-line">
          <span>{active ? "PLAYING NOW" : "WATCH FILM"}</span>
          <ArrowIcon />
        </button>
      </div>
    </article>
  );
}

export default function RaakaVideosPage() {
  const [active, setActive] = useState(0);
  const [filter, setFilter] = useState("ALL");

  const visible = useMemo(
    () => VIDEOS.filter((v) => filter === "ALL" || v.category === filter),
    [filter]
  );

  const categories = ["ALL", "ANNOUNCEMENT", "BEHIND THE SCENES", "MUSIC"];

  return (
    <main className="raaka-videos-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Mono:wght@300;400;500&family=Manrope:wght@300;400;500;600;700&display=swap');

        :root {
          --ink: #070707;
          --paper: #f1eee7;
          --muted: rgba(241,238,231,.52);
          --line: rgba(255,255,255,.12);
          --gold: #d9b36b;
        }

        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; background: #050505; }

        .raaka-videos-page {
          min-height: 100vh;
          overflow: hidden;
          color: var(--paper);
          background:
            radial-gradient(circle at 50% 0%, rgba(255,83,26,.11), transparent 31rem),
            radial-gradient(circle at 92% 46%, rgba(138,105,255,.07), transparent 25rem),
            #050505;
          font-family: Manrope, system-ui, sans-serif;
        }

        .raaka-videos-page::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 50;
          opacity: .035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.65'/%3E%3C/svg%3E");
        }

        .lux-header {
          position: relative;
          min-height: 86vh;
          display: flex;
          align-items: center;
          border-bottom: 1px solid var(--line);
          isolation: isolate;
        }

        .hero-glow {
          position: absolute;
          width: 58vw;
          height: 58vw;
          max-width: 780px;
          max-height: 780px;
          left: 50%;
          top: 48%;
          transform: translate(-50%,-50%);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,91,29,.18), rgba(255,91,29,.04) 36%, transparent 69%);
          filter: blur(18px);
          animation: breathe 5s ease-in-out infinite;
        }

        .hero-ring {
          position: absolute;
          width: min(68vw, 900px);
          height: min(68vw, 900px);
          left: 50%;
          top: 50%;
          transform: translate(-50%,-50%);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 50%;
          animation: slowspin 28s linear infinite;
        }

        .hero-ring::after {
          content: "";
          position: absolute;
          inset: 9%;
          border: 1px dashed rgba(217,179,107,.15);
          border-radius: 50%;
        }

        .hero-content {
          width: min(1180px, calc(100% - 40px));
          margin: auto;
          position: relative;
          z-index: 2;
          text-align: center;
          padding: 130px 0 90px;
        }

        .micro {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          font: 400 10px/1 "DM Mono", monospace;
          letter-spacing: .35em;
          color: rgba(241,238,231,.48);
          text-transform: uppercase;
        }

        .micro::before, .micro::after {
          content: "";
          width: 34px;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold));
        }
        .micro::after { transform: rotate(180deg); }

        .hero-title {
          margin: 26px auto 0;
          font: 500 clamp(68px, 13vw, 190px)/.73 "Cormorant Garamond", serif;
          letter-spacing: -.065em;
          text-transform: uppercase;
          background: linear-gradient(180deg, #fff 5%, #d7d2c9 52%, #6d6a65 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          filter: drop-shadow(0 18px 50px rgba(255,80,20,.12));
          animation: titleReveal 1.3s cubic-bezier(.2,.8,.2,1) both;
        }

        .hero-title em {
          display: block;
          font-size: .31em;
          font-style: normal;
          letter-spacing: .44em;
          margin: 26px 0 0 .44em;
          color: var(--gold);
          background: none;
          -webkit-text-fill-color: var(--gold);
        }

        .hero-description {
          max-width: 580px;
          margin: 42px auto 0;
          color: var(--muted);
          font-size: 14px;
          line-height: 2;
          font-weight: 300;
        }

        .hero-scroll {
          margin-top: 58px;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: rgba(255,255,255,.34);
          font: 9px "DM Mono", monospace;
          letter-spacing: .28em;
        }
        .hero-scroll span {
          width: 1px;
          height: 46px;
          background: linear-gradient(var(--gold), transparent);
          animation: scrollPulse 2s ease-in-out infinite;
        }

        .library {
          width: min(1240px, calc(100% - 32px));
          margin: auto;
          padding: 105px 0 150px;
        }

        .library-top {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 64px;
        }

        .section-kicker {
          font: 10px "DM Mono", monospace;
          letter-spacing: .32em;
          color: var(--gold);
          text-transform: uppercase;
        }

        .section-title {
          margin: 12px 0 0;
          font: 500 clamp(42px, 5vw, 72px)/.9 "Cormorant Garamond", serif;
          letter-spacing: -.035em;
        }

        .library-count {
          color: rgba(255,255,255,.35);
          font: 11px "DM Mono", monospace;
          letter-spacing: .18em;
        }

        .filters {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: flex-end;
        }

        .filter {
          appearance: none;
          border: 1px solid rgba(255,255,255,.11);
          background: rgba(255,255,255,.025);
          color: rgba(255,255,255,.45);
          border-radius: 999px;
          padding: 10px 14px;
          font: 9px "DM Mono", monospace;
          letter-spacing: .15em;
          cursor: pointer;
          transition: .35s ease;
        }
        .filter:hover, .filter.active {
          color: white;
          border-color: rgba(217,179,107,.55);
          background: rgba(217,179,107,.08);
          box-shadow: 0 0 25px rgba(217,179,107,.07);
        }

        .video-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0,1fr));
          gap: 82px 34px;
        }

        .video-card {
          position: relative;
          min-width: 0;
          --accent: #ff6a24;
          animation: cardIn .9s cubic-bezier(.2,.8,.2,1) both;
        }
        .video-card:nth-child(2) { animation-delay: .08s; }
        .video-card:nth-child(3) { animation-delay: .16s; }
        .video-card:nth-child(4) { animation-delay: .24s; }

        .video-number {
          position: absolute;
          right: 8px;
          top: -45px;
          z-index: 0;
          color: rgba(255,255,255,.035);
          font: 700 115px/.8 "Cormorant Garamond", serif;
          letter-spacing: -.08em;
        }

        .video-frame {
          position: relative;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.1);
          background: #000;
          box-shadow: 0 22px 70px rgba(0,0,0,.48);
          isolation: isolate;
          transition: transform .65s cubic-bezier(.2,.8,.2,1), border-color .4s, box-shadow .6s;
        }

        .video-frame::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 8;
          border: 1px solid rgba(255,255,255,.045);
          box-shadow: inset 0 0 80px rgba(0,0,0,.4);
        }

        .video-card:hover .video-frame {
          transform: translateY(-10px);
          border-color: color-mix(in srgb, var(--accent) 58%, white 8%);
          box-shadow: 0 35px 100px rgba(0,0,0,.58), 0 0 55px color-mix(in srgb, var(--accent) 16%, transparent);
        }

        .video-poster {
          position: absolute;
          inset: 0;
          width: 100%;
          border: 0;
          padding: 0;
          background: #000;
          cursor: pointer;
          overflow: hidden;
        }

        .video-poster img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: saturate(.82) contrast(1.08) brightness(.74);
          transform: scale(1.01);
          transition: transform 1.2s cubic-bezier(.2,.8,.2,1), filter .8s;
        }
        .video-card:hover .video-poster img {
          transform: scale(1.055);
          filter: saturate(1.02) contrast(1.08) brightness(.82);
        }

        .poster-vignette {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(0,0,0,.6), transparent 28%, transparent 56%, rgba(0,0,0,.78)),
            linear-gradient(90deg, rgba(0,0,0,.42), transparent 30%, transparent 70%, rgba(0,0,0,.35));
        }

        .poster-grid {
          position: absolute;
          inset: 0;
          opacity: .16;
          background:
            linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: linear-gradient(to bottom, black, transparent 85%);
        }

        .poster-topline {
          position: absolute;
          top: 0;
          left: -40%;
          width: 40%;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--accent), white, transparent);
          box-shadow: 0 0 18px var(--accent);
          animation: scanLine 4.5s linear infinite;
        }

        .poster-meta {
          position: absolute;
          left: 22px;
          top: 20px;
          color: rgba(255,255,255,.55);
          font: 8px "DM Mono", monospace;
          letter-spacing: .24em;
        }

        .luxury-play {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 82px;
          height: 82px;
          transform: translate(-50%,-50%);
          display: grid;
          place-items: center;
        }

        .play-core {
          position: relative;
          z-index: 4;
          width: 66px;
          height: 66px;
          display: grid;
          place-items: center;
          padding-left: 3px;
          border: 1px solid rgba(255,255,255,.52);
          border-radius: 50%;
          color: white;
          background: rgba(5,5,5,.42);
          backdrop-filter: blur(12px);
          transition: transform .5s ease, background .4s;
        }

        .video-card:hover .play-core {
          transform: scale(1.1);
          background: color-mix(in srgb, var(--accent) 18%, rgba(5,5,5,.48));
        }

        .play-orbit {
          position: absolute;
          inset: 0;
          border: 1px solid color-mix(in srgb, var(--accent) 65%, transparent);
          border-radius: 50%;
          animation: orbit 3.2s linear infinite;
        }
        .play-orbit-2 {
          inset: -10px;
          border-style: dashed;
          opacity: .35;
          animation-direction: reverse;
          animation-duration: 6s;
        }

        .poster-hint {
          position: absolute;
          right: 20px;
          bottom: 18px;
          color: rgba(255,255,255,.6);
          font: 8px "DM Mono", monospace;
          letter-spacing: .2em;
          opacity: 0;
          transform: translateY(6px);
          transition: .4s ease;
        }
        .video-card:hover .poster-hint { opacity: 1; transform: translateY(0); }

        .corner {
          position: absolute;
          z-index: 10;
          width: 24px;
          height: 24px;
          border-color: rgba(255,255,255,.38);
          pointer-events: none;
          transition: .4s ease;
        }
        .corner-tl { left: 12px; top: 12px; border-left: 1px solid; border-top: 1px solid; }
        .corner-tr { right: 12px; top: 12px; border-right: 1px solid; border-top: 1px solid; }
        .corner-bl { left: 12px; bottom: 12px; border-left: 1px solid; border-bottom: 1px solid; }
        .corner-br { right: 12px; bottom: 12px; border-right: 1px solid; border-bottom: 1px solid; }
        .video-card:hover .corner { width: 34px; height: 34px; border-color: var(--accent); }

        .video-copy {
          padding: 24px 4px 0 2px;
          position: relative;
        }

        .video-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          color: color-mix(in srgb, var(--accent) 75%, white 5%);
          font: 9px "DM Mono", monospace;
          letter-spacing: .2em;
        }
        .video-meta i {
          width: 22px;
          height: 1px;
          background: var(--accent);
          opacity: .7;
        }

        .video-copy h2 {
          margin: 10px 0 0;
          max-width: 680px;
          font: 600 clamp(28px, 3.1vw, 46px)/.92 "Cormorant Garamond", serif;
          letter-spacing: -.025em;
          transition: transform .5s ease;
        }
        .video-card:hover .video-copy h2 { transform: translateX(7px); }

        .video-copy p {
          margin: 11px 0 0;
          color: rgba(255,255,255,.42);
          font-size: 12px;
          line-height: 1.7;
        }

        .watch-line {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          margin-top: 21px;
          padding: 0;
          border: 0;
          color: rgba(255,255,255,.7);
          background: transparent;
          cursor: pointer;
          font: 9px "DM Mono", monospace;
          letter-spacing: .18em;
          transition: .4s ease;
        }
        .watch-line svg { transition: transform .45s ease; }
        .watch-line:hover { color: white; }
        .watch-line:hover svg { transform: translateX(8px); color: var(--accent); }

        .editorial-break {
          width: 100%;
          margin: 125px 0 0;
          padding: 75px 0;
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
          display: grid;
          grid-template-columns: 1fr 2fr 1fr;
          align-items: center;
          gap: 30px;
        }

        .break-label {
          font: 9px "DM Mono", monospace;
          color: rgba(255,255,255,.32);
          letter-spacing: .22em;
          text-transform: uppercase;
        }

        .break-quote {
          text-align: center;
          font: 500 clamp(34px, 4.5vw, 66px)/.95 "Cormorant Garamond", serif;
          letter-spacing: -.035em;
        }

        .break-quote span {
          color: var(--gold);
          font-style: italic;
        }

        .break-mark {
          justify-self: end;
          width: 82px;
          height: 82px;
          border: 1px solid rgba(217,179,107,.35);
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: var(--gold);
          font: 10px "DM Mono", monospace;
          letter-spacing: .1em;
          animation: slowspin 14s linear infinite;
        }

        .footer {
          width: min(1240px, calc(100% - 32px));
          margin: auto;
          padding: 0 0 48px;
          display: flex;
          justify-content: space-between;
          gap: 20px;
          color: rgba(255,255,255,.3);
          font: 9px "DM Mono", monospace;
          letter-spacing: .18em;
          text-transform: uppercase;
        }

        @keyframes titleReveal {
          from { opacity: 0; transform: translateY(30px) scale(.97); filter: blur(12px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes breathe {
          0%,100% { transform: translate(-50%,-50%) scale(.92); opacity: .65; }
          50% { transform: translate(-50%,-50%) scale(1.08); opacity: 1; }
        }
        @keyframes slowspin { to { transform: translate(-50%,-50%) rotate(360deg); } }
        @keyframes orbit { to { transform: rotate(360deg); } }
        @keyframes scanLine {
          0% { left: -40%; opacity: 0; }
          12% { opacity: 1; }
          48% { opacity: .65; }
          100% { left: 120%; opacity: 0; }
        }
        @keyframes scrollPulse {
          0%,100% { opacity: .25; transform: scaleY(.6); transform-origin: top; }
          50% { opacity: 1; transform: scaleY(1); }
        }

        @media (max-width: 820px) {
          .lux-header { min-height: 78vh; }
          .hero-content { padding: 105px 0 70px; }
          .hero-title { font-size: clamp(68px, 21vw, 150px); }
          .library { padding-top: 78px; }
          .library-top { display: block; }
          .filters { justify-content: flex-start; margin-top: 28px; }
          .video-grid { grid-template-columns: 1fr; gap: 72px; }
          .editorial-break { grid-template-columns: 1fr; text-align: center; padding: 55px 0; }
          .break-label { text-align: center; }
          .break-mark { justify-self: center; }
          .footer { flex-direction: column; }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>

      <header className="lux-header">
        <div className="hero-glow" />
        <div className="hero-ring" />

        <div className="hero-content">
          <div className="micro">THE RAAKA ARCHIVE</div>
          <h1 className="hero-title">
            Moving
            <em>Pictures from another world</em>
          </h1>
          <p className="hero-description">
            Enter a curated collection of announcements, behind-the-scenes
            footage and music from the RAAKA universe — presented as a
            cinematic archive rather than a conventional video page.
          </p>
          <div className="hero-scroll">
            SCROLL TO EXPLORE
            <span />
          </div>
        </div>
      </header>

      <section className="library" id="films">
        <div className="library-top">
          <div>
            <div className="section-kicker">The Film Library</div>
            <h2 className="section-title">Four transmissions.</h2>
            <div className="library-count">04 ORIGINAL FEATURES / RAAKA 2026</div>
          </div>

          <div className="filters" aria-label="Video filters">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`filter ${filter === category ? "active" : ""}`}
                onClick={() => setFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="video-grid">
          {visible.map((video) => {
            const realIndex = VIDEOS.findIndex((v) => v.no === video.no);
            return (
              <VideoStage
                key={video.no}
                video={video}
                active={active === realIndex}
                onPlay={() => setActive(realIndex)}
              />
            );
          })}
        </div>

        <div className="editorial-break">
          <div className="break-label">RAAKA / 04 / ARCHIVE</div>
          <div className="break-quote">
            Every frame is a <span>signal.</span>
          </div>
          <div className="break-mark">R / X</div>
        </div>
      </section>

      <footer className="footer">
        <span>WORLD OF RAAKA</span>
        <span>THE OFFICIAL FAN ARCHIVE EXPERIENCE</span>
        <span>2026</span>
      </footer>
    </main>
  );
}
