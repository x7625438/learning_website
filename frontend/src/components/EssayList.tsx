import { useState, useEffect } from 'react'
import apiClient from '../utils/api-client'

interface Essay {
  id: string
  title: string
  subject?: string
  grade?: string
  createdAt: string
}

interface EssayListProps {
  refreshTrigger: number
  onEssaySelected: (essayId: string) => void
  selectedEssayId: string | null
}

export default function EssayList({ refreshTrigger, onEssaySelected, selectedEssayId }: EssayListProps) {
  const [essays, setEssays] = useState<Essay[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchEssays()
  }, [refreshTrigger])

  const fetchEssays = async () => {
    setIsLoading(true)
    try {
      const data = await apiClient.get<Essay[]>('/api/v1/essays/user/user-1')
      setEssays(data)
    } catch (error) {
      console.error('Error fetching essays:', error)
      // Set empty array on error to prevent showing error message
      setEssays([])
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">我的作文</h2>
        <p className="text-gray-500">加载中...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">我的作文</h2>
      
      {essays.length === 0 ? (
        <p className="text-gray-500">还没有提交作文</p>
      ) : (
        <div className="space-y-2">
          {essays.map((essay) => (
            <button
              key={essay.id}
              onClick={() => onEssaySelected(essay.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                selectedEssayId === essay.id
                  ? 'bg-blue-50 border-2 border-blue-500'
                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
              }`}
            >
              <h3 className="font-medium text-gray-900">{essay.title}</h3>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                {essay.subject && <span>{essay.subject}</span>}
                {essay.grade && <span>• {essay.grade}</span>}
                <span>• {new Date(essay.createdAt).toLocaleDateString()}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
