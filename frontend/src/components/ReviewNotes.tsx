import React, { useState, useEffect } from 'react'
import apiClient from '../utils/api-client'

interface Note {
  id: string
  title: string
  content: string
  method: string
  nextReviewAt: string
  reviewCount: number
  updatedAt: string
}

interface ReviewNotesProps {
  userId: string
}

const ReviewNotes: React.FC<ReviewNotesProps> = ({ userId }) => {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [markingId, setMarkingId] = useState<string | null>(null)

  useEffect(() => {
    fetchReviewNotes()
  }, [userId])

  const fetchReviewNotes = async () => {
    try {
      setLoading(true)
      const data = await apiClient.get<Note[]>(`/api/v1/notes/user/${userId}/review`)
      setNotes(data)
    } catch (err) {
      console.error('Failed to load review notes:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkReviewed = async (noteId: string) => {
    setMarkingId(noteId)
    try {
      await apiClient.post(`/api/v1/notes/${noteId}/review-done`, {})
      setNotes(prev => prev.filter(n => n.id !== noteId))
    } catch (err) {
      console.error('Failed to mark reviewed:', err)
    } finally {
      setMarkingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl font-bold">待复习笔记</h2>
        <span className="text-sm text-gray-500">基于艾宾浩斯遗忘曲线</span>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🎉</div>
          <p className="text-gray-500">暂无待复习的笔记，继续保持！</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {notes.map(note => (
            <div key={note.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1">{note.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-2">{note.content || '(空内容)'}</p>
                  <div className="flex gap-3 text-xs text-gray-400">
                    <span>已复习 {note.reviewCount} 次</span>
                    <span>到期: {new Date(note.nextReviewAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleMarkReviewed(note.id)}
                  disabled={markingId === note.id}
                  className="ml-3 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors flex-shrink-0"
                >
                  {markingId === note.id ? '处理中...' : '已复习'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ReviewNotes