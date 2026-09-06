"use client";

import Link from "next/link";

const milestones = [
  {
    number: "01",
    date: "08 APRIL 2025",
    year: "2025",
    title: "THE JOURNEY BEGINS",
    subtitle: "MOVIE ANNOUNCEMENT",
    description:
      "The massive collaboration between Allu Arjun, Atlee and Sun Pictures was officially announced, marking the beginning of a new cinematic journey.",
    videoId: "SI_PhNII7Mc",
    videoLabel: "WATCH ANNOUNCEMENT",
  },
  {
    number: "02",
    date: "07 JUNE 2025",
    year: "2025",
    title: "WELCOME ON BOARD",
    subtitle: "DEEPIKA PADUKONE",
    description:
      "Deepika Padukone officially joined the project, adding another major face to the ambitious cinematic world of RAAKA.",
    videoId: "jlmT4apm1oI",
    videoLabel: "WATCH REVEAL",
  },
  {
    number: "03",
    date: "08 APRIL 2026",
    year: "2026",
    title: "RAAKA",
    subtitle: "TITLE & FIRST LOOK",
    description:
      "The project entered a new chapter with the reveal of its official title and first-look poster.",
    image: "/RAAKAFL.jpg",
  },
  {
    number: "04",
    date: "08 APRIL 2026",
    year: "2026",
    title: "MAKE WAY FOR THE KING",
    subtitle: "OFFICIAL MUSICAL RELEASE",
    description:
      "The arrival of the King was celebrated with the release of the official musical track, Make Way For The King.",
    videoId: "dYId6xEdG8U",
    videoLabel: "PLAY MUSIC",
  },
];

const upcoming = [
  {
    number: "05",
    title: "GLIMPSE",
    label: "COMING SOON",
  },
  {
    number: "06",
    title: "TEASER",
    label: "COMING SOON",
  },
  {
    number: "07",
    title: "SONGS",
    label: "COMING SOON",
  },
  {
    number: "08",
    title: "TRAILER",
    label: "COMING SOON",
  },
  {
    number: "09",
    title: "MOVIE RELEASE",
    label: "COMING SOON",
  },
];

export default function TimelinePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] text-white">
      {/* ================= HERO ================= */}
      <section className="relative flex min-h-screen items-end overflow-hidden">
        {/* cinematic background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.12),transparent_32%),radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.06),transparent_30%)]" />

        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.15),rgba(0,0,0,0.55)_55%,#050505_100%)]" />

        {/* giant background text */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap text-[30vw] font-black tracking-[-0.08em] text-white/[0.025]">
          RAAKA
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 md:px-12 md:pb-28">
          <Link
            href="/"
            className="mb-16 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40 transition hover:text-white"
          >
            ← Back to Home
          </Link>

          <div className="max-w-5xl">
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.5em] text-white/35">
              THE JOURNEY OF
            </p>

            <h1 className="text-[19vw] font-black uppercase leading-[0.72] tracking-[-0.08em] md:text-[13vw]">
              RAAKA
            </h1>

            <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <p className="max-w-xl text-sm leading-7 text-white/45 md:text-base">
                From the first announcement to the next big reveal —
                experience the journey of RAAKA, one milestone at a time.
              </p>

              <div className="flex items-center gap-4">
                <span className="h-px w-12 bg-white/20" />
                <span className="text-[10px] uppercase tracking-[0.35em] text-white/30">
                  2025 — PRESENT
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TIMELINE ================= */}
      <section className="relative">
        {/* background glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-white/[0.025] blur-[140px]" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 md:px-12 md:py-36">
          {/* section heading */}
          <div className="mb-24 flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] uppercase tracking-[0.45em] text-white/30">
                CHAPTERS
              </p>

              <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
                The Timeline
              </h2>
            </div>

            <p className="max-w-md text-sm leading-7 text-white/35">
              Every announcement, reveal and major milestone — preserved as
              part of the RAAKA journey.
            </p>
          </div>

          {/* center line */}
          <div className="absolute left-[27px] top-[330px] bottom-0 w-px bg-gradient-to-b from-white/30 via-white/10 to-transparent md:left-1/2 md:-translate-x-1/2" />

          <div className="space-y-32 md:space-y-44">
            {milestones.map((item, index) => (
              <article
                key={item.number}
                className="relative md:grid md:grid-cols-2 md:gap-20"
              >
                {/* timeline node */}
                <div className="absolute left-[27px] top-8 z-20 -translate-x-1/2 md:left-1/2">
                  <div className="relative flex h-5 w-5 items-center justify-center rounded-full border border-white/30 bg-[#050505]">
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                  </div>
                </div>

                {/* date side */}
                <div
                  className={`hidden md:block ${
                    index % 2 === 0
                      ? "pr-20 text-right"
                      : "order-2 pl-20 text-left"
                  }`}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/25">
                    CHAPTER {item.number}
                  </p>

                  <p className="mt-5 text-7xl font-black tracking-[-0.06em] text-white/[0.07]">
                    {item.year}
                  </p>

                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/35">
                    {item.date}
                  </p>
                </div>

                {/* content */}
                <div
                  className={`pl-14 md:pl-0 ${
                    index % 2 === 0
                      ? ""
                      : "md:order-1 md:pr-20"
                  }`}
                >
                  {/* mobile date */}
                  <div className="mb-6 md:hidden">
                    <p className="text-[10px] uppercase tracking-[0.35em] text-white/30">
                      CHAPTER {item.number} • {item.date}
                    </p>
                  </div>

                  <div className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.025] shadow-2xl transition duration-700 hover:border-white/20 hover:bg-white/[0.04]">
                    {/* media */}
                    {item.videoId && (
                      <div className="relative aspect-video overflow-hidden bg-black">
                        <iframe
                          className="absolute inset-0 h-full w-full"
                          src={`https://www.youtube.com/embed/${item.videoId}?rel=0`}
                          title={item.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />

                        <div className="pointer-events-none absolute inset-0 border border-white/5" />
                      </div>
                    )}

                  {item.image && (
  <div className="relative overflow-hidden bg-black">
    <img
      src="/images/RAAKAFL.jpg"
      alt="RAAKA First Look"
      className="h-auto max-h-[750px] w-full object-contain transition duration-1000 group-hover:scale-[1.025]"
    />

    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

    <div className="absolute bottom-5 left-5">
      <span className="rounded-full border border-white/20 bg-black/50 px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.25em] text-white backdrop-blur-md">
        FIRST LOOK
      </span>
    </div>
  </div>
)}
                    {/* info */}
                    <div className="p-7 md:p-9">
                      <div className="flex items-center gap-3">
                        <span className="h-px w-8 bg-white/25" />

                        <span className="text-[9px] font-semibold uppercase tracking-[0.35em] text-white/35">
                          {item.subtitle}
                        </span>
                      </div>

                      <h3 className="mt-5 text-3xl font-black uppercase leading-[0.95] tracking-[-0.03em] md:text-5xl">
                        {item.title}
                      </h3>

                      <p className="mt-6 max-w-xl text-sm leading-7 text-white/45">
                        {item.description}
                      </p>

                      {item.videoId && (
                        <a
                          href={`https://www.youtube.com/watch?v=${item.videoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-7 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.25em] text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
                        >
                          {item.videoLabel}
                          <span>↗</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ================= NEXT CHAPTER ================= */}
      <section className="relative overflow-hidden border-t border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_45%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-28 md:px-12 md:py-40">
          <div className="mb-16">
            <p className="text-[10px] uppercase tracking-[0.45em] text-white/30">
              THE STORY CONTINUES
            </p>

            <h2 className="mt-5 text-4xl font-black uppercase tracking-[-0.04em] md:text-7xl">
              Next Chapter
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-7 text-white/35">
              The next milestones will appear here as RAAKA moves closer to
              the big screen.
            </p>
          </div>

          {/* upcoming timeline */}
          <div className="grid gap-px overflow-hidden rounded-[30px] border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-5">
            {upcoming.map((item) => (
              <div
                key={item.number}
                className="group relative min-h-[280px] overflow-hidden bg-[#080808] p-7 transition duration-500 hover:bg-[#0d0d0d]"
              >
                {/* huge number */}
                <div className="absolute -right-3 -top-8 text-[130px] font-black leading-none tracking-[-0.08em] text-white/[0.035] transition duration-500 group-hover:text-white/[0.07]">
                  {item.number}
                </div>

                <div className="relative flex h-full flex-col justify-between">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-white/25">
                      UPCOMING
                    </p>

                    <h3 className="mt-5 text-2xl font-black uppercase tracking-[-0.03em]">
                      {item.title}
                    </h3>
                  </div>

                  <div>
                    <div className="mb-5 h-px w-full bg-white/10" />

                    <div className="flex items-center gap-3">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/50" />

                      <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-white/35">
                        {item.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FINAL ================= */}
      <section className="relative overflow-hidden border-t border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.07),transparent_40%)]" />

        <div className="relative mx-auto max-w-5xl px-6 py-32 text-center md:py-44">
          <p className="text-[10px] uppercase tracking-[0.5em] text-white/25">
            THE JOURNEY HAS JUST BEGUN
          </p>

          <h2 className="mt-7 text-5xl font-black uppercase tracking-[-0.06em] md:text-8xl">
            MAKE WAY
          </h2>

          <p className="mt-4 text-xl font-light uppercase tracking-[0.2em] text-white/40 md:text-3xl">
            For The King
          </p>

          <div className="mt-12">
            <Link
              href="/"
              className="inline-flex rounded-full border border-white/20 bg-white px-7 py-4 text-[10px] font-bold uppercase tracking-[0.25em] text-black transition hover:bg-white/90"
            >
              Back To World Of RAAKA
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-white/10 py-10">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-2xl font-bold">WORLD OF RAAKA</h2>

          <p className="mt-2 text-sm text-zinc-500">
            Everything about RAAKA in one place.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs uppercase tracking-[0.2em] text-white/40">
            <Link href="/about" className="transition hover:text-white">
              About
            </Link>

            <Link href="/contact" className="transition hover:text-white">
              Contact
            </Link>

            <Link
              href="/privacy-policy"
              className="transition hover:text-white"
            >
              Privacy Policy
            </Link>
          </div>

          <p className="mt-6 text-[10px] tracking-[0.15em] text-white/20">
            © {new Date().getFullYear()} The World of RAAKA. Fan-created
            website.
          </p>
        </div>
      </footer>
    </main>
  );
}