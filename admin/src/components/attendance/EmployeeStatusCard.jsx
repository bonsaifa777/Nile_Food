import { motion } from 'framer-motion';
import { FiClock, FiCheckCircle, FiXCircle, FiCoffee, FiMapPin } from 'react-icons/fi';

const statusConfig = {
  clocked_in: { label: 'Active', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  on_break: { label: 'On Break', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', dot: 'bg-purple-400' },
  clocked_out: { label: 'Clocked Out', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20', dot: 'bg-gray-400' },
  absent: { label: 'Absent', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', dot: 'bg-red-400' },
  on_leave: { label: 'On Leave', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-400' },
};

export default function EmployeeStatusCard({ employee, index = 0 }) {
  const cfg = statusConfig[employee.status] || statusConfig.absent;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`glass-card p-4 flex items-center gap-4 ${cfg.bg} ${cfg.border} border`}
    >
      <div className="relative">
        {employee.avatar ? (
          <img src={employee.avatar} alt="" className="w-12 h-12 rounded-xl object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            {employee.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
        )}
        <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${cfg.dot}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{employee.name}</p>
        <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{employee.role?.replace(/_/g, ' ')}</p>
        <span className={`inline-flex items-center gap-1 text-xs font-medium mt-1 ${cfg.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
      </div>
      <div className="text-right text-xs" style={{ color: 'var(--text-muted)' }}>
        {employee.clockIn && (
          <p className="flex items-center gap-1 justify-end">
            <FiClock size={10} />
            {new Date(employee.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
        {employee.totalHours > 0 && <p className="mt-1">{employee.totalHours}h</p>}
        {employee.isLate && (
          <p className="text-red-400 mt-1">{employee.lateMinutes}min late</p>
        )}
        {employee.shift && (
          <p className="text-indigo-400 mt-1">{employee.shift.name}</p>
        )}
      </div>
    </motion.div>
  );
}
