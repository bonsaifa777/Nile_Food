import { motion } from 'framer-motion';
import { FiClock, FiUserCheck, FiUserX, FiAlertCircle } from 'react-icons/fi';

export default function LiveStatusBar({ stats }) {
  if (!stats) return null;

  const items = [
    { icon: FiUserCheck, value: stats.currentlyWorking || 0, label: 'Working Now', color: 'text-emerald-400' },
    { icon: FiClock, value: stats.onBreak || 0, label: 'On Break', color: 'text-purple-400' },
    { icon: FiAlertCircle, value: stats.late || 0, label: 'Late Today', color: 'text-amber-400' },
    { icon: FiUserX, value: stats.absent || 0, label: 'Absent', color: 'text-red-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 flex items-center gap-6 overflow-x-auto"
    >
      <div className="flex items-center gap-2 shrink-0">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
        </span>
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Live</span>
      </div>
      <div className="h-6 w-px" style={{ background: 'var(--border-color)' }} />
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 shrink-0">
          <item.icon size={16} className={item.color} />
          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{item.value}</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
          {i < items.length - 1 && <div className="h-4 w-px mx-2" style={{ background: 'var(--border-color)' }} />}
        </div>
      ))}
    </motion.div>
  );
}
