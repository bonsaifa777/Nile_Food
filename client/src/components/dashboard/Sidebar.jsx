import { motion } from 'framer-motion';
import { FiGrid, FiShoppingBag, FiCreditCard, FiHeart, FiLogOut, FiChevronLeft, FiHome, FiBell, FiMessageCircle, FiKey, FiMail } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { id: 'overview', label: 'Overview', icon: FiGrid },
  { id: 'orders', label: 'Orders', icon: FiShoppingBag },
  { id: 'room-status', label: 'Room Status', icon: FiKey },
  { id: 'wallet', label: 'Wallet', icon: FiCreditCard },
  { id: 'favorites', label: 'Favorites', icon: FiHeart },
  { id: 'messages', label: 'Messages', icon: FiMail },
];

export default function Sidebar({ active, setActive, collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const { darkMode } = useTheme();
  const d = darkMode;
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`fixed left-4 top-4 bottom-4 z-40 rounded-3xl transition-all duration-500 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className={`h-full relative overflow-hidden rounded-3xl backdrop-blur-xl ${
        d ? 'bg-slate-900/60 border border-white/10' : 'bg-white/80 border border-gray-200/50 shadow-lg'
      }`}>
        <div className={`absolute inset-0 bg-gradient-to-b ${d ? 'from-indigo-500/5' : 'from-indigo-500/[0.02]'} to-transparent pointer-events-none`} />
        <div className={`absolute -top-40 -right-40 w-80 h-80 ${d ? 'bg-indigo-500/10' : 'bg-indigo-500/[0.03]'} rounded-full blur-3xl`} />

        <div className="relative h-full flex flex-col p-4">
          <div className="flex items-center justify-between mb-8 pt-2">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <FiHome className="text-white" size={16} />
                </div>
                <span className={`font-bold text-sm ${d ? 'text-white/90' : 'text-gray-800'}`}>Dashboard</span>
              </motion.div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`w-8 h-8 rounded-xl ${d ? 'glass' : 'bg-gray-100 border border-gray-200'} flex items-center justify-center hover:bg-white/10 transition-all ${collapsed ? 'mx-auto' : ''}`}
            >
              <FiChevronLeft className={`${d ? 'text-white/70' : 'text-gray-500'} transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} size={16} />
            </button>
          </div>

          <nav className="flex-1 space-y-1.5">
            {navItems.map((item, i) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setActive(item.id)}
                  className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                    isActive
                      ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 shadow-lg shadow-indigo-500/10'
                      : `${d ? 'text-white/50 hover:text-white/80 hover:bg-white/5' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`
                  } ${collapsed ? 'justify-center px-0' : ''}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navGlow"
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${d ? 'from-indigo-500/20' : 'from-indigo-500/10'} to-transparent border border-indigo-500/20`}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <div className="relative z-10 flex items-center gap-3">
                    <Icon size={20} className="relative z-10" />
                    {!collapsed && (
                      <span className="text-sm font-medium relative z-10 whitespace-nowrap">{item.label}</span>
                    )}
                  </div>
                  {isActive && !collapsed && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute right-2 w-1.5 h-1.5 rounded-full bg-indigo-400"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>

          {!collapsed && user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mb-4 p-3 rounded-2xl ${d ? 'glass' : 'bg-gray-100 border border-gray-200'}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${d ? 'text-white/90' : 'text-gray-800'} truncate`}>{user.name}</p>
                  <p className={`text-xs ${d ? 'text-white/40' : 'text-gray-500'} truncate`}>{user.email}</p>
                </div>
              </div>
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all ${collapsed ? 'justify-center px-0' : ''}`}
          >
            <FiLogOut size={20} />
            {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
          </motion.button>
        </div>
      </div>
    </motion.aside>
  );
}
