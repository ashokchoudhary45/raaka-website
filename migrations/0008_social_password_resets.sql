-- One active reset token per user. Store only the SHA-256 token hash.
CREATE TABLE IF NOT EXISTS social_password_resets (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES social_auth_users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_social_password_resets_user_id
  ON social_password_resets(user_id);

CREATE INDEX IF NOT EXISTS idx_social_password_resets_expires_at
  ON social_password_resets(expires_at);
