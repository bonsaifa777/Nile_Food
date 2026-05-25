import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPackage, FiAlertTriangle, FiAlertCircle, FiCheckCircle, FiSearch, FiRefreshCw, FiTrendingUp, FiDroplet, FiGrid } from 'react-icons/fi';
import { useInventory, useDataService } from '../../hooks/useDataService';

const statusConfig = {
  good: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: FiCheckCircle, label: 'Good' },
  low: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: FiAlertTriangle, label: 'Low Stock' },
  critical: { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: FiAlertCircle, label: 'Critical' },
};

export default function InventoryPanel() {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const inventoryItems = useInventory();
  const DataSvc = useDataService();

  const categories = [...new Set(inventoryItems.map(i => i.category))];
  const filtered = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const stockLevel = (stock, threshold) => {
    if (stock >= threshold * 1.5) return 100;
    if (stock >= threshold) return 75;
    if (stock >= threshold * 0.5) return 50;
    return 25;
  };

  const getBarColor = (stock, threshold) => {
    if (stock >= threshold) return '#10b981';
    if (stock >= threshold * 0.5) return '#f59e0b';
    return '#ef4444';
  };

  const criticalItems = inventoryItems.filter(i => i.status === 'critical');
  const lowItems = inventoryItems.filter(i => i.status === 'low');

  const handleRestock = (itemId) => {
    const inv = DataSvc.getInventory();
    const idx = inv.findIndex(i => i.id === itemId);
    if (idx === -1) return;
    inv[idx].stock = Math.round(inv[idx].threshold * 2);
    inv[idx].status = 'good';
    DataSvc.saveInventory(inv);
    DataSvc.addNotification(`📦 Restocked ${inv[idx].name}`, 'stock');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Inventory & Stock</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Real-time ingredient tracking</p>
        </div>
        <div className="flex items-center gap-3">
          {(criticalItems.length > 0 || lowItems.length > 0) && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              {criticalItems.length > 0 && (
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  <FiAlertCircle size={14} className="text-rose-400" />
                  <span className="text-xs text-rose-400 font-medium">{criticalItems.length} Critical</span>
                </div>
              )}
              {lowItems.length > 0 && (
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <FiAlertTriangle size={14} className="text-amber-400" />
                  <span className="text-xs text-amber-400 font-medium">{lowItems.length} Low</span>
                </div>
              )}
            </motion.div>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: 'rgba(99,102,241,0.1)',
              color: 'var(--primary)',
              border: '1px solid rgba(99,102,241,0.2)',
            }}
          >
            <FiRefreshCw size={12} /> Restock All
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl p-4 relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(52,211,153,0.03))',
          border: '1px solid rgba(16,185,129,0.15)',
        }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>In Stock</span>
            <FiPackage size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{inventoryItems.filter(i => i.status === 'good').length}</p>
          <p className="text-xs mt-1 text-emerald-400/70">items well-stocked</p>
        </div>
        <div className="rounded-2xl p-4 relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(251,191,36,0.03))',
          border: '1px solid rgba(245,158,11,0.15)',
        }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Low Stock</span>
            <FiAlertTriangle size={16} className="text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400">{lowItems.length + criticalItems.length}</p>
          <p className="text-xs mt-1 text-amber-400/70">items need restocking</p>
        </div>
        <div className="rounded-2xl p-4 relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.03))',
          border: '1px solid rgba(99,102,241,0.15)',
        }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Categories</span>
            <FiGrid size={16} style={{ color: 'var(--primary)' }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>{categories.length}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--primary)/70' }}>product categories</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search inventory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl pl-9 pr-4 py-2 text-sm"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--input-text)' }}
          />
        </div>
        <div className="flex gap-1.5">
          {['all', ...categories].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                filterCategory === cat
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  : 'border border-transparent'
              }`}
              style={{ color: filterCategory === cat ? undefined : 'var(--text-secondary)' }}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--input-bg)' }}>
                {['Ingredient', 'Category', 'Stock', 'Stock Level', 'Status', 'Expiry', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((item, i) => {
                  const status = statusConfig[item.status];
                  const level = stockLevel(item.stock, item.threshold);
                  return (
                    <motion.tr
                      key={item.id || item.name}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="group"
                      style={{ borderBottom: '1px solid var(--border-color)' }}
                      whileHover={{ background: 'rgba(99,102,241,0.02)' }}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            item.status === 'good' ? 'bg-emerald-400' :
                            item.status === 'low' ? 'bg-amber-400' : 'bg-rose-400'
                          }`} />
                          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs" style={{ color: 'var(--text-secondary)' }}>{item.category}</td>
                      <td className="py-3.5 px-4">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {item.stock}{item.unit === 'pcs' ? ' pcs' : ` ${item.unit}`}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3 w-32">
                          <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--input-bg)' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${level}%` }}
                              transition={{ duration: 1, delay: i * 0.05 }}
                              className="h-full rounded-full"
                              style={{ background: getBarColor(item.stock, item.threshold) }}
                            />
                          </div>
                          <span className="text-[11px] font-medium" style={{ color: getBarColor(item.stock, item.threshold) }}>
                            {level}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[11px] px-2 py-1 rounded-lg font-medium ${status.color} ${status.bg} border ${status.border}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {item.expiry}
                      </td>
                      <td className="py-3.5 px-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRestock(item.id)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all"
                          style={{
                            background: 'rgba(99,102,241,0.1)',
                            color: 'var(--primary)',
                            border: '1px solid rgba(99,102,241,0.2)',
                          }}
                        >
                          Restock
                        </motion.button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
