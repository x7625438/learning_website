import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import apiClient from '../utils/api-client'
import { useUserStore } from '../store'

interface ProblemSession {
  id: string
  problemId: string
  completed: boolean
  currentStep: number
  userProgress: UserProgress[]
}

interface UserProgress {
  stepNumber: number
  userInput: string
  timestamp: string
  needsHint: boolean
  hintGiven?: string
}

interface ProblemAnalysis {
  problemType: string
  difficulty: 'easy' | 'medium' | 'hard'
  requiredConcepts: string[]
  estimatedTime: number
  solutionApproach: string[]
}

interface ProblemHint {
  stepNumber: number
  hintLevel: 'gentle' | 'moderate' | 'strong'
  content: string
  revealsSolution: boolean
}

interface Props {
  activeSession: ProblemSession | null
  onSessionComplete: () => void
}

const ProblemSolver: React.FC<Props> = ({ activeSession, onSessionComplete }) => {
  const [question, setQuestion] = useState('')
  const [subject, setSubject] = useState('')
  const [analysis, setAnalysis] = useState<ProblemAnalysis | null>(null)
  const [session, setSession] = useState<ProblemSession | null>(activeSession)
  const [userInput, setUserInput] = useState('')
  const [currentHint, setCurrentHint] = useState<ProblemHint | null>(null)
  const [feedback, setFeedback] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'input' | 'analysis' | 'solving' | 'completed'>('input')

  useEffect(() => {
    if (activeSession) {
      setSession(activeSession)
      setStep('solving')
    }
  }, [activeSession])

  const analyzeProblem = async () => {
    if (!question.trim()) return

    setLoading(true)
    try {
      const analysisResult = await apiClient.post<ProblemAnalysis>('/api/v1/problems/analyze', { question, subject })
      setAnalysis(analysisResult)
      setStep('analysis')
    } catch (error) {
      console.error('Failed to analyze problem:', error)
    } finally {
      setLoading(false)
    }
  }

  const startSolving = async () => {
    setLoading(true)
    try {
      const newSession = await apiClient.post<ProblemSession>('/api/v1/problems/start-session', {
        userId: useUserStore.getState().user?.id || 'demo-user',
        question,
        subject
      })
      setSession(newSession)
      setStep('solving')
    } catch (error) {
      console.error('Failed to start session:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitStep = async () => {
    if (!session || !userInput.trim()) return

    setLoading(true)
    try {
      const result = await apiClient.post<{ feedback: string; shouldProceed: boolean }>('/api/v1/problems/process-step', {
        sessionId: session.id,
        userInput
      })
      setFeedback(result.feedback)

      if (result.shouldProceed) {
        setSession(prev => prev ? { ...prev, currentStep: prev.currentStep + 1 } : null)
      }

      setUserInput('')
      setCurrentHint(null)
    } catch (error) {
      console.error('Failed to process step:', error)
    } finally {
      setLoading(false)
    }
  }

  const getHint = async () => {
    if (!session) return

    setLoading(true)
    try {
      const hint = await apiClient.post<ProblemHint>('/api/v1/problems/hint', {
        sessionId: session.id,
        userInput
      })
      setCurrentHint(hint)
    } catch (error) {
      console.error('Failed to get hint:', error)
    } finally {
      setLoading(false)
    }
  }

  const completeSession = async () => {
    if (!session) return

    setLoading(true)
    try {
      await apiClient.post<void>('/api/v1/problems/complete-session', {
        sessionId: session.id,
        finalSolution: userInput
      })
      setStep('completed')
      onSessionComplete()
    } catch (error) {
      console.error('Failed to complete session:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetSolver = () => {
    setQuestion('')
    setSubject('')
    setAnalysis(null)
    setSession(null)
    setUserInput('')
    setCurrentHint(null)
    setFeedback('')
    setStep('input')
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {step === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">提交你的问题</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  学科（可选）
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">选择学科</option>
                  <option value="数学">数学</option>
                  <option value="物理">物理</option>
                  <option value="化学">化学</option>
                  <option value="编程">编程</option>
                  <option value="逻辑">逻辑推理</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  问题描述
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="请详细描述你需要解决的问题..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 resize-none"
                />
              </div>

              <button
                onClick={analyzeProblem}
                disabled={!question.trim() || loading}
                className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '分析中...' : '开始分析问题'}
              </button>
            </div>
          </motion.div>
        )}

        {step === 'analysis' && analysis && (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">问题分析结果</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">问题类型</h3>
                  <p className="text-gray-600">{analysis.problemType}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">难度等级</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(analysis.difficulty)}`}>
                    {analysis.difficulty === 'easy' ? '简单' : analysis.difficulty === 'medium' ? '中等' : '困难'}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">预计用时</h3>
                <p className="text-gray-600">{analysis.estimatedTime} 分钟</p>
              </div>

              {analysis.requiredConcepts.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">涉及概念</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.requiredConcepts.map((concept, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">解题步骤</h3>
                <ol className="list-decimal list-inside space-y-1 text-gray-600">
                  {analysis.solutionApproach.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={startSolving}
                  disabled={loading}
                  className="flex-1 bg-green-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
                >
                  {loading ? '准备中...' : '开始引导解题'}
                </button>
                <button
                  onClick={resetSolver}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  重新输入
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'solving' && session && (
          <motion.div
            key="solving"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Progress indicator */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">解题进度</h3>
                <span className="text-sm text-gray-600">第 {session.currentStep} 步</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(session.currentStep / (analysis?.solutionApproach.length || 4)) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Current step */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                当前步骤: {analysis?.solutionApproach[session.currentStep - 1] || '继续解题'}
              </h3>
              
              {feedback && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                  <p className="text-blue-800">{feedback}</p>
                </div>
              )}

              {currentHint && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <span className="text-yellow-800 font-medium">💡 提示</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      currentHint.hintLevel === 'gentle' ? 'bg-green-100 text-green-800' :
                      currentHint.hintLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {currentHint.hintLevel === 'gentle' ? '轻度提示' :
                       currentHint.hintLevel === 'moderate' ? '中度提示' : '强度提示'}
                    </span>
                  </div>
                  <p className="text-yellow-800">{currentHint.content}</p>
                </div>
              )}

              <div className="space-y-4">
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="请输入你的思考过程和解答..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 resize-none"
                />

                <div className="flex space-x-3">
                  <button
                    onClick={submitStep}
                    disabled={!userInput.trim() || loading}
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
                  >
                    {loading ? '处理中...' : '提交答案'}
                  </button>
                  
                  <button
                    onClick={getHint}
                    disabled={loading}
                    className="px-4 py-2 border border-yellow-500 text-yellow-600 rounded-lg font-medium hover:bg-yellow-50 disabled:opacity-50 transition-colors"
                  >
                    {loading ? '获取中...' : '需要提示'}
                  </button>
                  
                  <button
                    onClick={completeSession}
                    disabled={loading}
                    className="px-4 py-2 border border-green-500 text-green-600 rounded-lg font-medium hover:bg-green-50 disabled:opacity-50 transition-colors"
                  >
                    完成解题
                  </button>
                </div>
              </div>
            </div>

            {/* Progress history */}
            {session.userProgress && session.userProgress.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">解题历程</h3>
                <div className="space-y-3">
                  {session.userProgress.map((progress, index) => (
                    <div key={index} className="border-l-2 border-gray-200 pl-4 pb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-600">
                          第 {progress.stepNumber} 步
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(progress.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm mb-2">{progress.userInput}</p>
                      {progress.hintGiven && (
                        <p className="text-yellow-600 text-sm italic">💡 {progress.hintGiven}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {step === 'completed' && (
          <motion.div
            key="completed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl shadow-lg p-8 text-center"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">解题完成！</h2>
            <p className="text-gray-600 mb-6">
              恭喜你完成了这道题目的解答过程。你可以查看解题总结或开始新的问题。
            </p>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={resetSolver}
                className="bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                解答新问题
              </button>
              <button
                onClick={() => onSessionComplete()}
                className="border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                查看历史记录
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProblemSolver