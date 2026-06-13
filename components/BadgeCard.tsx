import Card from '@/components/ui/Card'
import type { Badge } from '@/types/database'

const BADGE_NAMES: Record<string, string> = {
  week_1: 'Primera semana',
  days_30: '30 días de constancia',
}

interface BadgeCardProps {
  badge: Badge
}

export default function BadgeCard({ badge }: BadgeCardProps) {
  return (
    <Card className="flex flex-col gap-2 min-w-40">
      <span className="text-xs font-medium text-violet-600 bg-violet-100 px-2 py-1 rounded-full self-start">
        {BADGE_NAMES[badge.badge_type] ?? badge.badge_type}
      </span>
      <p className="text-xs text-gray-400">
        {new Date(badge.unlocked_at).toLocaleDateString('es-ES')}
      </p>
    </Card>
  )
}
