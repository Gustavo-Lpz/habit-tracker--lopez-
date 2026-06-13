'use client'

import { useState } from 'react'
import { createCheckIn } from '@/actions/checkins'
import ExerciseRow from './ExerciseRow'
import Button from '@/components/ui/Button'
import ErrorMessage from '@/components/ui/ErrorMessage'
import type { CheckInType } from '@/types/database'

interface ExerciseValue {
  exercise_name: string
  muscle_group: string
  weight: string
}

const EMPTY_EXERCISE: ExerciseValue = { exercise_name: '', muscle_group: '', weight: '' }

interface CheckInFormProps {
  habitId: string
  date: string
  onSaved: () => void
}

export default function CheckInForm({ habitId, date, onSaved }: CheckInFormProps) {
  const [type, setType] = useState<CheckInType>('training')
  const [exercises, setExercises] = useState<ExerciseValue[]>([{ ...EMPTY_EXERCISE }])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleExerciseChange(index: number, field: keyof ExerciseValue, value: string) {
    setExercises((prev) => prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex)))
  }

  function handleRemoveExercise(index: number) {
    setExercises((prev) => prev.filter((_, i) => i !== index))
  }

  function handleAddExercise() {
    setExercises((prev) => [...prev, { ...EMPTY_EXERCISE }])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (type === 'training' && exercises.length === 0) {
      setError('Agrega al menos un ejercicio para registrar un entrenamiento')
      return
    }

    setLoading(true)

    const exercisePayload =
      type === 'training'
        ? exercises
            .filter((ex) => ex.exercise_name.trim())
            .map((ex) => ({
              exercise_name: ex.exercise_name.trim(),
              muscle_group: ex.muscle_group.trim(),
              weight: parseFloat(ex.weight) || 0,
            }))
        : []

    const result = await createCheckIn({
      habitId,
      date,
      type,
      exercises: exercisePayload,
    })

    if ('error' in result) {
      setError(result.error)
      setLoading(false)
      return
    }

    onSaved()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Selector training / rest */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => setType('training')}
          className={`flex-1 py-3 rounded-lg text-sm font-semibold border-2 transition-colors ${
            type === 'training'
              ? 'bg-emerald-500 text-white border-emerald-500'
              : 'bg-white text-gray-600 border-gray-300 hover:border-emerald-400'
          }`}
        >
          Entrenamiento
        </button>
        <button
          type="button"
          onClick={() => setType('rest')}
          className={`flex-1 py-3 rounded-lg text-sm font-semibold border-2 transition-colors ${
            type === 'rest'
              ? 'bg-amber-400 text-gray-900 border-amber-400'
              : 'bg-white text-gray-600 border-gray-300 hover:border-amber-300'
          }`}
        >
          Descanso
        </button>
      </div>

      {/* Ejercicios — solo si training */}
      {type === 'training' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">Ejercicios</p>
            <p className="text-xs text-gray-500">Ejercicio · Grupo muscular · Peso (kg)</p>
          </div>
          <div className="flex flex-col gap-2">
            {exercises.map((ex, i) => (
              <ExerciseRow
                key={i}
                index={i}
                value={ex}
                onChange={handleExerciseChange}
                onRemove={handleRemoveExercise}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddExercise}
            className="text-sm text-violet-600 hover:text-violet-700 font-medium self-start"
          >
            + Agregar ejercicio
          </button>
        </div>
      )}

      <ErrorMessage message={error} />

      <Button type="submit" loading={loading}>
        Guardar check-in
      </Button>
    </form>
  )
}
