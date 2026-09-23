import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiAlertTriangle, FiPackage,
  FiBox, FiTrendingUp, FiCalendar, FiClock, FiAward, FiDownload,
  FiRefreshCw, FiMinus, FiActivity, FiDollarSign, FiLayers,
  FiX, FiChevronRight, FiFileText
} from 'react-icons/fi';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip
} from 'recharts';
import { exportInventoryPdf } from '../utils/pdfReport';

const CATEGORIES = ['Produce', 'Meat', 'Dairy', 'Dry Goods', 'Beverages', 'Other', 'Juice fruit', 'Food fruit', 'Spices', 'Coffee', 'Liquid'];

const CATEGORY_COLORS = {
  Produce: '#34d399',
  Meat: '#f87171',
  Dairy: '#fbbf24',
  'Dry Goods': '#a78bfa',
  Beverages: '#38bdf8',
  Other: '#94a3b8',
  'Juice fruit': '#fb923c',
  'Food fruit': '#f472b6',
  Spices: '#d97706',
  Coffee: '#a16207',
  Liquid: '#06b6d4'
};

const MOVEMENT_LABELS = {
  stock_in: 'Stock In',
  stock_out: 'Stock Out',
  adjustment: 'Adjustment',
  created: 'Created',
  updated: 'Updated',
  deleted: 'Deleted'
};

const MOVEMENT_COLORS = {
  stock_in: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)' },
  created: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)' },
  stock_out: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)' },
  deleted: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)' },
  adjustment: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
  updated: { color: '#818cf8', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)' }
};

function weekRangeLabel() {
  const d = new Date();
  const day = d.getDay();
  const start = new Date(d);
  start.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
  return `${format(start, 'MMM d')} - ${format(d, 'MMM d, yyyy')}`;
}

const REPORT_TABS = [
  { key: 'day', label: 'Daily', icon: FiClock, periodLabel: () => `Today, ${format(new Date(), 'MMMM d, yyyy')}`, accent: '#38bdf8' },
  { key: 'week', label: 'Weekly', icon: FiTrendingUp, periodLabel: () => `This Week (${weekRangeLabel()})`, accent: '#a78bfa' },
  { key: 'month', label: 'Monthly', icon: FiCalendar, periodLabel: () => format(new Date(), 'MMMM yyyy'), accent: '#34d399' },
  { key: 'year', label: 'Yearly', icon: FiAward, periodLabel: () => format(new Date(), 'yyyy'), accent: '#fbbf24' }
];

function AnimatedCounter({ value, prefix = '', suffix = '', duration = 1000 }) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const target = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : Number(value);
    if (isNaN(target)) { setDisplay(value); return; }
    const from = prevRef.current;
    prevRef.current = target;
    const startTime = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(from + (target - from) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value, duration]);

  return <span>{prefix}{display.toLocaleString()}{suffix}</span>;
}

function CustomTooltip({ active, payload, label, money = false }) {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-xl px-4 py-3 shadow-2xl"
        style={{
          background: 'rgba(15,23,42,0.95)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <p className="text-xs font-medium text-gray-400 mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-sm font-semibold" style={{ color: entry.color || '#6366f1' }}>
            {money ? `ETB ${Number(entry.value).toLocaleString()}` : entry.value} {entry.name !== entry.dataKey ? entry.name : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.06, type: 'spring', stiffness: 120, damping: 16 }
  })
};

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activePeriod, setActivePeriod] = useState('day');
  const [report, setReport] = useState(null);
  const [movements, setMovements] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', category: 'Other', unit: 'pcs', quantity: 0,
    minStockLevel: 1, pricePerUnit: 0
  });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/inventory');
      setItems(data.data || []);
    } catch (error) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReport = useCallback(async (period) => {
    setReportLoading(true);
    try {
      const [reportRes, movRes] = await Promise.all([
        axios.get(`/api/inventory/report?period=${period}`),
        axios.get(`/api/inventory/movements?period=${period}`)
      ]);
      setReport(reportRes.data.data);
      setMovements(movRes.data.data || []);
    } catch (error) {
      setReport(null);
      setMovements([]);
      toast.error('Failed to load inventory report');
    } finally {
      setReportLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => { fetchReport(activePeriod); }, [activePeriod, fetchReport]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        quantity: Number(formData.quantity),
        minStockLevel: Number(formData.minStockLevel),
        pricePerUnit: Number(formData.pricePerUnit)
      };
      if (editing) {
        await axios.put(`/api/inventory/${editing._id}`, payload);
        toast.success('Item updated', { style: { background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' } });
      } else {
        await axios.post('/api/inventory', payload);
        toast.success('Item created', { style: { background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' } });
      }
      setShowModal(false);
      setEditing(null);
      resetForm();
      fetchItems();
      fetchReport(activePeriod);
    } catch (error) {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete ${item.name} from inventory?`)) return;
    try {
      await axios.delete(`/api/inventory/${item._id}`);
      toast.success('Item deleted');
      fetchItems();
      fetchReport(activePeriod);
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const updateStock = async (item, delta) => {
    try {
      const newQty = Math.max(0, Number(item.quantity) + delta);
      await axios.put(`/api/inventory/${item._id}/stock`, { quantity: newQty, reason: delta > 0 ? 'Manual restock' : 'Manual deduction' });
      toast.success(delta > 0 ? `Restocked +${delta}` : `Deducted ${Math.abs(delta)}`);
      fetchItems();
      fetchReport(activePeriod);
    } catch (error) {
      toast.error('Failed to update stock');
    }
  };

  const openEdit = (item) => {
    setEditing(item);
    setFormData({
      name: item.name, category: item.category, unit: item.unit,
      quantity: item.quantity, minStockLevel: item.minStockLevel || 1,
      pricePerUnit: item.pricePerUnit
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', category: 'Other', unit: 'pcs', quantity: 0, minStockLevel: 1, pricePerUnit: 0 });
  };

  const filtered = useMemo(() => {
    return items.filter(i => {
      const matchesSearch = !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.supplier?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || i.category === categoryFilter;
      const matchesLow = !lowStockOnly || i.quantity <= i.minStockLevel;
      return matchesSearch && matchesCategory && matchesLow;
    });
  }, [items, search, categoryFilter, lowStockOnly]);

  const stats = useMemo(() => {
    const totalValue = items.reduce((s, i) => s + (i.quantity || 0) * (i.pricePerUnit || 0), 0);
    const totalUnits = items.reduce((s, i) => s + (i.quantity || 0), 0);
    const lowStock = items.filter(i => i.quantity <= i.minStockLevel).length;
    const outOfStock = items.filter(i => i.quantity <= 0).length;
    return { itemCount: items.length, totalValue, totalUnits, lowStock, outOfStock };
  }, [items]);

  const categoryShare = useMemo(() => {
    return CATEGORIES.map(cat => ({
      name: cat,
      value: items.filter(i => i.category === cat).length,
      units: items.filter(i => i.category === cat).reduce((s, i) => s + (i.quantity || 0), 0)
    })).filter(d => d.value > 0);
  }, [items]);

  const categoryValue = useMemo(() => {
    return CATEGORIES.map(cat => {
      const rows = items.filter(i => i.category === cat);
      return {
        name: cat,
        value: Math.round(rows.reduce((s, i) => s + (i.quantity || 0) * (i.pricePerUnit || 0), 0))
      };
    }).filter(d => d.value > 0);
  }, [items]);

  const stockRatio = (item) => {
    const base = Math.max(item.minStockLevel, 1);
    return Math.min(100, Math.round((item.quantity / base) * 100));
  };

  const stockStatus = (item) => {
    if (item.quantity <= 0) return { label: 'Out of Stock', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' };
    if (item.quantity <= item.minStockLevel) return { label: 'Low Stock', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' };
    return { label: 'In Stock', color: '#10b981', bg: 'rgba(16,185,129,0.12)' };
  };

  const handleExportPdf = () => {
    const tab = REPORT_TABS.find(t => t.key === activePeriod);
    exportInventoryPdf({
      title: tab.label,
      periodLabel: tab.periodLabel(),
      items,
      movements,
      snapshot: report?.snapshot,
      movementSummary: report?.movements
    });
  };

  const statCards = [
    { title: 'Total Items', value: stats.itemCount, icon: FiPackage, gradient: ['#6366f1', '#8b5cf6'], glow: 'rgba(99,102,241,0.25)' },
    { title: 'Stock Value', value: stats.totalValue, prefix: 'ETB ', icon: FiDollarSign, gradient: ['#10b981', '#34d399'], glow: 'rgba(16,185,129,0.25)' },
    { title: 'Total Units', value: stats.totalUnits, icon: FiLayers, gradient: ['#f59e0b', '#fbbf24'], glow: 'rgba(245,158,11,0.25)' },
    { title: 'Low Stock Alerts', value: stats.lowStock, icon: FiAlertTriangle, gradient: ['#ef4444', '#f87171'], glow: 'rgba(239,68,68,0.25)' }
  ];

  const renderMovementTable = (rows) => (
    <div className="overflow-x-auto -mx-6">
      <div className="overflow-y-auto" style={{ maxHeight: 340 }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Item', 'Type', 'Change', 'Qty', 'Reason', 'By', 'Date'].map((header) => (
                <th key={header} className="text-left py-3 px-6 text-xs font-medium uppercase tracking-widest text-gray-500 sticky top-0" style={{ background: 'rgba(15,23,42,0.98)' }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-14 text-center">
                  <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
                    <FiActivity size={22} className="text-gray-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-400">No stock movements recorded</p>
                  <p className="text-xs mt-1 text-gray-500">Adjust stock using the item cards to start tracking</p>
                </td>
              </tr>
            ) : (
              rows.map((m) => {
                const mc = MOVEMENT_COLORS[m.type] || MOVEMENT_COLORS.adjustment;
                const positive = m.change >= 0;
                return (
                  <motion.tr
                    key={m._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ background: mc.bg, border: `1px solid ${mc.border}`, color: mc.color }}>
                          <FiBox size={14} />
                        </div>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{m.itemName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: mc.bg, color: mc.color, border: `1px solid ${mc.border}` }}>
                        {MOVEMENT_LABELS[m.type] || m.type}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <span className={`text-sm font-bold tabular-nums ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {positive ? '+' : ''}{m.change}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-sm text-gray-400 tabular-nums">{m.qtyBefore} → {m.qtyAfter}</td>
                    <td className="py-3 px-6 text-sm text-gray-500">{m.reason || '-'}</td>
                    <td className="py-3 px-6 text-sm text-gray-500">{m.createdBy || 'System'}</td>
                    <td className="py-3 px-6 text-sm text-gray-500">{format(new Date(m.createdAt), 'MMM d, h:mm a')}</td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl glass p-6 md:p-8"
      >
        <div className="absolute -top-24 -right-16 w-96 h-96 rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle, #10b981, transparent 70%)' }} />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5" style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot inline-block" />
                Live Inventory
              </span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              Inventory Management
            </h1>
            <p className="text-sm mt-2 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              <FiRefreshCw size={12} className="text-indigo-400" />
              {stats.itemCount} items · {stats.lowStock} low stock · {stats.outOfStock} out of stock
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <FiClock size={14} className="text-emerald-400" />
              <span style={{ color: 'var(--text-secondary)' }}>{format(new Date(), 'MMMM d, yyyy')}</span>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 4px 24px rgba(99,102,241,0.35)' }}
              whileTap={{ scale: 0.96 }}
              onClick={() => { setEditing(null); resetForm(); setShowModal(true); }}
              className="btn-primary flex items-center gap-2"
            >
              <FiPlus size={18} /> Add Item
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -6, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
            className="glass-card group relative overflow-hidden"
          >
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-[0.06] group-hover:opacity-[0.1] transition-opacity duration-500"
              style={{ background: `radial-gradient(circle, ${stat.gradient[0]}, transparent 70%)` }}
            />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">{stat.title}</p>
                <p className="text-3xl font-bold mt-2 tracking-tight tabular-nums" style={{ background: `linear-gradient(135deg, ${stat.gradient[0]}, ${stat.gradient[1]})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  <AnimatedCounter value={stat.value} prefix={stat.prefix || ''} />
                </p>
              </div>
              <motion.div
                whileHover={{ rotate: 12, scale: 1.1 }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${stat.gradient[0]}, ${stat.gradient[1]})`, boxShadow: `0 8px 28px ${stat.glow}` }}
              >
                <stat.icon size={22} className="text-white" />
              </motion.div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `linear-gradient(90deg, transparent, ${stat.gradient[0]}, transparent)` }}
            />
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card"
          whileHover={{ y: -3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FiTrendingUp size={16} className="text-indigo-400" />
                Category Distribution
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Items across categories</p>
            </div>
          </div>
          {categoryShare.length === 0 ? (
            <div className="h-[240px] flex items-center justify-center text-sm text-gray-500">No data yet</div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={240}>
                <PieChart>
                  <Pie
                    data={categoryShare}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={4}
                    strokeWidth={0}
                    animationDuration={900}
                  >
                    {categoryShare.map((entry) => (
                      <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <ReTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2.5 min-w-0">
                {categoryShare.map((entry) => {
                  const total = categoryShare.reduce((s, d) => s + d.value, 0);
                  const pct = Math.round((entry.value / total) * 100);
                  return (
                    <div key={entry.name}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                          <span className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLORS[entry.name] || '#94a3b8' }} />
                          {entry.name}
                        </span>
                        <span className="font-medium tabular-nums" style={{ color: 'var(--text-primary)' }}>{entry.value} · {pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                          className="h-full rounded-full"
                          style={{ background: CATEGORY_COLORS[entry.name] || '#94a3b8' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card"
          whileHover={{ y: -3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FiDollarSign size={16} className="text-emerald-400" />
                Stock Value by Category
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Estimated value (ETB)</p>
            </div>
          </div>
          {categoryValue.length === 0 ? (
            <div className="h-[240px] flex items-center justify-center text-sm text-gray-500">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={categoryValue} layout="vertical" margin={{ left: 10, right: 20, top: 4, bottom: 4 }}>
                <defs>
                  <linearGradient id="valueGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#34d399" stopOpacity={0.95} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" stroke="rgba(255,255,255,0.15)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `ETB ${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.15)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={84} />
                <ReTooltip content={<CustomTooltip money />} cursor={{ fill: 'rgba(16,185,129,0.08)' }} />
                <Bar dataKey="value" fill="url(#valueGrad)" radius={[0, 6, 6, 0]} barSize={18} animationDuration={900} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Inventory Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card overflow-hidden"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FiBox size={16} className="text-indigo-400" />
              Inventory Items
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {filtered.length} of {items.length} items shown
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 flex-1 lg:max-w-xl">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2" size={15} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search items or supplier..."
                className="input-glass pl-10"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-glass sm:w-40 cursor-pointer"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button
              onClick={() => setLowStockOnly((v) => !v)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap ${lowStockOnly ? '' : 'opacity-70'}`}
              style={{
                background: lowStockOnly ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.04)',
                color: lowStockOnly ? '#fbbf24' : 'var(--text-secondary)',
                border: `1px solid ${lowStockOnly ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.08)'}`
              }}
            >
              <FiAlertTriangle size={12} /> Low Stock
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 shimmer rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <FiPackage size={28} style={{ color: '#818cf8' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>No inventory items found</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {search || categoryFilter !== 'All' || lowStockOnly ? 'Try adjusting your filters' : 'Click "Add Item" to create your first item'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <div className="overflow-y-auto" style={{ maxHeight: 460 }}>
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Item', 'Category', 'Stock Level', 'Unit Price', 'Stock Value', 'Status', 'Actions'].map((header) => (
                      <th key={header} className="text-left py-3 px-6 text-xs font-medium uppercase tracking-widest text-gray-500 sticky top-0" style={{ background: 'rgba(15,23,42,0.98)' }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, i) => {
                    const status = stockStatus(item);
                    const pct = stockRatio(item);
                    const value = (item.quantity || 0) * (item.pricePerUnit || 0);
                    return (
                      <motion.tr
                        key={item._id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.02, type: 'spring', stiffness: 200, damping: 26 }}
                        className="group"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                        whileHover={{ background: 'rgba(99,102,241,0.04)' }}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold shrink-0"
                              style={{ background: `linear-gradient(135deg, ${CATEGORY_COLORS[item.category] || '#94a3b8'}26, transparent)`, border: `1px solid ${CATEGORY_COLORS[item.category] || '#94a3b8'}33`, color: CATEGORY_COLORS[item.category] || '#94a3b8' }}>
                              {item.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                                {item.supplier ? `${item.supplier} · ` : ''}{item.unit}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: CATEGORY_COLORS[item.category] || 'var(--text-secondary)' }}>
                            {item.category}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-[100px]">
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-sm font-bold tabular-nums ${status.label === 'In Stock' ? 'text-emerald-400' : status.label === 'Low Stock' ? 'text-amber-400' : 'text-red-400'}`}>
                                  {item.quantity}
                                </span>
                                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>min {item.minStockLevel}</span>
                              </div>
                              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.7, ease: 'easeOut' }}
                                  className="h-full rounded-full"
                                  style={{ background: status.label === 'In Stock' ? 'linear-gradient(90deg,#10b981,#34d399)' : status.label === 'Low Stock' ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : 'linear-gradient(90deg,#ef4444,#f87171)' }}
                                />
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <button onClick={() => updateStock(item, 1)} className="p-1 rounded-md text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors" title="+1">
                                <FiPlus size={11} />
                              </button>
                              <button onClick={() => updateStock(item, -1)} className="p-1 rounded-md text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors" title="-1">
                                <FiMinus size={11} />
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                          ETB {(item.pricePerUnit || 0).toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-sm font-semibold tabular-nums text-emerald-400">
                          ETB {value.toLocaleString()}
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-medium inline-flex items-center gap-1.5" style={{ background: status.bg, color: status.color }}>
                            {item.quantity <= item.minStockLevel && <FiAlertTriangle size={11} />}
                            {status.label}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                            <motion.button
                              onClick={() => openEdit(item)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 rounded-lg transition-colors hover:bg-white/10"
                              style={{ color: 'var(--text-secondary)' }}
                              title="Edit"
                            >
                              <FiEdit2 size={15} />
                            </motion.button>
                            <motion.button
                              onClick={() => handleDelete(item)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 rounded-lg text-red-400 hover:bg-red-500/15 transition-colors"
                              title="Delete"
                            >
                              <FiTrash2 size={15} />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      {/* Reports Partition */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card overflow-hidden"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FiFileText size={16} className="text-indigo-400" />
              Inventory Reports
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Daily, weekly, monthly and yearly stock activity with PDF export
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {REPORT_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActivePeriod(tab.key)}
                className="px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all"
                style={activePeriod === tab.key ? {
                  background: `${tab.accent}1f`,
                  color: '#fff',
                  border: `1px solid ${tab.accent}40`,
                  boxShadow: `0 4px 20px ${tab.accent}26`,
                } : {
                  background: 'rgba(255,255,255,0.03)',
                  color: '#9ca3af',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <tab.icon size={13} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {reportLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {[...Array(4)].map((_, i) => <div key={i} className="h-20 shimmer rounded-xl" />)}
          </div>
        ) : report ? (
          <>
            {(() => {
              const tab = REPORT_TABS.find(t => t.key === activePeriod);
              const m = report.movements || {};
              const netPositive = (m.netChange ?? 0) >= 0;
              const periodCards = [
                { label: 'Restocked', value: m.addedUnits ?? 0, suffix: ' units', icon: FiTrendingUp, color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)' },
                { label: 'Consumed', value: m.consumedUnits ?? 0, suffix: ' units', icon: FiMinus, color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.15)' },
                { label: 'Net Change', value: m.netChange ?? 0, prefix: (m.netChange ?? 0) >= 0 ? '+' : '', icon: FiActivity, color: netPositive ? '#10b981' : '#ef4444', bg: netPositive ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: netPositive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' },
                { label: 'Movements', value: m.count ?? 0, icon: FiRefreshCw, color: '#818cf8', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.15)' }
              ];
              return (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                    {periodCards.map((card) => (
                      <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-4 rounded-xl"
                        style={{ background: card.bg, border: `1px solid ${card.border}` }}
                      >
                        <div>
                          <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
                          <p className="text-xl font-bold mt-1 tabular-nums" style={{ color: card.color }}>
                            <AnimatedCounter value={card.value} prefix={card.prefix || ''} suffix={card.suffix || ''} />
                          </p>
                        </div>
                        <card.icon size={18} style={{ color: card.color }} />
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <tab.icon size={14} style={{ color: tab.accent }} />
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {tab.label} Stock Activity
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({tab.periodLabel()})</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.03, boxShadow: `0 4px 20px ${tab.accent}40` }}
                      whileTap={{ scale: 0.96 }}
                      onClick={handleExportPdf}
                      className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
                      style={{ background: `linear-gradient(135deg, ${tab.accent}, ${tab.accent}cc)`, color: '#fff', border: 'none' }}
                    >
                      <FiDownload size={15} />
                      Export {tab.label} PDF
                    </motion.button>
                  </div>

                  {renderMovementTable(movements)}
                </>
              );
            })()}
          </>
        ) : (
          <div className="py-10 text-center">
            <FiAlertTriangle className="mx-auto text-gray-600 mb-3" size={28} />
            <p className="text-gray-500">Report unavailable</p>
          </div>
        )}
      </motion.div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => { setShowModal(false); setEditing(null); }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl glass p-6"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--glass-border)', boxShadow: '0 32px 64px rgba(0,0,0,0.4)' }}
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 8px 24px rgba(99,102,241,0.3)' }}>
                    <FiBox size={18} className="text-white" />
                  </div>
                  <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    {editing ? 'Edit Item' : 'Add Inventory Item'}
                  </h2>
                </div>
                <button onClick={() => { setShowModal(false); setEditing(null); }} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all" style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}>
                  <FiX size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1.5 font-medium" style={{ color: 'var(--text-secondary)' }}>Item Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input-glass" placeholder="e.g. Tomatoes" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1.5 font-medium" style={{ color: 'var(--text-secondary)' }}>Category</label>
                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="input-glass cursor-pointer">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5 font-medium" style={{ color: 'var(--text-secondary)' }}>Unit</label>
                    <select value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="input-glass cursor-pointer">
                      {['pcs', 'kg', 'g', 'L', 'ml', 'bag', 'box', 'pack'].map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1.5 font-medium" style={{ color: 'var(--text-secondary)' }}>Quantity</label>
                    <input type="number" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} className="input-glass" min="0" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5 font-medium" style={{ color: 'var(--text-secondary)' }}>Price per Unit (ETB)</label>
                    <input type="number" value={formData.pricePerUnit} onChange={e => setFormData({ ...formData, pricePerUnit: e.target.value })} className="input-glass" min="0" placeholder="0.00" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1.5 font-medium" style={{ color: 'var(--text-secondary)' }}>Total Price (ETB)</label>
                  <input
                    type="number"
                    readOnly
                    value={(Number(formData.quantity) || 0) * (Number(formData.pricePerUnit) || 0)}
                    className="input-glass font-semibold"
                    placeholder="Auto-calculated"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => { setShowModal(false); setEditing(null); }} className="flex-1 btn-ghost">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 btn-primary disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving ? 'Saving...' : <><FiChevronRight size={16} /> {editing ? 'Update Item' : 'Create Item'}</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}