import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BookList from '../components/BookList'
import BookUpload from '../components/BookUpload'
import BookReader from '../components/BookReader'

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

type ViewMode = 'list' | 'upload' | 'reader'

const Books: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('list')
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  
  // Mock user ID - in a real app, this would come from authentication
  const userId = 'user-123'

  const handleBookUploaded = (book: Book) => {
    setRefreshTrigger(prev => prev + 1)
    setCurrentView('list')
  }

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book)
    setCurrentView('reader')
  }

  const handleBackToList = () => {
    setCurrentView('list')
    setSelectedBook(null)
  }

  const pageVariants = {
    initial: { opacity: 0, x: -20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: 20 }
  }

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.3
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="glass-strong shadow-soft-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 py-4 sm:py-5">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {currentView !== 'list' && (
                <button
                  onClick={handleBackToList}
                  className="flex items-center text-surface-500 hover:text-surface-700 transition-colors flex-shrink-0 py-2"
                >
                  <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  返回
                </button>
              )}
              <h1 className="text-xl sm:text-2xl font-semibold text-surface-800 truncate">
                {currentView === 'list' && '读书助手'}
                {currentView === 'upload' && '上传书籍'}
                {currentView === 'reader' && (selectedBook?.title ?? '')}
              </h1>
            </div>

            {currentView === 'list' && (
              <button
                onClick={() => setCurrentView('upload')}
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 sm:px-5 py-2 rounded-xl text-sm font-medium transition-all shadow-soft-sm hover:shadow-soft-md flex items-center justify-center gap-2 flex-shrink-0 w-full sm:w-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>上传书籍</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {currentView === 'list' && (
            <motion.div
              key="list"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <div className="px-4 sm:px-0">
                {/* Welcome Section - responsive */}
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 text-white shadow-soft-md">
                  <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">欢迎使用读书助手</h2>
                  <p className="text-sm sm:text-base opacity-90 mb-4 sm:mb-5">
                    上传您的书籍，享受AI驱动的智能阅读体验。包括自动摘要生成、作者对话、SQ3R阅读指导等功能。
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span>自动生成书籍摘要</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>与AI作者智能对话</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>SQ3R阅读法指导</span>
                    </div>
                  </div>
                </div>

                {/* Book List */}
                <BookList
                  userId={userId}
                  onBookSelect={handleBookSelect}
                  refreshTrigger={refreshTrigger}
                />
              </div>
            </motion.div>
          )}

          {currentView === 'upload' && (
            <motion.div
              key="upload"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <BookUpload
                userId={userId}
                onBookUploaded={handleBookUploaded}
              />
            </motion.div>
          )}

          {currentView === 'reader' && selectedBook && (
            <motion.div
              key="reader"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <BookReader
                book={selectedBook}
                userId={userId}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default Books