import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { FiAward, FiStar, FiTrendingUp, FiShield, FiMapPin, FiCalendar, FiShoppingBag } from 'react-icons/fi';

export default function HeroProfile({ user, stats }) {
  const { darkMode } = useTheme();
  const d = darkMode;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  const points = user?.loyaltyPoints || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl"
    >
      <div className="relative p-[1px] rounded-3xl bg-gradient-to-br from-indigo-500/40 via-indigo-400/10 to-purple-500/40">
        <div className={`relative rounded-[22px] overflow-hidden backdrop-blur-xl ${
          d ? 'bg-slate-900/60 border border-white/10' : 'bg-white/90 border border-gray-200/60 shadow-xl'
        }`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${d ? 'from-indigo-500/5' : 'from-indigo-500/[0.02]'} via-transparent to-purple-500/5`} />
          <div className={`absolute -top-32 -right-32 w-64 h-64 ${d ? 'bg-indigo-500/20' : 'bg-indigo-500/[0.04]'} rounded-full blur-3xl animate-pulse`} />
          <div className={`absolute -bottom-32 -left-32 w-64 h-64 ${d ? 'bg-purple-500/10' : 'bg-purple-500/[0.03]'} rounded-full blur-3xl`} />

          <div className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute -inset-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-60 blur-sm"
                />
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl md:text-3xl shadow-2xl shadow-indigo-500/30">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-2xl object-cover" />
                  ) : (
                    initials
                  )}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-white dark:border-slate-900"
                  />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`text-2xl md:text-3xl font-bold ${d ? 'text-white' : 'text-gray-900'}`}
                  >
                    Welcome back, {user?.name?.split(' ')[0]}
                  </motion.h1>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1"
                  >
                    <FiShield size={12} />
                    Verified
                  </motion.div>
                </div>

                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  <span className={`text-sm ${d ? 'text-white/50' : 'text-gray-500'}`}>{user?.email}</span>
                  <span className={d ? 'text-white/20' : 'text-gray-300'}>|</span>
                  <span className={`text-sm capitalize ${d ? 'text-white/50' : 'text-gray-500'}`}>{user?.role?.replace('_', ' ')}</span>
                </div>

                <div className="flex items-center gap-4 mt-4 flex-wrap">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/20"
                  >
                    <FiStar className="text-amber-400" size={14} />
                    <span className="text-amber-600 dark:text-amber-300 text-sm font-semibold">Gold Member</span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/20"
                  >
                    <FiAward className="text-indigo-400" size={14} />
                    <span className="text-indigo-600 dark:text-indigo-300 text-sm font-semibold">{points} Points</span>
                  </motion.div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className={`hidden md:flex flex-col items-center px-6 py-4 rounded-2xl ${
                  d ? 'glass' : 'bg-gray-100/80 border border-gray-200'
                }`}
              >
                <div className="relative">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 72 72">
                    <circle cx="36" cy="36" r="30" fill="none" stroke="currentColor" strokeWidth="4" className={d ? 'text-white/10' : 'text-gray-200'} />
                    <motion.circle
                      cx="36" cy="36" r="30" fill="none" stroke="currentColor" strokeWidth="4"
                      strokeLinecap="round" strokeDasharray="188.5"
                      initial={{ strokeDashoffset: 188.5 }}
                      animate={{ strokeDashoffset: 188.5 * (1 - Math.min(points / 1000, 1)) }}
                      transition={{ duration: 2, ease: 'easeOut' }}
                      className="text-indigo-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-lg font-bold ${d ? 'text-white' : 'text-gray-800'}`}>{points}</span>
                  </div>
                </div>
                <span className={`text-xs ${d ? 'text-white/50' : 'text-gray-500'} mt-1`}>Points</span>
              </motion.div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                { icon: FiShoppingBag, label: 'Orders', value: stats?.totalOrders || 0, color: 'from-blue-500 to-cyan-500' },
                { icon: FiCalendar, label: 'Bookings', value: stats?.totalBookings || 0, color: 'from-purple-500 to-pink-500' },
                { icon: FiMapPin, label: 'Addresses', value: user?.addresses?.length || 0, color: 'from-green-500 to-emerald-500' },
                { icon: FiTrendingUp, label: 'Spent', value: `ETB ${(stats?.totalSpent || 0).toFixed(0)}`, color: 'from-orange-500 to-red-500' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className={`p-3 rounded-xl ${d ? 'glass hover:bg-white/10' : 'bg-gray-100 border border-gray-200 hover:bg-gray-200/50'} transition-all`}
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mb-2 shadow-sm`}>
                    <item.icon size={14} className="text-white" />
                  </div>
                  <p className={`text-lg font-bold ${d ? 'text-white' : 'text-gray-900'}`}>{item.value}</p>
                  <p className={`text-xs ${d ? 'text-white/40' : 'text-gray-500'}`}>{item.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
