import { useState, useEffect } from 'react'
import apiClient from '../utils/api-client'

interface Paper {
  id: string
  title: string
  authors: string[]
  abstract: string
  content: string
  translatedContent?: string
  createdAt: string
  updatedAt: string
}

interface TermAnnotation {
  term: string
  explanation: string
  context: string
}

interface PaperSummary {
  overview: string
  keyFindings: string[]
  methodology: string
  conclusions: string
  significance: string
}

interface PaperReaderProps {
  paper: Paper
  onBack: () => void
  userId: string
}

export function PaperReader({ paper, onBack, userId }: PaperReaderProps) {
  const [activeTab, setActiveTab] = useState<'original' | 'translated'>('original')
  const [translating, setTranslating] = useState(false)
  const [translatedContent, setTranslatedContent] = useState(paper.translatedContent || '')
  const [selectedText, setSelectedText] = useState('')
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [answering, setAnswering] = useState(false)
  const [annotations, setAnnotations] = useState<TermAnnotation[]>([])
  const [loadingAnnotations, setLoadingAnnotations] = useState(false)
  const [summary, setSummary] = useState<PaperSummary | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (paper.translatedContent) {
      setTranslatedContent(paper.translatedContent)
    }
  }, [paper.translatedContent])

  const handleTranslate = async () => {
    if (translatedContent) {
      setActiveTab('translated')
      return
    }

    setTranslating(true)
    setError(null)

    try {
      const data = await apiClient.post<{ translatedContent: string }>(`/api/v1/papers/${paper.id}/translate`, { userId })
      setTranslatedContent(data.translatedContent)
      setActiveTab('translated')
    } catch (err) {
      setError(err instanceof Error ? err.message : '翻译失败')
    } finally {
      setTranslating(false)
    }
  }

  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim())
      setShowQuestionModal(true)
    }
  }

  const handleQuestionSubmit = async () => {
    if (!question.trim() || !selectedText) return

    setAnswering(true)
    setError(null)

    try {
      const data = await apiClient.post<{ answer: string }>(`/api/v1/papers/${paper.id}/question`, {
        question: question.trim(),
        context: selectedText,
        userId
      })
      setAnswer(data.answer)
    } catch (err) {
      setError(err instanceof Error ? err.message : '问答失败')
    } finally {
      setAnswering(false)
    }
  }

  const handleIdentifyTerms = async () => {
    setLoadingAnnotations(true)
    setError(null)

    try {
      const textToAnalyze = activeTab === 'translated' ? translatedContent : paper.content
      const data = await apiClient.post<{ annotations: TermAnnotation[] }>(`/api/v1/papers/${paper.id}/terms`, {
        text: textToAnalyze,
        userId
      })
      setAnnotations(data.annotations)
    } catch (err) {
      setError(err instanceof Error ? err.message : '术语识别失败')
    } finally {
      setLoadingAnnotations(false)
    }
  }

  const handleGenerateSummary = async () => {
    setLoadingSummary(true)
    setError(null)

    try {
      const data = await apiClient.post<PaperSummary>(`/api/v1/papers/${paper.id}/summary`, { userId })
      setSummary(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '摘要生成失败')
    } finally {
      setLoadingSummary(false)
    }
  }

  const closeQuestionModal = () => {
    setShowQuestionModal(false)
    setQuestion('')
    setAnswer('')
    setSelectedText('')
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回论文列表
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {paper.title}
        </h1>
        <p className="text-gray-600 mb-4">
          作者: {paper.authors.join(', ')}
        </p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('original')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'original'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              原文
            </button>
            <button
              onClick={() => setActiveTab('translated')}
              disabled={!translatedContent}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'translated'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              中文翻译
              {!translatedContent && (
                <span className="ml-1 text-xs">(未翻译)</span>
              )}
            </button>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div 
              className="prose max-w-none text-gray-800 leading-relaxed"
              onMouseUp={handleTextSelection}
              style={{ userSelect: 'text' }}
            >
              {activeTab === 'original' ? (
                <div>
                  <h3 className="text-lg font-semibold mb-4">摘要</h3>
                  <p className="mb-6 text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {paper.abstract}
                  </p>
                  <h3 className="text-lg font-semibold mb-4">正文</h3>
                  <div className="whitespace-pre-wrap">
                    {paper.content}
                  </div>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">
                  {translatedContent}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Tools */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              AI助手工具
            </h3>
            
            <div className="space-y-3">
              <button
                onClick={handleTranslate}
                disabled={translating}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {translating ? '翻译中...' : '智能翻译'}
              </button>

              <button
                onClick={handleIdentifyTerms}
                disabled={loadingAnnotations}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {loadingAnnotations ? '识别中...' : '术语注释'}
              </button>

              <button
                onClick={handleGenerateSummary}
                disabled={loadingSummary}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {loadingSummary ? '生成中...' : '生成摘要'}
              </button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                💡 选中文本后可以进行实时提问
              </p>
            </div>
          </div>

          {/* Term Annotations */}
          {annotations.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                术语注释
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {annotations.map((annotation, index) => (
                  <div key={index} className="border-l-4 border-green-400 pl-3">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {annotation.term}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {annotation.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {summary && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                论文摘要报告
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">概述</h4>
                  <p className="text-gray-700">{summary.overview}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">关键发现</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {summary.keyFindings.map((finding, index) => (
                      <li key={index}>{finding}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">研究方法</h4>
                  <p className="text-gray-700">{summary.methodology}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">结论</h4>
                  <p className="text-gray-700">{summary.conclusions}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">研究意义</h4>
                  <p className="text-gray-700">{summary.significance}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  对选中内容提问
                </h3>
                <button
                  onClick={closeQuestionModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选中的文本:
                </label>
                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 max-h-32 overflow-y-auto">
                  {selectedText}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  您的问题:
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="请输入您想了解的问题..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {answer && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI回答:
                  </label>
                  <div className="bg-blue-50 p-3 rounded-lg text-sm text-gray-700">
                    {answer}
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={handleQuestionSubmit}
                  disabled={!question.trim() || answering}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {answering ? '思考中...' : '提问'}
                </button>
                <button
                  onClick={closeQuestionModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}