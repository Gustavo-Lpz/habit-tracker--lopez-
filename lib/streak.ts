import type { CheckIn } from '@/types/database'

export function calculateStreak(checkIns: CheckIn[]): number {
  const trainingDates = checkIns
    .filter((c) => c.type === 'training')
    .map((c) => c.date)

  if (trainingDates.length === 0) return 0

  // Deduplicar y ordenar descendente
  const sorted = [...new Set(trainingDates)].sort((a, b) => (a > b ? -1 : 1))

  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  // La racha debe incluir hoy o ayer; si el check-in más reciente es anterior, la racha es 0
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0

  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + 'T12:00:00')
    const curr = new Date(sorted[i] + 'T12:00:00')
    const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86400000)
    if (diffDays === 1) {
      streak++
    } else {
      break
    }
  }

  return streak
}
