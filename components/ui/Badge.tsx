interface BadgeProps {
  variant: 'training' | 'rest' | 'unlocked'
  children: React.ReactNode
}

export default function Badge({ variant, children }: BadgeProps) {
  const variants = {
    training: 'bg-emerald-500 text-white',
    rest: 'bg-amber-400 text-gray-900',
    unlocked: 'bg-violet-600 text-white',
  }

  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${variants[variant]}`}>
      {children}
    </span>
  )
}
