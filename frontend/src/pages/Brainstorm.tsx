import { useState } from 'react';
import { motion } from 'framer-motion';
import BrainstormRoom from '../components/BrainstormRoom';
import BrainstormHistory from '../components/BrainstormHistory';

export default function Brainstorm() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="px-4 py-6 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2">
            🧠 AI头脑风暴助手
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            四个AI角色与你一起进行头脑风暴，从多角度分析问题
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-4 mb-6">
          <button
            onClick={() => setShowHistory(false)}
            className={`px-4 sm:px-6 py-2.5 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
              !showHistory
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            头脑风暴室
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className={`px-4 sm:px-6 py-2.5 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
              showHistory
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            历史记录
          </button>
        </div>

        {showHistory ? (
          <BrainstormHistory
            onSelectSession={(sessionId) => {
              setActiveSessionId(sessionId);
              setShowHistory(false);
            }}
          />
        ) : (
          <BrainstormRoom
            sessionId={activeSessionId}
            onSessionChange={setActiveSessionId}
          />
        )}
      </motion.div>
    </div>
  );
}
