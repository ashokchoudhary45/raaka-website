
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import NewBadge from "@/components/NewBadge";

type Theme = "obsidian" | "ember" | "cosmic" | "graphite" | "onyx";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [intro, setIntro] = useState(true);
  const [ticketsOpen, setTicketsOpen] = useState(false);

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

      // 5 seconds baad stop = audio ka 8th second
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
    audioRef.current = new Audio("/sounds/tick.mp3");
    audioRef.current.volume = 0.35;
  }, []);

  // ==============================
  // COUNTDOWN TIMER
  // ==============================
  useEffect(() => {
    const targetDate = new Date(
      "2028-01-26T00:00:00+05:30"
    ).getTime();

    // Website load hone ka exact time
    const startTime = Date.now();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
        return;
      }

      // ==================================
      // FIRST 10 SECONDS: NO TICK SOUND
      // ==================================
      if (
        Date.now() - startTime >= 10000 &&
        audioRef.current
      ) {
        audioRef.current.currentTime = 7;

        audioRef.current.play().catch(() => {});
      }

      setTimeLeft({
        days: Math.floor(
          difference / (1000 * 60 * 60 * 24)
        ),

        hours: Math.floor(
          (difference / (1000 * 60 * 60)) % 24
        ),

        minutes: Math.floor(
          (difference / (1000 * 60)) % 60
        ),

        seconds: Math.floor(
          (difference / 1000) % 60
        ),
      });
    };

    // Immediately calculate countdown
    updateCountdown();

    // Every 1 second
    const timer = setInterval(
      updateCountdown,
      1000
    );

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <>
        {/* =================================
            RAAKA CINEMATIC BACKGROUND
        ================================== */}

        <style>{`
          .raaka-theme-graphite .raaka-site {
            color: #f5f5f5;
          }
          .raaka-theme-graphite .raaka-site .text-white {
            color: #f5f5f5 !important;
          }
          .raaka-theme-graphite .raaka-site [class*="text-white/"] {
            color: rgba(245, 245, 245, 0.72) !important;
          }
          .raaka-theme-graphite .raaka-site .text-white\/40 { color: rgba(245,245,245,.58) !important; }
          .raaka-theme-graphite .raaka-site .text-white\/35 { color: rgba(245,245,245,.52) !important; }
          .raaka-theme-graphite .raaka-site .text-white\/30 { color: rgba(245,245,245,.46) !important; }
          .raaka-theme-graphite .raaka-site .text-white\/25 { color: rgba(245,245,245,.40) !important; }
          .raaka-theme-graphite .raaka-site .text-white\/20 { color: rgba(245,245,245,.34) !important; }
          .raaka-theme-graphite .raaka-site .text-white\/15 { color: rgba(245,245,245,.28) !important; }
          .raaka-theme-graphite .raaka-site .text-white\/10 { color: rgba(245,245,245,.22) !important; }
          .raaka-theme-graphite .raaka-site .border-white\/10 { border-color: rgba(255,255,255,.12) !important; }
          .raaka-theme-graphite .raaka-site .border-white\/\[0\.13\] { border-color: rgba(255,255,255,.14) !important; }
          .raaka-theme-graphite .raaka-site .border-white\/\[0\.14\] { border-color: rgba(255,255,255,.15) !important; }
          .raaka-theme-graphite .raaka-site .bg-black\/50 { background-color: rgba(0,0,0,.52) !important; }
          .raaka-theme-graphite .raaka-site .bg-black\/65 { background-color: rgba(0,0,0,.68) !important; }
        `}</style>

        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          {/* Main atmosphere */}
          <div
            className={`absolute inset-0 transition-all duration-1000 ${
              theme === "obsidian"
                ? "bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.045),transparent_42%)]"
                : theme === "ember"
                ? "bg-[radial-gradient(circle_at_50%_30%,rgba(255,80,15,0.12),transparent_45%)]"
                : "bg-[radial-gradient(circle_at_50%_25%,rgba(70,100,255,0.11),transparent_45%)]"
            }`}
          />

          {/* Upper cinematic glow */}
          <div
            className={`absolute left-1/2 top-[5%] h-[550px] w-[750px] -translate-x-1/2 rounded-full blur-[150px] transition-all duration-1000 ${
              theme === "obsidian"
                ? "bg-white/[0.018]"
                : theme === "ember"
                ? "bg-orange-600/[0.07]"
                : "bg-indigo-600/[0.07]"
            }`}
          />

          {/* Bottom atmosphere */}
          <div
            className={`absolute bottom-[-25%] left-1/2 h-[550px] w-[950px] -translate-x-1/2 rounded-full blur-[170px] transition-all duration-1000 ${
              theme === "obsidian"
                ? "bg-white/[0.012]"
                : theme === "ember"
                ? "bg-red-700/[0.04]"
                : "bg-blue-700/[0.04]"
            }`}
          />

          {/* Cinematic vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_25%,rgba(0,0,0,0.78)_100%)]" />
        </div>

      {/* ==================================
          RAAKA INTRO
          ================================== */}

      {intro && (
        <div className="fixed inset-0 z-[99999] bg-black flex items-center justify-center overflow-hidden">

          <div className="absolute w-[500px] h-[500px] rounded-full bg-orange-600/20 blur-[140px] animate-pulse" />

          <div className="relative flex flex-col items-center animate-raaka-intro">

            <img
              src="/images/logo2.png"
              alt="RAAKA"
              className="w-52 md:w-72 object-contain"
            />

            <div className="mt-6 w-24 h-[1px] bg-white/40 animate-pulse" />

            <p className="mt-4 text-[10px] md:text-xs tracking-[0.5em] text-white/50 uppercase">
              A New World Begins
            </p>

          </div>

        </div>
      )}
      {/* ==================================
          RAAKA BACKGROUND THEMES
          OBSIDIAN • EMBER • COSMIC
          ================================== */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black">

        {/* OBSIDIAN — pure black cinematic */}
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${
            theme === "obsidian" ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 bg-[#020202]" />
          <div className="absolute left-1/2 top-[8%] h-[620px] w-[900px] -translate-x-1/2 rounded-full bg-white/[0.025] blur-[150px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(255,255,255,0.045),transparent_42%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.18)_55%,rgba(0,0,0,0.92)_100%)]" />
        </div>

        {/* EMBER — RAAKA fire atmosphere */}
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${
            theme === "ember" ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 bg-cover bg-center animate-raaka-bg-1" style={{ backgroundImage: "url('/images/raakabg.jpg')" }} />
          <div className="absolute inset-0 bg-cover bg-center animate-raaka-bg-2" style={{ backgroundImage: "url('/images/raakabg1.jpg')" }} />
          <div className="absolute inset-0 bg-cover bg-center animate-raaka-bg-3" style={{ backgroundImage: "url('/images/raakabg2.jpg')" }} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_35%,rgba(255,76,0,0.16),transparent_48%)]" />
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/85" />
        </div>

        {/* COSMIC — deep space / divine warrior atmosphere */}
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${
            theme === "cosmic" ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 bg-[#02040b]" />
          <div className="absolute left-[18%] top-[8%] h-[520px] w-[520px] rounded-full bg-indigo-700/[0.10] blur-[150px]" />
          <div className="absolute right-[8%] top-[28%] h-[460px] w-[460px] rounded-full bg-violet-700/[0.08] blur-[145px]" />
          <div className="absolute bottom-[-12%] left-1/2 h-[520px] w-[850px] -translate-x-1/2 rounded-full bg-blue-700/[0.06] blur-[160px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(90,110,255,0.09),transparent_44%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(1,3,12,0.05),rgba(0,0,0,0.88))]" />
        </div>

        {/* GRAPHITE SILVER — PREMIUM DARK */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${theme === "graphite" ? "opacity-100" : "opacity-0"}`}>
          <div className="absolute inset-0 bg-[#111214]" />
          <div className="absolute left-[-10%] top-[-18%] h-[700px] w-[700px] rounded-full bg-white/[0.055] blur-[120px]" />
          <div className="absolute right-[-8%] top-[8%] h-[600px] w-[600px] rounded-full bg-zinc-400/[0.07] blur-[130px]" />
          <div className="absolute bottom-[-20%] left-1/2 h-[700px] w-[1100px] -translate-x-1/2 rounded-full bg-slate-300/[0.045] blur-[160px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(255,255,255,0.09),transparent_45%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.025),rgba(17,18,20,0.08)_45%,rgba(0,0,0,0.45)_100%)]" />
          <div className="absolute inset-0 opacity-[0.035] bg-[repeating-linear-gradient(115deg,transparent_0px,transparent_2px,rgba(255,255,255,0.18)_3px,transparent_4px)]" />
        </div>

        {/* ONYX GOLD — LUXURY BLACK + METALLIC GOLD */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${theme === "onyx" ? "opacity-100" : "opacity-0"}`}>
          <div className="absolute inset-0 bg-[#070706]" />
          <div className="absolute left-1/2 top-[-14%] h-[680px] w-[920px] -translate-x-1/2 rounded-full bg-amber-500/[0.06] blur-[155px]" />
          <div className="absolute left-[-8%] top-[34%] h-[500px] w-[500px] rounded-full bg-yellow-700/[0.04] blur-[145px]" />
          <div className="absolute right-[-5%] bottom-[5%] h-[520px] w-[520px] rounded-full bg-orange-600/[0.04] blur-[155px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(245,190,70,0.08),transparent_43%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_15%,rgba(255,214,120,0.02)_48%,transparent_70%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.22)_55%,rgba(0,0,0,0.97)_100%)]" />
        </div>

        {/* Universal cinematic vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_18%,rgba(0,0,0,0.72)_100%)]" />
      </div>

      {/* ==================================
          PREMIUM HEADER — NO HAMBURGER
          ================================== */}

      {/* ==================================
          BACKGROUND THEME SWITCHER
          ================================== */}
      <div className="fixed left-5 top-5 z-[90] md:left-7 md:top-6">
        <button
          type="button"
          onClick={() => setTheme((current) => {
            const order: Theme[] = ["obsidian", "ember", "cosmic", "graphite", "onyx"];
            const index = order.indexOf(current);
            return order[(index + 1) % order.length];
          })}
          className="group relative flex h-11 items-center gap-3 overflow-hidden rounded-full border border-white/15 bg-black/55 px-3.5 text-white/85 shadow-[0_12px_45px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-all duration-500 hover:border-white/35 hover:bg-black/75 md:px-4"
          aria-label={`Change visual aura. Current: ${theme}`}
          title="Change visual aura"
        >
          <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-white/[0.08] via-transparent to-orange-400/[0.08] opacity-70" />
          <span className="relative flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-white/[0.04] shadow-inner">
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
          <span className="relative hidden sm:block text-[9px] font-semibold uppercase tracking-[0.34em]">Aura</span>
          <span className="relative hidden sm:block h-3.5 w-px bg-white/15" />
          <span className="relative hidden sm:block text-[8px] uppercase tracking-[0.18em] text-white/40">{theme}</span>
          <span className="relative text-[11px] text-white/35 transition-transform duration-300 group-hover:translate-x-0.5">✦</span>
        </button>
      </div>

      {/* PREMIUM MENU BUTTON — TEXT BASED, NO 3-LINE ICON */}
      <div className="fixed right-5 top-5 z-[90] md:right-7 md:top-6">
        <button
          type="button"
          onClick={() => {
            setMenuOpen((value) => !value);
          }}
          className="group flex h-11 items-center gap-3 rounded-full border border-white/20 bg-black/65 px-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/90 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-white/40 hover:bg-white hover:text-black md:px-5"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <span>{menuOpen ? "Close" : "Menu"}</span>

          <span className="relative flex h-4 w-4 items-center justify-center overflow-hidden">
            <span
              className={`absolute text-sm leading-none transition-all duration-300 ${
                menuOpen
                  ? "translate-y-0 rotate-0 opacity-100"
                  : "-translate-y-3 opacity-0"
              }`}
            >
              ×
            </span>
            <span
              className={`absolute text-sm leading-none transition-all duration-300 ${
                menuOpen
                  ? "translate-y-3 opacity-0"
                  : "translate-y-0 opacity-100"
              }`}
            >
              →
            </span>
          </span>
        </button>
      </div>

      {/* MENU OVERLAY + PANEL */}
      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-[2px]"
          />

         <aside className="fixed right-4 top-[76px] z-[85] w-[calc(100vw-32px)] max-w-[380px] max-h-[calc(100vh-90px)] overflow-y-auto raaka-menu-scroll rounded-3xl border border-white/15 bg-black/90 p-3 shadow-[0_25px_80px_rgba(0,0,0,0.65)] backdrop-blur-2xl">
            <div className="border-b border-white/10 px-4 pb-4 pt-3">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.35em] text-white/35">
                    Explore
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">
                    RAAKA
                  </h2>
                </div>
                <p className="pb-1 text-[9px] uppercase tracking-[0.22em] text-white/25">
                  The World of RAAKA
                </p>
              </div>
            </div>

            <nav className="mt-2 space-y-1">
              <a
                href="#home"
                onClick={() => setMenuOpen(false)}
                className="group flex items-center justify-between rounded-2xl px-4 py-3.5 transition hover:bg-white/10"
              >
                <span className="text-sm font-medium">Home</span>
                <span className="text-white/25 transition group-hover:translate-x-1 group-hover:text-white/70">
                  →
                </span>
              </a>

              <a
                href="#cast"
                onClick={() => setMenuOpen(false)}
                className="group flex items-center justify-between rounded-2xl px-4 py-3.5 transition hover:bg-white/10"
              >
                <span className="text-sm font-medium">Cast & Crew</span>
                <span className="text-white/25 transition group-hover:translate-x-1 group-hover:text-white/70">
                  →
                </span>
              </a>

              <a
                href="#posters"
                onClick={() => setMenuOpen(false)}
                className="group flex items-center justify-between rounded-2xl px-4 py-3.5 transition hover:bg-white/10"
              >
                <span className="text-sm font-medium">Posters</span>
                <span className="text-white/25 transition group-hover:translate-x-1 group-hover:text-white/70">
                  →
                </span>
              </a>

              <a
                href="#announcements"
                onClick={() => setMenuOpen(false)}
                className="group flex items-center justify-between rounded-2xl px-4 py-3.5 transition hover:bg-white/10"
              >
                <span className="text-sm font-medium">Videos</span>
                <span className="text-white/25 transition group-hover:translate-x-1 group-hover:text-white/70">
                  →
                </span>
              </a>

              <a
                href="#songs"
                onClick={() => setMenuOpen(false)}
                className="group flex items-center justify-between rounded-2xl px-4 py-3.5 transition hover:bg-white/10"
              >
                <span className="text-sm font-medium">Songs</span>
                <span className="text-white/25 transition group-hover:translate-x-1 group-hover:text-white/70">
                  →
                </span>
              </a>

              <a
                href="/timeline"
                onClick={() => setMenuOpen(false)}
                className="group flex items-center justify-between rounded-2xl px-4 py-3.5 transition hover:bg-white/10"
              >
                <span className="flex items-center text-sm font-medium">
                  Timeline
                  <NewBadge addedAt="2026-09-06" />
                </span>
                <span className="text-white/25 transition group-hover:translate-x-1 group-hover:text-white/70">
                  →
                </span>
              </a>

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

                  <span
                    className={`text-white/40 transition-transform duration-300 ${
                      ticketsOpen ? "rotate-180" : ""
                    }`}
                  >
                    ⌄
                  </span>
                </button>

                {ticketsOpen && (
                  <div className="grid grid-cols-2 gap-3 px-4 pb-4 pt-1">
                    {/* BOOKMYSHOW */}
                    <a
                      href="https://in.bookmyshow.com/movies/raaka/ET00494565"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMenuOpen(false)}
                      className="group rounded-2xl border border-white/10 bg-white/[0.03] p-2 text-center transition hover:border-white/20 hover:bg-white/[0.07]"
                      title="Book Raaka on BookMyShow"
                    >
                      <div className="flex h-[54px] items-center justify-center overflow-hidden rounded-xl">
                        <Image
                          src="/images/logo1.jpg"
                          alt="BookMyShow"
                          width={321}
                          height={157}
                          className="h-auto max-h-full w-full object-contain transition duration-300 group-hover:scale-105"
                        />
                      </div>
                      <span className="mt-2 block text-xs font-semibold text-white/75 group-hover:text-white">
                        BookMyShow
                      </span>
                    </a>

                    {/* DISTRICT */}
                    <a
                      href="https://www.district.in/movies/raaka-movie-tickets-MV218847"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMenuOpen(false)}
                      className="group rounded-2xl border border-white/10 bg-white/[0.03] p-2 text-center transition hover:border-white/20 hover:bg-white/[0.07]"
                      title="Book Raaka on District"
                    >
                      <div className="flex h-[54px] items-center justify-center overflow-hidden rounded-xl">
                        <Image
                          src="/images/logo2.jpg"
                          alt="District"
                          width={715}
                          height={429}
                          className="h-auto max-h-full w-full object-contain transition duration-300 group-hover:scale-105"
                        />
                      </div>
                      <span className="mt-2 block text-xs font-semibold text-white/75 group-hover:text-white">
                        District
                      </span>
                    </a>
                  </div>
                )}
              </div>

            <a 
  href="/fan-circle" 
  onClick={() => setMenuOpen(false)} 
  className="group flex items-center justify-between rounded-2xl px-4 py-3.5 transition hover:bg-white/10" 
>
  <span className="text-sm font-medium">Fan Circle</span> 
  <span className="text-white/25 transition group-hover:translate-x-1 group-hover:text-white/70"> 
    → 
  </span> 
</a>

              <a
                href="/bookmyshow-tracker"
                onClick={() => setMenuOpen(false)}
                className="group flex items-center justify-between rounded-2xl px-4 py-3.5 transition hover:bg-white/10"
              >
                <span className="flex items-center text-sm font-medium">
                  BookMyShow Tracker
                  <NewBadge addedAt="2026-09-06" />
                </span>
                <span className="text-white/25 transition group-hover:translate-x-1 group-hover:text-white/70">
                  →
                </span>
              </a>
            </nav>
          </aside>
        </>
      )}

   <main
  id="home"
  className="raaka-site relative z-10 min-h-screen w-full max-w-full overflow-x-hidden bg-transparent text-white"
>
{/* HERO */}
<section className="raaka-hero relative h-screen min-h-[620px] overflow-hidden">

  <div className="relative z-10 flex h-full w-full items-center">

   <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-20 md:px-8 translate-y-8 md:translate-y-6">

      <div className="max-w-5xl">

    {/* =========================
    THE WORLD OF RAAKA
    ========================= */}

<div className="relative max-w-4xl">

  {/* Subtle cinematic atmosphere */}
  <div
    className="
      pointer-events-none
      absolute
      -left-20
      top-1/2
      -z-10
      h-56
      w-[620px]
      -translate-y-1/2
      rounded-full
      bg-orange-500/[0.055]
      blur-[100px]
    "
  />

  {/* =========================
      THE WORLD OF
      ========================= */}
  <div className="mb-4 flex items-center gap-3 md:mb-5 md:gap-4">

    <span
      className="
        h-px
        w-8
        bg-gradient-to-r
        from-transparent
        to-orange-400/75
        md:w-14
      "
    />

    <span
      className="
        text-[8px]
        font-medium
        uppercase
        tracking-[0.58em]
        text-white/50
        md:text-[10px]
      "
    >
      The World of
    </span>

    <span
      className="
        relative
        h-px
        w-8
        bg-gradient-to-l
        from-transparent
        to-orange-400/75
        md:w-14
      "
    >
      <span
        className="
          absolute
          -right-1
          -top-[2px]
          h-[5px]
          w-[5px]
          rounded-full
          bg-orange-400
          shadow-[0_0_12px_rgba(251,146,60,0.9)]
        "
      />
    </span>

  </div>


  {/* =========================
      RAAKA LOGO
      ========================= */}
  <div
    className="
      relative
      w-[min(82vw,560px)]
      md:w-[min(58vw,640px)]
    "
  >

    {/* Soft logo glow */}
    <div
      className="
        pointer-events-none
        absolute
        -inset-x-10
        -inset-y-8
        rounded-full
        bg-orange-500/[0.045]
        blur-[55px]
      "
    />

    {/* Deep logo shadow */}
    <div
      className="
        pointer-events-none
        absolute
        inset-x-4
        bottom-0
        h-10
        rounded-full
        bg-black/70
        blur-[22px]
      "
    />

    {/* Actual RAAKA logo */}
    <img
      src="/images/raaka-logo.png"
      alt="RAAKA"
      className="
        relative
        z-10
        block
        h-auto
        w-full
        object-contain
        drop-shadow-[0_10px_16px_rgba(0,0,0,0.95)]
        drop-shadow-[0_0_24px_rgba(255,130,20,0.10)]
      "
    />

  </div>

</div>


        {/* =========================
            ORANGE TITLE LINE
            ========================= */}
        <div className="mb-3 flex items-center md:mb-4">

          <span className="h-[3px] w-12 bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.85)] md:w-20" />

          <span className="mx-2 h-[7px] w-[7px] rotate-45 bg-orange-300 shadow-[0_0_14px_rgba(251,146,60,0.9)]" />

          <span className="h-px w-28 bg-gradient-to-r from-orange-400/70 via-orange-500/30 to-transparent md:w-52" />

        </div>


       {/* =========================
    TITLE SUBLINE
    ========================= */}

<div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 md:mb-4 md:gap-3">

  <span className="text-[7px] font-medium uppercase tracking-[0.32em] text-orange-300/70 md:text-[9px] md:tracking-[0.4em]">
    Born of Fire
  </span>

  <span className="h-1 w-1 shrink-0 rounded-full bg-orange-400/70" />

  <span className="text-[7px] font-medium uppercase tracking-[0.32em] text-white/35 md:text-[9px] md:tracking-[0.4em]">
    Forged by Sacrifice
  </span>

  <span className="h-1 w-1 shrink-0 rounded-full bg-white/20" />

  <span className="text-[7px] font-medium uppercase tracking-[0.32em] text-white/25 md:text-[9px] md:tracking-[0.4em]">
    Chosen by Destiny
  </span>

</div>


{/* =========================
    DESCRIPTION
    ========================= */}

<p
  className="
    max-w-[680px]
    text-[13px]
    font-normal
    leading-[1.65]
    text-white/60
    md:text-[15px]
    md:leading-6
  "
>
  Born of fire, shaped by the cosmos, and forged in sacrifice, a divine
  warrior rises to restore balance to a universe threatened by primordial
  chaos—before faith itself is extinguished.
</p>


{/* =========================
    ACTION CARDS
    ========================= */}

<div
  className="
    mt-5
    grid
    w-[calc(100%+24px)]
    max-w-[900px]
    grid-cols-1
    gap-2.5
    sm:grid-cols-2
    lg:grid-cols-3
    md:mt-6
    md:gap-3
    md:w-full
  "
>


  {/* =========================
      WATCH VIDEOS
      ========================= */}

  <a
    href="#videos"
    className="
      group
      relative
      flex
      h-[76px]
      w-[95%]
      min-w-0
      items-center
      overflow-hidden
      rounded-xl
      border
      border-white/[0.13]
      bg-black/50
      px-3
      backdrop-blur-xl
      transition-all
      duration-300
      hover:-translate-y-0.5
      hover:border-orange-400/50
      hover:bg-black/65
      md:h-[88px]
      md:px-4
    "
  >

    {/* Hover glow */}
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-orange-500/[0.08] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />


    {/* Icon */}
    <div
      className="
        relative
        z-10
        flex
        h-11
        w-11
        shrink-0
        items-center
        justify-center
        rounded-xl
        border
        border-orange-400/35
        bg-orange-500/[0.08]
        text-orange-300
        md:h-12
        md:w-12
      "
    >

      <svg
        className="ml-0.5 h-4 w-4 md:h-5 md:w-5"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M8 5.5v13l11-6.5z" />
      </svg>

    </div>


    {/* Text */}
    <div className="relative z-10 ml-3 min-w-0 flex-1 md:ml-4">

      <p className="truncate text-[7px] font-medium uppercase tracking-[0.28em] text-white/35 md:text-[8px]">
        Trailers & More
      </p>

      <h3 className="mt-1 truncate text-[14px] font-semibold text-white md:text-[15px]">
        Watch Videos
      </h3>

    </div>


    {/* Arrow */}
    <div
      className="
        relative
        z-10
        flex
        h-8
        w-8
        shrink-0
        items-center
        justify-center
        rounded-full
        border
        border-white/[0.14]
        text-sm
        text-white/40
        transition-all
        group-hover:border-orange-400/50
        group-hover:text-white
        md:h-9
        md:w-9
      "
    >
      →
    </div>


    {/* Bottom accent */}
    <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-orange-400 transition-all duration-500 group-hover:w-full" />

  </a>



  {/* =========================
      FAN ART
      ========================= */}

  <a
    href="/fans-art"
    className="
      group
      relative
      flex
      h-[76px]
      w-[95%]
      min-w-0
      items-center
      overflow-hidden
      rounded-xl
      border
      border-white/[0.13]
      bg-black/50
      px-3
      backdrop-blur-xl
      transition-all
      duration-300
      hover:-translate-y-0.5
      hover:border-purple-400/50
      hover:bg-black/65
      md:h-[88px]
      md:px-4
    "
  >

    {/* Hover glow */}
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-purple-500/[0.08] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />


    {/* Icon */}
    <div
      className="
        relative
        z-10
        flex
        h-11
        w-11
        shrink-0
        items-center
        justify-center
        rounded-xl
        border
        border-purple-400/35
        bg-purple-500/[0.08]
        text-purple-300
        md:h-12
        md:w-12
      "
    >

      <svg
        className="h-4 w-4 md:h-5 md:w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      >
        <path d="M12 3.5l2.4 5.1 5.6.8-4 4 1 5.6-5-2.7-5 2.7 1-5.6-4-4 5.6-.8z" />
      </svg>

    </div>


    {/* Text */}
    <div className="relative z-10 ml-3 min-w-0 flex-1 md:ml-4">

      <div className="flex min-w-0 items-center gap-2">

        <p className="truncate text-[7px] font-medium uppercase tracking-[0.28em] text-white/35 md:text-[8px]">
          Art by the Fans
        </p>

        <NewBadge addedAt="2026-09-06" />

      </div>

      <h3 className="mt-1 truncate text-[14px] font-semibold text-white md:text-[15px]">
        Fan Art
      </h3>

    </div>


    {/* Arrow */}
    <div
      className="
        relative
        z-10
        flex
        h-8
        w-8
        shrink-0
        items-center
        justify-center
        rounded-full
        border
        border-white/[0.14]
        text-sm
        text-white/40
        transition-all
        group-hover:border-purple-400/50
        group-hover:text-white
        md:h-9
        md:w-9
      "
    >
      →
    </div>


    {/* Bottom accent */}
    <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-purple-400 transition-all duration-500 group-hover:w-full" />

  </a>



  {/* =========================
      BOX OFFICE
      ========================= */}

  <a
    href="/box-office"
    className="
      group
      relative
      flex
      h-[76px]
      w-[95%]
      min-w-0
      items-center
      overflow-hidden
      rounded-xl
      border
      border-white/[0.13]
      bg-black/50
      px-3
      backdrop-blur-xl
      transition-all
      duration-300
      hover:-translate-y-0.5
      hover:border-yellow-400/50
      hover:bg-black/65
      md:h-[88px]
      md:px-4
    "
  >

    {/* Hover glow */}
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-yellow-500/[0.07] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />


    {/* Icon */}
    <div
      className="
        relative
        z-10
        flex
        h-11
        w-11
        shrink-0
        items-center
        justify-center
        rounded-xl
        border
        border-yellow-400/35
        bg-yellow-500/[0.08]
        text-yellow-300
        md:h-12
        md:w-12
      "
    >

      <svg
        className="h-4 w-4 md:h-5 md:w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M5 19V10" />
        <path d="M12 19V5" />
        <path d="M19 19v-7" />
      </svg>

    </div>


    {/* Text */}
    <div className="relative z-10 ml-3 min-w-0 flex-1 md:ml-4">

      <div className="flex min-w-0 items-center gap-2">

        <p className="truncate text-[7px] font-medium uppercase tracking-[0.28em] text-white/35 md:text-[8px]">
          Track the Numbers
        </p>

        <NewBadge addedAt="2026-09-06" />

      </div>

      <h3 className="mt-1 truncate text-[14px] font-semibold text-white md:text-[15px]">
        Box Office
      </h3>

    </div>


    {/* Arrow */}
    <div
      className="
        relative
        z-10
        flex
        h-8
        w-8
        shrink-0
        items-center
        justify-center
        rounded-full
        border
        border-white/[0.14]
        text-sm
        text-white/40
        transition-all
        group-hover:border-yellow-400/50
        group-hover:text-white
        md:h-9
        md:w-9
      "
    >
      →
    </div>


    {/* Bottom accent */}
    <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-yellow-400 transition-all duration-500 group-hover:w-full" />

  </a>

</div>

      

      </div>

    </div>

  </div>

</section>
{/* MOVIE */}
      <section className="raaka-about max-w-7xl mx-auto px-6 py-24">

        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
          The Movie
        </p>

        <h2 className="text-4xl md:text-5xl font-bold mt-3">
          About Raaka
        </h2>

        <div className="grid md:grid-cols-2 gap-12 mt-10">

          {/* Poster */}
          <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-900 border border-white/10">

            <Image
              src="/images/RAAKAFL.jpg"
              alt="Raaka First Look"
              width={800}
              height={1200}
              className="w-full h-full object-cover"
            />

          </div>


          {/* Movie Details */}
          <div className="flex flex-col justify-center">

            <p className="text-zinc-300 text-lg leading-8">
              Welcome to the World of Raaka. This website brings together
              everything related to the movie in one place.
            </p>


            {/* Movie Info */}
            <div className="grid grid-cols-2 gap-4 mt-10">

              {/* Language */}
              <div className="bg-zinc-900 rounded-xl p-5">

                <p className="text-zinc-500 text-sm">
                  Language
                </p>

                <p className="font-semibold mt-1">
                  Telugu
                </p>

              </div>


              {/* Genre */}
              <div className="bg-zinc-900 rounded-xl p-5">

                <p className="text-zinc-500 text-sm">
                  Genre
                </p>

                <p className="font-semibold mt-1">
                  
Sci-Fi
                </p>

              </div>


              {/* Director */}
              <div className="bg-zinc-900 rounded-xl p-5">

                <p className="text-zinc-500 text-sm">
                  Director
                </p>

                <p className="font-semibold mt-1">
                  Atlee Kumar
                </p>

              </div>


              {/* Release */}
              <div className="bg-zinc-900 rounded-xl p-5">

                <p className="text-zinc-500 text-sm">
                  Release
                </p>

                <p className="font-semibold mt-1">
                  coming soon
                </p>

              </div>

            </div>

          </div>

        </div>
       <div className="mt-40 mb-24 w-full">
  <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/30 px-5 py-7 backdrop-blur-md md:px-10 md:py-9">

    <div className="mb-7 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50 md:text-sm">
        Releasing In
      </p>
    </div>

    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
      {[
        "Telugu",
        "Hindi",
        "Tamil",
        "Kannada",
        "Malayalam",
        "Bengali",
        "Arabic",
        "English",
      ].map((language, index) => (
        <div
          key={language}
          className="group flex min-h-[90px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-3 text-center transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08]"
        >
          <div>
            <span className="mb-1 block text-[9px] uppercase tracking-[0.25em] text-white/30">
              {String(index + 1).padStart(2, "0")}
            </span>

            <span className="text-base font-semibold tracking-wide text-white/90 md:text-base">
              {language}
            </span>
          </div>
        </div>
      ))}
    </div>

  </div>
</div>
      </section>
  {/* RELEASE COUNTDOWN */}
<section
  id="countdown"
  className="raaka-countdown-section relative max-w-7xl mx-auto px-6 pt-2 pb-28 overflow-hidden"
>
  <div className="relative min-h-[720px] md:min-h-[780px] overflow-hidden rounded-[2rem] border border-white/10 bg-black">

    {/* ANIMATED RAAKA PHOTO */}
    <div className="absolute inset-0 overflow-hidden">
      <Image
        src="/images/raakabg2.jpg"
        alt="Raaka"
        fill
        priority
        className="raaka-countdown-photo object-cover object-center"
      />
    </div>

    {/* DARK CINEMATIC OVERLAY */}
    <div className="absolute inset-0 bg-black/55" />

    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-black/75" />

    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90" />

    {/* GOLD ATMOSPHERIC GLOW */}
    <div className="raaka-countdown-glow pointer-events-none absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 h-[420px] w-[420px] rounded-full bg-amber-500/10 blur-[120px]" />

    {/* CONTENT */}
    <div className="relative z-10 flex min-h-[720px] md:min-h-[780px] flex-col items-center justify-center px-5 py-16 text-center">

      {/* TOP TEXT */}
      <p className="mb-7 text-[10px] md:text-xs uppercase tracking-[0.55em] text-amber-100/70">
        The Countdown Begins
      </p>

      {/* OFFICIAL RAAKA LOGO */}
      <div className="relative w-[280px] md:w-[500px]">
        <Image
          src="/images/logo2.png"
          alt="RAAKA"
          width={1200}
          height={350}
          priority
          className="h-auto w-full object-contain drop-shadow-[0_0_25px_rgba(255,180,70,0.25)]"
        />
      </div>

      {/* RELEASE DATE */}
      <div className="mt-7 flex items-center justify-center gap-4">
        <span className="h-px w-10 md:w-20 bg-amber-100/40" />

        <p className="text-sm md:text-lg uppercase tracking-[0.35em] text-amber-50/90">
          coming soon
        </p>

        <span className="h-px w-10 md:w-20 bg-amber-100/40" />
      </div>

      {/* COUNTDOWN */}
      <div className="mt-14 md:mt-20 w-full max-w-5xl">

        <div className="grid grid-cols-2 md:grid-cols-4">

          {/* DAYS */}
          <div className="relative px-4 py-7 md:px-8 md:py-10 border border-white/10 bg-black/35 backdrop-blur-sm">
            <p className="raaka-timer-number text-5xl sm:text-6xl md:text-8xl font-black tracking-tight tabular-nums text-white drop-shadow-[0_4px_15px_rgba(0,0,0,0.8)]">
              -
            </p>

            <p className="mt-3 text-[9px] md:text-xs uppercase tracking-[0.4em] text-amber-100/60">
              Days
            </p>
          </div>

          {/* HOURS */}
          <div className="relative px-4 py-7 md:px-8 md:py-10 border border-white/10 bg-black/35 backdrop-blur-sm">
            <p className="raaka-timer-number text-5xl sm:text-6xl md:text-8xl font-black tracking-tight tabular-nums text-white drop-shadow-[0_4px_15px_rgba(0,0,0,0.8)]">
              -
            </p>

            <p className="mt-3 text-[9px] md:text-xs uppercase tracking-[0.4em] text-amber-100/60">
              Hours
            </p>
          </div>

          {/* MINUTES */}
          <div className="relative px-4 py-7 md:px-8 md:py-10 border border-white/10 bg-black/35 backdrop-blur-sm">
            <p className="raaka-timer-number text-5xl sm:text-6xl md:text-8xl font-black tracking-tight tabular-nums text-white drop-shadow-[0_4px_15px_rgba(0,0,0,0.8)]">
              -
            </p>

            <p className="mt-3 text-[9px] md:text-xs uppercase tracking-[0.4em] text-amber-100/60">
              Minutes
            </p>
          </div>

          {/* SECONDS */}
          <div className="relative px-4 py-7 md:px-8 md:py-10 border border-amber-100/20 bg-black/40 backdrop-blur-sm">
            <p className="raaka-timer-number text-5xl sm:text-6xl md:text-8xl font-black tracking-tight tabular-nums text-white drop-shadow-[0_4px_20px_rgba(255,180,70,0.35)]">
              -
            </p>
            <p className="mt-3 text-[9px] md:text-xs uppercase tracking-[0.4em] text-amber-100/70">
              Seconds
            </p>
          </div>

        </div>
      </div>

      {/* BOTTOM TEXT */}
      <div className="mt-14 md:mt-20 flex items-center justify-center gap-4">
        <span className="h-px w-8 md:w-16 bg-amber-100/30" />

        <p className="text-[10px] md:text-sm uppercase tracking-[0.45em] text-amber-50/80">
          The Wait Is Almost Over
        </p>

        <span className="h-px w-8 md:w-16 bg-amber-100/30" />
      </div>

    </div>
  </div>
</section>
      {/* CAST */}
      <section
        id="cast"
        data-design-section="cast"
        className="px-6 md:px-10 py-24"
      >

        <div className="max-w-6xl mx-auto">

          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-4">
            The Cast
          </p>

          <h2 className="text-4xl md:text-5xl font-bold mb-12">
            Cast & Characters
          </h2>


          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

           {/* Allu Arjun */}
<a
  href="/allu-arjun"
  className="group block"
>

  <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-900 border border-white/10">

    <Image
      src="/images/actor3.jpg"
      alt="Allu Arjun"
      width={600}
      height={800}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
    />

  </div>

  <h3 className="text-lg font-semibold mt-4">
    Allu Arjun
  </h3>

</a>

            {/* Deepika Padukone */}
            <div className="group">

              <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-900 border border-white/10">

                <Image
                  src="/images/actor2.jpg"
                  alt="Deepika Padukone"
                  width={600}
                  height={800}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

              </div>

              <h3 className="text-lg font-semibold mt-4">
                Deepika Padukone
              </h3>

            </div>

          </div>

        </div>

      </section>


      {/* CREW */}
      <section id="crew" data-design-section="crew" className="px-6 md:px-10 py-24">

        <div className="max-w-6xl mx-auto">

          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-4">
            Behind The World
          </p>

          <h2 className="text-4xl md:text-5xl font-bold mb-12">
            Crew
          </h2>


          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

            {/* Atlee Kumar */}
            <div className="group">

              <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-900 border border-white/10">

                <Image
                  src="/images/crew1.jpg"
                  alt="Atlee Kumar"
                  width={600}
                  height={800}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

              </div>

              <h3 className="text-xl md:text-2xl font-semibold mt-4">
                Atlee Kumar
              </h3>

              <p className="text-zinc-400 text-lg mt-1">
                Director
              </p>

            </div>


            {/* Sai Abhyankkar */}
            <div className="group">

              <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-900 border border-white/10">

                <Image
                  src="/images/crew2.jpg"
                  alt="Sai Abhyankar"
                  width={600}
                  height={800}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

              </div>

              <h3 className="text-xl md:text-2xl font-semibold mt-4">
                Sai Abhyankkar
              </h3>

              <p className="text-zinc-400 text-lg mt-1">
                Musician
              </p>

            </div>


            {/* Kalanithi Maran */}
            <div className="group">

              <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-900 border border-white/10">

                <Image
                  src="/images/crew3.jpg"
                  alt="Kalanithi Maran"
                  width={600}
                  height={800}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

              </div>

              <h3 className="text-xl md:text-2xl font-semibold mt-4">
                Kalanithi Maran
              </h3>

              <p className="text-zinc-400 text-lg mt-1">
                Producer
              </p>

            </div>


            {/* Sun Pictures */}
            <div className="group">

              <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-900 border border-white/10">

                <Image
                  src="/images/crew4.jpg"
                  alt="Sun Picture"
                  width={600}
                  height={800}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

              </div>

              <h3 className="text-xl md:text-2xl font-semibold mt-4">
                Sun Pictures
              </h3>

              <p className="text-zinc-400 text-lg mt-1">
                Producer
              </p>

            </div>

          </div>

        </div>

      </section>
      {/* CREATIVE TEAM */}
<section
  id="creative-team"
  className="px-6 md:px-10 py-24"
>
  <div className="max-w-6xl mx-auto">

    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-4">
      Behind The Film
    </p>

    <h2 className="text-4xl md:text-5xl font-bold mb-4">
      Creative Team
    </h2>

    <p className="text-zinc-400 max-w-2xl mb-12">
      The creative minds shaping the world and visual language of RAAKA.
    </p>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

      {/* Cinematographer */}
      <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition duration-300 hover:bg-white/[0.07] hover:border-white/20">
        <p className="text-xs uppercase tracking-[0.25em] text-zinc-500 mb-6">
          Cinematographer
        </p>

        <h3 className="text-2xl font-semibold">
          G.K. Vishnu
        </h3>

        <p className="text-sm text-zinc-500 mt-3">
          Director of Photography
        </p>
      </div>


      {/* Editor */}
      <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition duration-300 hover:bg-white/[0.07] hover:border-white/20">
        <p className="text-xs uppercase tracking-[0.25em] text-zinc-500 mb-6">
          Editor
        </p>

        <h3 className="text-2xl font-semibold">
          Antony L. Ruben
        </h3>

        <p className="text-sm text-zinc-500 mt-3">
          Film Editor
        </p>
      </div>


      {/* Production Designer */}
      <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition duration-300 hover:bg-white/[0.07] hover:border-white/20">
        <p className="text-xs uppercase tracking-[0.25em] text-zinc-500 mb-6">
          Production Designer
        </p>

        <h3 className="text-2xl font-semibold">
          Muthuraj
        </h3>

        <p className="text-sm text-zinc-500 mt-3">
          Production Design
        </p>
      </div>

    </div>
  </div>
</section>
{/* VFX & SPECIAL EFFECTS STUDIOS */}
<section
  id="vfx-studios"
  className="px-6 md:px-10 py-24"
>
  <div className="max-w-6xl mx-auto">

    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-4">
      Visual Effects & Special Effects
    </p>

    <h2 className="text-4xl md:text-5xl font-bold mb-4">
      VFX Studios
    </h2>

    <p className="text-zinc-400 max-w-2xl mb-12">
      The visual effects and special effects studios behind the world of RAAKA.
    </p>

    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">

      {/* Lola VFX */}
      <a
        href="https://lolavfx.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="group"
      >
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden flex items-center justify-center p-1 transition duration-300 hover:bg-white/[0.07] hover:border-white/20">
          <img
            src="/images/logo10.png"
            alt="Lola VFX"
            className="w-full h-auto object-contain transition duration-300 group-hover:scale-105"
          />
        </div>

        <h3 className="mt-4 text-lg font-semibold">
          Lola VFX
        </h3>

        <p className="text-sm text-zinc-500 mt-1">
          Los Angeles
        </p>
      </a>


      {/* Spectral Motion */}
      <a
        href="https://www.spectralmotion.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="group"
      >
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden flex items-center justify-center p-1 transition duration-300 hover:bg-white/[0.07] hover:border-white/20">
          <img
            src="/images/logo11.jpg"
            alt="Spectral Motion"
            className="w-full h-auto object-contain transition duration-300 group-hover:scale-105"
          />
        </div>

        <h3 className="mt-4 text-lg font-semibold">
          Spectral Motion
        </h3>

        <p className="text-sm text-zinc-500 mt-1">
          Los Angeles
        </p>
      </a>


      {/* Fractured FX */}
      <a
        href="https://www.fracturedfx.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="group"
      >
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden flex items-center justify-center p-1 transition duration-300 hover:bg-white/[0.07] hover:border-white/20">
          <img
            src="/images/logo12.jpg"
            alt="Fractured FX"
            className="w-full h-auto object-contain transition duration-300 group-hover:scale-105"
          />
        </div>

        <h3 className="mt-4 text-lg font-semibold">
          Fractured FX
        </h3>

        <p className="text-sm text-zinc-500 mt-1">
          Special Makeup Effects
        </p>
      </a>


      {/* ILM Technoprops */}
      <a
        href="https://www.ilm.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="group"
      >
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden flex items-center justify-center p-1 transition duration-300 hover:bg-white/[0.07] hover:border-white/20">
          <img
            src="/images/logo13.jpg"
            alt="ILM Technoprops"
            className="w-full h-auto object-contain transition duration-300 group-hover:scale-105"
          />
        </div>

        <h3 className="mt-4 text-lg font-semibold">
          ILM Technoprops
        </h3>

        <p className="text-sm text-zinc-500 mt-1">
          Industrial Light & Magic
        </p>
      </a>


      {/* IronHead Studio */}
      <a
        href="https://ironheadstudio.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="group">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden flex items-center justify-center p-1 transition duration-300 hover:bg-white/[0.07] hover:border-white/20">
          <img
            src="/images/logo14.jpg"
            alt="IronHead Studio"
            className="w-full h-auto object-contain transition duration-300 group-hover:scale-105"
          />
        </div>

        <h3 className="mt-4 text-lg font-semibold">
          IronHead Studio
        </h3>

        <p className="text-sm text-zinc-500 mt-1">
          Costume & Creature Design
        </p>
      </a>


      {/* Legacy Effects */}
      <a
        href="https://www.legacyefx.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="group"
      >
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden flex items-center justify-center p-1 transition duration-300 hover:bg-white/[0.07] hover:border-white/20">
          <img
            src="/images/logo15.jpg"
            alt="Legacy Effects"
            className="w-full h-auto object-contain transition duration-300 group-hover:scale-105"
          />
        </div>

        <h3 className="mt-4 text-lg font-semibold">
          Legacy Effects
        </h3>

        <p className="text-sm text-zinc-500 mt-1">
          Practical FX
        </p>
      </a>

    </div>
  </div>
</section>


     {/* ANNOUNCEMENT VIDEOS */}
<section
  id="announcements"
  className="px-6 md:px-10 py-24"
>
  <div className="max-w-6xl mx-auto">

    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-4">
      Announcements
    </p>

    <h2 className="text-4xl md:text-5xl font-bold mb-12">
      Latest Announcements
    </h2>

    <div className="grid md:grid-cols-2 gap-8">

      {/* GEAR UP for RAAKA */}
      <div>

        <div className="aspect-video overflow-hidden rounded-2xl bg-zinc-900 border border-white/10">

          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/SI_PhNII7Mc"
            title="GEAR UP for RAAKA"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />

        </div>

        <h3 className="text-xl md:text-2xl font-semibold mt-5">
          GEAR UP for RAAKA
        </h3>

        <p className="text-zinc-400 mt-1">
          Announcement
        </p>

      </div>


      {/* Welcome on board Deepika Padukone */}
      <div>

        <div className="aspect-video overflow-hidden rounded-2xl bg-zinc-900 border border-white/10">

          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/jlmT4apm1oI"
            title="Welcome on board Deepika Padukone"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />

        </div>

        <h3 className="text-xl md:text-2xl font-semibold mt-5">
          Welcome on board Deepika Padukone
        </h3>

        <p className="text-zinc-400 mt-1">
          Announcement
        </p>

      </div>

    </div>

  </div>
</section>


{/* SONGS */}
<section
  id="songs"
  className="px-6 md:px-10 py-24"
>
  <div className="max-w-6xl mx-auto">

    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-4">
      The Soundtrack
    </p>

    <h2 className="text-4xl md:text-5xl font-bold mb-12">
      Songs
    </h2>

    <div className="grid md:grid-cols-2 gap-8">

      {/* Make Way For The King */}
      <div>

        <div className="aspect-video overflow-hidden rounded-2xl bg-zinc-900 border border-white/10">

          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/3UKmHZOGon4"
            title="Make Way For The King"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />

        </div>

        <h3 className="text-xl md:text-2xl font-semibold mt-5">
          Make Way For The King
        </h3>

        <p className="text-zinc-400 mt-1">
          Song
        </p>

      </div>

    </div>

  </div>
</section>


  {/* TICKET BOOKING */}
<div className="mt-4 border-t border-white/15 pt-5">
  <p className="px-24 mb-4 text-base uppercase tracking-[0.25em] text-zinc-500">
    Book Tickets
  </p>

  <div className="flex items-start gap-7 px-24">
    {/* BOOKMYSHOW */}
    <a
      href="https://in.bookmyshow.com/movies/raaka/ET00494565"
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => setMenuOpen(false)}
      className="group flex w-[135px] flex-col items-center"
      title="Book Raaka on BookMyShow"
    >
      <div className="flex h-[80px] w-[135px] items-center justify-center overflow-hidden rounded-xl transition duration-300 group-hover:scale-105">
        <Image
          src="/images/logo1.jpg"
          alt="BookMyShow"
          width={321}
          height={157}
          className="h-auto w-full object-contain"
        />
      </div>

      <span className="mt-2 text-xs font-semibold text-white/80 group-hover:text-white">
        BookMyShow
      </span>
    </a>

    {/* DISTRICT */}
    <a
      href="https://www.district.in/movies/raaka-movie-tickets-MV218847"
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => setMenuOpen(false)}
      className="group flex w-[135px] flex-col items-center"
      title="Book Raaka on District"
    >
      <div className="flex h-[80px] w-[135px] items-center justify-center overflow-hidden rounded-xl transition duration-300 group-hover:scale-105">
        <Image
          src="/images/logo2.jpg"
          alt="District"
          width={715}
          height={429}
          className="h-auto w-full object-contain"
        />
      </div>

      <span className="mt-2 text-xs font-semibold text-white/80 group-hover:text-white">
        District
      </span>
    </a>
  </div>
</div>

{/* BOX OFFICE COLLECTION */}
<section
  id="box-office"
  className="relative mt-40 overflow-hidden px-5 py-24 md:px-10 md:py-32"
  >
  {/* Background Glow */}
  <div className="pointer-events-none absolute inset-0">
    <div className="absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-amber-500/10 blur-[130px]" />
    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black/95" />
  </div>

  <div className="relative z-10 mx-auto max-w-7xl">

    {/* HEADING */}
    <div className="mb-12 text-center">
      <p className="mb-3 text-[10px] uppercase tracking-[0.55em] text-amber-100/60 md:text-xs">
        Theatrical Performance
      </p>

      <h2 className="text-4xl font-black uppercase tracking-tight md:text-6xl">
        Box Office Collection
      </h2>

      <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/50 md:text-base">
        Raaka box office collections will be updated after the theatrical
        release.
      </p>
    </div>

    {/* MAIN COLLECTION */}
    <div className="grid gap-4 md:grid-cols-3">

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl">
        <p className="text-[10px] uppercase tracking-[0.3em] text-amber-100/50">
          Worldwide Gross
        </p>

        <h3 className="mt-4 text-4xl font-black md:text-5xl">
          ₹ TBA
        </h3>

        <p className="mt-3 text-[10px] uppercase tracking-[0.15em] text-white/30">
          Coming After Release
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl">
        <p className="text-[10px] uppercase tracking-[0.3em] text-amber-100/50">
          India Gross
        </p>

        <h3 className="mt-4 text-4xl font-black md:text-5xl">
          ₹ TBA
        </h3>

        <p className="mt-3 text-[10px] uppercase tracking-[0.15em] text-white/30">
          Coming After Release
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl">
        <p className="text-[10px] uppercase tracking-[0.3em] text-amber-100/50">
          Overseas Gross
        </p>

        <h3 className="mt-4 text-4xl font-black md:text-5xl">
          ₹ TBA
        </h3>

        <p className="mt-3 text-[10px] uppercase tracking-[0.15em] text-white/30">
          Coming After Release
        </p>
      </div>

    </div>

    {/* LANGUAGE WISE */}
    <div className="mt-16">

      <div className="mb-7">
        <p className="text-[10px] uppercase tracking-[0.45em] text-amber-100/50">
          Language Wise
        </p>

        <h3 className="mt-2 text-2xl font-bold md:text-3xl">
          Collection
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">

        {[
          ["Telugu", "Original"],
          ["Hindi", "Dubbed"],
          ["Tamil", "Dubbed"],
          ["Kannada", "Dubbed"],
          ["Malayalam", "Dubbed"],
        ].map(([language, type]) => (
          <div
            key={language}
            className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-amber-400/30"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-white">
                {language}
              </span>

              <span className="text-[8px] uppercase tracking-[0.15em] text-amber-100/40">
                {type}
              </span>
            </div>

            <div className="mt-7 text-2xl font-black md:text-3xl">
              ₹ TBA
            </div>

            <p className="mt-2 text-[9px] uppercase tracking-[0.2em] text-white/30">
              Gross Collection
            </p>
          </div>
        ))}

      </div>

    </div>

    {/* OTHER COLLECTION STATS */}
    <div className="mt-14 grid gap-4 md:grid-cols-4">

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-[9px] uppercase tracking-[0.25em] text-white/35">
          Opening Day
        </p>
        <h4 className="mt-3 text-2xl font-black">
          ₹ TBA
        </h4>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-[9px] uppercase tracking-[0.25em] text-white/35">
          First Weekend
        </p>
        <h4 className="mt-3 text-2xl font-black">
          ₹ TBA
        </h4>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-[9px] uppercase tracking-[0.25em] text-white/35">
          India Net
        </p>
        <h4 className="mt-3 text-2xl font-black">
          ₹ TBA
        </h4>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-[9px] uppercase tracking-[0.25em] text-white/35">
          Highest Day
        </p>
        <h4 className="mt-3 text-2xl font-black">
          ₹ TBA
        </h4>
      </div>

    </div>

    {/* NOTE */}
    <p className="mt-8 text-center text-[9px] uppercase tracking-[0.18em] text-white/25 md:text-xs">
      Collection figures will be updated as official box office data becomes available.
    </p>

  </div>
</section>

{/* CREW CREDITS */}
<section
  id="crew-credits"
  className="px-6 md:px-10 py-24"
>
  <div className="max-w-6xl mx-auto">

    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 mb-4">
      Behind The Film
    </p>

    <h2 className="text-4xl md:text-5xl font-bold mb-12">
      Crew Credits
    </h2>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
      {/* CAST */}
<h3 className="col-span-full text-xl font-semibold mt-6 mb-2">
  Cast
</h3>

<p>Allu Arjun</p>
<p>Deepika Padukone</p>
{/* MUSICIAN */}
<h3 className="col-span-full text-xl font-semibold mt-6 mb-2">
  Musician
</h3>

<p>Sai Abhyankar</p>

      {/* Cinematography */}
      <h3 className="col-span-full text-xl font-semibold mt-4 mb-2">
        Cinematography
      </h3>
      <p>G.K. Vishnu</p>

      {/* Editor */}
      <h3 className="col-span-full text-xl font-semibold mt-6 mb-2">
        Editor
      </h3>
      <p>Antony L. Ruben</p>

      {/* Production Designer */}
      <h3 className="col-span-full text-xl font-semibold mt-6 mb-2">
        Production Designer
      </h3>
      <p>Muthuraj</p>

      {/* Costume Design */}
      <h3 className="col-span-full text-xl font-semibold mt-6 mb-2">
        Costume Design
      </h3>
      <p>Sharon Gilham</p>
      <p>Dipika Lal</p>
      <p>Louise Mingenbach</p>
      <p>Anirudh Singh</p>

      {/* Makeup Department */}
      <h3 className="col-span-full text-xl font-semibold mt-6 mb-2">
        Makeup Department
      </h3>
      <p>Gabriel Georgiou</p>
      <p>Shalu Mishra</p>
      <p>Kieran Smith</p>

      {/* Production Management */}
      <h3 className="col-span-full text-xl font-semibold mt-6 mb-2">
        Production Management
      </h3>
      <p>Aakash Chandresh Dave</p>
      <p>Dhruv Ganeshpure</p>
      <p>Tulika Sikder</p>

      {/* Second Unit / Assistant Director */}
      <h3 className="col-span-full text-xl font-semibold mt-6 mb-2">
        Second Unit / Assistant Director
      </h3>
      <p>Aryaveer Thakkarr</p>

      {/* Art Department */}
      <h3 className="col-span-full text-xl font-semibold mt-6 mb-2">
        Art Department
      </h3>
      <p>Chrispin Chacko</p>
      <p>Aniket Mitra</p>
      <p>Abhay K Patidar</p>

      {/* Sound Department */}
      <h3 className="col-span-full text-xl font-semibold mt-6 mb-2">
        Sound Department
      </h3>
      <p>Arun Alphonse</p>
      <p>Sampath Alwar</p>
      <p>Vijay Dharme</p>
      <p>Bhushan Hegde</p>

      {/* Special Effects */}
      <h3 className="col-span-full text-xl font-semibold mt-6 mb-2">
        Special Effects
      </h3>
      <p>Lallan Gupta</p>
      <p>Sahil Gupta</p>
      <p>Gagan Kohli</p>
      <p>Lindsay Macgowan</p>
      <p>J. Alan Scott</p>
      <p>Vishal Tyagi</p>
      <p>Alyssa Yule</p>

      {/* Visual Effects */}
      <h3 className="col-span-full text-xl font-semibold mt-6 mb-2">
        Visual Effects
      </h3>
      <p>Demian Gordon</p>
      <p>Staffan Linder</p>
      <p>Neel Madhu</p>
      <p>Sibi Naayagam</p>
      <p>Santosh Raju</p>
      <p>K.V. Sanjit</p>
      <p>Rabindra Sasmal</p>
      <p>Nilesh Tare</p>
      <p>Arjun Tyagi</p>

      {/* Stunts */}
      <h3 className="col-span-full text-xl font-semibold mt-6 mb-2">
        Stunts
      </h3>
      <p>Brandon Belieu</p>
      <p>Yannick Ben</p>
      <p>Felix Betancourt</p>
      <p>Narayane Cabral</p>
      <p>Micaiah Chau</p>
      <p>Alvin Chon</p>
      <p>Jenna Culotta</p>
      <p>Melroy Dsilva</p>
      <p>Sébastien Dugast</p>
      <p>Bravin Robert Fonseca</p>
      <p>Andy Gill</p>
      <p>Maxwell Heavenrich</p>
      <p>Caitlin Hutson</p>
      <p>Daniel Jackson</p>
      <p>Micah Kerns</p>
      <p>Ashley Kim</p>
      <p>Henry Kingi Jr.</p>
      <p>Simphiwe Kunene</p>
      <p>Michael Lehr</p>
      <p>Joshua Mabie</p>
      <p>Javier Macias</p>
      <p>Isabella Miller</p>
      <p>Pingl Moll</p>
      <p>Nathan People</p>
      <p>Joe Perez</p>
      <p>J.J. Perry</p>
      <p>Bradley Price</p>
      <p>Raimundo Queirdo</p>
      <p>Jerry Quill</p>
      <p>Jeweliana Ramos-Ortiz</p>
      <p>Spiro Razatos</p>
      <p>Vlad Rimburg</p>
      <p>Sunil Rodrigues</p>
      <p>Stephano Rodriguez</p>{/* Camera & Electrical */}
      <h3 className="col-span-full text-xl font-semibold mt-6 mb-2">
        Camera & Electrical Department
      </h3>
      <p>Palraj Ambedkar</p>
      <p>Ravendra Singh Bhadauria</p>
      <p>Harkirath Bhui</p>
      <p>Matteo Corrinth</p>
      <p>Ankush Mandal</p>
      <p>Raaka</p>
      <p>Annareddygari Arun Kumar Reddy</p>
      <p>Suraj Sharma</p>
      <p>Sagar Singh</p>

      {/* Costume & Wardrobe */}
      <h3 className="col-span-full text-xl font-semibold mt-6 mb-2">
        Costume & Wardrobe Department
      </h3>
      <p>Sharveri Dandekar</p>
      <p>Anna Divekar</p>
      <p>Rob Goodwin</p>
      <p>Unnatee Karia</p>
      <p>Emma Pallett</p>
      <p>Sydney Conrad Shapiro</p>

      {/* Music */}
      <h3 className="col-span-full text-xl font-semibold mt-6 mb-2">
        Music Department
      </h3>
      <p>Daniel D'Mello Goodwin</p>
      <p>Pandit Shravan Mishra</p>

      {/* Choreography */}
      <h3 className="col-span-full text-xl font-semibold mt-6 mb-2">
        Choreography
      </h3>
      <p>Hokuto 'Hok' Konishi</p>

      {/* Publicity */}
      <h3 className="col-span-full text-xl font-semibold mt-6 mb-2">
        Publicity
      </h3>
      <p>Sanchita Trivedi</p>

      {/* Additional Crew */}
      <h3 className="col-span-full text-xl font-semibold mt-6 mb-2">
        Additional Crew
      </h3>
      <p>Nayanika Biswas</p>

      {/* Thanks */}
      <h3 className="col-span-full text-xl font-semibold mt-6 mb-2">
        Thanks
      </h3>
      <p>Aryan Khan</p>
      <p>Gauri Khan</p>

    </div>
  </div>
</section>

        
       {/* EXTRA */}
      <section id="explore" data-design-section="explore" className="max-w-7xl mx-auto px-6 py-24">

        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
          More
        </p>

        <h2 className="text-4xl md:text-5xl font-bold mt-3">
          Explore More
        </h2>


        <div className="grid md:grid-cols-3 gap-5 mt-10">

          {/* News */}
          <div className="rounded-2xl bg-zinc-900 p-8 border border-white/10">

            <h3 className="text-xl font-bold">
              News & Updates
            </h3>

            <p className="text-zinc-500 mt-3">
              Latest announcements and updates about Raaka.
            </p>

          </div>


          {/* Characters */}
          <div className="rounded-2xl bg-zinc-900 p-8 border border-white/10">

            <h3 className="text-xl font-bold">
              Characters
            </h3>

            <p className="text-zinc-500 mt-3">
              Discover the characters and their roles.
            </p>

          </div>


          {/* Music */}
          <div className="rounded-2xl bg-zinc-900 p-8 border border-white/10">

            <h3 className="text-xl font-bold">
              Music
            </h3>

            <p className="text-zinc-500 mt-3">
              Songs, lyrical videos and music updates.
            </p>

          </div>

        </div>

      </section>
<div className="mx-auto mt-6 max-w-3xl border-t border-white/10 pt-5 text-center">
  <p className="text-[10px] leading-relaxed tracking-wide text-white/40 md:text-xs">
    This is an unofficial fan-made website and is not affiliated with
    Sun Pictures, Allu Arjun, Atlee Kumar, Deepika Padukone, or the
    official RAAKA movie team.
  </p>
</div>

     {/* FOOTER */}
<footer className="border-t border-white/10 py-10">

  <div className="max-w-7xl mx-auto px-6 text-center">

    <h2 className="text-2xl font-bold">
      WORLD OF RAAKA
    </h2>

    <p className="text-zinc-500 text-sm mt-2">
      Everything about Raaka in one place.
    </p>

    {/* FOOTER LINKS */}
    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs uppercase tracking-[0.2em] text-white/40">

      <a
        href="/about"
        className="transition hover:text-white"
      >
        About
      </a>

      <a
        href="/contact"
        className="transition hover:text-white"
      >
        Contact
      </a>

      <a
        href="/privacy-policy"
        className="transition hover:text-white"
      >
        Privacy Policy
      </a>

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