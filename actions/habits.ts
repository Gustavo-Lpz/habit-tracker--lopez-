'use server'

import { createServerClient } from '@/lib/supabase/server'
import type { FrequencyType } from '@/types/database'

interface HabitPayload {
  name: string
  description?: string | null
  frequency_type: FrequencyType
  frequency_count?: number | null
}

export async function createHabit(data: HabitPayload): Promise<{ error?: string }> {
  const supabase = await createServerClient()

  const { data: { user }, error: sessionError } = await supabase.auth.getUser()
  if (sessionError || !user) return { error: 'No autenticado' }

  if (!data.name.trim()) return { error: 'El nombre es obligatorio' }
  if (data.description && data.description.length > 200) {
    return { error: 'La descripción no puede superar 200 caracteres' }
  }

  const { error } = await supabase.from('habits').insert({
    user_id: user.id,
    name: data.name.trim(),
    description: data.description ?? null,
    frequency_type: data.frequency_type,
    frequency_count: data.frequency_count ?? null,
  })

  if (error) return { error: error.message }
  return {}
}

export async function updateHabit(
  id: string,
  data: Partial<HabitPayload>
): Promise<{ error?: string }> {
  const supabase = await createServerClient()

  const { data: { user }, error: sessionError } = await supabase.auth.getUser()
  if (sessionError || !user) return { error: 'No autenticado' }

  if (data.name !== undefined && !data.name.trim()) {
    return { error: 'El nombre es obligatorio' }
  }
  if (data.description && data.description.length > 200) {
    return { error: 'La descripción no puede superar 200 caracteres' }
  }

  const { error } = await supabase
    .from('habits')
    .update({
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.frequency_type !== undefined && { frequency_type: data.frequency_type }),
      ...(data.frequency_count !== undefined && { frequency_count: data.frequency_count }),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  return {}
}

export async function deleteHabit(id: string): Promise<{ error?: string }> {
  const supabase = await createServerClient()

  const { data: { user }, error: sessionError } = await supabase.auth.getUser()
  if (sessionError || !user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('habits')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  return {}
}
