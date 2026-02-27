import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const widthClass = fullWidth ? 'w-full' : ''
  const errorClass = error
    ? 'border-red-300 focus:ring-red-400 focus:border-red-400'
    : 'border-surface-200 focus:ring-primary-400 focus:border-primary-400'

  return (
    <div className={widthClass}>
      {label && (
        <label className="block text-sm font-medium text-surface-600 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`block ${widthClass} px-3.5 py-2.5 border ${errorClass} rounded-xl bg-white/80 shadow-soft-xs focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 text-surface-800 placeholder:text-surface-300 ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-xs text-red-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-xs text-surface-400">{helperText}</p>
      )}
    </div>
  )
}

export default Input
