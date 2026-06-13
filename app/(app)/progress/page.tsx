'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/browser'
import { calculateStreak } from '@/lib/streak'
import { fetchMaxWeights, type MaxWeight } from '@/lib/fetchers/maxWeights'
import { updateBestStreak } from '@/actions/progress'
import StreakCounter from '@/components/StreakCounter'
import Spinner from '@/components/ui/Spinner'
import Card from '@/components/ui/Card'
import type { CheckIn, Badge } from '@/types/database'

export default function ProgressPage() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [bestStreak, setBestStreak] = useState(0)
  const [maxWeights, setMaxWeights] = useState<MaxWeight[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)
  const [newBadges, setNewBadges] = useState<string[]>([])
  const [shareMsg, setShareMsg] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createBrowserClient()

      const [{ data: cis }, { data: profile }, weights, { data: bdgs }] = await Promise.all([
        supabase.from('check_ins').select('*').order('date', { ascending: false }),
        supabase.from('profiles').select('best_streak').single(),
        fetchMaxWeights(),
        supabase.from('badges').select('*'),
      ])

      const allCheckIns: CheckIn[] = cis ?? []
      const currentBest = profile?.best_streak ?? 0
      const currentStreak = calculateStreak(allCheckIns)
      const existingBadges: Badge[] = bdgs ?? []

      setCheckIns(allCheckIns)
      setBestStreak(Math.max(currentBest, currentStreak))
      setMaxWeights(weights)
      setBadges(existingBadges)

      // Actualizar best_streak si la racha actual la supera
      if (currentStreak > currentBest) {
        await updateBestStreak(currentStreak)
      }

      // Desbloquear badges nuevos
      const unlocked: string[] = []
      const hasBadge = (type: string) => existingBadges.some((b) => b.badge_type === type)

      if (currentStreak >= 7 && !hasBadge('week_1')) unlocked.push('week_1')
      if (currentStreak >= 30 && !hasBadge('days_30')) unlocked.push('days_30')

      if (unlocked.length > 0) {
        for (const type of unlocked) {
          await supabase.from('badges').insert({ badge_type: type })
        }
        const { data: refreshed } = await supabase.from('badges').select('*')
        setBadges(refreshed ?? [])
        setNewBadges(unlocked)
      }

      setLoading(false)
    }
    load()
  }, [])

  const currentStreak = calculateStreak(checkIns)
  const hasAnyTraining = checkIns.some((c) => c.type === 'training')

  const BADGE_NAMES: Record<string, string> = {
    week_1: 'Primera semana',
    days_30: '30 días de constancia',
  }

  function buildShareText(): string {
    const totalDays = checkIns.filter((c) => c.type === 'training').length
    const lines = [`Entrené ${totalDays} días en total.`, 'Pesos máximos:']
    for (const { exercise_name, max_weight } of maxWeights) {
      lines.push(`- ${exercise_name}: ${max_weight} kg`)
    }
    return lines.join('\n')
  }

  async function handleShare() {
    const text = buildShareText()
    await navigator.clipboard.writeText(text)
    if (navigator.share) {
      try {
        await navigator.share({ text })
      } catch {
        // El usuario canceló el share nativo — ya se copió al portapapeles
      }
    }
    setShareMsg('¡Copiado al portapapeles!')
    setTimeout(() => setShareMsg(null), 3000)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-gray-900">Progreso</h1>

      {/* Celebración de badges nuevos */}
      {newBadges.length > 0 && (
        <Card className="bg-violet-50 border border-violet-200">
          <div className="flex flex-col gap-2">
            <p className="text-lg font-semibold text-violet-700">¡Nuevo badge desbloqueado!</p>
            {newBadges.map((b) => (
              <p key={b} className="text-base text-violet-600 font-medium animate-bounce">
                🏅 {BADGE_NAMES[b] ?? b}
              </p>
            ))}
          </div>
        </Card>
      )}

      {/* Racha */}
      <Card>
        <StreakCounter
          currentStreak={currentStreak}
          bestStreak={bestStreak}
          hasAnyTraining={hasAnyTraining}
        />
      </Card>

      {/* Badges desbloqueados */}
      {badges.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Badges</h2>
          <div className="flex gap-4 flex-wrap">
            {badges.map((badge) => (
              <Card key={badge.id} className="flex flex-col gap-1 min-w-32">
                <p className="text-xs font-medium text-violet-600 bg-violet-100 px-2 py-1 rounded-full self-start">
                  {BADGE_NAMES[badge.badge_type] ?? badge.badge_type}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(badge.unlocked_at).toLocaleDateString('es-ES')}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Pesos máximos */}
      {maxWeights.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Pesos máximos</h2>
          <Card>
            <div className="flex flex-col gap-2">
              {maxWeights.map(({ exercise_name, max_weight }) => (
                <div key={exercise_name} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{exercise_name}</span>
                  <span className="font-semibold text-emerald-600">{max_weight} kg</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Compartir */}
      <div className="flex flex-col gap-2">
        <button
          onClick={handleShare}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium text-sm border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 transition-colors self-start"
        >
          Compartir progreso
        </button>
        {shareMsg && <p className="text-sm text-emerald-600">{shareMsg}</p>}
      </div>
    </div>
  )
}
