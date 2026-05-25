import { motion } from 'framer-motion';
import {
  FiTrendingUp, FiStar, FiBarChart2, FiClock, FiAward,
  FiTarget, FiThumbsUp, FiZap
} from 'react-icons/fi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, RadialBarChart, RadialBar, Legend
} from 'recharts';
import { performanceData, weeklyEarnings } from './data';

const tooltipStyle = {
  background: 'var(--glass-bg)', border: '1px solid var(--border-color)',
  borderRadius: '12px', backdropFilter: 'blur(16px)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)', padding: '8px 12px',
};

export default function PerformancePanel() {
  const data = performanceData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Driver Performance</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Analytics & insights</p>
        </div>
        <div className="flex items-center gap-2">
          {['Today', 'Week', 'Month'].map(r => (
            <button key={r} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ background: 'rgba(6,182,212,0.1)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.2)' }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Acceptance Rate', value: `${data.acceptanceRate}%`, icon: FiThumbsUp, color: '#10b981', change: '+2%' },
          { title: 'Avg Delivery Time', value: `${data.avgDeliveryTime}m`, icon: FiClock, color: '#f59e0b', change: '-1.5m' },
          { title: 'Satisfaction', value: data.satisfactionScore, icon: FiStar, color: '#6366f1', change: '+0.3', decimals: 2 },
          { title: 'Driver Rank', value: data.ranking, icon: FiAward, color: '#06b6d4', change: '+2 spots' },
        ].map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl p-4" style={{
              background: `linear-gradient(135deg, ${item.color}10, ${item.color}05)`,
              border: `1px solid ${item.color}20`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{item.title}</span>
              <item.icon size={16} style={{ color: item.color }} />
            </div>
            <p className="text-xl font-bold" style={{ color: item.color }}>
              {item.decimals ? item.value : item.value}
            </p>
            <p className="text-xs mt-1 text-emerald-400">{item.change}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)' }}
        >
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Weekly Deliveries</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyEarnings.map((d, i) => ({ ...d, deliveries: performanceData.weeklyDeliveries[i] || 0 }))}>
              <defs>
                <linearGradient id="delBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.15)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.15)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="deliveries" fill="url(#delBar)" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-5" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)' }}
        >
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Peak Delivery Hours</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.peakHours}>
              <defs>
                <linearGradient id="peakDel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="hour" stroke="rgba(255,255,255,0.15)" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.15)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="deliveries" stroke="#f59e0b" strokeWidth={2} fill="url(#peakDel)" dot={{ r: 3, fill: '#f59e0b' }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="rounded-2xl p-5" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Earnings Analytics</h3>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>This week</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Today', amount: 2450, icon: FiZap, color: '#06b6d4' },
            { label: 'This Week', amount: 14750, icon: FiTrendingUp, color: '#10b981' },
            { label: 'This Month', amount: 58200, icon: FiBarChart2, color: '#6366f1' },
            { label: 'Avg Rating', amount: '4.92', icon: FiStar, color: '#f59e0b', suffix: '/5.0' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="text-center p-4 rounded-xl" style={{ background: 'var(--input-bg)' }}
            >
              <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center"
                style={{ background: `${item.color}20` }}
              >
                <item.icon size={18} style={{ color: item.color }} />
              </div>
              <p className="text-lg font-bold" style={{ color: item.color }}>
                ETB {typeof item.amount === 'number' ? item.amount.toLocaleString() : item.amount}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
