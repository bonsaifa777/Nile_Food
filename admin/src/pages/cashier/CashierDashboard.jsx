import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiDollarSign, FiShoppingBag, FiTrendingUp, FiClock, FiGrid, FiArrowRight } from 'react-icons/fi';
import { fetchCashierDashboard } from '../../services/cashierApi';

function StatCard({ icon: Icon, label, value, sublabel, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="relative overflow-hidden rounded-2xl p-6 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
          <Icon className="text-white" size={22} />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
        {typeof value === 'number' ? `ETB ${value.toLocaleString()}` : value}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      {sublabel && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sublabel}</p>}
    </motion.div>
  );
}

export default function CashierDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetchCashierDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl p-6 bg-gray-100 dark:bg-gray-800 animate-pulse border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 mb-4" />
            <div className="h-8 w-24 rounded bg-gray-200 dark:bg-gray-700 mb-2" />
            <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    { icon: FiDollarSign, label: 'Today Sales', value: data?.totalSales || 0, sublabel: `${data?.totalOrders || 0} orders`, color: 'from-emerald-500 to-teal-500', delay: 0 },
    { icon: FiShoppingBag, label: 'Active Orders', value: data?.activeOrders || 0, sublabel: 'In progress', color: 'from-indigo-500 to-purple-500', delay: 0.1 },
    { icon: FiTrendingUp, label: 'Avg Order Value', value: data?.avgOrderValue || 0, sublabel: 'Per order', color: 'from-amber-500 to-orange-500', delay: 0.2 },
    { icon: FiGrid, label: 'Tables', value: `${data?.tableStats?.occupied || 0}/${data?.tableStats?.total || 0}`, sublabel: `${data?.tableStats?.available || 0} available`, color: 'from-rose-500 to-pink-500', delay: 0.3 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cashier Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage POS, tables, and transactions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {data?.drawerStatus && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
              <FiDollarSign className="text-emerald-600 dark:text-emerald-400" size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Cash Drawer Open</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">ETB {data.drawerStatus.balance?.toLocaleString() || 0}</p>
            </div>
          </div>
          <Link
            to="/cashier/drawer"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium flex items-center gap-2 transition-all"
          >
            Manage <FiArrowRight size={16} />
          </Link>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl p-6 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/cashier/pos" className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800/50 hover:shadow-md transition-all">
              <FiShoppingBag className="text-indigo-600 dark:text-indigo-400 mb-2" size={20} />
              <p className="text-sm font-semibold text-gray-900 dark:text-white">New POS Order</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Create dine-in or takeaway</p>
            </Link>
            <Link to="/cashier/tables" className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 hover:shadow-md transition-all">
              <FiGrid className="text-emerald-600 dark:text-emerald-400 mb-2" size={20} />
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Manage Tables</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">View and assign tables</p>
            </Link>
            <Link to="/cashier/drawer" className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/50 hover:shadow-md transition-all">
              <FiDollarSign className="text-amber-600 dark:text-amber-400 mb-2" size={20} />
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Cash Drawer</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Open/close and transactions</p>
            </Link>
            <Link to="/cashier/customers" className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800/50 hover:shadow-md transition-all">
              <FiTrendingUp className="text-rose-600 dark:text-rose-400 mb-2" size={20} />
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Customers</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">View and manage customers</p>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl p-6 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Today's Orders</h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">{data?.totalOrders || 0} total</span>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {data?.recentOrders?.length > 0 ? (
              data.recentOrders.slice(0, 8).map((order, i) => (
                <div key={order._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      #{order.orderId} - {order.guestName || 'Guest'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ETB {order.total?.toLocaleString()} · {order.type}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' :
                    order.status === 'confirmed' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                  }`}>
                    {order.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No orders today yet</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
