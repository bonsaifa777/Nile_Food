import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { FiBell, FiShoppingBag, FiCheckCircle } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function NotificationBell() {
  const { darkMode } = useTheme();
  const d = darkMode;
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [show, setShow] = useState(false);
  const ref = useRef();
  const notifCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setShow(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const socket = io(window.location.origin, { auth: { token } });
    socket.on('notification', (notif) => {
      const STATUS_ICONS = { pending: '🕐', confirmed: '✅', preparing: '👨‍🍳', ready: '🍽️', on_the_way: '🚚', delivered: '✅', cancelled: '❌' };
      const icon = STATUS_ICONS[notif.status] || '📦';
      toast(`${icon} ${notif.message}`, {
        duration: 5000,
        style: { background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px 20px', fontWeight: 500 },
      });
      setNotifications(prev => {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return [{ id: Date.now(), message: `${icon} ${notif.message}`, time, read: false }, ...prev].slice(0, 50);
      });
    });
    return () => socket.disconnect();
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setShow(!show)}
        className="relative w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/10 backdrop-blur-xl border border-gray-200 dark:border-white/20 flex items-center justify-center text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-all duration-200"
      >
        <FiBell size={20} />
        {notifCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg"
          >
            {notifCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute right-0 top-12 w-80 sm:w-96 rounded-2xl overflow-hidden shadow-2xl"
            style={{ zIndex: 9999 }}
          >
            <div className={`${d ? 'bg-slate-900 border border-white/10' : 'bg-white border border-gray-200'}`}>
              <div className={`flex items-center justify-between p-4 ${d ? 'border-b border-white/10' : 'border-b border-gray-200'}`}>
                <div className="flex items-center gap-2">
                  <h3 className={`font-semibold text-sm ${d ? 'text-white' : 'text-gray-900'}`}>{t('notification.title')}</h3>
                  {notifCount > 0 && (
                    <motion.span
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444' }}
                    >
                      {t('notification.countNew', { count: notifCount })}
                    </motion.span>
                  )}
                </div>
                {notifCount > 0 && (
                  <button onClick={() => setNotifications([])} className={`text-xs font-medium ${d ? 'text-white/50 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                    {t('notification.clearAll')}
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                      <FiBell size={24} className={`mx-auto mb-2 ${d ? 'text-white/30' : 'text-gray-400'}`} />
                    </motion.div>
                    <p className={`text-sm ${d ? 'text-white/40' : 'text-gray-500'}`}>{t('notification.noNotifications')}</p>
                  </div>
                ) : (
                  notifications.map((notif, index) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`flex items-start gap-3 p-4 cursor-pointer transition-colors ${
                        d ? 'border-b border-white/5 hover:bg-white/5' : 'border-b border-gray-100 hover:bg-gray-50'
                      }`}
                      style={{ background: notif.read ? 'transparent' : d ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.03)' }}
                      onClick={() => setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        notif.message?.includes('new') || notif.message?.includes('New')
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        <FiShoppingBag size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${d ? 'text-white' : 'text-gray-900'}`}>{notif.message}</p>
                        <p className={`text-[11px] mt-0.5 ${d ? 'text-white/40' : 'text-gray-500'}`}>{notif.time}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
