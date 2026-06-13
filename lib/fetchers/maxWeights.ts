import { createBrowserClient } from '@/lib/supabase/browser'

export interface MaxWeight {
  exercise_name: string
  max_weight: number
}

export async function fetchMaxWeights(): Promise<MaxWeight[]> {
  const supabase = createBrowserClient()

  const { data: exercises } = await supabase
    .from('session_exercises')
    .select('exercise_name, weight, check_ins(user_id)')

  if (!exercises) return []

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Filtrar por usuario y calcular max por ejercicio (case-sensitive, igual que Postgres)
  const byExercise = new Map<string, number>()
  for (const ex of exercises) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const checkIn = ex.check_ins as any
    const userId = Array.isArray(checkIn) ? checkIn[0]?.user_id : checkIn?.user_id
    if (userId !== user.id) continue

    const current = byExercise.get(ex.exercise_name) ?? 0
    if (Number(ex.weight) > current) {
      byExercise.set(ex.exercise_name, Number(ex.weight))
    }
  }

  return Array.from(byExercise.entries())
    .map(([exercise_name, max_weight]) => ({ exercise_name, max_weight }))
    .sort((a, b) => a.exercise_name.localeCompare(b.exercise_name))
}
