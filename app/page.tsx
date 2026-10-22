"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import NewBadge from "@/components/NewBadge";
import Link from "next/link";

type Theme = "obsidian" | "ember" | "cosmic" | "graphite" | "onyx" | "aurora" | "crimson" | "sunset" | "frost" | "meteor" | "sakura" | "thunder" | "dawn";

const THEME_ORDER: Theme[] = ["obsidian", "ember", "cosmic", "graphite", "onyx", "aurora", "crimson", "sunset", "frost", "meteor", "sakura", "thunder", "dawn"];
const AURA_RGB: Record<Theme, string> = {
  obsidian: "255,255,255", ember: "255,110,30", cosmic: "129,140,248", graphite: "212,212,216",
  onyx: "250,204,21", aurora: "45,212,191", crimson: "244,63,94", sunset: "236,72,153",
  frost: "125,211,252", meteor: "196,181,253",
  sakura: "244,114,182", thunder: "147,197,253", dawn: "253,186,116",
};

const AURA_META: Record<Theme, { label: string; tag: string; bg: string; isNew?: boolean }> = {
  obsidian: { label: "Obsidian", tag: "Pure cinema", bg: "radial-gradient(circle at 50% 0%,#3d3d3d,#050505 72%)" },
  ember: { label: "Ember", tag: "Fire world", bg: "radial-gradient(circle at 50% 110%,#ff6a1a,#5a1500 48%,#0a0201 85%)" },
  cosmic: { label: "Cosmic", tag: "Deep space", bg: "radial-gradient(circle at 30% 20%,#6366f1,#1e1b4b 52%,#02040b 88%)" },
  graphite: { label: "Graphite", tag: "Silver steel", bg: "linear-gradient(135deg,#9a9da5,#2a2c30 55%,#111214)" },
  onyx: { label: "Onyx", tag: "Black gold", bg: "linear-gradient(135deg,#f5c542,#6b4a0a 50%,#070706)" },
  aurora: { label: "Aurora", tag: "Northern lights", bg: "linear-gradient(135deg,#2dd4bf,#10b981 38%,#7c3aed 78%,#020807)" },
  crimson: { label: "Crimson", tag: "Blood moon", bg: "radial-gradient(circle at 50% 0%,#f43f5e,#7f1022 52%,#0a0204 88%)" },
  sunset: { label: "Sunset", tag: "Dusk glow", bg: "linear-gradient(160deg,#ec4899,#f97316 50%,#3b0764)" },
  frost: { label: "Frost", tag: "Falling snow", bg: "linear-gradient(160deg,#e0f2fe,#38bdf8 45%,#0c2a4a)" },
  meteor: { label: "Stardust", tag: "Shooting stars", bg: "linear-gradient(135deg,#0b1030,#4c1d95 55%,#c4b5fd)" },
  sakura: { label: "Sakura", tag: "Petal night", bg: "radial-gradient(circle at 76% 24%,#fde2ee 0,#f472b6 12%,transparent 13%),linear-gradient(160deg,#5a1744,#1d0a22 58%,#07020a)", isNew: true },
  thunder: { label: "Thunder", tag: "Storm & lightning", bg: "linear-gradient(165deg,#3b5f8f,#0f1d33 52%,#02040a)", isNew: true },
  dawn: { label: "Divine Dawn", tag: "God rays", bg: "linear-gradient(180deg,#fde3ae 0%,#7fa8c9 30%,#16314a 64%,#050a12)", isNew: true },
};

// ---------- scroll helpers ----------
function useInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setShown(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold, rootMargin: "0px 0px -6% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, shown] as const;
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [ref, shown] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`rx-reveal ${shown ? "is-in" : ""} ${className}`}>
      {children}
    </div>
  );
}

function CountUp({ to, label }: { to: number; label: string }) {
  const [ref, shown] = useInView<HTMLDivElement>(0.4);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!shown) return;
    let raf = 0; const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - t0) / 1400, 1);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shown, to]);
  return (
    <div ref={ref} className="rx-credit-stat rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-center">
      <div className="font-serif text-3xl font-semibold tabular-nums text-white sm:text-4xl">{n}</div>
      <div className="mt-1 text-[9px] uppercase tracking-[0.3em] text-orange-200/60">{label}</div>
    </div>
  );
}

// ==============================
// STATIC CONTENT
// ==============================

const NAV_LINKS: { href: string; label: string; isNew?: boolean }[] = [
  { href: "#home", label: "Home" },
  { href: "#cast", label: "Cast & Crew" },
  { href: "/posters", label: "Posters" },
  { href: "/videos", label: "Videos" },
  { href: "/news", label: "News", isNew: true },
  { href: "/timeline", label: "Timeline", isNew: true },
];

const HERO_ACTIONS = [
  { href: "/videos", eyebrow: "Trailers & More", title: "Watch Videos", kind: "video", rgb: "255,176,64" },
  { href: "/fans-art", eyebrow: "Art by the Fans", title: "Fan Art", kind: "art", rgb: "244,114,182", isNew: true },
  { href: "/box-office", eyebrow: "Track the Numbers", title: "Box Office", kind: "box", rgb: "45,212,170", isNew: true },
] as const;


const RELEASE_LANGUAGES = ["Telugu", "Hindi", "Tamil", "Kannada", "Malayalam", "Bengali", "Arabic", "English"];

const CAST = [
  { name: "Allu Arjun", image: "/images/actor3.jpg", href: "/allu-arjun" },
  { name: "Mrunal Thakur", image: "/images/mrunal.jpg" },
  { name: "Rashmika Mandanna", image: "/images/rashmika.jpg" },
  { name: "Janhvi Kapoor", image: "/images/janhavi.jpg" },
  { name: "Deepika Padukone", image: "/images/actor2.jpg" },
];

const CREW = [
  { name: "Atlee Kumar", role: "Writer & Director", image: "/images/crew1.jpg" },
  { name: "Sai Abhyankkar", role: "Musician", image: "/images/crew2.jpg", alt: "Sai Abhyankar" },
  { name: "Kalanithi Maran", role: "Producer", image: "/images/crew3.jpg" },
  { name: "Sun Pictures", role: "Banner", image: "/images/crew4.jpg", alt: "Sun Picture" },
];

const CREATIVE_TEAM = [
  { role: "Cinematographer", name: "G.K. Vishnu", note: "Director of Photography" },
  { role: "Editor", name: "Antony L. Ruben", note: "Film Editor" },
  { role: "Production Designer", name: "Muthuraj", note: "Production Design" },
];

const VFX_STUDIOS = [
  { name: "Lola VFX", note: "Los Angeles", logo: "/images/logo10.png", href: "https://lolavfx.com/" },
  { name: "Spectral Motion", note: "Los Angeles", logo: "/images/logo11.jpg", href: "https://www.spectralmotion.com/" },
  { name: "Fractured FX", note: "Special Makeup Effects", logo: "/images/logo12.jpg", href: "https://www.fracturedfx.com/" },
  { name: "ILM Technoprops", note: "Industrial Light & Magic", logo: "/images/logo13.jpg", href: "https://www.ilm.com/" },
  { name: "IronHead Studio", note: "Costume & Creature Design", logo: "/images/logo14.jpg", href: "https://ironheadstudio.com/" },
  { name: "Legacy Effects", note: "Practical FX", logo: "/images/logo15.jpg", href: "https://www.legacyefx.com/" },
];

const ANNOUNCEMENT_VIDEOS = [
  { title: "GEAR UP for RAAKA", tag: "Announcement", embed: "https://www.youtube.com/embed/SI_PhNII7Mc" },
  { title: "Welcome on board Deepika Padukone", tag: "Announcement", embed: "https://www.youtube.com/embed/jlmT4apm1oI" },
];

const SONG_VIDEOS = [
  { title: "Make Way For The King", tag: "Song", embed: "https://www.youtube.com/embed/3UKmHZOGon4" },
];

const TICKET_PARTNERS = [
  { name: "BookMyShow", logo: "/images/logo1.jpg", w: 321, h: 157, href: "https://in.bookmyshow.com/movies/raaka/ET00494565" },
  { name: "District", logo: "/images/logo2.jpg", w: 715, h: 429, href: "https://www.district.in/movies/raaka-movie-tickets-MV218847" },
];

const BOX_OFFICE_LANGS: [string, string][] = [
  ["Telugu", "Original"],
  ["Hindi", "Dubbed"],
  ["Tamil", "Dubbed"],
  ["Kannada", "Dubbed"],
  ["Malayalam", "Dubbed"],
];

const BOX_OFFICE_STATS = ["Opening Day", "First Weekend", "India Net", "Highest Day"];

const CREW_CREDITS: { department: string; names: string[] }[] = [
  { department: "Cast", names: ["Allu Arjun", "Mrunal Thakur", "Rashmika Mandanna", "Janhvi Kapoor", "Deepika Padukone"] },
  { department: "Musician", names: ["Sai Abhyankar"] },
  { department: "Cinematography", names: ["G.K. Vishnu"] },
  { department: "Editor", names: ["Antony L. Ruben"] },
  { department: "Production Designer", names: ["Muthuraj"] },
  { department: "Costume Design", names: ["Sharon Gilham", "Dipika Lal", "Louise Mingenbach", "Anirudh Singh"] },
  { department: "Makeup Department", names: ["Gabriel Georgiou", "Shalu Mishra", "Kieran Smith"] },
  { department: "Production Management", names: ["Aakash Chandresh Dave", "Dhruv Ganeshpure", "Tulika Sikder"] },
  { department: "Second Unit / Assistant Director", names: ["Aryaveer Thakkarr"] },
  { department: "Art Department", names: ["Chrispin Chacko", "Aniket Mitra", "Abhay K Patidar"] },
  { department: "Sound Department", names: ["Arun Alphonse", "Sampath Alwar", "Vijay Dharme", "Bhushan Hegde"] },
  { department: "Special Effects", names: ["Lallan Gupta", "Sahil Gupta", "Gagan Kohli", "Lindsay Macgowan", "J. Alan Scott", "Vishal Tyagi", "Alyssa Yule"] },
  { department: "Visual Effects", names: ["Demian Gordon", "Staffan Linder", "Neel Madhu", "Sibi Naayagam", "Santosh Raju", "K.V. Sanjit", "Rabindra Sasmal", "Nilesh Tare", "Arjun Tyagi"] },
  {
    department: "Stunts",
    names: [
      "Brandon Belieu", "Yannick Ben", "Felix Betancourt", "Narayane Cabral", "Micaiah Chau", "Alvin Chon",
      "Jenna Culotta", "Melroy Dsilva", "Sébastien Dugast", "Bravin Robert Fonseca", "Andy Gill",
      "Maxwell Heavenrich", "Caitlin Hutson", "Daniel Jackson", "Micah Kerns", "Ashley Kim",
      "Henry Kingi Jr.", "Simphiwe Kunene", "Michael Lehr", "Joshua Mabie", "Javier Macias",
      "Isabella Miller", "Pingl Moll", "Nathan People", "Joe Perez", "J.J. Perry", "Bradley Price",
      "Raimundo Queirdo", "Jerry Quill", "Jeweliana Ramos-Ortiz", "Spiro Razatos", "Vlad Rimburg",
      "Sunil Rodrigues", "Stephano Rodriguez",
    ],
  },
  {
    department: "Camera & Electrical Department",
    names: ["Palraj Ambedkar", "Ravendra Singh Bhadauria", "Harkirath Bhui", "Matteo Corrinth", "Ankush Mandal", "Raaka", "Annareddygari Arun Kumar Reddy", "Suraj Sharma", "Sagar Singh"],
  },
  {
    department: "Costume & Wardrobe Department",
    names: ["Sharveri Dandekar", "Anna Divekar", "Rob Goodwin", "Unnatee Karia", "Emma Pallett", "Sydney Conrad Shapiro"],
  },
  { department: "Music Department", names: ["Daniel D'Mello Goodwin", "Pandit Shravan Mishra"] },
  { department: "Choreography", names: ["Hokuto 'Hok' Konishi"] },
  { department: "Publicity", names: ["Sanchita Trivedi"] },
  { department: "Additional Crew", names: ["Nayanika Biswas"] },
  { department: "Thanks", names: ["Aryan Khan", "Gauri Khan"] },
];

const EXPLORE_CARDS = [
  { title: "News & Updates", copy: "Latest announcements and updates about Raaka." },
  { title: "Characters", copy: "Discover the characters and their roles." },
  { title: "Music", copy: "Songs, lyrical videos and music updates." },
];

// ==============================
// SMALL PRESENTATIONAL PIECES
// ==============================

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-orange-300/70">
      {children}
    </p>
  );
}

function SectionHeading({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
}) {
  return (
    <div className="mb-9 max-w-2xl sm:mb-12 md:mb-16">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-3 font-serif text-3xl font-semibold leading-[1.08] tracking-tight text-white sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {lede && <p className="mt-4 text-[15px] leading-7 text-white/50">{lede}</p>}
    </div>
  );
}

function PersonCard({
  name, role, image, alt, href, size = "default", index,
}: {
  name: string; role?: string; image: string; alt?: string; href?: string; size?: "large" | "default"; index?: number;
}) {
  const inner = (
    <>
      <div className="raaka-character-frame relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
        <div className="raaka-character-orbit pointer-events-none absolute inset-[-18%] z-10 rounded-full" />
        <div className="raaka-character-grid pointer-events-none absolute inset-0 z-10" />
        <Image src={image} alt={alt ?? name} width={600} height={800} sizes="(max-width: 768px) 50vw, 25vw" className="raaka-card-image relative z-[2] h-full w-full object-cover" />
        <div className="raaka-character-vignette pointer-events-none absolute inset-0 z-[3]" />
        <div className="raaka-character-scan pointer-events-none absolute left-0 top-0 z-[4] h-[2px] w-full" />
        <div className="raaka-character-corners pointer-events-none absolute inset-3 z-[5]" />
        <div className="raaka-character-id pointer-events-none absolute left-4 top-4 z-[6] font-mono text-[8px] uppercase tracking-[0.28em] text-orange-200/70">RAAKA // PROFILE</div>
        {index !== undefined && (
          <div className="pointer-events-none absolute right-4 top-4 z-[6] font-mono text-[10px] tracking-[0.2em] text-white/40">{String(index + 1).padStart(2, "0")}</div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[7] bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3.5 pt-20 sm:p-5 sm:pt-24">
          <span className="inline-block rounded-full border border-orange-300/30 bg-orange-400/10 px-2.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.2em] text-orange-200 backdrop-blur-sm sm:text-[9px]">{role ?? "Cast"}</span>
          <h3 className={`mt-2 font-serif font-semibold leading-tight text-white ${size === "large" ? "text-lg sm:text-2xl" : "text-base sm:text-xl"}`}>{name}</h3>
          <span className="rx-person-line mt-3 block h-px w-10 bg-gradient-to-r from-orange-400 to-transparent" />
        </div>
      </div>
    </>
  );
  return href ? <a href={href} className="raaka-person-card group block">{inner}</a> : <div className="raaka-person-card group">{inner}</div>;
}

function StudioCard({ name, note, logo, href }: { name: string; note: string; logo: string; href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="raaka-person-card group block">
      <div className="flex aspect-[16/10] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-300 group-hover:border-white/25 group-hover:bg-white/[0.07]">
        <img
          src={logo}
          alt={name}
          className="h-full w-full object-contain opacity-80 grayscale transition duration-500 group-hover:opacity-100 group-hover:grayscale-0"
        />
      </div>
      <h3 className="mt-3 text-[15px] font-semibold text-white">{name}</h3>
      <p className="mt-0.5 text-xs uppercase tracking-[0.15em] text-white/35">{note}</p>
    </a>
  );
}

function VideoCard({ title, tag, embed }: { title: string; tag: string; embed: string }) {
  const id = embed.split("/embed/")[1]?.split(/[?&]/)[0] ?? "";
  const [playing, setPlaying] = useState(false);
  const [thumb, setThumb] = useState(`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`);
  const src = `${embed}${embed.includes("?") ? "&" : "?"}autoplay=1&rel=0&modestbranding=1&playsinline=1`;
  return (
    <div className="rx-video raaka-video-card group relative">
      <div className="rx-video-frame raaka-video-frame relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black">
        {playing ? (
          <iframe
            className="absolute inset-0 z-[10] h-full w-full"
            src={src}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <>
            <button type="button" onClick={() => setPlaying(true)} aria-label={`Play video: ${title}`} className="absolute inset-0 z-[4] cursor-pointer">
              <img
                src={thumb}
                alt=""
                loading="lazy"
                onError={() => setThumb(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`)}
                className="rx-video-thumb h-full w-full object-cover"
              />
              <span className="rx-play absolute left-1/2 top-1/2 flex h-[68px] w-[68px] -translate-x-1/2 -translate-y-1/2 items-center justify-center sm:h-20 sm:w-20">
                <span className="rx-play-ring" />
                <span className="rx-play-ring" style={{ animationDelay: "1.2s" }} />
                <span className="rx-play-btn relative flex h-full w-full items-center justify-center rounded-full">
                  <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6 text-white sm:h-7 sm:w-7" fill="currentColor"><path d="M8 5.5v13l11-6.5z" /></svg>
                </span>
              </span>
              <span className="absolute bottom-4 left-4 z-[8] text-[9px] font-semibold uppercase tracking-[0.3em] text-white/80 opacity-0 transition-all duration-500 group-hover:translate-x-1 group-hover:opacity-100 sm:text-[10px]">Tap to play</span>
            </button>
            <div className="raaka-video-grid pointer-events-none absolute inset-0 z-[2]" />
            <div className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-t from-black/75 via-transparent to-black/30" />
            <div className="raaka-video-corners pointer-events-none absolute inset-3 z-[7]" />
            <div className="pointer-events-none absolute left-4 top-4 z-[8] flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.3em] text-orange-100/80"><span className="h-1.5 w-1.5 rounded-full bg-orange-400 shadow-[0_0_12px_rgba(255,120,30,.9)]" />RAAKA // TRANSMISSION</div>
            <div className="pointer-events-none absolute bottom-4 right-4 z-[8] font-mono text-[8px] uppercase tracking-[0.22em] text-white/55">SIGNAL // {tag}</div>
          </>
        )}
      </div>
      <div className="relative mt-4 pl-4"><span className="absolute left-0 top-1 h-8 w-[2px] bg-gradient-to-b from-orange-400 to-transparent transition-all duration-500 group-hover:h-full" /><h3 className="text-lg font-semibold text-white md:text-xl">{title}</h3><p className="mt-1 text-sm uppercase tracking-[0.2em] text-white/35">{tag}</p></div>
    </div>
  );
}

function Embers({ count = 14, rise = 150 }: { count?: number; rise?: number }) {
  return (
    <span className="rx-embers pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <i
          key={i}
          className="rx-ember"
          style={{
            "--x": `${(i * 37 + 11) % 100}%`,
            "--s": `${2 + (i % 3)}px`,
            "--d": `${3.6 + (i % 5) * 0.8}s`,
            "--dl": `${(i * 0.55) % 5}s`,
            "--dx": `${(i % 2 ? 1 : -1) * (10 + ((i * 13) % 34))}px`,
            "--rise": `${rise}px`,
          } as React.CSSProperties}
        />
      ))}
    </span>
  );
}

function LogoShine({ src, alt = "RAAKA", imgClassName = "" }: { src: string; alt?: string; imgClassName?: string }) {
  return (
    <span className="rx-logo-stage relative block">
      <img src={src} alt={alt} className={`rx-logo-img block h-auto w-full object-contain ${imgClassName}`} />
      <span className="rx-logo-shine" style={{ "--mask": `url(${src})` } as React.CSSProperties} aria-hidden />
    </span>
  );
}

function HeroIcon({ kind }: { kind: string }) {
  if (kind === "video")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M10 8.6v6.8a.5.5 0 0 0 .76.43l5.5-3.4a.5.5 0 0 0 0-.86l-5.5-3.4A.5.5 0 0 0 10 8.6z" fill="currentColor" />
      </svg>
    );
  if (kind === "art")
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.4A3.6 3.6 0 0 0 21 11 9 9 0 0 0 12 3z" />
        <circle cx="7.6" cy="11.2" r="1" fill="currentColor" />
        <circle cx="10.2" cy="7.2" r="1" fill="currentColor" />
        <circle cx="15" cy="7.2" r="1" fill="currentColor" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 3.5v17h17" />
      <path d="m7.5 15 3.8-4 3 2.8 5-6" />
      <path d="M16.6 7.8h2.7v2.7" />
    </svg>
  );
}

function HeroScene({ kind }: { kind: string }) {
  if (kind === "video")
    return (
      <span className="rzh-scene" aria-hidden>
        <svg className="rzh-iris" viewBox="0 0 100 100">
          <g className="rzh-iris-blades">
            {[0, 1, 2, 3, 4, 5].map((k) => (
              <path key={k} d="M50 50 L50 7 A43 43 0 0 1 87.2 28.5 Z" transform={`rotate(${k * 60} 50 50)`} />
            ))}
          </g>
          <circle className="rzh-iris-rim" cx="50" cy="50" r="43" />
          <circle className="rzh-iris-eye" cx="50" cy="50" r="9" />
        </svg>
        <i className="rzh-strip rzh-strip-t" />
        <i className="rzh-strip rzh-strip-b" />
      </span>
    );
  if (kind === "art")
    return (
      <span className="rzh-scene" aria-hidden>
        <svg className="rzh-strokes" viewBox="0 0 220 120" fill="none" preserveAspectRatio="xMaxYMid meet">
          <path pathLength={100} className="rzh-stroke rzh-st1" d="M8 96 C 46 14, 88 128, 128 54 S 190 22, 214 62" />
          <path pathLength={100} className="rzh-stroke rzh-st2" d="M20 112 C 62 54, 100 116, 140 80 S 186 56, 214 94" />
          <path pathLength={100} className="rzh-stroke rzh-st3" d="M34 36 C 70 -2, 112 52, 150 22 S 196 6, 216 30" />
        </svg>
        {[0, 1, 2].map((k) => (
          <i key={k} className="rzh-dot" style={{ "--k": k } as React.CSSProperties} />
        ))}
      </span>
    );
  return (
    <span className="rzh-scene" aria-hidden>
      <svg className="rzh-gauge" viewBox="0 0 120 120" fill="none">
        {[[52, 82], [40, 64], [28, 46]].map(([r, p], k) => (
          <g key={k}>
            <circle className="rzh-track" cx="60" cy="60" r={r} />
            <circle className="rzh-arc" pathLength={100} cx="60" cy="60" r={r} style={{ "--p": p, animationDelay: `${k * 0.35}s` } as React.CSSProperties} />
          </g>
        ))}
        <circle className="rzh-orbit-dot" cx="60" cy="5" r="2.8" />
      </svg>
      <i className="rzh-live" />
    </span>
  );
}

function HeroActionCard({ action, index }: { action: (typeof HERO_ACTIONS)[number]; index: number }) {
  const onMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    el.style.setProperty("--ry", `${(px - 0.5) * 8}deg`);
    el.style.setProperty("--rx", `${(0.5 - py) * 6}deg`);
  };
  const onLeave = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const el = e.currentTarget;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };
  return (
    <a
      href={action.href}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ "--c": action.rgb, "--i": index } as React.CSSProperties}
      className={`rzh-card rzh-${action.kind} group w-[78vw] max-w-[340px] shrink-0 snap-start md:w-auto md:max-w-none`}
    >
      <span className="rzh-ticket">
        <span className="rzh-fill" aria-hidden />
        <span className="rzh-spot" aria-hidden />
        <HeroScene kind={action.kind} />

        <span className="rzh-main">
          <span className="rzh-medal" aria-hidden>
            <HeroIcon kind={action.kind} />
          </span>
          <span className="rzh-text">
            <span className="rzh-eyebrow">
              <span className="truncate">{action.eyebrow}</span>
              {"isNew" in action && action.isNew && <NewBadge addedAt="2026-09-06" />}
            </span>
            <span className="rzh-title">
              <span className="rzh-t1">{action.title}</span>
              <span className="rzh-t2" aria-hidden>{action.title}</span>
            </span>
          </span>
        </span>

        <span className="rzh-perf" aria-hidden />
        <span className="rzh-stub" aria-hidden>
          <span className="rzh-go">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </span>
        <span className="rzh-sheen" aria-hidden />
      </span>
    </a>
  );
}

function AuraSwitcher({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
  const idx = THEME_ORDER.indexOf(theme);
  const step = 360 / THEME_ORDER.length;
  const nextTheme = () => setTheme(THEME_ORDER[(idx + 1) % THEME_ORDER.length]);

  return (
    <div style={{ "--aura": AURA_RGB[theme] } as React.CSSProperties}
      className="fixed left-3 top-3 z-[90] sm:left-5 sm:top-5 md:left-7 md:top-6">
      <button type="button" onClick={nextTheme}
        aria-label={`Change aura theme. Current: ${AURA_META[theme].label}. Next: ${AURA_META[THEME_ORDER[(idx + 1) % THEME_ORDER.length]].label}`}
        title={`Click to switch to ${AURA_META[THEME_ORDER[(idx + 1) % THEME_ORDER.length]].label}`}
        className="rzs-btn">
        <span className="rzs-dial" aria-hidden>
          <span className="rzs-ticks" style={{ transform: `rotate(${-idx * step}deg)` }}>
            {THEME_ORDER.map((t, i) => <i key={t} className={i === idx ? "on" : ""} style={{ "--a": `${i * step}deg` } as React.CSSProperties} />)}
          </span>
          <span className="rzs-planet" style={{ background: AURA_META[theme].bg }}><i /></span>
        </span>
        <span className="rzs-label"><small>Aura · click to change</small><b key={theme}>{AURA_META[theme].label}</b></span>
        <span className="rzs-caret rzs-next" aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </span>
      </button>
    </div>
  );
}

function SnowField() {
  return (
    <>
      {Array.from({ length: 34 }).map((_, i) => (
        <i
          key={i}
          className="rxa-snow"
          style={{
            left: `${(i * 29 + 7) % 100}%`,
            "--s": `${2 + (i % 4)}px`,
            "--t": `${10 + ((i * 7) % 11)}s`,
            "--d": `${-((i * 13) % 17)}s`,
            "--x": `${((i % 5) - 2) * 38}px`,
            "--o": 0.35 + (i % 4) * 0.15,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
}

function StarField() {
  return (
    <>
      {Array.from({ length: 64 }).map((_, i) => (
        <i
          key={i}
          className="rxa-star"
          style={{
            left: `${(i * 37 + 11) % 100}%`,
            top: `${(i * 53 + 5) % 100}%`,
            "--s": `${1 + (i % 3)}px`,
            "--t": `${2.4 + (i % 5) * 0.8}s`,
            "--d": `${-((i * 7) % 9)}s`,
          } as React.CSSProperties}
        />
      ))}
      {[0, 1, 2, 3, 4].map((k) => (
        <i
          key={`m${k}`}
          className="rxa-meteor"
          style={{
            top: `${[6, 22, 38, 12, 30][k]}%`,
            left: `${[62, 78, 45, 90, 70][k]}%`,
            "--t": `${[5.5, 7, 6.2, 8, 6.8][k]}s`,
            "--d": `${[0, 2.4, 4.1, 1.2, 5.6][k]}s`,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
}

function PetalField() {
  return (
    <>
      {Array.from({ length: 22 }).map((_, i) => (
        <span
          key={i}
          className="rzt-pw"
          style={{
            left: `${(i * 37 + 9) % 100}%`,
            "--t": `${11 + ((i * 5) % 9)}s`,
            "--d": `${-((i * 7) % 19)}s`,
            "--x": `${((i % 5) - 2) * 46}px`,
            "--s": `${10 + (i % 4) * 4}px`,
            "--o": 0.5 + (i % 4) * 0.12,
          } as React.CSSProperties}
        >
          <i className="rzt-petal" style={{ "--r": `${(i * 53) % 360}deg`, "--v": `${3 + (i % 4)}s` } as React.CSSProperties} />
        </span>
      ))}
    </>
  );
}

function RainField() {
  return (
    <>
      {Array.from({ length: 70 }).map((_, i) => (
        <i
          key={i}
          className="rzt-rain"
          style={{
            left: `${(i * 41 + 3) % 130}%`,
            "--h": `${44 + ((i * 13) % 46)}px`,
            "--t": `${(0.65 + ((i * 7) % 9) * 0.07).toFixed(2)}s`,
            "--d": `-${(((i * 11) % 17) * 0.09).toFixed(2)}s`,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
}

function DustField() {
  return (
    <>
      {Array.from({ length: 34 }).map((_, i) => (
        <i
          key={i}
          className="rzt-mote"
          style={{
            left: `${(i * 31 + 6) % 100}%`,
            "--s": `${2 + (i % 3)}px`,
            "--t": `${14 + ((i * 5) % 13)}s`,
            "--d": `${-((i * 9) % 23)}s`,
            "--x": `${((i % 7) - 3) * 22}px`,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
}

function TimerUnit({ label, value, pct, glow }: { label: string; value: number; pct: number; glow?: boolean }) {
  return (
    <div className={`rx-timer ${glow ? "rx-timer-hot" : ""}`}>
      <p className="rx-timer-number font-serif font-black tabular-nums text-white">
        <span key={value} className="rx-digit inline-block">{String(value).padStart(2, "0")}</span>
      </p>
      <p className="rx-timer-label">{label}</p>
      <span key={`t${value}`} className="rx-tick pointer-events-none absolute inset-0" />
      <span className="rx-timer-bar" aria-hidden>
        <i style={{ width: `${pct}%`, transition: pct === 0 ? "none" : undefined }} />
      </span>
    </div>
  );
}

function CreditGroup({ group, index, dense }: { group: { department: string; names: string[] }; index: number; dense?: boolean }) {
  const [ref, shown] = useInView<HTMLDivElement>(0.12);
  return (
    <div
      ref={ref}
      style={{ "--d": `${(index % 3) * 110}ms` } as React.CSSProperties}
      className={`rx-credit ${shown ? "is-in" : ""} ${dense ? "mt-4" : "mb-7 break-inside-avoid"}`}
    >
      <div className="flex items-center gap-3">
        <span className="rx-credit-dot" />
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-orange-300/80 sm:text-xs">{group.department}</h3>
        <span className="ml-auto font-mono text-[10px] text-white/25">{String(group.names.length).padStart(2, "0")}</span>
      </div>
      <span className="rx-credit-rule" />
      {dense ? (
        <ul className="mt-4 flex flex-wrap gap-1.5 sm:gap-2">
          {group.names.map((n, i) => (
            <li key={n} style={{ "--i": i } as React.CSSProperties} className="rx-credit-chip rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[12px] text-white/65 sm:text-[13px]">{n}</li>
          ))}
        </ul>
      ) : (
        <ul className="mt-3 space-y-1.5">
          {group.names.map((n, i) => (
            <li key={n} style={{ "--i": i } as React.CSSProperties} className="rx-credit-name text-[15px] text-white/70">{n}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ExploreCard({ href, eyebrow, meta, title, copy, index, featured }: { href?: string; eyebrow: string; meta?: string; title: string; copy: string; index: number; featured?: boolean }) {
  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  const body = (
    <>
      <span className="rx-explore-num pointer-events-none absolute -right-2 -top-4 select-none font-serif font-black leading-none">{String(index + 1).padStart(2, "0")}</span>
      <div className="relative flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/45">
        <span className="rounded-full border border-orange-300/30 bg-orange-400/10 px-2.5 py-1 font-semibold text-orange-200">{eyebrow}</span>
        {meta && <span>{meta}</span>}
      </div>
      <h3 className={`relative mt-4 font-serif font-semibold leading-snug text-white ${featured ? "text-2xl sm:text-3xl" : "text-xl"}`}>{title}</h3>
      <p className="relative mt-3 text-sm leading-7 text-white/50">{copy}</p>
      {href && (
        <div className="relative mt-6 flex items-center gap-3 text-sm font-semibold text-white/70 transition group-hover:text-white">
          Read Full Story
          <span className="rx-explore-arrow flex h-8 w-8 items-center justify-center rounded-full border border-white/20">→</span>
        </div>
      )}
    </>
  );
  const cls = `rx-explore group block p-6 sm:p-8 ${featured ? "sm:min-h-[300px]" : ""}`;
  return href ? (
    <Link href={href} onMouseMove={onMove} className={cls}>{body}</Link>
  ) : (
    <div onMouseMove={onMove} className={cls}>{body}</div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [intro, setIntro] = useState(true);
  const [ticketsOpen, setTicketsOpen] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const castTrackRef = useRef<HTMLDivElement | null>(null);
  const crewTrackRef = useRef<HTMLDivElement | null>(null);

  const scrollCastCrew = (track: React.RefObject<HTMLDivElement | null>, direction: -1 | 1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".cast-crew-item");
    const step = card ? card.getBoundingClientRect().width + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: direction * step, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  

  // ==============================
  // RAAKA BACKGROUND THEME
  // ==============================
  const [theme, setTheme] = useState<Theme>("obsidian");

  // ==============================
  // RAAKA INTRO AUDIO
  // 3rd second → 8th second
  // ==============================
  useEffect(() => {
    const audio = new Audio("/sounds/king.mp3");

    audio.volume = 1;
    audio.preload = "auto";

    let stopTimer: ReturnType<typeof setTimeout> | null = null;

    const startAudio = () => {
      // Audio 3rd second se start
      audio.currentTime = 3;

      audio.play().catch(() => {});

      // Intro clip ends after 6 seconds.
      stopTimer = setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
      }, 6000);
    };

    audio.addEventListener("loadedmetadata", startAudio);

    // Intro 3 seconds
    const introTimer = setTimeout(() => {
      setIntro(false);
    }, 3000);

    return () => {
      audio.removeEventListener("loadedmetadata", startAudio);

      if (stopTimer) {
        clearTimeout(stopTimer);
      }

      clearTimeout(introTimer);

      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  // ==============================
  // LOAD SAVED BACKGROUND THEME
  // ==============================
  useEffect(() => {
    const savedTheme = localStorage.getItem("raaka-theme");

    if (
      savedTheme && (THEME_ORDER as string[]).includes(savedTheme)
    ) {
      setTheme(savedTheme as Theme);
    }
  }, []);

  // ==============================
  // SAVE BACKGROUND THEME
  // ==============================
  useEffect(() => {
    localStorage.setItem("raaka-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [menuOpen]);

  // ==============================
  // COUNTDOWN
  // ==============================
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // ==============================
  // COUNTDOWN TICK AUDIO
  // ==============================
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/sounds/tick111.mp3");
    audioRef.current.volume = 0.35;
  }, []);

  // ==============================
  // COUNTDOWN TIMER
  // ==============================
  useEffect(() => {
    const targetDate = new Date("2026-08-15T00:00:00+05:30").getTime();

    // Website load hone ka exact time
    const startTime = Date.now();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      // ==================================
      // FIRST 10 SECONDS: NO TICK SOUND
      // ==================================
      if (Date.now() - startTime >= 10000 && audioRef.current) {
        audioRef.current.currentTime = 7;
        audioRef.current.play().catch(() => {});
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    // Immediately calculate countdown
    updateCountdown();

    // Every 1 second
    const timer = setInterval(updateCountdown, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const audio = new Audio("/sounds/king.mp3");
    audio.loop = true;
    audio.volume = 0.34;
    musicRef.current = audio;
    return () => { audio.pause(); audio.currentTime = 0; musicRef.current = null; };
  }, []);

  const toggleMusic = async () => {
    const audio = musicRef.current;
    if (!audio) return;
    if (audio.paused) {
      try { await audio.play(); setMusicPlaying(true); } catch {}
    } else {
      audio.pause(); setMusicPlaying(false);
    }
  };

  return (
    <>
      {/* =================================
          RAAKA CINEMATIC BACKGROUND
      ================================== */}

      <style>{`
        button:not(:disabled) {
          cursor: pointer;
        }
        .raaka-theme-graphite .raaka-site {
          color: #f5f5f5;
        }
        .raaka-theme-graphite .raaka-site .text-white {
          color: #f5f5f5 !important;
        }
        .raaka-theme-graphite .raaka-site [class*="text-white/"] {
          color: rgba(245, 245, 245, 0.72) !important;
        }
        .raaka-theme-graphite .raaka-site .text-white\\/40 { color: rgba(245,245,245,.58) !important; }
        .raaka-theme-graphite .raaka-site .text-white\\/35 { color: rgba(245,245,245,.52) !important; }
        .raaka-theme-graphite .raaka-site .text-white\\/30 { color: rgba(245,245,245,.46) !important; }
        .raaka-theme-graphite .raaka-site .text-white\\/25 { color: rgba(245,245,245,.40) !important; }
        .raaka-theme-graphite .raaka-site .text-white\\/20 { color: rgba(245,245,245,.34) !important; }
        .raaka-theme-graphite .raaka-site .text-white\\/15 { color: rgba(245,245,245,.28) !important; }
        .raaka-theme-graphite .raaka-site .text-white\\/10 { color: rgba(245,245,245,.22) !important; }
        .raaka-theme-graphite .raaka-site .border-white\\/10 { border-color: rgba(255,255,255,.12) !important; }
        .raaka-theme-graphite .raaka-site .border-white\\/\\[0\\.13\\] { border-color: rgba(255,255,255,.14) !important; }
        .raaka-theme-graphite .raaka-site .border-white\\/\\[0\\.14\\] { border-color: rgba(255,255,255,.15) !important; }
        .raaka-theme-graphite .raaka-site .bg-black\\/50 { background-color: rgba(0,0,0,.52) !important; }
        .raaka-theme-graphite .raaka-site .bg-black\\/65 { background-color: rgba(0,0,0,.68) !important; }

/* ================================================================
   RAAKA — ULTRA PREMIUM MOTION / INTERACTION SYSTEM
   Deliberately different motion language for every control.
================================================================ */
:root{--rx:255,92,22;--gold:255,196,76;--violet:168,85,247;--cyan:52,211,153;}
@keyframes rxLogo{0%,100%{transform:scale(1) translateY(0);filter:drop-shadow(0 0 8px rgba(255,105,35,.18)) drop-shadow(0 0 28px rgba(255,70,0,.10))}45%{transform:scale(1.018) translateY(-2px);filter:drop-shadow(0 0 22px rgba(255,130,50,.62)) drop-shadow(0 0 70px rgba(255,65,0,.25))}70%{transform:scale(1.008)} }
@keyframes rxLogoFlash{0%{transform:translateX(-140%) skewX(-22deg);opacity:0}20%{opacity:.9}55%{opacity:.9}100%{transform:translateX(240%) skewX(-22deg);opacity:0}}
@keyframes rxFire{0%{transform:translateX(-140%) skewX(-22deg);opacity:0}15%{opacity:1}100%{transform:translateX(230%) skewX(-22deg);opacity:0}}
@keyframes rxOrbit{to{transform:rotate(360deg)}}
@keyframes rxPulseRing{0%{transform:scale(.45);opacity:.8}100%{transform:scale(3.4);opacity:0}}
@keyframes rxScan{0%{transform:translateY(-120%);opacity:0}15%{opacity:1}85%{opacity:1}100%{transform:translateY(120%);opacity:0}}
@keyframes rxGold{0%{transform:translateX(-140%) skewX(-20deg)}100%{transform:translateX(240%) skewX(-20deg)}}
@keyframes rxElectric{0%,100%{transform:translate(0,0)}15%{transform:translate(-2px,1px)}25%{transform:translate(3px,-1px)}38%{transform:translate(-3px,0)}52%{transform:translate(2px,1px)}68%{transform:translate(-1px,-1px)}}
@keyframes rxMagnet{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-3px) scale(1.035)}}
@keyframes rxSpin{to{transform:rotate(360deg)}}
@keyframes rxArrow{0%{transform:translateX(0)}55%{transform:translateX(10px) scale(1.15)}100%{transform:translateX(16px);opacity:.35}}
@keyframes rxFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes rxShimmer{0%{transform:translateX(-130%)}100%{transform:translateX(180%)}}
@keyframes rxBreath{0%,100%{box-shadow:0 0 0 rgba(255,100,20,0)}50%{box-shadow:0 0 38px rgba(255,90,20,.22)}}
@keyframes rxRipple{0%{transform:translate(-50%,-50%) scale(.1);opacity:.75}100%{transform:translate(-50%,-50%) scale(4);opacity:0}}

/* RAAKA PNG — hero, intro and countdown logos */
img[src*="raaka-logo.png"],img[src*="logo2.png"][alt="RAAKA"]{animation:rxLogo 4.2s cubic-bezier(.45,.05,.25,1) infinite;transform-origin:center;will-change:transform,filter;}
img[src*="raaka-logo.png"]:hover{animation-duration:2.2s;filter:drop-shadow(0 0 30px rgba(255,125,35,.78)) drop-shadow(0 0 90px rgba(255,60,0,.28));}

/* Hero buttons: three completely different identities */
.raaka-interactive{isolation:isolate;transform-style:preserve-3d;will-change:transform;}
.raaka-interactive::before,.raaka-interactive::after{pointer-events:none;}
.raaka-action-orange{box-shadow:inset 0 0 0 1px rgba(255,90,20,.04);}
.raaka-action-orange::before{content:"";position:absolute;top:-20%;bottom:-20%;left:-45%;width:32%;background:linear-gradient(90deg,transparent,rgba(255,170,80,.95),rgba(255,65,0,.35),transparent);filter:blur(8px);transform:skewX(-22deg);opacity:0;z-index:2;}
.raaka-action-orange:hover{transform:translateY(-8px) scale(1.018)!important;border-color:rgba(255,105,25,.82)!important;box-shadow:0 25px 70px rgba(255,65,0,.24),inset 0 0 45px rgba(255,70,0,.07);}
.raaka-action-orange:hover::before{opacity:1;animation:rxFire .8s cubic-bezier(.2,.8,.2,1);}
.raaka-action-orange .raaka-action-icon{transition:.5s cubic-bezier(.2,.8,.2,1);}
.raaka-action-orange:hover .raaka-action-icon{transform:scale(1.18) rotate(-7deg);box-shadow:0 0 32px rgba(255,90,20,.55);}

.raaka-action-purple::before{content:"";position:absolute;right:-18px;top:-18px;width:82px;height:82px;border:1px solid rgba(192,132,252,.65);border-radius:50%;box-shadow:0 0 35px rgba(168,85,247,.18);opacity:0;z-index:2;}
.raaka-action-purple::after{content:"";position:absolute;right:-20px;top:-20px;width:58px;height:58px;border:1px dashed rgba(216,180,254,.8);border-radius:50%;opacity:0;z-index:2;}
.raaka-action-purple:hover{transform:translateY(-7px) rotateX(2deg)!important;border-color:rgba(192,132,252,.8)!important;box-shadow:0 25px 75px rgba(139,40,255,.25);}
.raaka-action-purple:hover::before{opacity:1;animation:rxPulseRing 1.15s ease-out infinite;}
.raaka-action-purple:hover::after{opacity:1;animation:rxOrbit 1.4s linear infinite;}
.raaka-action-purple:hover .raaka-action-icon{transform:rotate(180deg) scale(1.2);box-shadow:0 0 34px rgba(168,85,247,.6);}

.raaka-action-yellow::before{content:"";position:absolute;top:-25%;bottom:-25%;left:-120%;width:65%;background:linear-gradient(90deg,transparent,rgba(255,244,180,.7),transparent);transform:skewX(-20deg);opacity:0;z-index:2;}
.raaka-action-yellow:hover{transform:translateY(-7px)!important;border-color:rgba(255,215,80,.9)!important;box-shadow:0 25px 70px rgba(255,170,0,.22),inset 0 -1px 0 rgba(255,220,100,.6);}
.raaka-action-yellow:hover::before{opacity:1;animation:rxGold .75s ease-out;}
.raaka-action-yellow:hover .raaka-action-icon{animation:rxFloat .65s ease-in-out infinite;box-shadow:0 0 34px rgba(255,200,55,.58);}

/* Hero arrow becomes a launch indicator */
.raaka-interactive:hover > div:last-of-type{animation:rxArrow .55s cubic-bezier(.2,.8,.2,1) forwards;background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.4);}

/* Aura = living energy reactor */
.raaka-aura-premium{animation:rxBreath 3s ease-in-out infinite;}
.raaka-aura-premium::before{content:"";position:absolute;inset:-2px;border-radius:inherit;padding:1px;background:conic-gradient(from 0deg,transparent 0 55%,rgba(255,150,50,.9),transparent 72%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:0;animation:rxSpin 2.5s linear infinite;transition:opacity .3s;}
.raaka-aura-premium:hover::before{opacity:1;}
.raaka-aura-premium:hover{transform:scale(1.06);border-color:rgba(255,145,50,.65);box-shadow:0 0 55px rgba(255,90,20,.2);}

/* Menu = rotating scanner */
.raaka-menu-premium{overflow:hidden;}
.raaka-menu-premium::before{content:"";position:absolute;inset:-120%;background:conic-gradient(from 0deg,transparent 0 72%,rgba(255,255,255,.9),transparent 78%);opacity:0;animation:rxSpin 1.8s linear infinite;}
.raaka-menu-premium:hover::before{opacity:1;}
.raaka-menu-premium:hover{animation:rxMagnet .7s ease;border-color:rgba(255,255,255,.8);box-shadow:0 0 60px rgba(255,255,255,.16);}

/* Menu navigation — each row gets a different signature */
.raaka-nav-link{position:relative;overflow:hidden;transition:transform .45s cubic-bezier(.2,.8,.2,1),background .35s,border-color .35s;}
.raaka-nav-link::after{content:"";position:absolute;left:-110%;bottom:0;width:80%;height:2px;background:linear-gradient(90deg,transparent,#ff7a25,#ffd18a,transparent);transition:none;}
.raaka-nav-link:hover::after{left:130%;transition:left .65s cubic-bezier(.2,.8,.2,1);}
.raaka-nav-link:hover{background:linear-gradient(90deg,rgba(255,85,20,.12),rgba(255,255,255,.035),transparent);border-color:rgba(255,255,255,.08);}
.raaka-home-link:hover{transform:translateX(7px);}
.raaka-fan-link:hover{transform:translateX(9px) rotate(-.5deg);background:linear-gradient(90deg,rgba(80,170,255,.12),transparent);}
.raaka-tracker-link:hover{transform:translateX(6px);box-shadow:inset 3px 0 #55ffad;}
.raaka-contact-link:hover{animation:rxElectric .5s linear;box-shadow:inset 3px 0 #fff;}
.raaka-nav-arrow{display:inline-block;transition:.45s cubic-bezier(.2,.8,.2,1);}
.raaka-nav-link:hover .raaka-nav-arrow{transform:translateX(8px) scale(1.18);color:#fff;}

/* Book Tickets toggle */
.raaka-ticket-toggle{position:relative;overflow:hidden;}
.raaka-ticket-toggle::after{content:"";position:absolute;left:-120%;top:0;height:100%;width:55%;background:linear-gradient(90deg,transparent,rgba(255,204,80,.22),transparent);transform:skewX(-20deg);}
.raaka-ticket-toggle:hover::after{animation:rxGold .7s ease-out;}
.raaka-ticket-toggle:hover{background:rgba(255,170,35,.08);box-shadow:inset 3px 0 rgba(255,196,76,.75);}

/* Ticket cards */
.raaka-ticket-card{position:relative;isolation:isolate;overflow:hidden;transition:transform .5s cubic-bezier(.2,.8,.2,1),box-shadow .5s,border-color .5s!important;}
.raaka-ticket-card::before{content:"";position:absolute;inset:-100%;background:conic-gradient(from 0deg,transparent 0 65%,rgba(255,210,90,.95),transparent 72%);opacity:0;z-index:-1;animation:rxSpin 1.4s linear infinite;}
.raaka-ticket-card::after{content:"";position:absolute;inset:0;background:linear-gradient(110deg,transparent 20%,rgba(255,230,160,.2) 48%,transparent 62%);transform:translateX(-130%);z-index:3;pointer-events:none;}
.raaka-ticket-card:hover{transform:translateY(-7px) scale(1.035)!important;border-color:rgba(255,205,80,.75)!important;box-shadow:0 20px 55px rgba(255,145,0,.2)!important;}
.raaka-ticket-card:hover::before{opacity:1;}
.raaka-ticket-card:hover::after{animation:rxShimmer .9s ease-out;}

/* Person / VFX */
.raaka-person-card{transition:transform .6s cubic-bezier(.2,.8,.2,1),filter .6s;}
.raaka-person-card:hover{transform:translateY(-9px) scale(1.015);filter:drop-shadow(0 18px 35px rgba(0,0,0,.5));}
.raaka-person-card img{transition:transform .9s cubic-bezier(.2,.8,.2,1),filter .7s;}
.raaka-person-card:hover img{transform:scale(1.09);filter:saturate(1.18) contrast(1.08);}
.raaka-person-card > div::after{content:"";position:absolute;inset:0;background:linear-gradient(110deg,transparent 20%,rgba(255,180,100,.2) 48%,transparent 63%);transform:translateX(-130%);pointer-events:none;}
.raaka-person-card:hover > div::after{animation:rxShimmer 1s ease-out;}
.raaka-studio-card{transition:transform .55s cubic-bezier(.2,.8,.2,1),filter .55s;}
.raaka-studio-card:hover{transform:translateY(-8px) perspective(800px) rotateX(3deg) scale(1.02);filter:drop-shadow(0 15px 30px rgba(0,0,0,.45));}

/* Videos */
.raaka-video-card{transition:transform .55s cubic-bezier(.2,.8,.2,1),filter .55s;}
.raaka-video-card:hover{transform:translateY(-8px);filter:drop-shadow(0 18px 38px rgba(255,85,20,.12));}
.raaka-video-card > div:first-child{position:relative;overflow:hidden;}
.raaka-video-card > div:first-child::after{content:"";position:absolute;inset:0;background:linear-gradient(105deg,transparent 30%,rgba(255,255,255,.16) 48%,transparent 62%);transform:translateX(-130%);pointer-events:none;z-index:5;}
.raaka-video-card:hover > div:first-child::after{animation:rxShimmer 1s ease-out;}

/* Explore cards */
.raaka-explore-card{position:relative;overflow:hidden;transition:transform .55s cubic-bezier(.2,.8,.2,1),border-color .4s,box-shadow .4s!important;}
.raaka-explore-card::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 0 100%,rgba(255,90,20,.14),transparent 45%);opacity:0;transition:opacity .45s;}
.raaka-explore-card::after{content:"";position:absolute;top:-20%;bottom:-20%;left:-120%;width:45%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent);transform:skewX(-18deg);}
.raaka-explore-card:hover{transform:translateY(-9px) scale(1.015)!important;border-color:rgba(255,120,40,.35)!important;box-shadow:0 20px 55px rgba(0,0,0,.35);}
.raaka-explore-card:hover::before{opacity:1;}
.raaka-explore-card:hover::after{animation:rxShimmer .9s ease-out;}

/* Footer = travelling light */
.raaka-footer-link{position:relative;padding-bottom:5px;}
.raaka-footer-link::after{content:"";position:absolute;left:0;bottom:0;width:100%;height:1px;background:linear-gradient(90deg,transparent,#ff7a25,#fff,transparent);transform:scaleX(0);transform-origin:left;transition:transform .45s cubic-bezier(.2,.8,.2,1);}
.raaka-footer-link:hover::after{transform:scaleX(1);}

/* Click ripple */
.raaka-control{position:relative;overflow:hidden;}
.raaka-ripple{position:absolute;width:14px;height:14px;border-radius:999px;background:radial-gradient(circle,rgba(255,255,255,.55),rgba(255,120,30,.22) 35%,transparent 70%);pointer-events:none;transform:translate(-50%,-50%) scale(.1);animation:rxRipple .7s cubic-bezier(.2,.8,.2,1) forwards;z-index:20;}

.raaka-ticket-mini{transition:transform .5s cubic-bezier(.2,.8,.2,1),filter .5s;}
.raaka-ticket-mini:hover{transform:translateY(-6px) scale(1.04);filter:drop-shadow(0 12px 28px rgba(255,180,50,.18));}
.raaka-ticket-mini img{transition:transform .55s cubic-bezier(.2,.8,.2,1),filter .55s;}
.raaka-ticket-mini:hover img{transform:scale(1.08);filter:brightness(1.15);}

@media (
        /* ================================================================
           RAAKA — CINEMATIC CONTENT EXPERIENCES
        ================================================================ */
        @keyframes rxVideoSweep{0%{transform:translateY(-160%);opacity:0}18%{opacity:.8}50%{opacity:.35}100%{transform:translateY(560%);opacity:0}}
        @keyframes rxVideoOrbit{to{transform:rotate(360deg)}}
        @keyframes rxCharacterScan{0%{transform:translateY(-20px);opacity:0}15%{opacity:.8}50%{opacity:.25}100%{transform:translateY(420px);opacity:0}}
        @keyframes rxCharacterOrbit{to{transform:rotate(360deg)}}
        @keyframes rxCharacterGlow{0%,100%{box-shadow:0 0 0 rgba(255,100,30,0)}50%{box-shadow:0 0 45px rgba(255,90,20,.18)}}
        @keyframes rxDataSweep{0%{transform:translateX(-120%);opacity:0}20%{opacity:.7}100%{transform:translateX(260%);opacity:0}}
        @keyframes rxTicketPortal{to{transform:rotate(360deg)}}
        @keyframes rxTicketBeam{0%{transform:translateX(-140%) skewX(-18deg);opacity:0}25%{opacity:.9}100%{transform:translateX(260%) skewX(-18deg);opacity:0}}
        @keyframes rxNumberFlicker{0%,100%{opacity:.82}47%{opacity:1}49%{opacity:.55}51%{opacity:1}}

        .raaka-video-frame{isolation:isolate;box-shadow:0 18px 70px rgba(0,0,0,.42);transition:transform .65s cubic-bezier(.2,.8,.2,1),border-color .5s,box-shadow .5s;}
        .raaka-video-frame::before{content:"";position:absolute;inset:0;z-index:4;border:1px solid rgba(255,255,255,.05);pointer-events:none;}
        .raaka-video-energy{border-radius:40%;background:conic-gradient(from 0deg,transparent 0 65%,rgba(255,92,22,.75),transparent 72%);filter:blur(18px);opacity:.18;animation:rxVideoOrbit 8s linear infinite;}
        .raaka-video-grid{background:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:38px 38px;opacity:.15;mask-image:linear-gradient(to bottom,black,transparent 80%);}
        .raaka-video-scan{background:linear-gradient(to bottom,transparent,rgba(255,105,35,.22),rgba(255,255,255,.08),transparent);filter:blur(2px);opacity:0;}
        .raaka-video-topline{background:linear-gradient(90deg,transparent,#ff762e 25%,#fff 50%,#ff762e 75%,transparent);box-shadow:0 0 18px rgba(255,90,20,.65);opacity:.55;}
        .raaka-video-corners{border:1px solid rgba(255,150,90,.28);box-shadow:inset 0 0 35px rgba(255,90,20,.05);}
        .raaka-video-card:hover .raaka-video-frame{transform:translateY(-10px) scale(1.012);border-color:rgba(255,105,35,.55);box-shadow:0 28px 90px rgba(255,65,0,.18),0 0 0 1px rgba(255,120,50,.12);}
        .raaka-video-card:hover .raaka-video-scan{opacity:1;animation:rxVideoSweep 1.5s ease-out;}
        .raaka-video-card:hover .raaka-video-energy{opacity:.5;animation-duration:3.5s;}
        .raaka-video-card:hover .raaka-video-grid{opacity:.28;}
        .raaka-video-card h3{transition:transform .5s,color .4s;}
        .raaka-video-card:hover h3{transform:translateX(8px);}

        .raaka-character-frame{isolation:isolate;transform-style:preserve-3d;transition:transform .7s cubic-bezier(.2,.8,.2,1),border-color .5s,box-shadow .5s;animation:rxCharacterGlow 4s ease-in-out infinite;}
        .raaka-character-frame::before{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(135deg,rgba(255,120,40,.12),transparent 35%,transparent 65%,rgba(255,180,80,.07));opacity:.35;transition:opacity .5s;}
        .raaka-character-orbit{border:1px solid rgba(255,115,45,.16);border-left-color:rgba(255,180,90,.75);border-radius:50%;animation:rxCharacterOrbit 9s linear infinite;opacity:.55;}
        .raaka-character-grid{background:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:30px 30px;opacity:.1;mask-image:linear-gradient(to bottom,transparent,black 30%,black 70%,transparent);}
        .raaka-character-vignette{background:linear-gradient(to top,rgba(0,0,0,.8),transparent 45%,rgba(0,0,0,.28));}
        .raaka-character-scan{background:linear-gradient(90deg,transparent,rgba(255,120,50,.75),rgba(255,255,255,.55),transparent);box-shadow:0 0 20px rgba(255,90,20,.5);opacity:0;}
        .raaka-character-corners{border:1px solid rgba(255,150,90,.25);box-shadow:inset 0 0 25px rgba(255,90,20,.06);}
        .raaka-person-card:hover .raaka-character-frame{transform:translateY(-10px) rotateX(2deg) rotateY(-2deg) scale(1.025);border-color:rgba(255,110,40,.6);box-shadow:0 30px 75px rgba(0,0,0,.55),0 0 45px rgba(255,75,20,.12);}
        .raaka-person-card:hover .raaka-card-image{transform:scale(1.1);filter:saturate(1.18) contrast(1.08) brightness(1.04);transition:transform .9s cubic-bezier(.2,.8,.2,1),filter .7s;}
        .raaka-person-card:hover .raaka-character-scan{opacity:1;animation:rxCharacterScan 1.25s ease-out;}
        .raaka-person-card:hover .raaka-character-orbit{opacity:1;animation-duration:3s;}
        .raaka-person-card:hover .raaka-character-grid{opacity:.22;}

        #crew-credits .break-inside-avoid{position:relative;padding:12px 14px;border:1px solid transparent;border-radius:14px;transition:transform .45s,border-color .45s,background .45s,box-shadow .45s;}
        #crew-credits .break-inside-avoid:hover{transform:translateX(7px);border-color:rgba(255,120,50,.16);background:rgba(255,90,20,.035);box-shadow:inset 2px 0 rgba(255,110,40,.7);}

        #box-office{isolation:isolate;}
        #box-office::before{content:"";position:absolute;left:0;right:0;top:0;height:1px;background:linear-gradient(90deg,transparent,#fbbf24,#fff0b0,#fbbf24,transparent);opacity:.5;}
        #box-office .raaka-box-panel{position:relative;overflow:hidden;isolation:isolate;transition:transform .5s,border-color .45s,box-shadow .45s;}
        #box-office .raaka-box-panel::before{content:"";position:absolute;inset:0;background:linear-gradient(110deg,transparent 20%,rgba(255,220,120,.12) 48%,transparent 62%);transform:translateX(-130%);pointer-events:none;}
        #box-office .raaka-box-panel:hover{transform:translateY(-7px);border-color:rgba(255,210,80,.38);box-shadow:0 22px 65px rgba(255,160,20,.1);}
        #box-office .raaka-box-panel:hover::before{animation:rxDataSweep 1s ease-out;}
        #box-office .raaka-box-value{font-variant-numeric:tabular-nums;animation:rxNumberFlicker 3.8s ease-in-out infinite;}
        #box-office .raaka-box-bar{position:absolute;left:0;bottom:0;height:2px;width:35%;background:linear-gradient(90deg,transparent,#fbbf24,#fff);box-shadow:0 0 18px rgba(251,191,36,.65);animation:rxDataSweep 3.2s ease-in-out infinite;}
        #box-office .raaka-lang-row{position:relative;overflow:hidden;transition:transform .4s,background .4s,padding .4s;}
        #box-office .raaka-lang-row::before{content:"";position:absolute;left:0;top:0;bottom:0;width:2px;background:#fbbf24;transform:scaleY(0);transition:transform .35s;}
        #box-office .raaka-lang-row:hover{transform:translateX(8px);background:rgba(255,190,60,.035);padding-left:10px;}
        #box-office .raaka-lang-row:hover::before{transform:scaleY(1);}
        #box-office .raaka-stat-card{position:relative;overflow:hidden;transition:transform .45s,border-color .4s,box-shadow .4s;}
        #box-office .raaka-stat-card::after{content:"";position:absolute;top:-10%;bottom:-10%;left:-100%;width:45%;background:linear-gradient(90deg,transparent,rgba(255,230,150,.18),transparent);transform:skewX(-18deg);}
        #box-office .raaka-stat-card:hover{transform:translateY(-8px) scale(1.02);border-color:rgba(255,210,80,.4);box-shadow:0 18px 45px rgba(255,170,20,.09);}
        #box-office .raaka-stat-card:hover::after{animation:rxDataSweep .9s ease-out;}

        .raaka-ticket-portal{position:relative;isolation:isolate;overflow:hidden;}
        .raaka-ticket-portal::before{content:"";position:absolute;inset:-70%;background:conic-gradient(from 0deg,transparent 0 72%,rgba(255,210,90,.8),rgba(255,110,20,.35),transparent 78%);opacity:.45;animation:rxTicketPortal 7s linear infinite;}
        .raaka-ticket-portal::after{content:"";position:absolute;inset:1px;border-radius:inherit;background:linear-gradient(110deg,rgba(255,190,60,.07),rgba(255,255,255,.025),rgba(255,110,20,.06));pointer-events:none;}
        .raaka-ticket-beam{position:absolute;inset:0;z-index:1;background:linear-gradient(90deg,transparent,rgba(255,220,130,.18),transparent);transform:translateX(-140%) skewX(-18deg);}
        .raaka-ticket-portal:hover .raaka-ticket-beam{animation:rxTicketBeam 1.1s ease-out;}
        .raaka-ticket-mini{position:relative;z-index:3;}
        .raaka-ticket-logo-box{position:relative;overflow:hidden;}
        .raaka-ticket-mini:hover{transform:translateY(-9px) scale(1.035);filter:drop-shadow(0 16px 34px rgba(255,175,40,.2));}
        .raaka-ticket-arrow{transition:transform .4s,color .3s;}
        .raaka-ticket-mini:hover .raaka-ticket-arrow{transform:translateX(6px);color:#fff;}
prefers-reduced-motion:reduce){
  img[src*="raaka-logo.png"],img[src*="logo2.png"][alt="RAAKA"]{animation:none!important}
  *,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important;}
}


/* ================================================================
   RAAKA — CINEMATIC 2.0 / FINAL MOTION PASS
   No content changes. Motion only.
================================================================ */

/* ---------- MASTER AURA BUTTON ---------- */
.raaka-aura-premium{
  isolation:isolate;
  overflow:hidden;
  transform:translateZ(0);
  box-shadow:0 0 0 1px rgba(255,255,255,.04),0 16px 55px rgba(0,0,0,.45);
}
.raaka-aura-premium::before{
  content:"";
  position:absolute;
  inset:-70%;
  background:conic-gradient(from 0deg,transparent 0 62%,rgba(255,120,25,.95) 68%,rgba(255,220,120,.8) 71%,transparent 77%);
  animation:rxAuraOrbit 2.6s linear infinite;
  opacity:.75;
  z-index:-2;
}
.raaka-aura-premium::after{
  content:"";
  position:absolute;
  inset:1px;
  border-radius:inherit;
  background:linear-gradient(135deg,rgba(255,255,255,.09),rgba(0,0,0,.7) 48%,rgba(255,110,20,.08));
  z-index:-1;
}
.raaka-aura-premium:hover{
  transform:translateY(-3px) scale(1.055);
  box-shadow:0 0 35px rgba(255,100,20,.22),0 20px 65px rgba(0,0,0,.55);
}
@keyframes rxAuraOrbit{to{transform:rotate(360deg)}}

/* ---------- HERO ACTIONS: THREE DIFFERENT PHYSICS ---------- */
.raaka-action-orange{
  box-shadow:inset 0 0 0 1px rgba(255,92,22,.05);
}
.raaka-action-orange::before{
  background:linear-gradient(90deg,transparent,rgba(255,190,110,.95),rgba(255,70,0,.45),transparent)!important;
  filter:blur(6px)!important;
}
.raaka-action-orange:hover{
  transform:perspective(700px) rotateX(-4deg) translateY(-10px) scale(1.025)!important;
  box-shadow:0 25px 75px rgba(255,65,0,.27),inset 0 0 45px rgba(255,80,0,.08)!important;
}
.raaka-action-purple{
  overflow:visible!important;
}
.raaka-action-purple::before{
  width:100px!important;height:100px!important;
  right:-28px!important;top:-28px!important;
  border:1px solid rgba(211,150,255,.75)!important;
  box-shadow:0 0 55px rgba(168,85,247,.28)!important;
}
.raaka-action-purple::after{
  width:70px!important;height:70px!important;
  right:-20px!important;top:-20px!important;
  border-color:rgba(255,220,255,.9)!important;
}
.raaka-action-purple:hover{
  transform:translateY(-9px) rotateZ(-1.2deg)!important;
  box-shadow:0 25px 80px rgba(139,40,255,.30)!important;
}
.raaka-action-yellow{
  border-color:rgba(255,205,80,.12)!important;
}
.raaka-action-yellow:hover{
  transform:perspective(800px) rotateY(-4deg) translateY(-9px) scale(1.025)!important;
  box-shadow:0 25px 75px rgba(255,175,0,.26),inset 0 -1px 0 rgba(255,230,120,.8)!important;
}
.raaka-interactive .raaka-action-icon{
  position:relative;
  transition:transform .55s cubic-bezier(.2,.9,.2,1),box-shadow .55s;
}
.raaka-action-orange:hover .raaka-action-icon{transform:scale(1.18) rotate(-8deg) translateX(2px);}
.raaka-action-purple:hover .raaka-action-icon{transform:scale(1.18) rotate(180deg);}
.raaka-action-yellow:hover .raaka-action-icon{transform:translateY(-5px) scale(1.16);}

/* ---------- ABOUT RAAKA: CINEMATIC DOSSIER ---------- */
.raaka-about{position:relative;}
.raaka-about::before{
  content:"";
  position:absolute;
  left:0;right:0;top:12%;
  height:1px;
  background:linear-gradient(90deg,transparent,rgba(255,115,35,.5),transparent);
  transform:scaleX(.25);
  transform-origin:center;
  animation:rxDossierLine 5s ease-in-out infinite;
}
@keyframes rxDossierLine{0%,100%{opacity:.25;transform:scaleX(.2)}50%{opacity:1;transform:scaleX(.85)}}
.raaka-about .raaka-explore-card{
  transform-style:preserve-3d;
  box-shadow:0 30px 80px rgba(0,0,0,.42);
}
.raaka-about .raaka-explore-card::after{
  background:linear-gradient(105deg,transparent 20%,rgba(255,180,80,.28) 48%,transparent 62%)!important;
}
.raaka-about .raaka-explore-card:hover{
  transform:perspective(900px) rotateY(-5deg) rotateX(2deg) translateY(-10px) scale(1.02)!important;
  box-shadow:25px 35px 90px rgba(255,80,10,.16),0 30px 80px rgba(0,0,0,.5)!important;
}
.raaka-about dl > div{
  position:relative;
  padding:12px 0;
  transition:transform .4s ease,background .4s ease;
}
.raaka-about dl > div::before{
  content:"";
  position:absolute;
  left:-10px;top:0;bottom:0;
  width:2px;
  background:linear-gradient(#ff6a20,#ffd27a,transparent);
  transform:scaleY(0);
  transform-origin:top;
  transition:transform .45s ease;
}
.raaka-about dl > div:hover{transform:translateX(8px);}
.raaka-about dl > div:hover::before{transform:scaleY(1);}

/* ---------- COUNTDOWN: REACTOR CORE ---------- */
.raaka-countdown-section > div:first-child{
  isolation:isolate;
  box-shadow:0 35px 110px rgba(0,0,0,.55);
}
.raaka-countdown-section > div:first-child::before{
  content:"";
  position:absolute;
  inset:-1px;
  border-radius:2rem;
  padding:1px;
  background:conic-gradient(from 0deg,transparent 0 58%,rgba(255,177,55,.95) 64%,rgba(255,238,170,.85) 68%,transparent 75%);
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;
  mask-composite:exclude;
  animation:rxCountdownOrbit 4s linear infinite;
  z-index:3;
  pointer-events:none;
}
.raaka-countdown-section > div:first-child::after{
  content:"";
  position:absolute;
  inset:12%;
  border:1px solid rgba(255,190,80,.13);
  border-radius:50%;
  box-shadow:0 0 80px rgba(255,120,20,.08);
  animation:rxCountdownPulse 3.2s ease-in-out infinite;
  pointer-events:none;
}
@keyframes rxCountdownOrbit{to{transform:rotate(360deg)}}
@keyframes rxCountdownPulse{0%,100%{transform:scale(.88);opacity:.2}50%{transform:scale(1.08);opacity:.8}}
.raaka-countdown-section .raaka-countdown-photo{animation:rxCountdownPhoto 14s ease-in-out infinite alternate;}
@keyframes rxCountdownPhoto{from{transform:scale(1.02)}to{transform:scale(1.11)}}
.raaka-countdown-section .grid.grid-cols-4 > div{
  position:relative;
  overflow:hidden;
  transition:transform .45s cubic-bezier(.2,.8,.2,1),background .45s,box-shadow .45s;
}
.raaka-countdown-section .grid.grid-cols-4 > div::before{
  content:"";
  position:absolute;
  left:-100%;top:0;width:45%;height:100%;
  background:linear-gradient(90deg,transparent,rgba(255,210,110,.20),transparent);
  transform:skewX(-18deg);
  animation:rxTimerSweep 3.8s ease-in-out infinite;
}
.raaka-countdown-section .grid.grid-cols-4 > div:hover{
  transform:translateY(-8px) scale(1.035);
  background:rgba(255,180,60,.08);
  box-shadow:0 20px 55px rgba(255,130,20,.16),inset 0 0 30px rgba(255,180,60,.05);
}
.raaka-countdown-section .raaka-timer-number{animation:rxTimerNumber 2.8s ease-in-out infinite;}
@keyframes rxTimerSweep{0%,45%{left:-100%}70%,100%{left:150%}}
@keyframes rxTimerNumber{0%,100%{transform:translateY(0);filter:drop-shadow(0 4px 15px rgba(0,0,0,.8))}50%{transform:translateY(-2px);filter:drop-shadow(0 0 30px rgba(255,185,70,.30))}}

/* ---------- CAST & CREW: CINEMATIC PORTRAIT MOTION — NO SCAN LINES ---------- */
#cast .raaka-person-card,
#crew .raaka-person-card{
  position:relative;
  perspective:1100px;
  transform-style:preserve-3d;
  transition:transform .55s cubic-bezier(.16,1,.3,1), filter .55s;
}
#cast .raaka-person-card::before,
#crew .raaka-person-card::before{
  content:"";
  position:absolute;
  inset:-2px;
  border-radius:1.05rem;
  padding:1px;
  background:linear-gradient(135deg,rgba(255,190,90,.0),rgba(255,110,25,.0) 42%,rgba(255,220,150,.72) 70%,rgba(255,110,25,.0));
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;
  mask-composite:exclude;
  opacity:.35;
  transition:opacity .45s,filter .45s;
  pointer-events:none;
  z-index:5;
}
#cast .raaka-person-card::after,
#crew .raaka-person-card::after{
  content:"";
  position:absolute;
  width:75%;
  height:75%;
  left:12%;
  top:8%;
  border-radius:50%;
  background:radial-gradient(circle,rgba(255,150,55,.18),transparent 65%);
  filter:blur(18px);
  opacity:0;
  transform:scale(.65);
  transition:opacity .55s,transform .7s;
  pointer-events:none;
  z-index:0;
}
#cast .raaka-person-card:hover,
#crew .raaka-person-card:hover{
  transform:translateY(-10px) scale(1.018);
  filter:drop-shadow(0 22px 38px rgba(0,0,0,.48));
}
#cast .raaka-person-card:hover::before,
#crew .raaka-person-card:hover::before{
  opacity:1;
  filter:drop-shadow(0 0 10px rgba(255,125,35,.45));
  animation:rxPortraitEdge 1.8s ease-in-out infinite alternate;
}
#cast .raaka-person-card:hover::after,
#crew .raaka-person-card:hover::after{
  opacity:1;
  transform:scale(1);
}
#cast .raaka-person-card > div,
#crew .raaka-person-card > div{
  position:relative;
  z-index:2;
  overflow:hidden;
  box-shadow:0 18px 55px rgba(0,0,0,.38);
  transition:transform .65s cubic-bezier(.16,1,.3,1),box-shadow .65s,border-color .45s;
}
#cast .raaka-person-card:hover > div{
  transform:perspective(1000px) rotateY(-4deg) rotateX(2deg) scale(1.018);
  box-shadow:22px 28px 75px rgba(255,75,10,.16),0 25px 65px rgba(0,0,0,.55);
  border-color:rgba(255,125,45,.42)!important;
}
#crew .raaka-person-card:hover > div{
  transform:perspective(1000px) rotateY(4deg) rotateX(2deg) scale(1.018);
  box-shadow:-22px 28px 75px rgba(255,150,40,.14),0 25px 65px rgba(0,0,0,.55);
  border-color:rgba(255,175,80,.38)!important;
}
#cast .raaka-person-card > div::after,
#crew .raaka-person-card > div::after{
  content:"";
  position:absolute;
  inset:0;
  background:radial-gradient(circle at 50% 35%,transparent 0 28%,rgba(0,0,0,.08) 58%,rgba(0,0,0,.46) 100%);
  opacity:.35;
  transition:opacity .55s;
  pointer-events:none;
  z-index:3;
}
#cast .raaka-person-card:hover > div::after,
#crew .raaka-person-card:hover > div::after{opacity:.08;}
#cast .raaka-person-card img,
#crew .raaka-person-card img{
  transition:transform 1s cubic-bezier(.16,1,.3,1),filter .7s;
}
#cast .raaka-person-card:hover img,
#crew .raaka-person-card:hover img{
  transform:scale(1.075);
  filter:saturate(1.14) contrast(1.06) brightness(1.05);
}
#cast .raaka-person-card h3,
#cast .raaka-person-card p,
#crew .raaka-person-card h3,
#crew .raaka-person-card p{
  position:relative;
  z-index:6;
  transition:transform .45s cubic-bezier(.16,1,.3,1),color .4s,letter-spacing .4s;
}
#cast .raaka-person-card:hover h3,
#crew .raaka-person-card:hover h3{
  transform:translateY(-2px);
  letter-spacing:.025em;
  color:#fff7ed;
}
@keyframes rxPortraitEdge{from{opacity:.65}to{opacity:1} }

/* ---------- CREW CREDITS: PREMIUM FILM-CREDIT REVEAL ---------- */
#creative-team .divide-y > div{
  position:relative;
  isolation:isolate;
  overflow:hidden;
  padding-left:16px;
  transform:translateZ(0);
  transition:transform .55s cubic-bezier(.16,1,.3,1),background .45s, padding-left .45s;
}
#creative-team .divide-y > div::before{
  content:"";
  position:absolute;
  left:0;
  top:14%;
  bottom:14%;
  width:3px;
  border-radius:999px;
  background:linear-gradient(to bottom,transparent,#ff7b28 25%,#ffe0a3 50%,#ff7b28 75%,transparent);
  transform:scaleY(.12);
  transform-origin:center;
  opacity:.5;
  transition:transform .55s cubic-bezier(.16,1,.3,1),opacity .45s,box-shadow .45s;
  z-index:1;
}
#creative-team .divide-y > div::after{
  content:"";
  position:absolute;
  inset:0;
  background:linear-gradient(105deg,transparent 0 35%,rgba(255,180,90,.12) 48%,transparent 61%);
  transform:translateX(-120%);
  pointer-events:none;
  z-index:0;
}
#creative-team .divide-y > div > *{position:relative;z-index:2;}
#creative-team .divide-y > div:hover{
  transform:translateX(8px);
  padding-left:22px;
  background:linear-gradient(90deg,rgba(255,92,22,.105),rgba(255,145,55,.025) 55%,transparent);
}
#creative-team .divide-y > div:hover::before{
  transform:scaleY(1);
  opacity:1;
  box-shadow:0 0 18px rgba(255,105,25,.55);
}
#creative-team .divide-y > div:hover::after{animation:rxCreditSweep 1s cubic-bezier(.2,.7,.2,1) forwards;}
#creative-team .divide-y > div p:first-child{
  transition:transform .45s,color .4s,letter-spacing .4s;
}
#creative-team .divide-y > div:hover p:first-child{
  transform:translateX(3px);
  letter-spacing:.16em;
  color:rgba(255,190,110,.9);
}
#creative-team h3{
  transition:transform .5s cubic-bezier(.16,1,.3,1),letter-spacing .45s,color .4s;
}
#creative-team .divide-y > div:hover h3{
  letter-spacing:.035em;
  transform:translateX(6px);
  color:#fff7ed;
}
#creative-team .divide-y > div p:last-child{
  transition:transform .5s cubic-bezier(.16,1,.3,1),opacity .45s;
}
#creative-team .divide-y > div:hover p:last-child{transform:translateX(4px);opacity:.9;}
@keyframes rxCreditSweep{from{transform:translateX(-120%)}to{transform:translateX(120%)} }

/* ---------- VIDEOS: CINEMA SCREEN / SIGNAL LOCK ---------- */
.raaka-video-card{
  position:relative;
  transform-style:preserve-3d;
}
.raaka-video-card > div:first-child{
  isolation:isolate;
  box-shadow:0 25px 70px rgba(0,0,0,.45);
  transition:transform .6s cubic-bezier(.2,.8,.2,1),box-shadow .6s,border-color .5s;
}
.raaka-video-card > div:first-child::before{
  content:"";
  position:absolute;
  inset:10px;
  border:1px solid rgba(255,130,45,.0);
  border-radius:12px;
  z-index:6;
  transition:border-color .5s,box-shadow .5s;
  pointer-events:none;
}
.raaka-video-card > div:first-child::after{
  content:"";
  position:absolute;
  left:-110%;top:0;width:45%;height:100%;
  background:linear-gradient(90deg,transparent,rgba(255,210,150,.24),transparent);
  transform:skewX(-20deg);
  z-index:7;
  pointer-events:none;
}
.raaka-video-card:hover > div:first-child{
  transform:perspective(1000px) rotateX(-2deg) translateY(-8px) scale(1.015);
  border-color:rgba(255,105,30,.48)!important;
  box-shadow:0 30px 85px rgba(255,65,0,.13),0 25px 70px rgba(0,0,0,.6);
}
.raaka-video-card:hover > div:first-child::before{
  border-color:rgba(255,125,45,.45);
  box-shadow:inset 0 0 35px rgba(255,75,10,.07);
}
.raaka-video-card:hover > div:first-child::after{animation:rxVideoSweep .9s ease-out;}
.raaka-video-card h3{transition:transform .45s,color .45s;}
.raaka-video-card:hover h3{transform:translateX(7px);color:#fff7ed;}
@keyframes rxVideoSweep{from{left:-110%}to{left:140%}}

/* ---------- TICKETS: CLEAN PREMIUM PORTAL (NOT HEAVY) ---------- */
.raaka-ticket-portal{
  position:relative;
  isolation:isolate;
  overflow:hidden!important;
  border-color:rgba(255,190,75,.16)!important;
  background:
    radial-gradient(circle at 18% 50%,rgba(255,100,15,.09),transparent 30%),
    linear-gradient(120deg,rgba(255,255,255,.035),rgba(255,150,30,.035),rgba(255,255,255,.02))!important;
  box-shadow:0 25px 90px rgba(0,0,0,.48),inset 0 0 60px rgba(255,130,20,.025);
}
.raaka-ticket-portal::before{
  content:"";
  position:absolute;
  inset:-2px;
  border-radius:inherit;
  background:conic-gradient(from 0deg,transparent 0 72%,rgba(255,190,65,.75),transparent 79%);
  animation:rxTicketOrbit 3.5s linear infinite;
  z-index:-2;
}
.raaka-ticket-portal::after{
  content:"";
  position:absolute;
  inset:1px;
  border-radius:inherit;
  background:linear-gradient(105deg,rgba(4,4,4,.96),rgba(18,12,7,.92),rgba(4,4,4,.96));
  z-index:-1;
}
.raaka-ticket-beam{
  position:absolute;
  top:0;bottom:0;left:-35%;
  width:20%;
  background:linear-gradient(90deg,transparent,rgba(255,206,110,.22),rgba(255,120,20,.08),transparent);
  transform:skewX(-18deg);
  animation:rxTicketBeam 4.2s ease-in-out infinite;
}
.raaka-ticket-mini{
  position:relative;
  transition:transform .5s cubic-bezier(.2,.8,.2,1),filter .5s;
}
.raaka-ticket-mini:hover{transform:translateY(-8px) scale(1.045)!important;filter:drop-shadow(0 18px 35px rgba(255,155,35,.20));}
.raaka-ticket-logo-box{
  position:relative;
  overflow:hidden;
  transition:border-color .4s,box-shadow .4s,transform .5s;
}
.raaka-ticket-mini:hover .raaka-ticket-logo-box{
  border-color:rgba(255,207,95,.62)!important;
  box-shadow:0 0 35px rgba(255,150,20,.16),inset 0 0 25px rgba(255,180,40,.07);
}
.raaka-ticket-logo-box::after{
  content:"";
  position:absolute;left:-120%;top:-20%;width:45%;height:140%;
  background:linear-gradient(90deg,transparent,rgba(255,235,180,.45),transparent);
  transform:skewX(-18deg);
}
.raaka-ticket-mini:hover .raaka-ticket-logo-box::after{animation:rxTicketLogo .7s ease-out;}
.raaka-ticket-arrow{display:inline-block;transition:transform .4s,color .4s;}
.raaka-ticket-mini:hover .raaka-ticket-arrow{transform:translateX(7px);color:#ffd27a;}
@keyframes rxTicketOrbit{to{transform:rotate(360deg)}}
@keyframes rxTicketBeam{0%,20%{left:-35%;opacity:0}35%{opacity:1}75%{opacity:1}100%{left:125%;opacity:0}}
@keyframes rxTicketLogo{from{left:-120%}to{left:145%}}

/* ---------- BOX OFFICE: DATA VAULT / MOVING MARKET GRID ---------- */
#box-office{
  isolation:isolate;
}
#box-office::before{
  content:"";
  position:absolute;
  inset:0;
  background:
    linear-gradient(rgba(255,180,60,.045) 1px,transparent 1px),
    linear-gradient(90deg,rgba(255,180,60,.045) 1px,transparent 1px);
  background-size:46px 46px;
  mask-image:linear-gradient(to bottom,transparent,black 18%,black 82%,transparent);
  animation:rxGridDrift 12s linear infinite;
  pointer-events:none;
}
#box-office::after{
  content:"";
  position:absolute;
  top:0;bottom:0;left:-25%;
  width:18%;
  background:linear-gradient(90deg,transparent,rgba(255,200,80,.13),transparent);
  transform:skewX(-18deg);
  animation:rxBoxSweep 5s ease-in-out infinite;
  pointer-events:none;
}
@keyframes rxGridDrift{to{background-position:46px 46px}}
@keyframes rxBoxSweep{0%,20%{left:-25%;opacity:0}35%{opacity:1}75%{opacity:1}100%{left:125%;opacity:0}}
#box-office .raaka-box-panel{
  position:relative;
  overflow:hidden;
  background:linear-gradient(145deg,rgba(255,255,255,.035),rgba(255,175,50,.025))!important;
  transition:transform .5s cubic-bezier(.2,.8,.2,1),background .4s,box-shadow .5s;
}
#box-office .raaka-box-panel:hover{
  transform:translateY(-9px);
  background:linear-gradient(145deg,rgba(255,255,255,.06),rgba(255,175,50,.07))!important;
  box-shadow:0 25px 65px rgba(255,135,15,.13),inset 0 0 35px rgba(255,180,50,.04);
}
#box-office .raaka-box-bar{
  position:absolute;left:0;right:0;bottom:0;height:2px;
  background:linear-gradient(90deg,transparent,#ff9d2f,#ffe2a3,transparent);
  transform:scaleX(.1);
  transform-origin:left;
  animation:rxBoxBar 3s ease-in-out infinite;
}
#box-office .raaka-box-value{
  transition:transform .4s,text-shadow .4s;
}
#box-office .raaka-box-panel:hover .raaka-box-value{
  transform:translateX(5px);
  text-shadow:0 0 28px rgba(255,190,70,.35);
}
#box-office .raaka-lang-row{
  position:relative;
  transition:transform .35s,background .35s,padding .35s;
}
#box-office .raaka-lang-row::before{
  content:"";
  position:absolute;left:0;top:0;bottom:0;width:2px;
  background:linear-gradient(#ff7a20,#ffd37a,transparent);
  transform:scaleY(0);
  transition:transform .35s;
}
#box-office .raaka-lang-row:hover{
  transform:translateX(8px);
  background:rgba(255,160,40,.055);
  padding-left:10px;
}
#box-office .raaka-lang-row:hover::before{transform:scaleY(1);}
@keyframes rxBoxBar{0%,100%{transform:scaleX(.08);opacity:.4}50%{transform:scaleX(.85);opacity:1}}

/* ---------- REDUCED MOTION ---------- */
@media (prefers-reduced-motion:reduce){
  .raaka-aura-premium::before,
  .raaka-about::before,
  .raaka-countdown-section > div:first-child::before,
  .raaka-countdown-section > div:first-child::after,
  .raaka-countdown-section .raaka-countdown-photo,
  .raaka-countdown-section .raaka-timer-number,
  #cast .raaka-person-card::before,#crew .raaka-person-card::before,
  .raaka-ticket-portal::before,.raaka-ticket-beam,
  #box-office::before,#box-office::after,#box-office .raaka-box-bar{animation:none!important}
}
/* ================================================================
   RAAKA — AURA / RELEASE / FOOTER SIGNATURE PASS
================================================================ */
/* Aura: compact energy-reactor interaction, no text/content changes */
.raaka-aura-premium{
  isolation:isolate!important;
  overflow:hidden!important;
  transform:translateZ(0);
  border-color:rgba(255,255,255,.12)!important;
  box-shadow:0 0 0 1px rgba(255,170,70,.05),0 12px 40px rgba(0,0,0,.48),inset 0 0 18px rgba(255,130,30,.035)!important;
  transition:transform .45s cubic-bezier(.16,1,.3,1),box-shadow .45s,border-color .45s!important;
}
.raaka-aura-premium::before{
  content:""!important; position:absolute!important; inset:-85%!important; z-index:-2!important;
  background:conic-gradient(from 0deg,transparent 0 35%,rgba(255,92,0,.05) 43%,rgba(255,178,55,.98) 49%,rgba(255,244,190,.95) 51%,rgba(255,84,0,.28) 54%,transparent 62%);
  animation:raakaAuraReactor 2.2s linear infinite!important;
  opacity:.9!important;
}
.raaka-aura-premium::after{
  content:""!important; position:absolute!important; inset:1px!important; z-index:-1!important; border-radius:inherit!important;
  background:radial-gradient(circle at 50% 50%,rgba(255,130,30,.12),transparent 55%),linear-gradient(135deg,rgba(255,255,255,.08),rgba(0,0,0,.76) 58%);
}
.raaka-aura-premium:hover{
  transform:translateY(-4px) scale(1.06)!important;
  border-color:rgba(255,176,80,.55)!important;
  box-shadow:0 0 0 1px rgba(255,150,50,.14),0 0 30px rgba(255,100,15,.24),0 18px 55px rgba(0,0,0,.58),inset 0 0 24px rgba(255,120,20,.09)!important;
}
.raaka-aura-premium:active{transform:translateY(-1px) scale(.98)!important}
@keyframes raakaAuraReactor{to{transform:rotate(360deg)}}

/* Releasing In: floating cinematic chips */
.raaka-release-panel{position:relative}
.raaka-release-panel::before{content:"";position:absolute;inset:18% 8%;border-radius:999px;background:radial-gradient(ellipse,rgba(255,150,45,.08),transparent 68%);filter:blur(25px);animation:raakaReleaseBreath 3.5s ease-in-out infinite}
.raaka-release-orbit{border:1px solid rgba(255,190,100,.09);border-radius:50%;transform:translate(-50%,-50%) rotate(-18deg);animation:raakaReleaseSpin 12s linear infinite}
.raaka-release-orbit::after{content:"";position:absolute;left:50%;top:-4px;width:7px;height:7px;border-radius:50%;background:#ffd58a;box-shadow:0 0 18px 5px rgba(255,150,45,.5)}
.raaka-release-line{animation:raakaReleaseLine 2.8s ease-in-out infinite}
.raaka-release-chip{transition:transform .4s cubic-bezier(.16,1,.3,1),border-color .35s,background .35s,box-shadow .35s}
.raaka-release-chip:hover{transform:translateY(-5px) scale(1.045);border-color:rgba(255,190,100,.3);background:rgba(255,150,40,.06);box-shadow:0 12px 30px rgba(255,110,20,.12)}
.raaka-release-chip-glow{transform:translateX(-120%) skewX(-20deg);background:linear-gradient(90deg,transparent,rgba(255,220,150,.45),transparent);transition:transform .65s ease}
.raaka-release-chip:hover .raaka-release-chip-glow{transform:translateX(120%) skewX(-20deg)}
@keyframes raakaReleaseSpin{to{transform:translate(-50%,-50%) rotate(342deg)}}
@keyframes raakaReleaseBreath{50%{opacity:.45;transform:scale(1.08)}}
@keyframes raakaReleaseLine{50%{opacity:.75;transform:scaleX(1.18)}}

/* Footer: replaces old line-heavy footer with a single cinematic core */
.raaka-cinematic-footer{border-top:0!important}
.raaka-footer-core{box-shadow:0 25px 80px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.035)}
.raaka-footer-core::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 15% 0%,rgba(255,130,30,.11),transparent 32%),radial-gradient(circle at 85% 100%,rgba(120,70,255,.07),transparent 30%);pointer-events:none}
.raaka-footer-orbit{border:1px solid rgba(255,150,55,.08);box-shadow:0 0 80px rgba(255,100,20,.08);animation:raakaFooterOrbit 14s linear infinite}
.raaka-footer-noise{opacity:.12;background-image:radial-gradient(rgba(255,255,255,.22) .6px,transparent .6px);background-size:7px 7px;mask-image:linear-gradient(to bottom,black,transparent 80%)}
.raaka-footer-sweep{background:linear-gradient(90deg,transparent,rgba(255,180,80,.08),transparent);transform:translateX(-160%) skewX(-18deg);animation:raakaFooterSweep 6s ease-in-out infinite}
.raaka-footer-nav{position:relative;transition:color .3s,transform .3s;}
.raaka-footer-nav::after{content:"";position:absolute;left:0;right:0;bottom:-7px;height:1px;background:linear-gradient(90deg,transparent,#f4bd73,transparent);transform:scaleX(0);transition:transform .4s cubic-bezier(.16,1,.3,1)}
.raaka-footer-nav:hover{color:rgba(255,255,255,.95);transform:translateY(-2px)}
.raaka-footer-nav:hover::after{transform:scaleX(1)}
@keyframes raakaFooterSweep{0%,25%{transform:translateX(-160%) skewX(-18deg)}65%,100%{transform:translateX(430%) skewX(-18deg)}}
@keyframes raakaFooterOrbit{to{transform:rotate(360deg)}}

@media(prefers-reduced-motion:reduce){
 .raaka-aura-premium::before,.raaka-release-orbit,.raaka-release-line,.raaka-release-panel::before,.raaka-footer-orbit,.raaka-footer-sweep{animation:none!important}
}



/* ================================================================
   RAAKA — v2: reveal, credits, explore, aura themes, responsive
================================================================ */
html,body{max-width:100%;overflow-x:hidden;-webkit-tap-highlight-color:transparent}
img,video,iframe{max-width:100%}
/* Subtle gold carousel controls; scrollbar stays hidden, card peek hints at more content */
.cast-crew-carousel{isolation:isolate}
.cast-crew-arrow{position:absolute;z-index:5;top:46%;display:flex;align-items:center;justify-content:center;width:42px;height:42px;border:1px solid rgba(214,165,91,.42);border-radius:9999px;background:rgba(8,8,8,.82);color:#e8bd7a;font-size:30px;line-height:1;box-shadow:0 5px 22px rgba(0,0,0,.4);backdrop-filter:blur(10px);opacity:0;transform:scale(.94);transition:opacity .22s ease,transform .22s ease,background .22s ease,border-color .22s ease;cursor:pointer}
.cast-crew-carousel:hover .cast-crew-arrow,.cast-crew-carousel:focus-within .cast-crew-arrow{opacity:1;transform:scale(1)}
.cast-crew-arrow:hover{background:rgba(214,165,91,.16);border-color:rgba(214,165,91,.8)}
.cast-crew-arrow-left{left:8px}.cast-crew-arrow-right{right:8px}
@media(hover:none){.cast-crew-arrow{opacity:.92;transform:none;width:36px;height:36px;font-size:26px;background:rgba(8,8,8,.72)}}
@media(max-width:640px){.cast-crew-arrow-left{left:7px}.cast-crew-arrow-right{right:7px}}
@media(prefers-reduced-motion:reduce){.cast-crew-arrow{transition:none}}

/* Cast & Crew: invisible scrollbar + next-card peek, touch/trackpad friendly */
#cast .cast-crew-track,#crew .cast-crew-track,.cast-crew-track{
  display:flex!important;flex-wrap:nowrap!important;align-items:stretch;
  overflow-x:auto!important;overflow-y:hidden!important;
  scroll-behavior:smooth;-webkit-overflow-scrolling:touch;
  overscroll-behavior-x:contain;touch-action:pan-x pan-y;
  scroll-snap-type:x proximity;scroll-padding-inline:1.25rem;
  scrollbar-width:none!important;scrollbar-color:transparent transparent!important;
  -ms-overflow-style:none!important;contain:layout paint;
  padding-bottom:8px!important;
}
#cast .cast-crew-track::-webkit-scrollbar,#crew .cast-crew-track::-webkit-scrollbar,.cast-crew-track::-webkit-scrollbar{display:none!important;width:0!important;height:0!important;background:transparent!important}
#cast .cast-crew-track::-webkit-scrollbar-thumb,#crew .cast-crew-track::-webkit-scrollbar-thumb,.cast-crew-track::-webkit-scrollbar-thumb{background:transparent!important;border:0!important}
#cast .cast-crew-track::-webkit-scrollbar-track,#crew .cast-crew-track::-webkit-scrollbar-track,.cast-crew-track::-webkit-scrollbar-track{background:transparent!important;border:0!important}
.cast-crew-item{flex:0 0 auto!important;min-width:0;scroll-snap-align:start;scroll-snap-stop:normal;}
.cast-crew-item .rx-reveal{height:100%}
@media(prefers-reduced-motion:reduce){.cast-crew-track{scroll-behavior:auto;scroll-snap-type:none}}
@media(hover:none){.cast-crew-track{scrollbar-width:none!important}.cast-crew-item{transform:none!important}}

/* scroll reveal */
.rx-reveal{opacity:0;transform:translateY(28px) scale(.98);filter:blur(6px);transition:opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1),filter .9s}
.rx-reveal.is-in{opacity:1;transform:none;filter:none}
.rx-person-line{transition:width .6s cubic-bezier(.16,1,.3,1)}
.raaka-person-card:hover .rx-person-line{width:100%}

/* aura button — theme-coloured */
.raaka-aura-premium{--aura:255,110,30}
.raaka-aura-premium::before{background:conic-gradient(from 0deg,transparent 0 35%,rgba(var(--aura),.06) 43%,rgba(var(--aura),.98) 49%,rgba(255,255,255,.95) 51%,rgba(var(--aura),.3) 54%,transparent 62%)!important}
.raaka-aura-premium::after{background:radial-gradient(circle at 20% 50%,rgba(var(--aura),.18),transparent 60%),linear-gradient(135deg,rgba(255,255,255,.07),rgba(0,0,0,.78) 58%)!important}
.raaka-aura-premium:hover{border-color:rgba(var(--aura),.6)!important;box-shadow:0 0 0 1px rgba(var(--aura),.2),0 0 34px rgba(var(--aura),.3),0 18px 55px rgba(0,0,0,.58)!important}
.rx-aura-core{animation:rxAuraPop .7s cubic-bezier(.16,1,.3,1)}
.rx-aura-ring{border:1px solid rgba(var(--aura),.7);animation:rxAuraRing 2.4s ease-out infinite}
.raaka-aura-premium:hover .rx-aura-orb{transform:rotate(90deg);transition:transform .7s cubic-bezier(.16,1,.3,1)}
@keyframes rxAuraPop{0%{transform:scale(0)}55%{transform:scale(1.9)}100%{transform:scale(1)}}
@keyframes rxAuraRing{0%{transform:scale(.8);opacity:.8}100%{transform:scale(1.45);opacity:0}}

/* crew credits */
.rx-credit{opacity:0;transform:translateY(26px);transition:opacity .8s cubic-bezier(.16,1,.3,1) var(--d,0ms),transform .8s cubic-bezier(.16,1,.3,1) var(--d,0ms),background .4s,box-shadow .4s}
.rx-credit.is-in{opacity:1;transform:none}
.rx-credit-dot{width:7px;height:7px;border-radius:50%;background:#fb923c;box-shadow:0 0 0 0 rgba(251,146,60,.6);animation:rxCreditPulse 2.6s ease-out infinite}
@keyframes rxCreditPulse{0%{box-shadow:0 0 0 0 rgba(251,146,60,.55)}70%,100%{box-shadow:0 0 0 9px rgba(251,146,60,0)}}
.rx-credit-rule{display:block;height:1px;margin-top:10px;transform-origin:left;transform:scaleX(0);background:linear-gradient(90deg,rgba(255,130,50,.85),rgba(255,255,255,.08) 70%,transparent);transition:transform 1.2s cubic-bezier(.16,1,.3,1) calc(var(--d,0ms) + 200ms)}
.rx-credit.is-in .rx-credit-rule{transform:scaleX(1)}
.rx-credit-name{opacity:0;transform:translateX(-16px);transition:opacity .6s,transform .6s,color .3s;transition-delay:calc(var(--d,0ms) + 350ms + var(--i,0)*70ms)}
.rx-credit-chip{opacity:0;transform:translateY(10px) scale(.88);transition:opacity .5s,transform .5s,border-color .3s,background .3s,color .3s;transition-delay:calc(300ms + var(--i,0)*28ms)}
.rx-credit.is-in .rx-credit-name,.rx-credit.is-in .rx-credit-chip{opacity:1;transform:none}
.rx-credit.is-in .rx-credit-name:hover{color:#fff;transform:translateX(6px);transition-delay:0s}
.rx-credit.is-in .rx-credit-chip:hover{color:#fff;border-color:rgba(255,140,60,.55);background:rgba(255,100,30,.12);transform:translateY(-2px);transition-delay:0s}
.rx-credit-stat{position:relative;overflow:hidden}
.rx-credit-stat::after{content:"";position:absolute;inset:0;background:linear-gradient(110deg,transparent 30%,rgba(255,180,100,.14) 50%,transparent 70%);transform:translateX(-130%);animation:rxCreditSweep 5s ease-in-out infinite}

/* explore more */
.rx-explore{position:relative;isolation:isolate;overflow:hidden;height:100%;border-radius:1.5rem;border:1px solid rgba(255,255,255,.1);background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.012));backdrop-filter:blur(14px);transition:transform .6s cubic-bezier(.16,1,.3,1),border-color .4s,box-shadow .5s}
.rx-explore::before{content:"";position:absolute;inset:0;z-index:-1;background:radial-gradient(420px circle at var(--mx,50%) var(--my,0%),rgba(255,120,40,.2),transparent 60%);opacity:0;transition:opacity .4s}
.rx-explore::after{content:"";position:absolute;left:0;right:0;bottom:0;height:2px;transform:scaleX(0);transform-origin:left;background:linear-gradient(90deg,#fb923c,transparent);transition:transform .7s cubic-bezier(.16,1,.3,1)}
.rx-explore:hover{transform:translateY(-6px);border-color:rgba(255,140,60,.4);box-shadow:0 24px 60px rgba(0,0,0,.4)}
.rx-explore:hover::before{opacity:1}
.rx-explore:hover::after{transform:scaleX(1)}
.rx-explore-num{font-size:clamp(5rem,12vw,8rem);color:transparent;-webkit-text-stroke:1px rgba(255,255,255,.08);transition:-webkit-text-stroke-color .5s,transform .7s cubic-bezier(.16,1,.3,1)}
.rx-explore:hover .rx-explore-num{-webkit-text-stroke-color:rgba(255,140,60,.35);transform:translateY(6px)}
.rx-explore-arrow{transition:transform .45s cubic-bezier(.16,1,.3,1),background .3s,color .3s}
.rx-explore:hover .rx-explore-arrow{transform:translateX(6px);background:#fff;color:#000}

/* touch / small screens */
@media (hover:none){
  .rx-explore:hover,.raaka-person-card:hover{transform:none}
  .rx-explore:active{transform:scale(.985)}
}
@media (max-width:640px){
  .raaka-character-frame{animation:none!important}
  .raaka-character-orbit{display:none}
}
@media (prefers-reduced-motion:reduce){
  .rx-reveal,.rx-credit,.rx-credit-name,.rx-credit-chip,.rx-credit-rule{opacity:1!important;transform:none!important;filter:none!important;transition:none!important}
  .rx-aura-ring,.rx-credit-dot,.rx-credit-stat::after,.rx-aura-core{animation:none!important}
}



/* ================================================================
   RAAKA v3 — hero cards, logo, menu, countdown, video
================================================================ */
@property --ang{syntax:"<angle>";initial-value:0deg;inherits:false}
.rx-shimmer-text{color:transparent!important;background:linear-gradient(100deg,#ffe9c2 0%,#fff 22%,#ffb347 48%,#fff 74%,#ffe9c2 100%);background-size:260% 100%;-webkit-background-clip:text;background-clip:text;animation:rxShimmerText 5s linear infinite}
@keyframes rxShimmerText{to{background-position:-260% 0}}

/* hero action cards — flat, no tilt */
.rx-action{--ac:255,120,40;position:relative;isolation:isolate;overflow:hidden;border:1px solid rgba(255,255,255,.12);background:linear-gradient(135deg,rgba(255,255,255,.07),rgba(255,255,255,.012) 55%),rgba(8,8,10,.62);-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);transform:translateZ(0);animation:rxActionIn .9s cubic-bezier(.16,1,.3,1) backwards;animation-delay:calc(var(--i,0)*130ms + 500ms);transition:transform .5s cubic-bezier(.16,1,.3,1),border-color .4s,box-shadow .5s}
.rx-action-orange{--ac:255,120,40}.rx-action-purple{--ac:192,132,252}.rx-action-yellow{--ac:250,204,21}
@keyframes rxActionIn{from{opacity:0;transform:translateY(18px)}}
.rx-action::before{content:"";position:absolute;inset:0;border-radius:inherit;padding:1px;z-index:3;pointer-events:none;background:conic-gradient(from var(--ang),transparent 0 62%,rgba(var(--ac),.95) 80%,transparent 100%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:.4;animation:rxAng 6s linear infinite;transition:opacity .4s}
@keyframes rxAng{to{--ang:360deg}}
.rx-action::after{content:"";position:absolute;top:0;bottom:0;left:0;width:40%;z-index:1;pointer-events:none;opacity:0;transform:translateX(-120%);background:linear-gradient(100deg,transparent,rgba(var(--ac),.28),transparent)}
.rx-action-spot{position:absolute;inset:0;z-index:0;pointer-events:none;opacity:0;transition:opacity .4s;background:radial-gradient(280px circle at var(--mx,20%) var(--my,50%),rgba(var(--ac),.22),transparent 65%)}
.rx-action:hover,.rx-action:focus-visible{transform:translateY(-5px);border-color:rgba(var(--ac),.4);box-shadow:0 22px 60px rgba(var(--ac),.22),inset 0 0 40px rgba(var(--ac),.06)}
.rx-action:hover::before{opacity:1;animation-duration:2.2s}
.rx-action:hover::after{opacity:1;animation:rxActionSweep .95s ease-out}
.rx-action:hover .rx-action-spot{opacity:1}
@keyframes rxActionSweep{to{transform:translateX(330%)}}
.rx-action .raaka-action-icon{background:rgba(var(--ac),.1);transition:transform .5s cubic-bezier(.16,1,.3,1),box-shadow .5s}
.rx-action:hover .raaka-action-icon{transform:scale(1.08);box-shadow:0 0 30px rgba(var(--ac),.5)}
.rx-action-iring{position:absolute;inset:-1px;border-radius:inherit;border:1px solid rgba(var(--ac),.55);pointer-events:none;animation:rxRingOut 2.8s ease-out infinite}
@keyframes rxRingOut{0%{transform:scale(1);opacity:.8}100%{transform:scale(1.5);opacity:0}}
.rx-action-arrow{transition:transform .4s cubic-bezier(.16,1,.3,1),background-color .3s,color .3s,border-color .3s}
.rx-action:hover .rx-action-arrow{transform:translateX(5px);color:#fff;border-color:rgba(var(--ac),.7);background-color:rgba(var(--ac),.18)}
.rx-art{position:absolute;right:4rem;bottom:.75rem;z-index:1;display:flex;align-items:flex-end;gap:3px;height:22px;opacity:.5;pointer-events:none;transition:opacity .4s,transform .5s}
.rx-action:hover .rx-art{opacity:1;transform:scale(1.15)}
.rx-art i{display:block;width:3px;border-radius:2px;background:rgba(var(--ac),.95);transform-origin:bottom}
.rx-art-eq i{height:var(--h);animation:rxEq 1.1s ease-in-out infinite;animation-delay:calc(var(--k)*.13s)}
@keyframes rxEq{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}
.rx-art-rise i{height:var(--h);animation:rxRise 2.6s ease-in-out infinite;animation-delay:calc(var(--k)*.2s)}
@keyframes rxRise{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}
.rx-art-spark{align-items:center;gap:6px}
.rx-art-spark i{width:var(--z);height:var(--z);border-radius:0;clip-path:polygon(50% 0,61% 39%,100% 50%,61% 61%,50% 100%,39% 61%,0 50%,39% 39%);animation:rxTwinkle 1.8s ease-in-out infinite;animation-delay:calc(var(--k)*.35s)}
@keyframes rxTwinkle{0%,100%{opacity:.25;transform:scale(.7)}50%{opacity:1;transform:scale(1.15)}}
@media (hover:none){.rx-action:hover{transform:none}.rx-action:active{transform:scale(.98)}.rx-action:hover::after{animation:none;opacity:0}}

/* logos: breathing glow + shine that follows the PNG letters */
.rx-logo-wrap{animation:rxLogoIn 1.5s cubic-bezier(.16,1,.3,1) .35s backwards}
@keyframes rxLogoIn{from{opacity:0;transform:scale(.9);filter:blur(18px)}}
.rx-logo-stage{z-index:1;animation:rxLogo 4.2s cubic-bezier(.45,.05,.25,1) infinite;will-change:transform,filter}
.rx-logo-stage .rx-logo-img{animation:none!important}
.rx-logo-shine{position:absolute;inset:0;pointer-events:none;-webkit-mask:var(--mask) center/contain no-repeat;mask:var(--mask) center/contain no-repeat;background:linear-gradient(105deg,transparent 38%,rgba(255,238,200,.95) 50%,transparent 62%);background-size:260% 100%;background-position:160% 0;mix-blend-mode:screen;animation:rxLogoShine 5.5s ease-in-out infinite 1.8s}
@keyframes rxLogoShine{0%{background-position:160% 0}45%,100%{background-position:-60% 0}}
.rx-logo-halo{background:radial-gradient(closest-side,rgba(255,110,30,.24),transparent 72%);filter:blur(28px);animation:rxHalo 4.2s ease-in-out infinite}
@keyframes rxHalo{0%,100%{opacity:.45;transform:scale(.95)}50%{opacity:1;transform:scale(1.08)}}
.rx-logo-underline{position:absolute;left:8%;right:8%;bottom:-10px;height:1px;background:linear-gradient(90deg,transparent,rgba(255,140,50,.9),transparent);transform-origin:center;animation:rxUnder 1.6s cubic-bezier(.16,1,.3,1) 1.2s backwards}
@keyframes rxUnder{from{transform:scaleX(0);opacity:0}}
.rx-ember{position:absolute;bottom:0;left:var(--x);width:var(--s);height:var(--s);border-radius:50%;background:radial-gradient(circle,#ffe2b0,#ff7a1a 60%,transparent);opacity:0;animation:rxEmber var(--d) linear var(--dl) infinite}
@keyframes rxEmber{0%{opacity:0;transform:translate(0,0) scale(1)}12%{opacity:.95}100%{opacity:0;transform:translate(var(--dx),calc(var(--rise)*-1)) scale(.2)}}

/* menu */
.rx-burger{position:relative;display:block;width:16px;height:12px}
.rx-burger i{position:absolute;left:0;height:1.5px;width:100%;border-radius:2px;background:currentColor;transition:transform .5s cubic-bezier(.16,1,.3,1),opacity .3s,width .4s}
.rx-burger i:nth-child(1){top:0}.rx-burger i:nth-child(2){top:5px;width:68%}.rx-burger i:nth-child(3){top:10px}
.raaka-menu-premium:hover .rx-burger i:nth-child(2){width:100%}
.rx-burger.is-open i:nth-child(1){transform:translateY(5px) rotate(45deg)}
.rx-burger.is-open i:nth-child(2){opacity:0;transform:translateX(8px)}
.rx-burger.is-open i:nth-child(3){transform:translateY(-5px) rotate(-45deg)}
.rx-menu{transition-duration:.7s!important;transition-timing-function:cubic-bezier(.16,1,.3,1)!important;background:radial-gradient(520px circle at 100% 0%,rgba(255,110,30,.15),transparent 60%),radial-gradient(420px circle at 0% 100%,rgba(120,90,255,.09),transparent 60%),rgba(5,5,6,.96)!important}
.rx-menu-item{position:relative;opacity:0;transform:translateX(28px);transition:opacity .6s cubic-bezier(.16,1,.3,1),transform .6s cubic-bezier(.16,1,.3,1),background-color .3s}
.rx-menu-open .rx-menu-item{opacity:1;transform:none;transition-delay:calc(200ms + var(--i,0)*65ms)}
.rx-menu-open .rx-menu-item:hover{background-color:rgba(255,255,255,.06);transform:translateX(4px);transition-delay:0s}
.rx-menu-bar{position:absolute;left:0;top:26%;bottom:26%;width:2px;border-radius:2px;background:linear-gradient(#fb923c,transparent);transform:scaleY(0);transition:transform .4s cubic-bezier(.16,1,.3,1)}
.rx-menu-item:hover .rx-menu-bar{transform:scaleY(1)}

/* countdown */
.rx-digit{animation:rxDigitIn .5s cubic-bezier(.16,1,.3,1)}
@keyframes rxDigitIn{0%{opacity:0;transform:translateY(-35%) scale(1.1);filter:blur(7px)}100%{opacity:1;transform:none;filter:none}}
.rx-tick{background:radial-gradient(circle at 50% 40%,rgba(255,190,90,.22),transparent 70%);opacity:0;animation:rxTickFlash .9s ease-out}
@keyframes rxTickFlash{0%{opacity:1}100%{opacity:0}}
.rx-timer-ring rect{fill:none;stroke:rgba(255,190,90,.95);stroke-width:1.6;stroke-linecap:round;filter:drop-shadow(0 0 4px rgba(255,150,40,.85));transition:stroke-dasharray 1s linear}
.rx-cd-beam{background:linear-gradient(100deg,transparent,rgba(255,200,120,.07),transparent);transform:translateX(-120%) skewX(-16deg);animation:rxCdBeam 9s ease-in-out infinite}
@keyframes rxCdBeam{0%,15%{transform:translateX(-120%) skewX(-16deg)}70%,100%{transform:translateX(420%) skewX(-16deg)}}

/* youtube cards */
.rx-video-frame{isolation:isolate;transition:transform .6s cubic-bezier(.16,1,.3,1),border-color .4s,box-shadow .6s}
.rx-video:hover .rx-video-frame{transform:translateY(-4px);border-color:rgba(255,140,60,.45);box-shadow:0 28px 70px rgba(0,0,0,.55),0 0 50px rgba(255,90,20,.14)}
.rx-video-thumb{transition:transform 1.2s cubic-bezier(.16,1,.3,1),filter .6s}
.rx-video:hover .rx-video-thumb{transform:scale(1.07);filter:brightness(1.1) saturate(1.12)}
.rx-play-ring{position:absolute;inset:0;border-radius:50%;border:1px solid rgba(255,170,80,.75);animation:rxPlayRing 2.4s ease-out infinite}
@keyframes rxPlayRing{0%{transform:scale(1);opacity:.85}100%{transform:scale(2.1);opacity:0}}
.rx-play-btn{background:linear-gradient(135deg,rgba(255,150,60,.95),rgba(230,70,10,.95));box-shadow:0 10px 40px rgba(255,90,20,.5),inset 0 1px 0 rgba(255,255,255,.35);transition:transform .45s cubic-bezier(.16,1,.3,1),box-shadow .45s}
.rx-video:hover .rx-play-btn{transform:scale(1.12);box-shadow:0 14px 60px rgba(255,90,20,.7),inset 0 1px 0 rgba(255,255,255,.4)}

@media (prefers-reduced-motion:reduce){
  .rx-action,.rx-action::before,.rx-action::after,.rx-action-iring,.rx-art i,.rx-logo-wrap,.rx-logo-stage,.rx-logo-shine,.rx-logo-halo,.rx-ember,.rx-cd-beam,.rx-digit,.rx-tick,.rx-play-ring,.rx-shimmer-text{animation:none!important}
  .rx-menu-item{opacity:1;transform:none}
}


/* ================================================================
   COUNTDOWN v4 — self-contained (.rx-countdown). Logo and timer sit
   in normal flow, no min-heights, no legacy selectors.
================================================================ */
.rx-cd-card{isolation:isolate;box-shadow:0 35px 110px rgba(0,0,0,.55)}
.rx-cd-card::before{content:"";position:absolute;inset:0;border-radius:inherit;padding:1px;z-index:3;pointer-events:none;background:conic-gradient(from var(--ang),transparent 0 58%,rgba(255,177,55,.95) 66%,rgba(255,238,170,.85) 70%,transparent 78%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:rxAng 6s linear infinite}
.rx-cd-photo{animation:rxCountdownPhoto 14s ease-in-out infinite alternate}
.rx-cd-glow{animation:rxHalo 5s ease-in-out infinite}

.rx-timer{position:relative;overflow:hidden;min-width:0;padding:1.1rem .25rem 1.25rem;border-radius:.85rem;border:1px solid rgba(255,255,255,.1);background:linear-gradient(160deg,rgba(255,255,255,.07),rgba(0,0,0,.45) 60%);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);transition:transform .45s cubic-bezier(.16,1,.3,1),border-color .4s,box-shadow .45s}
.rx-timer::before{content:"";position:absolute;top:0;bottom:0;left:-100%;width:45%;background:linear-gradient(90deg,transparent,rgba(255,210,110,.16),transparent);transform:skewX(-18deg);animation:rxTimerSweep 4s ease-in-out infinite;pointer-events:none}
.rx-timer:hover{transform:translateY(-4px);border-color:rgba(255,190,90,.45);box-shadow:0 18px 50px rgba(255,130,20,.18)}
.rx-timer-hot{border-color:rgba(255,200,110,.3);background:linear-gradient(160deg,rgba(255,190,90,.12),rgba(0,0,0,.45) 60%)}
.rx-timer-number{position:relative;z-index:1;font-size:clamp(1.55rem,8.6vw,2.6rem);line-height:1;letter-spacing:-.02em;filter:drop-shadow(0 4px 14px rgba(0,0,0,.8))}
.rx-timer-hot .rx-timer-number{color:#ffe6b8;filter:drop-shadow(0 0 22px rgba(255,170,60,.45))}
.rx-timer-label{position:relative;z-index:1;margin-top:.55rem;font-size:8px;letter-spacing:.26em;text-transform:uppercase;color:rgba(255,236,200,.62)}
.rx-timer-bar{position:absolute;left:10%;right:10%;bottom:.55rem;height:2px;border-radius:2px;background:rgba(255,255,255,.1);overflow:hidden}
.rx-timer-bar i{display:block;height:100%;border-radius:2px;background:linear-gradient(90deg,#ff7a1a,#ffd58a);box-shadow:0 0 10px rgba(255,160,50,.8);transition:width 1s linear}
@media (min-width:640px){
  .rx-timer{padding:1.6rem .5rem 1.8rem;border-radius:1rem}
  .rx-timer-number{font-size:clamp(3rem,7vw,4.2rem)}
  .rx-timer-label{font-size:10px;letter-spacing:.3em;margin-top:.8rem}
  .rx-timer-bar{bottom:.8rem}
}
@media (min-width:768px){
  .rx-timer{padding:2.2rem .75rem 2.5rem}
  .rx-timer-number{font-size:clamp(4rem,8vw,6.2rem)}
  .rx-timer-label{font-size:11px}
}
@media (hover:none){.rx-timer:hover{transform:none}}
@media (prefers-reduced-motion:reduce){.rx-cd-card::before,.rx-cd-photo,.rx-cd-glow,.rx-timer::before{animation:none!important}.rx-timer-bar i{transition:none}}

/* ================================================================
   RAAKA v4 — HERO TICKETS (rzh-) + AURA SWITCHER (rzs-)
================================================================ */

/* ---------- HERO TICKETS (rzh-) ---------- */
@keyframes rxpSpin{to{transform:rotate(360deg)}}
.rzh-card{--c:255,176,64;--rx:0deg;--ry:0deg;--mx:50%;--my:50%;--stub:58px;position:relative;display:block;container-type:inline-size;border-radius:22px;color:#fff;text-decoration:none;
  transform:perspective(1000px) rotateX(var(--rx)) rotateY(var(--ry)) translateZ(0);
  filter:drop-shadow(0 16px 26px rgba(0,0,0,.55)) drop-shadow(0 0 0 rgba(var(--c),0));
  transition:transform .35s cubic-bezier(.16,1,.3,1),filter .5s;
  animation:rzhIn 1.1s cubic-bezier(.16,1,.3,1) backwards;animation-delay:calc(var(--i,0)*140ms + 450ms)}
@keyframes rzhIn{from{opacity:0;transform:perspective(1000px) translateY(46px) rotateX(-24deg) scale(.92);filter:drop-shadow(0 16px 26px rgba(0,0,0,.55)) drop-shadow(0 0 0 rgba(var(--c),0)) blur(8px)}}
.rzh-card:hover,.rzh-card:focus-visible{filter:drop-shadow(0 20px 30px rgba(0,0,0,.6)) drop-shadow(0 0 26px rgba(var(--c),.38));outline:none}
.rzh-card:active{transform:perspective(1000px) scale(.985)}

.rzh-ticket{position:relative;isolation:isolate;display:flex;min-height:150px;overflow:hidden;border-radius:22px;
  background:radial-gradient(130% 120% at 0% 0%,rgba(var(--c),.24),transparent 60%),linear-gradient(155deg,rgba(255,255,255,.07),rgba(7,7,11,.88) 55%),rgba(7,7,11,.9);
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.1),inset 0 1px 0 rgba(255,255,255,.16);
  -webkit-mask-image:radial-gradient(circle 9px at calc(100% - var(--stub)) 0,transparent 8.5px,#000 9.5px),radial-gradient(circle 9px at calc(100% - var(--stub)) 100%,transparent 8.5px,#000 9.5px);
  -webkit-mask-size:100% 51%,100% 51%;-webkit-mask-position:top,bottom;-webkit-mask-repeat:no-repeat;
  mask-image:radial-gradient(circle 9px at calc(100% - var(--stub)) 0,transparent 8.5px,#000 9.5px),radial-gradient(circle 9px at calc(100% - var(--stub)) 100%,transparent 8.5px,#000 9.5px);
  mask-size:100% 51%,100% 51%;mask-position:top,bottom;mask-repeat:no-repeat}
.rzh-ticket::before{content:"";position:absolute;inset:0;border-radius:inherit;padding:1.2px;z-index:6;pointer-events:none;background:conic-gradient(from var(--ang),transparent 0 60%,rgba(var(--c),.95) 80%,#fff 84%,transparent 100%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:.5;animation:rxAng 5.5s linear infinite;transition:opacity .4s}
.rzh-card:hover .rzh-ticket::before,.rzh-card:focus-visible .rzh-ticket::before{opacity:1;animation-duration:2s}

.rzh-fill{position:absolute;z-index:1;right:calc(var(--stub)/2 - 19px);top:50%;width:38px;height:38px;margin-top:-19px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(var(--c),.55),rgba(var(--c),.14) 68%);transform:scale(0);transition:transform .95s cubic-bezier(.16,1,.3,1)}
.rzh-card:hover .rzh-fill,.rzh-card:focus-visible .rzh-fill{transform:scale(17)}
.rzh-spot{position:absolute;inset:0;z-index:2;pointer-events:none;opacity:0;transition:opacity .4s;mix-blend-mode:screen;background:radial-gradient(240px circle at var(--mx) var(--my),rgba(255,255,255,.13),rgba(var(--c),.14) 42%,transparent 72%)}
.rzh-card:hover .rzh-spot{opacity:1}
.rzh-sheen{position:absolute;top:0;bottom:0;left:0;width:36%;z-index:5;pointer-events:none;opacity:0;transform:translateX(-130%) skewX(-16deg);background:linear-gradient(100deg,transparent,rgba(255,255,255,.2),rgba(var(--c),.2),transparent)}
.rzh-card:hover .rzh-sheen{opacity:1;animation:rzhSheen 1s ease-out}
@keyframes rzhSheen{to{transform:translateX(340%) skewX(-16deg)}}

.rzh-main{position:relative;z-index:4;flex:1;min-width:0;display:flex;flex-direction:column;justify-content:space-between;gap:1rem;padding:1rem 0.9rem 1rem 1.1rem}
.rzh-medal{position:relative;flex:none;width:48px;height:48px;border-radius:50%;display:grid;place-items:center;color:#fff;
  background:radial-gradient(circle at 30% 24%,rgba(255,255,255,.38),rgba(var(--c),.88) 46%,rgba(var(--c),.34));
  box-shadow:0 8px 24px rgba(var(--c),.45),inset 0 1px 0 rgba(255,255,255,.5),inset 0 -6px 12px rgba(0,0,0,.25);
  transition:transform .6s cubic-bezier(.16,1,.3,1),box-shadow .5s}
.rzh-medal svg{position:relative;z-index:2;width:22px;height:22px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.35));transition:transform .6s cubic-bezier(.16,1,.3,1)}
.rzh-medal::before{content:"";position:absolute;inset:-6px;border-radius:50%;pointer-events:none;background:conic-gradient(from var(--ang),transparent 0 55%,rgba(var(--c),.95) 85%,transparent);-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 2px),#000 calc(100% - 1.5px));mask:radial-gradient(farthest-side,transparent calc(100% - 2px),#000 calc(100% - 1.5px));animation:rxAng 3.4s linear infinite}
.rzh-medal::after{content:"";position:absolute;inset:0;border-radius:50%;pointer-events:none;border:1.5px solid rgba(var(--c),.7);animation:rzhPulse 2.8s ease-out infinite}
@keyframes rzhPulse{0%{transform:scale(1);opacity:.8}100%{transform:scale(1.8);opacity:0}}
.rzh-card:hover .rzh-medal{transform:scale(1.1) rotate(-6deg);box-shadow:0 12px 36px rgba(var(--c),.7),inset 0 1px 0 rgba(255,255,255,.6)}
.rzh-card:hover .rzh-medal svg{transform:scale(1.14) rotate(6deg)}
.rzh-card:hover .rzh-medal::before{animation-duration:1.3s}

.rzh-text{display:block;min-width:0}
.rzh-eyebrow{display:flex;align-items:center;gap:.5rem;min-width:0;margin-bottom:.3rem;font-size:11px;font-weight:500;letter-spacing:.02em;color:rgba(255,255,255,.58)}
.rzh-title{position:relative;display:block;overflow:hidden;padding-bottom:.1em;font-size:clamp(1.2rem,5.6vw,1.6rem);font-size:clamp(1.15rem,8.2cqw,1.7rem);font-weight:800;line-height:1.15;letter-spacing:-.02em;white-space:nowrap}
.rzh-t1,.rzh-t2{display:block;transition:transform .65s cubic-bezier(.16,1,.3,1)}
.rzh-t2{position:absolute;left:0;top:0;transform:translateY(108%);color:transparent;background:linear-gradient(100deg,#fff 0%,rgba(var(--c),1) 50%,#fff 100%);background-size:220% 100%;-webkit-background-clip:text;background-clip:text;animation:rzhTitle 2.4s linear infinite}
@keyframes rzhTitle{to{background-position:-220% 0}}
.rzh-card:hover .rzh-t1,.rzh-card:focus-visible .rzh-t1{transform:translateY(-108%)}
.rzh-card:hover .rzh-t2,.rzh-card:focus-visible .rzh-t2{transform:none}

.rzh-perf{position:absolute;z-index:4;top:16px;bottom:16px;right:calc(var(--stub) - 1px);width:2px;pointer-events:none;background:repeating-linear-gradient(to bottom,rgba(255,255,255,.3) 0 5px,transparent 5px 11px)}
.rzh-card:hover .rzh-perf{animation:rzhPerf .8s linear infinite}
@keyframes rzhPerf{to{background-position:0 22px}}
.rzh-stub{position:relative;z-index:4;flex:none;width:var(--stub);display:grid;place-items:center}
.rzh-go{display:grid;place-items:center;width:38px;height:38px;border-radius:50%;color:rgba(255,255,255,.88);border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.05);transition:transform .5s cubic-bezier(.16,1,.3,1),background .35s,color .35s,box-shadow .5s,border-color .35s}
.rzh-go svg{width:16px;height:16px;transition:transform .5s cubic-bezier(.16,1,.3,1)}
.rzh-card:hover .rzh-go,.rzh-card:focus-visible .rzh-go{transform:scale(1.14);color:#0a0a0a;border-color:transparent;background:rgb(var(--c));box-shadow:0 0 30px rgba(var(--c),.8)}
.rzh-card:hover .rzh-go svg{transform:rotate(-45deg)}

/* scenes */
.rzh-scene{position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden}
.rzh-scene i{position:absolute;display:block}

/* video: camera iris + film strip */
.rzh-iris{position:absolute;right:calc(var(--stub) - 26px);top:-20px;width:clamp(110px,50cqw,170px);opacity:.62;transition:transform 1s cubic-bezier(.16,1,.3,1),opacity .5s}
.rzh-iris-blades{transform-origin:50% 50%;animation:rxpSpin 26s linear infinite}
.rzh-iris-blades path{fill:rgba(var(--c),.12);stroke:rgba(var(--c),.55);stroke-width:.8}
.rzh-iris-blades path:nth-child(odd){fill:rgba(var(--c),.22)}
.rzh-iris-rim{fill:none;stroke:rgba(var(--c),.4);stroke-width:1.2}
.rzh-iris-eye{fill:rgba(var(--c),.55);animation:rzhEye 3s ease-in-out infinite;transform-origin:50% 50%}
@keyframes rzhEye{50%{transform:scale(1.5);opacity:.5}}
.rzh-card:hover .rzh-iris{opacity:1;transform:scale(1.16) rotate(30deg)}
.rzh-card:hover .rzh-iris-blades{animation-duration:5s}
.rzh-strip{left:0;right:var(--stub);height:8px;opacity:.4;background:repeating-linear-gradient(90deg,rgba(var(--c),.6) 0 6px,transparent 6px 14px);-webkit-mask-image:linear-gradient(90deg,transparent,#000 40%);mask-image:linear-gradient(90deg,transparent,#000 40%);animation:rzhStrip 3s linear infinite}
.rzh-strip-t{top:7px}.rzh-strip-b{bottom:7px;animation-direction:reverse}
@keyframes rzhStrip{to{background-position:14px 0}}
.rzh-card:hover .rzh-strip{opacity:.9;animation-duration:.9s}

/* art: brush strokes painting themselves */
.rzh-strokes{position:absolute;right:calc(var(--stub) - 8px);top:0;width:72%;height:100%;overflow:visible;filter:drop-shadow(0 0 7px rgba(var(--c),.45))}
.rzh-stroke{stroke-width:7;stroke-linecap:round;stroke-dasharray:100;stroke-dashoffset:100;opacity:0;animation:rzhPaint 5.4s ease-in-out infinite}
.rzh-st1{stroke:rgb(244,114,182)}.rzh-st2{stroke:rgb(251,191,36);animation-delay:.45s}.rzh-st3{stroke:rgb(167,139,250);animation-delay:.9s}
@keyframes rzhPaint{0%{stroke-dashoffset:100;opacity:0}10%{opacity:.7}48%,78%{stroke-dashoffset:0;opacity:.7}100%{stroke-dashoffset:-100;opacity:0}}
.rzh-card:hover .rzh-stroke{animation-duration:2.4s}
.rzh-dot{bottom:-8px;width:7px;height:7px;border-radius:50%;background:rgb(var(--c));left:calc(46% + var(--k)*15%);opacity:0;box-shadow:0 0 10px rgba(var(--c),.9);animation:rzhFloat 3.6s ease-in infinite;animation-delay:calc(var(--k)*.9s)}
@keyframes rzhFloat{0%{transform:translateY(0) scale(.5);opacity:0}25%{opacity:1}100%{transform:translateY(-120px) scale(1.2);opacity:0}}

/* box office: concentric performance rings */
.rzh-gauge{position:absolute;right:calc(var(--stub) - 24px);top:44%;width:clamp(116px,50cqw,164px);aspect-ratio:1;transform:translateY(-50%) rotate(-90deg);transition:transform 1s cubic-bezier(.16,1,.3,1)}
.rzh-track{stroke:rgba(var(--c),.14);stroke-width:4.5}
.rzh-arc{stroke:rgb(var(--c));stroke-width:4.5;stroke-linecap:round;stroke-dasharray:0 100;opacity:.85;animation:rzhArc 4.6s ease-in-out infinite alternate}
@keyframes rzhArc{from{stroke-dasharray:0 100}to{stroke-dasharray:var(--p) 100}}
.rzh-orbit-dot{fill:#fff;transform-origin:50% 50%;animation:rxpSpin 5s linear infinite;filter:drop-shadow(0 0 4px rgb(var(--c)))}
.rzh-card:hover .rzh-gauge{transform:translateY(-50%) rotate(-90deg) scale(1.12)}
.rzh-card:hover .rzh-orbit-dot{animation-duration:1.6s}
.rzh-live{top:14px;right:calc(var(--stub) + 14px);width:7px;height:7px;border-radius:50%;background:rgb(var(--c));animation:rzhLive 1.6s ease-out infinite}
@keyframes rzhLive{0%{box-shadow:0 0 0 0 rgba(var(--c),.75)}100%{box-shadow:0 0 0 12px rgba(var(--c),0)}}

@media (min-width:768px){
  .rzh-ticket{min-height:158px}
  .rzh-main{padding:1.1rem 1rem 1.1rem 1.2rem}
}
@media (hover:none){
  .rzh-card:hover .rzh-t1{transform:none}
  .rzh-card:hover .rzh-t2{transform:translateY(108%)}
  .rzh-card:hover .rzh-fill{transform:scale(0)}
  .rzh-card:hover .rzh-go{transform:none;background:rgba(255,255,255,.05);color:rgba(255,255,255,.88);box-shadow:none;border-color:rgba(255,255,255,.22)}
  .rzh-card:hover .rzh-go svg{transform:none}
}

/* ---------- AURA SWITCHER (rzs-) ---------- */
.rzs-btn{--aura:255,255,255;position:relative;isolation:isolate;display:flex;align-items:center;gap:.7rem;height:60px;padding:0 1rem 0 .4rem;border-radius:20px;color:#fff;overflow:hidden;
  background:linear-gradient(140deg,rgba(255,255,255,.1),rgba(8,8,12,.78) 60%);border:1px solid rgba(255,255,255,.12);-webkit-backdrop-filter:blur(22px);backdrop-filter:blur(22px);
  box-shadow:0 14px 40px rgba(0,0,0,.5),0 0 30px rgba(var(--aura),.14);transition:transform .45s cubic-bezier(.16,1,.3,1),box-shadow .5s}
.rzs-btn::before{content:"";position:absolute;inset:0;border-radius:inherit;padding:1.2px;z-index:4;pointer-events:none;background:conic-gradient(from var(--ang),transparent 0 55%,rgba(var(--aura),.95) 78%,#fff 82%,transparent 94%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:rxAng 3.6s linear infinite}
.rzs-btn:hover{transform:translateY(-2px);box-shadow:0 18px 50px rgba(0,0,0,.55),0 0 44px rgba(var(--aura),.38)}
.rzs-btn:active{transform:scale(.97)}
.rzs-dial{position:relative;flex:none;width:52px;height:52px;display:grid;place-items:center}
.rzs-ticks{position:absolute;inset:0;transition:transform .9s cubic-bezier(.16,1,.3,1)}
.rzs-ticks i{position:absolute;left:50%;top:50%;width:2px;height:5px;margin:-25px 0 0 -1px;border-radius:2px;background:rgba(255,255,255,.28);transform-origin:1px 25px;transform:rotate(var(--a));transition:background .4s,box-shadow .4s,height .4s}
.rzs-ticks i.on{height:8px;background:rgb(var(--aura));box-shadow:0 0 10px rgba(var(--aura),1)}
.rzs-planet{position:relative;overflow:hidden;width:30px;height:30px;border-radius:50%;box-shadow:0 0 22px rgba(var(--aura),.6),inset -5px -6px 11px rgba(0,0,0,.6),inset 2px 2px 5px rgba(255,255,255,.35);transition:transform .5s cubic-bezier(.16,1,.3,1)}
.rzs-btn:hover .rzs-planet{transform:scale(1.12)}
.rzs-planet i{position:absolute;inset:-40% -60%;background:linear-gradient(115deg,transparent 42%,rgba(255,255,255,.5) 50%,transparent 58%);transform:translateX(-60%);animation:rzsPlanet 4.2s ease-in-out infinite}
@keyframes rzsPlanet{0%,40%{transform:translateX(-60%)}100%{transform:translateX(60%)}}
.rzs-label{position:relative;z-index:3;display:flex;flex-direction:column;align-items:flex-start;gap:.28rem;line-height:1;overflow:hidden;text-align:left}
.rzs-label small{font-size:10px;font-weight:500;letter-spacing:.06em;color:rgba(255,255,255,.55)}
.rzs-label b{font-size:14px;font-weight:700;letter-spacing:-.005em;color:rgba(var(--aura),1);animation:rzsSwap .6s cubic-bezier(.16,1,.3,1)}
@keyframes rzsSwap{from{transform:translateY(120%);opacity:0}}
.rzs-caret{position:relative;z-index:3;width:14px;height:14px;color:rgba(255,255,255,.6);transition:transform .5s cubic-bezier(.16,1,.3,1)}
.rzs-btn.is-open .rzs-caret{transform:rotate(180deg)}

.rzs-panel{position:absolute;top:calc(100% + 12px);left:0;width:min(92vw,440px);max-height:min(76vh,620px);overflow-y:auto;overscroll-behavior:contain;padding:1rem;border-radius:26px;
  background:linear-gradient(165deg,rgba(255,255,255,.09),rgba(8,8,12,.92) 38%);border:1px solid rgba(255,255,255,.13);-webkit-backdrop-filter:blur(30px) saturate(1.6);backdrop-filter:blur(30px) saturate(1.6);
  scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.2) transparent;
  clip-path:circle(0px at 34px 0px);visibility:hidden;pointer-events:none;transition:clip-path .85s cubic-bezier(.16,1,.3,1),visibility 0s .85s}
.rzs-panel.is-open{clip-path:circle(170% at 34px 0px);visibility:visible;pointer-events:auto;transition:clip-path .85s cubic-bezier(.16,1,.3,1),visibility 0s}
.rzs-head{display:flex;align-items:flex-end;justify-content:space-between;gap:1rem;padding:.2rem .3rem .9rem}
.rzs-head div{display:flex;flex-direction:column;gap:.35rem}
.rzs-head b{font-size:15px;font-weight:700;letter-spacing:-.01em}
.rzs-head span{font-size:11px;color:rgba(var(--aura),1);animation:rzsSwap .6s cubic-bezier(.16,1,.3,1)}
.rzs-head em{font-style:normal;font-size:11px;color:rgba(255,255,255,.45)}
.rzs-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.65rem}
@media (min-width:460px){.rzs-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
.rzs-item{--c:255,255,255;position:relative;isolation:isolate;display:flex;flex-direction:column;align-items:flex-start;gap:.15rem;padding:.4rem .4rem .6rem;border-radius:1.1rem;text-align:left;color:#fff;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.08);transition:transform .45s cubic-bezier(.16,1,.3,1),border-color .35s,box-shadow .45s,background .35s}
.rzs-panel.is-open .rzs-item{animation:rzsItemIn .7s cubic-bezier(.16,1,.3,1) backwards;animation-delay:calc(var(--i)*40ms + 160ms)}
@keyframes rzsItemIn{from{opacity:0;transform:translateY(18px) scale(.9)}}
.rzs-item:hover{transform:translateY(-3px);border-color:rgba(var(--c),.6);background:rgba(var(--c),.08);box-shadow:0 14px 34px rgba(var(--c),.25)}
.rzs-item.is-active{border-color:transparent;background:rgba(var(--c),.1);box-shadow:0 12px 36px rgba(var(--c),.3)}
.rzs-item.is-active::before{content:"";position:absolute;inset:-1px;border-radius:inherit;padding:1.5px;z-index:3;pointer-events:none;background:conic-gradient(from var(--ang),rgba(var(--c),.15),rgba(var(--c),1) 30%,#fff 36%,rgba(var(--c),.15) 60%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:rxAng 3s linear infinite}
.rzs-thumb{position:relative;display:block;width:100%;height:68px;border-radius:.8rem;overflow:hidden;margin-bottom:.4rem;box-shadow:inset 0 0 0 1px rgba(255,255,255,.1)}
.rzs-fx{position:absolute;inset:0;opacity:.9}
.rzs-shine{position:absolute;top:0;bottom:0;left:0;width:45%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.35),transparent);transform:translateX(-130%) skewX(-18deg)}
.rzs-item:hover .rzs-shine{animation:rzsShine .9s ease-out}
.rzs-item.is-active .rzs-shine{animation:rzsShine 2.8s ease-in-out infinite}
@keyframes rzsShine{to{transform:translateX(320%) skewX(-18deg)}}
.rzs-name{padding:0 .2rem;font-size:12px;font-weight:600}
.rzs-tag{padding:0 .2rem;font-size:10px;color:rgba(255,255,255,.5)}
.rzs-new{position:absolute;top:5px;left:5px;padding:2px 7px;border-radius:99px;font-size:9px;font-weight:700;color:#000;background:linear-gradient(90deg,#fde68a,#fb923c);box-shadow:0 0 12px rgba(251,146,60,.6);animation:rzsNew 2s ease-in-out infinite}
@keyframes rzsNew{50%{box-shadow:0 0 20px rgba(251,146,60,.95)}}
.rzs-check{position:absolute;top:5px;right:5px;display:flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:99px;color:#000;background:rgb(var(--c));box-shadow:0 0 16px rgba(var(--c),.9);animation:rxAuraPop .5s cubic-bezier(.16,1,.3,1)}
.rzs-check svg{width:11px;height:11px}

/* mini live previews inside the picker */
.rzs-item[data-t="ember"] .rzs-fx{background:radial-gradient(circle,#ffb347 0 1.5px,transparent 2.5px) 0 0/20px 24px;animation:rzsRise 2.6s linear infinite}
.rzs-item[data-t="frost"] .rzs-fx,.rzs-item[data-t="sakura"] .rzs-fx{background:radial-gradient(circle,rgba(255,255,255,.95) 0 1.5px,transparent 2.5px) 0 0/22px 26px;animation:rzsFall 3s linear infinite}
.rzs-item[data-t="sakura"] .rzs-fx{background:radial-gradient(ellipse 3px 2px,#ffd1e6 0 100%,transparent 100%) 0 0/24px 28px}
.rzs-item[data-t="meteor"] .rzs-fx{background:linear-gradient(115deg,transparent 46%,rgba(255,255,255,.9) 50%,transparent 52%) 0 0/90px 90px;animation:rzsMeteor 2.6s linear infinite}
.rzs-item[data-t="thunder"] .rzs-fx{background:radial-gradient(ellipse at 40% 0,rgba(220,235,255,.85),transparent 65%);opacity:0;animation:rzsFlash 3.2s linear infinite}
.rzs-item[data-t="dawn"] .rzs-fx{background:repeating-conic-gradient(from 150deg at 50% -10%,rgba(255,225,170,.5) 0deg 3deg,transparent 3deg 9deg);animation:rzsSway 4s ease-in-out infinite alternate;transform-origin:50% 0}
@keyframes rzsRise{to{background-position:0 -24px}}
@keyframes rzsFall{to{background-position:8px 26px}}
@keyframes rzsMeteor{to{background-position:-90px 90px}}
@keyframes rzsFlash{0%,70%,100%{opacity:0}74%{opacity:.9}77%{opacity:.15}80%{opacity:1}86%{opacity:0}}
@keyframes rzsSway{from{transform:rotate(-8deg)}to{transform:rotate(8deg)}}

/* ---------- NEW THEMES: shared ---------- */
.rxa-layer:not(.is-on) *{animation-play-state:paused!important}
.rxa-drift{animation:rxaDrift 16s ease-in-out infinite}
.rxa-drift-2{animation-duration:21s;animation-direction:reverse}
@keyframes rxaDrift{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(50px,-30px) scale(1.12)}}

/* FROST */
.rxa-frost-sheen{position:absolute;inset:-20% -40%;background:linear-gradient(115deg,transparent 40%,rgba(186,230,253,.07) 50%,transparent 60%);animation:rxaSheen 11s ease-in-out infinite}
@keyframes rxaSheen{0%{transform:translateX(-40%)}100%{transform:translateX(40%)}}
.rxa-snow{position:absolute;top:-4vh;width:var(--s);height:var(--s);border-radius:99px;background:#fff;opacity:var(--o);box-shadow:0 0 8px rgba(186,230,253,.9);animation:rxaSnow var(--t) linear infinite;animation-delay:var(--d)}
@keyframes rxaSnow{0%{transform:translate3d(0,0,0)}50%{transform:translate3d(var(--x),55vh,0)}100%{transform:translate3d(calc(var(--x)*-.6),112vh,0)}}

/* STARDUST */
.rxa-star{position:absolute;width:var(--s);height:var(--s);border-radius:99px;background:#fff;box-shadow:0 0 6px rgba(196,181,253,.95);animation:rxaTwinkle var(--t) ease-in-out infinite;animation-delay:var(--d)}
@keyframes rxaTwinkle{0%,100%{opacity:.15;transform:scale(.6)}50%{opacity:1;transform:scale(1.25)}}
.rxa-meteor{position:absolute;width:150px;height:1.5px;border-radius:99px;background:linear-gradient(90deg,rgba(255,255,255,0),rgba(196,181,253,.9),#fff);opacity:0;transform:rotate(-35deg);animation:rxaMeteor var(--t) linear infinite;animation-delay:var(--d)}
.rxa-meteor::after{content:"";position:absolute;right:-1px;top:-2px;width:5px;height:5px;border-radius:99px;background:#fff;box-shadow:0 0 12px 3px rgba(196,181,253,.9)}
@keyframes rxaMeteor{0%{transform:rotate(-35deg) translateX(0);opacity:0}4%{opacity:1}14%{transform:rotate(-35deg) translateX(-620px);opacity:0}100%{transform:rotate(-35deg) translateX(-620px);opacity:0}}

/* SAKURA — moonlit petals */
.rzt-moon{position:absolute;right:11%;top:10%;width:clamp(110px,15vw,210px);aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 36% 34%,#fff4f9,#fbcfe8 48%,#f472b6);opacity:.5;box-shadow:0 0 90px 30px rgba(244,114,182,.28);animation:rztMoon 8s ease-in-out infinite}
@keyframes rztMoon{50%{opacity:.62;transform:scale(1.04)}}
.rzt-branch{position:absolute;left:-2vw;top:-1vh;width:min(62vw,720px);opacity:.95;transform-origin:0 0;filter:drop-shadow(0 0 14px rgba(244,114,182,.28));animation:rztSway 9s ease-in-out infinite alternate}
@keyframes rztSway{from{transform:rotate(-.8deg)}to{transform:rotate(1.4deg)}}
.rzt-bloom{animation:rztBloom 4.5s ease-in-out infinite;animation-delay:calc(var(--k)*-.6s)}
@keyframes rztBloom{50%{transform:scale(1.2);opacity:.7}}
.rzt-pw{position:absolute;top:-6vh;width:var(--s);height:var(--s);opacity:var(--o);animation:rztFall var(--t) linear infinite;animation-delay:var(--d);will-change:transform}
@keyframes rztFall{0%{transform:translate3d(0,0,0)}25%{transform:translate3d(var(--x),28vh,0)}50%{transform:translate3d(calc(var(--x)*-.7),58vh,0)}75%{transform:translate3d(calc(var(--x)*.8),86vh,0)}100%{transform:translate3d(calc(var(--x)*-.4),114vh,0)}}
.rzt-petal{display:block;width:100%;height:70%;border-radius:150% 0 150% 0;background:linear-gradient(135deg,#ffe4ef,#f9a8d4 55%,#ec4899);box-shadow:0 0 10px rgba(244,114,182,.45);transform:rotate(var(--r));animation:rztTumble var(--v) ease-in-out infinite alternate}
@keyframes rztTumble{from{transform:rotate(var(--r)) rotateX(0) rotateY(0)}to{transform:rotate(calc(var(--r) + 140deg)) rotateX(70deg) rotateY(50deg)}}
.rzt-mist{position:absolute;left:-20%;right:-20%;bottom:-6%;height:38%;filter:blur(24px);background:radial-gradient(ellipse at 30% 100%,rgba(244,114,182,.18),transparent 60%),radial-gradient(ellipse at 75% 100%,rgba(168,85,247,.15),transparent 60%);animation:rxaDrift 18s ease-in-out infinite}

/* THUNDER — rain, clouds, lightning */
.rzt-cloud{position:absolute;border-radius:50%;filter:blur(70px);background:rgba(71,98,140,.3);animation:rztCloud 26s ease-in-out infinite alternate}
.rzt-cloud-1{left:-10%;top:-12%;width:60vw;height:36vh}
.rzt-cloud-2{right:-12%;top:2%;width:55vw;height:30vh;background:rgba(51,78,120,.34);animation-duration:32s;animation-direction:alternate-reverse}
.rzt-cloud-3{left:24%;top:-18%;width:50vw;height:28vh;background:rgba(32,52,92,.55);animation-duration:38s}
@keyframes rztCloud{to{transform:translateX(12vw)}}
.rzt-flash{position:absolute;inset:0;opacity:0;background:radial-gradient(ellipse at var(--fx,40%) 0%,rgba(220,235,255,.55),rgba(140,180,255,.14) 45%,transparent 75%);animation:rztFlash var(--ft,11s) linear infinite;animation-delay:var(--fd,0s)}
@keyframes rztFlash{0%,88%,100%{opacity:0}89%{opacity:.55}90%{opacity:.1}91.5%{opacity:1}94%{opacity:.18}96%{opacity:0}}
.rzt-bolt{position:absolute;top:0;height:62vh;width:auto;opacity:0;stroke:#eaf2ff;filter:drop-shadow(0 0 8px rgba(160,200,255,.95)) drop-shadow(0 0 22px rgba(120,170,255,.7));animation:rztBolt var(--ft,11s) linear infinite;animation-delay:var(--fd,0s)}
@keyframes rztBolt{0%,88%,100%{opacity:0}89%{opacity:.9}90%{opacity:.15}91.5%{opacity:1}94%{opacity:.25}95.5%{opacity:0}}
.rzt-rain{position:absolute;top:-12vh;width:1px;height:var(--h);background:linear-gradient(to bottom,transparent,rgba(190,215,255,.55));animation:rztRain var(--t) linear infinite;animation-delay:var(--d);will-change:transform}
@keyframes rztRain{from{transform:translate3d(0,0,0) rotate(10deg)}to{transform:translate3d(-24vh,125vh,0) rotate(10deg)}}
.rzt-fog{position:absolute;left:-10%;right:-10%;bottom:-8%;height:34%;filter:blur(30px);background:radial-gradient(ellipse at 50% 100%,rgba(96,140,210,.22),transparent 65%);animation:rxaDrift 14s ease-in-out infinite}

/* DIVINE DAWN — god rays + golden dust */
.rzt-sun{position:absolute;left:50%;top:-14vh;width:clamp(260px,46vw,720px);aspect-ratio:1;margin-left:calc(clamp(260px,46vw,720px)/-2);border-radius:50%;background:radial-gradient(circle,rgba(255,236,190,.95) 0,rgba(255,196,120,.5) 18%,rgba(255,150,80,.16) 42%,transparent 68%);animation:rztSun 7s ease-in-out infinite}
@keyframes rztSun{50%{transform:scale(1.08);opacity:.85}}
.rzt-rays{position:absolute;left:-20vw;top:0;width:140vw;height:100vh;transform-origin:50% 0;background:repeating-conic-gradient(from 150deg at 50% 0,rgba(255,220,160,.2) 0deg 1.4deg,transparent 1.4deg 5deg);-webkit-mask-image:linear-gradient(to bottom,#000,transparent 82%);mask-image:linear-gradient(to bottom,#000,transparent 82%);filter:blur(1.5px);animation:rztSwing 14s ease-in-out infinite alternate}
.rzt-rays-2{background:repeating-conic-gradient(from 153deg at 50% 0,rgba(255,196,130,.14) 0deg 2.6deg,transparent 2.6deg 7.3deg);filter:blur(3px);animation-duration:19s;animation-direction:alternate-reverse}
@keyframes rztSwing{from{transform:rotate(-5deg)}to{transform:rotate(5deg)}}
.rzt-mote{position:absolute;bottom:-3vh;width:var(--s);height:var(--s);border-radius:99px;background:#ffe2b0;box-shadow:0 0 10px 2px rgba(255,200,120,.6);opacity:0;animation:rztMote var(--t) linear infinite;animation-delay:var(--d);will-change:transform}
@keyframes rztMote{0%{transform:translate3d(0,0,0);opacity:0}15%{opacity:.9}85%{opacity:.7}100%{transform:translate3d(var(--x),-108vh,0);opacity:0}}

@media (prefers-reduced-motion:reduce){
  .rzh-card,.rzh-ticket::before,.rzh-medal::before,.rzh-medal::after,.rzh-strip,.rzh-iris-blades,.rzh-iris-eye,.rzh-stroke,.rzh-arc,.rzh-orbit-dot,.rzh-live,.rzh-t2,.rzh-dot,
  .rzs-btn::before,.rzs-planet i,.rzs-new,.rzs-item::before,.rzs-fx,
  .rxa-drift,.rxa-frost-sheen,.rxa-snow,.rxa-star,.rxa-meteor,
  .rzt-pw,.rzt-petal,.rzt-rain,.rzt-flash,.rzt-bolt,.rzt-cloud,.rzt-mote,.rzt-rays,.rzt-sun,.rzt-moon,.rzt-branch,.rzt-bloom,.rzt-mist,.rzt-fog{animation:none!important}
  .rzh-stroke{stroke-dashoffset:0;opacity:.6}.rzh-arc{stroke-dasharray:var(--p) 100}
}


        /* HERO CARDS — restrained premium finish */
        .rzh-card{filter:drop-shadow(0 10px 18px rgba(0,0,0,.32))!important;transform:none!important;animation:rzhIn .55s ease-out backwards!important;transition:filter .22s ease,transform .22s ease!important}
        .rzh-card:hover,.rzh-card:focus-visible{filter:drop-shadow(0 13px 24px rgba(0,0,0,.42))!important;transform:translateY(-3px)!important}
        .rzh-ticket{background:linear-gradient(135deg,rgba(var(--c),.11),rgba(13,15,21,.96) 52%,rgba(5,6,10,.98))!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.12)!important;-webkit-mask-image:none!important;mask-image:none!important}
        .rzh-ticket::before,.rzh-medal::before,.rzh-medal::after,.rzh-fill,.rzh-perf,.rzh-sheen{display:none!important}
        .rzh-spot{opacity:0!important}
        .rzh-medal{width:44px!important;height:44px!important;background:rgba(var(--c),.15)!important;border:1px solid rgba(var(--c),.48)!important;box-shadow:none!important}
        .rzh-card:hover .rzh-medal{transform:translateY(-1px)!important}
        .rzh-t1,.rzh-t2{transition:none!important}.rzh-t2{display:none!important}
        .rzh-card:hover .rzh-t1,.rzh-card:focus-visible .rzh-t1{transform:none!important}
        .rzh-go{width:34px!important;height:34px!important;box-shadow:none!important}
        .rzh-card:hover .rzh-go{transform:translateX(2px)!important;background:rgba(var(--c),.18)!important;color:#fff!important;border-color:rgba(var(--c),.55)!important}
        .rzh-iris,.rzh-gauge{opacity:.25!important}
        .rzh-iris-blades,.rzh-orbit-dot,.rzh-arc,.rzh-strip,.rzh-stroke,.rzh-dot,.rzh-live{animation:none!important}
        .rzs-btn{cursor:pointer}.rzs-caret{transform:none!important}.rzs-next svg{width:14px;height:14px}
        @media(prefers-reduced-motion:reduce){.rzh-card,.rzh-card *{animation:none!important;transition:none!important}}

      `}

</style>

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className={`absolute inset-0 transition-all duration-1000 ${
            theme === "obsidian"
              ? "bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.045),transparent_42%)]"
              : theme === "ember"
              ? "bg-[radial-gradient(circle_at_50%_30%,rgba(255,80,15,0.12),transparent_45%)]"
              : "bg-[radial-gradient(circle_at_50%_25%,rgba(70,100,255,0.11),transparent_45%)]"
          }`}
        />
        <div
          className={`absolute left-1/2 top-[5%] h-[550px] w-[750px] -translate-x-1/2 rounded-full blur-[150px] transition-all duration-1000 ${
            theme === "obsidian" ? "bg-white/[0.018]" : theme === "ember" ? "bg-orange-600/[0.07]" : "bg-indigo-600/[0.07]"
          }`}
        />
        <div
          className={`absolute bottom-[-25%] left-1/2 h-[550px] w-[950px] -translate-x-1/2 rounded-full blur-[170px] transition-all duration-1000 ${
            theme === "obsidian" ? "bg-white/[0.012]" : theme === "ember" ? "bg-red-700/[0.04]" : "bg-blue-700/[0.04]"
          }`}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_25%,rgba(0,0,0,0.78)_100%)]" />
      </div>

      {/* ==================================
          RAAKA INTRO
      ================================== */}

      {intro && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden bg-black">
          <div className="absolute h-[500px] w-[500px] animate-pulse rounded-full bg-orange-600/20 blur-[140px]" />
          <div className="relative flex animate-raaka-intro flex-col items-center">
            <img src="/images/logo2.png" alt="RAAKA" className="w-52 object-contain md:w-72" />
            <div className="mt-6 h-px w-24 animate-pulse bg-white/40" />
            <p className="mt-4 text-[10px] uppercase tracking-[0.5em] text-white/50 md:text-xs">A New World Begins</p>
          </div>
        </div>
      )}

      {/* ==================================
          RAAKA BACKGROUND THEMES
          OBSIDIAN • EMBER • COSMIC • GRAPHITE • ONYX
      ================================== */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black">
        {/* OBSIDIAN — pure black cinematic */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${theme === "obsidian" ? "opacity-100" : "opacity-0"}`}>
          <div className="absolute inset-0 bg-[#020202]" />
          <div className="absolute left-1/2 top-[8%] h-[620px] w-[900px] -translate-x-1/2 rounded-full bg-white/[0.025] blur-[150px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(255,255,255,0.045),transparent_42%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.18)_55%,rgba(0,0,0,0.92)_100%)]" />
        </div>

        {/* EMBER — RAAKA fire atmosphere */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${theme === "ember" ? "opacity-100" : "opacity-0"}`}>
          <div className="absolute inset-0 animate-raaka-bg-1 bg-cover bg-center" style={{ backgroundImage: "url('/images/raakabg.jpg')" }} />
          <div className="absolute inset-0 animate-raaka-bg-2 bg-cover bg-center" style={{ backgroundImage: "url('/images/raakabg1.jpg')" }} />
          <div className="absolute inset-0 animate-raaka-bg-3 bg-cover bg-center" style={{ backgroundImage: "url('/images/raakabg2.jpg')" }} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_35%,rgba(255,76,0,0.16),transparent_48%)]" />
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/85" />
        </div>

        {/* COSMIC — deep space / divine warrior atmosphere */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${theme === "cosmic" ? "opacity-100" : "opacity-0"}`}>
          <div className="absolute inset-0 bg-[#02040b]" />
          <div className="absolute left-[18%] top-[8%] h-[520px] w-[520px] rounded-full bg-indigo-700/[0.10] blur-[150px]" />
          <div className="absolute right-[8%] top-[28%] h-[460px] w-[460px] rounded-full bg-violet-700/[0.08] blur-[145px]" />
          <div className="absolute bottom-[-12%] left-1/2 h-[520px] w-[850px] -translate-x-1/2 rounded-full bg-blue-700/[0.06] blur-[160px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(90,110,255,0.09),transparent_44%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(1,3,12,0.05),rgba(0,0,0,0.88))]" />
        </div>

        {/* GRAPHITE SILVER — premium dark */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${theme === "graphite" ? "opacity-100" : "opacity-0"}`}>
          <div className="absolute inset-0 bg-[#111214]" />
          <div className="absolute left-[-10%] top-[-18%] h-[700px] w-[700px] rounded-full bg-white/[0.055] blur-[120px]" />
          <div className="absolute right-[-8%] top-[8%] h-[600px] w-[600px] rounded-full bg-zinc-400/[0.07] blur-[130px]" />
          <div className="absolute bottom-[-20%] left-1/2 h-[700px] w-[1100px] -translate-x-1/2 rounded-full bg-slate-300/[0.045] blur-[160px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(255,255,255,0.09),transparent_45%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.025),rgba(17,18,20,0.08)_45%,rgba(0,0,0,0.45)_100%)]" />
          <div className="absolute inset-0 opacity-[0.035] bg-[repeating-linear-gradient(115deg,transparent_0px,transparent_2px,rgba(255,255,255,0.18)_3px,transparent_4px)]" />
        </div>

        {/* ONYX GOLD — luxury black + metallic gold */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${theme === "onyx" ? "opacity-100" : "opacity-0"}`}>
          <div className="absolute inset-0 bg-[#070706]" />
          <div className="absolute left-1/2 top-[-14%] h-[680px] w-[920px] -translate-x-1/2 rounded-full bg-amber-500/[0.06] blur-[155px]" />
          <div className="absolute left-[-8%] top-[34%] h-[500px] w-[500px] rounded-full bg-yellow-700/[0.04] blur-[145px]" />
          <div className="absolute bottom-[5%] right-[-5%] h-[520px] w-[520px] rounded-full bg-orange-600/[0.04] blur-[155px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(245,190,70,0.08),transparent_43%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_15%,rgba(255,214,120,0.02)_48%,transparent_70%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.22)_55%,rgba(0,0,0,0.97)_100%)]" />
        </div>

        {/* AURORA — northern lights */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${theme === "aurora" ? "opacity-100" : "opacity-0"}`}>
          <div className="absolute inset-0 bg-[#020807]" />
          <div className="absolute left-[-10%] top-[-10%] h-[560px] w-[760px] rounded-full bg-teal-500/[0.11] blur-[140px]" />
          <div className="absolute right-[-8%] top-[22%] h-[520px] w-[620px] rounded-full bg-emerald-500/[0.08] blur-[150px]" />
          <div className="absolute bottom-[-15%] left-1/3 h-[480px] w-[780px] rounded-full bg-violet-600/[0.09] blur-[160px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0),rgba(0,0,0,0.85))]" />
        </div>

        {/* CRIMSON — blood moon */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${theme === "crimson" ? "opacity-100" : "opacity-0"}`}>
          <div className="absolute inset-0 bg-[#0a0204]" />
          <div className="absolute left-1/2 top-[-12%] h-[640px] w-[900px] -translate-x-1/2 rounded-full bg-rose-600/[0.12] blur-[150px]" />
          <div className="absolute bottom-[-10%] right-[-6%] h-[500px] w-[560px] rounded-full bg-red-800/[0.10] blur-[150px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(244,63,94,0.10),transparent_44%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.9))]" />
        </div>

        {/* SUNSET — dusk gradient */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${theme === "sunset" ? "opacity-100" : "opacity-0"}`}>
          <div className="absolute inset-0 bg-[#0b0510]" />
          <div className="absolute left-[-8%] top-[-8%] h-[560px] w-[700px] rounded-full bg-fuchsia-600/[0.12] blur-[150px]" />
          <div className="absolute right-[-8%] top-[18%] h-[520px] w-[640px] rounded-full bg-orange-500/[0.10] blur-[150px]" />
          <div className="absolute bottom-[-14%] left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-purple-700/[0.10] blur-[160px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.88))]" />
        </div>

        {/* FROST — glacier blue + falling snow */}
        <div className={`rxa-layer absolute inset-0 transition-opacity duration-1000 ${theme === "frost" ? "is-on opacity-100" : "opacity-0"}`}>
          <div className="absolute inset-0 bg-[#030b16]" />
          <div className="absolute left-[-12%] top-[-14%] h-[640px] w-[820px] rounded-full bg-sky-400/[0.13] blur-[150px] rxa-drift" />
          <div className="absolute right-[-10%] top-[24%] h-[540px] w-[700px] rounded-full bg-cyan-300/[0.09] blur-[150px] rxa-drift rxa-drift-2" />
          <div className="absolute bottom-[-18%] left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-blue-500/[0.10] blur-[160px]" />
          <div className="rxa-frost-sheen" />
          <SnowField />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_40%,rgba(2,8,18,0.85))]" />
        </div>

        {/* STARDUST — twinkling stars + shooting meteors */}
        <div className={`rxa-layer absolute inset-0 transition-opacity duration-1000 ${theme === "meteor" ? "is-on opacity-100" : "opacity-0"}`}>
          <div className="absolute inset-0 bg-[#02030a]" />
          <div className="absolute left-[10%] top-[-8%] h-[560px] w-[680px] rounded-full bg-violet-700/[0.14] blur-[150px] rxa-drift" />
          <div className="absolute right-[-6%] top-[30%] h-[480px] w-[600px] rounded-full bg-indigo-600/[0.12] blur-[150px] rxa-drift rxa-drift-2" />
          <div className="absolute bottom-[-14%] left-1/3 h-[420px] w-[760px] rounded-full bg-fuchsia-700/[0.08] blur-[160px]" />
          <StarField />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_45%,rgba(2,3,10,0.85))]" />
        </div>

        {/* SAKURA — moonlit blossom branch + drifting petals */}
        <div className={`rxa-layer absolute inset-0 transition-opacity duration-1000 ${theme === "sakura" ? "is-on opacity-100" : "opacity-0"}`}>
          <div className="absolute inset-0 bg-[#0d0510]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#26102c_0%,#14061a_52%,#07020a_100%)]" />
          <div className="rzt-moon" />
          <div className="absolute left-[-10%] top-[8%] h-[480px] w-[620px] rounded-full bg-pink-500/[0.10] blur-[150px] rxa-drift" />
          <div className="absolute bottom-[-10%] right-[-8%] h-[460px] w-[640px] rounded-full bg-purple-600/[0.12] blur-[150px] rxa-drift rxa-drift-2" />
          <svg className="rzt-branch" viewBox="0 0 600 260" fill="none" aria-hidden>
            <path d="M-10 36 C 110 52 190 14 300 78 S 470 126 610 92" stroke="#12060f" strokeWidth="9" strokeLinecap="round" />
            <path d="M190 30 C 220 70 210 110 246 150" stroke="#12060f" strokeWidth="5" strokeLinecap="round" />
            <path d="M390 108 C 410 150 400 190 430 226" stroke="#12060f" strokeWidth="5" strokeLinecap="round" />
            {[[70, 42], [130, 40], [200, 22], [250, 60], [300, 78], [350, 100], [420, 112], [490, 112], [560, 96], [225, 118], [244, 150], [412, 170], [432, 224], [160, 36], [330, 92]].map(([x, y], k) => (
              <g key={k} className="rzt-bloom" style={{ "--k": k, transformOrigin: `${x}px ${y}px` } as React.CSSProperties}>
                <circle cx={x} cy={y} r={9 + (k % 3) * 2} fill="#f9a8d4" opacity=".85" />
                <circle cx={x} cy={y} r={3} fill="#fff1f7" />
              </g>
            ))}
          </svg>
          <PetalField />
          <div className="rzt-mist" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_45%,rgba(7,2,10,0.82))]" />
        </div>

        {/* THUNDER — heavy rain, drifting clouds, lightning strikes */}
        <div className={`rxa-layer absolute inset-0 transition-opacity duration-1000 ${theme === "thunder" ? "is-on opacity-100" : "opacity-0"}`}>
          <div className="absolute inset-0 bg-[#030610]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#0d1a30_0%,#060b18_58%,#02040a_100%)]" />
          <div className="rzt-cloud rzt-cloud-1" />
          <div className="rzt-cloud rzt-cloud-2" />
          <div className="rzt-cloud rzt-cloud-3" />
          <div className="rzt-flash" style={{ "--fx": "32%", "--ft": "11s", "--fd": "-2s" } as React.CSSProperties} />
          <div className="rzt-flash" style={{ "--fx": "74%", "--ft": "15s", "--fd": "-9s" } as React.CSSProperties} />
          <svg className="rzt-bolt" style={{ left: "26%", "--ft": "11s", "--fd": "-2s" } as React.CSSProperties} viewBox="0 0 120 400" fill="none" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" aria-hidden>
            <path d="M70 0 L48 118 L74 128 L36 248 L62 258 L20 400" />
            <path d="M62 258 L96 306 L84 330" strokeWidth="1.6" />
          </svg>
          <svg className="rzt-bolt" style={{ left: "70%", "--ft": "15s", "--fd": "-9s" } as React.CSSProperties} viewBox="0 0 120 400" fill="none" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" aria-hidden>
            <path d="M54 0 L78 104 L50 116 L86 236 L58 248 L98 400" />
            <path d="M50 116 L18 162 L28 188" strokeWidth="1.6" />
          </svg>
          <RainField />
          <div className="rzt-fog" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_40%,rgba(2,4,10,0.82))]" />
        </div>

        {/* DIVINE DAWN — sun, god rays, rising golden dust */}
        <div className={`rxa-layer absolute inset-0 transition-opacity duration-1000 ${theme === "dawn" ? "is-on opacity-100" : "opacity-0"}`}>
          <div className="absolute inset-0 bg-[#07111c]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#14324d_0%,#16283d_32%,#0a1522_70%,#050a12_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_112%,rgba(255,170,90,0.20),transparent_55%)]" />
          <div className="rzt-sun" />
          <div className="rzt-rays" />
          <div className="rzt-rays rzt-rays-2" />
          <DustField />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_55%,rgba(5,10,18,0.8))]" />
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_18%,rgba(0,0,0,0.72)_100%)]" />
      </div>

      {/* ==================================
          AURA THEME SWITCHER
      ================================== */}
      <AuraSwitcher theme={theme} setTheme={setTheme} />

      {/* PREMIUM MUSIC CONTROL */}
      <div className="fixed bottom-5 right-5 z-[110] sm:bottom-7 sm:right-7">
        <button
          type="button"
          onClick={toggleMusic}
          aria-label={musicPlaying ? "Pause RAAKA music" : "Play RAAKA music"}
          className={`raaka-control raaka-music-premium group relative flex h-[58px] w-[58px] items-center justify-center rounded-full border text-white shadow-[0_18px_70px_rgba(0,0,0,.55)] backdrop-blur-2xl transition-all duration-500 sm:h-[64px] sm:w-[64px] ${musicPlaying ? "is-playing" : ""}`}
        >
          <span className="raaka-music-orbit" />
          <span className="raaka-music-orbit raaka-music-orbit-2" />
          <span className="raaka-music-core">
            <span className="raaka-music-bars"><i/><i/><i/><i/><i/></span>
          </span>
          <span className="raaka-music-label">{musicPlaying ? "LIVE" : "MUSIC"}</span>
        </button>
      </div>

      {/* MENU BUTTON */}
      <div className="fixed right-4 top-4 z-[110] sm:right-5 sm:top-5 md:right-7 md:top-6">
        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          className="raaka-control raaka-menu-premium group flex h-10 items-center gap-2.5 rounded-full border border-white/20 bg-black/65 px-3.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/90 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-white/40 hover:bg-white hover:text-black sm:h-11 sm:px-4 md:px-5"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <span className="relative block h-3 overflow-hidden leading-3">
            <span className={`block transition-transform duration-500 ${menuOpen ? "-translate-y-full" : ""}`}>Menu</span>
            <span className={`absolute left-0 top-full block transition-transform duration-500 ${menuOpen ? "-translate-y-full" : ""}`}>Close</span>
          </span>
          <span className={`rx-burger ${menuOpen ? "is-open" : ""}`}><i /><i /><i /></span>
        </button>
      </div>

      {/* ==================================
          MENU BACKDROP + DRAWER (right-side, always mounted for smooth transitions)
      ================================== */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={() => setMenuOpen(false)}
        tabIndex={menuOpen ? 0 : -1}
        className={`raaka-control raaka-backdrop-btn fixed inset-0 z-[95] bg-black/50 backdrop-blur-[2px] transition-opacity duration-500 ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`rx-menu ${menuOpen ? "rx-menu-open" : ""} fixed right-0 top-0 z-[100] flex h-[100dvh] w-[86vw] max-w-[400px] flex-col overflow-y-auto raaka-menu-scroll border-l border-white/10 bg-black/95 shadow-[0_25px_80px_rgba(0,0,0,0.65)] backdrop-blur-2xl transition-transform duration-500 ease-out ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-end justify-between gap-4 border-b border-white/10 px-6 py-7">
          <div>
            <p className="text-[9px] uppercase tracking-[0.35em] text-white/35">Explore</p>
            <h2 className="rx-shimmer-text mt-1 font-serif text-3xl font-semibold tracking-tight text-white">RAAKA</h2>
          </div>
          <p className="pb-1 text-right text-[9px] uppercase tracking-[0.22em] text-white/25">The World of RAAKA</p>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-4">
          {NAV_LINKS.map((link, idx) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{ "--i": idx } as React.CSSProperties}
              className="raaka-nav-link rx-menu-item group flex items-center justify-between rounded-2xl px-4 py-3.5 transition"
            >
              <span className="rx-menu-bar" />
              <span className="flex items-center text-sm font-medium">
                <span className="mr-3 font-mono text-[10px] text-white/25">{String(idx + 1).padStart(2, "0")}</span>
                {link.label}
                {link.isNew && <NewBadge addedAt="2026-09-06" />}
              </span>
              <span className="raaka-nav-arrow text-white/25 transition">→</span>
            </a>
          ))}

          {/* TICKET BOOKING */}
          <div className="rx-menu-item rounded-2xl" style={{ "--i": NAV_LINKS.length } as React.CSSProperties}>
            <button
              type="button"
              onClick={() => setTicketsOpen((value) => !value)}
              className="raaka-control raaka-ticket-toggle flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left transition hover:bg-white/10"
            >
              <span className="flex items-center text-sm font-medium">
                Book Tickets
                <NewBadge addedAt="2026-09-06" />
              </span>
              <span className={`text-white/40 transition-transform duration-300 ${ticketsOpen ? "rotate-180" : ""}`}>⌄</span>
            </button>

            <div
              className={`grid overflow-hidden transition-all duration-300 ${
                ticketsOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="min-h-0">
                <div className="grid grid-cols-2 gap-3 px-4 pb-4 pt-1">
                  {TICKET_PARTNERS.map((partner) => (
                    <a
                      key={partner.name}
                      href={partner.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMenuOpen(false)}
                      className="raaka-ticket-card group rounded-2xl border border-white/10 bg-white/[0.03] p-2 text-center transition"
                      title={`Book Raaka on ${partner.name}`}
                    >
                      <div className="flex h-[54px] items-center justify-center overflow-hidden rounded-xl">
                        <Image
                          src={partner.logo}
                          alt={partner.name}
                          width={partner.w}
                          height={partner.h}
                          className="h-auto max-h-full w-full object-contain transition duration-300 group-hover:scale-105"
                        />
                      </div>
                      <span className="mt-2 block text-xs font-semibold text-white/75 group-hover:text-white">{partner.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <a href="/daily-quiz" onClick={() => setMenuOpen(false)} className="raaka-nav-link group flex items-center justify-between rounded-2xl px-4 py-3.5 transition">
            <span className="text-sm font-medium">Daily Quiz</span>
            <span className="raaka-nav-arrow text-white/25 transition">→</span>
          </a>

          <a href="/bookmyshow-tracker" onClick={() => setMenuOpen(false)} className="raaka-nav-link group flex items-center justify-between rounded-2xl px-4 py-3.5 transition">
            <span className="flex items-center text-sm font-medium">
              BookMyShow Tracker
              <NewBadge addedAt="2026-09-06" />
            </span>
            <span className="raaka-nav-arrow text-white/25 transition">→</span>
          </a>

          <a href="/contact" onClick={() => setMenuOpen(false)} className="raaka-nav-link group flex items-center justify-between rounded-2xl px-4 py-3.5 transition">
            <span className="text-sm font-medium">Contact</span>
            <span className="raaka-nav-arrow text-white/25 transition">→</span>
          </a>
        </nav>
      </aside>

      <main id="home" className="raaka-site relative z-10 min-h-screen w-full max-w-full overflow-x-hidden bg-transparent text-white">
        {/* ============================== HERO ============================== */}
        <section className="raaka-hero relative flex min-h-[100dvh] items-center overflow-hidden py-28 md:py-24">
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 md:px-8">
            <div className="max-w-4xl">
              {/* Atmosphere */}
              <div className="pointer-events-none absolute -left-20 top-1/2 -z-10 h-56 w-[620px] -translate-y-1/2 rounded-full bg-orange-500/[0.055] blur-[100px]" />

              {/* Eyebrow rule */}
              <div className="mb-5 flex items-center gap-3 md:gap-4">
                <span className="h-px w-8 bg-gradient-to-r from-transparent to-orange-400/75 md:w-14" />
                <span className="text-[8px] font-medium uppercase tracking-[0.58em] text-white/50 md:text-[10px]">The World of</span>
                <span className="relative h-px w-8 bg-gradient-to-l from-transparent to-orange-400/75 md:w-14">
                  <span className="absolute -right-1 -top-[2px] h-[5px] w-[5px] rounded-full bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.9)]" />
                </span>
              </div>

              {/* Logo */}
              <div className="rx-logo-wrap relative w-[min(84vw,560px)] md:w-[min(58vw,640px)]">
                <div className="rx-logo-halo pointer-events-none absolute -inset-x-10 -inset-y-10 rounded-full" />
                <Embers count={16} rise={170} />
                <div className="pointer-events-none absolute inset-x-4 bottom-0 h-10 rounded-full bg-black/70 blur-[22px]" />
                <LogoShine src="/images/raaka-logo.png" imgClassName="raaka-logo-premium drop-shadow-[0_10px_16px_rgba(0,0,0,0.95)] drop-shadow-[0_0_24px_rgba(255,130,20,0.10)]" />
                <span className="rx-logo-underline" aria-hidden />
              </div>

              {/* Title rule */}
              <div className="mb-4 mt-5 flex items-center md:mt-6">
                <span className="h-[3px] w-12 bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.85)] md:w-20" />
                <span className="mx-2 h-[7px] w-[7px] rotate-45 bg-orange-300 shadow-[0_0_14px_rgba(251,146,60,0.9)]" />
                <span className="h-px w-28 bg-gradient-to-r from-orange-400/70 via-orange-500/30 to-transparent md:w-52" />
              </div>

              {/* Subline */}
              <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 md:gap-3">
                <span className="text-[7px] font-medium uppercase tracking-[0.32em] text-orange-300/70 md:text-[9px] md:tracking-[0.4em]">Born of Fire</span>
                <span className="h-1 w-1 shrink-0 rounded-full bg-orange-400/70" />
                <span className="text-[7px] font-medium uppercase tracking-[0.32em] text-white/35 md:text-[9px] md:tracking-[0.4em]">Forged by Sacrifice</span>
                <span className="h-1 w-1 shrink-0 rounded-full bg-white/20" />
                <span className="text-[7px] font-medium uppercase tracking-[0.32em] text-white/25 md:text-[9px] md:tracking-[0.4em]">Chosen by Destiny</span>
              </div>

              {/* Description */}
              <p className="max-w-[640px] text-[14px] font-normal leading-[1.7] text-white/60 md:text-[16px] md:leading-[1.7]">
                Born of fire, shaped by the cosmos, and forged in sacrifice, a divine warrior rises to restore balance to a
                universe threatened by primordial chaos — before faith itself is extinguished.
              </p>

              {/* Action rail — horizontal scroll on mobile, grid on desktop */}
              <div className="mt-8 -mx-5 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-5 pb-7 pt-3 [scrollbar-width:none] [perspective:1200px] md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0 md:pt-0">
                {HERO_ACTIONS.map((action, i) => (
                  <HeroActionCard key={action.title} action={action} index={i} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============================== ABOUT / MOVIE ============================== */}
        <section className="raaka-about mx-auto max-w-7xl px-5 py-20 sm:px-6 md:px-8 md:py-28">
          <SectionHeading eyebrow="The Movie" title="About Raaka" />

          <div className="grid gap-10 md:grid-cols-[minmax(0,340px)_1fr] md:gap-16">
            <div className="raaka-explore-card relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 md:max-w-[340px]">
              <Image src="/images/RAAKAFL.jpg" alt="Raaka First Look" width={800} height={1200} className="h-full w-full object-cover" />
            </div>

            <div className="flex flex-col justify-center">
              <p className="max-w-xl text-lg leading-8 text-zinc-300">
                Prepare yourself for a vision beyond limits.
              </p>

              <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-white/10 pt-8 sm:grid-cols-4 md:grid-cols-2">
                {[
                  ["Language", "Telugu"],
                  ["Genre", "Sci-Fi"],
                  ["Director", "Atlee Kumar"],
                  ["Release", "Coming soon"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs uppercase tracking-[0.2em] text-zinc-500">{label}</dt>
                    <dd className="mt-1.5 font-semibold text-white">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Releasing in */}
          <div className="raaka-release-panel mt-20 w-full md:mt-28">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 px-5 py-9 backdrop-blur-md md:px-10 md:py-10">
              <span className="raaka-release-orbit pointer-events-none absolute left-1/2 top-1/2 h-[150%] w-[35%] -translate-x-1/2 -translate-y-1/2" />
              <div className="relative z-10">
                <div className="mb-7 flex items-center justify-center gap-4">
                  <span className="raaka-release-line h-px w-12 bg-amber-200/25 md:w-24" />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.48em] text-amber-100/65 md:text-xs">Releasing In</p>
                  <span className="raaka-release-line h-px w-12 bg-amber-200/25 md:w-24" />
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {RELEASE_LANGUAGES.map((language) => (
                    <div key={language} className="raaka-release-chip group relative overflow-hidden rounded-full border border-white/10 bg-white/[0.035] px-5 py-2.5">
                      <span className="raaka-release-chip-glow pointer-events-none absolute inset-0" />
                      <span className="relative text-sm font-semibold tracking-wide text-white/80 transition-colors duration-300 group-hover:text-white md:text-base">{language}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================== COUNTDOWN ============================== */}
        <section id="countdown" className="rx-countdown relative mx-auto max-w-7xl px-4 pb-20 pt-2 sm:px-6 md:px-8 md:pb-24">
          <div className="rx-cd-card relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-black md:rounded-[2rem]">
            <div className="absolute inset-0 overflow-hidden">
              <Image src="/images/raakabg2.jpg" alt="" fill priority sizes="100vw" className="rx-cd-photo object-cover object-center" />
            </div>
            <div className="absolute inset-0 bg-black/55" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-black/75" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90" />
            <div className="rx-cd-glow pointer-events-none absolute left-1/2 top-[42%] h-[420px] w-[420px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-[110px]" />
            <Embers count={22} rise={480} />
            <div className="rx-cd-beam pointer-events-none absolute inset-y-0 left-0 w-1/3" />

            <div className="rx-cd-content relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-4 py-14 text-center sm:px-8 md:py-24">
              <p className="text-[10px] uppercase tracking-[0.5em] text-amber-100/70 md:text-xs">The Countdown Begins</p>

              <div className="rx-logo-wrap relative mt-6 w-[min(70vw,250px)] md:mt-8 md:w-[480px]">
                <div className="rx-logo-halo pointer-events-none absolute -inset-x-8 -inset-y-8 rounded-full" />
                <LogoShine src="/images/logo2.png" imgClassName="drop-shadow-[0_0_25px_rgba(255,180,70,0.25)]" />
              </div>

              <div className="mt-5 flex items-center justify-center gap-3 md:mt-7 md:gap-4">
                <span className="h-px w-8 bg-amber-100/40 md:w-20" />
                <p className="rx-shimmer-text text-xs uppercase tracking-[0.32em] text-amber-50/90 md:text-lg md:tracking-[0.35em]">coming soon</p>
                <span className="h-px w-8 bg-amber-100/40 md:w-20" />
              </div>

              <div className="rx-timer-grid mt-10 grid w-full grid-cols-4 gap-2 sm:gap-3 md:mt-14 md:gap-4">
                {[
                  { label: "Days", value: timeLeft.days, pct: Math.min(timeLeft.days / 365, 1) * 100 },
                  { label: "Hours", value: timeLeft.hours, pct: (timeLeft.hours / 24) * 100 },
                  { label: "Minutes", value: timeLeft.minutes, pct: (timeLeft.minutes / 60) * 100 },
                  { label: "Seconds", value: timeLeft.seconds, pct: (timeLeft.seconds / 60) * 100, glow: true },
                ].map((unit) => (
                  <TimerUnit key={unit.label} {...unit} />
                ))}
              </div>

              <div className="mt-10 flex items-center justify-center gap-3 md:mt-14 md:gap-4">
                <span className="h-px w-6 bg-amber-100/30 md:w-16" />
                <p className="text-[10px] uppercase tracking-[0.4em] text-amber-50/80 md:text-sm md:tracking-[0.45em]">The Wait Is Almost Over</p>
                <span className="h-px w-6 bg-amber-100/30 md:w-16" />
              </div>
            </div>
          </div>
        </section>

        {/* ============================== CAST ============================== */}
        <section id="cast" data-design-section="cast" className="px-5 py-16 sm:px-6 sm:py-20 md:px-10 md:py-24">
          <div className="mx-auto max-w-6xl">
            <Reveal><SectionHeading eyebrow="The Cast" title="Cast & Characters" /></Reveal>
            <div className="cast-crew-carousel relative">
              <button type="button" aria-label="Scroll cast left" onClick={() => scrollCastCrew(castTrackRef, -1)} className="cast-crew-arrow cast-crew-arrow-left" >‹</button>
              <div ref={castTrackRef} className="cast-crew-track -mx-5 flex w-[calc(100%+2.5rem)] flex-nowrap justify-start gap-4 overflow-x-auto overscroll-x-contain px-5 pb-5 pt-1 snap-x snap-mandatory scroll-smooth touch-pan-x sm:-mx-6 sm:w-[calc(100%+3rem)] sm:gap-5 sm:px-6 md:-mx-10 md:w-[calc(100%+5rem)] md:gap-6 md:px-10">
                {CAST.map((person, i) => (
                  <Reveal key={person.name} delay={i * 120} className="cast-crew-item w-[78%] max-w-[290px] shrink-0 snap-start sm:w-[42%] sm:max-w-[300px] md:w-[31%] lg:w-[22%]">
                    <PersonCard {...person} size="large" index={i} />
                  </Reveal>
                ))}
              </div>
              <button type="button" aria-label="Scroll cast right" onClick={() => scrollCastCrew(castTrackRef, 1)} className="cast-crew-arrow cast-crew-arrow-right" >›</button>
            </div>
          </div>
        </section>

        {/* ============================== CREW ============================== */}
        <section id="crew" data-design-section="crew" className="px-5 py-16 sm:px-6 sm:py-20 md:px-10 md:py-24">
          <div className="mx-auto max-w-6xl">
            <Reveal><SectionHeading eyebrow="Behind The World" title="Crew" /></Reveal>
            <div className="cast-crew-carousel relative">
              <button type="button" aria-label="Scroll crew left" onClick={() => scrollCastCrew(crewTrackRef, -1)} className="cast-crew-arrow cast-crew-arrow-left" >‹</button>
              <div ref={crewTrackRef} className="cast-crew-track -mx-5 flex w-[calc(100%+2.5rem)] flex-nowrap justify-start gap-4 overflow-x-auto overscroll-x-contain px-5 pb-5 pt-1 snap-x snap-mandatory scroll-smooth touch-pan-x sm:-mx-6 sm:w-[calc(100%+3rem)] sm:gap-5 sm:px-6 md:-mx-10 md:w-[calc(100%+5rem)] md:gap-6 md:px-10">
                {CREW.map((person, i) => (
                  <Reveal key={person.name} delay={i * 110} className="cast-crew-item w-[78%] max-w-[290px] shrink-0 snap-start sm:w-[42%] sm:max-w-[300px] md:w-[31%] lg:w-[22%]">
                    <PersonCard {...person} index={i} />
                  </Reveal>
                ))}
              </div>
              <button type="button" aria-label="Scroll crew right" onClick={() => scrollCastCrew(crewTrackRef, 1)} className="cast-crew-arrow cast-crew-arrow-right" >›</button>
            </div>
          </div>
        </section>

        {/* ============================== CREATIVE TEAM ============================== */}
        <section id="creative-team" className="px-5 py-20 sm:px-6 md:px-10 md:py-24">
          <div className="mx-auto max-w-6xl">
            <SectionHeading eyebrow="Behind The Film" title="Creative Team" lede="The creative minds shaping the world and visual language of RAAKA." />
            <div className="divide-y divide-white/10 border-y border-white/10">
              {CREATIVE_TEAM.map((member) => (
                <div key={member.role} className="flex flex-col gap-1.5 py-6 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 sm:py-7">
                  <p className="text-xs uppercase tracking-[0.25em] text-zinc-500 sm:w-56 sm:shrink-0">{member.role}</p>
                  <h3 className="text-xl font-semibold text-white sm:text-2xl">{member.name}</h3>
                  <p className="text-sm text-zinc-500 sm:ml-auto">{member.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================== VFX STUDIOS ============================== */}
        <section id="vfx-studios" className="px-5 py-20 sm:px-6 md:px-10 md:py-24">
          <div className="mx-auto max-w-6xl">
            <SectionHeading eyebrow="Visual Effects & Special Effects" title="VFX Studios" lede="The visual effects and special effects studios behind the world of RAAKA." />
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
              {VFX_STUDIOS.map((studio) => (
                <StudioCard key={studio.name} {...studio} />
              ))}
            </div>
          </div>
        </section>

                {/* ============================== ANNOUNCEMENTS ============================== */}
        <section id="announcements" className="px-5 py-20 sm:px-6 md:px-10 md:py-24">
          <div className="mx-auto max-w-6xl">
            <SectionHeading eyebrow="Announcements" title="Latest Announcements" />
            <div className="grid gap-8 md:grid-cols-2">
              {ANNOUNCEMENT_VIDEOS.map((video) => (
                <Reveal key={video.title}><VideoCard {...video} /></Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ============================== MOTION CAPTURE BTS ============================== */}
        <section id="motion-capture" className="px-5 py-20 sm:px-6 md:px-10 md:py-24">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              eyebrow="Behind The Scenes"
              title="Motion Capture"
            />

            <div className="grid gap-8 md:grid-cols-2">
              <VideoCard
                title="RAAKA — Motion Capture Behind The Scenes"
                tag="Behind The Scenes"
                embed="https://www.youtube.com/embed/CmVA9ifXBx4"
              />
            </div>
          </div>
        </section>

        {/* ============================== SONGS ============================== */}
        <section id="songs" className="px-5 py-20 sm:px-6 md:px-10 md:py-24">
          <div className="mx-auto max-w-6xl">
            <SectionHeading eyebrow="The Soundtrack" title="Songs" />
            <div className="grid gap-8 md:grid-cols-2">
              {SONG_VIDEOS.map((video) => (
                <Reveal key={video.title}><VideoCard {...video} /></Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ============================== TICKETS CTA ============================== */}
        <section className="px-5 sm:px-6 md:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="raaka-ticket-portal flex flex-col items-center gap-6 rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center sm:flex-row sm:justify-between sm:text-left md:px-12"><span className="raaka-ticket-beam pointer-events-none" />
              <div className="relative z-[3]">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Ready When You Are</p>
                <h3 className="mt-2 font-serif text-2xl font-semibold text-white md:text-3xl">Book Your Tickets</h3>
              </div>
              <div className="relative z-[3] flex items-center gap-5">
                {TICKET_PARTNERS.map((partner) => (
                  <a
                    key={partner.name}
                    href={partner.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="raaka-ticket-mini group flex w-[120px] flex-col items-center"
                    title={`Book Raaka on ${partner.name}`}
                  >
                    <div className="raaka-ticket-logo-box flex h-[68px] w-[120px] items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/30 p-2 transition duration-300 group-hover:scale-105 group-hover:border-white/25">
                      <Image src={partner.logo} alt={partner.name} width={partner.w} height={partner.h} className="h-auto w-full object-contain" />
                    </div>
                    <span className="mt-2 flex items-center gap-2 text-xs font-semibold text-white/80 group-hover:text-white"><span>{partner.name}</span><span className="raaka-ticket-arrow">→</span></span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============================== BOX OFFICE ============================== */}
        <section id="box-office" className="relative mt-20 overflow-hidden px-5 py-20 sm:px-6 md:px-10 md:py-28">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-amber-500/10 blur-[130px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black/95" />
          </div>

          <div className="relative z-10 mx-auto max-w-6xl">
            <div className="mb-12 text-center md:mb-16">
              <p className="mb-3 text-[10px] uppercase tracking-[0.55em] text-amber-100/60 md:text-xs">Theatrical Performance</p>
              <h2 className="font-serif text-4xl font-black uppercase tracking-tight md:text-6xl">Box Office Collection</h2>
              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/50 md:text-base">
                Raaka box office collections will be updated after the theatrical release.
              </p>
            </div>

            <div className="grid divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.02] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {[
                ["Worldwide Gross", "₹ TBA"],
                ["India Gross", "₹ TBA"],
                ["Overseas Gross", "₹ TBA"],
              ].map(([label, value]) => (
                <div key={label} className="raaka-box-panel p-7">
                  <span className="raaka-box-bar" />
                  <p className="text-[10px] uppercase tracking-[0.3em] text-amber-100/50">{label}</p>
                  <h3 className="raaka-box-value mt-4 text-4xl font-black md:text-5xl">{value}</h3>
                  <p className="mt-3 text-[10px] uppercase tracking-[0.15em] text-white/30">Coming After Release</p>
                </div>
              ))}
            </div>

            <div className="mt-16">
              <p className="text-[10px] uppercase tracking-[0.45em] text-amber-100/50">Language Wise</p>
              <h3 className="mt-2 text-2xl font-bold md:text-3xl">Collection</h3>

              <div className="mt-6 divide-y divide-white/10 border-y border-white/10">
                {BOX_OFFICE_LANGS.map(([language, type]) => (
                  <div key={language} className="raaka-lang-row flex items-center justify-between gap-4 py-4">
                    <div className="flex items-baseline gap-3">
                      <span className="text-base font-semibold text-white">{language}</span>
                      <span className="text-[9px] uppercase tracking-[0.15em] text-amber-100/40">{type}</span>
                    </div>
                    <span className="text-xl font-black md:text-2xl">₹ TBA</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4">
              {BOX_OFFICE_STATS.map((label) => (
                <div key={label} className="raaka-stat-card rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <p className="text-[9px] uppercase tracking-[0.25em] text-white/35">{label}</p>
                  <h4 className="mt-3 text-2xl font-black">₹ TBA</h4>
                </div>
              ))}
            </div>

            <p className="mt-8 text-center text-[9px] uppercase tracking-[0.18em] text-white/25 md:text-xs">
              Collection figures will be updated as official box office data becomes available.
            </p>
          </div>
        </section>

        {/* ============================== CREW CREDITS ============================== */}
        <section id="crew-credits" className="px-5 py-16 sm:px-6 sm:py-20 md:px-10 md:py-24">
          <div className="mx-auto max-w-6xl">
            <Reveal><SectionHeading eyebrow="Behind The Film" title="Crew Credits" /></Reveal>

            <div className="mb-12 grid grid-cols-2 gap-3 sm:max-w-md sm:gap-4">
              <CountUp to={CREW_CREDITS.length} label="Departments" />
              <CountUp to={CREW_CREDITS.reduce((a, g) => a + g.names.length, 0)} label="Credits" />
            </div>

            <div className="columns-1 gap-x-12 sm:columns-2 lg:columns-3">
              {CREW_CREDITS.filter((g) => g.names.length <= 8).map((group, i) => (
                <CreditGroup key={group.department} group={group} index={i} />
              ))}
            </div>
            {CREW_CREDITS.filter((g) => g.names.length > 8).map((group, i) => (
              <CreditGroup key={group.department} group={group} index={i} dense />
            ))}
          </div>
        </section>

        {/* ============================== EXPLORE MORE ============================== */}
        <section id="explore" data-design-section="explore" className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 md:px-8 md:py-24">
          <Reveal><SectionHeading eyebrow="More" title="Explore More" lede="Stories, theories and updates from the world of RAAKA." /></Reveal>

          <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
            <Reveal>
              <ExploreCard
                featured index={0} href="/news/raaka1" eyebrow="Raaka News" meta="17 Sep 2026"
                title="Sun Pictures Teases Raaka With a Mysterious “37” Post"
                copy="One mysterious number has fans asking the same question — what does “37” mean?"
              />
            </Reveal>
            <Reveal delay={120}>
              <ExploreCard
                featured index={1} href="/news/raaka2" eyebrow="Mythology" meta="RAAKA"
                title="RAAKA & Rākā — The Full Moon Connection"
                copy="Explore the ancient Sanskrit meaning of Rākā, its connection with the full moon, and the mystery behind RAAKA's mythology."
              />
            </Reveal>
          </div>

          <div className="mt-4 grid gap-4 sm:mt-5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {EXPLORE_CARDS.map((card, i) => (
              <Reveal key={card.title} delay={i * 100}>
                <ExploreCard index={i + 2} eyebrow="Explore" title={card.title} copy={card.copy} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* ============================== CINEMATIC FOOTER ============================== */}
        <footer className="raaka-cinematic-footer relative mt-8 overflow-hidden">
          <div className="raaka-footer-noise pointer-events-none absolute inset-0" />
          <div className="raaka-footer-orbit pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
          <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-16 sm:px-6 md:px-8 md:pt-20">
            <div className="raaka-footer-core relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950/80 px-6 py-10 backdrop-blur-xl md:px-10 md:py-12">
              <div className="raaka-footer-sweep pointer-events-none absolute inset-y-0 left-0 w-1/3" />
              <div className="relative z-10 flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.5em] text-amber-200/55">World of</p>
                  <h2 className="mt-2 font-serif text-4xl font-black tracking-tight text-white md:text-5xl">RAAKA</h2>
                  <p className="mt-3 max-w-md text-sm leading-6 text-zinc-500">Everything about Raaka in one place.</p>
                </div>

                <nav className="flex flex-wrap gap-x-7 gap-y-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45">
                  <a href="/about" className="raaka-footer-nav">About</a>
                  <a href="/contact" className="raaka-footer-nav">Contact</a>
                  <a href="/privacy-policy" className="raaka-footer-nav">Privacy Policy</a>
                </nav>
              </div>

              <div className="raaka-footer-bottom relative z-10 mt-10 flex flex-col gap-3 border-t border-white/[0.06] pt-5 text-[9px] uppercase tracking-[0.18em] text-white/25 sm:flex-row sm:items-center sm:justify-between">
                <span>© {new Date().getFullYear()} World of RAAKA</span>
                <span>Unofficial Fan Website</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}