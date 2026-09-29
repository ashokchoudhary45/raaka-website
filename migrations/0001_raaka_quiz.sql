-- ============================================
-- WORLD OF RAAKA
-- D1 DATABASE - DAILY QUIZ + FAN PASSPORT
-- Migration: 0001_raaka_quiz
-- ============================================

PRAGMA foreign_keys = ON;


-- ============================================
-- 1. FAN PASSPORTS
-- ============================================

CREATE TABLE IF NOT EXISTS fan_passports (
    id TEXT PRIMARY KEY,
    visitor_id TEXT NOT NULL UNIQUE,

    passport_code TEXT NOT NULL UNIQUE,
    fan_name TEXT NOT NULL,

    twitter_username TEXT,
    country TEXT,

    xp INTEGER NOT NULL DEFAULT 50,
    level INTEGER NOT NULL DEFAULT 1,

    quiz_score INTEGER NOT NULL DEFAULT 0,
    quizzes_played INTEGER NOT NULL DEFAULT 0,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fan_passports_visitor
ON fan_passports(visitor_id);

CREATE INDEX IF NOT EXISTS idx_fan_passports_score
ON fan_passports(quiz_score DESC);

CREATE INDEX IF NOT EXISTS idx_fan_passports_xp
ON fan_passports(xp DESC);


-- ============================================
-- 2. QUIZ QUESTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS quiz_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    question TEXT NOT NULL,

    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,

    correct_answer TEXT NOT NULL
        CHECK(correct_answer IN ('A', 'B', 'C', 'D')),

    explanation TEXT,

    active INTEGER NOT NULL DEFAULT 1,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- 3. DAILY QUIZ
-- ============================================

CREATE TABLE IF NOT EXISTS quiz_daily (
    quiz_date TEXT PRIMARY KEY,

    question_ids TEXT NOT NULL,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- 4. QUIZ ATTEMPTS
-- ============================================

CREATE TABLE IF NOT EXISTS quiz_attempts (
    id TEXT PRIMARY KEY,

    visitor_id TEXT NOT NULL,

    quiz_date TEXT NOT NULL,

    score INTEGER NOT NULL DEFAULT 0,
    correct_answers INTEGER NOT NULL DEFAULT 0,

    total_questions INTEGER NOT NULL DEFAULT 10,

    xp_earned INTEGER NOT NULL DEFAULT 0,

    time_taken INTEGER,

    completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_visitor
ON quiz_attempts(visitor_id);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_date
ON quiz_attempts(quiz_date);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_score
ON quiz_attempts(score DESC);


-- ============================================
-- 5. FAN PASSPORT ACHIEVEMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS fan_passport_achievements (
    id TEXT PRIMARY KEY,

    visitor_id TEXT NOT NULL,

    achievement_key TEXT NOT NULL,

    earned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(visitor_id, achievement_key)
);

CREATE INDEX IF NOT EXISTS idx_passport_achievements_visitor
ON fan_passport_achievements(visitor_id);


-- ============================================
-- 6. QUIZ STREAK
-- ============================================

CREATE TABLE IF NOT EXISTS quiz_streaks (
    visitor_id TEXT PRIMARY KEY,

    current_streak INTEGER NOT NULL DEFAULT 0,

    longest_streak INTEGER NOT NULL DEFAULT 0,

    last_quiz_date TEXT,

    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- 7. TWITTER PROFILE CACHE
-- ============================================

CREATE TABLE IF NOT EXISTS twitter_profiles (
    username TEXT PRIMARY KEY,

    display_name TEXT,

    profile_image_url TEXT,

    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- 8. QUIZ LEADERBOARD INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_leaderboard_score
ON fan_passports(quiz_score DESC, updated_at ASC);

CREATE INDEX IF NOT EXISTS idx_leaderboard_xp
ON fan_passports(xp DESC);


-- ============================================
-- END
-- ============================================