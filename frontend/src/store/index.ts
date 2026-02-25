import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// User state
interface User {
  id: string
  email: string
  username: string
  avatar?: string
}

interface UserState {
  user: User | null
  setUser: (user: User | null) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        setUser: (user) => set({ user }),
        clearUser: () => set({ user: null }),
      }),
      {
        name: 'user-storage',
      }
    )
  )
)

// UI state
interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  loading: boolean
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
  setLoading: (loading: boolean) => void
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: true,
        theme: 'light',
        loading: false,
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        setTheme: (theme) => set({ theme }),
        setLoading: (loading) => set({ loading }),
      }),
      {
        name: 'ui-storage',
      }
    )
  )
)

// Notification state
interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

interface NotificationState {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

export const useNotificationStore = create<NotificationState>()(
  devtools((set) => ({
    notifications: [],
    addNotification: (notification) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const newNotification = { ...notification, id }
      
      set((state) => ({
        notifications: [...state.notifications, newNotification],
      }))

      // Auto-remove after duration
      if (notification.duration !== 0) {
        setTimeout(() => {
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          }))
        }, notification.duration || 5000)
      }
    },
    removeNotification: (id) =>
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      })),
    clearNotifications: () => set({ notifications: [] }),
  }))
)

// Learning progress state
interface LearningProgress {
  totalStudyTime: number
  focusSessions: number
  completedTasks: number
  booksRead: number
  papersRead: number
  notesCreated: number
}

interface LearningProgressState {
  progress: LearningProgress
  updateProgress: (updates: Partial<LearningProgress>) => void
  resetProgress: () => void
}

const initialProgress: LearningProgress = {
  totalStudyTime: 0,
  focusSessions: 0,
  completedTasks: 0,
  booksRead: 0,
  papersRead: 0,
  notesCreated: 0,
}

export const useLearningProgressStore = create<LearningProgressState>()(
  devtools(
    persist(
      (set) => ({
        progress: initialProgress,
        updateProgress: (updates) =>
          set((state) => ({
            progress: { ...state.progress, ...updates },
          })),
        resetProgress: () => set({ progress: initialProgress }),
      }),
      {
        name: 'learning-progress-storage',
      }
    )
  )
)
