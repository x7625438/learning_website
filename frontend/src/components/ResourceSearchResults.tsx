import React, { useState } from 'react'
import apiClient from '../utils/api-client'

interface ResourceItem {
  id: string
  title: string
  description: string
  url: string
  source: string
  contentType: 'article' | 'paper' | 'book' | 'video' | 'website'
  relevanceScore: number
  credibilityScore: number
  publishDate?: string
  authors?: string[]
  tags?: string[]
}

interface ResourceSearchResult {
  id: string
  userId: string
  query: string
  searchStrategy: string
  resources: ResourceItem[]
  categorizedResources: Record<string, ResourceItem[]>
  totalResults: number
  createdAt: string
}

interface ResourceSearchResultsProps {
  result: ResourceSearchResult
  onClear: () => void
}

export function ResourceSearchResults({ result, onClear }: ResourceSearchResultsProps) {
  const [showStrategy, setShowStrategy] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<'markdown' | 'json' | 'plain' | 'citation'>('markdown')
  const [formattedContent, setFormattedContent] = useState<string | null>(null)
  const [loadingFormat, setLoadingFormat] = useState(false)

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'paper':
        return '📄'
      case 'book':
        return '📚'
      case 'video':
        return '🎥'
      case 'article':
        return '📰'
      case 'website':
        return '🌐'
      default:
        return '📄'
    }
  }

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'paper':
        return 'bg-purple-100 text-purple-800'
      case 'book':
        return 'bg-green-100 text-green-800'
      case 'video':
        return 'bg-red-100 text-red-800'
      case 'article':
        return 'bg-blue-100 text-blue-800'
      case 'website':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleFormatExport = async () => {
    try {
      setLoadingFormat(true)
      const data = await apiClient.post<{ content: string }>(`/api/v1/resources/${result.id}/format`, { format: selectedFormat })
      setFormattedContent(data.content)
    } catch (err) {
      console.error('Format error:', err)
    } finally {
      setLoadingFormat(false)
    }
  }

  const handleCopyFormatted = () => {
    if (formattedContent) {
      navigator.clipboard.writeText(formattedContent)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              搜索结果
            </h2>
            <p className="text-gray-600 mb-2">
              查询: <span className="font-medium">{result.query}</span>
            </p>
            <p className="text-sm text-gray-500">
              找到 {result.totalResults} 个相关资料
            </p>
          </div>
          <button
            onClick={onClear}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Strategy */}
        <div className="border-t pt-4">
          <button
            onClick={() => setShowStrategy(!showStrategy)}
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <span>{showStrategy ? '隐藏' : '查看'}搜索策略</span>
            <svg 
              className={`w-5 h-5 ml-1 transform transition-transform ${showStrategy ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showStrategy && (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {result.searchStrategy}
              </pre>
            </div>
          )}
        </div>

        {/* Export Options */}
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              导出格式:
            </label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="markdown">Markdown</option>
              <option value="json">JSON</option>
              <option value="plain">纯文本</option>
              <option value="citation">引用格式</option>
            </select>
            <button
              onClick={handleFormatExport}
              disabled={loadingFormat}
              className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 text-sm"
            >
              {loadingFormat ? '生成中...' : '生成'}
            </button>
            {formattedContent && (
              <button
                onClick={handleCopyFormatted}
                className="px-4 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                复制
              </button>
            )}
          </div>
          
          {formattedContent && (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                {formattedContent}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Categorized Results */}
      {Object.entries(result.categorizedResources).map(([category, items]) => (
        <div key={category} className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {category} ({items.length})
          </h3>

          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getContentTypeIcon(item.contentType)}</span>
                    <h4 className="text-lg font-medium text-gray-900">
                      {item.title}
                    </h4>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getContentTypeColor(item.contentType)}`}>
                    {item.contentType}
                  </span>
                </div>

                <p className="text-gray-600 mb-3">
                  {item.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span>来源: {item.source}</span>
                  <span>相关度: {(item.relevanceScore * 100).toFixed(0)}%</span>
                  <span>可信度: {(item.credibilityScore * 100).toFixed(0)}%</span>
                </div>

                {item.authors && item.authors.length > 0 && (
                  <div className="text-sm text-gray-600 mb-2">
                    作者: {item.authors.join(', ')}
                  </div>
                )}

                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {item.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  访问资源
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
