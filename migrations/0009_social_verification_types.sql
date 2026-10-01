ALTER TABLE social_profiles ADD COLUMN verification_type TEXT NOT NULL DEFAULT 'none';

ALTER TABLE social_profiles ADD COLUMN verification_label TEXT;

CREATE INDEX IF NOT EXISTS idx_social_profiles_verification_type
ON social_profiles(verification_type);