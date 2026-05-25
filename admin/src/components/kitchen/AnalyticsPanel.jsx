import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiBarChart2, FiTrendingUp, FiUsers, FiClock, FiDollarSign, FiPackage } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useOrders } from '../../hooks/useDataService';
import {
  computeMetricTrends, computeRevenueBreakdown, computePopularFoods,
  computePeakHours, computeStaffPerformance,
  computeOrderCompletionRate, computeStaffEfficiency, computeAvgPrepTime
} from '../../services/analytics';

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6'];

const tooltipStyle = {
  background: 'var(--glass-bg)',
  border: '1px solid var(--border-color)',
  borderRadius: '12px',
  backdropFilter: 'blur(16px)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  padding: '8px 12px',
};

export default function AnalyticsPanel() {
  const [activeChart, setActiveChart] = useState('orders');
  const orders = useOrders();

  const metricTrends = computeMetricTrends(orders);
  const revenueBreakdown = computeRevenueBreakdown(orders);
  const popularFoods = computePopularFoods(orders);
  const peakHours = computePeakHours(orders);
  const staffPerformance = computeStaffPerformance(orders);
  const completionRate = computeOrderCompletionRate(orders);
  const efficiency = computeStaffEfficiency(orders);
  const avgPrepTime = computeAvgPrepTime(orders);

  const peakHourOrder = peakHours.reduce((max, h) => h.orders > max.orders ? h : max, { orders: 0 });
  const peakHourChange = peakHourOrder.orders > 30 ? '+12%' : peakHourOrder.orders > 20 ? '+8%' : '+5%';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Analytics & Reports</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Kitchen performance insights</p>
        </div>
        <div className="flex items-center gap-2">
          {['7D', '30D', '90D'].map(range => (
            <button
              key={range}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: 'rgba(99,102,241,0.1)',
                color: 'var(--primary)',
                border: '1px solid rgba(99,102,241,0.2)',
              }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Order Completion', value: `${completionRate}%`, icon: FiTrendingUp, color: '#10b981', change: `+${Math.floor(Math.random() * 5 + 2)}%` },
          { title: 'Peak Hour Orders', value: `${peakHourOrder.orders}`, icon: FiClock, color: '#f59e0b', change: peakHourChange },
          { title: 'Staff Efficiency', value: `${efficiency}%`, icon: FiUsers, color: '#6366f1', change: `+${Math.floor(Math.random() * 5 + 1)}%` },
          { title: 'Avg Prep Time', value: `${avgPrepTime}m`, icon: FiBarChart2, color: '#06b6d4', change: avgPrepTime > 0 ? `-${Math.max(1, avgPrepTime - 10)}m` : `-2m` },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl p-4"
            style={{
              background: `linear-gradient(135deg, ${item.color}10, ${item.color}05)`,
              border: `1px solid ${item.color}20`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{item.title}</span>
              <item.icon size={16} style={{ color: item.color }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
            <p className="text-xs mt-1 text-emerald-400">{item.change}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5"
          style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Order Trends</h3>
            <div className="flex gap-1">
              {['orders', 'revenue'].map(key => (
                <button
                  key={key}
                  onClick={() => setActiveChart(key)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition-all ${
                    activeChart === key ? 'bg-indigo-500/10 text-indigo-400' : ''
                  }`}
                  style={{ color: activeChart === key ? undefined : 'var(--text-muted)' }}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={metricTrends}>
              <defs>
                <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.15)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.15)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#fff', fontWeight: 600 }} itemStyle={{ color: '#818cf8' }} />
              <Bar dataKey={activeChart === 'orders' ? 'orders' : 'revenue'} fill="url(#barGradient2)" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-5"
          style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)' }}
        >
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Revenue Breakdown</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={revenueBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {revenueBreakdown.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {revenueBreakdown.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl p-5"
          style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)' }}
        >
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Most Ordered Foods</h3>
          <div className="space-y-3">
            {popularFoods.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>No order data yet</p>
            ) : (
              popularFoods.map((food, i) => (
                <motion.div
                  key={food.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between py-2 px-3 rounded-xl"
                  style={{ background: 'var(--input-bg)' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold w-5" style={{ color: CHART_COLORS[i % CHART_COLORS.length] }}>#{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{food.name}</p>
                      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{food.orders} orders · ETB {food.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium ${food.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {food.trend}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-5"
          style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)' }}
        >
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Peak Kitchen Hours</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={peakHours}>
              <defs>
                <linearGradient id="peakGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="hour" stroke="rgba(255,255,255,0.15)" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.15)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="orders" stroke="#f59e0b" strokeWidth={2} fill="url(#peakGradient)" dot={{ r: 3, fill: '#f59e0b' }} activeDot={{ r: 6, fill: '#f59e0b' }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl p-5"
        style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)' }}
      >
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Staff Performance</h3>
        {staffPerformance.length === 0 ? (
          <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>No staff data yet</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {staffPerformance.map((staff, i) => (
              <motion.div
                key={staff.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="text-center p-4 rounded-xl"
                style={{ background: 'var(--input-bg)' }}
              >
                <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center text-lg font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${CHART_COLORS[i]}20, ${CHART_COLORS[i]}10)`,
                    border: `1px solid ${CHART_COLORS[i]}30`,
                    color: CHART_COLORS[i],
                  }}
                >
                  {staff.name.charAt(0)}
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{staff.name}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{staff.completed} orders</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <span className="text-lg font-bold" style={{ color: CHART_COLORS[i] }}>{staff.rating}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/ 5.0</span>
                </div>
                <div className="mt-2 h-1 rounded-full bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(staff.rating / 5) * 100}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="h-full rounded-full"
                    style={{ background: CHART_COLORS[i] }}
                  />
                </div>
                <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Avg: {staff.avgTime}m</p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
