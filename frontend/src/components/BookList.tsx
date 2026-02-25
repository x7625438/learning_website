import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import apiClient from '../utils/api-client'
import { useNotificationStore } from '../store'

interface Book {
  id: string
  title: string
  author: string
  content: string
  summary?: string
  userId: string
  createdAt: string
  updatedAt: string
}

interface BookListProps {
  userId: string
  onBookSelect: (book: Book) => void
  refreshTrigger?: number
}

const BookList: React.FC<BookListProps> = ({ userId, onBookSelect, refreshTrigger }) => {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])

  useEffect(() => {
    loadBooks()
  }, [userId, refreshTrigger])

  useEffect(() => {
    // Filter books based on search query
    if (searchQuery.trim() === '') {
      setFilteredBooks(books)
    } else {
      const filtered = books.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (book.summary && book.summary.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setFilteredBooks(filtered)
    }
  }, [books, searchQuery])

  const loadBooks = async () => {
    try {
      setLoading(true)
      const booksData = await apiClient.get<Book[]>(`/api/v1/books/user/${userId}`)
      setBooks(booksData)
    } catch (error) {
      console.error('Failed to load books:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteBook = async (bookId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!confirm('确定要删除这本书吗？')) {
      return
    }

    try {
      await apiClient.delete(`/api/v1/books/${bookId}`)
      setBooks(books.filter(book => book.id !== bookId))
    } catch (error) {
      console.error('Failed to delete book:', error)
      useNotificationStore.getState().addNotification({ type: 'error', message: '删除失败' })
    }
  }

  const generateSummary = async (bookId: string, e: React.MouseEvent) => {
    e.stopPropagation()

    try {
      const data = await apiClient.post<{summary: string}>(`/api/v1/books/${bookId}/summary`, { maxLength: 500, style: 'concise' })
      // Update the book in the list
      setBooks(books.map(book =>
        book.id === bookId
          ? { ...book, summary: data.summary }
          : book
      ))
    } catch (error) {
      console.error('Failed to generate summary:', error)
      useNotificationStore.getState().addNotification({ type: 'error', message: '生成摘要失败' })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="搜索书籍..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? '未找到匹配的书籍' : '还没有上传任何书籍'}
          </h3>
          <p className="text-gray-500">
            {searchQuery ? '尝试使用不同的关键词搜索' : '上传您的第一本书开始学习之旅'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onBookSelect(book)}
            >
              <div className="p-6">
                {/* Book Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600">作者：{book.author}</p>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-1 ml-2">
                    {!book.summary && (
                      <button
                        onClick={(e) => generateSummary(book.id, e)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="生成摘要"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={(e) => deleteBook(book.id, e)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="删除书籍"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Summary */}
                {book.summary ? (
                  <div className="mb-4">
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {truncateText(book.summary, 120)}
                    </p>
                  </div>
                ) : (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 italic">
                      暂无摘要，点击生成摘要按钮创建
                    </p>
                  </div>
                )}

                {/* Content Preview */}
                <div className="mb-4">
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {truncateText(book.content, 100)}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>创建于 {formatDate(book.createdAt)}</span>
                  <span>{Math.ceil(book.content.length / 1000)}k 字</span>
                </div>

                {/* Status Indicators */}
                <div className="flex space-x-2 mt-3">
                  {book.summary && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      已生成摘要
                    </span>
                  )}
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    可开始阅读
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BookList