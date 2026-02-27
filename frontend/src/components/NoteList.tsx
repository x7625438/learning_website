import React, { useState, useEffect } from 'react'
import apiClient from '../utils/api-client'

interface Note {
  id: string
  userId: string
  title: string
  content: string
  method: string
  cornellData: any
  feynmanResult: any
  tags: string[]
  nextReviewAt: string
  reviewCount: number
  createdAt: string
  updatedAt: string
}

interface NoteListProps {
  userId: string
  onEdit?: (note: Note) => void
  refreshTrigger?: number
}

const NoteList: React.FC<NoteListProps> = ({ userId, onEdit, refreshTrigger }) => {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchNotes()
  }, [userId, refreshTrigger])

  const fetchNotes = async () => {
    try {
      setLoading(true)
      const data = await apiClient.get<Note[]>(`/api/v1/notes/user/${userId}`)
      setNotes(data)
    } catch (err) {
      console.error('Failed to load notes:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation()
    if (!confirm('确定要删除这条笔记吗？')) return
    try {
      await apiClient.delete(`/api/v1/notes/${noteId}`)
      setNotes(prev => prev.filter(n => n.id !== noteId))
    } catch (err) {
      console.error('Failed to delete:', err)
    }
  }

  const filtered = notes.filter(n => {
    return !search || n.title.includes(search) || n.content.includes(search)
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="搜索笔记..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {notes.length === 0 ? '暂无笔记，去写一条吧' : '没有匹配的笔记'}
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(note => (
            <div
              key={note.id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onEdit?.(note)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1 truncate">{note.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                    {note.content || '(空内容)'}
                  </p>
                  <div className="flex flex-wrap gap-2 items-center">
                    {note.tags.map((tag, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
                        {tag}
                      </span>
                    ))}
                    <span className="text-xs text-gray-400">
                      复习{note.reviewCount}次
                    </span>
                  </div>
                </div>
                <button
                  onClick={e => handleDelete(e, note.id)}
                  className="ml-3 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                  title="删除笔记"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                {new Date(note.updatedAt).toLocaleString('zh-CN')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default NoteList
