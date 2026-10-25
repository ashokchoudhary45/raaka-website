PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS boxoffice_movies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  language TEXT,
  release_date TEXT,
  budget_amount REAL,
  budget_currency TEXT NOT NULL DEFAULT 'INR',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS boxoffice_daily_collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  movie_id INTEGER NOT NULL REFERENCES boxoffice_movies(id) ON DELETE CASCADE,
  collection_date TEXT NOT NULL,
  territory TEXT NOT NULL DEFAULT 'India',
  metric TEXT NOT NULL CHECK(metric IN ('net','gross','overseas','worldwide')),
  amount REAL NOT NULL CHECK(amount >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  is_estimate INTEGER NOT NULL DEFAULT 1 CHECK(is_estimate IN (0,1)),
  source_name TEXT NOT NULL,
  source_url TEXT,
  source_updated_at TEXT,
  imported_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(movie_id, collection_date, territory, metric, source_name)
);
CREATE INDEX IF NOT EXISTS idx_bo_daily_movie_date
  ON boxoffice_daily_collections(movie_id, collection_date DESC);

CREATE TABLE IF NOT EXISTS boxoffice_booking_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  movie_id INTEGER NOT NULL REFERENCES boxoffice_movies(id) ON DELETE CASCADE,
  captured_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  territory TEXT NOT NULL DEFAULT 'India',
  tickets_sold INTEGER CHECK(tickets_sold IS NULL OR tickets_sold >= 0),
  collection_amount REAL CHECK(collection_amount IS NULL OR collection_amount >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  shows_count INTEGER CHECK(shows_count IS NULL OR shows_count >= 0),
  source_name TEXT NOT NULL,
  source_url TEXT
);
CREATE INDEX IF NOT EXISTS idx_bo_booking_latest
  ON boxoffice_booking_snapshots(movie_id, captured_at DESC);

CREATE TABLE IF NOT EXISTS boxoffice_occupancy_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  movie_id INTEGER NOT NULL REFERENCES boxoffice_movies(id) ON DELETE CASCADE,
  captured_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  territory TEXT NOT NULL DEFAULT 'India',
  city TEXT,
  occupancy_percent REAL CHECK(occupancy_percent IS NULL OR (occupancy_percent >= 0 AND occupancy_percent <= 100)),
  shows_count INTEGER CHECK(shows_count IS NULL OR shows_count >= 0),
  source_name TEXT NOT NULL,
  source_url TEXT
);
CREATE INDEX IF NOT EXISTS idx_bo_occupancy_latest
  ON boxoffice_occupancy_snapshots(movie_id, captured_at DESC);
