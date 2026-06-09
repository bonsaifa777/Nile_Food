import { motion } from 'framer-motion';
import { FiUsers, FiClock, FiAlertCircle, FiCoffee, FiUserCheck, FiUserX, FiTrendingUp } from 'react-icons/fi';

const statCards = [
  { key: 'present', label: 'Present', icon: FiUserCheck, color: 'from-emerald-500 to-green-600', glow: 'rgba(16,185,129,0.3)' },
  { key: 'absent', label: 'Absent', icon: FiUserX, color: 'from-red-500 to-rose-600', glow: 'rgba(239,68,68,0.3)' },
  { key: 'late', label: 'Late', icon: FiAlertCircle, color: 'from-amber-500 to-orange-600', glow: 'rgba(245,158,11,0.3)' },
  { key: 'currentlyWorking', label: 'Working', icon: FiClock, color: 'from-blue-500 to-indigo-600', glow: 'rgba(59,130,246,0.3)' },
  { key: 'onBreak', label: 'On Break', icon: FiCoffee, color: 'from-purple-500 to-violet-600', glow: 'rgba(139,92,246,0.3)' },
  { key: 'totalStaff', label: 'Total Staff', icon: FiUsers, color: 'from-sky-500 to-cyan-600', glow: 'rgba(14,165,233,0.3)' },
];

export default function AttendanceStats({ stats }) {
  if (!stats) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((card, i) => {
        const Icon = card.icon;
        const value = stats[card.key] ?? 0;
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4 relative overflow-hidden group"
          >
            <div
              className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-10 transition-all duration-500 group-hover:opacity-20"
              style={{ background: `linear-gradient(135deg, ${card.color})` }}
            />
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg"
                style={{ background: `linear-gradient(135deg, ${card.color})`, boxShadow: `0 4px 12px ${card.glow}` }}
              >
                <Icon />
              </div>
            </div>
            <p className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{value}</p>
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
