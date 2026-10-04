"use client";

import { useEffect, useState } from "react";

const sections = [
  {
    number: "01",
    title: "A World Built Around RAAKA",
    text: "The World of RAAKA is a fan-created website dedicated to exploring and celebrating the world of RAAKA. It is designed as a central place for fans to discover, revisit and experience RAAKA-related material through a cinematic digital presentation.",
  },
  {
    number: "02",
    title: "Everything in One Place",
    text: "The website brings together movie information, cast and crew details, posters, announcements, songs, fan art and other RAAKA-related content in one place. Instead of treating each piece as a separate update, the site presents them as parts of one connected fan experience.",
  },
  {
    number: "03",
    title: "Made by Fans, for Fans",
    text: "The project is independently created by fans who want to celebrate the world around RAAKA. The goal is to make exploring the available material feel immersive while keeping the identity of the fan project clear.",
  },
];

export default function AboutPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] text-white">
      <style>{`
        @keyframes aboutOrbit { to { transform: rotate(360deg); } }
        @keyframes aboutPulse {
          0%,100% { transform: scale(.92); opacity:.45; }
          50% { transform: scale(1.08); opacity:.85; }
        }
        @keyframes aboutReveal {
          from { opacity:0; transform:translateY(22px); }
          to { opacity:1; transform:translateY(0); }
        }
        @keyframes aboutShine {
          0% { transform:translateX(-120%); }
          100% { transform:translateX(140%); }
        }
        @keyframes aboutFloat {
          0%,100% { transform:translateY(0); }
          50% { transform:translateY(-7px); }
        }
        .about-reveal { animation:aboutReveal .8s cubic-bezier(.2,.7,.2,1) both; }
        .about-orbit { animation:aboutOrbit 18s linear infinite; }
        .about-pulse { animation:aboutPulse 3.4s ease-in-out infinite; }
        .about-float { animation:aboutFloat 5s ease-in-out infinite; }
        .about-card { transition:transform .5s cubic-bezier(.2,.7,.2,1),border-color .35s,background .35s; }
        .about-card:hover { transform:translateY(-6px); border-color:rgba(255,180,90,.25); background:rgba(255,255,255,.045); }
        .about-card:hover .about-number { color:rgba(255,190,110,.9); }
        .about-card:hover .about-arrow { transform:translateX(5px); opacity:1; }
        .about-shine { animation:aboutShine 1.3s cubic-bezier(.2,.7,.2,1); }
        @media(prefers-reduced-motion:reduce){
          .about-reveal,.about-orbit,.about-pulse,.about-float,.about-shine{animation:none!important}
          .about-card{transition:none}
        }
      `}</style>

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-[-180px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-orange-500/[.045] blur-[100px]" />
        <div className="absolute bottom-[-180px] right-[-100px] h-[430px] w-[430px] rounded-full bg-amber-400/[.025] blur-[110px]" />
      </div>

      <header
        className={`sticky top-0 z-30 border-b transition-all duration-500 ${
          scrolled
            ? "border-white/[.08] bg-black/75 backdrop-blur-xl"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <a
            href="/"
            className="group flex items-center gap-3 text-[10px] uppercase tracking-[.28em] text-white/50 transition hover:text-white"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 transition group-hover:border-orange-300/35">
              <span className="transition-transform duration-300 group-hover:-translate-x-0.5">←</span>
            </span>
            Back
          </a>

          <span className="text-[9px] uppercase tracking-[.42em] text-white/25">
            World of RAAKA
          </span>
        </div>
      </header>

      <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-20 sm:px-8 md:pb-28 md:pt-28">
        <div className="absolute right-[10%] top-24 hidden h-44 w-44 md:block">
          <div className="about-orbit absolute inset-0 rounded-full border border-orange-300/[.12] border-t-orange-300/45" />
          <div className="absolute inset-7 rounded-full border border-white/[.05]" />
          <div className="about-pulse absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-300 shadow-[0_0_24px_rgba(249,115,22,.65)]" />
        </div>

        <div className="max-w-4xl about-reveal">
          <p className="mb-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[.42em] text-orange-200/55">
            <span className="h-px w-9 bg-orange-300/50" />
            About the project
          </p>

          <h1 className="max-w-4xl text-5xl font-semibold leading-[.95] tracking-[-.045em] sm:text-7xl md:text-8xl">
            The World
            <span className="block text-white/35">of RAAKA.</span>
          </h1>

          <p className="mt-8 max-w-2xl text-base leading-8 text-white/55 sm:text-lg">
            A fan-created digital space built to explore, collect and celebrate
            the world of RAAKA through its information, people, visuals, music,
            announcements and fan creativity.
          </p>
        </div>

        <div className="relative mt-20 grid gap-4 md:grid-cols-3">
          {sections.map((section, index) => (
            <article
              key={section.number}
              className="about-card group relative overflow-hidden rounded-[22px] border border-white/[.08] bg-white/[.018] p-6 backdrop-blur-sm"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <span className="about-shine pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-orange-200/[.07] to-transparent opacity-0 transition group-hover:opacity-100" />

              <div className="relative flex items-center justify-between">
                <span className="about-number text-[10px] font-semibold tracking-[.3em] text-white/25 transition-colors duration-300">
                  {section.number}
                </span>
                <span className="about-arrow text-white/20 opacity-60 transition-all duration-300">↗</span>
              </div>

              <h2 className="relative mt-12 text-xl font-medium tracking-tight text-white/90">
                {section.title}
              </h2>

              <p className="relative mt-4 text-sm leading-7 text-white/45">
                {section.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative border-y border-white/[.07] bg-white/[.012]">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 md:grid-cols-[.7fr_1.3fr] md:py-28">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.4em] text-orange-200/50">
              The idea
            </p>
            <h2 className="mt-5 max-w-sm text-3xl font-medium tracking-[-.03em] text-white sm:text-4xl">
              More than an information page.
            </h2>
          </div>

          <div className="space-y-7 text-base leading-8 text-white/55 sm:text-lg">
            <p>
              The World of RAAKA brings different pieces of the fan experience
              together so visitors can move naturally between movie information,
              cast and crew details, posters, announcements, songs and fan art.
            </p>
            <p>
              The site is intentionally presented as an evolving fan archive:
              a place where RAAKA-related material can be discovered and
              celebrated in one connected experience.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 md:py-28">
        <div className="relative overflow-hidden rounded-[28px] border border-white/[.08] bg-gradient-to-br from-white/[.045] to-transparent p-7 sm:p-10 md:p-14">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-orange-300/[.08]" />
          <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full border border-orange-300/[.06]" />

          <div className="relative max-w-3xl">
            <p className="text-[10px] font-semibold uppercase tracking-[.4em] text-orange-200/55">
              Independent fan project
            </p>

            <h2 className="mt-5 text-3xl font-medium tracking-[-.03em] sm:text-4xl">
              Created independently, with respect for the original work.
            </h2>

            <p className="mt-6 text-sm leading-7 text-white/50 sm:text-base sm:leading-8">
              The World of RAAKA is an independent fan website and is not
              officially affiliated with the filmmakers, actors, production
              companies or distributors associated with RAAKA.
            </p>

            <a
              href="/"
              className="group mt-9 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[.035] px-5 py-3 text-[10px] font-semibold uppercase tracking-[.2em] text-white/65 transition hover:border-orange-300/30 hover:bg-orange-300/[.06] hover:text-white"
            >
              <span>Explore the World</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[.07] px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-[9px] uppercase tracking-[.25em] text-white/25 sm:flex-row sm:items-center sm:justify-between">
          <span>World of RAAKA</span>
          <span>Independent Fan Website</span>
        </div>
      </footer>
    </main>
  );
}
