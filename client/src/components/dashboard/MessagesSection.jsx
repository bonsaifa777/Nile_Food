import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { FiMail, FiMessageSquare, FiClock, FiUser, FiTrash2, FiInbox, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

export default function MessagesSection() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const { user } = useAuth();

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/contact/me');
      setMessages(res.data.data || []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Inbox</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {messages.filter(m => !m.read).length > 0
              ? `${messages.filter(m => !m.read).length} unread messages`
              : 'All caught up'}
          </p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={fetchMessages} className="p-2 rounded-xl bg-gray-100 dark:bg-slate-700/50 hover:bg-gray-200 dark:hover:bg-slate-600/50 transition-colors">
          <FiRefreshCw size={16} className="text-gray-500" />
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-2">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-gray-100 dark:bg-slate-700/50 animate-pulse" />
            ))
          ) : messages.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 text-gray-400">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-slate-700/50 flex items-center justify-center">
                <FiInbox className="text-3xl" />
              </motion.div>
              <p className="text-lg font-medium text-gray-600 dark:text-gray-300">No messages yet</p>
              <p className="text-sm mt-1">Messages from the restaurant will appear here</p>
            </motion.div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-2">
              {messages.map((msg, i) => (
                <motion.div
                  key={msg._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setSelected(selected?._id === msg._id ? null : msg)}
                  className={`rounded-2xl p-4 cursor-pointer transition-all duration-200 ${
                    selected?._id === msg._id
                      ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                      : 'bg-white dark:bg-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-700/50 border border-gray-100 dark:border-slate-700/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      !msg.read ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-400'
                    }`}>
                      <FiUser size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 mb-0.5">
                        <h3 className={`text-sm truncate ${!msg.read ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-600 dark:text-gray-300'}`}>
                          {msg.subject}
                        </h3>
                        <div className="flex items-center gap-2 shrink-0">
                          {!msg.read && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                          <span className="text-xs text-gray-400"><FiClock size={10} className="inline mr-1" />{new Date(msg.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mb-0.5">From: {msg.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{msg.message}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        <div>
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-700/30 overflow-hidden"
              >
                <div className="p-5 border-b border-gray-100 dark:border-slate-700/30">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">Message Details</h3>
                  </div>
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-slate-700/30">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white">
                      <FiUser size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{selected.name}</p>
                      <p className="text-xs text-gray-400">{selected.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-3">
                    <FiClock size={11} />
                    {new Date(selected.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Subject</label>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-700/30 rounded-xl px-4 py-3">
                      <FiMessageSquare size={14} className="text-gray-400 shrink-0" />
                      {selected.subject}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Message</label>
                    <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-700/30 rounded-xl p-4">
                      <p className="whitespace-pre-wrap leading-relaxed">{selected.message}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-700/30 p-10 text-center h-full flex flex-col items-center justify-center"
              >
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-slate-700/50 flex items-center justify-center">
                  <FiMail className="text-3xl text-gray-400" />
                </motion.div>
                <p className="text-gray-400 text-sm">Select a message to read</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}