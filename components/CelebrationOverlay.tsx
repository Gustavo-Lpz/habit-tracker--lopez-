'use client'

import { useEffect } from 'react'

interface CelebrationOverlayProps {
  visible: boolean
  badgeNames: string[]
  onDone: () => void
}

export default function CelebrationOverlay({
  visible,
  badgeNames,
  onDone,
}: CelebrationOverlayProps) {
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(onDone, 3000)
    return () => clearTimeout(timer)
  }, [visible, onDone])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 pointer-events-none">
      <div className="bg-white rounded-2xl shadow-lg px-8 py-8 flex flex-col items-center gap-4 animate-bounce">
        <p className="text-4xl">🏅</p>
        <p className="text-xl font-bold text-violet-700">¡Badge desbloqueado!</p>
        {badgeNames.map((name) => (
          <p key={name} className="text-base font-semibold text-violet-600">
            {name}
          </p>
        ))}
      </div>
    </div>
  )
}
