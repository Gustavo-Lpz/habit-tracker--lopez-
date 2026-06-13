import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import type { CheckIn, SessionExercise } from '@/types/database'

interface CheckInReadOnlyProps {
  checkIn: CheckIn & { exercises: SessionExercise[] }
}

export default function CheckInReadOnly({ checkIn }: CheckInReadOnlyProps) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-500">Tipo:</span>
        <Badge variant={checkIn.type}>
          {checkIn.type === 'training' ? 'Entrenamiento' : 'Descanso'}
        </Badge>
      </div>

      {checkIn.type === 'training' && checkIn.exercises.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-gray-900">Ejercicios registrados</p>
          <div className="flex flex-col gap-2">
            {checkIn.exercises.map((ex) => (
              <div
                key={ex.id}
                className="flex items-center gap-4 text-sm text-gray-700 bg-gray-50 rounded-lg px-4 py-2"
              >
                <span className="font-medium">{ex.exercise_name}</span>
                <span className="text-gray-500">{ex.muscle_group}</span>
                <span className="ml-auto font-medium">{ex.weight} kg</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-sm text-gray-400">
        Este check-in es inmutable — no puede editarse ni eliminarse.
      </p>
    </Card>
  )
}
