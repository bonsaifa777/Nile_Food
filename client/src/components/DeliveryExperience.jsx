import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { FiMapPin, FiClock, FiNavigation, FiTruck } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

export default function DeliveryExperience() {
  const { t } = useTranslation();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const steps = [
    { icon: FiMapPin, title: t('orders.title'), desc: t('orders.title'), time: '12:30 PM', active: true },
    { icon: FiClock, title: t('menu.title'), desc: t('menu.title'), time: '12:35 PM', active: true },
    { icon: FiTruck, title: t('home.deliveryExperience'), desc: t('home.deliveryExperience'), time: '12:50 PM', active: true },
    { icon: FiNavigation, title: t('home.deliveryExperience'), desc: t('home.deliveryExperience'), time: '1:00 PM', active: false },
  ];

  return (
    <section ref={sectionRef} className="py-24 bg-white dark:bg-slate-950 relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(99,102,241,0.08) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}
      />

      <div className="w-full px-4 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-semibold text-sm mb-6"
          >
            {t('home.deliveryExperience')}
          </motion.span>
          <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-gray-900 via-indigo-700 to-gray-900 dark:from-white dark:via-indigo-400 dark:to-white bg-clip-text text-transparent">
            {t('home.deliveryExperience')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('home.deliveryExperience')}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Tracking UI */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3 + index * 0.15 }}
                className="relative flex items-start gap-5"
              >
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className={`absolute left-7 top-16 w-0.5 h-16 ${step.active ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-slate-700'}`}>
                    {step.active && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: '100%' }}
                        transition={{ delay: 0.5 + index * 0.2, duration: 0.5 }}
                        className="w-full bg-indigo-500"
                      />
                    )}
                  </div>
                )}
                
                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center ${
                    step.active
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-400'
                  }`}
                >
                  <step.icon size={24} />
                  {step.active && (
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-2xl bg-indigo-500"
                    />
                  )}
                </motion.div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-bold text-lg ${step.active ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                      {step.title}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{step.time}</span>
                  </div>
                  <p className={`text-sm ${step.active ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Map Preview */}
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={isInView ? { opacity: 1, x: 0, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-slate-700 aspect-square relative">
              {/* Map grid */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(99,102,241,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(99,102,241,0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '60px 60px'
                }}
              />

              {/* Roads */}
              <div className="absolute top-1/4 left-0 right-0 h-8 bg-white/60 dark:bg-slate-700/60" />
              <div className="absolute top-0 bottom-0 left-1/3 w-8 bg-white/60 dark:bg-slate-700/60" />
              <div className="absolute top-1/2 left-0 right-0 h-6 bg-white/60 dark:bg-slate-700/60" />
              <div className="absolute top-0 bottom-0 right-1/4 w-6 bg-white/60 dark:bg-slate-700/60" />

              {/* Animated delivery path */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
                <motion.path
                  d="M 80 300 Q 150 200, 200 200 Q 250 200, 320 100"
                  fill="none"
                  stroke="url(#pathGradient)"
                  strokeWidth="4"
                  strokeDasharray="12 6"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, delay: 1, ease: 'easeInOut' }}
                />
                <defs>
                  <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Start point */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute left-[15%] bottom-[20%]"
              >
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center shadow-xl shadow-indigo-500/40">
                  <FiMapPin className="text-white" size={20} />
                </div>
                <motion.div
                  animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-indigo-500 rounded-full"
                />
              </motion.div>

              {/* End point */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute right-[15%] top-[20%]"
              >
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/40">
                  <FiNavigation className="text-white" size={20} />
                </div>
              </motion.div>

              {/* Animated rider */}
              <motion.div
                animate={{
                  left: ['20%', '45%', '55%', '75%'],
                  top: ['60%', '50%', '45%', '25%']
                }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute z-10"
              >
                <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-2xl border-2 border-indigo-500">
                  <span className="text-lg">🛵</span>
                </div>
              </motion.div>

              {/* ETA badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="absolute bottom-6 left-6 right-6"
              >
                <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-gray-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                        <FiClock className="text-indigo-600 dark:text-indigo-400" size={20} />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{t('home.deliveryExperience')}</div>
                        <div className="font-black text-gray-900 dark:text-white">25-30 min</div>
                      </div>
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl"
                    >
                      {t('home.deliveryExperience')}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
