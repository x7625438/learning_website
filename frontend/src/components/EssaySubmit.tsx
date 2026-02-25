import { useState } from 'react'
import apiClient from '../utils/api-client'
import { useNotificationStore, useUserStore } from '../store'

interface EssaySubmitProps {
  onEssaySubmitted: () => void
}

export default function EssaySubmit({ onEssaySubmitted }: EssaySubmitProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [subject, setSubject] = useState('')
  const [grade, setGrade] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      useNotificationStore.getState().addNotification({ type: 'warning', message: '请填写作文标题和内容' })
      return
    }

    setIsSubmitting(true)
    try {
      await apiClient.post('/api/v1/essays', {
        userId: useUserStore.getState().user?.id || 'demo-user',
        title: title.trim(),
        content: content.trim(),
        subject: subject.trim() || undefined,
        grade: grade.trim() || undefined
      })

      // Clear form
      setTitle('')
      setContent('')
      setSubject('')
      setGrade('')
      
      onEssaySubmitted()
      useNotificationStore.getState().addNotification({ type: 'success', message: '作文提交成功！' })
    } catch (error) {
      console.error('Error submitting essay:', error)
      useNotificationStore.getState().addNotification({ type: 'error', message: '提交失败，请重试' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">提交作文</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            作文标题 *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="输入作文标题"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            学科
          </label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="如：语文、英语"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
            年级
          </label>
          <input
            type="text"
            id="grade"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="如：高一、初三"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            作文内容 *
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="粘贴或输入作文内容..."
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? '提交中...' : '提交作文'}
        </button>
      </form>
    </div>
  )
}
