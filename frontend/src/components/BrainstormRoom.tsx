import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../utils/api-client';
import { useNotificationStore, useUserStore } from '../store';

interface RoleMessage {
  role: 'optimist' | 'pessimist' | 'realist' | 'creative';
  content: string;
  timestamp: Date;
}

interface BrainstormSession {
  id: string;
  userId: string;
  topic: string;
  messages: RoleMessage[];
  synthesis?: string;
  recommendation?: string;
  status: 'active' | 'completed';
}

interface BrainstormRoomProps {
  sessionId: string | null;
  onSessionChange: (sessionId: string | null) => void;
}

const ROLE_INFO = {
  optimist: { name: '乐观者', emoji: '😊', color: 'bg-green-100/80 border-green-300/60 shadow-md' },
  pessimist: { name: '悲观者', emoji: '🤔', color: 'bg-red-100/80 border-red-300/60 shadow-md' },
  realist: { name: '现实主义者', emoji: '⚖️', color: 'bg-blue-100/80 border-blue-300/60 shadow-md' },
  creative: { name: '创意者', emoji: '💡', color: 'bg-purple-100/80 border-purple-300/60 shadow-md' }
};

export default function BrainstormRoom({ sessionId, onSessionChange }: BrainstormRoomProps) {
  const [topic, setTopic] = useState('');
  const [session, setSession] = useState<BrainstormSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [discussing, setDiscussing] = useState(false);
  const [synthesizing, setSynthesizing] = useState(false);
  const [deepDiveTopic, setDeepDiveTopic] = useState('');
  const [showDeepDive, setShowDeepDive] = useState(false);

  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
    }
  }, [sessionId]);

  const loadSession = async (id: string) => {
    try {
      const data = await apiClient.get<BrainstormSession>(`/api/v1/brainstorm/sessions/${id}`);
      setSession(data);
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const createSession = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    try {
      const data = await apiClient.post<BrainstormSession>(`/api/v1/brainstorm/sessions`, {
        userId: useUserStore.getState().user?.id || 'demo-user',
        topic: topic.trim()
      });
      setSession(data);
      onSessionChange(data.id);
      setTopic('');
    } catch (error) {
      console.error('Error creating session:', error);
      useNotificationStore.getState().addNotification({ type: 'error', message: '创建会话失败' });
    } finally {
      setLoading(false);
    }
  };

  const startDiscussion = async () => {
    if (!session) return;

    setDiscussing(true);
    try {
      const data = await apiClient.post<BrainstormSession>(
        `/api/v1/brainstorm/sessions/${session.id}/start-discussion`
      );
      setSession(data);
    } catch (error) {
      console.error('Error starting discussion:', error);
      useNotificationStore.getState().addNotification({ type: 'error', message: '开始讨论失败' });
    } finally {
      setDiscussing(false);
    }
  };

  const synthesize = async () => {
    if (!session) return;

    setSynthesizing(true);
    try {
      const data = await apiClient.post<BrainstormSession>(
        `/api/v1/brainstorm/sessions/${session.id}/synthesize`
      );
      setSession(data);
    } catch (error) {
      console.error('Error synthesizing:', error);
      useNotificationStore.getState().addNotification({ type: 'error', message: '综合观点失败' });
    } finally {
      setSynthesizing(false);
    }
  };

  const deepDive = async () => {
    if (!session || !deepDiveTopic.trim()) return;

    setDiscussing(true);
    try {
      await apiClient.post(
        `/api/v1/brainstorm/sessions/${session.id}/deep-dive`,
        {
          focusPoint: deepDiveTopic.trim(),
          previousMessages: session.messages
        }
      );

      // Reload session to get updated messages
      await loadSession(session.id);
      setDeepDiveTopic('');
      setShowDeepDive(false);
    } catch (error) {
      console.error('Error in deep dive:', error);
      useNotificationStore.getState().addNotification({ type: 'error', message: '深度探讨失败' });
    } finally {
      setDiscussing(false);
    }
  };

  const resetSession = () => {
    setSession(null);
    onSessionChange(null);
    setTopic('');
  };

  if (!session) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-white/20"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">开始新的头脑风暴</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              讨论话题
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="输入你想讨论的话题或问题..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={4}
            />
          </div>
          <button
            onClick={createSession}
            disabled={loading || !topic.trim()}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '创建中...' : '创建会话'}
          </button>
        </div>
          </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">讨论话题</h2>
            <p className="text-gray-600">{session.topic}</p>
          </div>
          <button
            onClick={resetSession}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            新建会话
          </button>
        </div>

        {session.messages.length === 0 && (
          <button
            onClick={startDiscussion}
            disabled={discussing}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 transition-colors"
          >
            {discussing ? '讨论中...' : '开始四角讨论'}
          </button>
        )}
      </motion.div>

      <AnimatePresence>
        {session.messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {session.messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-xl border-2 ${ROLE_INFO[message.role].color}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{ROLE_INFO[message.role].emoji}</span>
                  <span className="font-bold text-gray-800">
                    {ROLE_INFO[message.role].name}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {session.messages.length > 0 && !session.synthesis && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 space-y-4 border border-white/20"
        >
          <button
            onClick={synthesize}
            disabled={synthesizing}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
          >
            {synthesizing ? '综合中...' : '综合观点并给出建议'}
          </button>

          <button
            onClick={() => setShowDeepDive(!showDeepDive)}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            深度探讨特定观点
          </button>

          {showDeepDive && (
            <div className="space-y-3 pt-4 border-t">
              <textarea
                value={deepDiveTopic}
                onChange={(e) => setDeepDiveTopic(e.target.value)}
                placeholder="输入想要深入探讨的观点..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows={3}
              />
              <button
                onClick={deepDive}
                disabled={discussing || !deepDiveTopic.trim()}
                className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 transition-colors"
              >
                {discussing ? '探讨中...' : '开始深度探讨'}
              </button>
            </div>
          )}
        </motion.div>
      )}

      {session.synthesis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-50/80 to-orange-50/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border-2 border-yellow-300/50"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">📊 观点综合</h3>
          <p className="text-gray-700 whitespace-pre-wrap mb-6">{session.synthesis}</p>

          {session.recommendation && (
            <>
              <h3 className="text-xl font-bold text-gray-800 mb-4">💡 选题建议</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{session.recommendation}</p>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
