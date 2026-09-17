import Link from "next/link";

export default function NewsPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* Top editorial header */}
      <header className="border-b border-white/[0.08]">
        <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 md:py-9">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-zinc-500 transition hover:text-white"
            >
              ← World of Raaka
            </Link>

            <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-600">
              News & Updates
            </span>
          </div>
        </div>
      </header>

      {/* Article intro */}
      <section className="mx-auto max-w-6xl px-5 pb-12 pt-14 sm:px-8 md:pb-16 md:pt-20">
        <div className="max-w-5xl">
          <div className="mb-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
            <span>Raaka</span>
            <span className="text-zinc-700">•</span>
            <span>September 17, 2026</span>
            <span className="text-zinc-700">•</span>
            <span>4 min read</span>
          </div>

          <h1 className="max-w-5xl text-5xl font-black leading-[0.94] tracking-[-0.055em] sm:text-6xl md:text-7xl lg:text-[86px]">
            Sun Pictures Teases Raaka With a Mysterious “37” Post
          </h1>

          <p className="mt-8 max-w-3xl text-xl leading-9 text-zinc-400 sm:text-2xl sm:leading-10">
            A single number has appeared on a dark Raaka poster, and Sun
            Pictures has given fans almost nothing else to go on.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-white/[0.08] pt-6 text-sm text-zinc-500">
            <span>
              By <span className="text-zinc-300">World of Raaka</span>
            </span>
            <span>Source: Sun Pictures</span>
          </div>
        </div>
      </section>

      {/* Main poster - preserve the original portrait ratio */}
      <section className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="overflow-hidden rounded-[26px] border border-white/[0.10] bg-black shadow-[0_30px_100px_rgba(0,0,0,0.55)]">
          <img
            src="/images/raaka37.jpg"
            alt="Raaka 37 poster shared by Sun Pictures"
            className="mx-auto block h-auto w-full object-contain"
          />
        </div>

        <p className="mt-4 text-xs uppercase tracking-[0.18em] text-zinc-600">
          The mysterious “37” poster shared by Sun Pictures
        </p>
      </section>

      {/* Long-form article */}
      <article className="mx-auto max-w-4xl px-5 pb-28 pt-14 sm:px-8 md:pt-20">
        <div className="space-y-16">
          <section>
            <p className="text-xl leading-9 text-zinc-300 sm:text-2xl sm:leading-10">
              Sun Pictures has dropped a new and extremely mysterious update
              for <strong className="text-white">Raaka</strong>. There is no
              dialogue, no character reveal and no release-date announcement.
              The entire poster is built around one thing — the number
              <strong className="text-white"> “37”</strong>.
            </p>

            <p className="mt-7 text-lg leading-9 text-zinc-400 sm:text-xl">
              The post was shared with only the emojis 👀💥, leaving fans with
              a simple question that is already becoming the centre of the
              conversation: <strong className="text-white">what does 37 mean?</strong>
            </p>
          </section>

          <section>
            <SectionTitle>One Number. A Lot of Questions.</SectionTitle>

            <p>
              The new poster keeps everything deliberately minimal. A dark,
              almost smoky background fills the frame while a large metallic
              “37” sits at the centre. The Raaka title appears quietly at the
              bottom.
            </p>

            <p>
              There is something very different about this reveal compared
              with a normal promotional update. Instead of giving fans
              information, the makers have given them a clue — and then stopped
              there.
            </p>

            <p>
              That mystery is what makes the post interesting. The number
              could have a direct connection to the film, or it could simply
              be the beginning of a larger announcement. At this point, the
              makers have not explained it publicly.
            </p>
          </section>

          <section>
            <SectionTitle>So, What Could “37” Mean?</SectionTitle>

            <p>
              Naturally, the first reaction from fans has been to look for a
              hidden meaning behind the number. There are already different
              theories circulating, but none of them should be treated as
              confirmed information yet.
            </p>

            <p>
              One theory that has started getting attention connects
              <strong className="text-white"> 37</strong> with September 21.
              The reasoning is simple: <strong className="text-white">3 × 7 = 21</strong>,
              and September 21 is Atlee’s birthday. Some fans therefore
              believe the mysterious poster could be pointing towards a
              possible announcement on that date.
            </p>

            <div className="my-10 rounded-3xl border border-white/[0.10] bg-white/[0.035] p-7 sm:p-9">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-600">
                Fan theory
              </p>
              <p className="mt-4 text-2xl font-bold leading-9 text-white sm:text-3xl">
                3 × 7 = 21
              </p>
              <p className="mt-3 text-base leading-7 text-zinc-500">
                Some fans are connecting “37” with September 21, Atlee’s
                birthday. This is a fan theory and has not been confirmed by
                Sun Pictures.
              </p>
            </div>

            <p>
              It is an interesting theory, especially because Raaka is directed
              by Atlee. But for now, it remains exactly that — a theory. The
              actual meaning of “37” is still unknown.
            </p>
          </section>

          <section>
            <SectionTitle>The Way Sun Pictures Has Revealed It</SectionTitle>

            <p>
              The presentation of the poster may be just as important as the
              number itself. The image is almost completely black, with only
              subtle textures and smoke-like details visible in the
              background. The metallic number is the only element demanding
              attention.
            </p>

            <p>
              Even the caption is minimal. Instead of explaining the reveal,
              Sun Pictures simply used 👀💥. It feels less like a conventional
              announcement and more like a signal that something is coming.
            </p>

            <p>
              For a film that has already built a strong visual identity,
              keeping this update so mysterious fits naturally with the
              atmosphere surrounding Raaka.
            </p>
          </section>

          <section>
            <SectionTitle>Raaka Has Fans Looking for Every Clue</SectionTitle>

            <p>
              Since the film was officially titled Raaka earlier this year,
              every new visual from the makers has attracted close attention.
              Sun Pictures describes the project as a large-scale film led by
              Allu Arjun and directed by Atlee.
            </p>

            <p>
              The production also features Deepika Padukone, while music is
              being composed by Sai Abhyankkar. With the film still keeping
              many of its details under wraps, even a small visual clue can
              lead to a lot of discussion among fans.
            </p>
          </section>

          <section>
            <SectionTitle>What Happens on September 21?</SectionTitle>

            <p>
              This is now one of the biggest questions surrounding the “37”
              post. Because of the 3 × 7 = 21 theory, some fans are expecting
              another Raaka update on September 21.
            </p>

            <p>
              But it is important to keep expectations separate from confirmed
              information. Sun Pictures has not announced that a major reveal
              will happen on that date.
            </p>

            <p>
              If another update does arrive, the meaning behind “37” may
              become much clearer. Until then, the number remains one of the
              most intriguing clues in the current Raaka campaign.
            </p>
          </section>

          <section>
            <SectionTitle>A Small Tease That Has Created a Big Buzz</SectionTitle>

            <p>
              There is something effective about giving audiences just enough
              information to make them curious. Sun Pictures has done exactly
              that with this post.
            </p>

            <p>
              The poster does not reveal the answer. It simply starts the
              question.
            </p>

            <p>
              And now, Raaka fans are waiting for the next piece of the puzzle.
            </p>
          </section>

          {/* Premium pull quote */}
          <section className="border-y border-white/[0.10] py-12 sm:py-14">
            <p className="text-center text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
              “37” is on the screen.
              <br />
              The real story is what comes next.
            </p>
          </section>

          <section>
            <SectionTitle>What We Know Right Now</SectionTitle>

            <div className="mt-7 space-y-4">
              <InfoRow label="Film" value="Raaka" />
              <InfoRow label="Production" value="Sun Pictures" />
              <InfoRow label="Director" value="Atlee" />
              <InfoRow label="Lead" value="Allu Arjun" />
              <InfoRow label="Latest clue" value="37" />
              <InfoRow label="Official meaning of 37" value="Not revealed yet" />
            </div>
          </section>

          <section>
            <SectionTitle>The Wait Continues</SectionTitle>

            <p>
              For now, there is no official answer to the mystery. The “37”
              poster has done what a good teaser is supposed to do — it has
              made people stop, look and start asking questions.
            </p>

            <p>
              Whether the number is connected to a date, a story element, a
              character or something completely unexpected, the answer will
              have to come from Sun Pictures.
            </p>

            <p className="text-2xl font-bold leading-9 text-white sm:text-3xl">
              Until then, one question stays alive:
              <span className="text-zinc-500"> What is 37? 👀💥</span>
            </p>
          </section>

          {/* Related / footer */}
          <section className="border-t border-white/[0.08] pt-9">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">
                  World of Raaka
                </p>
                <h3 className="mt-2 text-2xl font-bold text-white">
                  More Raaka News & Updates
                </h3>
              </div>

              <Link
                href="/"
                className="inline-flex w-fit rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:border-white/30 hover:bg-white/5 hover:text-white"
              >
                Back to Explore More →
              </Link>
            </div>
          </section>
        </div>
      </article>
    </main>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-7 text-3xl font-black leading-tight tracking-[-0.025em] text-white sm:text-4xl md:text-[44px]">
      {children}
    </h2>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-white/[0.08] py-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm uppercase tracking-[0.15em] text-zinc-600">
        {label}
      </span>
      <span className="text-base font-semibold text-zinc-200">{value}</span>
    </div>
  );
}
