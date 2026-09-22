import Image from "next/image";
import Link from "next/link";

export default function RaakaGuinnessPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* HERO */}
      <section className="relative min-h-[78vh] overflow-hidden">
        <Image
          src="/images/raaka-guinness-hero.jpg"
          alt="RAAKA Guinness World Records"
          fill
          priority
          className="object-cover opacity-55"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/55 to-black/20" />

        <div className="relative z-10 mx-auto flex min-h-[78vh] max-w-6xl items-end px-6 pb-16 md:px-10 md:pb-20">
          <div className="max-w-4xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
              RAAKA • WORLD OF RAAKA
            </p>

            <h1 className="text-4xl font-black leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
              RAAKA Makes
              <br />
              <span className="text-white/55">History.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-7 text-white/70 md:text-lg">
              A global technological milestone as RAAKA achieves a Guinness
              World Records recognition for the most people motion-captured
              in real-time.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-xs uppercase tracking-[0.2em] backdrop-blur-md">
                Guinness World Records
              </span>

              <span className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-xs uppercase tracking-[0.2em] backdrop-blur-md">
                37 Performers
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ARTICLE */}
      <article className="mx-auto max-w-4xl px-6 py-16 md:px-10 md:py-24">

        {/* INTRO */}
        <div className="mb-14">
          <p className="mb-6 text-sm font-medium uppercase tracking-[0.25em] text-white/40">
            A Historic Milestone
          </p>

          <h2 className="text-3xl font-bold leading-tight md:text-5xl">
            37 performers. One real-time capture.
            <br />
            One Guinness World Records milestone.
          </h2>

          <p className="mt-7 text-lg leading-8 text-white/65">
            RAAKA has officially added a remarkable technological achievement
            to its growing legacy. The ambitious project led by Icon Star
            Allu Arjun and filmmaker Atlee has achieved a Guinness World
            Records milestone for the{" "}
            <strong className="text-white">
              “Most People Motion-Captured in Real-Time”
            </strong>
            , with 37 performers captured simultaneously.
          </p>
        </div>

        {/* IMAGE 1 */}
        <figure className="mb-16 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
          <Image
            src="/images/raaka-guinness-1.jpg"
            alt="RAAKA Guinness World Records achievement"
            width={1600}
            height={1000}
            className="h-auto w-full object-cover"
          />

          <figcaption className="px-5 py-4 text-xs tracking-wide text-white/40">
            RAAKA Guinness World Records achievement
            <span className="ml-2 text-white/60">
              • Image Credit: Sun Pictures
            </span>
          </figcaption>
        </figure>

        {/* SECTION */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold md:text-4xl">
            The Mystery Behind 37
          </h2>

          <p className="text-base leading-8 text-white/65 md:text-lg">
            For RAAKA fans, the number 37 had already become one of the
            project's biggest mysteries. The number appeared during the
            promotional campaign without an immediate explanation, leading
            to widespread speculation about what it could represent.
          </p>

          <p className="text-base leading-8 text-white/65 md:text-lg">
            The answer has now been revealed. The number was connected to the
            film's extraordinary motion-capture achievement: 37 performers
            were captured simultaneously in real-time.
          </p>
        </section>

        {/* BIG NUMBER */}
        <section className="my-20 rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent p-8 text-center md:p-14">
          <p className="text-xs uppercase tracking-[0.4em] text-white/40">
            The Number
          </p>

          <div className="mt-4 text-8xl font-black tracking-tighter md:text-[12rem]">
            37
          </div>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/50 md:text-base">
            Performers captured simultaneously in real-time motion capture
            for the Guinness World Records achievement.
          </p>
        </section>

        {/* SECTION */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold md:text-4xl">
            A Technological Achievement
          </h2>

          <p className="text-base leading-8 text-white/65 md:text-lg">
            Motion capture has become an important part of modern filmmaking,
            particularly for productions that depend heavily on digital
            characters, creatures, fantasy environments and large-scale visual
            effects.
          </p>

          <p className="text-base leading-8 text-white/65 md:text-lg">
            In a motion-capture environment, performers' physical movements
            can be digitally recorded and translated into the movements of
            virtual characters. Capturing multiple performers simultaneously
            requires careful coordination between performers, tracking
            systems, technical teams and the digital production pipeline.
          </p>

          <p className="text-base leading-8 text-white/65 md:text-lg">
            RAAKA's achievement therefore represents more than a promotional
            number. It highlights the scale of the technical process being
            used behind the project.
          </p>
        </section>

        {/* IMAGE 2 */}
        <figure className="my-16 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
          <Image
            src="/images/raaka-guinness-2.jpg"
            alt="Allu Arjun and Atlee with Guinness World Records certificate"
            width={1600}
            height={1000}
            className="h-auto w-full object-cover"
          />

          <figcaption className="px-5 py-4 text-xs tracking-wide text-white/40">
            Allu Arjun and Atlee with the Guinness World Records recognition
            <span className="ml-2 text-white/60">
              • Image Credit: Sun Pictures
            </span>
          </figcaption>
        </figure>

        {/* SECTION */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold md:text-4xl">
            Allu Arjun & Atlee Receive the Certificate
          </h2>

          <p className="text-base leading-8 text-white/65 md:text-lg">
            The Guinness World Records certificate was received by
            <strong className="text-white"> Allu Arjun </strong>
            and
            <strong className="text-white"> Atlee</strong>, marking an
            important moment in the journey of RAAKA.
          </p>

          <p className="text-base leading-8 text-white/65 md:text-lg">
            The collaboration brings together one of Indian cinema's biggest
            stars and one of its most ambitious contemporary filmmakers.
            Their partnership has already generated enormous curiosity around
            the scale and visual identity of the project.
          </p>
        </section>

        {/* QUOTE STYLE */}
        <blockquote className="my-20 border-l border-white/30 pl-6 md:pl-10">
          <p className="text-2xl font-semibold leading-9 text-white md:text-4xl md:leading-[1.2]">
            “37 performers captured simultaneously in real-time.”
          </p>

          <footer className="mt-5 text-xs uppercase tracking-[0.25em] text-white/40">
            RAAKA • Guinness World Records Achievement
          </footer>
        </blockquote>

        {/* SECTION */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold md:text-4xl">
            Why This Matters for RAAKA
          </h2>

          <p className="text-base leading-8 text-white/65 md:text-lg">
            RAAKA has consistently generated interest through its mysterious
            promotional campaign and its emphasis on a large-scale cinematic
            world. The Guinness recognition now adds a documented technological
            milestone to that journey.
          </p>

          <p className="text-base leading-8 text-white/65 md:text-lg">
            The achievement also gives new context to the previously cryptic
            appearance of the number 37. What initially looked like another
            mysterious clue has now become directly connected to a major
            production achievement.
          </p>

          <p className="text-base leading-8 text-white/65 md:text-lg">
            For audiences waiting to discover the world of RAAKA, the record
            offers another glimpse into the scale of the production without
            revealing the film's larger story.
          </p>
        </section>

        {/* FINAL */}
        <section className="mt-20 border-t border-white/10 pt-14">
          <p className="text-sm uppercase tracking-[0.3em] text-white/40">
            The Beginning
          </p>

          <h2 className="mt-5 text-4xl font-black leading-tight md:text-6xl">
            The record is made.
            <br />
            The mystery continues.
          </h2>

          <p className="mt-7 max-w-2xl text-base leading-8 text-white/60 md:text-lg">
            With 37 performers captured simultaneously and a Guinness World
            Records achievement now attached to its name, RAAKA has created
            another historic chapter before audiences have even experienced
            its complete cinematic world.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            {[
              "#RAAKA",
              "#AlluArjun",
              "#Atlee",
              "#GuinnessWorldRecords",
              "#MotionCapture",
              "#SunPictures",
            ].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/55"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        {/* CREDIT */}
        <div className="mt-16 border-t border-white/10 pt-8 text-xs leading-6 text-white/35">
          <p>
            Article by World of RAAKA
          </p>

          <p>
            Images used in this article:
            <span className="text-white/55"> Sun Pictures</span>
          </p>
        </div>
      </article>

      {/* EXPLORE MORE */}
      <section className="border-t border-white/10 bg-[#080808]">
        <div className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-20">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.3em] text-white/35">
              World of RAAKA
            </p>

            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              Explore More
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">

            <Link
              href="/news/raaka1"
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:-translate-y-1 hover:bg-white/[0.06]"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src="/images/raaka-37.jpg"
                  alt="RAAKA 37"
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
              </div>

              <div className="p-5">
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/35">
                  RAAKA NEWS
                </p>

                <h3 className="mt-2 text-lg font-bold">
                  Decoding the Mystery of RAAKA's 37
                </h3>
              </div>
            </Link>

            <Link
              href="/news/raaka2"
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:-translate-y-1 hover:bg-white/[0.06]"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src="/images/raaka-37.jpg"
                  alt="RAAKA News"
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
              </div>

              <div className="p-5">
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/35">
                  RAAKA ANALYSIS
                </p>

                <h3 className="mt-2 text-lg font-bold">
                  The Mythology Behind the RAAKA Universe
                </h3>
              </div>
            </Link>

            <Link
              href="/"
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:-translate-y-1 hover:bg-white/[0.06]"
            >
              <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-gradient-to-br from-white/10 to-transparent">
                <span className="text-5xl font-black tracking-tighter text-white/20">
                  RAAKA
                </span>
              </div>

              <div className="p-5">
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/35">
                  WORLD OF RAAKA
                </p>

                <h3 className="mt-2 text-lg font-bold">
                  Enter the World
                </h3>
              </div>
            </Link>

          </div>
        </div>
      </section>
    </main>
  );
}