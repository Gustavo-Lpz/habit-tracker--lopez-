'use client'

import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { deleteHabit } from '@/actions/habits'
import type { Habit } from '@/types/database'

const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'Diario',
  weekly: 'Semanal',
}

interface HabitCardProps {
  habit: Habit
  onDeleted: (id: string) => void
}

export default function HabitCard({ habit, onDeleted }: HabitCardProps) {
  const router = useRouter()

  async function handleDelete() {
    const { error } = await deleteHabit(habit.id)
    if (!error) onDeleted(habit.id)
  }

  const freqLabel =
    habit.frequency_type === 'weekly' && habit.frequency_count
      ? `${habit.frequency_count}x por semana`
      : FREQUENCY_LABELS[habit.frequency_type]

  return (
    <Card className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-1 min-w-0">
        <p className="text-lg font-semibold text-gray-900 truncate">{habit.name}</p>
        {habit.description && (
          <p className="text-sm text-gray-500 line-clamp-2">{habit.description}</p>
        )}
        <p className="text-xs font-medium text-gray-400 mt-1">{freqLabel}</p>
      </div>
      <div className="flex gap-2 shrink-0">
        <Button
          variant="ghost"
          onClick={() => router.push(`/habits/${habit.id}/edit`)}
        >
          Editar
        </Button>
        <Button variant="destructive" onClick={handleDelete}>
          Eliminar
        </Button>
      </div>
    </Card>
  )
}
