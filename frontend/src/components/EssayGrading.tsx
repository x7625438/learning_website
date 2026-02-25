import { useState, useEffect } from 'react'
import apiClient from '../utils/api-client'

interface EssayAnalysis {
  structureScore: number
  languageScore: number
  contentScore: number
  overallScore: number
  structureAnalysis: string
  languageAnalysis: string
  contentAnalysis: string
}

interface ImprovementPoint {
  category: string
  issue: string
  suggestion: string
  priority: string
  location?: string
}

interface OptimizedExample {
  originalText: string
  optimizedText: string
  explanation: string
  improvementType: string
}

interface EssayFeedback {
  analysis: EssayAnalysis
  improvementPoints: ImprovementPoint[]
  optimizedExamples: OptimizedExample[]
  strengths: string[]
  areasForImprovement: string[]
  overallComment: string
}

interface EssayGradingProps {
  essayId: string
}

export default function EssayGrading({ essayId }: EssayGradingProps) {
  const [feedback, setFeedback] = useState<EssayFeedback | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFeedback()
  }, [essayId])

  const fetchFeedback = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiClient.get<EssayFeedback>(`/api/v1/essays/${essayId}/feedback`)
      setFeedback(data)
    } catch (error: any) {
      console.error('Error fetching feedback:', error)
      // Check if it's a network error or API not available
      if (error.response) {
        setError('获取批改结果失败，请稍后重试')
      } else if (error.request) {
        setError('无法连接到服务器，请检查网络连接')
      } else {
        setError('发生未知错误')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-600 mb-4">批改功能暂时不可用</p>
        <p className="text-sm text-gray-500">请确保后端服务正在运行</p>
      </div>
    )
  }

  if (!feedback) {
    return null
  }

  const { analysis, improvementPoints, optimizedExamples, strengths, areasForImprovement, overallComment } = feedback

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      structure: '结构',
      language: '语言',
      content: '内容',
      logic: '逻辑'
    }
    return labels[category] || category
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Overall Score */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">批改结果</h2>
        <div className="flex items-center gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">{analysis.overallScore}</div>
            <div className="text-sm text-gray-500 mt-1">总分</div>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-700">{analysis.structureScore}</div>
              <div className="text-sm text-gray-500">结构</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-700">{analysis.languageScore}</div>
              <div className="text-sm text-gray-500">语言</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-700">{analysis.contentScore}</div>
              <div className="text-sm text-gray-500">内容</div>
            </div>
          </div>
        </div>
        <p className="mt-4 text-gray-700">{overallComment}</p>
      </div>

      {/* Detailed Analysis */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">详细分析</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">结构分析</h4>
            <p className="text-gray-600">{analysis.structureAnalysis}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">语言分析</h4>
            <p className="text-gray-600">{analysis.languageAnalysis}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">内容分析</h4>
            <p className="text-gray-600">{analysis.contentAnalysis}</p>
          </div>
        </div>
      </div>

      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">写作优势</h3>
          <ul className="space-y-2">
            {strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span className="text-gray-700">{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvement Points */}
      {improvementPoints.length > 0 && (
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">改进建议</h3>
          <div className="space-y-4">
            {improvementPoints.map((point, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(point.priority)}`}>
                      {point.priority === 'high' ? '高' : point.priority === 'medium' ? '中' : '低'}
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {getCategoryLabel(point.category)}
                    </span>
                    {point.location && (
                      <span className="text-sm text-gray-500">• {point.location}</span>
                    )}
                  </div>
                </div>
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">问题：</span>
                  <span className="text-sm text-gray-600 ml-1">{point.issue}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">建议：</span>
                  <span className="text-sm text-gray-600 ml-1">{point.suggestion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optimized Examples */}
      {optimizedExamples.length > 0 && (
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">优化示例</h3>
          <div className="space-y-6">
            {optimizedExamples.map((example, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="mb-3">
                  <span className="text-sm font-medium text-blue-600">{example.improvementType}</span>
                </div>
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-700 mb-1">原文：</div>
                  <div className="bg-red-50 p-3 rounded text-sm text-gray-700">
                    {example.originalText}
                  </div>
                </div>
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-700 mb-1">优化后：</div>
                  <div className="bg-green-50 p-3 rounded text-sm text-gray-700">
                    {example.optimizedText}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">说明：</div>
                  <div className="text-sm text-gray-600">{example.explanation}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Areas for Improvement */}
      {areasForImprovement.length > 0 && (
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">需要提升的方面</h3>
          <ul className="space-y-2">
            {areasForImprovement.map((area, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">→</span>
                <span className="text-gray-700">{area}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
