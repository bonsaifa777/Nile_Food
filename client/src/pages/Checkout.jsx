import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

import {
  ShoppingCart, MapPin, CreditCard, Check, ChevronRight, ChevronLeft,
  Truck, Home, ShoppingBag, Clock, Shield,
  Plus, Minus, DollarSign, Send, Smartphone, Mail, User,
  Calendar, Percent, Gift,
  Sparkles, Users,
  Bell, Lock, Sun, Moon, ArrowRight,
  Landmark, Upload, ChevronDown, FileText, Image
} from 'lucide-react';

const FOOD_STEPS = [
  { id: 'cart', label: 'Cart', icon: ShoppingCart },
  { id: 'delivery', label: 'Delivery', icon: MapPin },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'confirm', label: 'Confirmation', icon: Sparkles },
];

const PAYMENT_METHODS = [
  {
    id: 'card',
    name: 'Credit / Debit Card',
    description: 'Visa, Mastercard, Amex',
    icon: CreditCard,
    badge: 'Fast',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Pay with your PayPal account',
    icon: CreditCard,
    badge: 'Popular',
    gradient: 'from-blue-600 to-indigo-700',
  },
  {
    id: 'apple_pay',
    name: 'Apple Pay',
    description: 'One-touch payment',
    icon: Smartphone,
    badge: 'Secure',
    gradient: 'from-gray-700 to-gray-900',
  },
  {
    id: 'cash',
    name: 'Cash on Delivery',
    description: 'Pay when you receive',
    icon: DollarSign,
    badge: 'Simple',
    gradient: 'from-emerald-500 to-green-600',
  },
  {
    id: 'bank',
    name: 'Bank Transfer',
    description: 'Direct bank transfer',
    icon: Send,
    badge: 'Trusted',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    id: 'telebirr',
    name: 'Telebirr',
    description: 'Pay with mobile money',
    icon: Smartphone,
    badge: 'Fast',
    gradient: 'from-green-500 to-emerald-600',
  },
];

const DELIVERY_TIMES = [
  'As soon as possible',
  '30 minutes',
  '45 minutes',
  '60 minutes',
  'Schedule for later',
];

function FloatingShapes() {
  const shapes = useMemo(() =>
    [...Array(6)].map((_, i) => ({
      id: i,
      size: 60 + Math.random() * 120,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 15 + Math.random() * 20,
      delay: Math.random() * -20,
      opacity: 0.03 + Math.random() * 0.05,
      rotation: Math.random() * 360,
    })), []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {shapes.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-indigo-500"
          style={{
            width: s.size,
            height: s.size,
            left: `${s.x}%`,
            top: `${s.y}%`,
          }}
          animate={{
            x: [0, 30, -20, 40, 0],
            y: [0, -40, 20, -30, 0],
            rotate: [0, s.rotation, -s.rotation / 2, s.rotation / 2, 0],
            scale: [1, 1.2, 0.9, 1.1, 1],
            opacity: [0, s.opacity, 0, s.opacity, 0],
          }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            delay: s.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/[0.04] to-purple-500/[0.04] rounded-full blur-3xl animate-aurora" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-violet-500/[0.04] to-fuchsia-500/[0.04] rounded-full blur-3xl animate-aurora" style={{ animationDelay: '-7s' }} />
    </div>
  );
}

function CreditCardPreview({ form, focusedField }) {
  return (
    <motion.div
      className="relative w-full max-w-[340px] mx-auto aspect-[1.586/1] rounded-2xl overflow-hidden cursor-pointer group perspective-1000"
      whileHover={{ scale: 1.02, rotateY: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.2),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,0,0,0.2),transparent_60%)]" />
      <motion.div
        className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:200%_200%]"
        animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
      <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl" />
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-black/10 rounded-full translate-x-1/3 translate-y-1/3 blur-xl" />
      <div className="relative p-5 md:p-6 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start">
          <motion.div
            className="text-[10px] md:text-xs font-medium text-white/60 tracking-widest uppercase"
            animate={{ opacity: focusedField === 'cardName' ? 0.4 : 0.6 }}
          >
            {focusedField === 'cardName' ? 'CARDHOLDER' : 'PREMIUM'}
          </motion.div>
          <motion.div
            className="flex items-center gap-1"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="w-6 h-4 md:w-8 md:h-5 rounded bg-gradient-to-br from-orange-300 to-red-400 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.3),transparent_60%)]" />
            </div>
            <div className="w-6 h-4 md:w-8 md:h-5 rounded bg-gradient-to-br from-red-400 to-orange-300 relative overflow-hidden -ml-2">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.3),transparent_60%)]" />
            </div>
          </motion.div>
        </div>
        <div className="space-y-3 md:space-y-4">
          <motion.div
            className="font-mono text-lg md:text-2xl tracking-[4px] md:tracking-[6px] text-white"
            animate={{ opacity: focusedField === 'cardNumber' ? 1 : 0.9 }}
          >
            <AnimatePresence mode="popLayout">
              {form.cardNumber.padEnd(16, '•').replace(/(.{4})/g, '$1 ').trim() || '•••• •••• •••• ••••'}
            </AnimatePresence>
          </motion.div>
          <div className="flex gap-6 md:gap-10">
            <div className="flex-1">
              <p className="text-[8px] md:text-[10px] text-white/50 tracking-wider mb-1">CARDHOLDER</p>
              <motion.p
                className="text-xs md:text-sm font-medium text-white tracking-wide truncate"
                animate={{ opacity: focusedField === 'cardName' ? 1 : 0.8 }}
              >
                {form.cardName || 'YOUR NAME'}
              </motion.p>
            </div>
            <div>
              <p className="text-[8px] md:text-[10px] text-white/50 tracking-wider mb-1">EXPIRES</p>
              <motion.p
                className="text-xs md:text-sm font-medium text-white"
                animate={{ opacity: focusedField === 'expiry' ? 1 : 0.8 }}
              >
                {form.expiry || 'MM/YY'}
              </motion.p>
            </div>
            <div>
              <p className="text-[8px] md:text-[10px] text-white/50 tracking-wider mb-1">CVV</p>
              <motion.p className="text-xs md:text-sm font-medium text-white">
                {focusedField === 'cvv' ? form.cvv.padEnd(3, '•') : '•••'}
              </motion.p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FloatingLabelInput({ label, icon: Icon, value, onChange, type = 'text', required, placeholder, children }) {
  const [focused, setFocused] = useState(false);
  const isFloating = focused || value;

  return (
    <div className="relative">
      {children || (
        <div className={`flex items-center gap-3 p-0.5 rounded-2xl border-2 transition-all duration-300 ${
          focused
            ? 'border-indigo-500/50 bg-indigo-500/5 shadow-lg shadow-indigo-500/10'
            : 'border-white/20 bg-white/50 dark:bg-white/5 hover:border-white/30'
        }`}>
          {Icon && (
            <div className={`pl-4 transition-colors duration-300 ${focused ? 'text-indigo-400' : 'text-gray-400'}`}>
              <Icon size={18} />
            </div>
          )}
          <div className="relative flex-1">
            <input
              type={type}
              value={value}
              onChange={onChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={placeholder || label}
              required={required}
              className="w-full bg-transparent py-4 pr-4 text-gray-900 dark:text-white placeholder-transparent focus:outline-none"
            />
            <motion.label
              className={`absolute left-0 pointer-events-none transition-all duration-300 ${
                isFloating
                  ? '-top-2.5 text-[10px] font-medium text-indigo-400'
                  : 'top-4 text-sm text-gray-400'
              }`}
              initial={false}
              animate={{ y: isFloating ? -16 : 0, scale: isFloating ? 0.85 : 1 }}
            >
              {label}
            </motion.label>
          </div>
        </div>
      )}
    </div>
  );
}

function PromoCodeInput() {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleApply = () => {
    if (!code.trim()) return;
    setApplied(true);
    toast.success('Promo code applied! You saved 10%');
    setTimeout(() => setApplied(false), 3000);
  };

  return (
    <div className={`flex items-center gap-2 p-1 rounded-2xl border-2 transition-all duration-300 ${
      focused ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/20 bg-white/50 dark:bg-white/5'
    }`}>
      <div className={`pl-4 ${focused ? 'text-indigo-400' : 'text-gray-400'}`}>
        {applied ? <Gift size={18} className="text-emerald-400" /> : <Percent size={18} />}
      </div>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={t('cart.couponPlaceholder')}
        className="flex-1 bg-transparent py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
        disabled={applied}
      />
      <motion.button
        type="button"
        onClick={handleApply}
        disabled={!code.trim() || applied}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
          applied
            ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
            : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30'
        }`}
      >
        {applied ? (
          <span className="flex items-center gap-1.5"><Check size={14} /> {t('cart.apply')}</span>
        ) : (
          t('cart.apply')
        )}
      </motion.button>
    </div>
  );
}

function DeliveryTimeSelector({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {DELIVERY_TIMES.map((time, idx) => (
        <motion.button
          key={time}
          type="button"
          onClick={() => onSelect(time)}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className={`relative p-3 rounded-xl text-sm font-medium transition-all ${
            selected === time
              ? 'bg-indigo-500/15 border-2 border-indigo-500/50 text-indigo-400 shadow-lg shadow-indigo-500/10'
              : 'border-2 border-white/20 bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300'
          }`}
        >
          {selected === time && (
            <motion.div
              layoutId="timeBg"
              className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-xl"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center justify-center gap-1.5">
            <Clock size={14} className={selected === time ? 'text-indigo-400' : 'text-gray-400'} />
            {time}
          </span>
        </motion.button>
      ))}
    </div>
  );
}

function GuestCounter({ label, icon: Icon, value, onChange, min = 0, max = 10 }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/20">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
          <Icon size={18} className="text-indigo-400" />
        </div>
        <div>
          <p className="font-semibold text-sm">{label}</p>
          <p className="text-xs text-gray-400">{value} {value === 1 ? 'guest' : 'guests'}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <motion.button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          whileTap={{ scale: 0.9 }}
          className="w-9 h-9 rounded-xl bg-white/80 dark:bg-white/10 flex items-center justify-center hover:bg-indigo-500/10 transition-colors"
        >
          <Minus size={16} className={value <= min ? 'text-gray-300' : 'text-gray-500'} />
        </motion.button>
        <motion.span
          key={value}
          initial={{ scale: 1.3, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-8 text-center font-bold text-lg"
        >
          {value}
        </motion.span>
        <motion.button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          whileTap={{ scale: 0.9 }}
          className="w-9 h-9 rounded-xl bg-white/80 dark:bg-white/10 flex items-center justify-center hover:bg-indigo-500/10 transition-colors"
        >
          <Plus size={16} className={value >= max ? 'text-gray-300' : 'text-gray-500'} />
        </motion.button>
      </div>
    </div>
  );
}

function ItemRow({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center gap-3 p-2.5 rounded-xl bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-all group"
    >
      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-indigo-500/10">
        <img
          src={item.image || '/placeholder-food.jpg'}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{item.name}</p>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>{item.quantity}x</span>
          {item.size && <span>· {item.size}</span>}
          {item.extras?.length > 0 && <span>· +{item.extras.length}</span>}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-indigo-400">
          {(item.price * item.quantity).toFixed(2)}
        </p>
      </div>
    </motion.div>
  );
}

function SuccessAnimation({ onClose }) {
  const { t } = useTranslation();
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -50 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 max-w-md mx-4 text-center shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-emerald-500/30"
              animate={{
                scale: [1, 1.1, 1],
                boxShadow: [
                  '0 0 0 0 rgba(52,211,153,0.4)',
                  '0 0 0 30px rgba(52,211,153,0)',
                  '0 0 0 0 rgba(52,211,153,0)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
              >
                <Check size={40} className="text-white" />
              </motion.div>
            </motion.div>

            <motion.h2
              className="text-2xl font-black mb-2 gradient-text"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {t('checkout.placeOrder')}
            </motion.h2>

            <motion.p
              className="text-gray-500 dark:text-gray-400 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {t('orders.trackOrder')}
            </motion.p>

            <motion.div
              className="flex flex-col gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} /> 25-35 min
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck size={14} /> Free delivery
                </div>
              </div>
              <Link
                to="/profile?tab=order-status"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-xl hover:shadow-2xl transition-all"
              >
                {t('orders.trackOrder')} <ArrowRight size={18} />
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                {t('cart.checkout')}
              </button>
            </motion.div>

            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full pointer-events-none"
                style={{
                  background: ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'][i % 5],
                }}
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 1,
                  scale: 0,
                }}
                animate={{
                  x: (Math.random() - 0.5) * 400,
                  y: (Math.random() - 0.5) * 400,
                  opacity: 0,
                  scale: [0, 1, 0.5, 0],
                }}
                transition={{
                  duration: 1.5 + Math.random(),
                  delay: 0.5 + Math.random() * 0.5,
                  ease: 'easeOut',
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FloatingSupportButton() {
  return (
    <motion.button
      type="button"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-2xl shadow-indigo-500/30 flex items-center justify-center"
      whileHover={{ scale: 1.1, rotate: -5 }}
      whileTap={{ scale: 0.9 }}
      animate={{
        boxShadow: [
          '0 0 0 0 rgba(99,102,241,0.4)',
          '0 0 0 16px rgba(99,102,241,0)',
          '0 0 0 0 rgba(99,102,241,0)',
        ],
      }}
      transition={{ duration: 2, repeat: Infinity }}
      onClick={() => toast.success('Support team is here to help!')}
    >
      <Bell size={22} />
    </motion.button>
  );
}

function MobileStickyCTA({ onCheckout, loading, total }) {
  const { t } = useTranslation();
  return (
    <motion.div
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-t border-white/20"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
    >
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <p className="text-xs text-gray-400">{t('cart.total')}</p>
          <motion.p
            className="text-2xl font-black gradient-text"
            key={total}
            initial={{ scale: 1.2, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {total.toFixed(2)} ETB
          </motion.p>
        </div>
        <motion.button
          type="button"
          onClick={onCheckout}
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-4 rounded-2xl font-bold text-lg shadow-xl disabled:opacity-50 bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full inline-block"
              />
              {t('common.loading')}
            </span>
          ) : (
            <span>{t('checkout.placeOrder')}</span>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

const BANKS = [
  { id: 'CBE', name: 'Commercial Bank of Ethiopia', short: 'CBE', color: 'from-red-600 to-red-800', textColor: 'text-red-600' },
  { id: 'Abyssinia', name: 'Abyssinia Bank', short: 'AB', color: 'from-green-600 to-green-800', textColor: 'text-green-600' },
  { id: 'Awash', name: 'Awash Bank', short: 'AW', color: 'from-blue-600 to-blue-800', textColor: 'text-blue-600' },
  { id: 'Siinqee', name: 'Siinqee Bank', short: 'SB', color: 'from-purple-600 to-purple-800', textColor: 'text-purple-600' },
  { id: 'CooP', name: 'Cooperative Bank of Oromia', short: 'CB', color: 'from-yellow-500 to-yellow-700', textColor: 'text-yellow-600' },
];

const TELEBIRR_ACCOUNT = '251911234567';

function PaymentBankSelector({ selectedBank, setSelectedBank }) {
  const [open, setOpen] = useState(false);
  const selected = BANKS.find(b => b.id === selectedBank) || BANKS[0];
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-white/20 bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-all"
      >
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${selected.color} flex items-center justify-center text-[10px] font-black text-white`}>
          {selected.short}
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold">{selected.name}</p>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} className="text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.97 }}
            className="absolute left-0 right-0 top-full mt-1 z-20 rounded-xl overflow-hidden border border-white/20 bg-white dark:bg-slate-800 shadow-xl"
          >
            {BANKS.map((bank) => (
              <button
                key={bank.id}
                type="button"
                onClick={() => { setSelectedBank(bank.id); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-3 text-sm transition-all hover:bg-gray-100 dark:hover:bg-white/10 ${
                  selectedBank === bank.id ? 'bg-indigo-500/5' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${bank.color} flex items-center justify-center text-[10px] font-black text-white`}>
                  {bank.short}
                </div>
                <span className="font-medium">{bank.name}</span>
                {selectedBank === bank.id && <Check size={12} className="ml-auto text-indigo-400" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PaymentProofUpload({ paymentProof, setPaymentProof, setPaymentProofName, paymentProofName }) {
  const handleProofUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentProof(file);
      setPaymentProofName(file.name);
    }
  };
  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-400 mb-1.5">Upload Payment Proof</p>
      <label className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
        paymentProof ? 'border-green-500/50 bg-green-500/5' : 'border-white/20 hover:border-indigo-500/30 bg-white/50 dark:bg-white/5'
      }`}>
        <input type="file" accept="image/*,.pdf" onChange={handleProofUpload} className="hidden" />
        {paymentProof ? (
          <div className="flex items-center gap-2">
            <Image size={16} className="text-green-500" />
            <span className="text-xs font-medium text-green-500 truncate max-w-[180px]">{paymentProofName}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Upload size={16} className="text-gray-400" />
            <span className="text-xs text-gray-400">Tap to upload screenshot or PDF</span>
          </div>
        )}
      </label>
    </div>
  );
}

export default function Checkout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, getSubtotal, getDeliveryFee, getTax, getTotal, clearCart, setOrderType: setCartOrderType } = useCart();
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderType, setOrderType] = useState('delivery');
  const [deliveryTime, setDeliveryTime] = useState('As soon as possible');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardForm, setCardForm] = useState({ cardNumber: '', cardName: '', expiry: '', cvv: '' });
  const [focusedField, setFocusedField] = useState(null);
  const [guestInfo, setGuestInfo] = useState({ name: '', phone: '', email: '', address: '', city: '', district: '' });
  const [couponDiscount] = useState(0);
  const [selectedBank, setSelectedBank] = useState('CBE');
  const [bankRefNumber, setBankRefNumber] = useState('');
  const [telebirrPhone, setTelebirrPhone] = useState('');
  const [paymentProof, setPaymentProof] = useState(null);
  const [paymentProofName, setPaymentProofName] = useState('');

  const STEPS = FOOD_STEPS;
  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const tax = getTax();
  const total = getTotal() - couponDiscount;

  useEffect(() => {
    const state = location.state;
    if (state?.guestInfo) {
      setGuestInfo(prev => ({ ...prev, ...state.guestInfo }));
    }
  }, []);

  useEffect(() => {
    setCartOrderType(orderType);
  }, [orderType]);

  useEffect(() => {
    if (user) fetchAddresses();
    fetchTables();
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const { data } = await axios.get('/api/users/addresses');
      setAddresses(data.data);
      const defaultAddr = data.data.find(a => a.isDefault);
      if (defaultAddr) setSelectedAddress(defaultAddr._id);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTables = async () => {
    try {
      const { data } = await axios.get('/api/tables?status=available');
      setTables(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits;
  };

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const handleCardChange = (field, value) => {
    let formatted = value;
    if (field === 'cardNumber') formatted = formatCardNumber(value);
    else if (field === 'expiry') formatted = formatExpiry(value);
    else if (field === 'cvv') formatted = value.replace(/\D/g, '').slice(0, 4);
    setCardForm((prev) => ({ ...prev, [field]: formatted }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (orderType === 'delivery' && !user && !guestInfo.name) {
          toast.error('Please fill in your delivery information');
          return false;
        }
        return true;
      case 2:
        if (paymentMethod === 'card') {
          if (cardForm.cardNumber.length < 16) {
            toast.error('Please enter a valid card number');
            return false;
          }
          if (!cardForm.cardName) {
            toast.error('Please enter the cardholder name');
            return false;
          }
          if (cardForm.expiry.length < 5) {
            toast.error('Please enter a valid expiry date');
            return false;
          }
          if (cardForm.cvv.length < 3) {
            toast.error('Please enter a valid CVV');
            return false;
          }
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < STEPS.length - 1) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    setLoading(true);
    try {
      let deliveryAddress = null;
      if (orderType === 'delivery') {
        if (!user || addresses.length === 0) {
          deliveryAddress = {
            label: guestInfo.address ? guestInfo.address.slice(0, 20) : 'Home',
            address: guestInfo.address,
            city: guestInfo.city || '',
            district: guestInfo.district || '',
            latitude: null,
            longitude: null,
          };
        } else {
          const saved = addresses.find((a) => a._id === selectedAddress);
          if (saved) {
            deliveryAddress = {
              label: saved.label,
              address: saved.address,
              city: saved.city,
              latitude: saved.latitude,
              longitude: saved.longitude,
            };
          }
        }
      }
      const orderData = {
        items: cart.map((item) => ({
          food: item.food,
          quantity: item.quantity,
          size: item.size,
          extras: item.extras,
          specialInstructions: item.specialInstructions,
          removedIngredients: item.removedIngredients,
        })),
        type: orderType,
        tableId: selectedTable,
        guestName: guestInfo.name,
        guestPhone: guestInfo.phone,
        deliveryAddress,
        deliveryNotes,
        paymentMethod,
      };
      const { data } = await axios.post('/api/orders', orderData);
      clearCart();
      setShowSuccess(true);
      toast.success('Order placed successfully!');
      setTimeout(() => navigate(`/order/${data.data.orderId}`), 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const stepVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.97,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.97,
    }),
  };

  if (cart.length === 0 && !showSuccess) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24 pb-20 flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 150, damping: 20 }}
            className="text-center max-w-lg mx-auto px-4"
          >
            <motion.div
              className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 mx-auto mb-8 flex items-center justify-center relative"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <motion.div
                className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-indigo-500/5 to-purple-500/5"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              />
              <ShoppingBag size={52} className="text-indigo-400 relative z-10" />
            </motion.div>
            <motion.h2
              className="text-4xl md:text-5xl font-black mb-4 gradient-text"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {t('cart.title')}
            </motion.h2>
            <motion.p
              className="text-gray-400 text-lg mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {t('cart.emptyMessage')}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Link
                to="/menu"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all inline-flex items-center justify-center gap-2"
              >
                <ShoppingBag size={20} /> {t('dashboard.browseMenu')}
              </Link>
              <Link
                to="/"
                className="px-8 py-4 rounded-2xl border border-white/20 text-gray-400 font-medium hover:bg-white/5 transition-all inline-flex items-center justify-center gap-2"
              >
                <Home size={20} /> {t('nav.home')}
              </Link>
            </motion.div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <FloatingShapes />
      <Header />

      <main className="pt-20 pb-20 lg:pb-10 relative z-10">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            className="mb-8 md:mb-12 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 150, damping: 20 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Sparkles size={12} /> {t('checkout.title')}
            </motion.div>
            <div className="flex items-center justify-center gap-4 mb-4">
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl font-black gradient-text tracking-tight"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 150 }}
            >
              Almost There!
            </motion.h1>
            <motion.button
              type="button"
              onClick={toggleDarkMode}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.1, rotate: darkMode ? -15 : 15 }}
              whileTap={{ scale: 0.9 }}
              className="relative w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden shadow-xl transition-all duration-500 group"
            >
              <motion.div
                className="absolute inset-0"
                animate={{
                  background: darkMode
                    ? 'linear-gradient(135deg, #1e293b, #334155)'
                    : 'linear-gradient(135deg, #fef3c7, #fde68a)',
                }}
                transition={{ duration: 0.5 }}
              />
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: darkMode
                    ? 'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.2), transparent 70%)'
                    : 'radial-gradient(circle at 50% 50%, rgba(245,158,11,0.2), transparent 70%)',
                }}
              />
              <AnimatePresence mode="wait">
                {darkMode ? (
                  <motion.span
                    key="sun"
                    initial={{ rotate: -90, scale: 0, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: 90, scale: 0, opacity: 0 }}
                    transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
                    className="relative z-10"
                  >
                    <Sun size={20} className="text-amber-400" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="moon"
                    initial={{ rotate: 90, scale: 0, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: -90, scale: 0, opacity: 0 }}
                    transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
                    className="relative z-10"
                  >
                    <Moon size={20} className="text-indigo-600" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
          <motion.p
            className="text-gray-500 dark:text-gray-400 text-base md:text-lg max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            Just a few details and your culinary journey begins
          </motion.p>
          </motion.div>

          {/* Progress Stepper */}
          <motion.div
            className="mb-10 md:mb-14"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-center max-w-2xl mx-auto">
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isActive = idx === currentStep;
                const isCompleted = idx < currentStep;
                const isClickable = idx < currentStep;

                return (
                  <div key={step.id} className="flex items-center">
                    <motion.button
                      type="button"
                      onClick={() => isClickable && (setDirection(idx < currentStep ? -1 : 1), setCurrentStep(idx))}
                      disabled={!isClickable}
                      className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                        isCompleted
                          ? 'bg-indigo-500 text-white cursor-pointer shadow-lg shadow-indigo-500/30'
                          : isActive
                          ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                          : 'bg-white/40 dark:bg-white/5 text-gray-400 border border-white/20'
                      }`}
                      whileHover={{ scale: isClickable || isActive ? 1.05 : 1 }}
                      whileTap={{ scale: isClickable || isActive ? 0.95 : 1 }}
                    >
                      <motion.span
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCompleted
                            ? 'bg-white text-indigo-600'
                            : isActive
                            ? 'bg-indigo-500 text-white'
                            : 'bg-white/10 text-gray-400'
                        }`}
                        animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {isCompleted ? <Check size={14} /> : <Icon size={14} />}
                      </motion.span>
                      <span className="hidden sm:inline">{step.label}</span>
                      {isActive && (
                        <motion.span
                          className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                    </motion.button>
                    {idx < STEPS.length - 1 && (
                      <div className="w-6 sm:w-12 md:w-16 h-0.5 mx-1 sm:mx-2 relative">
                        <div className="absolute inset-0 bg-white/10 rounded-full" />
                        <motion.div
                          className="absolute inset-0 bg-indigo-500 rounded-full"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: isCompleted ? 1 : 0 }}
                          transition={{ duration: 0.5, ease: 'easeInOut' }}
                          style={{ transformOrigin: 'left' }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          <form onSubmit={handleCheckout}>
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 justify-center">
              {/* Left - Main Content */}
              <div className="w-full max-w-4xl">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentStep}
                    custom={direction}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: 'spring', stiffness: 200, damping: 25, mass: 1 }}
                  >
                    {/* STEP 0: Cart Review */}
                    {currentStep === 0 && (
                      <div className="space-y-5">
                        <motion.div
                          className="rounded-[2rem] overflow-hidden border border-white/20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl shadow-2xl"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="p-6 md:p-8">
                            <div className="flex items-center justify-between mb-6">
                              <div>
                                <h2 className="text-2xl font-bold">{t('checkout.orderSummary')}</h2>
                                <p className="text-sm text-gray-400">{cart.length} {t('cart.quantity')}</p>
                              </div>
                              <motion.div
                                className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20"
                                whileHover={{ scale: 1.02 }}
                              >
                                <span className="text-indigo-400 font-semibold text-sm">
                                  {orderType === 'delivery' ? 'Delivery' : orderType === 'dine_in' ? 'Dine In' : 'Takeaway'}
                                </span>
                              </motion.div>
                            </div>

                            <div className="space-y-2">
                              <AnimatePresence>
                                {cart.map((item, idx) => (
                                  <ItemRow key={item.id} item={item} index={idx} />
                                ))}
                              </AnimatePresence>
                            </div>

                            {/* Order Type Selector */}
                            <div className="mt-6 pt-6 border-t border-white/10">
                              <p className="text-sm font-semibold mb-3 text-gray-500">Order Type</p>
                              <div className="grid grid-cols-3 gap-2">
                                {[
                                  { key: 'delivery', icon: Truck, label: 'Delivery' },
                                  { key: 'dine_in', icon: Home, label: 'Dine In' },
                                  { key: 'takeaway', icon: ShoppingBag, label: 'Takeaway' },
                                ].map(({ key, icon: Icon, label }) => (
                                  <motion.button
                                    key={key}
                                    type="button"
                                    onClick={() => setOrderType(key)}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.97 }}
                                    className={`p-3 rounded-xl text-center transition-all ${
                                      orderType === key
                                        ? 'bg-indigo-500/15 border-2 border-indigo-500/40 text-indigo-400'
                                        : 'border-2 border-white/20 bg-white/50 dark:bg-white/5 text-gray-400 hover:bg-white/80 dark:hover:bg-white/10'
                                    }`}
                                  >
                                    <Icon size={18} className="mx-auto mb-1" />
                                    <span className="text-xs font-semibold">{label}</span>
                                  </motion.button>
                                ))}
                              </div>
                            </div>

                            {orderType === 'dine_in' && tables.length > 0 && (
                              <div className="mt-6 pt-6 border-t border-white/10">
                                <p className="text-sm font-semibold mb-3 text-gray-500">Select Table</p>
                                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
                                  {tables.map((table, idx) => (
                                    <motion.button
                                      key={table._id}
                                      type="button"
                                      onClick={() => setSelectedTable(table._id)}
                                      initial={{ opacity: 0, scale: 0.5 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: idx * 0.02 }}
                                      whileHover={{ scale: 1.08, y: -2 }}
                                      whileTap={{ scale: 0.92 }}
                                      className={`p-3 rounded-xl font-bold text-sm transition-all ${
                                        selectedTable === table._id
                                          ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl'
                                          : 'bg-white/50 dark:bg-white/5 border border-white/20 text-gray-500 hover:bg-white/80'
                                      }`}
                                    >
                                      {table.tableNumber}
                                    </motion.button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </div>
                    )}

                    {/* STEP 1: Delivery or Guest Info */}
                    {currentStep === 1 && (
                      <div className="space-y-5">
                        <motion.div
                          className="rounded-[2rem] overflow-hidden border border-white/20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl shadow-2xl"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-7">
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                                <MapPin size={22} className="text-indigo-400" />
                              </div>
                              <div>
                                <h2 className="text-2xl font-bold">{t('checkout.shippingInfo')}</h2>
                                <p className="text-sm text-gray-400">Where should we bring your food?</p>
                              </div>
                            </div>

                            <div className="space-y-4">
                              {!user ? (
                                <>
                                  <FloatingLabelInput
                                    label={t('checkout.fullName')}
                                    icon={User}
                                    value={guestInfo.name}
                                    onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                                    required
                                  />
                                  <FloatingLabelInput
                                    label={t('checkout.phone')}
                                    icon={Smartphone}
                                    type="tel"
                                    value={guestInfo.phone}
                                    onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                                    required
                                  />
                                  <FloatingLabelInput
                                    label={t('auth.email')}
                                    icon={Mail}
                                    type="email"
                                    value={guestInfo.email}
                                    onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                                  />
                                  <FloatingLabelInput
                                        label={t('checkout.address')}
                                    icon={MapPin}
                                    value={guestInfo.address}
                                    onChange={(e) => setGuestInfo({ ...guestInfo, address: e.target.value })}
                                    required
                                  />
                                  <div className="grid grid-cols-2 gap-3">
                                    <FloatingLabelInput
                                        label={t('checkout.city')}
                                        icon={MapPin}
                                        value={guestInfo.city}
                                        onChange={(e) => setGuestInfo({ ...guestInfo, city: e.target.value })}
                                        required
                                      />
                                      <FloatingLabelInput
                                        label={t('checkout.address')}
                                      icon={MapPin}
                                      value={guestInfo.district}
                                      onChange={(e) => setGuestInfo({ ...guestInfo, district: e.target.value })}
                                    />
                                  </div>
                                </>
                              ) : (
                                <>
                                  {addresses.length > 0 ? (
                                    <div className="space-y-2">
                                      <p className="text-sm font-semibold text-gray-500 mb-2">{t('checkout.address')}</p>
                                      {addresses.map((addr, idx) => (
                                        <motion.label
                                          key={addr._id}
                                          initial={{ opacity: 0, x: -20 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: idx * 0.06 }}
                                          className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all group ${
                                            selectedAddress === addr._id
                                              ? 'bg-indigo-500/10 border-2 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                                              : 'border-2 border-transparent bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10'
                                          }`}
                                        >
                                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                                            selectedAddress === addr._id
                                              ? 'border-indigo-500 bg-indigo-500'
                                              : 'border-gray-300 dark:border-gray-600'
                                          }`}>
                                            {selectedAddress === addr._id && (
                                              <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-2 h-2 rounded-full bg-white"
                                              />
                                            )}
                                          </div>
                                          <input
                                            type="radio"
                                            name="address"
                                            checked={selectedAddress === addr._id}
                                            onChange={() => setSelectedAddress(addr._id)}
                                            className="hidden"
                                          />
                                          <div className="flex-1 min-w-0">
                                            <p className="font-semibold flex items-center gap-2">
                                              {addr.label}
                                              {addr.isDefault && (
                                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-medium">
                                                  Default
                                                </span>
                                              )}
                                            </p>
                                            <p className="text-sm text-gray-400 truncate">
                                              {addr.address}, {addr.city}
                                            </p>
                                          </div>
                                          <motion.div
                                            animate={{ x: selectedAddress === addr._id ? 3 : 0 }}
                                          >
                                            <ChevronRight size={16} className={`transition-colors ${
                                              selectedAddress === addr._id ? 'text-indigo-400' : 'text-gray-400'
                                            }`} />
                                          </motion.div>
                                        </motion.label>
                                      ))}
                                    </div>
                                  ) : (
                                    <>
                                      <p className="text-sm font-semibold text-gray-500 mb-2">{t('checkout.shippingInfo')}</p>
                                      <FloatingLabelInput
                                    label={t('checkout.address')}
                                        icon={MapPin}
                                        value={guestInfo.address}
                                        onChange={(e) => setGuestInfo({ ...guestInfo, address: e.target.value })}
                                        required
                                      />
                                      <div className="grid grid-cols-2 gap-3">
                                        <FloatingLabelInput
                                      label={t('checkout.city')}
                                          icon={MapPin}
                                          value={guestInfo.city}
                                          onChange={(e) => setGuestInfo({ ...guestInfo, city: e.target.value })}
                                          required
                                        />
                                        <FloatingLabelInput
                                      label={t('checkout.address')}
                                          icon={MapPin}
                                          value={guestInfo.district}
                                          onChange={(e) => setGuestInfo({ ...guestInfo, district: e.target.value })}
                                        />
                                      </div>
                                    </>
                                  )}
                                </>
                              )}

                              <div className="pt-2">
                                <p className="text-sm font-semibold text-gray-500 mb-3">Delivery Notes</p>
                                <div className={`p-0.5 rounded-2xl border-2 transition-all duration-300 border-white/20 bg-white/50 dark:bg-white/5`}>
                                  <textarea
                                    value={deliveryNotes}
                                    onChange={(e) => setDeliveryNotes(e.target.value)}
                                    placeholder="e.g., Ring the bell twice, leave at the door..."
                                    rows={3}
                                    className="w-full bg-transparent p-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none resize-none"
                                  />
                                </div>
                              </div>

                              <div className="pt-2">
                                <p className="text-sm font-semibold text-gray-500 mb-3">{t('cart.applyCoupon')}</p>
                                <PromoCodeInput />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    )}

                    {/* STEP 2: Payment */}
                    {currentStep === 2 && (
                      <div className="space-y-5">
                        <motion.div
                          className="rounded-[2rem] overflow-hidden border border-white/20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl shadow-2xl"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-7">
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                                <CreditCard size={22} className="text-indigo-400" />
                              </div>
                              <div>
                                <h2 className="text-2xl font-bold">{t('checkout.paymentMethod')}</h2>
                                <p className="text-sm text-gray-400">Choose your payment option</p>
                              </div>
                            </div>

                            {/* Credit Card Preview */}
                            {paymentMethod === 'card' && (
                              <motion.div
                                className="mb-8"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                              >
                                <CreditCardPreview form={cardForm} focusedField={focusedField} />
                              </motion.div>
                            )}

                            {/* Card Form */}
                            {paymentMethod === 'card' && (
                              <motion.div
                                className="space-y-4 mb-8"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.15 }}
                              >
                                <div className="relative">
                                  <div className={`flex items-center gap-3 p-0.5 rounded-2xl border-2 transition-all duration-300 ${
                                    focusedField === 'cardNumber' ? 'border-indigo-500/50 bg-indigo-500/5 shadow-lg shadow-indigo-500/10' : 'border-white/20 bg-white/50 dark:bg-white/5'
                                  }`}>
                                    <div className={`pl-4 transition-colors ${focusedField === 'cardNumber' ? 'text-indigo-400' : 'text-gray-400'}`}>
                                      <CreditCard size={18} />
                                    </div>
                                    <input
                                      type="text"
                                      inputMode="numeric"
                                      placeholder="0000 0000 0000 0000"
                                      value={cardForm.cardNumber.replace(/(.{4})/g, '$1 ').trim()}
                                      onChange={(e) => handleCardChange('cardNumber', e.target.value.replace(/\s/g, ''))}
                                      onFocus={() => setFocusedField('cardNumber')}
                                      onBlur={() => setFocusedField(null)}
                                      className="flex-1 bg-transparent py-4 pr-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none font-mono tracking-wider"
                                      maxLength={19}
                                    />
                                  </div>
                                </div>
                                <div className="relative">
                                  <div className={`flex items-center gap-3 p-0.5 rounded-2xl border-2 transition-all duration-300 ${
                                    focusedField === 'cardName' ? 'border-indigo-500/50 bg-indigo-500/5 shadow-lg shadow-indigo-500/10' : 'border-white/20 bg-white/50 dark:bg-white/5'
                                  }`}>
                                    <div className={`pl-4 transition-colors ${focusedField === 'cardName' ? 'text-indigo-400' : 'text-gray-400'}`}>
                                      <User size={18} />
                                    </div>
                                    <input
                                      type="text"
                                      placeholder={t('checkout.fullName')}
                                      value={cardForm.cardName}
                                      onChange={(e) => handleCardChange('cardName', e.target.value.toUpperCase())}
                                      onFocus={() => setFocusedField('cardName')}
                                      onBlur={() => setFocusedField(null)}
                                      className="flex-1 bg-transparent py-4 pr-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="relative">
                                    <div className={`flex items-center gap-3 p-0.5 rounded-2xl border-2 transition-all duration-300 ${
                                      focusedField === 'expiry' ? 'border-indigo-500/50 bg-indigo-500/5 shadow-lg shadow-indigo-500/10' : 'border-white/20 bg-white/50 dark:bg-white/5'
                                    }`}>
                                      <div className={`pl-4 transition-colors ${focusedField === 'expiry' ? 'text-indigo-400' : 'text-gray-400'}`}>
                                        <Calendar size={18} />
                                      </div>
                                      <input
                                        type="text"
                                        placeholder={t('checkout.expiryDate')}
                                        value={cardForm.expiry}
                                        onChange={(e) => handleCardChange('expiry', e.target.value)}
                                        onFocus={() => setFocusedField('expiry')}
                                        onBlur={() => setFocusedField(null)}
                                        className="flex-1 bg-transparent py-4 pr-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none font-mono"
                                        maxLength={5}
                                      />
                                    </div>
                                  </div>
                                  <div className="relative">
                                    <div className={`flex items-center gap-3 p-0.5 rounded-2xl border-2 transition-all duration-300 ${
                                      focusedField === 'cvv' ? 'border-indigo-500/50 bg-indigo-500/5 shadow-lg shadow-indigo-500/10' : 'border-white/20 bg-white/50 dark:bg-white/5'
                                    }`}>
                                      <div className={`pl-4 transition-colors ${focusedField === 'cvv' ? 'text-indigo-400' : 'text-gray-400'}`}>
                                        <Lock size={18} />
                                      </div>
                                      <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder={t('checkout.cvv')}
                                        value={cardForm.cvv}
                                        onChange={(e) => handleCardChange('cvv', e.target.value)}
                                        onFocus={() => setFocusedField('cvv')}
                                        onBlur={() => setFocusedField(null)}
                                        className="flex-1 bg-transparent py-4 pr-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none font-mono"
                                        maxLength={4}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}

                            {/* Payment Method Grid */}
                            <div className="grid sm:grid-cols-2 gap-2.5">
                              {PAYMENT_METHODS.slice(0, 4).map((method, idx) => {
                                const Icon = method.icon;
                                return (
                                  <motion.button
                                    key={method.id}
                                    type="button"
                                    onClick={() => setPaymentMethod(method.id)}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`relative p-4 rounded-2xl text-left transition-all overflow-hidden ${
                                      paymentMethod === method.id
                                        ? 'border-2 border-indigo-500/50 bg-indigo-500/5 shadow-xl shadow-indigo-500/10'
                                        : 'border-2 border-transparent bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10'
                                    }`}
                                  >
                                    {paymentMethod === method.id && (
                                      <motion.div
                                        layoutId="paymentHighlight"
                                        className="absolute inset-0 bg-gradient-to-r from-indigo-500/[0.04] to-purple-500/[0.04]"
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                      />
                                    )}
                                    <div className="flex items-center gap-3 relative">
                                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                                        paymentMethod === method.id
                                          ? 'bg-gradient-to-br ' + method.gradient + ' text-white shadow-lg'
                                          : 'bg-white/10 text-gray-400'
                                      }`}>
                                        <Icon size={18} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <p className="text-sm font-bold truncate">{method.name}</p>
                                          <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-semibold flex-shrink-0">
                                            {method.badge}
                                          </span>
                                        </div>
                                        <p className="text-[11px] text-gray-400 truncate">{method.description}</p>
                                      </div>
                                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                        paymentMethod === method.id
                                          ? 'border-indigo-500 bg-indigo-500'
                                          : 'border-gray-300 dark:border-gray-600'
                                      }`}>
                                        {paymentMethod === method.id && (
                                          <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                          >
                                            <Check size={12} className="text-white" />
                                          </motion.div>
                                        )}
                                      </div>
                                    </div>
                                  </motion.button>
                                );
                              })}
                            </div>

                            <div className="mt-4 grid sm:grid-cols-2 gap-2.5">
                              {PAYMENT_METHODS.slice(4).map((method, idx) => {
                                const Icon = method.icon;
                                return (
                                  <motion.button
                                    key={method.id}
                                    type="button"
                                    onClick={() => setPaymentMethod(method.id)}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + idx * 0.05 }}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`relative p-4 rounded-2xl text-left transition-all overflow-hidden ${
                                      paymentMethod === method.id
                                        ? 'border-2 border-indigo-500/50 bg-indigo-500/5 shadow-xl shadow-indigo-500/10'
                                        : 'border-2 border-transparent bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3 relative">
                                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                                        paymentMethod === method.id
                                          ? 'bg-gradient-to-br ' + method.gradient + ' text-white shadow-lg'
                                          : 'bg-white/10 text-gray-400'
                                      }`}>
                                        <Icon size={18} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate">{method.name}</p>
                                        <p className="text-[11px] text-gray-400 truncate">{method.description}</p>
                                      </div>
                                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                        paymentMethod === method.id
                                          ? 'border-indigo-500 bg-indigo-500'
                                          : 'border-gray-300 dark:border-gray-600'
                                      }`}>
                                        {paymentMethod === method.id && (
                                          <Check size={12} className="text-white" />
                                        )}
                                      </div>
                                    </div>
                                  </motion.button>
                                );
                              })}
                            </div>

                            {/* Security Badge */}
                            <motion.div
                              className="mt-6 flex items-center gap-3 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.3 }}
                            >
                              <Shield size={20} className="text-indigo-400 flex-shrink-0" />
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Your payment is secured with end-to-end encryption. We never store your full card details.
                              </p>
                            </motion.div>

                            {paymentMethod === 'bank' && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 p-4 rounded-2xl bg-violet-500/5 border border-violet-500/20"
                              >
                                <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                                  <Landmark size={16} className="text-violet-400" />
                                  Bank Transfer Details
                                </p>
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-[10px] font-semibold text-gray-400 mb-1.5">Select Bank</p>
                                    <PaymentBankSelector
                                      selectedBank={selectedBank}
                                      setSelectedBank={setSelectedBank}
                                    />
                                  </div>
                                  <div className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/20">
                                    <p className="text-[10px] font-semibold text-gray-400 mb-1">Account Number</p>
                                    <p className="text-sm font-bold tracking-wider">1000 1234 5678 9012</p>
                                    <p className="text-[10px] text-gray-400 mt-1">Nile Food Hospitality PLC</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-semibold text-gray-400 mb-1.5">Transaction Reference</p>
                                    <div className="flex items-center gap-3 p-0.5 rounded-xl border-2 border-white/20 bg-white/50 dark:bg-white/5">
                                      <div className="pl-3"><FileText size={14} className="text-gray-400" /></div>
                                      <input
                                        type="text"
                                        value={bankRefNumber}
                                        onChange={(e) => setBankRefNumber(e.target.value)}
                                        placeholder="Enter transaction reference"
                                        className="flex-1 bg-transparent py-2.5 pr-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
                                      />
                                    </div>
                                  </div>
                                  <PaymentProofUpload
                                    paymentProof={paymentProof}
                                    setPaymentProof={setPaymentProof}
                                    setPaymentProofName={setPaymentProofName}
                                    paymentProofName={paymentProofName}
                                  />
                                </div>
                              </motion.div>
                            )}

                            {paymentMethod === 'telebirr' && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 p-4 rounded-2xl bg-green-500/5 border border-green-500/20"
                              >
                                <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                                  <Smartphone size={16} className="text-green-400" />
                                  Telebirr Details
                                </p>
                                <div className="space-y-3">
                                  <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/20">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Smartphone size={12} className="text-green-500" />
                                      <p className="text-[10px] font-semibold text-gray-400">Telebirr Account</p>
                                    </div>
                                    <p className="text-sm font-bold tracking-wider">{TELEBIRR_ACCOUNT}</p>
                                    <p className="text-[10px] text-gray-400 mt-1">Nile Food Hospitality</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-semibold text-gray-400 mb-1.5">Your Telebirr Phone Number</p>
                                    <div className="flex items-center gap-3 p-0.5 rounded-xl border-2 border-white/20 bg-white/50 dark:bg-white/5">
                                      <div className="pl-3"><Smartphone size={14} className="text-gray-400" /></div>
                                      <input
                                        type="tel"
                                        value={telebirrPhone}
                                        onChange={(e) => setTelebirrPhone(e.target.value)}
                                        placeholder="e.g., 0911XXXXXX"
                                        className="flex-1 bg-transparent py-2.5 pr-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
                                      />
                                    </div>
                                  </div>
                                  <PaymentProofUpload
                                    paymentProof={paymentProof}
                                    setPaymentProof={setPaymentProof}
                                    setPaymentProofName={setPaymentProofName}
                                    paymentProofName={paymentProofName}
                                  />
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      </div>
                    )}

                    {/* STEP 3: Confirmation */}
                    {currentStep === 3 && (
                      <div className="space-y-5">
                        <motion.div
                          className="rounded-[2rem] overflow-hidden border border-white/20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl shadow-2xl"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-7">
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
                                <Sparkles size={22} className="text-emerald-400" />
                              </div>
                              <div>
                                  <h2 className="text-2xl font-bold">{t('checkout.orderSummary')}</h2>
                                <p className="text-sm text-gray-400">One last look before we prepare your order</p>
                              </div>
                            </div>

                            {/* Order Items */}
                            <div className="mb-6">
                                <p className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                                  <ShoppingBag size={14} /> {t('cart.quantity')} ({cart.length})
                              </p>
                              <div className="space-y-2">
                                <AnimatePresence>
                                  {cart.map((item, idx) => (
                                    <ItemRow key={item.id} item={item} index={idx} />
                                  ))}
                                </AnimatePresence>
                              </div>
                            </div>

                            {/* Order Details Summary */}
                            <div className="mb-6 p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
                              <p className="text-sm font-semibold text-gray-500 mb-3">{t('checkout.orderSummary')}</p>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="flex items-center gap-2 text-gray-400">
                                    <Truck size={14} /> Type
                                  </span>
                                  <span className="font-semibold capitalize">{orderType}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="flex items-center gap-2 text-gray-400">
                                    <Clock size={14} /> Delivery Time
                                  </span>
                                  <span className="font-semibold">{deliveryTime}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="flex items-center gap-2 text-gray-400">
                                    <CreditCard size={14} /> Payment
                                  </span>
                                  <span className="font-semibold">
                                    {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.name}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {orderType === 'delivery' && (
                              <div className="mb-6 p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
                                <p className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                                  <MapPin size={14} /> Delivery Address
                                </p>
                                <div className="space-y-2">
                                  {!user ? (
                                    <div className="text-sm">
                                      <p className="font-semibold">{guestInfo.address}</p>
                                      <p className="text-gray-400 text-xs">
                                        {[guestInfo.city, guestInfo.district].filter(Boolean).join(', ') || ''}
                                      </p>
                                    </div>
                                  ) : addresses.length > 0 && addresses.find((a) => a._id === selectedAddress) ? (
                                    (() => {
                                      const sa = addresses.find((a) => a._id === selectedAddress);
                                      return (
                                        <div className="text-sm">
                                          <p className="font-semibold">{sa.label}</p>
                                          <p className="text-gray-400 text-xs">{sa.address}, {sa.city}</p>
                                        </div>
                                      );
                                    })()
                                  ) : (
                                    <div className="text-sm">
                                      <p className="font-semibold">{guestInfo.address || 'Not provided'}</p>
                                      <p className="text-gray-400 text-xs">
                                        {[guestInfo.city, guestInfo.district].filter(Boolean).join(', ') || ''}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Place Order CTA */}
                            <motion.button
                              type="submit"
                              disabled={loading}
                              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 text-white font-bold text-lg shadow-2xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all relative overflow-hidden group"
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                            >
                              <motion.div
                                className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:200%_200%]"
                                animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                              />
                              {loading ? (
                                <span className="relative z-10 flex items-center justify-center gap-3">
                                  <motion.span
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full inline-block"
                                  />
                                   {t('common.loading')}
                                </span>
                              ) : (
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                  <Sparkles size={20} />                                   {t('checkout.placeOrder')}
                                </span>
                              )}
                            </motion.button>
                          </div>
                        </motion.div>
                      </div>
                    )}

                  </motion.div>
                </AnimatePresence>

                {/* Step Navigation */}
                <motion.div
                  className="flex items-center justify-between mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {currentStep > 0 ? (
                    <motion.button
                      type="button"
                      onClick={prevStep}
                      whileHover={{ scale: 1.02, x: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-white/20 hover:bg-white/10 dark:hover:bg-white/5 transition-all font-medium text-sm"
                    >
                      <ChevronLeft size={16} /> {t('common.back')}
                    </motion.button>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {t('checkout.title')} {currentStep + 1}/{STEPS.length}
                    </span>
                    {currentStep < STEPS.length - 1 && (
                      <motion.button
                        type="button"
                        onClick={nextStep}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all"
                      >
                        {t('common.next')} <ChevronRight size={16} />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              </div>

            </div>
          </form>
        </div>
      </main>

      <FloatingSupportButton />
      <MobileStickyCTA
        onCheckout={handleCheckout}
        loading={loading}
        total={total}
      />

      <Footer />

      {/* Success Modal */}
      {showSuccess && <SuccessAnimation onClose={() => setShowSuccess(false)} />}
    </div>
  );
}
