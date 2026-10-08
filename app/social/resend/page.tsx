"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type ResendResult = {
  success?: boolean;
  error?: string;
  message?: string;
};

export default function ResendVerificationPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/social-auth/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = (await response.json()) as ResendResult;

      if (!response.ok || !result.success) {
        setError(result.error || "Unable to send verification email.");
        return;
      }

      setMessage(
        result.message ||
          "If an account exists with this email, a verification link has been sent."
      );
    } catch {
      setError("Unable to connect to RAAKA Social.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white">
      <div className="mx-auto flex min-h-[85vh] max-w-md items-center justify-center">
        <div className="w-full">
          <div className="mb-8 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.45em] text-red-400">
              WORLD OF RAAKA
            </p>

            <h1 className="mt-4 text-4xl font-black tracking-tight">
              Verify Your Email
            </h1>

            <p className="mt-3 text-sm text-white/40">
              Get a fresh verification link for RAAKA Social.
            </p>
          </div>

          <form
            onSubmit={submit}
            className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl"
          >
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/50">
              Email address
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
              {loading ? "Sending..." : "Send verification email"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/social/login"
              className="text-sm text-white/40 hover:text-white"
            >
              ← Back to Login
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/social"
              className="text-xs text-white/25 hover:text-white"
            >
              RAAKA Social
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}