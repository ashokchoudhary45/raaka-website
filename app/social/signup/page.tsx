"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type SignupResult = {
  success?: boolean;
  error?: string;
  message?: string;
};

export default function SocialSignupPage() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function updateHandle(value: string) {
    setHandle(
      value
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "")
        .slice(0, 20)
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/social-auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName,
          handle,
          email,
          password,
        }),
      });

      const result = (await response.json()) as SignupResult;

      if (!response.ok || !result.success) {
        setError(result.error || "Could not create your account.");
        return;
      }

      setMessage(
        result.message ||
          "Account created. Please check your email to verify your account."
      );

      window.setTimeout(() => {
        router.push("/social/login");
      }, 2500);
    } catch {
      setError("Unable to connect to RAAKA Social.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white">
      <div className="mx-auto flex min-h-[90vh] max-w-md items-center justify-center">
        <div className="w-full">
          <div className="mb-8 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.45em] text-red-400">
              WORLD OF RAAKA
            </p>

            <h1 className="mt-4 text-4xl font-black tracking-tight">
              Join RAAKA Social
            </h1>

            <p className="mt-3 text-sm text-white/40">
              Create your fan identity.
            </p>
          </div>

          <form
            onSubmit={submit}
            className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl"
          >
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/50">
                  Display name
                </label>

                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  maxLength={50}
                  placeholder="Your name"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-white/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/50">
                  Username
                </label>

                <div className="flex overflow-hidden rounded-xl border border-white/10 bg-white/5 focus-within:border-white/30">
                  <span className="flex items-center px-3 text-white/30">
                    @
                  </span>

                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => updateHandle(e.target.value)}
                    required
                    minLength={3}
                    maxLength={20}
                    autoCapitalize="none"
                    autoCorrect="off"
                    placeholder="yourhandle"
                    className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/50">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-white/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/50">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-white/30"
                />
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {message && (
              <div className="mt-5 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm leading-6 text-green-300">
                <div>{message}</div>
                <div className="mt-2 text-xs leading-5 text-green-200/70">
                  Didn&apos;t receive the email? Please check your Spam or Junk
                  folder, and also check Promotions/Updates if your email
                  provider has those tabs.
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-white px-4 py-3 text-sm font-black text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-white/40">
            Already have an account?{" "}
            <Link
              href="/social/login"
              className="font-bold text-white hover:underline"
            >
              Log in
            </Link>
          </div>

          <div className="mt-5 text-center">
            <Link
              href="/social"
              className="text-xs text-white/30 hover:text-white"
            >
              ← Back to RAAKA Social
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}