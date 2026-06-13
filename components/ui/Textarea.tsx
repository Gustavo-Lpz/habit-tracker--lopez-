import { TextareaHTMLAttributes } from 'react'
import ErrorMessage from './ErrorMessage'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string | null
  id: string
  maxLength?: number
}

export default function Textarea({
  label,
  error,
  id,
  maxLength,
  value,
  className = '',
  ...props
}: TextareaProps) {
  const currentLength = typeof value === 'string' ? value.length : 0

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-900">
        {label}
      </label>
      <textarea
        id={id}
        maxLength={maxLength}
        value={value}
        className={`px-4 py-2 border rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-violet-600 resize-none ${
          error ? 'border-red-600' : 'border-gray-300'
        } ${className}`}
        rows={3}
        {...props}
      />
      {maxLength && (
        <p className="text-sm text-gray-500 text-right">
          {currentLength}/{maxLength}
        </p>
      )}
      <ErrorMessage message={error} />
    </div>
  )
}
