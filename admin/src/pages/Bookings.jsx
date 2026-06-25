import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiCalendar, FiPackage, FiGift, FiTrendingUp,
  FiUsers, FiStar, FiClock,
  FiRefreshCw, FiSearch, FiPlus, FiEdit2, FiTrash2,
  FiCheck, FiX, FiImage, FiSave,
  FiTag, FiBox, FiLayers, FiChevronRight,
  FiPhone,
} from 'react-icons/fi';

const tabs = [
  { id: 'events', label: 'Events', icon: FiCalendar },
  { id: 'packages', label: 'Packages', icon: FiPackage },
  { id: 'offers', label: 'Offers', icon: FiGift },
];

const defaultFormData = {
  name: '', price: '', capacity: '', description: '', image: '', amenities: '',
  title: '', items: '', popular: false,
  discount: '', valid: '', color: 'from-primary-500 to-primary-400',
  icon: 'FiCalendar', desc: '', featured: false,
  images: [],
};

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

function StatCard({ label, value, icon: Icon, gradient, delay, subtitle }) {
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
          {subtitle && <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  );
}

function TabButton({ tab, active, onClick, index }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.05 }}
      onClick={onClick}
      className={`relative flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
        active
          ? 'text-white shadow-lg'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/5'
      }`}
    >
      {active && (
        <motion.div
          layoutId="tabBg"
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: '0 8px 25px rgba(99, 102, 241, 0.35)',
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      <tab.icon size={16} className="relative z-10" />
      <span className="relative z-10">{tab.label}</span>
    </motion.button>
  );
}

function ListingModal({ isOpen, onClose, onSave, listing, type }) {
  const [form, setForm] = useState(defaultFormData);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (listing) {
      const d = listing.data || {};
      setForm({
        name: d.name || '', price: d.price || '', capacity: d.capacity || '',
        description: d.description || '', image: d.image || '',
        amenities: (d.amenities || []).join(', '),
        title: d.title || '', items: (d.items || []).join(', '),
        popular: d.popular || false,
        discount: d.discount || '', valid: d.valid || '', color: d.color || 'from-primary-500 to-primary-400',
        icon: d.icon || 'FiCalendar', desc: d.desc || '', featured: d.featured || false,
        images: d.images || [],
      });
    } else {
      setForm(defaultFormData);
    }
  }, [listing, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let data;
      switch (type) {
        case 'events':
          data = { title: form.title, desc: form.desc, icon: form.icon };
          break;
        case 'packages':
          data = {
            name: form.name, price: form.price,
            items: form.items.split(',').map(s => s.trim()).filter(Boolean),
            popular: form.popular,
          };
          break;
        case 'offers':
          data = { title: form.title, desc: form.desc, discount: form.discount, valid: form.valid, color: form.color };
          break;
        default: data = {};
      }
      await onSave(data);
      onClose();
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-slate-700/50 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none";
  const labelClass = "text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 block";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700/50 shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 dark:border-slate-700/50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {listing ? 'Edit' : 'Add'} {type.charAt(0).toUpperCase() + type.slice(1)}
                </h2>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                  <FiX size={18} className="text-gray-400" />
                </motion.button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              {type === 'events' && (
                <>
                  <div><label className={labelClass}>Event Title</label><input name="title" value={form.title} onChange={handleChange} className={inputClass} placeholder="e.g. Wine Tasting Evening" required /></div>
                  <div><label className={labelClass}>Description</label><textarea name="desc" value={form.desc} onChange={handleChange} className={`${inputClass} h-20 resize-none`} placeholder="Event description..." required /></div>
                  <div><label className={labelClass}>Icon</label><select name="icon" value={form.icon} onChange={handleChange} className={inputClass}>
                    <option value="FiCalendar">Calendar</option><option value="FiMusic">Music</option><option value="FiGift">Gift</option><option value="FiCamera">Camera</option><option value="FiStar">Star</option>
                  </select></div>
                </>
              )}
              {type === 'packages' && (
                <>
                  <div><label className={labelClass}>Package Name</label><input name="name" value={form.name} onChange={handleChange} className={inputClass} placeholder="e.g. Romantic Getaway" required /></div>
                  <div><label className={labelClass}>Price ($)</label><input name="price" value={form.price} onChange={handleChange} className={inputClass} placeholder="e.g. 3500" required /></div>
                  <div><label className={labelClass}>Items Included (comma separated)</label><textarea name="items" value={form.items} onChange={handleChange} className={`${inputClass} h-20 resize-none`} placeholder="e.g. Suite Stay, Candlelight Dinner, Spa Session" /></div>
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-primary-500/5 border border-primary-500/10 cursor-pointer">
                    <input type="checkbox" name="popular" checked={form.popular} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mark as Popular</span>
                  </label>
                </>
              )}
              {type === 'offers' && (
                <>
                  <div><label className={labelClass}>Offer Title</label><input name="title" value={form.title} onChange={handleChange} className={inputClass} placeholder="e.g. Early Bird Special" required /></div>
                  <div><label className={labelClass}>Description</label><textarea name="desc" value={form.desc} onChange={handleChange} className={`${inputClass} h-20 resize-none`} placeholder="Offer description..." required /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className={labelClass}>Discount</label><input name="discount" value={form.discount} onChange={handleChange} className={inputClass} placeholder="e.g. 30% Off" /></div>
                    <div><label className={labelClass}>Valid Until</label><input name="valid" value={form.valid} onChange={handleChange} className={inputClass} placeholder="e.g. Dec 31, 2025" /></div>
                  </div>
                  <div><label className={labelClass}>Color Gradient</label><select name="color" value={form.color} onChange={handleChange} className={inputClass}>
                    <option value="from-primary-500 to-primary-400">Primary</option>
                    <option value="from-emerald-500 to-teal-400">Emerald</option>
                    <option value="from-amber-500 to-orange-400">Amber</option>
                    <option value="from-rose-500 to-pink-400">Rose</option>
                    <option value="from-violet-500 to-purple-400">Violet</option>
                  </select></div>
                </>
              )}
              <div className="flex gap-3 pt-2">
                <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700/50 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                  Cancel
                </motion.button>
                <motion.button type="submit" disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2 disabled:opacity-50">
                  <FiSave size={14} /> {saving ? 'Saving...' : listing ? 'Update' : 'Create'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ConfirmDelete({ isOpen, onClose, onConfirm, name }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full border border-gray-200 dark:border-slate-700/50 shadow-2xl">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <FiTrash2 size={24} className="text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete {name}?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">This action cannot be undone. The item will be deactivated.</p>
              <div className="flex gap-3">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700/50 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Cancel
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onConfirm}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white text-sm font-semibold shadow-lg shadow-red-500/25">
                  Delete
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400', dot: 'bg-yellow-400', border: 'border-yellow-500/30', glow: 'rgba(234,179,8,0.15)' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-500/20 text-green-400', dot: 'bg-green-400', border: 'border-green-500/30', glow: 'rgba(34,197,94,0.15)' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500/20 text-red-400', dot: 'bg-red-400', border: 'border-red-500/30', glow: 'rgba(239,68,68,0.15)' },
];

function EventsTab({ listings, onAdd, onEdit, onDelete }) {
  const [search, setSearch] = useState('');

  const filtered = (listings || []).filter(e => {
    const d = e.data || {};
    return (d.title || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input type="text" placeholder="Search events..." value={search}
            onChange={e => setSearch(e.target.value)} className="input-glass pl-10 pr-4 py-2.5 text-sm w-full" />
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={onAdd}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white text-xs font-semibold shadow-lg shadow-primary-500/25 flex items-center gap-1.5">
          <FiPlus size={13} /> Add Event
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((evt, i) => {
            const d = evt.data || {};
            return (
              <motion.div key={evt._id} layout
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
              >
                <TiltCard>
                  <motion.div whileHover={{ y: -3 }} className="glass-card group cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center shadow-lg">
                        <FiCalendar size={20} className="text-white" />
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        evt.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>{evt.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">{d.title || 'Untitled'}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{d.desc || ''}</p>
                    <div className="flex gap-2">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => onEdit(evt)}
                        className="flex-1 py-2 rounded-xl glass text-xs font-semibold text-gray-600 dark:text-gray-300 flex items-center justify-center gap-1.5">
                        <FiEdit2 size={12} /> Edit
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => onDelete(evt)}
                        className="flex-1 py-2 rounded-xl border border-red-500/20 text-red-400 text-xs font-semibold flex items-center justify-center gap-1.5">
                        <FiTrash2 size={12} /> Delete
                      </motion.button>
                    </div>
                  </motion.div>
                </TiltCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PackagesTab({ listings, onAdd, onEdit, onDelete }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={onAdd}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white text-xs font-semibold shadow-lg shadow-primary-500/25 flex items-center gap-1.5">
          <FiPlus size={13} /> Add Package
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AnimatePresence mode="popLayout">
          {listings.map((pkg, i) => {
            const d = pkg.data || {};
            return (
              <motion.div key={pkg._id} layout
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.08 }}
              >
                <TiltCard>
                  <motion.div whileHover={{ y: -3 }} className="glass-card group cursor-pointer relative overflow-hidden">
                    {d.popular && (
                      <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rotate-45 shadow-lg" />
                    )}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg">
                          <FiBox size={20} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">{d.name || 'Unnamed'}</h3>
                          <p className="text-2xl font-extrabold text-primary-500">{d.price || '$0'}</p>
                        </div>
                      </div>
                      {d.popular && <FiStar size={18} className="text-amber-400 relative z-10" />}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {(d.items || []).map((item, j) => (
                        <span key={j} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-green-500/10 text-emerald-600 dark:text-emerald-300 border border-green-500/10">
                          <FiCheck size={10} />{item}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => onEdit(pkg)}
                        className="flex-1 py-2 rounded-xl glass text-xs font-semibold text-gray-600 dark:text-gray-300 flex items-center justify-center gap-1.5">
                        <FiEdit2 size={12} /> Edit
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => onDelete(pkg)}
                        className="flex-1 py-2 rounded-xl border border-red-500/20 text-red-400 text-xs font-semibold flex items-center justify-center gap-1.5">
                        <FiTrash2 size={12} /> Delete
                      </motion.button>
                    </div>
                  </motion.div>
                </TiltCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

function OffersTab({ listings, onAdd, onEdit, onDelete }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={onAdd}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white text-xs font-semibold shadow-lg shadow-primary-500/25 flex items-center gap-1.5">
          <FiPlus size={13} /> Add Offer
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {listings.map((offer, i) => {
            const d = offer.data || {};
            return (
              <motion.div key={offer._id} layout
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.08 }}
              >
                <TiltCard>
                  <motion.div whileHover={{ y: -3 }} className="glass-card group cursor-pointer overflow-hidden p-0">
                    <div className={`bg-gradient-to-r ${d.color || 'from-primary-500 to-primary-400'} p-5 text-white`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <FiTag size={18} className="mb-2 opacity-80" />
                          <p className="text-sm font-semibold opacity-80">{d.discount || ''}</p>
                          <h3 className="text-xl font-black mt-1">{d.title || 'Untitled'}</h3>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold backdrop-blur-md border ${
                          offer.isActive ? 'bg-white/20 border-white/30' : 'bg-black/20 border-white/10'
                        }`}>{offer.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                    <div className="p-5 space-y-3">
                      <p className="text-sm text-gray-600 dark:text-gray-300">{d.desc || ''}</p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                        <FiClock size={12} /> {d.valid || 'No expiry'}
                      </div>
                      <div className="flex gap-2">
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => onEdit(offer)}
                          className="flex-1 py-2 rounded-xl glass text-xs font-semibold text-gray-600 dark:text-gray-300 flex items-center justify-center gap-1.5">
                          <FiEdit2 size={12} /> Edit
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => onDelete(offer)}
                          className="flex-1 py-2 rounded-xl border border-red-500/20 text-red-400 text-xs font-semibold flex items-center justify-center gap-1.5">
                          <FiTrash2 size={12} /> Delete
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </TiltCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Bookings() {
  const [activeTab, setActiveTab] = useState('events');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const apiType = activeTab === 'events' ? 'event' : activeTab === 'packages' ? 'package' : 'offer';

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const listingsRes = await axios.get(`/api/listings/${apiType}?all=true`);
      setListings(listingsRes.data.data || []);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [apiType]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = () => { setEditing(null); setModalOpen(true); };

  const handleEdit = (listing) => { setEditing(listing); setModalOpen(true); };

  const handleDelete = (listing) => { setDeleteTarget(listing); };

  const handleSave = async (data) => {
    if (editing) {
      await axios.put(`/api/listings/${editing._id}`, { data });
      toast.success(`${activeTab.slice(0, -1)} updated`);
    } else {
      await axios.post(`/api/listings/${apiType}`, { data });
      toast.success(`${activeTab.slice(0, -1)} created`);
    }
    fetchData();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`/api/listings/${deleteTarget._id}`);
      toast.success(`${activeTab.slice(0, -1)} deactivated`);
      fetchData();
    } catch {
      toast.error('Failed to delete');
    }
    setDeleteTarget(null);
  };

  const activeListings = listings.filter(l => l.isActive);

  return (
    <div className="relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => <FloatingParticle key={i} index={i} />)}
      </div>

      <div className="relative space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-primary-600 to-purple-600 dark:from-white dark:via-primary-400 dark:to-purple-400"
            >Bookings</motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
              className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              Manage events, packages and special offers
            </motion.p>
          </div>
          <motion.button initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={fetchData} className="btn-ghost flex items-center gap-2 px-4 py-2.5 text-sm">
            <FiRefreshCw size={14} /> Refresh
          </motion.button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          <StatCard label="Total Listings" value={listings.length} icon={FiLayers} gradient="from-primary-500 to-purple-500" delay={0.1} subtitle={`${activeListings.length} active`} />
          <StatCard label="Active" value={activeListings.length} icon={FiCheck} gradient="from-emerald-500 to-teal-400" delay={0.15} subtitle="Currently published" />
          <StatCard label="Inactive" value={listings.length - activeListings.length} icon={FiCalendar} gradient="from-amber-500 to-orange-400" delay={0.2} subtitle="Hidden items" />
          <StatCard label={`Avg. ${activeTab === 'events' ? 'Events' : activeTab === 'packages' ? 'Items' : 'Discount'}`}
            value={listings.length}
            icon={FiStar} gradient="from-rose-500 to-pink-400" delay={0.25} subtitle="Per listing" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="flex gap-1.5 p-1.5 rounded-2xl glass w-fit"
        >
          {tabs.map((tab, i) => (
            <TabButton key={tab.id} tab={tab} index={i}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </motion.div>

        <motion.div key={activeTab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 shimmer rounded-xl" />)}
            </div>
          ) : (
            <>
              {activeTab === 'events' && (
                <EventsTab
                  listings={listings}
                  onAdd={handleAdd}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
              {activeTab === 'packages' && (
                <PackagesTab
                  listings={listings}
                  onAdd={handleAdd}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
              {activeTab === 'offers' && (
                <OffersTab
                  listings={listings}
                  onAdd={handleAdd}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </>
          )}
        </motion.div>
      </div>

      <ListingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        listing={editing}
        type={activeTab}
      />

      <ConfirmDelete
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        name={deleteTarget?.data?.name || deleteTarget?.data?.title || 'this item'}
      />
    </div>
  );
}
