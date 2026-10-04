"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const fans = [
  {
    "username": "@Cricvizanalys",
    "name": "Ashok",
    "role": "RAAKA Creator",
    "bio": "Cinema, fandom & conversations."
  },
  {
    "username": "@DracoUnbothered",
    "name": "DRACO",
    "role": "RAAKA Fan",
    "bio": "Unfiltered voice of the RAAKA universe."
  },
  {
    "username": "@SakethforRaaka",
    "name": "DuvvadaJaganadam",
    "role": "RAAKA FAN",
    "bio": "Allu Arjun • RAAKA • Cinema"
  },
  {
    "username": "@Corleoneei",
    "name": "के 🇳🇵",
    "role": "RAAKA Fan",
    "bio": "A voice from the RAAKA circle."
  },
  {
    "username": "@therwdygirl",
    "name": "Lilly ✨",
    "role": "RAAKA Fan",
    "bio": "Cinema • Virosh Cutz"
  },
  {
    "username": "@rounakdaa",
    "name": "Bᴀʙᴀ ICON",
    "role": "RAAKA Fan",
    "bio": "Allu Arjun • Indian Cinema"
  },
  {
    "username": "@bhAAiCults",
    "name": "Drake ᴬᴬ",
    "role": "RAAKA Fan",
    "bio": "Celebrating the ICON."
  },
  {
    "username": "@prashantAADHF",
    "name": "Prashu 🐉👑",
    "role": "RAAKA Fan",
    "bio": "They doubt, I dominate."
  },
  {
    "username": "@SRKsRajput",
    "name": "𝐓𝐔𝐒𝐇𝐀𝐑 🪓",
    "role": "RAAKA Fan",
    "bio": "Cinema • Cricket • Football"
  },
  {
    "username": "@RajMav07",
    "name": "Raj",
    "role": "RAAKA Fan",
    "bio": "Part of the RAAKA journey."
  },
  {
    "username": "@AaoGhumaKLeLu",
    "name": "Mangu Ram",
    "role": "RAAKA Fan",
    "bio": "Here for the ride."
  },
  {
    "username": "@ShivAAm_RAAJPUT",
    "name": "ShivAAm RAAJPUT",
    "role": "RAAKA Fan",
    "bio": "One universe. One fandom."
  },
  {
    "username": "@mosiac1234",
    "name": "AArya",
    "role": "RAAKA Fan",
    "bio": "RAAKA enthusiast."
  },
  {
    "username": "@sankalphqtweets",
    "name": "sankalphq.",
    "role": "RAAKA FAN",
    "bio": "Building the RAAKA conversation."
  },
  {
    "username": "@RohitSa52200019",
    "name": "Rohit Saha",
    "role": "RAAKA Fan",
    "bio": "A voice inside the circle."
  },
  {
    "username": "@sanjay_gormat",
    "name": "Sanjay Gormat",
    "role": "RAAKA Fan",
    "bio": "RAAKA • Allu Arjun • Cinema"
  },
  {
    "username": "@NorthAArmy",
    "name": "North A Army",
    "role": "RAAKA Fan",
    "bio": "North side of the universe."
  },
  {
    "username": "@sanket808004",
    "name": "Sanket",
    "role": "RAAKA Fan",
    "bio": "Cinema lives here."
  },
  {
    "username": "@kni8ofdarkness",
    "name": "Knight of Darkness",
    "role": "RAAKA Fan",
    "bio": "Into the RAAKA universe."
  },
  {
    "username": "@duaflora",
    "name": "duaflora",
    "role": "RAAKA Fan",
    "bio": "Another voice in the circle."
  },
  {
    "username": "@AArjunEra",
    "name": "AArjunEra",
    "role": "RAAKA Fan",
    "bio": "A passionate voice from the RAAKA fan community."
  },
  {
    "username": "@Morfine68339115",
    "name": "Morfine",
    "role": "RAAKA Fan",
    "bio": "A dedicated RAAKA supporter."
  },
  {
    "username": "@bunnykk59",
    "name": "KK",
    "role": "RAAKA Fan",
    "bio": "A proud voice in the RAAKA fan circle."
  },
  {
    "username": "@MusuguDhonga",
    "name": "MusuguDhonga",
    "role": "RAAKA Fan",
    "bio": "A passionate voice from the RAAKA fan community."
  },
  {
    "username": "@v_is_h_w_a",
    "name": "vishwa",
    "role": "RAAKA Fan",
    "bio": "A dedicated RAAKA supporter."
  },
  {
    "username": "@cultAAkash",
    "name": "AAkash",
    "role": "RAAKA Fan",
    "bio": "A proud voice in the RAAKA fan circle."
  },
  {
    "username": "@subhAAi666",
    "name": "CB",
    "role": "RAAKA Fan",
    "bio": "A passionate RAAKA fan."
  }
];

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M18.244 2H21.5l-7.11 8.13L22.76 22h-6.51l-5.1-6.66L5.32 22H2.06l7.61-8.7L1.5 2h6.67l4.61 6.1L18.244 2Zm-1.145 17.9h1.807L7.23 4.02H5.29L17.1 19.9Z" />
    </svg>
  );
}

function Portrait({ fan }: { fan: (typeof fans)[number] }) {
  const [failed, setFailed] = useState(false);
  const username = fan.username.replace("@", "");
  return (
    <div className="portrait">
      {!failed ? (
        <img
          src={`https://unavatar.io/x/${username}`}
          alt={`${fan.name} profile`}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="portraitFallback" aria-hidden="true">{fan.name.slice(0, 1).toUpperCase()}</div>
      )}
      <span className="portraitSheen" />
    </div>
  );
}

export default function FanCirclePage() {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"all" | "fans" | "creator">("all");

  const filteredFans = useMemo(() => {
    const q = query.trim().toLowerCase();
    return fans.filter((fan) => {
      const matchesView = view === "all" || (view === "creator" ? fan.role.toLowerCase().includes("creator") : !fan.role.toLowerCase().includes("creator"));
      const matchesQuery = !q || `${fan.name} ${fan.username} ${fan.bio}`.toLowerCase().includes(q);
      return matchesView && matchesQuery;
    });
  }, [query, view]);

  return (
    <main className="fc">
      <style>{` 
        :root { color-scheme: dark; }
        .fc{min-height:100vh;background:#070707;color:#f4f1eb;overflow:hidden;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}
        .fc *{box-sizing:border-box}
        .fc a{color:inherit;text-decoration:none}
        .fc::selection{background:#d6a65a;color:#070707}
        .fcShell{width:min(1440px,calc(100% - 48px));margin:auto}
        .fcTop{height:74px;border-bottom:1px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:space-between;position:relative;z-index:5}
        .back{font-size:9px;letter-spacing:.34em;text-transform:uppercase;color:rgba(255,255,255,.42);transition:.3s}
        .back:hover{color:#fff;transform:translateX(-3px)}
        .brand{font-size:12px;font-weight:900;letter-spacing:.52em;margin-left:.52em}
        .edition{font-size:8px;letter-spacing:.3em;text-transform:uppercase;color:rgba(255,255,255,.24)}
        .hero{position:relative;padding:96px 0 90px;min-height:620px;display:grid;grid-template-columns:minmax(0,1.1fr) 420px;gap:70px;align-items:end}
        .hero::before{content:"";position:absolute;width:650px;height:650px;left:20%;top:-280px;border-radius:50%;background:radial-gradient(circle,rgba(190,133,54,.14),transparent 67%);filter:blur(15px);pointer-events:none}
        .hero::after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,transparent 0 35%,rgba(255,255,255,.025) 50%,transparent 65%);transform:translateX(-100%);animation:heroSweep 7s ease-in-out infinite;pointer-events:none}
        @keyframes heroSweep{0%,55%{transform:translateX(-100%)}80%,100%{transform:translateX(100%)}}
        .eyebrow{display:flex;align-items:center;gap:14px;color:#c9a15f;font-size:9px;font-weight:800;letter-spacing:.42em;text-transform:uppercase}
        .eyebrow i{width:42px;height:1px;background:#c9a15f;display:block}
        .heroTitle{font-family:Georgia,"Times New Roman",serif;font-size:clamp(62px,10vw,150px);font-weight:500;line-height:.78;letter-spacing:-.075em;margin:28px 0 0;max-width:1000px}
        .heroTitle em{font-style:italic;color:#b99150}
        .heroCopy{max-width:610px;margin-top:32px;color:rgba(255,255,255,.43);font-size:14px;line-height:1.9}
        .heroMeta{display:flex;gap:30px;margin-top:38px}
        .meta strong{display:block;font-family:Georgia,serif;font-size:28px;font-weight:500}
        .meta span{display:block;margin-top:5px;color:rgba(255,255,255,.25);font-size:8px;text-transform:uppercase;letter-spacing:.3em}
        .heroPanel{position:relative;min-height:390px;border:1px solid rgba(201,161,95,.2);background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.012));padding:26px;overflow:hidden}
        .heroPanel::before{content:"";position:absolute;inset:10px;border:1px solid rgba(255,255,255,.06);pointer-events:none}
        .panelNo{font-family:monospace;font-size:9px;letter-spacing:.3em;color:rgba(255,255,255,.28)}
        .panelMark{position:absolute;right:26px;top:23px;width:52px;height:52px;border:1px solid rgba(201,161,95,.35);display:grid;place-items:center;color:#c9a15f;font-family:Georgia,serif;font-size:20px}
        .panelRule{height:1px;background:rgba(255,255,255,.08);margin:36px 0 25px}
        .panelTitle{font-family:Georgia,serif;font-size:34px;line-height:1.05;font-weight:500}
        .panelText{margin-top:15px;color:rgba(255,255,255,.34);font-size:11px;line-height:1.8}
        .panelBottom{position:absolute;left:26px;right:26px;bottom:26px;display:flex;justify-content:space-between;align-items:end}
        .panelBottom span{font-size:8px;letter-spacing:.3em;text-transform:uppercase;color:rgba(255,255,255,.2)}
        .goldLine{width:110px;height:1px;background:linear-gradient(90deg,#c9a15f,transparent)}
        .toolbar{border-top:1px solid rgba(255,255,255,.07);border-bottom:1px solid rgba(255,255,255,.07);padding:18px 0;position:sticky;top:0;background:rgba(7,7,7,.82);backdrop-filter:blur(18px);z-index:10}
        .toolbarInner{display:flex;gap:16px;align-items:center;justify-content:space-between}
        .filters{display:flex;gap:7px;flex-wrap:wrap}
        .filter{border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.025);color:rgba(255,255,255,.42);padding:9px 13px;font-size:8px;text-transform:uppercase;letter-spacing:.23em;cursor:pointer;transition:.3s}
        .filter:hover,.filter.active{border-color:rgba(201,161,95,.45);color:#e2bd79;background:rgba(201,161,95,.06)}
        .search{width:220px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.025);padding:10px 12px;color:#fff;outline:none;font-size:11px}
        .search:focus{border-color:rgba(201,161,95,.4)}
        .archive{padding:88px 0 120px}
        .sectionHead{display:flex;align-items:end;justify-content:space-between;margin-bottom:35px}
        .sectionKicker{font-size:8px;letter-spacing:.36em;text-transform:uppercase;color:#b99150}
        .sectionTitle{font-family:Georgia,serif;font-size:42px;font-weight:500;margin-top:10px;letter-spacing:-.04em}
        .sectionCount{font-family:Georgia,serif;font-size:34px;color:rgba(255,255,255,.18)}
        .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-top:1px solid rgba(255,255,255,.08);border-left:1px solid rgba(255,255,255,.08)}
        .card{min-height:235px;border-right:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.08);padding:22px;position:relative;overflow:hidden;background:linear-gradient(145deg,rgba(255,255,255,.018),transparent);transition:background .45s,transform .45s,box-shadow .45s}
        .card:hover{background:linear-gradient(145deg,rgba(201,161,95,.075),rgba(255,255,255,.015));transform:translateY(-4px);box-shadow:0 22px 50px rgba(0,0,0,.28)}
        .card::after{content:"";position:absolute;left:-30%;top:0;width:20%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,220,160,.13),transparent);transform:skewX(-16deg);transition:1s;pointer-events:none}
        .card:hover::after{left:120%}
        .cardTop{display:flex;justify-content:space-between;align-items:start}
        .number{font-family:monospace;font-size:8px;letter-spacing:.18em;color:rgba(255,255,255,.2)}
        .xBtn{width:30px;height:30px;border:1px solid rgba(255,255,255,.09);display:grid;place-items:center;color:rgba(255,255,255,.4);transition:.3s}
        .xBtn svg{width:12px;height:12px}
        .card:hover .xBtn{border-color:rgba(201,161,95,.38);color:#d7b16b}
        .cardBody{display:grid;grid-template-columns:82px 1fr;gap:20px;margin-top:28px;align-items:start}
        .portrait{width:82px;height:104px;position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.12);background:linear-gradient(160deg,#1c1c1c,#0b0b0b);flex:none}
        .portrait img{width:100%;height:100%;object-fit:cover;display:block;filter:saturate(.82) contrast(1.05);transition:transform .7s,filter .7s}
        .card:hover .portrait img{transform:scale(1.05);filter:saturate(1) contrast(1.08)}
        .portraitFallback{width:100%;height:100%;display:grid;place-items:center;font-family:Georgia,serif;font-size:34px;color:#c9a15f;background:radial-gradient(circle at 50% 25%,rgba(201,161,95,.16),transparent 50%),#101010}
        .portraitSheen{position:absolute;inset:0;background:linear-gradient(110deg,transparent 30%,rgba(255,255,255,.11) 48%,transparent 62%);transform:translateX(-130%);transition:transform .8s;pointer-events:none}
        .card:hover .portraitSheen{transform:translateX(130%)}
        .name{font-family:Georgia,serif;font-size:22px;font-weight:500;line-height:1.05}
        .handle{margin-top:7px;color:rgba(255,255,255,.27);font-size:10px}
        .role{display:inline-block;margin-top:17px;color:#c9a15f;font-size:7px;font-weight:800;letter-spacing:.24em;text-transform:uppercase}
        .bio{margin-top:11px;color:rgba(255,255,255,.3);font-size:10px;line-height:1.65}
        .cardFooter{position:absolute;bottom:20px;left:22px;right:22px;display:flex;justify-content:space-between;align-items:center}
        .open{font-size:7px;letter-spacing:.25em;text-transform:uppercase;color:rgba(255,255,255,.18);transition:.3s}
        .card:hover .open{color:#c9a15f}
        .manifesto{padding:0 0 120px}
        .manifestoBox{position:relative;border-top:1px solid rgba(201,161,95,.3);border-bottom:1px solid rgba(255,255,255,.08);padding:70px 0;display:grid;grid-template-columns:1fr 1fr;gap:80px}
        .manifestoBig{font-family:Georgia,serif;font-size:clamp(36px,5vw,70px);line-height:.95;letter-spacing:-.055em}
        .manifestoBig em{color:#b99150}
        .manifestoText{align-self:end;color:rgba(255,255,255,.34);font-size:13px;line-height:2;max-width:500px}
        .manifestoText strong{color:rgba(255,255,255,.72);font-weight:500}
        .cta{border:1px solid rgba(201,161,95,.18);background:radial-gradient(circle at 80% 0%,rgba(201,161,95,.12),transparent 38%),linear-gradient(120deg,rgba(255,255,255,.03),transparent);padding:52px 0}
        .ctaInner{display:flex;justify-content:space-between;align-items:center;gap:30px}
        .ctaTitle{font-family:Georgia,serif;font-size:36px}
        .ctaText{color:rgba(255,255,255,.3);font-size:11px;margin-top:9px}
        .ctaBtn{border:1px solid rgba(201,161,95,.38);padding:14px 20px;color:#d7b16b;font-size:8px;font-weight:800;letter-spacing:.3em;text-transform:uppercase;transition:.3s;white-space:nowrap}
        .ctaBtn:hover{background:#c9a15f;color:#080808}
        .footer{border-top:1px solid rgba(255,255,255,.08);padding:30px 0 40px}
        .footerInner{display:flex;justify-content:space-between;gap:20px;color:rgba(255,255,255,.18);font-size:8px;letter-spacing:.22em;text-transform:uppercase}
        @media(max-width:980px){.hero{grid-template-columns:1fr;gap:45px;padding-top:70px}.heroPanel{min-height:300px;max-width:600px}.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.manifestoBox{grid-template-columns:1fr;gap:30px}}
        @media(max-width:680px){.fcShell{width:min(100% - 28px,1440px)}.edition{display:none}.hero{padding:55px 0 65px;min-height:auto}.heroTitle{font-size:clamp(56px,19vw,100px)}.heroCopy{font-size:12px}.heroMeta{gap:20px}.meta strong{font-size:23px}.heroPanel{min-height:270px;padding:20px}.panelBottom{left:20px;right:20px;bottom:20px}.toolbarInner{align-items:stretch;flex-direction:column}.search{width:100%}.filters{width:100%}.filter{flex:1;text-align:center}.archive{padding:60px 0 80px}.sectionHead{align-items:start}.sectionTitle{font-size:34px}.grid{grid-template-columns:1fr}.card{min-height:225px}.manifesto{padding-bottom:80px}.manifestoBox{padding:50px 0}.cta{padding:38px 18px}.ctaInner{flex-direction:column;align-items:flex-start}.ctaTitle{font-size:30px}.footerInner{flex-direction:column}}
        @media(prefers-reduced-motion:reduce){.fc *,.fc *::before,.fc *::after{animation:none!important;transition:none!important}}
      `}</style>

      <div className="fcShell">
        <header className="fcTop">
          <Link href="/" className="back">← Back to RAAKA</Link>
          <Link href="/" className="brand">RAAKA</Link>
          <span className="edition">Fan Circle / 2026</span>
        </header>

        <section className="hero">
          <div>
            <div className="eyebrow"><i /> The community archive</div>
            <h1 className="heroTitle">One world.<br /><em>Many voices.</em></h1>
            <p className="heroCopy">A cinematic archive of the people who keep the RAAKA conversation moving — fans, creators and voices gathered around one universe.</p>
            <div className="heroMeta">
              <div className="meta"><strong>{String(fans.length).padStart(2,"0")}</strong><span>Voices</span></div>
              <div className="meta"><strong>01</strong><span>Circle</span></div>
              <div className="meta"><strong>∞</strong><span>Stories</span></div>
            </div>
          </div>
          <div className="heroPanel">
            <span className="panelNo">FC / 001</span><span className="panelMark">R</span>
            <div className="panelRule" />
            <div className="panelTitle">The people<br /><em>behind the noise.</em></div>
            <p className="panelText">No rankings. No hierarchy. Just a carefully presented record of the voices inside the RAAKA circle.</p>
            <div className="panelBottom"><span>World of RAAKA</span><span className="goldLine" /></div>
          </div>
        </section>

        <div className="toolbar">
          <div className="toolbarInner">
            <div className="filters">
              {([['all','All voices'],['fans','Fans'],['creator','Creator']] as const).map(([key,label]) => (
                <button key={key} className={`filter ${view===key ? 'active':''}`} onClick={() => setView(key)}>{label}</button>
              ))}
            </div>
            <input className="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search the circle…" aria-label="Search fan circle" />
          </div>
        </div>

        <section className="archive">
          <div className="sectionHead">
            <div><div className="sectionKicker">The archive / selected voices</div><h2 className="sectionTitle">The Circle</h2></div>
            <div className="sectionCount">{String(filteredFans.length).padStart(2,"0")}</div>
          </div>
          <div className="grid">
            {filteredFans.map((fan,index) => (
              <a key={fan.username} href={`https://x.com/${fan.username.replace("@","")}`} target="_blank" rel="noopener noreferrer" className="card">
                <div className="cardTop"><span className="number">{String(index+1).padStart(2,"0")} / {String(fans.length).padStart(2,"0")}</span><span className="xBtn"><XIcon /></span></div>
                <div className="cardBody">
                  <Portrait fan={fan} />
                  <div><div className="name">{fan.name}</div><div className="handle">{fan.username}</div><span className="role">{fan.role}</span><p className="bio">{fan.bio}</p></div>
                </div>
                <div className="cardFooter"><span className="open">Open profile</span><span className="open">↗</span></div>
              </a>
            ))}
          </div>
        </section>

        <section className="manifesto">
          <div className="manifestoBox">
            <div className="manifestoBig">The film has a world.<br /><em>The world has a fandom.</em></div>
            <p className="manifestoText"><strong>Fan Circle is not a leaderboard.</strong> It is a living archive of the people who talk, create, share and keep the anticipation alive. Every handle has a place. Every voice adds another frame to the story.</p>
          </div>
        </section>

        <section className="cta">
          <div className="ctaInner">
            <div><div className="sectionKicker">The circle keeps growing</div><div className="ctaTitle">Your voice could be next.</div><div className="ctaText">Keep creating. Keep talking. Keep the RAAKA universe alive.</div></div>
            <Link href="/" className="ctaBtn">Explore RAAKA →</Link>
          </div>
        </section>

        <footer className="footer"><div className="footerInner"><span>World of RAAKA</span><span>Fan-created • Independent • Not officially affiliated</span></div></footer>
      </div>
    </main>
  );
}
