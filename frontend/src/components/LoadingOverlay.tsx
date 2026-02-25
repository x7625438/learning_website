import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LoadingSpinner from './LoadingSpinner'

interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  fullScreen?: boolean
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = '加载中...',
  fullScreen = false
}) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`${
            fullScreen ? 'fixed inset-0 z-50' : 'absolute inset-0 z-10'
          } bg-white bg-opacity-90 flex flex-col items-center justify-center`}
        >
          <LoadingSpinner size="lg" />
          {message && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-gray-600 font-medium"
            >
              {message}
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default LoadingOverlay
