-- Prevent duplicate normalized Twitter/X and Instagram usernames.
-- If old duplicate rows already exist, keep the oldest passport row (lowest id)
-- and clear the duplicate username before creating the unique indexes.
-- This keeps the passport records intact instead of deleting them.

-- TWITTER / X
UPDATE fan_passports
SET twitter_username = NULL
WHERE id IN (
  SELECT id
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY lower(trim(replace(twitter_username, '@', '')))
        ORDER BY id ASC
      ) AS rn
    FROM fan_passports
    WHERE twitter_username IS NOT NULL
      AND trim(twitter_username) <> ''
  )
  WHERE rn > 1
);

-- INSTAGRAM
UPDATE fan_passports
SET instagram_username = NULL
WHERE id IN (
  SELECT id
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY lower(trim(replace(instagram_username, '@', '')))
        ORDER BY id ASC
      ) AS rn
    FROM fan_passports
    WHERE instagram_username IS NOT NULL
      AND trim(instagram_username) <> ''
  )
  WHERE rn > 1
);

-- Now create the uniqueness constraints.
CREATE UNIQUE INDEX IF NOT EXISTS idx_fan_passports_twitter_unique
ON fan_passports (
  lower(trim(replace(twitter_username, '@', '')))
)
WHERE twitter_username IS NOT NULL
  AND trim(twitter_username) <> '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_fan_passports_instagram_unique
ON fan_passports (
  lower(trim(replace(instagram_username, '@', '')))
)
WHERE instagram_username IS NOT NULL
  AND trim(instagram_username) <> '';
