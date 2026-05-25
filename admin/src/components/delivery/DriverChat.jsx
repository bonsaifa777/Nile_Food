import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiMic, FiPhone, FiChevronDown, FiUser, FiClock, FiMapPin, FiCheckCircle, FiShare2 } from 'react-icons/fi';
import { useDriverChat, useDeliveries, useDataService } from '../../hooks/useDataService';

export default function DriverChat() {
  const messages = useDriverChat();
  const deliveries = useDeliveries();
  const DataSvc = useDataService();
  const [input, setInput] = useState('');
  const [activeChat, setActiveChat] = useState(null);
  const [typingCustomer, setTypingCustomer] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeouts = useRef({});

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.from === 'customer' && lastMsg.name !== typingCustomer) {
      setTypingCustomer(lastMsg.name);
      clearTimeout(typingTimeouts.current[lastMsg.name]);
      typingTimeouts.current[lastMsg.name] = setTimeout(() => {
        setTypingCustomer(null);
      }, 3000);
    }
    if (lastMsg && lastMsg.from === 'driver' && Math.random() > 0.6) {
      const active = deliveries.filter(d => d.status !== 'delivered');
      if (active.length > 0) {
        const del = active[Math.floor(Math.random() * active.length)];
        setTimeout(() => {
          setTypingCustomer(del.customer);
          setTimeout(() => {
            setTypingCustomer(null);
          }, 3500);
        }, 2000);
      }
    }
  }, [messages, deliveries]);

  const sendMessage = useCallback(() => {
    if (!input.trim()) return;
    DataSvc.addDriverChatMessage('driver', 'You', input);
    setInput('');
  }, [input, DataSvc]);

  const handleShareETA = useCallback((del) => {
    const eta = Math.floor(Math.random() * 12 + 3);
    DataSvc.shareETA(del.id, eta);
  }, [DataSvc]);

  const handleQuickReply = useCallback((text) => {
    setInput(text);
  }, []);

  const getCustomerStatus = useCallback((customer) => {
    const del = deliveries.find(d => d.customer === customer);
    if (!del) return { label: 'Unknown', color: 'var(--text-muted)' };
    const statusMap = {
      assigned: { label: 'Assigned', color: '#6366f1' },
      pickup_ready: { label: 'Pickup Ready', color: '#8b5cf6' },
      picked_up: { label: 'Picked Up', color: '#06b6d4' },
      on_the_way: { label: 'On The Way', color: '#10b981' },
      arrived: { label: 'Arrived', color: '#34d399' },
      delivered: { label: 'Delivered', color: '#059669' },
    };
    return statusMap[del.status] || { label: del.status, color: 'var(--text-muted)' };
  }, [deliveries]);

  const contactList = deliveries
    .filter(d => d.status !== 'delivered')
    .map(d => ({ name: d.customer, phone: d.phone, order: d.id, address: d.deliveryAddress, status: d.status }));

  const activeCustomer = activeChat || contactList[0]?.name || null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      <div className="lg:col-span-3 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Customer Communication</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {activeCustomer ? `Chatting with ${activeCustomer}` : 'Chat with delivery customers'}
            </p>
          </div>
          {activeCustomer && (() => {
            const contact = contactList.find(c => c.name === activeCustomer);
            return contact ? (
              <motion.a href={`tel:${contact.phone}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}
              >
                <FiPhone size={13} /> Call {activeCustomer.split(' ')[0]}
              </motion.a>
            ) : null;
          })()}
        </div>

        <div className="flex-1 rounded-2xl p-4 mb-3 overflow-y-auto"
          style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)', minHeight: '350px', maxHeight: '400px' }}
        >
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${msg.from === 'driver' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.from === 'system' ? (
                    <div className="w-full text-center py-2">
                      <span className="text-xs px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {msg.message}
                      </span>
                    </div>
                  ) : (
                    <div className={`max-w-[80%] ${msg.from === 'driver' ? '' : ''}`}>
                      <div className={`rounded-2xl px-4 py-2.5 ${
                        msg.from === 'driver' ? 'rounded-tr-md' : 'rounded-tl-md'
                      }`} style={{
                        background: msg.from === 'driver'
                          ? 'linear-gradient(135deg, #06b6d4, #0891b2)'
                          : 'var(--input-bg)',
                      }}>
                        <p className="text-sm" style={{ color: msg.from === 'driver' ? '#fff' : 'var(--text-primary)' }}>
                          {msg.message}
                        </p>
                      </div>
                      <p className="text-[10px] mt-1 px-1" style={{ color: 'var(--text-muted)' }}>
                        {msg.from !== 'driver' && `${msg.name} · `}{msg.time}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {typingCustomer && (
              <motion.div
                key="typing"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex justify-start"
              >
                <div className="rounded-2xl rounded-tl-md px-4 py-3" style={{ background: 'var(--input-bg)' }}>
                  <div className="flex items-center gap-1.5">
                    <motion.span animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                      className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text-muted)' }} />
                    <motion.span animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }}
                      className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text-muted)' }} />
                    <motion.span animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }}
                      className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text-muted)' }} />
                  </div>
                  <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{typingCustomer} is typing...</p>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              className="w-full rounded-xl px-4 py-2.5 text-sm"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--input-text)' }}
            />
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-xl"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text-secondary)' }}
          >
            <FiMic size={16} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}
            onClick={sendMessage}
            className="p-2.5 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
              boxShadow: '0 4px 12px rgba(6,182,212,0.3)',
            }}
          >
            <FiSend size={16} className="text-white" />
          </motion.button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Active Customers</h3>
        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
          {contactList.map((contact, i) => {
            const status = getCustomerStatus(contact.name);
            return (
              <motion.div
                key={contact.order}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                style={{
                  border: `1px solid ${activeCustomer === contact.name ? 'rgba(6,182,212,0.3)' : 'var(--border-color)'}`,
                  background: activeCustomer === contact.name ? 'rgba(6,182,212,0.05)' : 'transparent',
                }}
                onClick={() => setActiveChat(contact.name)}
              >
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
                    style={{
                      background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(34,211,238,0.1))',
                      border: '1px solid rgba(6,182,212,0.2)',
                    }}
                  >
                    {contact.name.charAt(0)}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-black ${
                    contact.status === 'on_the_way' || contact.status === 'arrived' ? 'bg-emerald-400' : 'bg-amber-400'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{contact.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <FiMapPin size={9} style={{ color: status.color }} />
                    <p className="text-[10px] truncate" style={{ color: status.color }}>{status.label}</p>
                  </div>
                </div>
                <motion.a href={`tel:${contact.phone}`} whileHover={{ scale: 1.1 }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}
                >
                  <FiPhone size={13} />
                </motion.a>
              </motion.div>
            );
          })}
          {contactList.length === 0 && (
            <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
              <FiUser size={24} className="mx-auto mb-2 opacity-40" />
              <p className="text-xs">No active customers</p>
            </div>
          )}
        </div>

        <div className="rounded-2xl p-4" style={{
          background: 'linear-gradient(135deg, rgba(6,182,212,0.08), rgba(34,211,238,0.03))',
          border: '1px solid rgba(6,182,212,0.15)',
        }}>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
            <FiShare2 size={13} className="text-cyan-400" /> Share ETA
          </h3>
          <div className="space-y-1.5 mb-3">
            {contactList.slice(0, 3).map((contact) => {
              const del = deliveries.find(d => d.id === contact.order);
              if (!del || del.status === 'delivered') return null;
              return (
                <button key={contact.order}
                  onClick={() => handleShareETA(del)}
                  className="w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-all hover:bg-white/5 flex items-center gap-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <FiMapPin size={10} className="text-cyan-400" />
                  Send ETA to {contact.name.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl p-4" style={{
          background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(251,191,36,0.03))',
          border: '1px solid rgba(245,158,11,0.15)',
        }}>
          <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Quick Replies</h3>
          <div className="space-y-1.5">
            {[
              "I'm on my way! ETA 5 min 🚗",
              "Please provide gate code 🔑",
              "Arrived at your location 📍",
              "Calling for delivery instructions 📞",
              "Leaving now, see you soon! 👋",
              "Delivered! Enjoy your meal 🎉",
            ].map((reply, i) => (
              <button key={i}
                onClick={() => handleQuickReply(reply)}
                className="w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-all hover:bg-white/5"
                style={{ color: 'var(--text-secondary)', border: '1px solid transparent' }}
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
