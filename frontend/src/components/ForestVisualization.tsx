import { useState, useEffect } from 'react'
import apiClient from '../utils/api-client'
import { useUserStore } from '../store'

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

export default function ForestVisualization() {
  const [stats, setStats] = useState<PomodoroStats | null>(null)
  const [loading, setLoading] = useState(true)
  const user = useUserStore((s) => s.user)
  const userId = user?.id || 'demo-user'

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await apiClient.get<PomodoroStats>(`/api/pomodoro/user/${userId}/stats`)
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats:', error)
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

  // Generate trees based on completed sessions
  const trees = Array.from({ length: stats.completedSessions }, (_, i) => ({
    id: i,
    type: i % 3 === 0 ? 'pine' : i % 3 === 1 ? 'oak' : 'birch',
    size: Math.random() * 0.5 + 0.75, // Random size between 0.75 and 1.25
  }))

  const getTreeEmoji = (type: string) => {
    switch (type) {
      case 'pine':
        return '🌲'
      case 'oak':
        return '🌳'
      case 'birch':
        return '🌴'
      default:
        return '🌲'
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">你的专注森林</h2>

        {/* Forest Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-600">
              {stats.completedSessions}
            </div>
            <div className="text-sm text-gray-600 mt-1">棵树</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">
              {Math.floor(stats.totalFocusTime / 60)}h {stats.totalFocusTime % 60}m
            </div>
            <div className="text-sm text-gray-600 mt-1">专注时间</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">
              {stats.averageSessionLength.toFixed(0)}
            </div>
            <div className="text-sm text-gray-600 mt-1">平均时长（分钟）</div>
          </div>
        </div>

        {/* Forest Visualization */}
        <div className="bg-gradient-to-b from-sky-100 to-green-100 rounded-lg p-8 min-h-96 relative overflow-hidden">
          {trees.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="text-6xl mb-4">🌱</div>
              <p className="text-gray-600 text-center">
                你的森林还是空的<br />
                完成番茄钟来种植你的第一棵树！
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-8 gap-4">
              {trees.map((tree) => (
                <div
                  key={tree.id}
                  className="flex items-end justify-center animate-fade-in"
                  style={{
                    transform: `scale(${tree.size})`,
                    transition: 'transform 0.3s ease',
                  }}
                >
                  <span className="text-5xl hover:scale-110 transition-transform cursor-pointer">
                    {getTreeEmoji(tree.type)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Ground */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-green-800 opacity-20"></div>
        </div>

        {/* Motivation Message */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg text-center">
          <p className="text-green-800">
            {stats.completedSessions === 0 && '🌱 开始你的第一个番茄钟，种下第一棵树！'}
            {stats.completedSessions > 0 && stats.completedSessions < 5 && '🌿 很好的开始！继续保持专注！'}
            {stats.completedSessions >= 5 && stats.completedSessions < 20 && '🌳 你的森林正在成长！'}
            {stats.completedSessions >= 20 && stats.completedSessions < 50 && '🌲 令人印象深刻的森林！'}
            {stats.completedSessions >= 50 && '🏆 你已经建立了一片茂密的森林！继续保持！'}
          </p>
        </div>
      </div>
    </div>
  )
}
