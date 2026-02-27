import React from 'react'
import RelaxationChat from '../components/RelaxationChat'

const Relaxation: React.FC = () => {
  // In a real app, this would come from authentication context
  const userId = 'user_demo_001'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-surface-800">心灵放松</h1>
        <p className="mt-1.5 text-surface-400 text-sm sm:text-base">
          学习累了？和AI朋友聊聊天，放松一下心情吧
        </p>
      </div>

      <div className="glass rounded-2xl shadow-card overflow-hidden" style={{ height: 'calc(100vh - 250px)' }}>
        <RelaxationChat userId={userId} />
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="text-xl">💬</span>
            <h3 className="text-sm font-semibold text-surface-700">友好对话</h3>
          </div>
          <p className="text-xs text-surface-400 leading-relaxed">
            温暖友善的AI朋友，随时倾听你的心声
          </p>
        </div>

        <div className="glass rounded-2xl p-4">
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="text-xl">🎯</span>
            <h3 className="text-sm font-semibold text-surface-700">情感识别</h3>
          </div>
          <p className="text-xs text-surface-400 leading-relaxed">
            智能识别你的情绪状态，给予针对性回应
          </p>
        </div>

        <div className="glass rounded-2xl p-4">
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="text-xl">💡</span>
            <h3 className="text-sm font-semibold text-surface-700">放松建议</h3>
          </div>
          <p className="text-xs text-surface-400 leading-relaxed">
            提供实用的压力缓解和放松建议
          </p>
        </div>
      </div>
    </div>
  )
}

export default Relaxation
