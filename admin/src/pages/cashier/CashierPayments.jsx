import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiSearch, FiDollarSign, FiCheck, FiX, FiClock } from 'react-icons/fi';
import { fetchCashierOrders, processPayment, voidOrder } from '../../services/cashierApi';

export default function CashierPayments() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [processing, setProcessing] = useState(null);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetchCashierOrders({ limit: 50 });
      setOrders(res.orders || []);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (orderId, method) => {
    setProcessing(orderId);
    try {
      await processPayment(orderId, { paymentMethod: method });
      toast.success(`Payment processed via ${method}`);
      loadOrders();
    } catch {
      toast.error('Payment failed');
    } finally {
      setProcessing(null);
    }
  };

  const handleVoid = async (orderId) => {
    if (!confirm('Void this order? This cannot be undone.')) return;
    try {
      await voidOrder(orderId);
      toast.success('Order voided');
      loadOrders();
    } catch {
      toast.error('Failed to void order');
    }
  };

  const filteredOrders = orders.filter(o =>
    !search || o.orderId?.toLowerCase().includes(search.toLowerCase()) ||
    o.guestName?.toLowerCase().includes(search.toLowerCase())
  );

  const unpaid = filteredOrders.filter(o => o.paymentStatus !== 'paid');
  const paid = filteredOrders.filter(o => o.paymentStatus === 'paid');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Process and manage order payments</p>
        </div>
        <div className="relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders..."
            className="pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white outline-none text-sm w-64 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FiClock className="text-amber-500" /> Pending Payments ({unpaid.length})
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {unpaid.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">All payments processed</p>
            ) : (
              unpaid.map(order => (
                <div key={order._id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">#{order.orderId}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{order.guestName || 'Guest'} · {order.type}</p>
                    </div>
                    <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">ETB {order.total?.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handlePayment(order._id, 'cash')} disabled={processing === order._id} className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-50">
                      <FiDollarSign size={16} /> Cash
                    </button>
                    <button onClick={() => handlePayment(order._id, 'bank_transfer')} disabled={processing === order._id} className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-50">
                      Bank
                    </button>
                    <button onClick={() => handlePayment(order._id, 'chapa')} disabled={processing === order._id} className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-50">
                      Chapa
                    </button>
                    <button onClick={() => handleVoid(order._id)} className="px-3 py-2 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/60 text-sm">
                      <FiX size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl p-6 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FiCheck className="text-emerald-500" /> Paid Orders ({paid.length})
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {paid.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No paid orders yet</p>
            ) : (
              paid.map(order => (
                <div key={order._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                      <FiCheck className="text-emerald-600 dark:text-emerald-400" size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">#{order.orderId}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{order.paymentMethod} · {order.type}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">ETB {order.total?.toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
