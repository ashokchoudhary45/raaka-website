"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type MouseEvent as ReactMouseEvent } from "react";

const cssVars = (o: Record<string, string | number>) => o as unknown as CSSProperties;
const pad = (n: number) => String(n).padStart(2, "0");

/* =====================================================================
   HOW TO ADD A STORY (3 steps)
   1. Create the article folder:  app/news/<slug>/page.tsx
   2. Add ONE object to ARTICLES below, with slug = the folder name.
   3. Done. The card, filters, search, month grouping and the click-through
      to /news/<slug> all pick it up automatically.
   ===================================================================== */
type Article = {
  slug: string;        // folder name inside app/news/
  title: string;
  excerpt: string;
  date: string;        // ISO: YYYY-MM-DD
  category: string;    // groups the filter chips
  tags?: string[];
  cover?: string;      // /images/....jpg  (optional: a typographic cover is generated without it)
  coverAlt?: string;
  readMin?: number;
  accent?: string;     // optional tint, e.g. "#E5303A"
  featured?: boolean;  // pins this story as the top story (otherwise the newest one leads)
  hidden?: boolean;    // keep a story out of the portal while it is a draft
};

const ARTICLES: Article[] = [
  {
    slug: "raaka-guinness",
    title: "RAAKA Makes History with a Guinness World Record for Real-Time Motion Capture",
    excerpt: "37 performers were captured simultaneously in real time as Allu Arjun and Atlee's ambitious project achieves a major technological milestone for Indian cinema.",
    date: "2026-09-22",
    category: "Production",
    tags: ["Guinness World Record", "Motion Capture", "Allu Arjun", "Atlee"],
    cover: "/images/raaka-guinness-1.jpg",
    coverAlt: "RAAKA Guinness World Records achievement",
    readMin: 3,
  },

  /* TEMPLATES for the two folders already in app/news: fill in, then remove the comment markers.
  {
    slug: "raaka1",
    title: "",
    excerpt: "",
    date: "2026-09-27",
    category: "",
    cover: "/images/....jpg",
  },
  {
    slug: "raaka2",
    title: "",
    excerpt: "",
    date: "2026-09-27",
    category: "",
    cover: "/images/....jpg",
  },
  */
];

/* ---------------- derived data ---------------- */
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const parts = (iso: string) => { const [y, m, d] = iso.split("-").map(Number); return { y, m: m - 1, d }; };
const fmtDate = (iso: string) => { const { y, m, d } = parts(iso); return `${pad(d)} ${MONTHS[m]} ${y}`; };
const monthKey = (iso: string) => iso.slice(0, 7);
const monthLabel = (iso: string) => { const { y, m } = parts(iso); return `${MONTHS_LONG[m]} ${y}`; };

const PUBLISHED = ARTICLES.filter((a) => !a.hidden && a.title && a.slug);
const CATEGORIES = ["All", ...Array.from(new Set(PUBLISHED.map((a) => a.category).filter(Boolean)))];
const byNewest = (a: Article, b: Article) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0);

/* the logo is used exactly twice on this page: <Logo> in the nav and <Logo> in the closing scene */
const Logo = ({ className, decorative }: { className: string; decorative?: boolean }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src="/images/raaka-logo.png" alt={decorative ? "" : "RAAKA"} aria-hidden={decorative || undefined} draggable={false} className={className} />
);

const Letters = ({ w }: { w: string }) => (
  <>{w.split("").map((c, i) => (<span key={i} className="lt-w" aria-hidden="true"><span className="lt" style={cssVars({ "--i": i })}>{c}</span></span>))}</>
);

/* pointer feed for cards: spotlight position and a few degrees of tilt */
const pt = (e: ReactPointerEvent<HTMLElement>) => {
  const el = e.currentTarget, r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
  el.style.setProperty("--rx", ((0.5 - y) * 3).toFixed(2) + "deg");
  el.style.setProperty("--ry", ((x - 0.5) * 4).toFixed(2) + "deg");
  el.style.setProperty("--mx", x * 100 + "%");
  el.style.setProperty("--my", y * 100 + "%");
};
const unpt = (e: ReactPointerEvent<HTMLElement>) => { e.currentTarget.style.setProperty("--rx", "0deg"); e.currentTarget.style.setProperty("--ry", "0deg"); };

function Cover({ a, sizes, priority }: { a: Article; sizes: string; priority?: boolean }) {
  const [bad, setBad] = useState(false);
  if (a.cover && !bad) {
    return <Image src={a.cover} alt={a.coverAlt ?? a.title} fill sizes={sizes} priority={priority} className="cv-img" onError={() => setBad(true)} />;
  }
  /* no cover (or it failed to load): a typographic cover keeps the card looking intentional */
  return (
    <div className="cv-fb" style={{ ["--ac" as string]: a.accent ?? "#E5303A" }} aria-hidden="true">
      <span className="xp">{a.title.trim().charAt(0)}</span>
    </div>
  );
}

export default function NewsPortalPage() {
  const router = useRouter();
  const [go, setGo] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"new" | "old">("new");
  const [leaving, setLeaving] = useState(false);
  const progRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const ioRef = useRef<IntersectionObserver | null>(null);

  const query = q.trim().toLowerCase();
  const results = useMemo(() => {
    const list = PUBLISHED.filter((a) =>
      (filter === "All" || a.category === filter) &&
      (!query || [a.title, a.excerpt, a.category, ...(a.tags ?? [])].join(" ").toLowerCase().includes(query)));
    return list.sort(sort === "new" ? byNewest : (x, y) => byNewest(y, x));
  }, [filter, query, sort]);

  /* default view: one top story, then the rest grouped by month. Any filter or search shows plain results. */
  const defaultView = filter === "All" && !query && sort === "new";
  const top = defaultView ? (PUBLISHED.find((a) => a.featured) ?? [...PUBLISHED].sort(byNewest)[0]) : undefined;
  const rest = top ? results.filter((a) => a.slug !== top.slug) : results;
  const groups = useMemo(() => {
    const out: { key: string; label: string; items: Article[] }[] = [];
    for (const a of rest) {
      const k = monthKey(a.date);
      const g = out.find((x) => x.key === k);
      if (g) g.items.push(a); else out.push({ key: k, label: monthLabel(a.date), items: [a] });
    }
    return out;
  }, [rest]);

  const latest = [...PUBLISHED].sort(byNewest)[0];
  const resultKey = results.map((r) => r.slug).join("|") + filter + sort;

  useEffect(() => {
    const t = requestAnimationFrame(() => setGo(true));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tracked = Array.from(document.querySelectorAll<HTMLElement>("[data-p]"));
    let raf = 0;
    const run = () => {
      raf = 0;
      const h = document.documentElement, max = h.scrollHeight - h.clientHeight, vh = window.innerHeight;
      progRef.current?.style.setProperty("transform", "scaleX(" + (max > 0 ? h.scrollTop / max : 0) + ")");
      setScrolled(h.scrollTop > 40);
      if (reduce) return;
      heroRef.current?.style.setProperty("--sy", Math.min(h.scrollTop, 900) + "px");
      document.querySelectorAll<HTMLElement>("[data-p]").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        el.style.setProperty("--p", Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height))).toFixed(3));
      });
    };
    void tracked;
    const on = () => { if (!raf) raf = requestAnimationFrame(run); };
    run();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on, { passive: true });
    ioRef.current = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); ioRef.current?.unobserve(e.target); } }), { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });
    const back = (e: PageTransitionEvent) => { if (e.persisted) setLeaving(false); };
    window.addEventListener("pageshow", back);
    /* "/" focuses the search field */
    const key = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      if (e.key === "/" && !(el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA"))) { e.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener("keydown", key);
    return () => { cancelAnimationFrame(t); if (raf) cancelAnimationFrame(raf); window.removeEventListener("scroll", on); window.removeEventListener("resize", on); window.removeEventListener("pageshow", back); window.removeEventListener("keydown", key); ioRef.current?.disconnect(); };
  }, []);

  /* observe anything new that appears after a filter or search change */
  useEffect(() => {
    document.querySelectorAll("[data-r]:not(.in)").forEach((el) => ioRef.current?.observe(el));
  }, [resultKey, query, go]);

  /* opening a story: a short curtain wipe, then the real route. Modified clicks (new tab) are left alone. */
  const open = (e: ReactMouseEvent<HTMLAnchorElement>, slug: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    setLeaving(true);
    window.setTimeout(() => router.push(`/news/${slug}`), 520);
  };
  const warm = (slug: string) => { try { router.prefetch(`/news/${slug}`); } catch { /* prefetch is optional */ } };

  const resetAll = () => { setFilter("All"); setQ(""); setSort("new"); };

  const Card = ({ a, i }: { a: Article; i: number }) => (
    <article className="card" data-r="up" style={cssVars({ "--i": i % 3, "--ac": a.accent ?? "#E5303A" })} onPointerMove={pt} onPointerLeave={unpt}>
      <Link href={`/news/${a.slug}`} className="card-a" onClick={(e) => open(e, a.slug)} onPointerEnter={() => warm(a.slug)} onFocus={() => warm(a.slug)} aria-label={`Read: ${a.title}`}>
        <div className="card-in">
          <div className="cv"><Cover a={a} sizes="(max-width:700px) 92vw, (max-width:1100px) 46vw, 30vw" /><span className="cv-shade" /><span className="sweep" /><span className="cv-cat">{a.category}</span></div>
          <div className="card-b">
            <p className="meta"><time dateTime={a.date}>{fmtDate(a.date)}</time>{a.readMin ? <><i />{a.readMin} min read</> : null}</p>
            <h3 className="card-t">{a.title}</h3>
            <p className="card-x">{a.excerpt}</p>
            <div className="card-f"><span className="tags">{(a.tags ?? []).slice(0, 2).map((t) => (<em key={t}>{t}</em>))}</span><span className="go">Read story <b aria-hidden="true">→</b></span></div>
          </div>
        </div>
        <span className="spot" aria-hidden="true" />
      </Link>
    </article>
  );

  return (
    <main className="np">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="progress" ref={progRef} aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <div className={"wipe" + (leaving ? " on" : "")} aria-hidden="true"><span>Opening story</span></div>

      {/* ============ NAV (logo, use 1 of 2) ============ */}
      <header className={"nav" + (scrolled ? " s" : "") + (go ? " go" : "")}>
        <div className="nav-in">
          <Link href="/" className="brand" aria-label="World of RAAKA, back to home">
            <Logo className="logo-s" />
            <span className="brand-t">News</span>
          </Link>
          <Link href="/" className="back">← Back to World</Link>
        </div>
      </header>

      {/* ============ MASTHEAD ============ */}
      <section ref={heroRef} className={"hero" + (go ? " go" : "")} aria-labelledby="np-h1">
        <div className="rules" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="shaft" aria-hidden="true" />
        <div className="vig" aria-hidden="true" />
        <div className="hero-in">
          <p className="kick">The latest from the world of RAAKA</p>
          <h1 id="np-h1" className="h1 xp" aria-label="News"><Letters w="NEWS" /></h1>
          <div className="hero-row">
            <p className="lead">Stories, milestones and behind-the-scenes updates from the world of RAAKA, all in one place.</p>
            <dl className="stats">
              <div><dt>Stories</dt><dd className="xp tnum">{pad(PUBLISHED.length)}</dd></div>
              <div><dt>Sections</dt><dd className="xp tnum">{pad(CATEGORIES.length - 1)}</dd></div>
              {latest && <div><dt>Latest</dt><dd className="xp tnum">{fmtDate(latest.date)}</dd></div>}
            </dl>
          </div>
        </div>
      </section>

      {PUBLISHED.length > 0 && (
        <div className="mq" aria-hidden="true">
          <div className="mq-t xp">
            {Array.from({ length: 4 }).flatMap((_, k) => [...PUBLISHED].sort(byNewest).map((a, i) => (<span key={k + "-" + i}>{a.title}<em>●</em></span>)))}
          </div>
        </div>
      )}

      {/* ============ CONTROLS ============ */}
      <section className="ctl" aria-label="Browse stories">
        <div className="wrap ctl-in">
          <div className="chips" role="group" aria-label="Sections">
            {CATEGORIES.map((c) => (
              <button key={c} type="button" className={"chip" + (filter === c ? " on" : "")} aria-pressed={filter === c} onClick={() => setFilter(c)}>{c}</button>
            ))}
          </div>
          <div className="tools">
            <label className="search">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></svg>
              <input ref={searchRef} value={q} onChange={(e: { target: { value: string } }) => setQ(e.target.value)} onKeyDown={(e: { key: string }) => { if (e.key === "Escape") setQ(""); }} placeholder="Search stories" aria-label="Search stories" />
              <kbd aria-hidden="true">/</kbd>
            </label>
            <button type="button" className="sort" onClick={() => setSort((s) => (s === "new" ? "old" : "new"))} aria-label={`Sort by ${sort === "new" ? "oldest" : "newest"} first`}>
              {sort === "new" ? "Newest" : "Oldest"} <i aria-hidden="true">{sort === "new" ? "↓" : "↑"}</i>
            </button>
          </div>
        </div>
      </section>

      {/* ============ STORIES ============ */}
      <section className="stories" aria-live="polite">
        <div className="wrap">
          {top && (
            <article className="top" data-r="up" onPointerMove={pt} onPointerLeave={unpt} style={cssVars({ "--ac": top.accent ?? "#E5303A" })}>
              <Link href={`/news/${top.slug}`} className="top-a" onClick={(e) => open(e, top.slug)} onPointerEnter={() => warm(top.slug)} onFocus={() => warm(top.slug)} aria-label={`Read top story: ${top.title}`}>
                <div className="top-cv" data-p>
                  <div className="px"><Cover a={top} sizes="(max-width:1000px) 92vw, 62vw" priority /></div>
                  <span className="cv-shade" /><span className="sweep" />
                  <span className="top-tag">Top story</span>
                </div>
                <div className="top-b">
                  <p className="meta"><span className="cat">{top.category}</span><i /><time dateTime={top.date}>{fmtDate(top.date)}</time>{top.readMin ? <><i />{top.readMin} min read</> : null}</p>
                  <h2 className="top-t">{top.title}</h2>
                  <p className="top-x">{top.excerpt}</p>
                  {top.tags && <p className="tags big">{top.tags.map((t) => (<em key={t}>{t}</em>))}</p>}
                  <span className="cta">Read the story <b aria-hidden="true">→</b></span>
                </div>
                <span className="spot" aria-hidden="true" />
              </Link>
            </article>
          )}

          {groups.map((g) => (
            <div key={g.key} className="grp">
              <header className="grp-h" data-r="up"><h2 className="xp">{g.label}</h2><span className="tnum">{pad(g.items.length)} {g.items.length === 1 ? "story" : "stories"}</span></header>
              <div className="grid">{g.items.map((a, i) => (<Card key={a.slug} a={a} i={i} />))}</div>
            </div>
          ))}

          {results.length === 0 && (
            <div className="empty" data-r="up">
              <p className="xp">No stories found</p>
              <span>Nothing matches your search or section.</span>
              <button type="button" className="btn" onClick={resetAll}>Show all stories</button>
            </div>
          )}
        </div>
      </section>

      {/* ============ CLOSING (logo, use 2 of 2) ============ */}
      <section className="end" aria-label="RAAKA">
        <div className="end-shaft" aria-hidden="true" />
        <div className="end-in">
          <div className="logo-b" data-r="logo"><Logo className="logo-l" decorative /></div>
          <p className="end-t" data-r="up" style={cssVars({ "--i": 2 })}>More stories are on the way</p>
          <div data-r="up" style={cssVars({ "--i": 3 })}><Link href="/" className="btn">Back to World of RAAKA</Link></div>
        </div>
      </section>

      <footer className="foot"><span>World of RAAKA</span><span>News</span><span className="tnum">{pad(PUBLISHED.length)} stories</span></footer>
    </main>
  );
}

const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;1,8..60,400&family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@400;500&display=swap");
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#030304}
.np{--ink:#030304;--moon:#E8ECF3;--steel:#8A93A3;--ember:#E5303A;--line:rgba(232,236,243,.12);--ease:cubic-bezier(.2,.7,.2,1);--cine:cubic-bezier(.77,0,.18,1);position:relative;min-height:100vh;overflow-x:clip;background:var(--ink);color:var(--moon);font-family:"Archivo",ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.np button{font:inherit;color:inherit;cursor:pointer;background:none;border:0;padding:0}.np a{color:inherit;text-decoration:none}.np ul{list-style:none;margin:0;padding:0}
.np ::selection{background:rgba(229,48,58,.45)}
.xp{font-stretch:125%;font-variation-settings:"wdth" 125;text-transform:uppercase}.tnum{font-variant-numeric:tabular-nums}
.np a:focus-visible,.np button:focus-visible,.np input:focus-visible{outline:2px solid var(--moon);outline-offset:3px}
.wrap{max-width:84rem;margin:0 auto;padding:0 1.25rem}@media(min-width:768px){.wrap{padding:0 3rem}}
.progress{position:fixed;top:0;left:0;right:0;height:2px;z-index:90;transform-origin:left;transform:scaleX(0);background:linear-gradient(90deg,var(--ember),var(--moon))}
.grain{position:fixed;inset:0;z-index:70;pointer-events:none;opacity:.07;mix-blend-mode:overlay;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}

/* page-leave curtain */
.wipe{position:fixed;inset:0;z-index:120;display:grid;place-items:center;background:#030304;clip-path:inset(100% 0 0 0);pointer-events:none;transition:clip-path .52s var(--cine)}
.wipe.on{clip-path:inset(0);pointer-events:auto}
.wipe span{font:500 .62rem "DM Mono",monospace;letter-spacing:.34em;text-transform:uppercase;color:var(--steel);opacity:0;transition:opacity .3s .25s}.wipe.on span{opacity:1}
.wipe::before{content:"";position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,transparent,var(--ember),var(--moon),transparent);transform:scaleX(0);transition:transform .52s var(--cine)}.wipe.on::before{transform:scaleX(1)}

[data-r="up"]{opacity:0;transform:translateY(26px);transition:opacity .9s ease calc(var(--i,0)*.1s),transform .9s var(--ease) calc(var(--i,0)*.1s)}
[data-r="logo"]{opacity:0;clip-path:inset(0 50% 0 50%);filter:blur(14px);transition:clip-path 1.5s var(--cine),opacity 1s,filter 1.4s var(--ease)}
[data-r="up"].in{opacity:1;transform:none}[data-r="logo"].in{opacity:1;clip-path:inset(-20px);filter:none}

/* nav */
.nav{position:fixed;inset:0 0 auto 0;z-index:60;padding:1.2rem 1.25rem;border-bottom:1px solid transparent;opacity:0;transition:padding .5s var(--ease),background .5s,backdrop-filter .5s,border-color .5s}
.nav.go{animation:fade 1.2s ease 1.5s both}.nav.s{padding:.65rem 1.25rem;background:rgba(3,3,4,.78);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-color:var(--line)}
@media(min-width:768px){.nav,.nav.s{padding-inline:3rem}}
@keyframes fade{from{opacity:0}to{opacity:1}}
.nav-in{display:flex;max-width:84rem;margin:0 auto;align-items:center;justify-content:space-between}
.brand{display:flex;align-items:center;gap:1rem}.logo-s{display:block;height:30px;width:auto}
.brand-t{padding-left:1rem;border-left:1px solid var(--line);font:500 .62rem "DM Mono",monospace;letter-spacing:.24em;text-transform:uppercase;color:var(--steel)}
.back{font:500 .62rem "DM Mono",monospace;letter-spacing:.22em;text-transform:uppercase;color:rgba(232,236,243,.55);transition:color .3s,transform .4s var(--ease)}.back:hover{color:#fff;transform:translateX(-4px)}

/* masthead */
.hero{position:relative;min-height:82svh;display:flex;align-items:flex-end;overflow:hidden;isolation:isolate;--sy:0px}
.rules{position:absolute;inset:0;z-index:-2;display:grid;grid-template-columns:repeat(4,1fr);max-width:84rem;margin:0 auto;padding:0 1.25rem}@media(min-width:768px){.rules{padding:0 3rem}}
.rules i{border-left:1px solid rgba(232,236,243,.06);transform:scaleY(0);transform-origin:top;animation:rule 1.6s var(--cine) both}.rules i:last-child{border-right:1px solid rgba(232,236,243,.06)}
.rules i:nth-child(2){animation-delay:.12s}.rules i:nth-child(3){animation-delay:.24s}.rules i:nth-child(4){animation-delay:.36s}
@keyframes rule{to{transform:scaleY(1)}}
.shaft{position:absolute;z-index:-2;top:-20%;bottom:-20%;left:50%;width:18%;mix-blend-mode:screen;background:linear-gradient(90deg,transparent,rgba(190,205,230,.08),transparent);transform:rotate(14deg);animation:shaft 18s ease-in-out infinite alternate}
@keyframes shaft{from{transform:translateX(-18vw) rotate(14deg)}to{transform:translateX(20vw) rotate(14deg)}}
.vig{position:absolute;inset:0;z-index:-1;background:radial-gradient(ellipse at 50% 60%,transparent 35%,rgba(0,0,0,.78)),linear-gradient(0deg,#030304 0,transparent 35%)}
.hero-in{width:100%;max-width:84rem;margin:0 auto;padding:8rem 1.25rem 3rem}@media(min-width:768px){.hero-in{padding:9rem 3rem 3.6rem}}
.kick{margin:0;display:flex;align-items:center;gap:1rem;font:italic 400 1.4rem "Instrument Serif",Georgia,serif;color:var(--steel);opacity:0}.kick::before{content:"";width:3rem;height:1px;background:var(--ember)}
.hero.go .kick{animation:rise 1.2s var(--ease) .3s both}
@keyframes rise{from{opacity:0;transform:translateY(20px);filter:blur(5px)}to{opacity:1;transform:none;filter:none}}
.h1{margin:.5rem 0 0;display:flex;font-weight:900;line-height:.82;letter-spacing:-.045em;font-size:clamp(5rem,26vw,26rem);transform:translate3d(calc(var(--sy)*-.1),0,0)}
.lt-w{display:inline-block;overflow:hidden;padding:.03em .02em .09em}
.lt{display:inline-block;background:linear-gradient(180deg,#fff 18%,#9AA4B6);-webkit-background-clip:text;background-clip:text;color:transparent;transform:translateY(106%)}
.hero.go .lt{animation:lt 1.5s var(--ease) both;animation-delay:calc(.35s + var(--i)*.1s)}
@keyframes lt{from{transform:translateY(106%) skewY(6deg);filter:blur(8px)}to{transform:none;filter:none}}
.hero-row{margin-top:2.2rem;padding-top:1.5rem;border-top:1px solid var(--line);display:flex;flex-direction:column;gap:1.8rem;opacity:0}.hero.go .hero-row{animation:rise 1.2s var(--ease) 1.1s both}
@media(min-width:900px){.hero-row{flex-direction:row;align-items:flex-end;justify-content:space-between}}
.lead{margin:0;max-width:30rem;font:400 1.1rem/1.75 "Source Serif 4",Georgia,serif;color:rgba(232,236,243,.6)}
.stats{margin:0;display:flex;gap:2.4rem}.stats dt{font:500 .6rem "DM Mono",monospace;letter-spacing:.26em;text-transform:uppercase;color:var(--steel)}.stats dd{margin:.45rem 0 0;font-size:1.3rem;font-weight:800;white-space:nowrap}

.mq{overflow:hidden;border-block:1px solid var(--line);padding:.9rem 0;background:#020203}
.mq-t{display:flex;width:max-content;gap:2rem;animation:mq 160s linear infinite;font-size:1.5rem;font-weight:800;color:transparent;-webkit-text-stroke:1px rgba(232,236,243,.26)}
.mq-t span{display:flex;align-items:center;gap:2rem;white-space:nowrap}.mq-t em{font-style:normal;font-size:.5rem;color:var(--ember);-webkit-text-stroke:0}
@keyframes mq{to{transform:translateX(-50%)}}

/* controls */
.ctl{position:sticky;top:0;z-index:50;border-bottom:1px solid var(--line);background:rgba(3,3,4,.82);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
.ctl-in{display:flex;flex-direction:column;gap:.9rem;padding-block:.9rem}@media(min-width:900px){.ctl-in{flex-direction:row;align-items:center;justify-content:space-between}}
.chips{display:flex;flex-wrap:wrap;gap:.45rem}
.chip{padding:.55rem .95rem;border:1px solid var(--line)!important;border-radius:9999px;font:500 .6rem "DM Mono",monospace;letter-spacing:.2em;text-transform:uppercase;color:var(--steel);transition:border-color .3s,color .3s,background .3s}
.chip:hover{color:var(--moon);border-color:rgba(232,236,243,.4)!important}.chip.on{background:var(--moon);color:var(--ink);border-color:var(--moon)!important}
.tools{display:flex;gap:.6rem;align-items:center}
.search{position:relative;display:flex;align-items:center;gap:.6rem;height:2.5rem;padding:0 .9rem;border:1px solid var(--line);border-radius:9999px;color:var(--steel);transition:border-color .3s,width .5s var(--ease);flex:1;min-width:0}@media(min-width:900px){.search{width:15rem;flex:none}.search:focus-within{width:19rem}}
.search:focus-within{border-color:var(--moon);color:var(--moon)}
.search input{flex:1;min-width:0;background:none;border:0;outline:0!important;color:var(--moon);font:400 .8rem "Archivo",sans-serif}.search input::placeholder{color:var(--steel)}
.search kbd{font:500 .56rem "DM Mono",monospace;padding:.15rem .4rem;border:1px solid var(--line);border-radius:4px;color:var(--steel)}.search:focus-within kbd{opacity:0}
.sort{height:2.5rem;padding:0 1rem;border:1px solid var(--line)!important;border-radius:9999px;font:500 .6rem "DM Mono",monospace;letter-spacing:.2em;text-transform:uppercase;color:var(--steel);transition:border-color .3s,color .3s;white-space:nowrap}.sort:hover{color:var(--moon);border-color:var(--moon)!important}.sort i{font-style:normal;margin-left:.3rem}

/* stories */
.stories{padding:3.5rem 0 6rem}@media(min-width:768px){.stories{padding:5rem 0 8rem}}
.meta{display:flex;flex-wrap:wrap;align-items:center;gap:.7rem;margin:0;font:500 .58rem "DM Mono",monospace;letter-spacing:.2em;text-transform:uppercase;color:var(--steel)}.meta i{width:1rem;height:1px;background:var(--steel)}.meta .cat{color:var(--ember)}
.tags{display:flex;flex-wrap:wrap;gap:.4rem;margin:0}.tags em{font:500 .54rem "DM Mono",monospace;letter-spacing:.14em;text-transform:uppercase;font-style:normal;padding:.28rem .6rem;border:1px solid var(--line);border-radius:9999px;color:rgba(232,236,243,.55)}
.sweep{position:absolute;inset:0;pointer-events:none;background:linear-gradient(112deg,transparent 30%,rgba(235,240,255,.2) 48%,transparent 64%);transform:translateX(-130%)}
.cv-shade{position:absolute;inset:0;pointer-events:none;background:linear-gradient(0deg,rgba(3,3,4,.6),transparent 45%)}
.cv-img{object-fit:cover;filter:saturate(.9) contrast(1.03);transition:transform 1.4s var(--ease),filter .6s}
.cv-fb{position:absolute;inset:0;display:grid;place-items:center;background:radial-gradient(circle at 30% 20%,color-mix(in srgb,var(--ac) 45%,transparent),transparent 62%),#0a0a0d}
.cv-fb span{font-size:min(60%,11rem);font-weight:900;line-height:1;color:transparent;-webkit-text-stroke:1px rgba(232,236,243,.4)}
.spot{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .5s;background:radial-gradient(360px circle at var(--mx,50%) var(--my,50%),rgba(255,236,220,.09),transparent 65%)}

/* top story */
.top{--rx:0deg;--ry:0deg;margin-bottom:5rem;perspective:1400px}
.top-a{position:relative;display:grid;gap:1.8rem;transform:rotateX(var(--rx)) rotateY(var(--ry));transition:transform .7s var(--ease)}
@media(min-width:1000px){.top-a{grid-template-columns:1.35fr 1fr;gap:4rem;align-items:center}}
.top-cv{position:relative;aspect-ratio:16/10;overflow:hidden;background:#0a0a0d;box-shadow:0 0 0 1px rgba(232,236,243,.12),0 60px 110px -50px rgba(0,0,0,.95)}
.px{position:absolute;inset:-6%;transform:translate3d(0,calc((var(--p,.5) - .5)*-8%),0)}
.top-tag{position:absolute;top:1.1rem;left:1.1rem;padding:.4rem .9rem;background:var(--ember);font:600 .58rem "DM Mono",monospace;letter-spacing:.24em;text-transform:uppercase}
.top-b{display:flex;flex-direction:column;align-items:flex-start;gap:1.3rem}
.top-t{margin:0;font-weight:800;line-height:1;letter-spacing:-.035em;font-size:clamp(1.8rem,3.6vw,3.2rem);text-wrap:balance}
.top-x{margin:0;max-width:30rem;font:400 1.1rem/1.75 "Source Serif 4",Georgia,serif;color:rgba(232,236,243,.6)}
.cta{display:inline-flex;align-items:center;gap:1rem;margin-top:.6rem;padding-bottom:.5rem;border-bottom:1px solid var(--ember);font:600 .64rem "DM Mono",monospace;letter-spacing:.26em;text-transform:uppercase;transition:gap .5s var(--ease),color .3s}
.cta b{font-weight:400;transition:transform .5s var(--ease)}
@media(hover:hover){.top-a:hover .cv-img{transform:scale(1.05);filter:none}.top-a:hover .sweep{transform:translateX(130%);transition:transform 1.3s var(--ease)}.top-a:hover .cta{gap:1.6rem}.top-a:hover .spot{opacity:1}}

/* month groups + cards */
.grp{margin-top:4.5rem}
.grp-h{display:flex;align-items:baseline;justify-content:space-between;gap:1rem;margin-bottom:1.8rem;padding-bottom:1rem;border-bottom:1px solid var(--line)}
.grp-h h2{margin:0;font-size:clamp(1.3rem,2.6vw,2rem);font-weight:800;letter-spacing:-.02em}.grp-h span{font:500 .6rem "DM Mono",monospace;letter-spacing:.24em;text-transform:uppercase;color:var(--steel)}
.grid{display:grid;gap:1.4rem}@media(min-width:700px){.grid{grid-template-columns:repeat(2,1fr)}}@media(min-width:1100px){.grid{grid-template-columns:repeat(3,1fr);gap:1.6rem}}
.card{--rx:0deg;--ry:0deg;perspective:1200px;min-width:0}
.card-a{position:relative;display:block;height:100%}
.card-in{display:flex;flex-direction:column;height:100%;border:1px solid var(--line);background:#07070a;overflow:hidden;transform:rotateX(var(--rx)) rotateY(var(--ry));transition:transform .6s var(--ease),border-color .5s,box-shadow .6s}
.cv{position:relative;aspect-ratio:16/10;overflow:hidden;background:#0a0a0d}
.cv-cat{position:absolute;top:.9rem;left:.9rem;padding:.35rem .75rem;border:1px solid rgba(232,236,243,.25);border-radius:9999px;background:rgba(3,3,4,.6);backdrop-filter:blur(8px);font:500 .54rem "DM Mono",monospace;letter-spacing:.22em;text-transform:uppercase}
.card-b{display:flex;flex-direction:column;gap:.9rem;flex:1;padding:1.3rem 1.3rem 1.4rem}
.card-t{margin:0;font-weight:800;line-height:1.1;letter-spacing:-.025em;font-size:1.3rem;text-wrap:balance}
.card-x{margin:0;font:400 .98rem/1.7 "Source Serif 4",Georgia,serif;color:rgba(232,236,243,.55);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.card-f{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-top:auto;padding-top:1rem;border-top:1px solid var(--line)}
.go{display:inline-flex;gap:.6rem;font:600 .58rem "DM Mono",monospace;letter-spacing:.22em;text-transform:uppercase;color:rgba(232,236,243,.8);white-space:nowrap}.go b{font-weight:400;transition:transform .5s var(--ease)}
@media(hover:hover){.card-a:hover .card-in{transform:translate3d(0,-8px,0) rotateX(var(--rx)) rotateY(var(--ry));border-color:rgba(232,236,243,.3);box-shadow:0 40px 80px -30px rgba(0,0,0,.9)}.card-a:hover .cv-img{transform:scale(1.07);filter:none}.card-a:hover .sweep{transform:translateX(130%);transition:transform 1.2s var(--ease)}.card-a:hover .go b{transform:translateX(5px)}.card-a:hover .spot{opacity:1}}
.empty{display:flex;flex-direction:column;align-items:center;gap:1rem;padding:5rem 0;text-align:center;color:var(--steel)}.empty p{margin:0;font-size:1.6rem;font-weight:800;color:var(--moon)}

/* closing */
.end{position:relative;overflow:hidden;border-top:1px solid var(--line);padding:8rem 1.25rem 7rem;text-align:center;background:radial-gradient(ellipse at 50% 55%,rgba(229,48,58,.09),transparent 55%)}@media(min-width:768px){.end{padding:11rem 3rem 9rem}}
.end-shaft{position:absolute;top:-20%;bottom:-20%;left:0;width:22%;background:linear-gradient(90deg,transparent,rgba(210,222,245,.06),transparent);transform:rotate(14deg);animation:endshaft 14s ease-in-out infinite alternate}
@keyframes endshaft{from{left:-10%}to{left:90%}}
.end-in{position:relative;display:flex;flex-direction:column;align-items:center;gap:1.8rem}
.logo-b{position:relative}.logo-l{display:block;width:min(72vw,420px);height:auto;filter:drop-shadow(0 0 40px rgba(229,48,58,.25));animation:glow 5s ease-in-out infinite}
@keyframes glow{50%{filter:drop-shadow(0 0 60px rgba(232,236,243,.28))}}
.end-t{margin:.4rem 0 1rem;font:italic 400 clamp(1.5rem,3.6vw,2.6rem) "Instrument Serif",Georgia,serif;color:var(--steel)}
.btn{position:relative;overflow:hidden;display:inline-flex;border-radius:9999px;padding:1rem 1.8rem;background:var(--moon);color:var(--ink);font-size:.64rem;font-weight:700;letter-spacing:.22em;text-transform:uppercase;transition:transform .4s var(--ease),background .3s}
.btn:hover{transform:translateY(-3px);background:#fff}
.btn::after{content:"";position:absolute;top:0;bottom:0;width:40%;left:-60%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.5),transparent);transform:skewX(-20deg)}.btn:hover::after{left:130%;transition:left .8s}
.foot{display:flex;flex-wrap:wrap;justify-content:space-between;gap:.8rem;max-width:84rem;margin:0 auto;padding:1.8rem 1.25rem 2.4rem;border-top:1px solid var(--line);font:500 .58rem "DM Mono",monospace;letter-spacing:.24em;text-transform:uppercase;color:rgba(232,236,243,.3)}@media(min-width:768px){.foot{padding-inline:3rem}}

@media(max-width:600px){.logo-s{height:26px}.brand-t{display:none}.stats{gap:1.5rem}.mq-t{font-size:1.2rem}}
@media (prefers-reduced-motion:reduce){
html{scroll-behavior:auto}.grain{display:none}
.nav,.kick,.lt,.hero-row,.rules i,.shaft,.mq-t,.logo-l,.end-shaft{animation:none!important}
.kick,.hero-row,.nav{opacity:1!important}.lt{transform:none!important}.rules i{transform:none!important}.h1,.px{transform:none!important}
[data-r]{opacity:1!important;transform:none!important;clip-path:none!important;filter:none!important;transition:opacity .4s!important}
.wipe,.wipe::before{transition-duration:.01s!important}
}
`;
