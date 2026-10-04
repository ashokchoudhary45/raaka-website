"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as RPE } from "react";
import Image from "next/image";

const cssVars = (o: Record<string, string | number>) => o as unknown as CSSProperties;

/* pointer handler: feeds tilt + spotlight CSS vars on any card */
const pt = (e: RPE<HTMLElement>) => {
  const el = e.currentTarget, r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
  el.style.setProperty("--rx", ((0.5 - y) * 10).toFixed(2) + "deg");
  el.style.setProperty("--ry", ((x - 0.5) * 12).toFixed(2) + "deg");
  el.style.setProperty("--mx", x * 100 + "%");
  el.style.setProperty("--my", y * 100 + "%");
};
const unpt = (e: RPE<HTMLElement>) => {
  e.currentTarget.style.setProperty("--rx", "0deg");
  e.currentTarget.style.setProperty("--ry", "0deg");
};

const NAV: [string, string][] = [["home", "Home"], ["about", "About"], ["filmography", "Filmography"], ["awards", "Awards"], ["birthday", "Birthday"], ["social", "Connect"]];

const MOVIES: [string, string, string][] = [
  ["2003", "Gangotri", "movie1a.jpg"], ["2004", "Arya", "movie2.jpg"], ["2005", "Bunny", "movie3.jpg"], ["2006", "Happy", "movie41.jpg"],
  ["2007", "Desamuduru", "movie5.jpg"], ["2008", "Parugu", "movie6.jpg"], ["2009", "Arya 2", "movie7.jpg"], ["2010", "Varudu", "movie8.jpg"],
  ["2010", "Vedam", "movie91.jpg"], ["2011", "Badrinath", "movie10.jpg"], ["2012", "Julayi", "movie111.jpg"], ["2013", "Iddarammayilatho", "movie12.jpg"],
  ["2014", "Race Gurram", "movie13.jpg"], ["2015", "S/O Satyamurthy", "movie14.jpg"], ["2015", "Rudhramadevi", "movie15.jpg"], ["2016", "Sarrainodu", "movie16.jpg"],
  ["2017", "Duvvada Jagannadham", "movie17.jpg"], ["2018", "Naa Peru Surya, Naa Illu India", "movie18a.jpg"], ["2020", "Ala Vaikunthapurramuloo", "movie19.jpg"],
  ["2021", "Pushpa: The Rise", "movie20.jpg"], ["2024", "Pushpa 2: The Rule", "movie21.jpg"], ["Coming Soon", "Raaka", "movie22.jpg"], ["Coming Soon", "AA23", "movie23.jpg"],
];
const CAMEOS: [string, string, string][] = [["2007", "Shankar Dada Zindabad", "cameo1.jpg"], ["2014", "Yevadu", "cameo3.jpg"]];
const CHILD: [string, string][] = [["1985", "Vijetha"], ["1986", "Swathi Muthyam"], ["2001", "Daddy"]];
const FACTS: [string, string][] = [["Profession", "Actor & Performer"], ["Industry", "Indian Cinema"], ["Debut", "Gangotri · 2003"], ["Known for", "Film · Dance · Style"]];

const AWARDS: [string, string[]][] = [
  ["Gangotri", ["CineMAA Award – Best Male Debut", "Nandi Award – Special Jury Award", "Santosham Film Award – Best Male Debut"]],
  ["Arya", ["CineMAA Award – Best Actor (Jury)", "Nandi Award – Special Jury Award", "Santosham Film Award – Best Young Performer"]],
  ["Bunny", ["Santosham Film Award – Best Young Performer"]],
  ["Desamuduru", ["CineMAA Award – Best Actor (Jury)"]],
  ["Parugu", ["Filmfare Award South – Best Actor (Telugu)", "CineMAA Award – Best Actor", "Nandi Award – Special Jury Award", "South Scope Lifestyle Award – Best Actor"]],
  ["Arya 2", ["South Scope Lifestyle Award – Best Stylish Actor"]],
  ["Vedam", ["Filmfare Award South – Best Actor (Telugu)", "Nandi Award – Special Jury Award", "South Scope Lifestyle Award – Best Actor"]],
  ["Race Gurram", ["Filmfare Award South – Best Actor (Telugu)", "CineMAA Award – Best Actor", "Mirchi Music Award South – Youth Icon of the Year", "TSR–TV9 National Film Award – Best Hero", "SIIMA – Stylish Youth Icon of South Indian Cinema (Male)"]],
  ["Rudhramadevi", ["Filmfare Award South – Best Supporting Actor (Telugu)", "CineMAA Award – Best Actor (Jury)", "Nandi Award – Best Character Actor", "IIFA Utsavam – Performance in a Supporting Role (Male)", "SIIMA – Best Actor (Critics – Telugu)", "TSR–TV9 National Film Award – Best Outstanding Performance"]],
  ["S/O Satyamurthy", ["TSR–TV9 National Film Award – Best Hero"]],
  ["Sarrainodu", ["Filmfare Critics Award South – Best Actor (Telugu)", "Sakshi Excellence Award – Most Popular Actor of the Year (Male)"]],
  ["DJ: Duvvada Jagannadham", ["Zee Cine Awards Telugu – Favourite Actor"]],
  ["Ala Vaikunthapurramuloo", ["Sakshi Excellence Award – Most Popular Actor of the Year (Male)", "SIIMA – Best Actor (Telugu)"]],
  ["Pushpa: The Rise", ["National Film Award – Best Actor", "Filmfare Award South – Best Actor (Telugu)", "SIIMA – Best Actor (Telugu)", "Santosham Film Award – Best Actor", "GAMA Award – Best Actor", "Sakshi Excellence Award – Most Popular Actor of the Year (Male)"]],
  ["Pushpa 2: The Rule", ["Filmfare Award South – Best Actor (Telugu)", "SIIMA – Best Actor (Telugu)", "Gaddar Telangana Film Award – Best Actor", "Sakshi Excellence Award – Most Popular Actor of the Year (Male)"]],
];

const LATEST: [string, string, string][] = [["2024", "Pushpa 2: The Rule", "movie21.jpg"], ["2021", "Pushpa: The Rise", "movie20.jpg"], ["2020", "Ala Vaikunthapurramuloo", "movie19.jpg"], ["2016", "Sarrainodu", "movie16.jpg"]];
const SOCIAL: [string, string, string][] = [["Instagram", "Follow", "https://www.instagram.com/alluarjunonline/"], ["Facebook", "Follow", "https://www.facebook.com/AlluArjun"], ["X", "Follow", "https://x.com/alluarjun"], ["YouTube", "Watch", "https://www.youtube.com/@alluarjun"]];

const fmt = (n: number) => String(n).padStart(2, "0");
const nextBday = (now: Date) => {
  const d = new Date(`${now.getFullYear()}-04-08T00:00:00+05:30`);
  return d > now ? d : new Date(`${now.getFullYear() + 1}-04-08T00:00:00+05:30`);
};

function Head({ k, lines, text }: { k: string; lines: string[]; text?: string }) {
  return (
    <div className="head">
      <p className="kk" data-r>{k}</p>
      <h2 className="h2">
        {lines.map((l, i) => (
          <span key={i} className={"ln" + (i > 0 ? " dim" : "")} data-r><span style={cssVars({ "--l": i })}>{l}</span></span>
        ))}
      </h2>
      {text && <p className="lead" data-r>{text}</p>}
    </div>
  );
}

function Poster({ src, title, chip, sub, i, soon }: { src: string; title: string; chip: string; sub?: string; i: number; soon?: boolean }) {
  return (
    <figure className={"poster" + (soon ? " soon" : "")} data-r style={cssVars({ "--i": i % 4 })} onPointerMove={pt} onPointerLeave={unpt}>
      <div className="pc">
        <Image src={`/images/${src}`} alt={title} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
        <span className="chip">{chip}</span><span className="poster-sheen" aria-hidden="true" /><span className="poster-no">{String(i + 1).padStart(2, "0")}</span>
      </div>
      <figcaption className="cap">{sub && <small>{sub}</small>}<b>{title}</b></figcaption>
    </figure>
  );
}

function CountUp({ to }: { to: number }) {
  const r = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = r.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / 1600);
        setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);
  return <span ref={r}>{n}</span>;
}

const Word = ({ w, cls, o = 0 }: { w: string; cls: string; o?: number }) => (
  <span className="block">
    {w.split("").map((c, i) => (
      <span key={i} aria-hidden="true" className={"letter " + cls} style={cssVars({ "--i": i + o })}>{c}</span>
    ))}
  </span>
);

export default function AlluArjunPage() {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  const [sel, setSel] = useState(MOVIES.findIndex((m) => m[1] === "Pushpa 2: The Rule"));
  const heroRef = useRef<HTMLElement>(null);
  const progRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const diff = Math.max(0, nextBday(now).getTime() - now.getTime());
      setTime({ days: Math.floor(diff / 864e5), hours: Math.floor((diff / 36e5) % 24), minutes: Math.floor((diff / 6e4) % 60), seconds: Math.floor((diff / 1e3) % 60) });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const on = () => {
      const h = document.documentElement, m = h.scrollHeight - h.clientHeight;
      progRef.current?.style.setProperty("transform", "scaleX(" + (m > 0 ? h.scrollTop / m : 0) + ")");
      heroRef.current?.style.setProperty("--sy", Math.min(h.scrollTop, 900) + "px");
      setScrolled(h.scrollTop > 40);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    document.querySelectorAll("[data-r]").forEach((el) => io.observe(el));
    const so = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("section[id]").forEach((el) => so.observe(el));
    return () => { window.removeEventListener("scroll", on); io.disconnect(); so.disconnect(); };
  }, []);

  const navLinks = (cls: string) => NAV.map(([id, l]) => (
    <a key={id} href={"#" + id} className={"nl " + cls} aria-current={active === id ? "true" : undefined}>{l}</a>
  ));
  const m = MOVIES[sel];
  const order = MOVIES.map((_, i) => i).reverse();

  return (
    <main className="allu-site relative min-h-screen overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="lb lb-top" aria-hidden="true" />
      <div className="lb lb-bot" aria-hidden="true" />
      <div className="progress" ref={progRef} aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      <div className="relative z-10">
        <header className={"nav fixed inset-x-0 top-0 z-50 px-4 md:px-8" + (scrolled ? " s" : "")}>
          <div className="mx-auto max-w-7xl">
            <div className="flex h-16 items-center justify-between">
              <a href="#home" className="group flex items-center gap-3"><span className="logo fd">AA</span><span className="hidden text-sm sm:block" style={{ color: "var(--smoke)" }}>Allu Arjun</span></a>
              <nav className="hidden items-center gap-8 lg:flex">{navLinks("")}</nav>
              <a href="#contact" className="btn btn-g !px-5 !py-2.5 !text-sm">Contact</a>
            </div>
            <nav className="no-sb flex gap-6 overflow-x-auto pb-3 lg:hidden">{navLinks("shrink-0")}</nav>
          </div>
        </header>

        {/* HERO */}
        <section id="home" ref={heroRef} className="relative min-h-screen w-full overflow-hidden">
          <div className="hero-bg absolute inset-0">
            <Image src="/images/actor1b.jpg" alt="Allu Arjun" fill priority sizes="100vw" className="hero-img object-cover object-center" />
          </div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg,rgba(6,5,6,.92),rgba(6,5,6,.3) 55%,rgba(6,5,6,.1)),linear-gradient(0deg,#060506,rgba(6,5,6,.15) 55%)" }} />
          <div className="leak" aria-hidden="true" /><div className="hero-vignette" aria-hidden="true" /><div className="hero-orbit hero-orbit-a" aria-hidden="true" /><div className="hero-orbit hero-orbit-b" aria-hidden="true" />
          <p className="hero-side" aria-hidden="true">National Film Award · Best Actor · 2023</p><div className="hero-meta" aria-hidden="true"><span>01</span><i></i><span>THE ICON STAR</span></div>
          <div className="relative z-10 flex min-h-screen items-end">
            <div className="mx-auto w-full max-w-7xl px-6 pb-14 md:px-10 md:pb-20">
              <p className="rise mb-6 flex items-center gap-4 fd" style={cssVars({ "--d": "0s", color: "var(--brass)", fontStyle: "italic", fontSize: "1.25rem" })}>
                <span className="h-px w-12" style={{ background: "var(--brass)" }} />The Icon Star
              </p>
              <h1 className="hero-title fd" aria-label="Allu Arjun">
                <Word w="Allu" cls="l-ivory" />
                <span className="block hero-l2"><Word w="Arjun" cls="l-gold" o={4} /></span>
              </h1>
              <div className="rise mt-9 flex flex-col gap-3 sm:flex-row md:gap-4" style={cssVars({ "--d": "1.3s" })}>
                <a href="#filmography" className="btn btn-s">Enter the filmography</a>
                <a href="/allu-arjun/awards" className="btn btn-g">Awards</a>
                <a href="#birthday" className="btn btn-o">Birthday countdown</a>
              </div>
            </div>
          </div>
          <div className="scue" aria-hidden="true"><span>Scroll</span><i /></div>
        </section>

        <div className="mq" aria-hidden="true">
          <div className="mq-t fd">{[...MOVIES, ...MOVIES].map(([, t], i) => (<span key={i}>{t}<em>◆</em></span>))}</div>
        </div>

        {/* PROFILE */}
        <section id="about" className="sec">
          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[.9fr_1.1fr]">
            <figure className="profile-img" data-r>
              <Image src="/images/movie21.jpg" alt="Pushpa 2: The Rule" fill sizes="(max-width:1024px) 90vw, 40vw" className="object-cover" />
            </figure>
            <div>
              <Head k="Profile" lines={["A career", "in motion."]} />
              <p className="lead big" data-r>Allu Arjun&apos;s screen journey spans multiple eras of Telugu cinema, with performances, style and cultural moments that have built a distinctive identity across Indian popular culture.</p>
              <dl className="facts">
                {FACTS.map(([l, v], i) => (<div key={l} data-r style={cssVars({ "--i": i })}><dt>{l}</dt><dd className="fd">{v}</dd></div>))}
              </dl>
            </div>
          </div>
        </section>

        {/* FILMOGRAPHY — the reel */}
        <section id="filmography" className="sec">
          <div className="mx-auto max-w-7xl">
            <Head k="The Journey" lines={["Twenty years,", "one reel."]} text="From the debut to what comes next. Choose a film to bring its poster to the screen." />
            <div className="reel-intro"><span>FILM ARCHIVE</span><i></i><span>2003 — PRESENT</span></div><div className="reel">
              <div className="reel-view" data-r>
                <div className="reel-frame" key={m[1]}>
                  <Image src={`/images/${m[2]}`} alt={m[1]} fill sizes="(max-width:1024px) 90vw, 40vw" className="object-cover" />
                </div>
                <p className="reel-y">{m[0]}</p>
                <p className="reel-t fd">{m[1]}</p>
              </div>
              <ol className="reel-list no-sb" data-r>
                {order.map((i) => (
                  <li key={`${MOVIES[i][0]}-${MOVIES[i][1]}`}>
                    <button type="button" className={(i === sel ? "on " : "") + (MOVIES[i][0] === "Coming Soon" ? "soon" : "")} onMouseEnter={() => setSel(i)} onFocus={() => setSel(i)} onClick={() => setSel(i)}>
                      <span className="tnum">{MOVIES[i][0]}</span><b className="fd">{MOVIES[i][1]}</b>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* LATEST */}
        <section id="latest" className="sec">
          <div className="mx-auto max-w-7xl">
            <Head k="Selected Work" lines={["Latest chapters"]} />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {LATEST.map(([y, t, img], i) => (<Poster key={t} src={img} title={t} chip={y} i={i} />))}
            </div>
          </div>
        </section>

        {/* CAMEOS + CHILD */}
        <section className="sec">
          <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2">
            <div>
              <Head k="Special Appearances" lines={["Cameos & guest roles"]} text="Special appearances across Allu Arjun's career." />
              <div className="grid grid-cols-2 gap-6">{CAMEOS.map(([y, t, img], i) => (<Poster key={t} src={img} title={t} chip="Cameo" sub={y} i={i} />))}</div>
            </div>
            <div>
              <Head k="Early Appearance" lines={["As a child artist"]} text="Early screen appearances from Allu Arjun's childhood." />
              {CHILD.map(([y, t], i) => (
                <div key={t} className="row" data-r style={cssVars({ "--i": i })}>
                  <span className="fd tnum">{y}</span><h3 className="fd">{t}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BIRTHDAY */}
        <section id="birthday" className="sec relative overflow-hidden">
          <span className="ghost fd" aria-hidden="true">8 April</span>
          <div className="relative mx-auto max-w-7xl">
            <Head k="8 April" lines={["Until the next", "birthday."]} text="Counting down to Allu Arjun's next birthday." />
            <div className="clock">
              {([["Days", time.days], ["Hours", time.hours], ["Minutes", time.minutes], ["Seconds", time.seconds]] as [string, number][]).map(([label, v], i) => (
                <div key={label} data-r style={cssVars({ "--i": i })}>
                  <p className={"fd tnum" + (label === "Seconds" ? " gold" : "")}><span key={v} className="tick">{fmt(v)}</span></p>
                  <small>{label}</small>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AWARDS */}
        <section id="awards" className="sec awards">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-end gap-10 lg:grid-cols-[1fr_1fr]">
              <Head k="Achievements" lines={["Awards", "& recognition."]} />
              <div className="mb-12 flex gap-12" data-r>
                <div><p className="fd big-n"><CountUp to={AWARDS.length} /></p><small>Honoured films</small></div>
                <div><p className="fd big-n">2023</p><small>National Film Award</small></div>
              </div>
            </div>
            <div className="aw-grid">
              {AWARDS.map(([film, list], i) => (
                <article key={film} className="aw" data-r style={cssVars({ "--i": i % 2 })}>
                  <h3 className="fd">{film}</h3>
                  <ul>{list.map((a) => (<li key={a} className={a.startsWith("National Film Award") ? "nat" : ""}>{a}</li>))}</ul>
                </article>
              ))}
            </div>
          </div>
        </section>


        {/* SOCIAL */}
        <section id="social" className="sec">
          <div className="mx-auto max-w-7xl">
            <Head k="Connect" lines={["Follow the journey"]} />
            <div>
              {SOCIAL.map(([n, a, href], i) => (
                <a key={n} href={href} target="_blank" rel="noopener noreferrer" className="soc" data-r style={cssVars({ "--i": i })}>
                  <span className="fd">{n}</span><span className="soc-a">{a} <i>↗</i></span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* CLOSING + CONTACT */}
        <section id="contact" className="sec closing">
          <div className="mx-auto max-w-7xl">
            <h2 className="fd close-t" data-r>The journey<br /><span className="gold-text">continues.</span></h2>
            <div className="mt-16 grid gap-12 md:grid-cols-[1fr_1.2fr]">
              <p className="lead !mt-0" data-r>For website feedback, corrections, collaborations or general enquiries, use the details here.</p>
              <div data-r>
                <a href="https://x.com/cricvizanalys" target="_blank" rel="noopener noreferrer" className="contact-row"><span>General enquiries</span><span>www.x.com/cricvizanalys ↗</span></a>
                <a href="mailto:worldofraakaverse@gmail.com" className="contact-row"><span>Contact</span><span>worldofraakaverse@gmail.com ↗</span></a>
                <a href="#social" className="contact-row"><span>AA social channels</span><span>View social ↗</span></a>
              </div>
            </div>
            <div className="mt-20 border-t pt-7" style={{ borderColor: "var(--line)" }}>
              <p className="text-sm" style={{ color: "var(--smoke)" }}>Disclaimer</p>
              <p className="mt-3 max-w-4xl text-xs leading-6" style={{ color: "var(--smoke)" }}>
                This is an independent fan-made website created for informational and entertainment purposes. It is not the official website of Allu Arjun, his management, production companies, or any associated organization. All trademarks, names, photographs and copyrighted materials belong to their respective owners. No official affiliation or endorsement is claimed.
              </p>
            </div>
          </div>
        </section>

        <div className="end-credits" aria-hidden="true"><div className="end-line"><span>AN INDEPENDENT DIGITAL ARCHIVE</span><i></i><span>ALLU ARJUN</span><i></i><span>THE JOURNEY CONTINUES</span></div></div>

        <footer className="foot">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div><p className="fd text-2xl">Allu Arjun</p><p className="mt-1 text-sm" style={{ color: "var(--smoke)" }}>An independent fan-made digital archive.</p></div>
            <div className="flex flex-wrap gap-6 text-sm"><a href="#home" className="nl">Top</a><a href="#about" className="nl">About</a><a href="#filmography" className="nl">Filmography</a><a href="#contact" className="nl">Contact</a></div>
            <p className="text-sm" style={{ color: "var(--smoke)" }}>© {new Date().getFullYear()} · Fan Project</p>
          </div>
        </footer>
      </div>
    </main>
  );
}

const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,600;0,6..96,800;1,6..96,400;1,6..96,600&family=Instrument+Sans:wght@400;500;600&display=swap");
.allu-site{--ink:#060506;--bone:#EDE5D6;--brass:#C9A26B;--wine:#7A1F31;--smoke:#8C8479;--line:rgba(237,229,214,.12);background:var(--ink);color:var(--bone);font-family:"Instrument Sans",ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
html{scroll-behavior:smooth}::selection{background:rgba(201,162,107,.3)}
.fd{font-family:"Bodoni Moda","Didot",Georgia,serif}.tnum{font-variant-numeric:tabular-nums}
.no-sb{scrollbar-width:none}.no-sb::-webkit-scrollbar{display:none}
.allu-site a:focus-visible,.allu-site button:focus-visible{outline:2px solid var(--brass);outline-offset:3px}
.gold-text{background:linear-gradient(100deg,#D9B77E,#FFF1D2,#D9B77E,#9A6B38);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:sheen 7s linear infinite}
@keyframes sheen{to{background-position:-250% 0}}

/* opening: the letterbox parts once */
.lb{position:fixed;left:0;right:0;height:50vh;background:#000;z-index:90;pointer-events:none;animation:lbOpen 1.6s cubic-bezier(.77,0,.18,1) .3s forwards}
.lb-top{top:0;transform-origin:top}.lb-bot{bottom:0;transform-origin:bottom}
@keyframes lbOpen{to{transform:scaleY(0)}}
.progress{position:fixed;top:0;left:0;right:0;height:2px;z-index:80;transform-origin:left;transform:scaleX(0);background:linear-gradient(90deg,var(--wine),var(--brass))}
.grain{position:fixed;inset:0;z-index:70;pointer-events:none;opacity:.06;mix-blend-mode:overlay;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}

.nav{transition:background .4s,backdrop-filter .4s;border-bottom:1px solid transparent}
.nav.s{background:rgba(6,5,6,.72);backdrop-filter:blur(14px);border-color:var(--line)}
.logo{display:flex;height:2.4rem;width:2.4rem;align-items:center;justify-content:center;border:1px solid rgba(201,162,107,.5);border-radius:9999px;font-weight:800;color:var(--brass);transition:background .3s,color .3s}
.group:hover .logo{background:var(--brass);color:#000}
.nl{position:relative;color:var(--smoke);font-size:.9rem;font-weight:500;transition:color .3s}
.nl:hover,.nl[aria-current="true"]{color:var(--bone)}
.nl::after{content:"";position:absolute;left:0;right:0;bottom:-6px;height:1px;background:var(--brass);transform:scaleX(0);transition:transform .35s}
.nl:hover::after,.nl[aria-current="true"]::after{transform:scaleX(1)}
.btn{display:inline-flex;width:fit-content;align-items:center;justify-content:center;border-radius:9999px;padding:.9rem 1.8rem;font-weight:600;font-size:.95rem;transition:transform .3s,background .3s,border-color .3s,color .3s}
.btn:hover{transform:translateY(-2px)}
.btn-s{background:var(--bone);color:var(--ink)}.btn-s:hover{background:var(--brass)}
.btn-g{border:1px solid var(--line);background:rgba(237,229,214,.05);backdrop-filter:blur(10px)}.btn-g:hover{border-color:rgba(201,162,107,.6)}
.btn-o{border:1px solid rgba(201,162,107,.5);color:var(--brass)}.btn-o:hover{background:var(--brass);color:var(--ink)}

/* director-cut depth system */
.hero-vignette{position:absolute;inset:-8%;pointer-events:none;background:radial-gradient(circle at 68% 46%,transparent 0 20%,rgba(0,0,0,.12) 46%,rgba(0,0,0,.78) 100%);z-index:2}
.hero-orbit{position:absolute;z-index:3;pointer-events:none;border:1px solid rgba(201,162,107,.18);border-radius:50%;mix-blend-mode:screen}
.hero-orbit-a{width:38vw;height:38vw;right:-13vw;top:18vh;animation:orbit 24s linear infinite}
.hero-orbit-b{width:23vw;height:23vw;right:-5vw;top:27vh;border-color:rgba(237,229,214,.12);animation:orbit 17s linear infinite reverse}
@keyframes orbit{to{transform:rotate(360deg)}}
.hero-meta{position:absolute;left:1.5rem;top:50%;z-index:10;display:none;align-items:center;gap:.7rem;transform:rotate(-90deg) translateX(-50%);transform-origin:left center;color:rgba(237,229,214,.45);font-size:.65rem;letter-spacing:.22em}
.hero-meta i{display:block;width:42px;height:1px;background:var(--brass)}
@media(min-width:1024px){.hero-meta{display:flex;left:2.2rem}}

/* hero: one orchestrated moment */
.hero-bg{transform:translate3d(0,calc(var(--sy,0px)*.28),0);will-change:transform}
.hero-img{filter:saturate(.85) contrast(1.06);animation:zoom 18s ease-out infinite alternate}
@keyframes zoom{from{transform:scale(1.03)}to{transform:scale(1.09)}}
.leak{position:absolute;top:-20%;right:-10%;width:70%;height:90%;pointer-events:none;mix-blend-mode:screen;opacity:.3;background:radial-gradient(ellipse,rgba(255,214,150,.22),transparent 65%)}
.hero-title{font-size:clamp(5rem,21vw,17rem);line-height:.82;letter-spacing:-.045em;font-weight:500;text-shadow:0 20px 70px rgba(0,0,0,.55)}
.hero-l2{margin-left:.45em;font-style:italic}
.letter{display:inline-block;padding:0 .02em;-webkit-background-clip:text;background-clip:text;color:transparent;animation:letterIn 1.3s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(1.2s + var(--i)*.1s)}
.l-ivory{background-image:linear-gradient(180deg,#fff 10%,#E4DAC8)}
.l-gold{background-image:linear-gradient(180deg,#FFF4DA 8%,#D9B77E 55%,#9A6B38)}
@keyframes letterIn{from{opacity:0;filter:blur(18px);transform:translate3d(0,40px,0) scale(1.1)}to{opacity:1;filter:none;transform:none}}
.rise{animation:rise 1s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(1.3s + var(--d,0s))}
@keyframes rise{from{opacity:0;transform:translate3d(0,24px,0);filter:blur(6px)}to{opacity:1;transform:none;filter:none}}
.hero-side{position:absolute;right:1.5rem;top:50%;z-index:10;writing-mode:vertical-rl;transform:rotate(180deg) translateY(50%);font-size:.8rem;letter-spacing:.2em;color:rgba(237,229,214,.55);display:none}
.scue{position:absolute;right:2.2rem;bottom:2rem;z-index:10;display:none;flex-direction:column;align-items:center;gap:.6rem;font-size:.8rem;color:var(--smoke)}
.scue i{width:1px;height:56px;background:linear-gradient(var(--brass),transparent);transform-origin:top;animation:scue 2.4s ease-in-out infinite}
@keyframes scue{0%{transform:scaleY(0)}60%{transform:scaleY(1)}100%{transform:scaleY(1);opacity:0}}
@media(min-width:1024px){.hero-side{display:block}.scue{display:flex;bottom:6rem}}

.mq{overflow:hidden;border-block:1px solid var(--line);background:rgba(6,5,6,.85);padding:1.1rem 0}
.mq-t{display:flex;width:max-content;gap:2rem;animation:mq 120s linear infinite;font-size:2.2rem;font-style:italic;color:transparent;-webkit-text-stroke:1px rgba(237,229,214,.32)}
.mq-t span{display:flex;align-items:center;gap:2rem;white-space:nowrap}.mq-t em{font-style:normal;font-size:.9rem;color:var(--brass);-webkit-text-stroke:0}
@keyframes mq{to{transform:translateX(-50%)}}

.sec{position:relative;padding:6rem 1.5rem;border-top:1px solid var(--line);background:radial-gradient(circle at 88% 8%,rgba(122,31,49,.12),transparent 38%),var(--ink)}
@media(min-width:768px){.sec{padding:9rem 2.5rem}}
.head{margin-bottom:3.5rem;max-width:44rem}
.kk{display:flex;align-items:center;gap:.8rem;color:var(--brass);font-family:"Bodoni Moda",serif;font-style:italic;font-size:1.05rem}
.kk::before{content:"";height:1px;width:0;background:var(--brass);transition:width 1s .2s}.kk.in::before{width:2.5rem}
.h2{font-family:"Bodoni Moda",serif;font-size:clamp(2.8rem,7.5vw,6rem);font-weight:500;line-height:.95;letter-spacing:-.035em;margin-top:1rem;text-wrap:balance}
.lead{margin-top:1.5rem;max-width:36rem;color:#A59B8D;line-height:1.8}.lead.big{margin-top:0;font-size:1.15rem;color:#C2B8A9}
[data-r]{opacity:0;transform:translateY(28px);transition:opacity .9s ease calc(var(--i,0)*.1s),transform .9s cubic-bezier(.2,.7,.2,1) calc(var(--i,0)*.1s)}
[data-r].in{opacity:1;transform:none}.ln[data-r],.poster[data-r]{opacity:1;transform:none}
.ln{display:block;overflow:hidden;padding-bottom:.1em}.ln.dim{color:rgba(237,229,214,.4);font-style:italic}
.ln>span{display:block;transform:translateY(105%);transition:transform 1.1s cubic-bezier(.2,.7,.2,1) calc(var(--l,0)*.13s)}.ln.in>span{transform:none}

.profile-img{position:relative;aspect-ratio:3/4;overflow:hidden;border-radius:2px;max-height:80vh}
.profile-img::after{content:"";position:absolute;inset:0;background:linear-gradient(0deg,rgba(6,5,6,.55),transparent 40%)}
.facts{margin-top:2.5rem;display:grid;grid-template-columns:1fr 1fr;border-top:1px solid var(--line)}
.facts div{padding:1.4rem 0;border-bottom:1px solid var(--line)}.facts dt{font-size:.85rem;color:var(--smoke)}.facts dd{margin-top:.4rem;font-size:1.6rem}

.reel-intro{display:flex;align-items:center;gap:1rem;margin:-1rem 0 2rem;color:var(--smoke);font-size:.7rem;letter-spacing:.2em}.reel-intro i{width:60px;height:1px;background:var(--brass);opacity:.65}.reel{display:grid;gap:2rem}
@media(min-width:1024px){.reel{grid-template-columns:.8fr 1.2fr;gap:5rem}.reel-view{position:sticky;top:6rem;align-self:start}}
.reel-frame{position:relative;aspect-ratio:2/3;max-height:72vh;overflow:hidden;animation:frame .9s cubic-bezier(.77,0,.18,1)}
@keyframes frame{from{clip-path:inset(0 0 100% 0);transform:scale(1.06)}to{clip-path:inset(0);transform:none}}
.reel-y{margin-top:1.2rem;color:var(--brass);font-size:.9rem}.reel-t{font-size:clamp(1.8rem,3.4vw,2.8rem);line-height:1.05;margin-top:.3rem}
.reel-list{list-style:none;padding:0;margin:0;max-height:78vh;overflow-y:auto}
.reel-list button{display:flex;width:100%;align-items:baseline;gap:1.5rem;padding:1.05rem 0;text-align:left;border-bottom:1px solid var(--line);color:rgba(237,229,214,.42);transition:color .35s,padding .45s cubic-bezier(.2,.7,.2,1)}
.reel-list button span{width:5.5rem;flex:none;font-size:.85rem}.reel-list button b{font-weight:500;font-size:clamp(1.3rem,2.4vw,2rem)}
.reel-list button:hover,.reel-list button.on{color:var(--bone);padding-left:1rem;position:relative}.reel-list button.on::after{content:"";position:absolute;left:0;top:0;bottom:0;width:2px;background:var(--brass);transform-origin:center;animation:lineIn .45s ease}@keyframes lineIn{from{transform:scaleY(0)}to{transform:scaleY(1)}}.reel-list button.on span{color:var(--brass)}
.reel-list button.soon span{color:var(--brass)}

.poster .pc{position:relative;aspect-ratio:2/3;overflow:hidden;border-radius:2px;background:#0d090a;transition:box-shadow .5s}
.poster{position:relative;transform:perspective(1000px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));transition:transform .35s cubic-bezier(.2,.7,.2,1)}
.poster::before{content:"";position:absolute;inset:-1px;z-index:4;border:1px solid rgba(237,229,214,.08);pointer-events:none;transition:border-color .4s}.poster:hover::before{border-color:rgba(201,162,107,.42)}
.poster-sheen{position:absolute;inset:0;z-index:2;pointer-events:none;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,.22) 47%,transparent 62%);transform:translateX(-130%);transition:transform .9s cubic-bezier(.2,.7,.2,1)}.poster:hover .poster-sheen{transform:translateX(130%)}
.poster-no{position:absolute;right:.8rem;bottom:.75rem;z-index:3;font-family:"Bodoni Moda",serif;font-size:.72rem;letter-spacing:.12em;color:rgba(255,255,255,.55)}
.poster:hover .pc{box-shadow:0 30px 70px rgba(0,0,0,.6)}.pc img{transition:transform 1.1s cubic-bezier(.2,.7,.2,1),filter .6s;filter:saturate(.9)}.poster:hover .pc img{transform:scale(1.05);filter:none}
.chip{position:absolute;top:.75rem;left:.75rem;z-index:2;border-radius:9999px;background:rgba(6,5,6,.7);backdrop-filter:blur(8px);padding:.25rem .75rem;font-size:.75rem}
.cap b{display:block;margin-top:1rem;font-weight:500;font-size:1.05rem}.cap small{display:block;margin-top:1rem;margin-bottom:-.75rem;color:var(--smoke);font-size:.8rem}

.row{display:flex;align-items:baseline;gap:1.5rem;padding:1.5rem 0;border-bottom:1px solid var(--line);transition:padding .4s}
.row:hover{padding-left:.8rem}.row span{width:4rem;color:var(--smoke)}.row h3{font-size:clamp(1.8rem,3.4vw,2.8rem)}
.ghost{position:absolute;right:-2%;top:6%;font-size:clamp(8rem,28vw,24rem);font-style:italic;line-height:.8;color:transparent;-webkit-text-stroke:1px rgba(237,229,214,.07);pointer-events:none;white-space:nowrap}
.clock{display:grid;grid-template-columns:repeat(2,1fr);border-top:1px solid var(--line)}
@media(min-width:768px){.clock{grid-template-columns:repeat(4,1fr)}}
.clock div{padding:2.2rem 0;border-bottom:1px solid var(--line)}.clock p{font-size:clamp(4rem,9vw,7.5rem);line-height:.9;font-weight:400}.clock .gold{color:var(--brass)}.clock small{display:block;margin-top:1rem;color:var(--smoke);font-size:.85rem}
.tick{display:inline-block;animation:tick .55s cubic-bezier(.2,.7,.2,1)}@keyframes tick{from{opacity:0;transform:translateY(35%)}to{opacity:1;transform:none}}

.awards{background:radial-gradient(circle at 8% 10%,rgba(122,31,49,.14),transparent 32%),#070405}
.big-n{font-size:clamp(3.5rem,7vw,5.5rem);line-height:.9;color:var(--brass)}.awards small{color:var(--smoke);font-size:.85rem}
.aw-grid{display:grid;column-gap:5rem}@media(min-width:768px){.aw-grid{grid-template-columns:1fr 1fr}}
.aw{padding:2rem 0;border-top:1px solid var(--line)}.aw h3{font-size:clamp(1.7rem,2.8vw,2.4rem);line-height:1.05}
.aw ul{margin-top:1rem;display:grid;gap:.6rem;list-style:none;padding:0}.aw li{font-size:.85rem;line-height:1.5;color:#A59B8D}
.aw li.nat{color:var(--brass);font-weight:600}


.soc{display:flex;align-items:baseline;justify-content:space-between;padding:1.6rem 0;border-bottom:1px solid var(--line);transition:padding .4s,color .3s}
.soc span:first-child{font-size:clamp(2rem,5vw,4rem)}.soc-a{color:var(--smoke);font-size:.9rem}.soc-a i{font-style:normal;color:var(--brass);display:inline-block;transition:transform .3s}
.soc:hover{padding-inline:1rem;color:var(--brass)}.soc:hover i{transform:translate(3px,-3px)}
.closing{background:radial-gradient(ellipse at 50% 0,rgba(201,162,107,.1),transparent 55%),var(--ink)}
.close-t{font-size:clamp(3.5rem,11vw,9rem);line-height:.9;letter-spacing:-.04em;font-weight:500}.close-t .gold-text{font-style:italic}
.contact-row{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1.25rem 0;border-bottom:1px solid var(--line);color:#B5AB9C;font-size:.9rem;transition:color .3s,padding .3s}
.contact-row:hover{color:var(--brass);padding-inline:.6rem}
@media(max-width:640px){.hero-orbit{opacity:.55}.hero-meta{display:none}.reel-intro{font-size:.62rem}.poster{transform:none!important}.poster-no{font-size:.62rem}.contact-row{flex-direction:column;align-items:flex-start}.mq-t{font-size:1.7rem}.hero-title{font-size:clamp(4.2rem,24vw,7rem)}.hero-img{object-position:58% center}}
.end-credits{overflow:hidden;border-top:1px solid var(--line);border-bottom:1px solid var(--line);background:#030303;padding:1rem 0;color:rgba(237,229,214,.3)}.end-line{display:flex;width:max-content;align-items:center;gap:2rem;font-family:"Bodoni Moda",serif;font-size:.75rem;letter-spacing:.22em;animation:endScroll 34s linear infinite}.end-line i{width:4px;height:4px;border-radius:50%;background:var(--brass);display:block}@keyframes endScroll{to{transform:translateX(-50%)}}
.foot{border-top:1px solid var(--line);background:#000;padding:2.5rem 1.5rem}@media(min-width:768px){.foot{padding:2.5rem}}

@media (prefers-reduced-motion:reduce){
html{scroll-behavior:auto}.lb,.grain{display:none}
.rise,.letter,.hero-img,.mq-t,.gold-text,.scue i,.tick,.reel-frame,.hero-orbit,.end-line{animation:none!important}.poster{transform:none!important}
[data-r],.ln>span{opacity:1!important;transform:none!important;transition:none!important}
}
`;
