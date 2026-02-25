import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import apiClient from '../utils/api-client';
import { useNotificationStore, useUserStore } from '../store';

interface BrainstormSession {
  id: string;
  userId: string;
  topic: string;
  messages: any[];
  synthesis?: string;
  recommendation?: string;
  status: 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
}

interface BrainstormHistoryProps {
  onSelectSession: (sessionId: string) => void;
}

export default function BrainstormHistory({ onSelectSession }: BrainstormHistoryProps) {
  const [sessions, setSessions] = useState<BrainstormSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const userId = useUserStore.getState().user?.id || 'demo-user';
      const data = await apiClient.get<BrainstormSession[]>(
        `/api/v1/brainstorm/users/${userId}/sessions`
      );
      setSessions(data);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!confirm('确定要删除这个会话吗？')) return;

    try {
      await apiClient.delete(`/api/v1/brainstorm/sessions/${sessionId}`);
      setSessions(sessions.filter(s => s.id !== sessionId));
    } catch (error) {
      console.error('Error deleting session:', error);
      useNotificationStore.getState().addNotification({ type: 'error', message: '删除失败' });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">加载中...</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <p className="text-gray-600">还没有头脑风暴记录</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session, index) => (
        <motion.div
          key={session.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{session.topic}</h3>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>💬 {session.messages.length} 条消息</span>
                <span>
                  {session.status === 'completed' ? '✅ 已完成' : '🔄 进行中'}
                </span>
                <span>
                  📅 {new Date(session.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onSelectSession(session.id)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                查看
              </button>
              <button
                onClick={() => deleteSession(session.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                删除
              </button>
            </div>
          </div>

          {session.synthesis && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-gray-700 line-clamp-3">{session.synthesis}</p>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
