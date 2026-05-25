import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiAlertTriangle, FiDroplet, FiAlertCircle, FiUser, FiMapPin, FiHome, FiTruck, FiChevronDown, FiCheck, FiX, FiPrinter, FiGrid } from 'react-icons/fi';

const priorityConfig = {
  high: { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'High' },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Medium' },
  low: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Low' },
};

const typeConfig = {
  'dine-in': { icon: FiMapPin, label: 'Dine-in', color: 'text-indigo-400' },
  'delivery': { icon: FiTruck, label: 'Delivery', color: 'text-emerald-400' },
  'room-service': { icon: FiHome, label: 'Room Service', color: 'text-amber-400' },
};

const approxPrepTime = {
  'Grilled Salmon': 15, 'Beef Tenderloin': 20, 'Lobster Bisque': 10,
  'Caesar Salad': 8, 'Truffle Pasta': 12, 'Lamb Chops': 22,
  'Chocolate Lava Cake': 12, 'Tiramisu': 5, 'Mixed Grill Platter': 25,
  'Seafood Pasta': 18, 'Bruschetta': 7, 'Crème Brûlée': 15,
};

function estimateTotalPrepTime(items) {
  if (!items || items.length === 0) return 20;
  let maxTime = 0;
  items.forEach(item => {
    for (const [key, time] of Object.entries(approxPrepTime)) {
      if (item.name.includes(key)) { maxTime = Math.max(maxTime, time); break; }
    }
  });
  return maxTime || 15;
}

export default function OrderCard({ order, index, onAccept, onReject, onComplete, onAssign, onPrint }) {
  const [elapsed, setElapsed] = useState(order.timeElapsed || 0);
  const [expanded, setExpanded] = useState(false);
  const prevOrderId = useRef(order.id);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (prevOrderId.current !== order.id) {
      setElapsed(order.timeElapsed || 0);
      prevOrderId.current = order.id;
      setExpanded(false);
    } else if (order.timeElapsed !== undefined && Math.abs(elapsed - order.timeElapsed) > 1) {
      setElapsed(order.timeElapsed);
    }
  }, [order.id, order.timeElapsed]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setElapsed(prev => prev + 1 / 60);
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const displayElapsed = Math.floor(elapsed);
  const priority = priorityConfig[order.priority] || priorityConfig.medium;
  const type = typeConfig[order.type] || typeConfig['dine-in'];
  const totalPrepTime = estimateTotalPrepTime(order.items);
  const isDelayed = displayElapsed > totalPrepTime || order.delayed;
  const isUrgent = displayElapsed > totalPrepTime * 1.3 || order.priority === 'high';
  const prepProgress = order.status === 'preparing'
    ? Math.min(Math.floor((displayElapsed / totalPrepTime) * 100), 95)
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="rounded-2xl overflow-hidden group"
      style={{
        background: 'var(--glass-bg)',
        border: `1px solid ${isDelayed ? 'rgba(239,68,68,0.2)' : 'var(--border-color)'}`,
        backdropFilter: 'blur(16px)',
        boxShadow: isUrgent ? '0 0 20px rgba(239,68,68,0.15)' : 'var(--glass-shadow)',
      }}
    >
      <div className={`p-4 border-b ${isDelayed ? 'border-red-500/20 bg-red-500/5' : 'border-white/5'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{order.id}</span>
            {order.allergens?.length > 0 && (
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30"
                title={`Allergens: ${order.allergens.join(', ')}`}
              >
                <FiAlertTriangle size={10} className="inline mr-0.5" />ALLERGY
              </motion.span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-lg text-[11px] font-medium ${priority.color} ${priority.bg} border ${priority.border}`}>
              {priority.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <div className="flex items-center gap-1">
            <FiClock size={12} className={isDelayed ? 'text-red-400' : ''} />
            <span className={isDelayed ? 'text-red-400 font-medium' : ''}>
              {displayElapsed < 60 ? `${displayElapsed}m` : `${Math.floor(displayElapsed / 60)}h ${displayElapsed % 60}m`}
              {isDelayed && ' ⚠️'}
            </span>
          </div>
          <type.icon size={12} className={type.color} />
          <span className={type.color}>{type.label}</span>
          {order.table && (
            <span className="flex items-center gap-1">
              <FiMapPin size={12} /> Table {order.table}
            </span>
          )}
          {order.room && (
            <span className="flex items-center gap-1">
              <FiHome size={12} /> Room {order.room}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))',
                border: '1px solid rgba(99,102,241,0.15)',
              }}
            >
              {order.customer.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{order.customer}</p>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{order.items?.length} items · ETB {order.total?.toLocaleString()}</p>
            </div>
          </div>
          <span className={`text-[11px] px-2 py-1 rounded-lg ${order.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
            {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
          </span>
        </div>

        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[11px] font-medium mb-2 transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            View Items <FiChevronDown size={12} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
          <motion.div
            animate={{ height: expanded ? 'auto' : 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-1.5 mb-2">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-1 px-2 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                  <span style={{ color: 'var(--text-primary)' }}>
                    <span className="font-semibold" style={{ color: 'var(--primary)' }}>{item.quantity}x</span> {item.name}
                    {item.size && <span className="text-[11px] ml-1" style={{ color: 'var(--text-muted)' }}>({item.size})</span>}
                  </span>
                  {item.notes && <span className="text-[11px] text-amber-400 italic">{item.notes}</span>}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {order.specialInstructions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/10 flex items-start gap-2"
          >
            <FiAlertCircle size={12} className="text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-300">{order.specialInstructions}</p>
          </motion.div>
        )}

        <div className="flex items-center justify-between pt-1">
          {order.chef ? (
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <FiGrid size={12} className="text-indigo-400" />
              <span>{order.chef}</span>
            </div>
          ) : (
            <button
              onClick={() => onAssign?.(order.id)}
              className="text-xs px-2 py-1 rounded-lg font-medium transition-all hover:bg-indigo-500/10"
              style={{ color: 'var(--primary)', border: '1px solid rgba(99,102,241,0.2)' }}
            >
              + Assign Chef
            </button>
          )}
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Est. {order.estimatedCompletion}
          </span>
        </div>

        {order.status === 'pending' && (
          <div className="flex gap-2 pt-1">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onAccept?.(order.id)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
            >
              <FiCheck size={14} /> Accept
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onReject?.(order.id)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
            >
              <FiX size={14} /> Reject
            </motion.button>
          </div>
        )}

        {(order.status === 'ready' || order.status === 'on_the_way') && (
          <div className="flex gap-2 pt-1">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onComplete?.(order.id)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
              }}
            >
              <FiCheck size={14} /> Mark Completed
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onPrint?.(order.id)}
              className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
            >
              <FiPrinter size={14} />
            </motion.button>
          </div>
        )}

        {order.status === 'preparing' && (
          <div className="pt-1 space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span style={{ color: 'var(--text-muted)' }}>Preparation Progress</span>
                <span style={{ color: 'var(--primary)' }}>{prepProgress}%</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: 'var(--input-bg)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${prepProgress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
                />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onComplete?.(order.id)}
              className="w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                color: '#fff',
              }}
            >
              <FiCheck size={14} /> Mark Completed
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
