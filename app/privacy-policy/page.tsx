export default function PrivacyPolicyPage() {
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
          Legal
        </p>

        <h1 className="text-4xl font-bold md:text-6xl">
          Privacy Policy
        </h1>

        <div className="mt-10 space-y-8 text-base leading-8 text-white/65">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">
              Information We Collect
            </h2>
            <p>
              The website may collect information that visitors voluntarily
              provide, such as a fan name, artwork title, artwork image and
              optional social profile information when submitting fan art.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">
              Fan Art Submissions
            </h2>
            <p>
              Fan art submitted through the website may be stored and displayed
              in the public Fan Art Gallery after review and approval.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">
              Local Storage
            </h2>
            <p>
              The website may use browser local storage to remember certain
              visitor-related information, such as fan interactions and fan
              passport information.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">
              Third-Party Services
            </h2>
            <p>
              The website may use third-party services for hosting, database
              storage, authentication, analytics and other website functions.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">
              Advertising
            </h2>
            <p>
              If advertising services are enabled on the website in the future,
              third-party advertising providers may use cookies or similar
              technologies to provide and measure advertisements.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">
              Contact
            </h2>
            <p>
              If you have questions about this Privacy Policy or want to request
              removal or correction of content, please contact us through the
              Contact page.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}