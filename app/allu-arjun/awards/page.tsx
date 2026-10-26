"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as PE } from "react";
import Link from "next/link";
import Image from "next/image";

const awardGroups = [
  {
    name: "National Film Award",
    icon: "🇮🇳",
    wins: 1,
    featured: true,
    rows: [
      ["2023", "Pushpa: The Rise", "Best Actor"],
    ],
    note: "This was Allu Arjun's first National Film Award, and according to the supplied list, he became the first Telugu actor to win Best Actor.",
  },

  {
    name: "Filmfare Awards South",
    icon: "🏆",
    wins: 7,
    rows: [
      ["2009", "Parugu", "Best Actor – Telugu"],
      ["2011", "Vedam", "Best Actor – Telugu"],
      ["2015", "Race Gurram", "Best Actor – Telugu"],
      ["2016", "Rudhramadevi", "Best Supporting Actor – Telugu"],
      ["2017", "Sarrainodu", "Critics' Best Actor – Telugu"],
      ["2022", "Pushpa: The Rise", "Best Actor – Telugu"],
      ["2026", "Pushpa 2: The Rule", "Best Actor – Telugu"],
    ],
  },

  {
    name: "SIIMA",
    icon: "🏆",
    wins: 5,
    rows: [
      ["2015", "Race Gurram", "Stylish Youth Icon of South Indian Cinema – Male"],
      ["2016", "Rudhramadevi", "Best Actor – Critics, Telugu"],
      ["2021", "Ala Vaikunthapurramuloo", "Best Actor – Telugu"],
      ["2022", "Pushpa: The Rise", "Best Actor – Telugu"],
      ["2025", "Pushpa 2: The Rule", "Best Actor – Telugu"],
    ],
  },

  {
    name: "Nandi Awards",
    icon: "🏆",
    wins: 5,
    rows: [
      ["2003", "Gangotri", "Special Jury Award"],
      ["2004", "Arya", "Special Jury Award"],
      ["2008", "Parugu", "Special Jury Award"],
      ["2010", "Vedam", "Special Jury Award"],
      ["2015", "Rudhramadevi", "Best Character Actor"],
    ],
  },

  {
    name: "IIFA Utsavam",
    icon: "🏆",
    wins: 1,
    rows: [
      ["2017", "Rudhramadevi", "Performance in a Supporting Role – Male"],
    ],
  },

  {
    name: "CineMAA Awards",
    icon: "🎬",
    wins: 6,
    rows: [
      ["2004", "Gangotri", "Best Male Debut"],
      ["2005", "Arya", "Best Actor – Jury"],
      ["2008", "Desamuduru", "Best Actor – Jury"],
      ["2009", "Parugu", "Best Actor"],
      ["2015", "Race Gurram", "Best Actor"],
      ["2016", "Rudhramadevi", "Best Actor – Jury"],
    ],
  },

  {
    name: "Gaddar Telangana Film Awards",
    icon: "🏆",
    wins: 1,
    rows: [
      ["2025", "Pushpa 2: The Rule", "Best Actor"],
    ],
  },

  {
    name: "Sakshi Excellence Awards",
    icon: "🏆",
    wins: 4,
    rows: [
      ["2017", "Sarrainodu", "Most Popular Actor of the Year – Male"],
      ["2021", "Ala Vaikunthapurramuloo", "Most Popular Actor of the Year – Male"],
      ["2022", "Pushpa: The Rise", "Most Popular Actor of the Year – Male"],
      ["2025", "Pushpa 2: The Rule", "Most Popular Actor of the Year – Male"],
    ],
  },

  {
    name: "Santosham Film Awards",
    icon: "🏆",
    wins: 4,
    rows: [
      ["2004", "Gangotri", "Best Male Debut"],
      ["2005", "Arya", "Best Young Performer"],
      ["2006", "Bunny", "Best Young Performer"],
      ["2021", "Pushpa: The Rise", "Best Actor"],
    ],
  },

  {
    name: "TSR–TV9 National Film Awards",
    icon: "🏆",
    wins: 3,
    rows: [
      ["2015", "Race Gurram", "Best Hero"],
      ["2017", "S/O Satyamurthy", "Best Hero"],
      ["2017", "Rudhramadevi", "Best Outstanding Performance"],
    ],
  },

  {
    name: "Mirchi Music Awards South",
    icon: "🎵",
    wins: 1,
    rows: [
      ["2015", "Race Gurram", "Youth Icon of the Year"],
    ],
  },

  {
    name: "South Scope Lifestyle Awards",
    icon: "🏆",
    wins: 3,
    rows: [
      ["2009", "Parugu", "Best Actor"],
      ["2010", "Arya 2", "Best Stylish Actor"],
      ["2011", "Vedam", "Best Actor"],
    ],
  },

  {
    name: "GAMA Awards",
    icon: "🏆",
    wins: 1,
    rows: [
      ["2025", "Pushpa: The Rise", "Best Actor"],
    ],
  },

  {
    name: "Zee Cine Awards Telugu",
    icon: "🏆",
    wins: 1,
    rows: [
      ["2017", "DJ: Duvvada Jagannadham", "Favourite Actor"],
    ],
  },
];


const totalWins = awardGroups.reduce((sum, group) => sum + group.wins, 0);

const v = (o: Record<string, string | number>) => o as unknown as CSSProperties;

/* posters from the Allu Arjun page (/public/images) */
const POSTER: Record<string, string> = {
  "Gangotri": "movie1a.jpg", "Arya": "movie2.jpg", "Bunny": "movie3.jpg", "Desamuduru": "movie5.jpg", "Parugu": "movie6.jpg", "Arya 2": "movie7.jpg",
  "Vedam": "movie91.jpg", "Race Gurram": "movie13.jpg", "S/O Satyamurthy": "movie14.jpg", "Rudhramadevi": "movie15.jpg", "Sarrainodu": "movie16.jpg",
  "DJ: Duvvada Jagannadham": "movie17.jpg", "Ala Vaikunthapurramuloo": "movie19.jpg", "Pushpa: The Rise": "movie20.jpg", "Pushpa 2: The Rule": "movie21.jpg",
};
const WALL = Object.entries(POSTER);
const HERO: [string, string][] = [
  ["movie20.jpg", "Pushpa: The Rise · National Film Award"], ["movie21.jpg", "Pushpa 2: The Rule · Filmfare Award South"],
  ["movie19.jpg", "Ala Vaikunthapurramuloo · SIIMA"], ["movie13.jpg", "Race Gurram · Filmfare Award South"],
];

/* real SVG icons (no extra package needed) */
const PATHS: Record<string, string[]> = {
  trophy: ["M6 9H4.5a2.5 2.5 0 0 1 0-5H6", "M18 9h1.5a2.5 2.5 0 0 0 0-5H18", "M4 22h16", "M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22", "M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22", "M18 2H6v7a6 6 0 0 0 12 0V2Z"],
  award: ["M18 8a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z", "M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"],
  star: ["M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"],
  medal: ["M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15", "M11 12 5.12 2.2", "m13 12 5.88-9.8", "M8 7h8", "M17 17a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z"],
  clap: ["M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z", "m6.2 5.3 3.1 3.9", "m12.4 3.4 3.1 4", "M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"],
  music: ["M9 18V5l12-2v13", "M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z", "M21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"],
};
const KEY: Record<string, string> = { National: "trophy", Filmfare: "award", SIIMA: "star", Nandi: "medal", IIFA: "star", CineMAA: "clap", Gaddar: "medal", Sakshi: "award", Santosham: "medal", "TSR–TV9": "trophy", Mirchi: "music", South: "star", GAMA: "award", Zee: "clap" };
const Ic = ({ n, size = 22 }: { n: string; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{PATHS[n].map((d, i) => <path key={i} d={d} />)}</svg>
);

const tilt = (e: PE<HTMLElement>) => {
  const el = e.currentTarget, r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
  el.style.setProperty("--rx", ((0.5 - y) * 12).toFixed(1) + "deg"); el.style.setProperty("--ry", ((x - 0.5) * 14).toFixed(1) + "deg");
  el.style.setProperty("--mx", x * 100 + "%"); el.style.setProperty("--my", y * 100 + "%");
};
const untilt = (e: PE<HTMLElement>) => { e.currentTarget.style.setProperty("--rx", "0deg"); e.currentTarget.style.setProperty("--ry", "0deg"); };

function Count({ to }: { to: number }) {
  const r = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = r.current; if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect();
      const t0 = performance.now();
      const tick = (t: number) => { const p = Math.min(1, (t - t0) / 1600); setN(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);
  return <span ref={r}>{n}</span>;
}

export default function AlluArjunAwardsPage() {
  const [active, setActive] = useState(awardGroups[0].name);
  const [scrolled, setScrolled] = useState(false);
  const [hi, setHi] = useState(0);
  const prog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const run = () => {
      raf = 0;
      const h = document.documentElement, m = h.scrollHeight - h.clientHeight;
      prog.current?.style.setProperty("transform", `scaleX(${m > 0 ? h.scrollTop / m : 0})`);
      setScrolled(h.scrollTop > 30);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(run); };
    run(); window.addEventListener("scroll", on, { passive: true });
    return () => { window.removeEventListener("scroll", on); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => { const t = setInterval(() => setHi((h) => (h + 1) % HERO.length), 5200); return () => clearInterval(t); }, []);

  const cur = awardGroups.find((g) => g.name === active) ?? awardGroups[0];
  const curIdx = awardGroups.indexOf(cur);
  const maxWins = Math.max(...awardGroups.map((g) => g.wins));
  const go = (d: number) => setActive(awardGroups[(curIdx + d + awardGroups.length) % awardGroups.length].name);

  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
    document.querySelectorAll(".rv:not(.in)").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <main className="aa-awards">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="lb t" aria-hidden="true" /><div className="lb b" aria-hidden="true" />
      <div className="film-grain" aria-hidden="true" />
      <div className="progress" ref={prog} aria-hidden="true" />
      <header className={"topbar " + (scrolled ? "is-scrolled" : "")}>
        <div className="topbar-inner">
          <Link href="/" className="brand"><span>AA</span><b>WORLD OF RAAKA</b></Link>
          <nav><a href="#record">Record</a><a href="#awards">Awards</a></nav>
          <Link href="/" className="back">← Home</Link>
        </div>
      </header>

      <section className="hero" onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty("--px", String(((e.clientX - r.left) / r.width - 0.5) * 2)); e.currentTarget.style.setProperty("--py", String(((e.clientY - r.top) / r.height - 0.5) * 2)); }}>
        {HERO.map(([s], i) => <div key={s} className={"bd" + (i === hi ? " on" : "")} aria-hidden="true"><Image src={`/images/${s}`} alt="" fill sizes="100vw" priority={i === 0} className="oc" /></div>)}
        <div className="hero-aura" /><div className="hero-lines" aria-hidden="true"><i/><i/><i/></div>
        <span className="streak" aria-hidden="true" />
        <div className="dust" aria-hidden="true">{Array.from({ length: 14 }).map((_, i) => <i key={i} style={v({ "--x": `${(i * 53) % 100}%`, "--d": `${9 + (i % 5) * 2}s`, "--dl": `${-i * 1.3}s` })} />)}</div>
        <div className="deck" aria-hidden="true">
          {HERO.map(([s], i) => <div key={s} className="dc" style={v({ "--o": (i - hi + HERO.length) % HERO.length })}><Image src={`/images/${s}`} alt="" fill sizes="25vw" className="oc" /><span className="sh" /></div>)}
          <div className="seal"><i /><Ic n="trophy" size={26} /></div>
          <p className="deck-cap" key={hi}>{HERO[hi][1]}</p>
        </div>
        <div className="hero-content">
          <p className="eyebrow"><span /> ALLU ARJUN <span /></p>
          <div className="hero-title-wrap"><span className="hero-index">0{hi + 1} / 0{HERO.length}</span><h1>Awards<br/><em>&amp; Achievements</em></h1></div>
          <div className="hero-bottom">
            <p>A career record told through wins, performances and recognition — presented award-body-wise and chronologically.</p>
            <a href="#awards" className="enter">Explore the record <span>↓</span></a>
          </div>
        </div>
      </section>

      <section id="record" className="record">
        <div className="record-head rv">
          <div><p className="kicker">THE RECORD</p><h2>Recognition,<br/><em>frame by frame.</em></h2></div>
          <p className="record-copy">Every award group below retains the supplied career data while giving each body its own place in the archive.</p>
        </div>
        <div className="stats rv">
          <div><strong><Count to={totalWins} /></strong><span>Total wins</span></div>
          <div><strong><Count to={awardGroups.length} /></strong><span>Award bodies</span></div>
          <div><strong>2003</strong><span>Career begins</span></div>
          <div><strong>2026</strong><span>Latest listed year</span></div>
        </div>
      </section>

      <section className="wall" aria-label="Honoured films">
        <p className="kicker wall-k">THE HONOURED FILMS</p>
        <div className="wall-track">
          {[...WALL, ...WALL].map(([t, f], i) => (
            <figure key={i} className="wp" onPointerMove={tilt} onPointerLeave={untilt}>
              <div className="wpi"><Image src={`/images/${f}`} alt={t} fill sizes="200px" className="oc" /><span className="glare" /></div>
              <figcaption>{t}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section id="awards" className="archive">
        <div className="archive-top rv">
          <div><p className="kicker">CAREER ARCHIVE</p><h2>The Winners' <em>Room.</em></h2></div>
          <p className="record-copy">Pick an award body to open every win, year by year.</p>
        </div>

        <div className="room">
          <nav className="room-nav" aria-label="Award bodies">
            {awardGroups.map((g) => (
              <button key={g.name} type="button" className={"rn" + (g.name === cur.name ? " on" : "")} aria-pressed={g.name === cur.name} onClick={() => setActive(g.name)}>
                <span className="rn-ic"><Ic n={KEY[g.name.split(" ")[0]] ?? "trophy"} size={18} /></span>
                <span className="rn-name">{g.name}</span>
                <span className="rn-w">{g.wins}</span>
                <span className="rn-bar"><i style={{ transform: `scaleX(${g.wins / maxWins})` }} /></span>
              </button>
            ))}
          </nav>

          <article className={"panel" + (cur.featured ? " nat" : "")} key={cur.name}>
            <header className="ph">
              <div className="pmed"><i /><Ic n={KEY[cur.name.split(" ")[0]] ?? "trophy"} size={30} /></div>
              <div className="pt"><span>AWARD BODY · {String(curIdx + 1).padStart(2, "0")} / {awardGroups.length}</span><h3>{cur.name}</h3></div>
              <div className="pw"><strong>{cur.wins}</strong><small>{cur.wins === 1 ? "WIN" : "WINS"}</small></div>
            </header>

            <ol className="tl">
              {cur.rows.map(([year, movie, award], i) => (
                <li key={`${year}-${movie}-${award}`} style={v({ "--r": i })}>
                  <span className="ty">{year}</span>
                  <span className="td" aria-hidden="true" />
                  <div className="tc">
                    {POSTER[movie] && <span className="tth"><Image src={`/images/${POSTER[movie]}`} alt="" fill sizes="56px" className="oc" /></span>}
                    <div><b>{movie}</b><p>{award}</p></div>
                  </div>
                </li>
              ))}
            </ol>

            {cur.note && <p className="pnote"><span>✦</span>{cur.note}</p>}
            <div className="pnav">
              <button type="button" onClick={() => go(-1)} aria-label="Previous award body">←</button>
              <button type="button" onClick={() => go(1)} aria-label="Next award body">→</button>
            </div>
          </article>
        </div>
      </section>

      <section className="closing">
        <div className="closing-bg" aria-hidden="true"><Image src="/images/movie21.jpg" alt="" fill sizes="100vw" className="oc" /></div>
        <div className="closing-orbit" /><p className="kicker">THE STORY CONTINUES</p>
        <h2>More chapters.<br/><em>More milestones.</em></h2>
        <Link href="/allu-arjun" className="return-btn">Return to Allu Arjun <span>↗</span></Link>
      </section>

      <footer>
        <div><b>WORLD OF RAAKA</b><span>Allu Arjun — Awards &amp; Achievements</span></div>
        <Link href="/">Back to Home →</Link>
      </footer>
    </main>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;0,6..96,700;1,6..96,400;1,6..96,500&family=Instrument+Sans:wght@400;500;600;700&display=swap');
:root{color-scheme:dark} html{scroll-behavior:smooth} *{box-sizing:border-box}
.aa-awards{--black:#050505;--bone:#eee7dc;--muted:#898178;--gold:#d0aa70;--line:rgba(238,231,220,.12);min-height:100vh;background:var(--black);color:var(--bone);font-family:"Instrument Sans",system-ui,sans-serif;overflow:hidden}
.aa-awards a{color:inherit;text-decoration:none}.film-grain{position:fixed;inset:0;z-index:60;pointer-events:none;opacity:.045;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
.progress{position:fixed;z-index:70;top:0;left:0;width:100%;height:2px;background:linear-gradient(90deg,#7c2437,var(--gold));transform:scaleX(.22);transform-origin:left}
.topbar{position:fixed;z-index:50;top:0;left:0;right:0;border-bottom:1px solid transparent;transition:.4s}.topbar.is-scrolled{background:rgba(5,5,5,.78);backdrop-filter:blur(18px);border-color:var(--line)}
.topbar-inner{max-width:1400px;margin:auto;height:72px;padding:0 4vw;display:flex;align-items:center;justify-content:space-between}
.brand{display:flex;align-items:center;gap:12px;font-size:11px;letter-spacing:.15em}.brand span{width:36px;height:36px;border:1px solid rgba(208,170,112,.65);border-radius:50%;display:grid;place-items:center;font:17px "Bodoni Moda";color:var(--gold);transition:.3s}.brand:hover span{background:var(--gold);color:#000}.brand b{font-weight:500;color:#aaa19a}
.topbar nav{display:flex;gap:34px;font-size:11px;text-transform:uppercase;letter-spacing:.18em;color:#777}.topbar nav a:hover,.back:hover{color:var(--bone)}.back{font-size:11px;text-transform:uppercase;letter-spacing:.16em;color:#888}
.hero{min-height:100svh;position:relative;display:flex;align-items:flex-end;overflow:hidden;background:radial-gradient(circle at 76% 30%,rgba(208,170,112,.12),transparent 28%),radial-gradient(circle at 10% 70%,rgba(124,36,55,.14),transparent 35%),#050505}.hero:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,5,5,.98),rgba(5,5,5,.65) 48%,rgba(5,5,5,.88)),linear-gradient(0deg,#050505,transparent 45%)}.hero:after{content:"AA";position:absolute;right:-2vw;bottom:-9vw;font:italic 700 clamp(18rem,42vw,42rem)/.7 "Bodoni Moda";color:transparent;-webkit-text-stroke:1px rgba(238,231,220,.045);pointer-events:none}
.hero-aura{position:absolute;width:55vw;height:55vw;right:5%;top:13%;border-radius:50%;background:radial-gradient(circle,rgba(208,170,112,.12),transparent 63%);filter:blur(8px);animation:breathe 7s ease-in-out infinite}.hero-lines{position:absolute;inset:14% 5%;pointer-events:none}.hero-lines i{position:absolute;display:block;width:1px;height:72%;background:linear-gradient(transparent,rgba(208,170,112,.28),transparent);transform-origin:top;animation:lineIn 1.8s ease both}.hero-lines i:nth-child(1){left:18%}.hero-lines i:nth-child(2){left:63%;animation-delay:.25s}.hero-lines i:nth-child(3){right:4%;animation-delay:.5s}
.hero-content{position:relative;z-index:2;width:min(1400px,100%);margin:auto;padding:0 4vw 7vw}.eyebrow,.kicker{font-size:10px;letter-spacing:.4em;text-transform:uppercase;color:var(--gold);display:flex;align-items:center;gap:14px}.eyebrow span{width:42px;height:1px;background:var(--gold)}
.hero-title-wrap{position:relative;margin-top:34px}.hero-index{position:absolute;right:4%;top:20%;font-size:10px;letter-spacing:.25em;color:#665f58}.hero h1{margin:0;font:500 clamp(5rem,13.5vw,13rem)/.79 "Bodoni Moda";letter-spacing:-.055em;animation:titleIn 1.25s cubic-bezier(.2,.7,.2,1) both}.hero h1 em{color:transparent;-webkit-text-stroke:1px rgba(238,231,220,.55);font-style:italic}
.hero-bottom{margin-top:44px;display:flex;align-items:flex-end;justify-content:space-between;gap:30px;max-width:850px}.hero-bottom p{max-width:500px;color:#918981;font-size:14px;line-height:1.8}.enter{border-bottom:1px solid rgba(208,170,112,.55);padding:0 0 10px;white-space:nowrap;color:var(--gold)!important;font-size:11px;text-transform:uppercase;letter-spacing:.15em}.enter span{margin-left:18px;transition:.3s}.enter:hover span{transform:translateY(4px);display:inline-block}
.record,.archive{max-width:1400px;margin:auto;padding:10vw 4vw}.record-head,.archive-top{display:grid;grid-template-columns:1.2fr .8fr;gap:8vw;align-items:end}.record h2,.archive h2,.closing h2{margin:18px 0 0;font:500 clamp(3.5rem,7vw,7rem)/.88 "Bodoni Moda";letter-spacing:-.045em}.record h2 em,.archive h2 em,.closing h2 em{color:transparent;-webkit-text-stroke:1px rgba(238,231,220,.45);font-style:italic}.record-copy{color:#817a72;line-height:1.8;max-width:390px;font-size:14px}
.stats{margin-top:7vw;border-top:1px solid var(--line);display:grid;grid-template-columns:repeat(4,1fr)}.stats div{padding:34px 0;border-bottom:1px solid var(--line)}.stats div:not(:last-child){border-right:1px solid var(--line);padding-left:28px}.stats strong{display:block;font:500 clamp(2.8rem,5vw,5.5rem)/1 "Bodoni Moda"}.stats span{display:block;margin-top:12px;color:#6e6861;font-size:9px;text-transform:uppercase;letter-spacing:.22em}
.archive{max-width:none;background:linear-gradient(180deg,#080707,#050505)}.archive-top,.award-grid{max-width:1400px;margin-left:auto;margin-right:auto}.archive-top{margin-bottom:55px}.filters{display:flex;gap:8px;overflow:auto;padding-bottom:5px;scrollbar-width:none;justify-content:flex-end}.filters::-webkit-scrollbar{display:none}.filters button{flex:0 0 auto;border:1px solid var(--line);background:transparent;color:#777;padding:9px 13px;border-radius:99px;font:10px "Instrument Sans";letter-spacing:.08em;cursor:pointer;transition:.3s}.filters button:hover,.filters button.active{background:var(--bone);border-color:var(--bone);color:#050505}
.award-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--line)}.award-card{background:#080808;position:relative;overflow:hidden;transition:.5s}.award-card.featured{grid-column:1/-1;background:radial-gradient(circle at 90% 0,rgba(208,170,112,.09),transparent 32%),#0a0908}.award-card:before{content:"";position:absolute;left:0;top:0;width:2px;height:0;background:linear-gradient(var(--gold),transparent);transition:height .7s}.award-card:hover:before{height:100%}
.card-top{display:grid;grid-template-columns:48px 48px 1fr auto;gap:16px;align-items:center;padding:30px;border-bottom:1px solid var(--line)}.number{font:500 11px "Bodoni Moda";color:#57514b}.medal{width:46px;height:46px;border:1px solid var(--line);border-radius:50%;display:grid;place-items:center;font-size:18px;background:rgba(255,255,255,.025);transition:.5s}.award-card:hover .medal{transform:rotate(10deg) scale(1.08);border-color:rgba(208,170,112,.5)}.card-title span{font-size:8px;letter-spacing:.25em;color:#5f5953}.card-title h3{font:500 clamp(1.4rem,2.4vw,2.25rem)/1.1 "Bodoni Moda";margin-top:5px}.wins{text-align:right}.wins strong{display:block;font:500 2.2rem/1 "Bodoni Moda";color:var(--gold)}.wins small{font-size:8px;letter-spacing:.2em;color:#625c55}
.award-table{width:100%}.table-head,.award-row{display:grid;grid-template-columns:90px 1fr 1.25fr 30px;gap:15px;align-items:start}.table-head{padding:13px 30px;border-bottom:1px solid rgba(238,231,220,.07);font-size:8px;letter-spacing:.2em;color:#514c47}.award-row{padding:17px 30px;border-bottom:1px solid rgba(238,231,220,.065);transition:.3s}.award-row:hover{background:rgba(255,255,255,.025);padding-left:38px}.award-row .year{color:#746c63;font-size:12px;font-variant-numeric:tabular-nums}.award-row .movie{font-size:13px;font-weight:600;color:#d6cec2}.award-row .award{font-size:12px;line-height:1.55;color:#827a71}.award-row i{font-style:normal;font-size:8px;color:#4f4944;text-align:right}
.feature-note{display:flex;gap:18px;padding:24px 30px;border-top:1px solid var(--line);color:#827a71;font-size:12px;line-height:1.8}.feature-note span{color:var(--gold)}
.closing{position:relative;overflow:hidden;text-align:center;padding:12vw 4vw 13vw;background:radial-gradient(circle at 50% 35%,rgba(208,170,112,.09),transparent 32%),#050505;border-top:1px solid var(--line)}.closing .kicker{justify-content:center}.closing h2{position:relative;z-index:2}.return-btn{position:relative;z-index:2;display:inline-flex;margin-top:45px;border:1px solid rgba(208,170,112,.45);padding:14px 22px;border-radius:99px;color:var(--gold)!important;font-size:10px;text-transform:uppercase;letter-spacing:.16em;transition:.35s}.return-btn:hover{background:var(--gold);color:#050505!important}.return-btn span{margin-left:25px}.closing-orbit{position:absolute;width:42vw;height:42vw;max-width:600px;max-height:600px;left:50%;top:50%;transform:translate(-50%,-50%);border:1px solid rgba(208,170,112,.08);border-radius:50%;animation:spin 30s linear infinite}.closing-orbit:before,.closing-orbit:after{content:"";position:absolute;border-radius:50%;background:var(--gold)}.closing-orbit:before{width:5px;height:5px;top:8%;left:20%;box-shadow:0 0 30px 8px rgba(208,170,112,.25)}.closing-orbit:after{width:3px;height:3px;bottom:12%;right:17%}
footer{border-top:1px solid var(--line);padding:28px 4vw;display:flex;justify-content:space-between;align-items:center;gap:20px;max-width:1400px;margin:auto;color:#777;font-size:11px}footer div{display:flex;gap:18px;align-items:center}footer b{letter-spacing:.16em;color:#aaa}footer span{color:#555}footer a{color:#777;transition:.3s}footer a:hover{color:var(--gold)}
@keyframes titleIn{from{opacity:0;transform:translateY(50px);filter:blur(12px)}to{opacity:1;transform:none;filter:none}}@keyframes breathe{0%,100%{transform:scale(.95);opacity:.7}50%{transform:scale(1.05);opacity:1}}@keyframes lineIn{from{transform:scaleY(0);opacity:0}to{transform:scaleY(1);opacity:1}}@keyframes spin{to{transform:translate(-50%,-50%) rotate(360deg)}}
@media(max-width:900px){.topbar nav{display:none}.record-head,.archive-top{grid-template-columns:1fr;gap:30px}.filters{justify-content:flex-start}.award-grid{grid-template-columns:1fr}.award-card.featured{grid-column:auto}.hero-content{padding-bottom:11vw}}
@media(max-width:640px){.topbar-inner{height:62px;padding:0 20px}.brand b{display:none}.back{font-size:9px}.hero-content{padding:0 20px 58px}.hero h1{font-size:clamp(4.3rem,21vw,7rem)}.hero-index{display:none}.hero-bottom{display:block}.hero-bottom p{font-size:12px;margin-bottom:25px}.record,.archive{padding:75px 20px}.record h2,.archive h2,.closing h2{font-size:clamp(3rem,15vw,5rem)}.stats{grid-template-columns:1fr 1fr}.stats div:not(:last-child){padding-left:15px}.stats div{padding:25px 0}.stats strong{font-size:2.7rem}.award-grid{margin:0 -20px}.card-top{grid-template-columns:34px 42px 1fr auto;padding:22px 18px;gap:10px}.medal{width:38px;height:38px;font-size:15px}.card-title h3{font-size:1.3rem}.wins strong{font-size:1.8rem}.table-head,.award-row{grid-template-columns:58px 1fr 1.2fr 20px;gap:9px}.table-head,.award-row{padding-left:18px;padding-right:18px}.award-row:hover{padding-left:22px}.award-row .movie,.award-row .award{font-size:11px}.feature-note{padding:20px 18px}footer{padding:25px 20px;align-items:flex-start;flex-direction:column}footer div{align-items:flex-start;flex-direction:column;gap:5px}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.01ms!important}}

/* ---------- cinematic layer (kept light: transform + opacity only) ---------- */
.aa-awards{--gold2:#f3dca8}.oc{object-fit:cover}
.lb{position:fixed;left:0;right:0;height:50vh;background:#000;z-index:95;pointer-events:none;animation:lbOpen 1.6s cubic-bezier(.77,0,.18,1) .3s forwards;will-change:transform}.lb.t{top:0;transform-origin:top}.lb.b{bottom:0;transform-origin:bottom}@keyframes lbOpen{to{transform:scaleY(0)}}
.progress{will-change:transform}
.hero{--px:0;--py:0;perspective:1400px}.hero:before{z-index:1}.hero-aura,.hero-lines{z-index:1}.hero-aura{filter:none}
.bd{position:absolute;inset:0;z-index:0;opacity:0;transition:opacity 1.6s ease}.bd.on{opacity:1}.bd .oc{filter:blur(22px) brightness(.55) saturate(1.25);transform:scale(1.25)}
.streak{position:absolute;z-index:1;left:-10%;right:-10%;top:44%;height:2px;background:linear-gradient(90deg,transparent,rgba(243,220,168,.95),transparent);box-shadow:0 0 40px 8px rgba(208,170,112,.3);transform:scaleX(0);animation:streak 2.4s cubic-bezier(.2,.7,.2,1) .9s forwards}@keyframes streak{40%{transform:scaleX(1);opacity:1}100%{transform:scaleX(1.2);opacity:0}}
.dust{position:absolute;inset:0;z-index:1;pointer-events:none}.dust i{position:absolute;bottom:-10px;left:var(--x);width:3px;height:3px;border-radius:50%;background:var(--gold2);opacity:0;animation:dust var(--d) linear var(--dl) infinite}@keyframes dust{10%{opacity:.8}to{transform:translateY(-100vh) translateX(30px);opacity:0}}
.deck{position:absolute;z-index:2;right:7vw;top:50%;width:min(23vw,300px);aspect-ratio:2/3;margin-top:calc(min(23vw,300px)*-.75);transform-style:preserve-3d;transform:rotateY(calc(var(--px)*10deg)) rotateX(calc(var(--py)*-6deg));transition:transform .6s ease-out}
.dc{position:absolute;inset:0;z-index:calc(10 - var(--o));border-radius:4px;overflow:hidden;border:1px solid rgba(243,220,168,.28);box-shadow:0 30px 70px rgba(0,0,0,.6);opacity:calc(1 - var(--o)*.28);transform:translate3d(calc(var(--o)*50px),calc(var(--o)*-16px),calc(var(--o)*-110px)) rotateY(calc(-10deg + var(--o)*-2deg));transition:transform 1.2s cubic-bezier(.2,.7,.2,1),opacity 1.2s}
.sh{position:absolute;inset:0;background:linear-gradient(115deg,transparent 35%,rgba(255,255,255,.2) 48%,transparent 60%);transform:translateX(-120%);animation:shn 6s ease-in-out infinite}@keyframes shn{0%,55%{transform:translateX(-120%)}85%,100%{transform:translateX(120%)}}
.seal{position:absolute;z-index:12;left:-2.2rem;bottom:2.5rem;display:grid;place-items:center;width:4.6rem;height:4.6rem;border-radius:50%;color:var(--gold2);background:radial-gradient(circle at 35% 30%,rgba(243,220,168,.3),rgba(5,5,5,.85));border:1px solid rgba(208,170,112,.65);box-shadow:0 0 40px rgba(208,170,112,.3);animation:fy 6s ease-in-out infinite}
.seal i,.pmed i{position:absolute;inset:-6px;border-radius:50%;border:1px dashed rgba(208,170,112,.45);animation:rot 18s linear infinite}
.deck-cap{position:absolute;z-index:12;left:0;right:0;bottom:-3rem;font:italic 15px "Bodoni Moda",serif;color:var(--gold2);animation:capIn .9s cubic-bezier(.2,.7,.2,1)}@keyframes capIn{from{opacity:0;transform:translateY(12px)}}
@keyframes fy{50%{transform:translateY(-10px)}}@keyframes rot{to{transform:rotate(360deg)}}
.hero-content{pointer-events:none}.hero-content a{pointer-events:auto}
@media(max-width:900px){.deck{display:none}}

.rv{opacity:0;transform:translateY(30px);transition:opacity .8s ease,transform .8s cubic-bezier(.2,.7,.2,1)}.rv.in{opacity:1;transform:none}
.stats strong{background:linear-gradient(180deg,#fff,var(--gold2) 60%,var(--gold));-webkit-background-clip:text;background-clip:text;color:transparent}

/* honoured films marquee */
.wall{padding:0 0 9vw;overflow:hidden;border-top:1px solid var(--line)}.wall-k{justify-content:center;margin:5vw 0 2.4rem}
.wall-track{display:flex;width:max-content;gap:1.4rem;padding:1rem 0;animation:wallMq 100s linear infinite;will-change:transform}.wall:hover .wall-track{animation-play-state:paused}@keyframes wallMq{to{transform:translateX(-50%)}}
.wp{width:clamp(130px,15vw,200px);flex:none;perspective:900px;margin:0}
.wpi{position:relative;aspect-ratio:2/3;overflow:hidden;border-radius:4px;border:1px solid rgba(238,231,220,.09);transform:rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));transition:transform .35s cubic-bezier(.2,.7,.2,1),border-color .4s}
.wpi:after{content:"";position:absolute;inset:0;background:rgba(5,5,5,.38);transition:opacity .4s;pointer-events:none}.wp:hover .wpi:after{opacity:0}.wp:hover .wpi{border-color:rgba(208,170,112,.55)}
.wp figcaption{margin-top:.8rem;font:italic 13px "Bodoni Moda",serif;color:#8a8279;text-align:center;transition:color .3s}.wp:hover figcaption{color:var(--gold2)}
.glare{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .4s;background:radial-gradient(220px circle at var(--mx,50%) var(--my,50%),rgba(255,235,190,.3),transparent 65%)}.wp:hover .glare{opacity:1}

/* ---------- The Winners' Room: a ledger, no background images ---------- */
.archive{background:#060505}
.room{max-width:1400px;margin:auto;display:grid;gap:2.5rem;align-items:start}@media(min-width:1000px){.room{grid-template-columns:minmax(280px,.8fr) 2fr;gap:4rem}}
.room-nav{display:flex;gap:.5rem;overflow-x:auto;scrollbar-width:none;scroll-snap-type:x proximity;padding-bottom:6px}.room-nav::-webkit-scrollbar{display:none}
@media(min-width:1000px){.room-nav{flex-direction:column;gap:0;overflow:visible;position:sticky;top:96px;border-top:1px solid var(--line);padding:0}}
.rn{position:relative;flex:none;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:.9rem;padding:.8rem 1rem;border:1px solid var(--line);border-radius:99px;color:#7d756c;text-align:left;font:12px "Instrument Sans",sans-serif;cursor:pointer;background:transparent;scroll-snap-align:start;transition:color .3s,background .3s,border-color .3s}
.rn-name{white-space:nowrap}.rn-ic{display:grid;color:#5d564f;transition:color .3s}.rn-w{font:500 1.15rem "Bodoni Moda",serif;color:#5d564f;transition:color .3s}.rn-bar{display:none}
@media(min-width:1000px){.rn{border:0;border-bottom:1px solid var(--line);border-radius:0;padding:1.05rem .3rem;font-size:13px}.rn-bar{display:block;grid-column:1/-1;height:2px;margin-top:.1rem;background:rgba(238,231,220,.06);overflow:hidden}.rn-bar i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#7c2437,var(--gold));transform-origin:left;transition:opacity .3s;opacity:.35}}
.rn:hover{color:var(--bone)}.rn:hover .rn-ic,.rn:hover .rn-w{color:var(--gold)}
.rn.on{color:var(--bone);background:rgba(208,170,112,.1);border-color:rgba(208,170,112,.5)}.rn.on .rn-ic,.rn.on .rn-w{color:var(--gold)}.rn.on .rn-bar i{opacity:1}
@media(min-width:1000px){.rn.on{background:linear-gradient(90deg,rgba(208,170,112,.12),transparent);border-color:var(--line);padding-left:.9rem}.rn{transition:color .3s,background .3s,padding .3s}}

.panel{position:relative;border:1px solid var(--line);background:#090807;animation:panelIn .55s cubic-bezier(.2,.7,.2,1)}@keyframes panelIn{from{opacity:0;transform:translateY(18px)}}
.panel.nat{background:radial-gradient(circle at 92% 0,rgba(208,170,112,.14),transparent 38%),#0a0908;border-color:rgba(208,170,112,.3)}
.ph{display:grid;grid-template-columns:auto 1fr auto;gap:1.4rem;align-items:center;padding:clamp(1.3rem,3vw,2.2rem);border-bottom:1px solid var(--line)}
.pmed{position:relative;display:grid;place-items:center;width:4.4rem;height:4.4rem;border-radius:50%;border:1px solid rgba(208,170,112,.5);color:var(--gold2);background:radial-gradient(circle at 35% 30%,rgba(243,220,168,.2),transparent 70%)}
.pt span{font-size:9px;letter-spacing:.24em;color:#6a635b}.pt h3{margin:.4rem 0 0;font:500 clamp(1.8rem,3.4vw,3.2rem)/1.05 "Bodoni Moda",serif;letter-spacing:-.02em}
.pw{text-align:right}.pw strong{display:block;font:500 clamp(3rem,6vw,5.5rem)/.9 "Bodoni Moda",serif;background:linear-gradient(100deg,var(--gold),#fff1cf,var(--gold));-webkit-background-clip:text;background-clip:text;color:transparent}.pw small{font-size:9px;letter-spacing:.22em;color:#625c55}
.tl{list-style:none;margin:0;padding:clamp(1.2rem,3vw,2.2rem) clamp(1.3rem,3vw,2.2rem);position:relative}
.tl li{display:grid;grid-template-columns:4.2rem 1.2rem 1fr;gap:1rem;align-items:center;padding:.9rem 0;animation:rowIn .6s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(var(--r)*60ms + 120ms)}@keyframes rowIn{from{opacity:0;transform:translateX(-14px)}}
.tl:before{content:"";position:absolute;left:calc(clamp(1.3rem,3vw,2.2rem) + 4.2rem + 1rem + .6rem);top:1.6rem;bottom:1.6rem;width:1px;background:linear-gradient(transparent,var(--line) 10%,var(--line) 90%,transparent)}
.ty{font:500 1.2rem "Bodoni Moda",serif;color:#8a8279;font-variant-numeric:tabular-nums;text-align:right}.td{position:relative;z-index:1;width:9px;height:9px;margin:auto;border-radius:50%;background:#090807;border:1px solid var(--gold);transition:background .3s,transform .3s}
.tl li:hover .td{background:var(--gold);transform:scale(1.5)}.tl li:hover .ty{color:var(--gold)}
.tc{display:flex;align-items:center;gap:1rem;min-width:0;padding:.35rem .6rem .35rem 0;transition:transform .35s cubic-bezier(.2,.7,.2,1)}.tl li:hover .tc{transform:translateX(6px)}
.tth{position:relative;flex:none;width:34px;height:51px;border-radius:2px;overflow:hidden;border:1px solid rgba(238,231,220,.1)}
.tc b{display:block;font-size:14px;font-weight:600;color:#d9d1c4}.tc p{margin:.25rem 0 0;font-size:12px;line-height:1.5;color:#827a71}
.pnote{display:flex;gap:1rem;margin:0;padding:1.4rem clamp(1.3rem,3vw,2.2rem);border-top:1px solid var(--line);color:#827a71;font-size:12px;line-height:1.8}.pnote span{color:var(--gold)}
.pnav{display:flex;justify-content:flex-end;gap:.6rem;padding:0 clamp(1.3rem,3vw,2.2rem) 1.6rem}.pnav button{display:grid;place-items:center;width:2.8rem;height:2.8rem;border-radius:50%;border:1px solid var(--line);background:transparent;color:var(--bone);font-size:1rem;cursor:pointer;transition:background .3s,color .3s,border-color .3s}.pnav button:hover{background:var(--gold);color:#050505;border-color:var(--gold)}
@media(max-width:640px){.ph{grid-template-columns:auto 1fr;gap:1rem}.pw{grid-column:1/-1;text-align:left;display:flex;align-items:baseline;gap:.6rem}.pmed{width:3.4rem;height:3.4rem}.tl li{grid-template-columns:3rem 1rem 1fr;gap:.6rem}.tl:before{left:calc(clamp(1.3rem,3vw,2.2rem) + 3rem + .6rem + .5rem)}.tth{width:28px;height:42px}}

.closing-bg{position:absolute;inset:0;opacity:.1}.closing-bg .oc{filter:blur(18px);transform:scale(1.2)}.closing-bg:after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,transparent,#050505 75%)}
@media(max-width:640px){.wall-k{margin-top:14vw}}
@media(prefers-reduced-motion:reduce){.lb,.streak{display:none}.sh,.dust i,.wall-track,.seal,.seal i,.pmed i{animation:none!important}.rv{opacity:1!important;transform:none!important;transition:none!important}.dc,.deck,.wpi,.panel,.tl li{transition:none!important;animation:none!important}}
`;
