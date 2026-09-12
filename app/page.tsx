"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import NewBadge from "@/components/NewBadge";

type Theme = "obsidian" | "ember" | "cosmic" | "graphite" | "onyx";

type MusicTrack = {
  title: string;
  src: string;
};

const RAAKA_PLAYLIST: MusicTrack[] = [
  { title: "RAAKA Theme", src: "/sounds/king.mp3" },
  { title: "welcome onboard dp", src: "/sounds/song2.mp3" },
  // Future songs can be added here:
  // { title: "Song Name", src: "/music/song-name.mp3" },
];

// ==============================
// STATIC CONTENT
// ==============================

const NAV_LINKS: { href: string; label: string; isNew?: boolean }[] = [
  { href: "#home", label: "Home" },
  { href: "#cast", label: "Cast & Crew" },
  { href: "#posters", label: "Posters" },
  { href: "#announcements", label: "Videos" },
  { href: "/timeline", label: "Timeline", isNew: true },
];

const HERO_ACTIONS = [
  {
    href: "#videos",
    eyebrow: "Trailers & More",
    title: "Watch Videos",
    accent: "orange",
    icon: (
      <svg className="ml-0.5 h-4 w-4 md:h-[18px] md:w-[18px]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5.5v13l11-6.5z" />
      </svg>
    ),
  },
  {
    href: "/fans-art",
    eyebrow: "Art by the Fans",
    title: "Fan Art",
    accent: "purple",
    isNew: true,
    icon: (
      <svg className="h-4 w-4 md:h-[18px] md:w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M12 3.5l2.4 5.1 5.6.8-4 4 1 5.6-5-2.7-5 2.7 1-5.6-4-4 5.6-.8z" />
      </svg>
    ),
  },
  {
    href: "/box-office",
    eyebrow: "Track the Numbers",
    title: "Box Office",
    accent: "yellow",
    isNew: true,
    icon: (
      <svg className="h-4 w-4 md:h-[18px] md:w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 19V10" />
        <path d="M12 19V5" />
        <path d="M19 19v-7" />
      </svg>
    ),
  },
] as const;

const ACCENTS: Record<string, { border: string; bg: string; text: string; glow: string; bar: string }> = {
  orange: { border: "hover:border-orange-400/50", bg: "from-orange-500/[0.08]", text: "text-orange-300", glow: "border-orange-400/35 bg-orange-500/[0.08]", bar: "bg-orange-400" },
  purple: { border: "hover:border-purple-400/50", bg: "from-purple-500/[0.08]", text: "text-purple-300", glow: "border-purple-400/35 bg-purple-500/[0.08]", bar: "bg-purple-400" },
  yellow: { border: "hover:border-yellow-400/50", bg: "from-yellow-500/[0.07]", text: "text-yellow-300", glow: "border-yellow-400/35 bg-yellow-500/[0.08]", bar: "bg-yellow-400" },
};

const RELEASE_LANGUAGES = ["Telugu", "Hindi", "Tamil", "Kannada", "Malayalam", "Bengali", "Arabic", "English"];

const CAST = [
  { name: "Allu Arjun", image: "/images/actor3.jpg", href: "/allu-arjun" },
  { name: "Deepika Padukone", image: "/images/actor2.jpg" },
];

const CREW = [
  { name: "Atlee Kumar", role: "Director", image: "/images/crew1.jpg" },
  { name: "Sai Abhyankkar", role: "Musician", image: "/images/crew2.jpg", alt: "Sai Abhyankar" },
  { name: "Kalanithi Maran", role: "Producer", image: "/images/crew3.jpg" },
  { name: "Sun Pictures", role: "Producer", image: "/images/crew4.jpg", alt: "Sun Picture" },
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
  { department: "Cast", names: ["Allu Arjun", "Deepika Padukone"] },
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
    <div className="mb-12 max-w-2xl md:mb-16">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-3 font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-white md:text-5xl">
        {title}
      </h2>
      {lede && <p className="mt-4 text-[15px] leading-7 text-white/50">{lede}</p>}
    </div>
  );
}

function PersonCard({
  name,
  role,
  image,
  alt,
  href,
  size = "default",
}: {
  name: string;
  role?: string;
  image: string;
  alt?: string;
  href?: string;
  size?: "large" | "default";
}) {
  const inner = (
    <>
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
        <Image
          src={image}
          alt={alt ?? name}
          width={600}
          height={800}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
      <h3 className={`mt-4 font-semibold text-white ${size === "large" ? "text-lg md:text-xl" : "text-base md:text-lg"}`}>
        {name}
      </h3>
      {role && <p className="mt-1 text-sm text-white/45">{role}</p>}
    </>
  );

  return href ? (
    <a href={href} className="group block">
      {inner}
    </a>
  ) : (
    <div className="group">{inner}</div>
  );
}

function StudioCard({ name, note, logo, href }: { name: string; note: string; logo: string; href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="group block">
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
  return (
    <div>
      <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
        <iframe
          className="h-full w-full"
          src={embed}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white md:text-xl">{title}</h3>
      <p className="mt-1 text-sm uppercase tracking-[0.2em] text-white/35">{tag}</p>
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [intro, setIntro] = useState(true);
  const [introAudioDone, setIntroAudioDone] = useState(false);
  const [ticketsOpen, setTicketsOpen] = useState(false);

  // ==============================
  // RAAKA WEBSITE MUSIC
  // Minimal player: music + volume only
  // ==============================
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const [musicIndex, setMusicIndex] = useState(0);
  const [musicOpen, setMusicOpen] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.45);
  const previousVolumeRef = useRef(0.45);

  // ==============================
  // RAAKA BACKGROUND THEME
  // ==============================
  const [theme, setTheme] = useState<Theme>("obsidian");

  // ==============================
  // RAAKA MUSIC PLAYER
  // Browser autoplay is attempted first.
  // If blocked, first user interaction starts music.
  // ==============================
  useEffect(() => {
    const savedIndex = Number(localStorage.getItem("raaka-music-index"));
    const savedVolume = Number(localStorage.getItem("raaka-music-volume"));

    if (Number.isInteger(savedIndex) && savedIndex >= 0 && savedIndex < RAAKA_PLAYLIST.length) {
      setMusicIndex(savedIndex);
    }

    if (Number.isFinite(savedVolume) && savedVolume >= 0 && savedVolume <= 1) {
      setMusicVolume(savedVolume);
    }
  }, []);

  useEffect(() => {
    // Main music starts only after the 6-second intro audio clip has fully finished.
    // This prevents the intro clip and the main song from ever overlapping.
    if (!introAudioDone) return;

    const track = RAAKA_PLAYLIST[musicIndex];
    const audio = new Audio(track.src);
    audio.preload = "auto";
    audio.loop = true;
    audio.volume = musicVolume;
    musicRef.current = audio;

    const startMusic = () => {
      audio.volume = musicVolume;
      audio
        .play()
        .then(() => {
          setMusicPlaying(true);
        })
        .catch(() => {
          setMusicPlaying(false);
        });
    };

    audio
      .play()
      .then(() => {
        setMusicPlaying(true);
      })
      .catch(() => {
        window.addEventListener("pointerdown", startMusic, { once: true });
        window.addEventListener("keydown", startMusic, { once: true });
        window.addEventListener("touchstart", startMusic, { once: true });
      });

    return () => {
      window.removeEventListener("pointerdown", startMusic);
      window.removeEventListener("keydown", startMusic);
      window.removeEventListener("touchstart", startMusic);
      audio.pause();
      audio.currentTime = 0;
      if (musicRef.current === audio) {
        musicRef.current = null;
      }
    };
  }, [introAudioDone, musicIndex]);

  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.volume = musicVolume;
    }
    if (musicVolume > 0) {
      previousVolumeRef.current = musicVolume;
    }
    localStorage.setItem("raaka-music-volume", String(musicVolume));
  }, [musicVolume]);

  useEffect(() => {
    localStorage.setItem("raaka-music-index", String(musicIndex));
  }, [musicIndex]);

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
      // Only after this finishes can the main music player start.
      stopTimer = setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
        setIntroAudioDone(true);
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
      savedTheme === "obsidian" ||
      savedTheme === "ember" ||
      savedTheme === "cosmic" ||
      savedTheme === "graphite" ||
      savedTheme === "onyx"
    ) {
      setTheme(savedTheme);
    }
  }, []);

  // ==============================
  // SAVE BACKGROUND THEME
  // ==============================
  useEffect(() => {
    localStorage.setItem("raaka-theme", theme);
  }, [theme]);

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

  const themeOrder: Theme[] = ["obsidian", "ember", "cosmic", "graphite", "onyx"];

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
      `}</style>

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

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_18%,rgba(0,0,0,0.72)_100%)]" />
      </div>

      {/* ==================================
          BACKGROUND THEME SWITCHER
      ================================== */}
      <div className="fixed left-4 top-4 z-[90] sm:left-5 sm:top-5 md:left-7 md:top-6">
        <button
          type="button"
          onClick={() =>
            setTheme((current) => {
              const index = themeOrder.indexOf(current);
              return themeOrder[(index + 1) % themeOrder.length];
            })
          }
          className="group relative flex h-10 items-center gap-2.5 overflow-hidden rounded-full border border-white/15 bg-black/55 px-3 text-white/85 shadow-[0_12px_45px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-all duration-300 hover:border-white/35 hover:bg-black/75 sm:h-11 sm:px-3.5 md:px-4"
          aria-label={`Change visual aura. Current: ${theme}`}
          title="Change visual aura"
        >
          <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-white/[0.08] via-transparent to-orange-400/[0.08] opacity-70" />
          <span className="relative flex h-[22px] w-[22px] items-center justify-center rounded-full border border-white/20 bg-white/[0.04] shadow-inner sm:h-6 sm:w-6">
            <span className="absolute inset-1 rounded-full border border-white/10 transition-transform duration-700 group-hover:rotate-180" />
            <span
              className={`relative h-2 w-2 rounded-full transition-all duration-500 ${
                theme === "obsidian"
                  ? "bg-white shadow-[0_0_12px_rgba(255,255,255,0.85)]"
                  : theme === "ember"
                  ? "bg-orange-400 shadow-[0_0_14px_rgba(251,146,60,0.95)]"
                  : theme === "cosmic"
                  ? "bg-indigo-400 shadow-[0_0_14px_rgba(129,140,248,0.95)]"
                  : theme === "graphite"
                  ? "bg-zinc-300 shadow-[0_0_14px_rgba(212,212,216,0.9)]"
                  : "bg-yellow-400 shadow-[0_0_14px_rgba(250,204,21,0.9)]"
              }`}
            />
          </span>
          <span className="relative hidden text-[9px] font-semibold uppercase tracking-[0.32em] sm:block">Aura</span>
          <span className="relative hidden h-3.5 w-px bg-white/15 sm:block" />
          <span className="relative hidden text-[8px] uppercase tracking-[0.18em] text-white/40 sm:block">{theme}</span>
        </button>
      </div>

      {/* MENU BUTTON */}
      <div className="fixed right-4 top-4 z-[110] sm:right-5 sm:top-5 md:right-7 md:top-6">
        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          className="group flex h-10 items-center gap-2.5 rounded-full border border-white/20 bg-black/65 px-3.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/90 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-white/40 hover:bg-white hover:text-black sm:h-11 sm:px-4 md:px-5"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <span>{menuOpen ? "Close" : "Menu"}</span>
          <span className="relative flex h-4 w-4 items-center justify-center overflow-hidden">
            <span className={`absolute text-sm leading-none transition-all duration-300 ${menuOpen ? "translate-y-0 rotate-0 opacity-100" : "-translate-y-3 opacity-0"}`}>×</span>
            <span className={`absolute text-sm leading-none transition-all duration-300 ${menuOpen ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100"}`}>→</span>
          </span>
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
        className={`fixed inset-0 z-[95] bg-black/50 backdrop-blur-[2px] transition-opacity duration-500 ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed right-0 top-0 z-[100] flex h-[100dvh] w-[86vw] max-w-[400px] flex-col overflow-y-auto raaka-menu-scroll border-l border-white/10 bg-black/95 shadow-[0_25px_80px_rgba(0,0,0,0.65)] backdrop-blur-2xl transition-transform duration-500 ease-out ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-end justify-between gap-4 border-b border-white/10 px-6 py-7">
          <div>
            <p className="text-[9px] uppercase tracking-[0.35em] text-white/35">Explore</p>
            <h2 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-white">RAAKA</h2>
          </div>
          <p className="pb-1 text-right text-[9px] uppercase tracking-[0.22em] text-white/25">The World of RAAKA</p>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-4">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="group flex items-center justify-between rounded-2xl px-4 py-3.5 transition hover:bg-white/10"
            >
              <span className="flex items-center text-sm font-medium">
                {link.label}
                {link.isNew && <NewBadge addedAt="2026-09-06" />}
              </span>
              <span className="text-white/25 transition group-hover:translate-x-1 group-hover:text-white/70">→</span>
            </a>
          ))}

          {/* TICKET BOOKING */}
          <div className="rounded-2xl">
            <button
              type="button"
              onClick={() => setTicketsOpen((value) => !value)}
              className="flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left transition hover:bg-white/10"
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
                      className="group rounded-2xl border border-white/10 bg-white/[0.03] p-2 text-center transition hover:border-white/20 hover:bg-white/[0.07]"
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

          <a href="/fan-circle" onClick={() => setMenuOpen(false)} className="group flex items-center justify-between rounded-2xl px-4 py-3.5 transition hover:bg-white/10">
            <span className="text-sm font-medium">Fan Circle</span>
            <span className="text-white/25 transition group-hover:translate-x-1 group-hover:text-white/70">→</span>
          </a>

          <a href="/bookmyshow-tracker" onClick={() => setMenuOpen(false)} className="group flex items-center justify-between rounded-2xl px-4 py-3.5 transition hover:bg-white/10">
            <span className="flex items-center text-sm font-medium">
              BookMyShow Tracker
              <NewBadge addedAt="2026-09-06" />
            </span>
            <span className="text-white/25 transition group-hover:translate-x-1 group-hover:text-white/70">→</span>
          </a>

          <a href="/contact" onClick={() => setMenuOpen(false)} className="group flex items-center justify-between rounded-2xl px-4 py-3.5 transition hover:bg-white/10">
            <span className="text-sm font-medium">Contact</span>
            <span className="text-white/25 transition group-hover:translate-x-1 group-hover:text-white/70">→</span>
          </a>
        </nav>
      </aside>

      {/* ==================================
          RAAKA MUSIC PLAYER
      ================================== */}
      <div className="fixed bottom-4 right-4 z-[95] sm:bottom-5 sm:right-5 md:bottom-7 md:right-7">
        <div className="relative flex items-center gap-2 rounded-full border border-white/15 bg-black/70 p-1.5 shadow-[0_18px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
          <button
            type="button"
            onClick={() => setMusicOpen((value) => !value)}
            className={`flex h-10 max-w-[150px] items-center gap-2 rounded-full px-3 text-left transition-all duration-300 sm:max-w-[170px] ${
              musicPlaying ? "bg-white/[0.08] text-white" : "bg-white/[0.04] text-white/55"
            }`}
            aria-label="Open music playlist"
            aria-expanded={musicOpen}
            title="Music playlist"
          >
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/15 text-[12px] ${musicPlaying ? "text-orange-300" : "text-white/45"}`}>♪</span>
            <span className="min-w-0 truncate text-[9px] font-medium uppercase tracking-[0.18em]">{RAAKA_PLAYLIST[musicIndex].title}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (musicVolume > 0) {
                previousVolumeRef.current = musicVolume;
                setMusicVolume(0);
              } else {
                setMusicVolume(previousVolumeRef.current > 0 ? previousVolumeRef.current : 0.45);
              }
            }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-white/25 hover:bg-white/[0.09] hover:text-white"
            aria-label={musicVolume === 0 ? "Unmute music" : "Mute music"}
            title={musicVolume === 0 ? "Unmute" : "Mute"}
          >
            {musicVolume === 0 ? "🔇" : "🔊"}
          </button>

          <div
            className={`absolute bottom-[52px] right-0 w-[230px] origin-bottom-right overflow-hidden rounded-2xl border border-white/15 bg-black/90 p-2 shadow-[0_20px_70px_rgba(0,0,0,0.7)] backdrop-blur-2xl transition-all duration-300 ${
              musicOpen ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-2 scale-95 opacity-0"
            }`}
          >
            <div className="px-3 pb-2 pt-2 text-[8px] uppercase tracking-[0.28em] text-white/30">RAAKA Playlist</div>
            <div className="space-y-1">
              {RAAKA_PLAYLIST.map((track, index) => (
                <button
                  key={track.src}
                  type="button"
                  onClick={() => {
                    setMusicIndex(index);
                    setMusicOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                    index === musicIndex ? "bg-white/[0.09] text-white" : "text-white/55 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <span className="text-orange-300/80">♪</span>
                  <span className="truncate text-[10px] font-medium uppercase tracking-[0.14em]">{track.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

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
              <div className="relative w-[min(84vw,560px)] md:w-[min(58vw,640px)]">
                <div className="pointer-events-none absolute -inset-x-10 -inset-y-8 rounded-full bg-orange-500/[0.045] blur-[55px]" />
                <div className="pointer-events-none absolute inset-x-4 bottom-0 h-10 rounded-full bg-black/70 blur-[22px]" />
                <img
                  src="/images/raaka-logo.png"
                  alt="RAAKA"
                  className="relative z-10 block h-auto w-full object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.95)] drop-shadow-[0_0_24px_rgba(255,130,20,0.10)]"
                />
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
              <div className="mt-7 -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
                {HERO_ACTIONS.map((action) => {
                  const accent = ACCENTS[action.accent];
                  return (
                    <a
                      key={action.title}
                      href={action.href}
                      className="group relative flex h-20 w-[78vw] shrink-0 snap-start items-center overflow-hidden rounded-xl border border-white/[0.13] bg-black/50 px-3.5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-black/65 sm:h-[86px] sm:w-auto sm:px-4"
                    >
                      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${accent.bg} via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                      <div className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${accent.glow} ${accent.text} md:h-12 md:w-12`}>
                        {action.icon}
                      </div>
                      <div className="relative z-10 ml-3 min-w-0 flex-1 md:ml-4">
                        <div className="flex min-w-0 items-center gap-2">
                          <p className="truncate text-[7px] font-medium uppercase tracking-[0.28em] text-white/35 md:text-[8px]">{action.eyebrow}</p>
                          {"isNew" in action && action.isNew && <NewBadge addedAt="2026-09-06" />}
                        </div>
                        <h3 className="mt-1 truncate text-[14px] font-semibold text-white md:text-[15px]">{action.title}</h3>
                      </div>
                      <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.14] text-sm text-white/40 transition-all group-hover:text-white md:h-9 md:w-9 ${accent.border}`}>
                        →
                      </div>
                      <span className={`absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-500 group-hover:w-full ${accent.bar}`} />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ============================== ABOUT / MOVIE ============================== */}
        <section className="raaka-about mx-auto max-w-7xl px-5 py-20 sm:px-6 md:px-8 md:py-28">
          <SectionHeading eyebrow="The Movie" title="About Raaka" />

          <div className="grid gap-10 md:grid-cols-[minmax(0,340px)_1fr] md:gap-16">
            <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 md:max-w-[340px]">
              <Image src="/images/RAAKAFL.jpg" alt="Raaka First Look" width={800} height={1200} className="h-full w-full object-cover" />
            </div>

            <div className="flex flex-col justify-center">
              <p className="max-w-xl text-lg leading-8 text-zinc-300">
                Welcome to the World of Raaka. This website brings together everything related to the movie in one place.
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
          <div className="mt-20 w-full md:mt-28">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/30 px-5 py-8 backdrop-blur-md md:px-10">
              <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.35em] text-white/50 md:text-sm">Releasing In</p>
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                {RELEASE_LANGUAGES.map((language, index) => (
                  <div key={language} className="flex items-center gap-2">
                    {index > 0 && <span className="hidden h-1 w-1 rounded-full bg-white/20 sm:block" />}
                    <span className="text-base font-semibold tracking-wide text-white/90 md:text-lg">{language}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============================== COUNTDOWN ============================== */}
        <section id="countdown" className="raaka-countdown-section relative mx-auto max-w-7xl overflow-hidden px-5 pb-24 pt-2 sm:px-6 md:px-8">
          <div className="relative min-h-[640px] overflow-hidden rounded-[2rem] border border-white/10 bg-black md:min-h-[780px]">
            <div className="absolute inset-0 overflow-hidden">
              <Image src="/images/raakabg2.jpg" alt="Raaka" fill priority className="raaka-countdown-photo object-cover object-center" />
            </div>
            <div className="absolute inset-0 bg-black/55" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-black/75" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90" />
            <div className="raaka-countdown-glow pointer-events-none absolute left-1/2 top-[45%] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-[120px]" />

            <div className="relative z-10 flex min-h-[640px] flex-col items-center justify-center px-5 py-16 text-center md:min-h-[780px]">
              <p className="mb-6 text-[10px] uppercase tracking-[0.55em] text-amber-100/70 md:mb-7 md:text-xs">The Countdown Begins</p>

              <div className="relative w-[240px] md:w-[500px]">
                <Image src="/images/logo2.png" alt="RAAKA" width={1200} height={350} priority className="h-auto w-full object-contain drop-shadow-[0_0_25px_rgba(255,180,70,0.25)]" />
              </div>

              <div className="mt-6 flex items-center justify-center gap-4 md:mt-7">
                <span className="h-px w-10 bg-amber-100/40 md:w-20" />
                <p className="text-sm uppercase tracking-[0.35em] text-amber-50/90 md:text-lg">coming soon</p>
                <span className="h-px w-10 bg-amber-100/40 md:w-20" />
              </div>

              <div className="mt-12 w-full max-w-5xl md:mt-20">
                <div className="grid grid-cols-4 gap-2 sm:gap-0">
                  {[
                    { label: "Days", value: timeLeft.days },
                    { label: "Hours", value: timeLeft.hours },
                    { label: "Minutes", value: timeLeft.minutes },
                    { label: "Seconds", value: timeLeft.seconds, glow: true },
                  ].map((unit) => (
                    <div
                      key={unit.label}
                      className={`relative px-2 py-5 sm:border sm:px-4 sm:py-7 md:px-8 md:py-10 ${
                        unit.glow ? "border-amber-100/20 bg-black/40" : "border-white/10 bg-black/35"
                      } backdrop-blur-sm`}
                    >
                      <p
                        className={`raaka-timer-number font-serif text-3xl font-black tracking-tight tabular-nums text-white sm:text-5xl md:text-8xl ${
                          unit.glow ? "drop-shadow-[0_4px_20px_rgba(255,180,70,0.35)]" : "drop-shadow-[0_4px_15px_rgba(0,0,0,0.8)]"
                        }`}
                      >
                        {String(unit.value).padStart(2, "0")}
                      </p>
                      <p className={`mt-2 text-[8px] uppercase tracking-[0.3em] sm:mt-3 sm:text-[9px] md:text-xs ${unit.glow ? "text-amber-100/70" : "text-amber-100/60"}`}>
                        {unit.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-12 flex items-center justify-center gap-4 md:mt-20">
                <span className="h-px w-8 bg-amber-100/30 md:w-16" />
                <p className="text-[10px] uppercase tracking-[0.45em] text-amber-50/80 md:text-sm">The Wait Is Almost Over</p>
                <span className="h-px w-8 bg-amber-100/30 md:w-16" />
              </div>
            </div>
          </div>
        </section>

        {/* ============================== CAST ============================== */}
        <section id="cast" data-design-section="cast" className="px-5 py-20 sm:px-6 md:px-10 md:py-24">
          <div className="mx-auto max-w-6xl">
            <SectionHeading eyebrow="The Cast" title="Cast & Characters" />
            <div className="grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-4">
              {CAST.map((person) => (
                <PersonCard key={person.name} {...person} size="large" />
              ))}
            </div>
          </div>
        </section>

        {/* ============================== CREW ============================== */}
        <section id="crew" data-design-section="crew" className="px-5 py-20 sm:px-6 md:px-10 md:py-24">
          <div className="mx-auto max-w-6xl">
            <SectionHeading eyebrow="Behind The World" title="Crew" />
            <div className="grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-4">
              {CREW.map((person) => (
                <PersonCard key={person.name} {...person} />
              ))}
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
                <VideoCard key={video.title} {...video} />
              ))}
            </div>
          </div>
        </section>

        {/* ============================== SONGS ============================== */}
        <section id="songs" className="px-5 py-20 sm:px-6 md:px-10 md:py-24">
          <div className="mx-auto max-w-6xl">
            <SectionHeading eyebrow="The Soundtrack" title="Songs" />
            <div className="grid gap-8 md:grid-cols-2">
              {SONG_VIDEOS.map((video) => (
                <VideoCard key={video.title} {...video} />
              ))}
            </div>
          </div>
        </section>

        {/* ============================== TICKETS CTA ============================== */}
        <section className="px-5 sm:px-6 md:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col items-center gap-6 rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center sm:flex-row sm:justify-between sm:text-left md:px-12">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Ready When You Are</p>
                <h3 className="mt-2 font-serif text-2xl font-semibold text-white md:text-3xl">Book Your Tickets</h3>
              </div>
              <div className="flex items-center gap-5">
                {TICKET_PARTNERS.map((partner) => (
                  <a
                    key={partner.name}
                    href={partner.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex w-[120px] flex-col items-center"
                    title={`Book Raaka on ${partner.name}`}
                  >
                    <div className="flex h-[68px] w-[120px] items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/30 p-2 transition duration-300 group-hover:scale-105 group-hover:border-white/25">
                      <Image src={partner.logo} alt={partner.name} width={partner.w} height={partner.h} className="h-auto w-full object-contain" />
                    </div>
                    <span className="mt-2 text-xs font-semibold text-white/80 group-hover:text-white">{partner.name}</span>
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
                <div key={label} className="p-7">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-amber-100/50">{label}</p>
                  <h3 className="mt-4 text-4xl font-black md:text-5xl">{value}</h3>
                  <p className="mt-3 text-[10px] uppercase tracking-[0.15em] text-white/30">Coming After Release</p>
                </div>
              ))}
            </div>

            <div className="mt-16">
              <p className="text-[10px] uppercase tracking-[0.45em] text-amber-100/50">Language Wise</p>
              <h3 className="mt-2 text-2xl font-bold md:text-3xl">Collection</h3>

              <div className="mt-6 divide-y divide-white/10 border-y border-white/10">
                {BOX_OFFICE_LANGS.map(([language, type]) => (
                  <div key={language} className="flex items-center justify-between gap-4 py-4">
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
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
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
        <section id="crew-credits" className="px-5 py-20 sm:px-6 md:px-10 md:py-24">
          <div className="mx-auto max-w-6xl">
            <SectionHeading eyebrow="Behind The Film" title="Crew Credits" />
            <div className="columns-1 gap-x-12 sm:columns-2 lg:columns-3">
              {CREW_CREDITS.map((group) => (
                <div key={group.department} className="mb-8 break-inside-avoid">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-300/70">{group.department}</h3>
                  <ul className="mt-3 space-y-1.5">
                    {group.names.map((name) => (
                      <li key={name} className="text-[15px] text-white/70">{name}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================== EXPLORE MORE ============================== */}
        <section id="explore" data-design-section="explore" className="mx-auto max-w-7xl px-5 py-20 sm:px-6 md:px-8 md:py-24">
          <SectionHeading eyebrow="More" title="Explore More" />
          <div className="grid gap-5 sm:grid-cols-3">
            {EXPLORE_CARDS.map((card) => (
              <div key={card.title} className="rounded-2xl border border-white/10 bg-zinc-900 p-8">
                <h3 className="text-xl font-bold">{card.title}</h3>
                <p className="mt-3 text-zinc-500">{card.copy}</p>
              </div>
            ))}
          </div>
        </section>

        {/* DISCLAIMER */}
        <div className="mx-auto mt-6 max-w-3xl border-t border-white/10 px-5 pt-5 text-center">
          <p className="text-[10px] leading-relaxed tracking-wide text-white/40 md:text-xs">
            This is an unofficial fan-made website and is not affiliated with Sun Pictures, Allu Arjun, Atlee Kumar,
            Deepika Padukone, or the official RAAKA movie team.
          </p>
        </div>

        {/* FOOTER */}
        <footer className="border-t border-white/10 py-10">
          <div className="mx-auto max-w-7xl px-5 text-center sm:px-6">
            <h2 className="font-serif text-2xl font-bold">WORLD OF RAAKA</h2>
            <p className="mt-2 text-sm text-zinc-500">Everything about Raaka in one place.</p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs uppercase tracking-[0.2em] text-white/40">
              <a href="/about" className="transition hover:text-white">About</a>
              <a href="/contact" className="transition hover:text-white">Contact</a>
              <a href="/privacy-policy" className="transition hover:text-white">Privacy Policy</a>
            </div>

            <p className="mt-6 text-[10px] tracking-[0.15em] text-white/20">
              © {new Date().getFullYear()} The World of RAAKA. Fan-created website.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
