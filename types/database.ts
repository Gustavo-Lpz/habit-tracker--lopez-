export type FrequencyType = 'daily' | 'weekly'
export type CheckInType = 'training' | 'rest'
export type BadgeType = 'week_1' | 'days_30'

export interface Habit {
  id: string
  user_id: string
  name: string
  description: string | null
  frequency_type: FrequencyType
  frequency_count: number | null
  deleted_at: string | null
  created_at: string
}

export interface CheckIn {
  id: string
  user_id: string
  habit_id: string
  date: string
  type: CheckInType
  created_at: string
}

export interface SessionExercise {
  id: string
  check_in_id: string
  exercise_name: string
  muscle_group: string
  weight: number
}

export interface Profile {
  user_id: string
  best_streak: number
}

export interface Badge {
  id: string
  user_id: string
  badge_type: BadgeType
  unlocked_at: string
}

export interface HabitInsert {
  name: string
  description?: string | null
  frequency_type: FrequencyType
  frequency_count?: number | null
}

export interface CheckInInsert {
  habit_id: string
  date: string
  type: CheckInType
}

export interface SessionExerciseInsert {
  exercise_name: string
  muscle_group: string
  weight: number
}

export interface HistoryEntry {
  check_in_id: string
  date: string
  habit_name: string
  exercises: SessionExercise[]
}
