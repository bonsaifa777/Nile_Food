import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiFileText, FiCalendar } from 'react-icons/fi';
import { getDailyReport, getWeeklyReport, getMonthlyReport, exportCSV } from '../services/attendanceApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

export default function AttendanceReports() {
  const [view, setView] = useState('daily');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    date: new Date().toISOString().split('T')[0],
    start: '', end: '',
    month: String(new Date().getMonth() + 1).padStart(2, '0'),
    year: String(new Date().getFullYear()),
  });

  useEffect(() => { fetchReport(); }, [view, dateRange]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let res;
      if (view === 'daily') res = await getDailyReport({ date: dateRange.date });
      else if (view === 'weekly') res = await getWeeklyReport({ start: dateRange.start || undefined });
      else res = await getMonthlyReport({ month: dateRange.month, year: dateRange.year });
      if (res.success) setData(res.data);
    } catch {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportCSV({
        start: dateRange.start || dateRange.date,
        end: dateRange.end || dateRange.date
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-report.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Report exported');
    } catch {
      toast.error('Export failed');
    }
  };

  const records = data?.records || [];
  const summary = data?.summary || {};

  const pieData = [
    { name: 'Present', value: summary.present || 0 },
    { name: 'Absent', value: summary.absent || 0 },
    { name: 'Late', value: summary.late || 0 },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Attendance Reports</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Generate and export attendance reports</p>
        </div>
        <button onClick={handleExport} className="btn-primary flex items-center gap-2 text-sm">
          <FiDownload size={14} /> Export CSV
        </button>
      </div>

      <div className="glass-card p-4 flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          {['daily', 'weekly', 'monthly'].map(tab => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                view === tab ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className="h-6 w-px" style={{ background: 'var(--border-color)' }} />
        {view === 'daily' && (
          <input type="date" value={dateRange.date} onChange={e => setDateRange({ ...dateRange, date: e.target.value })} className="input-glass py-2 text-sm w-40" />
        )}
        {view === 'weekly' && (
          <div className="flex gap-2">
            <input type="date" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} className="input-glass py-2 text-sm w-40" placeholder="Start" />
            <input type="date" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} className="input-glass py-2 text-sm w-40" placeholder="End" />
          </div>
        )}
        {view === 'monthly' && (
          <div className="flex gap-2">
            <select value={dateRange.month} onChange={e => setDateRange({ ...dateRange, month: e.target.value })} className="input-glass py-2 text-sm w-32">
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                  {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
            <select value={dateRange.year} onChange={e => setDateRange({ ...dateRange, year: e.target.value })} className="input-glass py-2 text-sm w-28">
              {Array.from({ length: 5 }, (_, i) => (
                <option key={i} value={String(new Date().getFullYear() - 2 + i)}>
                  {new Date().getFullYear() - 2 + i}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 text-center">
              <p className="text-2xl font-bold text-indigo-400">{summary.totalHours || 0}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Total Hours</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">{summary.present || 0}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Present</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 text-center">
              <p className="text-2xl font-bold text-red-400">{summary.absent || 0}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Absent</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 text-center">
              <p className="text-2xl font-bold text-amber-400">{summary.late || 0}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Late</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Overview</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData.filter(d => d.value > 0)} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {view === 'weekly' && data?.daily && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Daily Breakdown</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.daily.map(d => ({ ...d, date: d.date?.slice(5) }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                      <YAxis stroke="var(--text-muted)" fontSize={12} />
                      <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                      <Bar dataKey="totalHours" name="Hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Detailed Records</h3>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    <th className="pb-3 pr-4 sticky top-0" style={{ background: 'var(--bg-body)' }}>Employee</th>
                    <th className="pb-3 pr-4 sticky top-0" style={{ background: 'var(--bg-body)' }}>Date</th>
                    <th className="pb-3 pr-4 sticky top-0" style={{ background: 'var(--bg-body)' }}>Clock In</th>
                    <th className="pb-3 pr-4 sticky top-0" style={{ background: 'var(--bg-body)' }}>Clock Out</th>
                    <th className="pb-3 pr-4 sticky top-0" style={{ background: 'var(--bg-body)' }}>Hours</th>
                    <th className="pb-3 pr-4 sticky top-0" style={{ background: 'var(--bg-body)' }}>OT</th>
                    <th className="pb-3 pr-4 sticky top-0" style={{ background: 'var(--bg-body)' }}>Late</th>
                    <th className="pb-3 pr-4 sticky top-0" style={{ background: 'var(--bg-body)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => (
                    <tr key={r._id || i} className="border-t" style={{ borderColor: 'var(--border-color)' }}>
                      <td className="py-2 pr-4 text-sm" style={{ color: 'var(--text-primary)' }}>{r.user?.name || 'Unknown'}</td>
                      <td className="py-2 pr-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{r.date}</td>
                      <td className="py-2 pr-4 text-sm">{r.clockIn ? new Date(r.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                      <td className="py-2 pr-4 text-sm">{r.clockOut ? new Date(r.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                      <td className="py-2 pr-4 text-sm font-medium">{r.totalHours || 0}h</td>
                      <td className="py-2 pr-4 text-sm">{r.overtimeHours || 0}h</td>
                      <td className="py-2 pr-4 text-sm">{r.isLate ? `${r.lateMinutes}min` : '-'}</td>
                      <td className="py-2 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          r.status === 'clocked_in' || r.status === 'clocked_out' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'
                        }`}>{r.status?.replace(/_/g, ' ') || 'absent'}</span>
                      </td>
                    </tr>
                  ))}
                  {records.length === 0 && (
                    <tr><td colSpan={8} className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>No records found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
