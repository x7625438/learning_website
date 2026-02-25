import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import apiClient from '../utils/api-client'
import { useNotificationStore } from '../store'

interface Quote {
  id: string
  content: string
  theme?: string
  language: 'zh' | 'en' | 'mixed'
  userId: string
  createdAt: string
}

interface QuoteStatistics {
  totalQuotes: number
  languageBreakdown: Record<string, number>
  themeBreakdown: Record<string, number>
}

interface QuoteLibraryProps {
  userId: string
}

const QuoteLibrary: React.FC<QuoteLibraryProps> = ({ userId }) => {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [statistics, setStatistics] = useState<QuoteStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all')
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([])

  useEffect(() => {
    loadQuoteData()
  }, [userId])

  useEffect(() => {
    filterQuotes()
  }, [quotes, searchQuery, selectedCategory, selectedLanguage])

  const loadQuoteData = async () => {
    try {
      setLoading(true)

      // Load quotes, categories, and statistics in parallel
      const [quotesData, categoriesData, statsData] = await Promise.all([
        apiClient.get<Quote[]>(`/api/v1/quotes/user/${userId}`),
        apiClient.get<{ categories: string[] }>(`/api/v1/quotes/user/${userId}/categories`),
        apiClient.get<QuoteStatistics>(`/api/v1/quotes/user/${userId}/statistics`)
      ])

      setQuotes(quotesData)
      setCategories(categoriesData.categories)
      setStatistics(statsData)
    } catch (error) {
      console.error('Failed to load quote data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterQuotes = () => {
    let filtered = quotes

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(quote =>
        quote.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (quote.theme && quote.theme.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(quote => quote.theme === selectedCategory)
    }

    // Filter by language
    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(quote => quote.language === selectedLanguage)
    }

    setFilteredQuotes(filtered)
  }

  const deleteQuote = async (quoteId: string) => {
    if (!confirm('确定要删除这条金句吗？')) {
      return
    }

    try {
      await apiClient.delete(`/api/v1/quotes/${quoteId}`)
      setQuotes(quotes.filter(quote => quote.id !== quoteId))
      // Reload statistics
      loadQuoteData()
    } catch (error) {
      console.error('Failed to delete quote:', error)
      useNotificationStore.getState().addNotification({ type: 'error', message: '删除失败' })
    }
  }

  const getRandomQuote = async () => {
    try {
      const randomQuote = await apiClient.get<Quote>(`/api/v1/quotes/user/${userId}/random`)
      useNotificationStore.getState().addNotification({ type: 'info', message: `随机金句：${randomQuote.content}` })
    } catch (error) {
      console.error('Failed to get random quote:', error)
      useNotificationStore.getState().addNotification({ type: 'error', message: '获取随机金句失败' })
    }
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      useNotificationStore.getState().addNotification({ type: 'success', message: '金句已复制到剪贴板' })
    }).catch(() => {
      useNotificationStore.getState().addNotification({ type: 'error', message: '复制失败' })
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getLanguageLabel = (language: string) => {
    const labels = {
      'zh': '中文',
      'en': 'English',
      'mixed': '中英混合'
    }
    return labels[language as keyof typeof labels] || language
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Statistics Overview */}
      {statistics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">金句库统计</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {statistics.totalQuotes}
              </div>
              <div className="text-sm text-gray-600">总金句数</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {Object.keys(statistics.themeBreakdown).length}
              </div>
              <div className="text-sm text-gray-600">主题分类</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {Object.keys(statistics.languageBreakdown).length}
              </div>
              <div className="text-sm text-gray-600">语言类型</div>
            </div>
            
            <div className="text-center">
              <button
                onClick={getRandomQuote}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
              >
                随机金句
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-6 shadow-lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              搜索金句
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="搜索内容或主题..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              主题分类
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">全部主题</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Language Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              语言类型
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">全部语言</option>
              <option value="zh">中文</option>
              <option value="en">English</option>
              <option value="mixed">中英混合</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Quotes Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {filteredQuotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">💭</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || selectedCategory !== 'all' || selectedLanguage !== 'all' 
                ? '未找到匹配的金句' 
                : '还没有收藏任何金句'}
            </h3>
            <p className="text-gray-500">
              {searchQuery || selectedCategory !== 'all' || selectedLanguage !== 'all'
                ? '尝试调整筛选条件'
                : '开始生成您的第一条金句'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuotes.map((quote, index) => (
              <motion.div
                key={quote.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                {/* Quote Content */}
                <blockquote className="text-gray-800 font-medium mb-4 leading-relaxed">
                  "{quote.content}"
                </blockquote>

                {/* Quote Meta */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {quote.theme && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {quote.theme}
                    </span>
                  )}
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getLanguageLabel(quote.language)}
                  </span>
                </div>

                {/* Quote Footer */}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {formatDate(quote.createdAt)}
                  </span>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(quote.content)}
                      className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="复制金句"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => deleteQuote(quote.id)}
                      className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                      title="删除金句"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default QuoteLibrary