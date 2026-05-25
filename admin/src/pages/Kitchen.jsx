import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiClock, FiGrid, FiPackage, FiMessageSquare,
  FiBarChart2, FiBell, FiSearch, FiMoon, FiSun, FiMic, FiCpu,
  FiAlertTriangle, FiLogOut, FiChevronLeft, FiChevronRight,
  FiMenu, FiShoppingBag, FiSettings, FiTrendingUp,
  FiThermometer, FiVolume2, FiCheck, FiRefreshCw
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { EventBus, Events } from '../services/eventBus';
import MetricCard from '../components/kitchen/MetricCard';
import KanbanBoard from '../components/kitchen/KanbanBoard';
import PreparationPanel from '../components/kitchen/PreparationPanel';
import InventoryPanel from '../components/kitchen/InventoryPanel';
import StaffChat from '../components/kitchen/StaffChat';
import AnalyticsPanel from '../components/kitchen/AnalyticsPanel';
import { useOrders, useMetrics, useNotifications, useDataService } from '../hooks/useDataService';
import AICoPilot from '../components/AICoPilot';
import { useSound } from '../hooks/useSound';
import { computeTodayMenu } from '../services/analytics';
import { connectKitchenSocket, disconnectKitchenSocket } from '../services/socketClient';

const navItems = [
  { key: 'overview', label: 'Dashboard', icon: FiHome, color: '#6366f1' },
  { key: 'orders', label: 'Live Orders', icon: FiShoppingBag, color: '#f59e0b' },
  { key: 'preparation', label: 'Food Prep', icon: FiGrid, color: '#10b981' },
  { key: 'inventory', label: 'Inventory', icon: FiPackage, color: '#06b6d4' },
  { key: 'communication', label: 'Staff Chat', icon: FiMessageSquare, color: '#ec4899' },
  { key: 'analytics', label: 'Analytics', icon: FiBarChart2, color: '#8b5cf6' },
];

function formatTime(date) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function Timer({ seconds, className = '' }) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return <span className={className}>{m}:{s.toString().padStart(2, '0')}</span>;
}

function AnimatedCounter({ value, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const start = prev.current;
    const end = Number(value);
    if (isNaN(end)) return;
    prev.current = end;
    const duration = 1200;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <span>{prefix}{display.toLocaleString()}{suffix}</span>;
}

export default function Kitchen() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [activeNav, setActiveNav] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const orders = useOrders();
  const metrics = useMetrics();
  const notifList = useNotifications();
  const DataSvc = useDataService();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const { soundEnabled, toggleSound } = useSound();
  const [shiftSeconds, setShiftSeconds] = useState(14400);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [kitchenTemp, setKitchenTemp] = useState(38.2);
  const [sortByTime, setSortByTime] = useState(false);
  const [apiConnected, setApiConnected] = useState(DataSvc.apiConnected);
  const prevOrderCount = useRef(orders.length);
  const notifRef = useRef(null);
  const aiRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      connectKitchenSocket(token);
      setApiConnected(DataSvc.apiConnected);
    }
    return () => {
      disconnectKitchenSocket();
    };
  }, [DataSvc]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      setShiftSeconds(prev => prev + 1);
      setKitchenTemp(prev => prev + (Math.random() - 0.5) * 0.2);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (aiRef.current && !aiRef.current.contains(e.target)) setShowAI(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const unsub = EventBus.on(Events.ORDER_CREATED, () => playNotificationSound());
    return unsub;
  }, [soundEnabled]);

  useEffect(() => {
    const unsub = EventBus.on(Events.NOTIFICATION_SENT, () => playNotificationSound());
    return unsub;
  }, [soundEnabled]);

  function playNotificationSound() {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch {}
  }

  const handleAccept = useCallback((orderId) => {
    DataSvc.acceptOrder(orderId, user?.name || 'Staff');
    playNotificationSound();
  }, [user, DataSvc, soundEnabled]);

  const handleReject = useCallback((orderId) => {
    DataSvc.rejectOrder(orderId);
    playNotificationSound();
  }, [DataSvc, soundEnabled]);

  const handleComplete = useCallback((orderId) => {
    DataSvc.completeOrder(orderId);
    playNotificationSound();
  }, [DataSvc, soundEnabled]);

  const handleAssign = useCallback((orderId) => {
    DataSvc.assignChef(orderId, user?.name || 'Staff');
    playNotificationSound();
  }, [user, DataSvc, soundEnabled]);

  const handleStatusChange = useCallback((orderId, newStatus) => {
    DataSvc.updateOrderStatus(orderId, newStatus);
    playNotificationSound();
  }, [DataSvc, soundEnabled]);

  const handlePrint = useCallback((orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html><head><title>Kitchen Receipt - ${order.id}</title>
        <style>body{font-family:monospace;padding:20px;max-width:300px;margin:auto}
        h1{font-size:18px;text-align:center}table{width:100%;border-collapse:collapse}
        td{padding:4px 0}hr{border:1px dashed #ccc}</style></head>
        <body><h1>NILE FOOD KITCHEN</h1>
        <p style="text-align:center">Order: ${order.id}<br>Date: ${formatDate(new Date())}</p>
        <hr><p><strong>Customer:</strong> ${order.customer}</p>
        <p><strong>Table:</strong> ${order.table || order.room || 'N/A'}</p>
        <p><strong>Type:</strong> ${order.type}</p>
        <hr><table>${order.items.map(i => `<tr><td>${i.quantity}x ${i.name}</td><td style="text-align:right">ETB ${(i.quantity * 150).toFixed(2)}</td></tr>`).join('')}</table>
        <hr><p style="text-align:right"><strong>Total: ETB ${order.total.toFixed(2)}</strong></p>
        ${order.specialInstructions ? `<p><strong>Notes:</strong> ${order.specialInstructions}</p>` : ''}
        <hr><p style="text-align:center">Thank you!</p></body></html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }, [orders]);

  const clearNotifications = () => DataSvc.saveNotifications([]);

  const todayMenu = computeTodayMenu(orders);
  const urgentNotifs = notifList.filter(n => n.urgent);
  const newOrdersCount = orders.filter(o => o.status === 'pending').length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
  };

  const prevMetrics = useRef(metrics);
  useEffect(() => { prevMetrics.current = metrics; }, [metrics]);
  const computeTrend = (current, previous) => {
    if (!previous || previous === 0) return { text: current > 0 ? '+New' : '0', up: current >= 0 };
    const diff = current - previous;
    const pct = previous > 0 ? Math.round((diff / previous) * 100) : diff;
    const sign = pct >= 0 ? '+' : '';
    return { text: `${sign}${pct}%`, up: pct >= 0 };
  };
  const t = (key) => computeTrend(
    metrics?.[key] || 0,
    prevMetrics.current?.[key] ?? metrics?.[key]
  );

  const statsRowMetrics = [
    { title: 'Total Orders', value: metrics?.totalOrders || 0, icon: FiShoppingBag, trend: t('totalOrders').text, trendUp: t('totalOrders').up, index: 0 },
    { title: 'Pending', value: metrics?.pendingOrders || 0, icon: FiClock, trend: t('pendingOrders').text, trendUp: t('pendingOrders').up, index: 1 },
    { title: 'Preparing', value: metrics?.cookingOrders || 0, icon: FiGrid, trend: t('cookingOrders').text, trendUp: t('cookingOrders').up, index: 2 },
    { title: 'Ready to Serve', value: metrics?.readyToServe || 0, icon: FiCheck, trend: t('readyToServe').text, trendUp: t('readyToServe').up, index: 3 },
    { title: 'Delayed', value: metrics?.delayedOrders || 0, icon: FiAlertTriangle, trend: t('delayedOrders').text, trendUp: t('delayedOrders').up, index: 4 },
    { title: 'Deliveries', value: metrics?.deliveryRequests || 0, icon: FiTrendingUp, trend: t('deliveryRequests').text, trendUp: t('deliveryRequests').up, index: 5 },
    { title: 'Room Service', value: metrics?.roomServiceOrders || 0, icon: FiHome, trend: t('roomServiceOrders').text, trendUp: t('roomServiceOrders').up, index: 6 },
  ];

  return (
    <div className="fixed inset-0 flex overflow-hidden" style={{ background: 'var(--bg-body)' }}>
      <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" /><div className="orb orb-4" />

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 240 : 72 }}
        className="relative z-20 flex flex-col shrink-0 h-full"
        style={{
          background: 'var(--sidebar-bg)',
          backdropFilter: 'blur(24px) saturate(1.4)',
          borderRight: '1px solid var(--border-color)',
        }}
      >
        <div className="h-16 flex items-center px-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <motion.div className="flex items-center gap-3 min-w-0">
            <motion.div
              whileHover={{ scale: 1.05, rotate: -5 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                boxShadow: '0 4px 12px rgba(245,158,11,0.4)',
              }}
            >
              <FiGrid size={18} className="text-white" />
            </motion.div>
            <motion.span
              animate={{ opacity: sidebarOpen ? 1 : 0, width: sidebarOpen ? 'auto' : 0 }}
              className="font-bold text-lg whitespace-nowrap overflow-hidden"
              style={{ color: 'var(--text-primary)' }}
            >
              Kitchen
            </motion.span>
          </motion.div>
        </div>

        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => (
            <motion.button
              key={item.key}
              onClick={() => setActiveNav(item.key)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative"
              style={{
                color: activeNav === item.key ? item.color : 'var(--sidebar-text)',
                background: activeNav === item.key ? `${item.color}12` : 'transparent',
              }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              {activeNav === item.key && (
                <motion.div
                  layoutId="kitchenNav"
                  className="absolute left-0 w-1 h-6 rounded-r-full"
                  style={{ background: item.color, boxShadow: `0 0 8px ${item.color}50` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon size={18} className="shrink-0" />
              <motion.span
                animate={{ opacity: sidebarOpen ? 1 : 0, width: sidebarOpen ? 'auto' : 0 }}
                className="text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                {item.label}
              </motion.span>
              {item.key === 'orders' && newOrdersCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto px-2 py-0.5 rounded-lg text-[11px] font-bold"
                  style={{ background: `${item.color}20`, color: item.color }}
                >
                  {newOrdersCount}
                </motion.span>
              )}
            </motion.button>
          ))}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <motion.div
            animate={{ opacity: sidebarOpen ? 1 : 0, height: sidebarOpen ? 'auto' : 0 }}
            className="mb-3 overflow-hidden"
          >
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--input-bg)' }}>
              <div className="relative">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    boxShadow: '0 4px 12px rgba(245,158,11,0.3)',
                  }}
                >
                  {user?.name?.charAt(0) || 'K'}
                </div>
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-emerald-400 bg-emerald-400"
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name || 'Chef'}</p>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{user?.role || 'Kitchen Staff'}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 px-1">
              <div className="flex items-center gap-1.5">
                <FiClock size={12} style={{ color: 'var(--text-muted)' }} />
                <Timer seconds={shiftSeconds} className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }} />
              </div>
              <div className="flex items-center gap-1">
                <motion.span
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                />
                <span className="text-[10px] text-emerald-400 font-medium">Online</span>
              </div>
            </div>
          </motion.div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex-1 p-2 rounded-xl transition-all flex items-center justify-center"
              style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}
            >
              {sidebarOpen ? <FiChevronLeft size={16} /> : <FiChevronRight size={16} />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={logout}
              className="p-2 rounded-xl transition-all"
              style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}
            >
              <FiLogOut size={16} />
            </motion.button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header
          className="h-16 flex items-center justify-between px-4 lg:px-6 shrink-0 border-b z-10"
          style={{
            background: 'var(--topbar-bg)',
            backdropFilter: 'blur(20px) saturate(1.4)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-xl lg:hidden"
              style={{ background: 'var(--input-bg)' }}
            >
              <FiMenu size={18} />
            </motion.button>

            <div className="relative hidden md:block">
              <FiSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders, items, staff..."
                className="w-64 lg:w-80 rounded-xl pl-10 pr-4 py-2 text-sm transition-all"
                style={{
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--input-text)',
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 lg:gap-2">
            <motion.div
              animate={{ opacity: 1 }}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
              style={{ background: 'var(--input-bg)' }}
            >
              <FiClock size={13} style={{ color: 'var(--text-muted)' }} />
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{formatTime(currentTime)}</span>
              <span className="hidden xl:inline" style={{ color: 'var(--text-muted)' }}>· {formatDate(currentTime)}</span>
            </motion.div>

            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium ${
                DataSvc.apiConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
              title={DataSvc.apiConnected ? 'Connected to live database' : 'Using simulated data (offline)'}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${DataSvc.apiConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              {DataSvc.apiConnected ? 'LIVE' : 'SIM'}
            </motion.div>

            <motion.div
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
              style={{
                background: kitchenTemp > 40 ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                border: `1px solid ${kitchenTemp > 40 ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
              }}
            >
              <FiThermometer size={13} style={{ color: kitchenTemp > 40 ? '#ef4444' : '#10b981' }} />
              <span className="font-medium" style={{ color: kitchenTemp > 40 ? '#ef4444' : '#10b981' }}>
                {kitchenTemp.toFixed(1)}°F
              </span>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-xl transition-all hidden lg:flex"
              style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}
            >
              <FiMic size={16} />
            </motion.button>

            <div className="relative" ref={aiRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAI(!showAI)}
                className="p-2 rounded-xl transition-all relative hidden lg:flex"
                style={{
                  background: showAI ? 'rgba(99,102,241,0.15)' : 'var(--input-bg)',
                  color: showAI ? 'var(--primary)' : 'var(--text-secondary)',
                }}
              >
                <FiCpu size={16} />
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                  style={{ background: 'var(--primary)', boxShadow: '0 0 6px rgba(99,102,241,0.6)' }}
                />
              </motion.button>
                  <AnimatePresence>
                {showAI && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    className="absolute right-0 top-12 w-80 z-50"
                  >
                    <AICoPilot mode="kitchen" orders={orders} metrics={metrics} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative" ref={notifRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl transition-all relative"
                style={{ background: showNotifications ? 'rgba(239,68,68,0.1)' : 'var(--input-bg)', color: 'var(--text-secondary)' }}
              >
                <FiBell size={16} />
                {urgentNotifs.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center"
                    style={{ boxShadow: '0 0 8px rgba(239,68,68,0.6)' }}
                  >
                    {urgentNotifs.length}
                  </motion.span>
                )}
              </motion.button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    className="absolute right-0 top-12 w-80 sm:w-96 rounded-2xl overflow-hidden z-50"
                    style={{
                      background: 'var(--sidebar-bg)',
                      backdropFilter: 'blur(24px) saturate(1.4)',
                      border: '1px solid var(--border-color)',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                    }}
                  >
                    <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
                        {urgentNotifs.length > 0 && (
                          <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          >
                            {urgentNotifs.length} urgent
                          </motion.span>
                        )}
                      </div>
                      <button onClick={clearNotifications} className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                        Clear all
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifList.length === 0 ? (
                        <div className="p-8 text-center">
                          <FiBell size={24} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>All clear!</p>
                        </div>
                      ) : (
                        notifList.map((notif, i) => (
                          <motion.div
                            key={notif.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="flex items-start gap-3 p-4 border-b transition-colors cursor-pointer"
                            style={{
                              borderColor: 'var(--border-color)',
                              background: notif.urgent ? 'rgba(239,68,68,0.03)' : 'transparent',
                            }}
                            whileHover={{ background: 'rgba(255,255,255,0.02)' }}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              notif.type === 'emergency' ? 'bg-rose-500/20 text-rose-400' :
                              notif.type === 'order' ? 'bg-blue-500/20 text-blue-400' :
                              notif.type === 'stock' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {notif.type === 'emergency' ? <FiAlertTriangle size={14} /> :
                               notif.type === 'order' ? <FiShoppingBag size={14} /> :
                               notif.type === 'stock' ? <FiPackage size={14} /> : <FiBell size={14} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{notif.message}</p>
                              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{notif.time}</p>
                            </div>
                            {notif.urgent && (
                              <motion.div
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="w-2 h-2 rounded-full bg-rose-400 shrink-0 mt-1.5"
                              />
                            )}
                          </motion.div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="p-2 rounded-xl transition-all"
              style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}
            >
              {darkMode ? <FiSun size={16} /> : <FiMoon size={16} />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
                color: '#fff',
              }}
            >
              <FiAlertTriangle size={13} />
              Emergency
            </motion.button>
          </div>
        </header>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden border-b z-10 p-2 flex gap-1 overflow-x-auto"
              style={{
                background: 'var(--topbar-bg)',
                backdropFilter: 'blur(20px)',
                borderColor: 'var(--border-color)',
              }}
            >
              {navItems.map(item => (
                <button
                  key={item.key}
                  onClick={() => { setActiveNav(item.key); setShowMobileMenu(false); }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all"
                  style={{
                    background: activeNav === item.key ? `${item.color}15` : 'transparent',
                    color: activeNav === item.key ? item.color : 'var(--text-secondary)',
                  }}
                >
                  <item.icon size={14} />
                  {item.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <AnimatePresence mode="wait">
            {activeNav === 'overview' && (
              <motion.div
                key="overview"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Kitchen Dashboard</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Real-time kitchen operations overview</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                      boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
                      color: '#fff',
                    }}
                  >
                    <FiRefreshCw size={14} /> Sync Now
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
                  {statsRowMetrics.map((metric, i) => (
                    <MetricCard key={metric.title} {...metric} />
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-3">
                    <div className="rounded-2xl p-5" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)' }}>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Active Orders</h2>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Real-time order status</p>
                        </div>
                        <button
                          onClick={() => setActiveNav('orders')}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                          style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)' }}
                        >
                          View All
                        </button>
                      </div>
                      <KanbanBoard
                        orders={orders.filter(o => !['delivered', 'cancelled'].includes(o.status))}
                        onAccept={handleAccept}
                        onReject={handleReject}
                        onComplete={handleComplete}
                        onAssign={handleAssign}
                        onPrint={handlePrint}
                        onStatusChange={handleStatusChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)' }}>
                      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Today's Menu</h3>
                      <div className="space-y-2">
                        {todayMenu.slice(0, 5).map((item, i) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-center justify-between py-2 px-3 rounded-xl"
                            style={{ background: 'var(--input-bg)' }}
                          >
                            <div className="flex items-center gap-2">
                              {item.popular && (
                                <motion.span
                                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                                  transition={{ repeat: Infinity, duration: 3 }}
                                >
                                  🔥
                                </motion.span>
                              )}
                              <div>
                                <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{item.category}</p>
                              </div>
                            </div>
                            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>ETB {item.price}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl p-4" style={{
                      background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(52,211,153,0.03))',
                      border: '1px solid rgba(16,185,129,0.15)',
                    }}>
                      <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Customer Satisfaction</h3>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(16,185,129,0.15)" strokeWidth="3" />
                            <motion.circle
                              cx="18" cy="18" r="15.5" fill="none" stroke="#10b981" strokeWidth="3"
                              strokeLinecap="round"
                              strokeDasharray={97.4}
                              initial={{ strokeDashoffset: 97.4 }}
                              animate={{ strokeDashoffset: 97.4 * (1 - (metrics?.customerSatisfaction || 95) / 100) }}
                              transition={{ duration: 2, ease: 'easeOut' }}
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-emerald-400">
                            {metrics?.customerSatisfaction || 95}%
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-1 text-amber-400">
                            {[1,2,3,4,5].map(i => (
                              <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Excellent ratings today</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)' }}>
                      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: 'New Order', icon: FiShoppingBag, color: '#6366f1' },
                          { label: 'Stock Check', icon: FiPackage, color: '#10b981' },
                          { label: 'Staff Call', icon: FiMessageSquare, color: '#f59e0b' },
                          { label: 'Reports', icon: FiBarChart2, color: '#ec4899' },
                        ].map((action, i) => (
                          <motion.button
                            key={action.label}
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            className="p-3 rounded-xl text-xs font-medium flex flex-col items-center gap-1.5 transition-all"
                            style={{
                              background: `${action.color}10`,
                              border: `1px solid ${action.color}20`,
                              color: action.color,
                            }}
                          >
                            <action.icon size={16} />
                            {action.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeNav === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Live Order Management</h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                      {orders.length} active orders · {orders.filter(o => o.status === 'pending').length} new
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={toggleSound}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                      style={{
                        background: soundEnabled ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        color: soundEnabled ? '#10b981' : '#ef4444',
                        border: `1px solid ${soundEnabled ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                      }}
                    >
                      <FiVolume2 size={13} /> {soundEnabled ? 'Sound ON' : 'Muted'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSortByTime(!sortByTime)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                      style={{
                        background: sortByTime ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)',
                        color: sortByTime ? '#10b981' : 'var(--primary)',
                        border: `1px solid ${sortByTime ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.2)'}`,
                      }}
                    >
                      <FiRefreshCw size={13} /> {sortByTime ? 'Time sort' : 'Priority'}
                    </motion.button>
                  </div>
                </div>
                <KanbanBoard
                  orders={orders}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  onComplete={handleComplete}
                  onAssign={handleAssign}
                  onPrint={handlePrint}
                  onStatusChange={handleStatusChange}
                  sortByTime={sortByTime}
                />
              </motion.div>
            )}

            {activeNav === 'preparation' && (
              <motion.div
                key="preparation"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <PreparationPanel />
              </motion.div>
            )}

            {activeNav === 'inventory' && (
              <motion.div
                key="inventory"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <InventoryPanel />
              </motion.div>
            )}

            {activeNav === 'communication' && (
              <motion.div
                key="communication"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-full"
              >
                <StaffChat />
              </motion.div>
            )}

            {activeNav === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AnalyticsPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
