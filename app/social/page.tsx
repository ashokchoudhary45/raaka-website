"use client";

// Client-only Social page. Rendered dynamically by Cloudflare/OpenNext.
// SEO note: the content is private + personalised, so this page injects
// `robots: noindex` at runtime. Add `export const metadata` in a sibling
// layout.tsx if you also want a static <title>/robots tag (client pages
// cannot export metadata themselves).

import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

type VerificationType = "blue" | "gold" | "grey" | "none";

interface Author {
  visitorId: string;
  handle: string;
  displayName: string;
  verified?: boolean;
  verificationType?: VerificationType;
  verificationLabel?: string | null;
}

interface Post {
  id: number;
  body: string;
  createdAt: string;
  likes: number;
  replies: number;
  reposts: number;
  liked: boolean;
  bookmarked: boolean;
  reposted: boolean;
  following: boolean;
  canReply: boolean;
  author: Author;
  replyToId: number | null;
  repostOfId: number | null;
  original: Post | null;
  parent: { id: number; handle: string; displayName: string } | null;
}

interface Profile {
  visitorId: string;
  handle: string;
  displayName: string;
  bio: string;
  followers: number;
  following: number;
  posts: number;
  verified?: boolean;
  verificationType?: VerificationType;
  verificationLabel?: string | null;
  isPrivate: boolean;
  isSelf: boolean;
  isFollowing: boolean;
  isRequested: boolean;
  canView: boolean;
}

type FontSize = "small" | "default" | "large";

interface UiPrefs {
  fontSize: FontSize;
  reduceMotion: boolean;
  dataSaver: boolean;
}

interface NotificationPrefs {
  enabled: boolean;
  likes: boolean;
  replies: boolean;
  reposts: boolean;
  follows: boolean;
}

interface Settings {
  isPrivate: boolean;
  replyPermission: "everyone" | "following";
  notifications: NotificationPrefs;
  emailNotifications: boolean;
  ui: UiPrefs;
}

interface SettingsPatch {
  isPrivate?: boolean;
  replyPermission?: "everyone" | "following";
  notifications?: Partial<NotificationPrefs>;
  emailNotifications?: boolean;
  ui?: Partial<UiPrefs>;
}

interface NotificationGroup {
  key: string;
  type: "like" | "repost" | "reply" | "follow" | "follow_accepted" | string;
  postId: number | null;
  id: number;
  createdAt: string;
  unread: boolean;
  preview: string;
  count: number;
  actors: Array<Author>;
}

type SearchTab = "people" | "posts" | "top" | "latest";
type ProfileTab = "posts" | "followers" | "following";
type SettingsSection =
  | "account"
  | "security"
  | "privacy"
  | "notifications"
  | "accessibility"
  | "resources";

type Route =
  | { name: "home" }
  | { name: "explore"; q: string; tab: SearchTab }
  | { name: "profile"; handle: string | null; tab: ProfileTab }
  | { name: "thread"; postId: number; reply: boolean }
  | { name: "notifications" }
  | { name: "bookmarks" }
  | { name: "settings"; section: SettingsSection | "home" };

interface PostOverlay {
  liked?: boolean;
  likes?: number;
  bookmarked?: boolean;
  reposted?: boolean;
  reposts?: number;
  replies?: number;
}

interface FollowState {
  following: boolean;
  requested: boolean;
}

/* -------------------------------------------------------------------------- */
/* Constants + pure helpers                                                    */
/* -------------------------------------------------------------------------- */

const MAX_POST = 280;
const MAX_BIO = 160;
const MAX_NAME = 40;
const UI_STORAGE_KEY = "raaka-social-ui";
const DRAFT_PREFIX = "raaka-social-draft:";
const RESERVED_HANDLES = ["admin", "administrator", "raaka", "support", "help", "moderator", "mod", "staff", "official", "system", "root", "social"];

const DEFAULT_UI: UiPrefs = { fontSize: "default", reduceMotion: false, dataSaver: false };

const RESOURCE_LINKS: Array<{ title: string; description: string; href?: string }> = [
  { title: "Privacy Policy", description: "How RAAKA Social handles your data.", href: process.env.NEXT_PUBLIC_SOCIAL_PRIVACY_URL },
  { title: "Terms of Service", description: "The rules for using RAAKA Social.", href: process.env.NEXT_PUBLIC_SOCIAL_TERMS_URL },
  { title: "Community Guidelines", description: "What is and isn't allowed.", href: process.env.NEXT_PUBLIC_SOCIAL_GUIDELINES_URL },
  { title: "Help Center", description: "Answers and support.", href: process.env.NEXT_PUBLIC_SOCIAL_HELP_URL },
];

const charCount = (s: string) => Array.from(s).length;

function parseDate(value: string): number {
  const t = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`).getTime();
  return Number.isFinite(t) ? t : 0;
}

function timeAgoLabel(value: string): string {
  const seconds = Math.max(1, Math.floor((Date.now() - parseDate(value)) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(parseDate(value)).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function fullDate(value: string) {
  return new Date(parseDate(value)).toLocaleString();
}

function hashString(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function formatCount(n: number) {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0).replace(/\.0$/, "")}K`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
}

function normalizeHandleInput(v: string) {
  return v.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
}

function validateProfileForm(name: string, handle: string, bio: string): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!name.trim()) errors.name = "Display name is required.";
  else if (name.trim().length > MAX_NAME) errors.name = `Keep it under ${MAX_NAME} characters.`;
  if (!/^[a-z0-9_]{3,20}$/.test(handle)) errors.handle = "3–20 characters: letters, numbers or _.";
  else if (RESERVED_HANDLES.includes(handle)) errors.handle = "That handle is reserved.";
  if (charCount(bio) > MAX_BIO) errors.bio = `Bio can be at most ${MAX_BIO} characters.`;
  return errors;
}

function normalizeProfile(p: Partial<Profile> & { visitorId: string }): Profile {
  return {
    visitorId: p.visitorId,
    handle: p.handle ?? "",
    displayName: p.displayName ?? "RAAKA Fan",
    bio: p.bio ?? "",
    followers: p.followers ?? 0,
    following: p.following ?? 0,
    posts: p.posts ?? 0,
    verified: p.verified,
    verificationType: p.verificationType,
    verificationLabel: p.verificationLabel,
    isPrivate: p.isPrivate ?? false,
    isSelf: true,
    isFollowing: false,
    isRequested: false,
    canView: true,
  };
}

/* ---------------------------------- routing --------------------------------- */

const SETTINGS_SECTIONS: SettingsSection[] = ["account", "security", "privacy", "notifications", "accessibility", "resources"];

function parseRoute(search: string): Route {
  const q = new URLSearchParams(search);
  const post = Number(q.get("post"));
  if (Number.isSafeInteger(post) && post > 0) return { name: "thread", postId: post, reply: q.get("reply") === "1" };

  const tab = q.get("tab");
  const u = q.get("u");
  const view = q.get("view");
  const profileTab: ProfileTab = tab === "followers" || tab === "following" ? tab : "posts";

  if (u) return { name: "profile", handle: u.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20), tab: profileTab };
  if (view === "profile") return { name: "profile", handle: null, tab: profileTab };
  if (view === "explore") {
    const st: SearchTab = tab === "posts" || tab === "top" || tab === "latest" ? tab : "people";
    return { name: "explore", q: (q.get("q") || "").slice(0, 50), tab: st };
  }
  if (view === "notifications") return { name: "notifications" };
  if (view === "bookmarks") return { name: "bookmarks" };
  if (view === "settings") {
    const s = q.get("section") as SettingsSection | null;
    return { name: "settings", section: s && SETTINGS_SECTIONS.includes(s) ? s : "home" };
  }
  return { name: "home" };
}

function routeQuery(route: Route): string {
  const q = new URLSearchParams();
  switch (route.name) {
    case "explore":
      q.set("view", "explore");
      if (route.q) q.set("q", route.q);
      if (route.tab !== "people") q.set("tab", route.tab);
      break;
    case "profile":
      if (route.handle) q.set("u", route.handle);
      else q.set("view", "profile");
      if (route.tab !== "posts") q.set("tab", route.tab);
      break;
    case "thread":
      q.set("post", String(route.postId));
      if (route.reply) q.set("reply", "1");
      break;
    case "notifications":
    case "bookmarks":
      q.set("view", route.name);
      break;
    case "settings":
      q.set("view", "settings");
      if (route.section !== "home") q.set("section", route.section);
      break;
    default:
      break;
  }
  return q.toString();
}

function routeHref(route: Route) {
  const qs = routeQuery(route);
  const path = typeof window === "undefined" ? "" : window.location.pathname;
  return qs ? `${path}?${qs}` : path || "?";
}

/* -------------------------------------------------------------------------- */
/* API client                                                                  */
/* -------------------------------------------------------------------------- */

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let onUnauthorized: (() => void) | null = null;

function friendlyMessage(status: number, serverMessage?: string): string {
  if (status === 401) return "Your session has expired. Please log in again.";
  if (status === 429) return "You're doing that too fast. Please wait a moment.";
  if (status >= 500) return "Something went wrong on our side. Please try again.";
  if (serverMessage) return serverMessage; // 4xx messages from our API are user-safe
  if (status === 403) return "You don't have permission to do that.";
  if (status === 404) return "We couldn't find that.";
  if (status === 409) return "That conflicts with the current state. Refresh and try again.";
  return "Something went wrong. Please try again.";
}

const isAbort = (e: unknown) => e instanceof DOMException && e.name === "AbortError";

function toApiError(e: unknown): ApiError {
  if (e instanceof ApiError) return e;
  if (e instanceof TypeError) return new ApiError(0, "Network error. Check your connection and try again.");
  return new ApiError(500, "Something went wrong. Please try again.");
}

async function request<T>(method: "GET" | "POST", init: { query?: Record<string, string | number | undefined>; body?: unknown; signal?: AbortSignal }): Promise<T> {
  const url = new URL("/api/social", window.location.origin);
  if (init.query) {
    for (const [k, v] of Object.entries(init.query)) {
      if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
    }
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method,
      cache: "no-store",
      credentials: "same-origin",
      signal: init.signal,
      headers: method === "POST" ? { "Content-Type": "application/json" } : undefined,
      body: method === "POST" ? JSON.stringify(init.body ?? {}) : undefined,
    });
  } catch (e) {
    if (isAbort(e)) throw e;
    throw toApiError(e);
  }

  let data: unknown = null;
  if ((response.headers.get("content-type") || "").includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  const payload = data && typeof data === "object" ? (data as { success?: boolean; error?: string }) : null;

  if (!response.ok || payload?.success === false) {
    if (response.status === 401) onUnauthorized?.();
    const status = response.ok ? 400 : response.status;
    if (status >= 500) console.error("RAAKA Social API error", status);
    throw new ApiError(status, friendlyMessage(status, payload?.error));
  }
  if (!payload) throw new ApiError(502, "Unexpected response from the server. Please try again.");
  return payload as T;
}

const api = {
  get: <T,>(query: Record<string, string | number | undefined>, signal?: AbortSignal) => request<T>("GET", { query, signal }),
  post: <T,>(body: Record<string, unknown>, signal?: AbortSignal) => request<T>("POST", { body, signal }),
};

/* -------------------------------------------------------------------------- */
/* Hooks                                                                       */
/* -------------------------------------------------------------------------- */

/* shared 30s ticker so relative timestamps refresh without per-card timers */
const tickListeners = new Set<() => void>();
let tickValue = 0;
let tickTimer: ReturnType<typeof setInterval> | null = null;
let tickEnabled = true;

function bumpTick() {
  tickValue += 1;
  tickListeners.forEach((l) => l());
}
function onVisibility() {
  if (document.visibilityState === "visible") bumpTick();
}
function startTicker() {
  if (tickTimer || !tickEnabled || typeof document === "undefined") return;
  tickTimer = setInterval(() => {
    if (document.visibilityState === "visible") bumpTick();
  }, 30_000);
  document.addEventListener("visibilitychange", onVisibility);
}
function stopTicker() {
  if (tickTimer) clearInterval(tickTimer);
  tickTimer = null;
  if (typeof document !== "undefined") document.removeEventListener("visibilitychange", onVisibility);
}
function setTickerEnabled(enabled: boolean) {
  tickEnabled = enabled;
  if (!enabled) stopTicker();
  else if (tickListeners.size) startTicker();
}
function subscribeTicker(cb: () => void) {
  tickListeners.add(cb);
  startTicker();
  return () => {
    tickListeners.delete(cb);
    if (!tickListeners.size) stopTicker();
  };
}

/* body scroll lock shared by drawer + dialogs */
let scrollLocks = 0;
let previousOverflow = "";
function lockScroll() {
  if (scrollLocks++ === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
}
function unlockScroll() {
  if (--scrollLocks === 0) document.body.style.overflow = previousOverflow;
}

const FOCUSABLE = 'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

function useFocusTrap<T extends HTMLElement>(active: boolean, onClose: () => void) {
  const ref = useRef<T | null>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    lockScroll();
    node?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key !== "Tab" || !node) return;
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      unlockScroll();
      previouslyFocused?.focus?.();
    };
  }, [active]);

  return ref;
}

/* unsaved text guard */
const dirtyKeys = new Set<string>();
function useDirtyGuard(key: string, dirty: boolean) {
  useEffect(() => {
    if (dirty) dirtyKeys.add(key);
    else dirtyKeys.delete(key);
    return () => {
      dirtyKeys.delete(key);
    };
  }, [key, dirty]);
}

interface Page<T, M> {
  items: T[];
  nextCursor?: string | number | null;
  hasMore: boolean;
  meta?: M;
}

interface PagedState<T, M> {
  items: T[];
  meta: M | null;
  cursor: string | null;
  hasMore: boolean;
  status: "idle" | "loading" | "ready" | "error";
  error: ApiError | null;
  loadingMore: boolean;
  refreshing: boolean;
  inlineError: string | null;
}

interface PagedOptions<T, M> {
  enabled?: boolean;
  resetKey: string;
  keyOf: (item: T) => string | number;
  load: (cursor: string | null, signal: AbortSignal) => Promise<Page<T, M>>;
  onPage?: (items: T[]) => void;
}

function usePaged<T, M = undefined>(options: PagedOptions<T, M>) {
  const { enabled = true, resetKey } = options;
  const [state, setState] = useState<PagedState<T, M>>({
    items: [],
    meta: null,
    cursor: null,
    hasMore: false,
    status: "idle",
    error: null,
    loadingMore: false,
    refreshing: false,
    inlineError: null,
  });

  const optionsRef = useRef(options);
  optionsRef.current = options;
  const abortRef = useRef<AbortController | null>(null);
  const seq = useRef(0);
  const busy = useRef(false);

  const run = useCallback(async (mode: "reset" | "refresh" | "more", cursor: string | null) => {
    if (mode === "more" && busy.current) return;
    if (mode !== "more") abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;
    const id = ++seq.current;
    busy.current = true;

    setState((s) =>
      mode === "reset"
        ? { items: [], meta: null, cursor: null, hasMore: false, status: "loading", error: null, loadingMore: false, refreshing: false, inlineError: null }
        : mode === "refresh"
          ? { ...s, refreshing: true, inlineError: null }
          : { ...s, loadingMore: true, inlineError: null }
    );

    try {
      const page = await optionsRef.current.load(cursor, controller.signal);
      if (id !== seq.current) return;
      optionsRef.current.onPage?.(page.items);
      setState((s) => {
        const base = mode === "more" ? s.items : [];
        const seen = new Set(base.map(optionsRef.current.keyOf));
        const merged = [...base];
        for (const item of page.items) {
          const k = optionsRef.current.keyOf(item);
          if (!seen.has(k)) {
            seen.add(k);
            merged.push(item);
          }
        }
        const next = page.nextCursor ? String(page.nextCursor) : null;
        return {
          ...s,
          items: merged,
          meta: mode === "more" ? s.meta : (page.meta ?? null),
          cursor: page.hasMore ? next : null,
          hasMore: page.hasMore && next !== null,
          status: "ready",
          error: null,
          loadingMore: false,
          refreshing: false,
          inlineError: null,
        };
      });
    } catch (e) {
      if (isAbort(e) || id !== seq.current) return;
      const err = toApiError(e);
      setState((s) =>
        mode === "reset"
          ? { ...s, status: "error", error: err, loadingMore: false, refreshing: false }
          : { ...s, loadingMore: false, refreshing: false, inlineError: err.message }
      );
    } finally {
      if (id === seq.current) busy.current = false;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void run("reset", null);
    return () => {
      abortRef.current?.abort();
      seq.current += 1;
      busy.current = false;
    };
  }, [enabled, resetKey, run]);

  const loadMore = useCallback(() => {
    if (state.cursor) void run("more", state.cursor);
  }, [run, state.cursor]);
  const refresh = useCallback(() => void run("refresh", null), [run]);
  const reload = useCallback(() => void run("reset", null), [run]);

  const prepend = useCallback((item: T) => {
    setState((s) => {
      const k = optionsRef.current.keyOf(item);
      if (s.items.some((x) => optionsRef.current.keyOf(x) === k)) return s;
      return { ...s, items: [item, ...s.items], status: "ready" };
    });
  }, []);
  const append = useCallback((item: T) => {
    setState((s) => {
      const k = optionsRef.current.keyOf(item);
      if (s.items.some((x) => optionsRef.current.keyOf(x) === k)) return s;
      return { ...s, items: [...s.items, item], status: "ready" };
    });
  }, []);
  const setMeta = useCallback((fn: (m: M | null) => M | null) => setState((s) => ({ ...s, meta: fn(s.meta) })), []);
  const removeWhere = useCallback((fn: (item: T) => boolean) => setState((s) => ({ ...s, items: s.items.filter((x) => !fn(x)) })), []);

  return { ...state, loadMore, refresh, reload, prepend, append, setMeta, removeWhere };
}

type PagedList<T, M = undefined> = ReturnType<typeof usePaged<T, M>>;

function useResource<T>(key: string, load: (signal: AbortSignal) => Promise<T>, enabled = true) {
  const [state, setState] = useState<{ data: T | null; status: "loading" | "ready" | "error"; error: ApiError | null }>({
    data: null,
    status: "loading",
    error: null,
  });
  const loadRef = useRef(load);
  loadRef.current = load;
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    setState({ data: null, status: "loading", error: null });
    loadRef.current(controller.signal).then(
      (data) => !controller.signal.aborted && setState({ data, status: "ready", error: null }),
      (e) => !isAbort(e) && !controller.signal.aborted && setState({ data: null, status: "error", error: toApiError(e) })
    );
    return () => controller.abort();
  }, [key, enabled, nonce]);

  return { ...state, reload: useCallback(() => setNonce((n) => n + 1), []) };
}

interface Toast {
  id: number;
  text: string;
  kind: "success" | "error" | "info";
}

function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => {
    const t = timers.current.get(id);
    if (t) clearTimeout(t);
    timers.current.delete(id);
    setToasts((list) => list.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (text: string, kind: Toast["kind"] = "info") => {
      setToasts((list) => {
        const existing = list.find((x) => x.text === text);
        const id = existing ? existing.id : ++counter.current;
        const old = timers.current.get(id);
        if (old) clearTimeout(old);
        timers.current.set(id, setTimeout(() => dismiss(id), kind === "error" ? 6000 : 3500));
        if (existing) return list.map((x) => (x.id === id ? { ...x, kind } : x)); // dedupe: refresh timer only
        return [...list.slice(-2), { id, text, kind }];
      });
    },
    [dismiss]
  );

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach((t) => clearTimeout(t));
  }, []);

  return { toasts, push, dismiss };
}

/* -------------------------------------------------------------------------- */
/* Primitives                                                                  */
/* -------------------------------------------------------------------------- */

const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]";
const btnBase = `inline-flex items-center justify-center gap-2 rounded-full font-bold transition active:scale-[.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100 ${focusRing}`;
const btnPrimary = `${btnBase} bg-white px-5 py-2 text-sm text-black hover:bg-white/85`;
const btnOutline = `${btnBase} border border-white/25 px-5 py-2 text-sm text-white hover:bg-white/10`;
const btnDanger = `${btnBase} bg-red-500 px-5 py-2 text-sm text-white hover:bg-red-400`;
const inputCls = `w-full rounded-2xl border border-white/15 bg-white/[.04] px-4 py-3 text-sm text-white placeholder:text-white/45 transition hover:border-white/25 focus:border-red-400/70 focus:outline-none focus:ring-2 focus:ring-red-400/30`;

type IconName =
  | "home" | "search" | "bell" | "bookmark" | "user" | "settings" | "reply" | "repost" | "like"
  | "share" | "more" | "back" | "close" | "lock" | "menu" | "logout" | "refresh" | "trash" | "link" | "check" | "chevron";

const ICON_PATHS: Record<IconName, ReactNode> = {
  home: <><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v10h13V10" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
  bell: <><path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15L6 17Z" /><path d="M10 21a2 2 0 0 0 4 0" /></>,
  bookmark: <path d="M6 4.5A2.5 2.5 0 0 1 8.5 2h7A2.5 2.5 0 0 1 18 4.5V21l-6-3.5L6 21V4.5Z" />,
  user: <><circle cx="12" cy="8" r="3.2" /><path d="M5.5 20c.8-4 3-6 6.5-6s5.7 2 6.5 6" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" /></>,
  reply: <><path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.5 9.5 0 0 1-4.2-1L3 20l1.2-3.8A8 8 0 0 1 3 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z" /></>,
  repost: <><path d="m17 3 4 4-4 4" /><path d="M3 11V9a2 2 0 0 1 2-2h16" /><path d="m7 21-4-4 4-4" /><path d="M21 13v2a2 2 0 0 1-2 2H3" /></>,
  like: <path d="M20.8 8.7c0 5.1-8.8 10.3-8.8 10.3S3.2 13.8 3.2 8.7A4.7 4.7 0 0 1 12 6.3a4.7 4.7 0 0 1 8.8 2.4Z" />,
  share: <><path d="M12 16V3" /><path d="m7 8 5-5 5 5" /><path d="M5 13v5a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-5" /></>,
  more: <><circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.2" fill="currentColor" stroke="none" /></>,
  back: <><path d="M19 12H5" /><path d="m11 6-6 6 6 6" /></>,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  lock: <><rect x="5" y="10.5" width="14" height="9.5" rx="2" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></>,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  logout: <><path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" /><path d="m15 8 4 4-4 4M19 12H9" /></>,
  refresh: <><path d="M20 11a8 8 0 0 0-14-4.5L4 9" /><path d="M4 4v5h5" /><path d="M4 13a8 8 0 0 0 14 4.5L20 15" /><path d="M20 20v-5h-5" /></>,
  trash: <><path d="M4 7h16M10 11v6M14 11v6" /><path d="M6 7l1 13h10l1-13M9 7V4h6v3" /></>,
  link: <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 6 6 6-6 6" />,
};

function Icon({ name, size = 22, filled = false, className = "" }: { name: IconName; size?: number; filled?: boolean; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`shrink-0 ${className}`}
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

function Spinner({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} />;
}

const AVATAR_GRADIENTS = [
  "from-red-500 to-orange-400",
  "from-orange-500 to-amber-400",
  "from-rose-500 to-red-400",
  "from-red-600 to-pink-500",
  "from-amber-500 to-red-500",
  "from-orange-600 to-rose-500",
];

const Avatar = memo(function Avatar({ name, seed, size = 40 }: { name: string; seed: string; size?: number }) {
  const initial = (Array.from(name.trim())[0] || "R").toUpperCase();
  const gradient = AVATAR_GRADIENTS[hashString(seed || name) % AVATAR_GRADIENTS.length];
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
      className={`flex shrink-0 select-none items-center justify-center rounded-full bg-gradient-to-br ${gradient} font-black text-white`}
    >
      {initial}
    </span>
  );
});

function VerificationBadge({ type, label }: { type?: VerificationType; label?: string | null }) {
  if (!type || type === "none") return null;
  const config =
    type === "gold"
      ? { bg: "bg-yellow-400", text: "text-black", title: label || "Official Organization" }
      : type === "grey"
        ? { bg: "bg-gray-300", text: "text-black", title: label || "Official Account" }
        : { bg: "bg-[#1d9bf0]", text: "text-white", title: label || "Verified" };
  return (
    <span role="img" title={config.title} aria-label={config.title} className={`inline-flex h-[1.05rem] w-[1.05rem] shrink-0 items-center justify-center rounded-full ${config.bg} ${config.text}`}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m5 12 4 4L19 6" />
      </svg>
    </span>
  );
}

function TimeAgo({ value, className = "" }: { value: string; className?: string }) {
  useSyncExternalStore(subscribeTicker, () => tickValue, () => 0);
  return (
    <time dateTime={new Date(parseDate(value)).toISOString()} title={fullDate(value)} className={className}>
      {timeAgoLabel(value)}
    </time>
  );
}

function Toggle({ checked, onChange, label, disabled, pending }: { checked: boolean; onChange: (next: boolean) => void; label: string; disabled?: boolean; pending?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled || pending}
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-14 shrink-0 rounded-full p-1 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${focusRing} ${checked ? "bg-red-500" : "bg-white/20"}`}
    >
      <span className={`block h-6 w-6 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-0"}`} />
    </button>
  );
}

function Tabs<K extends string>({ items, value, onChange, label, onActiveClick }: { items: Array<{ key: K; label: string }>; value: K; onChange: (key: K) => void; label: string; onActiveClick?: (key: K) => void }) {
  const base = useId();
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const onKey = (e: React.KeyboardEvent, index: number) => {
    let next = -1;
    if (e.key === "ArrowRight") next = (index + 1) % items.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + items.length) % items.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    if (next >= 0) {
      e.preventDefault();
      onChange(items[next].key);
      refs.current[next]?.focus();
    }
  };
  return (
    <div role="tablist" aria-label={label} className="flex border-b border-white/10">
      {items.map((item, i) => {
        const active = item.key === value;
        return (
          <button
            key={item.key}
            ref={(el) => {
              refs.current[i] = el;
            }}
            id={`${base}-${item.key}`}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => (active ? onActiveClick?.(item.key) : onChange(item.key))}
            onKeyDown={(e) => onKey(e, i)}
            className={`relative min-w-0 flex-1 px-2 py-3.5 text-sm font-bold transition hover:bg-white/[.04] active:bg-white/[.08] ${focusRing} focus-visible:ring-inset ${active ? "text-white" : "text-white/60"}`}
          >
            <span className="truncate">{item.label}</span>
            {active && <span className="absolute inset-x-4 bottom-0 mx-auto h-1 max-w-14 rounded-full bg-red-500" />}
          </button>
        );
      })}
    </div>
  );
}

function PostSkeleton() {
  return (
    <div className="flex gap-3 border-b border-white/10 px-4 py-4 sm:px-5" aria-hidden="true">
      <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-white/10" />
      <div className="min-w-0 flex-1 space-y-2.5">
        <div className="h-3.5 w-1/3 animate-pulse rounded bg-white/10" />
        <div className="h-3.5 w-full animate-pulse rounded bg-white/[.07]" />
        <div className="h-3.5 w-4/5 animate-pulse rounded bg-white/[.07]" />
        <div className="flex gap-6 pt-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-3 w-8 animate-pulse rounded bg-white/[.06]" />
          ))}
        </div>
      </div>
    </div>
  );
}

function UserSkeleton() {
  return (
    <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5 sm:px-5" aria-hidden="true">
      <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-white/10" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-3.5 w-2/5 animate-pulse rounded bg-white/10" />
        <div className="h-3 w-1/4 animate-pulse rounded bg-white/[.07]" />
      </div>
    </div>
  );
}

function SkeletonList({ count = 5, kind = "post" }: { count?: number; kind?: "post" | "user" }) {
  return (
    <div role="status" aria-label="Loading">
      <span className="sr-only">Loading…</span>
      {Array.from({ length: count }, (_, i) => (kind === "post" ? <PostSkeleton key={i} /> : <UserSkeleton key={i} />))}
    </div>
  );
}

function EmptyState({ icon, title, body, action }: { icon: IconName; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[.06] text-red-300">
        <Icon name={icon} size={26} />
      </span>
      <h2 className="mt-4 text-lg font-black">{title}</h2>
      {body && <p className="mt-1.5 max-w-sm text-sm leading-6 text-white/60">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="px-6 py-12 text-center">
      <p className="text-sm font-bold text-red-300">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className={`${btnOutline} mt-4`}>
          <Icon name="refresh" size={16} /> Try again
        </button>
      )}
    </div>
  );
}

function LoadMore({ list, auto }: { list: Pick<PagedList<unknown, unknown>, "hasMore" | "loadingMore" | "loadMore" | "inlineError">; auto: boolean }) {
  const sentinel = useRef<HTMLDivElement | null>(null);
  const { hasMore, loadingMore, loadMore, inlineError } = list;

  useEffect(() => {
    if (!auto || !hasMore || loadingMore || inlineError || !sentinel.current) return;
    const observer = new IntersectionObserver((entries) => entries[0]?.isIntersecting && loadMore(), { rootMargin: "400px 0px" });
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [auto, hasMore, loadingMore, loadMore, inlineError]);

  if (!hasMore && !inlineError) return null;
  return (
    <div ref={sentinel} className="px-4 py-6 text-center">
      {loadingMore ? (
        <SkeletonList count={2} />
      ) : (
        <>
          {inlineError && (
            <p role="alert" className="mb-3 text-sm text-red-300">
              {inlineError}
            </p>
          )}
          <button type="button" onClick={loadMore} className={btnOutline}>
            {inlineError ? "Retry" : "Load more"}
          </button>
        </>
      )}
    </div>
  );
}

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useFocusTrap<HTMLDivElement>(open, onClose);
  const titleId = useId();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center p-4 sm:items-center">
      <button type="button" aria-label="Close dialog" tabIndex={-1} onClick={onClose} className="absolute inset-0 cursor-default bg-black/70" />
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-[#0d0d0d] p-6 shadow-2xl">
        <h2 id={titleId} className="text-lg font-black">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}

function ViewHeader({ title, subtitle, onBack, left, right, children }: { title: string; subtitle?: string; onBack?: () => void; left?: ReactNode; right?: ReactNode; children?: ReactNode }) {
  return (
    <header className="glass sticky top-0 z-20 border-b border-white/10 bg-[#050505]">
      <div className="flex min-h-[3.5rem] items-center gap-3 px-3 py-2 sm:px-4">
        {left}
        {onBack && (
          <button type="button" onClick={onBack} aria-label="Back" className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/85 transition hover:bg-white/10 active:bg-white/15 ${focusRing}`}>
            <Icon name="back" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-black leading-tight sm:text-xl">{title}</h1>
          {subtitle && <p className="truncate text-xs text-white/55">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* Shared app context                                                          */
/* -------------------------------------------------------------------------- */

interface SocialContextValue {
  me: Profile;
  setMe: React.Dispatch<React.SetStateAction<Profile>>;
  replaceRoute: (route: Route) => void;
  back: (fallback: Route) => void;
  bumpReplies: (postId: number, delta: number, base: number) => void;
  refreshMe: () => Promise<void>;
  markNotificationsRead: () => Promise<void>;
  ui: UiPrefs;
  overlays: Record<number, PostOverlay>;
  follows: Record<string, FollowState>;
  followerCounts: Record<string, number>;
  deleted: ReadonlySet<number>;
  pending: Record<string, true>;
  openMenuId: number | null;
  setOpenMenuId: (id: number | null) => void;
  go: (route: Route, opts?: { replace?: boolean }) => void;
  toast: (text: string, kind?: Toast["kind"]) => void;
  toggleLike: (post: Post) => void;
  toggleBookmark: (post: Post) => void;
  toggleRepost: (post: Post) => void;
  toggleFollow: (user: { visitorId: string; isPrivate?: boolean; followers?: number }, initial: FollowState) => void;
  requestDelete: (post: Post) => void;
  sharePost: (post: Post) => void;
}

const SocialContext = createContext<SocialContextValue | null>(null);

function useSocial() {
  const ctx = useContext(SocialContext);
  if (!ctx) throw new Error("SocialContext missing");
  return ctx;
}

function RouteLink({ to, className, children, onNavigate, ...rest }: { to: Route; className?: string; children: ReactNode; onNavigate?: () => void } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick">) {
  const { go } = useSocial();
  return (
    <a
      {...rest}
      href={routeHref(to)}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        onNavigate?.();
        go(to);
      }}
    >
      {children}
    </a>
  );
}

/* -------------------------------------------------------------------------- */
/* Follow button, user rows                                                    */
/* -------------------------------------------------------------------------- */

function useFollowState(userId: string, initial: FollowState) {
  const { follows, pending } = useSocial();
  return { state: follows[userId] ?? initial, busy: Boolean(pending[`follow:${userId}`]) };
}

function FollowButton({ user, initial, size = "sm" }: { user: { visitorId: string; handle: string; isPrivate?: boolean; followers?: number }; initial: FollowState; size?: "sm" | "md" }) {
  const { toggleFollow, me } = useSocial();
  const { state, busy } = useFollowState(user.visitorId, initial);
  if (user.visitorId === me.visitorId) return null;

  const active = state.following || state.requested;
  const label = state.following ? "Following" : state.requested ? "Requested" : "Follow";
  const pad = size === "md" ? "px-5 py-2 text-sm" : "px-3.5 py-1.5 text-xs";
  return (
    <button
      type="button"
      disabled={busy}
      aria-pressed={active}
      aria-label={`${active ? (state.following ? "Unfollow" : "Cancel follow request for") : "Follow"} @${user.handle}`}
      onClick={() => toggleFollow(user, initial)}
      className={`${btnBase} group shrink-0 ${pad} ${active ? "border border-white/30 text-white hover:border-red-400/60 hover:bg-red-500/10 hover:text-red-300" : "bg-white text-black hover:bg-white/85"}`}
    >
      {busy && <Spinner />}
      {active ? (
        <>
          <span className="group-hover:hidden">{label}</span>
          <span className="hidden group-hover:inline">{state.following ? "Unfollow" : "Cancel"}</span>
        </>
      ) : (
        label
      )}
    </button>
  );
}

function UserRow({ user, extra }: { user: Profile; extra?: ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3 transition hover:bg-white/[.03] sm:px-5">
      <RouteLink to={{ name: "profile", handle: user.handle, tab: "posts" }} className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl ${focusRing}`}>
        <Avatar name={user.displayName} seed={user.visitorId} size={44} />
        <span className="min-w-0">
          <span className="flex min-w-0 items-center gap-1.5 font-bold">
            <span className="truncate">{user.displayName}</span>
            <VerificationBadge type={user.verificationType} label={user.verificationLabel} />
            {user.isPrivate && <Icon name="lock" size={14} className="text-white/50" />}
          </span>
          <span className="block truncate text-sm text-white/55">
            @{user.handle} · {formatCount(user.followers)} followers
          </span>
          {user.bio && <span className="mt-0.5 line-clamp-1 text-sm text-white/70">{user.bio}</span>}
        </span>
      </RouteLink>
      {extra ?? <FollowButton user={user} initial={{ following: user.isFollowing, requested: user.isRequested }} />}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Post card                                                                   */
/* -------------------------------------------------------------------------- */

function ActionButton({
  icon, count, label, active, pressed, disabled, onClick, tone,
}: {
  icon: IconName; count?: number; label: string; active?: boolean; pressed?: boolean; disabled?: boolean; onClick: () => void;
  tone: "sky" | "green" | "pink" | "amber";
}) {
  const tones = {
    sky: "hover:bg-sky-500/10 hover:text-sky-400 active:bg-sky-500/20",
    green: "hover:bg-green-500/10 hover:text-green-400 active:bg-green-500/20",
    pink: "hover:bg-pink-500/10 hover:text-pink-400 active:bg-pink-500/20",
    amber: "hover:bg-amber-500/10 hover:text-amber-400 active:bg-amber-500/20",
  }[tone];
  const activeCls = { sky: "text-sky-400", green: "text-green-400", pink: "text-pink-500", amber: "text-amber-400" }[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={pressed}
      className={`flex min-h-[44px] min-w-0 items-center justify-center gap-1.5 rounded-full px-1 transition disabled:cursor-wait disabled:opacity-60 ${focusRing} ${active ? activeCls : "text-white/60"} ${tones}`}
    >
      <Icon name={icon} size={19} filled={active && (icon === "like" || icon === "bookmark")} />
      {count !== undefined && <span className="text-[0.8125rem] tabular-nums">{formatCount(count)}</span>}
    </button>
  );
}

function PostMenu({ post, target, isMine, isOwnRepost }: { post: Post; target: Post; isMine: boolean; isOwnRepost: boolean }) {
  const { openMenuId, setOpenMenuId, toggleBookmark, toggleRepost, toggleFollow, requestDelete, sharePost, overlays, follows } = useSocial();
  const open = openMenuId === post.id;
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const bookmarked = overlays[target.id]?.bookmarked ?? target.bookmarked;
  const follow = follows[target.author.visitorId] ?? { following: target.following, requested: false };

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus();
    const onKey = (e: KeyboardEvent) => {
      const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? []);
      const i = items.indexOf(document.activeElement as HTMLElement);
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpenMenuId(null);
        triggerRef.current?.focus();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        items[(i + 1) % items.length]?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        items[(i - 1 + items.length) % items.length]?.focus();
      } else if (e.key === "Tab") setOpenMenuId(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpenMenuId]);

  const item = (label: string, onClick: () => void, danger = false) => (
    <button
      type="button"
      role="menuitem"
      onClick={() => {
        setOpenMenuId(null);
        onClick();
      }}
      className={`flex w-full items-center rounded-xl px-4 py-3 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-400 ${danger ? "text-red-300 hover:bg-red-500/10" : "text-white/90 hover:bg-white/[.07]"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="relative shrink-0" data-post-menu>
      <button
        ref={triggerRef}
        type="button"
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpenMenuId(open ? null : post.id)}
        className={`flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white ${focusRing}`}
      >
        <Icon name="more" size={20} />
      </button>
      {open && (
        <div ref={menuRef} role="menu" aria-label="Post actions" className="absolute right-0 top-10 z-30 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#101010] p-1.5 shadow-2xl shadow-black/60">
          {item("Copy / share link", () => sharePost(target))}
          {item(bookmarked ? "Remove bookmark" : "Bookmark", () => toggleBookmark(target))}
          {!isMine && item(`${follow.following ? "Unfollow" : follow.requested ? "Cancel request to" : "Follow"} @${target.author.handle}`, () => toggleFollow({ visitorId: target.author.visitorId }, { following: target.following, requested: false }))}
          {isOwnRepost && item("Undo repost", () => toggleRepost(target), true)}
          {!isOwnRepost && isMine && item("Delete post", () => requestDelete(post), true)}
        </div>
      )}
    </div>
  );
}

const PostCard = memo(function PostCard({ post, variant = "feed" }: { post: Post; variant?: "feed" | "root" | "reply" }) {
  const { me, overlays, pending, go, toggleLike, toggleBookmark, toggleRepost, sharePost } = useSocial();

  const isRepost = Boolean(post.repostOfId);
  const target = isRepost && post.original ? post.original : post;
  const ov = overlays[target.id];
  const liked = ov?.liked ?? target.liked;
  const likes = ov?.likes ?? target.likes;
  const bookmarked = ov?.bookmarked ?? target.bookmarked;
  const reposted = ov?.reposted ?? target.reposted;
  const reposts = ov?.reposts ?? target.reposts;
  const replies = ov?.replies ?? target.replies;
  const isMine = target.author.visitorId === me.visitorId;
  const isOwnRepost = isRepost && post.author.visitorId === me.visitorId;
  const busy = (k: string) => Boolean(pending[`${k}:${target.id}`]);
  const openThread = (reply = false) => go({ name: "thread", postId: target.id, reply });
  const clickable = variant !== "root";

  return (
    <article
      aria-label={`Post by ${target.author.displayName}`}
      onClick={(e) => {
        if (!clickable) return;
        if ((e.target as HTMLElement).closest("a,button,input,textarea,[role=menu]")) return;
        if (window.getSelection()?.toString()) return;
        openThread();
      }}
      className={`border-b border-white/10 px-4 py-3.5 transition sm:px-5 ${clickable ? "cursor-pointer hover:bg-white/[.025]" : ""}`}
    >
      {isRepost && (
        <div className="mb-1.5 flex items-center gap-2 pl-[3.25rem] text-[0.8125rem] font-bold text-green-400/90">
          <Icon name="repost" size={15} />
          <RouteLink to={{ name: "profile", handle: post.author.handle, tab: "posts" }} className={`truncate rounded hover:underline ${focusRing}`}>
            {post.author.visitorId === me.visitorId ? "You" : post.author.displayName} reposted
          </RouteLink>
        </div>
      )}
      {!isRepost && post.parent && variant === "feed" && (
        <div className="mb-1 pl-[3.25rem] text-[0.8125rem] text-white/55">
          Replying to{" "}
          <RouteLink to={{ name: "profile", handle: post.parent.handle, tab: "posts" }} className={`rounded text-sky-400 hover:underline ${focusRing}`}>
            @{post.parent.handle}
          </RouteLink>
        </div>
      )}

      <div className="flex gap-3">
        <RouteLink to={{ name: "profile", handle: target.author.handle, tab: "posts" }} aria-label={`${target.author.displayName}'s profile`} className={`h-fit shrink-0 rounded-full ${focusRing}`}>
          <Avatar name={target.author.displayName} seed={target.author.visitorId} />
        </RouteLink>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1 leading-tight">
              <RouteLink to={{ name: "profile", handle: target.author.handle, tab: "posts" }} className={`flex min-w-0 items-center gap-1.5 rounded font-bold hover:underline ${focusRing}`}>
                <span className="truncate">{target.author.displayName}</span>
                <VerificationBadge type={target.author.verificationType} label={target.author.verificationLabel} />
              </RouteLink>
              <div className="flex min-w-0 items-center gap-1 text-sm text-white/55">
                <span className="truncate">@{target.author.handle}</span>
                <span aria-hidden="true">·</span>
                <a
                  href={routeHref({ name: "thread", postId: target.id, reply: false })}
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                    e.preventDefault();
                    openThread();
                  }}
                  className={`shrink-0 rounded hover:underline ${focusRing}`}
                >
                  <TimeAgo value={target.createdAt} />
                </a>
              </div>
            </div>
            {!isMine && variant === "feed" && <FollowButton user={{ visitorId: target.author.visitorId, handle: target.author.handle }} initial={{ following: target.following, requested: false }} />}
            <PostMenu post={post} target={target} isMine={isMine} isOwnRepost={isOwnRepost} />
          </div>

          <p className={`mt-1.5 whitespace-pre-wrap [overflow-wrap:anywhere] leading-6 text-white/90 ${variant === "root" ? "text-lg leading-7" : "text-[0.9375rem]"}`}>{target.body}</p>

          {variant === "root" && (
            <p className="mt-3 text-sm text-white/55">
              {fullDate(target.createdAt)}
            </p>
          )}

          <div className="-ml-2 mt-2 grid max-w-[480px] grid-cols-5 items-center" role="group" aria-label="Post actions">
            <ActionButton icon="reply" tone="sky" count={replies} label={`Reply, ${replies} replies`} onClick={() => openThread(true)} />
            <ActionButton icon="repost" tone="green" count={reposts} active={reposted} pressed={reposted} disabled={busy("repost")} label={`${reposted ? "Undo repost" : "Repost"}, ${reposts} reposts`} onClick={() => toggleRepost(target)} />
            <ActionButton icon="like" tone="pink" count={likes} active={liked} pressed={liked} disabled={busy("like")} label={`${liked ? "Unlike" : "Like"}, ${likes} likes`} onClick={() => toggleLike(target)} />
            <ActionButton icon="bookmark" tone="amber" active={bookmarked} pressed={bookmarked} disabled={busy("bookmark")} label={bookmarked ? "Remove bookmark" : "Bookmark"} onClick={() => toggleBookmark(target)} />
            <ActionButton icon="share" tone="sky" label="Share post link" onClick={() => sharePost(target)} />
          </div>
        </div>
      </div>
    </article>
  );
});

/* -------------------------------------------------------------------------- */
/* Composer                                                                    */
/* -------------------------------------------------------------------------- */

function Composer({
  value, onChange, onSubmit, posting, placeholder, label, submitLabel, me, autoFocus, notice, textareaRef, compact,
}: {
  value: string; onChange: (v: string) => void; onSubmit: () => void; posting: boolean; placeholder: string; label: string;
  submitLabel: string; me: Profile; autoFocus?: boolean; notice?: ReactNode; textareaRef?: React.MutableRefObject<HTMLTextAreaElement | null>; compact?: boolean;
}) {
  const counterId = useId();
  const localRef = useRef<HTMLTextAreaElement | null>(null);
  const count = charCount(value);
  const remaining = MAX_POST - count;
  const over = remaining < 0;
  const empty = !value.trim();
  const blocked = empty || over || posting || Boolean(notice);

  useEffect(() => {
    const el = localRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 260)}px`;
  }, [value]);

  const submitIfAllowed = () => {
    if (!blocked) onSubmit();
  };

  return (
    <div className="flex gap-3 border-b border-white/10 px-4 py-3.5 sm:px-5">
      <Avatar name={me.displayName} seed={me.visitorId} size={compact ? 36 : 44} />
      <div className="min-w-0 flex-1">
        <label htmlFor={`${counterId}-ta`} className="sr-only">
          {label}
        </label>
        <textarea
          id={`${counterId}-ta`}
          ref={(el) => {
            localRef.current = el;
            if (textareaRef) textareaRef.current = el;
          }}
          value={value}
          autoFocus={autoFocus}
          disabled={Boolean(notice) || posting}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              submitIfAllowed();
            }
          }}
          aria-describedby={counterId}
          aria-invalid={over}
          placeholder={placeholder}
          rows={compact ? 2 : 3}
          className="block w-full resize-none bg-transparent py-2 text-[1.0625rem] leading-6 text-white placeholder:text-white/45 focus:outline-none disabled:opacity-60"
        />
        {notice && <p className="mb-2 rounded-xl bg-white/[.05] px-3 py-2 text-sm text-white/70">{notice}</p>}
        <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3">
          <div id={counterId} className="flex items-center gap-2 text-xs">
            <span className={`tabular-nums ${over ? "font-bold text-red-400" : remaining <= 20 ? "font-bold text-amber-400" : "text-white/55"}`}>
              {count}/{MAX_POST}
            </span>
            {(over || remaining <= 20) && (
              <span role="status" className={over ? "text-red-400" : "text-amber-400"}>
                {over ? `${-remaining} over the limit` : `${remaining} left`}
              </span>
            )}
            <span className="hidden text-white/40 sm:inline">· Ctrl+Enter to send</span>
          </div>
          <button type="button" onClick={submitIfAllowed} disabled={blocked} className={btnPrimary}>
            {posting && <Spinner />}
            {posting ? "Posting…" : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Lists                                                                       */
/* -------------------------------------------------------------------------- */

function PostList<M>({ list, empty, hide, skeletonCount = 5 }: { list: PagedList<Post, M>; empty: ReactNode; hide?: (p: Post) => boolean; skeletonCount?: number }) {
  const { deleted, ui } = useSocial();
  const items = useMemo(() => list.items.filter((p) => !deleted.has(p.id) && !(hide && hide(p))), [list.items, deleted, hide]);

  if (list.status === "loading" || list.status === "idle") return <SkeletonList count={skeletonCount} />;
  if (list.status === "error") return <ErrorState message={list.error?.message ?? "Couldn't load posts."} onRetry={list.reload} />;
  if (!items.length && !list.hasMore) return <>{empty}</>;
  return (
    <div aria-busy={list.refreshing}>
      {list.refreshing && <div className="h-0.5 w-full animate-pulse bg-red-500/70" />}
      {items.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
      <LoadMore list={list} auto={!ui.dataSaver} />
    </div>
  );
}

function UserList({ list, empty }: { list: PagedList<Profile, { locked: boolean }>; empty: ReactNode }) {
  const { ui } = useSocial();
  if (list.status === "loading" || list.status === "idle") return <SkeletonList kind="user" count={6} />;
  if (list.status === "error") return <ErrorState message={list.error?.message ?? "Couldn't load people."} onRetry={list.reload} />;
  if (list.meta?.locked) return <EmptyState icon="lock" title="This account is private" body="Follow this account and wait for approval to see this list." />;
  if (!list.items.length) return <>{empty}</>;
  return (
    <div>
      {list.items.map((u) => (
        <UserRow key={u.visitorId} user={u} />
      ))}
      <LoadMore list={list} auto={!ui.dataSaver} />
    </div>
  );
}

function ConfirmDialog({ open, title, body, confirmLabel, onConfirm, onCancel }: { open: boolean; title: string; body: string; confirmLabel: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="mt-2 text-sm leading-6 text-white/65">{body}</p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
        <button type="button" onClick={onConfirm} className={`${btnDanger} w-full sm:w-auto`}>
          {confirmLabel}
        </button>
        <button type="button" onClick={onCancel} className={`${btnOutline} w-full sm:w-auto`}>
          Cancel
        </button>
      </div>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/* Response types                                                              */
/* -------------------------------------------------------------------------- */

interface FeedResponse { posts: Post[]; nextCursor: number; hasMore: boolean }
interface ThreadResponse { post: Post | null; replies: Post[]; focusId: number; nextCursor: number; hasMore: boolean }
interface SearchResponse { users: Profile[]; posts: Post[]; nextCursor: string; hasMore: boolean; tooShort?: boolean }
interface UsersResponse { users: Profile[]; nextCursor: string; hasMore: boolean; locked: boolean }
interface PostsResponse extends FeedResponse { locked?: boolean }
interface NotificationsResponse { notifications: NotificationGroup[]; requests: Profile[]; nextCursor: number; hasMore: boolean }
interface ProfileResponse { profile: Profile; settings?: Settings; unread?: number }
interface CreatePostResponse { id: number; post: Post }

const postKey = (p: Post) => p.id;
const profileKey = (p: Profile) => p.visitorId;
const pageSize = (ui: UiPrefs) => (ui.dataSaver ? 10 : 20);

/* -------------------------------------------------------------------------- */
/* Home                                                                        */
/* -------------------------------------------------------------------------- */

function HomeView({
  tab, setTab, forYou, followingFeed, draft, setDraft, posting, submitPost, openDrawer,
}: {
  tab: "for-you" | "following"; setTab: (t: "for-you" | "following") => void;
  forYou: PagedList<Post>; followingFeed: PagedList<Post>;
  draft: string; setDraft: (v: string) => void; posting: boolean; submitPost: () => void; openDrawer: () => void;
}) {
  const { me, go } = useSocial();
  const active = tab === "for-you" ? forYou : followingFeed;

  return (
    <>
      <ViewHeader
        title="Home"
        left={
          <button type="button" onClick={openDrawer} aria-label="Open menu" className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full md:hidden ${focusRing}`}>
            <Avatar name={me.displayName} seed={me.visitorId} size={32} />
          </button>
        }
        right={
          <button type="button" onClick={() => active.refresh()} disabled={active.refreshing || active.status !== "ready"} aria-label="Refresh feed" className={`flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 disabled:opacity-40 ${focusRing}`}>
            <Icon name="refresh" size={19} className={active.refreshing ? "animate-spin" : ""} />
          </button>
        }
      >
        <Tabs
          label="Feed"
          value={tab}
          onChange={setTab}
          onActiveClick={() => {
            window.scrollTo({ top: 0 });
            active.refresh();
          }}
          items={[{ key: "for-you", label: "For You" }, { key: "following", label: "Following" }]}
        />
      </ViewHeader>

      <Composer value={draft} onChange={setDraft} onSubmit={submitPost} posting={posting} me={me} label="Write a post" placeholder="What's happening in the RAAKA universe?" submitLabel="Post" />

      <div role="tabpanel" aria-label={tab === "for-you" ? "For You" : "Following"}>
        <PostList
          list={active}
          empty={
            tab === "for-you" ? (
              <EmptyState icon="reply" title="No posts yet" body="Be the first RAAKA fan to post something." />
            ) : (
              <EmptyState
                icon="user"
                title="Your Following feed is empty"
                body="Follow some people to see their posts here."
                action={
                  <button type="button" onClick={() => go({ name: "explore", q: "", tab: "people" })} className={btnPrimary}>
                    Find people
                  </button>
                }
              />
            )
          }
        />
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Thread                                                                      */
/* -------------------------------------------------------------------------- */

function ThreadView({ postId, focusReply }: { postId: number; focusReply: boolean }) {
  const { me, ui, toast, back, bumpReplies, deleted, go } = useSocial();
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const textRef = useRef<HTMLTextAreaElement | null>(null);
  const focused = useRef(false);
  useDirtyGuard(`thread-${postId}`, text.trim().length > 0);

  const thread = usePaged<Post, { post: Post; focusId: number }>({
    resetKey: String(postId),
    keyOf: postKey,
    load: async (cursor, signal) => {
      const r = await api.get<ThreadResponse>({ action: "thread", postId, cursor: cursor ?? undefined, limit: pageSize(ui) }, signal);
      return { items: r.replies, nextCursor: r.nextCursor, hasMore: r.hasMore, meta: r.post ? { post: r.post, focusId: r.focusId } : undefined };
    },
  });

  const root = thread.meta?.post ?? null;
  const rootGone = root ? deleted.has(root.id) : false;

  useEffect(() => {
    if (rootGone) go({ name: "home" }, { replace: true });
  }, [rootGone, go]);

  useEffect(() => {
    if (focusReply && root && !focused.current) {
      focused.current = true;
      textRef.current?.focus();
    }
  }, [focusReply, root]);

  const submit = async () => {
    if (!root || posting) return;
    setPosting(true);
    try {
      const r = await api.post<CreatePostResponse>({ action: "reply", postId: root.id, text });
      setText("");
      thread.append(r.post);
      bumpReplies(root.id, 1, root.replies);
      toast("Reply posted", "success");
    } catch (e) {
      toast(toApiError(e).message, "error");
    } finally {
      setPosting(false);
    }
  };

  return (
    <>
      <ViewHeader title="Post" onBack={() => back({ name: "home" })} />
      {thread.status === "loading" || thread.status === "idle" ? (
        <SkeletonList count={3} />
      ) : thread.status === "error" ? (
        thread.error?.status === 404 ? (
          <EmptyState icon="reply" title="This post isn't available" body="It may have been deleted, or it belongs to a private account." action={<button type="button" onClick={() => go({ name: "home" })} className={btnPrimary}>Back to Home</button>} />
        ) : (
          <ErrorState message={thread.error?.message ?? "Couldn't load this post."} onRetry={thread.reload} />
        )
      ) : root ? (
        <>
          <PostCard post={root} variant="root" />
          <Composer
            compact
            me={me}
            value={text}
            onChange={setText}
            onSubmit={() => void submit()}
            posting={posting}
            textareaRef={textRef}
            label={`Reply to ${root.author.displayName}`}
            placeholder={`Reply to @${root.author.handle}`}
            submitLabel="Reply"
            notice={root.canReply ? undefined : "The author limits who can reply to this post."}
          />
          <PostList list={thread} empty={<EmptyState icon="reply" title="No replies yet" body="Start the conversation." />} />
        </>
      ) : null}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Explore / search                                                            */
/* -------------------------------------------------------------------------- */

function ExploreView({ initialQuery, initialTab }: { initialQuery: string; initialTab: SearchTab }) {
  const { ui, replaceRoute } = useSocial();
  const [input, setInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery.trim());
  const [tab, setTab] = useState<SearchTab>(initialTab);
  const inputId = useId();

  // Debounced live search (disabled in Data Saver: submit-only).
  useEffect(() => {
    if (ui.dataSaver) return;
    const t = setTimeout(() => setQuery(input.replace(/\s+/g, " ").trim()), 350);
    return () => clearTimeout(t);
  }, [input, ui.dataSaver]);

  useEffect(() => {
    replaceRoute({ name: "explore", q: query, tab });
  }, [query, tab, replaceRoute]);

  const ready = query.replace(/^@+/, "").length >= 2;
  const key = `${tab}|${query}`;

  const people = usePaged<Profile>({
    enabled: ready && tab === "people",
    resetKey: key,
    keyOf: profileKey,
    load: async (cursor, signal) => {
      const r = await api.get<SearchResponse>({ action: "search", mode: "people", q: query, cursor: cursor ?? undefined, limit: pageSize(ui) }, signal);
      return { items: r.users, nextCursor: r.nextCursor, hasMore: r.hasMore };
    },
  });
  const posts = usePaged<Post>({
    enabled: ready && tab !== "people",
    resetKey: key,
    keyOf: postKey,
    load: async (cursor, signal) => {
      const r = await api.get<SearchResponse>({ action: "search", mode: tab, q: query, cursor: cursor ?? undefined, limit: pageSize(ui) }, signal);
      return { items: r.posts, nextCursor: r.nextCursor, hasMore: r.hasMore };
    },
  });

  const tabs: Array<{ key: SearchTab; label: string }> = [
    { key: "people", label: "People" },
    { key: "posts", label: "Posts" },
    { key: "top", label: "Top" },
    { key: "latest", label: "Latest" },
  ];

  return (
    <>
      <header className="glass sticky top-0 z-20 border-b border-white/10 bg-[#050505]">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(input.replace(/\s+/g, " ").trim());
          }}
          className="flex gap-2 px-3 py-2.5 sm:px-4"
        >
          <label htmlFor={inputId} className="sr-only">Search RAAKA Social</label>
          <div className="relative min-w-0 flex-1">
            <Icon name="search" size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              id={inputId}
              type="search"
              value={input}
              autoFocus={!initialQuery}
              maxLength={50}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Search people and posts"
              enterKeyHint="search"
              autoComplete="off"
              className={`${inputCls} rounded-full py-2.5 pl-10`}
            />
          </div>
          <button type="submit" className={btnPrimary}>Search</button>
        </form>
        <Tabs label="Search results" value={tab} onChange={setTab} items={tabs} />
      </header>

      {!ready ? (
        <EmptyState icon="search" title="Search RAAKA Social" body={input.trim().length === 1 ? "Type at least 2 characters." : "Find fans by name or @handle, or search what people are posting."} />
      ) : tab === "people" ? (
        <>
          {people.status === "loading" ? <SkeletonList kind="user" count={5} /> : people.status === "error" ? (
            <ErrorState message={people.error?.message ?? "Search failed."} onRetry={people.reload} />
          ) : !people.items.length ? (
            <EmptyState icon="user" title={`No people found for “${query}”`} body="Check the spelling or try a different name." />
          ) : (
            <div>
              {people.items.map((u) => <UserRow key={u.visitorId} user={u} />)}
              <LoadMore list={people} auto={!ui.dataSaver} />
            </div>
          )}
        </>
      ) : (
        <PostList list={posts} empty={<EmptyState icon="search" title={`No posts found for “${query}”`} body="Post search covers recent posts. Try different words." />} />
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Notifications                                                               */
/* -------------------------------------------------------------------------- */

function notificationText(n: NotificationGroup) {
  const first = n.actors[0]?.displayName ?? "Someone";
  const others = n.count - 1;
  const who = others > 0 ? `${first} and ${others} ${others === 1 ? "other" : "others"}` : first;
  switch (n.type) {
    case "like": return `${who} liked your post`;
    case "repost": return `${who} reposted your post`;
    case "reply": return `${who} replied to you`;
    case "follow": return `${who} followed you`;
    case "follow_accepted": return `${first} accepted your follow request`;
    default: return `${who} interacted with you`;
  }
}

function NotificationItem({ n }: { n: NotificationGroup }) {
  const iconFor: Record<string, { icon: IconName; cls: string }> = {
    like: { icon: "like", cls: "text-pink-500" },
    repost: { icon: "repost", cls: "text-green-400" },
    reply: { icon: "reply", cls: "text-sky-400" },
    follow: { icon: "user", cls: "text-red-400" },
    follow_accepted: { icon: "check", cls: "text-red-400" },
  };
  const meta = iconFor[n.type] ?? { icon: "bell" as IconName, cls: "text-white/60" };
  const actor = n.actors[0];
  const target: Route = n.postId ? { name: "thread", postId: n.postId, reply: false } : { name: "profile", handle: actor?.handle ?? null, tab: "posts" };

  return (
    <RouteLink to={target} className={`relative flex gap-3 border-b border-white/10 px-4 py-3.5 transition hover:bg-white/[.04] sm:px-5 ${focusRing} focus-visible:ring-inset ${n.unread ? "bg-red-500/[.06]" : ""}`}>
      {n.unread && <span className="absolute inset-y-0 left-0 w-1 bg-red-500" aria-hidden="true" />}
      <Icon name={meta.icon} size={24} filled={n.type === "like"} className={`mt-1 ${meta.cls}`} />
      <div className="min-w-0 flex-1">
        <div className="flex -space-x-2" aria-hidden="true">
          {n.actors.map((a) => (
            <span key={a.visitorId} className="rounded-full ring-2 ring-[#050505]"><Avatar name={a.displayName} seed={a.visitorId} size={30} /></span>
          ))}
        </div>
        <p className="mt-2 text-[0.9375rem] [overflow-wrap:anywhere]">
          {n.unread && <span className="sr-only">Unread. </span>}
          <b>{notificationText(n)}</b> <TimeAgo value={n.createdAt} className="text-white/50" />
        </p>
        {n.preview && <p className="mt-1 line-clamp-2 text-sm text-white/60 [overflow-wrap:anywhere]">{n.preview}</p>}
      </div>
    </RouteLink>
  );
}

function RequestRow({ user, onDone }: { user: Profile; onDone: (accepted: boolean) => void }) {
  const { toast, setMe } = useSocial();
  const [busy, setBusy] = useState<"accept" | "decline" | null>(null);
  const respond = async (accept: boolean) => {
    if (busy) return;
    setBusy(accept ? "accept" : "decline");
    try {
      const r = await api.post<{ followers: number }>({ action: "follow-request", requesterId: user.visitorId, accept });
      if (accept) setMe((m) => ({ ...m, followers: r.followers }));
      onDone(accept);
      toast(accept ? `@${user.handle} can now see your posts` : "Request declined", "success");
    } catch (e) {
      toast(toApiError(e).message, "error");
      setBusy(null);
    }
  };
  return (
    <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
      <RouteLink to={{ name: "profile", handle: user.handle, tab: "posts" }} className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl ${focusRing}`}>
        <Avatar name={user.displayName} seed={user.visitorId} size={40} />
        <span className="min-w-0">
          <span className="block truncate font-bold">{user.displayName}</span>
          <span className="block truncate text-sm text-white/55">@{user.handle} wants to follow you</span>
        </span>
      </RouteLink>
      <button type="button" disabled={Boolean(busy)} onClick={() => void respond(true)} className={`${btnPrimary} !px-3.5 !py-1.5 !text-xs`}>{busy === "accept" && <Spinner />}Accept</button>
      <button type="button" disabled={Boolean(busy)} onClick={() => void respond(false)} className={`${btnOutline} !px-3.5 !py-1.5 !text-xs`}>{busy === "decline" && <Spinner />}Decline</button>
    </div>
  );
}

function NotificationsView() {
  const { ui, markNotificationsRead, back } = useSocial();
  const list = usePaged<NotificationGroup, { requests: Profile[] }>({
    resetKey: "notifications",
    keyOf: (n) => n.key,
    load: async (cursor, signal) => {
      const r = await api.get<NotificationsResponse>({ action: "notifications", cursor: cursor ?? undefined, limit: pageSize(ui) }, signal);
      return { items: r.notifications, nextCursor: r.nextCursor, hasMore: r.hasMore, meta: { requests: r.requests } };
    },
  });

  const hasUnread = list.items.some((n) => n.unread);
  useEffect(() => {
    if (list.status !== "ready" || !hasUnread) return;
    const t = setTimeout(() => void markNotificationsRead(), 1500);
    return () => clearTimeout(t);
  }, [list.status, hasUnread, markNotificationsRead]);

  const requests = list.meta?.requests ?? [];

  return (
    <>
      <ViewHeader
        title="Notifications"
        onBack={() => back({ name: "home" })}
        right={
          <button type="button" onClick={list.refresh} disabled={list.refreshing} aria-label="Refresh notifications" className={`flex h-10 w-10 items-center justify-center rounded-full text-white/70 hover:bg-white/10 disabled:opacity-40 ${focusRing}`}>
            <Icon name="refresh" size={19} className={list.refreshing ? "animate-spin" : ""} />
          </button>
        }
      />
      {list.status === "loading" || list.status === "idle" ? <SkeletonList kind="user" count={6} /> : list.status === "error" ? (
        <ErrorState message={list.error?.message ?? "Couldn't load notifications."} onRetry={list.reload} />
      ) : (
        <>
          {requests.length > 0 && (
            <section aria-label="Follow requests">
              <h2 className="border-b border-white/10 bg-white/[.03] px-5 py-2 text-xs font-bold uppercase tracking-widest text-white/55">Follow requests</h2>
              {requests.map((u) => (
                <RequestRow key={u.visitorId} user={u} onDone={() => list.setMeta((m) => ({ requests: (m?.requests ?? []).filter((x) => x.visitorId !== u.visitorId) }))} />
              ))}
            </section>
          )}
          {!list.items.length && !requests.length ? (
            <EmptyState icon="bell" title="Nothing here yet" body="Likes, replies, reposts and new followers will show up here." />
          ) : (
            <>
              {list.items.map((n) => <NotificationItem key={n.key} n={n} />)}
              <LoadMore list={list} auto={!ui.dataSaver} />
            </>
          )}
        </>
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Bookmarks                                                                   */
/* -------------------------------------------------------------------------- */

function BookmarksView() {
  const { ui, back, overlays } = useSocial();
  const list = usePaged<Post>({
    resetKey: "bookmarks",
    keyOf: postKey,
    load: async (cursor, signal) => {
      const r = await api.get<FeedResponse>({ action: "bookmarks", cursor: cursor ?? undefined, limit: pageSize(ui) }, signal);
      return { items: r.posts, nextCursor: r.nextCursor, hasMore: r.hasMore };
    },
  });
  const hide = useCallback((p: Post) => overlays[p.id]?.bookmarked === false, [overlays]);
  return (
    <>
      <ViewHeader title="Bookmarks" subtitle="Only visible to you" onBack={() => back({ name: "home" })} />
      <PostList list={list} hide={hide} empty={<EmptyState icon="bookmark" title="Save posts for later" body="Tap the bookmark icon on any post and it will show up here." />} />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Profile                                                                     */
/* -------------------------------------------------------------------------- */

function EditProfileForm({ profile, onCancel, onSaved }: { profile: Profile; onCancel: () => void; onSaved: (p: Profile) => void }) {
  const { toast } = useSocial();
  const [name, setName] = useState(profile.displayName);
  const [handle, setHandle] = useState(profile.handle);
  const [bio, setBio] = useState(profile.bio);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const ids = { name: useId(), handle: useId(), bio: useId() };
  const handleChanged = handle !== profile.handle;

  const save = async () => {
    const found = validateProfileForm(name, handle, bio);
    setErrors(found);
    if (Object.keys(found).length || saving) return;
    setSaving(true);
    try {
      const r = await api.post<{ profile: Profile }>({ action: "profile", displayName: name.trim(), handle, bio: bio.trim() });
      toast("Profile updated", "success");
      onSaved(r.profile);
    } catch (e) {
      const err = toApiError(e);
      if (err.status === 409 || /handle/i.test(err.message)) setErrors({ handle: err.message });
      else toast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const field = (id: string, label: string, error?: string, hint?: string, children?: ReactNode) => (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-bold">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-white/55">{hint}</p>}
      {error && <p id={`${id}-err`} role="alert" className="mt-1 text-xs text-red-300">{error}</p>}
    </div>
  );

  return (
    <form onSubmit={(e) => { e.preventDefault(); void save(); }} noValidate className="mt-4 space-y-4">
      {field(ids.name, "Display name", errors.name, undefined,
        <input id={ids.name} value={name} maxLength={MAX_NAME} onChange={(e) => setName(e.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? `${ids.name}-err` : undefined} className={inputCls} />)}
      {field(ids.handle, "Handle", errors.handle, handleChanged ? "Changing your handle breaks old links to your profile." : "Letters, numbers and underscores.",
        <div className="relative"><span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/50">@</span>
          <input id={ids.handle} value={handle} autoCapitalize="none" autoCorrect="off" spellCheck={false} onChange={(e) => setHandle(normalizeHandleInput(e.target.value))} aria-invalid={Boolean(errors.handle)} aria-describedby={errors.handle ? `${ids.handle}-err` : undefined} className={`${inputCls} pl-8`} /></div>)}
      {field(ids.bio, "Bio", errors.bio, `${charCount(bio)}/${MAX_BIO}`,
        <textarea id={ids.bio} value={bio} rows={3} onChange={(e) => setBio(e.target.value)} aria-invalid={Boolean(errors.bio)} aria-describedby={errors.bio ? `${ids.bio}-err` : undefined} className={`${inputCls} resize-none`} />)}
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className={btnPrimary}>{saving && <Spinner />}{saving ? "Saving…" : "Save changes"}</button>
        <button type="button" onClick={onCancel} disabled={saving} className={btnOutline}>Cancel</button>
      </div>
    </form>
  );
}

function ProfileView({ handle, tab }: { handle: string | null; tab: ProfileTab }) {
  const { me, setMe, go, back, ui, followerCounts, refreshMe } = useSocial();
  const isSelfRoute = !handle || handle === me.handle.toLowerCase();
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (isSelfRoute) void refreshMe();
  }, [isSelfRoute, refreshMe]);

  const res = useResource<ProfileResponse>(`profile:${handle ?? ""}`, (signal) => api.get<ProfileResponse>({ action: "profile", handle: handle ?? undefined }, signal), !isSelfRoute);
  // Never render another user's data while a different profile is loading.
  const profile: Profile | null = isSelfRoute ? me : res.data && res.data.profile.handle.toLowerCase() === handle ? res.data.profile : null;
  const profileHandle = profile?.handle ?? handle ?? "";

  const posts = usePaged<Post, { locked: boolean }>({
    enabled: Boolean(profile) && tab === "posts",
    resetKey: `posts:${profile?.visitorId ?? ""}`,
    keyOf: postKey,
    load: async (cursor, signal) => {
      const r = await api.get<PostsResponse>({ action: "user-posts", handle: profileHandle, cursor: cursor ?? undefined, limit: pageSize(ui) }, signal);
      return { items: r.posts, nextCursor: r.nextCursor, hasMore: r.hasMore, meta: { locked: Boolean(r.locked) } };
    },
  });
  const relations = usePaged<Profile, { locked: boolean }>({
    enabled: Boolean(profile) && tab !== "posts",
    resetKey: `${tab}:${profile?.visitorId ?? ""}`,
    keyOf: profileKey,
    load: async (cursor, signal) => {
      const r = await api.get<UsersResponse>({ action: tab, handle: profileHandle, cursor: cursor ?? undefined, limit: pageSize(ui) }, signal);
      return { items: r.users, nextCursor: r.nextCursor, hasMore: r.hasMore, meta: { locked: r.locked } };
    },
  });

  if (!isSelfRoute && res.status === "loading") {
    return (<><ViewHeader title="Profile" onBack={() => back({ name: "home" })} /><div role="status" aria-label="Loading profile"><div className="h-28 animate-pulse bg-white/[.06]" /><SkeletonList count={3} /></div></>);
  }
  if (!profile) {
    const notFound = res.error?.status === 404;
    return (
      <>
        <ViewHeader title="Profile" onBack={() => back({ name: "home" })} />
        {notFound ? <EmptyState icon="user" title="This account doesn't exist" body={`There's no profile for @${handle}. It may have been renamed or deleted.`} action={<button type="button" onClick={() => go({ name: "explore", q: handle ?? "", tab: "people" })} className={btnPrimary}>Search instead</button>} />
          : <ErrorState message={res.error?.message ?? "Couldn't load this profile."} onRetry={res.reload} />}
      </>
    );
  }

  const followers = followerCounts[profile.visitorId] ?? profile.followers;
  const lockedForViewer = !profile.canView && !profile.isSelf;
  const followInitial: FollowState = { following: profile.isFollowing, requested: profile.isRequested };

  return (
    <>
      <ViewHeader title={profile.displayName} subtitle={`${formatCount(profile.posts)} posts`} onBack={() => back({ name: "home" })} />
      <div className="h-24 bg-gradient-to-br from-red-600/40 via-orange-500/20 to-transparent sm:h-32" aria-hidden="true" />
      <section aria-label="Profile" className="px-4 pb-4 sm:px-5">
        <div className="-mt-10 flex items-end justify-between gap-3 sm:-mt-12">
          <span className="rounded-full ring-4 ring-[#050505]"><Avatar name={profile.displayName} seed={profile.visitorId} size={88} /></span>
          <div className="pb-1">
            {profile.isSelf ? (
              !editing && <button type="button" onClick={() => setEditing(true)} className={btnOutline}>Edit profile</button>
            ) : (
              <FollowButton size="md" user={{ visitorId: profile.visitorId, handle: profile.handle, isPrivate: profile.isPrivate, followers }} initial={followInitial} />
            )}
          </div>
        </div>

        {editing && profile.isSelf ? (
          <EditProfileForm profile={profile} onCancel={() => setEditing(false)} onSaved={(p) => { setMe((m) => ({ ...m, ...p, isSelf: true })); setEditing(false); if (handle) go({ name: "profile", handle: null, tab }, { replace: true }); }} />
        ) : (
          <>
            <h2 className="mt-3 flex min-w-0 items-center gap-1.5 text-xl font-black">
              <span className="truncate">{profile.displayName}</span>
              <VerificationBadge type={profile.verificationType} label={profile.verificationLabel} />
              {profile.isPrivate && <Icon name="lock" size={16} className="text-white/55" />}
            </h2>
            <p className="truncate text-sm text-white/55">@{profile.handle}{profile.isSelf && <span className="ml-2 rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-bold text-red-300">You</span>}</p>
            {profile.bio && <p className="mt-3 whitespace-pre-wrap text-[0.9375rem] leading-6 text-white/80 [overflow-wrap:anywhere]">{profile.bio}</p>}
            <div className="mt-3 flex gap-5 text-sm">
              <RouteLink to={{ name: "profile", handle: profile.isSelf ? null : profile.handle, tab: "following" }} className={`rounded hover:underline ${focusRing}`}><b>{formatCount(profile.following)}</b> <span className="text-white/60">Following</span></RouteLink>
              <RouteLink to={{ name: "profile", handle: profile.isSelf ? null : profile.handle, tab: "followers" }} className={`rounded hover:underline ${focusRing}`}><b>{formatCount(followers)}</b> <span className="text-white/60">Followers</span></RouteLink>
            </div>
          </>
        )}
      </section>

      <Tabs<ProfileTab> label="Profile sections" value={tab} onChange={(t) => go({ name: "profile", handle: profile.isSelf ? null : profile.handle, tab: t }, { replace: true })}
        items={[{ key: "posts", label: "Posts" }, { key: "followers", label: "Followers" }, { key: "following", label: "Following" }]} />

      <div role="tabpanel" aria-label={tab}>
        {lockedForViewer ? (
          <EmptyState icon="lock" title="This account is private" body={`Follow @${profile.handle} and wait for approval to see their posts, followers and following.`} />
        ) : tab === "posts" ? (
          <PostList list={posts} empty={<EmptyState icon="reply" title={profile.isSelf ? "You haven't posted yet" : "No posts yet"} body={profile.isSelf ? "Your posts will show up here." : `@${profile.handle} hasn't posted anything.`} />} />
        ) : (
          <UserList list={relations} empty={<EmptyState icon="user" title={tab === "followers" ? "No followers yet" : "Not following anyone yet"} />} />
        )}
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Settings                                                                    */
/* -------------------------------------------------------------------------- */

const SECTION_META: Record<SettingsSection, { icon: IconName; title: string; description: string; keywords: string }> = {
  account: { icon: "user", title: "Your account", description: "Profile details, display name, handle and bio.", keywords: "profile name username handle bio edit email" },
  security: { icon: "lock", title: "Security and account access", description: "Email verification and signing out.", keywords: "password session login sign out logout verification email" },
  privacy: { icon: "lock", title: "Privacy and safety", description: "Private account and who can reply.", keywords: "private protected reply replies followers requests approve" },
  notifications: { icon: "bell", title: "Notifications", description: "Choose which activity notifies you.", keywords: "likes reposts follows replies email alerts push" },
  accessibility: { icon: "settings", title: "Accessibility and display", description: "Text size, motion and data usage.", keywords: "font text size motion animation reduce data saver theme dark" },
  resources: { icon: "link", title: "Additional resources", description: "Download your data, policies and help.", keywords: "download export data policy terms privacy help guidelines" },
};

const SETTING_ROWS: Array<{ section: SettingsSection; label: string; keywords: string }> = [
  { section: "privacy", label: "Private account", keywords: "protect posts approve followers" },
  { section: "privacy", label: "Who can reply", keywords: "reply permission everyone following" },
  { section: "notifications", label: "Likes notifications", keywords: "like heart" },
  { section: "notifications", label: "Email notifications", keywords: "mail" },
  { section: "accessibility", label: "Font size", keywords: "text bigger smaller" },
  { section: "accessibility", label: "Reduce animations", keywords: "motion" },
  { section: "accessibility", label: "Data saver", keywords: "bandwidth network" },
  { section: "resources", label: "Download your data", keywords: "export json" },
  { section: "security", label: "Log out", keywords: "sign out session" },
];

function SettingsRow({ title, description, control, id }: { title: string; description?: string; control: ReactNode; id?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 px-4 py-4 sm:px-5">
      <div className="min-w-0">
        <div id={id} className="font-bold">{title}</div>
        {description && <p className="mt-1 text-sm leading-5 text-white/60">{description}</p>}
      </div>
      {control}
    </div>
  );
}

function Segmented<K extends string>({ value, onChange, options, label, disabled }: { value: K; onChange: (k: K) => void; options: Array<{ key: K; label: string }>; label: string; disabled?: boolean }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o.key} type="button" role="radio" aria-checked={value === o.key} disabled={disabled} onClick={() => value !== o.key && onChange(o.key)}
          className={`rounded-full px-4 py-2 text-sm font-bold transition disabled:opacity-50 ${focusRing} ${value === o.key ? "bg-white text-black" : "border border-white/25 text-white/80 hover:bg-white/10"}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function SettingsView({
  section, settings, settingsPending, saveSettings, onLogout,
}: {
  section: SettingsSection | "home"; settings: Settings | null; settingsPending: Record<string, true>;
  saveSettings: (key: string, patch: SettingsPatch, apply: (s: Settings) => Settings) => void; onLogout: () => void;
}) {
  const { me, setMe, go, back, toast } = useSocial();
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const filterId = useId();

  const goHomeSettings = () => (section === "home" ? back({ name: "home" }) : go({ name: "settings", section: "home" }));

  const matches = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return null;
    const hit = (text: string) => text.toLowerCase().includes(q);
    const sections = SETTINGS_SECTIONS.filter((s) => hit(`${SECTION_META[s].title} ${SECTION_META[s].description} ${SECTION_META[s].keywords}`));
    const rows = SETTING_ROWS.filter((r) => hit(`${r.label} ${r.keywords}`));
    return { sections, rows };
  }, [filter]);

  const exportData = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const r = await api.get<{ export: unknown }>({ action: "export" });
      const blob = new Blob([JSON.stringify(r.export, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "raaka-social-data.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast("Your data download has started", "success");
    } catch (e) {
      toast(toApiError(e).message, "error");
    } finally {
      setExporting(false);
    }
  };

  const loading = !settings;
  const s = settings;
  const busy = (k: string) => Boolean(settingsPending[k]);

  const body = (() => {
    if (section === "home") {
      return (
        <div className="p-4 sm:p-5">
          <label htmlFor={filterId} className="sr-only">Search settings</label>
          <div className="relative mb-5">
            <Icon name="search" size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
            <input id={filterId} type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search settings" className={`${inputCls} rounded-full pl-11`} />
          </div>
          {matches ? (
            matches.sections.length + matches.rows.length === 0 ? (
              <EmptyState icon="search" title={`No settings match “${filter.trim()}”`} />
            ) : (
              <ul className="space-y-1" aria-label="Matching settings">
                {matches.sections.map((k) => (
                  <li key={k}><RouteLink to={{ name: "settings", section: k }} className={`block rounded-2xl px-3 py-3 hover:bg-white/[.05] ${focusRing}`}><b>{SECTION_META[k].title}</b><span className="block text-sm text-white/60">{SECTION_META[k].description}</span></RouteLink></li>
                ))}
                {matches.rows.map((r) => (
                  <li key={r.label}><RouteLink to={{ name: "settings", section: r.section }} className={`block rounded-2xl px-3 py-3 hover:bg-white/[.05] ${focusRing}`}><b>{r.label}</b><span className="block text-sm text-white/60">in {SECTION_META[r.section].title}</span></RouteLink></li>
                ))}
              </ul>
            )
          ) : (
            <nav aria-label="Settings sections" className="space-y-1">
              {SETTINGS_SECTIONS.map((k) => (
                <RouteLink key={k} to={{ name: "settings", section: k }} className={`flex items-start gap-4 rounded-2xl px-3 py-4 transition hover:bg-white/[.05] active:bg-white/[.08] ${focusRing}`}>
                  <Icon name={SECTION_META[k].icon} size={24} className="mt-0.5 text-white/75" />
                  <span className="min-w-0 flex-1"><span className="block font-bold">{SECTION_META[k].title}</span><span className="mt-0.5 block text-sm leading-5 text-white/60">{SECTION_META[k].description}</span></span>
                  <Icon name="chevron" size={18} className="mt-1 text-white/40" />
                </RouteLink>
              ))}
            </nav>
          )}
        </div>
      );
    }

    if (section === "account") {
      return (
        <div className="space-y-4 p-4 sm:p-5">
          <div className="rounded-3xl border border-white/10 bg-white/[.03] p-5">
            <div className="flex items-center gap-3"><Avatar name={me.displayName} seed={me.visitorId} size={52} />
              <div className="min-w-0"><div className="truncate font-black">{me.displayName}</div><div className="truncate text-sm text-white/60">@{me.handle}</div></div></div>
            {me.bio && <p className="mt-3 text-sm text-white/70 [overflow-wrap:anywhere]">{me.bio}</p>}
            <p className="mt-3 text-sm text-emerald-300">Email verified</p>
            {editing ? (
              <EditProfileForm profile={me} onCancel={() => setEditing(false)} onSaved={(p) => { setMe((m) => ({ ...m, ...p, isSelf: true })); setEditing(false); }} />
            ) : (
              <button type="button" onClick={() => setEditing(true)} className={`${btnOutline} mt-4`}>Edit profile</button>
            )}
          </div>
          <p className="px-1 text-sm leading-6 text-white/55">Password changes and account deletion aren&apos;t available inside RAAKA Social yet.</p>
        </div>
      );
    }

    if (section === "security") {
      return (
        <div className="space-y-3 p-4 sm:p-5">
          <SettingsRow title="Email verification" description="Your email address is verified. Only verified accounts can use RAAKA Social." control={<span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">Verified</span>} />
          <SettingsRow title="Log out of this device" description="Ends your session on this browser and clears private data from the page." control={<button type="button" onClick={onLogout} className={btnOutline}><Icon name="logout" size={16} />Log out</button>} />
          <p className="px-1 pt-1 text-sm leading-6 text-white/55">Viewing or ending sessions on other devices isn&apos;t available yet.</p>
        </div>
      );
    }

    if (loading || !s) return <SkeletonList kind="user" count={4} />;

    if (section === "privacy") {
      return (
        <div className="space-y-3 p-4 sm:p-5">
          <SettingsRow id="set-private" title="Private account" description="Only approved followers can see your posts, followers and following. New followers must send a request. Existing followers stay." control={<Toggle label="Private account" checked={s.isPrivate} pending={busy("private")} onChange={(v) => saveSettings("private", { isPrivate: v }, (x) => ({ ...x, isPrivate: v }))} />} />
          <div className="rounded-2xl border border-white/10 px-4 py-4 sm:px-5">
            <div className="font-bold">Who can reply</div>
            <p className="mb-3 mt-1 text-sm text-white/60">Applies to all your posts and is enforced by the server.</p>
            <Segmented label="Who can reply" disabled={busy("reply")} value={s.replyPermission} onChange={(v) => saveSettings("reply", { replyPermission: v }, (x) => ({ ...x, replyPermission: v }))} options={[{ key: "everyone", label: "Everyone" }, { key: "following", label: "People you follow" }]} />
          </div>
          <p className="px-1 text-sm leading-6 text-white/55">Blocking, muting accounts, hidden words and report history aren&apos;t available yet.</p>
        </div>
      );
    }

    if (section === "notifications") {
      const n = s.notifications;
      const row = (key: keyof NotificationPrefs, title: string, desc: string) => (
        <SettingsRow key={key} title={title} description={desc} control={<Toggle label={title} checked={n[key]} disabled={key !== "enabled" && !n.enabled} pending={busy(`n-${key}`)} onChange={(v) => saveSettings(`n-${key}`, { notifications: { [key]: v } }, (x) => ({ ...x, notifications: { ...x.notifications, [key]: v } }))} />} />
      );
      return (
        <div className="space-y-3 p-4 sm:p-5">
          {row("enabled", "Activity notifications", "Turn all in-app notifications on or off.")}
          {row("likes", "Likes", "When someone likes your post.")}
          {row("replies", "Replies", "When someone replies to you.")}
          {row("reposts", "Reposts", "When someone reposts your post.")}
          {row("follows", "New followers", "When someone follows you.")}
          <SettingsRow title="Email notifications" description="Saved to your account and used whenever activity emails are sent." control={<Toggle label="Email notifications" checked={s.emailNotifications} pending={busy("email")} onChange={(v) => saveSettings("email", { emailNotifications: v }, (x) => ({ ...x, emailNotifications: v }))} />} />
        </div>
      );
    }

    if (section === "accessibility") {
      return (
        <div className="space-y-3 p-4 sm:p-5">
          <div className="rounded-2xl border border-white/10 px-4 py-4 sm:px-5">
            <div className="font-bold">Font size</div>
            <p className="mb-3 mt-1 text-sm text-white/60">Changes the size of all text across RAAKA Social.</p>
            <Segmented label="Font size" disabled={busy("font")} value={s.ui.fontSize} onChange={(v) => saveSettings("font", { ui: { fontSize: v } }, (x) => ({ ...x, ui: { ...x.ui, fontSize: v } }))} options={[{ key: "small", label: "Small" }, { key: "default", label: "Default" }, { key: "large", label: "Large" }]} />
          </div>
          <SettingsRow title="Reduce animations" description="Turns off motion effects. Your system's reduced-motion setting is always respected." control={<Toggle label="Reduce animations" checked={s.ui.reduceMotion} pending={busy("motion")} onChange={(v) => saveSettings("motion", { ui: { reduceMotion: v } }, (x) => ({ ...x, ui: { ...x.ui, reduceMotion: v } }))} />} />
          <SettingsRow title="Data saver" description="Smaller pages, no automatic infinite scroll, no live search, no background timers and no blur effects." control={<Toggle label="Data saver" checked={s.ui.dataSaver} pending={busy("saver")} onChange={(v) => saveSettings("saver", { ui: { dataSaver: v } }, (x) => ({ ...x, ui: { ...x.ui, dataSaver: v } }))} />} />
          <p className="px-1 text-sm text-white/55">RAAKA Social uses a dark theme only.</p>
        </div>
      );
    }

    const links = RESOURCE_LINKS.filter((l) => l.href);
    return (
      <div className="space-y-3 p-4 sm:p-5">
        <SettingsRow title="Download your data" description="Your profile, settings, 500 most recent posts and bookmarks as JSON." control={<button type="button" onClick={() => void exportData()} disabled={exporting} className={btnOutline}>{exporting && <Spinner />}Download</button>} />
        {links.map((l) => (
          <a key={l.title} href={l.href} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-between gap-4 rounded-2xl border border-white/10 px-4 py-4 transition hover:bg-white/[.04] sm:px-5 ${focusRing}`}>
            <span><span className="block font-bold">{l.title}</span><span className="block text-sm text-white/60">{l.description}</span></span>
            <Icon name="link" size={18} className="text-white/50" />
          </a>
        ))}
        {!links.length && <p className="px-1 text-sm leading-6 text-white/55">Policy and help pages haven&apos;t been published yet.</p>}
      </div>
    );
  })();

  return (
    <>
      <ViewHeader title={section === "home" ? "Settings" : SECTION_META[section].title} subtitle={`@${me.handle}`} onBack={goHomeSettings} />
      {body}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* App shell                                                                   */
/* -------------------------------------------------------------------------- */

function readStoredUi(): UiPrefs {
  try {
    const raw = localStorage.getItem(UI_STORAGE_KEY);
    if (!raw) return DEFAULT_UI;
    const v = JSON.parse(raw) as Partial<UiPrefs>;
    return {
      fontSize: v.fontSize === "small" || v.fontSize === "large" ? v.fontSize : "default",
      reduceMotion: v.reduceMotion === true,
      dataSaver: v.dataSaver === true,
    };
  } catch {
    return DEFAULT_UI;
  }
}

const STYLES = `
.raaka-social .glass{background:rgba(5,5,5,.97)}
@media (min-width:768px){.raaka-social[data-ds="0"] .glass{background:rgba(5,5,5,.82);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}}
.raaka-social[data-rm="1"] *,.raaka-social[data-rm="1"] *::before,.raaka-social[data-rm="1"] *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}
@media (prefers-reduced-motion:reduce){.raaka-social *,.raaka-social *::before,.raaka-social *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
`;

const FONT_PX: Record<FontSize, string> = { small: "14px", default: "", large: "18px" };

function SocialApp({ initialProfile, onLogout }: { initialProfile: Partial<Profile> & { visitorId: string }; onLogout: () => void }) {
  const [me, setMe] = useState<Profile>(() => normalizeProfile(initialProfile));
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.search));
  const [ui, setUi] = useState<UiPrefs>(readStoredUi);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [settingsPending, setSettingsPending] = useState<Record<string, true>>({});
  const [unread, setUnread] = useState(0);
  const [tab, setTab] = useState<"for-you" | "following">("for-you");
  const [followingVisited, setFollowingVisited] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [typing, setTyping] = useState(false);
  const [overlays, setOverlays] = useState<Record<number, PostOverlay>>({});
  const [follows, setFollows] = useState<Record<string, FollowState>>({});
  const [followerCounts, setFollowerCounts] = useState<Record<string, number>>({});
  const [deleted, setDeleted] = useState<ReadonlySet<number>>(new Set());
  const [pending, setPending] = useState<Record<string, true>>({});
  const [confirm, setConfirm] = useState<Post | null>(null);
  const [posting, setPosting] = useState(false);
  const draftKey = `${DRAFT_PREFIX}${initialProfile.visitorId}`;
  const [draft, setDraft] = useState(() => {
    try {
      return sessionStorage.getItem(draftKey) ?? "";
    } catch {
      return "";
    }
  });
  const { toasts, push: toast, dismiss } = useToasts();

  const overlaysRef = useRef(overlays);
  const followsRef = useRef(follows);
  const followerCountsRef = useRef(followerCounts);
  const settingsRef = useRef<Settings | null>(null);
  const pendingRef = useRef(new Set<string>());
  const settingsPendingRef = useRef(new Set<string>());
  const postingRef = useRef(false);
  const uiRef = useRef(ui);
  const followingStale = useRef(false);
  const lastUnreadCheck = useRef(Date.now());
  settingsRef.current = settings;
  uiRef.current = ui;
  useDirtyGuard("home-composer", draft.trim().length > 0);

  /* ----- navigation ----- */
  const go = useCallback((next: Route, opts?: { replace?: boolean }) => {
    const qs = routeQuery(next);
    const url = window.location.pathname + (qs ? `?${qs}` : "");
    const same = url === window.location.pathname + window.location.search;
    if (opts?.replace) window.history.replaceState(window.history.state, "", url);
    else if (!same) window.history.pushState({ raaka: true }, "", url);
    setRoute(next);
    setOpenMenuId(null);
    setDrawerOpen(false);
    if (!opts?.replace) window.scrollTo({ top: 0 });
  }, []);

  const replaceRoute = useCallback((next: Route) => {
    const qs = routeQuery(next);
    window.history.replaceState(window.history.state, "", window.location.pathname + (qs ? `?${qs}` : ""));
  }, []);

  const back = useCallback((fallback: Route) => {
    if (window.history.state?.raaka) window.history.back();
    else go(fallback);
  }, [go]);

  useEffect(() => {
    const onPop = () => {
      setRoute(parseRoute(window.location.search));
      setOpenMenuId(null);
      setDrawerOpen(false);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  /* ----- document meta ----- */
  useEffect(() => {
    const names: Record<Route["name"], string> = { home: "Home", explore: "Explore", profile: "Profile", thread: "Post", notifications: "Notifications", bookmarks: "Bookmarks", settings: "Settings" };
    const count = unread > 0 ? `(${unread > 99 ? "99+" : unread}) ` : "";
    document.title = `${count}${names[route.name]} / RAAKA Social`;
  }, [route, unread]);

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  /* ----- display preferences ----- */
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.fontSize;
    root.style.fontSize = FONT_PX[ui.fontSize];
    setTickerEnabled(!ui.dataSaver);
    try {
      localStorage.setItem(UI_STORAGE_KEY, JSON.stringify(ui));
    } catch {
      /* storage unavailable */
    }
    return () => {
      root.style.fontSize = previous;
    };
  }, [ui]);

  /* ----- unsaved-text guard, outside-click, keyboard-aware bottom nav ----- */
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirtyKeys.size) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest("[data-post-menu]")) setOpenMenuId(null);
    };
    const isField = (el: EventTarget | null) => el instanceof HTMLElement && /^(INPUT|TEXTAREA)$/.test(el.tagName);
    const onFocusIn = (e: FocusEvent) => isField(e.target) && setTyping(true);
    const onFocusOut = () => setTyping(false);
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        if (draft) sessionStorage.setItem(draftKey, draft);
        else sessionStorage.removeItem(draftKey);
      } catch {
        /* ignore */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [draft, draftKey]);

  /* ----- own profile / settings / unread (one request) ----- */
  const refreshMe = useCallback(async () => {
    try {
      const r = await api.get<ProfileResponse>({ action: "profile" });
      setMe(r.profile);
      if (r.settings) {
        setSettings(r.settings);
        setUi(r.settings.ui);
      }
      if (typeof r.unread === "number") setUnread(r.unread);
    } catch {
      /* non-critical: the cached profile stays on screen */
    }
  }, []);

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  useEffect(() => {
    if (ui.dataSaver) return;
    const check = async () => {
      if (document.visibilityState !== "visible" || Date.now() - lastUnreadCheck.current < 60_000) return;
      lastUnreadCheck.current = Date.now();
      try {
        const r = await api.get<{ unread: number }>({ action: "unread" });
        setUnread(r.unread);
      } catch {
        /* ignore */
      }
    };
    document.addEventListener("visibilitychange", check);
    return () => document.removeEventListener("visibilitychange", check);
  }, [ui.dataSaver]);

  const markNotificationsRead = useCallback(async () => {
    try {
      await api.post({ action: "notifications-read" });
      setUnread(0);
    } catch {
      /* will retry next visit */
    }
  }, []);

  /* ----- feeds (kept at app level so they stay cached across views) ----- */
  const forYou = usePaged<Post>({
    resetKey: "for-you",
    keyOf: postKey,
    load: async (cursor, signal) => {
      const r = await api.get<FeedResponse>({ action: "for-you", cursor: cursor ?? undefined, limit: pageSize(uiRef.current) }, signal);
      return { items: r.posts, nextCursor: r.nextCursor, hasMore: r.hasMore };
    },
  });
  const followingFeed = usePaged<Post>({
    enabled: followingVisited,
    resetKey: "following",
    keyOf: postKey,
    load: async (cursor, signal) => {
      const r = await api.get<FeedResponse>({ action: "following-feed", cursor: cursor ?? undefined, limit: pageSize(uiRef.current) }, signal);
      return { items: r.posts, nextCursor: r.nextCursor, hasMore: r.hasMore };
    },
  });

  const selectTab = useCallback((t: "for-you" | "following") => {
    setTab(t);
    if (t === "following") {
      setFollowingVisited(true);
      if (followingStale.current && followingVisited) {
        followingStale.current = false;
        followingFeed.refresh();
      }
    }
  }, [followingVisited, followingFeed]);

  /* ----- optimistic actions ----- */
  const patchOverlay = useCallback((id: number, patch: PostOverlay) => {
    overlaysRef.current = { ...overlaysRef.current, [id]: { ...overlaysRef.current[id], ...patch } };
    setOverlays(overlaysRef.current);
  }, []);

  const runPending = useCallback(async (key: string, fn: () => Promise<void>) => {
    if (pendingRef.current.has(key)) return;
    pendingRef.current.add(key);
    setPending((p) => ({ ...p, [key]: true }));
    try {
      await fn();
    } finally {
      pendingRef.current.delete(key);
      setPending((p) => {
        const next = { ...p };
        delete next[key];
        return next;
      });
    }
  }, []);

  const failToast = useCallback((e: unknown) => toast(toApiError(e).message, "error"), [toast]);
  const view = (t: Post) => ({ ...t, ...overlaysRef.current[t.id] });

  const toggleLike = useCallback((t: Post) => {
    void runPending(`like:${t.id}`, async () => {
      const base = view(t);
      const next = !base.liked;
      patchOverlay(t.id, { liked: next, likes: Math.max(0, base.likes + (next ? 1 : -1)) });
      try {
        const r = await api.post<{ liked: boolean; likes: number }>({ action: "like", postId: t.id, value: next });
        patchOverlay(t.id, { liked: r.liked, likes: r.likes });
      } catch (e) {
        patchOverlay(t.id, { liked: base.liked, likes: base.likes });
        failToast(e);
      }
    });
  }, [runPending, patchOverlay, failToast]);

  const toggleBookmark = useCallback((t: Post) => {
    void runPending(`bookmark:${t.id}`, async () => {
      const base = view(t);
      const next = !base.bookmarked;
      patchOverlay(t.id, { bookmarked: next });
      try {
        const r = await api.post<{ bookmarked: boolean }>({ action: "bookmark", postId: t.id, value: next });
        patchOverlay(t.id, { bookmarked: r.bookmarked });
        toast(r.bookmarked ? "Added to bookmarks" : "Removed from bookmarks", "success");
      } catch (e) {
        patchOverlay(t.id, { bookmarked: base.bookmarked });
        failToast(e);
      }
    });
  }, [runPending, patchOverlay, failToast, toast]);

  const toggleRepost = useCallback((t: Post) => {
    void runPending(`repost:${t.id}`, async () => {
      const base = view(t);
      const next = !base.reposted;
      patchOverlay(t.id, { reposted: next, reposts: Math.max(0, base.reposts + (next ? 1 : -1)) });
      try {
        const r = await api.post<{ reposted: boolean; reposts: number }>({ action: "repost", postId: t.id, value: next });
        patchOverlay(t.id, { reposted: r.reposted, reposts: r.reposts });
        if (r.reposted !== base.reposted) setMe((m) => ({ ...m, posts: Math.max(0, m.posts + (r.reposted ? 1 : -1)) }));
        toast(r.reposted ? "Reposted" : "Repost removed", "success");
      } catch (e) {
        patchOverlay(t.id, { reposted: base.reposted, reposts: base.reposts });
        failToast(e);
      }
    });
  }, [runPending, patchOverlay, failToast, toast]);

  const toggleFollow = useCallback((user: { visitorId: string; isPrivate?: boolean; followers?: number }, initial: FollowState) => {
    const id = user.visitorId;
    void runPending(`follow:${id}`, async () => {
      const base = followsRef.current[id] ?? initial;
      const want = !(base.following || base.requested);
      const optimistic: FollowState = want ? (user.isPrivate ? { following: false, requested: true } : { following: true, requested: false }) : { following: false, requested: false };
      const prevCount = followerCountsRef.current[id];
      const setFollow = (s: FollowState) => {
        followsRef.current = { ...followsRef.current, [id]: s };
        setFollows(followsRef.current);
      };
      const setCount = (n: number | undefined) => {
        const next = { ...followerCountsRef.current };
        if (n === undefined) delete next[id];
        else next[id] = n;
        followerCountsRef.current = next;
        setFollowerCounts(next);
      };
      const delta = optimistic.following === base.following ? 0 : optimistic.following ? 1 : -1;
      setFollow(optimistic);
      if (delta) {
        setMe((m) => ({ ...m, following: Math.max(0, m.following + delta) }));
        const known = prevCount ?? user.followers;
        if (known !== undefined) setCount(Math.max(0, known + delta));
      }
      try {
        const r = await api.post<{ following: boolean; requested: boolean; followers: number; myFollowing: number }>({ action: "follow", targetId: id, value: want });
        setFollow({ following: r.following, requested: r.requested });
        setCount(r.followers);
        setMe((m) => ({ ...m, following: r.myFollowing }));
        followingStale.current = true;
        if (r.requested) toast("Follow request sent", "success");
      } catch (e) {
        setFollow(base);
        setCount(prevCount);
        if (delta) setMe((m) => ({ ...m, following: Math.max(0, m.following - delta) }));
        failToast(e);
      }
    });
  }, [runPending, failToast, toast]);

  const bumpReplies = useCallback((postId: number, delta: number, base: number) => {
    const current = overlaysRef.current[postId]?.replies ?? base;
    patchOverlay(postId, { replies: Math.max(0, current + delta) });
  }, [patchOverlay]);

  const requestDelete = useCallback((p: Post) => setConfirm(p), []);

  const confirmDelete = useCallback(async () => {
    const post = confirm;
    setConfirm(null);
    if (!post) return;
    setDeleted((d) => new Set(d).add(post.id));
    try {
      await api.post({ action: "delete", postId: post.id });
      toast("Post deleted", "success");
      void refreshMe();
    } catch (e) {
      setDeleted((d) => {
        const next = new Set(d);
        next.delete(post.id);
        return next;
      });
      failToast(e);
    }
  }, [confirm, toast, failToast, refreshMe]);

  const sharePost = useCallback(async (p: Post) => {
    const url = `${window.location.origin}${window.location.pathname}?post=${p.id}`;
    try {
      if (navigator.share) await navigator.share({ title: "RAAKA Social", url });
      else {
        await navigator.clipboard.writeText(url);
        toast("Link copied", "success");
      }
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError")) toast("Couldn't copy the link", "error");
    }
  }, [toast]);

  const submitPost = useCallback(async () => {
    if (postingRef.current || !draft.trim()) return;
    postingRef.current = true;
    setPosting(true);
    try {
      const r = await api.post<CreatePostResponse>({ action: "post", text: draft });
      setDraft("");
      forYou.prepend(r.post);
      setMe((m) => ({ ...m, posts: m.posts + 1 }));
      setTab("for-you");
      toast("Posted", "success");
    } catch (e) {
      failToast(e);
    } finally {
      postingRef.current = false;
      setPosting(false);
    }
  }, [draft, forYou, toast, failToast]);

  const saveSettings = useCallback(async (key: string, patch: SettingsPatch, apply: (s: Settings) => Settings) => {
    const prev = settingsRef.current;
    if (!prev || settingsPendingRef.current.has(key)) return;
    settingsPendingRef.current.add(key);
    setSettingsPending((p) => ({ ...p, [key]: true }));
    const optimistic = apply(prev);
    setSettings(optimistic);
    if (patch.ui) setUi(optimistic.ui);
    try {
      const r = await api.post<{ settings: Settings }>({ action: "settings", ...patch });
      setSettings(r.settings);
      setUi(r.settings.ui);
      setMe((m) => ({ ...m, isPrivate: r.settings.isPrivate }));
    } catch (e) {
      setSettings(prev);
      setUi(prev.ui);
      failToast(e);
    } finally {
      settingsPendingRef.current.delete(key);
      setSettingsPending((p) => {
        const next = { ...p };
        delete next[key];
        return next;
      });
    }
  }, [failToast]);

  const ctx: SocialContextValue = {
    me, setMe, ui, overlays, follows, followerCounts, deleted, pending, openMenuId, setOpenMenuId, go, replaceRoute, back, toast,
    toggleLike, toggleBookmark, toggleRepost, toggleFollow, requestDelete, sharePost: (p) => void sharePost(p),
    bumpReplies, refreshMe, markNotificationsRead,
  };

  /* ----- layout ----- */
  const navItems: Array<{ key: string; label: string; icon: IconName; to: Route; active: boolean; badge?: number }> = [
    { key: "home", label: "Home", icon: "home", to: { name: "home" }, active: route.name === "home" || route.name === "thread" },
    { key: "explore", label: "Explore", icon: "search", to: { name: "explore", q: "", tab: "people" }, active: route.name === "explore" },
    { key: "notifications", label: "Notifications", icon: "bell", to: { name: "notifications" }, active: route.name === "notifications", badge: unread },
    { key: "bookmarks", label: "Bookmarks", icon: "bookmark", to: { name: "bookmarks" }, active: route.name === "bookmarks" },
    { key: "profile", label: "Profile", icon: "user", to: { name: "profile", handle: null, tab: "posts" }, active: route.name === "profile" && (!route.handle || route.handle === me.handle.toLowerCase()) },
    { key: "settings", label: "Settings", icon: "settings", to: { name: "settings", section: "home" }, active: route.name === "settings" },
  ];

  const badgeLabel = (n?: number) => (n ? (n > 99 ? "99+" : String(n)) : "");
  const navLabel = (i: (typeof navItems)[number]) => (i.badge ? `${i.label}, ${i.badge} unread` : i.label);

  const content = (() => {
    switch (route.name) {
      case "home":
        return <HomeView tab={tab} setTab={selectTab} forYou={forYou} followingFeed={followingFeed} draft={draft} setDraft={setDraft} posting={posting} submitPost={() => void submitPost()} openDrawer={() => setDrawerOpen(true)} />;
      case "thread":
        return <ThreadView key={route.postId} postId={route.postId} focusReply={route.reply} />;
      case "explore":
        return <ExploreView key="explore" initialQuery={route.q} initialTab={route.tab} />;
      case "notifications":
        return <NotificationsView />;
      case "bookmarks":
        return <BookmarksView />;
      case "profile":
        return <ProfileView key={route.handle ?? "me"} handle={route.handle} tab={route.tab} />;
      case "settings":
        return <SettingsView section={route.section} settings={settings} settingsPending={settingsPending} saveSettings={(k, p, a) => void saveSettings(k, p, a)} onLogout={onLogout} />;
    }
  })();

  const [sideQuery, setSideQuery] = useState("");

  return (
    <SocialContext.Provider value={ctx}>
      <div className="raaka-social min-h-screen overflow-x-clip bg-[#050505] text-white antialiased" data-rm={ui.reduceMotion ? "1" : "0"} data-ds={ui.dataSaver ? "1" : "0"}>
        <style>{STYLES}</style>
        <a href="#social-main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-black">Skip to content</a>

        <div className="mx-auto flex w-full max-w-[1180px]">
          {/* tablet + desktop navigation */}
          <header className="sticky top-0 hidden h-screen w-[72px] shrink-0 flex-col justify-between overflow-y-auto px-2 py-4 md:flex lg:w-[245px] lg:px-4 lg:py-6">
            <nav aria-label="Main">
              <RouteLink to={{ name: "home" }} aria-label="RAAKA Social home" className={`mb-5 flex h-12 items-center justify-center rounded-2xl text-xl font-black tracking-tight lg:justify-start lg:px-3 lg:text-2xl ${focusRing}`}>
                <span className="lg:hidden">R<span className="text-red-500">S</span></span>
                <span className="hidden lg:inline">RAAKA<span className="text-red-500"> Social</span></span>
              </RouteLink>
              <ul className="space-y-1">
                {navItems.map((i) => (
                  <li key={i.key}>
                    <RouteLink to={i.to} aria-label={navLabel(i)} aria-current={i.active ? "page" : undefined}
                      className={`relative flex h-12 items-center justify-center gap-4 rounded-2xl transition hover:bg-white/[.07] active:bg-white/10 lg:justify-start lg:px-4 ${focusRing} ${i.active ? "bg-white/10 font-black text-white" : "font-semibold text-white/75"}`}>
                      <Icon name={i.icon} size={24} filled={false} />
                      <span className="hidden text-[1.0625rem] lg:inline">{i.label}</span>
                      {!!i.badge && <span className="absolute left-7 top-1.5 min-w-[1.25rem] rounded-full bg-red-500 px-1 text-center text-[0.6875rem] font-black leading-5 text-white lg:left-auto lg:right-4 lg:top-3.5">{badgeLabel(i.badge)}</span>}
                    </RouteLink>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="space-y-2">
              <RouteLink to={{ name: "profile", handle: null, tab: "posts" }} aria-label="Your profile" className={`flex items-center justify-center gap-3 rounded-2xl p-2 transition hover:bg-white/[.07] lg:justify-start ${focusRing}`}>
                <Avatar name={me.displayName} seed={me.visitorId} size={40} />
                <span className="hidden min-w-0 lg:block"><span className="flex items-center gap-1 truncate text-sm font-bold"><span className="truncate">{me.displayName}</span><VerificationBadge type={me.verificationType} label={me.verificationLabel} /></span><span className="block truncate text-xs text-white/55">@{me.handle}</span></span>
              </RouteLink>
              <button type="button" onClick={onLogout} aria-label="Log out" className={`flex h-11 w-full items-center justify-center gap-3 rounded-2xl text-sm font-bold text-white/60 transition hover:bg-red-500/10 hover:text-red-300 lg:justify-start lg:px-4 ${focusRing}`}>
                <Icon name="logout" size={20} /><span className="hidden lg:inline">Log out</span>
              </button>
            </div>
          </header>

          <main id="social-main" tabIndex={-1} className={`min-h-screen w-full min-w-0 flex-1 border-white/10 pb-24 focus:outline-none md:max-w-[600px] md:border-x md:pb-0`}>
            {content}
          </main>

          {/* desktop right rail */}
          <aside aria-label="Search and information" className="sticky top-0 hidden h-screen w-[300px] shrink-0 space-y-4 overflow-y-auto px-5 py-4 xl:block">
            <form role="search" onSubmit={(e) => { e.preventDefault(); if (sideQuery.trim()) go({ name: "explore", q: sideQuery.trim(), tab: "people" }); }}>
              <label htmlFor="social-search" className="sr-only">Search RAAKA Social</label>
              <div className="relative">
                <Icon name="search" size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                <input id="social-search" type="search" value={sideQuery} onChange={(e) => setSideQuery(e.target.value)} placeholder="Search RAAKA Social" maxLength={50} autoComplete="off" className={`${inputCls} rounded-full pl-11`} />
              </div>
            </form>
            <section className="rounded-3xl border border-white/10 bg-white/[.03] p-5">
              <h2 className="text-xs font-bold uppercase tracking-[.2em] text-red-400">RAAKA Social</h2>
              <p className="mt-3 text-lg font-bold">Talk. Follow. React.</p>
              <p className="mt-2 text-sm leading-6 text-white/60">A lightweight text-only community for RAAKA fans. No photo or video uploads.</p>
            </section>
            <section className="rounded-3xl border border-white/10 bg-white/[.03] p-5 text-sm text-white/65">
              <p><b className="text-white">{formatCount(me.followers)}</b> followers · <b className="text-white">{formatCount(me.following)}</b> following</p>
            </section>
          </aside>
        </div>

        {/* mobile bottom navigation (hidden while the keyboard is up) */}
        {!typing && (
          <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#050505] pb-[env(safe-area-inset-bottom)] md:hidden">
            <ul className="mx-auto grid max-w-md grid-cols-5">
              {[navItems[0], navItems[1], navItems[2], navItems[4]].map((i) => (
                <li key={i.key}>
                  <RouteLink to={i.to} aria-label={navLabel(i)} aria-current={i.active ? "page" : undefined} className={`relative flex h-14 items-center justify-center transition active:bg-white/10 ${focusRing} focus-visible:ring-inset ${i.active ? "text-white" : "text-white/60"}`}>
                    <Icon name={i.icon} size={25} />
                    {!!i.badge && <span className="absolute right-[28%] top-2 min-w-[1.1rem] rounded-full bg-red-500 px-1 text-center text-[0.625rem] font-black leading-[1.1rem]">{badgeLabel(i.badge)}</span>}
                  </RouteLink>
                </li>
              ))}
              <li>
                <button type="button" onClick={() => setDrawerOpen(true)} aria-label="Open menu" className={`flex h-14 w-full items-center justify-center text-white/60 transition active:bg-white/10 ${focusRing} focus-visible:ring-inset`}>
                  <Icon name="menu" size={25} />
                </button>
              </li>
            </ul>
          </nav>
        )}

        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} navItems={navItems} onLogout={() => { setDrawerOpen(false); onLogout(); }} />

        <ConfirmDialog open={Boolean(confirm)} title="Delete this post?" body="This can't be undone. Replies and reposts of this post will be removed too." confirmLabel="Delete" onConfirm={() => void confirmDelete()} onCancel={() => setConfirm(null)} />

        <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-[120] flex flex-col items-center gap-2 px-4 md:bottom-6">
          {toasts.map((t) => (
            <div key={t.id} role={t.kind === "error" ? "alert" : "status"} className={`pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-xl ${t.kind === "error" ? "border-red-500/40 bg-[#2a0d0d] text-red-100" : t.kind === "success" ? "border-emerald-500/30 bg-[#0c1f17] text-emerald-100" : "border-white/15 bg-[#161616] text-white"}`}>
              <span className="min-w-0 [overflow-wrap:anywhere]">{t.text}</span>
              <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss message" className={`shrink-0 rounded-full p-1 text-white/70 hover:bg-white/10 ${focusRing}`}><Icon name="close" size={14} /></button>
            </div>
          ))}
        </div>
      </div>
    </SocialContext.Provider>
  );
}

function Drawer({ open, onClose, navItems, onLogout }: { open: boolean; onClose: () => void; navItems: Array<{ key: string; label: string; icon: IconName; to: Route; badge?: number }>; onLogout: () => void }) {
  const { me } = useSocial();
  const ref = useFocusTrap<HTMLElement>(open, onClose);
  if (!open) return null;
  const items = navItems.filter((i) => ["profile", "bookmarks", "notifications"].includes(i.key));
  return (
    <div className="fixed inset-0 z-[100] md:hidden">
      <button type="button" aria-label="Close menu" tabIndex={-1} onClick={onClose} className="absolute inset-0 cursor-default bg-black/70" />
      <aside ref={ref} role="dialog" aria-modal="true" aria-label="Menu" className="relative flex h-full w-[min(86vw,330px)] flex-col overflow-y-auto border-r border-white/10 bg-[#050505] px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-5">
          <RouteLink to={{ name: "profile", handle: null, tab: "posts" }} className={`min-w-0 flex-1 rounded-xl ${focusRing}`}>
            <Avatar name={me.displayName} seed={me.visitorId} size={52} />
            <span className="mt-3 flex items-center gap-1.5 text-lg font-black"><span className="truncate">{me.displayName}</span><VerificationBadge type={me.verificationType} label={me.verificationLabel} /></span>
            <span className="block truncate text-sm text-white/55">@{me.handle}</span>
            <span className="mt-3 flex gap-4 text-sm"><span><b>{formatCount(me.following)}</b> <span className="text-white/60">Following</span></span><span><b>{formatCount(me.followers)}</b> <span className="text-white/60">Followers</span></span></span>
          </RouteLink>
          <button type="button" onClick={onClose} aria-label="Close menu" className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 hover:bg-white/10 ${focusRing}`}><Icon name="close" size={18} /></button>
        </div>
        <nav aria-label="Menu" className="mt-3 space-y-1">
          {items.map((i) => (
            <RouteLink key={i.key} to={i.to} className={`flex min-h-[3rem] items-center gap-4 rounded-2xl px-2 text-[1.0625rem] font-bold transition hover:bg-white/[.06] active:bg-white/10 ${focusRing}`}>
              <Icon name={i.icon} size={25} /><span>{i.label}</span>
              {!!i.badge && <span className="ml-auto rounded-full bg-red-500 px-2 text-xs font-black leading-5">{i.badge > 99 ? "99+" : i.badge}</span>}
            </RouteLink>
          ))}
          <div className="my-3 border-t border-white/10" />
          <RouteLink to={{ name: "settings", section: "home" }} className={`flex min-h-[3rem] items-center gap-4 rounded-2xl px-2 text-[1.0625rem] font-bold transition hover:bg-white/[.06] ${focusRing}`}><Icon name="settings" size={25} /><span>Settings &amp; Privacy</span></RouteLink>
          <RouteLink to={{ name: "settings", section: "accessibility" }} className={`flex min-h-[3rem] items-center gap-4 rounded-2xl px-2 text-[1.0625rem] font-bold transition hover:bg-white/[.06] ${focusRing}`}><Icon name="settings" size={25} /><span>Display &amp; accessibility</span></RouteLink>
          <div className="my-3 border-t border-white/10" />
          <button type="button" onClick={onLogout} className={`flex min-h-[3rem] w-full items-center gap-4 rounded-2xl px-2 text-left text-[1.0625rem] font-bold text-red-300 transition hover:bg-red-500/10 ${focusRing}`}><Icon name="logout" size={25} /><span>Log out</span></button>
        </nav>
      </aside>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Auth wrapper (default export)                                               */
/* -------------------------------------------------------------------------- */

type AuthState =
  | { status: "checking" }
  | { status: "anonymous" }
  | { status: "unverified" }
  | { status: "error" }
  | { status: "authenticated"; profile: Partial<Profile> & { visitorId: string } };

function Shell({ children }: { children: ReactNode }) {
  return <main className="flex min-h-screen items-center justify-center bg-[#050505] px-5 text-white">{children}</main>;
}

export default function RaakaSocialPage() {
  const [auth, setAuth] = useState<AuthState>({ status: "checking" });
  const [session, setSession] = useState(0);

  const check = useCallback(async (signal?: AbortSignal) => {
    setAuth({ status: "checking" });
    try {
      const response = await fetch("/api/social-auth/me", { cache: "no-store", credentials: "same-origin", signal });
      let data: { success?: boolean; authenticated?: boolean; verified?: boolean; profile?: (Partial<Profile> & { visitorId?: string }) | null } | null = null;
      if ((response.headers.get("content-type") || "").includes("application/json")) {
        data = await response.json().catch(() => null);
      }
      if (signal?.aborted) return;
      if (response.status >= 500 || (!data && response.status !== 401)) return setAuth({ status: "error" });
      if (data?.success && data.authenticated && !data.verified) return setAuth({ status: "unverified" });
      if (response.ok && data?.success && data.authenticated && data.verified && data.profile?.visitorId) {
        return setAuth({ status: "authenticated", profile: { ...data.profile, visitorId: data.profile.visitorId } });
      }
      setAuth({ status: "anonymous" });
    } catch (e) {
      if (!isAbort(e)) setAuth({ status: "error" });
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void check(controller.signal);
    return () => controller.abort();
  }, [check]);

  useEffect(() => {
    onUnauthorized = () => setAuth({ status: "anonymous" });
    return () => {
      onUnauthorized = null;
    };
  }, []);

  useEffect(() => {
    if (auth.status === "authenticated") return;
    document.title = "RAAKA Social";
  }, [auth.status]);

  const logout = useCallback(async () => {
    dirtyKeys.clear();
    try {
      await fetch("/api/social-auth/logout", { method: "POST", credentials: "same-origin" });
    } catch {
      /* the local session is cleared regardless */
    }
    try {
      Object.keys(sessionStorage).filter((k) => k.startsWith(DRAFT_PREFIX)).forEach((k) => sessionStorage.removeItem(k));
    } catch {
      /* ignore */
    }
    window.history.replaceState(null, "", window.location.pathname);
    setSession((s) => s + 1); // remounts SocialApp => all private state discarded
    setAuth({ status: "anonymous" });
  }, []);

  if (auth.status === "checking") {
    return (
      <Shell>
        <div role="status" className="w-full max-w-md space-y-4" aria-label="Checking your RAAKA Social account">
          <div className="mx-auto h-4 w-40 animate-pulse rounded bg-white/10" />
          <div className="h-48 animate-pulse rounded-3xl bg-white/[.05]" />
          <span className="sr-only">Checking your account…</span>
        </div>
      </Shell>
    );
  }

  if (auth.status === "error") {
    return (
      <Shell>
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[.03] p-8 text-center">
          <h1 className="text-2xl font-black">Can&apos;t reach RAAKA Social</h1>
          <p className="mt-3 text-sm leading-6 text-white/60">Check your connection and try again.</p>
          <button type="button" onClick={() => void check()} className={`${btnPrimary} mt-6`}>Try again</button>
        </div>
      </Shell>
    );
  }

  if (auth.status === "unverified") {
    return (
      <Shell>
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[.03] p-8 text-center">
          <h1 className="text-2xl font-black">Verify your email</h1>
          <p className="mt-3 text-sm leading-6 text-white/60">Your account exists but your email isn&apos;t verified yet. Open the link we emailed you to continue.</p>
          <div className="mt-6 space-y-3">
            <a href="/social/resend" className={`${btnPrimary} w-full`}>Resend verification email</a>
            <button type="button" onClick={() => void logout()} className={`${btnOutline} w-full`}>Log out</button>
          </div>
        </div>
      </Shell>
    );
  }

  if (auth.status === "anonymous") {
    return (
      <Shell>
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[.03] p-8 text-center">
          <div className="text-xs font-bold uppercase tracking-[.4em] text-red-400">WORLD OF RAAKA</div>
          <h1 className="mt-5 text-4xl font-black">RAAKA Social</h1>
          <p className="mt-4 text-sm leading-6 text-white/60">Log in with your verified RAAKA Social account to join the community.</p>
          <div className="mt-7 space-y-3">
            <a href="/social/login" className={`${btnPrimary} w-full !py-3`}>Log in</a>
            <a href="/social/signup" className={`${btnOutline} w-full !py-3`}>Create account</a>
            <a href="/social/resend" className="block rounded-xl px-4 py-2 text-xs text-white/60 underline-offset-2 hover:text-white hover:underline">Resend verification email</a>
          </div>
        </div>
      </Shell>
    );
  }

  return <SocialApp key={session} initialProfile={auth.profile} onLogout={() => void logout()} />;
}
