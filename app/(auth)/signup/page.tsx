'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase/browser'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import ErrorMessage from '@/components/ui/ErrorMessage'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createBrowserClient()
    const { data, error: authError } = await supabase.auth.signUp({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Si Supabase requiere confirmación de email, data.session es null
    if (!data.session) {
      setError('Revisa tu email y confirma tu cuenta antes de iniciar sesión.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-8 flex flex-col gap-6">
      <h2 className="text-lg font-semibold text-gray-900">Crear cuenta</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          id="password"
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
        <ErrorMessage message={error} />
        <Button type="submit" loading={loading} className="w-full mt-2">
          Crear cuenta
        </Button>
      </form>
      <p className="text-sm text-gray-500 text-center">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-violet-600 hover:underline font-medium">
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
