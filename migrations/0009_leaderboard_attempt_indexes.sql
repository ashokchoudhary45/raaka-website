-- Reduce leaderboard scan cost and speed up latest-attempt lookup.

CREATE INDEX IF NOT EXISTS idx_fan_passports_leaderboard
ON fan_passports (
  quizzes_played,
  quiz_score DESC,
  xp DESC,
  updated_at DESC
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_visitor_latest
ON quiz_attempts (
  visitor_id,
  quiz_date DESC,
  id DESC
);
