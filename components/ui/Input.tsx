import { InputHTMLAttributes } from 'react'
import ErrorMessage from './ErrorMessage'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string | null
  id: string
}

export default function Input({ label, error, id, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-900">
        {label}
      </label>
      <input
        id={id}
        className={`px-4 py-2 border rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-violet-600 ${
          error ? 'border-red-600' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      <ErrorMessage message={error} />
    </div>
  )
}
