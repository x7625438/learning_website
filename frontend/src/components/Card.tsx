import React from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-7',
  }

  const hoverClasses = hover
    ? 'hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer'
    : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`glass rounded-2xl shadow-card min-w-0 ${paddingClasses[padding]} ${hoverClasses} transition-all duration-200 ${className}`}
    >
      {children}
    </motion.div>
  )
}

export default Card
