export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white md:px-12">
      <div className="mx-auto max-w-4xl">

        <a
          href="/"
          className="mb-10 inline-block text-sm text-white/50 transition hover:text-white"
        >
          ← Back to Home
        </a>

        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-white/40">
          Contact
        </p>

        <h1 className="text-4xl font-bold md:text-6xl">
          Get in Touch
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-8 text-white/60">
          For questions, suggestions, corrections, fan art, collaborations or
          other website-related matters, you can reach us through the details
          below.
        </p>

        {/* WORLD OF RAAKA */}
        <section className="mt-12 rounded-2xl border border-white/10 bg-zinc-950 p-7 md:p-10">

          <p className="text-xs uppercase tracking-[0.3em] text-white/35">
            Fan Community
          </p>

          <h2 className="mt-3 text-2xl font-bold md:text-3xl">
            World of RAAKA
          </h2>

          <div className="mt-8 space-y-5">

            {/* Email */}
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/35">
                Email
              </p>

              <a
                href="mailto:worldofraaka@gmail.com"
                className="mt-1 inline-block text-base text-white/80 transition hover:text-white"
              >
                worldofraaka@gmail.com
              </a>
            </div>

            {/* Instagram */}
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/35">
                Instagram
              </p>

              <a
                href="https://www.instagram.com/worldofraaka?stkn=MWJ5bmt2bGkybHE5Yg=="
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-base text-white/80 transition hover:text-white"
              >
                @worldofraaka
              </a>
            </div>

            {/* Twitter / X */}
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/35">
                Twitter / X
              </p>

              <div className="mt-3 space-y-5">

                <div>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-white/30">
                    World of RAAKA
                  </p>

                  <a
                    href="https://x.com/WorldOfRaaka"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-base text-white/80 transition hover:text-white"
                  >
                    @WorldOfRaaka
                  </a>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-white/30">
                    Fan Community
                  </p>

                  <a
                    href="https://x.com/DracoUnbothered"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-base text-white/80 transition hover:text-white"
                  >
                    @DracoUnbothered
                  </a>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* WEBSITE CREATOR */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-zinc-950 p-7 md:p-10">

          <p className="text-xs uppercase tracking-[0.3em] text-white/35">
            Website Creator
          </p>

          <h2 className="mt-3 text-2xl font-bold md:text-3xl">
            Website Creator
          </h2>

          <div className="mt-8 space-y-5">

            {/* Email */}
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/35">
                Email
              </p><a
                href="mailto:worldofraakaverse@gmail.com"
                className="mt-1 inline-block text-base text-white/80 transition hover:text-white"
              >
                worldofraakaverse@gmail.com
              </a>
            </div>

            {/* Instagram */}
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/35">
                Instagram
              </p>

              <a
                href="https://www.instagram.com/45_.editz?stkn=c3NrbGkyZDVtOHFm"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-base text-white/80 transition hover:text-white"
              >
                @45_.editz
              </a>
            </div>

            {/* Twitter / X */}
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/35">
                Twitter / X
              </p>

              <a
                href="https://x.com/Cricvizanalys"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-base text-white/80 transition hover:text-white"
              >
                @Cricvizanalys
              </a>
            </div>

          </div>
        </section>

        {/* DISCLAIMER */}
        <div className="mt-10 border-t border-white/10 pt-6">
          <p className="text-xs leading-6 text-white/35">
            The World of RAAKA is an independent fan-created website and is
            not officially affiliated with the filmmakers, actors, production
            companies or distributors associated with RAAKA.
          </p>
        </div>

      </div>
    </main>
  );
}