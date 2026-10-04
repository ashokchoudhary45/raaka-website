"use client";

import { useEffect, useState } from "react";

const POLICY_SECTIONS = [
  {
    id: "information",
    number: "01",
    title: "Information We Collect",
    text: "The website may collect information that visitors voluntarily provide, such as a fan name, artwork title, artwork image and optional social profile information when submitting fan art.",
    accent: "Voluntary information",
  },
  {
    id: "fan-art",
    number: "02",
    title: "Fan Art Submissions",
    text: "Fan art submitted through the website may be stored and displayed in the public Fan Art Gallery after review and approval.",
    accent: "Review & gallery",
  },
  {
    id: "local-storage",
    number: "03",
    title: "Local Storage",
    text: "The website may use browser local storage to remember certain visitor-related information, such as fan interactions and fan passport information.",
    accent: "Browser storage",
  },
  {
    id: "third-party",
    number: "04",
    title: "Third-Party Services",
    text: "The website may use third-party services for hosting, database storage, authentication, analytics and other website functions.",
    accent: "External services",
  },
  {
    id: "advertising",
    number: "05",
    title: "Advertising",
    text: "If advertising services are enabled on the website in the future, third-party advertising providers may use cookies or similar technologies to provide and measure advertisements.",
    accent: "Future advertising",
  },
  {
    id: "contact",
    number: "06",
    title: "Contact",
    text: "If you have questions about this Privacy Policy or want to request removal or correction of content, please contact us through the Contact page.",
    accent: "Questions & requests",
  },
];

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState("information");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-18% 0px -65% 0px", threshold: [0.1, 0.35, 0.7] }
    );

    POLICY_SECTIONS.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] text-white">
      <style>{`
        @keyframes ppReveal {
          from { opacity:0; transform:translateY(22px); }
          to { opacity:1; transform:translateY(0); }
        }
        @keyframes ppOrbit {
          to { transform:rotate(360deg); }
        }
        @keyframes ppOrbitReverse {
          to { transform:rotate(-360deg); }
        }
        @keyframes ppPulse {
          0%,100% { transform:scale(.78); opacity:.35; }
          50% { transform:scale(1.08); opacity:.9; }
        }
        @keyframes ppSweep {
          0% { transform:translateX(-140%) skewX(-18deg); opacity:0; }
          25% { opacity:.7; }
          100% { transform:translateX(340%) skewX(-18deg); opacity:0; }
        }
        @keyframes ppDot {
          0%,100% { box-shadow:0 0 0 rgba(249,115,22,0); }
          50% { box-shadow:0 0 18px rgba(249,115,22,.35); }
        }

        .pp-reveal { animation:ppReveal .8s cubic-bezier(.2,.7,.2,1) both; }
        .pp-orbit { animation:ppOrbit 20s linear infinite; }
        .pp-orbit-reverse { animation:ppOrbitReverse 14s linear infinite; }
        .pp-pulse { animation:ppPulse 3s ease-in-out infinite; }
        .pp-dot { animation:ppDot 2.8s ease-in-out infinite; }

        .pp-section {
          scroll-margin-top: 110px;
          animation:ppReveal .7s cubic-bezier(.2,.7,.2,1) both;
        }

        .pp-section:hover .pp-number {
          color:rgba(255,190,110,.9);
          transform:translateX(3px);
        }

        .pp-section:hover .pp-sweep {
          animation:ppSweep 1.2s cubic-bezier(.2,.7,.2,1);
        }

        .pp-nav-item { transition:color .3s, padding-left .3s; }
        .pp-nav-item:hover { padding-left:6px; color:white; }

        @media(prefers-reduced-motion:reduce){
          .pp-reveal,.pp-orbit,.pp-orbit-reverse,.pp-pulse,.pp-dot,
          .pp-section,.pp-sweep{animation:none!important}
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[18%] top-[8%] h-96 w-96 rounded-full bg-orange-500/[.025] blur-[120px]" />
        <div className="absolute right-[-12%] top-[48%] h-[500px] w-[500px] rounded-full bg-amber-300/[.018] blur-[130px]" />
        <div className="absolute inset-0 opacity-[.018] [background-image:linear-gradient(rgba(255,255,255,.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.4)_1px,transparent_1px)] [background-size:72px_72px]" />
      </div>

      <header
        className={`sticky top-0 z-40 border-b transition-all duration-500 ${
          scrolled
            ? "border-white/[.08] bg-black/78 backdrop-blur-xl"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <a
            href="/"
            className="group flex items-center gap-3 text-[10px] uppercase tracking-[.28em] text-white/45 transition hover:text-white"
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

      <section className="relative mx-auto max-w-7xl px-5 pb-16 pt-20 sm:px-8 md:pb-20 md:pt-28">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_280px]">
          <div className="pp-reveal">
            <p className="mb-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[.42em] text-orange-200/55">
              <span className="h-px w-10 bg-orange-300/50" />
              Legal / Privacy
            </p>

            <h1 className="max-w-4xl text-5xl font-semibold leading-[.92] tracking-[-.05em] sm:text-7xl md:text-8xl">
              Privacy
              <span className="block text-white/30">Policy.</span>
            </h1>

            <p className="mt-8 max-w-2xl text-base leading-8 text-white/50 sm:text-lg">
              A clear overview of the information the World of RAAKA website
              may collect, how fan submissions are handled, and the services
              that may support the website.
            </p>
          </div>

          <div className="pp-reveal relative mx-auto hidden h-52 w-52 lg:block">
            <div className="pp-orbit absolute inset-0 rounded-full border border-orange-300/[.12] border-t-orange-300/50" />
            <div className="pp-orbit-reverse absolute inset-8 rounded-full border border-white/[.06] border-b-orange-200/25" />
            <div className="absolute inset-[68px] rounded-full border border-white/[.07] bg-white/[.015] backdrop-blur-sm" />
            <div className="pp-pulse absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-300" />
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-24 sm:px-8 lg:grid-cols-[220px_1fr] lg:gap-20">
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-[22px] border border-white/[.07] bg-white/[.018] p-5 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[9px] font-semibold uppercase tracking-[.32em] text-white/30">
                On this page
              </span>
              <span className="pp-dot h-1.5 w-1.5 rounded-full bg-orange-300/70" />
            </div>

            <nav className="space-y-1">
              {POLICY_SECTIONS.map((section) => {
                const active = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => scrollToSection(section.id)}
                    className={`pp-nav-item flex w-full items-center gap-3 rounded-lg px-1 py-2 text-left text-[10px] uppercase tracking-[.13em] ${
                      active
                        ? "text-orange-200"
                        : "text-white/30 hover:text-white"
                    }`}
                  >
                    <span
                      className={`h-px transition-all duration-300 ${
                        active ? "w-6 bg-orange-300/70" : "w-3 bg-white/15"
                      }`}
                    />
                    <span>{section.number}</span>
                    <span className="hidden xl:inline">{section.title}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        <div className="max-w-3xl">
          <div className="mb-10 border-b border-white/[.07] pb-6">
            <p className="text-[9px] uppercase tracking-[.35em] text-white/25">
              Website privacy information
            </p>
            <p className="mt-2 text-sm leading-7 text-white/40">
              Please read the following sections to understand the current
              privacy-related practices described for the website.
            </p>
          </div>

          <div className="space-y-5">
            {POLICY_SECTIONS.map((section, index) => (
              <section
                id={section.id}
                key={section.id}
                className="pp-section group relative overflow-hidden rounded-[24px] border border-white/[.07] bg-white/[.018] p-6 sm:p-8"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <span className="pp-sweep pointer-events-none absolute inset-y-0 -left-1/2 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-orange-200/[.055] to-transparent opacity-0" />

                <div className="relative flex items-start gap-5">
                  <span className="pp-number shrink-0 pt-1 text-[10px] font-semibold tracking-[.25em] text-white/20 transition-all duration-300">
                    {section.number}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h2 className="text-xl font-medium tracking-[-.02em] text-white/90 sm:text-2xl">
                        {section.title}
                      </h2>
                      <span className="rounded-full border border-white/[.07] px-2.5 py-1 text-[7px] uppercase tracking-[.2em] text-white/25">
                        {section.accent}
                      </span>
                    </div>

                    <p className="mt-5 text-sm leading-8 text-white/50 sm:text-base">
                      {section.text}
                    </p>
                  </div>
                </div>
              </section>
            ))}
          </div>

          <div className="mt-8 rounded-[24px] border border-orange-300/[.12] bg-orange-300/[.025] p-6 sm:p-8">
            <p className="text-[9px] font-semibold uppercase tracking-[.35em] text-orange-200/55">
              Need help?
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/45">
              If you have questions about this Privacy Policy or want to
              request removal or correction of content, please contact us
              through the Contact page.
            </p>
            <a
              href="/contact"
              className="group mt-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[.035] px-5 py-3 text-[9px] font-semibold uppercase tracking-[.2em] text-white/65 transition hover:border-orange-300/30 hover:bg-orange-300/[.05] hover:text-white"
            >
              Contact us
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>
          </div>
        </div>
      </div>

      <footer className="border-t border-white/[.07] px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-[9px] uppercase tracking-[.25em] text-white/20 sm:flex-row sm:items-center sm:justify-between">
          <span>World of RAAKA</span>
          <span>Privacy / Legal</span>
        </div>
      </footer>
    </main>
  );
}
