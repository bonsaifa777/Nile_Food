import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiTruck, FiClock, FiCheckCircle, FiAlertTriangle, FiDollarSign,
  FiTrendingUp, FiUsers, FiStar, FiZap, FiMapPin, FiRefreshCw, FiBell,
  FiChevronUp, FiChevronDown, FiHome, FiPackage, FiThumbsUp, FiAward,
} from 'react-icons/fi';
import { useOrders, useDeliveries, useMetrics, useNotifications, useEarnings } from '../hooks/useDataService';
import { simulation } from '../services/simulation';

const statusColors = {
  new: { bg: '#3b82f6', label: 'New' },
  preparing: { bg: '#f59e0b', label: 'Prepping' },
  cooking: { bg: '#f97316', label: 'Cooking' },
  ready: { bg: '#10b981', label: 'Ready' },
  served: { bg: '#06b6d4', label: 'Served' },
  'delivery-pickup': { bg: '#8b5cf6', label: 'Pickup' },
};

const deliveryStatusColors = {
  assigned: { bg: '#6366f1', label: 'Assigned' },
  pickup_ready: { bg: '#8b5cf6', label: 'Ready' },
  picked_up: { bg: '#06b6d4', label: 'Picked' },
  on_the_way: { bg: '#10b981', label: 'En Route' },
  delivered: { bg: '#059669', label: 'Done' },
};

function AnimatedCounter({ value, prefix = '', suffix = '', decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 800;
    const start = performance.now();
    const from = display;
    const to = value;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(from + (to - from) * easeOut(progress));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  return <span>{prefix}{display.toFixed(decimals)}{suffix}</span>;
}

function MiniBar({ data, height = 32, color = '#06b6d4' }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-0.5 h-full" style={{ height }}>
      {data.map((v, i) => (
        <div key={i} className="flex-1 rounded-t-sm transition-all duration-500"
          style={{ height: `${(v / max) * 100}%`, background: color, opacity: 0.5 + (v / max) * 0.5 }}
        />
      ))}
    </div>
  );
}

export default function Operations() {
  const orders = useOrders();
  const deliveries = useDeliveries();
  const metrics = useMetrics();
  const notifList = useNotifications();
  const earnings = useEarnings();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => { simulation.start(); return () => simulation.stop(); }, []);
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const kitchenMetrics = useMemo(() => {
    const byStatus = {};
    orders.forEach(o => {
      byStatus[o.status] = (byStatus[o.status] || 0) + 1;
    });
    return {
      total: orders.length,
      pending: byStatus['new'] || 0,
      preparing: byStatus['preparing'] || 0,
      cooking: byStatus['cooking'] || 0,
      ready: byStatus['ready'] || 0,
      served: byStatus['served'] || 0,
      deliveryPickup: byStatus['delivery-pickup'] || 0,
      delayed: orders.filter(o => o.delayed || o.timeElapsed > 20).length,
      avgTime: orders.filter(o => o.chef).length > 0
        ? Math.round(orders.filter(o => o.chef).reduce((s, o) => s + o.timeElapsed, 0) / orders.filter(o => o.chef).length)
        : 0,
      revenue: orders.reduce((s, o) => s + (o.total || 0), 0),
    };
  }, [orders]);

  const deliveryMetrics = useMemo(() => {
    const byStatus = {};
    deliveries.forEach(d => {
      byStatus[d.status] = (byStatus[d.status] || 0) + 1;
    });
    return {
      total: deliveries.length,
      active: deliveries.filter(d => d.status !== 'delivered').length,
      completed: deliveries.filter(d => d.status === 'delivered').length,
      assigned: byStatus['assigned'] || 0,
      pickupReady: byStatus['pickup_ready'] || 0,
      onTheWay: byStatus['on_the_way'] || 0,
      roomService: deliveries.filter(d => d.deliveryType === 'room-service').length,
    };
  }, [deliveries]);

  const topRow = [
    { label: 'Total Orders', value: kitchenMetrics.total, icon: FiGrid, color: '#3b82f6', trend: '+5%' },
    { label: 'Active Kitchen', value: kitchenMetrics.preparing + kitchenMetrics.cooking, icon: FiClock, color: '#f59e0b', trend: '+2' },
    { label: 'Active Deliveries', value: deliveryMetrics.active, icon: FiTruck, color: '#10b981', trend: '+3' },
    { label: 'Delayed', value: kitchenMetrics.delayed, icon: FiAlertTriangle, color: '#ef4444', trend: kitchenMetrics.delayed > 0 ? '!' : '0' },
    { label: 'Revenue', value: kitchenMetrics.revenue + (earnings?.total || 0), icon: FiDollarSign, color: '#8b5cf6', trend: '+12%', prefix: 'ETB ' },
    { label: 'Satisfaction', value: metrics?.customerSatisfaction || 96, icon: FiStar, color: '#f59e0b', trend: '+0.5', suffix: '%' },
  ];

  const formatTime = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formatDate = (d) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Operations Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {formatDate(currentTime)} · {formatTime(currentTime)} · Unified kitchen & delivery view
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
            style={{ background: 'rgba(6,182,212,0.1)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.2)' }}
          >
            <FiRefreshCw size={13} /> Live Sync
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {topRow.map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="rounded-2xl p-4 relative overflow-hidden group"
            style={{
              background: `linear-gradient(135deg, ${item.color}10, ${item.color}05)`,
              border: `1px solid ${item.color}20`,
            }}
          >
            <motion.div className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"
              style={{ background: item.color }} />
            <div className="flex items-center justify-between mb-2">
              <item.icon size={16} style={{ color: item.color }} />
              <span className="text-[10px] font-medium" style={{ color: item.trend.startsWith('!') ? '#ef4444' : 'var(--text-muted)' }}>
                {item.trend}
              </span>
            </div>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              <AnimatedCounter value={item.value} prefix={item.prefix || ''} suffix={item.suffix || ''} />
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kitchen Status */}
        <div className="rounded-2xl p-5" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiGrid size={16} className="text-amber-400" />
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Kitchen Status</h2>
            </div>
            <motion.span className="text-xs px-2 py-0.5 rounded-lg font-medium"
              style={{
                background: kitchenMetrics.delayed > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                color: kitchenMetrics.delayed > 0 ? '#ef4444' : '#10b981',
              }}
            >
              {kitchenMetrics.delayed > 0 ? `${kitchenMetrics.delayed} delayed` : 'On track'}
            </motion.span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            {Object.entries(statusColors).map(([key, cfg]) => {
              const count = kitchenMetrics[key] || 0;
              return (
                <div key={key} className="flex-1 text-center">
                  <motion.div
                    animate={{ scale: count > 0 ? [1, 1.05, 1] : 1 }}
                    transition={{ duration: 2, repeat: count > 0 ? Infinity : 0 }}
                    className="text-lg font-bold" style={{ color: cfg.bg }}
                  >
                    {count}
                  </motion.div>
                  <div className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{cfg.label}</div>
                </div>
              );
            })}
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden flex" style={{ background: 'var(--input-bg)' }}>
            {Object.entries(statusColors).map(([key, cfg]) => {
              const count = kitchenMetrics[key] || 0;
              const pct = kitchenMetrics.total > 0 ? (count / kitchenMetrics.total) * 100 : 0;
              return pct > 0 ? (
                <motion.div key={key}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  style={{ background: cfg.bg, opacity: 0.8 }}
                />
              ) : null;
            })}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl" style={{ background: 'var(--input-bg)' }}>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Avg Prep Time</p>
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                <AnimatedCounter value={kitchenMetrics.avgTime} suffix=" min" />
              </p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: 'var(--input-bg)' }}>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Total Cooked</p>
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                <AnimatedCounter value={kitchenMetrics.total} />
              </p>
            </div>
          </div>
        </div>

        {/* Delivery Status */}
        <div className="rounded-2xl p-5" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiTruck size={16} className="text-cyan-400" />
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Delivery Status</h2>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-lg font-medium"
              style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}
            >
              {deliveryMetrics.completed} completed
            </span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            {Object.entries(deliveryStatusColors).slice(0, 5).map(([key, cfg]) => {
              const count = deliveryMetrics[key] || 0;
              return (
                <div key={key} className="flex-1 text-center">
                  <motion.div
                    animate={{ scale: count > 0 ? [1, 1.05, 1] : 1 }}
                    className="text-lg font-bold" style={{ color: cfg.bg }}
                  >
                    {count}
                  </motion.div>
                  <div className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{cfg.label}</div>
                </div>
              );
            })}
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden flex" style={{ background: 'var(--input-bg)' }}>
            {Object.entries(deliveryStatusColors).slice(0, 5).map(([key, cfg]) => {
              const count = deliveryMetrics[key] || 0;
              const pct = deliveryMetrics.total > 0 ? (count / deliveryMetrics.total) * 100 : 0;
              return pct > 0 ? (
                <motion.div key={key}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  style={{ background: cfg.bg, opacity: 0.8 }}
                />
              ) : null;
            })}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl" style={{ background: 'var(--input-bg)' }}>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Room Service</p>
              <p className="text-lg font-bold" style={{ color: '#06b6d4' }}>
                <AnimatedCounter value={deliveryMetrics.roomService} />
              </p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: 'var(--input-bg)' }}>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Driver Earnings</p>
              <p className="text-lg font-bold" style={{ color: '#10b981' }}>
                ETB <AnimatedCounter value={earnings?.total || 0} />
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Kitchen Orders */}
        <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiGrid size={16} className="text-amber-400" />
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Orders</h2>
            </div>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{orders.length} total</span>
          </div>
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {orders.slice(0, 8).map((order, i) => (
              <motion.div key={order.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 p-3 rounded-xl transition-all"
                style={{ background: 'var(--input-bg)' }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background: `${(statusColors[order.status]?.bg || '#6b7280')}20`,
                    color: statusColors[order.status]?.bg || '#6b7280',
                  }}
                >
                  {order.customer.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{order.customer}</p>
                    <span className="text-[9px] px-1.5 py-0.5 rounded" style={{
                      background: `${(statusColors[order.status]?.bg || '#6b7280')}15`,
                      color: statusColors[order.status]?.bg || '#6b7280',
                    }}>
                      {statusColors[order.status]?.label || order.status}
                    </span>
                  </div>
                  <p className="text-[10px] flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    <span>{order.items.length} items</span>
                    <span>·</span>
                    <span>{order.type}</span>
                    {order.chef && <><span>·</span><span>{order.chef}</span></>}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>ETB {order.total}</p>
                  {order.delayed && (
                    <span className="text-[9px] text-rose-400 font-medium">⚠️ Delayed</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Notifications + Alerts */}
        <div className="space-y-4">
          <div className="rounded-2xl p-5" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FiBell size={16} className="text-rose-400" />
                <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Alerts</h2>
              </div>
            </div>
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {notifList.slice(0, 6).map((n, i) => (
                  <motion.div key={n.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl ${n.urgent ? 'ring-1 ring-rose-500/20' : ''}`}
                    style={{ background: n.urgent ? 'rgba(239,68,68,0.05)' : 'var(--input-bg)' }}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      n.urgent ? 'bg-rose-500/20 text-rose-400' :
                      n.type === 'new' ? 'bg-blue-500/20 text-blue-400' :
                      n.type === 'earning' ? 'bg-emerald-500/20 text-emerald-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {n.urgent ? <FiAlertTriangle size={12} /> :
                       n.type === 'new' ? <FiZap size={12} /> :
                       n.type === 'earning' ? <FiDollarSign size={12} /> : <FiBell size={12} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs" style={{ color: 'var(--text-primary)' }}>{n.message}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{n.time}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {notifList.length === 0 && (
                <p className="text-xs text-center py-8" style={{ color: 'var(--text-muted)' }}>No alerts</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl p-5" style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.03))',
            border: '1px solid rgba(99,102,241,0.15)',
          }}>
            <div className="flex items-center gap-2 mb-3">
              <FiTrendingUp size={16} className="text-indigo-400" />
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Insights</h2>
            </div>
            <div className="space-y-2">
              {[
                { icon: '🔥', text: `${kitchenMetrics.cooking} items currently cooking`, color: '#f97316' },
                { icon: '📦', text: `${deliveryMetrics.pickupReady} orders ready for pickup`, color: '#8b5cf6' },
                { icon: '💰', text: `Today's revenue: ETB ${(kitchenMetrics.revenue + (earnings?.total || 0)).toLocaleString()}`, color: '#10b981' },
                { icon: '⏰', text: kitchenMetrics.delayed > 0 ? `${kitchenMetrics.delayed} delayed orders - check grill station` : 'All orders on time ✅', color: kitchenMetrics.delayed > 0 ? '#ef4444' : '#10b981' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.15)' }}>
                  <span className="text-base">{item.icon}</span>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
