import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  motion, useMotionValue, useSpring, useTransform, AnimatePresence,
  useScroll, useVelocity, useAnimation
} from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import Navbar from '../components/Navbar';
import Footer from '../components/common/Footer';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
   CalendarDays, Users, ChevronLeft, ChevronRight, Heart, Share2,
   Star, MapPin, Clock, Wifi, Tv, Wind, Coffee, Bath, Utensils,
   Shield, Sparkles, ArrowRight, CheckCircle, Minus, Plus,
   Camera, Sun, Monitor, Music, Phone, Gem, Quote, Layers,
   ChevronDown, Award, CheckSquare, Loader2, Sparkle, ScrollText,
   Maximize2, Minimize2, Info, BadgeCheck, Flame, Zap, CircleDot,
   Wine, ChefHat, Cake, Bell, TreePine, Palette, PartyPopper,
   Instagram, Facebook, Twitter, ExternalLink, BookOpen, GlassWater,
   RotateCcw, Eye, X, Bed, Sofa, Trees, Waves, UtensilsCrossed,
   Dumbbell, Car, Shirt, Lamp, Refrigerator, Armchair,
   SunDim, Fan, DoorOpen, Library, Soup, CreditCard, Building2, Smartphone, Landmark, Upload
 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

const DEFAULT_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80', alt: 'Premium Dining Hall', label: 'Grand Dining Hall' },
  { src: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80', alt: 'Private Dining Room', label: 'Private Dining Suite' },
  { src: 'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=1200&q=80', alt: 'Luxury Lounge', label: 'Executive Lounge' },
  { src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80', alt: 'VIP Section', label: 'VIP Section' },
  { src: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80', alt: 'Rooftop Terrace', label: 'Rooftop Terrace' },
];

const DEFAULT_ELEMENT_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1590490359683-658d3d23f972?w=400&q=80', alt: 'Luxury Bedroom', label: 'Master Bedroom' },
  { src: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80', alt: 'Modern Bathroom', label: 'En-suite Bathroom' },
  { src: 'https://images.unsplash.com/photo-1602872030216-3af72d4d59d9?w=400&q=80', alt: 'Living Area', label: 'Living Lounge' },
  { src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80', alt: 'Dining Area', label: 'Private Dining' },
  { src: 'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=400&q=80', alt: 'Scenic View', label: 'City Panorama' },
  { src: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80', alt: 'Kitchenette', label: 'Mini Kitchen' },
];

const DEFAULT_REVIEWS = [
  { name: 'Sarah M.', avatar: 'SM', rating: 5, date: '2 weeks ago', text: 'Absolutely breathtaking experience. The ambiance, the service, the cuisine — every detail was perfection.' },
  { name: 'James K.', avatar: 'JK', rating: 5, date: '1 month ago', text: 'The premium dining experience was world-class. Our personal butler anticipated every need.' },
  { name: 'Elena R.', avatar: 'ER', rating: 4, date: '3 weeks ago', text: 'Exceptional service and stunning decor. The rooftop terrace offers magnificent city views at sunset.' },
  { name: 'Michael T.', avatar: 'MT', rating: 5, date: '5 days ago', text: "From the moment we arrived, we felt like royalty. Can't wait to return." },
  { name: 'Aisha K.', avatar: 'AK', rating: 5, date: '1 week ago', text: 'The culinary journey was extraordinary. Each dish told a story of tradition and innovation.' },
];

const DEFAULT_AMENITIES = [
  { icon: Wifi, label: 'Free High-Speed Wi-Fi' },
  { icon: Tv, label: '65" OLED Smart TV' },
  { icon: Wind, label: 'Premium Climate Control' },
  { icon: Coffee, label: 'Espresso & Tea Bar' },
  { icon: Bath, label: 'Luxury En-suite Bathroom' },
  { icon: Utensils, label: '24/7 Room Service' },
  { icon: Shield, label: 'Personal Butler Service' },
  { icon: Monitor, label: 'Dedicated Workstation' },
  { icon: Music, label: 'Sonic Sound System' },
  { icon: Sun, label: 'Panoramic City Views' },
];

const AMENITY_ICON_MAP = {
  'wifi': Wifi, 'tv': Tv, 'ac': Wind, 'coffee': Coffee, 'bath': Bath,
  'utensils': Utensils, 'butler': Shield, 'desk': Monitor, 'music': Music,
  'view': Sun, 'bed': Bed, 'sofa': Sofa, 'garden': Trees, 'pool': Waves,
  'gym': Dumbbell, 'parking': Car, 'laundry': Shirt, 'lamp': Lamp,
  'fridge': Refrigerator, 'armchair': Armchair, 'fan': Fan, 'door': DoorOpen,
  'library': Library, 'kitchen': Soup, 'dining': UtensilsCrossed,
};

function getAmenityIcon(label) {
  const key = label.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const [k, Icon] of Object.entries(AMENITY_ICON_MAP)) {
    if (key.includes(k)) return Icon;
  }
  return Gem;
}

function useCountUp(end, duration = 2000, start = 0) {
  const [count, setCount] = useState(start);
  const ref = useRef(null);

  useEffect(() => {
    let startTime = null;
    let raf = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(start + (end - start) * ease));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startTime = null;
          raf = requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [end, duration, start]);

  return [count, ref];
}

function NoiseOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[60] opacity-[0.015]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '256px 256px',
      }}
    />
  );
}

function MorphingBlob({ color, size, top, left, delay, duration, blur = 80 }) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: size, height: size,
        top, left,
        borderRadius: '50%',
        background: `radial-gradient(circle at 30% 30%, ${color}, transparent 70%)`,
        filter: `blur(${blur}px)`,
        willChange: 'transform',
      }}
      animate={{
        x: [0, 60, -40, 30, 0],
        y: [0, -50, 30, -40, 0],
        scale: [1, 1.2, 0.9, 1.1, 1],
        rotate: [0, 45, -30, 15, 0],
        borderRadius: ['60% 40% 30% 70% / 60% 30% 70% 40%', '30% 60% 70% 40% / 50% 60% 30% 60%', '70% 30% 50% 50% / 40% 50% 50% 60%', '40% 60% 30% 70% / 50% 40% 60% 50%', '60% 40% 30% 70% / 60% 30% 70% 40%'],
      }}
      transition={{
        duration: duration || 14,
        delay: delay || 0,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

function ParticleField({ count = 30 }) {
  const particles = useMemo(() =>
    Array.from({ length: count }).map((_, i) => ({
      id: i,
      size: 1.5 + Math.random() * 4,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      color: [
        'rgba(99,102,241,0.6)', 'rgba(168,85,247,0.5)',
        'rgba(236,72,153,0.4)', 'rgba(59,130,246,0.5)',
        'rgba(16,185,129,0.3)', 'rgba(245,158,11,0.3)',
      ][i % 6],
      duration: 5 + Math.random() * 8,
      delay: Math.random() * 6,
      yRange: -(20 + Math.random() * 40),
    })), [count]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size, height: p.size,
            left: p.left, top: p.top,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
          animate={{
            y: [0, p.yRange, 0],
            x: [0, (Math.random() - 0.5) * 25, 0],
            opacity: [0, 0.9, 0],
            scale: [0, 1.8, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

function TiltCard({ children, className = '', intensity = 8, glow = true }) {
  const ref = useRef(null);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(y, [0, 1], [intensity, -intensity]), { damping: 25, stiffness: 150 });
  const rotateY = useSpring(useTransform(x, [0, 1], [-intensity, intensity]), { damping: 25, stiffness: 150 });
  const glowX = useSpring(useTransform(x, [0, 1], [0, 100]), { damping: 20, stiffness: 100 });
  const glowY = useSpring(useTransform(y, [0, 1], [0, 100]), { damping: 20, stiffness: 100 });

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0.5);
    y.set(0.5);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, perspective: 1000 }}
      className={`relative ${className}`}
    >
      {glow && (
        <motion.div
          className="absolute -inset-[1px] rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(99,102,241,0.2) 0%, rgba(168,85,247,0.1) 30%, transparent 70%)`,
          }}
        />
      )}
      {children}
    </motion.div>
  );
}

function MagneticButton({ children, className = '', ...props }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { damping: 15, stiffness: 200 });
  const springY = useSpring(y, { damping: 15, stiffness: 200 });

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dist = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2));
    const maxDist = 150;
    const strength = Math.max(0, 1 - dist / maxDist) * 12;
    x.set((e.clientX - centerX) / rect.width * strength);
    y.set((e.clientY - centerY) / rect.height * strength);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

function Ripple({ show, onComplete }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          initial={{ width: 0, height: 0, opacity: 0.6 }}
          animate={{ width: 300, height: 300, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          onAnimationComplete={onComplete}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/30 pointer-events-none"
          style={{ left: '50%', top: '50%' }}
        />
      )}
    </AnimatePresence>
  );
}

function AnimatedNumber({ value, className = '' }) {
  return (
    <motion.span
      key={value}
      initial={{ scale: 1.5, opacity: 0, y: -8 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.5, opacity: 0, y: 8 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={className}
    >
      {value}
    </motion.span>
  );
}

function AnimatedGradientBorder({ children, className = '', active = true }) {
  return (
    <div className={`relative ${className}`}>
      {active && (
        <motion.div
          className="absolute -inset-[1.5px] rounded-[inherit] opacity-75 pointer-events-none"
          style={{
            background: 'conic-gradient(from 0deg, #6366f1, #8b5cf6, #ec4899, #6366f1)',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMaskComposite: 'xor',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
      )}
      {children}
    </div>
  );
}

function BookingSuccessModal({ show, onClose, bookingDetails }) {
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    if (show) {
      const particles = Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10,
        color: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#a855f7'][i % 7],
        size: 4 + Math.random() * 8,
        rotation: Math.random() * 720,
        duration: 2 + Math.random() * 3,
        delay: Math.random() * 0.5,
        shape: i % 3 === 0 ? 'circle' : i % 3 === 1 ? 'square' : 'star',
      }));
      setConfetti(particles);
    } else {
      setConfetti([]);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {confetti.map((c) => (
              <motion.div
                key={c.id}
                className="absolute"
                style={{
                  left: `${c.x}%`, top: `${c.y}%`,
                  width: c.size, height: c.shape === 'circle' ? c.size : c.size * 0.7,
                  background: c.color,
                  borderRadius: c.shape === 'circle' ? '50%' : '2px',
                  opacity: 0,
                }}
                animate={{
                  y: [0, 400 + Math.random() * 300],
                  x: [0, (Math.random() - 0.5) * 200],
                  opacity: [0, 1, 1, 0],
                  rotate: [0, c.rotation],
                  scale: [1, 0.5 + Math.random() * 0.5],
                }}
                transition={{
                  duration: c.duration,
                  delay: c.delay,
                  repeat: Infinity,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white/95 backdrop-blur-2xl p-8 shadow-2xl dark:border-indigo-700/30 dark:bg-slate-900/95"
          >
            <div className="absolute -inset-40 bg-gradient-conic from-indigo-500/10 via-violet-500/10 to-pink-500/10 blur-3xl" />
            <MorphingBlob color="rgba(99,102,241,0.12)" size={220} top="-25%" left="-15%" delay={0} duration={10} blur={60} />
            <MorphingBlob color="rgba(168,85,247,0.08)" size={180} bottom="-15%" right="-10%" delay={3} duration={12} blur={60} />

            <div className="relative text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 shadow-2xl shadow-indigo-500/30"
              >
                <CheckCircle className="h-10 w-10 text-white" />
                <motion.div
                  className="absolute -inset-2 rounded-full border-2 border-indigo-400/30"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute -inset-4 rounded-full border border-indigo-400/10"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">Reservation Confirmed!</h3>
                <p className="mt-1.5 text-sm text-indigo-400/60 dark:text-indigo-300/50">Your premium experience has been secured</p>
              </motion.div>

              {bookingDetails && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 space-y-3 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-violet-50/50 to-transparent p-5 dark:from-indigo-900/20 dark:via-violet-900/10"
                >
                  {bookingDetails.checkIn && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-indigo-400/60 dark:text-indigo-300/40">Check In</span>
                      <span className="font-bold text-gray-900 dark:text-white">{bookingDetails.checkIn}</span>
                    </div>
                  )}
                  {bookingDetails.checkOut && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-indigo-400/60 dark:text-indigo-300/40">Check Out</span>
                      <span className="font-bold text-gray-900 dark:text-white">{bookingDetails.checkOut}</span>
                    </div>
                  )}
                  {bookingDetails.guests && (
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-indigo-200/30 dark:border-indigo-700/20">
                      <span className="text-indigo-400/60 dark:text-indigo-300/40">Total Guests</span>
                      <span className="font-bold text-gray-900 dark:text-white">{bookingDetails.guests}</span>
                    </div>
                  )}
                </motion.div>
              )}

              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <MagneticButton
                  onClick={onClose}
                  className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 px-6 py-3.5 font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
                  />
                  <span className="relative z-10">Done</span>
                </MagneticButton>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ImageLightbox({ images, initialIndex, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const lightboxImages = images?.length ? images : DEFAULT_IMAGES;

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
  }, [lightboxImages.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % lightboxImages.length);
  }, [lightboxImages.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, goToPrev, goToNext]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); goToPrev(); }}
          className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); goToNext(); }}
          className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="relative max-h-screen max-w-6xl p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={lightboxImages[currentIndex].src}
            alt={lightboxImages[currentIndex].alt}
            className="max-h-[85vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
          />
          <div className="mt-4 text-center">
            <p className="text-white font-semibold text-lg">{lightboxImages[currentIndex].label || lightboxImages[currentIndex].alt}</p>
            <p className="text-white/50 text-sm mt-1">{currentIndex + 1} / {lightboxImages.length}</p>
          </div>
        </motion.div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {lightboxImages.map((_, i) => (
            <motion.button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function HeroGallery({ images, roomName, rd, isRoomBooking }) {
  const galleryImages = images?.length ? images : DEFAULT_IMAGES;
  const [activeIndex, setActiveIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const displayedName = isRoomBooking ? (rd.name || roomName) : 'Grand Dining Hall';
  const displayedPrice = isRoomBooking ? `$${rd.price || '0'}` : 'ETB 3,500';
  const displayedCapacity = isRoomBooking ? (rd.capacity || '6') : '6';

  return (
    <>
      {showLightbox && (
        <ImageLightbox
          images={galleryImages}
          initialIndex={activeIndex}
          onClose={() => setShowLightbox(false)}
        />
      )}

      <div className="relative w-full overflow-hidden rounded-2xl bg-gray-950 shadow-2xl cursor-zoom-in"
        onClick={() => setShowLightbox(true)}
      >
         <div className="aspect-[4/3] md:aspect-[5/3] lg:aspect-[16/9] w-full h-80 md:h-96 lg:h-[500px]">
          <Swiper
            modules={[Autoplay, EffectCoverflow]}
            effect="coverflow"
            coverflowEffect={{ rotate: 0, stretch: 0, depth: 150, modifier: 2.5, slideShadows: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            loop
            speed={800}
            onSlideChange={(s) => setActiveIndex(s.realIndex)}
            className="h-full w-full"
          >
            {galleryImages.map((img, i) => (
              <SwiperSlide key={i}>
                <div className="relative h-full w-full">
                  <img src={img.src} alt={img.alt} className="h-full w-full object-cover" loading={i === 0 ? 'eager' : 'lazy'} draggable={false} />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 40%, rgba(79,70,229,0.2) 65%, transparent 100%)' }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <ParticleField count={30} />
        <div className="absolute inset-0 pointer-events-none">
          <MorphingBlob color="rgba(99,102,241,0.12)" size={300} top="-20%" left="-10%" delay={0} duration={16} blur={100} />
          <MorphingBlob color="rgba(168,85,247,0.08)" size={220} bottom="-20%" right="-10%" delay={4} duration={18} blur={80} />
        </div>

        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="absolute left-4 top-4 z-20 flex items-center gap-2 pointer-events-auto">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="overflow-hidden rounded-full border border-white/20 bg-white/12 px-3 py-1.5 backdrop-blur-xl shadow-lg"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">{isRoomBooking ? 'Premium Room' : 'Premium Dining'}</span>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
              className="overflow-hidden rounded-full border border-indigo-400/30 bg-gradient-to-r from-indigo-500/50 to-violet-500/40 px-3 py-1.5 backdrop-blur-xl shadow-lg"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-white">Featured</span>
            </motion.div>
          </div>

          <div className="absolute right-4 top-4 z-20 flex gap-2 pointer-events-auto">
            <motion.button whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.85 }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-lg transition-all hover:bg-white/25"
            ><Heart className="h-4 w-4" /></motion.button>
            <motion.button whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.85 }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-lg transition-all hover:bg-white/25"
            ><Share2 className="h-4 w-4" /></motion.button>
          </div>

          <div className="absolute bottom-4 left-4 right-4 z-20">
            <motion.div key={activeIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-white drop-shadow-lg">{displayedName}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-white/70">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-indigo-300" /> City View</span>
                <span className="flex items-center gap-1"><Users className="h-3 w-3 text-indigo-300" /> Up to {displayedCapacity}</span>
                <span className="flex items-center gap-1"><Sparkles className="h-3 w-3 text-indigo-300" /> {displayedPrice}</span>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-md border border-white/10 pointer-events-none">
          <Maximize2 className="h-3 w-3 text-white/70" />
          <span className="text-[10px] font-medium text-white/90">{activeIndex + 1}<span className="text-white/40">/{galleryImages.length}</span></span>
          <span className="text-[9px] text-white/50 ml-1">Click to expand</span>
        </div>

        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 pointer-events-auto">
          {Array.from({ length: galleryImages.length }).map((_, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
              className={`rounded-full transition-all duration-500 ${i === activeIndex ? 'h-1.5 w-6 bg-white shadow-md shadow-white/30' : 'h-1.5 w-1.5 bg-white/30 hover:bg-white/60'}`}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function ElementImages({ images }) {
  const elementImages = images?.length ? images : DEFAULT_ELEMENT_IMAGES;
  const [selected, setSelected] = useState(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-indigo-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">Room Details</span>
        </div>
        <span className="text-[10px] text-indigo-400/50">{elementImages.length} photos</span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
        {elementImages.map((img, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ y: -3, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelected(selected === i ? null : i)}
            className="group relative overflow-hidden rounded-xl border border-white/20 bg-white/40 shadow-sm transition-all hover:border-indigo-300/40 hover:shadow-lg dark:border-white/[0.06] dark:bg-slate-900/40"
          >
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={img.src}
                alt={img.alt}
                className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="p-1.5">
              <p className="text-[10px] font-semibold text-gray-900 dark:text-white truncate">{img.label || img.alt}</p>
            </div>
            {selected === i && (
              <motion.div layoutId="elementSelected" className="absolute inset-0 border-2 border-indigo-400 rounded-xl pointer-events-none" />
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selected !== null && elementImages[selected] && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-xl"
          >
            <div className="relative overflow-hidden rounded-xl border border-indigo-200/40 dark:border-indigo-700/30">
              <img src={elementImages[selected].src} alt={elementImages[selected].alt} className="w-full h-48 md:h-64 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-sm font-bold text-white">{elementImages[selected].label}</p>
                <p className="text-xs text-white/70">{elementImages[selected].alt}</p>
              </div>
              <button onClick={() => setSelected(null)}
                className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 backdrop-blur-md text-white/80 hover:text-white"
              ><X className="h-3.5 w-3.5" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RoomInfoCard({ rd, roomName, isRoomBooking }) {
  const price = isRoomBooking ? (rd.price ? `$${rd.price}` : 'ETB 3,500') : 'ETB 3,500';
  const name = isRoomBooking ? (rd.name || roomName) : 'Grand Dining Hall';
  const desc = isRoomBooking
    ? rd.description || 'Experience unparalleled luxury in this meticulously designed space.'
    : 'Step into our magnificent Grand Dining Hall, where contemporary elegance meets timeless sophistication.';
  const capacity = isRoomBooking ? (rd.capacity || '6') : '6';
  const badge = isRoomBooking ? (rd.capacity ? `Up to ${rd.capacity} Guests` : 'Premium Room') : 'Premium Dining';

  const [countCapacity] = useCountUp(parseInt(capacity) || 6, 1500);
  const [countRating] = useCountUp(49, 1200);
  const [countReviews] = useCountUp(89, 1400);

  return (
    <div className="rounded-2xl border border-white/30 bg-white/60 p-5 backdrop-blur-2xl shadow-lg dark:border-white/[0.06] dark:bg-slate-900/60 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="rounded-full border border-indigo-200/50 bg-gradient-to-r from-indigo-100 to-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:border-indigo-700/30 dark:from-indigo-900/40 dark:to-indigo-900/20 dark:text-indigo-300">
              {badge}
            </span>
            <span className="rounded-full border border-violet-200/50 bg-gradient-to-r from-violet-50 to-violet-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:border-violet-700/30 dark:from-violet-900/20 dark:to-violet-900/10 dark:text-violet-400">
              Featured
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">{name}</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-indigo-300/70">{desc}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] uppercase tracking-wider text-indigo-400/40 dark:text-indigo-300/35">Starting From</p>
          <p className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 dark:from-indigo-400 dark:via-violet-400 dark:to-pink-400">
            {price}
          </p>
          <p className="text-[10px] text-indigo-400/35 dark:text-indigo-300/35">{isRoomBooking ? '/ night' : 'per person'}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-white/20 pt-4 dark:border-white/[0.04]">
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className={`h-3.5 w-3.5 ${s <= 4 ? 'fill-indigo-400 text-indigo-400 drop-shadow-sm' : 'text-indigo-200 dark:text-indigo-700'}`} />
          ))}
          <span className="ml-1 text-sm font-bold text-indigo-700 dark:text-indigo-300">{(countRating / 10).toFixed(1)}</span>
          <span className="text-xs text-indigo-400/40 dark:text-indigo-300/35">({countReviews} reviews)</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-indigo-400 dark:text-indigo-300/70">
          <Users className="h-4 w-4" />
          <span>Up to <span className="font-bold text-indigo-600 dark:text-indigo-300">{countCapacity}</span> guests</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-indigo-400 dark:text-indigo-300/70">
          <MapPin className="h-4 w-4" /><span>City View</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-indigo-400 dark:text-indigo-300/70">
          <Clock className="h-4 w-4" /><span>Open 24/7</span>
        </div>
      </div>
    </div>
  );
}

function AmenitiesGrid({ amenities }) {
  const [showAll, setShowAll] = useState(false);
  const raw = amenities?.length ? amenities : DEFAULT_AMENITIES;
  const items = raw.map((a) => (typeof a === 'string' ? { label: a } : a));
  const visible = showAll ? items : items.slice(0, 6);

  return (
    <div className="rounded-2xl border border-white/30 bg-white/60 p-5 backdrop-blur-2xl shadow-lg dark:border-white/[0.06] dark:bg-slate-900/60 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-indigo-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">Amenities & Services</span>
        </div>
        {items.length > 6 && (
          <button onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-1 text-[10px] font-semibold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
          >
            {showAll ? 'Less' : `+${items.length - 6}`}
            <ChevronDown className={`h-3 w-3 transition-transform ${showAll ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <AnimatePresence mode="popLayout">
          {visible.map((a, idx) => {
            const Icon = getAmenityIcon(a.label);
            return (
              <motion.div
                key={a.label || idx}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ delay: idx * 0.03, type: 'spring', stiffness: 200, damping: 22 }}
                whileHover={{ y: -2, scale: 1.02 }}
                className="group flex items-center gap-2.5 rounded-xl border border-white/20 bg-white/40 p-2.5 backdrop-blur-sm transition-all hover:border-indigo-300/30 hover:shadow-md dark:border-white/[0.04] dark:bg-slate-900/40 dark:hover:border-indigo-500/20"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/10 to-violet-500/10 group-hover:from-indigo-500/20 group-hover:to-violet-500/20 transition-all">
                  <Icon className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                </div>
                <span className="text-[11px] font-medium text-gray-700 dark:text-indigo-300 leading-tight">{a.label}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

function GuestReviews({ reviews }) {
  const reviewData = reviews?.length ? reviews : DEFAULT_REVIEWS;
  return (
    <section className="relative overflow-hidden py-16">
      <MorphingBlob color="rgba(99,102,241,0.04)" size={350} top="-15%" left="-10%" delay={0} duration={16} blur={100} />
      <MorphingBlob color="rgba(236,72,153,0.03)" size={280} bottom="-15%" right="-10%" delay={5} duration={14} blur={100} />
      <div className="relative">
        <motion.div initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="mb-10 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 dark:bg-indigo-900/30 mb-3">
            <Star className="h-3 w-3 fill-indigo-500 text-indigo-500 dark:fill-indigo-300 dark:text-indigo-300" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">Testimonials</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">What Our Guests Say</h2>
          <p className="mt-1.5 text-sm text-indigo-400/50 dark:text-indigo-300/45">Real experiences from our valued guests</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {reviewData.map((review, i) => (
              <motion.div key={review.name + i} layout
                initial={{ opacity: 0, y: 30, scale: 0.92 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.07, type: 'spring', stiffness: 180, damping: 22 }}
                whileHover={{ y: -6 }}
              >
                <TiltCard intensity={5} glow={false}>
                  <div className="group relative h-full overflow-hidden rounded-2xl border border-white/30 bg-white/60 p-5 backdrop-blur-2xl shadow-md transition-all hover:border-indigo-300/30 hover:shadow-xl hover:shadow-indigo-500/10 dark:border-white/[0.06] dark:bg-slate-900/60 dark:hover:border-indigo-500/20">
                    <div className="absolute -right-3 -top-3 text-6xl font-black text-indigo-100/60 dark:text-indigo-800/30 select-none">&ldquo;</div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <motion.div whileHover={{ scale: 1.15 }}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 via-violet-500 to-pink-500 text-sm font-bold text-white shadow-lg shadow-indigo-500/20"
                          >{review.avatar}</motion.div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{review.name}</p>
                            <p className="text-[10px] text-indigo-400/40 dark:text-indigo-300/35">{review.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <motion.div key={s} initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
                              transition={{ delay: 0.3 + s * 0.05, type: 'spring', stiffness: 300 }}
                            >
                              <Star className={`h-3 w-3 ${s <= review.rating ? 'fill-indigo-400 text-indigo-400 drop-shadow-sm' : 'text-indigo-200 dark:text-indigo-700'}`} />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed text-gray-600 italic dark:text-indigo-300/55">&ldquo;{review.text}&rdquo;</p>
                      <div className="mt-3 flex items-center gap-1">
                        {Array.from({ length: review.rating }).map((_, s) => (
                          <motion.div key={s}
                            className="h-1 w-5 rounded-full bg-gradient-to-r from-indigo-400 to-violet-500"
                            initial={{ width: 0 }} whileInView={{ width: 20 }} viewport={{ once: true }}
                            transition={{ delay: 0.5 + s * 0.05, duration: 0.3 }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function SimilarExperiences({ rooms, currentRoomId }) {
  const navigate = useNavigate();
  const displayRooms = useMemo(() => {
    if (!rooms?.length) return [];
    return rooms.filter((r) => r._id !== currentRoomId && r.isActive !== false).slice(0, 4);
  }, [rooms, currentRoomId]);

  if (!displayRooms.length) return null;

  return (
    <section className="relative overflow-hidden py-16">
      <MorphingBlob color="rgba(168,85,247,0.04)" size={320} top="-15%" right="-10%" delay={2} duration={16} blur={100} />
      <MorphingBlob color="rgba(59,130,246,0.03)" size={260} bottom="-15%" left="-10%" delay={7} duration={14} blur={100} />
      <div className="relative">
        <motion.div initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="mb-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 dark:bg-indigo-900/30 mb-3">
            <Zap className="h-3 w-3 text-indigo-500 dark:text-indigo-300" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">Curated For You</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Similar Experiences</h2>
          <p className="mt-1.5 text-sm text-indigo-400/50 dark:text-indigo-300/45">Discover more premium offerings</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <AnimatePresence mode="popLayout">
            {displayRooms.map((room, i) => {
              const d = room.data || {};
              return (
                <motion.div key={room._id} layout
                  initial={{ opacity: 0, y: 30, scale: 0.92 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85, y: -25 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: i * 0.07, type: 'spring', stiffness: 180, damping: 22 }}
                >
                  <TiltCard intensity={6}>
                    <motion.div whileHover={{ y: -6 }}
                      className="group overflow-hidden rounded-2xl border border-white/30 bg-white/60 backdrop-blur-2xl shadow-sm transition-all hover:border-indigo-300/30 hover:shadow-xl hover:shadow-indigo-500/15 dark:border-white/[0.06] dark:bg-slate-900/60 dark:hover:border-indigo-500/20"
                    >
                      <div className="relative h-40 overflow-hidden">
                        <img src={d.image} alt={d.name} className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110" draggable={false} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                        <div className="absolute left-3 top-3 flex gap-2">
                          <span className="overflow-hidden rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider shadow-lg bg-gradient-to-r from-indigo-500/90 to-violet-500/90 text-white">
                            {d.featured ? 'Featured' : 'Premium'}
                          </span>
                        </div>
                        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 backdrop-blur-md border border-white/10">
                          <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                          <span className="text-[9px] font-bold text-white">{(4 + (i % 5) * 0.2).toFixed(1)}</span>
                        </div>
                        <div className="absolute bottom-3 left-3">
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold backdrop-blur-md border bg-emerald-500/30 border-emerald-400/30 text-emerald-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                            Available
                          </span>
                        </div>
                      </div>
                      <div className="p-3.5">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">{d.name}</h4>
                        <p className="mb-2 text-[11px] text-indigo-400/50 dark:text-indigo-300/45">{d.capacity ? `Up to ${d.capacity} Guests` : 'Premium Room'}</p>
                        <div className="flex flex-wrap gap-1 mb-2.5">
                          {(d.amenities || []).slice(0, 3).map((a) => (
                            <span key={a} className="rounded-md bg-gradient-to-r from-indigo-50 to-violet-50 px-2 py-0.5 text-[9px] font-medium text-indigo-500 dark:from-indigo-900/30 dark:to-violet-900/30 dark:text-indigo-300">{a}</span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-white/10 dark:border-white/[0.04]">
                          <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">{d.price || 'Contact Us'}</span>
                          <button
                            onClick={() => navigate('/reserve', { state: { roomName: d.name, roomId: room._id } })}
                            className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-3.5 py-1.5 text-[9px] font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:shadow-xl hover:shadow-indigo-500/30"
                          >
                            Book Now <ArrowRight className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </TiltCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function ReservationFormSidebar({ roomData, roomName, roomId, contentType, onSuccess }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });
  const [alreadyBooked, setAlreadyBooked] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [ripple, setRipple] = useState(false);
   const [availability, setAvailability] = useState({ checking: false, available: true, message: '', conflicts: [] });
   const [bookedDates, setBookedDates] = useState([]);
   const [paymentMethod, setPaymentMethod] = useState('');
   const [selectedBank, setSelectedBank] = useState('');
   const [transactionRef, setTransactionRef] = useState('');
   const [paymentProof, setPaymentProof] = useState(null);
   const [paymentProofName, setPaymentProofName] = useState('');

   const BANK_INFO = {
     cbe: { name: 'Commercial Bank of Ethiopia (CBE)', account: '1000012345678', accountName: 'Nile Food Hotel' },
     awash: { name: 'Awash Bank', account: '0123456789012', accountName: 'Nile Food Hotel' },
     abyssinia: { name: 'Abyssinia Bank', account: '2000098765432', accountName: 'Nile Food Hotel' },
     coop: { name: 'Cooperative Bank of Oromia (Coop)', account: '3000011223344', accountName: 'Nile Food Hotel' },
     siinqee: { name: 'Siinqee Bank', account: '4000055667788', accountName: 'Nile Food Hotel' }
   };

   const TELEBIRR_INFO = {
     phoneNumber: '+251 91 234 5678',
     accountName: 'Nile Food Hotel',
     shortCode: '123456'
   };

  useEffect(() => {
    if (roomId) {
      axios.get(`${API_BASE}/api/reservations/availability/room/${roomId}`)
        .then((res) => {
          setBookedDates(res.data.data?.bookedDates || []);
        })
        .catch(() => {});
    }
  }, [roomId]);

   useEffect(() => {
     if (roomId && checkIn) {
       const checkAvailability = async () => {
         try {
           const params = new URLSearchParams({ roomId, checkIn });
           if (checkOut) params.append('checkOut', checkOut);
           const res = await axios.get(`${API_BASE}/api/reservations/availability/check?${params.toString()}`);
           const data = res.data?.data || {};
           setAvailability({
             checking: false,
             available: data.available !== false,
             message: data.message || '',
             conflicts: data.conflicts || []
           });
         } catch (err) {
           setAvailability({ checking: false, available: true, message: '', conflicts: [] });
         }
       };

       const timer = setTimeout(checkAvailability, 500);
       return () => clearTimeout(timer);
     }
   }, [roomId, checkIn, checkOut]);

  useEffect(() => {
    if (user?.email) {
      axios.get(`${API_BASE}/api/reservations/my`)
        .then((res) => {
          const bookings = res.data.data || [];
          const today = new Date(); today.setHours(0, 0, 0, 0);
          setAlreadyBooked(bookings.some((r) => r.status === 'confirmed' && r.paymentMethod && r.paymentMethod !== 'pay_hotel' && r.date && new Date(r.date) >= today));
        })
        .catch(() => {});
    }
  }, [user]);

  const validate = () => {
    const errs = {};
    if (!checkIn) errs.checkIn = 'Required';
    if (!checkOut) errs.checkOut = 'Required';
    if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) errs.checkOut = 'Must be after check-in';
    if (!availability.available && !availability.checking) errs.availability = 'Room is not available for these dates';
    if (!form.name.trim()) errs.name = 'Required';
    if (!form.email.trim()) errs.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid';
    if (!form.phone.trim()) errs.phone = 'Required';
    else if (!/^[\d\s+\-()]{7,}$/.test(form.phone)) errs.phone = 'Invalid';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

   const handleSubmit = async (e) => {
     e.preventDefault();
     if (!validate()) return;
     setSubmitting(true);
     setRipple(true);
     try {
       const formData = new FormData();
       formData.append('name', form.name);
       formData.append('email', form.email);
       formData.append('phone', form.phone);
       formData.append('date', checkIn);
       formData.append('time', '19:00');
       formData.append('guests', adults + children);
       formData.append('notes', form.notes || '');
       formData.append('status', 'confirmed');
       formData.append('roomName', roomName || 'Reserve Experience');
       formData.append('roomId', roomId || '');
       formData.append('checkIn', checkIn);
       formData.append('checkOut', checkOut || '');
       formData.append('paymentMethod', paymentMethod || 'pay_hotel');
       if (selectedBank) formData.append('selectedBank', selectedBank);
       if (transactionRef) formData.append('paymentReference', transactionRef);
       if (paymentProof) formData.append('paymentProof', paymentProof);

       await axios.post(`${API_BASE}/api/reservations`, formData, {
         headers: { 'Content-Type': 'multipart/form-data' }
       });
       setBookingDetails({ checkIn, checkOut, guests: adults + children, paymentMethod });
       setShowSuccess(true);
       if (onSuccess) onSuccess();
     } catch (err) {
       if (err.response?.status === 409) {
         setErrors({ availability: err.response.data?.message || 'Room is no longer available' });
         setAvailability({ checking: false, available: false, message: err.response.data?.message || 'Room unavailable', conflicts: err.response.data?.data?.conflicts || [] });
       } else {
         setErrors({ submit: err.response?.data?.message || 'Failed to submit' });
       }
     } finally {
       setSubmitting(false);
       setTimeout(() => setRipple(false), 800);
     }
   };

  const inpCls = (f) => `w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none dark:text-white dark:placeholder-gray-500`;

  return (
    <div className="relative">
      <BookingSuccessModal show={showSuccess} onClose={() => setShowSuccess(false)} bookingDetails={bookingDetails} />

       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
         className="relative overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-800 border border-gray-100 dark:border-slate-700"
       >
         <div className="relative p-6 sm:p-7 bg-white dark:bg-slate-800">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 mb-3">
               <motion.div
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                 className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 dark:bg-indigo-500 shadow-lg shadow-indigo-500/20"
               >
                 <CalendarDays className="h-5 w-5 text-white" />
               </motion.div>
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">Book Your Stay</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Complete your reservation in seconds</p>
              </div>
            </div>

             {checkIn && checkOut && (
               <motion.div
                 initial={{ opacity: 0, height: 0 }}
                 animate={{ opacity: 1, height: 'auto' }}
                 className="mt-3 overflow-hidden"
               >
                 <div className="flex items-center justify-between rounded-2xl bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 px-4 py-3">
                  <div className="text-center">
                    <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Check In</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{checkIn}</p>
                  </div>
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-slate-700 shadow-sm"
                  >
                    <ArrowRight className="h-4 w-4 text-indigo-500" />
                  </motion.div>
                  <div className="text-center">
                    <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Check Out</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{checkOut}</p>
                  </div>
                  <div className="text-center pl-3 border-l border-indigo-200/50 dark:border-indigo-800/50">
                    <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Guests</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{adults + children}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
                  <CalendarDays className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Dates</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <motion.div whileFocus={{ scale: 1.01 }} className="group">
                  <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1.5 ml-1">Check In</label>
                   <div className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                     errors.checkIn
                       ? 'border-red-300 bg-red-50 dark:border-red-700/50 dark:bg-red-900/30'
                       : 'border-gray-200 bg-white dark:border-slate-600 dark:bg-slate-700 focus-within:border-indigo-500'
                   }`}>
                    <input type="date" value={checkIn}
                      onChange={(e) => { setCheckIn(e.target.value); setErrors((p) => ({ ...p, checkIn: '' })); }}
                      className="w-full bg-transparent px-3.5 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none"
                      min={new Date().toISOString().split('T')[0]} />
                  </div>
                  {errors.checkIn && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-red-500 mt-1 ml-1">{errors.checkIn}</motion.p>}
                </motion.div>
                <motion.div whileFocus={{ scale: 1.01 }} className="group">
                  <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1.5 ml-1">Check Out</label>
                   <div className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                     errors.checkOut
                       ? 'border-red-300 bg-red-50 dark:border-red-700/50 dark:bg-red-900/30'
                       : 'border-gray-200 bg-white dark:border-slate-600 dark:bg-slate-700 focus-within:border-indigo-500'
                   }`}>
                    <input type="date" value={checkOut}
                      onChange={(e) => { setCheckOut(e.target.value); setErrors((p) => ({ ...p, checkOut: '' })); }}
                      className="w-full bg-transparent px-3.5 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none"
                      min={checkIn || new Date().toISOString().split('T')[0]} />
                  </div>
                  {errors.checkOut && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-red-500 mt-1 ml-1">{errors.checkOut}</motion.p>}
                </motion.div>
               </div>
             </motion.div>

             {checkIn && (
               <motion.div
                 initial={{ opacity: 0, height: 0 }}
                 animate={{ opacity: 1, height: 'auto' }}
                 transition={{ delay: 0.15, duration: 0.3 }}
               >
                 <div className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
                   availability.checking
                     ? 'bg-gray-100/80 dark:bg-slate-700/50'
                     : availability.available
                     ? 'bg-emerald-50/80 dark:bg-emerald-900/20'
                     : 'bg-red-50/80 dark:bg-red-900/20'
                 }`}>
                   {availability.checking ? (
                     <>
                       <Loader2 className="h-4 w-4 text-gray-500 dark:text-gray-400 animate-spin" />
                       <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Checking availability...</span>
                     </>
                   ) : availability.available ? (
                     <>
                       <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                         <CheckCircle className="h-3.5 w-3.5 text-white" />
                       </div>
                       <div>
                         <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Room Available</span>
                         {bookedDates.length > 0 && (
                           <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/60">{bookedDates.length} dates already booked this month</p>
                         )}
                       </div>
                     </>
                   ) : (
                     <>
                       <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500">
                         <X className="h-3.5 w-3.5 text-white" />
                       </div>
                       <div>
                         <span className="text-xs font-bold text-red-700 dark:text-red-400">Room Unavailable</span>
                         <p className="text-[10px] text-red-600/70 dark:text-red-400/60">{availability.message || 'Please select different dates'}</p>
                       </div>
                     </>
                   )}
                 </div>
               </motion.div>
             )}

             <motion.div
               initial={{ opacity: 0, x: -15 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.2, duration: 0.4 }}
             >
               <div className="flex items-center gap-2 mb-2.5">
                 <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
                   <Users className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                 </div>
                 <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Guests</span>
               </div>
              <div className="grid grid-cols-2 gap-3">
                 <div className="flex items-center justify-between rounded-xl border-2 border-gray-200 bg-white px-3.5 py-2.5 dark:border-slate-600 dark:bg-slate-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Adults</span>
                  <div className="flex items-center gap-2">
                    <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} type="button"
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-600 dark:text-gray-300 dark:hover:bg-indigo-900/40 dark:hover:text-indigo-400 transition-all"
                    ><Minus className="h-3.5 w-3.5" /></motion.button>
                    <AnimatedNumber className="w-7 text-center text-base font-black text-gray-900 dark:text-white">{adults}</AnimatedNumber>
                     <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} type="button"
                       onClick={() => setAdults(Math.min(20, adults + 1))}
                       className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white shadow-md transition-all hover:shadow-lg hover:shadow-indigo-500/20"
                     ><Plus className="h-3.5 w-3.5" /></motion.button>
                  </div>
                </div>
                 <div className="flex items-center justify-between rounded-xl border-2 border-gray-200 bg-white px-3.5 py-2.5 dark:border-slate-600 dark:bg-slate-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Children</span>
                  <div className="flex items-center gap-2">
                    <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} type="button"
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-600 dark:text-gray-300 dark:hover:bg-indigo-900/40 dark:hover:text-indigo-400 transition-all"
                    ><Minus className="h-3.5 w-3.5" /></motion.button>
                    <AnimatedNumber className="w-7 text-center text-base font-black text-gray-900 dark:text-white">{children}</AnimatedNumber>
                     <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} type="button"
                       onClick={() => setChildren(Math.min(20, children + 1))}
                       className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white shadow-md transition-all hover:shadow-lg hover:shadow-indigo-500/20"
                     ><Plus className="h-3.5 w-3.5" /></motion.button>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 mb-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
                  <ScrollText className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Your Details</span>
              </div>

              <div className="group">
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1.5 ml-1">Full Name</label>
                 <div className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                   errors.name
                     ? 'border-red-300 bg-red-50 dark:border-red-700/50 dark:bg-red-900/30'
                     : 'border-gray-200 bg-white dark:border-slate-600 dark:bg-slate-700 focus-within:border-indigo-500'
                 }`}>
                  <input type="text" placeholder="John Doe" value={form.name}
                    onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors((p) => ({ ...p, name: '' })); }}
                    className="w-full bg-transparent px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 dark:text-white dark:placeholder-gray-500 focus:outline-none" />
                </div>
                {errors.name && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-red-500 mt-1 ml-1">{errors.name}</motion.p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="group">
                  <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1.5 ml-1">Email</label>
                 <div className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                   errors.email
                     ? 'border-red-300 bg-red-50 dark:border-red-700/50 dark:bg-red-900/30'
                     : 'border-gray-200 bg-white dark:border-slate-600 dark:bg-slate-700 focus-within:border-indigo-500'
                 }`}>
                    <input type="email" placeholder="email@example.com" value={form.email}
                      onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors((p) => ({ ...p, email: '' })); }}
                      className="w-full bg-transparent px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 dark:text-white dark:placeholder-gray-500 focus:outline-none" />
                  </div>
                  {errors.email && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-red-500 mt-1 ml-1">{errors.email}</motion.p>}
                </div>
                <div className="group">
                  <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1.5 ml-1">Phone</label>
                 <div className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                   errors.phone
                     ? 'border-red-300 bg-red-50 dark:border-red-700/50 dark:bg-red-900/30'
                     : 'border-gray-200 bg-white dark:border-slate-600 dark:bg-slate-700 focus-within:border-indigo-500'
                 }`}>
                    <input type="tel" placeholder="+1 234 567" value={form.phone}
                      onChange={(e) => { setForm({ ...form, phone: e.target.value }); setErrors((p) => ({ ...p, phone: '' })); }}
                      className="w-full bg-transparent px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 dark:text-white dark:placeholder-gray-500 focus:outline-none" />
                  </div>
                  {errors.phone && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-red-500 mt-1 ml-1">{errors.phone}</motion.p>}
                </div>
              </div>

              <div className="group">
                <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1.5 ml-1">Special Requests <span className="text-gray-400 dark:text-gray-500">(Optional)</span></label>
                 <div className="relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white dark:border-slate-600 dark:bg-slate-700 transition-all duration-300 focus-within:border-indigo-500">
                  <textarea rows={2} placeholder="Any special requirements or notes..."
                    value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full resize-none bg-transparent px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 dark:text-white dark:placeholder-gray-500 focus:outline-none" />
                </div>
              </div>
             </motion.div>

             <motion.div
               initial={{ opacity: 0, x: -15 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.3, duration: 0.4 }}
               className="space-y-3"
             >
               <div className="flex items-center gap-2 mb-2.5">
                 <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
                   <CreditCard className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                 </div>
                 <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Payment Method</span>
               </div>

               <div className="grid grid-cols-3 gap-2">
                 <button
                   type="button"
                   onClick={() => { setPaymentMethod('pay_hotel'); setSelectedBank(''); }}
                   className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all duration-200 ${
                     paymentMethod === 'pay_hotel' || paymentMethod === ''
                       ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 shadow-md'
                       : 'border-gray-200 bg-white dark:border-slate-600 dark:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-500'
                   }`}
                 >
                   <Building2 className={`h-5 w-5 ${
                     paymentMethod === 'pay_hotel' || paymentMethod === ''
                       ? 'text-indigo-600 dark:text-indigo-400'
                       : 'text-gray-400 dark:text-gray-500'
                   }`} />
                   <span className={`text-[10px] font-bold ${
                     paymentMethod === 'pay_hotel' || paymentMethod === ''
                       ? 'text-indigo-700 dark:text-indigo-300'
                       : 'text-gray-500 dark:text-gray-400'
                   }`}>Pay at Hotel</span>
                 </button>

                 <button
                   type="button"
                   onClick={() => { setPaymentMethod('telebirr'); setSelectedBank(''); }}
                   className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all duration-200 ${
                     paymentMethod === 'telebirr'
                       ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 shadow-md'
                       : 'border-gray-200 bg-white dark:border-slate-600 dark:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-500'
                   }`}
                 >
                   <Smartphone className={`h-5 w-5 ${
                     paymentMethod === 'telebirr'
                       ? 'text-indigo-600 dark:text-indigo-400'
                       : 'text-gray-400 dark:text-gray-500'
                   }`} />
                   <span className={`text-[10px] font-bold ${
                     paymentMethod === 'telebirr'
                       ? 'text-indigo-700 dark:text-indigo-300'
                       : 'text-gray-500 dark:text-gray-400'
                   }`}>Telebirr</span>
                 </button>

                 <button
                   type="button"
                   onClick={() => setPaymentMethod('bank')}
                   className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all duration-200 ${
                     paymentMethod === 'bank'
                       ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 shadow-md'
                       : 'border-gray-200 bg-white dark:border-slate-600 dark:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-500'
                   }`}
                 >
                   <Landmark className={`h-5 w-5 ${
                     paymentMethod === 'bank'
                       ? 'text-indigo-600 dark:text-indigo-400'
                       : 'text-gray-400 dark:text-gray-500'
                   }`} />
                   <span className={`text-[10px] font-bold ${
                     paymentMethod === 'bank'
                       ? 'text-indigo-700 dark:text-indigo-300'
                       : 'text-gray-500 dark:text-gray-400'
                   }`}>Bank</span>
                 </button>
               </div>

               {paymentMethod === 'telebirr' && (
                 <motion.div
                   initial={{ opacity: 0, height: 0 }}
                   animate={{ opacity: 1, height: 'auto' }}
                   className="overflow-hidden space-y-3"
                 >
                   <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 p-4">
                     <div className="flex items-center gap-2 mb-3">
                       <Smartphone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                       <p className="text-[11px] font-bold text-blue-700 dark:text-blue-300">Telebirr Payment Details</p>
                     </div>
                     <div className="space-y-2">
                       <div className="flex justify-between items-center py-1.5 border-b border-blue-100 dark:border-blue-800/30">
                         <span className="text-[10px] text-blue-600/70 dark:text-blue-400/60">Phone Number</span>
                         <span className="text-[11px] font-bold text-blue-800 dark:text-blue-200">{TELEBIRR_INFO.phoneNumber}</span>
                       </div>
                       <div className="flex justify-between items-center py-1.5 border-b border-blue-100 dark:border-blue-800/30">
                         <span className="text-[10px] text-blue-600/70 dark:text-blue-400/60">Account Name</span>
                         <span className="text-[11px] font-bold text-blue-800 dark:text-blue-200">{TELEBIRR_INFO.accountName}</span>
                       </div>
                       <div className="flex justify-between items-center py-1.5">
                         <span className="text-[10px] text-blue-600/70 dark:text-blue-400/60">Short Code</span>
                         <span className="text-[11px] font-bold text-blue-800 dark:text-blue-200">{TELEBIRR_INFO.shortCode}</span>
                       </div>
                     </div>
                   </div>
                 </motion.div>
               )}

               {paymentMethod === 'bank' && (
                 <motion.div
                   initial={{ opacity: 0, height: 0 }}
                   animate={{ opacity: 1, height: 'auto' }}
                   className="overflow-hidden space-y-3"
                 >
                   <div className="group">
                     <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1.5 ml-1">
                       Select Bank
                     </label>
                     <select
                       value={selectedBank}
                       onChange={(e) => setSelectedBank(e.target.value)}
                       className="w-full rounded-xl border-2 border-gray-200 bg-white dark:border-slate-600 dark:bg-slate-700 px-3.5 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all duration-300"
                     >
                       <option value="">Select a bank...</option>
                       <option value="cbe">Commercial Bank of Ethiopia (CBE)</option>
                       <option value="awash">Awash Bank</option>
                       <option value="abyssinia">Abyssinia Bank</option>
                       <option value="coop">Cooperative Bank of Oromia (Coop)</option>
                       <option value="siinqee">Siinqee Bank</option>
                     </select>
                   </div>

                   {selectedBank && BANK_INFO[selectedBank] && (
                     <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 p-4">
                       <div className="flex items-center gap-2 mb-3">
                         <Landmark className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                         <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">{BANK_INFO[selectedBank].name}</p>
                       </div>
                       <div className="space-y-2">
                         <div className="flex justify-between items-center py-1.5 border-b border-emerald-100 dark:border-emerald-800/30">
                           <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/60">Account Number</span>
                           <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-200 font-mono">{BANK_INFO[selectedBank].account}</span>
                         </div>
                         <div className="flex justify-between items-center py-1.5">
                           <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/60">Account Name</span>
                           <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-200">{BANK_INFO[selectedBank].accountName}</span>
                         </div>
                       </div>
                     </div>
                   )}
                 </motion.div>
               )}

               {(paymentMethod === 'telebirr' || paymentMethod === 'bank') && (
                 <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="space-y-3"
                 >
                   <div className="group">
                     <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1.5 ml-1">
                       Transaction Reference <span className="text-gray-400 dark:text-gray-500">(Optional)</span>
                     </label>
                     <div className="relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white dark:border-slate-600 dark:bg-slate-700 transition-all duration-300 focus-within:border-indigo-500">
                       <input 
                         type="text" 
                         placeholder="Enter transaction ID or reference..."
                         value={transactionRef}
                         onChange={(e) => setTransactionRef(e.target.value)}
                         className="w-full bg-transparent px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 dark:text-white dark:placeholder-gray-500 focus:outline-none" 
                       />
                     </div>
                   </div>

                   <div className="group">
                     <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1.5 ml-1">
                       Upload Payment Proof <span className="text-gray-400 dark:text-gray-500">(Screenshot, PDF)</span>
                     </label>
                     <div className="relative">
                       <input
                         type="file"
                         id="payment-proof-upload"
                         accept="image/*,.pdf"
                         onChange={(e) => {
                           const file = e.target.files?.[0];
                           if (file) {
                             setPaymentProof(file);
                             setPaymentProofName(file.name);
                           }
                         }}
                         className="hidden"
                       />
                       <label
                         htmlFor="payment-proof-upload"
                         className="flex flex-col items-center justify-center gap-2 py-4 px-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/50 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-200"
                       >
                         <Upload className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                         {paymentProofName ? (
                           <div className="text-center">
                             <p className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">{paymentProofName}</p>
                             <p className="text-[9px] text-gray-400 dark:text-gray-500">Click to change file</p>
                           </div>
                         ) : (
                           <div className="text-center">
                             <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Click to upload payment proof</p>
                             <p className="text-[9px] text-gray-400 dark:text-gray-500">JPG, PNG, PDF (Max 10MB)</p>
                           </div>
                         )}
                       </label>
                     </div>
                   </div>
                 </motion.div>
               )}
             </motion.div>

             {errors.submit && (
               <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                 className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 px-3.5 py-2.5 border border-red-200 dark:border-red-800/30">
                 <X className="h-4 w-4 text-red-500 shrink-0" />
                 <p className="text-xs text-red-600 dark:text-red-400">{errors.submit}</p>
               </motion.div>
             )}

               <div className="pt-2">
                {alreadyBooked ? (
                  <div className="w-full rounded-2xl bg-emerald-500 py-3.5 text-center mb-3">
                    <span className="flex items-center justify-center gap-2 text-sm font-bold text-white">
                      <CheckCircle className="h-4 w-4" /> Already Reserved
                    </span>
                  </div>
                ) : checkIn && !availability.checking && !availability.available ? (
                  <div className="w-full rounded-2xl bg-amber-50 py-3 px-4 text-center mb-3 border border-amber-200">
                    <span className="flex items-center justify-center gap-2 text-sm font-bold text-amber-700">
                      <X className="h-4 w-4" /> Room Unavailable - Please select different dates
                    </span>
                  </div>
                ) : null}
                
                <button 
                  type="submit" 
                  disabled={submitting || availability.checking || alreadyBooked}
                  className="w-full rounded-2xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center justify-center gap-2">
                    {submitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Sparkles className="h-5 w-5" />
                    )}
                    <span className="text-base">
                      {submitting ? 'Reserving...' : 'Confirm Reservation'}
                    </span>
                    {!submitting && <ArrowRight className="h-5 w-5" />}
                  </span>
                </button>
              </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="flex items-center justify-center gap-6 pt-1"
            >
              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Secure</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BadgeCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Verified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">24/7 Support</span>
              </div>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="animate-pulse p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="aspect-[21/9] rounded-2xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 mb-6" />
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
            {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-[4/3] rounded-xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-32 rounded-2xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800" />
              <div className="h-40 rounded-2xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800" />
            </div>
            <div className="h-[500px] rounded-2xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Reserve() {
  const { darkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const roomName = location.state?.roomName || '';
  const roomId = location.state?.roomId || '';
  const contentType = location.state?.contentType || 'reserve_page';
  const isRoomBooking = !!(roomName && roomId);
  const [content, setContent] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [galleryImages, setGalleryImages] = useState(null);
  const [elementImages, setElementImages] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [rooms, setRooms] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const fetchData = async () => {
      try {
        const [roomsRes, contentRes] = await Promise.all([
          axios.get(`${API_BASE}/api/listings/room`).catch(() => null),
          isRoomBooking ? Promise.resolve(null) : axios.get(`${API_BASE}/api/content/${contentType}`).catch(() => null),
        ]);

        const allRooms = roomsRes?.data?.data || [];
        setRooms(allRooms);

        if (isRoomBooking) {
          const found = allRooms.find((r) => r._id === roomId);
          if (found) {
            setRoom(found);
            const d = found.data || {};
            if (d.images) setElementImages(d.images);
          }
        } else {
          if (contentRes?.data?.data?.value) {
            const data = contentRes.data.data.value;
            setContent(data);
            if (data.gallery) setGalleryImages(data.gallery);
            if (data.elementImages) setElementImages(data.elementImages);
            if (data.reviews) setReviews(data.reviews);
          }

          if (allRooms.length) {
            const featured = allRooms.find((r) => r.isActive && r.data?.featured);
            if (featured) setRoom(featured);
          }
        }
      } catch {
        setContent(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isRoomBooking, roomId, contentType]);

  const rd = room?.data || {};

  if (loading) return <SkeletonLoader />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/10">
      <NoiseOverlay />
      <Navbar darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />

      <div className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Two-column layout: Left = Room content, Right = Reservation Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN: Room Images & Information */}
          <div className="lg:col-span-2 space-y-5">
            {/* Hero Gallery */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <HeroGallery images={galleryImages} roomName={roomName} rd={rd} isRoomBooking={isRoomBooking} />
            </motion.div>

            {/* Room Element Images */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <ElementImages images={elementImages} />
            </motion.div>

            {/* Room Info Card */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <RoomInfoCard rd={rd} roomName={roomName} isRoomBooking={isRoomBooking} />
            </motion.div>

            {/* Amenities & Services */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <AmenitiesGrid amenities={content?.amenities || rd.amenities} />
            </motion.div>

            {/* Description Quote */}
             {content?.description && (
               <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                 className="rounded-2xl border border-indigo-100/40 bg-gradient-to-br from-indigo-50/90 via-violet-50/60 to-transparent p-6 backdrop-blur-2xl shadow-lg dark:border-indigo-700/20 dark:from-indigo-900/20 dark:via-violet-900/10"
               >
                 <div className="flex gap-4 items-start">
                   <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 shadow-lg shadow-indigo-500/20">
                     <Gem className="h-5 w-5 text-white" />
                   </div>
                   <div>
                     <p className="text-sm leading-relaxed italic text-gray-700 dark:text-indigo-300/80 font-medium">&ldquo;{content.description}&rdquo;</p>
                     <div className="mt-3 h-px w-16 bg-gradient-to-r from-indigo-400/50 to-transparent" />
                   </div>
                 </div>
               </motion.div>
             )}

             {/* Guest Reviews / Testimonials */}
             <GuestReviews reviews={reviews} />

             {/* Similar Experiences */}
             <SimilarExperiences rooms={rooms} currentRoomId={roomId} />
           </div>

          {/* RIGHT COLUMN: Sticky Reservation Form */}
          <div className="lg:col-span-1" ref={formRef}>
            <div className="lg:sticky lg:top-24">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <ReservationFormSidebar
                  roomData={room}
                  roomName={roomName}
                  roomId={roomId}
                  contentType={contentType}
                />
              </motion.div>
            </div>
          </div>
         </div>
       </div>
       <Footer />
     </div>
   );
 }
