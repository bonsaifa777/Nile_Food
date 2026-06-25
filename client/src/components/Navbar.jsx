import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  FiShoppingCart, FiMenu, FiX, FiUser, FiMapPin,
  FiCalendar, FiBox, FiGift, FiHome, FiCoffee, FiSmartphone,
  FiImage, FiAward, FiTag, FiSearch, FiSun, FiMoon, FiChevronDown,
  FiBell, FiShoppingBag, FiCheckCircle,
} from 'react-icons/fi';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import LanguageSwitcher from './LanguageSwitcher';

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch {}
}

const STATUS_ICONS = {
  pending: '🕐', confirmed: '✅', preparing: '👨‍🍳',
  ready: '🍽️', on_the_way: '🚚', delivered: '✅', cancelled: '❌'
};

const iconMap = {
  FiCalendar, FiBox, FiGift, FiHome, FiCoffee, FiSmartphone,
  FiTag, FiMapPin, FiImage, FiAward, FiSearch,
};

const springTap = { type: 'spring', stiffness: 500, damping: 12 };
const springBounce = { type: 'spring', stiffness: 400, damping: 8 };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: -12 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } },
};

function TiltBtn({ children, href, onClick, className, dark, tooltip }) {
  const c = (
    <motion.div
      whileHover={{ scale: 1.12, y: -4 }}
      whileTap={{ scale: 0.88, y: 0 }}
      transition={springTap}
      className={`relative cursor-pointer group ${className}`}
      onClick={onClick}
    >
      {children}
      {tooltip && (
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
          bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl"
        >
          {tooltip}
        </span>
      )}
    </motion.div>
  );
  return href ? <Link to={href}>{c}</Link> : c;
}

function ShimmerButton({ children, onClick, href, dark }) {
  const btn = (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.06, y: -3 }}
      whileTap={{ scale: 0.94 }}
      transition={springTap}
      className="relative overflow-hidden group px-6 py-2.5 rounded-2xl font-bold text-sm
        bg-gradient-to-r from-primary-500 via-primary-400 to-primary-600
        hover:from-primary-600 hover:via-primary-500 hover:to-primary-700
        text-white shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50
        transition-shadow duration-300"
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <motion.span
        className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '200%' }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />
      <span className="absolute inset-0 rounded-2xl bg-primary-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.button>
  );
  return href ? <Link to={href}>{btn}</Link> : btn;
}

function CartBadge({ count }) {
  return (
    <AnimatePresence mode="wait">
      {count > 0 && (
        <motion.span
          key={count}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: 'spring', stiffness: 500, damping: 12 }}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center
            bg-gradient-to-br from-primary-400 to-primary-600 text-white text-[10px] font-extrabold
            rounded-full shadow-lg shadow-primary-500/40 ring-2 ring-white dark:ring-slate-900"
        >
          {count}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

const Navbar = ({ darkMode, onToggleDarkMode }) => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const bookingRef = useRef(null);
  const { cart } = useCart();
  const { user } = useAuth();
  const location = useLocation();
  const prevCount = useRef(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);
  const notifCount = notifications.filter(n => !n.read).length;

  const cartCount = cart?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const socket = io(window.location.origin, { auth: { token } });

    socket.on('notification', (notif) => {
      const icon = STATUS_ICONS[notif.status] || '📦';
      const msg = `${icon} ${notif.message}`;
      toast(msg, {
        duration: 5000,
        style: {
          background: '#0f172a', color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px', padding: '16px 20px', fontWeight: 500,
        },
      });
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setNotifications(prev => [{ id: Date.now(), message: msg, time, read: false, status: notif.status }, ...prev].slice(0, 50));
      playNotificationSound();
    });

    socket.on('order_update', (updatedOrder) => {
      if (updatedOrder?.orderId) {
        const msg = `📦 Order #${updatedOrder.orderId} updated`;
        toast(msg, {
          duration: 4000,
          style: {
            background: '#0f172a', color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px', padding: '16px 20px', fontWeight: 500,
          },
        });
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setNotifications(prev => [{ id: Date.now(), message: msg, time, read: false, status: 'updated' }, ...prev].slice(0, 50));
      }
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    prevCount.current = cartCount;
  }, [cartCount]);

  const [navData, setNavData] = useState(null);

  useEffect(() => {
    axios.get('/api/content/navbar')
      .then(res => setNavData(res.data.data?.value || null))
      .catch(() => setNavData(null));
  }, []);

  const resolveIcon = (name) => iconMap[name] || FiCalendar;

  const defaults = {
    menuItems: [
      { label: t('nav.home'), path: '/' },
      { label: t('nav.menu'), path: '/menu' },
      { label: t('nav.about'), path: '/about' },
      { label: t('nav.contact'), path: '/contact' },
    ],
    categoryItems: [
      { label: t('nav.pizza'), path: '/menu?category=pizza', emoji: '🍕' },
      { label: t('nav.burger'), path: '/menu?category=burger', emoji: '🍔' },
      { label: t('nav.sushi'), path: '/menu?category=sushi', emoji: '🍣' },
      { label: t('nav.drinks'), path: '/menu?category=drinks', emoji: '🥤' },
      { label: t('nav.desserts'), path: '/menu?category=desserts', emoji: '🍰' },
      { label: t('nav.ethiopian'), path: '/menu?category=ethiopian', emoji: '🇪🇹' },
      { label: t('nav.pasta'), path: '/menu?category=pasta', emoji: '🍝' },
      { label: t('nav.salads'), path: '/menu?category=salads', emoji: '🥗' },
    ],
    bookingDropdownItems: [
      { label: t('nav.packages'), path: '/packages', icon: 'FiBox' },
      { label: t('nav.events'), path: '/events', icon: 'FiGift' },

    ],
    primLinks: [],
    secLinks: [
      { label: t('nav.gallery'), path: '/gallery', icon: 'FiImage' },
      { label: t('nav.experience'), path: '/experience', icon: 'FiAward' },
    ],

  };

  const nav = navData || defaults;
  const menuItems = nav.menuItems || defaults.menuItems;
  const categoryItems = nav.categoryItems || defaults.categoryItems;
  const bookingDropdownItems = (nav.bookingDropdownItems || defaults.bookingDropdownItems).map(item => ({
    ...item, icon: resolveIcon(item.icon)
  }));
  const primLinks = (nav.primLinks || defaults.primLinks).map(item => ({
    ...item, icon: resolveIcon(item.icon)
  }));
  const secLinks = (nav.secLinks || defaults.secLinks).map(item => ({
    ...item, icon: resolveIcon(item.icon)
  }));

  const isActive = (path) => location.pathname === path;
  const d = darkMode;

  const linkActiveClasses = (active) =>
    active
      ? d
        ? 'bg-primary-500/15 text-primary-300 border-primary-500/30 shadow-[0_0_20px_rgba(99,102,241,0.12)]'
        : 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 border-primary-500'
      : d
        ? 'text-gray-400 hover:text-primary-300 hover:bg-white/5 border-transparent'
        : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50 border-transparent';

  const btnBase = d
    ? 'text-gray-400 hover:text-primary-300 hover:bg-white/5'
    : 'text-gray-500 hover:text-primary-600 hover:bg-primary-50';

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled
          ? d
            ? 'bg-slate-950/80 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.5)] border-b border-white/5'
            : 'bg-white/80 backdrop-blur-2xl shadow-[0_8px_40px_rgba(99,102,241,0.1)] border-b border-primary-100/40'
          : d
            ? 'bg-slate-950'
            : 'bg-white'
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between transition-all duration-500 ${
          isScrolled ? 'h-16' : 'h-20 lg:h-24'
        }`}>
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-2.5 flex-shrink-0 relative">
            <motion.div
              whileHover={{ rotateY: 360, scale: 1.1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="relative w-10 h-10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-full h-full bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-xl shadow-primary-500/30 group-hover:shadow-primary-500/60 transition-all duration-500">
                <span className="text-white font-black text-lg">N</span>
              </div>
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/30 to-transparent"
                initial={{ x: '-100%', rotate: -15 }}
                whileHover={{ x: '200%', rotate: 15 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              />
            </motion.div>
            <div className={`leading-tight transition-all duration-500 ${isScrolled ? 'scale-90 origin-left' : ''}`}>
              <span className={`font-black text-xl leading-none block ${d ? 'text-white' : 'text-gray-900'}`}>
                Nile
              </span>
              <span className="text-[10px] font-semibold text-primary-400 leading-none tracking-[0.25em] uppercase">
                Food
              </span>
            </div>
          </Link>

          {/* Desktop Center Nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {menuItems.map((item) => (
              <motion.div key={item.path}>
                <Link to={item.path}>
                  <motion.div
                    whileHover={{ y: -2, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={springTap}
                    className={`relative px-3 py-1.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
                      isActive(item.path)
                        ? d
                          ? 'text-primary-300 bg-primary-500/10'
                          : 'text-primary-600 bg-primary-50'
                        : d
                          ? 'text-gray-400 hover:text-primary-300 hover:bg-white/5'
                          : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50/70'
                    }`}
                  >
                    {item.label}
                    {isActive(item.path) && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute -bottom-1 left-2 right-2 h-0.5 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 rounded-full"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.div>
                </Link>
              </motion.div>
            ))}

            {/* Booking Dropdown */}
            <div ref={bookingRef} className="relative">
              <motion.button
                onClick={() => setIsBookingOpen(!isBookingOpen)}
                whileHover={{ scale: 1.08, y: -3 }}
                whileTap={{ scale: 0.92 }}
                transition={springTap}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-xl cursor-pointer transition-all duration-300 border ${
                  isBookingOpen
                    ? d
                      ? 'bg-primary-500/15 text-primary-300 border-primary-500/30'
                      : 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 border-primary-500'
                    : d
                      ? 'text-gray-400 hover:text-primary-300 hover:bg-white/5 border-transparent'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50 border-transparent'
                }`}
              >
                <FiCalendar size={14} />
                Booking
                <motion.span
                  animate={{ rotate: isBookingOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiChevronDown size={14} />
                </motion.span>
              </motion.button>
              <AnimatePresence>
                {isBookingOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute top-full left-0 mt-1 w-52 rounded-2xl overflow-hidden border shadow-2xl ${
                      d
                        ? 'bg-slate-900 border-white/10 shadow-black/50'
                        : 'bg-white border-primary-100 shadow-primary-500/10'
                    }`}
                  >
                    <div className="py-2">
                      {bookingDropdownItems.map((item) => (
                        <Link key={item.path} to={item.path} onClick={() => setIsBookingOpen(false)}>
                          <motion.div
                            whileHover={{ x: 6 }}
                            className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                              isActive(item.path)
                                ? d
                                  ? 'text-primary-300 bg-primary-500/10'
                                  : 'text-primary-600 bg-primary-50'
                                : d
                                  ? 'text-gray-400 hover:text-white hover:bg-white/5'
                                  : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                            }`}
                          >
                            <item.icon size={15} className="text-primary-500" />
                            {item.label}
                          </motion.div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Icons */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex items-center gap-0.5 sm:gap-1"
          >
            <motion.div variants={itemVariants}>
              <LanguageSwitcher dark={d} btnBase={btnBase} />
            </motion.div>

            <motion.div variants={itemVariants}>
              <TiltBtn
                href="/cart"
                className={`relative p-2.5 rounded-xl ${btnBase}`}
                dark={d}
                tooltip={t('nav.cart')}
              >
                <FiShoppingCart size={20} />
                <CartBadge count={cartCount} />
              </TiltBtn>
            </motion.div>

            <motion.div variants={itemVariants} className="relative" ref={notifRef}>
              <TiltBtn
                className={`relative p-2.5 rounded-xl ${btnBase}`}
                dark={d}
                onClick={() => setShowNotifs(!showNotifs)}
                tooltip={t('nav.notifications')}
              >
                <FiBell size={20} />
                {notifCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center"
                    style={{ boxShadow: '0 0 8px rgba(239,68,68,0.6)' }}
                  >
                    {notifCount}
                  </motion.span>
                )}
              </TiltBtn>
              <AnimatePresence>
                {showNotifs && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    className={`absolute right-0 top-12 w-80 rounded-2xl overflow-hidden shadow-2xl z-50 ${
                      d
                        ? 'bg-slate-900 border border-white/10'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <div className={`flex items-center justify-between p-4 border-b ${d ? 'border-white/10' : 'border-gray-200'}`}>
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold text-sm ${d ? 'text-white' : 'text-gray-900'}`}>{t('nav.notifications')}</h3>
                        {notifCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400">
                            {notifCount} {t('nav.new')}
                          </span>
                        )}
                      </div>
                      {notifCount > 0 && (
                        <button onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                          className={`text-xs font-medium ${d ? 'text-white/40' : 'text-gray-500'}`}>
                          {t('nav.clear')}
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <FiBell size={20} className={`mx-auto mb-2 ${d ? 'text-white/30' : 'text-gray-400'}`} />
                          <p className={`text-sm ${d ? 'text-white/40' : 'text-gray-500'}`}>{t('nav.noNotifications')}</p>
                        </div>
                      ) : (
                        notifications.map((n, i) => (
                          <motion.div
                            key={n.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className={`flex items-start gap-3 p-4 border-b transition-colors ${
                              d ? 'border-white/5 hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'
                            } ${!n.read ? (d ? 'bg-indigo-500/5' : 'bg-indigo-50') : ''}`}
                          >
                            <span className="text-lg shrink-0 mt-0.5">{STATUS_ICONS[n.status] || '📦'}</span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${d ? 'text-white' : 'text-gray-800'}`}>{n.message.replace(/^[^\s]+\s/, '')}</p>
                              <p className={`text-[11px] mt-0.5 ${d ? 'text-white/40' : 'text-gray-500'}`}>{n.time}</p>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div variants={itemVariants}>
              <TiltBtn
                className={`p-2.5 rounded-xl ${btnBase}`}
                dark={d}
                onClick={onToggleDarkMode}
                tooltip={d ? t('nav.lightMode') : t('nav.darkMode')}
              >
                <motion.div
                  key={d ? 'moon' : 'sun'}
                  initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.3 }}
                >
                  {d ? <FiSun size={20} /> : <FiMoon size={20} />}
                </motion.div>
              </TiltBtn>
            </motion.div>

            {user ? (
              <motion.div variants={itemVariants}>
                <Link to="/profile">
                  <motion.div
                    whileHover={{ scale: 1.06, y: -3 }}
                    whileTap={{ scale: 0.94 }}
                    transition={springTap}
                    className={`flex items-center gap-2 ml-1 px-3 py-1.5 rounded-xl cursor-pointer
                      ${d ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-primary-50 border border-primary-100 hover:bg-primary-100/60'}
                      transition-all duration-300`}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center shadow-md shadow-primary-500/20">
                      <FiUser className="text-white" size={14} />
                    </div>
                    <span className={`hidden lg:block text-sm font-semibold ${d ? 'text-primary-300' : 'text-primary-700'}`}>
                      {user.name?.split(' ')[0] || t('nav.profile')}
                    </span>
                  </motion.div>
                </Link>
              </motion.div>
            ) : (
              <motion.div variants={itemVariants}>
                <ShimmerButton href="/login" dark={d}>
                  <FiUser size={15} />
                  {t('nav.signIn')}
                </ShimmerButton>
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                whileHover={{ scale: 1.1, rotate: isMenuOpen ? 90 : 0 }}
                whileTap={{ scale: 0.9 }}
                transition={springTap}
                className={`lg:hidden p-2.5 rounded-xl ${d ? 'text-gray-400 hover:bg-white/5' : 'text-gray-500 hover:bg-primary-50'} transition-colors`}
              >
                <AnimatePresence mode="wait">
                  {isMenuOpen ? (
                    <motion.span key="x" initial={{ rotate: -90 }} animate={{ rotate: 0 }} exit={{ rotate: 90 }} transition={{ duration: 0.2 }}>
                      <FiX size={22} />
                    </motion.span>
                  ) : (
                    <motion.span key="menu" initial={{ rotate: 90 }} animate={{ rotate: 0 }} exit={{ rotate: -90 }} transition={{ duration: 0.2 }}>
                      <FiMenu size={22} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className={`lg:hidden overflow-hidden border-t ${
              d ? 'border-white/5 bg-slate-950/95 backdrop-blur-xl' : 'border-primary-100/40 bg-white/95 backdrop-blur-xl'
            }`}
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="px-4 py-4 space-y-1"
            >
              {categoryItems.map((cat, i) => (
                <motion.div key={cat.label} variants={itemVariants}>
                  <Link to={cat.path} onClick={() => setIsMenuOpen(false)}>
                    <motion.div
                      whileHover={{ x: 10, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        d ? 'text-gray-300 hover:bg-white/5' : 'text-gray-700 hover:bg-primary-50'
                      }`}
                    >
                      <span className="text-lg">{cat.emoji}</span>
                      {cat.label}
                    </motion.div>
                  </Link>
                </motion.div>
              ))}

              <motion.div
                variants={itemVariants}
                className={`pt-3 border-t mt-3 ${d ? 'border-white/5' : 'border-primary-100/50'}`}
              >
                {menuItems.map((item) => (
                  <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)}>
                    <motion.div
                      variants={itemVariants}
                      whileHover={{ x: 10, scale: 1.02 }}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive(item.path)
                          ? d
                            ? 'text-primary-300 bg-primary-500/10'
                            : 'text-primary-600 bg-primary-50'
                          : d
                            ? 'text-gray-300 hover:bg-white/5'
                            : 'text-gray-700 hover:bg-primary-50'
                      }`}
                    >
                      {item.label}
                    </motion.div>
                  </Link>
                ))}
              </motion.div>

              <motion.div
                variants={itemVariants}
                className={`pt-3 border-t ${d ? 'border-white/5' : 'border-primary-100/50'}`}
              >
                <p className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] ${d ? 'text-gray-500' : 'text-primary-400'}`}>
                  {t('nav.booking')}
                </p>
                {bookingDropdownItems.map((item) => (
                  <Link key={item.path} to={item.path} onClick={() => { setIsMenuOpen(false); setIsBookingOpen(false); }}>
                    <motion.div
                      variants={itemVariants}
                      whileHover={{ x: 10, scale: 1.02 }}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        d ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5' : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                      }`}
                    >
                      <item.icon size={15} className="text-primary-500" />
                      {item.label}
                    </motion.div>
                  </Link>
                ))}
              </motion.div>

              <motion.div
                variants={itemVariants}
                className={`pt-3 border-t ${d ? 'border-white/5' : 'border-primary-100/50'}`}
              >
                {[...primLinks, ...secLinks].map((link) => (
                  <Link key={link.path} to={link.path} onClick={() => setIsMenuOpen(false)}>
                    <motion.div
                      variants={itemVariants}
                      whileHover={{ x: 10, scale: 1.02 }}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        d ? 'text-gray-400 hover:text-gray-200 hover:bg-white/5' : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                      }`}
                    >
                      <link.icon size={15} className="text-primary-500" />
                      {link.label}
                    </motion.div>
                  </Link>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
