import { describe, it, expect, beforeEach } from 'vitest'
import {
  useUserStore,
  useUIStore,
  useNotificationStore,
  useLearningProgressStore,
} from '../store'

describe('State Management Consistency Tests', () => {
  describe('User Store', () => {
    beforeEach(() => {
      useUserStore.getState().clearUser()
    })

    it('should set and retrieve user', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
      }

      useUserStore.getState().setUser(user)
      expect(useUserStore.getState().user).toEqual(user)
    })

    it('should clear user', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
      }

      useUserStore.getState().setUser(user)
      useUserStore.getState().clearUser()
      expect(useUserStore.getState().user).toBeNull()
    })
  })

  describe('UI Store', () => {
    it('should toggle sidebar', () => {
      const initialState = useUIStore.getState().sidebarOpen
      useUIStore.getState().toggleSidebar()
      expect(useUIStore.getState().sidebarOpen).toBe(!initialState)
    })

    it('should set theme', () => {
      useUIStore.getState().setTheme('dark')
      expect(useUIStore.getState().theme).toBe('dark')

      useUIStore.getState().setTheme('light')
      expect(useUIStore.getState().theme).toBe('light')
    })

    it('should set loading state', () => {
      useUIStore.getState().setLoading(true)
      expect(useUIStore.getState().loading).toBe(true)

      useUIStore.getState().setLoading(false)
      expect(useUIStore.getState().loading).toBe(false)
    })
  })

  describe('Notification Store', () => {
    beforeEach(() => {
      useNotificationStore.getState().clearNotifications()
    })

    it('should add notification', () => {
      useNotificationStore.getState().addNotification({
        type: 'success',
        message: 'Test notification',
        duration: 0,
      })

      const notifications = useNotificationStore.getState().notifications
      expect(notifications.length).toBe(1)
      expect(notifications[0].message).toBe('Test notification')
      expect(notifications[0].type).toBe('success')
    })

    it('should remove notification', () => {
      useNotificationStore.getState().addNotification({
        type: 'info',
        message: 'Test',
        duration: 0,
      })

      const notifications = useNotificationStore.getState().notifications
      const id = notifications[0].id

      useNotificationStore.getState().removeNotification(id)
      expect(useNotificationStore.getState().notifications.length).toBe(0)
    })

    it('should clear all notifications', () => {
      useNotificationStore.getState().addNotification({
        type: 'success',
        message: 'Test 1',
        duration: 0,
      })
      useNotificationStore.getState().addNotification({
        type: 'error',
        message: 'Test 2',
        duration: 0,
      })

      expect(useNotificationStore.getState().notifications.length).toBe(2)

      useNotificationStore.getState().clearNotifications()
      expect(useNotificationStore.getState().notifications.length).toBe(0)
    })

    it('should auto-generate unique IDs for notifications', () => {
      useNotificationStore.getState().addNotification({
        type: 'info',
        message: 'Test 1',
        duration: 0,
      })
      useNotificationStore.getState().addNotification({
        type: 'info',
        message: 'Test 2',
        duration: 0,
      })

      const notifications = useNotificationStore.getState().notifications
      expect(notifications[0].id).not.toBe(notifications[1].id)
    })
  })

  describe('Learning Progress Store', () => {
    beforeEach(() => {
      useLearningProgressStore.getState().resetProgress()
    })

    it('should update progress', () => {
      useLearningProgressStore.getState().updateProgress({
        totalStudyTime: 100,
        focusSessions: 5,
      })

      const progress = useLearningProgressStore.getState().progress
      expect(progress.totalStudyTime).toBe(100)
      expect(progress.focusSessions).toBe(5)
    })

    it('should maintain other fields when updating partial progress', () => {
      useLearningProgressStore.getState().updateProgress({
        booksRead: 3,
      })

      useLearningProgressStore.getState().updateProgress({
        papersRead: 2,
      })

      const progress = useLearningProgressStore.getState().progress
      expect(progress.booksRead).toBe(3)
      expect(progress.papersRead).toBe(2)
      expect(progress.totalStudyTime).toBe(0) // Should remain at initial value
    })

    it('should reset progress', () => {
      useLearningProgressStore.getState().updateProgress({
        totalStudyTime: 100,
        focusSessions: 5,
        booksRead: 3,
      })

      useLearningProgressStore.getState().resetProgress()

      const progress = useLearningProgressStore.getState().progress
      expect(progress.totalStudyTime).toBe(0)
      expect(progress.focusSessions).toBe(0)
      expect(progress.booksRead).toBe(0)
    })

    it('should track all learning metrics', () => {
      const updates = {
        totalStudyTime: 500,
        focusSessions: 10,
        completedTasks: 25,
        booksRead: 5,
        papersRead: 8,
        notesCreated: 15,
      }

      useLearningProgressStore.getState().updateProgress(updates)

      const progress = useLearningProgressStore.getState().progress
      expect(progress).toEqual(updates)
    })
  })

  describe('Store Persistence', () => {
    it('should persist user store to localStorage', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
      }

      useUserStore.getState().setUser(user)

      // Check if localStorage has the data
      const stored = localStorage.getItem('user-storage')
      expect(stored).toBeTruthy()
      if (stored) {
        const parsed = JSON.parse(stored)
        expect(parsed.state.user).toEqual(user)
      }
    })

    it('should persist UI store to localStorage', () => {
      useUIStore.getState().setTheme('dark')

      const stored = localStorage.getItem('ui-storage')
      expect(stored).toBeTruthy()
      if (stored) {
        const parsed = JSON.parse(stored)
        expect(parsed.state.theme).toBe('dark')
      }
    })

    it('should persist learning progress to localStorage', () => {
      useLearningProgressStore.getState().updateProgress({
        booksRead: 5,
      })

      const stored = localStorage.getItem('learning-progress-storage')
      expect(stored).toBeTruthy()
      if (stored) {
        const parsed = JSON.parse(stored)
        expect(parsed.state.progress.booksRead).toBe(5)
      }
    })
  })
})
