'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createHabit } from '@/actions/habits'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import ErrorMessage from '@/components/ui/ErrorMessage'
import type { FrequencyType } from '@/types/database'

export default function NewHabitPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [frequencyType, setFrequencyType] = useState<FrequencyType>('daily')
  const [frequencyCount, setFrequencyCount] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await createHabit({
      name,
      description: description || null,
      frequency_type: frequencyType,
      frequency_count: frequencyType === 'weekly' && frequencyCount
        ? parseInt(frequencyCount, 10)
        : null,
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push('/habits')
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900">Nuevo hábito</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="name"
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Textarea
          id="description"
          label="Descripción (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={200}
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-900">Frecuencia</label>
          <select
            value={frequencyType}
            onChange={(e) => setFrequencyType(e.target.value as FrequencyType)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-violet-600"
          >
            <option value="daily">Diario</option>
            <option value="weekly">Semanal</option>
          </select>
        </div>
        {frequencyType === 'weekly' && (
          <Input
            id="frequency_count"
            label="Veces por semana"
            type="number"
            min="1"
            max="7"
            value={frequencyCount}
            onChange={(e) => setFrequencyCount(e.target.value)}
          />
        )}
        <ErrorMessage message={error} />
        <div className="flex gap-4 mt-2">
          <Button type="submit" loading={loading}>
            Crear hábito
          </Button>
          <Button variant="ghost" onClick={() => router.push('/habits')}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
