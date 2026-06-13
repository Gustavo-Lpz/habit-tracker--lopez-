import Spinner from './Spinner'

interface ButtonProps {
  variant?: 'primary' | 'ghost' | 'destructive'
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  disabled?: boolean
  children: React.ReactNode
  className?: string
}

export default function Button({
  variant = 'primary',
  loading = false,
  type = 'button',
  onClick,
  disabled,
  children,
  className = '',
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-violet-600 text-white hover:bg-violet-700',
    ghost: 'border border-gray-300 bg-transparent text-gray-900 hover:bg-gray-100',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}
