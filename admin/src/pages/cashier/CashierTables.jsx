import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiGrid, FiUsers, FiClock, FiDollarSign, FiX, FiCheck, FiRefreshCw } from 'react-icons/fi';
import { fetchCashierTables, updateTableStatus, fetchTableOrders, processPayment } from '../../services/cashierApi';

const statusConfig = {
  available: { label: 'Available', color: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300', gradient: 'from-emerald-500/10 to-transparent' },
  occupied: { label: 'Occupied', color: 'bg-indigo-500', badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300', gradient: 'from-indigo-500/10 to-transparent' },
  reserved: { label: 'Reserved', color: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300', gradient: 'from-amber-500/10 to-transparent' },
  billing: { label: 'Billing', color: 'bg-rose-500', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300', gradient: 'from-rose-500/10 to-transparent' },
  cleaning: { label: 'Cleaning', color: 'bg-sky-500', badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300', gradient: 'from-sky-500/10 to-transparent' },
  maintenance: { label: 'Maintenance', color: 'bg-gray-500', badge: 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300', gradient: 'from-gray-500/10 to-transparent' }
};

export default function CashierTables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableOrders, setTableOrders] = useState([]);
  const [showDetail, setShowDetail] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => { loadTables(); }, []);

  const loadTables = async () => {
    setLoading(true);
    try {
      const res = await fetchCashierTables();
      setTables(res || []);
    } catch (err) {
      toast.error('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  const openTableDetail = async (table) => {
    setSelectedTable(table);
    setShowDetail(true);
    try {
      const orders = await fetchTableOrders(table._id);
      setTableOrders(orders || []);
    } catch {
      setTableOrders([]);
    }
  };

  const handleStatusChange = async (tableId, status) => {
    try {
      await updateTableStatus(tableId, status);
      toast.success(`Table marked as ${status}`);
      loadTables();
      if (selectedTable?._id === tableId) {
        setSelectedTable(prev => ({ ...prev, status }));
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handlePayment = async (orderId) => {
    setProcessing(true);
    try {
      await processPayment(orderId, { paymentMethod: 'cash' });
      toast.success('Payment processed');
      loadTables();
      setShowDetail(false);
    } catch {
      toast.error('Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Table Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor and manage dining tables</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-3 text-xs">
            {Object.entries(statusConfig).map(([key, config]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${config.color}`} />
                <span className="text-gray-500 dark:text-gray-400">{config.label}</span>
              </div>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={loadTables}
            className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <FiRefreshCw size={18} />
          </motion.button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-6 bg-gray-100 dark:bg-gray-800 animate-pulse border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-gray-700 mx-auto mb-3" />
              <div className="h-4 w-12 rounded bg-gray-200 dark:bg-gray-700 mx-auto" />
            </div>
          ))}
        </div>
      ) : tables.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <FiGrid className="text-gray-400 mb-3" size={48} />
          <p className="text-gray-500 dark:text-gray-400">No tables found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {tables.map((table, i) => {
            const config = statusConfig[table.status] || statusConfig.available;
            return (
              <motion.button
                key={table._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ y: -4 }}
                onClick={() => openTableDetail(table)}
                className={`relative overflow-hidden rounded-2xl p-5 bg-white dark:bg-gray-800/80 border-2 transition-all ${
                  table.status === 'available' ? 'border-emerald-200 dark:border-emerald-800/50 hover:shadow-emerald-500/10' :
                  table.status === 'occupied' ? 'border-indigo-200 dark:border-indigo-800/50 hover:shadow-indigo-500/10' :
                  table.status === 'billing' ? 'border-rose-200 dark:border-rose-800/50 hover:shadow-rose-500/10' :
                  'border-gray-200 dark:border-gray-700'
                } hover:shadow-lg`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-50`} />
                <div className="relative flex flex-col items-center">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-3 border-2 ${
                    table.status === 'available' ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30' :
                    table.status === 'occupied' ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/30' :
                    'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50'
                  }`}>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">{table.tableNumber}</span>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300">
                    <FiUsers size={12} /> {table.capacity}
                  </span>
                  <div className={`mt-2 w-2 h-2 rounded-full ${config.color}`} />
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showDetail && selectedTable && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && setShowDetail(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">#{selectedTable.tableNumber}</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Table {selectedTable.tableNumber}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedTable.capacity} seats · {selectedTable.category}</p>
                  </div>
                </div>
                <button onClick={() => setShowDetail(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
                  <FiX size={20} />
                </button>
              </div>

              <div className="flex gap-2 mb-6 flex-wrap">
                {Object.entries(statusConfig).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => handleStatusChange(selectedTable._id, key)}
                    disabled={key === selectedTable.status}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      key === selectedTable.status
                        ? `${config.badge} ring-2 ring-offset-2 dark:ring-offset-gray-800 ring-${config.color.replace('bg-', '')}`
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {config.label}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Orders for this table</h3>
                {tableOrders.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No orders for this table</p>
                ) : (
                  tableOrders.map(order => (
                    <div key={order._id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">#{order.orderId}</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">ETB {order.total?.toLocaleString()}</span>
                      </div>
                      <div className="space-y-1 mb-3">
                        {order.items?.map((item, i) => (
                          <p key={i} className="text-xs text-gray-500 dark:text-gray-400">
                            {item.quantity}x {item.name}
                          </p>
                        ))}
                      </div>
                      {order.paymentStatus !== 'paid' && (
                        <button
                          onClick={() => handlePayment(order._id)}
                          disabled={processing}
                          className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <FiDollarSign size={16} /> Process Payment
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
