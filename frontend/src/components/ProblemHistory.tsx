import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import apiClient from '../utils/api-client'
import { useNotificationStore, useUserStore } from '../store'

interface Problem {
  id: string
  question: string
  subject: string
  difficulty: 'easy' | 'medium' | 'hard'
  problemType: string
  createdAt: string
}

interface ProblemSession {
  id: string
  problemId: string
  completed: boolean
  startTime: string
  endTime?: string
  userProgress: UserProgress[]
}

interface ProblemSummary {
  problemId: string
  method: string
  keySteps: string[]
  concepts: string[]
  timeSpent: number
  hintsUsed: number
}

interface UserProgress {
  stepNumber: number
  userInput: string
  timestamp: string
  needsHint: boolean
}

interface HistoryData {
  problems: Problem[]
  sessions: ProblemSession[]
  summaries: ProblemSummary[]
}

const ProblemHistory: React.FC = () => {
  const [historyData, setHistoryData] = useState<HistoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null)
  const [generatingSimilar, setGeneratingSimilar] = useState(false)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const userId = useUserStore.getState().user?.id || 'demo-user'
      const data = await apiClient.get<HistoryData>(`/api/v1/problems/history/${userId}`)
      setHistoryData(data)
    } catch (error) {
      console.error('Failed to load history:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateSimilarProblems = async (problemId: string) => {
    setGeneratingSimilar(true)
    try {
      const similarProblems = await apiClient.post<Problem[]>('/api/v1/problems/generate-similar', { problemId, count: 3 })
      console.log('Generated similar problems:', similarProblems)
      useNotificationStore.getState().addNotification({ type: 'success', message: `生成了 ${similarProblems.length} 道类似题目！` })
    } catch (error) {
      console.error('Failed to generate similar problems:', error)
    } finally {
      setGeneratingSimilar(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}分钟`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}小时${mins}分钟`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!historyData || historyData.problems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">还没有解题记录</h3>
        <p className="text-gray-500">开始你的第一道题目吧！</p>
      </div>
    )
  }

  const getSessionForProblem = (problemId: string) => {
    return historyData.sessions.find(s => s.problemId === problemId)
  }

  const getSummaryForProblem = (problemId: string) => {
    return historyData.summaries.find(s => s.problemId === problemId)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Problems List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">解题历史</h2>
          
          {historyData.problems.map((problem) => {
            const session = getSessionForProblem(problem.id)
            const summary = getSummaryForProblem(problem.id)
            
            return (
              <motion.div
                key={problem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all hover:shadow-xl ${
                  selectedProblem === problem.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedProblem(problem.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty === 'easy' ? '简单' : problem.difficulty === 'medium' ? '中等' : '困难'}
                      </span>
                      <span className="text-sm text-gray-500">{problem.subject}</span>
                      <span className="text-sm text-gray-500">{problem.problemType}</span>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                      {problem.question}
                    </h3>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {session?.completed ? (
                      <span className="text-green-600 text-sm font-medium">✓ 已完成</span>
                    ) : (
                      <span className="text-orange-600 text-sm font-medium">⏸ 未完成</span>
                    )}
                  </div>
                </div>

                {summary && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">用时:</span> {formatDuration(summary.timeSpent)}
                    </div>
                    <div>
                      <span className="font-medium">提示:</span> {summary.hintsUsed}次
                    </div>
                    <div>
                      <span className="font-medium">方法:</span> {summary.method}
                    </div>
                    <div>
                      <span className="font-medium">概念:</span> {summary.concepts.length}个
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">
                    {new Date(problem.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      generateSimilarProblems(problem.id)
                    }}
                    disabled={generatingSimilar}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
                  >
                    {generatingSimilar ? '生成中...' : '生成类似题目'}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Problem Details */}
        <div className="lg:col-span-1">
          {selectedProblem ? (
            <ProblemDetails 
              problemId={selectedProblem}
              problem={historyData.problems.find(p => p.id === selectedProblem)!}
              session={getSessionForProblem(selectedProblem)}
              summary={getSummaryForProblem(selectedProblem)}
            />
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-4xl mb-4">👈</div>
              <h3 className="font-semibold text-gray-700 mb-2">选择一道题目</h3>
              <p className="text-gray-500 text-sm">点击左侧的题目查看详细信息</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface ProblemDetailsProps {
  problemId: string
  problem: Problem
  session?: ProblemSession
  summary?: ProblemSummary
}

const ProblemDetails: React.FC<ProblemDetailsProps> = ({ problem, session, summary }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
      <h3 className="font-bold text-gray-800 mb-4">题目详情</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">问题</h4>
          <p className="text-gray-600 text-sm">{problem.question}</p>
        </div>

        {summary && (
          <>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">解题方法</h4>
              <p className="text-gray-600 text-sm">{summary.method}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-2">关键步骤</h4>
              <ol className="list-decimal list-inside text-gray-600 text-sm space-y-1">
                {summary.keySteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>

            {summary.concepts.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">涉及概念</h4>
                <div className="flex flex-wrap gap-1">
                  {summary.concepts.map((concept, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {session && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">解题过程</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {session.userProgress.map((progress, index) => (
                <div key={index} className="bg-gray-50 p-2 rounded text-xs">
                  <div className="font-medium text-gray-700 mb-1">
                    第{progress.stepNumber}步 {progress.needsHint && '💡'}
                  </div>
                  <p className="text-gray-600">{progress.userInput}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">状态:</span>
              <span className={`ml-1 ${session?.completed ? 'text-green-600' : 'text-orange-600'}`}>
                {session?.completed ? '已完成' : '未完成'}
              </span>
            </div>
            {summary && (
              <div>
                <span className="font-medium text-gray-700">用时:</span>
                <span className="ml-1 text-gray-600">{summary.timeSpent}分钟</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProblemHistory