interface StreakCounterProps {
  currentStreak: number
  bestStreak: number
  hasAnyTraining: boolean
}

export default function StreakCounter({
  currentStreak,
  bestStreak,
  hasAnyTraining,
}: StreakCounterProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-lg font-semibold text-gray-900">Racha actual</p>
        {!hasAnyTraining ? (
          <p className="text-base text-gray-400 italic">Sin registros aún</p>
        ) : currentStreak === 0 ? (
          <p className="text-base text-red-600 font-medium">Racha perdida</p>
        ) : (
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-violet-600">{currentStreak}</span>
            <span className="text-base text-gray-500">
              {currentStreak === 1 ? 'día consecutivo' : 'días consecutivos'}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-gray-500">Mejor racha histórica</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gray-900">{bestStreak}</span>
          <span className="text-sm text-gray-400">
            {bestStreak === 1 ? 'día' : 'días'}
          </span>
        </div>
      </div>
    </div>
  )
}
