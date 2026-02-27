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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-surface-800 mb-6 sm:mb-8">作文批改</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Submit and List */}
          <div className="lg:col-span-1 space-y-5">
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
              <div className="glass rounded-2xl shadow-card p-8 text-center text-surface-400">
                <p>请选择一篇作文查看批改结果</p>
              </div>
            )}
          </div>
        </div>
      </div>
  )
}
