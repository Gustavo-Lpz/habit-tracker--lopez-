'use server'

import { createServerClient } from '@/lib/supabase/server'

export async function updateBestStreak(currentStreak: number): Promise<void> {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // UPSERT con GREATEST — nunca decrementa
  await supabase.rpc('upsert_best_streak', {
    p_user_id: user.id,
    p_streak: currentStreak,
  })
}
