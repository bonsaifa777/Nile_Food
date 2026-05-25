import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

function AnimatedCounter({ value, prefix = '', suffix = '', decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const start = prev.current;
    const end = Number(value);
    if (isNaN(end)) return;
    prev.current = end;
    const duration = 1200, startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <span>{prefix}{display.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>;
}

const gradients = [
  { from: '#06b6d4', to: '#22d3ee', border: 'rgba(6,182,212,0.3)', glow: 'rgba(6,182,212,0.2)' },
  { from: '#10b981', to: '#34d399', border: 'rgba(16,185,129,0.3)', glow: 'rgba(16,185,129,0.2)' },
  { from: '#f59e0b', to: '#fbbf24', border: 'rgba(245,158,11,0.3)', glow: 'rgba(245,158,11,0.2)' },
  { from: '#6366f1', to: '#8b5cf6', border: 'rgba(99,102,241,0.3)', glow: 'rgba(99,102,241,0.2)' },
  { from: '#ec4899', to: '#f472b6', border: 'rgba(236,72,153,0.3)', glow: 'rgba(236,72,153,0.2)' },
  { from: '#ef4444', to: '#f87171', border: 'rgba(239,68,68,0.3)', glow: 'rgba(239,68,68,0.2)' },
];

export default function MetricCard({ title, value, prefix = '', suffix = '', decimals = 0, icon: Icon, trend = '', trendUp = true, index = 0, progress = null, subtitle = '' }) {
  const g = gradients[index % gradients.length];
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 100, damping: 15 }}
      whileHover={{ y: -6, scale: 1.02, transition: { type: 'spring', stiffness: 300, damping: 15 } }}
      className="relative overflow-hidden group cursor-default rounded-2xl p-5"
      style={{
        background: `linear-gradient(135deg, ${g.from}12, ${g.to}06)`,
        border: `1px solid ${g.border}`,
        backdropFilter: 'blur(12px)',
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
    >
      <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${g.glow}, transparent 40%)` }}
      />
      <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500">
        <Icon size={120} />
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{title}</span>
          <motion.div whileHover={{ rotate: 15, scale: 1.1 }}
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})`, boxShadow: `0 4px 16px ${g.glow}` }}
          >
            <Icon size={18} className="text-white" />
          </motion.div>
        </div>
        <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          <AnimatedCounter value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
        </div>
        {subtitle && <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>}
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={trendUp ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
            </svg>
            <span>{trend}</span>
          </div>
        )}
        {progress !== null && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span style={{ color: 'var(--text-muted)' }}>Progress</span>
              <span style={{ color: g.from }}>{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: 'var(--input-bg)' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${g.from}, ${g.to})` }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
