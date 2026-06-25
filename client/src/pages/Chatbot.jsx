import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { FiSend, FiX, FiMessageCircle, FiShoppingCart, FiMapPin, FiClock, FiSearch } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

export default function Chatbot() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => [{ text: t('chatbot.greeting'), sender: 'bot', time: new Date() }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const { getTotal, cart } = useCart();

  const suggestions = [
    { label: "View Menu", action: "menu" },
    { label: "Delivery Info", action: "delivery" },
    { label: "Track Order", action: "track" },
    { label: "Payment Methods", action: "payment" },
    { label: "Contact", action: "contact" }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sugKeys = {
    menu: 'chatbot.viewMenu',
    delivery: 'chatbot.deliveryInfo',
    track: 'chatbot.trackOrder',
    payment: 'chatbot.paymentMethods',
    contact: 'chatbot.contact',
  };

  const getBotResponse = async (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return t('chatbot.greeting');
    }
    if (input.includes('menu') || input.includes('food') || input.includes('order')) {
      return t('chatbot.menuResponse');
    }
    if (input.includes('delivery') || input.includes('deliver') || input.includes('home')) {
      return t('chatbot.deliveryResponse');
    }
    if (input.includes('track') || input.includes('status')) {
      return t('chatbot.trackResponse');
    }
    if (input.includes('pay') || input.includes('money') || input.includes('chapa')) {
      return t('chatbot.paymentResponse');
    }
    if (input.includes('hour') || input.includes('open') || input.includes('time')) {
      return t('chatbot.hoursResponse');
    }
    if (input.includes('contact') || input.includes('phone') || input.includes('email')) {
      return t('chatbot.contactResponse');
    }
    if (input.includes('thanks') || input.includes('thank')) {
      return t('chatbot.youreWelcome');
    }
    if (input.includes('bye') || input.includes('goodbye')) {
      return t('chatbot.goodbye');
    }
    
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/foods/search?q=${encodeURIComponent(userInput)}`);
      if (data.data && data.data.length > 0) {
        const foundFood = data.data[0];
        return t('chatbot.foundFood', { name: foundFood.name, price: foundFood.price });
      }
    } catch (error) {
      console.log('Search failed');
    }
    
    return t('chatbot.defaultResponse');
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = { text: input, sender: 'user', time: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setShowSuggestions(false);
    setLoading(true);

    try {
      const response = await getBotResponse(input);
      setTimeout(() => {
        setMessages(prev => [...prev, { text: response, sender: 'bot', time: new Date() }]);
        setLoading(false);
      }, 500);
    } catch (error) {
      setMessages(prev => [...prev, { text: t('chatbot.error'), sender: 'bot', time: new Date() }]);
      setLoading(false);
    }
  };

  const handleSuggestion = async (action) => {
    const text = t(sugKeys[action]) || '';
    setInput(text);
    await handleSend();
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-primary-500/30 z-50"
      >
        <FiMessageCircle size={24} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-20 right-6 w-96 h-[500px] glass-card flex flex-col z-50"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-lg">🤖</span>
                </div>
                <div>
                  <h3 className="font-semibold">{t('chatbot.title')}</h3>
                  <p className="text-xs text-green-400">{t('chatbot.online')}</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <FiX size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.sender === 'user' 
                      ? 'bg-primary-500 text-white' 
                      : 'glass'
                  }`}>
                    <p className="text-sm whitespace-pre-line">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-white/70' : 'text-white/50'}`}>
                      {formatTime(msg.time)}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="glass rounded-2xl px-4 py-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {showSuggestions && messages.length <= 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-wrap gap-2 mt-4"
                >
                  {suggestions.map(sug => (
                    <button
                      key={sug.action}
                      onClick={() => handleSuggestion(sug.action)}
                      className="px-3 py-1 text-sm glass rounded-full hover:bg-primary-500 transition-colors"
                    >
                      {t(sugKeys[sug.action])}
                    </button>
                  ))}
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t('chatbot.inputPlaceholder')}
                  className="flex-1 input-glass text-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="btn-primary px-4 disabled:opacity-50"
                >
                  <FiSend size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}