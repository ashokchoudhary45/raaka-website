"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type VerifyResult = {
  success?: boolean;
  error?: string;
};

function SocialVerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification link is missing or invalid.");
      return;
    }

    let cancelled = false;

    async function verify() {
      try {
        const response = await fetch(
          `/api/social-auth/verify?token=${encodeURIComponent(token as string)}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const result = (await response.json()) as VerifyResult;

        if (cancelled) return;

        if (!response.ok || !result.success) {
          setStatus("error");
          setMessage(result.error || "Unable to verify your email.");
          return;
        }

        setStatus("success");
        setMessage(
          "Your email has been verified successfully. Your RAAKA Social account is ready."
        );
      } catch {
        if (cancelled) return;

        setStatus("error");
        setMessage("Something went wrong while verifying your email.");
      }
    }

    verify();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white">
      <div className="mx-auto flex min-h-[85vh] max-w-md items-center justify-center">
        <div className="w-full text-center">
          <p className="text-xs font-bold uppercase tracking-[0.45em] text-red-400">
            WORLD OF RAAKA
          </p>

          <h1 className="mt-5 text-4xl font-black tracking-tight">
            RAAKA Social
          </h1>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.035] p-7 shadow-2xl">
            {status === "loading" && (
              <>
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-white" />

                <h2 className="mt-6 text-xl font-bold">
                  Verifying email
                </h2>

                <p className="mt-3 text-sm leading-6 text-white/45">
                  Please wait while we confirm your RAAKA Social account.
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15 text-2xl text-green-400">
                  ✓
                </div>

                <h2 className="mt-6 text-xl font-bold text-green-300">
                  Email verified
                </h2>

                <p className="mt-3 text-sm leading-6 text-white/50">
                  {message}
                </p>

                <Link
                  href="/social"
                  className="mt-7 block w-full rounded-xl bg-white px-4 py-3 text-sm font-black text-black transition hover:bg-white/90"
                >
                  Enter RAAKA Social
                </Link>
              </>
            )}

            {status === "error" && (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 text-2xl text-red-400">
                  !
                </div>

                <h2 className="mt-6 text-xl font-bold text-red-300">
                  Verification failed
                </h2>

                <p className="mt-3 text-sm leading-6 text-white/50">
                  {message}
                </p>

                <Link
                  href="/social/resend"
                  className="mt-7 block w-full rounded-xl bg-white px-4 py-3 text-sm font-black text-black transition hover:bg-white/90"
                >
                  Resend verification email
                </Link>

                <Link
                  href="/social/login"
                  className="mt-4 block text-xs text-white/40 hover:text-white"
                >
                  Back to Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SocialVerifyPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black px-5 py-10 text-white">
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-sm text-white/40">
              Loading verification…
            </div>
          </div>
        </main>
      }
    >
      <SocialVerifyContent />
    </Suspense>
  );
}