import React, { useState } from 'react'
import { useUserStore } from '../store'
import NoteList from '../components/NoteList'
import NoteEditor from '../components/NoteEditor'
import ReviewNotes from '../components/ReviewNotes'

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

const Notes: React.FC = () => {
  const user = useUserStore((s) => s.user)
  const userId = user?.id || 'demo-user'
  const [activeTab, setActiveTab] = useState<'list' | 'editor' | 'review'>('list')
  const [editNote, setEditNote] = useState<Note | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleEdit = (note: Note) => {
    setEditNote(note)
    setActiveTab('editor')
  }

  const handleSaved = () => {
    setRefreshTrigger(prev => prev + 1)
    if (editNote) {
      setEditNote(null)
      setActiveTab('list')
    }
  }

  const handleNewNote = () => {
    setEditNote(null)
    setActiveTab('editor')
  }

  const tabs = [
    { key: 'list' as const, label: '我的笔记' },
    { key: 'editor' as const, label: editNote ? '编辑笔记' : '写笔记' },
    { key: 'review' as const, label: '复习提醒' },
  ]

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">AI笔记助手</h1>
          <p className="text-gray-600 mt-1">康奈尔笔记法 · 费曼学习法 · 遗忘曲线复习</p>
        </div>
        <button
          onClick={handleNewNote}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all"
        >
          + 新建笔记
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6 overflow-x-auto scrollbar-hide">
        <div className="flex gap-0 min-w-max">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'list' && (
        <NoteList userId={userId} onEdit={handleEdit} refreshTrigger={refreshTrigger} />
      )}

      {activeTab === 'editor' && (
        <NoteEditor userId={userId} editNote={editNote} onSaved={handleSaved} />
      )}

      {activeTab === 'review' && (
        <ReviewNotes userId={userId} />
      )}
    </div>
  )
}

export default Notes