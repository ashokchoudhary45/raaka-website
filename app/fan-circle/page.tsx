import Link from "next/link";

const fans = [
  {
    username: "@DracoUnbothered",
    name: "DRACO",
    role: "RAAKA Fan",
    bio: "Unfiltered voice of the RAAKA universe.",
  },
  {
    username: "@SakethforRaaka",
    name: "DuvvadaJaganadam",
    role: "RAAKA FAN",
    bio: "Allu Arjun • RAAKA • Cinema",
  },
  {
    username: "@Cricvizanalys",
    name: "Cricviz Analys",
    role: "RAAKA Creator",
    bio: "Cinema, fandom & conversations.",
  },
  {
    username: "@Corleoneei",
    name: "के 🇳🇵",
    role: "RAAKA Fan",
    bio: "A voice from the RAAKA circle.",
  },
  {
    username: "@therwdygirl",
    name: "Lilly ✨",
    role: "RAAKA Fan",
    bio: "Cinema • Virosh Cutz",
  },
  {
    username: "@rounakdaa",
    name: "Bᴀʙᴀ ICON",
    role: "RAAKA Fan",
    bio: "Allu Arjun • Indian Cinema",
  },
  {
    username: "@bhAAiCults",
    name: "Drake ᴬᴬ",
    role: "RAAKA Fan",
    bio: "Celebrating the ICON.",
  },
  {
    username: "@prashantAADHF",
    name: "Prashu 🐉👑",
    role: "RAAKA Fan",
    bio: "They doubt, I dominate.",
  },
  {
    username: "@SRKsRajput",
    name: "𝐓𝐔𝐒𝐇𝐀𝐑 🪓",
    role: "RAAKA Fan",
    bio: "Cinema • Cricket • Football",
  },
  {
    username: "@RajMav07",
    name: "Raj Mav",
    role: "RAAKA Fan",
    bio: "Part of the RAAKA journey.",
  },
  {
    username: "@AaoGhumaKLeLu",
    name: "Aao Ghuma K Le Lu",
    role: "RAAKA Fan",
    bio: "Here for the ride.",
  },
  {
    username: "@ShivAAm_RAAJPUT",
    name: "ShivAAm RAAJPUT",
    role: "RAAKA Fan",
    bio: "One universe. One fandom.",
  },
  {
    username: "@mosiac1234",
    name: "mosiac1234",
    role: "RAAKA Fan",
    bio: "RAAKA enthusiast.",
  },
  {
    username: "@sankalphqtweets",
    name: "sankalphq.",
    role: "RAAKA FAN",
    bio: "Building the RAAKA conversation.",
  },
  {
    username: "@RohitSa52200019",
    name: "Rohit Sa",
    role: "RAAKA Fan",
    bio: "A voice inside the circle.",
  },
  {
    username: "@sanjay_gormat",
    name: "Sanjay Gormat",
    role: "RAAKA Fan",
    bio: "RAAKA • Allu Arjun • Cinema",
  },
  {
    username: "@NorthAArmy",
    name: "North A Army",
    role: "RAAKA Fan",
    bio: "North side of the universe.",
  },
  {
    username: "@sanket808004",
    name: "Sanket",
    role: "RAAKA Fan",
    bio: "Cinema lives here.",
  },
  {
    username: "@kni8ofdarkness",
    name: "Knight of Darkness",
    role: "RAAKA Fan",
    bio: "Into the RAAKA universe.",
  },
  {
    username: "@duaflora",
    name: "duaflora",
    role: "RAAKA Fan",
    bio: "Another voice in the circle.",},
    {
  username: "@AArjunEra",
  name: "AArjunEra",
  role: "RAAKA Fan",
  bio: "A passionate voice from the RAAKA fan community.",
},
{
  username: "@Morfine68339115",
  name: "Morfine68339115",
  role: "RAAKA Fan",
  bio: "A dedicated RAAKA supporter.",
},
{
  username: "@bunnykk59",
  name: "bunnykk59",
  role: "RAAKA Fan",
  bio: "A proud voice in the RAAKA fan circle.",
},
   
];

function avatarUrl(username: string) {
  return `https://unavatar.io/twitter/${username.replace("@", "")}`;
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2H21.5l-7.11 8.13L22.76 22h-6.51l-5.1-6.66L5.32 22H2.06l7.61-8.7L1.5 2h6.67l4.61 6.1L18.244 2Zm-1.145 17.9h1.807L7.23 4.02H5.29L17.1 19.9Z" />
    </svg>
  );
}

export default function FanCirclePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#030303] text-white selection:bg-orange-500/30">
      {/* Cinematic atmosphere */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-260px] h-[620px] w-[900px] -translate-x-1/2 rounded-full bg-orange-600/[0.10] blur-[150px]" />
        <div className="absolute right-[-180px] top-[30%] h-[500px] w-[500px] rounded-full bg-red-700/[0.045] blur-[150px]" />
        <div className="absolute bottom-[-220px] left-[-160px] h-[560px] w-[560px] rounded-full bg-orange-500/[0.04] blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,transparent_0%,rgba(0,0,0,.35)_45%,#030303_100%)]" />
      </div>

      {/* Grain */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.028]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Navigation */}
      <header className="relative z-20 border-b border-white/[0.06]">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 md:px-10 md:py-7">
          <Link
            href="/"
            className="group flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.32em] text-white/40 transition hover:text-white"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>
            Back to RAAKA
          </Link>

          <Link
            href="/"
            className="text-[11px] font-black tracking-[0.55em] text-white"
          >
            RAAKA
          </Link>

          <div className="hidden text-[9px] font-medium uppercase tracking-[0.3em] text-white/25 sm:block">
            Fan Circle / 2026
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-[1400px] px-6 pb-20 pt-20 md:px-10 md:pb-28 md:pt-28">
        <div className="grid items-end gap-12 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="mb-8 flex items-center gap-4">
              <span className="h-px w-14 bg-orange-500" />
              <span className="text-[9px] font-bold uppercase tracking-[0.48em] text-orange-400">
                The RAAKA Fan Circle
              </span>
            </div>

            <h1 className="max-w-5xl text-[clamp(4rem,11vw,10.5rem)] font-black uppercase leading-[0.76] tracking-[-0.085em]">
              <span className="block">ONE</span>
              <span
                className="block text-transparent"
                style={{
                  WebkitTextStroke: "1px rgba(255,255,255,.38)",
                  backgroundImage:
                    "linear-gradient(180deg,#fff 0%,#bdbdbd 48%,#4a4a4a 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  textShadow: "0 0 55px rgba(249,115,22,.10)",
                }}
              >
                CIRCLE
              </span>
            </h1>

            <div className="mt-9 flex items-center gap-3">
              <span className="h-[3px] w-20 bg-orange-500 shadow-[0_0_22px_rgba(249,115,22,.75)] md:w-32" />
              <span className="h-2 w-2 rotate-45 bg-orange-400" />
              <span className="h-px w-24 bg-gradient-to-r from-orange-500/70 to-transparent md:w-52" />
            </div>

            <p className="mt-8 max-w-2xl text-sm leading-7 text-white/45 md:text-base md:leading-8">
              Not a leaderboard. Not a list. A living wall of voices that
              keep the RAAKA universe alive — one post, one theory, one
              celebration at a time.
            </p>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -inset-8 rounded-full bg-orange-500/[0.05] blur-3xl" />
            <div className="relative border-l border-white/10 pl-8">
              <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-orange-400/70">
                Community Archive
              </p>
              <p className="mt-5 text-7xl font-black tracking-[-0.07em]">
                {String(fans.length).padStart(2, "0")}
              </p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.35em] text-white/25">
                Featured voices
              </p>
              <p className="mt-7 max-w-xs text-xs leading-6 text-white/30">
                Different handles. Different stories. One universe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statement strip */}
      <section className="relative z-10 border-y border-white/[0.07] bg-white/[0.018]">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-8 px-6 py-6 md:px-10">
          <div>
            <p className="font-mono text-[8px] uppercase tracking-[0.4em] text-white/25">
              The Circle
            </p>
            <p className="mt-1 text-sm font-medium text-white/70">
              Voices of RAAKA
            </p>
          </div>

          <p className="hidden text-right text-[8px] uppercase tracking-[0.3em] text-white/20 sm:block">
            No ranks <span className="mx-2 text-orange-500/60">•</span> No
            hierarchy <span className="mx-2 text-orange-500/60">•</span> Just
            fandom
          </p>
        </div>
      </section>

      {/* Fan wall */}
      <section className="relative z-10 mx-auto max-w-[1400px] px-6 py-20 md:px-10 md:py-28">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.38em] text-orange-400/70">
              001 — The Wall
            </p>
            <h2 className="text-3xl font-black uppercase tracking-[-0.04em] md:text-5xl">
              The voices.
            </h2>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <span className="h-px w-16 bg-white/10" />
            <span className="text-[8px] uppercase tracking-[0.3em] text-white/25">
              Open profile ↗
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {fans.map((fan, index) => {
            const username = fan.username.replace("@", "");

            return (
              <a
                key={fan.username}
                href={`https://x.com/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative min-h-[250px] overflow-hidden rounded-[1.6rem] border border-white/[0.08] bg-gradient-to-br from-white/[0.055] to-white/[0.018] p-5 transition-all duration-500 hover:-translate-y-1.5 hover:border-orange-500/30 hover:shadow-[0_25px_70px_rgba(0,0,0,.45)]"
              >
                <div className="absolute right-0 top-0 h-40 w-40 translate-x-12 -translate-y-12 rounded-full bg-orange-500/[0.10] blur-3xl opacity-0 transition duration-500 group-hover:opacity-100" />

                <div className="relative flex items-start justify-between">
                  <div className="relative h-14 w-14 overflow-hidden rounded-full border border-white/15 bg-black shadow-[0_0_0_5px_rgba(255,255,255,.025)]">
                    <img
                      src={avatarUrl(username)}
                      alt={`${fan.name} profile`}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[8px] text-white/15">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/40 transition group-hover:border-orange-400/30 group-hover:text-white">
                      <span className="h-3.5 w-3.5">
                        <XIcon />
                      </span>
                    </span>
                  </div>
                </div>

                <div className="relative mt-8">
                  <p className="truncate text-[15px] font-bold tracking-tight text-white transition group-hover:text-white">
                    {fan.name}
                  </p>
                  <p className="mt-1 truncate text-[11px] text-white/35">
                    {fan.username}
                  </p>

                  <div className="mt-5 flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,.8)]" />
                    <span className="text-[8px] font-bold uppercase tracking-[0.28em] text-orange-400/60">
                      {fan.role}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-2 text-[11px] leading-5 text-white/25 transition group-hover:text-white/40">
                    {fan.bio}
                  </p>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-px bg-white/[0.06]">
                  <div className="h-full w-0 bg-gradient-to-r from-orange-500 via-orange-400 to-transparent transition-all duration-700 group-hover:w-full" />
                </div>
              </a>
            );
          })}
        </div>
      </section>
      {/* FAN CIRCLE COMMUNITY NOTICE */}
<section className="px-5 pb-8 md:px-10 md:pb-12">
  <div className="mx-auto max-w-7xl">
    <div className="relative overflow-hidden rounded-2xl border border-orange-400/20 bg-orange-500/[0.06] px-5 py-5 backdrop-blur-xl md:px-7">
      
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />

      <div className="relative flex gap-4">
        
        {/* Icon */}
        <div className="mt-0.5 shrink-0 text-orange-400">
          💛
        </div>

        {/* Content */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-white">
            Fan Circle — A Little Note
          </h3>

          <p className="mt-2 text-sm leading-6 text-white/60">
            If you’ve uploaded Fan Art on{" "}
            <span className="font-semibold text-white/80">
              worldofraaka.online
            </span>
            , regularly visit the website, or have supported/promoted the
            website on X, we’d love to hear from you.
          </p>

          <p className="mt-2 text-sm leading-6 text-white/60">
            Simply reply under any tweet from{" "}
            <span className="font-semibold text-orange-300">
              @WorldOfRaaka
            </span>
            {" "}and let us know. Your name may be featured in a future{" "}
            <span className="font-semibold text-white/80">
              Fan Circle / Supporters
            </span>
            {" "}section on World of RAAKA.
          </p>

          <p className="mt-3 text-xs leading-5 text-orange-200/60">
            Thank you for being part of the journey. Every fan matters. ❤️
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* Manifesto */}
      <section className="relative z-10 mx-auto max-w-[1400px] px-6 pb-20 md:px-10 md:pb-28">
        <div className="relative overflow-hidden rounded-[2rem] border border-orange-500/15 bg-gradient-to-br from-orange-500/[0.09] via-white/[0.025] to-transparent px-7 py-14 md:px-14 md:py-20">
          <div className="pointer-events-none absolute left-1/2 top-[-100px] h-64 w-[500px] -translate-x-1/2 rounded-full bg-orange-500/[0.10] blur-[100px]" />

          <div className="relative grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-orange-400/70">
                002 — The Manifesto
              </p>

              <h2 className="mt-5 max-w-4xl text-4xl font-black uppercase leading-[0.95] tracking-[-0.05em] md:text-6xl">
                The film has a world.
                <br />
                <span className="text-white/35">The world has a fandom.</span>
              </h2>

              <p className="mt-6 max-w-2xl text-sm leading-7 text-white/35">
                This circle exists to celebrate the people behind the noise —
                the fans who turn anticipation into energy and a movie into a
                universe.
              </p>
            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-orange-400/20 bg-orange-500/[0.06] text-2xl shadow-[0_0_40px_rgba(249,115,22,.08)]">
              ✦
            </div>
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="relative z-10 border-t border-white/[0.06]">
        <div className="mx-auto max-w-[1400px] px-6 py-20 text-center md:px-10 md:py-28">
          <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-orange-400/60">
            The circle keeps growing
          </p>

          <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-black uppercase tracking-[-0.05em] md:text-6xl">
            Your voice could be next.
          </h2>

          <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-white/30">
            Keep creating. Keep talking. Keep the RAAKA universe alive.
          </p>

          <Link
            href="/"
            className="group mt-9 inline-flex items-center gap-4 rounded-full border border-white/10 bg-white/[0.045] px-7 py-3.5 text-[9px] font-bold uppercase tracking-[0.3em] text-white/65 transition duration-300 hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-white"
          >
            Explore RAAKA
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-6 py-8 text-center md:flex-row md:items-center md:justify-between md:px-10 md:text-left">
          <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-white/20">
            World of RAAKA
          </p>

          <p className="text-[8px] uppercase tracking-[0.22em] text-white/15">
            Fan-created • Independent • Not officially affiliated
          </p>
        </div>
      </footer>
    </main>
  );
}
