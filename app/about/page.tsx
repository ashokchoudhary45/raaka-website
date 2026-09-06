export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white md:px-12">
      <div className="mx-auto max-w-4xl">
        <a
          href="/"
          className="mb-10 inline-block text-sm text-white/50 hover:text-white"
        >
          ← Back to Home
        </a>

        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-white/40">
          About
        </p>

        <h1 className="text-4xl font-bold md:text-6xl">
          The World of RAAKA
        </h1>

        <div className="mt-10 space-y-6 text-base leading-8 text-white/65">
          <p>
            The World of RAAKA is a fan-created website dedicated to exploring
            and celebrating the world of RAAKA.
          </p>

          <p>
            The website brings together movie information, cast and crew
            details, posters, announcements, songs, fan art and other
            RAAKA-related content in one place.
          </p>

          <p>
            This is an independent fan website and is not officially affiliated
            with the filmmakers, actors, production companies or distributors
            associated with RAAKA.
          </p>
        </div>
      </div>
    </main>
  );
}