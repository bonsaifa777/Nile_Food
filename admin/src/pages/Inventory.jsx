import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiAlertTriangle, FiPackage } from 'react-icons/fi';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '', category: 'Other', unit: 'pcs', quantity: 0,
    minStockLevel: 10, pricePerUnit: 0, supplier: ''
  });

  useEffect(() => { fetchItems(); }, [lowStockOnly]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const url = lowStockOnly ? '/api/inventory?lowStock=true' : '/api/inventory';
      const { data } = await axios.get(url);
      setItems(data.data || []);
    } catch (error) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...formData, quantity: Number(formData.quantity), minStockLevel: Number(formData.minStockLevel), pricePerUnit: Number(formData.pricePerUnit) };
      if (editing) {
        await axios.put(`/api/inventory/${editing._id}`, payload);
        toast.success('Item updated');
      } else {
        await axios.post('/api/inventory', payload);
        toast.success('Item created');
      }
      setShowModal(false);
      setEditing(null);
      resetForm();
      fetchItems();
    } catch (error) {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    try {
      await axios.delete(`/api/inventory/${id}`);
      toast.success('Deleted');
      fetchItems();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const updateStock = async (id, quantity) => {
    try {
      await axios.put(`/api/inventory/${id}/stock`, { quantity: Math.max(0, Number(quantity)) });
      toast.success('Stock updated');
      fetchItems();
    } catch (error) {
      toast.error('Failed to update stock');
    }
  };

  const openEdit = (item) => {
    setEditing(item);
    setFormData({
      name: item.name, category: item.category, unit: item.unit,
      quantity: item.quantity, minStockLevel: item.minStockLevel,
      pricePerUnit: item.pricePerUnit, supplier: item.supplier || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', category: 'Other', unit: 'pcs', quantity: 0, minStockLevel: 10, pricePerUnit: 0, supplier: '' });
  };

  const filtered = items.filter(i =>
    !search || i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Inventory</h1>
          <p className="text-gray-500 mt-1">Track ingredients and stock levels</p>
        </div>
        <button onClick={() => { setEditing(null); resetForm(); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <FiPlus size={20} /> Add Item
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search inventory..." className="input-glass pl-10" />
        </div>
        <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
          <input type="checkbox" checked={lowStockOnly} onChange={e => setLowStockOnly(e.target.checked)} className="w-4 h-4 rounded" />
          <span className="text-sm text-gray-400">Low stock only</span>
        </label>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-32 shimmer rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FiPackage size={48} className="mx-auto text-gray-600 mb-4" />
          <p>No inventory items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item, i) => {
            const isLow = item.quantity <= item.minStockLevel;
            return (
              <motion.div key={item._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className={`glass-card group ${isLow ? 'border-red-500/30' : ''}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-xs text-gray-500">{item.category} · {item.unit}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-white/10 rounded-lg"><FiEdit2 size={14} /></button>
                    <button onClick={() => handleDelete(item._id)} className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg"><FiTrash2 size={14} /></button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${isLow ? 'text-red-400' : 'text-green-400'}`}>{item.quantity}</span>
                    {isLow && <FiAlertTriangle className="text-red-400" size={16} />}
                  </div>
                  <span className="text-xs text-gray-500">Min: {item.minStockLevel}</span>
                </div>
                {item.supplier && <p className="text-xs text-gray-600 mt-2">Supplier: {item.supplier}</p>}
                <div className="mt-3 flex gap-2">
                  <button onClick={() => updateStock(item._id, item.quantity + 1)} className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30">+1</button>
                  <button onClick={() => updateStock(item._id, item.quantity + 10)} className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30">+10</button>
                  <button onClick={() => updateStock(item._id, Math.max(0, item.quantity - 1))} className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30">-1</button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card w-full max-w-lg max-h-[80vh] overflow-y-auto"
            >
              <h2 className="text-xl font-bold mb-4">{editing ? 'Edit Item' : 'Add Inventory Item'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="input-glass" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Category</label>
                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="input-glass">
                      {['Produce', 'Meat', 'Dairy', 'Dry Goods', 'Beverages', 'Other'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Unit</label>
                    <select value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="input-glass">
                      {['pcs', 'kg', 'g', 'L', 'ml', 'bag', 'box', 'pack'].map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Quantity</label>
                    <input type="number" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} className="input-glass" min="0" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Min Stock Level</label>
                    <input type="number" value={formData.minStockLevel} onChange={e => setFormData({ ...formData, minStockLevel: e.target.value })} className="input-glass" min="0" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Price per Unit (ETB)</label>
                    <input type="number" value={formData.pricePerUnit} onChange={e => setFormData({ ...formData, pricePerUnit: e.target.value })} className="input-glass" min="0" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Supplier</label>
                    <input type="text" value={formData.supplier} onChange={e => setFormData({ ...formData, supplier: e.target.value })} className="input-glass" />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => { setShowModal(false); setEditing(null); }} className="flex-1 btn-ghost">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 btn-primary disabled:opacity-50">
                    {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
