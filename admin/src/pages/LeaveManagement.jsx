import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiPlus, FiCalendar } from 'react-icons/fi';
import { getLeaveRequests, submitLeaveRequest, approveLeaveRequest, rejectLeaveRequest, getLeaveBalance } from '../services/attendanceApi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const leaveColors = {
  sick: 'from-red-500 to-rose-600',
  annual: 'from-blue-500 to-indigo-600',
  emergency: 'from-amber-500 to-orange-600',
  unpaid: 'from-gray-500 to-slate-600'
};

const statusStyles = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function LeaveManagement() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    type: 'sick', startDate: '', endDate: '', reason: '', notes: ''
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [l, b] = await Promise.all([
        getLeaveRequests({}),
        getLeaveBalance()
      ]);
      if (l.success) setLeaves(l.data.leaves);
      if (b.success) setBalance(b.data);
    } catch {
      toast.error('Failed to load leave data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.startDate || !form.endDate || !form.reason) {
      return toast.error('Please fill all required fields');
    }
    try {
      const res = await submitLeaveRequest(form);
      if (res.success) {
        toast.success('Leave request submitted');
        setShowForm(false);
        setForm({ type: 'sick', startDate: '', endDate: '', reason: '', notes: '' });
        fetchAll();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await approveLeaveRequest(id);
      if (res.success) { toast.success('Approved'); fetchAll(); }
    } catch { toast.error('Failed to approve'); }
  };

  const handleReject = async (id) => {
    const reason = prompt('Reason for rejection:');
    if (reason === null) return;
    try {
      const res = await rejectLeaveRequest(id, reason);
      if (res.success) { toast.success('Rejected'); fetchAll(); }
    } catch { toast.error('Failed to reject'); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Leave Management</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Submit and manage leave requests</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
          <FiPlus size={14} /> New Request
        </button>
      </div>

      {balance && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(balance.remaining).map(([key, val]) => (
            <motion.div key={key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 text-center">
              <p className="text-2xl font-bold" style={{
                color: val === Infinity ? 'var(--text-primary)' :
                  val <= 2 ? '#ef4444' : val <= 5 ? '#f59e0b' : '#10b981'
              }}>
                {val === Infinity ? '∞' : val}
              </p>
              <p className="text-xs capitalize mt-1" style={{ color: 'var(--text-muted)' }}>{key} Leave</p>
            </motion.div>
          ))}
        </div>
      )}

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>New Leave Request</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Leave Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="input-glass">
                <option value="sick">Sick Leave</option>
                <option value="annual">Annual Leave</option>
                <option value="emergency">Emergency Leave</option>
                <option value="unpaid">Unpaid Leave</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Start Date</label>
              <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="input-glass" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>End Date</label>
              <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="input-glass" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Notes (optional)</label>
              <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="input-glass" placeholder="Additional notes" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Reason</label>
              <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className="input-glass" rows={3} placeholder="Explain your reason..." />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSubmit} className="btn-primary text-sm">Submit Request</button>
            <button onClick={() => setShowForm(false)} className="btn-ghost text-sm">Cancel</button>
          </div>
        </motion.div>
      )}

      <div className="glass-card p-6">
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Leave Requests</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                <th className="pb-3 pr-4">Employee</th>
                <th className="pb-3 pr-4">Type</th>
                <th className="pb-3 pr-4">Duration</th>
                <th className="pb-3 pr-4">Reason</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Submitted</th>
                {isAdmin && <th className="pb-3 pr-4">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {leaves.map((l, i) => (
                <motion.tr
                  key={l._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-t" style={{ borderColor: 'var(--border-color)' }}
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                        {l.user?.name?.charAt(0) || '?'}
                      </div>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{l.user?.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${leaveColors[l.type] || 'from-gray-500 to-slate-600'}`}>
                      {l.type}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                    </span>
                    <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>({l.totalDays}d)</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{l.reason}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyles[l.status]}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                    {new Date(l.createdAt).toLocaleDateString()}
                  </td>
                  {isAdmin && (
                    <td className="py-3 pr-4">
                      {l.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleApprove(l._id)} className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10">
                            <FiCheckCircle size={16} />
                          </button>
                          <button onClick={() => handleReject(l._id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10">
                            <FiXCircle size={16} />
                          </button>
                        </div>
                      )}
                      {l.approvedBy && (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>by {l.approvedBy?.name}</span>
                      )}
                      {l.rejectionReason && (
                        <span className="text-xs text-red-400">{l.rejectionReason}</span>
                      )}
                    </td>
                  )}
                </motion.tr>
              ))}
              {leaves.length === 0 && (
                <tr><td colSpan={isAdmin ? 7 : 6} className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>No leave requests found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
