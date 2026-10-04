"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

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

export default function AlluArjunAwardsPage() {
  const [active, setActive] = useState("All");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 30);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const groups = useMemo(() => active === "All" ? awardGroups : awardGroups.filter((g) => g.name === active), [active]);

  return (
    <main className="aa-awards">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="film-grain" aria-hidden="true" />
      <div className="progress" aria-hidden="true" />
      <header className={"topbar " + (scrolled ? "is-scrolled" : "")}>
        <div className="topbar-inner">
          <Link href="/" className="brand"><span>AA</span><b>WORLD OF RAAKA</b></Link>
          <nav><a href="#record">Record</a><a href="#awards">Awards</a></nav>
          <Link href="/" className="back">← Home</Link>
        </div>
      </header>

      <section className="hero">
        <div className="hero-aura" /><div className="hero-lines" aria-hidden="true"><i/><i/><i/></div>
        <div className="hero-content">
          <p className="eyebrow"><span /> ALLU ARJUN <span /></p>
          <div className="hero-title-wrap"><span className="hero-index">01 / 04</span><h1>Awards<br/><em>&amp; Achievements</em></h1></div>
          <div className="hero-bottom">
            <p>A career record told through wins, performances and recognition — presented award-body-wise and chronologically.</p>
            <a href="#awards" className="enter">Explore the record <span>↓</span></a>
          </div>
        </div>
      </section>

      <section id="record" className="record">
        <div className="record-head">
          <div><p className="kicker">THE RECORD</p><h2>Recognition,<br/><em>frame by frame.</em></h2></div>
          <p className="record-copy">Every award group below retains the supplied career data while giving each body its own place in the archive.</p>
        </div>
        <div className="stats">
          <div><strong>{totalWins}</strong><span>Total wins</span></div>
          <div><strong>{awardGroups.length}</strong><span>Award bodies</span></div>
          <div><strong>2003</strong><span>Career begins</span></div>
          <div><strong>2026</strong><span>Latest listed year</span></div>
        </div>
      </section>

      <section id="awards" className="archive">
        <div className="archive-top">
          <div><p className="kicker">CAREER ARCHIVE</p><h2>The Winners' <em>Room.</em></h2></div>
          <div className="filters">
            <button className={active === "All" ? "active" : ""} onClick={() => setActive("All")}>All</button>
            {awardGroups.map((g) => <button key={g.name} className={active === g.name ? "active" : ""} onClick={() => setActive(g.name)}>{g.name}</button>)}
          </div>
        </div>

        <div className="award-grid">
          {groups.map((group) => (
            <article key={group.name} className={"award-card " + (group.featured ? "featured" : "")}>
              <div className="card-top">
                <div className="number">{String(awardGroups.indexOf(group) + 1).padStart(2, "0")}</div>
                <div className="medal">{group.icon}</div>
                <div className="card-title"><span>AWARD BODY</span><h3>{group.name}</h3></div>
                <div className="wins"><strong>{group.wins}</strong><small>{group.wins === 1 ? "WIN" : "WINS"}</small></div>
              </div>
              <div className="award-table">
                <div className="table-head"><span>YEAR</span><span>FILM</span><span>RECOGNITION</span><span /></div>
                {group.rows.map(([year, movie, award], i) => (
                  <div className="award-row" key={`${year}-${movie}-${award}`}>
                    <span className="year">{year}</span><span className="movie">{movie}</span><span className="award">{award}</span><i>{String(i + 1).padStart(2, "0")}</i>
                  </div>
                ))}
              </div>
              {group.note && <div className="feature-note"><span>✦</span><p>{group.note}</p></div>}
            </article>
          ))}
        </div>
      </section>

      <section className="closing">
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
`;