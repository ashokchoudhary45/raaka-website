CREATE TABLE IF NOT EXISTS social_profiles (
  visitor_id TEXT PRIMARY KEY,
  handle TEXT NOT NULL UNIQUE COLLATE NOCASE,
  display_name TEXT NOT NULL,
  bio TEXT NOT NULL DEFAULT '',
  followers_count INTEGER NOT NULL DEFAULT 0,
  following_count INTEGER NOT NULL DEFAULT 0,
  posts_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_social_profiles_handle ON social_profiles(handle COLLATE NOCASE);

CREATE TABLE IF NOT EXISTS social_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT NOT NULL,
  body TEXT NOT NULL,
  reply_to_id INTEGER,
  repost_of_id INTEGER,
  likes_count INTEGER NOT NULL DEFAULT 0,
  replies_count INTEGER NOT NULL DEFAULT 0,
  reposts_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(visitor_id) REFERENCES social_profiles(visitor_id) ON DELETE CASCADE,
  FOREIGN KEY(reply_to_id) REFERENCES social_posts(id) ON DELETE SET NULL,
  FOREIGN KEY(repost_of_id) REFERENCES social_posts(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_social_posts_created ON social_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_posts_user ON social_posts(visitor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_posts_reply ON social_posts(reply_to_id, created_at ASC);

CREATE TABLE IF NOT EXISTS social_likes (
  visitor_id TEXT NOT NULL,
  post_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(visitor_id, post_id),
  FOREIGN KEY(visitor_id) REFERENCES social_profiles(visitor_id) ON DELETE CASCADE,
  FOREIGN KEY(post_id) REFERENCES social_posts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS social_follows (
  follower_id TEXT NOT NULL,
  following_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(follower_id, following_id),
  CHECK(follower_id <> following_id),
  FOREIGN KEY(follower_id) REFERENCES social_profiles(visitor_id) ON DELETE CASCADE,
  FOREIGN KEY(following_id) REFERENCES social_profiles(visitor_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_social_follows_following ON social_follows(following_id);

CREATE TABLE IF NOT EXISTS social_bookmarks (
  visitor_id TEXT NOT NULL,
  post_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(visitor_id, post_id),
  FOREIGN KEY(visitor_id) REFERENCES social_profiles(visitor_id) ON DELETE CASCADE,
  FOREIGN KEY(post_id) REFERENCES social_posts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS social_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipient_id TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  type TEXT NOT NULL,
  post_id INTEGER,
  read_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(recipient_id) REFERENCES social_profiles(visitor_id) ON DELETE CASCADE,
  FOREIGN KEY(actor_id) REFERENCES social_profiles(visitor_id) ON DELETE CASCADE,
  FOREIGN KEY(post_id) REFERENCES social_posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_social_notifications_recipient ON social_notifications(recipient_id, created_at DESC);
