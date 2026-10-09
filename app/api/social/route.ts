import { getD1 } from "@/lib/d1";
import { getCurrentUser } from "@/lib/social-auth";

export const dynamic = "force-dynamic";

/*
 * REQUIRES MIGRATION: migrations/social_hardening.sql (shipped with this file).
 * It adds profile settings columns, notification read watermark,
 * social_follow_requests, UNIQUE indexes and the performance indexes.
 * Run it BEFORE deploying this route.
 */

/* -------------------------------------------------------------------------- */
/* Constants                                                                   */
/* -------------------------------------------------------------------------- */

const MAX_POST = 280;
const MAX_BIO = 160;
const MAX_NAME = 40;
const DEFAULT_PAGE = 20;
const MIN_PAGE = 5;
const MAX_PAGE = 30;
const MAX_BODY_BYTES = 8 * 1024;
const SEARCH_WINDOW = 2000; // newest N post ids scanned by post search
const DUPLICATE_WINDOW_SECONDS = 10;

const RESERVED_HANDLES = new Set([
  "admin",
  "administrator",
  "raaka",
  "support",
  "help",
  "moderator",
  "mod",
  "staff",
  "official",
  "system",
  "root",
  "null",
  "undefined",
  "social",
]);

type Row = Record<string, unknown>;

/* -------------------------------------------------------------------------- */
/* Small helpers                                                               */
/* -------------------------------------------------------------------------- */

const str = (v: unknown): string =>
  typeof v === "string" ? v : v == null ? "" : String(v);

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const flag = (v: unknown): boolean => num(v) === 1;

const charLength = (s: string) => Array.from(s).length;

function toIso(value: unknown): string {
  const s = str(value);
  if (!s) return new Date(0).toISOString();
  if (s.includes("T")) return s.endsWith("Z") ? s : `${s}Z`;
  return `${s.replace(" ", "T")}Z`;
}

function json(body: unknown, status = 200, headers?: HeadersInit) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

function fail(status: number, error: string, headers?: HeadersInit) {
  return json({ success: false, error }, status, headers);
}

function asId(value: unknown): number | null {
  const n =
    typeof value === "number"
      ? value
      : typeof value === "string" && /^\d{1,15}$/.test(value)
        ? Number(value)
        : NaN;
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

function asVisitorId(value: unknown): string | null {
  return typeof value === "string" && /^[\w:.@-]{1,128}$/.test(value)
    ? value
    : null;
}

function asBool(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

/** Removes control / bidi-spoofing characters and normalises newlines. */
function cleanText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value
    .replace(/\r\n?/g, "\n")
    .replace(
      /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g,
      ""
    )
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

function cleanHandle(value: unknown) {
  return str(value)
    .trim()
    .replace(/^@+/, "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 20);
}

function cleanName(value: unknown) {
  return (cleanText(str(value)) ?? "").replace(/\s+/g, " ").slice(0, MAX_NAME);
}

function clampLimit(raw: string | null) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_PAGE;
  return Math.min(MAX_PAGE, Math.max(MIN_PAGE, Math.floor(n)));
}

function parseCursorId(raw: string | null): number {
  return asId(raw) ?? 0;
}

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

function normalizeQuery(raw: string | null) {
  return (raw ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 50);
}

function parseRankCursor(raw: string | null): { key: number; id: string } | null {
  if (!raw) return null;
  const i = raw.indexOf(":");
  if (i < 1) return null;
  const key = Number(raw.slice(0, i));
  const id = raw.slice(i + 1);
  return Number.isFinite(key) && id ? { key, id } : null;
}

/* -------------------------------------------------------------------------- */
/* Rate limiting (best-effort, per isolate) + CSRF / payload guards             */
/* -------------------------------------------------------------------------- */

const buckets = new Map<string, { count: number; resetAt: number }>();

// [max requests, window seconds]
const LIMITS: Record<string, [number, number]> = {
  post: [10, 60],
  reply: [20, 60],
  like: [60, 60],
  bookmark: [60, 60],
  follow: [30, 60],
  "follow-request": [60, 60],
  repost: [20, 60],
  delete: [30, 60],
  profile: [10, 600],
  settings: [40, 60],
  "notifications-read": [30, 60],
  search: [30, 60],
  export: [3, 3600],
  read: [180, 60],
};

function rateLimit(identity: string, group: string): Response | null {
  const [max, windowSeconds] = LIMITS[group] ?? LIMITS.read;
  const now = Date.now();
  const key = `${group}:${identity}`;
  const current = buckets.get(key);

  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
  }

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return null;
  }

  current.count += 1;
  if (current.count > max) {
    const retry = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    return fail(429, "You're doing that too fast. Please wait a moment.", {
      "Retry-After": String(retry),
    });
  }
  return null;
}

function clientIp(request: Request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "anon"
  );
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) {
    const site = request.headers.get("sec-fetch-site");
    return !site || site === "same-origin" || site === "none";
  }
  try {
    const host = new URL(origin).host;
    return (
      host === new URL(request.url).host ||
      host === request.headers.get("host")
    );
  } catch {
    return false;
  }
}

async function readJsonBody(
  request: Request
): Promise<{ body: Row } | { response: Response }> {
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > MAX_BODY_BYTES) return { response: fail(413, "Request too large.") };

  let text = "";
  try {
    text = await request.text();
  } catch {
    return { response: fail(400, "Invalid request.") };
  }
  if (text.length > MAX_BODY_BYTES) return { response: fail(413, "Request too large.") };

  try {
    const parsed: unknown = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { response: fail(400, "Invalid request.") };
    }
    return { body: parsed as Row };
  } catch {
    return { response: fail(400, "Invalid request.") };
  }
}

/* -------------------------------------------------------------------------- */
/* Shapes                                                                      */
/* -------------------------------------------------------------------------- */

type VerificationType = "blue" | "gold" | "grey" | "none";

function verificationData(row: Row) {
  const t = row.verification_type;
  const type: VerificationType =
    t === "blue" || t === "gold" || t === "grey" ? t : "none";
  return {
    verified: type !== "none" || flag(row.verified),
    verificationType: type,
    verificationLabel: row.verification_label ? str(row.verification_label) : null,
  };
}

interface UiPrefs {
  fontSize: "small" | "default" | "large";
  reduceMotion: boolean;
  dataSaver: boolean;
}

function parseUiPrefs(raw: unknown): UiPrefs {
  const base: UiPrefs = { fontSize: "default", reduceMotion: false, dataSaver: false };
  if (typeof raw !== "string" || !raw) return base;
  try {
    const v = JSON.parse(raw) as Partial<UiPrefs>;
    return {
      fontSize:
        v.fontSize === "small" || v.fontSize === "large" ? v.fontSize : "default",
      reduceMotion: v.reduceMotion === true,
      dataSaver: v.dataSaver === true,
    };
  } catch {
    return base;
  }
}

function settingsShape(row: Row) {
  return {
    isPrivate: flag(row.is_private),
    replyPermission: row.reply_permission === "following" ? "following" : "everyone",
    notifications: {
      enabled: row.notify_enabled == null ? true : flag(row.notify_enabled),
      likes: row.notify_likes == null ? true : flag(row.notify_likes),
      replies: row.notify_replies == null ? true : flag(row.notify_replies),
      reposts: row.notify_reposts == null ? true : flag(row.notify_reposts),
      follows: row.notify_follows == null ? true : flag(row.notify_follows),
    },
    emailNotifications: flag(row.email_notifications),
    ui: parseUiPrefs(row.ui_prefs),
  };
}

function profileShape(row: Row, viewerId: string) {
  const isSelf = row.visitor_id === viewerId;
  const isPrivate = flag(row.is_private);
  const isFollowing = flag(row.is_following);
  return {
    visitorId: str(row.visitor_id),
    handle: str(row.handle),
    displayName: str(row.display_name),
    bio: str(row.bio),
    followers: Math.max(0, num(row.followers_count)),
    following: Math.max(0, num(row.following_count)),
    posts: Math.max(0, num(row.posts_count)),
    ...verificationData(row),
    isPrivate,
    isSelf,
    isFollowing,
    isRequested: flag(row.is_requested),
    canView: !isPrivate || isSelf || isFollowing,
  };
}

interface PostShape {
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
  author: {
    visitorId: string;
    handle: string;
    displayName: string;
    verified: boolean;
    verificationType: VerificationType;
    verificationLabel: string | null;
  };
  replyToId: number | null;
  repostOfId: number | null;
  original: PostShape | null;
  parent: { id: number; handle: string; displayName: string } | null;
}

function postShape(row: Row): PostShape {
  return {
    id: num(row.id),
    body: str(row.body),
    createdAt: toIso(row.created_at),
    likes: Math.max(0, num(row.likes_count)),
    replies: Math.max(0, num(row.replies_count)),
    reposts: Math.max(0, num(row.reposts_count)),
    liked: flag(row.liked),
    bookmarked: flag(row.bookmarked),
    reposted: flag(row.reposted),
    following: flag(row.following),
    canReply: flag(row.can_reply),
    author: {
      visitorId: str(row.visitor_id),
      handle: str(row.handle),
      displayName: str(row.display_name),
      ...verificationData(row),
    },
    replyToId: num(row.reply_to_id) || null,
    repostOfId: num(row.repost_of_id) || null,
    original: null,
    parent: null,
  };
}

/* -------------------------------------------------------------------------- */
/* SQL building blocks (?1 is ALWAYS the viewer id, '' for anonymous)           */
/* -------------------------------------------------------------------------- */

const PROFILE_COLS = `p.visitor_id, p.handle, p.display_name, p.bio, p.followers_count,
  p.following_count, p.posts_count, p.verified, p.verification_type,
  p.verification_label, p.is_private`;

const SELF_COLS = `p.reply_permission, p.notify_enabled, p.notify_likes, p.notify_replies,
  p.notify_reposts, p.notify_follows, p.email_notifications, p.ui_prefs,
  p.notifications_seen_id`;

const POST_COLS = `s.id, s.visitor_id, s.body, s.created_at, s.likes_count, s.replies_count,
  s.reposts_count, s.reply_to_id, s.repost_of_id,
  p.handle, p.display_name, p.verified, p.verification_type, p.verification_label,
  CASE WHEN l.visitor_id IS NULL THEN 0 ELSE 1 END AS liked,
  CASE WHEN b.visitor_id IS NULL THEN 0 ELSE 1 END AS bookmarked,
  CASE WHEN fv.follower_id IS NULL THEN 0 ELSE 1 END AS following,
  CASE WHEN s.visitor_id = ?1 OR p.reply_permission = 'everyone'
            OR rf.follower_id IS NOT NULL THEN 1 ELSE 0 END AS can_reply,
  CASE WHEN EXISTS (
         SELECT 1 FROM social_posts rp
         WHERE rp.visitor_id = ?1 AND rp.repost_of_id = s.id
       ) THEN 1 ELSE 0 END AS reposted`;

const BASE_JOINS = `
  JOIN social_profiles p ON p.visitor_id = s.visitor_id
  LEFT JOIN social_follows fv ON fv.following_id = s.visitor_id AND fv.follower_id = ?1
  LEFT JOIN social_follows rf ON rf.follower_id = s.visitor_id AND rf.following_id = ?1`;

const VIEWER_JOINS = `
  LEFT JOIN social_likes l ON l.post_id = s.id AND l.visitor_id = ?1
  LEFT JOIN social_bookmarks b ON b.post_id = s.id AND b.visitor_id = ?1`;

const POST_FROM = `FROM social_posts s ${BASE_JOINS} ${VIEWER_JOINS}`;

// Private-account rule, enforced for every read path.
const VISIBLE = `(p.is_private = 0 OR s.visitor_id = ?1 OR fv.follower_id IS NOT NULL)`;

/* -------------------------------------------------------------------------- */
/* Profiles                                                                    */
/* -------------------------------------------------------------------------- */

const knownProfiles = new Set<string>();

async function ensureProfile(
  db: D1Database,
  visitorId: string,
  displayName: unknown = "RAAKA Fan",
  handle: unknown = ""
) {
  if (knownProfiles.has(visitorId)) return;

  const existing = await db
    .prepare("SELECT visitor_id FROM social_profiles WHERE visitor_id = ?1 LIMIT 1")
    .bind(visitorId)
    .first();

  if (existing) {
    if (knownProfiles.size > 5000) knownProfiles.clear();
    knownProfiles.add(visitorId);
    return;
  }

  const fallback = `fan_${visitorId.replace(/[^a-z0-9]/gi, "").toLowerCase().slice(0, 8)}`;
  let base = cleanHandle(handle) || cleanHandle(displayName) || fallback;
  if (!/^[a-z0-9_]{3,20}$/.test(base) || RESERVED_HANDLES.has(base)) base = fallback;

  for (let i = 0; i < 20; i++) {
    const candidate =
      i === 0 ? base : `${base.slice(0, 16)}_${Math.floor(Math.random() * 900 + 100)}`;
    try {
      await db
        .prepare(
          `INSERT INTO social_profiles (visitor_id, handle, display_name)
           VALUES (?1, ?2, ?3)`
        )
        .bind(visitorId, candidate, cleanName(displayName) || "RAAKA Fan")
        .run();
      break;
    } catch (error) {
      const again = await db
        .prepare("SELECT visitor_id FROM social_profiles WHERE visitor_id = ?1 LIMIT 1")
        .bind(visitorId)
        .first();
      if (again) break; // lost a race on visitor_id, row exists now
      if (!/UNIQUE|constraint/i.test(String(error))) throw error;
    }
  }
  knownProfiles.add(visitorId);
}

async function loadProfile(
  db: D1Database,
  viewerId: string,
  by: { handle: string } | { id: string }
) {
  const cond = "handle" in by ? "p.handle = ?2 COLLATE NOCASE" : "p.visitor_id = ?2";
  const value = "handle" in by ? by.handle : by.id;
  return db
    .prepare(
      `SELECT ${PROFILE_COLS}, ${SELF_COLS},
         EXISTS (SELECT 1 FROM social_follows
                 WHERE follower_id = ?1 AND following_id = p.visitor_id) AS is_following,
         EXISTS (SELECT 1 FROM social_follow_requests
                 WHERE requester_id = ?1 AND target_id = p.visitor_id) AS is_requested
       FROM social_profiles p
       WHERE ${cond}
       LIMIT 1`
    )
    .bind(viewerId, value)
    .first<Row>();
}

async function unreadCount(db: D1Database, userId: string) {
  const row = await db
    .prepare(
      `SELECT COUNT(*) AS n FROM (
         SELECT 1 FROM social_notifications
         WHERE recipient_id = ?1
           AND id > COALESCE((SELECT notifications_seen_id FROM social_profiles
                              WHERE visitor_id = ?1), 0)
         LIMIT 100
       )`
    )
    .bind(userId)
    .first<Row>();
  return num(row?.n);
}

/* -------------------------------------------------------------------------- */
/* Posts: queries + hydration                                                  */
/* -------------------------------------------------------------------------- */

async function getVisiblePost(db: D1Database, viewerId: string, postId: number) {
  return db
    .prepare(
      `SELECT s.id, s.visitor_id, s.reply_to_id, s.repost_of_id,
              CASE WHEN s.visitor_id = ?1 OR p.reply_permission = 'everyone'
                        OR rf.follower_id IS NOT NULL THEN 1 ELSE 0 END AS can_reply
       FROM social_posts s ${BASE_JOINS}
       WHERE s.id = ?2 AND ${VISIBLE}
       LIMIT 1`
    )
    .bind(viewerId, postId)
    .first<Row>();
}

/** Attaches `original` (reposts) and `parent` (replies). Drops reposts whose original is not visible. */
async function hydratePosts(
  db: D1Database,
  rows: Row[],
  viewerId: string
): Promise<PostShape[]> {
  const ids = new Set<number>();
  for (const r of rows) {
    const o = num(r.repost_of_id);
    const p = num(r.reply_to_id);
    if (o) ids.add(o);
    if (p) ids.add(p);
  }

  const related = new Map<number, PostShape>();
  if (ids.size) {
    const list = [...ids];
    const placeholders = list.map((_, i) => `?${i + 2}`).join(",");
    const res = await db
      .prepare(
        `SELECT ${POST_COLS} ${POST_FROM}
         WHERE ${VISIBLE} AND s.id IN (${placeholders})`
      )
      .bind(viewerId, ...list)
      .all<Row>();
    for (const r of res.results) related.set(num(r.id), postShape(r));
  }

  const out: PostShape[] = [];
  for (const row of rows) {
    const shaped = postShape(row);
    if (shaped.repostOfId) {
      const original = related.get(shaped.repostOfId) ?? null;
      if (!original) continue;
      shaped.original = original;
    }
    if (shaped.replyToId) {
      const parent = related.get(shaped.replyToId);
      if (parent) {
        shaped.parent = {
          id: parent.id,
          handle: parent.author.handle,
          displayName: parent.author.displayName,
        };
      }
    }
    out.push(shaped);
  }
  return out;
}

async function queryPosts(
  db: D1Database,
  viewerId: string,
  where: string,
  binds: unknown[],
  order: string,
  limit: number
) {
  const res = await db
    .prepare(
      `SELECT ${POST_COLS} ${POST_FROM}
       WHERE ${VISIBLE} AND ${where}
       ORDER BY ${order}
       LIMIT ${limit}`
    )
    .bind(viewerId, ...binds)
    .all<Row>();
  return res.results;
}

function pageOf<T>(rows: T[], limit: number) {
  const hasMore = rows.length > limit;
  return { page: hasMore ? rows.slice(0, limit) : rows, hasMore };
}

// Same weights as the original SQL ranking, applied to ONE id-ordered page.
function forYouScore(p: PostShape) {
  const hours = (Date.now() - new Date(p.createdAt).getTime()) / 3_600_000;
  return (
    (p.following ? 100 : 0) +
    (p.author.verified ? 15 : 0) +
    p.likes * 2 +
    p.replies * 4 +
    p.reposts * 5 +
    Math.min(72, Math.max(0, 72 - hours))
  );
}

async function feedResponse(
  db: D1Database,
  viewerId: string,
  kind: "for-you" | "following",
  cursor: number,
  limit: number
) {
  const cursorSql = cursor > 0 ? "AND s.id < ?2" : "AND ?2 = 0";
  const where =
    kind === "following"
      ? `s.reply_to_id IS NULL ${cursorSql}
         AND s.visitor_id IN (SELECT following_id FROM social_follows WHERE follower_id = ?1)`
      : `s.reply_to_id IS NULL ${cursorSql}`;

  const rows = await queryPosts(db, viewerId, where, [cursor], "s.id DESC", limit + 1);
  const { page, hasMore } = pageOf(rows, limit);
  const nextCursor = hasMore ? num(page[page.length - 1].id) : 0;

  let posts = await hydratePosts(db, page, viewerId);

  // Ranking is applied INSIDE a page. Pages are cut by immutable post id, so
  // pagination can neither skip nor repeat a post when scores change.
  if (kind === "for-you") {
    posts = posts
      .map((p) => ({ p, s: forYouScore(p) }))
      .sort((a, b) => b.s - a.s || b.p.id - a.p.id)
      .map((x) => x.p);
  }

  return json({ success: true, posts, nextCursor, hasMore });
}

/* -------------------------------------------------------------------------- */
/* Notifications                                                               */
/* -------------------------------------------------------------------------- */

const NOTIFY_PREF: Record<string, string | null> = {
  like: "notify_likes",
  reply: "notify_replies",
  repost: "notify_reposts",
  follow: "notify_follows",
  follow_request: null,
  follow_accepted: null,
};

/**
 * Builds an idempotent "INSERT OR IGNORE ... SELECT" that respects the
 * recipient's preferences. Arguments are SQL expressions (e.g. "?2").
 * `guard` lets the caller make the insert conditional inside a batch.
 */
function notifyStatement(
  db: D1Database,
  type: keyof typeof NOTIFY_PREF,
  recipient: string,
  actor: string,
  post: string,
  guard = "",
  binds: unknown[] = []
) {
  const pref = NOTIFY_PREF[type];
  return db
    .prepare(
      `INSERT OR IGNORE INTO social_notifications (recipient_id, actor_id, type, post_id)
       SELECT ${recipient}, ${actor}, '${type}', ${post}
       FROM social_profiles
       WHERE visitor_id = ${recipient}
         AND ${recipient} <> ${actor}
         AND COALESCE(notify_enabled, 1) = 1
         ${pref ? `AND COALESCE(${pref}, 1) = 1` : ""}
         ${guard}`
    )
    .bind(...binds);
}

/* -------------------------------------------------------------------------- */
/* Auth                                                                        */
/* -------------------------------------------------------------------------- */

async function getAuthenticatedUser(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) return { user: null, response: fail(401, "You must be logged in.") };
  if (!user.verifiedAt) {
    return { user: null, response: fail(403, "Please verify your email first.") };
  }
  return { user, response: null };
}

/* -------------------------------------------------------------------------- */
/* GET                                                                         */
/* -------------------------------------------------------------------------- */

export async function GET(request: Request) {
  let action = "feed";
  try {
    const url = new URL(request.url);
    action = url.searchParams.get("action") || "feed";
    const db = getD1();

    /* ---------------- SEARCH (public; private content filtered) ---------------- */
    if (action === "search") {
      let viewerId = "";
      try {
        const maybe = await getCurrentUser(request);
        if (maybe?.verifiedAt) viewerId = maybe.userId;
      } catch {
        viewerId = "";
      }
      const limited = rateLimit(viewerId || clientIp(request), "search");
      if (limited) return limited;
      return await handleSearch(db, url, viewerId);
    }

    const auth = await getAuthenticatedUser(request);
    if (!auth.user) return auth.response;
    const userId = auth.user.userId;

    const limited = rateLimit(userId, action === "export" ? "export" : "read");
    if (limited) return limited;

    await ensureProfile(db, userId);

    const limit = clampLimit(url.searchParams.get("limit"));
    const cursor = parseCursorId(url.searchParams.get("cursor"));
    const handleParam = cleanHandle(url.searchParams.get("handle"));

    switch (action) {
      case "for-you":
      case "feed":
        return await feedResponse(db, userId, "for-you", cursor, limit);

      case "following-feed":
        return await feedResponse(db, userId, "following", cursor, limit);

      // Legacy contract: `following` without a handle used to mean "feed".
      case "following":
        if (!handleParam) {
          return await feedResponse(db, userId, "following", cursor, limit);
        }
        return await handleRelations(db, userId, "following", handleParam, url, limit);

      case "followers":
        if (!handleParam) return fail(400, "Profile handle is required.");
        return await handleRelations(db, userId, "followers", handleParam, url, limit);

      case "profile":
      case "me": {
        const row = handleParam
          ? await loadProfile(db, userId, { handle: handleParam })
          : await loadProfile(db, userId, { id: userId });
        if (!row) return fail(404, "Profile not found.");
        const profile = profileShape(row, userId);
        if (profile.isSelf) {
          return json({
            success: true,
            profile,
            settings: settingsShape(row),
            unread: await unreadCount(db, userId),
          });
        }
        return json({ success: true, profile });
      }

      case "unread":
        return json({ success: true, unread: await unreadCount(db, userId) });

      case "user-posts": {
        if (!handleParam) return fail(400, "Profile handle is required.");
        const target = await loadProfile(db, userId, { handle: handleParam });
        if (!target) return fail(404, "Profile not found.");
        const t = profileShape(target, userId);
        if (!t.canView) {
          return json({ success: true, posts: [], nextCursor: 0, hasMore: false, locked: true });
        }
        const rows = await queryPosts(
          db,
          userId,
          `s.visitor_id = ?2 AND (?3 = 0 OR s.id < ?3)`,
          [t.visitorId, cursor],
          "s.id DESC",
          limit + 1
        );
        const { page, hasMore } = pageOf(rows, limit);
        return json({
          success: true,
          posts: await hydratePosts(db, page, userId),
          nextCursor: hasMore ? num(page[page.length - 1].id) : 0,
          hasMore,
          locked: false,
        });
      }

      case "thread":
        return await handleThread(db, userId, url, limit);

      case "bookmarks": {
        const res = await db
          .prepare(
            `SELECT ${POST_COLS}
             FROM social_bookmarks bm
             JOIN social_posts s ON s.id = bm.post_id
             ${BASE_JOINS} ${VIEWER_JOINS}
             WHERE bm.visitor_id = ?1 AND (?2 = 0 OR bm.post_id < ?2) AND ${VISIBLE}
             ORDER BY bm.post_id DESC
             LIMIT ${limit + 1}`
          )
          .bind(userId, cursor)
          .all<Row>();
        const { page, hasMore } = pageOf(res.results, limit);
        return json({
          success: true,
          posts: await hydratePosts(db, page, userId),
          nextCursor: hasMore ? num(page[page.length - 1].id) : 0,
          hasMore,
        });
      }

      case "notifications":
        return await handleNotifications(db, userId, cursor, limit);

      case "export":
        return await handleExport(db, userId);

      default:
        return fail(400, "Unknown social action.");
    }
  } catch (error) {
    console.error(`RAAKA Social GET error [${action}]`, error);
    return fail(500, "Social service temporarily unavailable.");
  }
}

async function handleRelations(
  db: D1Database,
  userId: string,
  kind: "followers" | "following",
  handle: string,
  url: URL,
  limit: number
) {
  const target = await loadProfile(db, userId, { handle });
  if (!target) return fail(404, "Profile not found.");
  const t = profileShape(target, userId);
  if (!t.canView) {
    return json({ success: true, users: [], nextCursor: "", hasMore: false, locked: true });
  }

  const cursor = (url.searchParams.get("cursor") || "").slice(0, 64);
  const edge = kind === "followers" ? "sf.follower_id" : "sf.following_id";
  const anchor = kind === "followers" ? "sf.following_id" : "sf.follower_id";

  const res = await db
    .prepare(
      `SELECT ${PROFILE_COLS},
         EXISTS (SELECT 1 FROM social_follows
                 WHERE follower_id = ?1 AND following_id = p.visitor_id) AS is_following,
         EXISTS (SELECT 1 FROM social_follow_requests
                 WHERE requester_id = ?1 AND target_id = p.visitor_id) AS is_requested
       FROM social_follows sf
       JOIN social_profiles p ON p.visitor_id = ${edge}
       WHERE ${anchor} = ?2 AND (?3 = '' OR ${edge} > ?3)
       ORDER BY ${edge} ASC
       LIMIT ${limit + 1}`
    )
    .bind(userId, t.visitorId, cursor)
    .all<Row>();

  const { page, hasMore } = pageOf(res.results, limit);
  return json({
    success: true,
    users: page.map((r) => profileShape(r, userId)),
    nextCursor: hasMore ? str(page[page.length - 1].visitor_id) : "",
    hasMore,
    locked: false,
  });
}

async function handleThread(db: D1Database, userId: string, url: URL, limit: number) {
  const requested = asId(url.searchParams.get("postId"));
  if (!requested) return fail(400, "Invalid post.");
  const cursor = parseCursorId(url.searchParams.get("cursor"));

  const first = await getVisiblePost(db, userId, requested);
  if (!first) return fail(404, "This post isn't available.");

  // Conversations are intentionally ONE level deep: root post + direct replies.
  const rootId = num(first.repost_of_id) || num(first.reply_to_id) || num(first.id);

  const rootRows =
    cursor > 0
      ? []
      : await queryPosts(db, userId, "s.id = ?2", [rootId], "s.id DESC", 1);
  let root: PostShape | null = null;
  if (cursor === 0) {
    if (!rootRows.length) return fail(404, "This post isn't available.");
    root = (await hydratePosts(db, rootRows, userId))[0] ?? null;
    if (!root) return fail(404, "This post isn't available.");
  }

  const replyRows = await queryPosts(
    db,
    userId,
    "s.reply_to_id = ?2 AND s.id > ?3",
    [rootId, cursor],
    "s.id ASC",
    limit + 1
  );
  const { page, hasMore } = pageOf(replyRows, limit);

  return json({
    success: true,
    post: root,
    replies: await hydratePosts(db, page, userId),
    focusId: requested,
    nextCursor: hasMore ? num(page[page.length - 1].id) : 0,
    hasMore,
  });
}

async function handleNotifications(
  db: D1Database,
  userId: string,
  cursor: number,
  limit: number
) {
  const seenRow = await db
    .prepare("SELECT notifications_seen_id FROM social_profiles WHERE visitor_id = ?1")
    .bind(userId)
    .first<Row>();
  const seen = num(seenRow?.notifications_seen_id);

  const res = await db
    .prepare(
      `SELECT n.id, n.type, n.post_id, n.created_at, n.actor_id,
              p.handle, p.display_name, p.verified, p.verification_type, p.verification_label,
              substr(sp.body, 1, 100) AS preview,
              CASE WHEN n.id > ?2 THEN 1 ELSE 0 END AS unread
       FROM social_notifications n
       JOIN social_profiles p ON p.visitor_id = n.actor_id
       LEFT JOIN social_posts sp ON sp.id = n.post_id
       WHERE n.recipient_id = ?1
         AND n.type <> 'follow_request'
         AND (?3 = 0 OR n.id < ?3)
       ORDER BY n.id DESC
       LIMIT ${limit + 1}`
    )
    .bind(userId, seen, cursor)
    .all<Row>();

  const { page, hasMore } = pageOf(res.results, limit);

  interface Group {
    key: string;
    type: string;
    postId: number | null;
    id: number;
    createdAt: string;
    unread: boolean;
    preview: string;
    count: number;
    actors: Array<{ visitorId: string; handle: string; displayName: string } & ReturnType<typeof verificationData>>;
  }

  const groups: Group[] = [];
  const index = new Map<string, Group>();

  for (const r of page) {
    const type = str(r.type);
    const postId = num(r.post_id) || null;
    // Likes / reposts on one post and follows are merged. Replies stay individual.
    const groupable = type === "like" || type === "repost" || type === "follow";
    const key = groupable ? `${type}:${postId ?? 0}` : `n:${num(r.id)}`;
    const actor = {
      visitorId: str(r.actor_id),
      handle: str(r.handle),
      displayName: str(r.display_name),
      ...verificationData(r),
    };

    const existing = index.get(key);
    if (existing) {
      existing.count += 1;
      existing.unread = existing.unread || flag(r.unread);
      if (existing.actors.length < 3) existing.actors.push(actor);
      continue;
    }
    const group: Group = {
      key,
      type,
      postId,
      id: num(r.id),
      createdAt: toIso(r.created_at),
      unread: flag(r.unread),
      preview: str(r.preview),
      count: 1,
      actors: [actor],
    };
    index.set(key, group);
    groups.push(group);
  }

  let requests: unknown[] = [];
  if (cursor === 0) {
    const reqRes = await db
      .prepare(
        `SELECT ${PROFILE_COLS}
         FROM social_follow_requests r
         JOIN social_profiles p ON p.visitor_id = r.requester_id
         WHERE r.target_id = ?1
         ORDER BY r.created_at DESC
         LIMIT 20`
      )
      .bind(userId)
      .all<Row>();
    requests = reqRes.results.map((r) => profileShape(r, userId));
  }

  return json({
    success: true,
    notifications: groups,
    requests,
    nextCursor: hasMore ? num(page[page.length - 1].id) : 0,
    hasMore,
  });
}

async function handleExport(db: D1Database, userId: string) {
  const profile = await loadProfile(db, userId, { id: userId });
  if (!profile) return fail(404, "Profile not found.");

  const posts = await db
    .prepare(
      `SELECT id, body, created_at, reply_to_id, repost_of_id
       FROM social_posts WHERE visitor_id = ?1 ORDER BY id DESC LIMIT 500`
    )
    .bind(userId)
    .all<Row>();

  const bookmarks = await db
    .prepare(
      `SELECT post_id FROM social_bookmarks WHERE visitor_id = ?1
       ORDER BY post_id DESC LIMIT 500`
    )
    .bind(userId)
    .all<Row>();

  return json({
    success: true,
    export: {
      exportedAt: new Date().toISOString(),
      profile: profileShape(profile, userId),
      settings: settingsShape(profile),
      posts: posts.results.map((r) => ({
        id: num(r.id),
        body: str(r.body),
        createdAt: toIso(r.created_at),
        replyToId: num(r.reply_to_id) || null,
        repostOfId: num(r.repost_of_id) || null,
      })),
      bookmarkedPostIds: bookmarks.results.map((r) => num(r.post_id)),
      note: "Posts and bookmarks are capped at the 500 most recent items.",
    },
  });
}

/* ---------------------------------- search --------------------------------- */

async function handleSearch(db: D1Database, url: URL, viewerId: string) {
  const q = normalizeQuery(url.searchParams.get("q"));
  const rawMode = url.searchParams.get("mode");
  const mode =
    rawMode === "posts" || rawMode === "top" || rawMode === "latest" ? rawMode : "people";
  const limit = clampLimit(url.searchParams.get("limit"));
  const rawCursor = url.searchParams.get("cursor");

  const empty = (extra: Record<string, unknown> = {}) =>
    json({ success: true, mode, query: q, users: [], posts: [], nextCursor: "", hasMore: false, ...extra });

  const term = q.replace(/^@+/, "");
  if (term.length < 2) return empty({ tooShort: q.length > 0 });

  const lower = term.toLowerCase();
  const esc = escapeLike(lower);

  if (mode === "people") {
    const cur = parseRankCursor(rawCursor);
    const res = await db
      .prepare(
        `SELECT * FROM (
           SELECT ${PROFILE_COLS},
             (CASE
                WHEN LOWER(p.handle) = ?2 THEN 4
                WHEN LOWER(p.display_name) = ?2 THEN 3
                WHEN p.handle LIKE ?3 ESCAPE '\\' THEN 2
                ELSE 1
              END) * 1000000 + MIN(COALESCE(p.followers_count, 0), 999999) AS rank_key,
             EXISTS (SELECT 1 FROM social_follows
                     WHERE follower_id = ?1 AND following_id = p.visitor_id) AS is_following,
             EXISTS (SELECT 1 FROM social_follow_requests
                     WHERE requester_id = ?1 AND target_id = p.visitor_id) AS is_requested
           FROM social_profiles p
           WHERE p.handle LIKE ?4 ESCAPE '\\' OR p.display_name LIKE ?4 ESCAPE '\\'
         )
         WHERE (?5 IS NULL OR rank_key < ?5 OR (rank_key = ?5 AND visitor_id > ?6))
         ORDER BY rank_key DESC, visitor_id ASC
         LIMIT ${limit + 1}`
      )
      .bind(viewerId, lower, `${esc}%`, `%${esc}%`, cur ? cur.key : null, cur ? cur.id : "")
      .all<Row>();

    const { page, hasMore } = pageOf(res.results, limit);
    const last = page[page.length - 1];
    return json({
      success: true,
      mode,
      query: q,
      users: page.map((r) => profileShape(r, viewerId)),
      posts: [],
      nextCursor: hasMore && last ? `${num(last.rank_key)}:${str(last.visitor_id)}` : "",
      hasMore,
    });
  }

  // Post search is bounded to the newest SEARCH_WINDOW ids so a `%term%`
  // scan can never read the whole table.
  const cur = parseRankCursor(rawCursor);
  const binds: unknown[] = [
    viewerId,
    SEARCH_WINDOW,
    `%${esc}%`,
    cur ? cur.key : null,
    cur ? Number(cur.id) : 0,
  ];

  let keyExpr = "0"; // latest: order purely by id
  if (mode === "top") {
    keyExpr = `COALESCE(s.likes_count,0) * 2 + COALESCE(s.replies_count,0) * 4 + COALESCE(s.reposts_count,0) * 5`;
  } else if (mode === "posts") {
    // relevance: exact post > whole-word match > substring match
    keyExpr = `CASE WHEN LOWER(s.body) = ?6 THEN 3
                    WHEN (' ' || LOWER(s.body) || ' ') LIKE ?7 ESCAPE '\\' THEN 2
                    ELSE 1 END`;
    binds.push(lower, `% ${esc} %`);
  }

  const res = await db
    .prepare(
      `SELECT * FROM (
         SELECT ${POST_COLS}, ${keyExpr} AS rank_key
         ${POST_FROM}
         WHERE ${VISIBLE}
           AND s.repost_of_id IS NULL
           AND s.id > MAX(0, (SELECT MAX(id) FROM social_posts) - ?2)
           AND s.body LIKE ?3 ESCAPE '\\'
       )
       WHERE (?4 IS NULL OR rank_key < ?4 OR (rank_key = ?4 AND id < ?5))
       ORDER BY rank_key DESC, id DESC
       LIMIT ${limit + 1}`
    )
    .bind(...binds)
    .all<Row>();

  const { page, hasMore } = pageOf(res.results, limit);
  const last = page[page.length - 1];
  return json({
    success: true,
    mode,
    query: q,
    users: [],
    posts: await hydratePosts(db, page, viewerId),
    nextCursor: hasMore && last ? `${num(last.rank_key)}:${num(last.id)}` : "",
    hasMore,
  });
}

/* -------------------------------------------------------------------------- */
/* POST                                                                        */
/* -------------------------------------------------------------------------- */

export async function POST(request: Request) {
  let action = "unknown";
  try {
    if (!sameOrigin(request)) return fail(403, "Cross-site request blocked.");
    if (!/application\/json/i.test(request.headers.get("content-type") || "")) {
      return fail(415, "Unsupported content type.");
    }

    const auth = await getAuthenticatedUser(request);
    if (!auth.user) return auth.response;
    const userId = auth.user.userId;

    const parsed = await readJsonBody(request);
    if ("response" in parsed) return parsed.response;
    const body = parsed.body;
    action = str(body.action);

    const limited = rateLimit(userId, action in LIMITS ? action : "read");
    if (limited) return limited;

    const db = getD1();
    await ensureProfile(db, userId, body.displayName, body.handle);

    switch (action) {
      case "profile":
        return await updateProfile(db, userId, body);
      case "settings":
        return await updateSettings(db, userId, body);
      case "post":
        return await createPost(db, userId, body);
      case "reply":
        return await createReply(db, userId, body);
      case "delete":
        return await deletePost(db, userId, body);
      case "like":
        return await toggleLike(db, userId, body);
      case "bookmark":
        return await toggleBookmark(db, userId, body);
      case "repost":
        return await toggleRepost(db, userId, body);
      case "follow":
        return await toggleFollow(db, userId, body);
      case "follow-request":
        return await respondToRequest(db, userId, body);
      case "notifications-read":
        await db
          .prepare(
            `UPDATE social_profiles
             SET notifications_seen_id = COALESCE(
               (SELECT MAX(id) FROM social_notifications WHERE recipient_id = ?1),
               notifications_seen_id)
             WHERE visitor_id = ?1`
          )
          .bind(userId)
          .run();
        return json({ success: true, unread: 0 });
      default:
        return fail(400, "Unknown social action.");
    }
  } catch (error) {
    console.error(`RAAKA Social POST error [${action}]`, error);
    return fail(500, "Social service temporarily unavailable.");
  }
}

/* --------------------------------- profile --------------------------------- */

async function updateProfile(db: D1Database, userId: string, body: Row) {
  const current = await db
    .prepare("SELECT handle, display_name, bio FROM social_profiles WHERE visitor_id = ?1")
    .bind(userId)
    .first<Row>();
  if (!current) return fail(404, "Profile not found.");

  const displayName =
    body.displayName === undefined ? str(current.display_name) : cleanName(body.displayName);
  const handle =
    body.handle === undefined ? str(current.handle) : cleanHandle(body.handle);
  const bioClean = body.bio === undefined ? str(current.bio) : cleanText(body.bio);

  if (!displayName) return fail(400, "Display name can't be empty.");
  if (bioClean === null) return fail(400, "Invalid bio.");
  if (charLength(bioClean) > MAX_BIO) return fail(400, `Bio can be at most ${MAX_BIO} characters.`);
  if (!/^[a-z0-9_]{3,20}$/.test(handle)) {
    return fail(400, "Handle must be 3–20 letters, numbers or _.");
  }
  if (handle !== str(current.handle).toLowerCase() && RESERVED_HANDLES.has(handle)) {
    return fail(400, "That handle is reserved.");
  }

  if (handle.toLowerCase() !== str(current.handle).toLowerCase()) {
    const taken = await db
      .prepare(
        `SELECT 1 FROM social_profiles
         WHERE handle = ?1 COLLATE NOCASE AND visitor_id <> ?2 LIMIT 1`
      )
      .bind(handle, userId)
      .first();
    if (taken) return fail(409, "That handle is already taken.");
  }

  try {
    await db
      .prepare(
        `UPDATE social_profiles
         SET display_name = ?2, handle = ?3, bio = ?4, updated_at = CURRENT_TIMESTAMP
         WHERE visitor_id = ?1`
      )
      .bind(userId, displayName, handle, bioClean)
      .run();
  } catch (error) {
    if (/UNIQUE|constraint/i.test(String(error))) {
      return fail(409, "That handle is already taken.");
    }
    throw error;
  }

  const updated = await loadProfile(db, userId, { id: userId });
  if (!updated) return fail(404, "Profile not found.");
  return json({ success: true, profile: profileShape(updated, userId) });
}

async function updateSettings(db: D1Database, userId: string, body: Row) {
  const sets: string[] = [];
  const vals: unknown[] = [];
  const push = (column: string, value: unknown) => {
    vals.push(value);
    sets.push(`${column} = ?${vals.length + 1}`);
  };

  let wentPublic = false;

  if (body.isPrivate !== undefined) {
    const v = asBool(body.isPrivate);
    if (v === null) return fail(400, "Invalid privacy setting.");
    push("is_private", v ? 1 : 0);
    wentPublic = !v;
  }

  if (body.replyPermission !== undefined) {
    if (body.replyPermission !== "everyone" && body.replyPermission !== "following") {
      return fail(400, "Invalid reply setting.");
    }
    push("reply_permission", body.replyPermission);
  }

  if (body.emailNotifications !== undefined) {
    const v = asBool(body.emailNotifications);
    if (v === null) return fail(400, "Invalid email setting.");
    push("email_notifications", v ? 1 : 0);
  }

  if (body.notifications !== undefined) {
    const n = body.notifications;
    if (!n || typeof n !== "object" || Array.isArray(n)) {
      return fail(400, "Invalid notification settings.");
    }
    const map: Record<string, string> = {
      enabled: "notify_enabled",
      likes: "notify_likes",
      replies: "notify_replies",
      reposts: "notify_reposts",
      follows: "notify_follows",
    };
    for (const [key, value] of Object.entries(n as Row)) {
      const column = map[key];
      const v = asBool(value);
      if (!column || v === null) return fail(400, "Invalid notification settings.");
      push(column, v ? 1 : 0);
    }
  }

  if (body.ui !== undefined) {
    const u = body.ui;
    if (!u || typeof u !== "object" || Array.isArray(u)) {
      return fail(400, "Invalid display settings.");
    }
    const existing = await db
      .prepare("SELECT ui_prefs FROM social_profiles WHERE visitor_id = ?1")
      .bind(userId)
      .first<Row>();
    const merged = parseUiPrefs(existing?.ui_prefs);
    const input = u as Row;
    if (input.fontSize !== undefined) {
      if (!["small", "default", "large"].includes(str(input.fontSize))) {
        return fail(400, "Invalid font size.");
      }
      merged.fontSize = input.fontSize as UiPrefs["fontSize"];
    }
    if (input.reduceMotion !== undefined) {
      const v = asBool(input.reduceMotion);
      if (v === null) return fail(400, "Invalid motion setting.");
      merged.reduceMotion = v;
    }
    if (input.dataSaver !== undefined) {
      const v = asBool(input.dataSaver);
      if (v === null) return fail(400, "Invalid data saver setting.");
      merged.dataSaver = v;
    }
    push("ui_prefs", JSON.stringify(merged));
  }

  if (!sets.length) return fail(400, "Nothing to update.");

  const statements = [
    db
      .prepare(
        `UPDATE social_profiles SET ${sets.join(", ")}, updated_at = CURRENT_TIMESTAMP
         WHERE visitor_id = ?1`
      )
      .bind(userId, ...vals),
  ];

  if (wentPublic) {
    // Pending requests to a now-public account are moot; clear them with their notifications.
    statements.push(
      db.prepare("DELETE FROM social_follow_requests WHERE target_id = ?1").bind(userId),
      db
        .prepare(
          "DELETE FROM social_notifications WHERE recipient_id = ?1 AND type = 'follow_request'"
        )
        .bind(userId)
    );
  }

  await db.batch(statements);

  const row = await loadProfile(db, userId, { id: userId });
  if (!row) return fail(404, "Profile not found.");
  return json({ success: true, settings: settingsShape(row) });
}

/* ------------------------------ create content ------------------------------ */

async function authorRow(db: D1Database, userId: string) {
  return db
    .prepare(
      `SELECT visitor_id, handle, display_name, verified, verification_type, verification_label
       FROM social_profiles WHERE visitor_id = ?1`
    )
    .bind(userId)
    .first<Row>();
}

function validatePostText(raw: unknown): { text: string } | { response: Response } {
  const text = cleanText(raw);
  if (text === null) return { response: fail(400, "Invalid text.") };
  if (!text) return { response: fail(400, "Write something first.") };
  if (charLength(text) > MAX_POST) {
    return { response: fail(400, `Maximum ${MAX_POST} characters.`) };
  }
  return { text };
}

async function createPost(db: D1Database, userId: string, body: Row) {
  const checked = validatePostText(body.text);
  if ("response" in checked) return checked.response;
  const text = checked.text;

  // Idempotency for double submits / retries: same body within a few seconds.
  const dup = await db
    .prepare(
      `SELECT id FROM social_posts
       WHERE visitor_id = ?1 AND reply_to_id IS NULL AND repost_of_id IS NULL
         AND body = ?2 AND created_at > datetime('now', '-${DUPLICATE_WINDOW_SECONDS} seconds')
       ORDER BY id DESC LIMIT 1`
    )
    .bind(userId, text)
    .first<Row>();

  const author = await authorRow(db, userId);
  if (!author) return fail(404, "Profile not found.");

  if (dup) {
    return json({
      success: true,
      id: num(dup.id),
      duplicate: true,
      post: postShape({ ...author, id: dup.id, body: text, created_at: new Date().toISOString(), can_reply: 1 }),
    });
  }

  const results = await db.batch([
    db
      .prepare("INSERT INTO social_posts (visitor_id, body) VALUES (?1, ?2)")
      .bind(userId, text),
    db
      .prepare(
        `UPDATE social_profiles
         SET posts_count = posts_count + 1, updated_at = CURRENT_TIMESTAMP
         WHERE visitor_id = ?1`
      )
      .bind(userId),
  ]);

  const id = num(results[0].meta.last_row_id);
  return json({
    success: true,
    id,
    post: postShape({ ...author, id, body: text, created_at: new Date().toISOString(), can_reply: 1 }),
  });
}

async function createReply(db: D1Database, userId: string, body: Row) {
  const postId = asId(body.postId);
  if (!postId) return fail(400, "Invalid post.");
  const checked = validatePostText(body.text);
  if ("response" in checked) return checked.response;
  const text = checked.text;

  // Resolve what the user is replying to, then normalise to the thread root.
  let direct = await getVisiblePost(db, userId, postId);
  if (!direct) return fail(404, "This post isn't available.");
  if (num(direct.repost_of_id)) {
    direct = await getVisiblePost(db, userId, num(direct.repost_of_id));
    if (!direct) return fail(404, "This post isn't available.");
  }
  const rootId = num(direct.reply_to_id) || num(direct.id);
  const root =
    rootId === num(direct.id) ? direct : await getVisiblePost(db, userId, rootId);
  if (!root) return fail(404, "This post isn't available.");

  if (!flag(root.can_reply)) {
    return fail(403, "The author limits who can reply to this post.");
  }

  const author = await authorRow(db, userId);
  if (!author) return fail(404, "Profile not found.");

  const dup = await db
    .prepare(
      `SELECT id FROM social_posts
       WHERE visitor_id = ?1 AND reply_to_id = ?2 AND body = ?3
         AND created_at > datetime('now', '-${DUPLICATE_WINDOW_SECONDS} seconds')
       ORDER BY id DESC LIMIT 1`
    )
    .bind(userId, rootId, text)
    .first<Row>();

  if (dup) {
    return json({
      success: true,
      id: num(dup.id),
      duplicate: true,
      post: replyShape(author, num(dup.id), text, rootId),
    });
  }

  const results = await db.batch([
    db
      .prepare(
        `INSERT INTO social_posts (visitor_id, body, reply_to_id)
         SELECT ?1, ?2, ?3 WHERE EXISTS (SELECT 1 FROM social_posts WHERE id = ?3)`
      )
      .bind(userId, text, rootId),
    db
      .prepare("UPDATE social_posts SET replies_count = replies_count + 1 WHERE id = ?1")
      .bind(rootId),
    db
      .prepare(
        `UPDATE social_profiles SET posts_count = posts_count + 1, updated_at = CURRENT_TIMESTAMP
         WHERE visitor_id = ?1 AND EXISTS (SELECT 1 FROM social_posts WHERE id = ?2)`
      )
      .bind(userId, rootId),
  ]);

  if (num(results[0].meta.changes) !== 1) return fail(404, "This post isn't available.");
  const id = num(results[0].meta.last_row_id);

  // Notify the author being replied to, and the thread owner when different.
  const notify = [
    notifyStatement(db, "reply", "?1", "?2", "?3", "", [str(direct.visitor_id), userId, id]),
  ];
  if (str(root.visitor_id) !== str(direct.visitor_id)) {
    notify.push(
      notifyStatement(db, "reply", "?1", "?2", "?3", "", [str(root.visitor_id), userId, id])
    );
  }
  try {
    await db.batch(notify);
  } catch (error) {
    console.error("RAAKA Social reply notification failed", error);
  }

  return json({ success: true, id, post: replyShape(author, id, text, rootId) });
}

function replyShape(author: Row, id: number, text: string, rootId: number) {
  return postShape({
    ...author,
    id,
    body: text,
    created_at: new Date().toISOString(),
    reply_to_id: rootId,
    can_reply: 1,
  });
}

/* ---------------------------------- delete ---------------------------------- */

async function deletePost(db: D1Database, userId: string, body: Row) {
  const postId = asId(body.postId);
  if (!postId) return fail(400, "Invalid post.");

  const post = await db
    .prepare("SELECT id, visitor_id FROM social_posts WHERE id = ?1 LIMIT 1")
    .bind(postId)
    .first<Row>();

  // Already gone: deleting twice is a successful no-op.
  if (!post) return json({ success: true, deleted: true, postId, alreadyDeleted: true });
  if (post.visitor_id !== userId) return fail(403, "You can only delete your own posts.");

  /*
   * Policy: deleting a post also deletes its replies and reposts (one-level
   * threads), plus likes/bookmarks/notifications for all removed rows.
   * Every statement is guarded by OWN, so a concurrent second delete does
   * nothing (D1 serialises batches). Counters are recomputed from the rows
   * that are about to disappear, so they can't drift or go negative.
   */
  const OWN = `EXISTS (SELECT 1 FROM social_posts WHERE id = ?1 AND visitor_id = ?2)`;
  const SET = `(SELECT id FROM social_posts WHERE id = ?1 OR reply_to_id = ?1 OR repost_of_id = ?1)`;

  await db.batch([
    db
      .prepare(
        `UPDATE social_posts SET replies_count = MAX(0, replies_count - 1)
         WHERE id = (SELECT reply_to_id FROM social_posts WHERE id = ?1) AND ${OWN}`
      )
      .bind(postId, userId),
    db
      .prepare(
        `UPDATE social_posts SET reposts_count = MAX(0, reposts_count - 1)
         WHERE id = (SELECT repost_of_id FROM social_posts WHERE id = ?1) AND ${OWN}`
      )
      .bind(postId, userId),
    db
      .prepare(
        `UPDATE social_profiles
         SET posts_count = MAX(0, posts_count - (
               SELECT COUNT(*) FROM social_posts x
               WHERE x.visitor_id = social_profiles.visitor_id
                 AND (x.id = ?1 OR x.reply_to_id = ?1 OR x.repost_of_id = ?1))),
             updated_at = CURRENT_TIMESTAMP
         WHERE ${OWN}
           AND visitor_id IN (SELECT visitor_id FROM social_posts
                              WHERE id = ?1 OR reply_to_id = ?1 OR repost_of_id = ?1)`
      )
      .bind(postId, userId),
    db
      .prepare(
        `DELETE FROM social_notifications
         WHERE actor_id = ?2 AND type = 'repost'
           AND post_id = (SELECT repost_of_id FROM social_posts WHERE id = ?1) AND ${OWN}`
      )
      .bind(postId, userId),
    db.prepare(`DELETE FROM social_likes WHERE post_id IN ${SET} AND ${OWN}`).bind(postId, userId),
    db
      .prepare(`DELETE FROM social_bookmarks WHERE post_id IN ${SET} AND ${OWN}`)
      .bind(postId, userId),
    db
      .prepare(`DELETE FROM social_notifications WHERE post_id IN ${SET} AND ${OWN}`)
      .bind(postId, userId),
    db.prepare(`DELETE FROM social_posts WHERE id IN ${SET} AND ${OWN}`).bind(postId, userId),
  ]);

  return json({ success: true, deleted: true, postId });
}

/* ------------------------- idempotent relationship toggles ------------------------- */

function desiredState(body: Row, current: boolean): boolean | null {
  if (body.value === undefined) return !current; // legacy toggle contract
  return asBool(body.value);
}

async function toggleLike(db: D1Database, userId: string, body: Row) {
  const postId = asId(body.postId);
  if (!postId) return fail(400, "Invalid post.");

  const post = await getVisiblePost(db, userId, postId);
  if (!post) return fail(404, "This post isn't available.");

  const existing = await db
    .prepare("SELECT 1 FROM social_likes WHERE visitor_id = ?1 AND post_id = ?2 LIMIT 1")
    .bind(userId, postId)
    .first();
  const current = Boolean(existing);
  const desired = desiredState(body, current);
  if (desired === null) return fail(400, "Invalid request.");

  if (desired !== current) {
    const NOT_LIKED = `NOT EXISTS (SELECT 1 FROM social_likes WHERE visitor_id = ?1 AND post_id = ?2)`;
    if (desired) {
      await db.batch([
        db
          .prepare(`UPDATE social_posts SET likes_count = likes_count + 1 WHERE id = ?2 AND ${NOT_LIKED}`)
          .bind(userId, postId),
        notifyStatement(db, "like", "?3", "?1", "?2", `AND ${NOT_LIKED}`, [
          userId,
          postId,
          str(post.visitor_id),
        ]),
        db
          .prepare("INSERT OR IGNORE INTO social_likes (visitor_id, post_id) VALUES (?1, ?2)")
          .bind(userId, postId),
      ]);
    } else {
      await db.batch([
        db
          .prepare(
            `UPDATE social_posts SET likes_count = MAX(0, likes_count - 1)
             WHERE id = ?2 AND NOT ${NOT_LIKED}`
          )
          .bind(userId, postId),
        db
          .prepare("DELETE FROM social_likes WHERE visitor_id = ?1 AND post_id = ?2")
          .bind(userId, postId),
      ]);
    }
  }

  const counts = await db
    .prepare("SELECT likes_count FROM social_posts WHERE id = ?1")
    .bind(postId)
    .first<Row>();
  return json({
    success: true,
    liked: desired,
    likes: Math.max(0, num(counts?.likes_count)),
  });
}

async function toggleBookmark(db: D1Database, userId: string, body: Row) {
  const postId = asId(body.postId);
  if (!postId) return fail(400, "Invalid post.");

  const post = await getVisiblePost(db, userId, postId);
  if (!post) return fail(404, "This post isn't available.");

  const existing = await db
    .prepare("SELECT 1 FROM social_bookmarks WHERE visitor_id = ?1 AND post_id = ?2 LIMIT 1")
    .bind(userId, postId)
    .first();
  const current = Boolean(existing);
  const desired = desiredState(body, current);
  if (desired === null) return fail(400, "Invalid request.");

  if (desired !== current) {
    await db
      .prepare(
        desired
          ? "INSERT OR IGNORE INTO social_bookmarks (visitor_id, post_id) VALUES (?1, ?2)"
          : "DELETE FROM social_bookmarks WHERE visitor_id = ?1 AND post_id = ?2"
      )
      .bind(userId, postId)
      .run();
  }
  return json({ success: true, bookmarked: desired });
}

async function toggleRepost(db: D1Database, userId: string, body: Row) {
  let postId = asId(body.postId);
  if (!postId) return fail(400, "Invalid post.");

  let original = await getVisiblePost(db, userId, postId);
  if (!original) return fail(404, "This post isn't available.");

  // Reposting a repost (or a stale id) always targets the original post.
  if (num(original.repost_of_id)) {
    postId = num(original.repost_of_id);
    original = await getVisiblePost(db, userId, postId);
    if (!original) return fail(404, "This post isn't available.");
  }
  if (num(original.reply_to_id)) return fail(400, "Replies can't be reposted.");

  const priv = await db
    .prepare("SELECT is_private FROM social_profiles WHERE visitor_id = ?1")
    .bind(str(original.visitor_id))
    .first<Row>();
  if (flag(priv?.is_private) && original.visitor_id !== userId) {
    return fail(403, "Posts from private accounts can't be reposted.");
  }

  const existing = await db
    .prepare(
      "SELECT id FROM social_posts WHERE visitor_id = ?1 AND repost_of_id = ?2 LIMIT 1"
    )
    .bind(userId, postId)
    .first<Row>();
  const current = Boolean(existing);
  const desired = desiredState(body, current);
  if (desired === null) return fail(400, "Invalid request.");

  const NO_REPOST = `NOT EXISTS (SELECT 1 FROM social_posts WHERE visitor_id = ?1 AND repost_of_id = ?2)`;

  if (desired && !current) {
    await db.batch([
      db
        .prepare(`UPDATE social_posts SET reposts_count = reposts_count + 1 WHERE id = ?2 AND ${NO_REPOST}`)
        .bind(userId, postId),
      db
        .prepare(
          `UPDATE social_profiles SET posts_count = posts_count + 1
           WHERE visitor_id = ?1 AND EXISTS (SELECT 1 FROM social_posts WHERE id = ?2) AND ${NO_REPOST}`
        )
        .bind(userId, postId),
      notifyStatement(db, "repost", "?3", "?1", "?2", `AND ${NO_REPOST}`, [
        userId,
        postId,
        str(original.visitor_id),
      ]),
      db
        .prepare(
          `INSERT OR IGNORE INTO social_posts (visitor_id, body, repost_of_id)
           SELECT ?1, body, id FROM social_posts WHERE id = ?2 AND ${NO_REPOST}`
        )
        .bind(userId, postId),
    ]);
  } else if (!desired && current) {
    const REPOST = `EXISTS (SELECT 1 FROM social_posts WHERE visitor_id = ?1 AND repost_of_id = ?2)`;
    const MINE = `(SELECT id FROM social_posts WHERE visitor_id = ?1 AND repost_of_id = ?2)`;
    await db.batch([
      db
        .prepare(`UPDATE social_posts SET reposts_count = MAX(0, reposts_count - 1) WHERE id = ?2 AND ${REPOST}`)
        .bind(userId, postId),
      db
        .prepare(
          `UPDATE social_profiles SET posts_count = MAX(0, posts_count - 1)
           WHERE visitor_id = ?1 AND ${REPOST}`
        )
        .bind(userId, postId),
      db
        .prepare(
          `DELETE FROM social_notifications
           WHERE actor_id = ?1 AND type = 'repost' AND post_id = ?2 AND ${REPOST}`
        )
        .bind(userId, postId),
      db.prepare(`DELETE FROM social_likes WHERE post_id IN ${MINE}`).bind(userId, postId),
      db.prepare(`DELETE FROM social_bookmarks WHERE post_id IN ${MINE}`).bind(userId, postId),
      db
        .prepare("DELETE FROM social_posts WHERE visitor_id = ?1 AND repost_of_id = ?2")
        .bind(userId, postId),
    ]);
  }

  const counts = await db
    .prepare("SELECT reposts_count FROM social_posts WHERE id = ?1")
    .bind(postId)
    .first<Row>();
  return json({
    success: true,
    reposted: desired,
    reposts: Math.max(0, num(counts?.reposts_count)),
    postId,
  });
}

/* ---------------------------------- follows --------------------------------- */

async function toggleFollow(db: D1Database, userId: string, body: Row) {
  const targetId = asVisitorId(body.targetId);
  if (!targetId) return fail(400, "Invalid profile.");
  if (targetId === userId) return fail(400, "You can't follow yourself.");

  const target = await loadProfile(db, userId, { id: targetId });
  if (!target) return fail(404, "Profile not found.");

  const isFollowing = flag(target.is_following);
  const isRequested = flag(target.is_requested);
  const targetPrivate = flag(target.is_private);

  const desired =
    body.value === undefined ? !(isFollowing || isRequested) : asBool(body.value);
  if (desired === null) return fail(400, "Invalid request.");

  const FOLLOWING = `EXISTS (SELECT 1 FROM social_follows WHERE follower_id = ?1 AND following_id = ?2)`;
  const NOT_FOLLOWING = `NOT ${FOLLOWING}`;

  if (desired) {
    if (!isFollowing) {
      if (targetPrivate) {
        if (!isRequested) {
          await db.batch([
            notifyStatement(db, "follow_request", "?2", "?1", "NULL", `AND ${NOT_FOLLOWING}`, [
              userId,
              targetId,
            ]),
            db
              .prepare(
                `INSERT OR IGNORE INTO social_follow_requests (requester_id, target_id)
                 SELECT ?1, ?2 WHERE ${NOT_FOLLOWING}`
              )
              .bind(userId, targetId),
          ]);
        }
      } else {
        await db.batch([
          db
            .prepare(
              `UPDATE social_profiles SET following_count = following_count + 1
               WHERE visitor_id = ?1 AND ${NOT_FOLLOWING}`
            )
            .bind(userId, targetId),
          db
            .prepare(
              `UPDATE social_profiles SET followers_count = followers_count + 1
               WHERE visitor_id = ?2 AND ${NOT_FOLLOWING}`
            )
            .bind(userId, targetId),
          notifyStatement(db, "follow", "?2", "?1", "NULL", `AND ${NOT_FOLLOWING}`, [
            userId,
            targetId,
          ]),
          db
            .prepare("DELETE FROM social_follow_requests WHERE requester_id = ?1 AND target_id = ?2")
            .bind(userId, targetId),
          db
            .prepare("INSERT OR IGNORE INTO social_follows (follower_id, following_id) VALUES (?1, ?2)")
            .bind(userId, targetId),
        ]);
      }
    }
  } else if (isFollowing) {
    await db.batch([
      db
        .prepare(
          `UPDATE social_profiles SET following_count = MAX(0, following_count - 1)
           WHERE visitor_id = ?1 AND ${FOLLOWING}`
        )
        .bind(userId, targetId),
      db
        .prepare(
          `UPDATE social_profiles SET followers_count = MAX(0, followers_count - 1)
           WHERE visitor_id = ?2 AND ${FOLLOWING}`
        )
        .bind(userId, targetId),
      db
        .prepare("DELETE FROM social_follows WHERE follower_id = ?1 AND following_id = ?2")
        .bind(userId, targetId),
    ]);
  } else if (isRequested) {
    await db.batch([
      db
        .prepare("DELETE FROM social_follow_requests WHERE requester_id = ?1 AND target_id = ?2")
        .bind(userId, targetId),
      db
        .prepare(
          `DELETE FROM social_notifications
           WHERE recipient_id = ?2 AND actor_id = ?1 AND type = 'follow_request'`
        )
        .bind(userId, targetId),
    ]);
  }

  const fresh = await loadProfile(db, userId, { id: targetId });
  const me = await db
    .prepare("SELECT following_count FROM social_profiles WHERE visitor_id = ?1")
    .bind(userId)
    .first<Row>();
  if (!fresh) return fail(404, "Profile not found.");
  const p = profileShape(fresh, userId);

  return json({
    success: true,
    following: p.isFollowing,
    requested: p.isRequested,
    followers: p.followers,
    myFollowing: Math.max(0, num(me?.following_count)),
  });
}

async function respondToRequest(db: D1Database, userId: string, body: Row) {
  const requesterId = asVisitorId(body.requesterId);
  const accept = asBool(body.accept);
  if (!requesterId || accept === null) return fail(400, "Invalid request.");

  const REQ = `EXISTS (SELECT 1 FROM social_follow_requests WHERE requester_id = ?2 AND target_id = ?1)`;

  if (accept) {
    const NOT_FOLLOWING = `NOT EXISTS (SELECT 1 FROM social_follows WHERE follower_id = ?2 AND following_id = ?1)`;
    await db.batch([
      db
        .prepare(
          `UPDATE social_profiles SET following_count = following_count + 1
           WHERE visitor_id = ?2 AND ${REQ} AND ${NOT_FOLLOWING}`
        )
        .bind(userId, requesterId),
      db
        .prepare(
          `UPDATE social_profiles SET followers_count = followers_count + 1
           WHERE visitor_id = ?1 AND ${REQ} AND ${NOT_FOLLOWING}`
        )
        .bind(userId, requesterId),
      notifyStatement(db, "follow_accepted", "?2", "?1", "NULL", `AND ${REQ}`, [
        userId,
        requesterId,
      ]),
      db
        .prepare(
          `INSERT OR IGNORE INTO social_follows (follower_id, following_id)
           SELECT ?2, ?1 WHERE ${REQ}`
        )
        .bind(userId, requesterId),
      db
        .prepare("DELETE FROM social_follow_requests WHERE requester_id = ?2 AND target_id = ?1")
        .bind(userId, requesterId),
      db
        .prepare(
          `DELETE FROM social_notifications
           WHERE recipient_id = ?1 AND actor_id = ?2 AND type = 'follow_request'`
        )
        .bind(userId, requesterId),
    ]);
  } else {
    await db.batch([
      db
        .prepare("DELETE FROM social_follow_requests WHERE requester_id = ?2 AND target_id = ?1")
        .bind(userId, requesterId),
      db
        .prepare(
          `DELETE FROM social_notifications
           WHERE recipient_id = ?1 AND actor_id = ?2 AND type = 'follow_request'`
        )
        .bind(userId, requesterId),
    ]);
  }

  const me = await db
    .prepare("SELECT followers_count FROM social_profiles WHERE visitor_id = ?1")
    .bind(userId)
    .first<Row>();
  return json({
    success: true,
    accepted: accept,
    followers: Math.max(0, num(me?.followers_count)),
  });
}
