import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { FiSearch, FiFilter, FiChevronDown, FiClock, FiCheckCircle, FiXCircle, FiPackage, FiRefreshCw } from 'react-icons/fi';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/20', icon: FiClock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/20', icon: FiCheckCircle },
  preparing: { label: 'Preparing', color: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border-indigo-500/20', icon: FiPackage },
  ready: { label: 'Ready', color: 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/20', icon: FiPackage },
  delivered: { label: 'Delivered', color: 'bg-green-500/20 text-green-600 dark:text-green-300 border-green-500/20', icon: FiCheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-600 dark:text-red-300 border-red-500/20', icon: FiXCircle },
};

export default function OrderHistory({ orders }) {
  const { darkMode } = useTheme();
  const d = darkMode;
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const filtered = orders.filter(o => {
    const matchesSearch = o.orderId?.toLowerCase().includes(search.toLowerCase()) || o._id?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || o.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatus = (status) => statusConfig[status] || statusConfig.pending;
  const StatusIcon = ({ status }) => {
    const config = getStatus(status);
    const Icon = config.icon;
    return <Icon size={14} />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl overflow-hidden backdrop-blur-xl ${
        d ? 'bg-slate-900/60 border border-white/10' : 'bg-white/90 border border-gray-200/60 shadow-xl'
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${d ? 'from-indigo-500/3' : 'from-indigo-500/[0.01]'} to-transparent pointer-events-none`} />

      <div className="relative p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className={`text-xl font-bold flex items-center gap-2 ${d ? 'text-white' : 'text-gray-900'}`}>
            <FiPackage className="text-indigo-400" />
            Order History
          </h2>
          <div className="flex gap-3">
            <div className="relative flex-1 md:w-48">
              <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${d ? 'text-white/30' : 'text-gray-400'}`} size={16} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search orders..."
                className={`w-full pl-9 pr-3 py-2 rounded-xl text-sm focus:outline-none border ${
                  d ? 'glass text-white placeholder-white/30 border-white/10' : 'bg-gray-100 text-gray-900 placeholder-gray-400 border-gray-200'
                }`}
              />
            </div>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className={`px-3 py-2 rounded-xl text-sm focus:outline-none border ${
                d ? 'glass text-white/70 border-white/10' : 'bg-gray-100 text-gray-700 border-gray-200'
              }`}
            >
              <option value="all">All</option>
              {Object.entries(statusConfig).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <FiPackage className={`mx-auto ${d ? 'text-white/20' : 'text-gray-300'} mb-4`} size={48} />
            <p className={`${d ? 'text-white/50' : 'text-gray-500'} text-lg mb-2`}>No orders found</p>
            <p className={`${d ? 'text-white/30' : 'text-gray-400'} text-sm`}>Start by ordering your favorite food!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order, i) => {
              const status = getStatus(order.status);
              const isExpanded = expanded === order._id;
              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpanded(isExpanded ? null : order._id)}
                    className={`w-full p-4 text-left transition-all ${
                      d ? 'glass hover:bg-white/10' : 'bg-gray-100/80 border border-gray-200 hover:bg-gray-200/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-10 h-10 rounded-xl ${status.color.split(' ')[0]} flex items-center justify-center border ${status.color.split(' ')[2]}`}>
                          <StatusIcon status={order.status} />
                        </div>
                        <div>
                          <p className={`font-semibold text-sm ${d ? 'text-white' : 'text-gray-900'}`}>Order #{order.orderId || order._id?.slice(-6)}</p>
                          <p className={`text-xs ${d ? 'text-white/40' : 'text-gray-500'}`}>
                            {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                          {status.label}
                        </span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                          ETB {order.total?.toFixed(2)}
                        </span>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <FiChevronDown className={d ? 'text-white/40' : 'text-gray-400'} size={16} />
                        </motion.div>
                      </div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className={`p-4 border-t ${d ? 'border-white/5' : 'border-gray-200'} space-y-3`}>
                          {order.items?.map((item, j) => (
                            <div key={j} className={`flex items-center gap-3 p-2 rounded-xl ${d ? 'bg-white/5' : 'bg-gray-50'}`}>
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-400/20 to-purple-400/20 flex items-center justify-center text-xs ${d ? 'text-white/60' : 'text-gray-500'}`}>
                                {item.quantity}x
                              </div>
                              <div className="flex-1">
                                <p className={`text-sm font-medium ${d ? 'text-white/80' : 'text-gray-700'}`}>{item.food?.name || item.name || 'Food Item'}</p>
                                {item.size && <p className={`text-xs ${d ? 'text-white/40' : 'text-gray-500'}`}>{item.size}</p>}
                              </div>
                              <span className={`text-sm font-semibold ${d ? 'text-white/60' : 'text-gray-600'}`}>
                                ETB {(item.price || 0).toFixed(2)}
                              </span>
                            </div>
                          ))}
                          <div className="flex gap-2 pt-2">
                            <Link to={`/order/${order.orderId}`} className="flex-1 py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 text-sm font-medium text-center hover:bg-indigo-500/30 transition-all">
                              Track Order
                            </Link>
                            <button className={`flex items-center justify-center gap-1.5 flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                              d ? 'glass text-white/60 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}>
                              <FiRefreshCw size={14} /> Reorder
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
