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