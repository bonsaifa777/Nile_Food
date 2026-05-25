import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiMic, FiPaperclip, FiChevronDown, FiUser, FiCircle } from 'react-icons/fi';
import { useChat, useDataService, useOrders } from '../../hooks/useDataService';
import { computeStaffPerformance } from '../../services/analytics';

const staffProfiles = [
  { id: 1, name: 'Omar', role: 'Head Chef', avatar: '👨‍🍳', online: true },
  { id: 2, name: 'Layla', role: 'Sous Chef', avatar: '👩‍🍳', online: true },
  { id: 3, name: 'Hassan', role: 'Line Cook', avatar: '👨‍🍳', online: true },
  { id: 4, name: 'Karim', role: 'Pastry Chef', avatar: '👨‍🍳', online: false },
  { id: 5, name: 'Nadia', role: 'Kitchen Manager', avatar: '👩‍💼', online: true },
];

export default function StaffChat({ currentUser = 'You' }) {
  const messages = useChat();
  const DataSvc = useDataService();
  const orders = useOrders();
  const [input, setInput] = useState('');
  const [showStaffList, setShowStaffList] = useState(true);
  const messagesEndRef = useRef(null);

  const staffPerformance = computeStaffPerformance(orders);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    DataSvc.addChatMessage(currentUser, 'Kitchen Staff', input);
    setInput('');
  };

  const recentCount = messages.filter(m => m.user !== 'System').slice(-3).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      <div className="lg:col-span-3 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Staff Communication</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Real-time kitchen chat</p>
          </div>
          <div className="flex items-center gap-2">
            {recentCount > 0 && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20"
              >
                <FiCircle size={8} className="text-rose-400" />
                <span className="text-xs text-rose-400 font-medium">{recentCount} recent</span>
              </motion.div>
            )}
          </div>
        </div>

        <div
          className="flex-1 rounded-2xl p-4 mb-3 overflow-y-auto"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--border-color)',
            minHeight: '350px',
            maxHeight: '400px',
          }}
        >
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className={`flex ${msg.user === currentUser ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.type === 'system' ? (
                    <div className="w-full text-center py-2">
                      <span className="text-xs px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {msg.message}
                      </span>
                    </div>
                  ) : (
                    <div className={`max-w-[80%] ${msg.user === currentUser ? 'order-1' : ''}`}>
                      <div
                        className={`rounded-2xl px-4 py-2.5 ${
                          msg.user === currentUser
                            ? 'rounded-tr-md'
                            : 'rounded-tl-md'
                        }`}
                        style={{
                          background: msg.user === currentUser
                            ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                            : 'var(--input-bg)',
                        }}
                      >
                        {msg.user !== currentUser && msg.user !== 'System' && (
                          <p className="text-[11px] font-semibold mb-0.5" style={{ color: 'var(--primary)' }}>
                            {msg.user}
                          </p>
                        )}
                        <p className="text-sm" style={{ color: msg.user === 'You' ? '#fff' : 'var(--text-primary)' }}>
                          {msg.message}
                        </p>
                      </div>
                      <p className="text-[10px] mt-1 px-1" style={{ color: 'var(--text-muted)' }}>
                        {msg.user !== currentUser && msg.user !== 'System' ? `${msg.role} · ` : ''}{msg.time}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-xl transition-all"
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--input-border)',
              color: 'var(--text-secondary)',
            }}
          >
            <FiPaperclip size={16} />
          </motion.button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              className="w-full rounded-xl px-4 py-2.5 text-sm"
              style={{
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                color: 'var(--input-text)',
              }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-xl transition-all"
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--input-border)',
              color: 'var(--text-secondary)',
            }}
          >
            <FiMic size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={sendMessage}
            className="p-2.5 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
            }}
          >
            <FiSend size={16} className="text-white" />
          </motion.button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Staff Online</h3>
          <button onClick={() => setShowStaffList(!showStaffList)}>
            <FiChevronDown size={14} className={`transition-transform ${showStaffList ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        <AnimatePresence>
          {showStaffList && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              {staffProfiles.map((staff, i) => (
                <motion.div
                  key={staff.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:bg-white/[0.03]"
                  style={{ border: '1px solid var(--border-color)' }}
                >
                  <div className="relative">
                    <span className="text-xl">{staff.avatar}</span>
                    {staff.online && (
                      <motion.span
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-emerald-400 bg-emerald-400"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{staff.name}</p>
                    <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{staff.role}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="rounded-2xl p-4 mt-4" style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(52,211,153,0.03))',
          border: '1px solid rgba(16,185,129,0.15)',
        }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Shift Overview</h3>
          {staffPerformance.length === 0 ? (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No performance data yet</p>
          ) : (
            <div className="space-y-3">
              {staffPerformance.slice(0, 3).map((staff, i) => (
                <div key={staff.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{
                        background: `linear-gradient(135deg, ${['#6366f1', '#10b981', '#f59e0b'][i]}20, ${['#8b5cf6', '#34d399', '#fbbf24'][i]}10)`,
                        border: `1px solid ${['#6366f1', '#10b981', '#f59e0b'][i]}30`,
                      }}
                    >
                      {staff.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{staff.name}</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{staff.completed} orders</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400">{staff.rating}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
