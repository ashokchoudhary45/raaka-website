"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/social-auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json()) as { success?: boolean; message?: string; error?: string };
      if (!response.ok || !data.success) throw new Error(data.error || "Could not send reset link.");
      setMessage(data.message || "If an account exists for that email, a reset link will be sent shortly.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white px-4 py-12 text-neutral-900">
      <div className="mx-auto w-full max-w-md">
        <Link href="/social" className="text-sm font-semibold text-neutral-600 hover:text-black">← Back to RAAKA Social</Link>
        <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold tracking-[0.25em] text-red-600">WORLD OF RAAKA</p>
          <h1 className="mt-4 text-2xl font-bold">Forgot password?</h1>
          <p className="mt-2 text-sm leading-6 text-neutral-600">Enter the email address associated with your account. If it exists, we’ll email you a secure reset link.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block text-sm font-medium" htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              placeholder="you@example.com"
            />
            {message && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{message}</p>}
            {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
            <button disabled={loading} className="w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
          <p className="mt-5 text-sm text-neutral-600">Remember your password? <Link href="/social" className="font-semibold text-red-600 hover:underline">Log in</Link></p>
        </section>
      </div>
    </main>
  );
}
