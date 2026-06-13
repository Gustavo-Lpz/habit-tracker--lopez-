import { createBrowserClient } from '@/lib/supabase/browser'
import type { HistoryEntry } from '@/types/database'

export async function fetchHistory(): Promise<HistoryEntry[]> {
  const supabase = createBrowserClient()

  const { data: checkIns } = await supabase
    .from('check_ins')
    .select('id, date, habit_id, habits(name)')
    .eq('type', 'training')
    .order('date', { ascending: false })

  if (!checkIns || checkIns.length === 0) return []

  const checkInIds = checkIns.map((c) => c.id)

  const { data: exercises } = await supabase
    .from('session_exercises')
    .select('*')
    .in('check_in_id', checkInIds)

  return checkIns.map((c) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const habitData = c.habits as any
    const habitName: string =
      habitData && typeof habitData === 'object' && 'name' in habitData
        ? String(habitData.name)
        : Array.isArray(habitData) && habitData.length > 0
          ? String(habitData[0].name)
          : '(hábito eliminado)'
    return {
      check_in_id: c.id,
      date: c.date,
      habit_name: habitName,
      exercises: (exercises ?? []).filter((ex) => ex.check_in_id === c.id),
    }
  })
}
