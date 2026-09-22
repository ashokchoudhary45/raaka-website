import Image from "next/image";

export default function RaakaGuinnessPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">

      {/* =========================
          ARTICLE HEADER
      ========================= */}
      <header className="mx-auto max-w-5xl px-6 pb-10 pt-16 md:px-10 md:pt-24">

        <div className="mb-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-white/40">
          <span>RAAKA NEWS</span>
          <span className="text-white/20">•</span>
          <span>22 September 2026</span>
        </div>

        <h1 className="max-w-4xl text-4xl font-semibold leading-[1.05] tracking-[-0.035em] md:text-6xl">
          RAAKA Makes History with a Guinness World Record for
          Real-Time Motion Capture
        </h1>

        <p className="mt-7 max-w-3xl text-lg leading-8 text-white/60 md:text-xl">
          37 performers were captured simultaneously in real time as
          Allu Arjun and Atlee's ambitious project achieves a major
          technological milestone for Indian cinema.
        </p>

      </header>


      {/* =========================
          IMAGE 1
      ========================= */}
      <figure className="mx-auto max-w-6xl px-4 md:px-8">

        <div className="overflow-hidden rounded-2xl">
          <Image
            src="/images/raaka-guinness-1.jpg"
            alt="RAAKA Guinness World Records achievement"
            width={1800}
            height={1100}
            priority
            className="h-auto w-full object-cover"
          />
        </div>

        <figcaption className="px-2 pt-3 text-[11px] text-white/35">
          RAAKA's Guinness World Records achievement.
          <span className="ml-1 text-white/50">
            Image Credit: Sun Pictures
          </span>
        </figcaption>

      </figure>


      {/* =========================
          ARTICLE
      ========================= */}
      <article className="mx-auto max-w-3xl px-6 py-14 md:px-10 md:py-20">

        <p className="text-lg leading-9 text-white/75 md:text-xl">
          RAAKA has officially added a Guinness World Records achievement
          to its production journey. The film has set the record for
          <strong className="text-white">
            {" "}“Most People Motion-Captured in Real-Time”
          </strong>,
          with 37 performers captured simultaneously.
        </p>

        <p className="mt-7 text-base leading-8 text-white/60 md:text-lg">
          The achievement was formally recognised with Allu Arjun and
          director Atlee receiving the Guinness World Records certificate.
          What makes the moment particularly significant for RAAKA is that
          the record is directly connected to the film's production
          technology rather than being a promotional milestone.
        </p>


        <h2 className="mt-16 text-2xl font-semibold tracking-tight md:text-3xl">
          The mystery behind 37
        </h2>

        <p className="mt-6 text-base leading-8 text-white/60 md:text-lg">
          The number 37 had already appeared in RAAKA's promotional campaign,
          creating curiosity among fans without an immediate explanation.
          The latest announcement finally provides the answer.
        </p>

        <p className="mt-6 text-base leading-8 text-white/60 md:text-lg">
          The number refers to the 37 performers who were brought together
          for the simultaneous real-time motion-capture session. Their
          performances were recorded digitally at the same time, creating
          the foundation for the record-setting achievement.
        </p>


        {/* =========================
            NUMBER HIGHLIGHT
        ========================= */}
        <div className="my-14 border-y border-white/10 py-10 text-center">

          <div className="text-8xl font-semibold tracking-[-0.08em] md:text-[130px]">
            37
          </div>

          <p className="mt-3 text-[10px] uppercase tracking-[0.35em] text-white/35">
            Performers • Captured Simultaneously
          </p>

        </div>


        <h2 className="mt-14 text-2xl font-semibold tracking-tight md:text-3xl">
          What the record actually represents
        </h2>

        <p className="mt-6 text-base leading-8 text-white/60 md:text-lg">
          Motion capture allows the physical movements of performers to be
          recorded and translated into digital performances. It is widely
          used in films that rely on digital characters, creatures and
          effects-heavy environments.
        </p>

        <p className="mt-6 text-base leading-8 text-white/60 md:text-lg">
          Capturing 37 performers simultaneously adds another level of
          coordination to the process. The performers, tracking systems,
          cameras and production technology have to work together within the
          same capture environment.
        </p>

        <p className="mt-6 text-base leading-8 text-white/60 md:text-lg">
          For RAAKA, the achievement provides a rare glimpse into the
          technological scale of the project while the film continues to
          keep much of its actual visual world under wraps.
        </p>


        {/* =========================
            VIDEO
        ========================= */}
        <section className="my-16">

          <div className="mb-5">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/35">
              Behind The Scenes
            </p>

            <h2 className="mt-2 text-2xl font-semibold md:text-3xl">
              Inside RAAKA's Motion-Capture Process
            </h2>
          </div>

          <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black">

            <iframe
              className="absolute inset-0 h-full w-full"
              src="https://www.youtube.com/embed/CmVA9ifXBx4"
              title="RAAKA Motion Capture Behind The Scenes"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />

          </div>

          <p className="mt-3 text-[11px] text-white/30">
            RAAKA motion-capture behind-the-scenes footage.
          </p>

        </section>


        <h2 className="mt-14 text-2xl font-semibold tracking-tight md:text-3xl">
          A major milestone for the team
        </h2>

        <p className="mt-6 text-base leading-8 text-white/60 md:text-lg">
          The Guinness recognition gives a tangible achievement to one of
          RAAKA's most technically ambitious aspects. For Allu Arjun and
          Atlee, the certificate marks a production milestone achieved long
          before audiences see the finished film on screen.
        </p>

        <p className="mt-6 text-base leading-8 text-white/60 md:text-lg">
          It also puts the mysterious number 37 into context. What initially
          appeared as a cryptic element of the campaign has now been revealed
          as a reference to the scale of the film's real-time motion-capture
          work.
        </p>


        {/* =========================
            IMAGE 2
        ========================= */}
        <figure className="my-16">

          <div className="overflow-hidden rounded-2xl">
            <Image
              src="/images/raaka-guinness-2.jpg"
              alt="Allu Arjun and Atlee with Guinness World Records certificate"
              width={1800}
              height={1100}
              className="h-auto w-full object-cover"
            />
          </div>

          <figcaption className="px-2 pt-3 text-[11px] text-white/35">
            Allu Arjun and Atlee with the Guinness World Records certificate.
            <span className="ml-1 text-white/50">
              Image Credit: Sun Pictures
            </span>
          </figcaption>

        </figure>


        <h2 className="mt-14 text-2xl font-semibold tracking-tight md:text-3xl">
          The story behind the record
        </h2>

        <p className="mt-6 text-base leading-8 text-white/60 md:text-lg">
          RAAKA has kept its story and many of its visual details closely
          guarded, making production reveals such as this particularly
          interesting. The motion-capture record does not reveal the film's
          narrative, but it does show the level of technology being used
          behind the scenes.
        </p>

        <p className="mt-6 text-base leading-8 text-white/60 md:text-lg">
          With 37 performers captured simultaneously, the production has
          achieved a Guinness World Records milestone that is now permanently
          attached to the making of RAAKA.
        </p>


        {/* =========================
            CLOSING
        ========================= */}
        <div className="mt-16 border-t border-white/10 pt-10">

          <p className="text-2xl font-medium leading-9 tracking-tight md:text-3xl md:leading-10">
            37 performers. One real-time motion-capture session.
            One Guinness World Records milestone for RAAKA.
          </p>

          <p className="mt-6 text-sm leading-7 text-white/40">
            The number that once raised questions around RAAKA now has its
            answer — and it has become part of the film's production history.
          </p>

        </div>


        {/* =========================
            CREDIT
        ========================= */}
        <div className="mt-14 border-t border-white/10 pt-6">

          <p className="text-[11px] text-white/30">
            Images: Sun Pictures
          </p>

          <p className="mt-1 text-[11px] text-white/30">
            Published by World of RAAKA
          </p>

        </div>

      </article>

    </main>
  );
}