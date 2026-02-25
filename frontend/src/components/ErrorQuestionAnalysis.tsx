import React, { useState, useEffect } from 'react'
import apiClient from '../utils/api-client'

interface WeakSubject {
  subject: string
  averageMastery: number
  errorCount: number
}

interface Analysis {
  totalErrors: number
  subjectBreakdown: Record<string, number>
  difficultyBreakdown: Record<string, number>
  weakestSubjects: string[]
}

interface PracticeQuestion {
  question: string
  correctAnswer: string
  explanation: string
  hints: string[]
  subject: string
  difficulty: string
  basedOnErrorId: string
}

interface ErrorQuestionAnalysisProps {
  userId: string
}

const ErrorQuestionAnalysis: React.FC<ErrorQuestionAnalysisProps> = ({ userId }) => {
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [weakSubjects, setWeakSubjects] = useState<WeakSubject[]>([])
  const [practiceQuestions, setPracticeQuestions] = useState<PracticeQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingPractice, setGeneratingPractice] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalysis()
  }, [userId])

  const fetchAnalysis = async () => {
    try {
      setLoading(true)
      const [analysisData, weakSubjectsData] = await Promise.all([
        apiClient.get<Analysis>(`/api/v1/error-questions/user/${userId}/analysis`),
        apiClient.get<WeakSubject[]>(`/api/v1/error-questions/user/${userId}/weak-subjects`),
      ])
      setAnalysis(analysisData)
      setWeakSubjects(weakSubjectsData)
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load analysis')
    } finally {
      setLoading(false)
    }
  }

  const generatePractice = async () => {
    try {
      setGeneratingPractice(true)
      const data = await apiClient.post<PracticeQuestion[]>(
        `/api/v1/error-questions/user/${userId}/generate-practice`,
        { count: 5 }
      )
      setPracticeQuestions(data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate practice questions')
    } finally {
      setGeneratingPractice(false)
    }
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

  if (!analysis) {
    return null
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">错题分析</h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">总错题数</div>
          <div className="text-3xl font-bold text-blue-600">{analysis.totalErrors}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">涉及科目</div>
          <div className="text-3xl font-bold text-green-600">
            {Object.keys(analysis.subjectBreakdown).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-600 mb-1">薄弱科目</div>
          <div className="text-3xl font-bold text-red-600">{analysis.weakestSubjects.length}</div>
        </div>
      </div>

      {/* Weak Subjects */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">薄弱科目</h3>
        <div className="space-y-3">
          {weakSubjects.map((ws) => (
            <div key={ws.subject} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium">{ws.subject}</div>
                <div className="text-sm text-gray-600">{ws.errorCount} 道错题</div>
              </div>
              <div className="w-48">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        ws.averageMastery >= 80
                          ? 'bg-green-500'
                          : ws.averageMastery >= 50
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${ws.averageMastery}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {ws.averageMastery.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subject Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">科目分布</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(analysis.subjectBreakdown).map(([subject, count]) => (
            <div key={subject} className="border rounded-lg p-4">
              <div className="font-medium">{subject}</div>
              <div className="text-2xl font-bold text-blue-600">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Generate Practice */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">个性化练习</h3>
        <button
          onClick={generatePractice}
          disabled={generatingPractice}
          className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {generatingPractice ? '生成中...' : '生成练习题'}
        </button>

        {practiceQuestions.length > 0 && (
          <div className="mt-6 space-y-4">
            {practiceQuestions.map((pq, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">练习题 {index + 1}</h4>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    {pq.subject}
                  </span>
                </div>
                <p className="text-gray-900 mb-3">{pq.question}</p>
                <details className="text-sm">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-700">
                    查看答案和解析
                  </summary>
                  <div className="mt-2 space-y-2 pl-4">
                    <div>
                      <span className="font-medium">答案：</span>
                      <span className="text-green-600">{pq.correctAnswer}</span>
                    </div>
                    <div>
                      <span className="font-medium">解析：</span>
                      <span className="text-gray-700">{pq.explanation}</span>
                    </div>
                    {pq.hints && pq.hints.length > 0 && (
                      <div>
                        <span className="font-medium">提示：</span>
                        <ul className="list-disc list-inside">
                          {pq.hints.map((hint, i) => (
                            <li key={i} className="text-gray-700">{hint}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ErrorQuestionAnalysis
