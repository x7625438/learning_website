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

interface NoteEditorProps {
  userId: string
  editNote?: Note | null
  onSaved?: () => void
}

const NoteEditor: React.FC<NoteEditorProps> = ({ userId, editNote, onSaved }) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [method, setMethod] = useState<'free' | 'cornell' | 'feynman'>('free')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [cornellData, setCornellData] = useState<any>(null)
  const [feynmanResult, setFeynmanResult] = useState<any>(null)
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    if (editNote) {
      setTitle(editNote.title)
      setContent(editNote.content)
      setMethod(editNote.method as any)
      setTags(editNote.tags || [])
      setCornellData(editNote.cornellData && Object.keys(editNote.cornellData).length > 0 ? editNote.cornellData : null)
      setFeynmanResult(editNote.feynmanResult && Object.keys(editNote.feynmanResult).length > 0 ? editNote.feynmanResult : null)
    } else {
      resetForm()
    }
  }, [editNote])

  const resetForm = () => {
    setTitle('')
    setContent('')
    setMethod('free')
    setTags([])
    setTagInput('')
    setCornellData(null)
    setFeynmanResult(null)
  }

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      const payload = { userId, title, content, method, tags, cornellData: cornellData || {} }
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
    if (t && !tags.includes(t)) {
      setTags([...tags, t])
    }
    setTagInput('')
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const handleCornell = async () => {
    if (!editNote) return
    setAiLoading(true)
    try {
      const data = await apiClient.post<any>(`/api/v1/notes/${editNote.id}/cornell`, {})
      setCornellData(data)
      setMethod('cornell')
    } catch (err) {
      console.error('Cornell generation failed:', err)
    } finally {
      setAiLoading(false)
    }
  }

  const handleFeynman = async () => {
    if (!editNote) return
    setAiLoading(true)
    try {
      const data = await apiClient.post<any>(`/api/v1/notes/${editNote.id}/feynman`, {})
      setFeynmanResult(data)
    } catch (err) {
      console.error('Feynman check failed:', err)
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <input
        type="text"
        placeholder="笔记标题"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="w-full px-4 py-3 text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      {/* Method selector */}
      <div className="flex gap-2">
        {(['free', 'cornell', 'feynman'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMethod(m)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              method === m
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {m === 'free' ? '自由笔记' : m === 'cornell' ? '康奈尔笔记' : '费曼笔记'}
          </button>
        ))}
      </div>

      {/* Content */}
      <textarea
        placeholder="开始写笔记..."
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={12}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
      />

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

      {/* AI Actions - only for saved notes */}
      {editNote && (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleCornell}
            disabled={aiLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {aiLoading ? '生成中...' : '生成康奈尔结构'}
          </button>
          <button
            onClick={handleFeynman}
            disabled={aiLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {aiLoading ? '检验中...' : '费曼学习法检验'}
          </button>
        </div>
      )}

      {/* Cornell Result */}
      {cornellData && cornellData.cues && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-blue-800">康奈尔笔记结构</h4>
          <div>
            <p className="text-sm font-medium text-blue-700 mb-1">线索/关键词：</p>
            <ul className="list-disc list-inside text-sm text-gray-700">
              {cornellData.cues.map((c: string, i: number) => <li key={i}>{c}</li>)}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-700 mb-1">总结：</p>
            <p className="text-sm text-gray-700">{cornellData.summary}</p>
          </div>
          {cornellData.questions && (
            <div>
              <p className="text-sm font-medium text-blue-700 mb-1">自测问题：</p>
              <ul className="list-decimal list-inside text-sm text-gray-700">
                {cornellData.questions.map((q: string, i: number) => <li key={i}>{q}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Feynman Result */}
      {feynmanResult && feynmanResult.score !== undefined && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-purple-800">费曼学习法检验</h4>
            <span className="text-lg font-bold text-purple-700">{feynmanResult.score}分 - {feynmanResult.level}</span>
          </div>
          {feynmanResult.strengths?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-green-700 mb-1">理解到位：</p>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {feynmanResult.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
          {feynmanResult.weaknesses?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-red-700 mb-1">需要加强：</p>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {feynmanResult.weaknesses.map((w: string, i: number) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}
          {feynmanResult.suggestions?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-purple-700 mb-1">改进建议：</p>
              <ul className="list-decimal list-inside text-sm text-gray-700">
                {feynmanResult.suggestions.map((s: string, i: number) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
          {feynmanResult.simplifiedExplanation && (
            <div>
              <p className="text-sm font-medium text-purple-700 mb-1">简化解释：</p>
              <p className="text-sm text-gray-700 bg-white/50 p-2 rounded">{feynmanResult.simplifiedExplanation}</p>
            </div>
          )}
        </div>
      )}

      {/* Save button */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 transition-all"
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
          提示：保存笔记后可以使用康奈尔笔记法和费曼学习法等AI功能
        </p>
      )}
    </div>
  )
}

export default NoteEditor