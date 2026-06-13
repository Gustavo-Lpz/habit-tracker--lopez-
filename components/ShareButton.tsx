'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

interface ShareButtonProps {
  text: string
}

export default function ShareButton({ text }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    await navigator.clipboard.writeText(text)
    if (navigator.share) {
      try {
        await navigator.share({ text })
      } catch {
        // usuario canceló — el portapapeles ya tiene el texto
      }
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div className="flex flex-col gap-2">
      <Button variant="ghost" onClick={handleShare}>
        Compartir progreso
      </Button>
      {copied && (
        <p className="text-sm text-emerald-600 font-medium">¡Copiado al portapapeles!</p>
      )}
    </div>
  )
}
