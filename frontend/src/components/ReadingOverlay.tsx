import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import apiClient from '../utils/api-client'

interface SQ3RStep {
  step: 'survey' | 'question' | 'read' | 'recite' | 'review'
  title: string
  content: string
  completed: boolean
}

interface Book {
  id: string
  title: string
  author: string
  content: string
  summary?: string
  userId: string
}

interface ReadingOverlayProps {
  book: Book
  userId: string
  visible: boolean
  onClose: () => void
}

const STEP_ICONS: Record<string, string> = {
  survey: '🔍',
  question: '❓',
  read: '📖',
  recite: '🗣️',
  review: '✅',
}

const ReadingOverlay: React.FC<ReadingOverlayProps> = ({ book, userId, visible, onClose }) => {
  const [sq3rSteps, setSq3rSteps] = useState<SQ3RStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [userResponse, setUserResponse] = useState('')
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [fontSize, setFontSize] = useState(16)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (visible) {
      loadSQ3RGuide()
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [visible, book.id])

  const loadSQ3RGuide = async () => {
    try {
      setLoading(true)
      const data = await apiClient.post<{ steps: SQ3RStep[] }>(
        `/api/v1/books/${book.id}/sq3r-guide`,
        { chapterTitle: book.title }
      )
      setSq3rSteps(data.steps)
    } catch (error) {
      console.error('Failed to load SQ3R guide:', error)
    } finally {
      setLoading(false)
    }
  }

  const completeStep = async (index: number) => {
    try {
      const step = sq3rSteps[index]
      await apiClient.post(`/api/v1/books/${book.id}/progress/${userId}/complete`, {
        stepType: step.step,
        userResponse: userResponse || undefined,
      })
      setCompletedSteps(prev => new Set(prev).add(index))
      setUserResponse('')
      if (index < sq3rSteps.length - 1) {
        setCurrentStep(index + 1)
      }
    } catch (error) {
      console.error('Failed to complete step:', error)
    }
  }

  if (!visible) return null

  const progressPercent = sq3rSteps.length > 0
    ? Math.round((completedSteps.size / sq3rSteps.length) * 100)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-2 sm:inset-4 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-lg">📖</span>
            <h2 className="text-lg font-bold truncate">{book.title}</h2>
            <span className="text-sm opacity-80">— {book.author}</span>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Font size controls */}
            <div className="flex items-center gap-1 bg-white/20 rounded-lg px-2 py-1">
              <button
                onClick={() => setFontSize(s => Math.max(12, s - 2))}
                className="text-sm px-1 hover:bg-white/20 rounded"
              >
                A-
              </button>
              <span className="text-xs w-8 text-center">{fontSize}</span>
              <button
                onClick={() => setFontSize(s => Math.min(24, s + 2))}
                className="text-sm px-1 hover:bg-white/20 rounded"
              >
                A+
              </button>
            </div>
            {/* Progress */}
            <div className="hidden sm:flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1">
              <span className="text-xs">进度</span>
              <div className="w-20 h-1.5 bg-white/30 rounded-full">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs">{progressPercent}%</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              title="关闭"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Split Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Book Content */}
          <div className="w-1/2 border-r border-gray-200 flex flex-col">
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-sm font-semibold text-gray-600">书籍内容</h3>
            </div>
            <div
              ref={contentRef}
              className="flex-1 overflow-y-auto px-6 py-4 leading-relaxed text-gray-800"
              style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
            >
              {book.content ? (
                book.content.split('\n').map((para, i) =>
                  para.trim() ? (
                    <p key={i} className="mb-4 text-justify">
                      {para}
                    </p>
                  ) : (
                    <br key={i} />
                  )
                )
              ) : (
                <p className="text-gray-400 text-center mt-20">暂无内容</p>
              )}
            </div>
          </div>

          {/* Right: SQ3R Guide */}
          <div className="w-1/2 flex flex-col bg-gray-50">
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-sm font-semibold text-gray-600">SQ3R 阅读指导</h3>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-gray-500 text-sm">正在生成阅读指导...</p>
                </div>
              </div>
            ) : sq3rSteps.length > 0 ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Step tabs */}
                <div className="flex border-b border-gray-200 bg-white flex-shrink-0">
                  {sq3rSteps.map((step, i) => (
                    <button
                      key={step.step}
                      onClick={() => setCurrentStep(i)}
                      className={`flex-1 py-2.5 text-xs font-medium transition-colors relative ${
                        i === currentStep
                          ? 'text-blue-600 bg-blue-50'
                          : completedSteps.has(i)
                          ? 'text-green-600 bg-green-50'
                          : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      <span className="block">{STEP_ICONS[step.step]}</span>
                      <span className="block mt-0.5">{step.title}</span>
                      {i === currentStep && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                      )}
                      {completedSteps.has(i) && (
                        <span className="absolute top-1 right-1 w-3 h-3 bg-green-500 rounded-full text-white text-[8px] flex items-center justify-center">
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Step content */}
                <div className="flex-1 overflow-y-auto p-5">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{STEP_ICONS[sq3rSteps[currentStep]?.step]}</span>
                        <h4 className="text-lg font-bold text-gray-900">
                          {sq3rSteps[currentStep]?.title}
                        </h4>
                      </div>

                      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {sq3rSteps[currentStep]?.content}
                        </p>
                      </div>

                      {/* User response area */}
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          你的思考与笔记（可选）
                        </label>
                        <textarea
                          value={userResponse}
                          onChange={e => setUserResponse(e.target.value)}
                          placeholder="记录你在这一步的想法..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={3}
                        />
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-3">
                        {currentStep > 0 && (
                          <button
                            onClick={() => setCurrentStep(currentStep - 1)}
                            className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                          >
                            上一步
                          </button>
                        )}
                        <button
                          onClick={() => completeStep(currentStep)}
                          disabled={completedSteps.has(currentStep)}
                          className={`px-5 py-2 text-sm rounded-lg font-medium transition-colors ${
                            completedSteps.has(currentStep)
                              ? 'bg-green-100 text-green-700 cursor-default'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {completedSteps.has(currentStep) ? '已完成 ✓' : '完成此步骤'}
                        </button>
                        {currentStep < sq3rSteps.length - 1 && (
                          <button
                            onClick={() => setCurrentStep(currentStep + 1)}
                            className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                          >
                            下一步
                          </button>
                        )}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-400">暂无阅读指导</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ReadingOverlay
