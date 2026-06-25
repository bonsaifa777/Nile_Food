import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  motion, AnimatePresence, useInView
} from 'framer-motion';
import {
  FiShoppingCart, FiMinus, FiPlus, FiTrash2, FiArrowRight,
  FiClock, FiShield, FiTag, FiPercent, FiChevronLeft,
  FiChevronRight, FiRefreshCw, FiStar, FiCheck,
  FiTruck, FiHome, FiPackage
} from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

const springTap = { type: 'spring', stiffness: 500, damping: 12 };

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 22 } }
};

const fallbackFoods = [
  { _id: 's1', name: 'Pepperoni Pizza', price: 350, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop', category: 'Pizza', rating: 4.8, preparationTime: 20 },
  { _id: 's2', name: 'Classic Burger', price: 180, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop', category: 'Burgers', rating: 4.6, preparationTime: 15 },
  { _id: 's3', name: 'Grilled Salmon', price: 450, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop', category: 'Dinner', rating: 4.9, preparationTime: 25 },
  { _id: 's4', name: 'Chocolate Cake', price: 80, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop', category: 'Desserts', rating: 4.7, preparationTime: 5 },
  { _id: 's5', name: 'Caesar Salad', price: 120, image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop', category: 'Healthy', rating: 4.5, preparationTime: 10 },
  { _id: 's6', name: 'Mango Smoothie', price: 70, image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=300&fit=crop', category: 'Beverages', rating: 4.4, preparationTime: 5 },
  { _id: 's7', name: 'Pasta Carbonara', price: 250, image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop', category: 'Dinner', rating: 4.7, preparationTime: 20 },
  { _id: 's8', name: 'Pancakes', price: 150, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop', category: 'Breakfast', rating: 4.6, preparationTime: 15 },
];

function TiltCard({ children, className = '' }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState(false);

  const handleMouse = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 12, y: y * -12 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setTilt({ x: 0, y: 0 }); }}
      style={{ perspective: 1200 }}
      className={className}
    >
      <motion.div
        animate={{
          rotateX: hover ? tilt.y : 0,
          rotateY: hover ? tilt.x : 0,
          scale: hover ? 1.02 : 1,
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function AnimatedCounter({ value, prefix = '', suffix = '', className = '' }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    const start = prev.current;
    const diff = value - start;
    const duration = 600;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + diff * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };

    if (diff !== 0) requestAnimationFrame(tick);
    prev.current = value;
  }, [value]);

  return (
    <span className={className}>
      {prefix}{display.toFixed(2)}{suffix}
    </span>
  );
}

function CartItemCard({ item, index, onUpdateQuantity, onRemove }) {
  const { t } = useTranslation();
  const [removing, setRemoving] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleRemove = () => {
    setRemoving(true);
    setTimeout(() => onRemove(item.id), 400);
  };

  const unitPrice = item.basePrice + (item.extras || []).reduce((a, e) => a + e.price, 0);
  const itemTotal = unitPrice * item.quantity;

  const imgSrc = imgError
    ? `https://placehold.co/200x200/1e1b4b/6366f1?text=${encodeURIComponent(item.name?.[0] || 'F')}`
    : item.image;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={removing ? { opacity: 0, x: 80, scale: 0.9, height: 0, marginBottom: 0, padding: 0 } : { opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="relative"
    >
      <TiltCard>
        <div className="group relative bg-white/70 dark:bg-slate-800/60 backdrop-blur-2xl rounded-3xl border border-white/30 dark:border-slate-700/40 shadow-lg shadow-indigo-500/5 dark:shadow-black/20 hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-900/20 transition-all duration-500 overflow-hidden">
          <div className="flex flex-col sm:flex-row gap-5 p-5">
            {/* Image */}
            <div className="relative w-full sm:w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
              <motion.img
                src={imgSrc}
                alt={item.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.15 }}
                transition={{ duration: 0.5 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              {item.size && (
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-[10px] font-bold text-indigo-600 dark:text-indigo-400 rounded-lg shadow-lg">
                  {item.size}
                </span>
              )}
              <motion.div
                className="absolute -bottom-1 -right-1 w-16 h-16 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-xl"
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0 flex flex-col justify-between gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight truncate">
                    {item.name}
                  </h3>
                  {(item.extras?.length > 0 || item.specialInstructions) && (
                    <div className="mt-1.5 space-y-0.5">
                      {item.extras?.length > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          + {item.extras.map(e => e.name).join(', ')}
                        </p>
                      )}
                      {item.specialInstructions && (
                        <p className="text-xs text-indigo-500 dark:text-indigo-400 italic truncate">
                          "{item.specialInstructions}"
                        </p>
                      )}
                    </div>
                  )}
                  <p className="mt-1.5 text-sm font-medium text-gray-400 dark:text-gray-500">
                    ETB {unitPrice.toFixed(2)}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={handleRemove}
                  className="relative w-10 h-10 rounded-xl bg-white/70 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600/50 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 flex-shrink-0 group/remove"
                >
                  <motion.div
                    animate={{ rotate: removing ? 90 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FiTrash2 size={16} />
                  </motion.div>
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-red-500 text-white text-[10px] font-semibold rounded-lg opacity-0 group-hover/remove:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg pointer-events-none">
                    {t('cart.remove')}
                  </span>
                </motion.button>
              </div>

              <div className="flex items-center justify-between mt-auto">
                {/* Quantity selector */}
                <div className="flex items-center gap-1 bg-white/80 dark:bg-slate-700/40 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-slate-600/30 p-1 shadow-sm">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-600/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200"
                  >
                    <FiMinus size={14} />
                  </motion.button>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={item.quantity}
                      initial={{ y: -12, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 12, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="w-10 text-center font-bold text-gray-900 dark:text-white text-base"
                    >
                      {item.quantity}
                    </motion.span>
                  </AnimatePresence>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200"
                  >
                    <FiPlus size={14} />
                  </motion.button>
                </div>

                {/* Item total */}
                <motion.div
                  key={itemTotal}
                  initial={{ scale: 1.2, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  <span className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                    ETB {itemTotal.toFixed(2)}
                  </span>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Hover shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none -skew-x-12"
            initial={{ x: '-100%' }}
            whileHover={{ x: '200%' }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
        </div>
      </TiltCard>
    </motion.div>
  );
}

function SuggestedCard({ food, onAdd, dark }) {
  const { t } = useTranslation();
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAdd = () => {
    setAdded(true);
    onAdd(food);
    setTimeout(() => setAdded(false), 1200);
  };

  const imgSrc = imgError
    ? `https://placehold.co/200x200/1e1b4b/6366f1?text=${encodeURIComponent(food.name?.[0] || 'F')}`
    : food.image;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ type: 'spring', stiffness: 250, damping: 20 }}
      className="flex-shrink-0 w-56 group"
    >
      <TiltCard>
        <div className="relative bg-white/60 dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/30 shadow-lg hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-900/20 transition-all duration-500 overflow-hidden">
          <div className="relative h-36 overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
            <motion.img
              src={imgSrc}
              alt={food.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.15 }}
              transition={{ duration: 0.6 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            <div className="absolute top-2 left-2 flex gap-1">
              <span className="px-2 py-0.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-[10px] font-bold text-indigo-600 dark:text-indigo-400 rounded-lg">
                {food.category}
              </span>
            </div>
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-amber-400/90 dark:bg-amber-500/90 backdrop-blur-sm text-[10px] font-bold text-amber-900 rounded-lg">
              <FiStar size={10} className="fill-amber-900" />
              {food.rating}
            </div>
          </div>
          <div className="p-4 space-y-3">
            <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{food.name}</h4>
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                ETB {food.price?.toFixed(2)}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleAdd}
                className={`px-4 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all duration-300 ${
                  added
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30'
                }`}
              >
                {added ? (
                  <><FiCheck size={13} /> {t('menu.addToCart')}</>
                ) : (
                  <><FiPlus size={13} /> {t('menu.addToCart')}</>
                )}
              </motion.button>
            </div>
          </div>
          {added && (
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="w-12 h-12 bg-emerald-500 rounded-full" />
            </motion.div>
          )}
        </div>
      </TiltCard>
    </motion.div>
  );
}

function EmptyCart({ dark }) {
  const { t } = useTranslation();
  const [floating, setFloating] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setFloating(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      {/* Animated illustration */}
      <motion.div
        variants={itemVariants}
        className="relative mb-10"
      >
        <motion.div
          animate={floating ? {
            y: [0, -16, 0],
            rotate: [0, -5, 0, 5, 0],
          } : {}}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="relative w-40 h-40">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-purple-600/20 dark:from-indigo-500/20 dark:to-purple-700/20 rounded-full blur-3xl animate-pulse-slow" />
            <div className="relative w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center border-2 border-dashed border-indigo-300/50 dark:border-indigo-600/30">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <FiShoppingCart size={56} className="text-indigo-400 dark:text-indigo-500/60" />
              </motion.div>
              <motion.div
                className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 15, -15, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              >
                <span className="text-white font-bold text-lg">0</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.h2
        variants={itemVariants}
        className="text-4xl font-black text-gray-900 dark:text-white mb-3 text-center"
      >
        {t('cart.empty')}
      </motion.h2>

      <motion.p
        variants={itemVariants}
        className="text-gray-500 dark:text-gray-400 text-lg mb-4 text-center max-w-md"
      >
        {t('cart.emptyMessage')}
      </motion.p>

      <motion.div variants={itemVariants}>
        <Link
          to="/menu"
          className="relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-300 group"
        >
          <FiShoppingCart size={18} />
          <span>{t('cart.startOrdering')}</span>
          <FiArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          <motion.span
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12"
            initial={{ x: '-100%' }}
            whileHover={{ x: '200%' }}
            transition={{ duration: 0.6 }}
          />
        </Link>
      </motion.div>
    </motion.div>
  );
}

const ORDER_TYPES = [
  { value: 'dine_in', label: 'Dine In', icon: FiHome },
  { value: 'takeaway', label: 'Take Away', icon: FiPackage },
  { value: 'delivery', label: 'Delivery', icon: FiTruck },
];

function CheckoutSummary({
  subtotal, deliveryFee, tax, total, itemCount, dark, orderType, setOrderType, onCheckout
}) {
  const { t } = useTranslation();
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState(false);
  const [discount, setDiscount] = useState(0);

  const handleApplyCoupon = () => {
    if (coupon.trim().toUpperCase() === 'NILE20') {
      setDiscount(subtotal * 0.2);
      setCouponApplied(true);
      setCouponError(false);
    } else if (coupon.trim()) {
      setCouponError(true);
      setCouponApplied(false);
      setDiscount(0);
    }
  };

  const finalTotal = total - discount;

  const suggestedCoupons = ['NILE20', 'FOODIE10', 'FREEDEL'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="lg:sticky lg:top-24"
    >
      <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-2xl rounded-3xl border border-white/30 dark:border-slate-700/40 shadow-xl shadow-indigo-500/5 dark:shadow-black/20 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200/50 dark:border-slate-700/30">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('checkout.orderSummary')}</h2>
            <motion.span
              key={itemCount}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-3 py-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full"
            >
              {itemCount} {itemCount === 1 ? t('cart.quantity') : t('cart.quantity')}
            </motion.span>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Price breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">{t('cart.subtotal')}</span>
              <AnimatedCounter
                value={subtotal}
                prefix="ETB "
                className="font-semibold text-gray-900 dark:text-white"
              />
            </div>
            {orderType === 'delivery' && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <FiTruck size={13} />
                  {t('cart.deliveryFee')}
                </span>
                {deliveryFee === 0 ? (
                  <span className="font-semibold text-emerald-500">FREE</span>
                ) : (
                  <AnimatedCounter
                    value={deliveryFee}
                    prefix="ETB "
                    className="font-semibold text-gray-900 dark:text-white"
                  />
                )}
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">{t('cart.tax')}</span>
              <AnimatedCounter
                value={tax}
                prefix="ETB "
                className="font-semibold text-gray-900 dark:text-white"
              />
            </div>

            {/* Coupon */}
            <div className="pt-2">
              <div className="relative">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <FiPercent size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      value={coupon}
                      onChange={(e) => { setCoupon(e.target.value.toUpperCase()); setCouponError(false); }}
                      placeholder={t('cart.couponPlaceholder')}
                      className={`w-full pl-9 pr-3 py-2.5 text-sm bg-white/60 dark:bg-slate-700/40 backdrop-blur-sm rounded-xl border transition-all duration-200 outline-none ${
                        couponApplied
                          ? 'border-emerald-400/50 dark:border-emerald-500/30 ring-2 ring-emerald-500/20'
                          : couponError
                            ? 'border-red-400/50 dark:border-red-500/30 ring-2 ring-red-500/20'
                            : 'border-gray-200/50 dark:border-slate-600/30 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20'
                      } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
                    />
                    {couponApplied && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <FiCheck size={14} className="text-emerald-500" />
                      </motion.div>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleApplyCoupon}
                    disabled={!coupon.trim() || couponApplied}
                    className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 ${
                      couponApplied
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 cursor-default'
                        : coupon.trim()
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20 hover:shadow-lg'
                          : 'bg-gray-100 dark:bg-slate-700/50 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {couponApplied ? t('cart.apply') : t('cart.apply')}
                  </motion.button>
                </div>
                {couponError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs mt-1.5 ml-1"
                  >
                    Invalid coupon. Try NILE20 for 20% off!
                  </motion.p>
                )}
                {!couponApplied && !couponError && (
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {suggestedCoupons.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCoupon(c)}
                        className="px-2.5 py-1 text-[10px] font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-200/50 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {couponApplied && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center justify-between text-sm pt-1"
              >
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <FiTag size={13} />
                  {t('cart.discount')}
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  -ETB {discount.toFixed(2)}
                </span>
              </motion.div>
            )}
          </div>

          {/* Divider with glow */}
          <div className="relative">
            <div className="border-t border-gray-200/50 dark:border-slate-700/30" />
            <div className="absolute -top-px left-1/2 -translate-x-1/2 w-20 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
          </div>

          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900 dark:text-white">{t('cart.total')}</span>
            <motion.div
              key={finalTotal}
              initial={{ scale: 1.15 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 12 }}
            >
              <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                ETB {finalTotal.toFixed(2)}
              </span>
            </motion.div>
          </div>

          {/* Delivery estimate */}
          <div className="flex items-center gap-2.5 p-3 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-2xl border border-indigo-200/30 dark:border-indigo-500/10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/20">
              <FiClock size={16} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900 dark:text-white">Estimated Delivery</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">25 - 35 minutes</p>
            </div>
          </div>
        </div>

        {/* Order Type */}
        <div className="px-6">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Order Type</p>
          <div className="flex gap-2 mb-4">
            {ORDER_TYPES.map(({ value, label, icon: Icon }) => (
              <motion.button
                key={value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setOrderType(value)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  orderType === value
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                    : 'bg-gray-100 dark:bg-slate-700/50 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600/50'
                }`}
              >
                <Icon size={14} />
                {label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Checkout CTA */}
        <div className="px-6 pb-6">
          <Link
            to={orderType === 'dine_in' ? '/select-table' : '/checkout'}
            state={orderType === 'dine_in' ? { orderType: 'dine_in' } : undefined}
          >
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={onCheckout}
              className="relative w-full py-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:via-indigo-400 hover:to-purple-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-300 overflow-hidden group"
            >
                <span className="relative z-10 flex items-center justify-center gap-2.5">
                  {orderType === 'dine_in' ? 'Select Table' : t('cart.checkout')}
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <FiArrowRight size={18} />
                </motion.span>
              </span>
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12"
                initial={{ x: '-100%' }}
                whileHover={{ x: '200%' }}
                transition={{ duration: 0.7 }}
              />
              <motion.span
                className="absolute inset-0 rounded-2xl bg-indigo-400/20 blur-xl"
                animate={{ opacity: [0, 0.4, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.button>
          </Link>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <FiShield size={12} className="text-gray-400 dark:text-gray-500" />
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
              Secure checkout powered by Nile Pay
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SuggestedSection({ dark, onAddToCart }) {
  const { t } = useTranslation();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll);
    checkScroll();
    return () => el.removeEventListener('scroll', checkScroll);
  }, []);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 280, behavior: 'smooth' });
  };

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="mt-12 mb-8"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {t('menu.relatedItems')}
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              ✨
            </motion.span>
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            AI-curated recommendations just for you
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll(-1)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
              canScrollLeft
                ? 'bg-white/70 dark:bg-slate-700/50 text-gray-700 dark:text-gray-300 shadow-md hover:shadow-lg border border-gray-200/50 dark:border-slate-600/30'
                : 'bg-gray-100/50 dark:bg-slate-800/30 text-gray-300 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            <FiChevronLeft size={18} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scroll(1)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
              canScrollRight
                ? 'bg-white/70 dark:bg-slate-700/50 text-gray-700 dark:text-gray-300 shadow-md hover:shadow-lg border border-gray-200/50 dark:border-slate-600/30'
                : 'bg-gray-100/50 dark:bg-slate-800/30 text-gray-300 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            <FiChevronRight size={18} />
          </motion.button>
        </div>
      </div>

      <div className="relative">
        {/* Gradient fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white dark:from-slate-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-slate-950 to-transparent z-10 pointer-events-none" />

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 px-2 -mx-2 scroll-smooth custom-scrollbar"
          style={{ scrollbarWidth: 'thin', msOverflowStyle: 'none' }}
        >
          <AnimatePresence mode="popLayout">
            {fallbackFoods.map((food) => (
              <SuggestedCard key={food._id} food={food} dark={dark} onAdd={onAddToCart} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
}

export default function Cart() {
  const { t } = useTranslation();
  const {
    cart, updateQuantity, removeFromCart, addToCart,
    getSubtotal, getDeliveryFee, getTax, getTotal, totalItems,
    orderType, setOrderType
  } = useCart();
  const { darkMode: dark } = useTheme();
  const [pageLoaded, setPageLoaded] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const itemCount = totalItems();
  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const tax = getTax();
  const total = getTotal();

  useEffect(() => {
    setPageLoaded(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleAddSuggestion = useCallback((food) => {
    addToCart(food, 1);
  }, [addToCart]);

  const clearCart = useCallback(() => {
    cart.forEach(item => removeFromCart(item.id));
    setShowClearConfirm(false);
  }, [cart, removeFromCart]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-300/20 to-purple-300/20 dark:from-indigo-500/10 dark:to-purple-500/10 rounded-full blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-300/15 to-pink-300/15 dark:from-purple-500/8 dark:to-pink-500/8 rounded-full blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-200/10 to-transparent dark:from-indigo-500/5 dark:to-transparent rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <Header />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        {/* Hero Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-tight"
            >
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent bg-[length:200%_100%] animate-shimmer">
                {t('cart.title')}
              </span>
            </motion.h1>
            <div className="flex items-center gap-2 mt-2">
              <motion.div
                key={itemCount}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                className="flex items-center gap-1.5"
              >
                <span className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  {itemCount}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                  {itemCount === 1 ? 'item' : 'items'} in your cart
                </span>
              </motion.div>
              {itemCount > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowClearConfirm(true)}
                  className="ml-4 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200/50 dark:border-red-800/30 transition-all duration-200 flex items-center gap-1.5"
                >
                  <FiTrash2 size={12} />
                  {t('cart.clearCart')}
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {itemCount === 0 ? (
          <EmptyCart dark={dark} />
        ) : (
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left: Cart Items */}
            <div className="lg:col-span-3 space-y-4">
              <AnimatePresence mode="popLayout">
                {cart.map((item, index) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    index={index}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                  />
                ))}
              </AnimatePresence>

              {/* Saved for later / continue shopping */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-between pt-4"
              >
                <Link
                  to="/menu"
                  className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors group"
                >
                  <FiRefreshCw size={14} className="transition-transform duration-300 group-hover:rotate-180" />
                  {t('cart.checkout')}
                </Link>
              </motion.div>
            </div>

            {/* Right: Checkout Summary */}
            <div className="lg:col-span-2">
              <CheckoutSummary
                subtotal={subtotal}
                deliveryFee={deliveryFee}
                tax={tax}
                total={total}
                itemCount={itemCount}
                dark={dark}
                orderType={orderType}
                setOrderType={setOrderType}
                onCheckout={() => {}}
              />
            </div>
          </div>
        )}

        {/* Suggested Products */}
        {itemCount > 0 && (
          <SuggestedSection dark={dark} onAddToCart={handleAddSuggestion} />
        )}

        {/* Mobile floating checkout CTA */}
        {itemCount > 0 && (
          <motion.div
            initial={{ y: 120 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
          >
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-t border-gray-200/50 dark:border-slate-700/30 px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('cart.total')}</span>
                <motion.span
                  key={total}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent"
                >
                  ETB {total.toFixed(2)}
                </motion.span>
              </div>
              <div className="flex gap-2 mb-3">
                {ORDER_TYPES.map(({ value, label, icon: Icon }) => (
                  <motion.button
                    key={value}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setOrderType(value)}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-bold transition-all ${
                      orderType === value
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <Icon size={12} />
                    {label}
                  </motion.button>
                ))}
              </div>
              <Link
                to={orderType === 'dine_in' ? '/select-table' : '/checkout'}
                state={orderType === 'dine_in' ? { orderType: 'dine_in' } : undefined}
              >
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2"
                >
                {orderType === 'dine_in' ? 'Select Table' : t('cart.checkout')}
                  <FiArrowRight size={18} />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        )}
      </motion.main>

      {/* Clear cart confirm modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowClearConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-200/50 dark:border-slate-700/30"
            >
              <div className="w-14 h-14 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
                <FiTrash2 size={24} className="text-red-500" />
              </div>
                <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
                {t('cart.clearCart')}?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
                This will remove all {itemCount} items from your cart.
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-3 rounded-2xl bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-semibold text-sm transition-all duration-200 hover:bg-gray-200 dark:hover:bg-slate-600"
                >
                  {t('common.cancel')}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={clearCart}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold text-sm shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 transition-all duration-200"
                >
                  {t('cart.clearCart')}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
