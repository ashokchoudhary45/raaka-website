"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";

const cssVars = (o: Record<string, string | number>) => o as unknown as CSSProperties;

const NAV: [string, string][] = [["home", "Home"], ["about", "About"], ["filmography", "Filmography"], ["birthday", "Birthday"], ["social", "Connect"], ["contact", "contact"]];

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
const FACTS: [string, string][] = [["Profession", "Actor"], ["Industry", "Indian Cinema"], ["Debut", "Gangotri"], ["Known for", "Style"]];

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
const SOCIAL_AVATARS: Record<string, string> = {
  Instagram: "https://unavatar.io/instagram/alluarjunonline",
  Facebook: "https://unavatar.io/facebook/AlluArjun",
  X: "https://unavatar.io/x/alluarjun",
  YouTube: "https://unavatar.io/youtube/alluarjun",
};

const EMAIL = "worldofraakaverse@gmail.com";
const X_URL = "https://x.com/cricvizanalys";
const TOPICS = ["Feedback", "Correction", "Collaboration", "General enquiry"];
const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const awardsFor = (title: string) => {
  const t = squash(title);
  const hit = AWARDS.find(([film]) => { const f = squash(film); return f === t || f.includes(t) || t.includes(f); });
  return hit ? hit[1] : [];
};

const fmt = (n: number) => String(n).padStart(2, "0");
const nextBday = (now: Date) => {
  const d = new Date(`${now.getFullYear()}-04-08T00:00:00+05:30`);
  return d > now ? d : new Date(`${now.getFullYear() + 1}-04-08T00:00:00+05:30`);
};
const isBirthdayIST = (now: Date) => {
  const p = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", month: "numeric", day: "numeric" }).formatToParts(now);
  return p.find((x) => x.type === "month")?.value === "4" && p.find((x) => x.type === "day")?.value === "8";
};

function Head({ k, lines, text }: { k: string; lines: string[]; text?: string }) {
  return (
    <div className="aa-head">
      <p className="aa-kk" data-r>{k}</p>
      <h2 className="aa-h2">
        {lines.map((l, i) => (
          <span key={i} className={"aa-ln" + (i > 0 ? " dim" : "")} data-r><span style={cssVars({ "--l": i })}>{l}</span></span>
        ))}
      </h2>
      {text && <p className="aa-lead" data-r>{text}</p>}
    </div>
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
        const p = Math.min(1, (t - t0) / 1500);
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

const Word = ({ w, o = 0 }: { w: string; o?: number }) => (
  <span className="block">
    {w.split("").map((c, i) => (
      <span key={i} aria-hidden="true" className="aa-letter" style={cssVars({ "--i": i + o })}>{c}</span>
    ))}
  </span>
);


export default function AlluArjunPage() {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [bday, setBday] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  const [homeBackgroundIndex, setHomeBackgroundIndex] = useState(0);
  const [sel, setSel] = useState(MOVIES.findIndex((m) => m[1] === "Pushpa 2: The Rule"));
  const [name, setName] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [msg, setMsg] = useState("");
  const [formErr, setFormErr] = useState("");
  const [copied, setCopied] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const progRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  // ---- birthday clock ----
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const diff = Math.max(0, nextBday(now).getTime() - now.getTime());
      setBday(isBirthdayIST(now));
      setTime({ days: Math.floor(diff / 864e5), hours: Math.floor((diff / 36e5) % 24), minutes: Math.floor((diff / 6e4) % 60), seconds: Math.floor((diff / 1e3) % 60) });
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  // ---- scroll progress, reveal, scroll-spy ----
  useEffect(() => {
    const on = () => {
      const h = document.documentElement, m = h.scrollHeight - h.clientHeight;
      progRef.current?.style.setProperty("transform", "scaleX(" + (m > 0 ? h.scrollTop / m : 0) + ")");
      setScrolled(h.scrollTop > 40);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    document.querySelectorAll("[data-r]").forEach((el) => io.observe(el));
    const so = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("section[id]").forEach((el) => so.observe(el));
    return () => { window.removeEventListener("scroll", on); io.disconnect(); so.disconnect(); };
  }, []);

  // Hero spotlight movement removed: keep the home background lighting static.
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    el.style.setProperty("--sx", "50%");
    el.style.setProperty("--sy", "46%");
    el.style.setProperty("--rad", "0px");
  }, []);

  // ---- filmography strip keeps the selected film centred (horizontal only) ----
  useEffect(() => {
    const strip = stripRef.current;
    const node = strip?.querySelector<HTMLElement>(`[data-i="${sel}"]`);
    if (!strip || !node) return;
    strip.scrollTo({ left: node.offsetLeft - strip.clientWidth / 2 + node.clientWidth / 2, behavior: "smooth" });
  }, [sel]);

  const total = MOVIES.length;
  const step = (d: number) => setSel((s) => (s + d + total) % total);
  const m = MOVIES[sel];
  const filmAwards = awardsFor(m[1]);

  const released = MOVIES.filter((x) => x[0] !== "Coming Soon").length;
  const years = new Date().getFullYear() - 2003;
  const honours = AWARDS.reduce((s, [, l]) => s + l.length, 0);
  const navLinks = (cls: string) => NAV.map(([id, l]) => (
    <a
      key={id}
      href={"#" + id}
      className={"aa-nl " + cls}
      aria-current={active === id ? "true" : undefined}
    >
      {l}
    </a>
  ));

  const sendMail = () => {
    if (!msg.trim()) { setFormErr("Please write a short message first."); return; }
    setFormErr("");
    const subject = `[Allu Arjun fan site] ${topic}`;
    const bodyText = `${msg.trim()}\n\n— ${name.trim() || "A fan"}`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
  };
  const copyMail = async () => {
    try { await navigator.clipboard.writeText(EMAIL); } catch { /* clipboard may be blocked; the address is also visible */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="aa-site relative min-h-screen overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="aa-progress" ref={progRef} aria-hidden="true" />
      <div className="aa-grain" aria-hidden="true" />

      {/* ============ HEADER ============ */}
      <header className={"aa-nav fixed inset-x-0 top-0 z-50 px-4 md:px-8" + (scrolled ? " s" : "")}>
        <div className="mx-auto max-w-7xl">
          <div className="flex h-16 items-center justify-between gap-4">
            <nav className="hidden items-center gap-8 lg:flex" aria-label="Sections">{navLinks("")}</nav>
            <a href="/contact" className="aa-btn aa-btn-solid !px-5 !py-2.5 !text-sm">Contact</a>
          </div>
          <nav className="aa-nosb flex gap-6 overflow-x-auto pb-3 lg:hidden" aria-label="Sections">{navLinks("shrink-0")}</nav>
        </div>
      </header>

      {/* ============ HERO — a dark stage, one moving spotlight ============ */}
      <section id="home" ref={heroRef} className="aa-stage">
        <div className="aa-stage-backgrounds" aria-hidden="true">
          {(() => {
            // Keep exactly one hero background per device. The previous CSS
            // also painted these images on .aa-stage, causing the double-image effect.
            const desktopSrc = "/images/16.png";
            const mobileSrc = "/images/17.png";
            return (
              <div
                key={desktopSrc}
                className="aa-stage-background"
                style={cssVars({
                  "--desktop-bg": `url("${desktopSrc}")`,
                  "--mobile-bg": `url("${mobileSrc}")`,
                })}
              />
            );
          })()}
        </div>
        <div className="aa-stage-shade" aria-hidden="true" />
        <div className="aa-halo" aria-hidden="true" />

        <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col items-center justify-center px-6 pb-16 pt-32 text-center">
          <div className="aa-hero-lockup aa-rise" style={cssVars({ "--d": "1.5s" })}>
            <p className="aa-icon-star"><span aria-hidden="true" />ICON STAR<span aria-hidden="true" /></p>
            <h1 className="aa-hero-title" aria-label="Allu Arjun">
              <Word w="Allu" />
              <Word w="Arjun" o={4} />
            </h1>
            <span className="aa-name-flare" aria-hidden="true" />
          </div>
          <p className="aa-hint" aria-hidden="true"><span className="aa-hint-pc"></span><span className="aa-hint-touch"> </span></p>
        </div>
      </section>

      <div className="aa-mq" aria-hidden="true">
        <div className="aa-mq-t">{[...MOVIES, ...MOVIES].map(([, t], i) => (<span key={i}>{t}<em>◆</em></span>))}</div>
      </div>

      {/* ============ PROFILE ============ */}
      <section id="about" className="aa-sec">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[.85fr_1.15fr]">
          <figure className="aa-frame" data-r>
            <div className="aa-frame-in"><Image src="/images/movie21.jpg" alt="Pushpa 2: The Rule" fill sizes="(max-width:1024px) 90vw, 40vw" className="object-cover" /></div>
            <i className="c1" /><i className="c2" /><i className="c3" /><i className="c4" />
            <figcaption> </figcaption>
          </figure>
          <div>
            <Head k="Profile" lines={["A career", "in motion."]} />
            <p className="aa-lead big" data-r>Allu Arjun&apos;s screen journey spans multiple eras of Telugu cinema, with performances, style and cultural moments that have built a distinctive identity across Indian popular culture.</p>
            <dl className="aa-facts">
              {FACTS.map(([l, v]) => (<div key={l}><dt>{l}</dt><dd>{v}</dd></div>))}
            </dl>
            <div className="aa-stats">
              {([[released, "Films released"], [years, "Years on screen"], [honours, "Honours won"], [CAMEOS.length, "Cameos"]] as [number, string][]).map(([n, l]) => (
                <div key={l}><b><CountUp to={n} /></b><small>{l}</small></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ BIRTHDAY ============ */}
      <section id="birthday" className="aa-sec aa-bday">
        <span className="aa-ghost" aria-hidden="true">8 April</span>
        <div className="relative mx-auto max-w-7xl">
          <Head k="8 April" lines={bday ? ["Happy birthday,", "Icon Star."] : ["Until the next", "birthday."]} text={bday ? "Today is the day. Wishing Allu Arjun a very happy birthday." : "Counting down to Allu Arjun's next birthday."} />
          {bday && <div className="aa-confetti" aria-hidden="true">{Array.from({ length: 28 }).map((_, i) => <i key={i} style={cssVars({ "--x": `${(i * 37) % 100}%`, "--d": `${3 + (i % 5) * 0.6}s`, "--dl": `${(i % 7) * 0.4}s`, "--c": i % 3 })} />)}</div>}
          <div className="aa-clock">
            {([["Days", time.days, 365], ["Hours", time.hours, 24], ["Minutes", time.minutes, 60], ["Seconds", time.seconds, 60]] as [string, number, number][]).map(([label, v, max]) => (
              <div key={label}>
                <p className={label === "Seconds" ? "hot" : ""}><span key={v} className="aa-tick">{fmt(v)}</span></p>
                <span className="aa-bar"><i style={{ width: `${(v / max) * 100}%`, transition: v === 0 ? "none" : undefined }} /></span>
                <small>{label}</small>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ============ FILMOGRAPHY — projector + film strip ============ */}
      <section id="filmography" className="aa-sec">
        <div className="mx-auto max-w-7xl">
          <Head k="The Journey" lines={["Twenty years,", "one reel."]} text="From the debut to what comes next. Pick a frame on the strip, or use the arrow keys." />

          <div className="aa-proj">
            <div className="aa-proj-poster">
              <div className="aa-cone" aria-hidden="true" />
              <div className="aa-poster" key={m[1]}>
                <Image src={`/images/${m[2]}`} alt={m[1]} fill sizes="(max-width:1024px) 80vw, 34vw" className="object-cover" />
              </div>
            </div>
            <div className="aa-proj-info">
              <p className="aa-year" key={m[0]}>{m[0] === "Coming Soon" ? "Soon" : m[0]}</p>
              <h3 className="aa-ftitle" key={m[1]}>{m[1]}</h3>
              <p className="mt-4 text-sm text-[color:var(--steel)]">Film {sel + 1} of {total}</p>
              {filmAwards.length > 0 && (
                <ul className="aa-honours">
                  {filmAwards.slice(0, 3).map((a) => <li key={a} className={a.startsWith("National") ? "nat" : ""}>{a}</li>)}
                  {filmAwards.length > 3 && <li className="more">+{filmAwards.length - 3} more honours</li>}
                </ul>
              )}
              <div className="mt-8 flex gap-3">
                <button type="button" className="aa-round" onClick={() => step(-1)} aria-label="Previous film">←</button>
                <button type="button" className="aa-round" onClick={() => step(1)} aria-label="Next film">→</button>
              </div>
            </div>
          </div>

          <div
            ref={stripRef}
            className="aa-strip aa-nosb"
            role="listbox"
            aria-label="Filmography"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "ArrowRight") { e.preventDefault(); step(1); } if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); } }}
          >
            {MOVIES.map((mv, i) => (
              <button key={`${mv[0]}-${mv[1]}`} type="button" role="option" aria-selected={i === sel} data-i={i} tabIndex={-1} onClick={() => setSel(i)} className={"aa-frame-btn" + (i === sel ? " on" : "")}>
                <span className="aa-thumb"><Image src={`/images/${mv[2]}`} alt="" fill sizes="96px" className="object-cover" /></span>
                <span className="aa-fy">{mv[0] === "Coming Soon" ? "Soon" : mv[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ============ LATEST ============ */}
      <section id="latest" className="aa-sec">
        <div className="mx-auto max-w-7xl">
          <Head k="Selected Work" lines={["Latest chapters"]} />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {LATEST.map(([y, t, img]) => (
              <figure key={t} className="aa-card">
                <div className="aa-card-img"><Image src={`/images/${img}`} alt={t} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover" /><span className="aa-chip">{y}</span><span className="aa-sheen" aria-hidden="true" /></div>
                <figcaption>{t}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CAMEOS + CHILD ARTIST ============ */}
      <section className="aa-sec">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2">
          <div>
            <Head k="Special Appearances" lines={["Cameos & guest roles"]} text="Special appearances across Allu Arjun's career." />
            <div className="grid grid-cols-2 gap-5">
              {CAMEOS.map(([y, t, img]) => (
                <figure key={t} className="aa-card">
                  <div className="aa-card-img"><Image src={`/images/${img}`} alt={t} fill sizes="(max-width:768px) 45vw, 20vw" className="object-cover" /><span className="aa-chip">Cameo · {y}</span><span className="aa-sheen" aria-hidden="true" /></div>
                  <figcaption>{t}</figcaption>
                </figure>
              ))}
            </div>
          </div>
          <div>
            <Head k="Early Appearance" lines={["As a child artist"]} text="Early screen appearances from Allu Arjun's childhood." />
            {CHILD.map(([y, t]) => (
              <div key={t} className="aa-row"><span>{y}</span><h3>{t}</h3></div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CONNECT — ALLU ARJUN SOCIAL CHANNELS ============ */}
      <section id="social" className="aa-sec">
        <div className="mx-auto max-w-7xl">
          <Head k="Connect" lines={["Follow the journey"]} text="Find Allu Arjun across his social platforms. These links lead to the listed public profiles." />
          <div className="aa-social-profiles">
            <p className="aa-social-kicker">ALLU ARJUN · SOCIAL CHANNELS</p>
            {SOCIAL.map(([platform, action, href]) => (
              <a key={platform} href={href} target="_blank" rel="noopener noreferrer" className="aa-profile-link">
                <span className="aa-avatar-wrap">
                  <img src={SOCIAL_AVATARS[platform]} alt={`${platform} profile picture`} loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  <span className="aa-avatar-fallback">{platform === "X" ? "𝕏" : platform === "YouTube" ? "▶" : platform === "Instagram" ? "◎" : "f"}</span>
                </span>
                <span className="aa-profile-copy"><strong>{platform}</strong><small>{platform === "Instagram" ? "@alluarjunonline" : platform === "Facebook" ? "Allu Arjun" : "@alluarjun"}</small></span>
                <span className="aa-profile-action">{action} ↗</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CONTACT ============ */}
      <section id="contact" className="aa-sec aa-closing">
        <div className="mx-auto max-w-7xl">
          <Head k="Contact" lines={["Say hello,", "send a note."]} text="For website feedback, corrections, collaborations or general enquiries, write to us here." />

          <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
            <form className="aa-form" onSubmit={(e) => { e.preventDefault(); sendMail(); }} noValidate>
              <label className="aa-field">
                <span>Your name <em>optional</em></span>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" autoComplete="name" />
              </label>
              <fieldset className="aa-field">
                <legend>What is it about?</legend>
                <div className="aa-topics">
                  {TOPICS.map((t) => (<button key={t} type="button" aria-pressed={topic === t} onClick={() => setTopic(t)}>{t}</button>))}
                </div>
              </fieldset>
              <label className="aa-field">
                <span>Message</span>
                <textarea rows={5} value={msg} onChange={(e) => { setMsg(e.target.value); if (formErr) setFormErr(""); }} placeholder="Write your message here" />
              </label>
              {formErr && <p role="alert" className="aa-err">{formErr}</p>}
              <div className="flex flex-wrap items-center gap-4">
                <button type="submit" className="aa-btn aa-btn-solid">Open in my email app</button>
                <p className="text-xs text-[color:var(--steel)]">Opens your email app with the message ready to send to {EMAIL}.</p>
              </div>
            </form>

            <div className="aa-direct">
              <div className="aa-dc">
                <p>Email</p>
                <a href={`mailto:${EMAIL}`} className="aa-dc-main">{EMAIL}</a>
                <button type="button" onClick={copyMail} className="aa-copy" aria-live="polite">{copied ? "Copied ✓" : "Copy address"}</button>
              </div>
              <a href="https://x.com/cricvizanalys" target="_blank" rel="noopener noreferrer" className="aa-dc aa-dc-link aa-contact-profile">
                <span className="aa-contact-pfp aa-contact-fallback" aria-hidden="true">𝕏</span><img className="aa-contact-pfp" src="https://unavatar.io/x/cricvizanalys" alt="@cricvizanalys profile picture" loading="lazy" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                <span className="aa-contact-profile-copy"><p>YOUR X / TWITTER</p><span className="aa-dc-main">@cricvizanalys <i>↗</i></span><small>Open profile</small></span>
              </a>
              <a href="https://www.instagram.com/45_.editz/" target="_blank" rel="noopener noreferrer" className="aa-dc aa-dc-link aa-contact-profile">
                <span className="aa-contact-pfp aa-contact-fallback" aria-hidden="true">◎</span><img className="aa-contact-pfp" src="https://unavatar.io/instagram/45_.editz" alt="@45_.editz Instagram profile picture" loading="lazy" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                <span className="aa-contact-profile-copy"><p>YOUR INSTAGRAM</p><span className="aa-dc-main">@45_.editz <i>↗</i></span><small>Open profile</small></span>
              </a>
            </div>
          </div>

          <div className="mt-20 border-t pt-7" style={{ borderColor: "var(--line)" }}>
            <p className="text-sm text-[color:var(--steel)]">Disclaimer</p>
            <p className="mt-3 max-w-4xl text-xs leading-6 text-[color:var(--steel)]">
              This is an independent fan-made website created for informational and entertainment purposes. It is not the official website of Allu Arjun, his management, production companies, or any associated organization. All trademarks, names, photographs and copyrighted materials belong to their respective owners. No official affiliation or endorsement is claimed.
            </p>
          </div>
        </div>
      </section>

      <div className="aa-end" aria-hidden="true"><div><span>AN INDEPENDENT DIGITAL ARCHIVE</span><i></i><span>ALLU ARJUN</span><i></i><span>THE JOURNEY CONTINUES</span><i></i><span>AN INDEPENDENT DIGITAL ARCHIVE</span><i></i><span>ALLU ARJUN</span><i></i><span>THE JOURNEY CONTINUES</span><i></i></div></div>

      <footer className="aa-foot">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center">
            <p className="max-w-[16rem] text-sm text-[color:var(--steel)]">An independent fan-made digital archive.</p>
          </div>
          <div className="flex flex-wrap gap-6 text-sm"><a href="#home" className="aa-nl">Top</a><a href="#about" className="aa-nl">About</a><a href="#filmography" className="aa-nl">Filmography</a><a href="#contact" className="aa-nl">Contact</a></div>
          <p className="text-sm text-[color:var(--steel)]">© {new Date().getFullYear()} · Fan Project</p>
        </div>
      </footer>
    </main>
  );
}

const CSS = String.raw`
@import url("https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900&family=Hanken+Grotesk:wght@400;500;600&display=swap");
.aa-site{--ink:#070605;--bone:#f0e8d8;--rust:#c2481f;--saffron:#ffb12e;--steel:#9a9387;--line:rgba(240,232,216,.12);--fd:"Big Shoulders Display","Arial Narrow",Impact,sans-serif;--fb:"Hanken Grotesk",ui-sans-serif,system-ui,sans-serif;background:var(--ink);color:var(--bone);font-family:var(--fb);-webkit-font-smoothing:antialiased}
.aa-site ::selection{background:var(--saffron);color:#000}
html{scroll-behavior:smooth}
.aa-site section[id]{scroll-margin-top:6rem}
.aa-site a:focus-visible,.aa-site button:focus-visible,.aa-site input:focus-visible,.aa-site textarea:focus-visible,.aa-strip:focus-visible{outline:2px solid var(--saffron);outline-offset:3px}
.aa-nosb{scrollbar-width:none}.aa-nosb::-webkit-scrollbar{display:none}
.aa-progress{position:fixed;top:0;left:0;right:0;height:2px;z-index:80;transform-origin:left;transform:scaleX(0);background:linear-gradient(90deg,var(--rust),var(--saffron))}
.aa-grain{position:fixed;inset:0;z-index:70;pointer-events:none;opacity:.06;mix-blend-mode:overlay;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}

/* ---------- header ---------- */
.aa-nav{transition:background .4s,backdrop-filter .4s;border-bottom:1px solid transparent}
.aa-nav.s{background:rgba(7,6,5,.78);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border-color:var(--line)}
.aa-nl{position:relative;color:var(--steel);font-size:.9rem;font-weight:500;transition:color .3s}
.aa-nl:hover,.aa-nl[aria-current="true"]{color:var(--bone)}
.aa-nl::after{content:"";position:absolute;left:0;right:0;bottom:-6px;height:2px;background:var(--saffron);transform:scaleX(0);transform-origin:left;transition:transform .35s}
.aa-nl:hover::after,.aa-nl[aria-current="true"]::after{transform:scaleX(1)}
.aa-btn{display:inline-flex;width:fit-content;align-items:center;justify-content:center;border-radius:9999px;padding:.9rem 1.8rem;font-weight:600;font-size:.95rem;transition:transform .35s cubic-bezier(.16,1,.3,1),background .3s,border-color .3s,color .3s,box-shadow .3s}
.aa-btn:hover{transform:translateY(-3px)}.aa-btn:active{transform:scale(.97)}
.aa-btn-solid{background:linear-gradient(135deg,#ffc552,var(--saffron) 55%,#e8870f);color:#1b0f00;box-shadow:0 10px 30px rgba(255,177,46,.22)}.aa-btn-solid:hover{box-shadow:0 16px 44px rgba(255,177,46,.4)}
.aa-btn-ghost{border:1px solid var(--line);background:rgba(240,232,216,.05);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}.aa-btn-ghost:hover{border-color:rgba(255,177,46,.6)}
.aa-btn-line{border:1px solid rgba(255,177,46,.5);color:var(--saffron)}.aa-btn-line:hover{background:var(--saffron);color:#1b0f00}

/* ---------- hero: the stage ---------- */
.aa-stage{position:relative;isolation:isolate;min-height:100svh;overflow:hidden;--sx:50%;--sy:46%;--rad:290px;background:var(--ink)}
.aa-stage-backgrounds{position:absolute;inset:0;z-index:0;overflow:hidden;pointer-events:none}
.aa-stage-background{position:absolute;inset:0;background-image:var(--desktop-bg);background-size:cover;background-position:calc(100% + 100px) 35%;background-repeat:no-repeat;opacity:1;transition:none;will-change:auto}
.aa-stage-shade{position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(180deg,rgba(7,6,5,.38),rgba(7,6,5,.25) 45%,rgba(7,6,5,.78)),radial-gradient(ellipse at 50% 45%,transparent 20%,rgba(7,6,5,.55) 100%)}
.aa-stage>.aa-halo{z-index:2}
@media(max-width:640px){.aa-stage-background{background-image:var(--mobile-bg);background-position:center center;background-size:cover}.aa-stage-shade{background:linear-gradient(180deg,rgba(7,6,5,.42),rgba(7,6,5,.24) 42%,rgba(7,6,5,.8)),radial-gradient(ellipse at 50% 45%,transparent 10%,rgba(7,6,5,.5) 100%)}}
.aa-halo{display:none}
.aa-hero-title{font-family:var(--fd);font-weight:900;text-transform:uppercase;font-size:clamp(4.2rem,17vw,12rem);line-height:.84;letter-spacing:-.01em;text-shadow:0 20px 70px rgba(0,0,0,.6)}
.aa-hero-lockup{position:relative;display:flex;flex-direction:column;align-items:center;margin-top:clamp(15rem,49vh,30rem);padding:0 0 1.25rem;max-width:100%;}
.aa-icon-star{display:flex;align-items:center;justify-content:center;gap:clamp(.65rem,2vw,1.5rem);margin-bottom:.55rem;color:#f2d79b;font-size:clamp(.72rem,1.35vw,1.05rem);font-weight:500;letter-spacing:clamp(.28rem,1.1vw,.75rem);white-space:nowrap;text-shadow:0 0 22px rgba(255,190,82,.25)}
.aa-icon-star span{display:block;width:clamp(2rem,6vw,5rem);height:1px;background:linear-gradient(90deg,transparent,#dca33d)}
.aa-icon-star span:last-child{transform:scaleX(-1)}
.aa-hero-title{font-family:var(--fd);font-weight:900;text-transform:uppercase;font-size:clamp(3.4rem,10.5vw,8.8rem);line-height:.82;letter-spacing:.025em;text-shadow:0 12px 50px rgba(0,0,0,.8);}
.aa-letter{background:linear-gradient(180deg,#fff6d9 5%,#f2d38a 48%,#a96b22 100%);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 4px 20px rgba(255,174,51,.14))}
.aa-name-flare{position:absolute;left:50%;bottom:.3rem;transform:translateX(-50%);width:min(90%,36rem);height:1px;background:linear-gradient(90deg,transparent,rgba(218,157,55,.65),transparent);box-shadow:0 0 18px rgba(255,177,46,.35)}
.aa-name-flare::after{content:"";position:absolute;left:50%;top:50%;width:5px;height:5px;transform:translate(-50%,-50%) rotate(45deg);background:#fff1c4;box-shadow:0 0 12px 4px rgba(255,190,88,.7)}
@media(max-width:640px){.aa-hero-lockup{margin-top:clamp(13rem,43vh,23rem);padding-inline:.25rem}.aa-hero-title{font-size:clamp(3.15rem,14vw,5.8rem)}.aa-icon-star{letter-spacing:.25rem}.aa-icon-star span{width:1.5rem}}
/* Laptop and desktop only: move the ICON STAR + Allu Arjun lockup slightly lower. */
@media (min-width: 1024px){.aa-hero-lockup{margin-top:calc(clamp(15rem,49vh,30rem) + 2rem);position:relative;top:30px;left:clamp(-450px,-50vw,-450px)}}

.aa-letter{display:inline-block;background:linear-gradient(180deg,#fff 8%,#e9ddc5 58%,#b6a07a);-webkit-background-clip:text;background-clip:text;color:transparent;animation:aaLetterIn 1.2s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(1.5s + var(--i)*.08s)}
@keyframes aaLetterIn{from{opacity:0;filter:blur(16px);transform:translateY(36px) scale(1.1)}to{opacity:1;filter:none;transform:none}}
.aa-rise{animation:aaRise 1s cubic-bezier(.2,.7,.2,1) both;animation-delay:var(--d,1.9s)}
@keyframes aaRise{from{opacity:0;transform:translateY(22px);filter:blur(6px)}to{opacity:1;transform:none;filter:none}}
.aa-hint{position:absolute;bottom:1.6rem;left:0;right:0;text-align:center;font-size:.78rem;color:rgba(240,232,216,.35);animation:aaRise 1s ease 2.6s both}
@media (hover:none){.aa-hint-pc{display:none}}@media (hover:hover){.aa-hint-touch{display:none}}

/* ---------- marquee ---------- */
.aa-mq{overflow:hidden;border-block:1px solid var(--line);background:#0a0908;padding:1.1rem 0}
.aa-mq-t{display:flex;width:max-content;gap:2rem;animation:aaMq 120s linear infinite;font-family:var(--fd);font-weight:800;text-transform:uppercase;font-size:2.4rem;color:transparent;-webkit-text-stroke:1px rgba(240,232,216,.3)}
.aa-mq-t span{display:flex;align-items:center;gap:2rem;white-space:nowrap}.aa-mq-t em{font-style:normal;font-size:.8rem;color:var(--saffron);-webkit-text-stroke:0}
@keyframes aaMq{to{transform:translateX(-50%)}}

/* ---------- sections + headings ---------- */
.aa-sec{position:relative;padding:6rem 1.5rem;border-top:1px solid var(--line);background:radial-gradient(circle at 90% 6%,rgba(194,72,31,.1),transparent 38%),var(--ink)}
@media(min-width:768px){.aa-sec{padding:9rem 2.5rem}}
.aa-head{margin-bottom:3.2rem;max-width:46rem}
.aa-kk{display:flex;align-items:center;gap:.8rem;color:var(--saffron);font-weight:600;font-size:.9rem;letter-spacing:.02em}
.aa-kk::before{content:"";height:2px;width:0;background:var(--saffron);transition:width 1s .2s}.aa-kk.in::before{width:2.4rem}
.aa-h2{font-family:var(--fd);font-weight:800;text-transform:uppercase;font-size:clamp(3rem,9vw,7rem);line-height:.88;letter-spacing:-.005em;margin-top:1rem}
.aa-ln{display:block;overflow:hidden;padding-bottom:.08em}.aa-ln.dim{color:transparent;-webkit-text-stroke:1.2px rgba(240,232,216,.42)}
.aa-ln>span{display:block;transform:translateY(105%);transition:transform 1.1s cubic-bezier(.2,.7,.2,1) calc(var(--l,0)*.13s)}.aa-ln.in>span{transform:none}
.aa-kk,.aa-lead{opacity:0;transform:translateY(16px);transition:opacity .9s,transform .9s cubic-bezier(.2,.7,.2,1)}.aa-kk.in,.aa-lead.in{opacity:1;transform:none}
.aa-lead{margin-top:1.4rem;max-width:36rem;color:#a89f90;line-height:1.8}.aa-lead.big{margin-top:0;font-size:1.12rem;color:#c8bfaf}
[data-r].aa-ln{opacity:1;transform:none}

/* ---------- profile ---------- */
.aa-frame{position:relative;aspect-ratio:3/4;max-height:78vh;padding:14px;margin-bottom:2.4rem;opacity:0;transform:translateY(24px);transition:opacity .9s,transform .9s cubic-bezier(.2,.7,.2,1)}.aa-frame.in{opacity:1;transform:none}
.aa-frame-in{position:relative;width:100%;height:100%;overflow:hidden;background:#0d0b0a}
.aa-frame-in::after{content:"";position:absolute;inset:0;background:linear-gradient(0deg,rgba(7,6,5,.5),transparent 40%)}
.aa-frame i{position:absolute;width:26px;height:26px;border:2px solid var(--saffron)}
.aa-frame .c1{left:0;top:0;border-right:0;border-bottom:0}.aa-frame .c2{right:0;top:0;border-left:0;border-bottom:0}.aa-frame .c3{left:0;bottom:0;border-right:0;border-top:0}.aa-frame .c4{right:0;bottom:0;border-left:0;border-top:0}
.aa-frame figcaption{position:absolute;left:14px;bottom:-1.9rem;font-size:.8rem;color:var(--steel)}
.aa-facts{margin-top:2.4rem;display:grid;grid-template-columns:1fr 1fr;border-top:1px solid var(--line)}
.aa-facts div{padding:1.2rem 0;border-bottom:1px solid var(--line)}.aa-facts dt{font-size:.85rem;color:var(--steel)}.aa-facts dd{margin-top:.35rem;font-family:var(--fd);font-weight:700;font-size:1.7rem;text-transform:uppercase;line-height:1}
.aa-stats{margin-top:2rem;display:grid;grid-template-columns:repeat(2,1fr);gap:1.4rem}@media(min-width:640px){.aa-stats{grid-template-columns:repeat(4,1fr)}}
.aa-stats b{display:block;font-family:var(--fd);font-weight:900;font-size:clamp(2.8rem,6vw,4.2rem);line-height:.9;color:var(--saffron)}.aa-stats small{display:block;margin-top:.5rem;font-size:.82rem;color:var(--steel)}

/* ---------- filmography: projector + film strip ---------- */
.aa-proj{display:grid;gap:2.5rem;margin-top:1rem}
@media(min-width:1024px){.aa-proj{grid-template-columns:minmax(0,.75fr) minmax(0,1.25fr);align-items:center;gap:5rem}}
.aa-proj-poster{position:relative;width:100%;max-width:380px}
.aa-cone{position:absolute;inset:-14% -26% -6%;pointer-events:none;background:radial-gradient(ellipse at 50% 0,rgba(255,196,120,.2),transparent 66%)}
.aa-poster{position:relative;aspect-ratio:2/3;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.6);animation:aaWipe .9s cubic-bezier(.77,0,.18,1)}
@keyframes aaWipe{from{clip-path:inset(0 0 100% 0);transform:scale(1.06)}to{clip-path:inset(0);transform:none}}
.aa-year{font-family:var(--fd);font-weight:900;font-size:clamp(5.5rem,17vw,12.5rem);line-height:.8;color:transparent;-webkit-text-stroke:1.5px rgba(255,177,46,.6);animation:aaUp .6s cubic-bezier(.2,.7,.2,1)}
@keyframes aaUp{from{opacity:0;transform:translateY(22px)}}
.aa-ftitle{margin-top:1rem;font-family:var(--fd);font-weight:800;text-transform:uppercase;font-size:clamp(2.2rem,5.4vw,4.4rem);line-height:.92;animation:aaUp .6s cubic-bezier(.2,.7,.2,1) .05s backwards}
.aa-honours{margin-top:1.4rem;display:flex;flex-wrap:wrap;gap:.5rem;list-style:none;padding:0}
.aa-honours li{border:1px solid var(--line);border-radius:999px;padding:.35rem .85rem;font-size:.78rem;color:#b9b0a1}.aa-honours li.nat{border-color:rgba(255,177,46,.6);color:var(--saffron)}.aa-honours li.more{border-style:dashed;color:var(--steel)}
.aa-round{display:flex;height:3rem;width:3rem;align-items:center;justify-content:center;border-radius:50%;border:1px solid var(--line);font-size:1.1rem;transition:background .3s,color .3s,border-color .3s,transform .35s cubic-bezier(.16,1,.3,1)}
.aa-round:hover{background:var(--saffron);color:#000;border-color:var(--saffron);transform:scale(1.08)}
.aa-strip{margin-top:3.4rem;display:flex;gap:10px;overflow-x:auto;padding:30px 14px;border-block:1px solid var(--line);background-color:#0b0a09;background-image:radial-gradient(circle,#1f1b17 0 3px,transparent 3.5px),radial-gradient(circle,#1f1b17 0 3px,transparent 3.5px);background-size:22px 14px,22px 14px;background-position:0 5px,0 calc(100% - 5px);background-repeat:repeat-x;background-attachment:local}
.aa-frame-btn{flex:none;width:84px;opacity:.5;filter:grayscale(.65);transition:opacity .35s,filter .35s,transform .45s cubic-bezier(.16,1,.3,1)}
.aa-frame-btn:hover{opacity:.95;filter:none}
.aa-frame-btn.on{opacity:1;filter:none;transform:translateY(-6px) scale(1.08)}
.aa-thumb{position:relative;display:block;aspect-ratio:2/3;overflow:hidden;border:2px solid transparent;background:#14110f;transition:border-color .3s}
.aa-frame-btn.on .aa-thumb{border-color:var(--saffron);box-shadow:0 10px 30px rgba(255,177,46,.25)}
.aa-fy{display:block;margin-top:.5rem;font-size:.72rem;color:var(--steel);text-align:center;font-variant-numeric:tabular-nums}.aa-frame-btn.on .aa-fy{color:var(--saffron)}

/* ---------- poster cards ---------- */
.aa-card-img{position:relative;aspect-ratio:2/3;overflow:hidden;border-radius:4px;background:#0d0b0a;border:1px solid rgba(240,232,216,.08);transition:border-color .4s,box-shadow .5s,transform .5s cubic-bezier(.16,1,.3,1)}
.aa-card:hover .aa-card-img{border-color:rgba(255,177,46,.45);box-shadow:0 28px 64px rgba(0,0,0,.6);transform:translateY(-6px)}
.aa-card-img img{transition:transform 1.1s cubic-bezier(.2,.7,.2,1);filter:saturate(.92)}.aa-card:hover .aa-card-img img{transform:scale(1.05);filter:none}
.aa-sheen{position:absolute;inset:0;pointer-events:none;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,.2) 47%,transparent 62%);transform:translateX(-130%);transition:transform .9s cubic-bezier(.2,.7,.2,1)}.aa-card:hover .aa-sheen{transform:translateX(130%)}
.aa-chip{position:absolute;top:.7rem;left:.7rem;z-index:2;border-radius:9999px;background:rgba(7,6,5,.72);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);padding:.25rem .75rem;font-size:.74rem}
.aa-card figcaption{margin-top:.9rem;font-weight:500;font-size:1.02rem}
.aa-row{display:flex;align-items:baseline;gap:1.5rem;padding:1.4rem 0;border-bottom:1px solid var(--line);transition:padding .4s}
.aa-row:hover{padding-left:.8rem}.aa-row span{width:4rem;color:var(--steel);font-variant-numeric:tabular-nums}.aa-row h3{font-family:var(--fd);font-weight:800;text-transform:uppercase;font-size:clamp(1.9rem,3.6vw,3rem);line-height:1}

/* ---------- birthday ---------- */
.aa-ghost{position:absolute;right:-2%;top:6%;font-family:var(--fd);font-weight:900;text-transform:uppercase;font-size:clamp(8rem,28vw,24rem);line-height:.8;color:transparent;-webkit-text-stroke:1px rgba(240,232,216,.07);pointer-events:none;white-space:nowrap}
.aa-clock{display:grid;grid-template-columns:repeat(2,1fr);gap:1.4rem 2rem}@media(min-width:768px){.aa-clock{grid-template-columns:repeat(4,1fr)}}
.aa-clock p{font-family:var(--fd);font-weight:900;font-size:clamp(4.6rem,11vw,9rem);line-height:.82;font-variant-numeric:tabular-nums}.aa-clock .hot{color:var(--saffron)}
.aa-bar{display:block;height:2px;margin-top:1.2rem;background:var(--line);overflow:hidden}.aa-bar i{display:block;height:100%;background:linear-gradient(90deg,var(--rust),var(--saffron));transition:width 1s linear}
.aa-clock small{display:block;margin-top:.8rem;color:var(--steel);font-size:.85rem}
.aa-tick{display:inline-block;animation:aaTick .55s cubic-bezier(.2,.7,.2,1)}@keyframes aaTick{from{opacity:0;transform:translateY(35%)}}
.aa-confetti{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.aa-confetti i{position:absolute;top:-14px;left:var(--x);width:7px;height:12px;background:var(--saffron);animation:aaFall var(--d) linear var(--dl) infinite}
.aa-confetti i:nth-child(3n+2){background:var(--rust)}.aa-confetti i:nth-child(3n){background:var(--bone)}
@keyframes aaFall{to{transform:translateY(560px) rotate(540deg)}}

/* ---------- awards ---------- */
.aa-awards{background:radial-gradient(circle at 8% 10%,rgba(194,72,31,.13),transparent 32%),#080605}
.aa-bign{font-family:var(--fd);font-weight:900;font-size:clamp(3.6rem,7vw,5.6rem);line-height:.88;color:var(--saffron)}.aa-sm{color:var(--steel);font-size:.85rem}
.aa-chips{display:flex;flex-wrap:wrap;gap:.6rem;margin-bottom:2.4rem}
.aa-fchip{border:1px solid var(--line);border-radius:999px;padding:.55rem 1.05rem;font-size:.85rem;color:var(--steel);transition:background .3s,color .3s,border-color .3s,transform .3s}
.aa-fchip sup{margin-left:.45rem;font-size:.68rem;opacity:.7}.aa-fchip:hover{color:var(--bone);border-color:rgba(255,177,46,.5)}
.aa-fchip[aria-pressed="true"]{background:var(--saffron);color:#1b0f00;border-color:var(--saffron);font-weight:600}
.aa-aw-grid{display:grid;column-gap:4.5rem}@media(min-width:768px){.aa-aw-grid{grid-template-columns:1fr 1fr}}
.aa-aw{padding:1.9rem 0;border-top:1px solid var(--line);animation:aaUp .6s cubic-bezier(.2,.7,.2,1) backwards;animation-delay:calc(var(--i,0)*60ms)}
.aa-aw h3{font-family:var(--fd);font-weight:800;text-transform:uppercase;font-size:clamp(1.8rem,2.8vw,2.5rem);line-height:1}
.aa-aw ul{margin-top:.9rem;display:grid;gap:.55rem;list-style:none;padding:0}.aa-aw li{font-size:.86rem;line-height:1.5;color:#a89f90}.aa-aw li.nat{color:var(--saffron);font-weight:600}

/* ---------- social ---------- */
.aa-soc{display:flex;align-items:baseline;justify-content:space-between;padding:1.5rem 0;border-bottom:1px solid var(--line);transition:padding .4s,color .3s}
.aa-soc span:first-child{font-family:var(--fd);font-weight:800;text-transform:uppercase;font-size:clamp(2.4rem,6vw,4.6rem);line-height:1}.aa-soc-a{color:var(--steel);font-size:.9rem}.aa-soc-a i{font-style:normal;color:var(--saffron);display:inline-block;transition:transform .3s}
.aa-soc:hover{padding-inline:1rem;color:var(--saffron)}.aa-soc:hover i{transform:translate(3px,-3px)}

/* ---------- contact ---------- */
.aa-closing{background:radial-gradient(ellipse at 50% 0,rgba(255,177,46,.09),transparent 55%),var(--ink)}
.aa-form{display:grid;gap:1.4rem;padding:1.6rem;border:1px solid var(--line);border-radius:1.2rem;background:rgba(240,232,216,.03)}@media(min-width:768px){.aa-form{padding:2.2rem}}
.aa-field{display:grid;gap:.6rem;border:0;padding:0;margin:0;min-width:0}
.aa-field>span,.aa-field>legend{font-size:.85rem;font-weight:500;color:#c8bfaf;padding:0}.aa-field em{font-style:normal;color:var(--steel);margin-left:.4rem;font-weight:400}
.aa-field input,.aa-field textarea{width:100%;border-radius:.8rem;border:1px solid var(--line);background:rgba(0,0,0,.4);padding:.9rem 1rem;color:var(--bone);font:inherit;font-size:.95rem;outline:none;transition:border-color .3s,box-shadow .3s;resize:vertical}
.aa-field input::placeholder,.aa-field textarea::placeholder{color:rgba(240,232,216,.25)}
.aa-field input:focus,.aa-field textarea:focus{border-color:rgba(255,177,46,.7);box-shadow:0 0 0 4px rgba(255,177,46,.12)}
.aa-topics{display:flex;flex-wrap:wrap;gap:.5rem}
.aa-topics button{border:1px solid var(--line);border-radius:999px;padding:.5rem 1rem;font-size:.85rem;color:var(--steel);transition:background .3s,color .3s,border-color .3s}
.aa-topics button:hover{color:var(--bone);border-color:rgba(255,177,46,.5)}.aa-topics button[aria-pressed="true"]{background:var(--saffron);border-color:var(--saffron);color:#1b0f00;font-weight:600}
.aa-err{color:#ff9d7e;font-size:.85rem}
.aa-direct{display:grid;gap:1rem;align-content:start}
.aa-dc{display:block;border:1px solid var(--line);border-radius:1.2rem;padding:1.4rem;background:rgba(240,232,216,.03);transition:border-color .35s,transform .45s cubic-bezier(.16,1,.3,1),background .3s}.aa-contact-profile{display:flex;align-items:center;gap:1rem;min-height:112px}.aa-contact-pfp{width:68px;height:68px;flex:none;border-radius:50%;object-fit:cover;border:2px solid rgba(255,177,46,.7);background:#17120c;box-shadow:0 0 0 4px rgba(255,177,46,.08)}.aa-contact-fallback{display:grid;place-items:center;color:var(--saffron);font-size:1.65rem;font-weight:800}.aa-contact-profile-copy{min-width:0}.aa-contact-profile-copy small{display:block;margin-top:.4rem;color:var(--steel);font-size:.75rem}.aa-contact-profile-copy .aa-dc-main{margin-top:.3rem}
.aa-dc>p{font-size:.82rem;color:var(--steel)}.aa-dc-main{display:block;margin-top:.55rem;font-size:1.05rem;font-weight:600;word-break:break-word}.aa-dc-main i{font-style:normal;color:var(--saffron)}
.aa-dc-link:hover{border-color:rgba(255,177,46,.55);transform:translateY(-3px);background:rgba(255,177,46,.05)}

a.aa-dc-main:hover{color:var(--saffron)}
.aa-social-profiles{display:grid;gap:.65rem;padding:1.2rem;border:1px solid var(--line);border-radius:1.2rem;background:linear-gradient(145deg,rgba(255,177,46,.065),rgba(240,232,216,.018))}
.aa-social-kicker{font-size:.72rem;letter-spacing:.19em;color:var(--saffron);margin:0 0 .35rem}
.aa-profile-link{display:flex;align-items:center;gap:.85rem;min-width:0;padding:.8rem;border:1px solid rgba(240,232,216,.075);border-radius:.9rem;background:rgba(0,0,0,.2);transition:transform .25s,border-color .25s,background .25s}
.aa-profile-link:hover{transform:translateX(4px);border-color:rgba(255,177,46,.45);background:rgba(255,177,46,.055)}
.aa-avatar-wrap{position:relative;display:grid;place-items:center;flex:none;width:48px;height:48px;border-radius:50%;overflow:hidden;border:1px solid rgba(255,177,46,.45);background:#17120c}
.aa-avatar-wrap img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1}
.aa-avatar-fallback{font-size:1.25rem;color:var(--saffron);font-weight:700}
.aa-profile-copy{display:grid;gap:.2rem;min-width:0;flex:1}
.aa-profile-copy strong{font-size:.92rem;color:var(--bone)}
.aa-profile-copy small{font-size:.76rem;color:var(--steel);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.aa-profile-action{font-size:.76rem;color:var(--saffron);white-space:nowrap}

.aa-copy{margin-top:1rem;border:1px solid var(--line);border-radius:999px;padding:.45rem 1rem;font-size:.8rem;color:#c8bfaf;transition:background .3s,color .3s,border-color .3s}.aa-copy:hover{background:var(--saffron);color:#1b0f00;border-color:var(--saffron)}

.aa-end{overflow:hidden;border-block:1px solid var(--line);background:#030303;padding:1rem 0;color:rgba(240,232,216,.3)}
.aa-end>div{display:flex;width:max-content;align-items:center;gap:2rem;font-family:var(--fd);font-weight:700;font-size:.85rem;letter-spacing:.2em;animation:aaMq 40s linear infinite}.aa-end i{width:4px;height:4px;border-radius:50%;background:var(--saffron);display:block}
.aa-foot{border-top:1px solid var(--line);background:#000;padding:2.5rem 1.5rem}@media(min-width:768px){.aa-foot{padding:2.5rem}}

@media(max-width:640px){
  .aa-mq-t{font-size:1.8rem}
  .aa-row{gap:1rem}
  .aa-row span{width:3.2rem}
  .aa-hint{bottom:1rem}

  /* Mobile: 17.png is used only behind the home hero. */
  .aa-site{
    background-color:var(--ink);
    background-image:none;
  }
  .aa-stage{
    background-color:var(--ink);
    background-image:none;
  }
}

/* Laptop/desktop: 16.png is used only on the home hero. */
@media(min-width:641px){
  .aa-stage{
    background-color:var(--ink);
    background-image:none;
  }
}
@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}.aa-grain{display:none}
  .aa-letter,.aa-rise,.aa-hint,.aa-mq-t,.aa-end>div,.aa-confetti i,.aa-tick,.aa-poster,.aa-year,.aa-ftitle,.aa-aw{animation:none!important}
    [data-r],.aa-ln>span,.aa-kk,.aa-lead,.aa-frame{opacity:1!important;transform:none!important;transition:none!important}
}
`;
