-- Enable RLS on all tables
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- habits policies
CREATE POLICY "habits_select" ON habits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "habits_insert" ON habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "habits_update" ON habits
  FOR UPDATE USING (auth.uid() = user_id);

-- check_ins policies
CREATE POLICY "check_ins_select" ON check_ins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "check_ins_insert" ON check_ins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- session_exercises policies (via check_ins)
CREATE POLICY "session_exercises_select" ON session_exercises
  FOR SELECT USING (
    check_in_id IN (
      SELECT id FROM check_ins WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "session_exercises_insert" ON session_exercises
  FOR INSERT WITH CHECK (
    check_in_id IN (
      SELECT id FROM check_ins WHERE user_id = auth.uid()
    )
  );

-- profiles policies
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "profiles_upsert" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- badges policies
CREATE POLICY "badges_select" ON badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "badges_insert" ON badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);
