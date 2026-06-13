'use client'

import { useRouter } from 'next/navigation'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

interface SessionExpiredModalProps {
  open: boolean
}

export default function SessionExpiredModal({ open }: SessionExpiredModalProps) {
  const router = useRouter()

  function handleGoToLogin() {
    router.push('/login')
  }

  return (
    <Modal open={open} onClose={() => {}}>
      <div className="flex flex-col gap-6 text-center">
        <p className="text-base text-gray-900 font-medium">
          Tu sesión expiró, inicia sesión de nuevo
        </p>
        <Button onClick={handleGoToLogin} className="w-full">
          Ir al login
        </Button>
      </div>
    </Modal>
  )
}
