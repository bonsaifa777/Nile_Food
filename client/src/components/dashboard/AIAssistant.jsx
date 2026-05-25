import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { FiMessageCircle, FiX, FiSend, FiUser, FiCpu } from 'react-icons/fi';

const suggestions = ['Track my order', 'Recommend dishes', 'My loyalty points', 'Nearby restaurants'];

export default function AIAssistant() {
  const { darkMode } = useTheme();
  const d = darkMode;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hi! I'm your AI assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: "I'll help you with that! Our team will get back to you shortly."
      }]);
    }, 1000);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-80 md:w-96 z-50"
          >
            <div className={`rounded-3xl overflow-hidden backdrop-blur-xl ${
              d ? 'bg-slate-900/80 border border-white/10' : 'bg-white/95 border border-gray-200/60 shadow-2xl'
            }`}>
              <div className={`p-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-b ${d ? 'border-white/10' : 'border-gray-200'} flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                    <FiCpu className="text-white" size={16} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${d ? 'text-white' : 'text-gray-900'}`}>AI Assistant</p>
                    <p className="text-xs text-green-500">Online</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  d ? 'glass hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'
                }`}>
                  <FiX className={d ? 'text-white/70' : 'text-gray-500'} size={16} />
                </button>
              </div>

              <div className={`h-72 overflow-y-auto p-4 space-y-3 ${d ? '' : 'bg-gray-50/50'}`}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-1 ${
                        msg.role === 'ai' ? 'bg-indigo-500/20' : 'bg-indigo-500'
                      }`}>
                        {msg.role === 'ai' ? (
                          <FiCpu size={12} className="text-indigo-400" />
                        ) : (
                          <FiUser size={12} className="text-white" />
                        )}
                      </div>
                      <div className={`p-3 rounded-2xl text-sm ${
                        msg.role === 'user'
                          ? 'bg-indigo-500 text-white rounded-tr-sm'
                          : d
                            ? 'glass rounded-tl-sm text-white/80'
                            : 'bg-white border border-gray-200 rounded-tl-sm text-gray-700'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className={`p-3 border-t ${d ? 'border-white/10' : 'border-gray-200'}`}>
                {messages.length === 1 && (
                  <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                    {suggestions.map(s => (
                      <button
                        key={s}
                        onClick={() => { setInput(s); }}
                        className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
                          d ? 'glass text-white/60 hover:text-white hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm focus:outline-none border ${
                      d ? 'glass text-white placeholder-white/30 border-white/10' : 'bg-gray-100 text-gray-900 placeholder-gray-400 border-gray-200'
                    }`}
                  />
                  <button
                    onClick={handleSend}
                    className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                  >
                    <FiSend className="text-white" size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 transition-shadow"
      >
        {isOpen ? <FiX className="text-white" size={22} /> : <FiMessageCircle className="text-white" size={22} />}
      </motion.button>
    </>
  );
}
