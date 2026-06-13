'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/browser'
import HabitCard from '@/components/HabitCard'
import EmptyState from '@/components/ui/EmptyState'
import Spinner from '@/components/ui/Spinner'
import type { Habit } from '@/types/database'

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createBrowserClient()
      const { data } = await supabase
        .from('habits')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
      setHabits(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  function handleDeleted(id: string) {
    setHabits((prev) => prev.filter((h) => h.id !== id))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mis hábitos</h1>
        <Link
          href="/habits/new"
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium text-sm bg-violet-600 text-white hover:bg-violet-700 transition-colors"
        >
          + Nuevo hábito
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : habits.length === 0 ? (
        <EmptyState
          message="Aún no tienes hábitos creados."
          action={{ label: '+ Crear primer hábito', href: '/habits/new' }}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} onDeleted={handleDeleted} />
          ))}
        </div>
      )}
    </div>
  )
}
