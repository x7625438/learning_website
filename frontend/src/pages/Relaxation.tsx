import React from 'react'
import RelaxationChat from '../components/RelaxationChat'

const Relaxation: React.FC = () => {
  // In a real app, this would come from authentication context
  const userId = 'user_demo_001'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">AI精神放松助手</h1>
        <p className="mt-2 text-gray-600">
          学习累了？和AI朋友聊聊天，放松一下心情吧 😊
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 250px)' }}>
        <RelaxationChat userId={userId} />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">💬</span>
            <h3 className="font-semibold text-gray-900">友好对话</h3>
          </div>
          <p className="text-sm text-gray-600">
            温暖友善的AI朋友，随时倾听你的心声
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">🎯</span>
            <h3 className="font-semibold text-gray-900">情感识别</h3>
          </div>
          <p className="text-sm text-gray-600">
            智能识别你的情绪状态，给予针对性回应
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">💡</span>
            <h3 className="font-semibold text-gray-900">放松建议</h3>
          </div>
          <p className="text-sm text-gray-600">
            提供实用的压力缓解和放松建议
          </p>
        </div>
      </div>
    </div>
  )
}

export default Relaxation
