'use server'

import { createServerClient } from '@/lib/supabase/server'

interface ExerciseInput {
  exercise_name: string
  muscle_group: string
  weight: number
}

export async function updateExercises(
  checkInId: string,
  exercises: ExerciseInput[]
): Promise<{ error?: string }> {
  const supabase = await createServerClient()

  const { data: { user }, error: sessionError } = await supabase.auth.getUser()
  if (sessionError || !user) return { error: 'No autenticado' }

  // Verificar que el check-in pertenece al usuario (bloquea IDOR)
  const { data: checkIn } = await supabase
    .from('check_ins')
    .select('id')
    .eq('id', checkInId)
    .eq('user_id', user.id)
    .single()

  if (!checkIn) return { error: 'Check-in no válido' }

  // Borrar los ejercicios actuales y reinsertar la lista actualizada
  const { error: deleteError } = await supabase
    .from('session_exercises')
    .delete()
    .eq('check_in_id', checkInId)

  if (deleteError) return { error: deleteError.message }

  if (exercises.length > 0) {
    const rows = exercises.map((ex) => ({
      check_in_id: checkInId,
      exercise_name: ex.exercise_name.trim(),
      muscle_group: ex.muscle_group.trim(),
      weight: ex.weight,
    }))

    const { error: insertError } = await supabase
      .from('session_exercises')
      .insert(rows)

    if (insertError) return { error: insertError.message }
  }

  return {}
}
