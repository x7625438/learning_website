import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const Home: React.FC = () => {
  const features = [
    {
      title: 'AI读书助手',
      description: '上传书籍，获得AI生成的摘要，与虚拟作者对话，享受SQ3R阅读指导',
      icon: '📚',
      href: '/books',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'AI论文助手',
      description: '英文论文翻译，术语注释，实时提问，生成总结报告',
      icon: '📄',
      href: '/papers',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'AI金句生成器',
      description: '每日金句生成，主题导向创作，个人素材库管理',
      icon: '✨',
      href: '/quotes',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'AI解题助手',
      description: '引导式解题对话，智能提示，类似题目生成练习',
      icon: '🧮',
      href: '/problems',
      color: 'from-red-500 to-red-600'
    },
    {
      title: 'AI番茄钟',
      description: '25分钟专注计时，虚拟森林游戏化，专注数据可视化',
      icon: '🍅',
      href: '/pomodoro',
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'AI笔记助手',
      description: '康奈尔笔记法指导，费曼学习法检验，遗忘曲线复习提醒',
      icon: '📝',
      href: '/notes',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      title: 'AI文档协作助手',
      description: '写作思路建议，内容扩展生成，语言逻辑改进，文档质量评估',
      icon: '📋',
      href: '/documents',
      color: 'from-teal-500 to-teal-600'
    },
    {
      title: 'AI精神放松助手',
      description: '友好对话陪伴，情感识别回应，压力检测安慰，温暖交流氛围',
      icon: '🌸',
      href: '/relaxation',
      color: 'from-pink-500 to-pink-600'
    },
    {
      title: 'AI头脑风暴助手',
      description: '四个AI角色多角度讨论，观点综合，选题建议，深度探讨',
      icon: '🧠',
      href: '/brainstorm',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'AI错题整理助手',
      description: '错题自动分析，知识点归纳，专属刷题库生成，薄弱环节强化',
      icon: '📊',
      href: '/error-questions',
      color: 'from-amber-500 to-amber-600'
    },
    {
      title: 'AI作文批改助手',
      description: '智能评分系统，写作建议反馈，语言表达优化，结构逻辑分析',
      icon: '✍️',
      href: '/essays',
      color: 'from-emerald-500 to-emerald-600'
    }
  ]

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 w-full min-w-0">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-6 tracking-tight"
        >
          AI赋能学习平台
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed"
        >
          集成12个核心AI功能模块，为您提供全方位的智能学习支持。
          从阅读理解到写作协作，从专注管理到知识整理，让AI成为您最好的学习伙伴。
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link
            to="/books"
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            开始使用 AI读书助手
            <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
          >
            <Link
              to={feature.href}
              className="block bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 group border border-white/30 hover:border-white/50 transform hover:scale-105"
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">{feature.description}</p>
              <div className="flex items-center text-blue-600 text-sm font-semibold">
                立即体验
                <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold mb-2">12+</div>
            <div className="text-blue-100 text-base">AI功能模块</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">100%</div>
            <div className="text-blue-100 text-base">智能化体验</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">24/7</div>
            <div className="text-blue-100 text-base">随时可用</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Home