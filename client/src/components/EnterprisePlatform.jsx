import { useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiShoppingCart, FiHome, FiMapPin, FiMonitor, FiTruck, FiCreditCard,
  FiArrowRight, FiChevronRight
} from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const FEATURES = [
  {
    icon: FiShoppingCart,
    title: 'Online Food Ordering',
    desc: 'End-to-end digital ordering with real-time menu management, customizations, and secure checkout.',
    gradient: 'from-blue-500 to-cyan-400',
    glow: 'rgba(59,130,246,0.3)',
  },
  {
    icon: FiHome,
    title: 'Hotel Booking',
    desc: 'Full property management with room inventory, dynamic pricing, and instant reservation system.',
    gradient: 'from-purple-500 to-pink-400',
    glow: 'rgba(168,85,247,0.3)',
  },
  {
    icon: FiMapPin,
    title: 'Real-time Tracking',
    desc: 'Live GPS order tracking with estimated delivery times and proactive customer notifications.',
    gradient: 'from-orange-500 to-yellow-400',
    glow: 'rgba(249,115,22,0.3)',
  },
  {
    icon: FiMonitor,
    title: 'Smart Kitchen',
    desc: 'Digital kitchen display with automated order routing, prep timing, and inventory sync.',
    gradient: 'from-emerald-500 to-teal-400',
    glow: 'rgba(16,185,129,0.3)',
  },
  {
    icon: FiTruck,
    title: 'Delivery Management',
    desc: 'Optimized dispatch, driver allocation, route planning, and performance analytics.',
    gradient: 'from-rose-500 to-red-400',
    glow: 'rgba(244,63,94,0.3)',
  },
  {
    icon: FiCreditCard,
    title: 'POS System',
    desc: 'Unified point-of-sale with table management, split billing, and multi-payment gateway.',
    gradient: 'from-indigo-500 to-violet-400',
    glow: 'rgba(99,102,241,0.3)',
  },
];

function TiltCard({ feature, index }) {
  const { t } = useTranslation();
  const cardRef = useRef(null);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(y, [0, 1], [8, -8]), { damping: 25, stiffness: 150 });
  const rotateY = useSpring(useTransform(x, [0, 1], [-8, 8]), { damping: 25, stiffness: 150 });
  const glareX = useTransform(x, [0, 1], [0, 100]);
  const glareY = useTransform(y, [0, 1], [0, 100]);

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    x.set(px);
    y.set(py);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0.5);
    y.set(0.5);
  }, [x, y]);

  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, perspective: 1000 }}
        className="group relative h-full"
      >
        <div
          className="relative h-full rounded-2xl p-[1px] transition-all duration-500"
          style={{
            background: `linear-gradient(135deg, ${feature.glow.replace('0.3', '0.15')}, transparent 60%)`,
          }}
        >
          <div className="relative h-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 sm:p-7 overflow-hidden border border-white/20 dark:border-slate-700/30 shadow-xl shadow-black/5">
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: `radial-gradient(circle at ${glareX}% ${glareY}%, ${feature.glow.replace('0.3', '0.12')} 0%, transparent 60%)`,
              }}
            />
            <div className="absolute -inset-20 opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none"
              style={{
                background: `radial-gradient(800px circle at 50% 50%, ${feature.glow.replace('0.3', '0.08')}, transparent 40%)`,
              }}
            />
            <div className="relative z-10">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} p-[1px] mb-5 shadow-lg`}
                style={{ boxShadow: `0 8px 24px ${feature.glow}` }}
              >
                <div className="w-full h-full rounded-xl bg-white/90 dark:bg-slate-900/90 flex items-center justify-center backdrop-blur-sm">
                  <Icon className="w-6 h-6 text-slate-900 dark:text-white" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-600 dark:group-hover:from-white dark:group-hover:to-slate-300 transition-all duration-300">
                {t(feature.title)}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {t(feature.desc)}
              </p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-100 transition-all duration-700 -translate-y-1/2 translate-x-1/2 group-hover:translate-y-0 group-hover:translate-x-0 pointer-events-none">
              <div className={`w-full h-full rounded-full bg-gradient-to-br ${feature.gradient} blur-3xl`} />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FloatingParticle({ index }) {
  const duration = 4 + Math.random() * 4;
  const delay = Math.random() * 3;
  const size = 2 + Math.random() * 4;
  const startX = Math.random() * 100;
  const startY = Math.random() * 100;

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: `${startX}%`,
        top: `${startY}%`,
        background: ['rgba(59,130,246,0.4)', 'rgba(168,85,247,0.4)', 'rgba(249,115,22,0.4)', 'rgba(16,185,129,0.4)'][index % 4],
        boxShadow: `0 0 ${size * 3}px ${['rgba(59,130,246,0.3)', 'rgba(168,85,247,0.3)', 'rgba(249,115,22,0.3)', 'rgba(16,185,129,0.3)'][index % 4]}`,
      }}
      animate={{
        y: [0, -30 - Math.random() * 20, 0],
        x: [0, (Math.random() - 0.5) * 20, 0],
        opacity: [0, 1, 0],
        scale: [0, 1.5, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

function FloatingBlob({ index }) {
  const positions = [
    { top: '10%', left: '5%', size: 400, gradient: 'from-blue-400/10 to-purple-400/5' },
    { top: '60%', right: '5%', size: 500, gradient: 'from-orange-400/10 to-pink-400/5' },
    { top: '30%', right: '30%', size: 350, gradient: 'from-cyan-400/10 to-emerald-400/5' },
    { top: '70%', left: '20%', size: 300, gradient: 'from-indigo-400/10 to-violet-400/5' },
  ];
  const p = positions[index % positions.length];

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        top: p.top,
        left: p.left,
        right: p.right,
        width: p.size,
        height: p.size,
        background: `linear-gradient(135deg, ${p.gradient})`,
        filter: 'blur(60px)',
      }}
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 10, 0],
        x: [0, 20, 0],
        y: [0, -20, 0],
      }}
      transition={{
        duration: 10 + index * 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

export default function EnterprisePlatform() {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const sectionRef = useRef(null);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 sm:py-32 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />

      <FloatingBlob index={0} />
      <FloatingBlob index={1} />
      <FloatingBlob index={2} />
      <FloatingBlob index={3} />

      {[...Array(20)].map((_, i) => (
        <FloatingParticle key={i} index={i} />
      ))}

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-16 sm:mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 shadow-sm mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
            </span>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 tracking-wide">
              {t('home.enterprisePlatform')}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-5"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white">
              {t('home.enterprisePlatform')}
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500">
              {t('home.enterprisePlatform')}
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            {t('home.enterprisePlatform')}
          </motion.p>
        </motion.div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {FEATURES.map((feature, index) => (
              <TiltCard key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-16"
        >
          <Link to="/menu">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="group relative px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl shadow-2xl shadow-slate-900/25 dark:shadow-white/10 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                {t('common.learnMore')}
                <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
            </motion.button>
          </Link>

        </motion.div>
      </div>
    </section>
  );
}
