interface SpinnerProps {
  size?: 'sm' | 'md'
}

export default function Spinner({ size = 'md' }: SpinnerProps) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-8 h-8'
  return (
    <div
      className={`${sizeClass} border-2 border-violet-600 border-t-transparent rounded-full animate-spin`}
      role="status"
      aria-label="Cargando"
    />
  )
}
