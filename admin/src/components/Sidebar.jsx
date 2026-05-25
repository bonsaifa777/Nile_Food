import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiHome, FiShoppingBag, FiMenu, FiGrid, FiUsers, FiBarChart2, 
  FiTruck, FiCreditCard, FiSettings, FiLogOut, FiDollarSign, FiFileText, FiPackage,
  FiMonitor, FiCalendar, FiMail, FiBookmark, FiChevronLeft,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const allMenuItems = [
  { path: '/operations', label: 'Operations', icon: FiMonitor, roles: ['admin', 'super_admin'] },
  { path: '/', label: 'Dashboard', icon: FiHome, roles: ['admin', 'super_admin'] },
  { path: '/kitchen', label: 'Kitchen', icon: FiGrid, roles: ['kitchen_staff'] },
  { path: '/orders', label: 'Orders', icon: FiShoppingBag, roles: ['admin', 'super_admin'] },
  { path: '/menu', label: 'Menu', icon: FiMenu, roles: ['admin', 'super_admin'] },
  { path: '/categories', label: 'Categories', icon: FiGrid, roles: ['admin', 'super_admin'] },
  { path: '/tables', label: 'Tables', icon: FiDollarSign, roles: ['admin', 'super_admin'] },
  { path: '/bookings', label: 'Bookings', icon: FiBookmark, roles: ['admin', 'super_admin'] },
  { path: '/users', label: 'Users', icon: FiUsers, roles: ['admin', 'super_admin'] },
  { path: '/analytics', label: 'Analytics', icon: FiBarChart2, roles: ['admin', 'super_admin'] },
  { path: '/inventory', label: 'Inventory', icon: FiPackage, roles: ['admin', 'super_admin'] },
  { path: '/payments', label: 'Payments', icon: FiCreditCard, roles: ['admin', 'super_admin'] },
  { path: '/reservations', label: 'Reservations', icon: FiCalendar, roles: ['admin', 'super_admin'] },
  { path: '/messages', label: 'Messages', icon: FiMail, roles: ['admin', 'super_admin'] },
  { path: '/content', label: 'Content', icon: FiFileText, roles: ['admin', 'super_admin'] },
  { path: '/settings', label: 'Settings', icon: FiSettings, roles: ['admin', 'super_admin'] },
];

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.03, duration: 0.3, ease: 'easeOut' }
  })
};

export default function Sidebar({ isOpen }) {
  const { logout, user } = useAuth();
  const location = useLocation();

  const menuItems = allMenuItems.filter(item => item.roles.includes(user?.role));

  return (
    <motion.div
      initial={false}
      animate={{ width: isOpen ? 280 : 88 }}
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col overflow-hidden"
      style={{
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border-color)',
      }}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center px-4 border-b shrink-0" style={{ borderColor: 'var(--border-color)' }}>
        <motion.div className="flex items-center gap-3 min-w-0">
          <motion.div
            whileHover={{ scale: 1.08, rotate: -5 }}
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden pulse-glow"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
            }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
              animate={{ opacity: [0, 0.4, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <span className="text-white font-bold text-lg relative z-10">N</span>
          </motion.div>
          <motion.span
            initial={false}
            animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? 'auto' : 0 }}
            className="font-bold text-lg whitespace-nowrap overflow-hidden"
            style={{ color: 'var(--text-primary)' }}
          >
            Nile Food
          </motion.span>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item, i) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.div
              key={item.path}
              custom={i}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="relative"
            >
              <NavLink
                to={item.path}
                className={`sidebar-item group ${isActive ? 'active' : ''}`}
              >
                <item.icon size={20} className="shrink-0 relative z-10" />
                <motion.span
                  initial={false}
                  animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? 'auto' : 0 }}
                  className="whitespace-nowrap overflow-hidden text-sm relative z-10"
                >
                  {item.label}
                </motion.span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.05))',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full"
                    style={{
                      background: 'linear-gradient(180deg, #6366f1, #8b5cf6)',
                      boxShadow: '0 0 8px rgba(99, 102, 241, 0.5)',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </NavLink>
            </motion.div>
          );
        })}
      </nav>

      {/* User Info + Logout */}
      <div className="border-t shrink-0" style={{ borderColor: 'var(--border-color)' }}>
        {user && (
          <motion.div
            initial={false}
            animate={{ 
              height: isOpen ? 'auto' : 0,
              opacity: isOpen ? 1 : 0,
              padding: isOpen ? '12px 16px' : '0 16px',
            }}
            className="overflow-hidden"
          >
            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
          </motion.div>
        )}
        <div className="p-3">
          <motion.button
            whileHover={{ scale: 1.02, x: 2 }}
            whileTap={{ scale: 0.98 }}
            onClick={logout}
            className="sidebar-item text-red-400/80 hover:text-red-400 w-full"
          >
            <FiLogOut size={20} className="shrink-0 relative z-10" />
            <motion.span
              initial={false}
              animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? 'auto' : 0 }}
              className="whitespace-nowrap overflow-hidden text-sm relative z-10"
            >
              Logout
            </motion.span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
