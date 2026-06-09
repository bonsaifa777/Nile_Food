import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiDollarSign, FiPlus, FiMinus, FiClock, FiTrendingUp, FiRefreshCw, FiDownload } from 'react-icons/fi';
import { fetchCurrentDrawer, openDrawer, closeDrawer, addDrawerTransaction, fetchDrawerHistory } from '../../services/cashierApi';

export default function CashDrawer() {
  const [drawer, setDrawer] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [closingBalance, setClosingBalance] = useState(0);
  const [txAmount, setTxAmount] = useState(0);
  const [txType, setTxType] = useState('deposit');
  const [txReason, setTxReason] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [drawerRes, historyRes] = await Promise.all([
        fetchCurrentDrawer(),
        fetchDrawerHistory({ limit: 10 })
      ]);
      setDrawer(drawerRes);
      setHistory(historyRes.history || []);
    } catch {
      toast.error('Failed to load drawer data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = async () => {
    if (!openingBalance || openingBalance <= 0) { toast.error('Enter valid opening balance'); return; }
    setSubmitting(true);
    try {
      await openDrawer(openingBalance, notes);
      toast.success('Cash drawer opened');
      setShowOpenModal(false);
      setOpeningBalance(0);
      setNotes('');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to open drawer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async () => {
    if (closingBalance === undefined || closingBalance < 0) { toast.error('Enter valid closing balance'); return; }
    setSubmitting(true);
    try {
      await closeDrawer(drawer._id, closingBalance, notes);
      toast.success('Cash drawer closed');
      setShowCloseModal(false);
      setClosingBalance(0);
      setNotes('');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to close drawer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransaction = async () => {
    if (!txAmount || txAmount <= 0) { toast.error('Enter valid amount'); return; }
    setSubmitting(true);
    try {
      await addDrawerTransaction(drawer._id, { type: txType, amount: txAmount, reason: txReason });
      toast.success('Transaction recorded');
      setShowTxModal(false);
      setTxAmount(0);
      setTxReason('');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const expectedBalance = drawer ? drawer.expectedBalance : 0;
  const diff = drawer ? drawer.difference : 0;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl p-6 bg-gray-100 dark:bg-gray-800 animate-pulse border border-gray-200 dark:border-gray-700">
          <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-700 mb-4" />
          <div className="h-12 w-32 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cash Drawer</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage cash drawer operations</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={loadData}
          className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
        >
          <FiRefreshCw size={18} />
        </motion.button>
      </div>

      {!drawer ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-8 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center mx-auto mb-4">
            <FiDollarSign className="text-amber-600 dark:text-amber-400" size={28} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Open Drawer</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Open the cash drawer to start accepting payments</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowOpenModal(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/25"
          >
            Open Cash Drawer
          </motion.button>
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <p className="text-sm opacity-80 mb-1">Opening Balance</p>
              <p className="text-3xl font-bold">ETB {drawer.openingBalance?.toLocaleString() || 0}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl p-5 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Expected Balance</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">ETB {expectedBalance.toLocaleString()}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl p-5 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Difference</p>
              <p className={`text-3xl font-bold ${diff === 0 ? 'text-gray-900 dark:text-white' : diff > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {diff >= 0 ? '+' : ''}{diff.toLocaleString()}
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl p-5 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</p>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-lg font-bold text-emerald-600">Open</p>
              </div>
              <p className="text-xs text-gray-400 mt-1">Opened {new Date(drawer.openedAt).toLocaleString()}</p>
            </motion.div>
          </div>

          <div className="flex gap-3">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowTxModal(true)} className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/25">
              <FiPlus size={16} /> Add Transaction
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowCloseModal(true)} className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-rose-600/25">
              <FiTrendingUp size={16} /> Close Drawer
            </motion.button>
          </div>

          <div className="rounded-2xl p-6 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Transactions</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {drawer.transactions?.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">No transactions yet</p>
              ) : (
                [...(drawer.transactions || [])].reverse().map((tx, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        tx.type === 'deposit' || tx.type === 'payment_in' ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-red-100 dark:bg-red-900/40'
                      }`}>
                        {tx.type === 'deposit' || tx.type === 'payment_in' ? (
                          <FiPlus className="text-emerald-600 dark:text-emerald-400" size={16} />
                        ) : (
                          <FiMinus className="text-red-600 dark:text-red-400" size={16} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{tx.type.replace(/_/g, ' ')}</p>
                        {tx.reason && <p className="text-xs text-gray-500 dark:text-gray-400">{tx.reason}</p>}
                      </div>
                    </div>
                    <p className={`text-sm font-bold ${tx.type === 'deposit' || tx.type === 'payment_in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {tx.type === 'deposit' || tx.type === 'payment_in' ? '+' : '-'}ETB {tx.amount?.toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      <div className="rounded-2xl p-6 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Drawer History</h2>
        <div className="space-y-2">
          {history.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">No history available</p>
          ) : (
            history.map(d => (
              <div key={d._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {d.status === 'closed' ? 'Closed' : 'Open'} · ETB {d.openingBalance?.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(d.openedAt).toLocaleDateString()}
                    {d.closedAt && ` → ${new Date(d.closedAt).toLocaleDateString()}`}
                  </p>
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
      </div>

      <AnimatePresence>
        {showOpenModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0.95 }} className="w-full max-w-md rounded-2xl p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Open Cash Drawer</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Opening Balance (ETB)</label>
                  <input type="number" value={openingBalance} onChange={(e) => setOpeningBalance(Number(e.target.value))} className="w-full rounded-xl px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white outline-none" min={0} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notes (optional)</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-xl px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white outline-none resize-none" rows={2} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowOpenModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium">Cancel</button>
                  <button onClick={handleOpen} disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold disabled:opacity-50">{submitting ? 'Opening...' : 'Open'}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showCloseModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0.95 }} className="w-full max-w-md rounded-2xl p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Close Cash Drawer</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Expected balance: <strong>ETB {expectedBalance.toLocaleString()}</strong></p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Closing Balance (ETB)</label>
                  <input type="number" value={closingBalance} onChange={(e) => setClosingBalance(Number(e.target.value))} className="w-full rounded-xl px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white outline-none" min={0} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notes (optional)</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full rounded-xl px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white outline-none resize-none" rows={2} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowCloseModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium">Cancel</button>
                  <button onClick={handleClose} disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold disabled:opacity-50">{submitting ? 'Closing...' : 'Close & Count'}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showTxModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0.95 }} className="w-full max-w-md rounded-2xl p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add Transaction</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Type</label>
                  <select value={txType} onChange={(e) => setTxType(e.target.value)} className="w-full rounded-xl px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white outline-none">
                    <option value="deposit">Deposit (Cash In)</option>
                    <option value="withdrawal">Withdrawal (Cash Out)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Amount (ETB)</label>
                  <input type="number" value={txAmount} onChange={(e) => setTxAmount(Number(e.target.value))} className="w-full rounded-xl px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white outline-none" min={1} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Reason (optional)</label>
                  <input type="text" value={txReason} onChange={(e) => setTxReason(e.target.value)} className="w-full rounded-xl px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white outline-none" placeholder="e.g., Safe drop, expense..." />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowTxModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium">Cancel</button>
                  <button onClick={handleTransaction} disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold disabled:opacity-50">{submitting ? 'Saving...' : 'Save'}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
