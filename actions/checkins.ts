'use server'

import { createServerClient } from '@/lib/supabase/server'
import type { CheckInType, SessionExerciseInsert } from '@/types/database'

interface CreateCheckInParams {
  habitId: string
  date: string
  type: CheckInType
  exercises?: SessionExerciseInsert[]
}

export async function createCheckIn(
  params: CreateCheckInParams
): Promise<{ success: true } | { error: string }> {
  const supabase = await createServerClient()

  const { data: { user }, error: sessionError } = await supabase.auth.getUser()
  if (sessionError || !user) return { error: 'No autenticado' }

  // Verificar que el hábito pertenece al usuario y no está eliminado (bloquea IDOR)
  const { data: habit } = await supabase
    .from('habits')
    .select('id')
    .eq('id', params.habitId)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!habit) return { error: 'Hábito no válido' }

  // Verificar unicidad antes de insertar para mejor UX
  const { data: existing } = await supabase
    .from('check_ins')
    .select('id')
    .eq('user_id', user.id)
    .eq('habit_id', params.habitId)
    .eq('date', params.date)
    .single()

  if (existing) return { error: 'Ya existe un check-in para esta fecha y hábito' }

  // Insertar check-in
  const { data: checkIn, error: insertError } = await supabase
    .from('check_ins')
    .insert({
      user_id: user.id,
      habit_id: params.habitId,
      date: params.date,
      type: params.type,
    })
    .select('id')
    .single()

  if (insertError || !checkIn) {
    return { error: insertError?.message ?? 'Error al guardar el check-in' }
  }

  // Insertar ejercicios si es entrenamiento
  if (params.type === 'training' && params.exercises && params.exercises.length > 0) {
    const exerciseRows = params.exercises.map((ex) => ({
      check_in_id: checkIn.id,
      exercise_name: ex.exercise_name,
      muscle_group: ex.muscle_group,
      weight: ex.weight,
    }))

    const { error: exError } = await supabase
      .from('session_exercises')
      .insert(exerciseRows)

    if (exError) return { error: exError.message }
  }

  return { success: true }
}
