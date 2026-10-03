CREATE INDEX IF NOT EXISTS idx_quiz_attempts_visitor_date_id
ON quiz_attempts (
  visitor_id,
  quiz_date DESC,
  id DESC
);