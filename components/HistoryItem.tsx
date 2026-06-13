import Card from '@/components/ui/Card'
import type { HistoryEntry } from '@/types/database'

interface HistoryItemProps {
  entry: HistoryEntry
}

export default function HistoryItem({ entry }: HistoryItemProps) {
  const formatted = new Date(entry.date + 'T12:00:00').toLocaleDateString('es-ES', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{formatted}</p>
        <p className="text-sm font-medium text-gray-700">{entry.habit_name}</p>
      </div>

      {entry.exercises.length > 0 && (
        <div className="flex flex-col gap-1">
          {entry.exercises.map((ex) => (
            <div
              key={ex.id}
              className="flex items-center gap-4 text-sm text-gray-700 bg-gray-50 rounded px-4 py-2"
            >
              <span className="font-medium">{ex.exercise_name}</span>
              <span className="text-gray-500">{ex.muscle_group}</span>
              <span className="ml-auto font-medium text-emerald-600">{ex.weight} kg</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
