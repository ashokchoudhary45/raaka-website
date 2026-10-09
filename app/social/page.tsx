"use client";

// Force Cloudflare/OpenNext to serve this route dynamically instead of treating
// the client-only Social page as a static route.

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
  reposted: boolean;
  author: {
    visitorId: string;
    handle: string;
    displayName: string;
    verified?: boolean;
    verificationType?: "blue" | "gold" | "grey" | "none";
    verificationLabel?: string | null;
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
  verified?: boolean;
  verificationType?: "blue" | "gold" | "grey" | "none";
  verificationLabel?: string | null;
};

type ApiResponse = {
  success?: boolean;
  error?: string;

  posts?: Post[];
  profile?: Profile | null;

  liked?: boolean;
  following?: boolean;
  bookmarked?: boolean;
  reposted?: boolean;
  reposts?: number;

  users?: Profile[];
  nextCursor?: number;
  notifications?: NotificationItem[];
};

type NotificationItem = {
  id: number;
  type: string;
  postId: number | null;
  createdAt: string;
  actor: {
    handle: string;
    displayName: string;
    verified?: boolean;
    verificationType?: "blue" | "gold" | "grey" | "none";
    verificationLabel?: string | null;
  };
};

function MenuIcon({ type }: { type: "profile" | "premium" | "communities" | "bookmarks" | "notes" | "lists" | "spaces" | "creator" | "settings" | "theme" }) {
  const common = {
    width: 25,
    height: 25,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (type === "profile") return <svg {...common}><circle cx="12" cy="8" r="3.2" /><path d="M5.5 20c.8-4 3-6 6.5-6s5.7 2 6.5 6" /></svg>;
  if (type === "premium") return <svg {...common}><path d="m12 3 2 2.2 3-.2.7 2.9 2.6 1.5-1.5 2.6.2 3-2.9.7L12 21l-4.1-5.3-2.9-.7.2-3-1.5-2.6L6.3 8 7 5l3 .2L12 3Z" /><path d="m9 12 2 2 4-4" /></svg>;
  if (type === "communities" || type === "notes") return <svg {...common}><circle cx="9" cy="9" r="3" /><circle cx="17" cy="10" r="2.5" /><path d="M3.5 20c.7-3.5 2.7-5.5 5.5-5.5s4.8 2 5.5 5.5" /><path d="M15 15c2.5.2 4.3 1.8 5 4" /></svg>;
  if (type === "bookmarks") return <svg {...common}><path d="M6 4.5A2.5 2.5 0 0 1 8.5 2h7A2.5 2.5 0 0 1 18 4.5V21l-6-3.5L6 21V4.5Z" /></svg>;
  if (type === "lists") return <svg {...common}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>;
  if (type === "spaces") return <svg {...common}><path d="M7 10v4a5 5 0 0 0 10 0v-4" /><path d="M12 4a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V7a3 3 0 0 0-3-3Z" /><path d="M4 13a8 8 0 0 0 16 0M12 21v-2" /></svg>;
  if (type === "creator") return <svg {...common}><path d="m4 15 2-6 10-5 4 4-5 10-6 2-5-5Z" /><path d="m13 7 4 4M8 16l-2 4" /></svg>;
  if (type === "theme") return <svg {...common}><path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" /><path d="M17 3v3M15.5 4.5h3" /></svg>;
  return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V20h-2.6v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.6-1H6v-2.6h.4A1.7 1.7 0 0 0 8 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V5h2.6v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.4V14h-.4a1.7 1.7 0 0 0-1.6 1Z" /></svg>;
}

function ActionIcon({ type }: { type: "reply" | "repost" | "like" | "bookmark" | "share" | "more" }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (type === "reply") return <svg {...common}><path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.5 9.5 0 0 1-4.2-1L3 20l1.2-3.8A8 8 0 0 1 3 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z" /><path d="M8 11h8M8 15h5" /></svg>;
  if (type === "repost") return <svg {...common}><path d="m17 3 4 4-4 4" /><path d="M3 7h18" /><path d="m7 21-4-4 4-4" /><path d="M21 17H3" /></svg>;
  if (type === "like") return <svg {...common}><path d="M20.8 8.7c0 5.1-8.8 10.3-8.8 10.3S3.2 13.8 3.2 8.7A4.7 4.7 0 0 1 12 6.3a4.7 4.7 0 0 1 8.8 2.4Z" /></svg>;
  if (type === "bookmark") return <svg {...common}><path d="M6 4.5A2.5 2.5 0 0 1 8.5 2h7A2.5 2.5 0 0 1 18 4.5V21l-6-3.5L6 21V4.5Z" /></svg>;
  if (type === "share") return <svg {...common}><path d="M12 16V3" /><path d="m7 8 5-5 5 5" /><path d="M5 13v5a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-5" /></svg>;
  return <svg {...common}><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></svg>;
}

function VerificationBadge({
  type,
  label,
}: {
  type?: "blue" | "gold" | "grey" | "none";
  label?: string | null;
}) {
  if (!type || type === "none") return null;

  const config =
    type === "gold"
      ? {
          bg: "bg-yellow-400",
          text: "text-black",
          title: label || "Official Organization",
        }
      : type === "grey"
        ? {
            bg: "bg-gray-300",
            text: "text-black",
            title: label || "Official Account",
          }
        : {
            bg: "bg-[#1d9bf0]",
            text: "text-white",
            title: label || "Verified",
          };

  return (
    <span
      title={config.title}
      aria-label={config.title}
      className={`inline-flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full ${config.bg} ${config.text}`}
    >
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m5 12 4 4L19 6" />
      </svg>
    </span>
  );
}

export default function RaakaSocialPage() {
  const [visitorId, setVisitorId] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [tab, setTab] = useState<"for-you" | "following">("for-you");

  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [nextCursor, setNextCursor] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionPending, setActionPending] = useState<Record<string, boolean>>({});
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [selectedProfilePosts, setSelectedProfilePosts] = useState<Post[]>([]);

  const [text, setText] = useState("");
  const [replying, setReplying] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [moreMenu, setMoreMenu] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");

  const [searchResults, setSearchResults] = useState<{
    users: Profile[];
    posts: Post[];
  } | null>(null);
  const [searchTab, setSearchTab] = useState<"people" | "posts" | "top" | "latest">("people");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [selectedProfileLoading, setSelectedProfileLoading] = useState(false);
  const [profileListMode, setProfileListMode] = useState<"followers" | "following" | null>(null);
  const [profileListUsers, setProfileListUsers] = useState<Profile[]>([]);
  const [profileListLoading, setProfileListLoading] = useState(false);
  const [profileListError, setProfileListError] = useState("");
  const [bookmarkPosts, setBookmarkPosts] = useState<Post[]>([]);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);

  const [view, setView] = useState<"home" | "profile" | "settings" | "bookmarks">("home");
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editHandle, setEditHandle] = useState("");
  const [editBio, setEditBio] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [settingsSection, setSettingsSection] = useState<
    | "home"
    | "account"
    | "security"
    | "privacy"
    | "notifications"
    | "accessibility"
    | "resources"
  >("home");
  const [privateAccount, setPrivateAccount] = useState(false);
  const [replyPermission, setReplyPermission] = useState<"everyone" | "following">("everyone");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [reduceAnimations, setReduceAnimations] = useState(false);
  const [dataSaver, setDataSaver] = useState(false);
  const [fontSize, setFontSize] = useState<"small" | "default" | "large">("default");
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [accountAction, setAccountAction] = useState<"deactivate" | "delete" | null>(null);
  const [accountActionPending, setAccountActionPending] = useState(false);

  useEffect(() => {
    try {
      setPrivateAccount(localStorage.getItem("raaka-social-private") === "1");
      setReplyPermission((localStorage.getItem("raaka-social-replies") as "everyone" | "following") || "everyone");
      setNotificationsEnabled(localStorage.getItem("raaka-social-notifications") !== "0");
      setEmailNotifications(localStorage.getItem("raaka-social-email-notifications") === "1");
      setReduceAnimations(localStorage.getItem("raaka-social-reduce-animations") === "1");
      setDataSaver(localStorage.getItem("raaka-social-data-saver") === "1");
      setFontSize((localStorage.getItem("raaka-social-font-size") as "small" | "default" | "large") || "default");
    } catch {}
  }, []);

  const updateLocalSetting = (key: string, value: string) => {
    try { localStorage.setItem(key, value); } catch {}
  };

  useEffect(() => {
    document.documentElement.dataset.raakaReducedMotion = reduceAnimations ? "1" : "0";
    document.documentElement.dataset.raakaDataSaver = dataSaver ? "1" : "0";
    document.documentElement.dataset.raakaFontSize = fontSize;
    return () => {
      delete document.documentElement.dataset.raakaReducedMotion;
      delete document.documentElement.dataset.raakaDataSaver;
      delete document.documentElement.dataset.raakaFontSize;
    };
  }, [reduceAnimations, dataSaver, fontSize]);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 3200);
    return () => window.clearTimeout(timer);
  }, [message]);

  const setPending = (key: string, value: boolean) => {
    setActionPending((current) => ({ ...current, [key]: value }));
  };

  const resetSettingsHome = () => setSettingsSection("home");

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

  useEffect(() => {
    if (!profileListMode) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProfileListMode(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [profileListMode]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileMenuOpen]);

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
        headers: { Accept: "application/json" },
      });

      const contentType = response.headers.get("content-type") || "";
      const result = contentType.includes("application/json")
        ? ((await response.json()) as ApiResponse)
        : { success: false, error: `Request failed (${response.status})` };

      if (!response.ok && !result.error) {
        result.error = `Request failed (${response.status})`;
      }
      return result;
    }

    const response = await fetch("/api/social", {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get("content-type") || "";
    const result = contentType.includes("application/json")
      ? ((await response.json()) as ApiResponse)
      : { success: false, error: `Request failed (${response.status})` };

    if (!response.ok && !result.error) {
      result.error = `Request failed (${response.status})`;
    }
    return result;
  };

  const load = async (append = false, cursor = 0) => {
    if (!visitorId || !authenticated || (append && !nextCursor)) return;

    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const [feed, me] = await Promise.all([
        api("GET", {
          action: tab,
          ...(cursor > 0 ? { cursor } : {}),
        }),
        append ? Promise.resolve<ApiResponse>({ success: true }) : api("GET", { action: "profile" }),
      ]);

      if (feed.success) {
        const incoming = feed.posts ?? [];
        setPosts((current) => {
          if (!append) return incoming;
          const seen = new Set(current.map((post) => post.id));
          return [...current, ...incoming.filter((post) => !seen.has(post.id))];
        });
        setNextCursor(feed.nextCursor ?? 0);
      } else if (!append) {
        setMessage(feed.error || "Could not load RAAKA Social");
      }

      if (!append && me.success) {
        setProfile(me.profile ?? null);
        const deepProfile =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("profile")
            : null;
        if (!deepProfile) {
          setSelectedProfile((current) =>
            current && current.visitorId !== me.profile?.visitorId
              ? current
              : (me.profile ?? null)
          );
        }
      }
    } catch {
      setMessage("Could not load RAAKA Social");
    } finally {
      if (append) setLoadingMore(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    setNextCursor(0);
    setPosts([]);
    void load(false, 0);
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
    const key = `like:${postId}`;
    if (actionPending[key]) return;
    setPending(key, true);
    const result = await api("POST", {
      action: "like",
      postId,
    });

    if (result.success) {
      const nextLiked = result.liked ?? false;
      const updatePost = (p: Post) =>
        p.id === postId
          ? {
              ...p,
              liked: nextLiked,
              likes: Math.max(0, p.likes + (nextLiked ? 1 : -1)),
            }
          : p;

      setPosts((items) => items.map(updatePost));
      setSelectedProfilePosts((items) => items.map(updatePost));
      setBookmarkPosts((items) => items.map(updatePost));
      setSearchResults((current) =>
        current ? { ...current, posts: current.posts.map(updatePost) } : current
      );
    }
    setPending(key, false);
  };

  const follow = async (targetId: string) => {
    const key = `follow:${targetId}`;
    if (actionPending[key]) return;
    setPending(key, true);
    const result = await api("POST", {
      action: "follow",
      targetId,
    });

    if (result.success) {
      const nextFollowing = result.following ?? false;

      setPosts((items) =>
        items.map((p) =>
          p.author.visitorId === targetId
            ? {
                ...p,
                following: nextFollowing,
              }
            : p
        )
      );

      setSearchResults((current) =>
        current
          ? {
              ...current,
              users: current.users.map((user) =>
                user.visitorId === targetId
                  ? { ...user, isFollowing: nextFollowing }
                  : user
              ),
            }
          : current
      );

      const delta = nextFollowing ? 1 : -1;

      setProfile((current) =>
        current
          ? {
              ...current,
              following:
                current.visitorId === visitorId
                  ? Math.max(0, current.following + delta)
                  : current.following,
              followers:
                current.visitorId === targetId
                  ? Math.max(0, current.followers + delta)
                  : current.followers,
            }
          : current
      );

      setSelectedProfile((current) =>
        current
          ? {
              ...current,
              isFollowing:
                current.visitorId === targetId
                  ? nextFollowing
                  : current.isFollowing,
              following:
                current.visitorId === visitorId
                  ? Math.max(0, current.following + delta)
                  : current.following,
              followers:
                current.visitorId === targetId
                  ? Math.max(0, current.followers + delta)
                  : current.followers,
            }
          : current
      );

      setProfileListUsers((users) =>
        users.map((user) =>
          user.visitorId === targetId
            ? { ...user, isFollowing: nextFollowing }
            : user
        )
      );
    }
    setPending(key, false);
  };

  const repost = async (postId: number) => {
    const key = `repost:${postId}`;
    if (actionPending[key]) return;
    setPending(key, true);

    try {
      const result = await api("POST", { action: "repost", postId });

      if (result.success) {
        const nextReposted = result.reposted ?? false;
        const nextReposts = Math.max(0, Number(result.reposts ?? 0));
        const updatePost = (post: Post) =>
          post.id === postId
            ? { ...post, reposted: nextReposted, reposts: nextReposts }
            : post;

        setPosts((items) => items.map(updatePost));
        setSelectedProfilePosts((items) => items.map(updatePost));
        setBookmarkPosts((items) => items.map(updatePost));
        setSearchResults((current) =>
          current ? { ...current, posts: current.posts.map(updatePost) } : current
        );
        setMessage(nextReposted ? "Reposted" : "Repost removed");
      } else {
        setMessage(result.error || "Could not update repost");
      }
    } catch {
      setMessage("Could not update repost");
    } finally {
      setPending(key, false);
    }
  };

  const bookmark = async (postId: number) => {
    const key = `bookmark:${postId}`;
    if (actionPending[key]) return;
    setPending(key, true);

    try {
      const result = await api("POST", { action: "bookmark", postId });

      if (result.success) {
        const nextBookmarked = result.bookmarked ?? false;
        const updatePost = (post: Post) =>
          post.id === postId ? { ...post, bookmarked: nextBookmarked } : post;

        setPosts((items) => items.map(updatePost));
        setSelectedProfilePosts((items) => items.map(updatePost));
        setSearchResults((current) =>
          current ? { ...current, posts: current.posts.map(updatePost) } : current
        );
        setBookmarkPosts((items) => {
          if (!nextBookmarked) return items.filter((post) => post.id !== postId);
          if (items.some((post) => post.id === postId)) return items.map(updatePost);

          const source =
            posts.find((post) => post.id === postId) ??
            selectedProfilePosts.find((post) => post.id === postId) ??
            searchResults?.posts.find((post) => post.id === postId);
          return source ? [{ ...source, bookmarked: true }, ...items] : items;
        });

        setMessage(nextBookmarked ? "Saved to Bookmarks" : "Removed from Bookmarks");
      } else {
        setMessage(result.error || "Could not update bookmark");
      }
    } catch {
      setMessage("Could not update bookmark");
    } finally {
      setPending(key, false);
    }
  };

  const loadBookmarks = async () => {
    setBookmarksLoading(true);
    try {
      const result = await api("GET", { action: "bookmarks" });
      if (result.success) {
        setBookmarkPosts(result.posts ?? []);
      } else {
        setMessage(result.error || "Could not load Bookmarks");
      }
    } catch {
      setMessage("Could not load Bookmarks");
    } finally {
      setBookmarksLoading(false);
    }
  };

  const openBookmarks = async () => {
    setMobileMenuOpen(false);
    setView("bookmarks");
    setEditingProfile(false);
    await loadBookmarks();
  };

  const sharePost = async (postId: number) => {
    const url = `${location.origin}/social?post=${postId}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "RAAKA Social",
          text: "Check this post on RAAKA Social",
          url,
        });
      } else {
        await navigator.clipboard?.writeText(url);
        setMessage("Post link copied");
      }
    } catch {
      // User cancelled native sharing.
    }
  };

  const deletePost = async (postId: number) => {
    if (!window.confirm("Delete this post?")) return;

    const result = await api("POST", {
      action: "delete",
      postId,
    });

    if (result.success) {
      setPosts((items) => items.filter((post) => post.id !== postId));
      setMoreMenu(null);
      setMessage("Post deleted");
    } else {
      setMessage(result.error || "Could not delete post");
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

  const openProfile = async (handle?: string) => {
    const requestedHandle = (handle || profile?.handle || "").trim();
    if (!requestedHandle) return;

    setView("profile");
    setEditingProfile(false);
    setProfileListMode(null);
    setProfileListUsers([]);
    setProfileListError("");
    setSelectedProfileLoading(true);
    setSelectedProfile(null);

    window.history.replaceState(
      null,
      "",
      `/social?profile=${encodeURIComponent(requestedHandle)}`
    );

    try {
      const result = await api("GET", { action: "profile", handle: requestedHandle });
      if (!result.success || !result.profile) {
        setMessage(result.error || "Could not load profile");
        return;
      }

      const target = result.profile;
      setSelectedProfile(target);
      const postsResult = await api("GET", { action: "user-posts", handle: target.handle });
      setSelectedProfilePosts(postsResult.success ? postsResult.posts ?? [] : []);
    } catch {
      setSelectedProfile(null);
      setSelectedProfilePosts([]);
      setMessage("Could not load profile");
    } finally {
      setSelectedProfileLoading(false);
    }
  };

  const openProfileList = async (mode: "followers" | "following") => {
    const target = selectedProfile;
    if (!target) return;

    setProfileListMode(mode);
    setProfileListUsers([]);
    setProfileListError("");
    setProfileListLoading(true);

    try {
      const result = await api("GET", { action: mode, handle: target.handle });
      if (result.success) {
        setProfileListUsers(result.users ?? []);
      } else {
        setProfileListError(result.error || `Could not load ${mode}`);
      }
    } catch {
      setProfileListError(`Could not load ${mode}`);
    } finally {
      setProfileListLoading(false);
    }
  };

  const openSettings = () => {
    setView("settings");
    setEditingProfile(false);
  };

  const startEditingProfile = () => {
    const owner = selectedProfile?.visitorId === visitorId ? selectedProfile : profile;
    if (!owner || owner.visitorId !== visitorId) return;

    setSelectedProfile(profile ?? owner);
    setEditName(owner.displayName || "");
    setEditHandle(owner.handle || "");
    setEditBio(owner.bio || "");
    setEditingProfile(true);
    setView("profile");
    setProfileListMode(null);
    window.history.replaceState(
      null,
      "",
      `/social?profile=${encodeURIComponent(owner.handle)}`
    );
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
        setSelectedProfile((current) =>
          current?.visitorId === result.profile?.visitorId
            ? (result.profile ?? null)
            : current
        );
        window.history.replaceState(
          null,
          "",
          `/social?profile=${encodeURIComponent(result.profile.handle)}`
        );
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

  const changePassword = async () => {
    if (passwordSaving) return;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("Fill in all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setMessage("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match.");
      return;
    }

    setPasswordSaving(true);
    setMessage("");

    try {
      const result = await api("POST", {
        action: "change-password",
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (result.success) {
        setPasswordModalOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setMessage("Password changed. Please log in again.");
        setAuthenticated(false);
        setVisitorId("");
        setProfile(null);
        setPosts([]);
        setSelectedProfile(null);
      } else {
        setMessage(result.error || "Could not change password.");
      }
    } catch {
      setMessage("Could not change password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const runAccountAction = async () => {
    if (!accountAction || accountActionPending) return;

    setAccountActionPending(true);
    setMessage("");

    try {
      const result = await api("POST", {
        action:
          accountAction === "delete"
            ? "delete-account"
            : "deactivate-account",
      });

      if (result.success) {
        const wasDeleted = accountAction === "delete";
        setAccountAction(null);
        setMessage(
          wasDeleted
            ? "Account permanently deleted."
            : "Account deactivated. You have been signed out."
        );
        setAuthenticated(false);
        setVisitorId("");
        setProfile(null);
        setPosts([]);
        setSelectedProfile(null);
        setBookmarkPosts([]);
        setSearchResults(null);
        setView("home");
        setSettingsSection("home");
      } else {
        setMessage(result.error || "Could not update account.");
      }
    } catch {
      setMessage("Could not update account.");
    } finally {
      setAccountActionPending(false);
    }
  };

  const goHome = () => {
    setView("home");
    setEditingProfile(false);
    setProfileListMode(null);
    if (window.location.search.includes("profile=")) {
      window.history.replaceState(null, "", "/social");
    }
  };

  const doSearch = async (mode: "people" | "posts" | "top" | "latest" = searchTab) => {
    const query = search.trim();
    if (!query) {
      setSearchResults(null);
      setSearchError("");
      return;
    }

    setSearchLoading(true);
    setSearchError("");
    try {
      const result = await api("GET", {
        action: "search",
        q: query,
        mode,
      });

      if (result.success) {
        setSearchResults({
          users: result.users ?? [],
          posts: result.posts ?? [],
        });
      } else {
        setSearchError(result.error || "Search failed");
        setSearchResults(null);
      }
    } catch {
      setSearchError("Could not search right now.");
      setSearchResults(null);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    if (!searchResults || !search.trim()) return;
    const timer = window.setTimeout(() => void doSearch(searchTab), 250);
    return () => window.clearTimeout(timer);
  }, [searchTab]); 

  useEffect(() => {
    if (!authenticated || !visitorId) return;
    const handle = new URLSearchParams(window.location.search).get("profile");
    if (!handle) return;
    void openProfile(handle);
  }, [authenticated, visitorId]);

  const loadNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const result = await api("GET", { action: "notifications" });
      if (result.success) {
        setNotifications(result.notifications ?? []);
      } else {
        setMessage(result.error || "Could not load notifications");
      }
    } catch {
      setMessage("Could not load notifications");
    } finally {
      setNotificationsLoading(false);
    }
  };

  const openNotifications = async () => {
    setView("home");
    await loadNotifications();
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

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <button
              aria-label="Close menu"
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
            />

            <aside className="relative h-full w-[min(86vw,330px)] overflow-y-auto border-r border-white/10 bg-[#050505] px-5 pb-8 pt-5 shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
                <button
                  onClick={() => { setMobileMenuOpen(false); openProfile(); }}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-400 text-xl font-black">
                      {profileInitial}
                    </div>
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <div className="truncate text-lg font-black">{profile?.displayName || "RAAKA Fan"}</div>
                        <VerificationBadge
                          type={profile?.verificationType}
                          label={profile?.verificationLabel}
                        />
                      </div>
                      <div className="truncate text-sm text-white/40">@{profile?.handle || "loading"}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-4 text-sm">
                    <span><b>{profile?.following ?? 0}</b> <span className="text-white/40">Following</span></span>
                    <span><b>{profile?.followers ?? 0}</b> <span className="text-white/40">Followers</span></span>
                  </div>
                </button>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-xl text-white/70 hover:bg-white/10"
                  aria-label="Close menu"
                >
                  ×
                </button>
              </div>

              <nav className="mt-4 space-y-1">
                <button onClick={() => { setMobileMenuOpen(false); openProfile(); }} className="flex w-full items-center gap-5 rounded-2xl px-2 py-3.5 text-left text-[17px] font-bold hover:bg-white/5">
                  <MenuIcon type="profile" /><span>Profile</span>
                </button>
                <button onClick={() => void openBookmarks()} className="flex w-full items-center gap-5 rounded-2xl px-2 py-3.5 text-left text-[17px] font-bold hover:bg-white/5">
                  <MenuIcon type="bookmarks" /><span>Bookmarks</span>
                </button>
                <button onClick={() => { setMobileMenuOpen(false); setMessage("Community Notes are coming soon."); }} className="flex w-full items-center gap-5 rounded-2xl px-2 py-3.5 text-left text-[17px] font-bold hover:bg-white/5">
                  <MenuIcon type="notes" /><span>Community Notes</span>
                </button>
                <button onClick={() => { setMobileMenuOpen(false); setMessage("Lists are coming soon."); }} className="flex w-full items-center gap-5 rounded-2xl px-2 py-3.5 text-left text-[17px] font-bold hover:bg-white/5">
                  <MenuIcon type="lists" /><span>Lists</span>
                </button>
              </nav>

              <div className="my-4 border-t border-white/10" />

              <nav className="space-y-1">
                <button onClick={() => { setMobileMenuOpen(false); openSettings(); }} className="flex w-full items-center gap-5 rounded-2xl px-2 py-3.5 text-left text-[17px] font-bold hover:bg-white/5">
                  <MenuIcon type="settings" /><span>Settings &amp; Privacy</span>
                </button>
                <button onClick={() => { setMobileMenuOpen(false); setMessage("RAAKA Social is already using dark mode."); }} className="flex w-full items-center gap-5 rounded-2xl px-2 py-3.5 text-left text-[17px] font-bold hover:bg-white/5">
                  <MenuIcon type="theme" /><span>Display</span>
                </button>
              </nav>

              <div className="my-4 border-t border-white/10" />

              <button
                onClick={() => { setMobileMenuOpen(false); void logout(); }}
                className="flex w-full items-center gap-5 rounded-2xl px-2 py-3.5 text-left text-[17px] font-bold text-red-300 hover:bg-red-500/10"
              >
                <span className="flex h-[25px] w-[25px] items-center justify-center text-xl">↪</span>
                <span>Log out</span>
              </button>
            </aside>
          </div>
        )}

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
            <button onClick={() => void openBookmarks()} className={`flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left transition hover:bg-white/5 hover:text-white ${view === "bookmarks" ? "bg-white/10 text-white" : "text-white/70"}`}>
              <span>🔖</span><span>Bookmarks</span>
            </button>
            <button onClick={() => void openProfile()} className={`flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left transition hover:bg-white/5 hover:text-white ${view === "profile" ? "bg-white/10 text-white" : "text-white/70"}`}>
              <span>♙</span><span>Profile</span>
            </button>
            <button onClick={openSettings} className={`flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left transition hover:bg-white/5 hover:text-white ${view === "settings" ? "bg-white/10 text-white" : "text-white/70"}`}>
              <span>⚙</span><span>Settings</span>
            </button>
          </div>

          <button onClick={() => void openProfile()} className="mt-8 w-full rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-transparent p-5 text-left transition hover:border-red-500/40">
            <div className="text-xs uppercase tracking-[.25em] text-red-400">
              RAAKA FAN
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-lg font-bold">
              <span>{profile?.displayName || "RAAKA Fan"}</span>
              <VerificationBadge
                type={profile?.verificationType}
                label={profile?.verificationLabel}
              />
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
                  <div className="min-w-0">
                    <div className="text-xl font-black">Profile</div>
                    <div className="truncate text-xs text-white/35">@{selectedProfile?.handle || ""}</div>
                  </div>
                </div>
              </header>

              {selectedProfileLoading && !selectedProfile ? (
                <div className="p-10 text-center text-sm text-white/30">Loading profile…</div>
              ) : selectedProfile ? (
                <>
                  <div className="border-b border-white/10 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-400 text-3xl font-black">
                        {(selectedProfile.displayName || "R").slice(0, 1).toUpperCase()}
                      </div>

                      {selectedProfile.visitorId === visitorId ? (
                        !editingProfile && (
                          <button onClick={startEditingProfile} className="rounded-full border border-white/15 px-5 py-2 text-xs font-bold hover:bg-white/5">Edit profile</button>
                        )
                      ) : (
                        <button
                          type="button"
                          onClick={() => follow(selectedProfile.visitorId)}
                          disabled={Boolean(actionPending[`follow:${selectedProfile.visitorId}`])}
                          className={`rounded-full px-5 py-2 text-xs font-black disabled:opacity-50 ${selectedProfile.isFollowing ? "border border-white/15 text-white/70" : "bg-white text-black"}`}
                        >
                          {selectedProfile.isFollowing ? "Following" : "Follow"}
                        </button>
                      )}
                    </div>

                    {editingProfile && selectedProfile.visitorId === visitorId ? (
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
                        <div className="mt-5 flex items-center gap-2 text-2xl font-black">
                          <span>{selectedProfile.displayName}</span>
                          <VerificationBadge type={selectedProfile.verificationType} label={selectedProfile.verificationLabel} />
                        </div>
                        <div className="mt-1 text-sm text-white/35">@{selectedProfile.handle}</div>
                        {selectedProfile.bio && <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-white/70">{selectedProfile.bio}</p>}
                      </>
                    )}

                    <div className="mt-6 flex gap-6 text-sm">
                      <div><span className="font-black">{selectedProfile.posts}</span> <span className="text-white/35">Posts</span></div>
                      <button type="button" onClick={() => void openProfileList("followers")} className="text-left hover:text-white">
                        <span className="font-black">{selectedProfile.followers}</span> <span className="text-white/35">Followers</span>
                      </button>
                      <button type="button" onClick={() => void openProfileList("following")} className="text-left hover:text-white">
                        <span className="font-black">{selectedProfile.following}</span> <span className="text-white/35">Following</span>
                      </button>
                    </div>
                    {message && <div className="mt-4 text-xs text-red-300">{message}</div>}
                  </div>

                  <div className="border-b border-white/10">
                    {selectedProfileLoading ? (
                      <div className="p-10 text-center text-sm text-white/30">Loading posts…</div>
                    ) : selectedProfilePosts.length ? (
                      selectedProfilePosts.map((post) => (
                        <article key={post.id} className="border-b border-white/10 px-5 py-5 last:border-b-0">
                          <button type="button" onClick={() => void openProfile(post.author.handle)} className="text-left text-sm font-bold hover:underline">
                            {post.author.displayName}
                            <span className="ml-2 font-normal text-white/35">@{post.author.handle} · {timeAgo(post.createdAt)}</span>
                          </button>
                          <p className="mt-2 whitespace-pre-wrap break-words text-[15px] leading-6 text-white/90">{post.body}</p>
                          <div className="mt-3 text-xs text-white/35">{post.likes} likes · {post.replies} replies · {post.reposts} reposts</div>
                        </article>
                      ))
                    ) : (
                      <div className="p-10 text-center text-sm text-white/30">No posts from this profile yet.</div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-10 text-center text-sm text-white/30">Profile not found.</div>
              )}
            </div>

          ) : view === "bookmarks" ? (
            <div className="min-h-screen">
              <header className="sticky top-0 z-20 border-b border-white/10 bg-[#050505]/90 px-5 py-5 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <button onClick={goHome} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-white/60 hover:text-white">←</button>
                  <div>
                    <div className="text-xl font-black">Bookmarks</div>
                    <div className="text-xs text-white/35">Posts you saved</div>
                  </div>
                </div>
              </header>

              {bookmarksLoading ? (
                <div className="p-10 text-center text-sm text-white/30">Loading Bookmarks…</div>
              ) : bookmarkPosts.length ? (
                <div>
                  {bookmarkPosts.map((post) => (
                    <article key={post.id} className="border-b border-white/10 px-5 py-5 transition hover:bg-white/[.018]">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => void openProfile(post.author.handle)}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 font-bold"
                          aria-label={`Open @${post.author.handle} profile`}
                        >
                          {post.author.displayName.slice(0, 1).toUpperCase()}
                        </button>
                        <div className="min-w-0 flex-1">
                          <button type="button" onClick={() => void openProfile(post.author.handle)} className="text-left text-sm font-bold hover:underline">
                            {post.author.displayName}
                            <span className="ml-2 font-normal text-white/35">@{post.author.handle} · {timeAgo(post.createdAt)}</span>
                          </button>
                          <p className="mt-2 whitespace-pre-wrap break-words text-[15px] leading-6 text-white/90">{post.body}</p>
                          <div className="mt-3 flex items-center gap-4 text-xs text-white/35">
                            <span>{post.likes} likes</span>
                            <span>{post.replies} replies</span>
                            <span>{post.reposts} reposts</span>
                            <button type="button" onClick={() => void bookmark(post.id)} disabled={Boolean(actionPending[`bookmark:${post.id}`])} className="ml-auto text-amber-400 disabled:opacity-40">Remove bookmark</button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="text-3xl">🔖</div>
                  <div className="mt-3 font-bold">No bookmarks yet</div>
                  <div className="mt-1 text-sm text-white/35">Save a post and it will appear here.</div>
                </div>
              )}
            </div>

          ) : view === "settings" ? (
            <div className="min-h-screen">
              <header className="sticky top-0 z-20 border-b border-white/10 bg-[#050505]/95 px-5 py-4 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => settingsSection === "home" ? goHome() : resetSettingsHome()}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-3xl text-white/80 hover:bg-white/10"
                    aria-label="Back"
                  >
                    ←
                  </button>
                  <div className="min-w-0">
                    <div className="text-2xl font-black">Settings</div>
                    <div className="truncate text-sm text-white/35">@{profile?.handle}</div>
                  </div>
                </div>
              </header>

              {settingsSection === "home" ? (
                <div className="p-5">
                  <div className="mb-6 rounded-full bg-white/[.05] px-5 py-4 text-white/40">
                    🔍 <span className="ml-2">Search settings</span>
                  </div>

                  <div className="space-y-1">
                    {[
                      ["account", "👤", "Your account", "Manage your account information, profile and account options."],
                      ["security", "🔒", "Security and account access", "Manage your password, sessions and account security."],
                      ["privacy", "🛡️", "Privacy and safety", "Control who can follow, reply, mention and interact with you."],
                      ["notifications", "🔔", "Notifications", "Choose the notifications you receive from RAAKA Social."],
                      ["accessibility", "♿", "Accessibility, display and languages", "Customize text size, animations, theme and data usage."],
                      ["resources", "🔗", "Additional resources", "Your data, policies, guidelines and RAAKA Social help."],
                    ].map(([key, icon, title, description]) => (
                      <button
                        key={key}
                        onClick={() => setSettingsSection(key as typeof settingsSection)}
                        className="flex w-full items-start gap-4 rounded-2xl px-2 py-5 text-left transition hover:bg-white/[.04]"
                      >
                        <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center text-2xl grayscale">{icon}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[17px] font-bold">{title}</span>
                          <span className="mt-1 block text-sm leading-6 text-white/40">{description}</span>
                        </span>
                        <span className="pt-2 text-xl text-white/25">›</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : settingsSection === "account" ? (
                <div className="p-5">
                  <div className="rounded-3xl border border-white/10 bg-white/[.03] p-5">
                    <div className="text-xs font-bold uppercase tracking-[.2em] text-red-400">Account information</div>
                    <div className="mt-5 space-y-4 text-sm">
                      <div><div className="text-white/35">Display name</div><div className="mt-1 font-bold">{profile?.displayName}</div></div>
                      <div><div className="text-white/35">Username</div><div className="mt-1 font-bold">@{profile?.handle}</div></div>
                      <div><div className="text-white/35">Account status</div><div className="mt-1 font-bold text-emerald-300">Verified</div></div>
                    </div>
                  </div>
                  <button onClick={startEditingProfile} className="mt-4 flex w-full items-center justify-between rounded-2xl border border-white/10 px-4 py-4 text-left font-bold hover:bg-white/5"><span>Edit profile</span><span className="text-white/30">→</span></button>
                  <button onClick={() => { setMessage(""); setPasswordModalOpen(true); }} className="mt-2 flex w-full items-center justify-between rounded-2xl border border-white/10 px-4 py-4 text-left font-bold hover:bg-white/5"><span>Change password</span><span className="text-white/30">→</span></button>
                  <div className="mt-6 rounded-3xl border border-red-500/15 bg-red-500/[.03] p-5">
                    <div className="font-bold text-red-300">Account deactivation</div>
                    <p className="mt-2 text-sm leading-6 text-white/40">Temporarily deactivate your RAAKA Social account. Your profile and posts are kept, but all active sessions are signed out.</p>
                    <button onClick={() => setAccountAction("deactivate")} className="mt-4 rounded-full border border-red-500/20 px-5 py-2 text-xs font-bold text-red-300 hover:bg-red-500/10">Deactivate account</button>
                    <button onClick={() => setAccountAction("delete")} className="ml-2 mt-4 rounded-full bg-red-500 px-5 py-2 text-xs font-black text-white">Delete account</button>
                  </div>
                  {message && <div className="mt-4 text-xs text-red-300">{message}</div>}
                </div>
              ) : settingsSection === "security" ? (
                <div className="p-5 space-y-3">
                  {[
                    ["Change password", "Update the password used to sign in."],
                    ["Login sessions", "Review active sessions and devices."],
                    ["Email verification", "Your RAAKA Social email is verified."],
                    ["Log out of all devices", "End every active session except the current one."],
                  ].map(([title, desc], i) => (
                    <button
                      key={title}
                      onClick={() => {
                        if (i === 0) {
                          setMessage("");
                          setPasswordModalOpen(true);
                        } else if (i === 2) {
                          setMessage("Your account email is verified.");
                        } else {
                          setMessage(`${title} is not available yet.`);
                        }
                      }}
                      className="w-full rounded-2xl border border-white/10 px-5 py-4 text-left hover:bg-white/[.04]"
                    >
                      <div className="font-bold">{title}</div>
                      <div className="mt-1 text-sm leading-6 text-white/40">{desc}</div>
                    </button>
                  ))}
                  {message && <div className="text-xs text-red-300">{message}</div>}
                </div>
              ) : settingsSection === "privacy" ? (
                <div className="p-5 space-y-4">
                  <div className="rounded-3xl border border-white/10 bg-white/[.03] p-5">
                    <div className="font-bold">Private account</div><div className="mt-1 text-sm text-white/40">Only approved followers can see your posts.</div>
                    <button onClick={() => { const v=!privateAccount; setPrivateAccount(v); updateLocalSetting("raaka-social-private", v?"1":"0"); }} className={`mt-4 h-8 w-14 rounded-full p-1 ${privateAccount ? "bg-red-500" : "bg-white/15"}`}><span className={`block h-6 w-6 rounded-full bg-white transition ${privateAccount ? "translate-x-6" : "translate-x-0"}`} /></button>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/[.03] p-5"><div className="font-bold">Who can reply</div><div className="mt-1 text-sm text-white/40">Choose who can reply to your posts.</div><div className="mt-4 flex gap-2"><button onClick={() => {setReplyPermission("everyone");updateLocalSetting("raaka-social-replies","everyone")}} className={`rounded-full px-4 py-2 text-xs font-bold ${replyPermission === "everyone" ? "bg-white text-black" : "border border-white/10 text-white/60"}`}>Everyone</button><button onClick={() => {setReplyPermission("following");updateLocalSetting("raaka-social-replies","following")}} className={`rounded-full px-4 py-2 text-xs font-bold ${replyPermission === "following" ? "bg-white text-black" : "border border-white/10 text-white/60"}`}>People you follow</button></div></div>
                  {[
                    ["Blocked accounts", "Manage accounts you have blocked."],
                    ["Muted accounts", "Manage accounts you have muted."],
                    ["Hidden words", "Filter words and phrases from your experience."],
                    ["Report history", "Review reports submitted from your account."],
                  ].map(([title, desc]) => <button key={title} onClick={() => setMessage(`${title} management will open here.`)} className="w-full rounded-2xl border border-white/10 px-5 py-4 text-left hover:bg-white/[.04]"><div className="font-bold">{title}</div><div className="mt-1 text-sm text-white/40">{desc}</div></button>)}
                  {message && <div className="text-xs text-red-300">{message}</div>}
                </div>
              ) : settingsSection === "notifications" ? (
                <div className="p-5 space-y-3">
                  {[["Likes", true],["Replies", true],["Reposts", true],["New followers", true],["Mentions", true]].map(([title]) => <div key={String(title)} className="flex items-center justify-between rounded-2xl border border-white/10 px-5 py-4"><div><div className="font-bold">{title}</div><div className="mt-1 text-sm text-white/40">Notify me about {String(title).toLowerCase()}.</div></div><div className="h-2 w-2 rounded-full bg-emerald-400" /></div>)}
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 px-5 py-4"><div><div className="font-bold">Push notifications</div><div className="mt-1 text-sm text-white/40">Allow activity notifications.</div></div><button onClick={() => {const v=!notificationsEnabled;setNotificationsEnabled(v);updateLocalSetting("raaka-social-notifications",v?"1":"0")}} className={`h-8 w-14 rounded-full p-1 ${notificationsEnabled?"bg-red-500":"bg-white/15"}`}><span className={`block h-6 w-6 rounded-full bg-white transition ${notificationsEnabled?"translate-x-6":"translate-x-0"}`} /></button></div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 px-5 py-4"><div><div className="font-bold">Email notifications</div><div className="mt-1 text-sm text-white/40">Receive important account emails.</div></div><button onClick={() => {const v=!emailNotifications;setEmailNotifications(v);updateLocalSetting("raaka-social-email-notifications",v?"1":"0")}} className={`h-8 w-14 rounded-full p-1 ${emailNotifications?"bg-red-500":"bg-white/15"}`}><span className={`block h-6 w-6 rounded-full bg-white transition ${emailNotifications?"translate-x-6":"translate-x-0"}`} /></button></div>
                </div>
              ) : settingsSection === "accessibility" ? (
                <div className="p-5 space-y-4">
                  <div className="rounded-3xl border border-white/10 bg-white/[.03] p-5"><div className="font-bold">Theme</div><div className="mt-1 text-sm text-white/40">RAAKA Social currently uses dark mode.</div><div className="mt-4 rounded-full bg-white/10 px-4 py-3 text-sm">Dark mode <span className="float-right text-emerald-300">Active</span></div></div>
                  <div className="rounded-3xl border border-white/10 bg-white/[.03] p-5"><div className="font-bold">Font size</div><div className="mt-3 flex gap-2">{[["small","Small"],["default","Default"],["large","Large"]].map(([v,label])=><button key={v} onClick={()=>{setFontSize(v as typeof fontSize);updateLocalSetting("raaka-social-font-size",v)}} className={`rounded-full px-4 py-2 text-xs font-bold ${fontSize===v?"bg-white text-black":"border border-white/10 text-white/60"}`}>{label}</button>)}</div></div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 px-5 py-4"><div><div className="font-bold">Reduce animations</div><div className="mt-1 text-sm text-white/40">Use fewer motion effects.</div></div><button onClick={()=>{const v=!reduceAnimations;setReduceAnimations(v);updateLocalSetting("raaka-social-reduce-animations",v?"1":"0")}} className={`h-8 w-14 rounded-full p-1 ${reduceAnimations?"bg-red-500":"bg-white/15"}`}><span className={`block h-6 w-6 rounded-full bg-white transition ${reduceAnimations?"translate-x-6":"translate-x-0"}`} /></button></div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 px-5 py-4"><div><div className="font-bold">Data saver</div><div className="mt-1 text-sm text-white/40">Reduce background network activity.</div></div><button onClick={()=>{const v=!dataSaver;setDataSaver(v);updateLocalSetting("raaka-social-data-saver",v?"1":"0")}} className={`h-8 w-14 rounded-full p-1 ${dataSaver?"bg-red-500":"bg-white/15"}`}><span className={`block h-6 w-6 rounded-full bg-white transition ${dataSaver?"translate-x-6":"translate-x-0"}`} /></button></div>
                  <div className="rounded-3xl border border-white/10 p-5"><div className="font-bold">Language</div><div className="mt-1 text-sm text-white/40">English</div></div>
                </div>
              ) : (
                <div className="p-5 space-y-3">
                  <button onClick={() => {const blob=new Blob([JSON.stringify({profile,exportedAt:new Date().toISOString()},null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="raaka-social-data.json";a.click();URL.revokeObjectURL(a.href)}} className="w-full rounded-2xl border border-white/10 px-5 py-4 text-left hover:bg-white/[.04]"><div className="font-bold">Download your data</div><div className="mt-1 text-sm text-white/40">Download the account data currently available to this session.</div></button>
                  {["Privacy Policy","Terms of Service","Community Guidelines","Help Center","About RAAKA Social"].map((title)=><button key={title} onClick={()=>setMessage(`${title} page will open here.`)} className="w-full rounded-2xl border border-white/10 px-5 py-4 text-left hover:bg-white/[.04]"><div className="font-bold">{title}</div><div className="mt-1 text-sm text-white/40">RAAKA Social information and resources.</div></button>)}
                  {message && <div className="text-xs text-red-300">{message}</div>}
                </div>
              )}
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
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/80 transition hover:bg-white/10 active:scale-95"
                  aria-label="Open menu"
                >
                  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
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

          <div className="border-b border-white/10 p-4 lg:hidden">
            <div className="flex gap-2 rounded-2xl border border-white/10 bg-white/[.03] p-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void doSearch();
                }}
                placeholder="Search RAAKA Social"
                className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-white/25"
              />
              <button
                type="button"
                onClick={() => void doSearch()}
                className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold"
              >
                Search
              </button>
            </div>
          </div>

          {searchResults && (
            <div className="border-b border-white/10 px-4 pb-4 xl:hidden">
              <div className="mt-4 overflow-hidden rounded-3xl border border-white/10 bg-white/[.03]">
                <div className="border-b border-white/10 px-4 pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs font-bold uppercase tracking-[.2em] text-white/40">
                      Search results
                    </div>
                    {searchLoading && <span className="text-[10px] text-white/30">Searching…</span>}
                  </div>
                  {searchError && <div className="mt-2 text-xs text-red-300">{searchError}</div>}

                  <div className="mt-3 grid grid-cols-4">
                    {[
                      ["people", "People"],
                      ["posts", "Posts"],
                      ["top", "Top"],
                      ["latest", "Latest"],
                    ].map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSearchTab(key as typeof searchTab)}
                        className={`border-b-2 px-1 py-3 text-[11px] font-bold transition ${
                          searchTab === key
                            ? "border-red-500 text-white"
                            : "border-transparent text-white/35"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-2">
                  {searchTab === "people" ? (
                    searchResults.users.length ? (
                      <div className="space-y-1">
                        {searchResults.users.map((user) => (
                          <div
                            key={user.visitorId}
                            className="flex items-center gap-3 rounded-2xl p-3"
                          >
                            <button
                              type="button"
                              onClick={() => void openProfile(user.handle)}
                              className="flex min-w-0 flex-1 items-center gap-3 text-left"
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-400 font-black">
                                {user.displayName.slice(0, 1).toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <div className="flex min-w-0 items-center gap-1.5 font-bold">
                                  <span className="truncate">{user.displayName}</span>
                                  <VerificationBadge
                                    type={user.verificationType}
                                    label={user.verificationLabel}
                                  />
                                </div>

                                <div className="truncate text-xs text-white/35">
                                  @{user.handle} · {user.followers} followers
                                </div>
                              </div>
                            </button>

                            {user.visitorId !== visitorId && (
                              <button
                                type="button"
                                onClick={() => void follow(user.visitorId)}
                                className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-black ${
                                  user.isFollowing
                                    ? "border border-white/15 text-white/70"
                                    : "bg-white text-black"
                                }`}
                              >
                                {user.isFollowing ? "Following" : "Follow"}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-sm text-white/30">
                        No people found.
                      </div>
                    )
                  ) : searchResults.posts.length ? (
                    <div className="space-y-1">
                      {searchResults.posts.map((post) => (
                          <button
                            key={post.id}
                            type="button"
                            onClick={() => void openProfile(post.author.handle)}
                            className="block w-full rounded-2xl p-3 text-left"
                          >
                            <div className="flex items-center gap-1.5 text-sm font-bold">
                              <span>{post.author.displayName}</span>
                              <VerificationBadge
                                type={post.author.verificationType}
                                label={post.author.verificationLabel}
                              />
                              <span className="font-normal text-white/30">
                                @{post.author.handle}
                              </span>
                            </div>

                            <div className="mt-1 line-clamp-3 text-sm leading-5 text-white/70">
                              {post.body}
                            </div>

                            <div className="mt-2 text-[11px] text-white/25">
                              {post.likes} likes · {post.replies} replies · {post.reposts} reposts · {timeAgo(post.createdAt)}
                            </div>
                          </button>
                        ))}
                    </div>
                  ) : (
                    <div className="p-4 text-sm text-white/30">
                      No posts found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {notifications.length > 0 && (
            <div className="border-b border-white/10 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-[.2em] text-white/40">Notifications</div>
                <button type="button" onClick={() => setNotifications([])} className="text-[11px] text-white/30 hover:text-white">Clear</button>
              </div>
              <div className="space-y-1">
                {notifications.slice(0, 8).map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => n.postId ? window.history.pushState({}, "", `/social?post=${n.postId}`) : void openProfile(n.actor.handle)}
                    className="flex w-full items-center gap-3 rounded-2xl p-3 text-left hover:bg-white/[.04]"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-xs font-black text-red-300">{n.actor.displayName.slice(0,1).toUpperCase()}</div>
                    <div className="min-w-0 text-sm">
                      <span className="font-bold">{n.actor.displayName}</span>
                      <span className="text-white/50"> {n.type === "follow" ? "followed you" : n.type === "like" ? "liked your post" : n.type === "reply" ? "replied to your post" : "reposted your post"}.</span>
                    </div>
                  </button>
                ))}
              </div>
              {notificationsLoading && <div className="mt-2 text-xs text-white/30">Refreshing…</div>}
            </div>
          )}

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

                  <button
                    type="button"
                    onClick={() => void openProfile(post.author.handle)}
                    aria-label={`Open @${post.author.handle} profile`}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 font-bold transition hover:bg-white/15"
                  >
                    {post.author.displayName.slice(0, 1).toUpperCase()}
                  </button>

                  <div className="min-w-0 flex-1">

                    <div className="flex items-center gap-2 text-sm">

                      <button
                        type="button"
                        onClick={() => void openProfile(post.author.handle)}
                        className="flex min-w-0 items-center gap-1.5 text-left font-bold hover:underline"
                      >
                        <span className="truncate">{post.author.displayName}</span>
                        <VerificationBadge
                          type={post.author.verificationType}
                          label={post.author.verificationLabel}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => void openProfile(post.author.handle)}
                        className="truncate text-white/35 hover:text-white/60"
                      >
                        @{post.author.handle}
                      </button>

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

                    <div className="relative mt-4 max-w-[520px]">
                      <div className="grid grid-cols-6 items-center">
                        <button
                          type="button"
                          onClick={() =>
                            setReplying(
                              replying === post.id ? null : post.id
                            )
                          }
                          aria-label="Reply"
                          className="flex h-10 w-full items-center justify-center gap-1.5 rounded-full text-white/40 transition hover:bg-sky-500/10 hover:text-sky-400"
                        >
                          <ActionIcon type="reply" />
                          <span className="text-[13px] tabular-nums">{post.replies}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => void repost(post.id)}
                          disabled={Boolean(actionPending[`repost:${post.id}`])}
                          aria-label={post.reposted ? "Remove repost" : "Repost"}
                          aria-pressed={post.reposted}
                          className={`flex h-10 w-full items-center justify-center gap-1.5 rounded-full transition disabled:opacity-40 ${post.reposted ? "text-green-400" : "text-white/40 hover:bg-green-500/10 hover:text-green-400"}`}
                        >
                          <ActionIcon type="repost" />
                          <span className="text-[13px] tabular-nums">{post.reposts}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => like(post.id)}
                          aria-label={post.liked ? "Unlike" : "Like"}
                          className={`flex h-10 w-full items-center justify-center gap-1.5 rounded-full transition ${
                            post.liked
                              ? "text-pink-500"
                              : "text-white/40 hover:bg-pink-500/10 hover:text-pink-500"
                          }`}
                        >
                          <ActionIcon type="like" />
                          <span className="text-[13px] tabular-nums">{post.likes}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => void bookmark(post.id)}
                          disabled={Boolean(actionPending[`bookmark:${post.id}`])}
                          aria-label={post.bookmarked ? "Remove bookmark" : "Bookmark"}
                          className={`flex h-10 w-full items-center justify-center rounded-full transition ${
                            post.bookmarked
                              ? "text-amber-400"
                              : "text-white/40 hover:bg-amber-500/10 hover:text-amber-400"
                          }`}
                        >
                          <ActionIcon type="bookmark" />
                        </button>

                        <button
                          type="button"
                          onClick={() => sharePost(post.id)}
                          aria-label="Share"
                          className="flex h-10 w-full items-center justify-center rounded-full text-white/40 transition hover:bg-sky-500/10 hover:text-sky-400"
                        >
                          <ActionIcon type="share" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setMoreMenu(
                              moreMenu === post.id ? null : post.id
                            )
                          }
                          aria-label="More"
                          className="flex h-10 w-full items-center justify-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-white"
                        >
                          <ActionIcon type="more" />
                        </button>
                      </div>

                      {moreMenu === post.id && (
                        <div className="absolute right-0 top-11 z-30 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#101010] p-1.5 shadow-2xl shadow-black/50">
                          <button
                            type="button"
                            onClick={() => {
                              sharePost(post.id);
                              setMoreMenu(null);
                            }}
                            className="flex w-full items-center rounded-xl px-4 py-3 text-left text-sm text-white/80 hover:bg-white/5"
                          >
                            Copy/share post
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              bookmark(post.id);
                              setMoreMenu(null);
                            }}
                            className="flex w-full items-center rounded-xl px-4 py-3 text-left text-sm text-white/80 hover:bg-white/5"
                          >
                            {post.bookmarked ? "Remove bookmark" : "Bookmark"}
                          </button>

                          {post.author.visitorId !== visitorId && (
                            <button
                              type="button"
                              onClick={() => {
                                follow(post.author.visitorId);
                                setMoreMenu(null);
                              }}
                              className="flex w-full items-center rounded-xl px-4 py-3 text-left text-sm text-white/80 hover:bg-white/5"
                            >
                              {post.following ? "Unfollow" : "Follow"} @{post.author.handle}
                            </button>
                          )}

                          {post.author.visitorId === visitorId && (
                            <button
                              type="button"
                              onClick={() => deletePost(post.id)}
                              className="flex w-full items-center rounded-xl px-4 py-3 text-left text-sm text-red-300 hover:bg-red-500/10"
                            >
                              Delete post
                            </button>
                          )}
                        </div>
                      )}
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

          {nextCursor > 0 && (
            <div className="border-b border-white/10 p-4">
              <button
                type="button"
                disabled={loadingMore}
                onClick={() => void load(true, nextCursor)}
                className="w-full rounded-2xl border border-white/10 px-4 py-3 text-xs font-bold text-white/70 transition hover:bg-white/[.05] disabled:opacity-40"
              >
                {loadingMore ? "Loading more…" : "Load more posts"}
              </button>
            </div>
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
                onClick={() => void doSearch()}
                className="rounded-xl bg-white/10 px-3 text-xs"
              >
                Search
              </button>

            </div>
          </div>

          {searchResults ? (
            <div className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-white/[.03]">
              <div className="border-b border-white/10 px-5 pt-5">
                <div className="text-xs font-bold uppercase tracking-[.2em] text-white/40">
                  Search results
                </div>

                <div className="mt-4 grid grid-cols-4">
                  {[
                    ["people", "People"],
                    ["posts", "Posts"],
                    ["top", "Top"],
                    ["latest", "Latest"],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSearchTab(key as typeof searchTab)}
                      className={`border-b-2 px-1 py-3 text-xs font-bold transition ${
                        searchTab === key
                          ? "border-red-500 text-white"
                          : "border-transparent text-white/35 hover:text-white/70"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3">
                {searchTab === "people" ? (
                  searchResults.users.length ? (
                    <div className="space-y-1">
                      {searchResults.users.map((user) => (
                        <div
                          key={user.visitorId}
                          className="flex items-center gap-3 rounded-2xl p-3 transition hover:bg-white/[.05]"
                        >
                          <button
                            type="button"
                            onClick={() => void openProfile(user.handle)}
                            className="flex min-w-0 flex-1 items-center gap-3 text-left"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-400 font-black">
                              {user.displayName.slice(0, 1).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex min-w-0 items-center gap-1.5 font-bold">
                                <span className="truncate">{user.displayName}</span>
                                <VerificationBadge
                                  type={user.verificationType}
                                  label={user.verificationLabel}
                                />
                              </div>
                              <div className="truncate text-xs text-white/35">
                                @{user.handle} · {user.followers} followers
                              </div>
                            </div>
                          </button>

                          {user.visitorId !== visitorId && (
                            <button
                              type="button"
                              onClick={() => follow(user.visitorId)}
                              className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-black ${
                                user.isFollowing
                                  ? "border border-white/15 text-white/70"
                                  : "bg-white text-black"
                              }`}
                            >
                              {user.isFollowing ? "Following" : "Follow"}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-5 text-sm text-white/30">No people found.</div>
                  )
                ) : searchResults.posts.length ? (
                  <div className="space-y-1">
                    {searchResults.posts.map((post) => (
                        <button
                          key={post.id}
                          type="button"
                          onClick={() => void openProfile(post.author.handle)}
                          className="block w-full rounded-2xl p-3 text-left transition hover:bg-white/[.05]"
                        >
                          <div className="flex items-center gap-1.5 text-sm font-bold">
                            <span>{post.author.displayName}</span>
                            <VerificationBadge
                              type={post.author.verificationType}
                              label={post.author.verificationLabel}
                            />
                            <span className="font-normal text-white/30">@{post.author.handle}</span>
                          </div>
                          <div className="mt-1 line-clamp-3 text-sm leading-5 text-white/70">
                            {post.body}
                          </div>
                          <div className="mt-2 text-[11px] text-white/25">
                            {post.likes} likes · {post.replies} replies · {post.reposts} reposts · {timeAgo(post.createdAt)}
                          </div>
                        </button>
                      ))}
                  </div>
                ) : (
                  <div className="p-5 text-sm text-white/30">No posts found.</div>
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

      {profileListMode && selectedProfile && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${profileListMode === "followers" ? "Followers" : "Following"} of @${selectedProfile.handle}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setProfileListMode(null);
          }}
        >
          <div className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b0b] shadow-2xl shadow-black/60">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <div className="font-black">{profileListMode === "followers" ? "Followers" : "Following"}</div>
                <div className="text-xs text-white/35">@{selectedProfile.handle}</div>
              </div>
              <button type="button" onClick={() => setProfileListMode(null)} className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-white/50 hover:bg-white/10 hover:text-white" aria-label="Close">×</button>
            </div>

            <div className="overflow-y-auto p-2">
              {profileListLoading ? (
                <div className="p-8 text-center text-sm text-white/35">Loading…</div>
              ) : profileListError ? (
                <div className="p-8 text-center text-sm text-red-300">{profileListError}</div>
              ) : profileListUsers.length ? (
                profileListUsers.map((user) => (
                  <div key={user.visitorId} className="flex items-center gap-3 rounded-2xl p-3 hover:bg-white/[.04]">
                    <button type="button" onClick={() => { setProfileListMode(null); void openProfile(user.handle); }} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-400 font-black">{user.displayName.slice(0, 1).toUpperCase()}</div>
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-1.5 font-bold">
                          <span className="truncate">{user.displayName}</span>
                          <VerificationBadge type={user.verificationType} label={user.verificationLabel} />
                        </div>
                        <div className="truncate text-xs text-white/35">@{user.handle}</div>
                      </div>
                    </button>
                    {user.visitorId !== visitorId && (
                      <button
                        type="button"
                        onClick={() => void follow(user.visitorId)}
                        disabled={Boolean(actionPending[`follow:${user.visitorId}`])}
                        className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-black disabled:opacity-40 ${user.isFollowing ? "border border-white/15 text-white/70" : "bg-white text-black"}`}
                      >
                        {user.isFollowing ? "Following" : "Follow"}
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-white/35">
                  No {profileListMode} yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {passwordModalOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xl font-black">Change password</div>
                <p className="mt-1 text-sm leading-6 text-white/40">Use your current password to set a new one.</p>
              </div>
              <button onClick={() => !passwordSaving && setPasswordModalOpen(false)} className="text-xl text-white/40 hover:text-white" aria-label="Close">×</button>
            </div>

            <div className="mt-6 space-y-3">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                autoComplete="current-password"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-white/25"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                autoComplete="new-password"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-white/25"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-white/25"
              />
            </div>

            <div className="mt-5 flex gap-2">
              <button onClick={() => setPasswordModalOpen(false)} disabled={passwordSaving} className="rounded-full border border-white/10 px-5 py-2.5 text-xs font-bold text-white/60 disabled:opacity-40">Cancel</button>
              <button onClick={() => void changePassword()} disabled={passwordSaving} className="rounded-full bg-white px-5 py-2.5 text-xs font-black text-black disabled:opacity-40">
                {passwordSaving ? "Changing…" : "Change password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {accountAction && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-red-500/15 bg-[#0b0b0b] p-6 shadow-2xl">
            <div className="text-xl font-black">
              {accountAction === "delete" ? "Delete account?" : "Deactivate account?"}
            </div>
            <p className="mt-3 text-sm leading-6 text-white/50">
              {accountAction === "delete"
                ? "This permanently removes your RAAKA Social account, profile, posts, follows, likes, bookmarks and sessions. This action cannot be undone."
                : "This signs you out of all active sessions while keeping your profile and posts. You can use a future reactivation flow to restore access."}
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => !accountActionPending && setAccountAction(null)} disabled={accountActionPending} className="rounded-full border border-white/10 px-5 py-2.5 text-xs font-bold text-white/60 disabled:opacity-40">Cancel</button>
              <button onClick={() => void runAccountAction()} disabled={accountActionPending} className={`rounded-full px-5 py-2.5 text-xs font-black text-white disabled:opacity-40 ${accountAction === "delete" ? "bg-red-500" : "border border-red-500/30 bg-red-500/10 text-red-300"}`}>
                {accountActionPending ? "Please wait…" : accountAction === "delete" ? "Delete permanently" : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}