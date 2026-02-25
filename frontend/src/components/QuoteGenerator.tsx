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

interface QuoteGeneratorProps {
  userId: string
}

const QuoteGenerator: React.FC<QuoteGeneratorProps> = ({ userId }) => {
  const [todayQuote, setTodayQuote] = useState<Quote | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState('学习与成长')
  const [selectedLanguage, setSelectedLanguage] = useState<'zh' | 'en' | 'mixed'>('zh')
  const [selectedStyle, setSelectedStyle] = useState<'inspirational' | 'philosophical' | 'motivational' | 'educational'>('inspirational')

  const themes = [
    '学习与成长', '励志人生', '哲学思考', '科技创新',
    '人际关系', '时间管理', '健康生活', '创业精神',
    '艺术美学', '环保意识', '教育理念', '职场发展'
  ]

  const languages = [
    { value: 'zh', label: '中文' },
    { value: 'en', label: 'English' },
    { value: 'mixed', label: '中英混合' }
  ]

  const styles = [
    { value: 'inspirational', label: '励志' },
    { value: 'philosophical', label: '哲理' },
    { value: 'motivational', label: '激励' },
    { value: 'educational', label: '教育' }
  ]

  useEffect(() => {
    loadTodayQuote()
  }, [userId])

  const loadTodayQuote = async () => {
    try {
      const quote = await apiClient.get<Quote>(`/api/v1/quotes/user/${userId}/today`)
      setTodayQuote(quote)
    } catch (error) {
      console.error('Failed to load today\'s quote:', error)
    }
  }

  const generateDailyQuote = async () => {
    try {
      setIsGenerating(true)
      const newQuote = await apiClient.post<Quote>('/api/v1/quotes/daily', {
        userId,
        theme: selectedTheme,
        language: selectedLanguage
      })
      setTodayQuote(newQuote)
    } catch (error) {
      console.error('Failed to generate daily quote:', error)
      useNotificationStore.getState().addNotification({ type: 'error', message: '生成每日金句失败' })
    } finally {
      setIsGenerating(false)
    }
  }

  const generateCustomQuote = async () => {
    try {
      setIsGenerating(true)
      const newQuote = await apiClient.post<Quote>('/api/v1/quotes/generate', {
        userId,
        theme: selectedTheme,
        language: selectedLanguage,
        style: selectedStyle
      })
      useNotificationStore.getState().addNotification({ type: 'info', message: `生成的金句：${newQuote.content}` })
    } catch (error) {
      console.error('Failed to generate custom quote:', error)
      useNotificationStore.getState().addNotification({ type: 'error', message: '生成自定义金句失败' })
    } finally {
      setIsGenerating(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Today's Quote Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8 shadow-lg"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">今日金句</h2>
          
          {todayQuote ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <blockquote className="text-xl md:text-2xl font-medium text-gray-700 leading-relaxed">
                "{todayQuote.content}"
              </blockquote>
              
              <div className="flex justify-center items-center space-x-4 text-sm text-gray-600">
                {todayQuote.theme && (
                  <span className="bg-white px-3 py-1 rounded-full">
                    主题：{todayQuote.theme}
                  </span>
                )}
                <span className="bg-white px-3 py-1 rounded-full">
                  {formatDate(todayQuote.createdAt)}
                </span>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">今天还没有生成金句</p>
              <button
                onClick={generateDailyQuote}
                disabled={isGenerating}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? '生成中...' : '生成今日金句'}
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Custom Quote Generator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl p-8 shadow-lg"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-6">自定义金句生成</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择主题
            </label>
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {themes.map(theme => (
                <option key={theme} value={theme}>{theme}</option>
              ))}
            </select>
          </div>

          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择语言
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as 'zh' | 'en' | 'mixed')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {languages.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
          </div>

          {/* Style Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择风格
            </label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value as any)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {styles.map(style => (
                <option key={style.value} value={style.value}>{style.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={generateCustomQuote}
            disabled={isGenerating}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>生成中...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>生成自定义金句</span>
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Features Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-50 rounded-xl p-8"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-6">功能特色</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">每日金句</h4>
            <p className="text-sm text-gray-600">每天自动生成新的励志金句</p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">主题导向</h4>
            <p className="text-sm text-gray-600">根据指定主题生成相关金句</p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">多语言支持</h4>
            <p className="text-sm text-gray-600">支持中文、英文和中英混合</p>
          </div>

          <div className="text-center">
            <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">个人收藏</h4>
            <p className="text-sm text-gray-600">保存喜欢的金句到素材库</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default QuoteGenerator