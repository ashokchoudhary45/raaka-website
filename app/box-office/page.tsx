"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ================================================================
   DATA — the only place you need to edit.
   null  = figure not announced yet (page shows "awaiting")
   "₹12.5 Cr" etc. = verified figure (page shows it on a rolling odometer)
================================================================ */
type Figure = string | null;

const FIGURES: Record<"worldwide" | "indiaGross" | "overseas" | "verdict" | "openingDay" | "openingWeekend" | "lifetime", Figure> = {
  worldwide: null,
  indiaGross: null,
  overseas: null,
  verdict: "TBA",
  openingDay: null,
  openingWeekend: null,
  lifetime: "TBA",
};

const DETAILS = ["Day-wise India collection", "Day-wise worldwide collection", "Opening day & weekend", "Total India & worldwide"];

const LANGUAGES: { language: string; short: string; total: Figure }[] = [
  { language: "Telugu", short: "TEL", total: null },
  { language: "Hindi", short: "HIN", total: null },
  { language: "Tamil", short: "TAM", total: null },
  { language: "Kannada", short: "KAN", total: null },
  { language: "Malayalam", short: "MAL", total: null },
];

const TERRITORIES: { name: string; gross: Figure }[] = [
  { name: "Andhra Pradesh", gross: null },
  { name: "Telangana", gross: null },
  { name: "Karnataka", gross: null },
  { name: "Tamil Nadu", gross: null },
  { name: "Kerala", gross: null },
  { name: "Rest of India", gross: null },
  { name: "Overseas", gross: null },
];

// poster: put an image path (e.g. "/images/box-office/day1.jpg") to show the official poster on the ticket
const DAYS: { day: number; poster: string | null; gross: Figure }[] = Array.from({ length: 7 }, (_, i) => ({ day: i + 1, poster: null, gross: null }));

const NAV = [
  ["worldwide", "Worldwide"],
  ["languages", "Languages"],
  ["territories", "Territories"],
  ["dashboard", "Milestones"],
] as const;

/* ================================================================ helpers */
function useInView<T extends HTMLElement>(threshold = 0.35) {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setShown(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, shown] as const;
}

/** Rolling odometer. Digits roll up to their value when scrolled into view. */
function Odometer({ value, className = "" }: { value: Figure; className?: string }) {
  const [ref, shown] = useInView<HTMLSpanElement>();
  if (value === null) {
    return (
      <span className={`bo-await ${className}`} aria-label="Awaiting official figure">
        <i /><i /><i />
      </span>
    );
  }
  return (
    <span ref={ref} className={`bo-odo ${className}`} aria-label={value}>
      {[...value].map((c, i) =>
        /\d/.test(c) ? (
          <span key={i} className="bo-reel" aria-hidden>
            <span className="bo-reel-col" style={{ transform: shown ? `translateY(-${Number(c) * 10}%)` : "translateY(0)", transitionDelay: `${i * 90}ms` }}>
              {Array.from({ length: 10 }, (_, d) => <b key={d}>{d}</b>)}
            </span>
          </span>
        ) : (
          <span key={i} className="bo-sym" aria-hidden>{c === " " ? "\u00A0" : c}</span>
        )
      )}
    </span>
  );
}

function StatusChip({ value, soon = "Awaiting figures" }: { value: Figure; soon?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] ${value === null ? "border-white/10 text-white/40" : "border-amber-300/40 bg-amber-300/10 text-amber-200"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${value === null ? "bg-white/30" : "bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,.9)]"}`} />
      {value === null ? soon : "Verified"}
    </span>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-amber-300/80" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
  );
}

/* ================================================================ page */
export default function BoxOfficePage() {
  const [lang, setLang] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const bar = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const p = h.scrollTop / Math.max(h.scrollHeight - h.clientHeight, 1);
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      setScrolled(h.scrollTop > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const current = LANGUAGES[lang];
  const dust = Array.from({ length: 18 }, (_, i) => ({
    "--x": `${(i * 41 + 7) % 100}%`, "--s": `${2 + (i % 3)}px`, "--d": `${9 + (i % 6) * 1.6}s`, "--dl": `${(i * 0.9) % 8}s`, "--dx": `${(i % 2 ? 1 : -1) * (12 + ((i * 11) % 40))}px`,
  })) as React.CSSProperties[];

  const heroStats: [string, Figure][] = [
    ["Worldwide", FIGURES.worldwide],
    ["India gross", FIGURES.indiaGross],
    ["Overseas", FIGURES.overseas],
    ["Final verdict", FIGURES.verdict],
  ];

  return (
    <main className="bo-root relative min-h-screen overflow-x-hidden text-[#f6ede2]">
      <style>{CSS}</style>

      <div ref={bar} className="bo-progress" aria-hidden />
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        {dust.map((s, i) => <i key={i} className="bo-dust" style={s} />)}
      </div>

      {/* ---------------- HEADER ---------------- */}
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "border-b border-white/10 bg-[#0a0607]/80 backdrop-blur-xl" : "border-b border-transparent"}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 md:px-10">
          <Link href="/" className="bo-back group flex items-center gap-2.5 text-sm text-white/60 transition hover:text-white">
            <span className="bo-back-arrow">←</span>
            <span className="hidden sm:inline">Back to World of RAAKA</span>
            <span className="sm:hidden">Home</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Sections">
            {NAV.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="rounded-full px-4 py-2 text-sm text-white/55 transition hover:bg-white/[0.06] hover:text-white">{label}</a>
            ))}
          </nav>
          <img src="/images/raaka-logo.png" alt="RAAKA" className="h-7 w-auto object-contain opacity-90 sm:h-8" />
        </div>
      </header>

      {/* ---------------- HERO : the curtain opens ---------------- */}
      <section className="relative isolate overflow-hidden px-4 pb-16 pt-28 sm:px-6 md:px-10 md:pb-24 md:pt-36">
        <div className="bo-curtain bo-curtain-l" aria-hidden />
        <div className="bo-curtain bo-curtain-r" aria-hidden />
        <div className="bo-beam bo-beam-l" aria-hidden />
        <div className="bo-beam bo-beam-r" aria-hidden />

        <div className="relative mx-auto max-w-5xl">
          {/* marquee sign */}
          <div className="bo-sign relative rounded-[1.75rem] px-5 pb-12 pt-14 text-center sm:px-10 md:px-16 md:pb-16 md:pt-20">
            <span className="bo-bulbs bo-bulbs-a" aria-hidden />
            <span className="bo-bulbs bo-bulbs-b" aria-hidden />

            <div className="bo-logo-wrap relative mx-auto w-[min(76vw,540px)]">
              <div className="bo-logo-halo pointer-events-none absolute -inset-x-10 -inset-y-10 rounded-full" />
              <span className="bo-logo-stage relative block">
                <img src="/images/raaka-logo.png" alt="RAAKA" className="block h-auto w-full object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,.9)]" />
                <span className="bo-logo-shine" aria-hidden />
              </span>
            </div>

            <h1 className="bo-title mt-8 font-serif text-[clamp(3.2rem,12vw,8rem)] font-black leading-[0.9] tracking-[-0.04em]">Box Office</h1>

            <p className="bo-fade mx-auto mt-6 max-w-xl text-sm leading-7 text-white/55 md:text-base" style={{ animationDelay: "2.6s" }}>
              A dedicated worldwide box office archive for RAAKA, built to track collections across every major language, territory and day.
            </p>

            <div className="bo-fade mt-8 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: "2.8s" }}>
              <a href="#worldwide" className="bo-btn rounded-full px-7 py-3.5 text-sm font-semibold text-[#2a1500]">Worldwide collection</a>
              <a href="#languages" className="bo-ghost rounded-full px-7 py-3.5 text-sm font-medium">All languages</a>
            </div>
          </div>

          {/* headline numbers */}
          <div className="bo-fade mt-8 grid grid-cols-2 gap-3 md:mt-10 md:grid-cols-4" style={{ animationDelay: "3s" }}>
            {heroStats.map(([label, value]) => (
              <div key={label} className="bo-panel px-5 py-5 md:px-6 md:py-6">
                <div className="bo-big font-serif font-black"><Odometer value={value} /></div>
                <p className="mt-3 text-xs text-white/40">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- WORLDWIDE : seven tickets ---------------- */}
      <section id="worldwide" className="relative z-10 mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-24">
        <div className="mb-10 flex flex-col justify-between gap-5 md:mb-14 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <h2 className="font-serif text-4xl font-bold leading-tight tracking-tight md:text-6xl">Worldwide, one ticket a day</h2>
            <p className="mt-5 text-sm leading-7 text-white/50 md:text-base">
              Official day-wise worldwide collection posters land here. Each ticket links to its own detailed page, so the whole theatrical run can be followed day by day.
            </p>
          </div>
          <StatusChip value={null} soon="Posters coming soon" />
        </div>

        <div className="bo-rail -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-6 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4 lg:gap-6">
          {DAYS.map((d) => (
            <article key={d.day} className="bo-ticket group w-[68vw] shrink-0 snap-start sm:w-auto">
              <div className="bo-ticket-top relative aspect-[4/4.4] overflow-hidden rounded-t-[1.25rem]">
                {d.poster ? (
                  <img src={d.poster} alt={`Day ${d.day} official poster`} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <>
                    <span className="bo-ghostnum" aria-hidden>{d.day}</span>
                    <div className="absolute inset-6 flex items-center justify-center rounded-xl border border-dashed border-white/15">
                      <span className="text-sm text-white/30">Official poster</span>
                    </div>
                  </>
                )}
                <span className="bo-shine" aria-hidden />
              </div>
              <div className="bo-tear" aria-hidden />
              <div className="bo-stub rounded-b-[1.25rem] px-5 pb-5 pt-5">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="font-serif text-2xl font-bold leading-none">Day {d.day}</p>
                    <p className="mt-1.5 text-xs text-white/40">Worldwide</p>
                  </div>
                  <div className="text-right">
                    <div className="bo-mid font-serif font-bold"><Odometer value={d.gross} /></div>
                  </div>
                </div>
                <div className="bo-barcode mt-4" aria-hidden />
                <p className="mt-3 text-[11px] text-white/35">{d.gross === null ? "Admit one · coming soon" : "Admit one · verified"}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ---------------- LANGUAGES : pick a screen ---------------- */}
      <section id="languages" className="relative z-10 border-y border-white/10 bg-[linear-gradient(180deg,rgba(140,29,44,.08),transparent)]">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-24">
          <div className="max-w-3xl">
            <h2 className="font-serif text-4xl font-bold leading-tight tracking-tight md:text-6xl">Every language, every collection</h2>
            <p className="mt-5 text-sm leading-7 text-white/50 md:text-base">
              Separate tracking for each release language. Once figures are verified, each screen can show daily gross, running total, opening weekend, India total and worldwide total.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-[260px_1fr]">
            <div role="tablist" aria-label="Release languages" className="bo-hide flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
              {LANGUAGES.map((l, i) => (
                <button
                  key={l.language}
                  role="tab"
                  aria-selected={lang === i}
                  onClick={() => setLang(i)}
                  className={`bo-tab group relative flex shrink-0 items-center justify-between gap-6 rounded-2xl border px-5 py-4 text-left transition ${lang === i ? "is-on" : ""}`}
                >
                  <span className="font-serif text-lg font-semibold">{l.language}</span>
                  <span className="font-mono text-[11px] text-white/35">{l.short}</span>
                </button>
              ))}
            </div>

            <div key={current.language} role="tabpanel" className="bo-pass bo-switch relative overflow-hidden rounded-[1.75rem] p-7 md:p-10">
              <span className="bo-ghostword" aria-hidden>{current.short}</span>
              <div className="relative flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-white/40">Release language</p>
                  <h3 className="mt-2 font-serif text-4xl font-bold md:text-5xl">{current.language}</h3>
                </div>
                <StatusChip value={current.total} soon="Coming soon" />
              </div>

              <ul className="relative mt-9 grid gap-3.5 sm:grid-cols-2">
                {DETAILS.map((t, i) => (
                  <li key={t} className="bo-in flex items-center gap-3 text-sm text-white/65" style={{ animationDelay: `${120 + i * 80}ms` }}><Check />{t}</li>
                ))}
              </ul>

              <div className="relative mt-10 flex items-end justify-between gap-4 border-t border-dashed border-white/15 pt-6">
                <div>
                  <p className="text-xs text-white/40">Current total</p>
                  <div className="bo-big mt-2 font-serif font-black"><Odometer value={current.total} /></div>
                </div>
                <span className="text-xs text-white/25">{current.total === null ? "TBA" : ""}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- TERRITORIES : dials ---------------- */}
      <section id="territories" className="relative z-10 mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-24">
        <div className="mb-10 max-w-2xl md:mb-14">
          <h2 className="font-serif text-4xl font-bold leading-tight tracking-tight md:text-6xl">Territory wise</h2>
          <p className="mt-5 text-sm leading-7 text-white/50 md:text-base">India territory breakdown plus overseas. Each dial fills with the gross once the figure is verified.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {TERRITORIES.map((t, i) => (
            <div key={t.name} className={`bo-dial group relative flex flex-col items-center rounded-3xl px-4 pb-6 pt-7 text-center ${i === TERRITORIES.length - 1 ? "col-span-2 md:col-span-1" : ""}`}>
              <div className="relative h-28 w-28 sm:h-32 sm:w-32">
                <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
                  <circle cx="50" cy="50" r="44" className="bo-dial-track" />
                  <circle cx="50" cy="50" r="44" className="bo-dial-dash" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bo-mid font-serif font-black"><Odometer value={t.gross} /></div>
                </div>
              </div>
              <p className="mt-5 text-sm font-semibold">{t.name}</p>
              <p className="mt-1 text-xs text-white/35">{t.gross === null ? "Gross · coming soon" : "Gross"}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- MILESTONES ---------------- */}
      <section id="dashboard" className="relative z-10 border-y border-white/10 bg-white/[0.015]">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-24">
          <h2 className="mb-10 max-w-2xl font-serif text-4xl font-bold leading-tight tracking-tight md:mb-14 md:text-6xl">The milestones that matter</h2>

          <div className="grid gap-5 lg:grid-cols-3">
            {([
              ["Opening day", FIGURES.openingDay, "Worldwide gross"],
              ["Opening weekend", FIGURES.openingWeekend, "Worldwide gross"],
              ["Lifetime", FIGURES.lifetime, "Final worldwide gross"],
            ] as [string, Figure, string][]).map(([title, value, sub]) => (
              <div key={title} className="bo-panel bo-scan p-7 md:p-9">
                <p className="text-sm text-white/45">{title}</p>
                <div className="bo-huge mt-6 font-serif font-black"><Odometer value={value} /></div>
                <p className="mt-3 text-xs text-white/35">{sub}</p>
              </div>
            ))}
          </div>

          <div className="bo-panel mt-5 flex flex-col justify-between gap-6 p-7 md:flex-row md:items-center md:p-9">
            <div>
              <p className="text-sm text-white/45">Tracking method</p>
              <h3 className="mt-3 font-serif text-2xl font-bold md:text-3xl">Worldwide collection archive</h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/45">
                Daily figures, language-wise totals, territory breakdowns, opening milestones and lifetime collections are all maintained from this single archive.
              </p>
            </div>
            <div className="shrink-0 rounded-2xl border border-white/10 bg-black/30 px-6 py-5 text-center">
              <p className="text-xs text-white/35">Status</p>
              <p className="mt-2 flex items-center justify-center gap-2 text-sm font-semibold"><span className="bo-live" />Awaiting official figures</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- DATA POLICY : seal ---------------- */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 py-20 text-center md:py-28">
        <div className="bo-seal mx-auto mb-8">
          <svg viewBox="0 0 200 200" className="bo-seal-ring" aria-hidden>
            <defs><path id="bo-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" /></defs>
            <text fontSize="13" letterSpacing="4.2" fill="rgba(242,196,109,.85)"><textPath href="#bo-circle">OFFICIAL FIGURES FIRST • VERIFIED SOURCES ONLY • </textPath></text>
          </svg>
          <svg viewBox="0 0 24 24" className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 text-amber-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 3 4.5 6v5.5c0 4.5 3 8 7.5 9.5 4.5-1.500 7.500-5 7.500-9.500V6z" /><path d="m9 12 2.200 2.200L15.500 10" /></svg>
        </div>
        <h2 className="font-serif text-3xl font-bold md:text-4xl">Official figures first</h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/45">
          Collection figures are added only after verification from the intended official or clearly identified source. Unverified estimates are never presented as official numbers.
        </p>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="relative z-10 border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between md:px-10">
          <div className="flex items-center gap-5">
            <img src="/images/raaka-logo.png" alt="RAAKA" className="h-9 w-auto object-contain" />
            <div>
              <p className="text-sm font-semibold">World of RAAKA</p>
              <p className="mt-1 text-xs text-white/30">RAAKA Box Office Archive</p>
            </div>
          </div>
          <Link href="/" className="text-sm text-white/45 transition hover:text-white">Back to Home →</Link>
        </div>
      </footer>
    </main>
  );
}

/* ================================================================ styles */
const CSS = String.raw`
.bo-root{font-family:var(--font-geist-sans),Arial,Helvetica,sans-serif;background:radial-gradient(1000px 600px at 50% -5%,rgba(140,29,44,.28),transparent 65%),#0a0607}
.bo-root ::selection{background:#f2c46d;color:#1a0b00}
.bo-root :focus-visible{outline:2px solid #f2c46d;outline-offset:3px;border-radius:8px}
.bo-hide{scrollbar-width:none}.bo-hide::-webkit-scrollbar{display:none}
.bo-rail{scrollbar-width:none}.bo-rail::-webkit-scrollbar{display:none}

.bo-progress{position:fixed;left:0;right:0;top:0;height:2px;z-index:80;transform-origin:left;transform:scaleX(0);background:linear-gradient(90deg,#8c1d2c,#f2c46d,#fff0c4)}
.bo-dust{position:absolute;bottom:-10px;left:var(--x);width:var(--s);height:var(--s);border-radius:50%;background:radial-gradient(circle,#fff0c4,#f2c46d 60%,transparent);opacity:0;animation:boDust var(--d) linear var(--dl) infinite}
@keyframes boDust{0%{opacity:0;transform:translate(0,0)}10%{opacity:.8}100%{opacity:0;transform:translate(var(--dx),-100vh)}}
.bo-back-arrow{display:inline-block;transition:transform .4s cubic-bezier(.16,1,.3,1)}.bo-back:hover .bo-back-arrow{transform:translateX(-5px)}

/* ----- hero: the one orchestrated sequence (curtains open, bulbs chase on, logo lights up) ----- */
.bo-curtain{position:absolute;top:0;bottom:0;width:52%;z-index:6;pointer-events:none;background:repeating-linear-gradient(90deg,#4a0b16 0 26px,#7a1426 26px 54px,#5a0e1b 54px 80px),linear-gradient(#000,#000);box-shadow:inset 0 -120px 140px rgba(0,0,0,.55);animation-duration:2.2s;animation-timing-function:cubic-bezier(.7,0,.2,1);animation-fill-mode:forwards;animation-delay:.35s}
.bo-curtain::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.45),transparent 30%,transparent 70%,rgba(0,0,0,.45))}
.bo-curtain-l{left:0;animation-name:boCurtainL}.bo-curtain-r{right:0;animation-name:boCurtainR}
@keyframes boCurtainL{to{transform:translateX(-100%)}}@keyframes boCurtainR{to{transform:translateX(100%)}}
.bo-beam{position:absolute;top:0;width:44%;height:88%;z-index:0;pointer-events:none;transform-origin:50% 0;background:linear-gradient(to bottom,rgba(255,232,170,.2),transparent 78%);clip-path:polygon(46% 0,54% 0,100% 100%,0 100%);opacity:0;animation:boBeamIn 1.6s ease-out 2s forwards,boSway 9s ease-in-out 2s infinite alternate}
.bo-beam-l{left:-6%;--r:-12deg}.bo-beam-r{right:-6%;--r:12deg;animation-delay:2.2s,2.2s}
@keyframes boBeamIn{to{opacity:1}}
@keyframes boSway{0%{transform:rotate(calc(var(--r)*-1))}100%{transform:rotate(var(--r))}}

.bo-sign{background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(10,6,7,.78));border:1px solid rgba(242,196,109,.22);box-shadow:0 40px 120px rgba(0,0,0,.6),inset 0 0 80px rgba(140,29,44,.18)}
.bo-bulbs{position:absolute;inset:0;border-radius:inherit;padding:11px;pointer-events:none;-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;background:radial-gradient(circle,#fff0c4 0 2.6px,rgba(242,196,109,.5) 3.4px,transparent 5px) 0 0/26px 26px;opacity:0;animation:boBulbOn .9s ease-out 2.4s forwards,boChase 1.3s steps(1) 3.3s infinite}
.bo-bulbs-b{background-position:13px 13px;animation:boBulbOn .9s ease-out 2.4s forwards,boChase 1.3s steps(1) 3.95s infinite}
@keyframes boBulbOn{to{opacity:1}}
@keyframes boChase{0%{opacity:1}50%{opacity:.15}}
.bo-title{background:linear-gradient(180deg,#fff7e1 18%,#f2c46d 60%,#a8691c);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 28px rgba(242,196,109,.28));animation:boTitle 1.6s cubic-bezier(.16,1,.3,1) 2.1s backwards}
@keyframes boTitle{from{opacity:0;letter-spacing:.12em;filter:blur(14px)}}
.bo-fade{animation:boFade .9s cubic-bezier(.16,1,.3,1) backwards}
@keyframes boFade{from{opacity:0;transform:translateY(14px)}}
.bo-logo-wrap{animation:boLogoIn 1.8s cubic-bezier(.16,1,.3,1) 1.4s backwards}
@keyframes boLogoIn{from{opacity:0;transform:scale(.88);filter:blur(18px) brightness(2)}}
.bo-logo-stage{animation:boBreath 4.4s ease-in-out 3.2s infinite}
@keyframes boBreath{0%,100%{filter:drop-shadow(0 0 10px rgba(242,196,109,.12))}50%{filter:drop-shadow(0 0 30px rgba(242,196,109,.4))}}
.bo-logo-shine{position:absolute;inset:0;pointer-events:none;-webkit-mask:url(/images/raaka-logo.png) center/contain no-repeat;mask:url(/images/raaka-logo.png) center/contain no-repeat;background:linear-gradient(105deg,transparent 38%,rgba(255,244,205,.95) 50%,transparent 62%);background-size:260% 100%;background-position:160% 0;mix-blend-mode:screen;animation:boShine 5.5s ease-in-out 3.2s infinite}
@keyframes boShine{0%{background-position:160% 0}45%,100%{background-position:-60% 0}}
.bo-logo-halo{background:radial-gradient(closest-side,rgba(242,196,109,.2),transparent 72%);filter:blur(30px);animation:boHalo 4.4s ease-in-out infinite}
@keyframes boHalo{0%,100%{opacity:.4;transform:scale(.95)}50%{opacity:1;transform:scale(1.08)}}

.bo-btn{background:linear-gradient(135deg,#ffe29a,#f2c46d 55%,#d99a2b);box-shadow:0 10px 34px rgba(242,196,109,.28),inset 0 1px 0 rgba(255,255,255,.55);transition:transform .4s cubic-bezier(.16,1,.3,1),box-shadow .4s}
.bo-btn:hover{transform:translateY(-3px);box-shadow:0 16px 48px rgba(242,196,109,.45)}.bo-btn:active{transform:scale(.97)}
.bo-ghost{border:1px solid rgba(255,255,255,.18);color:rgba(255,255,255,.75);transition:background-color .3s,border-color .3s,color .3s,transform .4s cubic-bezier(.16,1,.3,1)}
.bo-ghost:hover{background:rgba(255,255,255,.07);border-color:rgba(242,196,109,.5);color:#fff;transform:translateY(-3px)}

.bo-panel{position:relative;border-radius:1.4rem;border:1px solid rgba(255,255,255,.09);background:linear-gradient(170deg,rgba(255,255,255,.045),rgba(10,6,7,.7));-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);overflow:hidden}
.bo-scan::after{content:"";position:absolute;left:0;right:0;top:0;height:46%;background:linear-gradient(to bottom,transparent,rgba(242,196,109,.1),transparent);transform:translateY(-110%);animation:boScan 5s ease-in-out infinite;pointer-events:none}
@keyframes boScan{0%{transform:translateY(-110%)}60%,100%{transform:translateY(260%)}}

/* ----- odometer ----- */
.bo-big{font-size:clamp(1.9rem,5.2vw,3rem);line-height:1}
.bo-mid{font-size:1.45rem;line-height:1}
.bo-huge{font-size:clamp(2.8rem,7vw,4.6rem);line-height:1}
.bo-odo{display:inline-flex;align-items:flex-end;line-height:1;background:linear-gradient(180deg,#fff7e1 25%,#f2c46d);-webkit-background-clip:text;background-clip:text;color:transparent}
.bo-reel{display:inline-block;height:1em;overflow:hidden;line-height:1}
.bo-reel-col{display:flex;flex-direction:column;transition:transform 2.1s cubic-bezier(.16,1,.3,1)}
.bo-reel-col b{display:block;height:1em;font-weight:inherit;text-align:center}
.bo-sym{display:inline-block;height:1em;line-height:1}
.bo-await{display:inline-flex;align-items:center;gap:.28em;height:1em}
.bo-await i{display:block;width:.38em;height:.07em;border-radius:2px;background:linear-gradient(90deg,rgba(255,255,255,.18),rgba(242,196,109,.7),rgba(255,255,255,.18));background-size:240% 100%;animation:boAwait 2.2s linear infinite}
.bo-await i:nth-child(2){animation-delay:.18s}.bo-await i:nth-child(3){animation-delay:.36s}
@keyframes boAwait{to{background-position:-240% 0}}
.bo-live{width:8px;height:8px;border-radius:50%;background:#f2c46d;box-shadow:0 0 12px rgba(242,196,109,.9);animation:boBlink 1.6s ease-in-out infinite}
@keyframes boBlink{50%{opacity:.25}}

/* ----- day tickets ----- */
.bo-ticket{position:relative;transition:transform .55s cubic-bezier(.16,1,.3,1),filter .5s}
.bo-ticket:hover{transform:translateY(-8px);filter:drop-shadow(0 26px 40px rgba(242,196,109,.14))}
.bo-ticket-top{background:radial-gradient(circle at 50% 22%,rgba(242,196,109,.14),transparent 55%),linear-gradient(160deg,#241012,#120a0b);border:1px solid rgba(255,255,255,.1);border-bottom:0}
.bo-ghostnum{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--font-geist-sans),serif;font-weight:900;font-size:clamp(9rem,22vw,13rem);line-height:1;color:transparent;-webkit-text-stroke:1.5px rgba(242,196,109,.28);transition:-webkit-text-stroke-color .5s,transform .7s cubic-bezier(.16,1,.3,1)}
.bo-ticket:hover .bo-ghostnum{-webkit-text-stroke-color:rgba(242,196,109,.7);transform:scale(1.06)}
.bo-shine{position:absolute;top:0;bottom:0;left:0;width:45%;background:linear-gradient(100deg,transparent,rgba(255,236,180,.26),transparent);transform:translateX(-130%) skewX(-16deg);pointer-events:none}
.bo-ticket:hover .bo-shine{animation:boSweep .9s ease-out}
@keyframes boSweep{to{transform:translateX(330%) skewX(-16deg)}}
.bo-tear{position:relative;height:0;border-top:2px dashed rgba(255,255,255,.16)}
.bo-tear::before,.bo-tear::after{content:"";position:absolute;top:-13px;width:24px;height:24px;border-radius:50%;background:#0a0607;border:1px solid rgba(255,255,255,.1)}
.bo-tear::before{left:-13px;clip-path:inset(0 0 0 50%)}.bo-tear::after{right:-13px;clip-path:inset(0 50% 0 0)}
.bo-stub{background:linear-gradient(180deg,#160d0e,#0e0809);border:1px solid rgba(255,255,255,.1);border-top:0}
.bo-barcode{position:relative;height:24px;opacity:.55;overflow:hidden;background:repeating-linear-gradient(90deg,rgba(255,255,255,.7) 0 2px,transparent 2px 4px,rgba(255,255,255,.7) 4px 5px,transparent 5px 9px,rgba(255,255,255,.7) 9px 12px,transparent 12px 14px)}
.bo-barcode::after{content:"";position:absolute;top:0;bottom:0;width:2px;left:0;background:#f2c46d;box-shadow:0 0 12px #f2c46d;opacity:0}
.bo-ticket:hover .bo-barcode::after{opacity:1;animation:boBar 1.4s ease-in-out infinite alternate}
@keyframes boBar{to{left:calc(100% - 2px)}}

/* ----- languages ----- */
.bo-tab{border-color:rgba(255,255,255,.09);background:rgba(255,255,255,.025);color:rgba(255,255,255,.6);transition:background-color .3s,border-color .3s,color .3s,transform .4s cubic-bezier(.16,1,.3,1)}
.bo-tab:hover{color:#fff;border-color:rgba(242,196,109,.35)}
.bo-tab.is-on{color:#fff;border-color:rgba(242,196,109,.6);background:linear-gradient(90deg,rgba(242,196,109,.16),rgba(140,29,44,.14));box-shadow:0 10px 34px rgba(242,196,109,.1)}
@media (min-width:1024px){.bo-tab.is-on{transform:translateX(8px)}}
.bo-pass{background:linear-gradient(150deg,rgba(255,255,255,.05),rgba(10,6,7,.82));border:1px solid rgba(242,196,109,.2)}
.bo-pass::before,.bo-pass::after{content:"";position:absolute;top:56%;width:28px;height:28px;border-radius:50%;background:#0a0607;border:1px solid rgba(242,196,109,.2)}
.bo-pass::before{left:-15px}.bo-pass::after{right:-15px}
.bo-ghostword{position:absolute;right:-.04em;bottom:-.22em;font-weight:900;font-size:clamp(8rem,22vw,16rem);line-height:1;letter-spacing:-.05em;color:transparent;-webkit-text-stroke:1.5px rgba(242,196,109,.1);pointer-events:none}
.bo-switch{animation:boSwitch .6s cubic-bezier(.16,1,.3,1)}
@keyframes boSwitch{from{opacity:0;transform:translateX(26px)}}
.bo-in{animation:boIn .6s cubic-bezier(.16,1,.3,1) backwards}
@keyframes boIn{from{opacity:0;transform:translateY(10px)}}

/* ----- territory dials ----- */
.bo-dial{border:1px solid rgba(255,255,255,.08);background:linear-gradient(170deg,rgba(255,255,255,.04),rgba(10,6,7,.6));transition:border-color .4s,transform .5s cubic-bezier(.16,1,.3,1)}
.bo-dial:hover{border-color:rgba(242,196,109,.4);transform:translateY(-5px)}
.bo-dial-track{fill:none;stroke:rgba(255,255,255,.07);stroke-width:3}
.bo-dial-dash{fill:none;stroke:rgba(242,196,109,.55);stroke-width:3;stroke-linecap:round;stroke-dasharray:3 9;transform-origin:50px 50px;animation:boSpin 36s linear infinite;transition:stroke .4s}
.bo-dial:hover .bo-dial-dash{stroke:#f2c46d;animation-duration:9s}
@keyframes boSpin{to{transform:rotate(360deg)}}

/* ----- seal ----- */
.bo-seal{position:relative;width:150px;height:150px}
.bo-seal-ring{position:absolute;inset:0;width:100%;height:100%;animation:boSpin 28s linear infinite}

@media (max-width:640px){.bo-curtain{width:50%}.bo-bulbs{padding:9px;background-size:22px 22px}.bo-bulbs-b{background-position:11px 11px}}
@media (prefers-reduced-motion:reduce){
  .bo-curtain{display:none}.bo-beam{opacity:1}
  .bo-dust,.bo-bulbs,.bo-beam,.bo-logo-stage,.bo-logo-shine,.bo-logo-halo,.bo-scan::after,.bo-await i,.bo-live,.bo-dial-dash,.bo-seal-ring,.bo-title,.bo-fade,.bo-logo-wrap,.bo-switch,.bo-in{animation:none!important}
  .bo-bulbs{opacity:1}.bo-reel-col{transition:none}
}
`;
