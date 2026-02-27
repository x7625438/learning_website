import React, { useState, useEffect } from 'react'
import { PaperUpload } from '../components/PaperUpload'
import { PaperList } from '../components/PaperList'
import { PaperReader } from '../components/PaperReader'
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

export function Papers() {
  const [papers, setPapers] = useState<Paper[]>([])
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mock user ID - in a real app, this would come from authentication
  const userId = 'user-123'

  useEffect(() => {
    fetchPapers()
  }, [])

  const fetchPapers = async () => {
    try {
      setLoading(true)
      const data = await apiClient.get<Paper[]>(`/api/v1/papers?userId=${userId}`)
      setPapers(data)
    } catch (err) {
      console.error('Error fetching papers:', err)
      // Set empty array instead of showing error
      setPapers([])
    } finally {
      setLoading(false)
    }
  }

  const handlePaperCreated = (newPaper: Paper) => {
    setPapers(prev => [newPaper, ...prev])
  }

  const handlePaperSelect = (paper: Paper) => {
    setSelectedPaper(paper)
  }

  const handleBackToList = () => {
    setSelectedPaper(null)
  }

  if (selectedPaper) {
    return (
      <PaperReader 
        paper={selectedPaper} 
        onBack={handleBackToList}
        userId={userId}
      />
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-surface-800 mb-2">
            论文助手
          </h1>
          <p className="text-surface-400 text-sm sm:text-base">
            上传英文论文，获得智能翻译、术语注释和深度分析
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <PaperUpload 
              onPaperCreated={handlePaperCreated}
              userId={userId}
            />
          </div>

          {/* Papers List Section */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-surface-800">
              我的论文库
            </h2>

            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-primary-100 border-t-primary-500"></div>
              </div>
            )}

            {!loading && (
              <PaperList 
                papers={papers}
                onPaperSelect={handlePaperSelect}
              />
            )}
          </div>
        </div>
      </div>
  )
}