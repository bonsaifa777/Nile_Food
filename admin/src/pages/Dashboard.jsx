import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { 
  FiShoppingBag, FiUsers, FiDollarSign, FiTrendingUp, 
  FiClock, FiArrowUp, FiArrowDown, FiBox, FiCoffee,
  FiActivity, FiBarChart2, FiRefreshCw
} from 'react-icons/fi';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell } from 'recharts';
import { format } from 'date-fns';

const ORDER_STATUS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  on_the_way: 'On the way',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

const statusColors = {
  pending: 'text-yellow-400',
  confirmed: 'text-blue-400',
  preparing: 'text-primary-400',
  ready: 'text-purple-400',
  on_the_way: 'text-cyan-400',
  delivered: 'text-green-400',
  cancelled: 'text-red-400'
};

const gradientColors = [
  { from: '#6366f1', to: '#8b5cf6', border: 'rgba(99, 102, 241, 0.3)', glow: 'rgba(99, 102, 241, 0.2)', light: '#a5b4fc' },
  { from: '#10b981', to: '#34d399', border: 'rgba(16, 185, 129, 0.3)', glow: 'rgba(16, 185, 129, 0.2)', light: '#6ee7b7' },
  { from: '#f59e0b', to: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)', glow: 'rgba(245, 158, 11, 0.2)', light: '#fde68a' },
  { from: '#ef4444', to: '#f87171', border: 'rgba(239, 68, 68, 0.3)', glow: 'rgba(239, 68, 68, 0.2)', light: '#fca5a5' },
];

function AnimatedCounter({ value, suffix = '', prefix = '' }) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValue = useRef(0);
  const nodeRef = useRef(null);

  useEffect(() => {
    const start = prevValue.current;
    const end = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : Number(value);
    if (isNaN(end)) { setDisplayValue(value); return; }
    prevValue.current = end;
    const duration = 1200;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(start + (end - start) * eased);
      setDisplayValue(current);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);

  return <span ref={nodeRef}>{prefix}{displayValue.toLocaleString()}{suffix}</span>;
}

function FloatingParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let w, h;

    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.06,
      speedY: (Math.random() - 0.5) * 0.06,
      opacity: Math.random() * 0.4 + 0.1,
      hue: Math.random() > 0.5 ? 240 : 280,
    }));

    const resize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < -5 || p.x > 105) p.speedX *= -1;
        if (p.y < -5 || p.y > 105) p.speedY *= -1;
        const cx = (p.x / 100) * w;
        const cy = (p.y / 100) * h;
        ctx.beginPath();
        ctx.arc(cx, cy, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 70%, ${p.opacity})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

function Blob({ className, color1, color2, size, delay, duration }) {
  return (
    <div
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 30%, ${color1}, ${color2})`,
        filter: 'blur(80px)',
        opacity: 0.3,
        animation: `blobMove ${duration}s ease-in-out ${delay}s infinite`,
      }}
    />
  );
}

function TiltCard({ children, className = '', style = {} }) {
  const ref = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    ref.current.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02,1.02,1.02)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.15s ease-out',
        willChange: 'transform',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}

function StatCard({ stat, index }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-8, 8]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 120, damping: 14 }}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          x.set((e.clientX - rect.left) / rect.width - 0.5);
          y.set((e.clientY - rect.top) / rect.height - 0.5);
        }}
        onMouseLeave={() => { x.set(0); y.set(0); }}
        className="stat-card relative overflow-hidden group cursor-default"
      >
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${stat.gradient.glow}, transparent 40%)`,
          }}
        />
        <div className="absolute -top-12 -right-12 w-32 h-32 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500 rounded-full"
          style={{ background: `radial-gradient(circle, ${stat.gradient.from}, transparent 70%)` }}
        />
        <div className="relative z-10 flex items-center justify-between h-full" style={{ transformStyle: 'preserve-3d' }}>
          <div className="flex flex-col justify-between h-full" style={{ transform: 'translateZ(24px)' }}>
            <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">{stat.title}</p>
            <div>
              <p className="text-3xl font-bold mt-2 tracking-tight">
                <AnimatedCounter value={stat.value} prefix={stat.prefix || ''} />
              </p>
            </div>
            <p className={`text-sm mt-3 flex items-center gap-1.5 ${stat.up ? 'text-green-400' : 'text-red-400'}`}>
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-current/10">
                {stat.up ? <FiArrowUp size={10} /> : <FiArrowDown size={10} />}
              </span>
              {stat.change} from last week
            </p>
          </div>
          <motion.div
            whileHover={{ rotate: 360, scale: 1.15 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ml-4"
            style={{
              background: `linear-gradient(135deg, ${stat.gradient.from}, ${stat.gradient.to})`,
              boxShadow: `0 8px 32px ${stat.gradient.glow}`,
              transform: 'translateZ(32px)',
            }}
          >
            <stat.icon size={22} className="text-white" />
          </motion.div>
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(90deg, transparent, ${stat.gradient.from}, ${stat.gradient.to}, transparent)`,
          }}
        />
      </motion.div>
    </motion.div>
  );
}

function CustomTooltip({ active, payload, label, isRevenue }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl px-4 py-3 shadow-2xl" style={{
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(16px)',
      }}>
        <p className="text-xs font-medium text-gray-400 mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
            {isRevenue ? `ETB ${entry.value.toLocaleString()}` : entry.value} {entry.name}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popularFoods, setPopularFoods] = useState([]);
  const [barChartKey, setBarChartKey] = useState(0);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [dashRes, analyticsRes] = await Promise.all([
        axios.get('/api/admin/dashboard'),
        axios.get('/api/admin/analytics?range=7days')
      ]);
      setStats(dashRes.data.data.stats);
      setRecentOrders(dashRes.data.data.recentOrders || []);
      setPopularFoods(dashRes.data.data.popularFoods || []);
      const data = analyticsRes.data.data.salesByDay.map(d => ({
        name: d._id ? new Date(d._id).toLocaleDateString('en-US', { weekday: 'short' }) : d._id,
        orders: d.orders || 0,
        revenue: d.sales || 0
      }));
      setChartData(data);
      setTimeout(() => setBarChartKey(prev => prev + 1), 100);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Orders', value: stats?.totalOrders || 0, change: '+12%', up: true, icon: FiShoppingBag, gradient: gradientColors[0] },
    { title: 'Revenue', value: stats?.totalRevenue || 0, change: '+8%', up: true, prefix: 'ETB ', icon: FiDollarSign, gradient: gradientColors[1] },
    { title: 'Customers', value: stats?.totalUsers || 0, change: '+15%', up: true, icon: FiUsers, gradient: gradientColors[2] },
    { title: 'Active Foods', value: stats?.totalFoods || 0, change: '', up: true, icon: FiCoffee, gradient: gradientColors[3] }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="h-8 w-64 shimmer rounded-lg" />
            <div className="h-4 w-40 shimmer rounded-lg" />
          </div>
          <div className="h-10 w-36 shimmer rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="h-40 shimmer rounded-2xl"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 shimmer rounded-2xl" />
          <div className="h-80 shimmer rounded-2xl" />
        </div>
        <div className="h-72 shimmer rounded-2xl" />
      </motion.div>
    );
  }

  return (
    <>
      <FloatingParticles />
      
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <Blob
          className="-top-40 -left-40"
          color1="rgba(99,102,241,0.12)"
          color2="rgba(79,70,229,0.05)"
          size="500px"
          delay={0}
          duration={8}
        />
        <Blob
          className="-bottom-32 -right-32"
          color1="rgba(129,140,248,0.1)"
          color2="rgba(99,102,241,0.03)"
          size="400px"
          delay={-3}
          duration={10}
        />
        <Blob
          className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          color1="rgba(165,180,252,0.06)"
          color2="rgba(99,102,241,0.02)"
          size="350px"
          delay={-6}
          duration={12}
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 relative"
        style={{ zIndex: 1 }}
      >
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <motion.h1
              initial={{ backgroundPosition: '0% 50%' }}
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent"
              style={{ backgroundSize: '200% auto' }}
            >
              Dashboard
            </motion.h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-dot inline-block" />
              Welcome back! Here's your restaurant overview.
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            className="text-sm px-4 py-2.5 rounded-xl flex items-center gap-2"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <FiClock size={14} className="text-indigo-400" />
            <span>{format(new Date(), 'MMMM d, yyyy')}</span>
          </motion.div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {statCards.map((stat, index) => (
            <StatCard key={stat.title} stat={stat} index={index} />
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            variants={itemVariants}
            className="glass-card overflow-hidden"
            whileHover={{ y: -3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <FiBarChart2 size={16} className="text-indigo-400" />
                  Orders Overview
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Weekly order statistics</p>
              </div>
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: '#818cf8',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                }}
              >
                This Week
              </motion.div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart key={barChartKey} data={chartData.length > 0 ? chartData : [{ name: 'No Data', orders: 0, revenue: 0 }]}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.3} />
                  </linearGradient>
                  {chartData.map((_, i) => (
                    <linearGradient key={i} id={`barGrad_${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={i % 2 === 0 ? '#6366f1' : '#8b5cf6'} stopOpacity={0.9} />
                      <stop offset="100%" stopColor={i % 2 === 0 ? '#6366f1' : '#8b5cf6'} stopOpacity={0.3} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
                <Bar
                  dataKey="orders"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                  animationBegin={200}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={`url(#barGrad_${i})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="glass-card overflow-hidden"
            whileHover={{ y: -3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <FiTrendingUp size={16} className="text-emerald-400" />
                  Revenue Trend
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Revenue over time</p>
              </div>
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                }}
              >
                <span className="flex items-center gap-1">
                  <FiTrendingUp size={12} /> +18%
                </span>
              </motion.div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData.length > 0 ? chartData : [{ name: 'No Data', orders: 0, revenue: 0 }]}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip isRevenue />} cursor={{ fill: 'rgba(16,185,129,0.08)' }} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#areaGradient)"
                  dot={false}
                  activeDot={{
                    r: 7,
                    fill: '#10b981',
                    stroke: '#0b1120',
                    strokeWidth: 3,
                  }}
                  animationBegin={300}
                  animationDuration={1000}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {popularFoods.length > 0 && (
          <motion.div variants={itemVariants}>
            <TiltCard className="glass-card overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <FiCoffee size={16} className="text-amber-400" />
                    Popular Food Items
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">Most ordered this week</p>
                </div>
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <FiRefreshCw size={14} className="text-gray-500" />
                </motion.div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {popularFoods.map((item, i) => (
                  <motion.div
                    key={item._id || i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, type: 'spring', stiffness: 100 }}
                    whileHover={{
                      y: -8,
                      scale: 1.03,
                      transition: { type: 'spring', stiffness: 300, damping: 12 }
                    }}
                    className="p-4 rounded-xl text-center group cursor-pointer"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                      className="w-14 h-14 rounded-xl mx-auto mb-3 flex items-center justify-center text-xl relative overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${gradientColors[i % 4].from}20, ${gradientColors[i % 4].to}10)`,
                        border: `1px solid ${gradientColors[i % 4].border}`,
                      }}
                    >
                      <motion.div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          background: `linear-gradient(135deg, ${gradientColors[i % 4].from}30, ${gradientColors[i % 4].to}20)`,
                        }}
                      />
                      <FiCoffee size={20} style={{ color: gradientColors[i % 4].from, position: 'relative', zIndex: 1 }} />
                    </motion.div>
                    <p className="text-sm font-semibold truncate">{item.name || 'Unknown Item'}</p>
                    <p className="text-xs mt-1 flex items-center justify-center gap-1" style={{ color: gradientColors[i % 4].from }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: gradientColors[i % 4].from }} />
                      {item.count} ordered
                    </p>
                  </motion.div>
                ))}
              </div>
            </TiltCard>
          </motion.div>
        )}

        <motion.div
          variants={itemVariants}
          className="glass-card overflow-hidden"
          whileHover={{ y: -3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FiActivity size={16} className="text-cyan-400" />
                Recent Orders
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Latest transactions</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              className="text-sm px-4 py-2 rounded-xl font-medium transition-colors"
              style={{
                background: 'rgba(99, 102, 241, 0.1)',
                color: '#818cf8',
                border: '1px solid rgba(99, 102, 241, 0.15)',
              }}
            >
              View All
            </motion.button>
          </div>

          <div className="overflow-x-auto -mx-6">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date'].map((header) => (
                    <th key={header} className="text-left py-3 px-6 text-xs font-medium uppercase tracking-widest text-gray-500">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <FiBox size={36} className="mx-auto text-gray-600 mb-3" />
                      </motion.div>
                      <p className="text-gray-500">No recent orders</p>
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order, i) => (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, type: 'spring', stiffness: 80, damping: 20 }}
                      className="group cursor-pointer"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      whileHover={{
                        background: 'rgba(99, 102, 241, 0.04)',
                        transition: { duration: 0.2 }
                      }}
                    >
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm font-medium">{order.orderId}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium"
                            style={{
                              background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))',
                              border: '1px solid rgba(99,102,241,0.15)',
                            }}
                          >
                            {(order.guestName || order.user?.name || 'G').charAt(0).toUpperCase()}
                          </motion.div>
                          <span className="text-sm">{order.guestName || order.user?.name || 'Guest'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-400">{order.items?.length || 0} items</td>
                      <td className="py-4 px-6 text-sm font-semibold">ETB {order.total?.toLocaleString()}</td>
                      <td className="py-4 px-6">
                        <motion.span
                          animate={{ scale: [1, 1.02, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={`px-3 py-1 rounded-lg text-xs font-medium inline-block ${statusColors[order.status] || 'text-gray-400'}`}
                          style={{
                            background: order.status === 'delivered' ? 'rgba(16,185,129,0.1)' :
                                        order.status === 'pending' ? 'rgba(245,158,11,0.1)' :
                                        order.status === 'cancelled' ? 'rgba(239,68,68,0.1)' :
                                        order.status === 'preparing' ? 'rgba(249,115,22,0.1)' :
                                        order.status === 'confirmed' ? 'rgba(59,130,246,0.1)' :
                                        order.status === 'on_the_way' ? 'rgba(6,182,212,0.1)' :
                                        order.status === 'ready' ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${
                              order.status === 'delivered' ? 'rgba(16,185,129,0.2)' :
                              order.status === 'pending' ? 'rgba(245,158,11,0.2)' :
                              order.status === 'cancelled' ? 'rgba(239,68,68,0.2)' :
                              order.status === 'preparing' ? 'rgba(249,115,22,0.2)' :
                              order.status === 'confirmed' ? 'rgba(59,130,246,0.2)' :
                              order.status === 'on_the_way' ? 'rgba(6,182,212,0.2)' :
                              order.status === 'ready' ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.05)'
                            }`,
                          }}
                        >
                          {ORDER_STATUS[order.status] || order.status}
                        </motion.span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500">
                        {format(new Date(order.createdAt), 'MMM d, HH:mm')}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
