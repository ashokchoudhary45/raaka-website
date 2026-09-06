export default function ContactPage() {
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
          Contact
        </p>

        <h1 className="text-4xl font-bold md:text-6xl">
          Get in Touch
        </h1>

        <div className="mt-10 space-y-6 text-base leading-8 text-white/65">
          <p>
            Have a question, suggestion, correction or copyright-related
            concern about the website?
          </p>

          <p>
            You can contact us regarding website content, fan art submissions,
            corrections or removal requests.
          </p>

          <p>
            Email:{" "}
            <a
              href="mailto:your-email@example.com"
              className="text-white underline underline-offset-4"
            >
              worldofraakaverse@gmail.com
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}