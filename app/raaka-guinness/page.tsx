import Image from "next/image";
import Link from "next/link";

export default function RaakaGuinnessPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative overflow-hidden">
        <div className="relative h-[68vh] min-h-[560px] w-full">

          <Image
            src="/images/raaka-guinness-hero.jpg"
            alt="RAAKA Guinness World Records"
            fill
            priority
            className="object-cover"
          />

          <div className="absolute inset-0 bg-black/35" />

          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/20 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-6 pb-14 md:px-10 md:pb-20">
            <div className="max-w-4xl">

              <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.35em] text-white/60">
                RAAKA • EXCLUSIVE
              </p>

              <h1 className="text-4xl font-semibold leading-[0.98] tracking-[-0.04em] sm:text-5xl md:text-7xl">
                RAAKA Makes History
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 md:text-lg">
                Allu Arjun and Atlee's RAAKA enters the Guinness World Records
                for the most people motion-captured in real-time.
              </p>

            </div>
          </div>
        </div>
      </section>


      {/* =========================================================
          ARTICLE
      ========================================================= */}
      <article className="mx-auto max-w-4xl px-6 py-14 md:px-10 md:py-20">

        {/* META */}
        <div className="mb-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs uppercase tracking-[0.18em] text-white/35">
          <span>RAAKA NEWS</span>
          <span>•</span>
          <span>22 September 2026</span>
        </div>


        {/* INTRO */}
        <header className="mb-14">

          <h2 className="text-3xl font-semibold leading-tight tracking-[-0.025em] md:text-5xl">
            37 performers. One capture volume.
            <br className="hidden md:block" />
            A Guinness World Record.
          </h2>

          <p className="mt-7 text-lg leading-8 text-white/65 md:text-xl md:leading-9">
            RAAKA has achieved a Guinness World Records milestone before
            reaching the big screen. The Atlee directorial has officially set
            the record for the <strong className="text-white">
            “Most People Motion-Captured in Real-Time”</strong>, with
            37 performers captured simultaneously for the film.
          </p>

        </header>


        {/* =========================================================
            IMAGE 1
        ========================================================= */}
        <figure className="mb-14 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">

          <Image
            src="/images/raaka-guinness-1.jpg"
            alt="Allu Arjun and Atlee with Guinness World Records certificate"
            width={1600}
            height={1000}
            className="h-auto w-full object-cover"
          />

          <figcaption className="px-4 py-3 text-[11px] text-white/35">
            Allu Arjun and Atlee with the Guinness World Records certificate.
            <span className="ml-1 text-white/50">
              Image Credit: Sun Pictures
            </span>
          </figcaption>

        </figure>


        {/* =========================================================
            SECTION 1
        ========================================================= */}
        <section className="space-y-6">

          <h2 className="text-2xl font-semibold md:text-3xl">
            The record behind RAAKA's 37
          </h2>

          <p className="text-base leading-8 text-white/65 md:text-lg">
            The number 37 had been appearing around RAAKA's promotional
            campaign without an explanation. The mystery has now been cleared:
            it refers to the 37 performers who were captured simultaneously
            during a single real-time motion-capture session.
          </p>

          <p className="text-base leading-8 text-white/65 md:text-lg">
            Guinness World Records officially lists the achievement as
            “Most people motion-captured in real-time”. The record was achieved
            by Sun TV Network Limited and Atlee for RAAKA in Mumbai on
            15 September 2026.
          </p>

        </section>


        {/* =========================================================
            BIG NUMBER
        ========================================================= */}
        <section className="my-16 border-y border-white/10 py-12 text-center">

          <div className="text-[100px] font-semibold leading-none tracking-[-0.08em] md:text-[150px]">
            37
          </div>

          <p className="mt-4 text-xs uppercase tracking-[0.3em] text-white/35">
            Performers captured simultaneously
          </p>

        </section>


        {/* =========================================================
            SECTION 2
        ========================================================= */}
        <section className="space-y-6">

          <h2 className="text-2xl font-semibold md:text-3xl">
            What makes the capture significant?
          </h2>

          <p className="text-base leading-8 text-white/65 md:text-lg">
            Motion capture records the physical movements of performers and
            translates them into digital performances. For RAAKA, the scale of
            the setup went considerably beyond a conventional motion-capture
            shoot.
          </p>

          <p className="text-base leading-8 text-white/65 md:text-lg">
            According to details released around the record, the production
            used a large technical setup involving optical motion-capture
            cameras, facial capture, synchronisation and real-time
            visualisation. Reports on the record-setting session state that
            92 optical motion-capture cameras were used.
          </p>

          <p className="text-base leading-8 text-white/65 md:text-lg">
            The performers were captured together inside the same capture
            volume, making coordination between the performers and technical
            teams a key part of the process.
          </p>

        </section>


        {/* =========================================================
            VIDEO
        ========================================================= */}
        <section className="my-16">

          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/35">
              Behind The Scenes
            </p>

            <h2 className="mt-2 text-2xl font-semibold md:text-3xl">
              Inside RAAKA's Record-Breaking Motion Capture
            </h2>
          </div>


          <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">

            <iframe
              className="absolute inset-0 h-full w-full"
              src="https://www.youtube.com/embed/CmVA9ifXBx4"
              title="RAAKA - Guinness World Record Motion Capture Behind The Scenes"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />

          </div>

          <p className="mt-3 text-[11px] text-white/30">
            Behind-the-scenes footage from the RAAKA motion-capture process.
          </p>

        </section>


        {/* =========================================================
            SECTION 3
        ========================================================= */}
        <section className="space-y-6">

          <h2 className="text-2xl font-semibold md:text-3xl">
            The technology behind the scene
          </h2>

          <p className="text-base leading-8 text-white/65 md:text-lg">
            The newly released behind-the-scenes footage gives a closer look
            at the process behind the record. Instead of showing only the
            finished digital result, the footage focuses on the performers,
            the capture stage and the technical environment used during the
            shoot.
          </p>

          <p className="text-base leading-8 text-white/65 md:text-lg">
            The production involved multiple technical departments working
            together in real time. Capture, calibration, networking,
            synchronisation, facial capture and real-time visualisation all
            had to work together while the performers were being recorded.
          </p>

        </section>


        {/* =========================================================
            IMAGE 2
        ========================================================= */}
        <figure className="my-14 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">

          <Image
            src="/images/raaka-guinness-2.jpg"
            alt="RAAKA motion capture behind the scenes"
            width={1600}
            height={1000}
            className="h-auto w-full object-cover"
          />

          <figcaption className="px-4 py-3 text-[11px] text-white/35">
            RAAKA motion-capture production.
            <span className="ml-1 text-white/50">
              Image Credit: Sun Pictures
            </span>
          </figcaption>

        </figure>


        {/* =========================================================
            SECTION 4
        ========================================================= */}
        <section className="space-y-6">

          <h2 className="text-2xl font-semibold md:text-3xl">
            A milestone for the RAAKA team
          </h2>

          <p className="text-base leading-8 text-white/65 md:text-lg">
            The Guinness recognition was formally presented to Allu Arjun and
            Atlee, with the achievement becoming one of the major production
            milestones associated with RAAKA.
          </p>

          <p className="text-base leading-8 text-white/65 md:text-lg">
            For a film that has kept much of its visual world under wraps,
            the motion-capture record provides a rare look at the scale of the
            technology being used behind the camera.
          </p>

          <p className="text-base leading-8 text-white/65 md:text-lg">
            It also gives a clear explanation for the mysterious “37” that
            appeared during the film's recent promotional campaign.
          </p>

        </section>


        {/* =========================================================
            HIGHLIGHT
        ========================================================= */}
        <div className="my-16 rounded-2xl border border-white/10 bg-white/[0.035] p-7 md:p-10">

          <p className="text-xs uppercase tracking-[0.25em] text-white/35">
            Guinness World Records
          </p>

          <p className="mt-5 text-2xl font-medium leading-9 md:text-3xl md:leading-10">
            “Most People Motion-Captured in Real-Time”
          </p>

          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/45">
            <span>37 performers</span>
            <span>•</span>
            <span>Mumbai, India</span>
            <span>•</span>
            <span>15 September 2026</span>
          </div>

        </div>


        {/* =========================================================
            CLOSING
        ========================================================= */}
        <section className="border-t border-white/10 pt-12">

          <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
            RAAKA's next chapter
          </h2>

          <p className="mt-6 text-base leading-8 text-white/65 md:text-lg">
            The Guinness World Records achievement does not reveal the larger
            story of RAAKA, but it does offer a glimpse into the scale of the
            production. With the record now officially recognised, the focus
            returns to the film itself — and to what Atlee and the team have
            been building behind the scenes.
          </p>

          <p className="mt-6 text-base leading-8 text-white/65 md:text-lg">
            For now, the mystery surrounding 37 has an answer. It was not a
            character count or a hidden title clue. It was the number at the
            centre of one of RAAKA's biggest technical achievements.
          </p>

        </section>


        {/* =========================================================
            ARTICLE CREDIT
        ========================================================= */}
        <div className="mt-14 border-t border-white/10 pt-7">

          <p className="text-xs text-white/30">
            Published by World of RAAKA
          </p>

          <p className="mt-2 text-xs text-white/30">
            Images: Sun Pictures
          </p>

        </div>

      </article>


      {/* =========================================================
          EXPLORE MORE
      ========================================================= */}
      <section className="border-t border-white/10 bg-[#080808]">

        <div className="mx-auto max-w-6xl px-6 py-16 md:px-10">

          <div className="mb-9">

            <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">
              World of RAAKA
            </p>

            <h2 className="mt-2 text-3xl font-semibold">
              Explore More
            </h2>

          </div>


          <div className="grid gap-5 md:grid-cols-3">

            {/* CARD 1 */}
            <Link
              href="/news/raaka1"
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] transition duration-300 hover:-translate-y-1"
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

                <p className="text-[9px] uppercase tracking-[0.25em] text-white/30">
                  RAAKA NEWS
                </p>

                <h3 className="mt-2 text-lg font-semibold">
                  Decoding the Mystery of RAAKA's 37
                </h3>

              </div>

            </Link>


            {/* CARD 2 */}
            <Link
              href="/news/raaka2"
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] transition duration-300 hover:-translate-y-1"
            >

              <div className="relative aspect-[16/10] overflow-hidden">

                <Image
                  src="/images/raaka-37.jpg"
                  alt="RAAKA mythology"
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                />

              </div>

              <div className="p-5">

                <p className="text-[9px] uppercase tracking-[0.25em] text-white/30">
                  RAAKA ANALYSIS
                </p>

                <h3 className="mt-2 text-lg font-semibold">
                  The Mythology Behind RAAKA
                </h3>

              </div>

            </Link>


            {/* CARD 3 */}
            <Link
              href="/"
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] transition duration-300 hover:-translate-y-1"
            >

              <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-gradient-to-br from-white/10 via-transparent to-transparent">

                <span className="text-5xl font-black tracking-[-0.06em] text-white/15">
                  RAAKA
                </span>

              </div>

              <div className="p-5">

                <p className="text-[9px] uppercase tracking-[0.25em] text-white/30">
                  WORLD OF RAAKA
                </p>

                <h3 className="mt-2 text-lg font-semibold">
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