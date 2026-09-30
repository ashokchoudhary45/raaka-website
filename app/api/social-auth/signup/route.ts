"use client";

import { FormEvent, useState } from "react";

type SignupResponse = {
  success?: boolean;
  message?: string;
  error?: string;
};

export default function SocialSignupPage() {
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading) return;

    setMessage("");
    setSuccess(false);

    const cleanDisplayName = displayName.trim();
    const cleanHandle = handle
      .trim()
      .replace(/^@/, "")
      .toLowerCase();

    const cleanEmail = email.trim().toLowerCase();

    if (cleanDisplayName.length < 2) {
      setMessage("Display name must be at least 2 characters.");
      return;
    }

    if (!/^[a-z0-9_]{3,20}$/.test(cleanHandle)) {
      setMessage(
        "Username must be 3–20 characters and use only letters, numbers or underscore."
      );
      return;
    }

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setMessage("Enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      /*
       * IMPORTANT:
       * Keep this URL relative.
       *
       * Local:
       * http://localhost:3000/api/social-auth/signup
       *
       * Production:
       * https://worldofraaka.online/api/social-auth/signup
       *
       * Do NOT hardcode worldofraaka.online here.
       */
      const response = await fetch("/api/social-auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          displayName: cleanDisplayName,
          handle: cleanHandle,
          email: cleanEmail,
          password,
        }),
      });

      let result: SignupResponse;

      try {
        result = (await response.json()) as SignupResponse;
      } catch {
        result = {
          success: false,
          error: "The server returned an invalid response.",
        };
      }

      if (!response.ok || !result.success) {
        setMessage(
          result.error || "Something went wrong while creating your account."
        );
        return;
      }

      setSuccess(true);
      setMessage(
        result.message ||
          "Account created. Check your email to verify your account."
      );

      setPassword("");
    } catch (error) {
      console.error("RAAKA Social signup request failed:", error);

      setMessage(
        "Could not connect to RAAKA Social. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-[#050505] px-5 text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[.03] p-8 text-center shadow-2xl">
            <div className="text-xs font-bold uppercase tracking-[0.4em] text-red-400">
              WORLD OF RAAKA
            </div>

            <h1 className="mt-5 text-3xl font-black">
              Check your email
            </h1>

            <div className="mx-auto mt-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-3xl">
              ✓
            </div>

            <p className="mt-6 text-sm leading-7 text-white/55">
              Your RAAKA Social account has been created.
              <br />
              We sent a verification link to:
            </p>

            <div className="mt-4 break-all rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3 text-sm font-bold text-white">
              {email}
            </div>

            <p className="mt-5 text-xs leading-6 text-white/35">
              Open the verification email and click{" "}
              <span className="text-white/60">Verify Email</span>.
              <br />
              The link is valid for 24 hours.
            </p>

            <div className="mt-7 space-y-3">
              <a
                href="/social/login"
                className="block rounded-xl bg-white px-4 py-3 text-sm font-black text-black transition hover:bg-white/90"
              >
                Go to Login
              </a>

              <a
                href="/social/resend"
                className="block rounded-xl border border-white/10 px-4 py-3 text-xs font-bold text-white/60 transition hover:bg-white/5 hover:text-white"
              >
                Resend verification email
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-5 text-white">
      <div className="flex min-h-screen items-center justify-center py-10">
        <div className="w-full max-w-md">
          <div className="text-center">
            <div className="text-xs font-bold uppercase tracking-[0.4em] text-red-400">
              WORLD OF RAAKA
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight">
              Join RAAKA Social
            </h1>

            <p className="mt-3 text-sm text-white/40">
              Create your fan identity.
            </p>
          </div>

          <form
            onSubmit={submit}
            className="mt-8 rounded-3xl border border-white/10 bg-white/[.03] p-5 shadow-2xl sm:p-7"
          >
            <div className="space-y-5">
              {/* DISPLAY NAME */}
              <div>
                <label
                  htmlFor="displayName"
                  className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-white/45"
                >
                  Display name
                </label>

                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(event) =>
                    setDisplayName(event.target.value.slice(0, 50))
                  }
                  placeholder="Your name"
                  autoComplete="name"
                  maxLength={50}
                  disabled={loading}
                  className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/25 disabled:opacity-50"
                />
              </div>

              {/* USERNAME */}
              <div>
                <label
                  htmlFor="handle"
                  className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-white/45"
                >
                  Username
                </label>

                <div className="flex items-center rounded-xl border border-white/10 bg-transparent focus-within:border-white/25">
                  <span className="pl-4 text-sm text-white/35">@</span>

                  <input
                    id="handle"
                    type="text"
                    value={handle}
                    onChange={(event) =>
                      setHandle(
                        event.target.value
                          .toLowerCase()
                          .replace(/^@/, "")
                          .replace(/[^a-z0-9_]/g, "")
                          .slice(0, 20)
                      )
                    }
                    placeholder="yourusername"
                    autoComplete="username"
                    maxLength={20}
                    disabled={loading}
                    className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-white outline-none placeholder:text-white/20 disabled:opacity-50"
                  />
                </div>

                <p className="mt-2 text-[10px] text-white/25">
                  3–20 characters · letters, numbers and underscore
                </p>
              </div>

              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-white/45"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={loading}
                  className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/25 disabled:opacity-50"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-white/45"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/25 disabled:opacity-50"
                />
              </div>
            </div>

            {/* ERROR / MESSAGE */}
            {message && (
              <div
                className={`mt-5 rounded-xl border px-3 py-3 text-xs leading-5 ${
                  success
                    ? "border-green-500/20 bg-green-500/10 text-green-300"
                    : "border-red-500/20 bg-red-500/10 text-red-300"
                }`}
              >
                {message}
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-white px-4 py-3.5 text-sm font-black text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>

            <div className="mt-5 text-center text-xs text-white/30">
              Already have an account?
            </div>

            <a
              href="/social/login"
              className="mt-2 block text-center text-sm font-bold text-white/70 transition hover:text-white"
            >
              Log in
            </a>

            <a
              href="/social/resend"
              className="mt-5 block text-center text-[11px] text-white/30 transition hover:text-white/60"
            >
              Resend verification email
            </a>
          </form>

          <p className="mt-5 text-center text-[10px] leading-5 text-white/20">
            By creating an account, you agree to use RAAKA Social
            respectfully and responsibly.
          </p>
        </div>
      </div>
    </main>
  );
}