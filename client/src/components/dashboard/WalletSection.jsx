import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { FiCreditCard, FiPlus, FiArrowUpRight, FiArrowDownLeft, FiCpu, FiX, FiDollarSign, FiCheck, FiRefreshCw } from 'react-icons/fi';

const transactions = [
  { id: 1, type: 'payment', description: 'Grand Nile Suite Booking', amount: -12500, date: '2026-05-14', method: 'Visa' },
  { id: 2, type: 'deposit', description: 'Wallet Top Up', amount: 20000, date: '2026-05-12', method: 'Bank Transfer' },
  { id: 3, type: 'payment', description: 'Food Order #ORD-4821', amount: -3450, date: '2026-05-10', method: 'Cash' },
  { id: 4, type: 'refund', description: 'Order Cancellation Refund', amount: 3450, date: '2026-05-09', method: 'Wallet' },
];

function TransactionModal({ type, onClose }) {
  const { darkMode } = useTheme();
  const d = darkMode;
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bank');
  const [submitting, setSubmitting] = useState(false);

  const methods = [
    { id: 'bank', label: 'Bank Transfer', icon: FiCreditCard },
    { id: 'card', label: 'Card Payment', icon: FiCreditCard },
    { id: 'chapa', label: 'Chapa', icon: FiCpu },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    toast.success(type === 'deposit'
      ? `ETB ${num.toLocaleString()} deposited successfully!`
      : `Withdrawal of ETB ${num.toLocaleString()} initiated.`
    );
    setSubmitting(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`w-full max-w-md rounded-3xl overflow-hidden backdrop-blur-2xl border shadow-2xl ${
          d ? 'bg-slate-900/90 border-white/10' : 'bg-white/90 border-gray-200'
        }`}
      >
        <div className={`flex items-center justify-between p-6 border-b ${d ? 'border-white/10' : 'border-gray-200'}`}>
          <div>
            <h3 className={`text-lg font-bold ${d ? 'text-white' : 'text-gray-900'}`}>
              {type === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
            </h3>
            <p className={`text-sm ${d ? 'text-white/50' : 'text-gray-500'}`}>
              {type === 'deposit' ? 'Add money to your wallet' : 'Withdraw money from your wallet'}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${d ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
          >
            <FiX className={`w-4 h-4 ${d ? 'text-white/60' : 'text-gray-500'}`} />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <p className={`text-xs font-semibold mb-2 ${d ? 'text-white/50' : 'text-gray-500'}`}>Amount (ETB)</p>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all focus-within:ring-2 focus-within:ring-indigo-500/30 ${
              d ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
            }`}>
              <FiDollarSign className={`w-5 h-5 ${d ? 'text-white/30' : 'text-gray-400'}`} />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
                className={`w-full bg-transparent text-lg font-bold focus:outline-none ${
                  d ? 'text-white placeholder-white/30' : 'text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>
          </div>

          <div>
            <p className={`text-xs font-semibold mb-2 ${d ? 'text-white/50' : 'text-gray-500'}`}>Payment Method</p>
            <div className="grid grid-cols-3 gap-2">
              {methods.map((m) => {
                const Icon = m.icon;
                const isSelected = method === m.id;
                return (
                  <motion.button
                    key={m.id}
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setMethod(m.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                        : d
                          ? 'bg-white/5 text-white/50 hover:bg-white/10'
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {m.label}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className={`p-4 rounded-xl ${d ? 'bg-white/5' : 'bg-indigo-50/50'} border ${d ? 'border-white/10' : 'border-indigo-100/50'}`}>
            <div className="flex items-start gap-3">
              <FiCheck className={`w-4 h-4 mt-0.5 ${d ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <div>
                <p className={`text-xs font-semibold ${d ? 'text-white/70' : 'text-gray-700'}`}>Processing Time</p>
                <p className={`text-[10px] ${d ? 'text-white/40' : 'text-gray-500'}`}>
                  {type === 'deposit' ? 'Funds reflect instantly' : 'Withdrawals processed within 24 hours'}
                </p>
              </div>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={submitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <FiRefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {type === 'deposit' ? <FiArrowDownLeft className="w-5 h-5" /> : <FiArrowUpRight className="w-5 h-5" />}
                {type === 'deposit' ? 'Deposit' : 'Withdraw'}
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function WalletSection() {
  const { darkMode } = useTheme();
  const d = darkMode;
  const [modal, setModal] = useState(null);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl overflow-hidden backdrop-blur-xl ${
          d ? 'bg-slate-900/60 border border-white/10' : 'bg-white/90 border border-gray-200/60 shadow-xl'
        }`}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${d ? 'from-emerald-500/3' : 'from-emerald-500/[0.01]'} to-transparent pointer-events-none`} />

        <div className="relative p-6 space-y-6">
          <h2 className={`text-xl font-bold flex items-center gap-2 ${d ? 'text-white' : 'text-gray-900'}`}>
            <FiCreditCard className="text-emerald-400" />
            Wallet & Payments
          </h2>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="relative p-6 rounded-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-2xl" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.1)_0%,_transparent_60%)]" />
            <div className="absolute top-4 right-4">
              <FiCpu className="text-white/30" size={32} />
            </div>

            <div className="relative z-10">
              <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Wallet Balance</p>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-3xl font-bold text-white mb-6"
              >
                ETB 45,820.50
              </motion.p>
              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setModal('deposit')}
                    className="px-4 py-2 rounded-xl bg-white/15 text-white text-sm font-medium flex items-center gap-2 hover:bg-white/25 transition-all"
                  >
                    <FiPlus size={14} /> Deposit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setModal('withdraw')}
                    className="px-4 py-2 rounded-xl bg-white/15 text-white text-sm font-medium flex items-center gap-2 hover:bg-white/25 transition-all"
                  >
                    <FiArrowUpRight size={14} /> Withdraw
                  </motion.button>
                </div>
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-[8px] text-white font-bold border-2 border-indigo-700">V</div>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-[8px] text-white font-bold border-2 border-indigo-700">M</div>
                </div>
              </div>
            </div>
          </motion.div>

          <div>
            <h3 className={`text-sm font-semibold ${d ? 'text-white/60' : 'text-gray-500'} mb-3`}>Recent Transactions</h3>
            <div className="space-y-2">
              {transactions.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    d ? 'glass hover:bg-white/10' : 'bg-gray-100/80 border border-gray-200 hover:bg-gray-200/50'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    tx.amount > 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    {tx.amount > 0 ? (
                      <FiArrowDownLeft className="text-green-400" size={16} />
                    ) : (
                      <FiArrowUpRight className="text-red-400" size={16} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${d ? 'text-white/80' : 'text-gray-700'} truncate`}>{tx.description}</p>
                    <p className={`text-xs ${d ? 'text-white/40' : 'text-gray-500'}`}>{tx.date} · {tx.method}</p>
                  </div>
                  <span className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} ETB
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {modal && (
          <TransactionModal
            type={modal}
            onClose={() => setModal(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
