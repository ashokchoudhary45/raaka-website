"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

type FanArt = {
  id: number;
  created_at: string;
  fan_name: string;
  title: string;
  image_url: string;
  social_link: string | null;
  status: "pending" | "approved" | "rejected";
};

export default function AdminFansArtPage() {
  const supabase = getSupabase();

  const [session, setSession] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [items, setItems] = useState<FanArt[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  const [filter, setFilter] = useState<
    "pending" | "approved" | "rejected"
  >("pending");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session);
        setLoadingAuth(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setLoadingAuth(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (session) {
      loadFanArts();
    }
  }, [session, filter]);

  async function login(e: React.FormEvent) {
    e.preventDefault();

    setLoggingIn(true);
    setLoginError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setLoginError(error.message);
    } else {
      setSession(data.session);
    }

    setLoggingIn(false);
  }

  async function logout() {
    await supabase.auth.signOut();
    setSession(null);
  }

  async function loadFanArts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("fan_art")
      .select(
        "id, created_at, fan_name, title, image_url, social_link, status"
      )
      .eq("status", filter)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setItems(data as FanArt[]);
    }

    setLoading(false);
  }

  async function updateStatus(
    id: number,
    status: "approved" | "rejected"
  ) {
    setActionId(id);

    const { error } = await supabase
      .from("fan_art")
      .update({ status })
      .eq("id", id);

    if (error) {
    alert("Error: " + error.message);
    } else {
      setItems((current) =>
        current.filter((item) => item.id !== id)
      );
    }

    setActionId(null);
  }

  if (loadingAuth) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-zinc-400">Loading...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-amber-200/60">
              RAAKA
            </p>

            <h1 className="mt-3 text-4xl font-black">
              FAN ART ADMIN
            </h1>

            <p className="mt-3 text-sm text-zinc-500">
              Private administration panel
            </p>
          </div>

          <form
            onSubmit={login}
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8"
          >
            <label className="block text-sm text-zinc-400 mb-2">
              Email
            </label><input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none focus:border-white/30"
              placeholder="Admin email"
            />

            <label className="block text-sm text-zinc-400 mt-5 mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none focus:border-white/30"
              placeholder="Password"
            />

            {loginError && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loggingIn}
              className="mt-6 w-full rounded-xl bg-white px-5 py-3 font-bold text-black transition hover:bg-zinc-200 disabled:opacity-50"
            >
              {loggingIn ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12">

        {/* HEADER */}
        <header className="flex flex-col gap-5 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-amber-200/60">
              RAAKA
            </p>

            <h1 className="mt-2 text-4xl font-black md:text-6xl">
              FAN ART
            </h1>

            <p className="mt-3 text-sm text-zinc-500">
              Review and manage fan submissions
            </p>
          </div>

          <button
            onClick={logout}
            className="w-fit rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white"
          >
            Sign Out
          </button>
        </header>

        {/* FILTERS */}
        <div className="mt-8 flex flex-wrap gap-3">
          {(["pending", "approved", "rejected"] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
              className={
  filter === status
    ? "rounded-full px-5 py-2.5 text-sm font-semibold capitalize transition bg-white text-black"
    : "rounded-full px-5 py-2.5 text-sm font-semibold capitalize transition border border-white/10 bg-white/[0.04] text-zinc-400 hover:bg-white/10 hover:text-white"
}
              >
                {status}
              </button>
            )
          )}
        </div>

        {/* CONTENT */}
        <section className="mt-8">
          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center">
              <p className="text-zinc-500">
                Loading submissions...
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center">
              <p className="text-2xl font-bold">
                No {filter} submissions
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                Nothing to review here.
              </p>
            </div>
          ) : (<div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]"
                >
                  {/* IMAGE */}
                  <div className="aspect-[4/5] bg-zinc-950">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  {/* INFO */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold">
                          {item.title}
                        </h2>

                        <p className="mt-1 text-sm text-zinc-400">
                          by {item.fan_name}
                        </p>
                      </div>

                      <span
                        className={
  item.status === "pending"
    ? "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-300"
    : item.status === "approved"
    ? "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-300"
    : "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-300"
}
                      >
                        {item.status}
                      </span>
                    </div>

                    <p className="mt-4 text-xs text-zinc-600">
                      {new Date(item.created_at).toLocaleString()}
                    </p>

                    {item.social_link && (
                      <a
                        href={item.social_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 block truncate text-sm text-amber-200/80 hover:text-amber-200"
                      >
                        {item.social_link}
                      </a>
                    )}

                    {/* ACTIONS */}
                    {item.status === "pending" && (
                      <div className="mt-6 grid grid-cols-2 gap-3">
                        <button
                          onClick={() =>
                            updateStatus(item.id, "approved")
                          }
                          disabled={actionId === item.id}
                          className="rounded-xl bg-white px-4 py-3 font-bold text-black transition hover:bg-zinc-200 disabled:opacity-50"
                        >
                          {actionId === item.id
                            ? "..."
                            : "✓ Approve"}
                        </button>

                        <button
                          onClick={() =>
                            updateStatus(item.id, "rejected")
                          }
                          disabled={actionId === item.id}
                          className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 font-bold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                        >
                          {actionId === item.id
                            ? "..."
                            : "✕ Reject"}
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}