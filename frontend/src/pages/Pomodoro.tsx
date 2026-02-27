import { useState } from 'react'
import PomodoroTimer from '../components/PomodoroTimer'
import PomodoroStats from '../components/PomodoroStats'
import ForestVisualization from '../components/ForestVisualization'

export default function Pomodoro() {
  const [activeTab, setActiveTab] = useState<'timer' | 'forest' | 'stats'>('timer')

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl sm:text-3xl font-semibold text-surface-800 mb-4 sm:mb-6">番茄专注</h1>

      <div className="mb-4 sm:mb-6 flex flex-wrap gap-2 sm:gap-4 border-b border-surface-200/60 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={() => setActiveTab('timer')}
          className={`px-3 sm:px-4 py-2 font-medium text-sm whitespace-nowrap flex-shrink-0 transition-colors ${
            activeTab === 'timer'
              ? 'text-primary-600 border-b-2 border-primary-500'
              : 'text-surface-400 hover:text-surface-700'
          }`}
        >
          计时器
        </button>
        <button
          onClick={() => setActiveTab('forest')}
          className={`px-3 sm:px-4 py-2 font-medium text-sm whitespace-nowrap flex-shrink-0 transition-colors ${
            activeTab === 'forest'
              ? 'text-primary-600 border-b-2 border-primary-500'
              : 'text-surface-400 hover:text-surface-700'
          }`}
        >
          虚拟森林
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-3 sm:px-4 py-2 font-medium text-sm whitespace-nowrap flex-shrink-0 transition-colors ${
            activeTab === 'stats'
              ? 'text-primary-600 border-b-2 border-primary-500'
              : 'text-surface-400 hover:text-surface-700'
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
