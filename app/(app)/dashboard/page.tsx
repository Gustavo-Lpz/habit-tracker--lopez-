'use client'

import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="text-base text-gray-500">
        Bienvenido a tu Fitness Habit Tracker.
      </p>
      <div className="flex gap-4">
        <Link
          href="/habits"
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium text-sm bg-violet-600 text-white hover:bg-violet-700 transition-colors"
        >
          Ver hábitos
        </Link>
        <Link
          href="/history"
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium text-sm border border-gray-300 bg-transparent text-gray-900 hover:bg-gray-100 transition-colors"
        >
          Ver historial
        </Link>
        <Link
          href="/progress"
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium text-sm border border-gray-300 bg-transparent text-gray-900 hover:bg-gray-100 transition-colors"
        >
          Ver progreso
        </Link>
      </div>
    </div>
  )
}
