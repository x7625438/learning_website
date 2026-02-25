import React, { useState } from 'react'
import apiClient from '../utils/api-client'

interface Paper {
  id: string
  title: string
  authors: string[]
  abstract: string
  content: string
  translatedContent?: string
  createdAt: string
  updatedAt: string
}

interface PaperUploadProps {
  onPaperCreated: (paper: Paper) => void
  userId: string
}

export function PaperUpload({ onPaperCreated, userId }: PaperUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    abstract: '',
    content: ''
  })
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      setError('请上传PDF文件')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('pdf', file)

      // Keep fetch for FormData file upload
      const response = await fetch('/api/v1/papers/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('PDF处理失败')
      }

      const extractedData = await response.json()
      setFormData({
        title: extractedData.title || '',
        authors: '',
        abstract: extractedData.abstract || '',
        content: extractedData.content || ''
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF上传失败')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.content) {
      setError('请填写标题和内容')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const authors = formData.authors
        .split(',')
        .map(author => author.trim())
        .filter(author => author.length > 0)

      const newPaper = await apiClient.post<Paper>('/api/v1/papers', {
        title: formData.title,
        authors: authors.length > 0 ? authors : ['Unknown'],
        abstract: formData.abstract || '暂无摘要',
        content: formData.content,
        userId
      })
      onPaperCreated(newPaper)
      
      // Reset form
      setFormData({
        title: '',
        authors: '',
        abstract: '',
        content: ''
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建论文失败')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        上传论文
      </h3>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* PDF Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            上传PDF文件 (可选)
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
          />
          <p className="text-xs text-gray-500 mt-1">
            上传PDF文件自动提取内容，或手动填写下方表单
          </p>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            论文标题 *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            disabled={uploading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            placeholder="请输入论文标题"
          />
        </div>

        {/* Authors */}
        <div>
          <label htmlFor="authors" className="block text-sm font-medium text-gray-700 mb-2">
            作者 (用逗号分隔)
          </label>
          <input
            type="text"
            id="authors"
            name="authors"
            value={formData.authors}
            onChange={handleInputChange}
            disabled={uploading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            placeholder="作者1, 作者2, 作者3"
          />
        </div>

        {/* Abstract */}
        <div>
          <label htmlFor="abstract" className="block text-sm font-medium text-gray-700 mb-2">
            摘要
          </label>
          <textarea
            id="abstract"
            name="abstract"
            value={formData.abstract}
            onChange={handleInputChange}
            disabled={uploading}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            placeholder="请输入论文摘要"
          />
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            论文内容 *
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            required
            disabled={uploading}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            placeholder="请输入或粘贴论文内容"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploading || !formData.title || !formData.content}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              处理中...
            </span>
          ) : (
            '创建论文'
          )}
        </button>
      </form>
    </div>
  )
}