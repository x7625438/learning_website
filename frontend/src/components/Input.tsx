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
  const errorClass = error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'

  return (
    <div className={widthClass}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={`block ${widthClass} px-3 py-2 border ${errorClass} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  )
}

export default Input
