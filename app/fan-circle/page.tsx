import Link from "next/link";

const fans = [
  "@RajMav07",
  "@SRKsRajput",
  "@bhAAiCults",
  "@rounakdaa",
  "@Corleoneei",
  "@AaoGhumaKLeLu",
  "@prashantAADHF",
  "@sankalphqtweets",
  "@SakethforRaaka",
  "@sanjay_gormat",
  "@sanket808004",
  "@duaflora",
];

export default function FanCirclePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] text-white">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-0">
        <div className="absolute left-1/2 top-[-20%] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-orange-600/[0.07] blur-[140px]" />
        <div className="absolute bottom-[-15%] left-[-10%] h-[450px] w-[450px] rounded-full bg-red-700/[0.05] blur-[130px]" />
      </div>

      {/* Subtle grain */}
      <div
        className="pointer-events-none fixed inset-0 -z-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.8'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Top navigation */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-10 md:py-8">
        <Link
          href="/"
          className="group flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/50 transition hover:text-white"
        >
          <span className="transition-transform duration-300 group-hover:-translate-x-1">
            ←
          </span>
          Back to RAAKA
        </Link>

        <div className="font-mono text-[9px] uppercase tracking-[0.35em] text-white/25">
          Fan Community
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-16 pt-16 md:px-10 md:pb-24 md:pt-24">
        <div className="max-w-4xl">
          {/* Eyebrow */}
          <div className="mb-7 flex items-center gap-4">
            <span className="h-px w-12 bg-gradient-to-r from-orange-500 to-orange-500/0" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.45em] text-orange-400/80">
              The RAAKA Fan Circle
            </span>

            <span className="h-px w-20 bg-gradient-to-r from-orange-500/0 to-orange-500/30" />
          </div>

          {/* Main heading */}
          <h1 className="text-[clamp(3.8rem,11vw,9rem)] font-black uppercase leading-[0.78] tracking-[-0.075em]">
            <span className="block text-white">ONE</span>

            <span
              className="block text-transparent"
              style={{
                WebkitTextStroke: "1px rgba(255,255,255,0.35)",
                backgroundImage:
                  "linear-gradient(180deg, #ffffff 0%, #d8d8d8 42%, #666666 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                textShadow:
                  "0 12px 35px rgba(0,0,0,.9), 0 0 45px rgba(249,115,22,.12)",
              }}
            >
              UNIVERSE
            </span>
          </h1>

          {/* Orange accent */}
          <div className="mt-8 flex items-center gap-3">
            <span className="h-[3px] w-20 bg-orange-500 shadow-[0_0_18px_rgba(249,115,22,.65)] md:w-28" />
            <span className="h-2 w-2 rotate-45 bg-orange-400 shadow-[0_0_16px_rgba(249,115,22,.8)]" />
            <span className="h-px w-32 bg-gradient-to-r from-orange-500/60 to-transparent md:w-52" />
          </div>

          <p className="mt-8 max-w-2xl text-sm leading-7 text-white/50 md:text-base md:leading-8">
            The voices, creators and passionate fans who make the world of
            RAAKA bigger with every post, edit, theory and conversation.
          </p>
        </div>
      </section>

      {/* Fan count strip */}
      <section className="relative z-10 border-y border-white/[0.07] bg-white/[0.015]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-6 md:flex-row md:items-center md:justify-between md:px-10">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-white/30">
              Featured Community
            </p>
            <p className="mt-1 text-sm text-white/65">
              The RAAKA Fan Circle
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-2xl font-bold tracking-tight text-white">
              {fans.length}
            </span>

            <span className="text-[9px] uppercase tracking-[0.3em] text-white/30">
              Voices
            </span>
          </div>
        </div>
      </section>

      {/* Fans */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.35em] text-orange-400/70">
              The Circle
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              Voices of RAAKA
            </h2>
          </div>

          <div className="hidden text-right md:block">
            <p className="text-[9px] uppercase tracking-[0.25em] text-white/25">
              No rankings
            </p>
            <p className="mt-1 text-[9px] uppercase tracking-[0.25em] text-white/25">
              One community
            </p>
          </div>
        </div>

        {/* Equal fan cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {fans.map((fan) => {
            const username = fan.replace("@", "");

            return (
              <a
                key={fan}
                href={`https://x.com/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition-all duration-500 hover:-translate-y-1 hover:border-orange-500/30 hover:bg-white/[0.045]"
              >
                {/* Hover glow */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-orange-500/[0.08] blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative flex items-center justify-between">
                  {/* X mark */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-sm font-bold text-white/70 transition group-hover:border-orange-400/30 group-hover:text-white">
                    𝕏
                  </div>

                  {/* Arrow */}
                  <span className="text-sm text-white/20 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-orange-400">
                    ↗
                  </span>
                </div>

                <div className="relative mt-7">
                  <p className="text-base font-semibold tracking-tight text-white/85 transition group-hover:text-white">
                    {fan}
                  </p>

                  <p className="mt-2 text-[8px] font-medium uppercase tracking-[0.28em] text-white/25 transition group-hover:text-orange-400/60">
                    RAAKA Fan
                  </p>
                </div>

                {/* Bottom accent */}
                <div className="mt-6 h-px w-full overflow-hidden bg-white/[0.06]">
                  <div className="h-full w-0 bg-gradient-to-r from-orange-500 to-transparent transition-all duration-500 group-hover:w-full" />
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* Join CTA */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-20 md:px-10 md:pb-28">
        <div className="relative overflow-hidden rounded-3xl border border-orange-500/15 bg-gradient-to-br from-orange-500/[0.08] via-white/[0.025] to-transparent px-6 py-12 text-center md:px-12 md:py-16">
          <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-72 -translate-x-1/2 rounded-full bg-orange-500/[0.08] blur-[70px]" />

          <p className="relative font-mono text-[9px] uppercase tracking-[0.4em] text-orange-400/70">
            The circle keeps growing
          </p>

          <h2 className="relative mt-4 text-3xl font-black uppercase tracking-tight text-white md:text-5xl">
            The story is just beginning.
          </h2>

          <p className="relative mx-auto mt-5 max-w-xl text-sm leading-7 text-white/40">
            Every fan adds another voice to the universe of RAAKA.
          </p>

          <Link
            href="/"
            className="relative mt-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-[9px] font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-white"
          >
            Explore RAAKA
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] px-6 py-8 md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <p className="text-[9px] uppercase tracking-[0.25em] text-white/20">
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