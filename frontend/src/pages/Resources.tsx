import React, { useState, useEffect } from 'react'
import { ResourceSearchForm } from '../components/ResourceSearchForm'
import { ResourceSearchResults } from '../components/ResourceSearchResults'
import { ResourceSearchHistory } from '../components/ResourceSearchHistory'
import apiClient from '../utils/api-client'

interface ResourceItem {
  id: string
  title: string
  description: string
  url: string
  source: string
  contentType: 'article' | 'paper' | 'book' | 'video' | 'website'
  relevanceScore: number
  credibilityScore: number
  publishDate?: string
  authors?: string[]
  tags?: string[]
}

interface ResourceSearchResult {
  id: string
  userId: string
  query: string
  searchStrategy: string
  resources: ResourceItem[]
  categorizedResources: Record<string, ResourceItem[]>
  totalResults: number
  createdAt: string
}

export function Resources() {
  const [searchResult, setSearchResult] = useState<ResourceSearchResult | null>(null)
  const [searchHistory, setSearchHistory] = useState<ResourceSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mock user ID - in a real app, this would come from authentication
  const userId = 'user-123'

  useEffect(() => {
    fetchSearchHistory()
  }, [])

  const fetchSearchHistory = async () => {
    try {
      const data = await apiClient.get<ResourceSearchResult[]>(`/api/v1/resources/history/${userId}?limit=10`)
      setSearchHistory(data)
    } catch (err) {
      console.error('Failed to fetch search history:', err)
    }
  }

  const handleSearch = async (query: string) => {
    try {
      setLoading(true)
      setError(null)

      const result = await apiClient.post<ResourceSearchResult>('/api/v1/resources/search', {
        query,
        userId,
      })

      setSearchResult(result)

      // Refresh history
      fetchSearchHistory()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleHistorySelect = (result: ResourceSearchResult) => {
    setSearchResult(result)
  }

  const handleClearResults = () => {
    setSearchResult(null)
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI资料查找助手
          </h1>
          <p className="text-gray-600">
            描述您的资料需求，获得多源整合的高质量学术资料
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Form */}
          <div className="lg:col-span-2 space-y-6">
            <ResourceSearchForm 
              onSearch={handleSearch}
              loading={loading}
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {searchResult && (
              <ResourceSearchResults 
                result={searchResult}
                onClear={handleClearResults}
              />
            )}
          </div>

          {/* Search History */}
          <div className="space-y-6">
            <ResourceSearchHistory 
              history={searchHistory}
              onSelect={handleHistorySelect}
            />
          </div>
        </div>
      </div>
  )
}
