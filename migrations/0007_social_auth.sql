CREATE TABLE IF NOT EXISTS social_auth_users (
  user_id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  verified_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_social_auth_users_email
ON social_auth_users(email COLLATE NOCASE);


CREATE TABLE IF NOT EXISTS social_auth_sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES social_auth_users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_social_auth_sessions_user
ON social_auth_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_social_auth_sessions_expires
ON social_auth_sessions(expires_at);


CREATE TABLE IF NOT EXISTS social_email_verifications (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES social_auth_users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_social_email_verifications_user
ON social_email_verifications(user_id);

CREATE INDEX IF NOT EXISTS idx_social_email_verifications_expires
ON social_email_verifications(expires_at);