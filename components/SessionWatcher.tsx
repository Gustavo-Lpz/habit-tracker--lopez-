'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import SessionExpiredModal from './SessionExpiredModal'

interface SessionContextValue {
  showExpiredModal: () => void
}

const SessionContext = createContext<SessionContextValue>({
  showExpiredModal: () => {},
})

export function useSessionExpired() {
  return useContext(SessionContext)
}

export default function SessionWatcher({ children }: { children: ReactNode }) {
  const [expired, setExpired] = useState(false)

  const showExpiredModal = useCallback(() => setExpired(true), [])

  return (
    <SessionContext.Provider value={{ showExpiredModal }}>
      {children}
      <SessionExpiredModal open={expired} />
    </SessionContext.Provider>
  )
}
