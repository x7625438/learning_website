import { useState } from 'react'
import DocumentEditor from '../components/DocumentEditor'
import DocumentList from '../components/DocumentList'

export default function Documents() {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleDocumentSelect = (documentId: string) => {
    setSelectedDocumentId(documentId)
  }

  const handleDocumentSaved = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleNewDocument = () => {
    setSelectedDocumentId(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full min-w-0">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">AI文档协作助手</h1>
          <p className="mt-2 text-gray-600">
            让AI帮助你提升写作质量，提供结构建议、内容扩展和改进意见
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Document List */}
          <div className="lg:col-span-1">
            <DocumentList
              onDocumentSelect={handleDocumentSelect}
              onNewDocument={handleNewDocument}
              selectedDocumentId={selectedDocumentId}
              refreshTrigger={refreshTrigger}
            />
          </div>

          {/* Document Editor */}
          <div className="lg:col-span-2">
            <DocumentEditor
              documentId={selectedDocumentId}
              onDocumentSaved={handleDocumentSaved}
            />
          </div>
        </div>
      </div>
  )
}
