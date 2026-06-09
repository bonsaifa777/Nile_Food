import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiCheckCircle, FiCreditCard } from 'react-icons/fi';
import { getPayrolls, calculatePayroll, approvePayroll, payPayroll, getEmployees, getEmployeeSummary } from '../services/attendanceApi';
import toast from 'react-hot-toast';

export default function Payroll() {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCalc, setShowCalc] = useState(false);
  const [calcForm, setCalcForm] = useState({
    userId: '', periodStart: '', periodEnd: '', hourlyRate: 50, overtimeRate: 75
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [p, e] = await Promise.all([getPayrolls({}), getEmployees()]);
      if (p.success) setPayrolls(p.data.payrolls);
      if (e.success) setEmployees(e.data);
    } catch {
      toast.error('Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async () => {
    if (!calcForm.userId || !calcForm.periodStart || !calcForm.periodEnd) {
      return toast.error('Please fill all fields');
    }
    try {
      const res = await calculatePayroll(calcForm);
      if (res.success) {
        toast.success('Payroll calculated');
        setShowCalc(false);
        setCalcForm({ userId: '', periodStart: '', periodEnd: '', hourlyRate: 50, overtimeRate: 75 });
        fetchAll();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Calculation failed');
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await approvePayroll(id);
      if (res.success) { toast.success('Payroll approved'); fetchAll(); }
    } catch { toast.error('Failed to approve'); }
  };

  const handlePay = async (id) => {
    if (!confirm('Mark this payroll as paid?')) return;
    try {
      const res = await payPayroll(id);
      if (res.success) { toast.success('Payroll marked as paid'); fetchAll(); }
    } catch { toast.error('Failed to mark as paid'); }
  };

  const statusStyles = {
    draft: 'bg-gray-500/10 text-gray-400',
    calculated: 'bg-blue-500/10 text-blue-400',
    approved: 'bg-emerald-500/10 text-emerald-400',
    paid: 'bg-indigo-500/10 text-indigo-400',
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
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Payroll</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Calculate and manage employee payroll</p>
        </div>
        <button onClick={() => setShowCalc(true)} className="btn-primary flex items-center gap-2 text-sm">
          <FiDollarSign size={14} /> Calculate Payroll
        </button>
      </div>

      {showCalc && (
        <motion.div initial={{ opacity: 0, y: -10 }} className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Calculate Payroll</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Employee</label>
              <select value={calcForm.userId} onChange={e => setCalcForm({ ...calcForm, userId: e.target.value })} className="input-glass">
                <option value="">Select</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Period Start</label>
              <input type="date" value={calcForm.periodStart} onChange={e => setCalcForm({ ...calcForm, periodStart: e.target.value })} className="input-glass" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Period End</label>
              <input type="date" value={calcForm.periodEnd} onChange={e => setCalcForm({ ...calcForm, periodEnd: e.target.value })} className="input-glass" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Hourly Rate (ETB)</label>
              <input type="number" value={calcForm.hourlyRate} onChange={e => setCalcForm({ ...calcForm, hourlyRate: parseFloat(e.target.value) })} className="input-glass" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>OT Rate (ETB)</label>
              <input type="number" value={calcForm.overtimeRate} onChange={e => setCalcForm({ ...calcForm, overtimeRate: parseFloat(e.target.value) })} className="input-glass" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleCalculate} className="btn-primary text-sm">Calculate</button>
            <button onClick={() => setShowCalc(false)} className="btn-ghost text-sm">Cancel</button>
          </div>
        </motion.div>
      )}

      <div className="glass-card p-6">
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Payroll Records</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                <th className="pb-3 pr-4">Employee</th>
                <th className="pb-3 pr-4">Period</th>
                <th className="pb-3 pr-4">Hours</th>
                <th className="pb-3 pr-4">OT</th>
                <th className="pb-3 pr-4">Total Pay</th>
                <th className="pb-3 pr-4">Deductions</th>
                <th className="pb-3 pr-4">Net Pay</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.map((p, i) => (
                <motion.tr
                  key={p._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-t" style={{ borderColor: 'var(--border-color)' }}
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                        {p.user?.name?.charAt(0) || '?'}
                      </div>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{p.user?.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(p.periodStart).toLocaleDateString()} - {new Date(p.periodEnd).toLocaleDateString()}
                  </td>
                  <td className="py-3 pr-4 text-sm font-medium">{p.totalHoursWorked || 0}</td>
                  <td className="py-3 pr-4 text-sm">{p.overtimeHours || 0}</td>
                  <td className="py-3 pr-4 text-sm font-medium text-indigo-400">ETB {p.totalPay?.toLocaleString() || 0}</td>
                  <td className="py-3 pr-4 text-sm text-red-400">ETB {((p.latePenalties || 0) + (p.attendanceDeductions || 0)).toLocaleString()}</td>
                  <td className="py-3 pr-4 text-sm font-bold text-emerald-400">ETB {p.netPay?.toLocaleString() || 0}</td>
                  <td className="py-3 pr-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex gap-2">
                      {p.status === 'calculated' && (
                        <button onClick={() => handleApprove(p._id)} className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10" title="Approve">
                          <FiCheckCircle size={16} />
                        </button>
                      )}
                      {p.status === 'approved' && (
                        <button onClick={() => handlePay(p._id)} className="p-1.5 rounded-lg text-indigo-400 hover:bg-indigo-500/10" title="Mark as Paid">
                          <FiCreditCard size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
              {payrolls.length === 0 && (
                <tr><td colSpan={9} className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>No payroll records</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
