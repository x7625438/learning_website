import React from 'react'

interface ResourceItem {
  id: string
  title: string
  description: string
  url: string
  source: string
  contentType: 'article' | 'paper' | 'book' | 'video' | 'website'
  relevanceScore: number
  credibilityScore: number
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

interface ResourceSearchHistoryProps {
  history: ResourceSearchResult[]
  onSelect: (result: ResourceSearchResult) => void
}

export function ResourceSearchHistory({ history, onSelect }: ResourceSearchHistoryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins}分钟前`
    } else if (diffHours < 24) {
      return `${diffHours}小时前`
    } else if (diffDays < 7) {
      return `${diffDays}天前`
    } else {
      return date.toLocaleDateString('zh-CN')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        搜索历史
      </h2>

      {history.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>暂无搜索历史</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="font-medium text-gray-900 line-clamp-2 flex-1">
                  {item.query}
                </p>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium whitespace-nowrap">
                  {item.totalResults} 个
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {formatDate(item.createdAt)}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
