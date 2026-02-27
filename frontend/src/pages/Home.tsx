import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const Home: React.FC = () => {
  const features = [
    {
      title: '读书助手',
      description: '上传书籍，AI生成摘要，与虚拟作者对话，SQ3R阅读指导',
      icon: '📚',
      href: '/books',
      accent: 'from-primary-400 to-primary-600',
      iconBg: 'bg-primary-50',
    },
    {
      title: '论文助手',
      description: '英文论文翻译，术语注释，实时提问，生成总结报告',
      icon: '📄',
      href: '/papers',
      accent: 'from-emerald-400 to-emerald-600',
      iconBg: 'bg-emerald-50',
    },
    {
      title: '金句生成',
      description: '每日金句生成，主题导向创作，个人素材库管理',
      icon: '✨',
      href: '/quotes',
      accent: 'from-amber-400 to-amber-600',
      iconBg: 'bg-amber-50',
    },
    {
      title: '解题助手',
      description: '引导式解题对话，智能提示，类似题目生成练习',
      icon: '🧮',
      href: '/problems',
      accent: 'from-rose-400 to-rose-600',
      iconBg: 'bg-rose-50',
    },
    {
      title: '番茄专注',
      description: '25分钟专注计时，虚拟森林游戏化，专注数据可视化',
      icon: '🍅',
      href: '/pomodoro',
      accent: 'from-orange-400 to-orange-600',
      iconBg: 'bg-orange-50',
    },
    {
      title: '笔记助手',
      description: '康奈尔笔记法指导，费曼学习法检验，遗忘曲线复习提醒',
      icon: '📓',
      href: '/notes',
      accent: 'from-indigo-400 to-indigo-600',
      iconBg: 'bg-indigo-50',
    },
    {
      title: '文档协作',
      description: '写作思路建议，内容扩展生成，语言逻辑改进，文档质量评估',
      icon: '📋',
      href: '/documents',
      accent: 'from-teal-400 to-teal-600',
      iconBg: 'bg-teal-50',
    },
    {
      title: '心灵放松',
      description: '友好对话陪伴，情感识别回应，压力检测安慰，温暖交流氛围',
      icon: '🌿',
      href: '/relaxation',
      accent: 'from-green-400 to-green-600',
      iconBg: 'bg-green-50',
    },
    {
      title: '头脑风暴',
      description: '四个AI角色多角度讨论，观点综合，选题建议，深度探讨',
      icon: '🧠',
      href: '/brainstorm',
      accent: 'from-violet-400 to-violet-600',
      iconBg: 'bg-violet-50',
    },
    {
      title: '错题整理',
      description: '错题自动分析，知识点归纳，专属刷题库生成，薄弱环节强化',
      icon: '📊',
      href: '/error-questions',
      accent: 'from-sky-400 to-sky-600',
      iconBg: 'bg-sky-50',
    },
    {
      title: '作文批改',
      description: '智能评分系统，写作建议反馈，语言表达优化，结构逻辑分析',
      icon: '✍️',
      href: '/essays',
      accent: 'from-pink-400 to-pink-600',
      iconBg: 'bg-pink-50',
    },
  ]

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8 w-full min-w-0">
      {/* Hero Section */}
      <div className="text-center mb-14">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 text-primary-600 text-sm font-medium mb-6 border border-primary-100"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse-slow" />
          AI驱动 · 11大学习模块
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl md:text-5xl lg:text-6xl font-bold text-gradient mb-5 tracking-tight leading-tight"
        >
          让学习更聪明
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base md:text-lg text-surface-500 mb-8 max-w-2xl mx-auto leading-relaxed"
        >
          从阅读理解到写作协作，从专注管理到知识整理，
          AI全方位赋能你的学习旅程。
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex items-center justify-center gap-3"
        >
          <Link
            to="/books"
            className="inline-flex items-center px-6 py-2.5 text-sm font-semibold rounded-xl text-white bg-primary-500 hover:bg-primary-600 transition-all duration-200 shadow-soft-md hover:shadow-soft-lg hover:-translate-y-0.5"
          >
            开始探索
            <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
          <Link
            to="/pomodoro"
            className="inline-flex items-center px-6 py-2.5 text-sm font-semibold rounded-xl text-primary-600 bg-primary-50 hover:bg-primary-100 transition-all duration-200 border border-primary-100"
          >
            番茄专注
          </Link>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 * index }}
          >
            <Link
              to={feature.href}
              className="group block glass rounded-2xl shadow-card hover:shadow-card-hover p-5 transition-all duration-200 hover:-translate-y-1"
            >
              <div className={`w-11 h-11 ${feature.iconBg} rounded-xl flex items-center justify-center text-xl mb-3.5 group-hover:scale-110 transition-transform duration-200`}>
                {feature.icon}
              </div>
              <h3 className="text-base font-semibold text-surface-800 mb-1.5 group-hover:text-primary-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-surface-400 text-sm leading-relaxed mb-3">
                {feature.description}
              </p>
              <div className="flex items-center text-primary-500 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                开始使用
                <svg className="ml-1 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
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
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-12 glass rounded-2xl p-6 sm:p-8 shadow-card"
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-gradient mb-1">11</div>
            <div className="text-surface-400 text-xs sm:text-sm">AI模块</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-gradient mb-1">100%</div>
            <div className="text-surface-400 text-xs sm:text-sm">智能驱动</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-gradient mb-1">24/7</div>
            <div className="text-surface-400 text-xs sm:text-sm">随时可用</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Home