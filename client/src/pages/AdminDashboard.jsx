import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Loading from '../components/common/Loading';
import { useTheme } from '../context/ThemeContext';
import {
  FiShoppingBag, FiUsers, FiDollarSign, FiClock, FiCheckCircle, FiAlertCircle,
  FiTruck, FiTag, FiMenu, FiTrendingUp, FiTrendingDown, FiCalendar,
  FiMonitor, FiStar, FiActivity, FiArrowRight, FiMoreVertical, FiRefreshCw
} from 'react-icons/fi';
import {
  Users, CalendarDays, Clock, ChevronRight, MoreHorizontal,
  CheckCircle, AlertCircle, ArrowUp, ArrowDown, Sparkles,
  RefreshCw, DollarSign, ShoppingBag, MapPin, Phone, Mail
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

function AnimatedCounter({ value, duration = 1500 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useState(null);

  useEffect(() => {
    let startTime = null;
    let raf = null;
    const startVal = 0;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(startVal + (value - startVal) * ease));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [value, duration]);

  return <span>{displayValue.toLocaleString()}</span>;
}

function StatCard({ stat, index }) {
  const { darkMode } = useTheme();
  const d = darkMode;

  const IconComponent = stat.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, type: 'spring', stiffness: 100 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Link to={stat.link} className="block">
        <div className={`relative overflow-hidden rounded-3xl p-6 transition-all duration-300 ${
          d
            ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 shadow-xl'
            : 'bg-white border border-gray-100 shadow-xl hover:shadow-2xl'
        }`}>
          <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 ${
            stat.gradient || 'bg-gradient-to-br from-indigo-500 to-purple-500'
          }`} />

          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                d ? 'bg-white/10' : 'bg-gray-50'
              }`} style={{ boxShadow: stat.iconShadow }}>
                <IconComponent className={`text-2xl ${stat.iconColor || 'text-indigo-500'}`} />
              </div>
              {stat.trend !== undefined && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1, type: 'spring' }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                    stat.trend >= 0
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-red-500/10 text-red-500'
                  }`}
                >
                  {stat.trend >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {Math.abs(stat.trend)}%
                </motion.div>
              )}
            </div>

            <motion.p
              key={stat.value}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
              className={`text-3xl font-black mb-1 ${
                d ? 'text-white' : 'text-gray-900'
              }`}
            >
              {typeof stat.value === 'number' ? (
                <AnimatedCounter value={stat.value} />
              ) : (
                stat.value
              )}
            </motion.p>

            <p className={`text-sm font-medium ${
              d ? 'text-white/50' : 'text-gray-500'
            }`}>
              {stat.title}
            </p>

              <div className={`mt-4 flex items-center gap-1.5 text-xs font-semibold ${
              d ? 'text-indigo-400/70' : 'text-indigo-600'
            }`}>
              {t('admin.viewDetails')}
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function MiniChart({ type = 'line', color = '#6366f1' }) {
  const { darkMode } = useTheme();
  return (
    <div className="h-10 flex items-end gap-0.5">
      {[35, 65, 45, 80, 55, 90, 60].map((h, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${h}%` }}
          transition={{ delay: 0.8 + i * 0.05, duration: 0.5, type: 'spring' }}
          className="w-1.5 rounded-full"
          style={{
            background: `linear-gradient(to top, ${color}dd, ${color}55)`,
            opacity: darkMode ? 0.6 : 0.5
          }}
        />
      ))}
    </div>
  );
}

function QuickActions({ darkMode }) {
  const { t } = useTranslation();
  const d = darkMode;

  const actions = [
    { label: t('admin.manageMenu'), icon: FiTag, link: '/admin/menu', color: 'from-orange-500 to-amber-500' },
    { label: t('admin.viewOrders'), icon: FiShoppingBag, link: '/admin/orders', color: 'from-blue-500 to-cyan-500' },
    { label: t('admin.manageUsers'), icon: FiUsers, link: '/admin/users', color: 'from-purple-500 to-violet-500' },
    { label: t('admin.navigation'), icon: FiMenu, link: '/admin/navigation', color: 'from-indigo-500 to-blue-500' },
    { label: t('admin.categories'), icon: FiTag, link: '/admin/categories', color: 'from-pink-500 to-rose-500' },

    { label: t('admin.bookings'), icon: CalendarDays, link: '/admin/bookings', color: 'from-indigo-500 to-purple-500', isLucide: true },
    { label: t('admin.analytics'), icon: FiActivity, link: '/admin/analytics', color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className={`rounded-3xl overflow-hidden ${
        d
          ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10'
          : 'bg-white border border-gray-100 shadow-xl'
      }`}
    >
      <div className={`p-5 border-b ${d ? 'border-white/10' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            d ? 'bg-indigo-500/20' : 'bg-indigo-50'
          }`}>
            <Sparkles className={`w-5 h-5 ${d ? 'text-indigo-400' : 'text-indigo-600'}`} />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${d ? 'text-white' : 'text-gray-900'}`}>{t('admin.quickActions')}</h2>
            <p className={`text-xs ${d ? 'text-white/40' : 'text-gray-500'}`}>{t('admin.accessManagement')}</p>
          </div>
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 gap-2">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                to={action.link}
                className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-200 ${
                  d
                    ? 'hover:bg-white/5'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${action.color} shadow-lg`}>
                  <Icon className="w-4.5 h-4.5 text-white" />
                </div>
                <span className={`text-sm font-semibold ${
                  d ? 'text-white/80' : 'text-gray-700'
                }`}>
                  {action.label}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

function RecentOrdersCard({ recentOrders, darkMode }) {
  const { t } = useTranslation();
  const d = darkMode;

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending': return { bg: d ? 'bg-amber-500/20' : 'bg-amber-50', text: d ? 'text-amber-400' : 'text-amber-600', dot: 'bg-amber-500' };
      case 'confirmed': return { bg: d ? 'bg-blue-500/20' : 'bg-blue-50', text: d ? 'text-blue-400' : 'text-blue-600', dot: 'bg-blue-500' };
      case 'preparing': return { bg: d ? 'bg-indigo-500/20' : 'bg-indigo-50', text: d ? 'text-indigo-400' : 'text-indigo-600', dot: 'bg-indigo-500' };
      case 'ready': return { bg: d ? 'bg-purple-500/20' : 'bg-purple-50', text: d ? 'text-purple-400' : 'text-purple-600', dot: 'bg-purple-500' };
      case 'on_the_way': return { bg: d ? 'bg-cyan-500/20' : 'bg-cyan-50', text: d ? 'text-cyan-400' : 'text-cyan-600', dot: 'bg-cyan-500' };
      case 'delivered': return { bg: d ? 'bg-emerald-500/20' : 'bg-emerald-50', text: d ? 'text-emerald-400' : 'text-emerald-600', dot: 'bg-emerald-500' };
      case 'cancelled': return { bg: d ? 'bg-red-500/20' : 'bg-red-50', text: d ? 'text-red-400' : 'text-red-600', dot: 'bg-red-500' };
      default: return { bg: d ? 'bg-gray-500/20' : 'bg-gray-50', text: d ? 'text-gray-400' : 'text-gray-600', dot: 'bg-gray-500' };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className={`rounded-3xl overflow-hidden ${
        d
          ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10'
          : 'bg-white border border-gray-100 shadow-xl'
      }`}
    >
      <div className={`p-5 border-b ${d ? 'border-white/10' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              d ? 'bg-blue-500/20' : 'bg-blue-50'
            }`}>
              <ShoppingBag className={`w-5 h-5 ${d ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${d ? 'text-white' : 'text-gray-900'}`}>{t('admin.recentOrders')}</h2>
              <p className={`text-xs ${d ? 'text-white/40' : 'text-gray-500'}`}>{t('admin.latestOrders')}</p>
            </div>
          </div>

          <Link
            to="/admin/orders"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              d
                ? 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
            }`}
          >
            {t('admin.viewAll')}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="p-4">
        {recentOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`text-center py-16 rounded-2xl ${
              d ? 'bg-white/5' : 'bg-gray-50'
            }`}
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                d ? 'bg-white/10' : 'bg-white'
              }`}
            >
              <FiShoppingBag className={`w-8 h-8 ${d ? 'text-white/30' : 'text-gray-300'}`} />
            </motion.div>
            <p className={`font-semibold mb-1 ${d ? 'text-white/60' : 'text-gray-600'}`}>{t('admin.noOrdersYet')}</p>
            <p className={`text-sm ${d ? 'text-white/30' : 'text-gray-400'}`}>{t('admin.ordersWillAppear')}</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {recentOrders.slice(0, 6).map((order, index) => {
                const status = getStatusConfig(order.status);
                return (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.08, duration: 0.4 }}
                    className={`group flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
                      d
                        ? 'bg-white/5 hover:bg-white/10'
                        : 'bg-gray-50/50 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${status.bg}`}
                      >
                        <ShoppingBag className={`w-5 h-5 ${status.text}`} />
                      </motion.div>
                      <div>
                        <h3 className={`font-bold ${d ? 'text-white' : 'text-gray-900'}`}>
                          Order #{order.orderId?.slice(-6) || order._id?.slice(-6)}
                        </h3>
                        <p className={`text-sm ${d ? 'text-white/40' : 'text-gray-500'}`}>
                          {order.guestName || order.user?.name || 'Guest'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className={`font-bold ${d ? 'text-indigo-400' : 'text-indigo-600'}`}>
                          {(order.total || 0).toFixed(2)} ETB
                        </p>
                        <p className={`text-xs ${d ? 'text-white/30' : 'text-gray-400'}`}>
                          {order.items?.length || 0} items
                        </p>
                      </div>

                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${status.bg} ${status.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {order.status?.replace('_', ' ')}
                      </span>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
                          d ? 'hover:bg-white/10' : 'hover:bg-white'
                        }`}
                      >
                        <MoreHorizontal className={`w-4 h-4 ${d ? 'text-white/40' : 'text-gray-400'}`} />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function StatsOverview({ stats, darkMode }) {
  const { t } = useTranslation();
  const d = darkMode;

  const statCards = [
    {
      title: t('admin.totalOrders'),
      value: stats?.totalOrders || 0,
      icon: FiShoppingBag,
      link: '/admin/orders',
      gradient: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      iconColor: d ? 'text-blue-400' : 'text-blue-600',
      trend: 12.5,
    },
    {
      title: t('admin.revenue'),
      value: `ETB ${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: FiDollarSign,
      link: '/admin/analytics',
      gradient: 'bg-gradient-to-br from-emerald-500 to-teal-500',
      iconColor: d ? 'text-emerald-400' : 'text-emerald-600',
      trend: 8.2,
    },
    {
      title: t('admin.customers'),
      value: stats?.totalUsers || 0,
      icon: FiUsers,
      link: '/admin/users',
      gradient: 'bg-gradient-to-br from-purple-500 to-violet-500',
      iconColor: d ? 'text-purple-400' : 'text-purple-600',
      trend: 5.7,
    },
    {
      title: t('admin.pending'),
      value: stats?.pendingOrders || 0,
      icon: FiClock,
      link: '/admin/orders?filter=pending',
      gradient: 'bg-gradient-to-br from-amber-500 to-orange-500',
      iconColor: d ? 'text-amber-400' : 'text-amber-600',
      trend: -2.1,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {statCards.map((stat, index) => (
        <StatCard key={stat.title} stat={stat} index={index} />
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const d = darkMode;

  const fetchDashboard = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/admin/dashboard`);
      setStats(data.data.stats);
      setRecentOrders(data.data.recentOrders || []);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboard();
    setTimeout(() => setIsRefreshing(false), 800);
    toast.success(t('admin.dashboardRefreshed'));
  };

  if (loading) return <Loading />;

  return (
    <div className={`min-h-screen ${d ? 'bg-slate-950' : 'bg-gradient-to-b from-slate-50 to-white'}`}>
      <Header />

      <main className="pt-24 pb-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-2 mb-2"
                >
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    d ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    {t('admin.adminPanel')}
                  </div>
                </motion.div>

                <h1 className={`text-3xl font-black mb-1 ${d ? 'text-white' : 'text-gray-900'}`}>
                  {t('admin.welcomeBack')}
                </h1>
                <p className={`text-base ${d ? 'text-white/50' : 'text-gray-500'}`}>
                  {t('admin.todayStatus')}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleRefresh}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
                  d
                    ? 'bg-white/10 text-white/80 hover:bg-white/15 border border-white/10'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {t('admin.refresh')}
              </motion.button>
            </div>
          </motion.div>

          <StatsOverview stats={stats} darkMode={darkMode} />

          <div className="mt-8 grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RecentOrdersCard recentOrders={recentOrders} darkMode={darkMode} />
            </div>

            <div className="space-y-6">
              <QuickActions darkMode={darkMode} />

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className={`rounded-3xl overflow-hidden p-5 ${
                  d
                    ? 'bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-pink-900/20 border border-indigo-500/20'
                    : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <FiActivity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className={`font-bold ${d ? 'text-white' : 'text-gray-900'}`}>{t('admin.activitySummary')}</h3>
                    <p className={`text-xs ${d ? 'text-white/40' : 'text-gray-500'}`}>{t('admin.last7Days')}</p>
                  </div>
                </div>

                <MiniChart type="line" color={d ? '#818cf8' : '#4f46e5'} />

                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    { label: t('admin.orders'), value: (stats?.totalOrders || 0), color: 'text-blue-500' },
                    { label: t('admin.revenue'), value: `$${Math.floor((stats?.totalRevenue || 0) / 1000)}k`, color: 'text-emerald-500' },
                    { label: t('admin.users'), value: (stats?.totalUsers || 0), color: 'text-purple-500' },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                      className={`text-center p-2 rounded-xl ${
                        d ? 'bg-white/5' : 'bg-white/60'
                      }`}
                    >
                      <p className={`text-sm font-black ${item.color}`}>{item.value}</p>
                      <p className={`text-[10px] font-medium ${d ? 'text-white/40' : 'text-gray-500'}`}>{item.label}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
