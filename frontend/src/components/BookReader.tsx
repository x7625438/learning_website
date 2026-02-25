import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import apiClient from '../utils/api-client'

interface Book {
  id: string
  title: string
  author: string
  content: string
  summary?: string
  userId: string
  createdAt: string
  updatedAt: string
}

interface SQ3RStep {
  step: 'survey' | 'question' | 'read' | 'recite' | 'review'
  title: string
  content: string
  completed: boolean
}

interface ReadingProgress {
  bookId: string
  userId: string
  currentChapter: number
  totalChapters: number
  completedSteps: SQ3RStep[]
  comprehensionScore?: number
}

interface BookReaderProps {
  book: Book
  userId: string
}

const BookReader: React.FC<BookReaderProps> = ({ book, userId }) => {
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [sq3rSteps, setSq3rSteps] = useState<SQ3RStep[]>([])
  const [progress, setProgress] = useState<ReadingProgress | null>(null)
  const [loading, setLoading] = useState(false)
  const [authorAgent, setAuthorAgent] = useState<any>(null)
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<any[]>([])
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    loadSQ3RGuide()
    loadReadingProgress()
  }, [book.id])

  const loadSQ3RGuide = async () => {
    try {
      setLoading(true)
      const data = await apiClient.post<{steps: SQ3RStep[]}>(`/api/v1/books/${book.id}/sq3r-guide`, { chapterTitle: book.title })
      setSq3rSteps(data.steps)
    } catch (error) {
      console.error('Failed to load SQ3R guide:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadReadingProgress = async () => {
    try {
      const data = await apiClient.get<ReadingProgress>(`/api/v1/books/${book.id}/progress/${userId}`)
      setProgress(data)
    } catch (error) {
      console.error('Failed to load reading progress:', error)
    }
  }

  const completeStep = async (stepType: string, userResponse?: string) => {
    try {
      const updatedProgress = await apiClient.post<ReadingProgress>(`/api/v1/books/${book.id}/progress/${userId}/complete`, { stepType, userResponse })
      setProgress(updatedProgress)

      // Move to next step
      if (currentStep < sq3rSteps.length - 1) {
        setCurrentStep(currentStep + 1)
      }
    } catch (error) {
      console.error('Failed to complete step:', error)
    }
  }

  const createAuthorAgent = async () => {
    try {
      setLoading(true)
      const agent = await apiClient.post<any>(`/api/v1/books/${book.id}/author-agent`, {})
      setAuthorAgent(agent)
      setChatHistory([{ role: 'assistant', content: agent.response }])
      setShowChat(true)
    } catch (error) {
      console.error('Failed to create author agent:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendChatMessage = async () => {
    if (!chatMessage.trim()) return

    try {
      const newHistory = [...chatHistory, { role: 'user', content: chatMessage }]
      setChatHistory(newHistory)
      setChatMessage('')

      const data = await apiClient.post<{response: string}>(`/api/v1/books/${book.id}/author-chat`, {
        message: chatMessage,
        conversationHistory: chatHistory
      })

      setChatHistory([...newHistory, { role: 'assistant', content: data.response }])
    } catch (error) {
      console.error('Failed to send chat message:', error)
    }
  }

  const stepVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Book Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
        <p className="text-lg text-gray-600 mb-4">作者：{book.author}</p>
        {book.summary && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">书籍摘要</h3>
            <p className="text-blue-800">{book.summary}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={createAuthorAgent}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {loading ? '创建中...' : '与作者对话'}
        </button>
        <button
          onClick={() => setCurrentStep(0)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          开始SQ3R阅读
        </button>
      </div>

      {/* SQ3R Reading Guide */}
      {sq3rSteps.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">SQ3R阅读指导</h2>
          
          {/* Step Progress */}
          <div className="flex justify-between mb-8">
            {sq3rSteps.map((step, index) => (
              <div
                key={step.step}
                className={`flex items-center ${
                  index <= currentStep ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="ml-2 text-sm font-medium">{step.title}</span>
              </div>
            ))}
          </div>

          {/* Current Step Content */}
          <AnimatePresence mode="wait">
            {sq3rSteps[currentStep] && (
              <motion.div
                key={currentStep}
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-semibold text-gray-900">
                  {sq3rSteps[currentStep].title}
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{sq3rSteps[currentStep].content}</p>
                </div>
                
                {/* Step Actions */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => completeStep(sq3rSteps[currentStep].step)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    完成此步骤
                  </button>
                  {currentStep > 0 && (
                    <button
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      上一步
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Author Chat */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">与作者对话</h2>
            
            {/* Chat History */}
            <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto mb-4 space-y-3">
              {chatHistory.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 border'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="向作者提问..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={sendChatMessage}
                disabled={!chatMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                发送
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reading Progress */}
      {progress && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">阅读进度</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>完成步骤：</span>
              <span>{progress.completedSteps.filter(s => s.completed).length} / 5</span>
            </div>
            {progress.comprehensionScore && (
              <div className="flex justify-between">
                <span>理解程度：</span>
                <span className="font-semibold">{progress.comprehensionScore}/10</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default BookReader