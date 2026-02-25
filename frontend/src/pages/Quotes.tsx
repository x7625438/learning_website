import React, { useState } from 'react'
import { motion } from 'framer-motion'
import QuoteGenerator from '../components/QuoteGenerator'
import QuoteLibrary from '../components/QuoteLibrary'

const Quotes: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generator' | 'library'>('generator')
  
  // Mock user ID - in a real app, this would come from authentication
  const userId = 'user-123'

  const tabs = [
    {
      id: 'generator' as const,
      name: '金句生成器',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      )
    },
    {
      id: 'library' as const,
      name: '金句库',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  AI金句生成器
                </h1>
                <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
                  每日为您生成富有哲理和启发性的金句，支持多主题、多语言，助力您的写作和思考
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-1 mb-8"
          >
            <nav className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-0 sm:space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 rounded-md font-medium transition-colors text-sm sm:text-base flex-1 sm:flex-initial
                    ${activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  {tab.icon}
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </motion.div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'generator' && <QuoteGenerator userId={userId} />}
            {activeTab === 'library' && <QuoteLibrary userId={userId} />}
          </motion.div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-12"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                为什么选择AI金句生成器？
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                基于先进的AI技术，为您提供个性化、高质量的金句创作服务
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: '智能主题匹配',
                  description: '根据您选择的主题，生成高度相关的金句内容',
                  icon: '🎯',
                  color: 'bg-blue-50 text-blue-600'
                },
                {
                  title: '多语言支持',
                  description: '支持中文、英文和中英混合的金句生成',
                  icon: '🌍',
                  color: 'bg-green-50 text-green-600'
                },
                {
                  title: '风格多样化',
                  description: '提供励志、哲理、激励、教育等多种风格选择',
                  icon: '🎨',
                  color: 'bg-purple-50 text-purple-600'
                },
                {
                  title: '每日自动生成',
                  description: '每天为您自动生成新的金句，保持灵感源源不断',
                  icon: '📅',
                  color: 'bg-yellow-50 text-yellow-600'
                },
                {
                  title: '个人收藏库',
                  description: '保存喜欢的金句，建立专属的素材库',
                  icon: '💎',
                  color: 'bg-pink-50 text-pink-600'
                },
                {
                  title: '智能分类搜索',
                  description: '按主题、语言等维度快速查找所需金句',
                  icon: '🔍',
                  color: 'bg-indigo-50 text-indigo-600'
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center text-2xl mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
  )
}

export default Quotes