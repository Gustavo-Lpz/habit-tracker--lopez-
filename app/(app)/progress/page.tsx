'use client'

import { useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@/lib/supabase/browser'
import { calculateStreak } from '@/lib/streak'
import { fetchMaxWeights, type MaxWeight } from '@/lib/fetchers/maxWeights'
import { updateBestStreak } from '@/actions/progress'
import StreakCounter from '@/components/StreakCounter'
import BadgeCard from '@/components/BadgeCard'
import CelebrationOverlay from '@/components/CelebrationOverlay'
import ShareButton from '@/components/ShareButton'
import Spinner from '@/components/ui/Spinner'
import Card from '@/components/ui/Card'
import type { CheckIn, Badge } from '@/types/database'

const BADGE_NAMES: Record<string, string> = {
  week_1: 'Primera semana',
  days_30: '30 días de constancia',
}

export default function ProgressPage() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [bestStreak, setBestStreak] = useState(0)
  const [maxWeights, setMaxWeights] = useState<MaxWeight[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)
  const [celebrationBadges, setCelebrationBadges] = useState<string[]>([])
  const [showCelebration, setShowCelebration] = useState(false)

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

      if (currentStreak > currentBest) {
        await updateBestStreak(currentStreak)
      }

      // Desbloquear badges nuevos — solo muestra celebración si es primera vez
      const hasBadge = (type: string) => existingBadges.some((b) => b.badge_type === type)
      const toUnlock: string[] = []
      if (currentStreak >= 7 && !hasBadge('week_1')) toUnlock.push('week_1')
      if (currentStreak >= 30 && !hasBadge('days_30')) toUnlock.push('days_30')

      if (toUnlock.length > 0) {
        for (const type of toUnlock) {
          await supabase.from('badges').insert({ badge_type: type })
        }
        const { data: refreshed } = await supabase.from('badges').select('*')
        setBadges(refreshed ?? [])
        setCelebrationBadges(toUnlock.map((t) => BADGE_NAMES[t] ?? t))
        setShowCelebration(true)
      }

      setLoading(false)
    }
    load()
  }, [])

  const currentStreak = calculateStreak(checkIns)
  const hasAnyTraining = checkIns.some((c) => c.type === 'training')

  const handleCelebrationDone = useCallback(() => setShowCelebration(false), [])

  function buildShareText(): string {
    const totalDays = checkIns.filter((c) => c.type === 'training').length
    const lines = [`Entrené ${totalDays} días en total.`, 'Pesos máximos:']
    for (const { exercise_name, max_weight } of maxWeights) {
      lines.push(`- ${exercise_name}: ${max_weight} kg`)
    }
    return lines.join('\n')
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  return (
    <>
      <CelebrationOverlay
        visible={showCelebration}
        badgeNames={celebrationBadges}
        onDone={handleCelebrationDone}
      />

      <div className="flex flex-col gap-8">
        <h1 className="text-2xl font-bold text-gray-900">Progreso</h1>

        {/* Racha */}
        <Card>
          <StreakCounter
            currentStreak={currentStreak}
            bestStreak={bestStreak}
            hasAnyTraining={hasAnyTraining}
          />
        </Card>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Badges</h2>
            <div className="flex gap-4 flex-wrap">
              {badges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} />
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
        <ShareButton text={buildShareText()} />
      </div>
    </>
  )
}
