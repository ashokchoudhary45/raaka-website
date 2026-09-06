import Link from "next/link";

const awardGroups = [
  {
    name: "National Film Award",
    icon: "🇮🇳",
    wins: 1,
    featured: true,
    rows: [
      ["2023", "Pushpa: The Rise", "Best Actor"],
    ],
    note: "This was Allu Arjun's first National Film Award, and according to the supplied list, he became the first Telugu actor to win Best Actor.",
  },

  {
    name: "Filmfare Awards South",
    icon: "🏆",
    wins: 7,
    rows: [
      ["2009", "Parugu", "Best Actor – Telugu"],
      ["2011", "Vedam", "Best Actor – Telugu"],
      ["2015", "Race Gurram", "Best Actor – Telugu"],
      ["2016", "Rudhramadevi", "Best Supporting Actor – Telugu"],
      ["2017", "Sarrainodu", "Critics' Best Actor – Telugu"],
      ["2022", "Pushpa: The Rise", "Best Actor – Telugu"],
      ["2026", "Pushpa 2: The Rule", "Best Actor – Telugu"],
    ],
  },

  {
    name: "SIIMA",
    icon: "🏆",
    wins: 5,
    rows: [
      ["2015", "Race Gurram", "Stylish Youth Icon of South Indian Cinema – Male"],
      ["2016", "Rudhramadevi", "Best Actor – Critics, Telugu"],
      ["2021", "Ala Vaikunthapurramuloo", "Best Actor – Telugu"],
      ["2022", "Pushpa: The Rise", "Best Actor – Telugu"],
      ["2025", "Pushpa 2: The Rule", "Best Actor – Telugu"],
    ],
  },

  {
    name: "Nandi Awards",
    icon: "🏆",
    wins: 5,
    rows: [
      ["2003", "Gangotri", "Special Jury Award"],
      ["2004", "Arya", "Special Jury Award"],
      ["2008", "Parugu", "Special Jury Award"],
      ["2010", "Vedam", "Special Jury Award"],
      ["2015", "Rudhramadevi", "Best Character Actor"],
    ],
  },

  {
    name: "IIFA Utsavam",
    icon: "🏆",
    wins: 1,
    rows: [
      ["2017", "Rudhramadevi", "Performance in a Supporting Role – Male"],
    ],
  },

  {
    name: "CineMAA Awards",
    icon: "🎬",
    wins: 6,
    rows: [
      ["2004", "Gangotri", "Best Male Debut"],
      ["2005", "Arya", "Best Actor – Jury"],
      ["2008", "Desamuduru", "Best Actor – Jury"],
      ["2009", "Parugu", "Best Actor"],
      ["2015", "Race Gurram", "Best Actor"],
      ["2016", "Rudhramadevi", "Best Actor – Jury"],
    ],
  },

  {
    name: "Gaddar Telangana Film Awards",
    icon: "🏆",
    wins: 1,
    rows: [
      ["2025", "Pushpa 2: The Rule", "Best Actor"],
    ],
  },

  {
    name: "Sakshi Excellence Awards",
    icon: "🏆",
    wins: 4,
    rows: [
      ["2017", "Sarrainodu", "Most Popular Actor of the Year – Male"],
      ["2021", "Ala Vaikunthapurramuloo", "Most Popular Actor of the Year – Male"],
      ["2022", "Pushpa: The Rise", "Most Popular Actor of the Year – Male"],
      ["2025", "Pushpa 2: The Rule", "Most Popular Actor of the Year – Male"],
    ],
  },

  {
    name: "Santosham Film Awards",
    icon: "🏆",
    wins: 4,
    rows: [
      ["2004", "Gangotri", "Best Male Debut"],
      ["2005", "Arya", "Best Young Performer"],
      ["2006", "Bunny", "Best Young Performer"],
      ["2021", "Pushpa: The Rise", "Best Actor"],
    ],
  },

  {
    name: "TSR–TV9 National Film Awards",
    icon: "🏆",
    wins: 3,
    rows: [
      ["2015", "Race Gurram", "Best Hero"],
      ["2017", "S/O Satyamurthy", "Best Hero"],
      ["2017", "Rudhramadevi", "Best Outstanding Performance"],
    ],
  },

  {
    name: "Mirchi Music Awards South",
    icon: "🎵",
    wins: 1,
    rows: [
      ["2015", "Race Gurram", "Youth Icon of the Year"],
    ],
  },

  {
    name: "South Scope Lifestyle Awards",
    icon: "🏆",
    wins: 3,
    rows: [
      ["2009", "Parugu", "Best Actor"],
      ["2010", "Arya 2", "Best Stylish Actor"],
      ["2011", "Vedam", "Best Actor"],
    ],
  },

  {
    name: "GAMA Awards",
    icon: "🏆",
    wins: 1,
    rows: [
      ["2025", "Pushpa: The Rise", "Best Actor"],
    ],
  },

  {
    name: "Zee Cine Awards Telugu",
    icon: "🏆",
    wins: 1,
    rows: [
      ["2017", "DJ: Duvvada Jagannadham", "Favourite Actor"],
    ],
  },
];

const totalWins = awardGroups.reduce((sum, group) => sum + group.wins, 0);

export default function AlluArjunAwardsPage() {
  return (
    <main className="min-h-screen bg-black text-white">

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.10),transparent_45%)]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-8 md:px-12 md:pb-28 md:pt-12">

          <Link
            href="/"
            className="inline-flex text-xs uppercase tracking-[0.25em] text-white/40 transition hover:text-white"
          >
            ← Back to World of RAAKA
          </Link>

          <div className="mt-20 max-w-5xl md:mt-28">

            <p className="text-xs uppercase tracking-[0.45em] text-white/35">
              Allu Arjun
            </p>

            <h1 className="mt-4 text-5xl font-black uppercase leading-[0.9] tracking-[-0.04em] md:text-8xl lg:text-9xl">
              Awards
              <span className="block text-white/30">
                & Achievements
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-sm leading-7 text-white/50 md:text-base">
              A complete collection of Allu Arjun's award wins,
              presented award-body-wise and chronologically.
            </p>

          </div>

          {/* STATS */}
          <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:mt-20 md:grid-cols-3">

            <div className="bg-black/80 p-6 md:p-8">
              <p className="text-4xl font-black md:text-6xl">
                {totalWins}
              </p>

              <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-white/35">
                Total Wins
              </p>
            </div>

            <div className="bg-black/80 p-6 md:p-8">
              <p className="text-4xl font-black md:text-6xl">
                {awardGroups.length}
              </p>

              <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-white/35">
                Award Bodies
              </p>
            </div>

            <div className="col-span-2 bg-black/80 p-6 md:col-span-1 md:p-8">
              <p className="text-4xl font-black md:text-6xl">
                2003–2026
              </p>

              <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-white/35">
                Career Span
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* AWARDS */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-12 md:py-24">

        <div className="mb-10 md:mb-14">

          <p className="text-xs uppercase tracking-[0.35em] text-white/30">
            Career Record
          </p>

          <h2 className="mt-3 text-3xl font-bold uppercase tracking-tight md:text-5xl">
            Award Wins
          </h2>

        </div>


        <div className="grid gap-6 md:grid-cols-2">

          {awardGroups.map((group, index) => (

            <article
              key={group.name}
              className={`group overflow-hidden rounded-3xl border ${
                group.featured
                  ? "border-white/25 bg-white/[0.07] md:col-span-2"
                  : "border-white/10 bg-zinc-950"
              }`}
            >

              {/* CARD HEADER */}
              <div className="border-b border-white/10 p-6 md:p-8">

                <div className="flex items-start justify-between gap-5">

                  <div className="flex min-w-0 items-start gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-xl">
                      {group.icon}
                    </div>

                    <div className="min-w-0">

                      <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-white/25">
                        {String(index + 1).padStart(2, "0")}
                      </p>

                      <h3 className="text-xl font-bold leading-tight md:text-2xl">
                        {group.name}
                      </h3>

                    </div>

                  </div>


                  <div className="shrink-0 text-right">

                    <p className="text-2xl font-black">
                      {group.wins}
                    </p>

                    <p className="text-[9px] uppercase tracking-[0.2em] text-white/30">
                      {group.wins === 1 ? "Win" : "Wins"}
                    </p>

                  </div>

                </div>

              </div>


              {/* TABLE */}
              <div className="overflow-x-auto">

                <table className="w-full min-w-[620px] text-left">

                  <thead>

                    <tr className="border-b border-white/10 text-[9px] uppercase tracking-[0.2em] text-white/25">

                      <th className="w-20 px-6 py-4 font-medium md:px-8">
                        Year
                      </th>

                      <th className="px-4 py-4 font-medium">
                        Movie
                      </th>

                      <th className="px-4 py-4 font-medium md:pr-8">
                        Award
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {group.rows.map(
                      ([year, movie, award]) => (

                        <tr
                          key={`${year}-${movie}-${award}`}
                          className="border-b border-white/[0.06] last:border-0 transition hover:bg-white/[0.035]"
                        >

                          <td className="px-6 py-4 align-top text-sm font-semibold text-white/45 md:px-8">
                            {year}
                          </td>

                          <td className="px-4 py-4 align-top text-sm font-semibold text-white/85">
                            {movie}
                          </td>

                          <td className="px-4 py-4 align-top text-sm leading-6 text-white/55 md:pr-8">
                            {award}
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>


              {/* FEATURED NOTE */}
              {group.note && (

                <div className="border-t border-white/10 px-6 py-6 md:px-8">

                  <p className="text-sm leading-7 text-white/50">

                    <span className="font-semibold text-white/75">
                      National Film Award:
                    </span>{" "}

                    {group.note}

                  </p>

                </div>

              )}

            </article>

          ))}

        </div>

      </section>


      {/* FOOTER */}
      <footer className="border-t border-white/10">

        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-10 md:flex-row md:items-center md:justify-between md:px-12">

          <div>

            <p className="text-sm font-bold tracking-[0.15em]">
              WORLD OF RAAKA
            </p>

            <p className="mt-2 text-xs text-white/25">
              Allu Arjun — Awards & Achievements
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