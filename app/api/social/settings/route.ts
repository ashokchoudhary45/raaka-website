import { getD1 } from "@/lib/d1";
import { clearSessionCookie, getCurrentUser } from "@/lib/social-auth";

export const dynamic = "force-dynamic";

const DEFAULTS = {
  privateAccount: false,
  replyPermission: "everyone" as "everyone" | "following",
  notifications: {
    push: true,
    email: false,
    likes: true,
    replies: true,
    reposts: true,
    newFollowers: true,
    mentions: true,
  },
  accessibility: {
    reduceAnimations: false,
    dataSaver: false,
    fontSize: "default" as "small" | "default" | "large",
    theme: "dark" as "dark" | "light" | "system",
    language: "en",
  },
};

type AuthResult =
  | { userId: string; response?: never }
  | { userId: null; response: Response };

async function requireUser(request: Request): Promise<AuthResult> {
  const user = await getCurrentUser(request);
  if (!user) {
    return {
      userId: null,
      response: Response.json(
        { success: false, error: "You must be logged in." },
        { status: 401 },
      ),
    };
  }
  if (!user.verifiedAt) {
    return {
      userId: null,
      response: Response.json(
        { success: false, error: "Please verify your email first." },
        { status: 403 },
      ),
    };
  }
  return { userId: user.userId };
}

function jsonError(error: string, status = 400) {
  return Response.json({ success: false, error }, { status });
}

async function ensureSettingsTable(db: D1Database) {
  // The migration creates this table. This guard gives a useful error if the
  // migration was not applied instead of silently saving preferences locally.
  const result = await db
    .prepare(
      `SELECT name FROM sqlite_master
       WHERE type = 'table' AND name = 'social_user_settings' LIMIT 1`,
    )
    .first();
  if (!result) throw new Error("Missing migration: social_user_settings");
}

async function readSettings(db: D1Database, userId: string) {
  const row = await db
    .prepare("SELECT settings_json FROM social_user_settings WHERE user_id = ? LIMIT 1")
    .bind(userId)
    .first<{ settings_json: string }>();

  let stored: any = {};
  try {
    stored = row?.settings_json ? JSON.parse(row.settings_json) : {};
  } catch {
    stored = {};
  }

  return {
    ...DEFAULTS,
    ...stored,
    notifications: { ...DEFAULTS.notifications, ...(stored.notifications || {}) },
    accessibility: { ...DEFAULTS.accessibility, ...(stored.accessibility || {}) },
  };
}

function validateSettings(input: any, current: any) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Settings object is required.");
  }

  const next = {
    ...current,
    privateAccount:
      typeof input.privateAccount === "boolean"
        ? input.privateAccount
        : current.privateAccount,
    replyPermission:
      input.replyPermission === "everyone" || input.replyPermission === "following"
        ? input.replyPermission
        : current.replyPermission,
    notifications: { ...current.notifications },
    accessibility: { ...current.accessibility },
  };

  if (input.notifications && typeof input.notifications === "object") {
    for (const key of Object.keys(DEFAULTS.notifications) as Array<keyof typeof DEFAULTS.notifications>) {
      if (typeof input.notifications[key] === "boolean") {
        next.notifications[key] = input.notifications[key];
      }
    }
  }

  if (input.accessibility && typeof input.accessibility === "object") {
    if (typeof input.accessibility.reduceAnimations === "boolean") {
      next.accessibility.reduceAnimations = input.accessibility.reduceAnimations;
    }
    if (typeof input.accessibility.dataSaver === "boolean") {
      next.accessibility.dataSaver = input.accessibility.dataSaver;
    }
    if (["small", "default", "large"].includes(input.accessibility.fontSize)) {
      next.accessibility.fontSize = input.accessibility.fontSize;
    }
    if (["dark", "light", "system"].includes(input.accessibility.theme)) {
      next.accessibility.theme = input.accessibility.theme;
    }
    if (typeof input.accessibility.language === "string") {
      next.accessibility.language = input.accessibility.language.slice(0, 12);
    }
  }
  return next;
}

export async function GET(request: Request): Promise<Response> {
  try {
    const auth = await requireUser(request);
    if (auth.userId === null) return auth.response;

    const db = getD1();
    await ensureSettingsTable(db);
    const [settings, blocked, muted, hiddenWords] = await Promise.all([
      readSettings(db, auth.userId),
      db.prepare(
        `SELECT p.visitor_id AS visitorId, p.handle, p.display_name AS displayName
         FROM social_blocks b JOIN social_profiles p ON p.visitor_id = b.target_id
         WHERE b.user_id = ? ORDER BY b.created_at DESC LIMIT 200`,
      ).bind(auth.userId).all<any>(),
      db.prepare(
        `SELECT p.visitor_id AS visitorId, p.handle, p.display_name AS displayName
         FROM social_mutes m JOIN social_profiles p ON p.visitor_id = m.target_id
         WHERE m.user_id = ? ORDER BY m.created_at DESC LIMIT 200`,
      ).bind(auth.userId).all<any>(),
      db.prepare(
        `SELECT id, word FROM social_hidden_words
         WHERE user_id = ? ORDER BY id DESC LIMIT 100`,
      ).bind(auth.userId).all<any>(),
    ]);

    return Response.json({
      success: true,
      settings,
      blocked: blocked.results,
      muted: muted.results,
      hiddenWords: hiddenWords.results,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Social settings GET error", error);
    return Response.json(
      { success: false, error: "Could not load settings. Apply the social settings migration and retry." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const auth = await requireUser(request);
    if (auth.userId === null) return auth.response;

    let body: any;
    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON request.");
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return jsonError("Invalid request body.");
    }

    const db = getD1();
    await ensureSettingsTable(db);
    const userId = auth.userId;
    const action = String(body.action || "");

    if (action === "save-settings") {
      const current = await readSettings(db, userId);
      const settings = validateSettings(body.settings, current);
      await db.prepare(
        `INSERT INTO social_user_settings (user_id, settings_json, updated_at)
         VALUES (?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(user_id) DO UPDATE SET
           settings_json = excluded.settings_json,
           updated_at = CURRENT_TIMESTAMP`,
      ).bind(userId, JSON.stringify(settings)).run();
      return Response.json({ success: true, settings });
    }

    if (action === "block" || action === "unblock" || action === "mute" || action === "unmute") {
      const targetId = typeof body.targetId === "string" ? body.targetId.slice(0, 128) : "";
      if (!targetId || targetId === userId) return jsonError("Choose a valid account.");
      const target = await db.prepare(
        "SELECT visitor_id FROM social_profiles WHERE visitor_id = ? LIMIT 1",
      ).bind(targetId).first();
      if (!target) return jsonError("Account not found.", 404);

      const isBlock = action === "block" || action === "unblock";
      const table = isBlock ? "social_blocks" : "social_mutes";
      if (action === "block" || action === "mute") {
        await db.prepare(
          `INSERT OR IGNORE INTO ${table} (user_id, target_id) VALUES (?, ?)`,
        ).bind(userId, targetId).run();
        if (action === "block") {
          await db.batch([
            db.prepare("DELETE FROM social_follows WHERE follower_id = ? AND following_id = ?").bind(userId, targetId),
            db.prepare("DELETE FROM social_follows WHERE follower_id = ? AND following_id = ?").bind(targetId, userId),
          ]);
        }
      } else {
        await db.prepare(
          `DELETE FROM ${table} WHERE user_id = ? AND target_id = ?`,
        ).bind(userId, targetId).run();
      }
      return Response.json({ success: true, action, targetId });
    }

    if (action === "add-hidden-word") {
      const word = typeof body.word === "string" ? body.word.trim().slice(0, 80) : "";
      if (!word) return jsonError("Enter a word or phrase.");
      await db.prepare(
        "INSERT OR IGNORE INTO social_hidden_words (user_id, word) VALUES (?, ?)",
      ).bind(userId, word).run();
      return Response.json({ success: true });
    }

    if (action === "remove-hidden-word") {
      const id = Number(body.id);
      if (!Number.isSafeInteger(id) || id < 1) return jsonError("Invalid hidden-word item.");
      await db.prepare(
        "DELETE FROM social_hidden_words WHERE id = ? AND user_id = ?",
      ).bind(id, userId).run();
      return Response.json({ success: true });
    }

    if (action === "logout-all") {
      await db.prepare("DELETE FROM social_auth_sessions WHERE user_id = ?")
        .bind(userId).run();
      const response = Response.json({ success: true, message: "All sessions have been signed out." });
      response.headers.set("Set-Cookie", clearSessionCookie());
      return response;
    }

    if (action === "export-data") {
      const [profile, posts, follows, likes, bookmarks, settings] = await Promise.all([
        db.prepare("SELECT handle, display_name, bio, followers_count, following_count, posts_count FROM social_profiles WHERE visitor_id = ? LIMIT 1").bind(userId).first(),
        db.prepare("SELECT id, body, created_at, reply_to_id, repost_of_id FROM social_posts WHERE visitor_id = ? ORDER BY id DESC LIMIT 1000").bind(userId).all(),
        db.prepare("SELECT following_id, created_at FROM social_follows WHERE follower_id = ? LIMIT 2000").bind(userId).all(),
        db.prepare("SELECT post_id, created_at FROM social_likes WHERE visitor_id = ? LIMIT 5000").bind(userId).all(),
        db.prepare("SELECT post_id, created_at FROM social_bookmarks WHERE visitor_id = ? LIMIT 5000").bind(userId).all(),
        readSettings(db, userId),
      ]);
      return Response.json({
        success: true,
        exportedAt: new Date().toISOString(),
        data: { profile, posts: posts.results, following: follows.results, likes: likes.results, bookmarks: bookmarks.results, settings },
      }, { headers: { "Cache-Control": "no-store" } });
    }

    return jsonError("Unknown settings action.");
  } catch (error) {
    console.error("Social settings POST error", error);
    return Response.json(
      { success: false, error: "Settings request failed. Confirm the migration has been applied." },
      { status: 500 },
    );
  }
}
