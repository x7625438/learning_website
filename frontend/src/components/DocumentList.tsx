import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import apiClient from '../utils/api-client'
import { useUserStore } from '../store'

interface Document {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

interface DocumentListProps {
  onDocumentSelect: (documentId: string) => void
  onNewDocument: () => void
  selectedDocumentId: string | null
  refreshTrigger: number
}

export default function DocumentList({
  onDocumentSelect,
  onNewDocument,
  selectedDocumentId,
  refreshTrigger,
}: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDocuments()
  }, [refreshTrigger])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const userId = useUserStore.getState().user?.id || 'demo-user'
      const data = await apiClient.get<Document[]>(`/api/v1/documents/user/${userId}`)
      setDocuments(data)
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">我的文档</h2>
        <button
          onClick={onNewDocument}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          新建文档
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>还没有文档</p>
          <p className="text-sm mt-2">点击"新建文档"开始创作</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <motion.div
              key={doc.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onDocumentSelect(doc.id)}
              className={`p-4 rounded-lg cursor-pointer transition-colors ${
                selectedDocumentId === doc.id
                  ? 'bg-blue-50 border-2 border-blue-500'
                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
              }`}
            >
              <h3 className="font-medium text-gray-900 truncate">{doc.title}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{doc.content}</p>
              <p className="text-xs text-gray-400 mt-2">{formatDate(doc.updatedAt)}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
