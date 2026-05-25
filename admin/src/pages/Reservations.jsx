import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiCalendar, FiClock, FiUsers, FiMail, FiPhone, FiMessageSquare,
  FiTrash2, FiRefreshCw, FiSearch, FiCheck, FiX, FiAlertCircle,
  FiArrowRight, FiChevronRight, FiImage, FiEye, FiDownload, FiXCircle
} from 'react-icons/fi';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400', dot: 'bg-yellow-400', border: 'border-yellow-500/30', glow: 'rgba(234,179,8,0.15)' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-500/20 text-green-400', dot: 'bg-green-400', border: 'border-green-500/30', glow: 'rgba(34,197,94,0.15)' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500/20 text-red-400', dot: 'bg-red-400', border: 'border-red-500/30', glow: 'rgba(239,68,68,0.15)' },
];

function FloatingParticle({ index }) {
  const duration = 6 + Math.random() * 6;
  const delay = Math.random() * 5;
  const size = 2 + Math.random() * 3;
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size, height: size,
        left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
        background: ['rgba(99,102,241,0.3)', 'rgba(168,85,247,0.25)', 'rgba(59,130,246,0.2)', 'rgba(16,185,129,0.2)'][index % 4],
        boxShadow: `0 0 ${size * 4}px ${['rgba(99,102,241,0.15)', 'rgba(168,85,247,0.12)', 'rgba(59,130,246,0.1)', 'rgba(16,185,129,0.1)'][index % 4]}`,
      }}
      animate={{
        y: [0, -(30 + Math.random() * 30), 0],
        x: [0, (Math.random() - 0.5) * 25, 0],
        opacity: [0, 0.6, 0],
        scale: [0, 1.2, 0],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

function TiltCard({ children, className = '' }) {
  const ref = useRef(null);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(y, [0, 1], [5, -5]), { damping: 20, stiffness: 120 });
  const rotateY = useSpring(useTransform(x, [0, 1], [-5, 5]), { damping: 20, stiffness: 120 });

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  }, [x, y]);
  const handleMouseLeave = useCallback(() => { x.set(0.5); y.set(0.5); }, [x, y]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, perspective: 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StatCard({ label, value, icon: Icon, gradient, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-card overflow-hidden"
    >
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ background: `linear-gradient(135deg, ${gradient})` }}
      />
      <div className="relative flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${gradient} shadow-lg`}
          style={{ boxShadow: `0 8px 24px rgba(99,102,241,0.2)` }}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingProof, setViewingProof] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const fileInputRef = useRef(null);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await axios.get(`/api/reservations${params}`);
      setReservations(res.data.data || []);
    } catch {
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/api/reservations/${id}`, { status });
      toast.success(`Reservation ${status}`);
      fetchReservations();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleProofUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selected) return;
    setUploadingProof(true);
    try {
      const formData = new FormData();
      formData.append('paymentProof', file);
      const { data } = await axios.put(`/api/reservations/${selected._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (data.success) {
        setSelected(data.data);
        setReservations(prev => prev.map(r => r._id === data.data._id ? data.data : r));
        toast.success('Proof of payment uploaded');
      }
    } catch {
      toast.error('Failed to upload proof');
    } finally {
      setUploadingProof(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this reservation?')) return;
    try {
      await axios.delete(`/api/reservations/${id}`);
      toast.success('Reservation deleted');
      if (selected?._id === id) setSelected(null);
      fetchReservations();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const totalCount = reservations.length;
  const pendingCount = reservations.filter(r => r.status === 'pending').length;
  const confirmedCount = reservations.filter(r => r.status === 'confirmed').length;
  const cancelledCount = reservations.filter(r => r.status === 'cancelled').length;

  const filtered = searchQuery
    ? reservations.filter(r =>
        r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.phone?.includes(searchQuery)
      )
    : reservations;

  return (
    <div className="relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => <FloatingParticle key={i} index={i} />)}
      </div>

      <div className="relative space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-primary-600 to-gray-900 dark:from-white dark:via-primary-400 dark:to-white">
              Reservations
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Manage table reservations and booking requests</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={fetchReservations}
            className="btn-ghost flex items-center gap-2 px-4 py-2.5 text-sm"
          >
            <FiRefreshCw size={14} className="group-hover:rotate-180 transition-transform" /> Refresh
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          <StatCard label="Total" value={totalCount} icon={FiCalendar} gradient="from-primary-500 to-purple-500" delay={0.1} />
          <StatCard label="Pending" value={pendingCount} icon={FiAlertCircle} gradient="from-yellow-500 to-orange-400" delay={0.15} />
          <StatCard label="Confirmed" value={confirmedCount} icon={FiCheck} gradient="from-green-500 to-emerald-400" delay={0.2} />
          <StatCard label="Cancelled" value={cancelledCount} icon={FiX} gradient="from-red-500 to-rose-400" delay={0.25} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-3"
        >
          <div className="relative flex-1 w-full sm:max-w-xs">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-glass pl-10 pr-4 py-2.5 text-sm w-full"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setStatusFilter(''); setSelected(null); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                !statusFilter
                  ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/25'
                  : 'glass hover:bg-white/10 text-gray-600 dark:text-gray-300'
              }`}
            >
              All
            </motion.button>
            {STATUS_OPTIONS.map(opt => (
              <motion.button
                key={opt.value}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setStatusFilter(opt.value); setSelected(null); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  statusFilter === opt.value
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/25'
                    : 'glass hover:bg-white/10 text-gray-600 dark:text-gray-300'
                }`}
              >
                {opt.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="h-28 shimmer rounded-xl"
                />
              ))
            ) : filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card text-center py-16"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500/20 to-purple-500/20 flex items-center justify-center">
                  <FiCalendar className="text-2xl text-primary-400" />
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">No reservations found</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {searchQuery ? 'No results match your search' : 'Try changing the status filter'}
                </p>
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filtered.map((res, i) => (
                  <motion.div
                    key={res._id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ delay: i * 0.04, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    <TiltCard>
                      <motion.div
                        onClick={() => setSelected(selected?._id === res._id ? null : res)}
                        className={`relative rounded-xl p-[1px] cursor-pointer transition-all duration-300 ${
                          selected?._id === res._id ? 'opacity-90 scale-[1.01]' : ''
                        }`}
                        style={{
                          background: selected?._id === res._id
                            ? 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(168,85,247,0.2), rgba(99,102,241,0.3))'
                            : 'transparent',
                        }}
                      >
                        <div className={`relative rounded-xl p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border transition-all duration-300 ${
                          selected?._id === res._id
                            ? 'border-primary-500/50 shadow-xl shadow-primary-500/10'
                            : 'border-gray-200/50 dark:border-slate-700/30 hover:border-primary-300/30 dark:hover:border-primary-500/20 hover:shadow-lg'
                        }`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center shadow-lg shrink-0"
                                style={{ boxShadow: '0 4px 16px rgba(99,102,241,0.25)' }}
                              >
                                <span className="text-white font-bold text-sm">
                                  {res.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </span>
                              </motion.div>
                              <div className="min-w-0">
                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{res.name}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{res.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {res.paymentProof && (
                                <span title="Proof of payment uploaded">
                                  <FiImage size={14} className="text-emerald-400" />
                                </span>
                              )}
                              <motion.span
                                initial={false}
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 0.3 }}
                                className={`text-[11px] px-3 py-1 rounded-full font-semibold backdrop-blur-sm border ${
                                  STATUS_OPTIONS.find(s => s.value === res.status)?.color + ' ' +
                                  STATUS_OPTIONS.find(s => s.value === res.status)?.border || ''
                                }`}
                              >
                                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                                  STATUS_OPTIONS.find(s => s.value === res.status)?.dot || ''
                                }`} />
                                {res.status}
                              </motion.span>
                              <FiChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                                selected?._id === res._id ? 'rotate-90' : ''
                              }`} />
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1.5">
                              <FiCalendar size={12} className="text-primary-400" /> {res.date}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <FiClock size={12} className="text-purple-400" /> {res.time}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <FiUsers size={12} className="text-emerald-400" /> {res.guests} {res.guests === 1 ? 'guest' : 'guests'}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <FiPhone size={12} className="text-amber-400" /> {res.phone}
                            </span>
                            {res.paymentMethod && (
                              <span className="flex items-center gap-1.5">
                                <FiCheck size={12} className="text-indigo-400" />
                                {res.paymentMethod === 'pay_hotel' ? 'Pay at Hotel'
                                  : res.paymentMethod === 'bank' ? 'Bank Transfer'
                                  : res.paymentMethod === 'telebirr' ? 'Telebirr'
                                  : res.paymentMethod}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </TiltCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key={selected._id}
                  initial={{ opacity: 0, x: 30, scale: 0.97 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 30, scale: 0.97 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <TiltCard>
                    <div className="glass-card p-6 relative overflow-hidden">
                      <div className="absolute inset-0 opacity-[0.03]"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)' }}
                      />
                      <div className="relative">
                        <div className="flex items-center justify-between mb-5">
                          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Details</h2>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border ${
                              STATUS_OPTIONS.find(s => s.value === selected.status)?.color + ' ' +
                              STATUS_OPTIONS.find(s => s.value === selected.status)?.border || ''
                            }`}
                          >
                            <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                              STATUS_OPTIONS.find(s => s.value === selected.status)?.dot || ''
                            }`} />
                            {selected.status}
                          </motion.div>
                        </div>

                        <div className="space-y-5">
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 }}
                            className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-100 dark:border-slate-700/30"
                          >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center shadow-md shrink-0">
                              <span className="text-white font-bold text-xs">
                                {selected.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white text-sm">{selected.name}</p>
                              <p className="text-xs text-gray-500">{selected.email}</p>
                            </div>
                          </motion.div>

                          <div className="grid grid-cols-2 gap-2.5">
                            {[
                              { icon: FiCalendar, label: 'Date', value: selected.date, color: 'from-primary-500 to-primary-400' },
                              { icon: FiClock, label: 'Time', value: selected.time, color: 'from-purple-500 to-purple-400' },
                              { icon: FiUsers, label: 'Guests', value: `${selected.guests} ${selected.guests === 1 ? 'person' : 'people'}`, color: 'from-emerald-500 to-emerald-400' },
                              { icon: FiPhone, label: 'Phone', value: selected.phone, color: 'from-amber-500 to-amber-400' },
                            ].map((item, i) => (
                              <motion.div
                                key={item.label}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + i * 0.05 }}
                                className="p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-100 dark:border-slate-700/30 text-center group hover:border-primary-300/30 dark:hover:border-primary-500/20 transition-colors"
                              >
                                <div className={`w-8 h-8 mx-auto mb-1.5 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shadow-sm`}>
                                  <item.icon size={13} className="text-white" />
                                </div>
                                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{item.value}</p>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400">{item.label}</p>
                              </motion.div>
                            ))}
                          </div>

                          {selected.notes && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.25 }}
                            >
                              <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1.5 font-medium">Special Requests</label>
                              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-100 dark:border-slate-700/30">
                                <FiMessageSquare size={14} className="mt-0.5 text-primary-400 shrink-0" />
                                <p className="text-sm text-gray-700 dark:text-gray-300">{selected.notes}</p>
                              </div>
                            </motion.div>
                          )}

                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.27 }}
                          >
                            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1.5 font-medium">Payment Method</label>
                            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-100 dark:border-slate-700/30">
                              <FiCheck size={14} className="text-emerald-400 shrink-0" />
                              <p className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                                {selected.paymentMethod
                                  ? selected.paymentMethod === 'pay_hotel' ? 'Pay at Hotel'
                                    : selected.paymentMethod === 'bank' ? 'Bank Transfer'
                                    : selected.paymentMethod === 'telebirr' ? 'Telebirr'
                                    : selected.paymentMethod
                                  : 'Not specified'}
                              </p>
                            </div>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.29 }}
                          >
                            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1.5 font-medium">Proof of Payment</label>
                            {selected.paymentProof ? (
                              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-100 dark:border-slate-700/30">
                                <FiImage size={14} className="text-indigo-400 shrink-0" />
                                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 truncate">
                                  {selected.paymentProofName || 'Payment Proof'}
                                </span>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setViewingProof(selected.paymentProof)}
                                  className="p-2 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/30 transition-all"
                                >
                                  <FiEye size={14} />
                                </motion.button>
                                <motion.a
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  href={selected.paymentProof}
                                  download
                                  className="p-2 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/30 transition-all"
                                >
                                  <FiDownload size={14} />
                                </motion.a>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-slate-600/50">
                                <FiImage size={14} className="text-gray-400 shrink-0" />
                                <span className="text-sm text-gray-400 flex-1">
                                  {uploadingProof ? 'Uploading...' : 'No proof uploaded yet'}
                                </span>
                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  accept="image/*,.pdf"
                                  onChange={handleProofUpload}
                                  className="hidden"
                                />
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  disabled={uploadingProof}
                                  onClick={() => fileInputRef.current?.click()}
                                  className="p-2 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/30 transition-all disabled:opacity-50"
                                >
                                  <FiImage size={14} />
                                </motion.button>
                              </div>
                            )}
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="pt-4 border-t border-gray-200 dark:border-slate-700/50"
                          >
                            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-2.5 font-medium">Update Status</label>
                            <div className="flex gap-2">
                              {STATUS_OPTIONS.map(opt => (
                                <motion.button
                                  key={opt.value}
                                  whileHover={{ scale: selected.status === opt.value ? 1 : 1.04 }}
                                  whileTap={{ scale: 0.96 }}
                                  onClick={() => updateStatus(selected._id, opt.value)}
                                  disabled={selected.status === opt.value}
                                  className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                                    selected.status === opt.value
                                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/25 cursor-not-allowed'
                                      : 'glass hover:bg-white/10 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                                  }`}
                                >
                                  {opt.label}
                                </motion.button>
                              ))}
                            </div>
                          </motion.div>

                          <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.35 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleDelete(selected._id)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/30 transition-all mt-1"
                          >
                            <FiTrash2 size={14} /> Delete Reservation
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-card py-16 text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500/10 to-purple-500/10 flex items-center justify-center">
                    <FiCalendar className="text-2xl text-primary-400/60" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Select a reservation to view details</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {viewingProof && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewingProof(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700/50">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FiImage className="text-indigo-400" />
                  Proof of Payment
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setViewingProof(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                  <FiXCircle size={18} className="text-gray-400" />
                </motion.button>
              </div>
              <div className="p-4 flex items-center justify-center bg-gray-100 dark:bg-slate-800/50">
                {viewingProof.match(/\.(pdf)$/i) ? (
                  <div className="text-center py-12">
                    <FiImage size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-gray-500 mb-4">PDF file uploaded as payment proof</p>
                    <a
                      href={viewingProof}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 transition-colors"
                    >
                      <FiEye size={16} /> Open PDF
                    </a>
                  </div>
                ) : (
                  <img
                    src={viewingProof}
                    alt="Payment Proof"
                    className="max-h-[70vh] w-auto rounded-xl object-contain"
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
