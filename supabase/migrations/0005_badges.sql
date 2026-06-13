CREATE TABLE badges (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL,
  badge_type  text NOT NULL CHECK (badge_type IN ('week_1', 'days_30')),
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_type)
);
