import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import apiClient from '../utils/api-client'
import { useNotificationStore } from '../store'

interface BookUploadProps {
  userId: string
  onBookUploaded: (book: any) => void
}

const BookUpload: React.FC<BookUploadProps> = ({ userId, onBookUploaded }) => {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    file: null as File | null
  })

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (isValidFileType(file)) {
        setFormData(prev => ({ ...prev, file }))
      } else {
        useNotificationStore.getState().addNotification({ type: 'warning', message: '请上传 TXT、PDF 或 DOCX 格式的文件' })
      }
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (isValidFileType(file)) {
        setFormData(prev => ({ ...prev, file }))
      } else {
        useNotificationStore.getState().addNotification({ type: 'warning', message: '请上传 TXT、PDF 或 DOCX 格式的文件' })
      }
    }
  }

  const isValidFileType = (file: File) => {
    const validTypes = [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    return validTypes.includes(file.type)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.author || !formData.file) {
      useNotificationStore.getState().addNotification({ type: 'warning', message: '请填写完整信息并选择文件' })
      return
    }

    setUploading(true)
    
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('title', formData.title)
      uploadFormData.append('author', formData.author)
      uploadFormData.append('userId', userId)
      uploadFormData.append('book', formData.file)

      console.log('=== 开始上传 ===')
      console.log('书名:', formData.title)
      console.log('作者:', formData.author)
      console.log('文件名:', formData.file.name)
      console.log('文件大小:', formData.file.size, 'bytes')
      console.log('文件类型:', formData.file.type)

      const response = await fetch('/api/v1/books/upload', {
        method: 'POST',
        body: uploadFormData
      })

      console.log('响应状态:', response.status)
      console.log('响应头:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('上传错误详情:', errorData)
        throw new Error(errorData.error?.message || errorData.message || `上传失败 (HTTP ${response.status})`)
      }

      const book = await response.json()
      console.log('上传成功:', book)
      onBookUploaded(book)
      
      // Reset form
      setFormData({ title: '', author: '', file: null })
      
      useNotificationStore.getState().addNotification({ type: 'success', message: '书籍上传成功！' })
    } catch (error: any) {
      console.error('=== 上传失败 ===')
      console.error('错误信息:', error.message)
      console.error('错误堆栈:', error.stack)
      useNotificationStore.getState().addNotification({ type: 'error', message: `上传失败：${error.message}` })
    } finally {
      setUploading(false)
    }
  }

  const handleManualCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.author) {
      useNotificationStore.getState().addNotification({ type: 'warning', message: '请填写书名和作者' })
      return
    }

    const content = prompt('请输入书籍内容：')
    if (!content) return

    setUploading(true)
    
    try {
      const book = await apiClient.post<any>('/api/v1/books', {
        title: formData.title,
        author: formData.author,
        content,
        userId
      })
      onBookUploaded(book)
      
      // Reset form
      setFormData({ title: '', author: '', file: null })
      
      useNotificationStore.getState().addNotification({ type: 'success', message: '书籍创建成功！' })
    } catch (error) {
      console.error('Create error:', error)
      useNotificationStore.getState().addNotification({ type: 'error', message: '创建失败，请重试' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          上传书籍
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              书名 *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入书名"
              required
            />
          </div>

          {/* Author Input */}
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
              作者 *
            </label>
            <input
              type="text"
              id="author"
              value={formData.author}
              onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入作者姓名"
              required
            />
          </div>

          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              书籍文件 (TXT, PDF, DOCX)
            </label>
            <motion.div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <input
                type="file"
                onChange={handleFileChange}
                accept=".txt,.pdf,.docx"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              {formData.file ? (
                <div className="space-y-2">
                  <div className="text-green-600 text-lg">✓</div>
                  <p className="text-sm font-medium text-gray-900">
                    已选择: {formData.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    大小: {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-gray-400 text-4xl">📚</div>
                  <p className="text-sm font-medium text-gray-900">
                    拖拽文件到此处或点击选择
                  </p>
                  <p className="text-xs text-gray-500">
                    支持 TXT、PDF、DOCX 格式，最大 10MB
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={uploading || !formData.file}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? '上传中...' : '上传文件'}
            </button>
            
            <button
              type="button"
              onClick={handleManualCreate}
              disabled={uploading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              手动创建
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">使用说明：</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• 支持上传 TXT、PDF、DOCX 格式的书籍文件</li>
            <li>• 系统会自动生成书籍摘要</li>
            <li>• 可以与AI作者进行对话交流</li>
            <li>• 提供SQ3R阅读法指导</li>
            <li>• 跟踪阅读进度和理解程度</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default BookUpload