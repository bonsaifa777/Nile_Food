import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiSearch, FiUser, FiMenu, FiX, FiSun, FiMoon, FiMapPin } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from './NotificationBell';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-gray-200/50 dark:border-slate-700/30 py-3 shadow-sm'
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="w-full px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">N</span>
          </div>
          <span className="text-xl font-bold gradient-text hidden sm:block">Nile Food</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/menu" className="text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Menu</Link>
          <Link to="/menu?category=featured" className="text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Featured</Link>
          <Link to="/select-table" className="text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Order at Table</Link>
        </nav>

        <div className="flex items-center gap-4">
          <NotificationBell />
          <button
            onClick={toggleDarkMode}
            className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/10 backdrop-blur-xl border border-gray-200 dark:border-white/20 flex items-center justify-center text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-all duration-200"
          >
            {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>

          <Link to="/cart" className="relative w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/10 backdrop-blur-xl border border-gray-200 dark:border-white/20 flex items-center justify-center text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-all duration-200">
            <FiShoppingCart size={20} />
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold shadow-lg"
              >
                {cartCount}
              </motion.span>
            )}
          </Link>

          {user ? (
            <Link to="/profile" className="hidden sm:flex w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 items-center justify-center text-white font-semibold shadow-md">
              {user.name?.charAt(0).toUpperCase()}
            </Link>
          ) : (
            <Link to="/login" className="hidden sm:flex btn-primary">
              Sign In
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/10 backdrop-blur-xl border border-gray-200 dark:border-white/20 flex items-center justify-center text-gray-600 dark:text-white/80 transition-all duration-200"
          >
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 mx-4 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700/50 shadow-xl"
          >
            <nav className="flex flex-col p-4 gap-4">
              <Link to="/menu" className="text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors py-2 font-medium">Menu</Link>
              <Link to="/menu?category=featured" className="text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors py-2 font-medium">Featured</Link>
              <Link to="/select-table" className="text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors py-2 font-medium">Order at Table</Link>
              <Link to="/cart" className="text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors py-2 font-medium">Cart ({cartCount})</Link>
              {user ? (
                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors py-2 text-left font-medium">
                  Sign Out
                </button>
              ) : (
                <Link to="/login" className="text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors py-2 font-medium">Sign In</Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
