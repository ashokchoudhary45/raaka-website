-- RAAKA Social hardening migration (Cloudflare D1 / SQLite)
--
-- RUN THIS BEFORE DEPLOYING THE NEW route.ts.
--   wrangler d1 execute <DB_NAME> --remote --file=./social_hardening.sql
--
-- Before running, inspect what already exists so nothing is duplicated:
--   wrangler d1 execute <DB_NAME> --remote --command "SELECT name, tbl_name, sql FROM sqlite_master WHERE tbl_name LIKE 'social_%' ORDER BY tbl_name, type"
--
-- NOTES
--  * ALTER TABLE ... ADD COLUMN has no IF NOT EXISTS in SQLite. If a column
--    already exists, that single statement errors with "duplicate column
--    name": delete that line and re-run. Every other statement is idempotent.
--  * Existing duplicate rows are removed BEFORE UNIQUE indexes are created,
--    and denormalised counters are recomputed once at the end.
--  * Index names are explicit (idx_social_*). If your schema already has an
--    equivalent PRIMARY KEY / UNIQUE constraint the extra index is harmless.

-- 1) New columns -------------------------------------------------------------

ALTER TABLE social_profiles ADD COLUMN is_private INTEGER NOT NULL DEFAULT 0;
ALTER TABLE social_profiles ADD COLUMN reply_permission TEXT NOT NULL DEFAULT 'everyone';
ALTER TABLE social_profiles ADD COLUMN notify_enabled INTEGER NOT NULL DEFAULT 1;
ALTER TABLE social_profiles ADD COLUMN notify_likes INTEGER NOT NULL DEFAULT 1;
ALTER TABLE social_profiles ADD COLUMN notify_replies INTEGER NOT NULL DEFAULT 1;
ALTER TABLE social_profiles ADD COLUMN notify_reposts INTEGER NOT NULL DEFAULT 1;
ALTER TABLE social_profiles ADD COLUMN notify_follows INTEGER NOT NULL DEFAULT 1;
ALTER TABLE social_profiles ADD COLUMN email_notifications INTEGER NOT NULL DEFAULT 0;
ALTER TABLE social_profiles ADD COLUMN ui_prefs TEXT;
-- Everything with id <= this value counts as "read". One tiny write marks all read.
ALTER TABLE social_profiles ADD COLUMN notifications_seen_id INTEGER NOT NULL DEFAULT 0;

-- 2) Follow requests (private accounts) ---------------------------------------

CREATE TABLE IF NOT EXISTS social_follow_requests (
  requester_id TEXT NOT NULL,
  target_id    TEXT NOT NULL,
  created_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (requester_id, target_id)
);
CREATE INDEX IF NOT EXISTS idx_social_follow_requests_target
  ON social_follow_requests (target_id, requester_id);

-- 3) Remove orphans and duplicates so UNIQUE indexes can be created ------------

DELETE FROM social_likes
 WHERE post_id NOT IN (SELECT id FROM social_posts);
DELETE FROM social_bookmarks
 WHERE post_id NOT IN (SELECT id FROM social_posts);
DELETE FROM social_notifications
 WHERE post_id IS NOT NULL AND post_id NOT IN (SELECT id FROM social_posts);

DELETE FROM social_likes
 WHERE rowid NOT IN (SELECT MIN(rowid) FROM social_likes GROUP BY visitor_id, post_id);
DELETE FROM social_bookmarks
 WHERE rowid NOT IN (SELECT MIN(rowid) FROM social_bookmarks GROUP BY visitor_id, post_id);
DELETE FROM social_follows
 WHERE rowid NOT IN (SELECT MIN(rowid) FROM social_follows GROUP BY follower_id, following_id);
DELETE FROM social_follows
 WHERE follower_id = following_id;

-- keep the first repost per (user, original); later duplicates are removed
DELETE FROM social_posts
 WHERE repost_of_id IS NOT NULL
   AND id NOT IN (
     SELECT MIN(id) FROM social_posts
      WHERE repost_of_id IS NOT NULL
      GROUP BY visitor_id, repost_of_id
   );

-- identical notifications (same recipient/actor/type/post) collapse to one
DELETE FROM social_notifications
 WHERE id NOT IN (
   SELECT MIN(id) FROM social_notifications
    GROUP BY recipient_id, actor_id, type, IFNULL(post_id, 0)
 );

-- 4) UNIQUE constraints (the real duplicate-row guarantee) ---------------------

CREATE UNIQUE INDEX IF NOT EXISTS idx_social_likes_unique
  ON social_likes (visitor_id, post_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_social_bookmarks_unique
  ON social_bookmarks (visitor_id, post_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_social_follows_unique
  ON social_follows (follower_id, following_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_social_reposts_unique
  ON social_posts (visitor_id, repost_of_id) WHERE repost_of_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_social_notifications_unique
  ON social_notifications (recipient_id, actor_id, type, IFNULL(post_id, 0));
CREATE UNIQUE INDEX IF NOT EXISTS idx_social_profiles_handle_nocase
  ON social_profiles (handle COLLATE NOCASE);
CREATE UNIQUE INDEX IF NOT EXISTS idx_social_profiles_visitor
  ON social_profiles (visitor_id);

-- 5) Performance indexes --------------------------------------------------------

-- social_profiles(handle) is served by idx_social_profiles_handle_nocase above.
-- social_profiles(visitor_id)      -> idx_social_profiles_visitor
-- social_follows(follower_id, following_id) -> idx_social_follows_unique
-- social_likes(visitor_id, post_id)         -> idx_social_likes_unique
-- social_bookmarks(visitor_id, post_id)     -> idx_social_bookmarks_unique
-- social_posts(id) is the INTEGER PRIMARY KEY (rowid), no extra index needed.

CREATE INDEX IF NOT EXISTS idx_social_posts_visitor_id_id
  ON social_posts (visitor_id, id);
CREATE INDEX IF NOT EXISTS idx_social_posts_reply_to
  ON social_posts (reply_to_id, id) WHERE reply_to_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_social_posts_repost_of
  ON social_posts (repost_of_id) WHERE repost_of_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_social_follows_following_follower
  ON social_follows (following_id, follower_id);
CREATE INDEX IF NOT EXISTS idx_social_likes_post
  ON social_likes (post_id);
CREATE INDEX IF NOT EXISTS idx_social_bookmarks_post
  ON social_bookmarks (post_id);
CREATE INDEX IF NOT EXISTS idx_social_notifications_recipient_id
  ON social_notifications (recipient_id, id);
CREATE INDEX IF NOT EXISTS idx_social_notifications_post
  ON social_notifications (post_id) WHERE post_id IS NOT NULL;

-- 6) One-time counter reconciliation (full scans; runs once, never at request time)

UPDATE social_posts SET
  likes_count   = (SELECT COUNT(*) FROM social_likes l WHERE l.post_id = social_posts.id),
  replies_count = (SELECT COUNT(*) FROM social_posts r WHERE r.reply_to_id = social_posts.id),
  reposts_count = (SELECT COUNT(*) FROM social_posts r WHERE r.repost_of_id = social_posts.id);

UPDATE social_profiles SET
  followers_count = (SELECT COUNT(*) FROM social_follows f WHERE f.following_id = social_profiles.visitor_id),
  following_count = (SELECT COUNT(*) FROM social_follows f WHERE f.follower_id = social_profiles.visitor_id),
  posts_count     = (SELECT COUNT(*) FROM social_posts p WHERE p.visitor_id = social_profiles.visitor_id);

-- Existing notifications are treated as already read after upgrade.
UPDATE social_profiles SET notifications_seen_id = COALESCE(
  (SELECT MAX(id) FROM social_notifications n WHERE n.recipient_id = social_profiles.visitor_id), 0);
