import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiTruck, FiMap, FiClock, FiDollarSign, FiMessageSquare,
  FiBarChart2, FiBell, FiSearch, FiMoon, FiSun, FiMic, FiCpu,
  FiAlertTriangle, FiLogOut, FiChevronLeft, FiChevronRight,
  FiMenu, FiNavigation, FiStar, FiUser, FiThermometer,
  FiGlobe, FiCalendar, FiSettings, FiTrendingUp, FiMapPin,
  FiRefreshCw, FiZap, FiThumbsUp, FiAward, FiRadio, FiPhone, FiVolume2,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import MetricCard from '../components/delivery/MetricCard';
import DeliveryCard from '../components/delivery/DeliveryCard';
import MapView from '../components/delivery/MapView';
import DriverChat from '../components/delivery/DriverChat';
import PerformancePanel from '../components/delivery/PerformancePanel';
import VehiclePanel from '../components/delivery/VehiclePanel';
import { useDeliveries, useNotifications, useEarnings, useDataService } from '../hooks/useDataService';
import AICoPilot from '../components/AICoPilot';
import { useSound } from '../hooks/useSound';
import { simulation } from '../services/simulation';
import { driverProfile, performanceData } from '../components/delivery/data';

const navItems = [
  { key: 'overview', label: 'Dashboard', icon: FiHome, color: '#06b6d4' },
  { key: 'deliveries', label: 'Live Deliveries', icon: FiTruck, color: '#10b981' },
  { key: 'map', label: 'Route Map', icon: FiNavigation, color: '#6366f1' },
  { key: 'earnings', label: 'Earnings', icon: FiDollarSign, color: '#f59e0b' },
  { key: 'messages', label: 'Messages', icon: FiMessageSquare, color: '#ec4899' },
  { key: 'performance', label: 'Performance', icon: FiBarChart2, color: '#8b5cf6' },
  { key: 'vehicle', label: 'Vehicle', icon: FiSettings, color: '#64748b' },
];

function formatTime(date) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function Delivery() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [activeNav, setActiveNav] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const deliveryList = useDeliveries();
  const notifList = useNotifications();
  const earnings = useEarnings();
  const DataSvc = useDataService();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const currentDriver = DataSvc.deliveryApiConnected && user ? {
    ...driverProfile,
    name: user.name || driverProfile.name,
    rating: user.rating || driverProfile.rating,
    vehicle: user.vehicle || driverProfile.vehicle,
  } : driverProfile;
  const [isOnline, setIsOnline] = useState(driverProfile.online);
  const { soundEnabled, toggleSound } = useSound();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [shiftSeconds, setShiftSeconds] = useState(16200);
  const notifRef = useRef(null);
  const aiRef = useRef(null);

  useEffect(() => {
    if (DataSvc.deliveryApiConnected) return;
    simulation.start();
    return () => simulation.stop();
  }, [DataSvc.deliveryApiConnected]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      setShiftSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (aiRef.current && !aiRef.current.contains(e.target)) setShowAI(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleAccept = useCallback((delId) => {
    DataSvc.acceptDelivery(delId);
  }, [DataSvc]);

  const handleReject = useCallback((delId) => {
    DataSvc.rejectDelivery(delId);
  }, [DataSvc]);

  const handleComplete = useCallback((delId) => {
    DataSvc.completeDelivery(delId);
  }, [DataSvc]);

  const handleConfirmComplete = useCallback((delId, satisfaction) => {
    DataSvc.completeDelivery(delId);
    const deliveries = DataSvc.getDeliveries();
    const del = deliveries.find(d => d.id === delId);
    if (del) {
      del.satisfaction = satisfaction;
      DataSvc.saveDeliveries(deliveries);
      DataSvc.addDriverChatMessage('system', '', `✅ ${del.customer} rated delivery: ${satisfaction}`, 'system');
      DataSvc.addCustomerStatusEvent(del.customer, 'delivered');
      DataSvc.addNotification(`🎉 ${del.customer}'s delivery completed! Rating: ${satisfaction}`, 'earning');
    }
  }, [DataSvc]);

  const handleShareETA = useCallback((delivery) => {
    const eta = Math.floor((delivery.distance || 5) * 2 + Math.random() * 5);
    DataSvc.shareETA(delivery.id, eta);
  }, [DataSvc]);

  const resolveAddr = useCallback((addr) => {
    if (!addr) return '';
    if (typeof addr === 'string') return addr;
    return addr.address || addr.label || '';
  }, []);

  const openInMaps = useCallback((address) => {
    const addrStr = resolveAddr(address);
    if (!addrStr || addrStr === 'Address not specified') {
      DataSvc.addNotification('No delivery address available for this order', 'order');
      return;
    }
    const encoded = encodeURIComponent(addrStr);
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
    window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
  }, [DataSvc, resolveAddr]);

  const handleNavigate = useCallback((delivery) => {
    openInMaps(delivery.deliveryAddress);
    setSelectedDelivery(delivery);
    setActiveNav('map');
  }, [openInMaps]);

  const urgentNotifs = notifList.filter(n => n.urgent);
  const activeDeliveries = deliveryList.filter(d => d.status !== 'delivered');
  const completedDeliveries = deliveryList.filter(d => d.status === 'delivered');

  const statsRowMetrics = [
    { title: 'Total Today', value: deliveryList.length, icon: FiTruck, trend: '+15%', trendUp: true, index: 0 },
    { title: 'Active Orders', value: activeDeliveries.length, icon: FiZap, trend: '+3', trendUp: true, index: 1 },
    { title: 'Completed', value: completedDeliveries.length, icon: FiThumbsUp, trend: '+8%', trendUp: true, index: 2 },
    { title: 'Hotel Service', value: deliveryList.filter(d => d.deliveryType === 'room-service').length, icon: FiHome, trend: '+12%', trendUp: true, index: 3 },
    { title: 'Rating', value: currentDriver.rating, icon: FiStar, trend: '+0.2', trendUp: true, index: 4, decimals: 2 },
    { title: 'Earnings', value: earnings?.total || 0, icon: FiDollarSign, trend: '+22%', trendUp: true, index: 5, prefix: 'ETB ' },
    { title: 'Success Rate', value: deliveryList.length > 0 ? Math.round((completedDeliveries.length / deliveryList.length) * 100) : 100, icon: FiAward, trend: '+1%', trendUp: true, index: 6, suffix: '%' },
  ];

  const filterByStatus = (status) => {
    if (status === 'active') return deliveryList.filter(d => ['assigned', 'pickup_ready', 'picked_up', 'on_the_way'].includes(d.status));
    return deliveryList.filter(d => d.status === status);
  };

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
            <motion.div whileHover={{ scale: 1.05, rotate: -5 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                boxShadow: '0 4px 12px rgba(6,182,212,0.4)',
              }}
            >
              <FiTruck size={18} className="text-white" />
            </motion.div>
            <motion.span animate={{ opacity: sidebarOpen ? 1 : 0, width: sidebarOpen ? 'auto' : 0 }}
              className="font-bold text-lg whitespace-nowrap overflow-hidden" style={{ color: 'var(--text-primary)' }}
            >
              Driver Hub
            </motion.span>
          </motion.div>
        </div>

        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => (
            <motion.button key={item.key} onClick={() => setActiveNav(item.key)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative"
              style={{
                color: activeNav === item.key ? item.color : 'var(--sidebar-text)',
                background: activeNav === item.key ? `${item.color}12` : 'transparent',
              }}
              whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}
            >
              {activeNav === item.key && (
                <motion.div layoutId="deliveryNav"
                  className="absolute left-0 w-1 h-6 rounded-r-full"
                  style={{ background: item.color, boxShadow: `0 0 8px ${item.color}50` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon size={18} className="shrink-0" />
              <motion.span animate={{ opacity: sidebarOpen ? 1 : 0, width: sidebarOpen ? 'auto' : 0 }}
                className="text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                {item.label}
              </motion.span>
              {item.key === 'deliveries' && activeDeliveries.length > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="ml-auto px-2 py-0.5 rounded-lg text-[11px] font-bold"
                  style={{ background: `${item.color}20`, color: item.color }}
                >
                  {activeDeliveries.length}
                </motion.span>
              )}
            </motion.button>
          ))}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <motion.div animate={{ opacity: sidebarOpen ? 1 : 0, height: sidebarOpen ? 'auto' : 0 }}
            className="mb-3 overflow-hidden"
          >
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--input-bg)' }}>
              <div className="relative">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                    boxShadow: '0 4px 12px rgba(6,182,212,0.3)',
                  }}
                >
                  {currentDriver.name.charAt(0)}
                </div>
                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-black ${isOnline ? 'bg-emerald-400' : 'bg-gray-400'}`}
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{currentDriver.name}</p>
                <div className="flex items-center gap-1">
                  <FiStar size={10} className="text-amber-400" />
                  <span className="text-[11px] text-amber-400 font-medium">{currentDriver.rating}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2 px-1">
              <div className="flex items-center gap-1.5">
                <FiClock size={12} style={{ color: 'var(--text-muted)' }} />
                <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                  {Math.floor(shiftSeconds / 3600)}h {Math.floor((shiftSeconds % 3600) / 60)}m
                </span>
              </div>
              <button onClick={() => setIsOnline(!isOnline)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all flex items-center gap-1 ${
                  isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                {isOnline ? 'Online' : 'Offline'}
              </button>
            </div>

            <div className="mt-2 text-[10px] px-1" style={{ color: 'var(--text-muted)' }}>
              {currentDriver.vehicle}
            </div>
          </motion.div>

          <div className="flex items-center gap-2">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex-1 p-2 rounded-xl transition-all flex items-center justify-center"
              style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}
            >
              {sidebarOpen ? <FiChevronLeft size={16} /> : <FiChevronRight size={16} />}
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
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
        <header className="h-16 flex items-center justify-between px-4 lg:px-6 shrink-0 border-b z-10"
          style={{
            background: 'var(--topbar-bg)',
            backdropFilter: 'blur(20px) saturate(1.4)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="flex items-center gap-4">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-xl lg:hidden" style={{ background: 'var(--input-bg)' }}
            >
              <FiMenu size={18} />
            </motion.button>

            <div className="relative hidden md:block">
              <FiSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search deliveries..."
                className="w-64 lg:w-80 rounded-xl pl-10 pr-4 py-2 text-sm transition-all"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--input-text)' }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 lg:gap-2">
            {/* GPS Status */}
            <motion.div animate={{ opacity: 1 }}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
              style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}
            >
              <FiRadio size={12} className="text-cyan-400" />
              <span className="font-medium text-cyan-400">GPS Active</span>
            </motion.div>

            {/* Time/Date */}
            <motion.div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
              style={{ background: 'var(--input-bg)' }}
            >
              <FiClock size={13} style={{ color: 'var(--text-muted)' }} />
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{formatTime(currentTime)}</span>
              <span className="hidden xl:inline" style={{ color: 'var(--text-muted)' }}>· {formatDate(currentTime)}</span>
            </motion.div>

            {/* Sound Toggle */}
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={toggleSound}
              className="p-2 rounded-xl transition-all hidden lg:flex"
              style={{
                background: soundEnabled ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                color: soundEnabled ? '#10b981' : '#ef4444',
              }}
            >
              <FiVolume2 size={16} />
            </motion.button>

            {/* Voice */}
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="p-2 rounded-xl transition-all hidden lg:flex"
              style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}
            >
              <FiMic size={16} />
            </motion.button>

            {/* AI Assistant */}
            <div className="relative" ref={aiRef}>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setShowAI(!showAI)}
                className="p-2 rounded-xl transition-all relative hidden lg:flex"
                style={{
                  background: showAI ? 'rgba(6,182,212,0.15)' : 'var(--input-bg)',
                  color: showAI ? '#06b6d4' : 'var(--text-secondary)',
                }}
              >
                <FiCpu size={16} />
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                  style={{ background: '#06b6d4', boxShadow: '0 0 6px rgba(6,182,212,0.6)' }}
                />
              </motion.button>
              <AnimatePresence>
                {showAI && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    className="absolute right-0 top-12 w-80 z-50"
                  >
                    <AICoPilot mode="delivery" orders={[]} deliveries={deliveryList} earnings={earnings} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl transition-all relative"
                style={{
                  background: showNotifications ? 'rgba(239,68,68,0.1)' : 'var(--input-bg)',
                  color: 'var(--text-secondary)',
                }}
              >
                <FiBell size={16} />
                {urgentNotifs.length > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center"
                    style={{ boxShadow: '0 0 8px rgba(239,68,68,0.6)' }}
                  >
                    {urgentNotifs.length}
                  </motion.span>
                )}
              </motion.button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    className="absolute right-0 top-12 w-80 sm:w-96 rounded-2xl overflow-hidden z-50"
                    style={{
                      background: 'var(--sidebar-bg)', backdropFilter: 'blur(24px) saturate(1.4)',
                      border: '1px solid var(--border-color)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                    }}
                  >
                    <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                      <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
                      <button onClick={() => DataSvc.saveNotifications([])} className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Clear</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifList.map((n, i) => (
                        <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="flex items-start gap-3 p-4 border-b transition-colors cursor-pointer"
                          style={{
                            borderColor: 'var(--border-color)',
                            background: n.urgent ? 'rgba(239,68,68,0.03)' : 'transparent',
                          }}
                          whileHover={{ background: 'rgba(255,255,255,0.02)' }}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            n.type === 'urgent' ? 'bg-rose-500/20 text-rose-400' :
                            n.type === 'new' ? 'bg-blue-500/20 text-blue-400' :
                            n.type === 'traffic' ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {n.type === 'urgent' ? <FiAlertTriangle size={14} /> :
                             n.type === 'new' ? <FiTruck size={14} /> :
                             n.type === 'traffic' ? <FiNavigation size={14} /> :
                             n.type === 'earning' ? <FiDollarSign size={14} /> : <FiBell size={14} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{n.message}</p>
                            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{n.time}</p>
                          </div>
                          {n.urgent && <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
                            className="w-2 h-2 rounded-full bg-rose-400 shrink-0 mt-1.5" />}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dark Mode */}
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="p-2 rounded-xl transition-all"
              style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}
            >
              {darkMode ? <FiSun size={16} /> : <FiMoon size={16} />}
            </motion.button>

            {/* SOS */}
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
                color: '#fff',
              }}
            >
              <FiAlertTriangle size={13} /> SOS
            </motion.button>
          </div>
        </header>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="lg:hidden border-b z-10 p-2 flex gap-1 overflow-x-auto"
              style={{ background: 'var(--topbar-bg)', backdropFilter: 'blur(20px)', borderColor: 'var(--border-color)' }}
            >
              {navItems.map(item => (
                <button key={item.key} onClick={() => { setActiveNav(item.key); setShowMobileMenu(false); }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all"
                  style={{
                    background: activeNav === item.key ? `${item.color}15` : 'transparent',
                    color: activeNav === item.key ? item.color : 'var(--text-secondary)',
                  }}
                >
                  <item.icon size={14} /> {item.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <AnimatePresence mode="wait">
            {activeNav === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Driver Dashboard</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{isOnline ? 'Online' : 'Offline'} · {activeDeliveries.length} active deliveries</p>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setIsOnline(!isOnline)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium ${
                      isOnline ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                    {isOnline ? 'Go Offline' : 'Go Online'}
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
                  {statsRowMetrics.map((m, i) => (
                    <MetricCard key={m.title} {...m} />
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="rounded-2xl p-5" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)' }}>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Active Deliveries</h2>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Real-time delivery status</p>
                        </div>
                        <button onClick={() => setActiveNav('deliveries')}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg"
                          style={{ background: 'rgba(6,182,212,0.1)', color: '#06b6d4' }}
                        >
                          View All
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                        {filterByStatus('active').slice(0, 4).map((del, i) => (
                          <DeliveryCard key={del.id} delivery={del}
                            onAccept={handleAccept} onReject={handleReject}
                            onComplete={handleComplete} onNavigate={handleNavigate}
                            onShareETA={handleShareETA} onConfirmComplete={handleConfirmComplete}
                          />
                        ))}
                        {filterByStatus('active').length === 0 && (
                          <div className="col-span-2 text-center py-12 rounded-2xl" style={{ border: '1px dashed var(--border-color)' }}>
                            <FiTruck size={32} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No active deliveries</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Earnings Card */}
                    <div className="rounded-2xl p-4" style={{
                      background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(251,191,36,0.03))',
                      border: '1px solid rgba(245,158,11,0.15)',
                    }}>
                      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Today's Earnings</h3>
                      <p className="text-3xl font-bold text-amber-400">ETB {(earnings?.total || 0).toLocaleString()}</p>
                      <div className="mt-3 space-y-2">
                        {[
                          { label: 'Delivery Fees', amount: earnings?.deliveries || 0, color: '#6366f1' },
                          { label: 'Tips', amount: earnings?.tips || 0, color: '#10b981' },
                          { label: 'Bonuses', amount: earnings?.bonus || 0, color: '#f59e0b' },
                          { label: 'Hotel Service', amount: earnings?.hotelService || 0, color: '#06b6d4' },
                        ].map((e, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <span style={{ color: 'var(--text-secondary)' }}>{e.label}</span>
                            <span className="font-medium" style={{ color: e.color }}>ETB {Math.round(e.amount)}</span>
                          </div>
                        ))}
                      </div>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveNav('earnings')}
                        className="w-full mt-3 py-2 rounded-xl text-xs font-medium"
                        style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}
                      >
                        View Details
                      </motion.button>
                    </div>

                    {/* Performance Mini */}
                    <div className="rounded-2xl p-4" style={{
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.03))',
                      border: '1px solid rgba(99,102,241,0.15)',
                    }}>
                      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Your Performance</h3>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="relative">
                          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="3" />
                            <motion.circle cx="18" cy="18" r="15.5" fill="none" stroke="#6366f1" strokeWidth="3"
                              strokeLinecap="round" strokeDasharray={97.4}
                              initial={{ strokeDashoffset: 97.4 }}
                              animate={{ strokeDashoffset: 97.4 * (1 - performanceData.acceptanceRate / 100) }}
                              transition={{ duration: 2, ease: 'easeOut' }}
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-indigo-400">
                            {performanceData.acceptanceRate}%
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-indigo-400">Acceptance Rate</p>
                          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Rank: {performanceData.ranking}</p>
                        </div>
                      </div>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveNav('performance')}
                        className="w-full py-2 rounded-xl text-xs font-medium"
                        style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', border: '1px solid rgba(99,102,241,0.2)' }}
                      >
                        View Analytics
                      </motion.button>
                    </div>

                    {/* Quick Actions */}
                    <div className="rounded-2xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)' }}>
                      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: 'Navigate', icon: FiNavigation, color: '#06b6d4', action: () => setActiveNav('map') },
                          { label: 'Call', icon: FiPhone, color: '#10b981' },
                          { label: 'Messages', icon: FiMessageSquare, color: '#ec4899', action: () => setActiveNav('messages') },
                          { label: 'Earnings', icon: FiDollarSign, color: '#f59e0b', action: () => setActiveNav('earnings') },
                        ].map((a, i) => (
                          <motion.button key={i} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                            onClick={a.action}
                            className="p-3 rounded-xl text-xs font-medium flex flex-col items-center gap-1.5"
                            style={{ background: `${a.color}10`, border: `1px solid ${a.color}20`, color: a.color }}
                          >
                            <a.icon size={16} /> {a.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeNav === 'deliveries' && (
              <motion.div key="deliveries" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Live Deliveries</h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                      {deliveryList.length} total · {activeDeliveries.length} active
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                      style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}
                    >
                      <FiRefreshCw size={13} /> Auto-sort
                    </motion.button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {deliveryList.filter(d => ['assigned', 'pickup_ready', 'picked_up', 'on_the_way'].includes(d.status))
                    .concat(deliveryList.filter(d => d.status === 'delivered'))
                    .map((del, i) => (
                      <DeliveryCard key={del.id} delivery={del}
                        onAccept={handleAccept} onReject={handleReject}
                        onComplete={handleComplete} onNavigate={handleNavigate}
                        onShareETA={handleShareETA} onConfirmComplete={handleConfirmComplete}
                      />
                    ))}
                </div>
              </motion.div>
            )}

            {activeNav === 'map' && (
              <motion.div key="map" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <MapView selectedDelivery={selectedDelivery} deliveries={deliveryList} />
              </motion.div>
            )}

            {activeNav === 'earnings' && (
              <motion.div key="earnings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Earnings</h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Track your income and tips</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Today', amount: earnings?.total || 0, color: '#06b6d4' },
                    { label: 'Tips Total', amount: earnings?.tips || 0, color: '#10b981' },
                    { label: 'Bonuses', amount: earnings?.bonus || 0, color: '#6366f1' },
                    { label: 'Deliveries', amount: earnings?.deliveries || 0, color: '#f59e0b' },
                  ].map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="rounded-2xl p-4 text-center"
                      style={{ background: `linear-gradient(135deg, ${item.color}10, ${item.color}05)`, border: `1px solid ${item.color}20` }}
                    >
                      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                      <p className="text-2xl font-bold" style={{ color: item.color }}>ETB {item.amount.toLocaleString()}</p>
                    </motion.div>
                  ))}
                </div>
                <div className="rounded-2xl p-5" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)' }}>
                      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Earnings Breakdown</h3>
                      <div className="space-y-3">
                        {[
                          { label: 'Delivery Fees', amount: (earnings?.total || 0) - (earnings?.tips || 0) - (earnings?.bonus || 0), color: '#6366f1' },
                          { label: 'Tips', amount: earnings?.tips || 0, color: '#10b981' },
                          { label: 'Bonuses', amount: earnings?.bonus || 0, color: '#f59e0b' },
                          { label: 'Hotel Service', amount: earnings?.hotelService || 0, color: '#06b6d4' },
                        ].map((e, i) => (
                          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                            className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--input-bg)' }}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ background: e.color }} />
                              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{e.label}</span>
                            </div>
                            <span className="text-sm font-semibold" style={{ color: e.color }}>ETB {Math.round(e.amount)}</span>
                          </motion.div>
                        ))}
                        <div className="flex items-center justify-between p-3 rounded-xl" style={{
                          background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(251,191,36,0.05))',
                          border: '1px solid rgba(245,158,11,0.2)',
                        }}>
                          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Total</span>
                          <span className="text-lg font-bold text-amber-400">ETB {(earnings?.total || 0).toLocaleString()}</span>
                        </div>
                      </div>
                </div>
              </motion.div>
            )}

            {activeNav === 'messages' && (
              <motion.div key="messages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="h-full">
                <DriverChat />
              </motion.div>
            )}

            {activeNav === 'performance' && (
              <motion.div key="performance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <PerformancePanel />
              </motion.div>
            )}

            {activeNav === 'vehicle' && (
              <motion.div key="vehicle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <VehiclePanel />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
