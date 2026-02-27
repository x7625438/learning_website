import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotificationStore } from '../store'

const NotificationToast = () => {
  const { notifications, removeNotification } = useNotificationStore()

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✓'
      case 'error':
        return '✕'
      case 'warning':
        return '⚠'
      case 'info':
        return 'ℹ'
      default:
        return 'ℹ'
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500'
      case 'error':
        return 'bg-red-500'
      case 'warning':
        return 'bg-amber-500'
      case 'info':
        return 'bg-primary-500'
      default:
        return 'bg-surface-500'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`${getColor(notification.type)} text-white px-4 py-3 rounded-2xl shadow-soft-lg flex items-center gap-3 min-w-[280px] max-w-[380px]`}
          >
            <span className="text-xl font-bold">{getIcon(notification.type)}</span>
            <p className="flex-1 text-sm">{notification.message}</p>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default NotificationToast
