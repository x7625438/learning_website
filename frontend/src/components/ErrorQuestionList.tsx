import React, { useState, useEffect } from 'react'
import apiClient from '../utils/api-client'

interface ErrorQuestion {
  id: string
  question: string
  userAnswer: string
  correctAnswer: string
  explanation: string
  subject: string
  difficulty: string
  masteryLevel: number
  createdAt: string
}

interface ErrorQuestionListProps {
  userId: string
  refreshTrigger?: number
}

const ErrorQuestionList: React.FC<ErrorQuestionListProps> = ({ userId, refreshTrigger }) => {
  const [errorQuestions, setErrorQuestions] = useState<ErrorQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedQuestion, setSelectedQuestion] = useState<ErrorQuestion | null>(null)

  useEffect(() => {
    fetchErrorQuestions()
  }, [userId, refreshTrigger])

  const fetchErrorQuestions = async () => {
    try {
      setLoading(true)
      const data = await apiClient.get<ErrorQuestion[]>(
        `/api/v1/error-questions/user/${userId}`
      )
      setErrorQuestions(data)
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load error questions')
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'hard':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getMasteryColor = (level: number) => {
    if (level >= 80) return 'bg-green-500'
    if (level >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">错题列表</h2>

      {errorQuestions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          暂无错题记录
        </div>
      ) : (
        <div className="grid gap-4">
          {errorQuestions.map((eq) => (
            <div
              key={eq.id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedQuestion(eq)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{eq.question}</h3>
                  <div className="flex gap-2 items-center">
                    <span className="text-sm text-gray-600">{eq.subject}</span>
                    <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(eq.difficulty)}`}>
                      {eq.difficulty === 'easy' ? '简单' : eq.difficulty === 'medium' ? '中等' : '困难'}
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-sm text-gray-600 mb-1">掌握度</div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getMasteryColor(eq.masteryLevel)}`}
                      style={{ width: `${eq.masteryLevel}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-center mt-1">{eq.masteryLevel}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">错题详情</h3>
              <button
                onClick={() => setSelectedQuestion(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">题目</label>
                <p className="text-gray-900">{selectedQuestion.question}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">你的答案</label>
                <p className="text-red-600">{selectedQuestion.userAnswer}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">正确答案</label>
                <p className="text-green-600">{selectedQuestion.correctAnswer}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">解析</label>
                <p className="text-gray-900">{selectedQuestion.explanation}</p>
              </div>

              <div className="flex gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">科目</label>
                  <p className="text-gray-900">{selectedQuestion.subject}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">难度</label>
                  <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(selectedQuestion.difficulty)}`}>
                    {selectedQuestion.difficulty === 'easy' ? '简单' : selectedQuestion.difficulty === 'medium' ? '中等' : '困难'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ErrorQuestionList
