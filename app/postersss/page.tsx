"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function RaakaPosterPage() {
  const [zoom, setZoom] = useState(false);
  const [posterLoaded, setPosterLoaded] = useState(false);

  return (
    <main className="poster-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Mono:wght@300;400;500&family=Manrope:wght@300;400;500;600;700&display=swap');

        *{box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{margin:0;background:#030303}

        .poster-page{
          min-height:100vh;
          overflow:hidden;
          color:#f5f1e9;
          background:
            radial-gradient(circle at 50% 12%,rgba(255,91,25,.12),transparent 31rem),
            radial-gradient(circle at 82% 65%,rgba(170,115,40,.07),transparent 28rem),
            #030303;
          font-family:Manrope,system-ui,sans-serif;
        }

        .poster-page::before{
          content:"";
          position:fixed;
          inset:0;
          z-index:80;
          pointer-events:none;
          opacity:.035;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.7'/%3E%3C/svg%3E");
        }

        .poster-nav{
          position:absolute;
          top:0;left:0;right:0;
          z-index:30;
          display:flex;
          align-items:center;
          justify-content:space-between;
          width:min(1380px,calc(100% - 42px));
          margin:auto;
          padding:28px 0;
        }

        .nav-brand{
          display:flex;
          align-items:center;
          gap:13px;
          color:rgba(255,255,255,.68);
          font:9px "DM Mono",monospace;
          letter-spacing:.25em;
          text-transform:uppercase;
        }
        .brand-dot{
          width:7px;height:7px;border-radius:50%;
          background:#ff6b25;
          box-shadow:0 0 18px #ff6b25;
          animation:pulse 2.5s infinite;
        }

        .back-link{
          display:flex;
          align-items:center;
          gap:9px;
          color:rgba(255,255,255,.45);
          text-decoration:none;
          font:9px "DM Mono",monospace;
          letter-spacing:.18em;
          transition:.35s;
        }
        .back-link:hover{color:#fff;transform:translateX(-4px)}

        .hero{
          min-height:100svh;
          position:relative;
          display:grid;
          place-items:center;
          padding:105px 22px 80px;
          isolation:isolate;
        }

        .aura{
          position:absolute;
          width:min(70vw,850px);
          height:min(70vw,850px);
          left:50%;top:50%;
          transform:translate(-50%,-50%);
          border-radius:50%;
          background:radial-gradient(circle,rgba(255,76,20,.2),rgba(255,100,20,.045) 38%,transparent 70%);
          filter:blur(28px);
          animation:breathe 5s ease-in-out infinite;
          z-index:-2;
        }

        .ring{
          position:absolute;
          width:min(78vw,980px);
          height:min(78vw,980px);
          left:50%;top:50%;
          transform:translate(-50%,-50%);
          border:1px solid rgba(255,255,255,.055);
          border-radius:50%;
          z-index:-1;
          animation:spin 30s linear infinite;
        }
        .ring::after{
          content:"";
          position:absolute;
          inset:9%;
          border:1px dashed rgba(214,169,82,.15);
          border-radius:50%;
        }

        .hero-layout{
          width:min(1240px,100%);
          display:grid;
          grid-template-columns:minmax(260px,470px) minmax(300px,1fr);
          align-items:center;
          gap:clamp(50px,8vw,130px);
        }

        .poster-wrap{
          position:relative;
          width:min(100%,450px);
          justify-self:center;
          perspective:1200px;
        }

        .poster-frame{
          position:relative;
          aspect-ratio:2/3;
          overflow:hidden;
          border:1px solid rgba(255,255,255,.15);
          background:#080808;
          box-shadow:
            0 35px 100px rgba(0,0,0,.75),
            0 0 80px rgba(255,75,20,.12);
          transform:rotateY(-3deg) rotateX(1deg);
          transition:transform 1s cubic-bezier(.2,.8,.2,1),box-shadow .8s;
        }
        .poster-wrap:hover .poster-frame{
          transform:rotateY(0) rotateX(0) translateY(-8px);
          box-shadow:0 45px 120px rgba(0,0,0,.8),0 0 100px rgba(255,75,20,.2);
        }

        .poster-image{
          position:absolute;
          inset:0;
          width:100%;
          height:100%;
          object-fit:cover;
          display:block;
          transform:scale(1.015);
          filter:saturate(.96) contrast(1.05);
          transition:transform 1.3s cubic-bezier(.2,.8,.2,1),filter .8s;
        }
        .poster-wrap:hover .poster-image{transform:scale(1.045);filter:saturate(1.06) contrast(1.08)}

        .poster-scan{
          position:absolute;
          top:-30%;
          left:0;
          width:100%;
          height:2px;
          background:linear-gradient(90deg,transparent,#ff7130,#fff,#ff7130,transparent);
          box-shadow:0 0 22px rgba(255,92,30,.75);
          animation:scan 4.8s linear infinite;
          z-index:5;
          pointer-events:none;
        }

        .poster-vignette{
          position:absolute;
          inset:0;
          pointer-events:none;
          z-index:3;
          background:
            linear-gradient(to bottom,rgba(0,0,0,.2),transparent 25%,transparent 68%,rgba(0,0,0,.72)),
            linear-gradient(90deg,rgba(0,0,0,.22),transparent 25%,transparent 75%,rgba(0,0,0,.2));
        }

        .poster-corner{
          position:absolute;
          width:35px;height:35px;
          border-color:rgba(255,181,100,.58);
          z-index:7;
          pointer-events:none;
          transition:.5s;
        }
        .poster-corner.tl{left:14px;top:14px;border-left:1px solid;border-top:1px solid}
        .poster-corner.tr{right:14px;top:14px;border-right:1px solid;border-top:1px solid}
        .poster-corner.bl{left:14px;bottom:14px;border-left:1px solid;border-bottom:1px solid}
        .poster-corner.br{right:14px;bottom:14px;border-right:1px solid;border-bottom:1px solid}
        .poster-wrap:hover .poster-corner{width:48px;height:48px;border-color:#ff6c28}

        .poster-index{
          position:absolute;
          left:-38px;
          bottom:10px;
          color:rgba(255,255,255,.16);
          writing-mode:vertical-rl;
          transform:rotate(180deg);
          font:9px "DM Mono",monospace;
          letter-spacing:.3em;
        }

        .poster-copy{
          max-width:640px;
          animation:copyIn 1.1s .15s cubic-bezier(.2,.8,.2,1) both;
        }

        .eyebrow{
          display:flex;
          align-items:center;
          gap:12px;
          color:#d9b36b;
          font:9px "DM Mono",monospace;
          letter-spacing:.35em;
          text-transform:uppercase;
        }
        .eyebrow::before{
          content:"";
          width:45px;height:1px;
          background:linear-gradient(90deg,transparent,#d9b36b);
        }

        .title{
          margin:23px 0 0;
          font:600 clamp(70px,9vw,135px)/.73 "Cormorant Garamond",serif;
          letter-spacing:-.065em;
          text-transform:uppercase;
          background:linear-gradient(180deg,#fff 0%,#d8d0c2 45%,#6f6a62 100%);
          -webkit-background-clip:text;
          background-clip:text;
          color:transparent;
          filter:drop-shadow(0 20px 50px rgba(255,85,20,.1));
        }

        .title-sub{
          margin:24px 0 0;
          color:#d9b36b;
          font:500 12px "DM Mono",monospace;
          letter-spacing:.45em;
          text-transform:uppercase;
        }

        .description{
          max-width:560px;
          margin:34px 0 0;
          color:rgba(245,241,233,.5);
          font-size:14px;
          line-height:2;
          font-weight:300;
        }

        .facts{
          display:grid;
          grid-template-columns:repeat(4,1fr);
          margin-top:42px;
          border-top:1px solid rgba(255,255,255,.1);
          border-bottom:1px solid rgba(255,255,255,.1);
        }

        .fact{
          padding:17px 12px 18px 0;
          border-right:1px solid rgba(255,255,255,.08);
        }
        .fact:last-child{border-right:0;padding-left:12px}
        .fact:not(:first-child){padding-left:18px}
        .fact-label{
          color:rgba(255,255,255,.32);
          font:8px "DM Mono",monospace;
          letter-spacing:.15em;
          text-transform:uppercase;
        }
        .fact-value{
          margin-top:7px;
          color:rgba(255,255,255,.86);
          font:500 13px "Manrope",sans-serif;
        }

        .actions{
          display:flex;
          flex-wrap:wrap;
          gap:10px;
          margin-top:32px;
        }

        .action{
          position:relative;
          overflow:hidden;
          display:inline-flex;
          align-items:center;
          gap:12px;
          min-height:48px;
          padding:0 19px;
          border:1px solid rgba(255,255,255,.12);
          border-radius:999px;
          color:rgba(255,255,255,.68);
          background:rgba(255,255,255,.025);
          text-decoration:none;
          font:9px "DM Mono",monospace;
          letter-spacing:.16em;
          transition:.45s cubic-bezier(.2,.8,.2,1);
        }
        .action::before{
          content:"";
          position:absolute;
          top:0;bottom:0;
          left:-80%;
          width:50%;
          background:linear-gradient(90deg,transparent,rgba(255,200,120,.35),transparent);
          transform:skewX(-20deg);
        }
        .action:hover{
          color:#fff;
          border-color:rgba(255,160,70,.55);
          transform:translateY(-4px);
          box-shadow:0 15px 45px rgba(255,80,20,.12);
        }
        .action:hover::before{animation:shine .8s ease-out}

        .poster-info{
          padding:110px 22px 140px;
          border-top:1px solid rgba(255,255,255,.08);
          background:linear-gradient(180deg,rgba(255,255,255,.012),transparent);
        }

        .info-inner{width:min(1240px,100%);margin:auto}
        .section-kicker{
          color:#d9b36b;
          font:9px "DM Mono",monospace;
          letter-spacing:.32em;
          text-transform:uppercase;
        }
        .section-title{
          margin:13px 0 0;
          font:500 clamp(45px,6vw,82px)/.88 "Cormorant Garamond",serif;
          letter-spacing:-.04em;
        }

        .info-grid{
          display:grid;
          grid-template-columns:1.1fr .9fr;
          gap:80px;
          margin-top:65px;
          align-items:start;
        }

        .info-copy{
          color:rgba(255,255,255,.46);
          font-size:14px;
          line-height:2.05;
          font-weight:300;
        }

        .poster-specs{
          border-top:1px solid rgba(255,255,255,.1);
        }
        .spec{
          display:flex;
          justify-content:space-between;
          gap:20px;
          padding:18px 0;
          border-bottom:1px solid rgba(255,255,255,.08);
        }
        .spec span:first-child{
          color:rgba(255,255,255,.3);
          font:9px "DM Mono",monospace;
          letter-spacing:.16em;
          text-transform:uppercase;
        }
        .spec span:last-child{
          color:rgba(255,255,255,.78);
          font-size:13px;
          text-align:right;
        }

        .poster-showcase{
          margin-top:105px;
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:30px;
        }

        .showcase-card{
          position:relative;
          min-height:330px;
          padding:38px;
          overflow:hidden;
          border:1px solid rgba(255,255,255,.1);
          background:rgba(255,255,255,.018);
          transition:.5s;
        }
        .showcase-card:hover{
          transform:translateY(-7px);
          border-color:rgba(217,179,107,.35);
          box-shadow:0 25px 65px rgba(0,0,0,.4);
        }

        .showcase-card::after{
          content:"";
          position:absolute;
          width:220px;height:220px;
          right:-100px;bottom:-100px;
          border-radius:50%;
          background:rgba(255,100,30,.08);
          filter:blur(50px);
        }

        .showcase-num{
          color:rgba(255,255,255,.12);
          font:700 90px/.8 "Cormorant Garamond",serif;
        }
        .showcase-title{
          position:relative;
          z-index:2;
          margin-top:40px;
          font:500 38px/.9 "Cormorant Garamond",serif;
        }
        .showcase-text{
          position:relative;
          z-index:2;
          max-width:390px;
          margin-top:14px;
          color:rgba(255,255,255,.4);
          font-size:12px;
          line-height:1.9;
        }

        .zoom-overlay{
          position:fixed;
          inset:0;
          z-index:100;
          display:grid;
          place-items:center;
          padding:30px;
          background:rgba(0,0,0,.92);
          backdrop-filter:blur(20px);
          animation:fadeIn .3s ease;
        }
        .zoom-poster{
          position:relative;
          height:min(88vh,900px);
          aspect-ratio:2/3;
          max-width:90vw;
          box-shadow:0 40px 130px rgba(0,0,0,.9);
        }
        .close{
          position:absolute;
          top:25px;right:25px;
          z-index:5;
          width:44px;height:44px;
          border:1px solid rgba(255,255,255,.2);
          border-radius:50%;
          background:rgba(0,0,0,.4);
          color:#fff;
          cursor:pointer;
          font-size:20px;
        }

        .footer{
          width:min(1240px,calc(100% - 44px));
          margin:auto;
          padding:0 0 42px;
          display:flex;
          justify-content:space-between;
          color:rgba(255,255,255,.25);
          font:8px "DM Mono",monospace;
          letter-spacing:.2em;
          text-transform:uppercase;
        }

        @keyframes breathe{0%,100%{transform:translate(-50%,-50%) scale(.9);opacity:.55}50%{transform:translate(-50%,-50%) scale(1.08);opacity:1}}
        @keyframes spin{to{transform:translate(-50%,-50%) rotate(360deg)}}
        @keyframes scan{0%{top:-5%;opacity:0}12%{opacity:1}55%{opacity:.6}100%{top:105%;opacity:0}}
        @keyframes copyIn{from{opacity:0;transform:translateX(35px);filter:blur(8px)}to{opacity:1;transform:none;filter:none}}
        @keyframes shine{0%{left:-80%}100%{left:140%}}
        @keyframes pulse{0%,100%{opacity:.45;transform:scale(.8)}50%{opacity:1;transform:scale(1.1)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}

        @media(max-width:900px){
          .hero-layout{grid-template-columns:1fr;gap:60px}
          .poster-wrap{width:min(78vw,390px)}
          .poster-copy{max-width:700px;text-align:center;margin:auto}
          .eyebrow{justify-content:center}
          .eyebrow::before{display:none}
          .title{font-size:clamp(75px,20vw,140px)}
          .actions{justify-content:center}
          .facts{text-align:left}
          .info-grid{grid-template-columns:1fr;gap:45px}
        }

        @media(max-width:600px){
          .poster-nav{width:calc(100% - 28px);padding:21px 0}
          .nav-brand{font-size:7px}
          .back-link{font-size:7px}
          .hero{padding:92px 17px 65px}
          .poster-wrap{width:min(82vw,360px)}
          .poster-index{display:none}
          .title{font-size:clamp(66px,21vw,110px)}
          .title-sub{font-size:8px;letter-spacing:.32em}
          .description{font-size:12px;line-height:1.9}
          .facts{grid-template-columns:repeat(2,1fr)}
          .fact:nth-child(2){border-right:0}
          .fact:nth-child(3){padding-left:0;border-top:1px solid rgba(255,255,255,.08)}
          .fact:nth-child(4){border-top:1px solid rgba(255,255,255,.08)}
          .poster-info{padding:75px 17px 100px}
          .poster-showcase{grid-template-columns:1fr;margin-top:65px}
          .showcase-card{min-height:270px;padding:28px}
          .footer{flex-direction:column;gap:12px}
          .zoom-overlay{padding:12px}
          .zoom-poster{height:auto;width:92vw;max-height:84vh}
        }

        @media(prefers-reduced-motion:reduce){
          *,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}
        }
      `}</style>

      <nav className="poster-nav">
        <div className="nav-brand">
          <span className="brand-dot" />
          WORLD OF RAAKA / POSTER ARCHIVE
        </div>
        <Link href="/" className="back-link">← BACK TO WORLD</Link>
      </nav>

      <section className="hero">
        <div className="aura" />
        <div className="ring" />

        <div className="hero-layout">
          <div className="poster-wrap">
            <span className="poster-index">ARCHIVE / 001 / FIRST LOOK</span>

            <button
              type="button"
              className="poster-frame"
              onClick={() => setZoom(true)}
              aria-label="Open RAAKA poster"
            >
              {!posterLoaded && <div style={{ position: "absolute", inset: 0, background: "#111" }} />}
              <Image
                src="/images/RAAKAFL.jpg"
                alt="RAAKA First Look poster"
                fill
                priority
                sizes="(max-width: 900px) 82vw, 450px"
                className="poster-image"
                onLoad={() => setPosterLoaded(true)}
              />
              <span className="poster-vignette" />
              <span className="poster-scan" />
              <span className="poster-corner tl" />
              <span className="poster-corner tr" />
              <span className="poster-corner bl" />
              <span className="poster-corner br" />
            </button>
          </div>

          <div className="poster-copy">
            <div className="eyebrow">THE FIRST LOOK / RAAKA</div>

            <h1 className="title">RAAKA</h1>
            <div className="title-sub">A new world begins</div>

            <p className="description">
              A dedicated presentation for the RAAKA first-look poster —
              designed like a premium film archive, with the artwork treated
              as the centrepiece rather than a normal website image.
            </p>

            <div className="facts">
              <div className="fact">
                <div className="fact-label">Language</div>
                <div className="fact-value">Telugu</div>
              </div>
              <div className="fact">
                <div className="fact-label">Genre</div>
                <div className="fact-value">Sci-Fi</div>
              </div>
              <div className="fact">
                <div className="fact-label">Director</div>
                <div className="fact-value">Atlee Kumar</div>
              </div>
              <div className="fact">
                <div className="fact-label">Status</div>
                <div className="fact-value">Coming Soon</div>
              </div>
            </div>

            <div className="actions">
              <button type="button" className="action" onClick={() => setZoom(true)}>
                VIEW FULL POSTER ↗
              </button>
              <a className="action" href="#details">EXPLORE DETAILS ↓</a>
            </div>
          </div>
        </div>
      </section>

      <section className="poster-info" id="details">
        <div className="info-inner">
          <div className="section-kicker">Poster Archive / 001</div>
          <h2 className="section-title">The First Look.</h2>

          <div className="info-grid">
            <p className="info-copy">
              This page turns the RAAKA poster into a standalone cinematic
              object. The poster remains visually dominant, while the
              surrounding interface provides a restrained luxury frame:
              editorial typography, metallic accents, cinematic lighting,
              animated scan lines and a full-screen poster viewer.
              <br /><br />
              The poster asset used here is the existing RAAKA first-look
              artwork from the World of Raaka page.
            </p>

            <div className="poster-specs">
              <div className="spec"><span>Collection</span><span>RAAKA Poster Archive</span></div>
              <div className="spec"><span>Artwork</span><span>RAAKA First Look</span></div>
              <div className="spec"><span>Presentation</span><span>Cinematic / Editorial</span></div>
              <div className="spec"><span>Interaction</span><span>Hover + Fullscreen View</span></div>
              <div className="spec"><span>Asset</span><span>/images/RAAKAFL.jpg</span></div>
            </div>
          </div>

          <div className="poster-showcase">
            <div className="showcase-card">
              <div className="showcase-num">01</div>
              <div className="showcase-title">Poster as the hero.</div>
              <div className="showcase-text">
                The artwork is given a dedicated visual stage with depth,
                glow, scanning light and a restrained archival frame.
              </div>
            </div>

            <div className="showcase-card">
              <div className="showcase-num">02</div>
              <div className="showcase-title">Open. Inspect. Enter.</div>
              <div className="showcase-text">
                Click the poster to open a distraction-free full-screen
                presentation for a closer look at the artwork.
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <span>WORLD OF RAAKA</span>
        <span>POSTER ARCHIVE / 001</span>
        <span>2026</span>
      </footer>

      {zoom && (
        <div className="zoom-overlay" role="dialog" aria-modal="true">
          <button type="button" className="close" onClick={() => setZoom(false)} aria-label="Close">×</button>
          <div className="zoom-poster">
            <Image
              src="/images/RAAKAFL.jpg"
              alt="RAAKA First Look poster enlarged"
              fill
              sizes="92vw"
              className="object-contain"
              priority
            />
          </div>
        </div>
      )}
    </main>
  );
}
