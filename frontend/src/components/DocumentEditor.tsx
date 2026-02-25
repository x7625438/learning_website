import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import apiClient from '../utils/api-client'
import { useNotificationStore, useUserStore } from '../store'

interface Document {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

interface DocumentEditorProps {
  documentId: string | null
  onDocumentSaved: () => void
}

interface Suggestion {
  suggestions: string[]
  explanation: string
}

interface QualityAssessment {
  overallScore: number
  dimensions: {
    structure: number
    language: number
    logic: number
    completeness: number
  }
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  detailedFeedback: string
}

export default function DocumentEditor({ documentId, onDocumentSaved }: DocumentEditorProps) {
  const [document, setDocument] = useState<Document | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'edit' | 'suggestions'>('edit')
  const [suggestionType, setSuggestionType] = useState<'structure' | 'improvement' | 'expansion' | 'quality'>('structure')
  const [suggestions, setSuggestions] = useState<Suggestion | null>(null)
  const [qualityAssessment, setQualityAssessment] = useState<QualityAssessment | null>(null)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [expandSection, setExpandSection] = useState('')
  const [context, setContext] = useState('')

  useEffect(() => {
    if (documentId) {
      fetchDocument(documentId)
    } else {
      // New document
      setDocument(null)
      setTitle('')
      setContent('')
      setSuggestions(null)
      setQualityAssessment(null)
    }
  }, [documentId])

  const fetchDocument = async (id: string) => {
    try {
      setLoading(true)
      const data = await apiClient.get<Document>(`/api/v1/documents/${id}`)
      setDocument(data)
      setTitle(data.title)
      setContent(data.content)
    } catch (error) {
      console.error('Failed to fetch document:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      useNotificationStore.getState().addNotification({ type: 'warning', message: '请填写标题和内容' })
      return
    }

    try {
      setSaving(true)
      const userId = useUserStore.getState().user?.id || 'demo-user'

      if (documentId) {
        // Update existing document
        const data = await apiClient.put<Document>(`/api/v1/documents/${documentId}`, { title, content })
        setDocument(data)
        onDocumentSaved()
      } else {
        // Create new document
        const data = await apiClient.post<Document>('/api/v1/documents', { title, content, userId })
        setDocument(data)
        onDocumentSaved()
      }
    } catch (error) {
      console.error('Failed to save document:', error)
      useNotificationStore.getState().addNotification({ type: 'error', message: '保存失败，请重试' })
    } finally {
      setSaving(false)
    }
  }

  const handleGetSuggestions = async () => {
    if (!content.trim()) {
      useNotificationStore.getState().addNotification({ type: 'warning', message: '请先输入内容' })
      return
    }

    try {
      setLoadingSuggestions(true)
      setSuggestions(null)
      setQualityAssessment(null)

      if (suggestionType === 'quality' && documentId) {
        const data = await apiClient.post<QualityAssessment>(`/api/v1/documents/${documentId}/assess`, { context })
        setQualityAssessment(data)
      } else if (suggestionType === 'expansion' && documentId) {
        const data = await apiClient.post<{ expandedContent: string }>(`/api/v1/documents/${documentId}/expand`, { section: expandSection, context })
        setSuggestions({
          suggestions: [data.expandedContent],
          explanation: '已生成扩展内容',
        })
      } else if (documentId) {
        const endpoint =
          suggestionType === 'structure'
            ? `/api/v1/documents/${documentId}/suggestions/structure`
            : `/api/v1/documents/${documentId}/suggestions/improvement`

        const data = await apiClient.post<Suggestion>(endpoint, { context })
        setSuggestions(data)
      } else {
        const data = await apiClient.post<Suggestion>('/api/v1/documents/suggestions', {
          content,
          suggestionType,
          context: suggestionType === 'expansion' ? expandSection : context,
        })
        setSuggestions(data)
      }

      setActiveTab('suggestions')
    } catch (error) {
      console.error('Failed to get suggestions:', error)
      useNotificationStore.getState().addNotification({ type: 'error', message: '获取建议失败，请重试' })
    } finally {
      setLoadingSuggestions(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'edit'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            编辑
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'suggestions'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            AI建议
          </button>
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'edit' ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">标题</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="输入文档标题..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Content Textarea */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">内容</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="开始写作..."
                  rows={15}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="suggestions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Suggestion Type Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">建议类型</label>
                <select
                  value={suggestionType}
                  onChange={(e) => setSuggestionType(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="structure">结构建议</option>
                  <option value="improvement">改进建议</option>
                  <option value="expansion">内容扩展</option>
                  <option value="quality">质量评估</option>
                </select>
              </div>

              {/* Context/Section Input */}
              {suggestionType === 'expansion' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">需要扩展的部分</label>
                  <input
                    type="text"
                    value={expandSection}
                    onChange={(e) => setExpandSection(e.target.value)}
                    placeholder="例如：第二段、结论部分..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">背景说明（可选）</label>
                  <input
                    type="text"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="提供文档背景信息..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Get Suggestions Button */}
              <button
                onClick={handleGetSuggestions}
                disabled={loadingSuggestions}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
              >
                {loadingSuggestions ? '生成中...' : '获取AI建议'}
              </button>

              {/* Display Suggestions */}
              {suggestions && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">AI建议</h3>
                  <div className="space-y-2">
                    {suggestions.suggestions.map((suggestion, index) => (
                      <div key={index} className="p-3 bg-white rounded border border-blue-200">
                        <p className="text-gray-700">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                  {suggestions.explanation && (
                    <div className="mt-4 p-3 bg-white rounded border border-blue-200">
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{suggestions.explanation}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Display Quality Assessment */}
              {qualityAssessment && (
                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">质量评估</h3>
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold text-blue-600">{qualityAssessment.overallScore}</div>
                      <div className="text-sm text-gray-600">总分</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-3 bg-white rounded">
                        <div className="text-sm text-gray-600">结构</div>
                        <div className="text-2xl font-semibold text-blue-600">{qualityAssessment.dimensions.structure}</div>
                      </div>
                      <div className="p-3 bg-white rounded">
                        <div className="text-sm text-gray-600">语言</div>
                        <div className="text-2xl font-semibold text-green-600">{qualityAssessment.dimensions.language}</div>
                      </div>
                      <div className="p-3 bg-white rounded">
                        <div className="text-sm text-gray-600">逻辑</div>
                        <div className="text-2xl font-semibold text-purple-600">{qualityAssessment.dimensions.logic}</div>
                      </div>
                      <div className="p-3 bg-white rounded">
                        <div className="text-sm text-gray-600">完整性</div>
                        <div className="text-2xl font-semibold text-orange-600">{qualityAssessment.dimensions.completeness}</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 bg-green-50 rounded">
                        <h4 className="font-medium text-green-900 mb-2">优点</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {qualityAssessment.strengths.map((strength, index) => (
                            <li key={index} className="text-sm text-green-800">{strength}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 bg-orange-50 rounded">
                        <h4 className="font-medium text-orange-900 mb-2">不足</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {qualityAssessment.weaknesses.map((weakness, index) => (
                            <li key={index} className="text-sm text-orange-800">{weakness}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 bg-blue-50 rounded">
                        <h4 className="font-medium text-blue-900 mb-2">改进建议</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {qualityAssessment.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-blue-800">{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">详细反馈</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{qualityAssessment.detailedFeedback}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
