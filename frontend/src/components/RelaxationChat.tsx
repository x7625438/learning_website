import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import apiClient from '../utils/api-client'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sentiment?: 'positive' | 'neutral' | 'negative' | 'stressed'
}

interface RelaxationChatProps {
  userId: string
}

const RelaxationChat: React.FC<RelaxationChatProps> = ({ userId }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mood, setMood] = useState<'relaxed' | 'neutral' | 'stressed' | 'anxious'>('neutral')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Create initial session
    createSession()
  }, [userId])

  const createSession = async () => {
    try {
      const session = await apiClient.post<{ id: string }>('/api/v1/relaxation-chat/sessions', { userId })
      setSessionId(session.id)

      // Add welcome message
      setMessages([{
        role: 'assistant',
        content: '你好呀！我是你的AI朋友 😊 有什么想聊的吗？学习累了可以和我说说话，放松一下~',
        timestamp: new Date()
      }])
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || !sessionId || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const result = await apiClient.post<{
        assistantMessage: { content: string; timestamp: string }
        mood: 'relaxed' | 'neutral' | 'stressed' | 'anxious'
        sentiment: { stressLevel: number }
      }>('/api/v1/relaxation-chat/messages', {
        userId,
        sessionId,
        content: inputMessage
      })

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: result.assistantMessage.content,
        timestamp: new Date(result.assistantMessage.timestamp)
      }])

      setMood(result.mood)

      // Get suggestions if stressed
      if (result.sentiment.stressLevel >= 4) {
        const suggestionsData = await apiClient.get<{ suggestions: string[] }>(
          `/api/v1/relaxation-chat/suggestions/${result.sentiment.stressLevel}`
        )
        setSuggestions(suggestionsData.suggestions)
      } else {
        setSuggestions([])
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '抱歉，我现在有点忙不过来了 😅 稍等一下再试试吧~',
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getMoodEmoji = () => {
    switch (mood) {
      case 'relaxed': return '😊'
      case 'stressed': return '😰'
      case 'anxious': return '😟'
      default: return '😐'
    }
  }

  const getMoodColor = () => {
    switch (mood) {
      case 'relaxed': return 'bg-green-100 text-green-800'
      case 'stressed': return 'bg-yellow-100 text-yellow-800'
      case 'anxious': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xl">
            🤗
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">AI精神放松助手</h2>
            <p className="text-sm text-gray-500">随时陪你聊天，帮你放松心情</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMoodColor()}`}>
          {getMoodEmoji()} {mood === 'relaxed' ? '放松' : mood === 'stressed' ? '有压力' : mood === 'anxious' ? '焦虑' : '平静'}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-800 shadow-sm'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                  {new Date(message.timestamp).toLocaleTimeString('zh-CN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white px-4 py-3 rounded-2xl shadow-sm">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-2"
        >
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm font-medium text-yellow-800 mb-2">💡 放松建议：</p>
            <ul className="text-sm text-yellow-700 space-y-1">
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="说说你的想法..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  )
}

export default RelaxationChat
