import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiSend, FiMessageSquare, FiChevronLeft, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { fetchChannels, getOrCreateRoom, fetchRoomMessages, sendMessage, markRoomRead } from '../../services/chatApi';

const channelIcons = {
  cashier_kitchen: { label: 'Kitchen Chat', color: 'from-emerald-500 to-teal-500' },
  admin_kitchen: { label: 'Admin & Kitchen', color: 'from-indigo-500 to-purple-500' },
  admin_driver: { label: 'Drivers Chat', color: 'from-amber-500 to-orange-500' },
  cashier_admin: { label: 'Admin Chat', color: 'from-rose-500 to-pink-500' },
  customer_cashier: { label: 'Customer Support', color: 'from-sky-500 to-cyan-500' },
  customer_admin: { label: 'Customer Support', color: 'from-sky-500 to-cyan-500' }
};

export default function CashierChat() {
  const { user } = useAuth();
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { loadChannels(); }, []);

  useEffect(() => {
    if (!activeRoom) return;
    const interval = setInterval(async () => {
      try {
        const msgs = await fetchRoomMessages(activeRoom._id, { limit: 100 });
        setMessages(msgs.messages || []);
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [activeRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChannels = async () => {
    setLoading(true);
    try {
      const res = await fetchChannels();
      setChannels(res || []);
    } catch {
      toast.error('Failed to load channels');
    } finally {
      setLoading(false);
    }
  };

  const selectChannel = async (channel) => {
    setSelectedChannel(channel);
    setMessages([]);
    try {
      const room = await getOrCreateRoom(channel.channel);
      setActiveRoom(room);
      const msgs = await fetchRoomMessages(room._id, { limit: 100 });
      setMessages(msgs.messages || []);
      await markRoomRead(room._id);
    } catch {
      toast.error('Failed to open channel');
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !activeRoom) return;
    setSending(true);
    try {
      await sendMessage(activeRoom._id, input.trim());
      setInput('');
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-7rem)] gap-4">
        <div className="w-72 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse border border-gray-200 dark:border-gray-700" />
        <div className="flex-1 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse border border-gray-200 dark:border-gray-700" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4">
      <div className="w-72 shrink-0 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-bold text-gray-900 dark:text-white">Channels</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{channels.length} available</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {channels.map((ch) => {
            const config = channelIcons[ch.channel] || { label: ch.channel, color: 'from-gray-500 to-gray-600' };
            return (
              <button
                key={ch.channel}
                onClick={() => selectChannel(ch)}
                className={`w-full p-3 rounded-xl text-left transition-all ${
                  selectedChannel?.channel === ch.channel
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800/50'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    <FiMessageSquare size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{config.label}</p>
                    {ch.room?.lastMessage && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{ch.room.lastMessage.senderName}: {ch.room.lastMessage.content}</p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
        {!selectedChannel ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <FiMessageSquare size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">Select a channel to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${channelIcons[selectedChannel.channel]?.color || 'from-gray-500 to-gray-600'} flex items-center justify-center text-white`}>
                <FiMessageSquare size={18} />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white">{channelIcons[selectedChannel.channel]?.label || selectedChannel.channel}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">{activeRoom?._id ? 'Connected' : 'Connecting...'}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p className="text-sm">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={msg._id || i} className={`flex ${msg.sender?._id === user?._id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-2xl ${
                      msg.sender?._id === user?._id
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-br-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
                    }`}>
                      {msg.sender?._id !== user?._id && (
                        <p className="text-xs font-medium opacity-70 mb-1">{msg.senderName || msg.sender?.name || 'Unknown'}</p>
                      )}
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${msg.sender?._id === user?._id ? 'text-white/60' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 rounded-xl px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white outline-none focus:border-indigo-500 transition-all"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-600/25"
                >
                  <FiSend size={16} /> Send
                </motion.button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
