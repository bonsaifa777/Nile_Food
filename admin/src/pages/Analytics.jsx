import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiShoppingBag, FiUsers } from 'react-icons/fi';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4'];

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7days');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/admin/analytics?range=${dateRange}`);
      setStats(data.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const salesData = (stats?.salesByDay || []).map(d => ({
    date: d._id ? new Date(d._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : d._id,
    sales: d.sales || 0,
    orders: d.orders || 0
  }));

  const categoryData = stats?.byCategory || [];
  const topFoods = stats?.topFoods || [];
  const totalRevenue = stats?.stats?.totalRevenue || 0;
  const totalOrders = stats?.stats?.totalOrders || 0;
  const newUsers = stats?.newUsers || 0;
  const avgOrderValue = stats?.stats?.avgOrderValue || 0;

  const kpiCards = [
    { label: 'Total Revenue', value: `ETB ${totalRevenue.toLocaleString()}`, icon: FiDollarSign, up: true },
    { label: 'Total Orders', value: totalOrders.toLocaleString(), change: '', icon: FiShoppingBag, up: true },
    { label: 'New Customers', value: newUsers.toLocaleString(), icon: FiUsers, up: true },
    { label: 'Avg. Order Value', value: `ETB ${avgOrderValue.toFixed(0)}`, icon: FiTrendingDown, up: avgOrderValue > 0 }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 shimmer rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 shimmer rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 shimmer rounded-2xl" />
          <div className="h-80 shimmer rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Analytics</h1>
          <p className="text-gray-500 mt-1">Business insights and trends</p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="input-glass"
        >
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
          <option value="90days">Last 90 days</option>
          <option value="year">This year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpiCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card"
          >
            <p className="text-gray-400 text-xs uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-bold mt-2">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card"
        >
          <h2 className="text-lg font-semibold mb-4">Sales Trend</h2>
          {salesData.length === 0 ? (
            <p className="text-gray-500 text-center py-20">No sales data in this period</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }} labelStyle={{ color: '#fff' }} />
                <Line type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card"
        >
          <h2 className="text-lg font-semibold mb-4">Orders by Category</h2>
          {categoryData.length === 0 ? (
            <p className="text-gray-500 text-center py-20">No category data</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={100}
                  fill="#8884d8" dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card"
      >
        <h2 className="text-lg font-semibold mb-4">Top Selling Foods</h2>
        {topFoods.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No sales data yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Food</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Orders</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topFoods.map((food, index) => (
                  <tr key={index} className="border-b border-gray-700/50">
                    <td className="py-3 px-4 font-medium">{food.name}</td>
                    <td className="py-3 px-4">{food.orders}</td>
                    <td className="py-3 px-4">ETB {food.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
