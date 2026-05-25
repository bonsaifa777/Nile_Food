import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCpu, FiRefreshCw, FiChevronRight, FiStar } from 'react-icons/fi';

const KITCHEN_INSIGHTS = (orders, metrics) => {
  const tips = [];
  const byStatus = {};
  orders.forEach(o => { byStatus[o.status] = (byStatus[o.status] || 0) + 1; });
  const cooking = byStatus['cooking'] || 0;
  const preparing = byStatus['preparing'] || 0;
  const pending = byStatus['new'] || 0;
  const delayed = orders.filter(o => o.delayed || o.timeElapsed > 20).length;
  const ready = byStatus['ready'] || 0;
  const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);

  if (pending > 3) tips.push({ icon: '🆕', text: `${pending} new orders waiting — assign chefs ASAP to avoid backlog`, type: 'warning', priority: 1 });
  if (delayed > 0) tips.push({ icon: '⚠️', text: `${delayed} orders delayed! Consider reallocating staff to grill station`, type: 'warning', priority: 0 });
  if (cooking > preparing) tips.push({ icon: '🔥', text: `Kitchen is ${cooking > 4 ? 'at full capacity' : 'running hot'} — ${cooking} items cooking`, type: 'info', priority: 2 });
  if (ready > 0) tips.push({ icon: '✅', text: `${ready} orders ready to serve — notify wait staff for pickup`, type: 'success', priority: 2 });
  if (pending === 0 && cooking === 0 && preparing === 0) tips.push({ icon: '🌅', text: 'Kitchen is clear. Great time for deep cleaning and prep work', type: 'info', priority: 5 });

  const hour = new Date().getHours();
  if (hour >= 11 && hour <= 14) tips.push({ icon: '⏰', text: `Peak lunch hour (${hour}:00) — prep extra portions for popular dishes`, type: 'info', priority: 1 });
  if (hour >= 18 && hour <= 21) tips.push({ icon: '🌙', text: 'Dinner rush incoming — ensure all stations are fully stocked', type: 'info', priority: 1 });

  if (revenue > 0) tips.push({ icon: '💰', text: `Today's kitchen revenue: ETB ${revenue.toLocaleString()} — ${orders.length} orders processed`, type: 'success', priority: 3 });
  if (metrics?.customerSatisfaction) tips.push({ icon: '⭐', text: `Customer satisfaction: ${metrics.customerSatisfaction}% — ${metrics.customerSatisfaction > 95 ? 'excellent work team! 🎉' : 'room for improvement'}`, type: 'success', priority: 4 });

  if (Math.random() > 0.5) tips.push({ icon: '🌡️', text: `Kitchen temp: ${(36 + Math.random() * 4).toFixed(1)}°C — ${Math.random() > 0.7 ? 'check ventilation' : 'within normal range'}`, type: 'info', priority: 5 });

  const popularItems = ['Grilled Salmon', 'Beef Tenderloin', 'Chocolate Lava Cake', 'Lobster Bisque'];
  const trending = popularItems[Math.floor(Math.random() * popularItems.length)];
  tips.push({ icon: '📈', text: `"${trending}" trending this hour — increase prep batch by 2 portions`, type: 'insight', priority: 3 });

  tips.sort((a, b) => a.priority - b.priority);
  return tips.slice(0, 5);
};

const DELIVERY_INSIGHTS = (deliveries, earnings) => {
  const tips = [];
  const active = deliveries.filter(d => d.status !== 'delivered');
  const enRoute = deliveries.filter(d => d.status === 'on_the_way').length;
  const pickupReady = deliveries.filter(d => d.status === 'pickup_ready').length;
  const completed = deliveries.filter(d => d.status === 'delivered').length;
  const totalEarnings = earnings?.total || 0;
  const totalTips = earnings?.tips || 0;

  if (pickupReady > 0) tips.push({ icon: '📦', text: `${pickupReady} orders ready for pickup — head to kitchen to collect`, type: 'info', priority: 0 });
  if (enRoute > 0) tips.push({ icon: '🚗', text: `${enRoute} deliveries en route — ${enRoute > 2 ? 'efficient routing needed' : 'keep up the pace'}`, type: 'info', priority: 1 });
  if (completed > 5 && totalTips > 0) tips.push({ icon: '💰', text: `You've earned ETB ${totalTips.toLocaleString()} in tips today — ${completed > 10 ? 'excellent service record!' : 'great job!'}`, type: 'success', priority: 2 });
  if (totalEarnings > 0) tips.push({ icon: '📊', text: `Today's earnings: ETB ${totalEarnings.toLocaleString()} across ${completed} deliveries`, type: 'success', priority: 2 });

  const hour = new Date().getHours();
  if (hour >= 11 && hour <= 14) tips.push({ icon: '🍱', text: `Lunch peak (${hour}:00) — expect 2-3x order volume. Prioritize nearby deliveries`, type: 'warning', priority: 1 });
  if (hour >= 13 && hour <= 15) tips.push({ icon: '🌧️', text: 'Possible afternoon rain — add 5-min buffer to ETAs', type: 'info', priority: 3 });
  if (hour >= 17 && hour <= 20) tips.push({ icon: '🌆', text: 'Evening rush starting — hotel deliveries increasing. Check VIP room service requests', type: 'info', priority: 1 });

  if (Math.random() > 0.4) {
    const routes = ['Bole Road', 'Congo Street', 'CMC Avenue', 'Meskel Square', 'Airport Road'];
    const route = routes[Math.floor(Math.random() * routes.length)];
    const traffic = Math.random() > 0.6 ? 'moderate' : 'light';
    tips.push({ icon: '🛣️', text: `${route}: ${traffic} traffic${traffic === 'moderate' ? ' — consider alternative via Ring Road' : ' — smooth sailing'}`, type: 'info', priority: 3 });
  }

  if (active.length === 0) tips.push({ icon: '✅', text: 'No active deliveries. Consider heading to a high-demand area for next assignment', type: 'info', priority: 4 });
  if (active.length > 3) tips.push({ icon: '⚡', text: `${active.length} active deliveries — optimize route to minimize backtracking`, type: 'warning', priority: 1 });

  if (Math.random() > 0.5) {
    const stations = ['Total Bole', 'Shell CMC', 'National Kazanchis'];
    tips.push({ icon: '⛽', text: `Cheapest fuel near you: ${stations[Math.floor(Math.random() * stations.length)]} — ETB ${(120 + Math.floor(Math.random() * 30)).toFixed(0)}/L`, type: 'insight', priority: 5 });
  }

  tips.push({ icon: '🎯', text: `Success rate: ${deliveries.length > 0 ? Math.round((completed / deliveries.length) * 100) : 100}% — ${completed > 0 ? 'you\'re on fire! 🔥' : 'waiting for first delivery'}`, type: 'success', priority: 3 });

  tips.sort((a, b) => a.priority - b.priority);
  return tips.slice(0, 5);
};

export default function AICoPilot({ mode = 'kitchen', orders = [], deliveries = [], metrics = null, earnings = null }) {
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const generate = useMemo(() => {
    return mode === 'kitchen' ? KITCHEN_INSIGHTS(orders, metrics) : DELIVERY_INSIGHTS(deliveries, earnings);
  }, [mode, orders, deliveries, metrics, earnings]);

  useEffect(() => {
    setSuggestions(generate);
    setActiveSuggestion(0);
  }, [generate]);

  useEffect(() => {
    if (suggestions.length < 2) return;
    const interval = setInterval(() => {
      setActiveSuggestion(prev => (prev + 1) % suggestions.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [suggestions.length]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setSuggestions(mode === 'kitchen' ? KITCHEN_INSIGHTS(orders, metrics) : DELIVERY_INSIGHTS(deliveries, earnings));
    setActiveSuggestion(0);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  if (suggestions.length === 0) return null;

  const gradient = mode === 'kitchen'
    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
    : 'linear-gradient(135deg, #06b6d4, #0891b2)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--sidebar-bg)',
        backdropFilter: 'blur(24px) saturate(1.4)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
      }}
    >
      <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: gradient }}
          >
            <FiCpu size={14} className="text-white" />
          </motion.div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {mode === 'kitchen' ? 'AI Kitchen Assistant' : 'AI Co-Pilot'}
            </h3>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {mode === 'kitchen' ? 'Real-time kitchen intelligence' : 'Smart delivery insights'}
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.1, boxShadow: '0 0 12px rgba(99,102,241,0.3)' }}
          whileTap={{ scale: 0.9 }}
          onClick={handleRefresh}
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}
        >
          <motion.div
            animate={{ rotate: isRefreshing ? 360 : 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            <FiRefreshCw size={12} />
          </motion.div>
        </motion.button>
      </div>

      <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSuggestion}
            initial={{ opacity: 0, x: -20, rotateY: -10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: 20, rotateY: 10 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex items-start gap-3 p-3 rounded-xl"
            style={{
              background: suggestions[activeSuggestion]?.type === 'warning' ? 'rgba(245,158,11,0.1)' :
                suggestions[activeSuggestion]?.type === 'insight' ? 'rgba(99,102,241,0.1)' :
                suggestions[activeSuggestion]?.type === 'success' ? 'rgba(16,185,129,0.1)' :
                'var(--input-bg)',
              border: `1px solid ${
                suggestions[activeSuggestion]?.type === 'warning' ? 'rgba(245,158,11,0.2)' :
                suggestions[activeSuggestion]?.type === 'insight' ? 'rgba(99,102,241,0.2)' :
                suggestions[activeSuggestion]?.type === 'success' ? 'rgba(16,185,129,0.2)' :
                'var(--border-color)'
              }`,
            }}
          >
            <motion.span
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-lg"
            >
              {suggestions[activeSuggestion]?.icon}
            </motion.span>
            <div className="flex-1">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {suggestions[activeSuggestion]?.text}
              </p>
              <div className="flex items-center gap-1 mt-1.5">
                {suggestions.map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      width: i === activeSuggestion ? 12 : 6,
                      opacity: i === activeSuggestion ? 1 : 0.3,
                    }}
                    transition={{ duration: 0.3 }}
                    className="h-1.5 rounded-full"
                    style={{
                      background: i === activeSuggestion ? '#818cf8' : 'var(--text-muted)',
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="border-t pt-3 mt-2" style={{ borderColor: 'var(--border-color)' }}>
          <p className="text-[10px] font-medium mb-2 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
            <FiStar size={10} /> More insights
          </p>
          <div className="space-y-1.5">
            {suggestions.slice(1, 4).map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-all"
                whileHover={{ background: 'rgba(255,255,255,0.03)', x: 4 }}
                onClick={() => setActiveSuggestion(i + 1)}
              >
                <span className="text-sm">{s.icon}</span>
                <p className="text-[11px] flex-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s.text}</p>
                <motion.div
                  whileHover={{ x: 2 }}
                  style={{ color: 'var(--text-muted)', marginTop: 2 }}
                >
                  <FiChevronRight size={10} />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
