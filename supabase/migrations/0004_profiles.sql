CREATE TABLE profiles (
  user_id     uuid PRIMARY KEY REFERENCES auth.users,
  best_streak int NOT NULL DEFAULT 0
);
