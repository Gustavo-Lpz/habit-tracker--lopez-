import Link from 'next/link'

interface EmptyStateProps {
  message: string
  action?: {
    label: string
    href: string
  }
}

export default function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <p className="text-base text-gray-500">{message}</p>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium text-sm bg-violet-600 text-white hover:bg-violet-700 transition-colors"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}
