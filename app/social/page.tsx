"use client";

import { useEffect, useMemo, useState } from "react";

function timeAgo(value: string) {
  const seconds = Math.max(
    1,
    Math.floor(
      (Date.now() -
        new Date(value.replace(" ", "T") + "Z").getTime()) /
        1000
    )
  );

  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  return `${Math.floor(hours / 24)}d`;
}

type Post = {
  id: number;
  body: string;
  createdAt: string;
  likes: number;
  replies: number;
  reposts: number;
  liked: boolean;
  bookmarked: boolean;
  following: boolean;
  author: {
    visitorId: string;
    handle: string;
    displayName: string;
  };
  replyToId: number | null;
  repostOfId: number | null;
};

type Profile = {
  visitorId: string;
  handle: string;
  displayName: string;
  bio: string;
  followers: number;
  following: number;
  posts: number;
  isFollowing?: boolean;
};

type ApiResponse = {
  success?: boolean;
  error?: string;

  posts?: Post[];
  profile?: Profile | null;

  liked?: boolean;
  following?: boolean;
  bookmarked?: boolean;

  users?: Profile[];
};

export default function RaakaSocialPage() {
  const [visitorId, setVisitorId] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [tab, setTab] = useState<"for-you" | "following">("for-you");

  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [text, setText] = useState("");
  const [replying, setReplying] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");

  const [searchResults, setSearchResults] = useState<{
    users: Profile[];
    posts: Post[];
  } | null>(null);

  const [view, setView] = useState<"home" | "profile" | "settings">("home");
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editHandle, setEditHandle] = useState("");
  const [editBio, setEditBio] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const response = await fetch("/api/social-auth/me", {
          cache: "no-store",
        });

        const result = (await response.json()) as {
          success?: boolean;
          authenticated?: boolean;
          verified?: boolean;
          profile?: Profile | null;
        };

        if (cancelled) return;

        if (
          response.ok &&
          result.success &&
          result.authenticated &&
          result.verified &&
          result.profile?.visitorId
        ) {
          setVisitorId(result.profile.visitorId);
          setProfile(result.profile);
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      } catch {
        if (!cancelled) setAuthenticated(false);
      } finally {
        if (!cancelled) {
          setAuthChecked(true);
          setLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  const api = async (
    method: "GET" | "POST",
    payload: Record<string, unknown> = {}
  ): Promise<ApiResponse> => {
    if (method === "GET") {
      const params = new URLSearchParams(
        Object.entries(payload).map(([key, value]) => [
          key,
          String(value),
        ])
      );

      const response = await fetch(`/api/social?${params}`, {
        cache: "no-store",
      });

      return (await response.json()) as ApiResponse;
    }

    const response = await fetch("/api/social", {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return (await response.json()) as ApiResponse;
  };

  const load = async () => {
    if (!visitorId || !authenticated) return;

    setLoading(true);

    try {
      const [feed, me] = await Promise.all([
        api("GET", {
          action: tab,
        }),

        api("GET", {
          action: "profile",
        }),
      ]);

      if (feed.success) {
        setPosts(feed.posts ?? []);
      }

      if (me.success) {
        setProfile(me.profile ?? null);
      }
    } catch {
      setMessage("Could not load RAAKA Social");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [visitorId, authenticated, tab]);

  const createPost = async () => {
    if (!text.trim() || posting || !visitorId || !authenticated) return;

    setPosting(true);
    setMessage("");

    try {
      const result = await api("POST", {
        action: "post",
        text,
      });

      if (result.success) {
        setText("");
        setMessage("Posted");

        await load();
      } else {
        setMessage(result.error || "Could not post");
      }
    } catch {
      setMessage("Could not post");
    } finally {
      setPosting(false);
    }
  };

  const like = async (postId: number) => {
    const result = await api("POST", {
      action: "like",
      postId,
    });

    if (result.success) {
      setPosts((items) =>
        items.map((p) =>
          p.id === postId
            ? {
                ...p,
                liked: result.liked ?? p.liked,
                likes: Math.max(
                  0,
                  p.likes + (result.liked ? 1 : -1)
                ),
              }
            : p
        )
      );
    }
  };

  const follow = async (targetId: string) => {
    const result = await api("POST", {
      action: "follow",
      targetId,
    });

    if (result.success) {
      setPosts((items) =>
        items.map((p) =>
          p.author.visitorId === targetId
            ? {
                ...p,
                following: result.following ?? p.following,
              }
            : p
        )
      );
    }
  };

  const repost = async (postId: number) => {
    const result = await api("POST", {
      action: "repost",
      postId,
    });

    setMessage(
      result.success
        ? "Reposted"
        : result.error || "Already reposted"
    );

    if (result.success) {
      await load();
    }
  };

  const bookmark = async (postId: number) => {
    const result = await api("POST", {
      action: "bookmark",
      postId,
    });

    if (result.success) {
      setPosts((items) =>
        items.map((p) =>
          p.id === postId
            ? {
                ...p,
                bookmarked:
                  result.bookmarked ?? p.bookmarked,
              }
            : p
        )
      );
    }
  };

  const reply = async (postId: number) => {
    if (!replyText.trim()) return;

    const result = await api("POST", {
      action: "reply",
      postId,
      text: replyText,
    });

    if (result.success) {
      setReplyText("");
      setReplying(null);

      setPosts((items) =>
        items.map((p) =>
          p.id === postId
            ? {
                ...p,
                replies: p.replies + 1,
              }
            : p
        )
      );
    } else {
      setMessage(result.error || "Could not reply");
    }
  };

  const openProfile = () => {
    setView("profile");
    setEditingProfile(false);
  };

  const openSettings = () => {
    setView("settings");
    setEditingProfile(false);
  };

  const startEditingProfile = () => {
    setEditName(profile?.displayName || "");
    setEditHandle(profile?.handle || "");
    setEditBio(profile?.bio || "");
    setEditingProfile(true);
  };

  const saveProfile = async () => {
    if (savingProfile) return;
    setSavingProfile(true);
    setMessage("");

    try {
      const result = await api("POST", {
        action: "profile",
        displayName: editName,
        handle: editHandle,
        bio: editBio,
      });

      if (result.success && result.profile) {
        setProfile(result.profile);
        setEditingProfile(false);
        setMessage("Profile updated");
      } else {
        setMessage(result.error || "Could not update profile");
      }
    } catch {
      setMessage("Could not update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const goHome = () => {
    setView("home");
    setEditingProfile(false);
  };

  const doSearch = async () => {
    if (!search.trim()) {
      setSearchResults(null);
      return;
    }

    const result = await api("GET", {
      action: "search",
      q: search,
    });

    if (result.success) {
      setSearchResults({
        users: result.users ?? [],
        posts: result.posts ?? [],
      });
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/social-auth/logout", {
        method: "POST",
      });
    } finally {
      setAuthenticated(false);
      setVisitorId("");
      setProfile(null);
      setPosts([]);
    }
  };

  const profileInitial = useMemo(
    () =>
      (profile?.displayName || "R")
        .slice(0, 1)
        .toUpperCase(),
    [profile]
  );

  if (!authChecked) {
    return (
      <main className="min-h-screen bg-[#050505] text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-sm text-white/40">
            Checking RAAKA Social account…
          </div>
        </div>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-[#050505] px-5 text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[.03] p-8 text-center">
            <div className="text-xs font-bold uppercase tracking-[.4em] text-red-400">
              WORLD OF RAAKA
            </div>

            <h1 className="mt-5 text-4xl font-black">
              RAAKA Social
            </h1>

            <p className="mt-4 text-sm leading-6 text-white/40">
              Login with your verified RAAKA Social account to join the community.
            </p>

            <div className="mt-7 space-y-3">
              <a
                href="/social/login"
                className="block rounded-xl bg-white px-4 py-3 text-sm font-black text-black"
              >
                Log in
              </a>

              <a
                href="/social/signup"
                className="block rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-white"
              >
                Create account
              </a>

              <a
                href="/social/resend"
                className="block rounded-xl border border-white/10 px-4 py-3 text-xs text-white/50"
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
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[1180px]">

        <aside className="hidden w-[245px] border-r border-white/10 px-5 py-8 lg:block">
          <div className="text-2xl font-black tracking-tight">
            RAAKA
            <span className="text-red-500"> Social</span>
          </div>

          <div className="mt-10 space-y-2 text-sm">
            <button onClick={goHome} className={`flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left transition hover:bg-white/5 hover:text-white ${view === "home" ? "bg-white/10 text-white" : "text-white/70"}`}>
              <span>⌂</span><span>Home</span>
            </button>
            <button onClick={() => { setView("home"); setTimeout(() => document.getElementById("social-search")?.focus(), 0); }} className="flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left text-white/70 transition hover:bg-white/5 hover:text-white">
              <span>⌕</span><span>Explore</span>
            </button>
            <button onClick={() => setView("home")} className="flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left text-white/70 transition hover:bg-white/5 hover:text-white">
              <span>🔔</span><span>Notifications</span>
            </button>
            <button onClick={() => setView("home")} className="flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left text-white/70 transition hover:bg-white/5 hover:text-white">
              <span>🔖</span><span>Bookmarks</span>
            </button>
            <button onClick={openProfile} className={`flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left transition hover:bg-white/5 hover:text-white ${view === "profile" ? "bg-white/10 text-white" : "text-white/70"}`}>
              <span>♙</span><span>Profile</span>
            </button>
            <button onClick={openSettings} className={`flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left transition hover:bg-white/5 hover:text-white ${view === "settings" ? "bg-white/10 text-white" : "text-white/70"}`}>
              <span>⚙</span><span>Settings</span>
            </button>
          </div>

          <button onClick={openProfile} className="mt-8 w-full rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-transparent p-5 text-left transition hover:border-red-500/40">
            <div className="text-xs uppercase tracking-[.25em] text-red-400">
              RAAKA FAN
            </div>

            <div className="mt-3 text-lg font-bold">
              {profile?.displayName || "RAAKA Fan"}
            </div>

            <div className="text-xs text-white/40">
              @{profile?.handle || "loading"}
            </div>
          </button>

          <button
            onClick={logout}
            className="mt-4 w-full rounded-2xl border border-white/10 px-4 py-3 text-left text-xs font-bold text-white/50 transition hover:border-red-500/20 hover:bg-red-500/5 hover:text-red-300"
          >
            Log out
          </button>
        </aside>

        <section className="w-full max-w-[680px] border-r border-white/10">

          {view === "profile" ? (
            <div className="min-h-screen">
              <header className="sticky top-0 z-20 border-b border-white/10 bg-[#050505]/90 px-5 py-5 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <button onClick={goHome} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-white/60 hover:text-white">←</button>
                  <div>
                    <div className="text-xl font-black">Profile</div>
                    <div className="text-xs text-white/35">@{profile?.handle}</div>
                  </div>
                </div>
              </header>

              <div className="border-b border-white/10 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-400 text-3xl font-black">
                    {profileInitial}
                  </div>
                  {!editingProfile && (
                    <button onClick={startEditingProfile} className="rounded-full border border-white/15 px-5 py-2 text-xs font-bold hover:bg-white/5">Edit profile</button>
                  )}
                </div>

                {editingProfile ? (
                  <div className="mt-6 space-y-3">
                    <input value={editName} onChange={(e) => setEditName(e.target.value.slice(0, 40))} placeholder="Display name" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" />
                    <input value={editHandle} onChange={(e) => setEditHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20))} placeholder="Handle" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" />
                    <textarea value={editBio} onChange={(e) => setEditBio(e.target.value.slice(0, 160))} placeholder="Bio" rows={3} className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" />
                    <div className="flex gap-2">
                      <button onClick={saveProfile} disabled={savingProfile} className="rounded-full bg-white px-5 py-2 text-xs font-black text-black disabled:opacity-40">{savingProfile ? "Saving…" : "Save changes"}</button>
                      <button onClick={() => setEditingProfile(false)} className="rounded-full border border-white/10 px-5 py-2 text-xs font-bold text-white/60">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mt-5 text-2xl font-black">{profile?.displayName}</div>
                    <div className="mt-1 text-sm text-white/35">@{profile?.handle}</div>
                    {profile?.bio && <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-white/70">{profile.bio}</p>}
                  </>
                )}

                <div className="mt-6 flex gap-6 text-sm">
                  <div><span className="font-black">{profile?.posts ?? 0}</span> <span className="text-white/35">Posts</span></div>
                  <div><span className="font-black">{profile?.followers ?? 0}</span> <span className="text-white/35">Followers</span></div>
                  <div><span className="font-black">{profile?.following ?? 0}</span> <span className="text-white/35">Following</span></div>
                </div>
                {message && <div className="mt-4 text-xs text-red-300">{message}</div>}
              </div>

              <div className="p-10 text-center text-sm text-white/30">
                Your posts will appear here as the profile timeline is expanded.
              </div>
            </div>
          ) : view === "settings" ? (
            <div className="min-h-screen">
              <header className="sticky top-0 z-20 border-b border-white/10 bg-[#050505]/90 px-5 py-5 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <button onClick={goHome} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-white/60 hover:text-white">←</button>
                  <div>
                    <div className="text-xl font-black">Settings</div>
                    <div className="text-xs text-white/35">RAAKA Social account</div>
                  </div>
                </div>
              </header>
              <div className="p-5">
                <div className="rounded-3xl border border-white/10 bg-white/[.03] p-5">
                  <div className="text-xs font-bold uppercase tracking-[.25em] text-red-400">Account</div>
                  <div className="mt-4 text-sm font-bold">{profile?.displayName}</div>
                  <div className="mt-1 text-xs text-white/35">@{profile?.handle}</div>
                  <div className="mt-1 text-xs text-white/35">Verified RAAKA Social account</div>
                </div>
                <div className="mt-4 rounded-3xl border border-white/10 bg-white/[.03] p-5">
                  <div className="text-xs font-bold uppercase tracking-[.25em] text-white/40">Profile</div>
                  <button onClick={startEditingProfile} className="mt-4 flex w-full items-center justify-between rounded-2xl border border-white/10 px-4 py-4 text-left text-sm hover:bg-white/5">
                    <span>Edit profile</span><span className="text-white/30">→</span>
                  </button>
                </div>
                <div className="mt-4 rounded-3xl border border-red-500/15 bg-red-500/[.03] p-5">
                  <div className="text-xs font-bold uppercase tracking-[.25em] text-red-400">Session</div>
                  <button onClick={logout} className="mt-4 w-full rounded-2xl border border-red-500/20 px-4 py-4 text-left text-sm font-bold text-red-300 hover:bg-red-500/10">Log out of RAAKA Social</button>
                </div>
              </div>
            </div>
          ) : (
            <>
          <header className="sticky top-0 z-20 border-b border-white/10 bg-[#050505]/90 px-5 py-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-black">
                  RAAKA Social
                </div>

                <div className="text-xs text-white/35">
                  Text-only fan community
                </div>
              </div>

              <div className="flex items-center gap-2 lg:hidden">
                <button onClick={openProfile} className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500/10 font-bold text-red-400" aria-label="Profile">
                  {profileInitial}
                </button>
                <button onClick={openSettings} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60" aria-label="Settings">
                  ⚙
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 rounded-xl bg-white/[.03] p-1">

              <button
                onClick={() => setTab("for-you")}
                className={`rounded-lg py-2 text-xs font-bold ${
                  tab === "for-you"
                    ? "bg-white/10 text-white"
                    : "text-white/40"
                }`}
              >
                For You
              </button>

              <button
                onClick={() => setTab("following")}
                className={`rounded-lg py-2 text-xs font-bold ${
                  tab === "following"
                    ? "bg-white/10 text-white"
                    : "text-white/40"
                }`}
              >
                Following
              </button>

            </div>
          </header>

          <div className="border-b border-white/10 p-5">
            <div className="flex gap-3">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-400 font-black">
                {profileInitial}
              </div>

              <div className="min-w-0 flex-1">

                <textarea
                  value={text}
                  onChange={(e) =>
                    setText(
                      e.target.value.slice(0, 280)
                    )
                  }
                  placeholder="What's happening in the RAAKA universe?"
                  rows={3}
                  className="w-full resize-none bg-transparent text-base outline-none placeholder:text-white/25"
                />

                <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">

                  <span
                    className={`text-xs ${
                      text.length > 250
                        ? "text-red-400"
                        : "text-white/30"
                    }`}
                  >
                    {text.length}/280
                  </span>

                  <button
                    disabled={!text.trim() || posting}
                    onClick={createPost}
                    className="rounded-full bg-white px-5 py-2 text-xs font-black text-black disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    {posting ? "Posting…" : "Post"}
                  </button>

                </div>
              </div>
            </div>

            {message && (
              <div className="mt-2 text-xs text-red-300">
                {message}
              </div>
            )}
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-white/30">
              Loading RAAKA Social…
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-3xl">✦</div>

              <div className="mt-3 font-bold">
                No posts yet
              </div>

              <div className="mt-1 text-sm text-white/35">
                Be the first RAAKA fan to post something.
              </div>
            </div>
          ) : (
            posts.map((post) => (
              <article
                key={post.id}
                className="border-b border-white/10 px-5 py-5 transition hover:bg-white/[.018]"
              >
                <div className="flex gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 font-bold">
                    {post.author.displayName
                      .slice(0, 1)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">

                    <div className="flex items-center gap-2 text-sm">

                      <span className="font-bold">
                        {post.author.displayName}
                      </span>

                      <span className="text-white/35">
                        @{post.author.handle}
                      </span>

                      <span className="text-white/20">
                        · {timeAgo(post.createdAt)}
                      </span>

                      {post.author.visitorId !== visitorId && (
                        <button
                          onClick={() =>
                            follow(post.author.visitorId)
                          }
                          className="ml-auto text-xs font-bold text-red-400"
                        >
                          {post.following
                            ? "Following"
                            : "Follow"}
                        </button>
                      )}

                    </div>

                    <p className="mt-2 whitespace-pre-wrap break-words text-[15px] leading-6 text-white/90">
                      {post.body}
                    </p>

                    <div className="mt-4 flex max-w-[500px] items-center justify-between text-xs text-white/35">

                      <button
                        onClick={() =>
                          setReplying(
                            replying === post.id
                              ? null
                              : post.id
                          )
                        }
                        className="group flex items-center gap-2 hover:text-white"
                      >
                        <span>💬</span>
                        {post.replies}
                      </button>

                      <button
                        onClick={() => repost(post.id)}
                        className="flex items-center gap-2 hover:text-green-300"
                      >
                        <span>🔁</span>
                        {post.reposts}
                      </button>

                      <button
                        onClick={() => like(post.id)}
                        className={`flex items-center gap-2 ${
                          post.liked
                            ? "text-red-400"
                            : "hover:text-red-300"
                        }`}
                      >
                        <span>
                          {post.liked ? "♥" : "♡"}
                        </span>

                        {post.likes}
                      </button>

                      <button
                        onClick={() =>
                          bookmark(post.id)
                        }
                        className={
                          post.bookmarked
                            ? "text-amber-300"
                            : "hover:text-amber-300"
                        }
                      >
                        🔖
                      </button>

                      <button
                        onClick={() =>
                          navigator.clipboard?.writeText(
                            `${location.origin}/social?post=${post.id}`
                          )
                        }
                        className="hover:text-white"
                      >
                        ↗
                      </button>

                    </div>

                    {replying === post.id && (
                      <div className="mt-4 flex gap-2">

                        <input
                          value={replyText}
                          onChange={(e) =>
                            setReplyText(
                              e.target.value.slice(0, 280)
                            )
                          }
                          placeholder="Reply to this post…"
                          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
                        />

                        <button
                          onClick={() =>
                            reply(post.id)
                          }
                          className="rounded-xl bg-white px-4 text-xs font-bold text-black"
                        >
                          Reply
                        </button>

                      </div>
                    )}

                  </div>
                </div>
              </article>
              ))
          )}

            </>
          )}
        

        </section>

        <aside className="hidden w-[300px] px-5 py-8 xl:block">

          <div className="rounded-2xl border border-white/10 bg-white/[.03] p-3">

            <div className="flex gap-2">

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    doSearch();
                  }
                }}
                id="social-search"
                placeholder="Search RAAKA Social"
                className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none"
              />

              <button
                onClick={doSearch}
                className="rounded-xl bg-white/10 px-3 text-xs"
              >
                Search
              </button>

            </div>
          </div>

          {searchResults ? (
            <div className="mt-5 rounded-3xl border border-white/10 bg-white/[.03] p-5">

              <div className="text-xs font-bold uppercase tracking-[.2em] text-white/40">
                Search
              </div>

              <div className="mt-4 space-y-3">

                {searchResults.users.map((user) => (
                  <div key={user.visitorId}>

                    <div className="font-bold">
                      {user.displayName}
                    </div>

                    <div className="text-xs text-white/35">
                      @{user.handle} · {user.followers} followers
                    </div>

                  </div>
                ))}

                {!searchResults.users.length &&
                  !searchResults.posts.length && (
                    <div className="text-sm text-white/30">
                      Nothing found.
                    </div>
                  )}

              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-3xl border border-white/10 bg-white/[.03] p-5">

              <div className="text-xs font-bold uppercase tracking-[.2em] text-red-400">
                RAAKA Social
              </div>

              <div className="mt-3 text-lg font-bold">
                Talk. Follow. React.
              </div>

              <p className="mt-2 text-sm leading-6 text-white/40">
                A lightweight text-only community for
                RAAKA fans. No photo or video uploads.
              </p>

            </div>
          )}

        </aside>

      </div>
    </main>
  );
}