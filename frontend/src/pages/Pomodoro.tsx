import { useState } from 'react'
import PomodoroTimer from '../components/PomodoroTimer'
import PomodoroStats from '../components/PomodoroStats'
import ForestVisualization from '../components/ForestVisualization'

export default function Pomodoro() {
  const [activeTab, setActiveTab] = useState<'timer' | 'forest' | 'stats'>('timer')

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">AI番茄钟</h1>
      
      <div className="mb-4 sm:mb-6 flex flex-wrap gap-2 sm:gap-4 border-b overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={() => setActiveTab('timer')}
          className={`px-3 sm:px-4 py-2.5 sm:py-2 font-medium text-sm sm:text-base whitespace-nowrap flex-shrink-0 ${
            activeTab === 'timer'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          计时器
        </button>
        <button
          onClick={() => setActiveTab('forest')}
          className={`px-3 sm:px-4 py-2.5 sm:py-2 font-medium text-sm sm:text-base whitespace-nowrap flex-shrink-0 ${
            activeTab === 'forest'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          虚拟森林
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-3 sm:px-4 py-2.5 sm:py-2 font-medium text-sm sm:text-base whitespace-nowrap flex-shrink-0 ${
            activeTab === 'stats'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          统计数据
        </button>
      </div>

      {activeTab === 'timer' && <PomodoroTimer />}
      {activeTab === 'forest' && <ForestVisualization />}
      {activeTab === 'stats' && <PomodoroStats />}
    </div>
  )
}
