import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiChevronDown } from 'react-icons/fi';

const statusStyles = {
  clocked_in: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  on_break: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  clocked_out: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  absent: 'bg-red-500/10 text-red-400 border-red-500/20',
  on_leave: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

export default function EmployeeTable({ employees }) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    if (!employees) return [];
    return employees.filter(e => {
      if (search && !e.name?.toLowerCase().includes(search.toLowerCase())) return false;
      if (roleFilter !== 'all' && e.role !== roleFilter) return false;
      if (statusFilter !== 'all' && e.status !== statusFilter) return false;
      return true;
    });
  }, [employees, search, roleFilter, statusFilter]);

  const roles = useMemo(() => {
    if (!employees) return [];
    return [...new Set(employees.map(e => e.role))];
  }, [employees]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Employee Status</h3>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-glass pl-9 pr-4 py-2 text-sm w-full sm:w-48"
            />
          </div>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="input-glass py-2 text-sm w-32"
          >
            <option value="all">All Roles</option>
            {roles.map(r => (
              <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input-glass py-2 text-sm w-32"
          >
            <option value="all">All Status</option>
            <option value="clocked_in">Active</option>
            <option value="on_break">On Break</option>
            <option value="clocked_out">Clocked Out</option>
            <option value="absent">Absent</option>
            <option value="on_leave">On Leave</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              <th className="pb-3 pr-4">Employee</th>
              <th className="pb-3 pr-4">Role</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3 pr-4">Shift</th>
              <th className="pb-3 pr-4">Clock In</th>
              <th className="pb-3 pr-4">Hours</th>
              <th className="pb-3 pr-4">Late</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp, i) => {
              const st = statusStyles[emp.status] || statusStyles.absent;
              return (
                <motion.tr
                  key={emp._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-t transition-colors hover:bg-white/[0.02]"
                  style={{ borderColor: 'var(--table-border)' }}
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      {emp.avatar ? (
                        <img src={emp.avatar} alt="" className="w-8 h-8 rounded-lg object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                          {emp.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{emp.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>{emp.role?.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${st}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.split(' ')[0]?.replace('bg-', 'bg-')}`} />
                      {emp.status?.replace(/_/g, ' ') || 'Unknown'}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {emp.shift?.name || '-'}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {emp.clockIn ? new Date(emp.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                      {emp.totalHours ? `${emp.totalHours}h` : '-'}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    {emp.isLate ? (
                      <span className="text-xs text-red-400">{emp.lateMinutes}min</span>
                    ) : (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>-</span>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No employees match the current filters</p>
        </div>
      )}
    </motion.div>
  );
}
