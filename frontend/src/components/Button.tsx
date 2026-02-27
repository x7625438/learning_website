import React from 'react'
import { motion } from 'framer-motion'
import LoadingSpinner from './LoadingSpinner'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
  children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]'

  const variantClasses = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-400 shadow-soft-sm hover:shadow-soft-md',
    secondary: 'bg-surface-600 text-white hover:bg-surface-700 focus:ring-surface-400',
    outline: 'border-2 border-primary-200 text-primary-600 hover:bg-primary-50 focus:ring-primary-400',
    ghost: 'text-surface-600 hover:bg-surface-100 focus:ring-surface-300',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400',
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base',
  }
  
  const widthClass = fullWidth ? 'w-full' : ''
  
  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.95 }}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <LoadingSpinner size="sm" className="mr-2" />
      )}
      {children}
    </motion.button>
  )
}

export default Button
