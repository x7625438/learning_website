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
          <h1 className="text-2xl sm:text-3xl font-semibold text-surface-800 mb-1.5">
            头脑风暴
          </h1>
          <p className="text-surface-400 text-sm sm:text-base">
            四个AI角色与你一起进行头脑风暴，从多角度分析问题
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
          <button
            onClick={() => setShowHistory(false)}
            className={`px-4 sm:px-5 py-2 rounded-xl text-sm font-medium transition-all ${
              !showHistory
                ? 'bg-primary-500 text-white shadow-soft-sm'
                : 'glass text-surface-500 hover:text-surface-700'
            }`}
          >
            头脑风暴室
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className={`px-4 sm:px-5 py-2 rounded-xl text-sm font-medium transition-all ${
              showHistory
                ? 'bg-primary-500 text-white shadow-soft-sm'
                : 'glass text-surface-500 hover:text-surface-700'
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
