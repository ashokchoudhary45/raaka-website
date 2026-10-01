-- RAAKA live analytics performance indexes
-- Run once against the remote D1 database.
-- These match the WHERE/GROUP BY patterns used by /api/live.

CREATE INDEX IF NOT EXISTS idx_live_visitors_last_seen
ON live_visitors(last_seen);

CREATE INDEX IF NOT EXISTS idx_live_visitors_last_seen_page
ON live_visitors(last_seen, page);

CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at
ON page_views(viewed_at);

CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at_visitor
ON page_views(viewed_at, visitor_id);
