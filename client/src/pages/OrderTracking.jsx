import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Loading from '../components/common/Loading';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import {
  Clock, Check, ChefHat, Utensils, PartyPopper,
  MapPin, Phone, Navigation, Star, Zap, Timer,
  ShoppingBag, ChevronRight, Sparkle, GraduationCap
} from 'lucide-react';

const statusSteps = [
  { key: 'pending', labelKey: 'orderPlaced', label: 'Order Placed', icon: Clock, color: '#6366f1' },
  { key: 'confirmed', labelKey: 'confirmed', label: 'Confirmed', icon: Check, color: '#8b5cf6' },
  { key: 'preparing', labelKey: 'preparing', label: 'Preparing', icon: ChefHat, color: '#f59e0b' },
  { key: 'ready', labelKey: 'ready', label: 'Ready', icon: Utensils, color: '#10b981' },
  { key: 'on_the_way', labelKey: 'onTheWay', label: 'On the Way', icon: Navigation, color: '#06b6d4' },
  { key: 'delivered', labelKey: 'delivered', label: 'Delivered', icon: PartyPopper, color: '#22c55e' },
];

function FoodParticles({ mouse }) {
  const meshRef = useRef();
  const count = 60;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.0005;
      meshRef.current.rotation.y += 0.001;
      meshRef.current.position.x += (mouse.current.x * 0.2 - meshRef.current.position.x) * 0.01;
      meshRef.current.position.y += (-mouse.current.y * 0.2 - meshRef.current.position.y) * 0.01;
    }
  });

  const shapes = useMemo(() => {
    const s = [];
    for (let i = 0; i < count; i++) {
      s.push(Math.floor(Math.random() * 3));
    }
    return s;
  }, []);

  return (
    <group ref={meshRef}>
      {Array.from({ length: count }).map((_, i) => (
        <Float key={i} speed={0.3 + Math.random() * 0.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <mesh
            position={[positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]]}
            scale={0.08 + Math.random() * 0.1}
          >
            {shapes[i] === 0 ? <boxGeometry args={[1, 1, 1]} /> :
             shapes[i] === 1 ? <sphereGeometry args={[0.8, 16, 16]} /> :
             <torusGeometry args={[0.7, 0.3, 12, 12]} />}
            <meshPhysicalMaterial
              color={[0.4 + Math.random() * 0.3, 0.3 + Math.random() * 0.3, 0.8 + Math.random() * 0.2]}
              transparent
              opacity={0.15 + Math.random() * 0.15}
              roughness={0.3}
              metalness={0.7}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function Scene3D({ mouse }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.6} />
      <pointLight position={[-10, -10, -5]} intensity={0.3} color="#6366f1" />
      <Stars radius={50} depth={50} count={500} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={30} scale={12} size={2} speed={0.4} opacity={0.3} color="#6366f1" />
      <FoodParticles mouse={mouse} />
    </Canvas>
  );
}

function AnimatedCounter({ value, style }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const duration = 800 + Math.random() * 400;
    const from = display;
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);
  return <span style={style}>{display}</span>;
}

function TimeElapsed({ createdAt, t }) {
  const [elapsed, setElapsed] = useState('');
  useEffect(() => {
    const update = () => {
      const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
      if (diff < 1) setElapsed(t('orderTracking.justNow'));
      else if (diff < 60) setElapsed(`${diff}${t('orderTracking.minutesAgo')}`);
      else setElapsed(`${Math.floor(diff / 60)}${t('orderTracking.hoursAgo')} ${diff % 60}${t('orderTracking.minutesAgo')}`);
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [createdAt]);
  return <span>{elapsed}</span>;
}

function StatusTimeline({ currentIndex, status, t }) {
  return (
    <div className="relative py-8">
      {/* Progress line with gradient glow */}
      <div className="absolute top-[58px] left-[28px] right-[28px] h-[3px] bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full relative"
          style={{
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #f59e0b, #10b981)',
          }}
          initial={{ width: '0%' }}
          animate={{ width: `${(currentIndex / (statusSteps.length - 1)) * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="absolute inset-0 bg-white/30 blur-sm" />
        </motion.div>
      </div>
      {/* Status dots */}
      <div className="relative flex justify-between">
        {statusSteps.map((step, index) => {
          const Icon = step.icon;
          const isComplete = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const isDelivered = step.key === 'delivered';
          const isOnTheWay = step.key === 'on_the_way';

          if (status === 'dine_in' && isOnTheWay) return <div key={step.key} />;
          if (status === 'dine_in' && isDelivered) {
            return (
              <div key={step.key} className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: index * 0.15, type: 'spring', stiffness: 200, damping: 15 }}
                  className={`relative w-14 h-14 rounded-2xl flex items-center justify-center z-10 overflow-hidden`}
                  style={{
                    background: isComplete
                      ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                      : 'rgba(156,163,175,0.15)',
                    boxShadow: isComplete ? '0 0 30px rgba(34,197,94,0.3)' : 'none',
                  }}
                >
                  <Icon size={24} className={isComplete ? 'text-white' : 'text-gray-500 dark:text-gray-400'} />
                  {isComplete && (
                    <motion.div
                      className="absolute inset-0"
                      animate={{ opacity: [0, 0.3, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{
                        background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4), transparent 70%)',
                      }}
                    />
                  )}
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 + 0.1 }}
                  className={`mt-3 text-xs font-semibold text-center ${
                    isComplete ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {t('orderTracking.served')}
                </motion.p>
              </div>
            );
          }

          return (
            <div key={step.key} className="flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1 : isComplete ? 1 : 0.9,
                  y: isCurrent ? -4 : 0,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className={`relative w-14 h-14 rounded-2xl flex items-center justify-center z-10 overflow-hidden cursor-pointer`}
                style={{
                  background: isComplete
                    ? `linear-gradient(135deg, ${step.color}, ${step.color}dd)`
                    : 'rgba(156,163,175,0.15)',
                  boxShadow: isComplete
                    ? `0 0 30px ${step.color}40, inset 0 1px 0 ${step.color}40`
                    : 'none',
                  border: isCurrent ? `2px solid ${step.color}80` : '2px solid transparent',
                }}
                whileHover={{ scale: 1.1, y: -2 }}
              >
                <Icon size={22} className={`relative z-10 ${isComplete ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                {isCurrent && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      border: `2px solid ${step.color}`,
                    }}
                  />
                )}
                {isComplete && !isCurrent && (
                  <motion.div
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.2, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.3), transparent 70%)',
                    }}
                  />
                )}
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{
                  opacity: isComplete ? 1 : 0.4,
                  y: 0,
                  scale: isCurrent ? 1.05 : 1,
                }}
                transition={{ delay: 0.1 }}
                className={`mt-3 text-xs font-semibold text-center whitespace-nowrap ${
                  isCurrent ? 'text-gray-900 dark:text-white' : isComplete ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {t('orderTracking.' + step.labelKey)}
              </motion.p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderItem({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20, rotateX: 10 }}
      animate={{ opacity: 1, x: 0, rotateX: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 200, damping: 20 }}
      className="group relative"
      style={{ perspective: '800px' }}
    >
      <div
        className="relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          e.currentTarget.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'rotateY(0deg) rotateX(0deg)';
        }}
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{item.quantity}x</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 dark:text-white truncate">{item.name}</p>
          <div className="flex items-center gap-3 mt-1">
            {item.size && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10">
                {item.size}
              </span>
            )}
            {item.extras?.length > 0 && (
              <span className="text-xs text-gray-400 dark:text-white/40">
                +{item.extras.length} {t('orderTracking.extras')}
              </span>
            )}
          </div>
        </div>
        <motion.span
          className="text-lg font-black text-indigo-600 dark:text-indigo-400 flex-shrink-0 tabular-nums"
          key={item.price * item.quantity}
          initial={{ scale: 1.2, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          ETB {(item.price * item.quantity).toFixed(2)}
        </motion.span>
      </div>
    </motion.div>
  );
}

function RatingStars({ submitRating, rating, existingRating }) {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(rating);

  const handleClick = (stars) => {
    setSelected(stars);
    submitRating(stars);
  };

  return (
    <div className="flex gap-3 justify-center">
      {[1, 2, 3, 4, 5].map((stars) => (
        <motion.button
          key={stars}
          onClick={() => handleClick(stars)}
          onMouseEnter={() => setHovered(stars)}
          onMouseLeave={() => setHovered(0)}
          whileHover={{ scale: 1.3, y: -4 }}
          whileTap={{ scale: 0.9 }}
          className="relative"
        >
          <motion.div
            animate={{
              scale: stars <= (hovered || selected) ? 1 : 0.9,
              opacity: stars <= (hovered || selected) ? 1 : 0.3,
            }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <svg width="44" height="44" viewBox="0 0 24 24" fill={stars <= (hovered || selected) ? '#f59e0b' : 'none'} stroke={stars <= (hovered || selected) ? '#f59e0b' : 'rgba(156,163,175,0.4)'} strokeWidth="1.5">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </motion.div>
          {stars <= (hovered || selected) && (
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(245,158,11,0.3), transparent 70%)',
                borderRadius: '50%',
              }}
            />
          )}
        </motion.button>
      ))}
    </div>
  );
}

function ConfettiOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            background: `hsl(${Math.random() * 360}, 80%, 60%)`,
            left: `${Math.random() * 100}%`,
            top: -10,
          }}
          animate={{
            y: [0, typeof window !== 'undefined' ? window.innerHeight + 20 : 800],
            x: [0, (Math.random() - 0.5) * 200],
            rotate: [0, Math.random() * 720],
            opacity: [1, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 0.5,
            repeat: Infinity,
            ease: 'easeIn',
          }}
        />
      ))}
    </div>
  );
}

export default function OrderTracking() {
  const { t } = useTranslation();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [driverLocation, setDriverLocation] = useState(null);
  const [rating, setRating] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  useEffect(() => {
    fetchOrder();

    const socket = io(window.location.origin);
    socket.emit('join_order', orderId);

    socket.on('order_update', (updatedOrder) => {
      setOrder(updatedOrder);
      if (updatedOrder.status === 'ready') {
        toast.success(t('orderTracking.orderReady'), {
          duration: 6000,
          icon: '🍽️',
          style: { background: '#10b981', color: '#fff', borderRadius: '16px', padding: '16px 24px', fontWeight: 600 },
        });
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
      if (updatedOrder.status === 'on_the_way') {
        toast.success(t('orderTracking.driverOnWay'), { duration: 5000 });
      }
      if (updatedOrder.status === 'delivered') {
        toast.success(t('orderTracking.foodDelivered'), { duration: 5000 });
      }
    });

    socket.on('driver_location', (location) => {
      setDriverLocation(location);
    });

    return () => {
      socket.emit('leave_order', orderId);
      socket.disconnect();
    };
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const { data } = await axios.get(`/api/orders/${orderId}`);
      setOrder(data.data);
    } catch (error) {
      toast.error(t('orderTracking.orderNotFound'));
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async (stars) => {
    setRating(stars);
    try {
      await axios.put(`/api/orders/${order._id}/review`, { rating: stars, review: '' });
      toast.success(t('orderTracking.reviewSubmitted'), {
        duration: 3000,
        icon: '🌟',
      });
    } catch (error) {
      toast.error(t('orderTracking.reviewFailed'));
    }
  };

  const getStatusIndex = () => {
    if (!order) return 0;
    const index = statusSteps.findIndex(s => s.key === order.status);
    return index >= 0 ? index : 0;
  };

  if (loading) return <Loading />;
  if (!order) return (
    <div className="min-h-screen flex items-center justify-center relative">
      <Scene3D mouse={mouse} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center p-12"
      >
        <div className="w-24 h-24 rounded-3xl bg-red-500/10 mx-auto mb-6 flex items-center justify-center">
          <Utensils size={40} className="text-red-500 dark:text-red-400" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">{t('orderTracking.orderNotFound')}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">{t('orderTracking.orderNotFoundDesc')}</p>
        <Link to="/menu" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105">
          <ShoppingBag size={18} /> {t('orderTracking.browseMenu')}
        </Link>
      </motion.div>
    </div>
  );

  const currentIndex = getStatusIndex();
  const isDineIn = order.type === 'dine_in';
  const isDelivered = order.status === 'delivered' || order.status === 'served';
  const isReady = order.status === 'ready' || order.status === 'served';

  const dineInSteps = statusSteps.filter(s => s.key !== 'on_the_way' && s.key !== 'delivered');
  dineInSteps.push({ key: 'served', labelKey: 'served', label: 'Served', icon: PartyPopper, color: '#22c55e' });
  const dineInIndex = dineInSteps.findIndex(s => {
    if (s.key === 'served') return order.status === 'delivered' || order.status === 'served' || order.status === 'ready';
    return s.key === order.status;
  });

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Scene3D mouse={mouse} />
      {showConfetti && <ConfettiOverlay />}

      <Header />

      <main className="relative z-10 pt-28 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-12"
          >
            <motion.div
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold mb-6"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))',
                border: '1px solid rgba(99,102,241,0.2)',
                color: '#6366f1',
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkle size={12} />
              {isDineIn ? t('orderTracking.dineInExperience') : t('orderTracking.deliveryTracking')}
            </motion.div>

            <motion.h1
              className="text-5xl sm:text-7xl font-black mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
            >
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Order #{order.orderId}
              </span>
            </motion.h1>

            <motion.p
              className="text-gray-500 dark:text-gray-400 text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <TimeElapsed createdAt={order.createdAt} t={t} />
            </motion.p>

            <motion.div
              className="inline-flex items-center gap-3 mt-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            >
              <motion.div
                className="px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 text-white"
                style={{
                  background: isDelivered
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: isDelivered
                    ? '0 0 30px rgba(16,185,129,0.3)'
                    : '0 0 30px rgba(99,102,241,0.3)',
                }}
              >
                {isDelivered ? <PartyPopper size={16} /> : <Zap size={16} />}
                {isDelivered ? t('orderTracking.completed') : t('orderTracking.' + (statusSteps[currentIndex]?.labelKey || 'processing'))}
              </motion.div>
            </motion.div>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left Column - Status & Updates */}
            <div className="lg:col-span-3 space-y-6">
              {/* Status Timeline Card */}
              <motion.div
                initial={{ opacity: 0, y: 30, rotateX: 5 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{ perspective: '1000px' }}
              >
                <div
                  className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl border border-gray-200 dark:border-slate-700/50 shadow-2xl"
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                        <Timer size={20} className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('orderTracking.orderProgress')}</h2>
                    </div>
                    <motion.div
                      className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
                      style={{
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))',
                        border: '1px solid rgba(99,102,241,0.2)',
                        color: '#6366f1',
                      }}
                      animate={{ scale: [1, 1.03, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Clock size={14} />
                      <TimeElapsed createdAt={order.createdAt} t={t} />
                    </motion.div>
                  </div>

                  <StatusTimeline currentIndex={isDineIn ? dineInIndex : currentIndex} status={order.type} t={t} />
                </div>
              </motion.div>

              {/* Dine-In Table Card */}
              {isDineIn && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.6 }}
                  style={{ perspective: '1000px' }}
                >
                  <div
                    className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl border border-gray-200 dark:border-slate-700/50 shadow-2xl"
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = (e.clientX - rect.left) / rect.width - 0.5;
                      const y = (e.clientY - rect.top) / rect.height - 0.5;
                      e.currentTarget.style.transform = `rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'rotateY(0deg) rotateX(0deg)';
                    }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                    <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />

                    <div className="flex items-center gap-4 mb-6">
                      <motion.div
                        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <Utensils size={28} className="text-emerald-600 dark:text-emerald-400" />
                      </motion.div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('orderTracking.dineIn')}</h3>
                        {order.table && (
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin size={14} className="text-emerald-600 dark:text-emerald-400" />
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{t('orderTracking.table')} {order.table.tableNumber || order.table}</span>
                          </div>
                        )}
                      </div>
                      {order.guestName && (
                        <div className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                          <Phone size={14} className="text-gray-400 dark:text-white/50" />
                          <span className="text-sm text-gray-600 dark:text-white/70">{order.guestName}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: t('orderTracking.status'), value: isReady ? t('orderTracking.readyToServe') : t('orderTracking.inProgress'), color: isReady ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400' },
                        { label: t('orderTracking.items'), value: order.items?.length || 0, color: 'text-gray-900 dark:text-white' },
                        { label: t('orderTracking.total'), value: `ETB ${order.total?.toFixed(2)}`, color: 'text-indigo-600 dark:text-indigo-400' },
                        { label: t('orderTracking.payment'), value: order.type === 'dine_in' || order.type === 'takeaway' ? t('orderTracking.unpaid') : order.paymentStatus || t('orderTracking.cash'), color: order.type === 'dine_in' || order.type === 'takeaway' ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400' },
                      ].map((stat, i) => (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + i * 0.05 }}
                          className="p-3 rounded-xl bg-gray-100/50 dark:bg-white/5"
                        >
                          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{stat.label}</p>
                          <p className={`text-sm font-bold ${stat.color}`}>{stat.value}</p>
                        </motion.div>
                      ))}
                    </div>

                    {!isReady && (
                      <motion.div
                        className="mt-5 p-4 rounded-2xl flex items-center gap-4"
                        style={{
                          background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.03))',
                          border: '1px solid rgba(245,158,11,0.15)',
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <motion.div
                          className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0"
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <ChefHat size={20} className="text-amber-600 dark:text-amber-400" />
                        </motion.div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">{t('orderTracking.preparingMeal')}</p>
                            <span className="text-xs text-amber-600/60 dark:text-amber-400/60">{t('orderTracking.almostReady')}</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: 'linear-gradient(90deg, #f59e0b, #f97316)' }}
                              animate={{ width: ['30%', '80%', '30%'] }}
                              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {isReady && (
                      <motion.div
                        className="mt-5 p-4 rounded-2xl flex items-center gap-4"
                        style={{
                          background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.03))',
                          border: '1px solid rgba(16,185,129,0.15)',
                        }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                      >
                        <motion.div
                          className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0"
                          animate={{ scale: [1, 1.15, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <PartyPopper size={20} className="text-emerald-600 dark:text-emerald-400" />
                        </motion.div>
                        <div>
                          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{t('orderTracking.mealReady')}</p>
                          <p className="text-xs text-emerald-600/60 dark:text-emerald-400/60 mt-0.5">{t('orderTracking.pleaseCollect')}</p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Driver tracking for delivery */}
              {order.status === 'on_the_way' && !isDineIn && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, type: 'spring', stiffness: 100 }}
                  className="rounded-3xl overflow-hidden bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl border border-gray-200 dark:border-slate-700/50 shadow-2xl"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <motion.div
                        className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center"
                        animate={{ scale: [1, 1.08, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Navigation size={28} className="text-cyan-600 dark:text-cyan-400" />
                      </motion.div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('orderTracking.driverOnWay')}</h3>
                        {order.estimatedDeliveryTime && (
                          <p className="text-cyan-600 dark:text-cyan-400 text-sm font-semibold mt-1">
                            ~{order.estimatedDeliveryTime} {t('orderTracking.minRemaining')}
                          </p>
                        )}
                      </div>
                    </div>
                    {driverLocation && (
                      <div className="mt-4 p-4 rounded-2xl bg-gray-100/50 dark:bg-white/5">
                        <div className="flex items-center gap-3 mb-3">
                          <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <Navigation size={18} className="text-cyan-600 dark:text-cyan-400" />
                          </motion.div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{t('orderTracking.driverNearby')}</p>
                        </div>
                        <div className="h-40 rounded-2xl flex items-center justify-center relative overflow-hidden"
                          style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.1), rgba(99,102,241,0.05))' }}>
                          <motion.div
                            className="absolute w-16 h-16 bg-cyan-500/20 rounded-full"
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [0.3, 0.1, 0.3],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          <motion.div
                            className="absolute w-8 h-8 bg-cyan-400/30 rounded-full"
                            animate={{
                              scale: [1, 1.8, 1],
                              opacity: [0.2, 0.05, 0.2],
                            }}
                            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                          />
                          <Navigation size={32} className="text-cyan-600 dark:text-cyan-400 relative z-10" />
                          <p className="absolute bottom-4 text-xs text-gray-400 dark:text-white/40">{t('orderTracking.liveTracking')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Delivery Address */}
              {order.deliveryAddress && !isDineIn && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="rounded-2xl p-5 flex items-center gap-4 bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl border border-gray-200 dark:border-slate-700/50 shadow-2xl"
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <MapPin size={22} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{t('orderTracking.deliveryAddress')}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {order.deliveryAddress.address}, {order.deliveryAddress.city}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Column - Order Items & Summary */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items Card */}
              <motion.div
                initial={{ opacity: 0, y: 30, rotateY: -5 }}
                animate={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-3xl overflow-hidden bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl border border-gray-200 dark:border-slate-700/50 shadow-2xl"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                        <ShoppingBag size={20} className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('orderTracking.orderItems')}</h2>
                    </div>
                    <motion.span
                      className="px-3 py-1.5 rounded-xl text-xs font-bold"
                      style={{
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))',
                        color: '#6366f1',
                      }}
                      key={order.items?.length}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.3 }}
                    >
                      {order.items?.length} {t('orderTracking.items').toLowerCase()}
                    </motion.span>
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                    {order.items?.map((item, index) => (
                      <OrderItem key={index} item={item} index={index} />
                    ))}
                  </div>

                  {/* Price Breakdown */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 pt-6 space-y-3"
                    style={{ borderTop: '1px solid rgba(156,163,175,0.2)' }}
                  >
                    <div className="flex justify-between text-sm py-1">
                      <span className="text-gray-400 dark:text-gray-500">{t('orderTracking.subtotal')}</span>
                      <span className="text-gray-900 dark:text-white font-medium">{order.subtotal?.toFixed(2)} ETB</span>
                    </div>
                    {order.deliveryFee > 0 && (
                      <div className="flex justify-between text-sm py-1">
                        <span className="text-gray-400 dark:text-gray-500">{t('orderTracking.deliveryFee')}</span>
                        <span className="text-gray-900 dark:text-white font-medium">{order.deliveryFee?.toFixed(2)} ETB</span>
                      </div>
                    )}
                    {order.discount > 0 && (
                      <div className="flex justify-between text-sm py-1">
                        <span className="text-emerald-600 dark:text-emerald-400">{t('orderTracking.discount')}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">-{order.discount?.toFixed(2)} ETB</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm py-1">
                      <span className="text-gray-400 dark:text-gray-500">{t('orderTracking.tax')}</span>
                      <span className="text-gray-900 dark:text-white font-medium">{order.tax?.toFixed(2)} ETB</span>
                    </div>

                    <motion.div
                      className="flex justify-between pt-4"
                      style={{ borderTop: '1px solid rgba(156,163,175,0.2)' }}
                    >
                      <span className="text-lg font-bold text-gray-900 dark:text-white">{t('orderTracking.total')}</span>
                      <motion.span
                        className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent"
                        key={order.total}
                        initial={{ scale: 1.2, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 1 }}
                      >
                        {order.total?.toFixed(2)} ETB
                      </motion.span>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Rating */}
              {isDelivered && !order.rating && rating === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
                  className="rounded-3xl p-6 text-center bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl border border-gray-200 dark:border-slate-700/50 shadow-2xl"
                >
                  <motion.div
                    className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-4"
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 1.5, delay: 0.8 }}
                  >
                    <Star size={28} className="text-amber-600 dark:text-amber-400" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('orderTracking.rateYourExperience')}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('orderTracking.howWasMeal')}</p>
                  <RatingStars submitRating={submitRating} rating={rating} existingRating={order.rating} />
                </motion.div>
              )}

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex gap-3"
              >
                <Link
                  to="/menu"
                  className="flex-1 py-4 rounded-2xl text-center font-bold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))',
                    border: '1px solid rgba(99,102,241,0.2)',
                    color: '#6366f1',
                  }}
                >
                  {t('orderTracking.orderMore')}
                </Link>
                <Link
                  to="/profile?tab=order-status"
                  className="flex-1 py-4 rounded-2xl text-center font-bold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#fff',
                    boxShadow: '0 0 30px rgba(99,102,241,0.3)',
                  }}
                >
                  {t('orderTracking.myOrders')}
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
