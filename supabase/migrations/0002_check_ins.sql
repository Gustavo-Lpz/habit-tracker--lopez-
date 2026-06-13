CREATE TABLE check_ins (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL,
  habit_id    uuid REFERENCES habits(id) NOT NULL,
  date        date NOT NULL,
  type        text NOT NULL CHECK (type IN ('training', 'rest')),
  created_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, habit_id, date)
);
