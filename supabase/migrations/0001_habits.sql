CREATE TABLE habits (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users NOT NULL,
  name            text NOT NULL,
  description     text CHECK (length(description) <= 200),
  frequency_type  text NOT NULL CHECK (frequency_type IN ('daily', 'weekly')),
  frequency_count int,
  deleted_at      timestamptz,
  created_at      timestamptz DEFAULT now()
);
