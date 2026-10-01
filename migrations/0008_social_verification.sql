ALTER TABLE social_profiles ADD COLUMN verified INTEGER NOT NULL DEFAULT 0;

ALTER TABLE social_profiles ADD COLUMN verified_at TEXT;

ALTER TABLE social_profiles ADD COLUMN verified_by TEXT;

CREATE INDEX IF NOT EXISTS idx_social_profiles_verified
ON social_profiles(verified);