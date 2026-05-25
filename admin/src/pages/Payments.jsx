import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiSearch, FiCheck, FiX, FiCreditCard, FiDollarSign } from 'react-icons/fi';
import { format } from 'date-fns';

const PAYMENT_STATUS = {
  pending: { label: 'Pending', color: 'text-yellow-500 bg-yellow-500/20' },
  paid: { label: 'Paid', color: 'text-green-500 bg-green-500/20' },
  failed: { label: 'Failed', color: 'text-red-500 bg-red-500/20' },
  refunded: { label: 'Refunded', color: 'text-purple-500 bg-purple-500/20' }
};

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchPayments();
  }, [filter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = filter ? `?paymentStatus=${filter}` : '';
      const { data } = await axios.get(`/api/payments${params}`);
      setPayments(data.data || []);
    } catch (error) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (orderId) => {
    try {
      await axios.put(`/api/admin/orders/${orderId}`, { 
        status: 'confirmed',
        paymentStatus: 'paid'
      });
      toast.success('Payment verified');
      fetchPayments();
    } catch (error) {
      toast.error('Failed to verify payment');
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (!search) return true;
    return (
      payment.orderId?.toLowerCase().includes(search.toLowerCase()) ||
      payment.user?.name?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalPaid = payments
    .filter(p => p.paymentStatus === 'paid')
    .reduce((acc, p) => acc + p.total, 0);

  const totalPending = payments
    .filter(p => p.paymentStatus === 'pending')
    .reduce((acc, p) => acc + p.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Payments</h1>
          <p className="text-gray-500 mt-1">Manage payments and transactions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <FiDollarSign className="text-green-500" size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Paid</p>
              <p className="text-xl font-bold">ETB {totalPaid.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <FiCreditCard className="text-yellow-500" size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-xl font-bold">ETB {totalPending.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <FiCreditCard className="text-blue-500" size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Transactions</p>
              <p className="text-xl font-bold">{payments.length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search payments..."
            className="input-glass pl-10"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-glass"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Order ID', 'Customer', 'Method', 'Amount', 'Status', 'Date', 'Actions'].map((header) => (
                  <th key={header} className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">No payments found</td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    className="hover:bg-white/[0.02] transition-colors cursor-pointer">
                    <td className="py-4 px-4 text-sm font-mono">{payment.orderId}</td>
                    <td className="py-4 px-4 text-sm">{payment.guestName || payment.user?.name || 'Guest'}</td>
                    <td className="py-4 px-4 text-sm capitalize text-gray-400">{payment.paymentMethod}</td>
                    <td className="py-4 px-4 text-sm font-semibold">ETB {payment.total}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium ${PAYMENT_STATUS[payment.paymentStatus]?.color || 'text-gray-500 bg-gray-500/20'}`}>
                        {PAYMENT_STATUS[payment.paymentStatus]?.label || payment.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {format(new Date(payment.createdAt), 'MMM d, HH:mm')}
                    </td>
                    <td className="py-4 px-4">
                      {payment.paymentStatus === 'pending' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => verifyPayment(payment._id)}
                            className="p-2 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors"
                            title="Verify Payment"
                          >
                            <FiCheck size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}