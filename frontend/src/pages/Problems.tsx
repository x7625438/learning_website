import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ProblemSolver from '../components/ProblemSolver'
import ProblemHistory from '../components/ProblemHistory'
import apiClient from '../utils/api-client'
import { useUserStore } from '../store'

interface Problem {
  id: string
  question: string
  subject: string
  difficulty: 'easy' | 'medium' | 'hard'
  createdAt: string
}

interface ProblemSession {
  id: string
  problemId: string
  completed: boolean
  currentStep: number
}

const Problems: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'solve' | 'history'>('solve')
  const [activeSession, setActiveSession] = useState<ProblemSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkActiveSession()
  }, [])

  const checkActiveSession = async () => {
    try {
      const userId = useUserStore.getState().user?.id || 'demo-user'
      const session = await apiClient.get<ProblemSession>(`/api/v1/problems/active-session/${userId}`)
      setActiveSession(session)
    } catch (error) {
      console.error('Failed to check active session:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSessionComplete = () => {
    setActiveSession(null)
    setActiveTab('history')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            AI解题助手
          </h1>
          <p className="text-lg text-gray-600">
            让AI引导你逐步思考，掌握解题方法
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setActiveTab('solve')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                activeTab === 'solve'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              解题练习
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              历史记录
            </button>
          </div>
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'solve' ? (
            <ProblemSolver 
              activeSession={activeSession}
              onSessionComplete={handleSessionComplete}
            />
          ) : (
            <ProblemHistory />
          )}
        </motion.div>

        {/* Active Session Indicator */}
        {activeSession && activeTab !== 'solve' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed bottom-6 right-6 bg-orange-500 text-white p-4 rounded-lg shadow-lg cursor-pointer"
            onClick={() => setActiveTab('solve')}
          >
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="font-medium">有未完成的解题会话</span>
            </div>
            <p className="text-sm opacity-90 mt-1">点击继续解题</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Problems