import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Loading from '../components/common/Loading';
import {
  CalendarDays, Clock, Users, Phone, Mail, Search, Filter,
  ChevronDown, ChevronRight, MoreHorizontal, X, CheckCircle,
  AlertCircle, Trash2, Edit, Eye, RefreshCw, Bed, MapPin,
  Star, ArrowLeft, Send, AlertTriangle, Download, FilterX
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    border: 'border-amber-300/50 dark:border-amber-700/30',
    dot: 'bg-amber-500',
    step: 1,
  },
  confirmed: {
    label: 'Confirmed',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    border: 'border-emerald-300/50 dark:border-emerald-700/30',
    dot: 'bg-emerald-500',
    step: 2,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/30',
    border: 'border-red-300/50 dark:border-red-700/30',
    dot: 'bg-red-500',
    step: 0,
  },
};

function AnimatedCounter({ value, duration = 1500 }) {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    let startTime = null;
    let raf = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor((value || 0) * ease));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [value, duration]);
  return <span>{displayValue.toLocaleString()}</span>;
}

function QuickStats({ reservations, darkMode }) {
  const d = darkMode;
  const stats = [
    { label: 'Total', value: reservations.length, icon: CalendarDays, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
    { label: 'Pending', value: reservations.filter(r => r.status === 'pending').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { label: 'Confirmed', value: reservations.filter(r => r.status === 'confirmed').length, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { label: 'Cancelled', value: reservations.filter(r => r.status === 'cancelled').length, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className={`relative overflow-hidden rounded-2xl p-5 ${
              d
                ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 shadow-xl'
                : 'bg-white border border-gray-100 shadow-lg hover:shadow-xl'
            }`}
          >
            <div className={`absolute -top-8 -right-8 w-20 h-20 rounded-full opacity-20 ${stat.bg}`} />
            <div className="relative">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <motion.p
                key={stat.value}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className={`text-2xl font-black mb-1 ${d ? 'text-white' : 'text-gray-900'}`}
              >
                <AnimatedCounter value={stat.value} />
              </motion.p>
              <p className={`text-xs font-medium ${d ? 'text-white/40' : 'text-gray-500'}`}>
                {stat.label}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function BookingCard({ reservation, index, onUpdateStatus, onCancel, onDelete, darkMode }) {
  const d = darkMode;
  const [showActions, setShowActions] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [processing, setProcessing] = useState(false);

  const status = STATUS_CONFIG[reservation.status] || STATUS_CONFIG.pending;
  const isPending = reservation.status === 'pending';
  const isConfirmed = reservation.status === 'confirmed';
  const isCancelled = reservation.status === 'cancelled';

  const handleStatusChange = async (newStatus) => {
    setProcessing(true);
    try {
      await onUpdateStatus(reservation._id, newStatus);
      toast.success(`Booking ${newStatus} successfully`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setProcessing(false);
      setShowActions(false);
    }
  };

  const handleCancel = async () => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">Cancel this reservation?</p>
        <p className="text-xs text-gray-400">Guest: {reservation.name} &bull; Room: {reservation.roomName || 'N/A'}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-1.5 text-xs font-medium bg-gray-100 dark:bg-slate-700 rounded-lg"
          >
            No
          </button>
          <button
            onClick={async () => {
              try {
                await onCancel(reservation._id);
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
    ), { duration: 10000 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      layout
    >
      <div className={`group relative overflow-hidden rounded-3xl transition-all duration-300 ${
        isConfirmed
          ? d
            ? 'bg-gradient-to-br from-emerald-900/20 via-slate-800/80 to-slate-900/80 border-2 border-emerald-500/30 shadow-xl shadow-emerald-500/5'
            : 'bg-white border-2 border-emerald-200/50 shadow-xl shadow-emerald-500/5'
          : isCancelled
            ? d
              ? 'bg-gradient-to-br from-red-900/15 via-slate-800/60 to-slate-900/60 border border-red-500/20'
              : 'bg-white/70 border border-red-200/30'
            : d
              ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 shadow-lg'
              : 'bg-white border border-gray-100 shadow-lg hover:shadow-xl'
      }`}>
        <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-5 ${
          isConfirmed ? 'bg-emerald-400' : isPending ? 'bg-amber-400' : 'bg-red-400'
        }`} />

        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-4">
              <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden ${
                d ? 'bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-pink-500/10' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'
              }`}>
                <Bed className={`w-8 h-8 ${d ? 'text-indigo-400/60' : 'text-indigo-400/50'}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status.border} ${status.bg} ${status.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                    {status.label}
                  </span>
                  {reservation.roomName && (
                    <span className={`text-xs font-semibold ${d ? 'text-indigo-400' : 'text-indigo-600'}`}>
                      {reservation.roomName}
                    </span>
                  )}
                </div>

                <h3 className={`text-lg font-bold truncate ${d ? 'text-white' : 'text-gray-900'}`}>
                  {reservation.name || 'Guest'}
                </h3>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                  {reservation.email && (
                    <span className={`flex items-center gap-1 text-xs ${d ? 'text-white/50' : 'text-gray-500'}`}>
                      <Mail className="w-3.5 h-3.5" />
                      {reservation.email}
                    </span>
                  )}
                  {reservation.phone && (
                    <span className={`flex items-center gap-1 text-xs ${d ? 'text-white/50' : 'text-gray-500'}`}>
                      <Phone className="w-3.5 h-3.5" />
                      {reservation.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:items-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setExpanded(!expanded)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  expanded
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                    : d
                      ? 'bg-white/10 text-white/70 hover:bg-white/15'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {expanded ? 'Less' : 'Details'}
              </motion.button>

              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowActions(!showActions)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    d ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                  }`}
                >
                  <MoreHorizontal className={`w-4 h-4 ${d ? 'text-white/50' : 'text-gray-400'}`} />
                </motion.button>

                <AnimatePresence>
                  {showActions && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                      className={`absolute right-0 top-12 w-56 rounded-2xl overflow-hidden border shadow-xl z-30 ${
                        d ? 'bg-slate-800 border-white/10' : 'bg-white border-gray-200'
                      }`}
                    >
                      {isPending && (
                        <button
                          onClick={() => handleStatusChange('confirmed')}
                          disabled={processing}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all ${
                            d ? 'hover:bg-white/5 text-emerald-400' : 'hover:bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Confirm Booking
                        </button>
                      )}
                      {isConfirmed && (
                        <button
                          onClick={() => handleStatusChange('pending')}
                          disabled={processing}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all ${
                            d ? 'hover:bg-white/5 text-amber-400' : 'hover:bg-amber-50 text-amber-600'
                          }`}
                        >
                          <Clock className="w-4 h-4" />
                          Mark as Pending
                        </button>
                      )}
                      {!isCancelled && (
                        <button
                          onClick={handleCancel}
                          disabled={processing}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all ${
                            d ? 'hover:bg-white/5 text-red-400' : 'hover:bg-red-50 text-red-600'
                          }`}
                        >
                          <AlertTriangle className="w-4 h-4" />
                          Cancel Booking
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl ${
            d ? 'bg-white/5' : 'bg-gray-50/50'
          }`}>
            <div>
              <p className={`text-[10px] font-medium uppercase tracking-wider mb-1 ${d ? 'text-white/40' : 'text-gray-400'}`}>
                Check In
              </p>
              <div className={`flex items-center gap-1.5 text-sm font-bold ${d ? 'text-white/80' : 'text-gray-700'}`}>
                <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
                {reservation.date ? new Date(reservation.date).toLocaleDateString() : '—'}
              </div>
            </div>
            <div>
              <p className={`text-[10px] font-medium uppercase tracking-wider mb-1 ${d ? 'text-white/40' : 'text-gray-400'}`}>
                Check Out
              </p>
              <div className={`flex items-center gap-1.5 text-sm font-bold ${d ? 'text-white/80' : 'text-gray-700'}`}>
                <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
                {reservation.time ? new Date(reservation.time).toLocaleDateString() : '—'}
              </div>
            </div>
            <div>
              <p className={`text-[10px] font-medium uppercase tracking-wider mb-1 ${d ? 'text-white/40' : 'text-gray-400'}`}>
                Guests
              </p>
              <div className={`flex items-center gap-1.5 text-sm font-bold ${d ? 'text-white/80' : 'text-gray-700'}`}>
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                {reservation.guests || 1} {reservation.guests === 1 ? 'guest' : 'guests'}
              </div>
            </div>
            <div>
              <p className={`text-[10px] font-medium uppercase tracking-wider mb-1 ${d ? 'text-white/40' : 'text-gray-400'}`}>
                Payment
              </p>
              <div className={`flex items-center gap-1.5 text-sm font-bold ${d ? 'text-white/80' : 'text-gray-700'}`}>
                <span className={`w-2 h-2 rounded-full ${
                  reservation.paymentMethod && reservation.paymentMethod !== 'pay_hotel'
                    ? 'bg-emerald-500'
                    : 'bg-amber-500'
                }`} />
                {reservation.paymentMethod
                  ? reservation.paymentMethod.replace('_', ' ')
                  : 'Pay at Hotel'}
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
                <div className={`mt-4 pt-4 border-t ${d ? 'border-white/10' : 'border-gray-100'}`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 ${
                        d ? 'text-white/40' : 'text-gray-400'
                      }`}>
                        <User className="w-3.5 h-3.5" /> Guest Details
                      </p>
                      <div className="space-y-2">
                        <div className={`flex items-center justify-between text-sm ${d ? 'text-white/60' : 'text-gray-600'}`}>
                          <span>Name</span>
                          <span className={`font-semibold ${d ? 'text-white' : 'text-gray-900'}`}>{reservation.name || '—'}</span>
                        </div>
                        <div className={`flex items-center justify-between text-sm ${d ? 'text-white/60' : 'text-gray-600'}`}>
                          <span>Email</span>
                          <span className={`font-semibold ${d ? 'text-white' : 'text-gray-900'}`}>{reservation.email || '—'}</span>
                        </div>
                        <div className={`flex items-center justify-between text-sm ${d ? 'text-white/60' : 'text-gray-600'}`}>
                          <span>Phone</span>
                          <span className={`font-semibold ${d ? 'text-white' : 'text-gray-900'}`}>{reservation.phone || '—'}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 ${
                        d ? 'text-white/40' : 'text-gray-400'
                      }`}>
                        <CalendarDays className="w-3.5 h-3.5" /> Booking Info
                      </p>
                      <div className="space-y-2">
                        <div className={`flex items-center justify-between text-sm ${d ? 'text-white/60' : 'text-gray-600'}`}>
                          <span>Room</span>
                          <span className={`font-semibold ${d ? 'text-white' : 'text-gray-900'}`}>{reservation.roomName || '—'}</span>
                        </div>
                        <div className={`flex items-center justify-between text-sm ${d ? 'text-white/60' : 'text-gray-600'}`}>
                          <span>Status</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${status.bg} ${status.color}`}>
                            <span className={`w-1 h-1 rounded-full ${status.dot}`} />
                            {status.label}
                          </span>
                        </div>
                        {reservation.notes && (
                          <div className={`text-sm ${d ? 'text-white/60' : 'text-gray-600'}`}>
                            <span>Notes: </span>
                            <span className={`font-semibold ${d ? 'text-white' : 'text-gray-900'}`}>{reservation.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ darkMode }) {
  const d = darkMode;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center py-20 rounded-3xl ${
        d ? 'bg-slate-800/50 border border-white/10' : 'bg-white/60 border border-gray-100'
      }`}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className={`w-20 h-20 mx-auto mb-5 rounded-3xl flex items-center justify-center ${
          d ? 'bg-white/10' : 'bg-indigo-50'
        }`}
      >
        <CalendarDays className={`w-10 h-10 ${d ? 'text-white/30' : 'text-indigo-300'}`} />
      </motion.div>
      <h3 className={`text-xl font-bold mb-2 ${d ? 'text-white' : 'text-gray-900'}`}>No Bookings Found</h3>
      <p className={`text-sm mb-6 max-w-xs mx-auto ${d ? 'text-white/40' : 'text-gray-500'}`}>
        {searchTerm || filter !== 'all'
          ? 'Try adjusting your search or filter criteria'
          : 'Room reservations will appear here when customers book'}
      </p>
    </motion.div>
  );
}

export default function AdminBookings() {
  const { darkMode } = useTheme();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const d = darkMode;

  const fetchReservations = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/reservations`);
      setReservations(data.data || []);
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchReservations();
    setTimeout(() => setIsRefreshing(false), 600);
    toast.success('Bookings refreshed');
  };

  const updateStatus = async (id, status) => {
    await axios.put(`${API_BASE}/api/reservations/${id}`, { status });
    setReservations(prev => prev.map(r =>
      r._id === id ? { ...r, status } : r
    ));
  };

  const cancelReservation = async (id) => {
    await axios.put(`${API_BASE}/api/reservations/${id}`, { status: 'cancelled' });
    setReservations(prev => prev.map(r =>
      r._id === id ? { ...r, status: 'cancelled' } : r
    ));
  };

  const filteredReservations = useMemo(() => {
    let result = reservations;
    if (filter !== 'all') {
      result = result.filter(r => r.status === filter);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(r =>
        (r.name?.toLowerCase().includes(term)) ||
        (r.email?.toLowerCase().includes(term)) ||
        (r.phone?.toLowerCase().includes(term)) ||
        (r.roomName?.toLowerCase().includes(term))
      );
    }
    return result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [reservations, filter, searchTerm]);

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

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
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    d ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    BOOKING MANAGEMENT
                  </span>
                </div>
                <h1 className={`text-3xl font-black mb-1 ${d ? 'text-white' : 'text-gray-900'}`}>
                  Room Bookings
                </h1>
                <p className={`text-base ${d ? 'text-white/50' : 'text-gray-500'}`}>
                  Manage all customer room reservations
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
                Refresh
              </motion.button>
            </div>

            <QuickStats reservations={reservations} darkMode={darkMode} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className={`mb-6 rounded-3xl overflow-hidden p-4 sm:p-5 ${
              d
                ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10'
                : 'bg-white border border-gray-100 shadow-lg'
            }`}
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className={`relative flex items-center gap-2 px-4 py-2.5 rounded-2xl ${
                  d ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-100'
                }`}>
                  <Search className={`w-4 h-4 ${d ? 'text-white/40' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    placeholder="Search by name, email, phone, or room..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`flex-1 bg-transparent text-sm outline-none ${
                      d ? 'text-white placeholder-white/30' : 'text-gray-900 placeholder-gray-400'
                    }`}
                  />
                  {searchTerm && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSearchTerm('')}
                      className={`p-1 rounded-lg ${
                        d ? 'hover:bg-white/10' : 'hover:bg-gray-200'
                      }`}
                    >
                      <X className={`w-3.5 h-3.5 ${d ? 'text-white/40' : 'text-gray-400'}`} />
                    </motion.button>
                  )}
                </div>
              </div>

              <div className={`flex items-center gap-1 p-1 rounded-2xl overflow-x-auto ${
                d ? 'bg-white/5' : 'bg-gray-50'
              }`}>
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFilter(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      filter === tab.id
                        ? d
                          ? 'bg-slate-700 text-white shadow-lg'
                          : 'bg-white text-indigo-600 shadow-sm'
                        : d
                          ? 'text-white/40 hover:text-white/60'
                          : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                    {tab.id !== 'all' && (
                      <span className="ml-1.5 opacity-60">
                        ({reservations.filter(r => r.status === tab.id).length})
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          <AnimatePresence mode="popLayout">
            {filteredReservations.length === 0 ? (
              <EmptyState
                key="empty"
                darkMode={darkMode}
              />
            ) : (
              <motion.div
                key="list"
                className="space-y-4"
              >
                {filteredReservations.map((res, i) => (
                  <BookingCard
                    key={res._id}
                    reservation={res}
                    index={i}
                    onUpdateStatus={updateStatus}
                    onCancel={cancelReservation}
                    darkMode={darkMode}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
