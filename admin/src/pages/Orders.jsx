import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiSearch, FiEye, FiX, FiShoppingBag, FiUser,
  FiPhone, FiDollarSign, FiPackage, FiClock, FiMapPin,
  FiChevronRight, FiCheck, FiTruck, FiAlertTriangle, FiAlertCircle,
  FiBox, FiCalendar, FiTrendingUp
} from 'react-icons/fi';
import { format } from 'date-fns';

const ORDER_STATUS = {
  pending: { label: 'Pending', color: 'text-yellow-400', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', icon: FiClock },
  confirmed: { label: 'Confirmed', color: 'text-blue-400', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)', icon: FiCheck },
  preparing: { label: 'Preparing', color: 'text-primary-400', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)', icon: FiAlertCircle },
  cooking: { label: 'Cooking', color: 'text-orange-400', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.25)', icon: FiAlertTriangle },
  ready: { label: 'Ready', color: 'text-purple-400', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.25)', icon: FiPackage },
  served: { label: 'Served', color: 'text-teal-400', bg: 'rgba(20,184,166,0.12)', border: 'rgba(20,184,166,0.25)', icon: FiCheck },
  on_the_way: { label: 'On the way', color: 'text-cyan-400', bg: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.25)', icon: FiTruck },
  delivered: { label: 'Delivered', color: 'text-green-400', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)', icon: FiCheck },
  'delivery-pickup': { label: 'Delivery Pickup', color: 'text-violet-400', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.25)', icon: FiTruck },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', icon: FiX }
};

function StatusBadge({ status, animated = false }) {
  const config = ORDER_STATUS[status];
  if (!config) return null;
  const Icon = config.icon;

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap"
      style={{
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
      }}
    >
      <motion.span
        animate={animated ? { rotate: [0, 10, -10, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
        className="flex"
      >
        <Icon size={12} />
      </motion.span>
      {config.label}
    </motion.span>
  );
}

function OrderDetailModal({ order, onClose, onUpdateStatus, updating }) {
  if (!order) return null;

  const statusEntries = Object.entries(ORDER_STATUS);
  const currentStatusIndex = statusEntries.findIndex(([key]) => key === order.status);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl glass"
        style={{
          background: 'var(--bg-surface)',
          backdropFilter: 'blur(24px) saturate(1.4)',
          border: '1px solid var(--glass-border)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
        }}
      >
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-surface)' }}>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: -5 }}
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
              }}
            >
              <FiShoppingBag size={20} className="text-white" />
            </motion.div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                Order <span className="font-mono">{order.orderId}</span>
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Placed {format(new Date(order.createdAt), 'MMM d, yyyy · h:mm a')}
              </p>
            </div>
          </motion.div>
          <div className="flex items-center gap-3">
            <StatusBadge status={order.status} animated />
            <motion.button
              whileHover={{ scale: 1.05, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}
            >
              <FiX size={18} />
            </motion.button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl p-5"
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div className="flex items-center gap-4 mb-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold"
                style={{
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))',
                  border: '1px solid rgba(99,102,241,0.15)',
                  color: '#818cf8',
                }}
              >
                {(order.guestName || order.user?.name || 'G').charAt(0).toUpperCase()}
              </motion.div>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {order.guestName || order.user?.name || 'Guest'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <FiUser size={11} style={{ color: 'var(--text-muted)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {order.guestPhone || order.user?.phone || 'No phone'}
                  </span>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{
                  background: order.type === 'dine_in' ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)',
                  color: order.type === 'dine_in' ? '#10b981' : '#818cf8',
                  border: `1px solid ${order.type === 'dine_in' ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.2)'}`,
                }}
              >
                <FiShoppingBag size={12} />
                {order.type?.replace('_', ' ') || 'N/A'}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Payment', value: order.paymentMethod || 'N/A', icon: FiDollarSign },
                { label: 'Items', value: `${order.items?.length || 0} items`, icon: FiPackage },
                { label: 'Status', value: ORDER_STATUS[order.status]?.label || order.status, icon: FiClock, highlight: true },
                { label: 'Table', value: order.table?.tableNumber || order.table || 'N/A', icon: FiBox },
              ].map((info, i) => (
                <motion.div
                  key={info.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.03 }}
                  className="p-3 rounded-xl"
                  style={{ background: 'var(--glass-bg)' }}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <info.icon size={11} style={{ color: 'var(--text-muted)' }} />
                    <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      {info.label}
                    </span>
                  </div>
                  <p className={`text-sm font-semibold ${info.highlight ? 'text-primary-400' : ''}`}
                    style={{ color: info.highlight ? undefined : 'var(--text-primary)' }}
                  >
                    {info.value}
                  </p>
                </motion.div>
              ))}
            </div>

            {order.deliveryAddress && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-3 mt-4 p-3 rounded-xl"
                style={{ background: 'var(--glass-bg)' }}
              >
                <FiMapPin size={14} style={{ color: 'var(--text-muted)' }} className="mt-0.5 shrink-0" />
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {order.deliveryAddress.address}, {order.deliveryAddress.city}{order.deliveryAddress.zipCode ? `, ${order.deliveryAddress.zipCode}` : ''}
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Status Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl p-5"
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div className="flex items-center gap-2 mb-5">
              <FiTrendingUp size={14} style={{ color: 'var(--text-muted)' }} />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Order Progress</h3>
            </div>

            <div className="relative">
              <div className="absolute left-[19px] top-2 bottom-2 w-px" style={{ background: 'var(--border-color)' }}>
                <motion.div
                  className="w-full bg-gradient-to-b from-primary-500 to-primary-400"
                  initial={{ height: '0%' }}
                  animate={{ height: `${currentStatusIndex >= 0 ? ((currentStatusIndex + 1) / (statusEntries.length - 1)) * 100 : 0}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
              <div className="space-y-0">
                {statusEntries.map(([key, config], index) => {
                  const Icon = config.icon;
                  const isComplete = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  const isCancelled = order.status === 'cancelled';

                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + index * 0.04 }}
                      className="flex items-start gap-4 py-2"
                    >
                      <motion.div
                        animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 2, repeat: isCurrent ? Infinity : 0 }}
                        className="relative z-10 w-[38px] h-[38px] rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          background: isComplete
                            ? `linear-gradient(135deg, ${isCancelled && index === currentStatusIndex ? '#ef4444' : '#6366f1'}, ${isCancelled && index === currentStatusIndex ? '#dc2626' : '#8b5cf6'})`
                            : 'var(--glass-bg)',
                          border: isCurrent ? `2px solid ${isCancelled ? '#ef4444' : '#818cf8'}` : '2px solid transparent',
                          boxShadow: isCurrent
                            ? `0 0 20px ${isCancelled ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.3)'}`
                            : 'none',
                        }}
                      >
                        <Icon size={14} className={isComplete ? 'text-white' : ''}
                          style={{ color: isComplete ? '#fff' : 'var(--text-muted)' }}
                        />
                      </motion.div>
                      <div className="flex-1 min-w-0 pt-2">
                        <p className="text-sm font-medium"
                          style={{
                            color: isCurrent
                              ? 'var(--text-primary)'
                              : isComplete
                                ? 'var(--text-secondary)'
                                : 'var(--text-muted)',
                          }}
                        >
                          {config.label}
                        </p>
                      </div>
                      {isCurrent && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="px-2 py-0.5 rounded text-[10px] font-bold"
                          style={{
                            background: isCancelled ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)',
                            color: isCancelled ? '#ef4444' : '#818cf8',
                          }}
                        >
                          Current
                        </motion.span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl p-5"
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FiPackage size={14} style={{ color: 'var(--text-muted)' }} />
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Order Items</h3>
              </div>
              <motion.span
                key={order.items?.length}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                style={{
                  background: 'rgba(99,102,241,0.1)',
                  color: '#818cf8',
                }}
              >
                {order.items?.length || 0} items
              </motion.span>
            </div>

            <div className="space-y-2">
              <AnimatePresence>
                {order.items?.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="flex items-center gap-4 p-3 rounded-xl group"
                    style={{ background: 'var(--glass-bg)' }}
                    whileHover={{ x: 2, background: 'rgba(99,102,241,0.04)' }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))',
                        border: '1px solid rgba(99,102,241,0.15)',
                        color: '#818cf8',
                      }}
                    >
                      {item.quantity}x
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {item.name}
                      </p>
                      {item.size && (
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          {item.size}
                          {item.extras?.length > 0 && ` · +${item.extras.length} extras`}
                        </span>
                      )}
                    </div>
                    <motion.span
                      className="text-sm font-semibold shrink-0 tabular-nums"
                      style={{ color: 'var(--text-primary)' }}
                      key={item.price * item.quantity}
                      initial={{ scale: 1.1, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      ETB {(item.price * item.quantity).toFixed(2)}
                    </motion.span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Price Breakdown */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-5 pt-4 space-y-2"
              style={{ borderTop: '1px solid var(--border-color)' }}
            >
              <div className="flex justify-between py-1">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>ETB {order.subtotal?.toFixed(2)}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="flex justify-between py-1">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Delivery Fee</span>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>ETB {order.deliveryFee?.toFixed(2)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between py-1">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Discount</span>
                  <span className="text-xs font-medium" style={{ color: '#10b981' }}>-ETB {order.discount?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-1">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Tax</span>
                <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>ETB {order.tax?.toFixed(2)}</span>
              </div>
              <motion.div
                className="flex justify-between pt-3"
                style={{ borderTop: '1px solid var(--border-color)' }}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Total</span>
                <motion.span
                  className="text-lg font-black"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                  key={order.total}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                >
                  ETB {order.total?.toFixed(2)}
                </motion.span>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Update Status */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl p-5"
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <FiClock size={14} style={{ color: 'var(--text-muted)' }} />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Update Status</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {statusEntries.map(([key, config], index) => {
                const Icon = config.icon;
                const isActive = order.status === key;
                const isPast = index <= currentStatusIndex && key !== 'cancelled';

                return (
                  <motion.button
                    key={key}
                    onClick={() => onUpdateStatus(order._id, key)}
                    disabled={updating || isActive}
                    whileHover={!isActive ? { scale: 1.03, y: -2 } : {}}
                    whileTap={!isActive ? { scale: 0.97 } : {}}
                    className="relative flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all overflow-hidden"
                    style={{
                      background: isActive
                        ? `linear-gradient(135deg, ${config.bg}, transparent)`
                        : 'var(--glass-bg)',
                      border: isActive
                        ? `1px solid ${config.border}`
                        : '1px solid transparent',
                      color: isActive ? config.color : 'var(--text-secondary)',
                      opacity: updating ? 0.6 : 1,
                    }}
                  >
                    {isPast && !isActive && (
                      <div className="absolute inset-0" style={{
                        background: 'linear-gradient(135deg, rgba(16,185,129,0.05), transparent)',
                      }} />
                    )}
                    <Icon size={13} className="relative" />
                    <span className="relative whitespace-nowrap">{config.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="statusIndicator"
                        className="absolute inset-0 rounded-xl"
                        style={{
                          border: `2px solid ${config.border}`,
                          opacity: 0.5,
                        }}
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function TableSkeleton() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              {['Order ID', 'Customer', 'Type', 'Items', 'Total', 'Status', 'Date', 'Actions'].map((h) => (
                <th key={h} className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                {[...Array(8)].map((_, j) => (
                  <td key={j} className="py-4 px-4">
                    <div className="h-4 shimmer rounded-lg" style={{ width: j === 0 ? '120px' : j === 1 ? '100px' : j === 6 ? '80px' : j === 4 ? '70px' : '50px' }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = filter ? `?status=${filter}` : '';
      const { data } = await axios.get(`/api/orders${params}`);
      setOrders(data.data.orders || []);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    setUpdating(true);
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status });
      toast.success('Order status updated', {
        style: {
          background: '#0f172a',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
        },
      });
      fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      toast.error('Failed to update order');
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      order.orderId?.toLowerCase().includes(searchLower) ||
      order.guestName?.toLowerCase().includes(searchLower) ||
      order.user?.name?.toLowerCase().includes(searchLower)
    );
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.04, delayChildren: 0.05 }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 200, damping: 25 } }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Orders
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {loading ? 'Loading...' : `${filteredOrders.length} order${filteredOrders.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
        {!loading && filteredOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs"
            style={{
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.15)',
              color: '#818cf8',
            }}
          >
            <FiTrendingUp size={13} />
            <span className="font-medium">
              {orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length} active
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Search & Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-col md:flex-row gap-4"
      >
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, customer name..."
            className="input-glass pl-10"
          />
          {search && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-all hover:bg-white/5"
            >
              <FiX size={14} style={{ color: 'var(--text-muted)' }} />
            </motion.button>
          )}
        </div>

        <motion.select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-glass min-w-[160px] cursor-pointer"
          whileFocus={{ scale: 1.01 }}
        >
          <option value="">All Status</option>
          {Object.entries(ORDER_STATUS).map(([key, value]) => (
            <option key={key} value={key}>{value.label}</option>
          ))}
        </motion.select>
      </motion.div>

      {/* Table */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="glass-card overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  {['Order ID', 'Customer', 'Type', 'Items', 'Total', 'Status', 'Date', 'Actions'].map((header) => (
                    <th key={header} className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="py-16 text-center"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                          className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                          style={{
                            background: 'rgba(99,102,241,0.1)',
                            border: '1px solid rgba(99,102,241,0.15)',
                          }}
                        >
                          <FiBox size={28} style={{ color: '#818cf8' }} />
                        </motion.div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>No orders found</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                          {search ? 'Try a different search term' : filter ? 'No orders with this status' : 'No orders yet'}
                        </p>
                      </motion.div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order, index) => (
                    <motion.tr
                      key={order._id}
                      variants={rowVariants}
                      className="group cursor-pointer"
                      style={{ borderBottom: '1px solid var(--border-color)' }}
                      whileHover={{
                        background: 'rgba(99,102,241,0.04)',
                        transition: { duration: 0.15 },
                      }}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <motion.div
                            initial={false}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                            style={{
                              background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))',
                              border: '1px solid rgba(99,102,241,0.15)',
                              color: '#818cf8',
                            }}
                            whileHover={{ scale: 1.1, rotate: -5 }}
                          >
                            <FiShoppingBag size={14} />
                          </motion.div>
                          <span className="text-sm font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
                            {order.orderId}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0"
                            style={{
                              background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))',
                              border: '1px solid rgba(99,102,241,0.15)',
                              color: '#818cf8',
                            }}
                          >
                            {(order.guestName || order.user?.name || 'G').charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {order.guestName || order.user?.name || 'Guest'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm capitalize" style={{ color: 'var(--text-muted)' }}>
                          {order.type?.replace('_', ' ') || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                        {order.items?.length || 0}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          ETB {order.total?.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={order.status} animated={['pending', 'preparing', 'on_the_way'].includes(order.status)} />
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          {format(new Date(order.createdAt), 'MMM d, HH:mm')}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <motion.button
                          onClick={() => setSelectedOrder(order)}
                          whileHover={{ scale: 1.1, background: 'rgba(99,102,241,0.15)' }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-xl transition-all"
                          style={{
                            background: 'rgba(99,102,241,0.08)',
                            color: '#818cf8',
                          }}
                        >
                          <FiEye size={16} />
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onUpdateStatus={updateStatus}
            updating={updating}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
