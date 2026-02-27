import { useState, useEffect, useRef } from 'react'
import apiClient from '../utils/api-client'
import { useUserStore } from '../store'

interface Doc {
  id: string
  title: string
  content: string
  userId: string
  createdAt: string
  updatedAt: string
}

interface ChatMessage {
  role: 'assistant' | 'user'
  content: string
  docRef?: { id: string; title: string }
}

export default function Documents() {
  const userId = useUserStore((s) => s.user)?.id || 'demo-user'

  const [documents, setDocuments] = useState<Doc[]>([])
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [showCanvas, setShowCanvas] = useState(false)
  const [showDocList, setShowDocList] = useState(false)
  const [showEditMenu, setShowEditMenu] = useState(false)
  const [sliderPanel, setSliderPanel] = useState<'reading' | 'length' | null>(null)
  const [sliderValue, setSliderValue] = useState(3) // 1-5, 3 is center
  const [contentHistory, setContentHistory] = useState<string[]>([])
  const [redoHistory, setRedoHistory] = useState<string[]>([])

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Selection toolbar state
  const [selection, setSelection] = useState<{ start: number; end: number; text: string } | null>(null)
  const [selToolbarPos, setSelToolbarPos] = useState<{ top: number; left: number } | null>(null)
  const [selInput, setSelInput] = useState('')
  const [selLoading, setSelLoading] = useState(false)
  const selInputRef = useRef<HTMLInputElement>(null)
  const selToolbarRef = useRef<HTMLDivElement>(null)
  const canvasAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => { fetchDocuments() }, [])
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatHistory])

  // Click-outside to dismiss selection toolbar
  useEffect(() => {
    if (!selection) return
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node
      if (selToolbarRef.current?.contains(target)) return
      if (textareaRef.current?.contains(target)) return
      setSelection(null)
      setSelToolbarPos(null)
      setSelInput('')
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [selection])

  // Handle text selection in canvas textarea
  const handleSelectionChange = () => {
    const ta = textareaRef.current
    if (!ta || !canvasAreaRef.current) return
    const { selectionStart, selectionEnd } = ta
    if (selectionStart === selectionEnd) {
      setSelection(null)
      setSelToolbarPos(null)
      return
    }
    const text = content.slice(selectionStart, selectionEnd)
    setSelection({ start: selectionStart, end: selectionEnd, text })

    // Calculate toolbar position relative to canvas area
    const taRect = ta.getBoundingClientRect()
    const canvasRect = canvasAreaRef.current.getBoundingClientRect()
    // Approximate line position from selectionStart
    const textBefore = content.slice(0, selectionStart)
    const lines = textBefore.split('\n').length
    const lineHeight = 27 // ~15px font * 1.8 leading
    const top = taRect.top - canvasRect.top + lines * lineHeight - ta.scrollTop - 48
    const left = Math.min(taRect.width / 2, 300)
    setSelToolbarPos({ top: Math.max(0, top), left })
  }

  const fetchDocuments = async () => {
    try {
      const data = await apiClient.get<Doc[]>(`/api/v1/documents/user/${userId}`)
      setDocuments(data)
    } catch (err) { console.error(err) }
  }

  // Push current content to history stack before AI modifies it
  const pushHistory = () => {
    if (content) setContentHistory(prev => [...prev, content])
    setRedoHistory([])
  }

  const handleUndo = () => {
    if (contentHistory.length === 0) return
    setRedoHistory(prev => [...prev, content])
    const prev = contentHistory[contentHistory.length - 1]
    setContentHistory(h => h.slice(0, -1))
    setContent(prev)
  }

  const handleRedo = () => {
    if (redoHistory.length === 0) return
    setContentHistory(prev => [...prev, content])
    const next = redoHistory[redoHistory.length - 1]
    setRedoHistory(h => h.slice(0, -1))
    setContent(next)
  }

  const loadDocument = async (docId: string) => {
    try {
      const data = await apiClient.get<Doc>(`/api/v1/documents/${docId}`)
      setSelectedDocId(data.id)
      setTitle(data.title)
      setContent(data.content)
      setShowCanvas(true)
      setShowDocList(false)
    } catch (err) { console.error(err) }
  }

  const handleNew = () => {
    setSelectedDocId(null)
    setTitle('')
    setContent('')
    setShowCanvas(true)
    setShowDocList(false)
  }

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      if (selectedDocId) {
        await apiClient.put(`/api/v1/documents/${selectedDocId}`, { title, content })
      } else {
        const data = await apiClient.post<Doc>('/api/v1/documents', { title, content, userId })
        setSelectedDocId(data.id)
      }
      fetchDocuments()
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const handleDelete = async (docId: string) => {
    if (!confirm('确定删除？')) return
    try {
      await apiClient.delete(`/api/v1/documents/${docId}`)
      if (selectedDocId === docId) {
        setSelectedDocId(null); setTitle(''); setContent(''); setShowCanvas(false)
      }
      fetchDocuments()
    } catch (err) { console.error(err) }
  }

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return
    const userMsg: ChatMessage = { role: 'user', content: chatInput.trim() }
    const newHistory = [...chatHistory, userMsg]
    setChatHistory(newHistory)
    const prompt = chatInput.trim()
    setChatInput('')
    setChatLoading(true)

    try {
      if (selectedDocId) {
        const apiHistory = newHistory.map(m => ({ role: m.role, content: m.content }))
        const res = await apiClient.post<{ reply: string }>(
          `/api/v1/documents/${selectedDocId}/chat`, { history: apiHistory }
        )
        setChatHistory([...newHistory, { role: 'assistant', content: res.reply }])
      } else {
        const res = await apiClient.post<Doc>('/api/v1/documents/generate', { prompt, userId })
        setSelectedDocId(res.id)
        setTitle(res.title)
        setContent(res.content)
        setShowCanvas(true)
        fetchDocuments()
        setChatHistory([
          ...newHistory,
          {
            role: 'assistant',
            content: '已为你生成文档，你可以在右侧画布中查看和编辑。有什么需要修改的随时告诉我。',
            docRef: { id: res.id, title: res.title },
          },
        ])
      }
    } catch {
      setChatHistory([...newHistory, { role: 'assistant', content: '请求失败，请重试。' }])
    } finally {
      setChatLoading(false)
    }
  }

  const quickActions = [
    { label: '写一篇论文', prompt: '帮我写一篇论文' },
    { label: '润色文章', prompt: '请帮我润色这篇文章' },
    { label: '优化结构', prompt: '请帮我优化文章结构' },
    { label: '缩减篇幅', prompt: '请帮我精简文章' },
  ]

  const readingLevels = ['幼儿园', '中学', '高中', '大学', '研究生']
  const lengthLevels = ['最短', '较短', '适中', '较长', '最长']

  const handleEditAction = async (action: string) => {
    setShowEditMenu(false)
    if (action === 'reading' || action === 'length') {
      setSliderValue(3)
      setSliderPanel(action)
      return
    }
    if (!selectedDocId || chatLoading) return
    const prompts: Record<string, string> = {
      emoji: '请在文档中适当位置添加表情符号，使内容更生动有趣。直接返回修改后的完整文本。',
      polish: '请对文档进行最后的润色，优化措辞、修正语法、提升可读性。直接返回修改后的完整文本。',
    }
    const prompt = prompts[action]
    if (!prompt) return
    const userMsg: ChatMessage = { role: 'user', content: prompt }
    const newHistory = [...chatHistory, userMsg]
    setChatHistory(newHistory)
    setChatLoading(true)
    try {
      const apiHistory = newHistory.map(m => ({ role: m.role, content: m.content }))
      const res = await apiClient.post<{ reply: string }>(
        `/api/v1/documents/${selectedDocId}/chat`, { history: apiHistory }
      )
      pushHistory()
      setContent(res.reply)
      setChatHistory([...newHistory, { role: 'assistant', content: '已应用修改到文档。' }])
    } catch {
      setChatHistory([...newHistory, { role: 'assistant', content: '请求失败，请重试。' }])
    } finally {
      setChatLoading(false)
    }
  }

  const handleSliderConfirm = async () => {
    if (!selectedDocId || chatLoading) return
    const label = sliderPanel === 'reading'
      ? readingLevels[sliderValue - 1]
      : lengthLevels[sliderValue - 1]
    const prompt = sliderPanel === 'reading'
      ? `请将文档的阅读水平调整为「${label}」级别，调整用词和句式复杂度。直接返回修改后的完整文本。`
      : `请将文档的篇幅调整为「${label}」，${sliderValue < 3 ? '精简内容' : sliderValue > 3 ? '扩展内容' : '保持当前长度'}。直接返回修改后的完整文本。`
    setSliderPanel(null)
    const userMsg: ChatMessage = { role: 'user', content: prompt }
    const newHistory = [...chatHistory, userMsg]
    setChatHistory(newHistory)
    setChatLoading(true)
    try {
      const apiHistory = newHistory.map(m => ({ role: m.role, content: m.content }))
      const res = await apiClient.post<{ reply: string }>(
        `/api/v1/documents/${selectedDocId}/chat`, { history: apiHistory }
      )
      pushHistory()
      setContent(res.reply)
      setChatHistory([...newHistory, { role: 'assistant', content: '已应用修改到文档。' }])
    } catch {
      setChatHistory([...newHistory, { role: 'assistant', content: '请求失败，请重试。' }])
    } finally {
      setChatLoading(false)
    }
  }

  // Selection-based inline edit
  const handleSelectionEdit = async () => {
    if (!selectedDocId || !selection || !selInput.trim() || selLoading) return
    const { start, end, text } = selection
    setSelLoading(true)

    const prompt = `请根据以下指令修改这段文字，只返回修改后的文字，不要任何解释：\n\n指令：${selInput.trim()}\n\n原文：\n${text}`
    const userMsg: ChatMessage = { role: 'user', content: `[选中文字] ${selInput.trim()}` }
    const newHistory = [...chatHistory, userMsg]
    setChatHistory(newHistory)

    try {
      const apiHistory = [
        ...newHistory.map(m => ({ role: m.role, content: m.content })).slice(0, -1),
        { role: 'user' as const, content: prompt },
      ]
      const res = await apiClient.post<{ reply: string }>(
        `/api/v1/documents/${selectedDocId}/chat`, { history: apiHistory }
      )
      // Replace only the selected portion
      const newContent = content.slice(0, start) + res.reply + content.slice(end)
      pushHistory()
      setContent(newContent)
      setChatHistory([...newHistory, { role: 'assistant', content: '已替换选中文字。' }])
    } catch {
      setChatHistory([...newHistory, { role: 'assistant', content: '请求失败，请重试。' }])
    } finally {
      setSelLoading(false)
      setSelInput('')
      setSelection(null)
      setSelToolbarPos(null)
    }
  }

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden bg-[#212121]">

      {/* ===== Left: Chat Panel ===== */}
      <div className={`flex flex-col transition-all duration-300 relative ${
        showCanvas ? 'w-[420px] flex-shrink-0' : 'w-full max-w-3xl mx-auto'
      }`}>
        {/* Chat messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {chatHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-2xl font-semibold text-white mb-1">有什么可以帮你的？</p>
              <p className="text-sm text-gray-500 mb-8">输入写作需求，AI 帮你生成和改进文档</p>
              <div className="flex flex-wrap gap-2 justify-center max-w-md">
                {quickActions.map((a) => (
                  <button
                    key={a.label}
                    onClick={() => { setChatInput(a.prompt); inputRef.current?.focus() }}
                    className="px-4 py-2 text-sm bg-[#2f2f2f] border border-[#424242] rounded-full text-gray-300 hover:bg-[#3a3a3a] transition-colors"
                  >
                    {a.label}
                  </button>
                ))}
              </div>
              {documents.length > 0 && (
                <div className="mt-8 w-full max-w-sm">
                  <p className="text-xs text-gray-500 mb-2 px-1">最近文档</p>
                  {documents.slice(0, 4).map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => loadDocument(doc.id)}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-gray-300 hover:bg-[#2f2f2f] transition-colors flex items-center gap-3"
                    >
                      <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="truncate">{doc.title || '无标题'}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Rendered messages */}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex mb-5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-[#ab68ff] flex items-center justify-center mr-2.5 mt-0.5 flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  )}
                  <div className="max-w-[80%]">
                    {msg.docRef && (
                      <button
                        onClick={() => setShowCanvas(true)}
                        className="mb-2 flex items-center gap-2.5 px-3.5 py-2.5 bg-[#2f2f2f] border border-[#424242] rounded-xl hover:bg-[#3a3a3a] transition-colors w-full text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#ab68ff]/20 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-[#ab68ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-200 truncate">{msg.docRef.title}</span>
                      </button>
                    )}
                    <div className={`px-4 py-3 rounded-3xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-[#303030] text-gray-100'
                        : 'text-gray-200'
                    }`}>
                      {msg.content}
                    </div>
                    {msg.role === 'assistant' && !msg.docRef && msg.content.length > 50 && !msg.content.startsWith('已') && msg.content !== '请求失败，请重试。' && showCanvas && (
                      <button
                        onClick={() => { pushHistory(); setContent(msg.content); setShowCanvas(true) }}
                        className="mt-1.5 flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#ab68ff] hover:bg-[#ab68ff]/10 rounded-lg transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        应用到文档
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex mb-5">
                  <div className="w-7 h-7 rounded-full bg-[#ab68ff] flex items-center justify-center mr-2.5 flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-1.5 py-3">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat input bar */}
        <div className="px-3 pb-4 pt-2 relative">
          <div className="flex items-center gap-2 bg-[#2f2f2f] rounded-2xl border border-[#424242] px-3 py-2">
            <button
              onClick={() => setShowDocList(!showDocList)}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-[#424242] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <input
              ref={inputRef}
              type="text"
              placeholder="给 AI 发消息..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendChat())}
              disabled={chatLoading}
              className="flex-1 bg-transparent text-gray-100 text-sm placeholder-gray-500 focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={sendChat}
              disabled={chatLoading || !chatInput.trim()}
              className="p-1.5 bg-white text-black rounded-full hover:bg-gray-200 disabled:opacity-30 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Doc list popup */}
          {showDocList && (
            <div className="absolute bottom-14 left-3 w-72 bg-[#2f2f2f] border border-[#424242] rounded-xl shadow-2xl z-50 py-1.5 max-h-64 overflow-y-auto">
              <button onClick={handleNew} className="w-full px-4 py-2.5 text-left text-sm text-blue-400 hover:bg-[#3a3a3a] flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                新建空白文档
              </button>
              {documents.length > 0 && <div className="border-t border-[#424242] my-1" />}
              {documents.map((doc) => (
                <div key={doc.id} className="px-4 py-2 flex items-center justify-between group hover:bg-[#3a3a3a] cursor-pointer">
                  <div className="flex-1 min-w-0" onClick={() => loadDocument(doc.id)}>
                    <p className="text-sm text-gray-200 truncate">{doc.title || '无标题'}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(doc.id) }}
                    className="p-1 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== Right: Canvas Panel ===== */}
      {showCanvas && (
        <div className="flex-1 flex flex-col min-w-0 bg-[#2b2b2b] border-l border-[#3a3a3a]">
          {/* Canvas toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#3a3a3a]">
            <button
              onClick={() => setShowCanvas(false)}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-[#424242] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm text-gray-300 font-medium max-w-[240px] truncate">
                {title || '未命名文档'}
              </span>
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleUndo}
                disabled={contentHistory.length === 0}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-[#424242] rounded-lg transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                title={`退档 (${contentHistory.length})`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v2M3 10l4-4M3 10l4 4" />
                </svg>
              </button>
              <button
                onClick={handleRedo}
                disabled={redoHistory.length === 0}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-[#424242] rounded-lg transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                title={`进档 (${redoHistory.length})`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a5 5 0 00-5 5v2M21 10l-4-4M21 10l-4 4" />
                </svg>
              </button>
              <button
                onClick={() => content && navigator.clipboard.writeText(content)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-[#424242] rounded-lg transition-colors"
                title="复制"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1 text-xs text-gray-300 hover:text-white hover:bg-[#424242] rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? '...' : '保存'}
              </button>
            </div>
          </div>

          {/* Canvas document area — paper style */}
          <div ref={canvasAreaRef} className="flex-1 overflow-y-auto flex justify-center py-8 px-6 relative">
            <div className="w-full max-w-[680px]">
              {/* Title */}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="无标题"
                className="w-full text-3xl font-bold text-gray-100 bg-transparent border-none focus:outline-none placeholder-gray-600 mb-6"
              />
              {/* Content */}
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onMouseUp={handleSelectionChange}
                onKeyUp={handleSelectionChange}
                placeholder="开始写作..."
                className="w-full min-h-[calc(100vh-240px)] text-[15px] leading-[1.8] text-gray-300 bg-transparent border-none resize-none focus:outline-none placeholder-gray-600"
              />
            </div>

            {/* Selection floating toolbar */}
            {selection && selToolbarPos && (
              <div
                ref={selToolbarRef}
                className="absolute z-50"
                style={{ top: selToolbarPos.top, left: selToolbarPos.left, transform: 'translateX(-50%)' }}
              >
                <div className="bg-[#1e1e1e] border border-[#424242] rounded-2xl shadow-2xl p-2 flex items-center gap-2 min-w-[320px]">
                  <input
                    ref={selInputRef}
                    type="text"
                    placeholder="告诉 AI 如何修改选中文字..."
                    value={selInput}
                    onChange={(e) => setSelInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSelectionEdit())}
                    autoFocus
                    className="flex-1 bg-transparent text-gray-200 text-sm placeholder-gray-500 focus:outline-none px-2"
                  />
                  <button
                    onClick={handleSelectionEdit}
                    disabled={selLoading || !selInput.trim()}
                    className="p-1.5 bg-[#ab68ff] text-white rounded-full hover:bg-[#9a50f0] disabled:opacity-30 transition-colors flex-shrink-0"
                  >
                    {selLoading ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="text-[10px] text-gray-500 mt-1 text-center">
                  已选中 {selection.text.length} 个字符
                </div>
              </div>
            )}
          </div>

          {/* Floating edit menu */}
          <div className="absolute bottom-6 right-6 flex flex-col items-end gap-2">
            {/* Slider Panel */}
            {sliderPanel && (
              <div className="bg-[#2f2f2f] border border-[#424242] rounded-2xl p-4 w-72 shadow-2xl mb-2">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-200">
                    {sliderPanel === 'reading' ? '阅读水平' : '调整长度'}
                  </span>
                  <button onClick={() => setSliderPanel(null)} className="p-1 text-gray-500 hover:text-white rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {/* Labels */}
                <div className="flex justify-between mb-2 px-0.5">
                  {(sliderPanel === 'reading' ? readingLevels : lengthLevels).map((l, i) => (
                    <span key={l} className={`text-[10px] ${sliderValue === i + 1 ? 'text-[#ab68ff] font-semibold' : 'text-gray-500'}`}>
                      {l}
                    </span>
                  ))}
                </div>
                {/* Slider track */}
                <div className="relative h-8 flex items-center">
                  <div className="absolute inset-x-0 h-1 bg-[#424242] rounded-full" />
                  <div className="absolute h-1 bg-[#ab68ff] rounded-full" style={{ left: 0, width: `${((sliderValue - 1) / 4) * 100}%` }} />
                  <input
                    type="range" min={1} max={5} step={1} value={sliderValue}
                    onChange={(e) => setSliderValue(Number(e.target.value))}
                    className="absolute inset-x-0 w-full h-8 opacity-0 cursor-pointer z-10"
                  />
                  {/* Dots */}
                  {[1,2,3,4,5].map(v => (
                    <div key={v} className="absolute w-2.5 h-2.5 rounded-full transition-all"
                      style={{ left: `${((v - 1) / 4) * 100}%`, transform: 'translateX(-50%)' }}>
                      <div className={`w-full h-full rounded-full ${v <= sliderValue ? 'bg-[#ab68ff]' : 'bg-[#555]'} ${v === sliderValue ? 'ring-2 ring-[#ab68ff]/40 scale-125' : ''} transition-all`} />
                    </div>
                  ))}
                </div>
                {/* Confirm */}
                <button onClick={handleSliderConfirm} disabled={chatLoading}
                  className="mt-3 w-full py-2 bg-[#ab68ff] hover:bg-[#9a50f0] text-white text-sm rounded-xl transition-colors disabled:opacity-50">
                  应用
                </button>
              </div>
            )}

            {/* Edit action menu */}
            {showEditMenu && !sliderPanel && (
              <div className="bg-[#2f2f2f] border border-[#424242] rounded-2xl py-1.5 w-48 shadow-2xl mb-2">
                {[
                  { key: 'emoji', icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', label: '添加表情' },
                  { key: 'polish', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z', label: '最后的润色' },
                  { key: 'reading', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', label: '阅读水平' },
                  { key: 'length', icon: 'M4 8h16M4 16h16', label: '调整长度' },
                ].map(item => (
                  <button key={item.key} onClick={() => handleEditAction(item.key)}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-[#3a3a3a] flex items-center gap-3 transition-colors">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {/* Floating trigger button */}
            <button onClick={() => { setShowEditMenu(!showEditMenu); setSliderPanel(null) }}
              className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all ${
                showEditMenu ? 'bg-[#ab68ff] text-white rotate-45' : 'bg-[#424242] hover:bg-[#505050] text-gray-300'
              }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}