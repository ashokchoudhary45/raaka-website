CREATE INDEX IF NOT EXISTS idx_fan_passports_leaderboard
ON fan_passports (quizzes_played, visitor_id);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_visitor_date
ON quiz_attempts (visitor_id, quiz_date DESC);