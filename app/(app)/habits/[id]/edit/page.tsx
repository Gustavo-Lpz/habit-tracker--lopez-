'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/browser'
import { updateHabit } from '@/actions/habits'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import ErrorMessage from '@/components/ui/ErrorMessage'
import Spinner from '@/components/ui/Spinner'
import type { Habit, FrequencyType } from '@/types/database'

export default function EditHabitPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [habit, setHabit] = useState<Habit | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [frequencyType, setFrequencyType] = useState<FrequencyType>('daily')
  const [frequencyCount, setFrequencyCount] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createBrowserClient()
      const { data } = await supabase
        .from('habits')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single()

      if (data) {
        setHabit(data)
        setName(data.name)
        setDescription(data.description ?? '')
        setFrequencyType(data.frequency_type)
        setFrequencyCount(data.frequency_count?.toString() ?? '')
      }
      setFetching(false)
    }
    load()
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await updateHabit(id, {
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

  if (fetching) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  if (!habit) {
    return <p className="text-base text-gray-500">Hábito no encontrado.</p>
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900">Editar hábito</h1>
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
            Guardar cambios
          </Button>
          <Button variant="ghost" onClick={() => router.push('/habits')}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
