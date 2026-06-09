import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiBarChart2, FiDollarSign, FiShoppingBag, FiTrendingUp, FiDownload, FiCalendar } from 'react-icons/fi';
import { fetchCashierDashboard, fetchCashierOrders, fetchDrawerHistory } from '../../services/cashierApi';

export default function CashierReports() {
  const [dashboard, setDashboard] = useState(null);
  const [orders, setOrders] = useState([]);
  const [drawerHistory, setDrawerHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('today');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dash, ords, drawers] = await Promise.all([
        fetchCashierDashboard(),
        fetchCashierOrders({ limit: 100 }),
        fetchDrawerHistory({ limit: 20 })
      ]);
      setDashboard(dash);
      setOrders(ords.orders || []);
      setDrawerHistory(drawers.history || []);
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const totalPaid = (orders || []).filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + (o.total || 0), 0);
  const totalPending = (orders || []).filter(o => o.paymentStatus !== 'paid').reduce((sum, o) => sum + (o.total || 0), 0);
  const orderTypeBreakdown = (orders || []).reduce((acc, o) => {
    acc[o.type] = (acc[o.type] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-6 bg-gray-100 dark:bg-gray-800 animate-pulse border border-gray-200 dark:border-gray-700">
              <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700 mb-3" />
              <div className="h-8 w-20 rounded bg-gray-200 dark:bg-gray-700 mb-2" />
              <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Sales performance and transaction summary</p>
        </div>
        <div className="flex gap-2">
          {['today', 'week', 'month'].map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                dateRange === range
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <FiDollarSign size={24} className="mb-2 opacity-80" />
          <p className="text-sm opacity-80">Total Paid</p>
          <p className="text-2xl font-bold">ETB {totalPaid.toLocaleString()}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl p-5 bg-gradient-to-br from-amber-500 to-orange-600 text-white">
          <FiTrendingUp size={24} className="mb-2 opacity-80" />
          <p className="text-sm opacity-80">Pending</p>
          <p className="text-2xl font-bold">ETB {totalPending.toLocaleString()}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl p-5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <FiShoppingBag size={24} className="mb-2 opacity-80" />
          <p className="text-sm opacity-80">Total Orders</p>
          <p className="text-2xl font-bold">{orders.length}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl p-5 bg-gradient-to-br from-rose-500 to-pink-600 text-white">
          <FiBarChart2 size={24} className="mb-2 opacity-80" />
          <p className="text-sm opacity-80">Avg Order</p>
          <p className="text-2xl font-bold">ETB {orders.length > 0 ? Math.round(totalPaid / orders.length).toLocaleString() : 0}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-2xl p-6 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Order Type Breakdown</h2>
          <div className="space-y-3">
            {Object.entries(orderTypeBreakdown).length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No orders yet</p>
            ) : (
              Object.entries(orderTypeBreakdown).map(([type, count]) => {
                const total = orders.length;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={type} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-900 dark:text-white capitalize font-medium">{type.replace(/_/g, ' ')}</span>
                      <span className="text-gray-500 dark:text-gray-400">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="rounded-2xl p-6 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Orders</h2>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {(orders || []).slice(0, 15).map(order => (
              <div key={order._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">#{order.orderId}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{order.type} · {order.guestName || 'Guest'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">ETB {order.total?.toLocaleString()}</p>
                  <span className={`text-xs font-medium ${order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>{order.paymentStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="rounded-2xl p-6 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Drawer History</h2>
        <div className="space-y-2">
          {drawerHistory.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">No drawer history</p>
          ) : (
            drawerHistory.map(d => (
              <div key={d._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center gap-3">
                  <FiCalendar className="text-gray-400" size={16} />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Opened: {new Date(d.openedAt).toLocaleDateString()} · {d.status}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Opening: ETB {d.openingBalance?.toLocaleString()}
                      {d.closingBalance ? ` · Closing: ETB ${d.closingBalance?.toLocaleString()}` : ''}
                    </p>
                  </div>
                </div>
                {d.difference !== 0 && (
                  <span className={`text-sm font-medium ${d.difference > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {d.difference > 0 ? '+' : ''}{d.difference}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
