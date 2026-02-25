import React, { useState } from 'react'
import ErrorQuestionUpload from '../components/ErrorQuestionUpload'
import ErrorQuestionList from '../components/ErrorQuestionList'
import ErrorQuestionAnalysis from '../components/ErrorQuestionAnalysis'
import { useUserStore } from '../store'

const ErrorQuestions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'list' | 'analysis'>('list')
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  
  const user = useUserStore((s) => s.user)
  const userId = user?.id || 'demo-user'

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1)
    setActiveTab('list')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 w-full min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">AI错题整理系统</h1>

        {/* Tabs - responsive */}
        <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6 border-b overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-3 sm:px-4 py-2.5 sm:py-2 font-medium transition-colors text-sm sm:text-base whitespace-nowrap flex-shrink-0 ${
              activeTab === 'list'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            错题列表
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 sm:px-4 py-2.5 sm:py-2 font-medium transition-colors text-sm sm:text-base whitespace-nowrap flex-shrink-0 ${
              activeTab === 'upload'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            上传错题
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-3 sm:px-4 py-2.5 sm:py-2 font-medium transition-colors text-sm sm:text-base whitespace-nowrap flex-shrink-0 ${
              activeTab === 'analysis'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            分析报告
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'list' && (
            <ErrorQuestionList userId={userId} refreshTrigger={refreshTrigger} />
          )}
          {activeTab === 'upload' && (
            <ErrorQuestionUpload userId={userId} onUploadSuccess={handleUploadSuccess} />
          )}
          {activeTab === 'analysis' && (
            <ErrorQuestionAnalysis userId={userId} />
          )}
        </div>
      </div>
  )
}

export default ErrorQuestions
