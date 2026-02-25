import { useState } from 'react'
import EssaySubmit from '../components/EssaySubmit'
import EssayList from '../components/EssayList'
import EssayGrading from '../components/EssayGrading'

export default function Essays() {
  const [selectedEssayId, setSelectedEssayId] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleEssaySubmitted = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleEssaySelected = (essayId: string) => {
    setSelectedEssayId(essayId)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">AI作文批改助手</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Submit and List */}
          <div className="lg:col-span-1 space-y-6">
            <EssaySubmit onEssaySubmitted={handleEssaySubmitted} />
            <EssayList 
              refreshTrigger={refreshTrigger}
              onEssaySelected={handleEssaySelected}
              selectedEssayId={selectedEssayId}
            />
          </div>

          {/* Right column: Grading */}
          <div className="lg:col-span-2">
            {selectedEssayId ? (
              <EssayGrading essayId={selectedEssayId} />
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                <p>请选择一篇作文查看批改结果</p>
              </div>
            )}
          </div>
        </div>
      </div>
  )
}
