import React from 'react'
import { motion } from 'framer-motion'

interface ProgressBarProps {
  progress: number // 0-100
  label?: string
  showPercentage?: boolean
  color?: 'blue' | 'green' | 'purple' | 'orange'
  className?: string
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showPercentage = true,
  color = 'blue',
  className = ''
}) => {
  const colorClasses = {
    blue: 'bg-primary-500',
    green: 'bg-emerald-500',
    purple: 'bg-violet-500',
    orange: 'bg-amber-500',
  }

  const clampedProgress = Math.min(Math.max(progress, 0), 100)

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm font-medium text-surface-600">{label}</span>}
          {showPercentage && (
            <span className="text-xs font-medium text-surface-400">{Math.round(clampedProgress)}%</span>
          )}
        </div>
      )}
      <div className="w-full bg-surface-100 rounded-full h-2 overflow-hidden">
        <motion.div
          className={`h-full ${colorClasses[color]} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export default ProgressBar
