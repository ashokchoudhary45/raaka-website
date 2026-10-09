-- RAAKA Social account settings and privacy relationships.
-- Apply with: npx wrangler d1 migrations apply raaka-db --remote

CREATE TABLE IF NOT EXISTS social_user_settings (
  user_id TEXT PRIMARY KEY,
  settings_json TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS social_blocks (
  user_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, target_id)
);
CREATE INDEX IF NOT EXISTS idx_social_blocks_target ON social_blocks(target_id, user_id);

CREATE TABLE IF NOT EXISTS social_mutes (
  user_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, target_id)
);
CREATE INDEX IF NOT EXISTS idx_social_mutes_target ON social_mutes(target_id, user_id);

CREATE TABLE IF NOT EXISTS social_hidden_words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  word TEXT NOT NULL COLLATE NOCASE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, word)
);
CREATE INDEX IF NOT EXISTS idx_social_hidden_words_user ON social_hidden_words(user_id, id DESC);
