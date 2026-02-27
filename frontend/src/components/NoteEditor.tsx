import React, { useState, useEffect, useRef } from 'react'
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

interface NoteEditorProps {
  userId: string
  editNote?: Note | null
  onSaved?: () => void
}

interface ChatMessage {
  role: 'assistant' | 'user'
  content: string
}

const NoteEditor: React.FC<NoteEditorProps> = ({ userId, editNote, onSaved }) => {
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)

  // Cornell fields
  const [cornellCues, setCornellCues] = useState('')
  const [cornellNotes, setCornellNotes] = useState('')
  const [cornellSummary, setCornellSummary] = useState('')

  // Feynman dialog
  const [showFeynman, setShowFeynman] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editNote) {
      setTitle(editNote.title)
      setTags(editNote.tags || [])
      const cd = editNote.cornellData
      if (cd && Object.keys(cd).length > 0) {
        setCornellCues(Array.isArray(cd.cues) ? cd.cues.join('\n') : cd.cues || '')
        setCornellNotes(cd.notes || editNote.content || '')
        setCornellSummary(cd.summary || '')
      } else {
        setCornellCues('')
        setCornellNotes(editNote.content || '')
        setCornellSummary('')
      }
    } else {
      resetForm()
    }
  }, [editNote])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  const resetForm = () => {
    setTitle('')
    setTags([])
    setTagInput('')
    setCornellCues('')
    setCornellNotes('')
    setCornellSummary('')
  }

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      const cornellData = { cues: cornellCues, notes: cornellNotes, summary: cornellSummary }
      const payload = { userId, title, content: cornellNotes, method: 'cornell', tags, cornellData }
      if (editNote) {
        await apiClient.put(`/api/v1/notes/${editNote.id}`, payload)
      } else {
        await apiClient.post('/api/v1/notes', payload)
      }
      if (!editNote) resetForm()
      onSaved?.()
    } catch (err) {
      console.error('Failed to save note:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleAddTag = () => {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput('')
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  // Feynman dialog
  const openFeynman = async () => {
    if (!editNote) return
    setShowFeynman(true)
    if (chatHistory.length > 0) return
    setChatLoading(true)
    try {
      const res = await apiClient.post<{ reply: string }>(`/api/v1/notes/${editNote.id}/feynman-chat`, {
        history: [{ role: 'user', content: '请开始对我进行费曼检测，根据我的笔记内容向我提问。' }],
      })
      setChatHistory([{ role: 'assistant', content: res.reply }])
    } catch {
      setChatHistory([{ role: 'assistant', content: '抱歉，连接失败，请稍后再试。' }])
    } finally {
      setChatLoading(false)
    }
  }

  const sendChat = async () => {
    if (!editNote || !chatInput.trim() || chatLoading) return
    const userMsg: ChatMessage = { role: 'user', content: chatInput.trim() }
    const newHistory = [...chatHistory, userMsg]
    setChatHistory(newHistory)
    setChatInput('')
    setChatLoading(true)
    try {
      const res = await apiClient.post<{ reply: string }>(`/api/v1/notes/${editNote.id}/feynman-chat`, {
        history: [
          { role: 'user', content: '请开始对我进行费曼检测，根据我的笔记内容向我提问。' },
          ...newHistory,
        ],
      })
      setChatHistory([...newHistory, { role: 'assistant', content: res.reply }])
    } catch {
      setChatHistory([...newHistory, { role: 'assistant', content: '请求失败，请重试。' }])
    } finally {
      setChatLoading(false)
    }
  }

  const closeFeynman = () => {
    setShowFeynman(false)
  }

  const resetFeynman = () => {
    setChatHistory([])
    setChatInput('')
    openFeynman()
  }

  return (
    <div className="space-y-5">
      {/* Title + Feynman button */}
      <div className="flex gap-3 items-center">
        <input
          type="text"
          placeholder="笔记标题"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="flex-1 px-4 py-3 text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {editNote && (
          <button
            onClick={openFeynman}
            className="px-4 py-3 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            费曼检测
          </button>
        )}
      </div>

      {/* Cornell Layout */}
      <div className="border border-blue-300 rounded-lg overflow-hidden bg-white">
        <div className="bg-blue-50 px-4 py-2 border-b border-blue-300 text-center">
          <span className="text-sm font-semibold text-blue-700">康奈尔笔记法</span>
        </div>

        <div className="flex min-h-[360px]">
          {/* Left: Cue Column */}
          <div className="w-1/3 border-r border-blue-300 flex flex-col">
            <div className="bg-blue-50/60 px-3 py-1.5 border-b border-blue-200">
              <span className="text-xs font-semibold text-blue-600">线索栏 / 关键词</span>
            </div>
            <textarea
              placeholder="记录关键词、问题、提示..."
              value={cornellCues}
              onChange={e => setCornellCues(e.target.value)}
              className="flex-1 w-full px-3 py-2 text-sm resize-none focus:outline-none focus:bg-blue-50/30 placeholder-gray-400"
            />
          </div>

          {/* Right: Notes Column */}
          <div className="w-2/3 flex flex-col">
            <div className="bg-blue-50/60 px-3 py-1.5 border-b border-blue-200">
              <span className="text-xs font-semibold text-blue-600">笔记栏</span>
            </div>
            <textarea
              placeholder="记录课堂笔记、要点、细节..."
              value={cornellNotes}
              onChange={e => setCornellNotes(e.target.value)}
              className="flex-1 w-full px-3 py-2 text-sm resize-none focus:outline-none focus:bg-blue-50/30 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Bottom: Summary */}
        <div className="border-t border-blue-300">
          <div className="bg-blue-50/60 px-3 py-1.5 border-b border-blue-200">
            <span className="text-xs font-semibold text-blue-600">总结栏</span>
          </div>
          <textarea
            placeholder="用自己的话总结本页笔记的要点..."
            value={cornellSummary}
            onChange={e => setCornellSummary(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-sm resize-none focus:outline-none focus:bg-blue-50/30 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="添加标签"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={handleAddTag} className="px-4 py-2 bg-gray-200 rounded-lg text-sm hover:bg-gray-300">
            添加
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                {tag}
                <button onClick={() => handleRemoveTag(tag)} className="text-green-600 hover:text-red-600">&times;</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Save button */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all"
        >
          {saving ? '保存中...' : editNote ? '更新笔记' : '保存笔记'}
        </button>
        {editNote && (
          <button
            onClick={() => { resetForm(); onSaved?.() }}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            取消编辑
          </button>
        )}
      </div>

      {!editNote && (
        <p className="text-sm text-gray-500">
          提示：保存笔记后可以使用费曼检测功能
        </p>
      )}

      {/* Feynman Dialog */}
      {showFeynman && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col" style={{ maxHeight: '80vh' }}>
            {/* Dialog header */}
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div>
                <h3 className="font-semibold text-lg text-gray-800">费曼检测</h3>
                <p className="text-xs text-gray-400 mt-0.5">AI 根据你的笔记提问，检验理解程度</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={resetFeynman}
                  className="text-xs px-3 py-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  重新开始
                </button>
                <button
                  onClick={closeFeynman}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-blue-500 text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-800 rounded-bl-md'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-4 py-2.5 rounded-2xl rounded-bl-md text-sm text-gray-400">
                    思考中...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat input */}
            <div className="px-5 py-3 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="输入你的回答..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendChat())}
                  disabled={chatLoading}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                />
                <button
                  onClick={sendChat}
                  disabled={chatLoading || !chatInput.trim()}
                  className="px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  发送
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NoteEditor
