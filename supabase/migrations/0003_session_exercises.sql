CREATE TABLE session_exercises (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  check_in_id   uuid REFERENCES check_ins(id) ON DELETE CASCADE NOT NULL,
  exercise_name text NOT NULL,
  muscle_group  text NOT NULL,
  weight        numeric NOT NULL
);
