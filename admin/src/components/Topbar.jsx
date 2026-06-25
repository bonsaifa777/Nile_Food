import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiBell, FiSearch, FiMoon, FiSun, FiX, FiShoppingBag, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { DataService } from '../services/dataService';
import { EventBus, Events } from '../services/eventBus';

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
}

export default function Topbar({ toggleSidebar, sidebarOpen }) {
  const { darkMode, toggleDarkMode } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const notifRef = useRef();
  const notifCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const unsub = EventBus.on(Events.NOTIFICATION_SENT, (notifs) => {
      const latest = notifs[0];
      if (latest && !notifications.some(n => n.id === latest.id)) {
        setNotifications(prev => {
          if (prev.some(n => n.id === latest.id)) return prev;
          return [{ id: latest.id, message: latest.message, type: latest.type, time: latest.time, read: false }, ...prev].slice(0, 50);
        });
      }
    });
    return unsub;
  }, [notifications]);

  useEffect(() => {
    if (!import.meta.env.DEV && !import.meta.env.VITE_LAN_MODE) return;

    let socket;
    (async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      const { io } = await import('socket.io-client');
      socket = io(import.meta.env.DEV ? 'http://localhost:5002' : window.location.origin, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });

      socket.on('new_order', (order) => {
        addNotif(`New order ${order?.orderId || ''} received`, 'new_order');
        DataService.addNotification(`New order ${order?.orderId || ''} received`, 'order', true);
        playNotificationSound();
      });

      socket.on('notification', (notif) => {
        addNotif(notif.message || 'Order update received', notif.type || 'order_status');
        DataService.addNotification(notif.message || 'Order update received', 'order', true);
        playNotificationSound();
      });

      socket.on('order_update', (order) => {
        if (order?.orderId) {
          addNotif(`Order #${order.orderId} updated`, 'order_update');
          DataService.addNotification(`Order #${order.orderId} updated`, 'order', true);
        }
        playNotificationSound();
      });
    })();

    return () => socket?.disconnect();
  }, []);

  const addNotif = useCallback((message, type) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setNotifications(prev => [{ id: Date.now(), message, type, time, read: false }, ...prev].slice(0, 50));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'new_order': return <FiShoppingBag size={14} />;
      case 'order_status':
      case 'order_update': return <FiCheckCircle size={14} />;
      default: return <FiBell size={14} />;
    }
  };

  const getIconBg = (type) => {
    switch (type) {
      case 'new_order': return 'bg-blue-500/20 text-blue-400';
      case 'order_status':
      case 'order_update': return 'bg-emerald-500/20 text-emerald-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <motion.div
      initial={false}
      animate={{ left: sidebarOpen ? 280 : 88 }}
      className="fixed top-0 right-0 h-14 z-30 flex items-center justify-between px-4"
      style={{
        background: 'var(--topbar-bg)',
        borderBottom: '1px solid var(--border-color)',
      }}
    >
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05, rotate: sidebarOpen ? 0 : 180 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleSidebar}
          className="p-2 rounded-xl transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <motion.div
            animate={{ rotate: sidebarOpen ? 0 : 180 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <FiMenu size={20} />
          </motion.div>
        </motion.button>

        <motion.div
          animate={{ width: searchFocused ? 400 : 280 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="relative hidden md:block"
        >
          <FiSearch
            className="absolute left-3.5 top-1/2 -translate-y-1/2"
            size={16}
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Search anything..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="rounded-xl pl-10 pr-4 py-2 text-sm transition-all duration-300 w-full"
            style={{
              background: searchFocused ? 'var(--input-bg)' : 'var(--input-bg)',
              border: `1px solid ${searchFocused ? 'rgba(99, 102, 241, 0.3)' : 'var(--input-border)'}`,
              color: 'var(--input-text)',
              backdropFilter: 'blur(8px)',
              boxShadow: searchFocused ? '0 0 20px rgba(99, 102, 241, 0.1)' : 'none',
            }}
          />
          {searchFocused && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <kbd className="px-1.5 py-0.5 text-[10px] rounded font-mono" style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-muted)',
              }}>
                ⌘K
              </kbd>
            </motion.div>
          )}
        </motion.div>
      </div>

      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl transition-colors relative overflow-hidden"
          style={{ color: 'var(--text-muted)' }}
        >
          <motion.div
            key={darkMode ? 'moon' : 'sun'}
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {darkMode ? <FiMoon size={18} /> : <FiSun size={18} />}
          </motion.div>
        </motion.button>

        <div className="relative" ref={notifRef}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl transition-colors relative"
            style={{ color: 'var(--text-muted)' }}
          >
            <FiBell size={18} />
            {notifCount > 0 && (
              <>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center"
                  style={{ boxShadow: '0 0 8px rgba(239,68,68,0.6)' }}
                >
                  {notifCount}
                </motion.span>
                <motion.span
                  className="absolute top-2 right-2 w-2 h-2 rounded-full"
                  animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ background: '#ef4444' }}
                />
              </>
            )}
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="absolute right-0 top-12 w-80 sm:w-96 rounded-xl overflow-hidden shadow-2xl"
                style={{
                  background: 'var(--topbar-bg)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
                    {notifCount > 0 && (
                      <motion.span
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444' }}
                      >
                        {notifCount} new
                      </motion.span>
                    )}
                  </div>
                  {notifCount > 0 && (
                    <button onClick={clearAll} className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                      Clear all
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                        <FiBell size={24} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                      </motion.div>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notif, index) => (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="flex items-start gap-3 p-4 cursor-pointer transition-colors"
                        style={{
                          borderBottom: '1px solid var(--border-color)',
                          background: notif.read ? 'transparent' : 'rgba(99,102,241,0.03)',
                        }}
                        whileHover={{ background: 'rgba(99,102,241,0.06)' }}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getIconBg(notif.type)}`}>
                          {getIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{notif.message}</p>
                          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{notif.time}</p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          whileHover={{ scale: 1.08, boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)' }}
          className="w-9 h-9 rounded-xl flex items-center justify-center font-semibold text-sm ml-2 cursor-pointer relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
          }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <span className="relative z-10 text-white">
            {user?.name?.charAt(0) || 'A'}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
