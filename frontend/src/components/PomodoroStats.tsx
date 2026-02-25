import { useState, useEffect } from 'react'
import apiClient from '../utils/api-client'
import { useUserStore } from '../store'

interface PomodoroSession {
  id: string
  userId: string
  startTime: string
  endTime: string | null
  duration: number
  completed: boolean
  task: string | null
  createdAt: string
}

interface PomodoroStats {
  totalSessions: number
  completedSessions: number
  totalFocusTime: number
  averageSessionLength: number
  dailyStats: Array<{
    date: string
    sessions: number
    focusTime: number
  }>
}

export default function PomodoroStats() {
  const [stats, setStats] = useState<PomodoroStats | null>(null)
  const [sessions, setSessions] = useState<PomodoroSession[]>([])
  const [loading, setLoading] = useState(true)
  const user = useUserStore((s) => s.user)
  const userId = user?.id || 'demo-user'

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [statsData, sessionsData] = await Promise.all([
        apiClient.get<PomodoroStats>(`/api/pomodoro/user/${userId}/stats`),
        apiClient.get<PomodoroSession[]>(`/api/pomodoro/user/${userId}?limit=20`),
      ])
      setStats(statsData)
      setSessions(sessionsData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">加载中...</div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-600 py-12">
        无法加载统计数据
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Get last 7 days for chart
  const last7Days = stats.dailyStats.slice(-7)
  const maxSessions = Math.max(...last7Days.map(d => d.sessions), 1)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Overall Stats */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">总体统计</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">总会话数</div>
            <div className="text-3xl font-bold text-blue-600">
              {stats.totalSessions}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">完成会话</div>
            <div className="text-3xl font-bold text-green-600">
              {stats.completedSessions}
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">总专注时间</div>
            <div className="text-3xl font-bold text-purple-600">
              {Math.floor(stats.totalFocusTime / 60)}h {stats.totalFocusTime % 60}m
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">平均时长</div>
            <div className="text-3xl font-bold text-orange-600">
              {stats.averageSessionLength.toFixed(0)}m
            </div>
          </div>
        </div>
      </div>

      {/* Daily Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">最近7天</h2>
        <div className="space-y-4">
          {last7Days.map((day) => (
            <div key={day.date} className="flex items-center gap-4">
              <div className="w-24 text-sm text-gray-600">
                {formatDate(day.date)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className="bg-blue-500 h-8 rounded transition-all"
                    style={{
                      width: `${(day.sessions / maxSessions) * 100}%`,
                      minWidth: day.sessions > 0 ? '2rem' : '0',
                    }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">
                    {day.sessions} 个会话
                  </span>
                </div>
              </div>
              <div className="w-24 text-right text-sm text-gray-600">
                {day.focusTime} 分钟
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">最近会话</h2>
        {sessions.length === 0 ? (
          <p className="text-center text-gray-600 py-8">还没有会话记录</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`text-2xl ${session.completed ? '' : 'opacity-50'}`}>
                      {session.completed ? '✅' : '⏸️'}
                    </span>
                    <div>
                      <div className="font-medium text-gray-800">
                        {session.task || '未命名任务'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(session.startTime)} {formatTime(session.startTime)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-800">
                    {session.duration} 分钟
                  </div>
                  <div className="text-sm text-gray-600">
                    {session.completed ? '已完成' : '未完成'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
