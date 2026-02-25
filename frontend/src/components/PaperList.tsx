import React from 'react'

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

interface PaperListProps {
  papers: Paper[]
  onPaperSelect: (paper: Paper) => void
}

export function PaperList({ papers, onPaperSelect }: PaperListProps) {
  if (papers.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          暂无论文
        </h3>
        <p className="text-gray-500">
          上传您的第一篇论文开始使用AI助手功能
        </p>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className="space-y-4">
      {papers.map((paper) => (
        <div
          key={paper.id}
          onClick={() => onPaperSelect(paper)}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 cursor-pointer transition-all duration-200"
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {paper.title}
            </h3>
            <div className="flex items-center ml-4 flex-shrink-0">
              {paper.translatedContent && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                  已翻译
                </span>
              )}
              <span className="text-xs text-gray-500">
                {formatDate(paper.createdAt)}
              </span>
            </div>
          </div>

          <div className="mb-3">
            <p className="text-sm text-gray-600 mb-1">
              作者: {paper.authors.join(', ')}
            </p>
          </div>

          <div className="mb-3">
            <p className="text-sm text-gray-700 line-clamp-3">
              {truncateText(paper.abstract, 200)}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>
                内容长度: {paper.content.length.toLocaleString()} 字符
              </span>
            </div>
            
            <div className="flex items-center text-blue-600 text-sm font-medium">
              <span>查看详情</span>
              <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}