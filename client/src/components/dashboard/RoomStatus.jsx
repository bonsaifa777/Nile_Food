import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  CalendarDays, MapPin, Clock, Star, Wifi, Tv, Wind, Coffee, Bath,
  Utensils, Shield, Bell, Phone, Mail, ChevronRight, MoreHorizontal,
  X, CheckCircle, AlertCircle, RefreshCw, Home, Users, Sparkles,
  Luggage, DoorOpen, Trash2, Settings, AlertTriangle, Music,
  Bed, User, Send, Calendar
} from 'lucide-react';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', border: 'border-amber-300/50 dark:border-amber-700/30', dot: 'bg-amber-500', step: 1 },
  confirmed: { label: 'Confirmed', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30', border: 'border-emerald-300/50 dark:border-emerald-700/30', dot: 'bg-emerald-500', step: 2 },
  cancelled: { label: 'Cancelled', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', border: 'border-red-300/50 dark:border-red-700/30', dot: 'bg-red-500', step: 0 },
};

function StatusProgressBar({ status }) {
  const { darkMode } = useTheme();
  const d = darkMode;
  const steps = [
    { key: 'pending', label: 'Pending', icon: Clock },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  ];
  const currentStep = STATUS_CONFIG[status]?.step || 0;
  const isCancelled = status === 'cancelled';

  return (
    <div className="flex items-center gap-2 py-2">
      {steps.map((s, i) => {
        const Icon = s.icon;
        const isActive = currentStep >= i + 1;
        const isCurrent = (currentStep === i + 1 && !isCancelled);
        return (
          <div key={s.key} className="flex items-center gap-2 flex-1">
            <div className="relative">
              <motion.div
                animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 1.5, repeat: isCurrent ? Infinity : 0 }}
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                  isCancelled
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-500'
                    : isActive
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500'
                      : d
                        ? 'bg-white/5 text-white/30'
                        : 'bg-gray-100 text-gray-300'
                }`}
              >
                <Icon size={14} />
              </motion.div>
              {isCurrent && !isCancelled && (
                <motion.div
                  className="absolute -inset-1 rounded-xl border-2 border-emerald-400/50"
                  animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </div>
            <span className={`text-[10px] font-semibold ${
              isCancelled
                ? 'text-red-500'
                : isActive
                  ? d ? 'text-emerald-400' : 'text-emerald-600'
                  : d ? 'text-white/30' : 'text-gray-400'
            }`}>
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-1 relative">
                <div className={`absolute inset-0 rounded-full ${d ? 'bg-white/10' : 'bg-gray-200'}`} />
                <motion.div
                  className={`absolute inset-0 rounded-full ${
                    isCancelled ? 'bg-red-400' : 'bg-emerald-400'
                  }`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: isActive || isCancelled ? 1 : 0 }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                  style={{ transformOrigin: 'left' }}
                />
              </div>
            )}
          </div>
        );
      })}
      {isCancelled && (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-red-100 dark:bg-red-900/30 text-red-500">
            <AlertCircle size={14} />
          </div>
          <span className="text-[10px] font-semibold text-red-500">Cancelled</span>
        </div>
      )}
    </div>
  );
}

function ReservationCard({ reservation, index, onCancel }) {
  const { darkMode } = useTheme();
  const d = darkMode;
  const [expanded, setExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const ref = useRef(null);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(y, [0, 1], [6, -6]), { damping: 20, stiffness: 120 });
  const rotateY = useSpring(useTransform(x, [0, 1], [-6, 6]), { damping: 20, stiffness: 120 });

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  }, [x, y]);
  const handleMouseLeave = useCallback(() => { x.set(0.5); y.set(0.5); }, [x, y]);

  const status = STATUS_CONFIG[reservation.status] || STATUS_CONFIG.pending;
  const isPending = reservation.status === 'pending';
  const isConfirmed = reservation.status === 'confirmed';
  const isCancelled = reservation.status === 'cancelled';

  const nightCount = (() => {
    if (!reservation.date || !reservation.time) return 1;
    const ms = new Date(reservation.time) - new Date(reservation.date);
    return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, perspective: 1000, transformStyle: 'preserve-3d' }}
        className="group relative"
      >
        <div className="absolute -inset-[1px] bg-gradient-to-b from-indigo-400/20 via-indigo-500/10 to-transparent rounded-3xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className={`relative rounded-3xl overflow-hidden backdrop-blur-xl border transition-all duration-300 ${
          isConfirmed
            ? 'bg-white/80 dark:bg-slate-900/80 border-emerald-200/50 dark:border-emerald-700/30 shadow-lg shadow-emerald-500/5'
            : isCancelled
              ? 'bg-white/60 dark:bg-slate-900/60 border-red-200/30 dark:border-red-700/20 shadow-lg shadow-red-500/5'
              : 'bg-white/60 dark:bg-slate-900/60 border-amber-200/30 dark:border-amber-700/20 shadow-lg shadow-amber-500/5'
        }`}>
          <div className="flex flex-col sm:flex-row">
            <div className="relative sm:w-56 h-44 sm:h-auto overflow-hidden shrink-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.1),transparent_70%)]" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2MzY2ZjEiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Bed size={48} className="text-indigo-400/60 mx-auto mb-2" />
                  <p className="text-indigo-400/40 text-xs font-semibold tracking-wider uppercase">Premium Suite</p>
                </div>
              </div>
              <div className="absolute top-3 left-3 sm:hidden">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${status.border} ${status.bg} ${status.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                  {status.label}
                </span>
              </div>
              <div className="absolute bottom-3 left-3 sm:hidden">
                <p className="text-white text-sm font-bold drop-shadow-lg">{reservation.name || 'Guest'}</p>
                <p className="text-white/60 text-[10px] flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" />
                  {reservation.date} &mdash; {reservation.time}
                </p>
              </div>
            </div>

            <div className="flex-1 p-4 sm:p-5">
              <div className="hidden sm:flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${status.border} ${status.bg} ${status.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                    <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">Room Reservation</span>
                  </div>
                  <h3 className={`text-lg font-bold ${d ? 'text-white' : 'text-gray-900'}`}>{reservation.name || 'Guest'}</h3>
                  <p className={`text-xs flex items-center gap-1 ${d ? 'text-white/50' : 'text-gray-500'}`}>
                    <Mail className="w-3 h-3" />{reservation.email}
                  </p>
                </div>
                {isPending && (
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowActions(!showActions)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        d ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                      } transition-colors`}
                    >
                      <MoreHorizontal className={`w-4 h-4 ${d ? 'text-white/50' : 'text-gray-500'}`} />
                    </motion.button>
                    <AnimatePresence>
                      {showActions && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -5 }}
                          className={`absolute right-0 top-12 w-48 rounded-2xl overflow-hidden border shadow-xl z-20 ${
                            d ? 'bg-slate-800 border-white/10' : 'bg-white border-gray-200'
                          }`}
                        >
                          <button
                            onClick={() => { onCancel?.(reservation); setShowActions(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Cancel Booking
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              <div className="sm:hidden flex items-center justify-between mb-3">
                <div>
                  <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">Room Reservation</span>
                  <h3 className={`text-base font-bold ${d ? 'text-white' : 'text-gray-900'}`}>{reservation.name || 'Guest'}</h3>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-3">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className={`w-3.5 h-3.5 ${d ? 'text-indigo-400' : 'text-indigo-500'}`} />
                  <span className={`text-xs ${d ? 'text-white/60' : 'text-gray-500'}`}>
                    {reservation.date ? new Date(reservation.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                    {' — '}
                    {reservation.time ? new Date(reservation.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className={`w-3.5 h-3.5 ${d ? 'text-indigo-400' : 'text-indigo-500'}`} />
                  <span className={`text-xs ${d ? 'text-white/60' : 'text-gray-500'}`}>{reservation.guests || 1} {reservation.guests === 1 ? 'Guest' : 'Guests'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-indigo-400" />
                  <span className={`text-xs ${d ? 'text-white/60' : 'text-gray-500'}`}>{reservation.phone || '—'}</span>
                </div>
              </div>

              {/* Status Progress */}
              <div className="mb-4">
                <StatusProgressBar status={reservation.status} />
              </div>

              <div className="hidden sm:flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isPending && (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onCancel?.(reservation)}
                      className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded-xl hover:bg-red-500/20 transition-all flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Cancel
                    </motion.button>
                  )}
                  {(isConfirmed || isCancelled) && (
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-xl ${
                      isConfirmed
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {isConfirmed ? 'Stay Approved' : 'Booking Cancelled'}
                    </span>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setExpanded(!expanded)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    expanded
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                      : d
                        ? 'bg-white/10 text-white/70 hover:bg-white/20'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {expanded ? 'Less' : 'Details'}
                </motion.button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className={`border-t ${d ? 'border-white/10' : 'border-gray-200/50'}`}>
                  <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p className={`text-xs uppercase tracking-wider font-semibold mb-3 flex items-center gap-2 ${d ? 'text-white/40' : 'text-gray-400'}`}>
                        <User className="w-3.5 h-3.5" /> Guest Details
                      </p>
                      <div className="space-y-2.5">
                        <div className={`flex items-center justify-between text-sm ${d ? 'text-white/60' : 'text-gray-600'}`}>
                          <span className="flex items-center gap-1.5"><User size={12} /> Name</span>
                          <span className={`font-semibold ${d ? 'text-white/80' : 'text-gray-800'}`}>{reservation.name}</span>
                        </div>
                        <div className={`flex items-center justify-between text-sm ${d ? 'text-white/60' : 'text-gray-600'}`}>
                          <span className="flex items-center gap-1.5"><Mail size={12} /> Email</span>
                          <span className={`font-semibold ${d ? 'text-white/80' : 'text-gray-800'}`}>{reservation.email}</span>
                        </div>
                        <div className={`flex items-center justify-between text-sm ${d ? 'text-white/60' : 'text-gray-600'}`}>
                          <span className="flex items-center gap-1.5"><Phone size={12} /> Phone</span>
                          <span className={`font-semibold ${d ? 'text-white/80' : 'text-gray-800'}`}>{reservation.phone}</span>
                        </div>
                        {reservation.notes && (
                          <div className={`flex items-start justify-between text-sm ${d ? 'text-white/60' : 'text-gray-600'}`}>
                            <span className="flex items-center gap-1.5"><Send size={12} /> Notes</span>
                            <span className={`font-semibold text-right max-w-[200px] ${d ? 'text-white/80' : 'text-gray-800'}`}>{reservation.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className={`text-xs uppercase tracking-wider font-semibold mb-3 flex items-center gap-2 ${d ? 'text-white/40' : 'text-gray-400'}`}>
                        <CalendarDays className="w-3.5 h-3.5" /> Booking Details
                      </p>
                      <div className="space-y-2.5">
                        <div className={`flex items-center justify-between text-sm ${d ? 'text-white/60' : 'text-gray-600'}`}>
                          <span>Check In</span>
                          <span className={`font-semibold ${d ? 'text-white/80' : 'text-gray-800'}`}>
                            {reservation.date ? new Date(reservation.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '—'}
                          </span>
                        </div>
                        <div className={`flex items-center justify-between text-sm ${d ? 'text-white/60' : 'text-gray-600'}`}>
                          <span>Check Out</span>
                          <span className={`font-semibold ${d ? 'text-white/80' : 'text-gray-800'}`}>
                            {reservation.time ? new Date(reservation.time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '—'}
                          </span>
                        </div>
                        <div className={`flex items-center justify-between text-sm ${d ? 'text-white/60' : 'text-gray-600'}`}>
                          <span>Nights</span>
                          <span className={`font-semibold ${d ? 'text-white/80' : 'text-gray-800'}`}>{nightCount}</span>
                        </div>
                        <div className={`flex items-center justify-between text-sm ${d ? 'text-white/60' : 'text-gray-600'}`}>
                          <span>Guests</span>
                          <span className={`font-semibold ${d ? 'text-white/80' : 'text-gray-800'}`}>{reservation.guests || 1}</span>
                        </div>
                        <div className={`pt-2 border-t ${d ? 'border-white/10' : 'border-gray-200/50'} flex items-center justify-between`}>
                          <span className={`text-sm ${d ? 'text-white/60' : 'text-gray-600'}`}>Status</span>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status.border} ${status.bg} ${status.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="sm:hidden px-4 pb-4 flex gap-2">
                    {isPending && (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onCancel?.(reservation)}
                        className="flex-1 px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Cancel Booking
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

function QuickStats({ reservations }) {
  const { darkMode } = useTheme();
  const d = darkMode;

  const stats = [
    { label: 'Pending', value: reservations.filter(r => r.status === 'pending').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/20' },
    { label: 'Confirmed', value: reservations.filter(r => r.status === 'confirmed').length, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/20' },
    { label: 'Cancelled', value: reservations.filter(r => r.status === 'cancelled').length, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/20' },
    { label: 'Total', value: reservations.length, icon: CalendarDays, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/20' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className={`rounded-2xl p-4 backdrop-blur-xl border ${
              d ? 'bg-slate-900/50 border-white/10' : 'bg-white/70 border-gray-200/50 shadow-sm'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className={`text-2xl font-black ${d ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
            <p className={`text-xs ${d ? 'text-white/40' : 'text-gray-500'}`}>{stat.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

function EmptyState({ onExplore }) {
  const { darkMode } = useTheme();
  const d = darkMode;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center py-20 rounded-3xl backdrop-blur-xl border ${
        d ? 'bg-slate-900/50 border-white/10' : 'bg-white/70 border-gray-200/50'
      }`}
    >
      <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-5 ${
        d ? 'bg-white/5' : 'bg-indigo-50'
      }`}>
        <Bed className={`w-9 h-9 ${d ? 'text-white/30' : 'text-indigo-300'}`} />
      </div>
      <h3 className={`text-xl font-bold mb-2 ${d ? 'text-white' : 'text-gray-900'}`}>No Room Reservations Yet</h3>
      <p className={`text-sm mb-6 max-w-xs mx-auto ${d ? 'text-white/40' : 'text-gray-500'}`}>
        Book a premium room or suite and manage all your reservations here.
      </p>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onExplore}
        className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
      >
        Browse Rooms
      </motion.button>
    </motion.div>
  );
}

function LoadingSkeleton() {
  const { darkMode } = useTheme();
  const d = darkMode;
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className={`rounded-3xl overflow-hidden animate-pulse ${
          d ? 'bg-slate-800/50' : 'bg-gray-100'
        }`}>
          <div className="flex flex-col sm:flex-row">
            <div className={`sm:w-56 h-44 ${d ? 'bg-slate-700/50' : 'bg-gray-200'}`} />
            <div className="flex-1 p-5 space-y-3">
              <div className={`h-4 w-24 rounded-lg ${d ? 'bg-slate-700/50' : 'bg-gray-200'}`} />
              <div className={`h-6 w-48 rounded-lg ${d ? 'bg-slate-700/50' : 'bg-gray-200'}`} />
              <div className={`h-3 w-32 rounded-lg ${d ? 'bg-slate-700/50' : 'bg-gray-200'}`} />
              <div className={`h-6 w-64 rounded-lg ${d ? 'bg-slate-700/50' : 'bg-gray-200'}`} />
              <div className={`h-8 w-40 rounded-lg ${d ? 'bg-slate-700/50' : 'bg-gray-200'}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function RoomStatus() {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const d = darkMode;
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const { data } = await axios.get('/api/reservations/my');
      setReservations(data.data || []);
    } catch {
      toast.error('Failed to load reservations');
      setReservations([]);
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  };

  const filteredReservations = filter === 'all'
    ? reservations
    : reservations.filter(r => r.status === filter);

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const handleCancel = (reservation) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">Cancel reservation for <strong>{reservation.name}</strong>?</p>
        <p className="text-xs text-gray-400">Check-in: {reservation.date} &bull; Check-out: {reservation.time}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => { toast.dismiss(t.id); }}
            className="px-4 py-1.5 text-xs font-medium bg-gray-100 dark:bg-slate-700 rounded-lg"
          >
            No
          </button>
          <button
            onClick={async () => {
              try {
                await axios.put(`/api/reservations/${reservation._id}`, { status: 'cancelled' });
                setReservations(prev => prev.map(r =>
                  r._id === reservation._id ? { ...r, status: 'cancelled' } : r
                ));
                toast.dismiss(t.id);
                toast.success('Reservation cancelled');
              } catch {
                toast.dismiss(t.id);
                toast.error('Failed to cancel');
              }
            }}
            className="px-4 py-1.5 text-xs font-medium bg-red-500 text-white rounded-lg"
          >
            Yes, Cancel
          </button>
        </div>
      </div>
    ), { duration: 8000 });
  };

  return (
    <div className="space-y-6">
      <QuickStats reservations={reservations} />

      <div className={`rounded-3xl overflow-hidden backdrop-blur-xl border ${
        d ? 'bg-slate-900/50 border-white/10' : 'bg-white/80 border-gray-200/50 shadow-xl'
      }`}>
        <div className={`p-4 sm:p-6 border-b ${d ? 'border-white/10' : 'border-gray-200/50'}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                d ? 'bg-indigo-500/20' : 'bg-indigo-100'
              }`}>
                <Bed className={`w-5 h-5 ${d ? 'text-indigo-400' : 'text-indigo-600'}`} />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${d ? 'text-white' : 'text-gray-900'}`}>Room Reservations</h2>
                <p className={`text-xs ${d ? 'text-white/40' : 'text-gray-500'}`}>
                  {reservations.length} reservation{reservations.length !== 1 ? 's' : ''} &bull; {reservations.filter(r => r.status === 'confirmed').length} confirmed
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/5 rounded-2xl p-1 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    filter === tab.id
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                      : d
                        ? 'text-white/40 hover:text-white/70'
                        : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  {tab.id !== 'all' && (
                    <span className="ml-1.5 opacity-60">({reservations.filter(r => r.status === tab.id).length})</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {loading ? (
            <LoadingSkeleton />
          ) : filteredReservations.length === 0 ? (
            <EmptyState onExplore={() => window.location.href = '/rooms'} />
          ) : (
            <div className="space-y-4">
              {filteredReservations.map((res, i) => (
                <ReservationCard
                  key={res._id}
                  reservation={res}
                  index={i}
                  onCancel={handleCancel}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}