'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/browser'
import CheckInForm from '@/components/CheckInForm'
import CheckInReadOnly from '@/components/CheckInReadOnly'
import Spinner from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'
import type { CheckIn, Habit, SessionExercise } from '@/types/database'

type ExistingCheckIn = CheckIn & { exercises: SessionExercise[] }

export default function CheckInPage() {
  const params = useParams()
  const date = params.date as string

  const [habits, setHabits] = useState<Habit[]>([])
  const [selectedHabitId, setSelectedHabitId] = useState<string>('')
  const [existing, setExisting] = useState<ExistingCheckIn | null>(null)
  const [saved, setSaved] = useState(false)
  const [loadingHabits, setLoadingHabits] = useState(true)
  const [loadingCheckIn, setLoadingCheckIn] = useState(false)

  useEffect(() => {
    async function loadHabits() {
      const supabase = createBrowserClient()
      const { data } = await supabase
        .from('habits')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
      setHabits(data ?? [])
      if (data && data.length > 0) setSelectedHabitId(data[0].id)
      setLoadingHabits(false)
    }
    loadHabits()
  }, [])

  useEffect(() => {
    if (!selectedHabitId) return

    async function loadCheckIn() {
      setLoadingCheckIn(true)
      setSaved(false)
      const supabase = createBrowserClient()

      const { data: checkIn } = await supabase
        .from('check_ins')
        .select('*')
        .eq('habit_id', selectedHabitId)
        .eq('date', date)
        .single()

      if (checkIn) {
        const { data: exercises } = await supabase
          .from('session_exercises')
          .select('*')
          .eq('check_in_id', checkIn.id)

        setExisting({ ...checkIn, exercises: exercises ?? [] })
      } else {
        setExisting(null)
      }
      setLoadingCheckIn(false)
    }

    loadCheckIn()
  }, [selectedHabitId, date])

  async function handleSaved() {
    setSaved(true)
    // Recargar check-in guardado
    const supabase = createBrowserClient()
    const { data: checkIn } = await supabase
      .from('check_ins')
      .select('*')
      .eq('habit_id', selectedHabitId)
      .eq('date', date)
      .single()

    if (checkIn) {
      const { data: exercises } = await supabase
        .from('session_exercises')
        .select('*')
        .eq('check_in_id', checkIn.id)
      setExisting({ ...checkIn, exercises: exercises ?? [] })
    }
  }

  if (loadingHabits) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  if (habits.length === 0) {
    return (
      <EmptyState
        message="Necesitas al menos un hábito activo para registrar un check-in."
        action={{ label: 'Crear hábito', href: '/habits/new' }}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900">Check-in</h1>
      <p className="text-sm text-gray-500">Fecha: {date}</p>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-900">Hábito</label>
        <select
          value={selectedHabitId}
          onChange={(e) => setSelectedHabitId(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-violet-600"
        >
          {habits.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>
      </div>

      {loadingCheckIn ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : existing ? (
        <CheckInReadOnly checkIn={existing} />
      ) : (
        <CheckInForm habitId={selectedHabitId} date={date} onSaved={handleSaved} />
      )}

      {saved && !existing && (
        <p className="text-sm text-emerald-600 font-medium">✓ Check-in guardado correctamente</p>
      )}
    </div>
  )
}
