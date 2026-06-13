'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import ErrorMessage from '@/components/ui/ErrorMessage'
import ExerciseRow from '@/components/ExerciseRow'
import { updateExercises } from '@/actions/exercises'
import type { HistoryEntry } from '@/types/database'

interface ExerciseValue {
  exercise_name: string
  muscle_group: string
  weight: string
}

interface HistoryItemProps {
  entry: HistoryEntry
}

const EMPTY_EXERCISE: ExerciseValue = { exercise_name: '', muscle_group: '', weight: '' }

export default function HistoryItem({ entry }: HistoryItemProps) {
  const [editing, setEditing] = useState(false)
  const [exercises, setExercises] = useState<ExerciseValue[]>(
    entry.exercises.map((ex) => ({
      exercise_name: ex.exercise_name,
      muscle_group: ex.muscle_group,
      weight: String(ex.weight),
    }))
  )
  const [savedExercises, setSavedExercises] = useState(exercises)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatted = new Date(entry.date + 'T12:00:00').toLocaleDateString('es-ES', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  function handleChange(index: number, field: keyof ExerciseValue, value: string) {
    setExercises((prev) => prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex)))
  }

  function handleRemove(index: number) {
    setExercises((prev) => prev.filter((_, i) => i !== index))
  }

  function handleAdd() {
    setExercises((prev) => [...prev, { ...EMPTY_EXERCISE }])
  }

  function handleCancel() {
    setExercises(savedExercises)
    setError(null)
    setEditing(false)
  }

  async function handleSave() {
    setError(null)
    setLoading(true)

    const payload = exercises
      .filter((ex) => ex.exercise_name.trim())
      .map((ex) => ({
        exercise_name: ex.exercise_name.trim(),
        muscle_group: ex.muscle_group.trim(),
        weight: parseFloat(ex.weight) || 0,
      }))

    const result = await updateExercises(entry.check_in_id, payload)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    // Actualizar estado guardado con los valores limpios
    const updated = payload.map((ex) => ({
      exercise_name: ex.exercise_name,
      muscle_group: ex.muscle_group,
      weight: String(ex.weight),
    }))
    setSavedExercises(updated)
    setExercises(updated)
    setLoading(false)
    setEditing(false)
  }

  return (
    <Card className="flex flex-col gap-3">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{formatted}</p>
        <p className="text-sm font-medium text-gray-700">{entry.habit_name}</p>
      </div>

      {/* Ejercicios */}
      {editing ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-gray-900">
            Ejercicio · Grupo muscular · Peso (kg)
          </p>
          <div className="flex flex-col gap-2">
            {exercises.map((ex, i) => (
              <ExerciseRow
                key={i}
                index={i}
                value={ex}
                onChange={handleChange}
                onRemove={handleRemove}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="text-sm text-violet-600 hover:text-violet-700 font-medium self-start"
          >
            + Agregar ejercicio
          </button>
          <ErrorMessage message={error} />
          <div className="flex gap-2">
            <Button loading={loading} onClick={handleSave}>
              Guardar
            </Button>
            <Button variant="ghost" onClick={handleCancel}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <>
          {savedExercises.length > 0 && (
            <div className="flex flex-col gap-1">
              {savedExercises.map((ex, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 text-sm text-gray-700 bg-gray-50 rounded px-4 py-2"
                >
                  <span className="font-medium">{ex.exercise_name}</span>
                  <span className="text-gray-500">{ex.muscle_group}</span>
                  <span className="ml-auto font-medium text-emerald-600">{ex.weight} kg</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => setEditing(true)}>
              Editar ejercicios
            </Button>
          </div>
        </>
      )}
    </Card>
  )
}
