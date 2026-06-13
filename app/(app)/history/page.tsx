'use client'

import useSWR from 'swr'
import { fetchHistory } from '@/lib/fetchers/history'
import HistoryItem from '@/components/HistoryItem'
import EmptyState from '@/components/ui/EmptyState'
import Spinner from '@/components/ui/Spinner'

export default function HistoryPage() {
  const { data: entries, isLoading } = useSWR('history', fetchHistory)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Historial de entrenamientos</h1>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : !entries || entries.length === 0 ? (
        <EmptyState
          message="Aún no tienes sesiones de entrenamiento registradas."
          action={{ label: 'Registrar primer check-in', href: `/checkin/${new Date().toISOString().slice(0, 10)}` }}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {entries.map((entry) => (
            <HistoryItem key={entry.check_in_id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}
