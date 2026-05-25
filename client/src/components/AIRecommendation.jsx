import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiX } from 'react-icons/fi';
import { FiSearch, FiMessageSquare, FiZap } from 'react-icons/fi';

const sampleRecommendations = [
  { id: 1, name: 'Spicy Burger', category: 'Burgers', price: 12.99, rating: 4.8, emoji: '🍔', reason: 'Popular right now' },
  { id: 2, name: 'Margherita Pizza', category: 'Pizza', price: 15.99, rating: 4.9, emoji: '🍕', reason: 'Based on your taste' },
  { id: 3, name: 'Sushi Platter', category: 'Japanese', price: 24.99, rating: 4.7, emoji: '🍣', reason: 'Trending today' },
  { id: 4, name: 'Fresh Smoothie', category: 'Drinks', price: 6.99, rating: 4.6, emoji: '🥤', reason: 'Perfect for today' },
];

export default function AIRecommendation() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi! What are you craving today? I can help you find the perfect meal.' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!inputMessage.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: inputMessage }]);
    setInputMessage('');
    setIsTyping(true);
    
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: 'Great choice! Based on your preference, I recommend our featured dishes. Check out the recommendations below!' }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <section className="py-24 bg-gradient-to-b from-indigo-50/50 to-white dark:from-slate-900 dark:to-slate-950 relative overflow-hidden">
      {/* Background elements */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-200/20 dark:bg-indigo-800/10 rounded-full blur-3xl"
      />
      
      <div className="w-full px-4 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-semibold text-sm mb-6"
          >
            <FiZap size={16} />
            AI-Powered
          </motion.div>
          <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-gray-900 via-indigo-700 to-gray-900 dark:from-white dark:via-indigo-400 dark:to-white bg-clip-text text-transparent">
            Smart Recommendations
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Our AI learns your preferences and suggests dishes you will love
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Search & Recommendations */}
          <div className="lg:col-span-2 space-y-8">
            {/* Search bar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative max-w-xl mx-auto lg:mx-0">
                <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ask AI: What should I eat today?"
                  className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white placeholder-gray-400 font-medium"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-sm"
                >
                  Ask AI
                </motion.button>
              </div>
            </motion.div>

            {/* Recommendation cards */}
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid sm:grid-cols-2 gap-6"
            >
              {sampleRecommendations.map((item, index) => (
                <motion.div
                  key={item.id}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    show: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative bg-white dark:bg-slate-800/80 rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-3xl">
                        {item.emoji}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{item.category}</p>
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          whileInView={{ opacity: 1, width: 'auto' }}
                          className="inline-block px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold"
                        >
                          {item.reason}
                        </motion.span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-slate-700/50">
                      <div className="flex items-center gap-2">
                        <FiStar className="w-4 h-4 text-indigo-500 fill-indigo-500" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{item.rating}</span>
                      </div>
                      <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">${item.price}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Chatbot Preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-2xl overflow-hidden sticky top-32">
              {/* Chat header */}
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <FiMessageSquare size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Nile Food AI</h3>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-xs text-indigo-200">Online</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(!isChatOpen)} className="text-white/80 hover:text-white">
                  {isChatOpen ? <FiX size={20} /> : <FiArrowRight size={20} />}
                </button>
              </div>

              {/* Chat messages */}
              <AnimatePresence>
                {isChatOpen && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 space-y-4 max-h-80 overflow-y-auto bg-gray-50 dark:bg-slate-900/50">
                      {messages.map((msg, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                            msg.role === 'user'
                              ? 'bg-indigo-600 text-white rounded-br-md'
                              : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 shadow-sm rounded-bl-md'
                          }`}>
                            {msg.text}
                          </div>
                        </motion.div>
                      ))}
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex justify-start"
                        >
                          <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                            <div className="flex gap-1.5">
                              <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity }} className="w-2 h-2 bg-gray-400 rounded-full" />
                              <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                              <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Chat input */}
                    <div className="p-4 border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                          placeholder="Type a message..."
                          className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSend}
                          className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold"
                        >
                          Send
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!isChatOpen && (
                <div className="p-5 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Ask our AI for personalized food recommendations</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsChatOpen(true)}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors"
                  >
                    Start Chat
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
