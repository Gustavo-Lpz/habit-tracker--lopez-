'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/browser'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Inicio' },
  { href: '/habits', label: 'Hábitos' },
  { href: '/history', label: 'Historial' },
  { href: '/progress', label: 'Progreso' },
]

export default function NavBar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-16 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors ${
                pathname.startsWith(href)
                  ? 'text-violet-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
        <button
          onClick={handleLogout}
          className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  )
}
