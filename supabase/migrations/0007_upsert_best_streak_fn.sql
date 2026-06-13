CREATE OR REPLACE FUNCTION upsert_best_streak(p_user_id uuid, p_streak int)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (user_id, best_streak)
  VALUES (p_user_id, p_streak)
  ON CONFLICT (user_id)
  DO UPDATE SET best_streak = GREATEST(profiles.best_streak, EXCLUDED.best_streak);
END;
$$;
