"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type LoginResult = {
  success?: boolean;
  error?: string;
};

export default function SocialLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/social-auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const result = (await response.json()) as LoginResult;

      if (!response.ok || !result.success) {
        setError(result.error || "Login failed.");
        return;
      }

      setMessage("Login successful. Opening RAAKA Social...");

      window.setTimeout(() => {
        router.push("/social");
      }, 700);
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
              RAAKA Social
            </h1>

            <p className="mt-3 text-sm text-white/40">
              Welcome back, fan.
            </p>
          </div>

          <form
            onSubmit={submit}
            className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl"
          >
            <div className="space-y-4">
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
                  autoComplete="current-password"
                  placeholder="Your password"
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
              <div className="mt-5 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-white px-4 py-3 text-sm font-black text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>

            <Link
              href="/social/resend"
              className="mt-4 block text-center text-xs text-white/40 hover:text-white"
            >
              Resend verification email
            </Link>
          </form>

          <div className="mt-6 text-center text-sm text-white/40">
            Don't have an account?{" "}
            <Link
              href="/social/signup"
              className="font-bold text-white hover:underline"
            >
              Create account
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