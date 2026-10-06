"use client";

import { useEffect, useState } from "react";

type ContactItem = {
  label: string;
  value: string;
  name?: string;
  href: string;
  image?: string;
  icon: string;
};

const CREATOR_CONTACTS: ContactItem[] = [
  {
    label: "Email",
    value: "worldofraakaverse@gmail.com",
    href: "mailto:worldofraakaverse@gmail.com",
    icon: "✉",
  },
  {
    label: "Instagram",
    value: "@45_.editz",
    name: "Ashok",
    href: "https://www.instagram.com/45_.editz",
    image: "https://unavatar.io/x/Cricvizanalys",
    icon: "◎",
  },
  {
    label: "Twitter / X",
    value: "@Cricvizanalys",
    name: "Ashok",
    href: "https://x.com/Cricvizanalys",
    image: "https://unavatar.io/x/Cricvizanalys",
    icon: "𝕏",
  },
];

const COMMUNITY_CONTACTS: ContactItem[] = [
  {
    label: "Email",
    value: "worldofraaka@gmail.com",
    href: "mailto:worldofraaka@gmail.com",
    icon: "✉",
  },
  {
    label: "Instagram",
    value: "@worldofraaka",
    name: "World of RAAKA",
    href: "https://www.instagram.com/worldofraaka",
    image: "https://unavatar.io/x/WorldOfRaaka",
    icon: "◎",
  },
  {
    label: "Twitter / X",
    value: "@WorldOfRaaka",
    name: "World of RAAKA",
    href: "https://x.com/WorldOfRaaka",
    image: "https://unavatar.io/x/WorldOfRaaka",
    icon: "𝕏",
  },
  {
    label: "Fan Community",
    value: "@DracoUnbothered",
    name: "Dev",
    href: "https://x.com/DracoUnbothered",
    image: "https://unavatar.io/x/DracoUnbothered",
    icon: "𝕏",
  },
];

function ContactCard({
  item,
  index,
}: {
  item: ContactItem;
  index: number;
}) {
  return (
    <a
      href={item.href}
      target={item.href.startsWith("http") ? "_blank" : undefined}
      rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="contact-card group relative flex items-center gap-4 overflow-hidden rounded-[20px] border border-white/[.08] bg-white/[.025] p-4 transition-all duration-500 hover:-translate-y-1 hover:border-orange-300/25 hover:bg-white/[.045]"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <span className="contact-sweep pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-orange-200/[.08] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {item.image ? (
        <img
          src={item.image}
          alt={`${item.name ?? item.label} profile`}
          className="relative h-12 w-12 shrink-0 rounded-full border border-white/10 object-cover transition duration-500 group-hover:scale-105 group-hover:border-orange-300/30"
        />
      ) : (
        <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[.035] text-sm text-white/45 transition group-hover:border-orange-300/30 group-hover:text-orange-200">
          {item.icon}
        </span>
      )}

      <span className="relative min-w-0 flex-1">
        <span className="block text-[9px] font-semibold uppercase tracking-[.28em] text-white/30">
          {item.label}
        </span>
        <span className="mt-1 block truncate text-sm font-medium text-white/80 transition group-hover:text-white">
          {item.name ?? item.value}
        </span>
        {item.name && (
          <span className="mt-0.5 block truncate text-[11px] text-white/35">
            {item.value}
          </span>
        )}
      </span>

      <span className="relative text-white/20 transition-all duration-300 group-hover:translate-x-1 group-hover:text-orange-200/70">
        ↗
      </span>
    </a>
  );
}

export default function ContactPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] text-white">
      <style>{`
        @keyframes contactReveal {
          from { opacity:0; transform:translateY(24px); }
          to { opacity:1; transform:translateY(0); }
        }
        @keyframes contactOrbit {
          to { transform:rotate(360deg); }
        }
        @keyframes contactOrbitReverse {
          to { transform:rotate(-360deg); }
        }
        @keyframes contactPulse {
          0%,100% { transform:scale(.82); opacity:.4; }
          50% { transform:scale(1.08); opacity:.95; }
        }
        @keyframes contactBeam {
          0% { transform:translateX(-120%) skewX(-18deg); opacity:0; }
          20% { opacity:.8; }
          100% { transform:translateX(360%) skewX(-18deg); opacity:0; }
        }
        @keyframes contactFloat {
          0%,100% { transform:translateY(0); }
          50% { transform:translateY(-6px); }
        }
        .contact-reveal { animation:contactReveal .85s cubic-bezier(.2,.7,.2,1) both; }
        .contact-orbit { animation:contactOrbit 18s linear infinite; }
        .contact-orbit-reverse { animation:contactOrbitReverse 13s linear infinite; }
        .contact-pulse { animation:contactPulse 3.2s ease-in-out infinite; }
        .contact-float { animation:contactFloat 5s ease-in-out infinite; }
        .contact-card { animation:contactReveal .7s cubic-bezier(.2,.7,.2,1) both; }
        .contact-sweep { animation:contactBeam 1.2s cubic-bezier(.2,.7,.2,1); }
        .contact-card:hover .contact-sweep { animation:contactBeam 1.1s cubic-bezier(.2,.7,.2,1); }
        @media(prefers-reduced-motion:reduce){
          .contact-reveal,.contact-orbit,.contact-orbit-reverse,.contact-pulse,
          .contact-float,.contact-card,.contact-sweep{animation:none!important}
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[12%] top-[12%] h-80 w-80 rounded-full bg-orange-500/[.035] blur-[110px]" />
        <div className="absolute right-[-10%] top-[40%] h-96 w-96 rounded-full bg-amber-300/[.025] blur-[120px]" />
        <div className="absolute inset-0 opacity-[.025] [background-image:linear-gradient(rgba(255,255,255,.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.3)_1px,transparent_1px)] [background-size:80px_80px]" />
      </div>

      <header
        className={`sticky top-0 z-40 border-b transition-all duration-500 ${
          scrolled
            ? "border-white/[.08] bg-black/75 backdrop-blur-xl"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <a
            href="/"
            className="group flex items-center gap-3 text-[10px] font-medium uppercase tracking-[.28em] text-white/45 transition hover:text-white"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 transition duration-300 group-hover:border-orange-300/35">
              <span className="transition-transform duration-300 group-hover:-translate-x-0.5">
                ←
              </span>
            </span>
            Back to Home
          </a>

          <span className="text-[8px] uppercase tracking-[.42em] text-white/20">
            World of RAAKA
          </span>
        </div>
      </header>

      <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-20 sm:px-8 md:pb-28 md:pt-28">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_300px]">
          <div className="contact-reveal">
            <p className="mb-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[.42em] text-orange-200/55">
              <span className="h-px w-10 bg-orange-300/50" />
              Contact
            </p>

            <h1 className="max-w-4xl text-5xl font-semibold leading-[.92] tracking-[-.05em] sm:text-7xl md:text-8xl">
              Let&apos;s keep
              <span className="block text-white/35">the world connected.</span>
            </h1>

            <p className="mt-8 max-w-2xl text-base leading-8 text-white/50 sm:text-lg">
              For questions, suggestions, corrections, fan art,
              collaborations or other website-related matters, you can reach
              us through the details below.
            </p>
          </div>

          <div className="contact-float relative mx-auto hidden h-56 w-56 lg:block">
            <div className="contact-orbit absolute inset-0 rounded-full border border-orange-300/[.13] border-t-orange-300/55" />
            <div className="contact-orbit-reverse absolute inset-7 rounded-full border border-white/[.06] border-b-orange-200/25" />
            <div className="absolute inset-14 rounded-full border border-white/[.07] bg-white/[.015] backdrop-blur-sm" />
            <div className="contact-pulse absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-300 shadow-[0_0_30px_rgba(249,115,22,.65)]" />
          </div>
        </div>
      </section>

      <section className="relative border-y border-white/[.07] bg-white/[.012]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-2 md:py-24">
          <div className="contact-reveal">
            <p className="text-[9px] font-semibold uppercase tracking-[.38em] text-orange-200/50">
              01 / Website Creator
            </p>
            <h2 className="mt-4 text-3xl font-medium tracking-[-.035em] sm:text-4xl">
              Direct contact
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/40">
              For website-related questions, suggestions, corrections,
              collaborations and other matters, contact the website creator
              directly.
            </p>

            <div className="mt-8 space-y-3">
              {CREATOR_CONTACTS.map((item, index) => (
                <ContactCard key={item.href} item={item} index={index} />
              ))}
            </div>
          </div>

          <div className="contact-reveal rounded-[28px] border border-white/[.07] bg-[#080808]/70 p-7 backdrop-blur-sm md:p-9">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[.38em] text-white/30">
                  Creator
                </p>
                <h3 className="mt-3 text-2xl font-medium tracking-tight">
                  Ashok
                </h3>
              </div>
              <span className="contact-pulse flex h-9 w-9 items-center justify-center rounded-full border border-orange-300/20 bg-orange-300/[.05] text-[11px] text-orange-200/70">
                ✦
              </span>
            </div>

            <div className="mt-10 h-px bg-gradient-to-r from-orange-300/25 via-white/[.08] to-transparent" />

            <p className="mt-7 text-sm leading-7 text-white/40">
              The contact channels on this page are provided for communication
              connected with the World of RAAKA website and its fan community.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          02 / FAN COMMUNITY
      ========================================================== */}
      <section className="relative border-y border-white/[.07] bg-white/[.012]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-2 md:py-24">
          {/* LEFT — COMMUNITY CONTACTS */}
          <div className="contact-reveal">
            <p className="text-[9px] font-semibold uppercase tracking-[.38em] text-orange-200/50">
              02 / Fan Community
            </p>

            <h2 className="mt-4 text-3xl font-medium tracking-[-.035em] sm:text-4xl">
              World of RAAKA
            </h2>

            <p className="mt-4 max-w-md text-sm leading-7 text-white/40">
              Follow the community channels for World of RAAKA and connect with
              the wider fan space.
            </p>

            <div className="mt-8 space-y-3">
              {COMMUNITY_CONTACTS.map((item, index) => (
                <ContactCard key={item.href} item={item} index={index} />
              ))}
            </div>
          </div>

          {/* RIGHT — PAGE CREATOR / DEV */}
          <div className="contact-reveal rounded-[28px] border border-white/[.07] bg-[#080808]/70 p-7 backdrop-blur-sm md:p-9">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[.38em] text-white/30">
                  Page Creator
                </p>

                <h3 className="mt-3 text-2xl font-medium tracking-tight">
                  Dev
                </h3>
              </div>

              <span className="contact-pulse flex h-9 w-9 items-center justify-center rounded-full border border-orange-300/20 bg-orange-300/[.05] text-[11px] text-orange-200/70">
                ✦
              </span>
            </div>

            <div className="mt-10 h-px bg-gradient-to-r from-orange-300/25 via-white/[.08] to-transparent" />

            <p className="mt-7 text-sm leading-7 text-white/40">
              The community channels on this page are provided for communication,
              updates and fan activities connected with the World of RAAKA community.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 md:pb-28">
        <div className="relative overflow-hidden rounded-[30px] border border-white/[.08] bg-gradient-to-br from-white/[.045] via-white/[.018] to-transparent p-7 sm:p-10 md:p-14">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-orange-300/[.07]" />
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full border border-orange-300/[.05]" />

          <div className="relative max-w-3xl">
            <p className="text-[9px] font-semibold uppercase tracking-[.38em] text-orange-200/50">
              Independent fan project
            </p>
            <h2 className="mt-5 text-2xl font-medium tracking-[-.03em] sm:text-3xl">
              Built independently. Shared with respect.
            </h2>
            <p className="mt-5 text-sm leading-7 text-white/40 sm:text-base sm:leading-8">
              The World of RAAKA is an independent fan-created website and is
              not officially affiliated with the filmmakers, actors, production
              companies or distributors associated with RAAKA.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[.07] px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-[9px] uppercase tracking-[.25em] text-white/20 sm:flex-row sm:items-center sm:justify-between">
          <span>World of RAAKA</span>
          <span>Independent Fan Website</span>
        </div>
      </footer>
    </main>
  );
}
