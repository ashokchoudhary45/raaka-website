import Link from "next/link";

const languageCards = [
  {
    language: "Telugu",
    short: "TEL",
    status: "Coming Soon",
    details: [
      "Day-wise India collection",
      "Day-wise worldwide collection",
      "Opening day & weekend",
      "Total India & worldwide",
    ],
  },
  {
    language: "Hindi",
    short: "HIN",
    status: "Coming Soon",
    details: [
      "Day-wise India collection",
      "Day-wise worldwide collection",
      "Opening day & weekend",
      "Total India & worldwide",
    ],
  },
  {
    language: "Tamil",
    short: "TAM",
    status: "Coming Soon",
    details: [
      "Day-wise India collection",
      "Day-wise worldwide collection",
      "Opening day & weekend",
      "Total India & worldwide",
    ],
  },
  {
    language: "Kannada",
    short: "KAN",
    status: "Coming Soon",
    details: [
      "Day-wise India collection",
      "Day-wise worldwide collection",
      "Opening day & weekend",
      "Total India & worldwide",
    ],
  },
  {
    language: "Malayalam",
    short: "MAL",
    status: "Coming Soon",
    details: [
      "Day-wise India collection",
      "Day-wise worldwide collection",
      "Opening day & weekend",
      "Total India & worldwide",
    ],
  },
];

const territories = [
  "Andhra Pradesh",
  "Telangana",
  "Karnataka",
  "Tamil Nadu",
  "Kerala",
  "Rest of India",
  "Overseas",
];

const worldwideSections = [
  {
    title: "Day 1",
    label: "Worldwide",
    value: "Coming Soon",
  },
  {
    title: "Day 2",
    label: "Worldwide",
    value: "Coming Soon",
  },
  {
    title: "Day 3",
    label: "Worldwide",
    value: "Coming Soon",
  },
  {
    title: "Day 4",
    label: "Worldwide",
    value: "Coming Soon",
  },
  {
    title: "Day 5",
    label: "Worldwide",
    value: "Coming Soon",
  },
  {
    title: "Day 6",
    label: "Worldwide",
    value: "Coming Soon",
  },
  {
    title: "Day 7",
    label: "Worldwide",
    value: "Coming Soon",
  },
];

export default function BoxOfficePage() {
  return (
    <main className="min-h-screen bg-black text-white">

      {/* HERO */}
      <section className="relative min-h-[78vh] overflow-hidden border-b border-white/10">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.12),transparent_38%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_30%,#000_100%)]" />

        <div className="relative mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-end px-6 pb-16 pt-10 md:px-12 md:pb-24">

          <Link
            href="/"
            className="absolute left-6 top-8 text-xs uppercase tracking-[0.25em] text-white/35 transition hover:text-white md:left-12 md:top-10"
          >
            ← Back to World of RAAKA
          </Link>

          <div className="max-w-5xl">

            <p className="text-xs uppercase tracking-[0.45em] text-white/35">
              RAAKA · Box Office
            </p>

            <h1 className="mt-5 text-6xl font-black uppercase leading-[0.88] tracking-[-0.05em] md:text-8xl lg:text-[9rem]">
              Box
              <span className="block text-white/25">
                Office
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-sm leading-7 text-white/55 md:text-base">
              A dedicated worldwide box office archive for RAAKA, designed to
              track collections across every major language, territory and day.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#worldwide"
                className="rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-black transition hover:bg-white/90"
              >
                Worldwide Collection
              </a>

              <a
                href="#languages"
                className="rounded-full border border-white/20 px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white/70 transition hover:border-white/40 hover:bg-white/10 hover:text-white"
              >
                All Languages
              </a>
            </div>

          </div>

          {/* QUICK STATS */}
          <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:mt-20 md:grid-cols-4">

            <div className="bg-black/80 p-5 md:p-7">
              <p className="text-2xl font-black md:text-4xl">—</p>
              <p className="mt-2 text-[9px] uppercase tracking-[0.22em] text-white/30">
                Worldwide
              </p>
            </div>

            <div className="bg-black/80 p-5 md:p-7">
              <p className="text-2xl font-black md:text-4xl">—</p>
              <p className="mt-2 text-[9px] uppercase tracking-[0.22em] text-white/30">
                India Gross
              </p>
            </div>

            <div className="bg-black/80 p-5 md:p-7">
              <p className="text-2xl font-black md:text-4xl">—</p>
              <p className="mt-2 text-[9px] uppercase tracking-[0.22em] text-white/30">
                Overseas
              </p>
            </div>

            <div className="bg-black/80 p-5 md:p-7">
              <p className="text-2xl font-black md:text-4xl">TBA</p>
              <p className="mt-2 text-[9px] uppercase tracking-[0.22em] text-white/30">
                Final Verdict
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* WORLDWIDE DAY-WISE */}
      <section
        id="worldwide"
        className="mx-auto max-w-7xl px-6 py-16 md:px-12 md:py-24"
      >

        <div className="mb-10 flex flex-col justify-between gap-5 md:mb-14 md:flex-row md:items-end">

          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/30">
              Official Day-Wise Worldwide
            </p>

            <h2 className="mt-3 text-3xl font-bold uppercase tracking-tight md:text-5xl">
              Worldwide Posters
            </h2>
          </div>

          <span className="w-fit rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[9px] uppercase tracking-[0.2em] text-white/35">
            Coming Soon
          </span>

        </div>

        <p className="mb-8 max-w-3xl text-sm leading-7 text-white/45">
          Official day-wise worldwide collection posters will be added here.
          Each poster can be connected to its detailed collection page, making
          the complete theatrical run easy to follow day by day.
        </p>


        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {worldwideSections.map((item) => (

            <article
              key={item.title}
              className="group relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/10 bg-zinc-950"
            >

              {/* POSTER PLACEHOLDER */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(255,255,255,0.08),transparent_40%)]" />

              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/80 to-transparent" />

              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">

                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
                  <span className="text-xl text-white/30">+</span>
                </div>

                <p className="mt-5 text-[9px] uppercase tracking-[0.3em] text-white/25">
                  Official Poster
                </p>

                <p className="mt-2 text-2xl font-black uppercase">
                  {item.title}
                </p>

                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/35">
                  {item.label}
                </p>

                <p className="mt-5 rounded-full border border-white/10 px-4 py-2 text-[9px] uppercase tracking-[0.18em] text-white/30">
                  {item.value}
                </p>

              </div>

            </article>

          ))}

        </div>

      </section>


      {/* LANGUAGE BREAKDOWN */}
      <section
        id="languages"
        className="border-y border-white/10 bg-white/[0.015]"
      >

        <div className="mx-auto max-w-7xl px-6 py-16 md:px-12 md:py-24">

          <div className="max-w-3xl">

            <p className="text-xs uppercase tracking-[0.35em] text-white/30">
              Language-Wise Tracking
            </p>

            <h2 className="mt-3 text-3xl font-bold uppercase tracking-tight md:text-5xl">
              Every Language. Every Collection.
            </h2>

            <p className="mt-5 text-sm leading-7 text-white/45">
              Separate collection tracking for every major release language.
              Once figures are available, each section can show daily gross,
              running total, opening weekend, India total and worldwide total.
            </p>

          </div>


          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            {languageCards.map((item, index) => (

              <article
                key={item.language}
                className="group rounded-3xl border border-white/10 bg-black p-6 transition hover:border-white/20 md:p-7"
              >

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-[9px] uppercase tracking-[0.3em] text-white/25">
                      {String(index + 1).padStart(2, "0")} · {item.short}
                    </p>

                    <h3 className="mt-3 text-2xl font-bold">
                      {item.language}
                    </h3>

                  </div>

                  <span className="rounded-full border border-white/10 px-3 py-1.5 text-[8px] uppercase tracking-[0.15em] text-white/30">
                    {item.status}
                  </span>

                </div>


                <div className="mt-7 space-y-3">

                  {item.details.map((detail) => (

                    <div
                      key={detail}
                      className="flex items-center gap-3 text-xs text-white/45"
                    >
                      <span className="h-1 w-1 rounded-full bg-white/30" />
                      {detail}
                    </div>

                  ))}

                </div>


                <div className="mt-7 border-t border-white/10 pt-5">

                  <div className="flex items-end justify-between">

                    <div>
                      <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                        Current Total
                      </p>

                      <p className="mt-1 text-xl font-bold">
                        —
                      </p>
                    </div>

                    <span className="text-xs text-white/20">
                      TBA
                    </span>

                  </div>

                </div>

              </article>

            ))}

          </div>

        </div>

      </section>


      {/* INDIA TERRITORIES */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-12 md:py-24">

        <div className="mb-10 md:mb-14">

          <p className="text-xs uppercase tracking-[0.35em] text-white/30">
            India Territory Breakdown
          </p>

          <h2 className="mt-3 text-3xl font-bold uppercase tracking-tight md:text-5xl">
            Territory Wise
          </h2>

        </div>


        <div className="grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">

          {territories.map((territory) => (

            <div
              key={territory}
              className="bg-zinc-950 p-6 transition hover:bg-zinc-900 md:p-7"
            >

              <p className="text-sm font-semibold">
                {territory}
              </p>

              <p className="mt-5 text-3xl font-black">
                —
              </p>

              <div className="mt-3 flex items-center justify-between text-[9px] uppercase tracking-[0.15em] text-white/25">
                <span>Gross</span>
                <span>Coming Soon</span>
              </div>

            </div>

          ))}

        </div>

      </section>


      {/* COLLECTION DASHBOARD */}
      <section className="border-y border-white/10 bg-white/[0.02]">

        <div className="mx-auto max-w-7xl px-6 py-16 md:px-12 md:py-24">

          <div className="grid gap-6 lg:grid-cols-3">

            <div className="rounded-3xl border border-white/10 bg-black p-7 md:p-9">

              <p className="text-[9px] uppercase tracking-[0.3em] text-white/25">
                Opening Day
              </p>

              <p className="mt-5 text-5xl font-black">
                —
              </p>

              <p className="mt-2 text-xs text-white/30">
                Worldwide gross
              </p>

            </div>


            <div className="rounded-3xl border border-white/10 bg-black p-7 md:p-9">

              <p className="text-[9px] uppercase tracking-[0.3em] text-white/25">
                Opening Weekend
              </p>

              <p className="mt-5 text-5xl font-black">
                —
              </p>

              <p className="mt-2 text-xs text-white/30">
                Worldwide gross
              </p>

            </div>


            <div className="rounded-3xl border border-white/10 bg-black p-7 md:p-9">

              <p className="text-[9px] uppercase tracking-[0.3em] text-white/25">
                Lifetime
              </p>

              <p className="mt-5 text-5xl font-black">
                TBA
              </p>

              <p className="mt-2 text-xs text-white/30">
                Final worldwide gross
              </p>

            </div>

          </div>


          <div className="mt-6 rounded-3xl border border-white/10 bg-black p-7 md:p-9">

            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

              <div>

                <p className="text-[9px] uppercase tracking-[0.3em] text-white/25">
                  Tracking Method
                </p>

                <h3 className="mt-3 text-2xl font-bold">
                  Worldwide Collection Archive
                </h3>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/40">
                  Daily figures, language-wise totals, territory breakdowns,
                  opening milestones and lifetime collections can all be
                  maintained from this single archive.
                </p>

              </div>

              <div className="shrink-0 rounded-2xl border border-white/10 px-5 py-4 text-center">
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                  Status
                </p>
                <p className="mt-2 text-sm font-semibold">
                  Awaiting Official Figures
                </p>
              </div>

            </div>

          </div>

        </div>

      </section>


      {/* SOURCES / NOTE */}
      <section className="mx-auto max-w-4xl px-6 py-16 text-center md:py-24">

        <p className="text-[9px] uppercase tracking-[0.35em] text-white/25">
          Data Policy
        </p>

        <h2 className="mt-4 text-2xl font-bold md:text-3xl">
          Official Figures First
        </h2>

        <p className="mt-5 text-sm leading-7 text-white/40">
          Collection figures should be added only after verification from the
          intended official or clearly identified source. Unverified estimates
          should not be presented as official numbers.
        </p>

      </section>


      {/* FOOTER */}
      <footer className="border-t border-white/10">

        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-10 md:flex-row md:items-center md:justify-between md:px-12">

          <div>

            <p className="text-sm font-bold tracking-[0.15em]">
              WORLD OF RAAKA
            </p>

            <p className="mt-2 text-xs text-white/25">
              RAAKA Box Office Archive
            </p>

          </div>

          <Link
            href="/"
            className="text-xs uppercase tracking-[0.2em] text-white/35 transition hover:text-white"
          >
            Back to Home →
          </Link>

        </div>

      </footer>

    </main>
  );
}