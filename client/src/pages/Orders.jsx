import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Loading from '../components/common/Loading';
import {
  FiClock, FiMapPin, FiArrowRight, FiPackage, FiCheckCircle,
  FiXCircle, FiAlertCircle, FiChevronRight, FiShoppingBag,
  FiCalendar, FiDollarSign, FiBell
} from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'from-yellow-500 to-amber-500',
    lightColor: 'text-yellow-600',
    bgLight: 'bg-yellow-500/10',
    shadowColor: 'rgba(234,179,8,0.3)',
    Icon: FiClock,
  },
  confirmed: {
    label: 'Confirmed',
    color: 'from-blue-500 to-indigo-500',
    lightColor: 'text-blue-600',
    bgLight: 'bg-blue-500/10',
    shadowColor: 'rgba(59,130,246,0.3)',
    Icon: FiCheckCircle,
  },
  preparing: {
    label: 'Preparing',
    color: 'from-primary-500 to-purple-500',
    lightColor: 'text-primary-600',
    bgLight: 'bg-primary-500/10',
    shadowColor: 'rgba(99,102,241,0.3)',
    Icon: FiAlertCircle,
  },
  ready: {
    label: 'Ready',
    color: 'from-purple-500 to-pink-500',
    lightColor: 'text-purple-600',
    bgLight: 'bg-purple-500/10',
    shadowColor: 'rgba(168,85,247,0.3)',
    Icon: FiCheckCircle,
  },
  on_the_way: {
    label: 'On the Way',
    color: 'from-cyan-500 to-teal-500',
    lightColor: 'text-cyan-600',
    bgLight: 'bg-cyan-500/10',
    shadowColor: 'rgba(6,182,212,0.3)',
    Icon: FiMapPin,
  },
  delivered: {
    label: 'Delivered',
    color: 'from-green-500 to-emerald-500',
    lightColor: 'text-green-600',
    bgLight: 'bg-green-500/10',
    shadowColor: 'rgba(34,197,94,0.3)',
    Icon: FiCheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'from-red-500 to-rose-500',
    lightColor: 'text-red-600',
    bgLight: 'bg-red-500/10',
    shadowColor: 'rgba(239,68,68,0.3)',
    Icon: FiXCircle,
  },
};

function FloatingParticles({ d }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-1.5 h-1.5 rounded-full ${d ? 'bg-primary-400/15' : 'bg-primary-400/10'}`}
          style={{ left: `${(i * 13 + 7) % 100}%`, top: `${(i * 19 + 3) % 100}%` }}
          animate={{
            y: [0, -40, 0],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{ duration: 4 + i * 0.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.7 }}
        />
      ))}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className={`absolute rounded-full blur-3xl ${d ? 'opacity-20' : 'opacity-10'}`}
          style={{
            width: `${200 + i * 80}px`,
            height: `${200 + i * 80}px`,
            left: `${15 + i * 25}%`,
            top: `${10 + i * 20}%`,
            background: `radial-gradient(circle, rgba(99,102,241,0.3), transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: i * 1.5 }}
        />
      ))}
    </div>
  );
}

function StatusBadge({ status, className = '' }) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;
  const { Icon } = config;

  return (
    <motion.div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${config.bgLight} ${config.lightColor} ${className}`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
    >
      <motion.div
        animate={status === 'pending' || status === 'preparing' ? { rotate: [0, 15, -15, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Icon size={12} />
      </motion.div>
      {config.label}
    </motion.div>
  );
}

function OrderProgressBar({ status }) {
  const activeStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'on_the_way', 'delivered'];
  const currentIndex = activeStatuses.indexOf(status);
  const progress = status === 'delivered' || status === 'cancelled'
    ? 100
    : status === 'pending'
      ? 10
      : ((currentIndex + 1) / activeStatuses.length) * 100;

  return (
    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{
          background: `linear-gradient(90deg, #6366f1, #8b5cf6, #f59e0b, #10b981)`,
        }}
        initial={{ width: '0%' }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </div>
  );
}

function OrderCard({ order, index, d }) {
  const statusConfig = STATUS_CONFIG[order.status];
  const { Icon } = statusConfig || { Icon: FiPackage };
  const isActive = !['delivered', 'cancelled'].includes(order.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 200, damping: 20 }}
      className="group relative"
      style={{ perspective: '1000px' }}
    >
      <motion.div
        className={`relative overflow-hidden rounded-3xl transition-all duration-500 ${
          d
            ? 'bg-slate-900/60 border-slate-700/50'
            : 'bg-white/80 border-white/30'
        } backdrop-blur-2xl border shadow-2xl`}
        whileHover={{ y: -4 }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          e.currentTarget.style.transform = `rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'rotateY(0deg) rotateX(0deg)';
        }}
      >
        {/* Gradient top border */}
        <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent`} />

        {/* Status accent side bar */}
        {statusConfig && (
          <div
            className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full bg-gradient-to-b ${statusConfig.color}`}
          />
        )}

        {/* Glow orb */}
        <div className={`absolute -top-16 -right-16 w-32 h-32 rounded-full blur-3xl ${
          d ? 'opacity-20' : 'opacity-10'
        }`} style={{
          background: `radial-gradient(circle, ${statusConfig?.shadowColor?.replace('0.3', '0.2') || 'rgba(99,102,241,0.2)'}, transparent 70%)`,
        }} />

        <div className="p-5 sm:p-6">
          {/* Top row: Order ID + Status */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  statusConfig?.bgLight || 'bg-primary-500/10'
                }`}
                whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.3 }}
              >
                <Icon size={18} className={statusConfig?.lightColor || 'text-primary-500'} />
              </motion.div>
              <div>
                <h3 className={`font-bold text-base ${d ? 'text-white' : 'text-gray-900'}`}>
                  Order #{order.orderId}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <FiCalendar size={11} className="text-white/40" />
                  <p className="text-xs text-white/50">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
            <StatusBadge status={order.status} />
          </div>

          {/* Progress bar for active orders */}
          {isActive && (
            <div className="mb-4">
              <OrderProgressBar status={order.status} />
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Type', value: order.type?.replace('_', ' '), icon: FiPackage },
              { label: 'Items', value: `${order.items?.length || 0} items`, icon: FiShoppingBag },
              { label: 'Total', value: `${order.total?.toFixed(2)} ETB`, icon: FiDollarSign, highlight: true },
            ].map((info, i) => {
              const InfoIcon = info.icon;
              return (
                <motion.div
                  key={info.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 + i * 0.05 }}
                  className={`rounded-xl p-3 ${
                    d ? 'bg-white/[0.04]' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <InfoIcon size={11} className="text-white/40" />
                    <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">
                      {info.label}
                    </p>
                  </div>
                  <p className={`text-sm font-bold capitalize ${info.highlight ? 'text-primary-500' : d ? 'text-white' : 'text-gray-900'}`}>
                    {info.value}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Delivery Address */}
          {order.deliveryAddress && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`flex items-start gap-2 mb-4 p-3 rounded-xl ${
                d ? 'bg-white/[0.03]' : 'bg-gray-50/50'
              }`}
            >
              <FiMapPin size={14} className="text-white/40 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-white/60 leading-relaxed">
                {order.deliveryAddress.address}, {order.deliveryAddress.city}
              </p>
            </motion.div>
          )}

          {/* Action Button */}
          <Link
            to={`/order/${order.orderId}`}
            className={`group/btn relative flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-bold transition-all duration-300 overflow-hidden ${
              d
                ? 'bg-white/[0.06] hover:bg-white/[0.1] text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            <motion.span
              animate={isActive ? { opacity: [1, 0.5, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {isActive ? 'Track Order' : 'View Details'}
            </motion.span>
            <FiArrowRight
              size={14}
              className="group-hover/btn:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

function EmptyOrders({ d }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="text-center py-16 sm:py-24"
    >
      <motion.div
        className="relative inline-flex items-center justify-center mb-8"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
      >
        <div className={`w-24 h-24 rounded-3xl flex items-center justify-center ${
          d ? 'bg-white/[0.04]' : 'bg-gray-100'
        }`}>
          <FiPackage size={40} className="text-white/30" />
        </div>
        <motion.div
          className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <FiClock size={14} className="text-primary-500" />
        </motion.div>
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`text-2xl font-bold mb-2 ${d ? 'text-white' : 'text-gray-900'}`}
      >
        No orders yet
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-white/50 mb-8 max-w-sm mx-auto"
      >
        Looks like you haven&apos;t placed any orders yet. Browse our menu and order your favorite meal!
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold shadow-2xl shadow-primary-500/30 hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <FiShoppingBag size={18} />
          Browse Menu
          <FiChevronRight size={16} />
        </Link>
      </motion.div>
    </motion.div>
  );
}

function FilterPill({ status, active, onClick, d }) {
  const config = STATUS_CONFIG[status];
  const label = status === 'all' ? 'All Orders' :
    status === 'active' ? 'Active' :
    config?.label || status.replace('_', ' ');
  const Icon = status === 'all' ? FiPackage : status === 'active' ? FiClock : config?.Icon || FiPackage;
  const isActiveOrder = status === 'active' || (status !== 'all' && status !== 'delivered' && status !== 'cancelled');

  return (
    <motion.button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap text-sm font-semibold transition-all duration-300 flex-shrink-0 ${
        active
          ? 'text-white shadow-lg'
          : `${d ? 'text-white/60 hover:text-white hover:bg-white/[0.06]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {active && (
        <motion.div
          layoutId="activeFilter"
          className={`absolute inset-0 rounded-full bg-gradient-to-r ${
            status === 'all'
              ? 'from-primary-500 to-primary-600'
              : status === 'active'
                ? 'from-emerald-500 to-teal-500'
                : config?.color || 'from-primary-500 to-primary-600'
          }`}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
      <Icon size={14} className="relative z-10" />
      <span className="relative z-10">{label}</span>
      {isActiveOrder && !active && (
        <motion.span
          className={`w-1.5 h-1.5 rounded-full ${
            d ? 'bg-emerald-500/50' : 'bg-emerald-500'
          }`}
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
}

function OrderSkeleton({ d }) {
  return (
    <div className={`rounded-3xl p-6 ${d ? 'bg-slate-900/60' : 'bg-white/80'} backdrop-blur-2xl border ${d ? 'border-slate-700/50' : 'border-white/30'} shadow-2xl`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${d ? 'bg-white/5' : 'bg-gray-200'} animate-shimmer`} />
          <div className="space-y-2">
            <div className={`w-28 h-4 rounded ${d ? 'bg-white/5' : 'bg-gray-200'} animate-shimmer`} />
            <div className={`w-20 h-3 rounded ${d ? 'bg-white/5' : 'bg-gray-200'} animate-shimmer`} />
          </div>
        </div>
        <div className={`w-20 h-6 rounded-full ${d ? 'bg-white/5' : 'bg-gray-200'} animate-shimmer`} />
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`rounded-xl p-3 ${d ? 'bg-white/[0.04]' : 'bg-gray-50'}`}>
            <div className={`w-12 h-3 rounded mb-2 ${d ? 'bg-white/5' : 'bg-gray-200'} animate-shimmer`} />
            <div className={`w-16 h-4 rounded ${d ? 'bg-white/5' : 'bg-gray-200'} animate-shimmer`} />
          </div>
        ))}
      </div>
      <div className={`w-full h-11 rounded-2xl ${d ? 'bg-white/5' : 'bg-gray-200'} animate-shimmer`} />
    </div>
  );
}

export default function Orders() {
  const { darkMode } = useTheme();
  const d = darkMode;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const mergeOrder = useCallback((updatedOrder) => {
    setOrders(prev => {
      const exists = prev.find(o => o._id === updatedOrder._id);
      if (exists) {
        return prev.map(o => o._id === updatedOrder._id ? { ...o, ...updatedOrder } : o);
      }
      return [updatedOrder, ...prev];
    });
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = io(window.location.origin, {
      auth: { token }
    });

    socket.on('order_update', (updatedOrder) => {
      mergeOrder(updatedOrder);
    });

    socket.on('notification', (notif) => {
      const STATUS_ICONS = {
        pending: '🕐', confirmed: '✅', preparing: '👨‍🍳',
        ready: '🍽️', on_the_way: '🚚', delivered: '✅', cancelled: '❌'
      };
      const icon = STATUS_ICONS[notif.status] || '📦';
      toast(`${icon} ${notif.message}`, {
        duration: 5000,
        style: {
          background: '#0f172a',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '16px 20px',
          fontWeight: 500,
        },
        iconTheme: { primary: '#6366f1', secondary: '#fff' },
      });
    });

    return () => socket.disconnect();
  }, [mergeOrder]);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('/api/orders');
      setOrders(data.data.orders);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'active') return !['delivered', 'cancelled'].includes(order.status);
    return order.status === filter;
  });

  const statusFilters = ['all', 'active', 'pending', 'confirmed', 'preparing', 'ready', 'on_the_way', 'delivered', 'cancelled'];

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${d ? 'bg-slate-950' : 'bg-gray-50'}`}>
      {/* Background effects */}
      <div className={`fixed inset-0 transition-colors duration-700 ${d ? 'bg-slate-950' : 'bg-gray-50'}`}>
        <div className={`absolute inset-0 ${
          d
            ? 'bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.12)_0%,_transparent_70%)]'
            : 'bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.04)_0%,_transparent_70%)]'
        }`} />
        <FloatingParticles d={d} />
      </div>

      <Header />

      <main className="relative z-10 pt-28 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Hero Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10"
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))',
                border: '1px solid rgba(99,102,241,0.2)',
                color: '#6366f1',
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <FiPackage size={12} />
              Order History
            </motion.div>

            <h1 className={`text-4xl sm:text-5xl font-black mb-3 ${
              d ? 'text-white' : 'text-gray-900'
            }`}>
              <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-pink-500 dark:from-primary-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                My Orders
              </span>
            </h1>

            <p className={`text-base ${d ? 'text-white/50' : 'text-gray-500'}`}>
              Track, manage, and review all your orders in one place
            </p>

            {/* Stats bar */}
            {!loading && orders.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`flex gap-4 sm:gap-6 mt-6 p-4 rounded-2xl ${
                  d ? 'bg-white/[0.03]' : 'bg-white/60'
                } backdrop-blur-xl border ${d ? 'border-white/5' : 'border-gray-200/60'}`}
              >
                <div className="flex items-center gap-2">
                  <FiShoppingBag size={14} className="text-primary-500" />
                  <span className={`text-sm ${d ? 'text-white/70' : 'text-gray-600'}`}>
                    <strong className={d ? 'text-white' : 'text-gray-900'}>{orders.length}</strong> Total
                  </span>
                </div>
                <div className="w-px bg-white/10" />
                <div className="flex items-center gap-2">
                  <FiClock size={14} className="text-emerald-500" />
                  <span className={`text-sm ${d ? 'text-white/70' : 'text-gray-600'}`}>
                    <strong className={d ? 'text-white' : 'text-gray-900'}>
                      {orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length}
                    </strong> Active
                  </span>
                </div>
                <div className="w-px bg-white/10" />
                <div className="flex items-center gap-2">
                  <FiDollarSign size={14} className="text-amber-500" />
                  <span className={`text-sm ${d ? 'text-white/70' : 'text-gray-600'}`}>
                    <strong className={d ? 'text-white' : 'text-gray-900'}>
                      {orders.reduce((sum, o) => sum + (o.total || 0), 0).toFixed(0)}
                    </strong> ETB Spent
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Filter Pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="flex gap-2 mb-8 overflow-x-auto pb-2 custom-scrollbar -mx-4 px-4"
          >
            {statusFilters.map(status => (
              <FilterPill
                key={status}
                status={status}
                active={filter === status}
                onClick={() => setFilter(status)}
                d={d}
              />
            ))}
          </motion.div>

          {/* Content */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <OrderSkeleton key={i} d={d} />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <EmptyOrders d={d} />
          ) : (
            <motion.div className="space-y-4" layout>
              <AnimatePresence mode="popLayout">
                {filteredOrders.map((order, index) => (
                  <OrderCard key={order._id} order={order} index={index} d={d} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
