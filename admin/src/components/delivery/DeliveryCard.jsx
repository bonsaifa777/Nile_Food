import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiClock, FiMapPin, FiUser, FiPhone, FiChevronDown, FiInfo,
  FiCheck, FiX, FiNavigation, FiDollarSign, FiHome, FiTruck, FiStar,
  FiShare2, FiThumbsUp, FiSmile, FiMeh, FiFrown,
} from 'react-icons/fi';

const priorityConfig = {
  high: { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'High Priority' },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Medium' },
  low: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Standard' },
};

const typeConfig = {
  'food-delivery': { icon: FiTruck, label: 'Food Delivery', color: 'text-cyan-400' },
  'room-service': { icon: FiHome, label: 'Room Service', color: 'text-amber-400' },
};

const statusConfig = {
  assigned: { label: 'Assigned', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  pickup_ready: { label: 'Pickup Ready', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  picked_up: { label: 'Picked Up', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  on_the_way: { label: 'On The Way', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  arrived: { label: 'Arrived', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  delivered: { label: 'Delivered', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  failed: { label: 'Failed', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
};

export default function DeliveryCard({ delivery, onAccept, onReject, onComplete, onNavigate, onShareETA, onConfirmComplete }) {
  const [expanded, setExpanded] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [satisfaction, setSatisfaction] = useState(null);
  const [timer, setTimer] = useState(delivery.duration || 0);

  useEffect(() => {
    if (delivery.status === 'on_the_way' || delivery.status === 'assigned') {
      const interval = setInterval(() => setTimer(prev => prev + 1), 60000);
      return () => clearInterval(interval);
    }
  }, [delivery.status]);

  const priority = priorityConfig[delivery.priority] || priorityConfig.medium;
  const type = typeConfig[delivery.deliveryType] || typeConfig['food-delivery'];
  const status = statusConfig[delivery.status] || statusConfig.assigned;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -2 }}
      className="rounded-2xl overflow-hidden group"
      style={{
        background: 'var(--glass-bg)',
        border: `1px solid ${delivery.priority === 'high' ? 'rgba(244,63,94,0.2)' : 'var(--border-color)'}`,
        backdropFilter: 'blur(16px)',
        boxShadow: delivery.priority === 'high' ? '0 0 20px rgba(244,63,94,0.1)' : 'var(--glass-shadow)',
      }}
    >
      <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{delivery.id}</span>
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-medium ${priority.color} ${priority.bg} border ${priority.border}`}>
              {priority.label}
            </span>
          </div>
          <span className={`px-2 py-1 rounded-lg text-[11px] font-medium ${status.color}`}>
            {status.label}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <div className="flex items-center gap-1">
            <FiClock size={12} />
            <span>{timer < 60 ? `${timer}m` : `${Math.floor(timer / 60)}h ${timer % 60}m`}</span>
          </div>
          <type.icon size={12} className={type.color} />
          <span className={type.color}>{type.label}</span>
          <span className="flex items-center gap-1">
            <FiMapPin size={12} /> {delivery.distance}km
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
              style={{
                background: delivery.deliveryType === 'room-service'
                  ? 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(251,191,36,0.1))'
                  : 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(34,211,238,0.1))',
                border: `1px solid ${delivery.deliveryType === 'room-service' ? 'rgba(245,158,11,0.2)' : 'rgba(6,182,212,0.2)'}`,
              }}
            >
              {delivery.customer.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{delivery.customer}</p>
              <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                <span>{delivery.items.length} items</span>
                {delivery.paymentMethod && <span>· {delivery.paymentMethod}</span>}
              </div>
            </div>
          </div>
          <motion.a
            href={`tel:${delivery.phone}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.2)',
              color: '#10b981',
            }}
          >
            <FiPhone size={15} />
          </motion.a>
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl" style={{ background: 'var(--input-bg)' }}>
            <FiMapPin size={14} className="text-cyan-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-[11px] font-medium text-cyan-400">Pickup</p>
              <p className="text-xs" style={{ color: 'var(--text-primary)' }}>{delivery.pickup}</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{delivery.pickupAddress}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl" style={{ background: 'var(--input-bg)' }}>
            <FiMapPin size={14} className="text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-[11px] font-medium text-amber-400">Delivery</p>
              <p className="text-xs" style={{ color: 'var(--text-primary)' }}>{delivery.deliveryAddress}</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Est. {delivery.estimatedDelivery} · {delivery.duration} min</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[11px] font-medium transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <FiInfo size={12} /> {expanded ? 'Hide' : 'View'} items & details
          <FiChevronDown size={12} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>

        <motion.div animate={{ height: expanded ? 'auto' : 0 }} className="overflow-hidden">
          <div className="space-y-2 mb-2">
            {delivery.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 px-2.5 rounded-lg text-sm" style={{ background: 'var(--input-bg)' }}>
                <span style={{ color: 'var(--text-primary)' }}>
                  <span className="font-semibold" style={{ color: 'var(--primary)' }}>{item.quantity}x</span> {item.name}
                </span>
              </div>
            ))}
          </div>

          {delivery.instructions && (
            <div className="p-2.5 rounded-lg bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-2 mb-2">
              <FiInfo size={12} className="text-indigo-400 mt-0.5 shrink-0" />
              <p className="text-xs text-indigo-300">{delivery.instructions}</p>
            </div>
          )}

          {delivery.specialNotes && (
            <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10 flex items-start gap-2">
              <FiStar size={12} className="text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-300">{delivery.specialNotes}</p>
            </div>
          )}
        </motion.div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{delivery.restaurant}</span>
          <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            <FiDollarSign size={14} className="text-emerald-400" />
            <span>{delivery.paymentStatus === 'paid' ? 'Paid' : 'Pending'}</span>
          </div>
        </div>

        {delivery.status === 'assigned' && (
          <div className="flex gap-2 pt-1">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => onAccept?.(delivery.id)}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                boxShadow: '0 4px 12px rgba(6,182,212,0.3)',
                color: '#fff',
              }}
            >
              <FiCheck size={14} /> Accept Delivery
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => onReject?.(delivery.id)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
            >
              <FiX size={14} />
            </motion.button>
          </div>
        )}

        {delivery.status === 'on_the_way' && (
          <>
            <div className="flex gap-2 pt-1">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => onShareETA?.(delivery)}
                className="px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                style={{
                  background: 'rgba(6,182,212,0.1)',
                  color: '#06b6d4',
                  border: '1px solid rgba(6,182,212,0.2)',
                }}
              >
                <FiShare2 size={14} /> ETA
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate?.(delivery)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                  color: '#fff',
                }}
              >
                <FiNavigation size={14} /> Navigate
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setShowConfirm(true)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                style={{
                  background: 'rgba(99,102,241,0.1)',
                  color: 'var(--primary)',
                  border: '1px solid rgba(99,102,241,0.2)',
                }}
              >
                <FiCheck size={14} /> Complete
              </motion.button>
            </div>

            <AnimatePresence>
              {showConfirm && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-2xl p-4 mt-2" style={{ background: 'var(--input-bg)', border: '1px solid rgba(99,102,241,0.2)' }}
                >
                  <div className="text-center">
                    <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                      How was the delivery experience?
                    </p>
                    <div className="flex items-center justify-center gap-3 mb-3">
                      {[
                        { icon: FiFrown, label: 'Poor', color: '#ef4444' },
                        { icon: FiMeh, label: 'Okay', color: '#f59e0b' },
                        { icon: FiSmile, label: 'Good', color: '#10b981' },
                        { icon: FiThumbsUp, label: 'Great!', color: '#06b6d4' },
                      ].map((opt) => (
                        <motion.button key={opt.label} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                          onClick={() => { setSatisfaction(opt.label); }}
                          className={`p-2.5 rounded-xl flex flex-col items-center gap-1 transition-all ${
                            satisfaction === opt.label ? 'ring-2' : ''
                          }`}
                          style={{
                            background: `${opt.color}10`,
                            border: `1px solid ${opt.color}20`,
                            color: opt.color,
                            ringColor: opt.color,
                          }}
                        >
                          <opt.icon size={18} />
                          <span className="text-[9px]">{opt.label}</span>
                        </motion.button>
                      ))}
                    </div>
                    <p className="text-[10px] mb-3" style={{ color: 'var(--text-muted)' }}>
                      {delivery.customer} will be notified of completion
                    </p>
                    <div className="flex gap-2">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setShowConfirm(false)}
                        className="flex-1 py-2 rounded-lg text-xs font-medium border"
                        style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                      >
                        Cancel
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => { onConfirmComplete?.(delivery.id, satisfaction || 'Great!'); setShowConfirm(false); }}
                        className="flex-1 py-2 rounded-lg text-xs font-semibold"
                        style={{
                          background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                          color: '#fff',
                          boxShadow: '0 4px 12px rgba(6,182,212,0.3)',
                        }}
                      >
                        Confirm Complete
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {(delivery.status === 'delivered' || delivery.status === 'completed') && (
          <div className="w-full py-2.5 rounded-xl text-sm text-center font-medium border bg-emerald-500/5 border-emerald-500/20 flex items-center justify-center gap-2">
            <FiCheck size={16} className="text-emerald-400" />
            <span className="text-emerald-400">Delivered to {delivery.customer}</span>
            {delivery.satisfaction && (
              <span className="text-[10px] px-2 py-0.5 rounded-lg" style={{
                background: delivery.satisfaction === 'Great!' || delivery.satisfaction === 'Good' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                color: delivery.satisfaction === 'Great!' || delivery.satisfaction === 'Good' ? '#10b981' : '#f59e0b',
              }}>
                {delivery.satisfaction}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
