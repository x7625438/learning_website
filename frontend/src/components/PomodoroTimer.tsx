import { useState, useEffect, useRef } from 'react'
import apiClient from '../utils/api-client'
import { useNotificationStore, useUserStore } from '../store'

interface PomodoroSession {
  id: string
  userId: string
  startTime: string
  endTime: string | null
  duration: number
  completed: boolean
  task: string | null
}

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [task, setTask] = useState('')
  const [activeSession, setActiveSession] = useState<PomodoroSession | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<Date | null>(null)

  const user = useUserStore((s) => s.user)
  const userId = user?.id || 'demo-user'

  // Load active session on mount
  useEffect(() => {
    loadActiveSession()
  }, [])

  // Timer countdown
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  const loadActiveSession = async () => {
    try {
      const data = await apiClient.get<PomodoroSession>(`/api/pomodoro/user/${userId}/active`)
      if (data) {
        setActiveSession(data)
        const startTime = new Date(data.startTime)
        const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000)
        const remaining = Math.max(0, 25 * 60 - elapsed)
        setTimeLeft(remaining)
        if (remaining > 0) {
          setIsRunning(true)
          startTimeRef.current = startTime
        }
      }
    } catch (error) {
      // No active session
      console.log('No active session')
    }
  }

  const handleStart = async () => {
    try {
      const data = await apiClient.post<PomodoroSession>(`/api/pomodoro/start`, {
        userId,
        task: task || null,
        duration: 25,
      })
      setActiveSession(data)
      startTimeRef.current = new Date()
      setIsRunning(true)
      setTimeLeft(25 * 60)
    } catch (error) {
      console.error('Failed to start session:', error)
      useNotificationStore.getState().addNotification({ type: 'error', message: '启动番茄钟失败' })
    }
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleResume = () => {
    setIsRunning(true)
  }

  const handleComplete = async () => {
    setIsRunning(false)
    if (activeSession) {
      try {
        await apiClient.post(`/api/pomodoro/${activeSession.id}/complete`)
        useNotificationStore.getState().addNotification({ type: 'success', message: '番茄钟完成！休息一下吧！' })
        setActiveSession(null)
        setTimeLeft(25 * 60)
        setTask('')
      } catch (error) {
        console.error('Failed to complete session:', error)
      }
    }
  }

  const handleReset = async () => {
    if (activeSession && window.confirm('确定要放弃当前番茄钟吗？')) {
      try {
        await apiClient.post(`/api/pomodoro/${activeSession.id}/complete`)
        setIsRunning(false)
        setActiveSession(null)
        setTimeLeft(25 * 60)
        setTask('')
      } catch (error) {
        console.error('Failed to reset session:', error)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = ((25 * 60 - timeLeft) / (25 * 60)) * 100

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Timer Display */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <svg className="w-64 h-64 transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="#3b82f6"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 120}`}
                strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl font-bold text-gray-800">
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        </div>

        {/* Task Input */}
        {!activeSession && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              任务描述（可选）
            </label>
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="你要专注做什么？"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isRunning}
            />
          </div>
        )}

        {/* Current Task Display */}
        {activeSession && activeSession.task && (
          <div className="mb-6 text-center">
            <p className="text-sm text-gray-600">当前任务</p>
            <p className="text-lg font-medium text-gray-800">{activeSession.task}</p>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-4 justify-center">
          {!activeSession && (
            <button
              onClick={handleStart}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              开始专注
            </button>
          )}

          {activeSession && !isRunning && timeLeft > 0 && (
            <button
              onClick={handleResume}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
            >
              继续
            </button>
          )}

          {activeSession && isRunning && (
            <button
              onClick={handlePause}
              className="px-8 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium transition-colors"
            >
              暂停
            </button>
          )}

          {activeSession && (
            <>
              <button
                onClick={handleComplete}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
              >
                完成
              </button>
              <button
                onClick={handleReset}
                className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
              >
                放弃
              </button>
            </>
          )}
        </div>

        {/* Tips */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>番茄工作法：</strong>专注工作25分钟，然后休息5分钟。
            每完成4个番茄钟，休息15-30分钟。
          </p>
        </div>
      </div>
    </div>
  )
}
