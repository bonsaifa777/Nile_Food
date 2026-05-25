import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiGrid, FiLayout } from 'react-icons/fi';

const statusConfig = {
  available: {
    label: 'Available',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
    gradient: 'from-emerald-50 to-transparent dark:from-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800/50',
    accent: 'bg-emerald-500',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
  },
  occupied: {
    label: 'Occupied',
    badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300',
    gradient: 'from-indigo-50 to-transparent dark:from-indigo-950/40',
    border: 'border-indigo-200 dark:border-indigo-800/50',
    accent: 'bg-indigo-500',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/50',
  },
  reserved: {
    label: 'Reserved',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
    gradient: 'from-amber-50 to-transparent dark:from-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800/50',
    accent: 'bg-amber-500',
    iconBg: 'bg-amber-100 dark:bg-amber-900/50',
  },
};

export default function Tables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: 4,
    status: 'available'
  });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/tables');
      setTables(data.data || []);
    } catch (error) {
      toast.error('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (editingTable) {
        await axios.put(`/api/tables/${editingTable._id}`, formData);
        toast.success('Table updated');
      } else {
        await axios.post('/api/tables', formData);
        toast.success('Table created');
      }
      
      setShowModal(false);
      setEditingTable(null);
      setFormData({ tableNumber: '', capacity: 4, status: 'available' });
      fetchTables();
    } catch (error) {
      toast.error('Failed to save table');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this table?')) return;
    
    try {
      await axios.delete(`/api/tables/${id}`);
      toast.success('Table deleted');
      fetchTables();
    } catch (error) {
      toast.error('Failed to delete table');
    }
  };

  const openEdit = (table) => {
    setEditingTable(table);
    setFormData({
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      status: table.status
    });
    setShowModal(true);
  };

  const generateQR = (tableId) => {
    const qrUrl = `${window.location.origin}/table/${tableId}`;
    window.open(qrUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tables
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
            <FiLayout size={14} className="text-indigo-500" />
            Manage dining tables for QR ordering
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setEditingTable(null); setShowModal(true); }}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/25"
        >
          <FiPlus size={18} /> Add Table
        </motion.button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-6 bg-gray-100 dark:bg-gray-800 animate-pulse border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-gray-700" />
                <div className="w-20 h-6 rounded-full bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700 mb-3" />
              <div className="flex gap-2">
                <div className="flex-1 h-9 rounded-lg bg-gray-200 dark:bg-gray-700" />
                <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-700" />
                <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          ))
        ) : tables.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-full flex flex-col items-center justify-center py-20 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-4">
              <FiLayout className="text-indigo-600 dark:text-indigo-400" size={24} />
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-lg mb-2">No tables found</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Add your first table to enable QR ordering</p>
            <button
              onClick={() => { setEditingTable(null); setShowModal(true); }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/25"
            >
              <FiPlus size={16} /> Add Your First Table
            </button>
          </motion.div>
        ) : (
          <AnimatePresence>
            {tables.map((table, i) => {
              const config = statusConfig[table.status] || statusConfig.available;
              return (
                <motion.div
                  key={table._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className={`relative overflow-hidden rounded-2xl p-5 bg-white dark:bg-gray-800 border-2 ${config.border} hover:shadow-xl transition-all duration-300`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-50 pointer-events-none`} />

                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-16 h-16 rounded-xl ${config.iconBg} flex items-center justify-center border border-gray-200 dark:border-gray-700 shadow-sm`}>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">#{table.tableNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${config.accent}`} />
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.badge}`}>
                          {statusConfig[table.status]?.label || table.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-5">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <FiUsers size={15} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="text-sm font-medium">
                          <span className="text-gray-900 dark:text-white">{table.capacity}</span>{' '}
                          <span className="text-gray-500 dark:text-gray-400">seats</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => generateQR(table._id)}
                        className="flex-1 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/40 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-700/50 text-indigo-700 dark:text-indigo-300 text-sm font-medium flex items-center justify-center gap-1.5 transition-all"
                      >
                        <FiGrid size={15} /> QR Code
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openEdit(table)}
                        className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                      >
                        <FiEdit2 size={15} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(table._id)}
                        className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-indigo-100 dark:bg-gray-700 dark:hover:bg-indigo-900/30 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                      >
                        <FiTrash2 size={15} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md rounded-2xl p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                  {editingTable ? <FiEdit2 className="text-indigo-600 dark:text-indigo-400" size={18} /> : <FiPlus className="text-indigo-600 dark:text-indigo-400" size={18} />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {editingTable ? 'Edit Table' : 'Add New Table'}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {editingTable ? 'Update table details' : 'Create a new dining table'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Table Number</label>
                  <input
                    type="text"
                    value={formData.tableNumber}
                    onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                    className="w-full rounded-xl px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="e.g., 1, 2A, VIP-1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Capacity</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full rounded-xl px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                    min={1}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full rounded-xl px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="reserved">Reserved</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => { setShowModal(false); setEditingTable(null); }}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium transition-all"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editingTable ? 'Update' : 'Create'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
