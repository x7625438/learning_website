import React, { useState } from 'react'
import { useUserStore } from '../store'
import NoteList from '../components/NoteList'
import NoteEditor from '../components/NoteEditor'

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
  const [activeTab, setActiveTab] = useState<'list' | 'editor'>('list')
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
  ]

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-surface-800">笔记助手</h1>
          <p className="text-surface-400 text-sm mt-1">康奈尔笔记法 · 费曼学习法检测</p>
        </div>
        <button
          onClick={handleNewNote}
          className="px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-all shadow-soft-sm hover:shadow-soft-md"
        >
          + 新建笔记
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-surface-200/60 mb-6 overflow-x-auto scrollbar-hide">
        <div className="flex gap-0 min-w-max">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 sm:px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'text-primary-600 border-b-2 border-primary-500'
                  : 'text-surface-400 hover:text-surface-700'
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
    </div>
  )
}

export default Notes