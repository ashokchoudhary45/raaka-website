-- RAAKA Social: move reposts out of social_posts and into a relation table.
-- This prevents reposts from creating duplicate timeline posts.

CREATE TABLE IF NOT EXISTS social_reposts (
  visitor_id TEXT NOT NULL,
  post_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(visitor_id, post_id),
  FOREIGN KEY(visitor_id) REFERENCES social_profiles(visitor_id) ON DELETE CASCADE,
  FOREIGN KEY(post_id) REFERENCES social_posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_social_reposts_post
  ON social_reposts(post_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_social_reposts_user
  ON social_reposts(visitor_id, created_at DESC);

-- Preserve any reposts created by the old implementation before removing
-- the duplicate repost-post rows.
INSERT OR IGNORE INTO social_reposts (visitor_id, post_id, created_at)
SELECT visitor_id, repost_of_id, created_at
FROM social_posts
WHERE repost_of_id IS NOT NULL
  AND repost_of_id <> id;

-- Recalculate every post's repost counter from the canonical relation table.
UPDATE social_posts
SET reposts_count = (
  SELECT COUNT(*)
  FROM social_reposts r
  WHERE r.post_id = social_posts.id
);

-- Old repost rows were counted as posts for their author. Remove that count
-- before deleting the duplicate rows.
UPDATE social_profiles
SET posts_count = MAX(
  0,
  posts_count - (
    SELECT COUNT(*)
    FROM social_posts old_reposts
    WHERE old_reposts.visitor_id = social_profiles.visitor_id
      AND old_reposts.repost_of_id IS NOT NULL
  )
)
WHERE visitor_id IN (
  SELECT DISTINCT visitor_id
  FROM social_posts
  WHERE repost_of_id IS NOT NULL
);

DELETE FROM social_posts
WHERE repost_of_id IS NOT NULL;
