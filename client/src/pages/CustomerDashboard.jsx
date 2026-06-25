import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import Loading from '../components/common/Loading';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/dashboard/Sidebar';
import HeroProfile from '../components/dashboard/HeroProfile';
import OrderHistory from '../components/dashboard/OrderHistory';
import WalletSection from '../components/dashboard/WalletSection';
import FavoritesSection from '../components/dashboard/FavoritesSection';
import MessagesSection from '../components/dashboard/MessagesSection';
import AIAssistant from '../components/dashboard/AIAssistant';
import { FiMenu, FiSearch, FiGrid, FiShoppingBag, FiHeart, FiBell, FiCheckCircle } from 'react-icons/fi';

const STATUS_ICONS = {
  pending: '⏳',
  confirmed: '✅',
  preparing: '👨‍🍳',
  ready: '🛵',
  on_the_way: '🚚',
  delivered: '📦',
  cancelled: '❌'
};

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
}

function FloatingParticles({ d }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-1 h-1 rounded-full ${d ? 'bg-indigo-400/20' : 'bg-indigo-400/10'}`}
          style={{ left: `${(i * 17 + 5) % 100}%`, top: `${(i * 23 + 10) % 100}%` }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
        />
      ))}
    </div>
  );
}

export default function CustomerDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const d = darkMode;

  const mobileNav = [
    { id: 'overview', icon: FiGrid, label: t('dashboard.home') },
    { id: 'orders', icon: FiShoppingBag, label: t('dashboard.orders') },
    { id: 'favorites', icon: FiHeart, label: t('dashboard.favs') },
  ];
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ stats: null, orders: [], favorites: [] });
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef();
  const notifCount = notifications.filter(n => !n.read).length;

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

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
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(window.location.origin, { auth: { token } });

    socket.on('order_update', (updatedOrder) => {
      setData(prev => {
        const exists = prev.orders.findIndex(o => o._id === updatedOrder._id);
        let newOrders;
        if (exists >= 0) {
          newOrders = prev.orders.map(o => o._id === updatedOrder._id ? { ...o, ...updatedOrder } : o);
        } else {
          newOrders = [updatedOrder, ...prev.orders];
        }
        return {
          ...prev,
          orders: newOrders,
          stats: {
            ...prev.stats,
            totalOrders: newOrders.length,
            activeOrders: newOrders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length,
            totalSpent: newOrders.reduce((sum, o) => sum + (o.total || 0), 0),
          },
        };
      });
    });

    socket.on('notification', (notif) => {
      const icon = STATUS_ICONS[notif.status] || '📦';
      const msg = `${icon} ${notif.message}`;
      toast(msg, {
        duration: 5000,
        style: {
          background: '#0f172a',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '16px 20px',
          fontWeight: 500,
        },
      });
      setNotifications(prev => {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return [{ id: Date.now(), message: msg, time, read: false, status: notif.status }, ...prev].slice(0, 50);
      });
      playNotificationSound();
    });

    return () => socket.disconnect();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, favoritesRes] = await Promise.all([
        axios.get('/api/orders'),
        axios.get('/api/users/favorites')
      ]);
      const orders = ordersRes.data.data.orders || [];
      setData({
        stats: {
          totalOrders: orders.length,
          activeOrders: orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length,
          totalSpent: orders.reduce((sum, o) => sum + (o.total || 0), 0),
          totalBookings: 2,
          loyaltyPoints: user?.loyaltyPoints || 0,
        },
        orders,
        favorites: favoritesRes.data.data || [],
      });
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  const sections = {
    overview: (
      <div className="space-y-6">
        <HeroProfile user={user} stats={data.stats} />
        <OrderHistory orders={data.orders.slice(0, 3)} />
      </div>
    ),
    orders: <OrderHistory orders={data.orders} />,
    wallet: <WalletSection />,
    favorites: <FavoritesSection favorites={data.favorites} />,
    messages: <MessagesSection />,
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className={`fixed inset-0 transition-colors duration-700 ${d ? 'bg-slate-950' : 'bg-gray-50'}`}>
        <div className={`absolute inset-0 ${d ? 'bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.15)_0%,_transparent_70%)]' : 'bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.04)_0%,_transparent_70%)]'}`} />
        <FloatingParticles d={d} />
      </div>

      <Sidebar
        active={activeSection}
        setActive={setActiveSection}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      <main className={`relative z-10 transition-all duration-500 ${sidebarCollapsed ? 'ml-28' : 'ml-72'} pb-20 md:pb-0`}>
        <div className="p-4 md:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={`md:hidden w-10 h-10 rounded-xl flex items-center justify-center ${
                  d ? 'glass' : 'bg-white border border-gray-200 shadow-sm'
                }`}
              >
                <FiMenu className={d ? 'text-white' : 'text-gray-700'} size={20} />
              </button>
              <div>
                <motion.h1
                  key={activeSection}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-xl md:text-2xl font-bold capitalize ${d ? 'text-white' : 'text-gray-900'}`}
                >
                  {activeSection === 'overview' ? t('dashboard.dashboard') : activeSection}
                </motion.h1>
                <p className={`text-xs ${d ? 'text-white/40' : 'text-gray-500'}`}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-xl ${
                d ? 'glass' : 'bg-white border border-gray-200 shadow-sm'
              }`}>
                <FiSearch className={d ? 'text-white/30' : 'text-gray-400'} size={16} />
                <input
                  placeholder={t('dashboard.search')}
                  className={`bg-transparent text-sm focus:outline-none w-32 ${
                    d ? 'text-white placeholder-white/30' : 'text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    d ? 'glass hover:bg-white/5' : 'bg-white border border-gray-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  <FiBell className={d ? 'text-white/70' : 'text-gray-600'} size={18} />
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
                        animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ background: '#ef4444' }}
                      />
                    </>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className={`absolute right-0 top-12 w-80 sm:w-96 rounded-xl overflow-hidden shadow-2xl ${
                        d ? 'bg-slate-900 border border-white/10' : 'bg-white border border-gray-200'
                      }`}
                    >
                      <div className={`flex items-center justify-between p-4 ${d ? 'border-b border-white/10' : 'border-b border-gray-200'}`}>
                        <div className="flex items-center gap-2">
                          <h3 className={`font-semibold text-sm ${d ? 'text-white' : 'text-gray-900'}`}>
                            {t('dashboard.notifications')}
                          </h3>
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
                          <button
                            onClick={clearAll}
                            className={`text-xs font-medium ${d ? 'text-white/50 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                          >
                            {t('dashboard.clearAll')}
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center">
                            <motion.div
                              animate={{ y: [0, -5, 0] }}
                              transition={{ duration: 3, repeat: Infinity }}
                            >
                              <FiBell size={24} className={`mx-auto mb-2 ${d ? 'text-white/30' : 'text-gray-400'}`} />
                            </motion.div>
                            <p className={`text-sm ${d ? 'text-white/40' : 'text-gray-500'}`}>{t('dashboard.noNotifications')}</p>
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
                              style={{
                                background: notif.read ? 'transparent' : d ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.03)',
                              }}
                              onClick={() => {
                                setNotifications(prev =>
                                  prev.map(n => n.id === notif.id ? { ...n, read: true } : n)
                                );
                              }}
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                notif.type === 'new_order' || notif.type === 'order'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : notif.type === 'order_status'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-gray-500/20 text-gray-400'
                              }`}>
                                {notif.type === 'new_order' || notif.type === 'order'
                                  ? <FiShoppingBag size={14} />
                                  : <FiCheckCircle size={14} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${d ? 'text-white' : 'text-gray-900'}`}>{notif.message}</p>
                                <p className={`text-[11px] mt-0.5 ${d ? 'text-white/40' : 'text-gray-500'}`}>{notif.time}</p>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {sections[activeSection]}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl ${
        d ? 'bg-slate-900/80 border-t border-white/10' : 'bg-white/90 border-t border-gray-200 shadow-lg'
      }`}>
        <div className="flex items-center justify-around py-2 px-2">
          {mobileNav.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
                  isActive ? 'text-indigo-600 dark:text-indigo-400' : d ? 'text-white/40' : 'text-gray-500'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-indigo-500/20' : ''}`}>
                  <Icon size={18} />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <AIAssistant />
    </div>
  );
}
