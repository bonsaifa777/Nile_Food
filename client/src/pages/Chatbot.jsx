import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { FiSend, FiX, FiMessageCircle, FiShoppingCart, FiMapPin, FiClock, FiSearch } from 'react-icons/fi';

const predefinedResponses = {
  greeting: "Hello! I'm Nile's AI assistant. How can I help you today?",
  menu: "You can browse our menu by clicking on 'Menu' above. We have a wide variety of dishes including Breakfast, Lunch, Dinner, Snacks, Beverages, and more!",
  delivery: "We offer delivery within the city. Delivery fee is ETB 50, and orders typically arrive in 30-45 minutes. You can track your order in real-time!",
  payment: "We accept multiple payment methods:\n- Cash on delivery\n- Chapa (online payment)\n- Bank transfer",
  track: "To track your order, go to the Orders section and click on your active order. You can see real-time status updates there.",
  hours: "We're open daily from 8:00 AM to 10:00 PM. Delivery is available during these hours.",
  contact: "You can reach us at:\n- Phone: +251-XXX-XXX-XXX\n- Email: support@nilefood.com\n- Live chat (24/7)",
  default: "I'm not sure about that. Would you like to:\n1. Browse our menu\n2. Track your order\n3. Contact support"
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ text: predefinedResponses.greeting, sender: 'bot', time: new Date() }]);
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

  const getBotResponse = async (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return predefinedResponses.greeting;
    }
    if (input.includes('menu') || input.includes('food') || input.includes('order')) {
      return predefinedResponses.menu;
    }
    if (input.includes('delivery') || input.includes('deliver') || input.includes('home')) {
      return predefinedResponses.delivery;
    }
    if (input.includes('track') || input.includes('status')) {
      return predefinedResponses.track;
    }
    if (input.includes('pay') || input.includes('money') || input.includes('chapa')) {
      return predefinedResponses.payment;
    }
    if (input.includes('hour') || input.includes('open') || input.includes('time')) {
      return predefinedResponses.hours;
    }
    if (input.includes('contact') || input.includes('phone') || input.includes('email')) {
      return predefinedResponses.contact;
    }
    if (input.includes('thanks') || input.includes('thank')) {
      return "You're welcome! Is there anything else I can help you with?";
    }
    if (input.includes('bye') || input.includes('goodbye')) {
      return "Goodbye! Thank you for chatting with Nile Food. Have a great day!";
    }
    
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/foods/search?q=${encodeURIComponent(userInput)}`);
      if (data.data && data.data.length > 0) {
        const foundFood = data.data[0];
        return `I found ${foundFood.name}! It costs ETB ${foundFood.price}. Would you like to add it to your cart?`;
      }
    } catch (error) {
      console.log('Search failed');
    }
    
    return predefinedResponses.default;
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
      setMessages(prev => [...prev, { text: "Sorry, I couldn't process your request. Please try again.", sender: 'bot', time: new Date() }]);
      setLoading(false);
    }
  };

  const handleSuggestion = async (action) => {
    const text = suggestions.find(s => s.action === action)?.label || '';
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
                  <h3 className="font-semibold">Nile AI</h3>
                  <p className="text-xs text-green-400">Online</p>
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
                      {sug.label}
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
                  placeholder="Type your message..."
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