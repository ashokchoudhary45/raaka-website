"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("token") || "";
    setToken(value);
    if (!value) setError("This reset link is missing its token. Request a new reset link.");
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!token) {
      setError("This reset link is invalid. Request a new one.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/social-auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await response.json()) as { success?: boolean; message?: string; error?: string };
      if (!response.ok || !data.success) throw new Error(data.error || "Could not reset password.");
      setMessage(data.message || "Password reset successfully.");
      setFinished(true);
      setPassword("");
      setConfirmPassword("");
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
          <h1 className="mt-4 text-2xl font-bold">Choose a new password</h1>
          <p className="mt-2 text-sm leading-6 text-neutral-600">Use at least 8 characters. Reset links expire after 30 minutes and can only be used once.</p>
          {!finished ? (
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium">New password</label>
                <input id="password" type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
              </div>
              <div>
                <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium">Confirm new password</label>
                <input id="confirm-password" type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
              </div>
              {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
              <button disabled={loading || !token} className="w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Updating…" : "Reset password"}</button>
            </form>
          ) : (
            <div className="mt-6 space-y-4">
              <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{message}</p>
              <Link href="/social" className="block w-full rounded-xl bg-red-600 px-4 py-3 text-center font-semibold text-white hover:bg-red-700">Go to login</Link>
            </div>
          )}
          {!finished && error && <p className="mt-5 text-sm text-neutral-600">Need another link? <Link href="/social/forgot-password" className="font-semibold text-red-600 hover:underline">Request a new reset link</Link></p>}
        </section>
      </div>
    </main>
  );
}
