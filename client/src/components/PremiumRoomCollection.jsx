import { useRef, useCallback, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
  Users, Star, Wifi, Tv, Wind, Coffee, Bath, Sparkles,
  ArrowRight, ChevronRight, Shield, Maximize2, Moon
} from 'lucide-react';

const ROOMS = [
  {
    id: 'standard',
    title: 'Standard Room',
    subtitle: 'Comfort & Elegance',
    desc: 'Curated for the discerning traveler seeking refined comfort with panoramic city views and handcrafted interiors.',
    capacity: '2 Guests',
    rating: 4.8,
    price: '3,500',
    banner: 'from-blue-600 via-indigo-600 to-purple-700',
    glow: 'rgba(99,102,241,0.35)',
    gradient: 'from-blue-500 to-indigo-500',
    amenities: [
      { icon: Wifi, label: 'Free Wi-Fi' },
      { icon: Tv, label: 'Smart TV' },
      { icon: Wind, label: 'AC' },
      { icon: Coffee, label: 'Mini Bar' },
      { icon: Bath, label: 'Spa Bath' },
    ],
    image: (
      <svg viewBox="0 0 80 80" fill="none" className="w-16 h-16">
        <rect width="80" height="80" rx="16" fill="url(#std-grad)" />
        <rect x="16" y="28" width="48" height="32" rx="4" stroke="white" strokeWidth="2" fill="none" />
        <rect x="20" y="32" width="40" height="8" rx="2" fill="white" fillOpacity="0.2" />
        <rect x="20" y="44" width="28" height="4" rx="2" fill="white" fillOpacity="0.15" />
        <rect x="20" y="52" width="18" height="4" rx="2" fill="white" fillOpacity="0.1" />
        <circle cx="56" cy="48" r="8" stroke="white" strokeWidth="1.5" fill="none" />
        <path d="M54 48h4M56 46v4" stroke="white" strokeWidth="1.5" />
        <defs>
          <linearGradient id="std-grad" x1="0" y1="0" x2="80" y2="80">
            <stop stopColor="#6366f1" /><stop offset="1" stopColor="#4f46e5" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    id: 'deluxe',
    title: 'Deluxe Room',
    subtitle: 'Opulence Redefined',
    desc: 'An expansive sanctuary with panoramic vistas, bespoke furnishings, and an immersive luxury experience beyond compare.',
    capacity: '4 Guests',
    rating: 4.9,
    price: '6,500',
    popular: true,
    banner: 'from-purple-600 via-pink-600 to-rose-700',
    glow: 'rgba(168,85,247,0.4)',
    gradient: 'from-purple-500 to-pink-500',
    amenities: [
      { icon: Wifi, label: 'Free Wi-Fi' },
      { icon: Tv, label: '65" OLED TV' },
      { icon: Wind, label: 'Premium AC' },
      { icon: Coffee, label: 'Espresso Bar' },
      { icon: Bath, label: 'Jacuzzi' },
      { icon: Moon, label: 'Butler Svc' },
    ],
    image: (
      <svg viewBox="0 0 80 80" fill="none" className="w-16 h-16">
        <rect width="80" height="80" rx="16" fill="url(#dlx-grad)" />
        <rect x="12" y="24" width="56" height="36" rx="6" stroke="white" strokeWidth="2" fill="none" />
        <rect x="16" y="28" width="48" height="8" rx="2" fill="white" fillOpacity="0.2" />
        <circle cx="40" cy="46" r="10" stroke="white" strokeWidth="1.5" fill="none" />
        <circle cx="40" cy="46" r="4" fill="white" fillOpacity="0.3" />
        <rect x="16" y="52" width="20" height="4" rx="2" fill="white" fillOpacity="0.15" />
        <defs>
          <linearGradient id="dlx-grad" x1="0" y1="0" x2="80" y2="80">
            <stop stopColor="#a855f7" /><stop offset="1" stopColor="#db2777" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    id: 'presidential',
    title: 'Presidential Suite',
    subtitle: 'Ultimate Grandeur',
    desc: 'The pinnacle of luxury living with a private terrace, butler service, and an unrivaled panorama of the city skyline.',
    capacity: '6 Guests',
    rating: 5.0,
    price: '12,000',
    banner: 'from-amber-500 via-orange-500 to-rose-600',
    glow: 'rgba(245,158,11,0.35)',
    gradient: 'from-amber-400 to-orange-500',
    amenities: [
      { icon: Wifi, label: 'Free Wi-Fi' },
      { icon: Tv, label: '80" Theater' },
      { icon: Wind, label: 'Climate Ctrl' },
      { icon: Coffee, label: 'Wine Cellar' },
      { icon: Bath, label: 'Infinity Pool' },
      { icon: Shield, label: 'Concierge' },
      { icon: Maximize2, label: 'Panoramic View' },
    ],
    image: (
      <svg viewBox="0 0 80 80" fill="none" className="w-16 h-16">
        <rect width="80" height="80" rx="16" fill="url(#prs-grad)" />
        <rect x="10" y="22" width="60" height="38" rx="8" stroke="white" strokeWidth="2" fill="none" />
        <rect x="14" y="26" width="52" height="8" rx="2" fill="white" fillOpacity="0.2" />
        <rect x="14" y="38" width="24" height="4" rx="2" fill="white" fillOpacity="0.15" />
        <rect x="14" y="46" width="16" height="4" rx="2" fill="white" fillOpacity="0.1" />
        <rect x="50" y="38" width="16" height="16" rx="3" stroke="white" strokeWidth="1.5" fill="none" />
        <path d="M56 42v8M52 46h8" stroke="white" strokeWidth="1.5" />
        <defs>
          <linearGradient id="prs-grad" x1="0" y1="0" x2="80" y2="80">
            <stop stopColor="#f59e0b" /><stop offset="1" stopColor="#f97316" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
];

function FloatingParticle({ index }) {
  const duration = 5 + Math.random() * 5;
  const delay = Math.random() * 4;
  const size = 2 + Math.random() * 4;
  const startX = Math.random() * 100;
  const startY = Math.random() * 100;

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: `${startX}%`,
        top: `${startY}%`,
        background: [
          'rgba(99,102,241,0.5)',
          'rgba(168,85,247,0.5)',
          'rgba(245,158,11,0.5)',
          'rgba(236,72,153,0.5)',
        ][index % 4],
        boxShadow: `0 0 ${size * 4}px ${['rgba(99,102,241,0.3)', 'rgba(168,85,247,0.3)', 'rgba(245,158,11,0.3)', 'rgba(236,72,153,0.3)'][index % 4]}`,
      }}
      animate={{
        y: [0, -(20 + Math.random() * 30), 0],
        x: [0, (Math.random() - 0.5) * 25, 0],
        opacity: [0, 0.8, 0],
        scale: [0, 1.2, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

function FloatingBlob({ index }) {
  const positions = [
    { top: '5%', left: '0%', size: 500, gradient: 'from-indigo-500/15 via-purple-500/10 to-transparent' },
    { top: '50%', right: '0%', size: 600, gradient: 'from-amber-500/15 via-pink-500/10 to-transparent' },
    { top: '70%', left: '20%', size: 400, gradient: 'from-blue-500/10 via-cyan-500/8 to-transparent' },
    { top: '20%', right: '15%', size: 350, gradient: 'from-rose-500/12 via-purple-500/8 to-transparent' },
  ];
  const p = positions[index % positions.length];

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        top: p.top,
        left: p.left,
        right: p.right,
        width: p.size,
        height: p.size,
        background: `linear-gradient(135deg, ${p.gradient})`,
        filter: 'blur(80px)',
      }}
      animate={{
        scale: [1, 1.25, 1],
        rotate: [0, 15, 0],
        x: [0, 30, 0],
        y: [0, -30, 0],
      }}
      transition={{
        duration: 12 + index * 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

function ShimmerOverlay() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl"
      initial={{ opacity: 0 }}
      whileHover={{ opacity: 1 }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.15) 55%, transparent 70%)',
          backgroundSize: '200% 100%',
        }}
        animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
        transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1 }}
      />
    </motion.div>
  );
}

function RoomCard({ room, index }) {
  const cardRef = useRef(null);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(y, [0, 1], [10, -10]), { damping: 20, stiffness: 120 });
  const rotateY = useSpring(useTransform(x, [0, 1], [-10, 10]), { damping: 20, stiffness: 120 });
  const glareX = useTransform(x, [0, 1], [0, 100]);
  const glareY = useTransform(y, [0, 1], [0, 100]);

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    x.set(px);
    y.set(py);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0.5);
    y.set(0.5);
  }, [x, y]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative group"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, perspective: 1000, transformStyle: 'preserve-3d' }}
        className="relative"
      >
        <div
          className="relative rounded-3xl p-[1.5px] transition-all duration-500"
          style={{
            background: `linear-gradient(135deg, ${room.glow}, transparent 50%, ${room.glow}20 100%)`,
          }}
        >
          <motion.div
            className="relative bg-white/60 dark:bg-slate-900/70 backdrop-blur-2xl rounded-3xl overflow-hidden border border-white/30 dark:border-slate-700/30 shadow-2xl shadow-black/5"
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: `radial-gradient(circle at ${glareX}% ${glareY}%, ${room.glow} 0%, transparent 60%)`,
              }}
            />

            <ShimmerOverlay />

            <div className="absolute -inset-20 opacity-0 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none"
              style={{
                background: `radial-gradient(800px circle at 50% 50%, ${room.glow}, transparent 40%)`,
              }}
            />

            <div className="relative z-10" style={{ transformStyle: 'preserve-3d' }}>
              <div
                className={`relative h-44 sm:h-52 bg-gradient-to-br ${room.banner} overflow-hidden`}
                style={{ transform: 'translateZ(20px)' }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-[-50%] left-[-50%] w-full h-full bg-white/10 rounded-full animate-spin-slow" />
                  <div className="absolute bottom-[-30%] right-[-30%] w-3/4 h-3/4 bg-white/5 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse' }} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.15, duration: 0.5 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-white/20 blur-xl rounded-full scale-150" />
                    <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-4 ring-1 ring-white/20 shadow-2xl">
                      {room.image}
                    </div>
                  </motion.div>
                </div>

                {room.popular && (
                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute top-4 right-4"
                    style={{ transform: 'translateZ(30px)' }}
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 blur-md rounded-full" />
                      <div className="relative flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg shadow-orange-500/30">
                        <Sparkles className="w-3 h-3" />
                        Most Popular
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="absolute bottom-3 left-4 flex items-center gap-1.5" style={{ transform: 'translateZ(20px)' }}>
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-black/50 backdrop-blur-md rounded-full text-white">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold">{room.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-black/50 backdrop-blur-md rounded-full text-white">
                    <Users className="w-3 h-3 text-white/80" />
                    <span className="text-xs font-medium">{room.capacity}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-7">
                <div className="mb-4" style={{ transform: 'translateZ(15px)' }}>
                  <span className={`text-[10px] uppercase tracking-[0.2em] font-semibold bg-gradient-to-r ${room.gradient} bg-clip-text text-transparent`}>
                    {room.subtitle}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1 leading-tight">
                    {room.title}
                  </h3>
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-5"
                  style={{ transform: 'translateZ(10px)' }}>
                  {room.desc}
                </p>

                <div className="mb-5" style={{ transform: 'translateZ(10px)' }}>
                  <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-slate-400 dark:text-slate-500 mb-2.5">
                    Premium Amenities
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {room.amenities.map((amenity) => {
                      const Icon = amenity.icon;
                      return (
                        <motion.div
                          key={amenity.label}
                          whileHover={{ scale: 1.1 }}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-slate-600 dark:text-slate-300"
                        >
                          <Icon className="w-3 h-3" />
                          <span className="text-[10px] font-medium whitespace-nowrap">{amenity.label}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-end justify-between pt-4 border-t border-slate-200/50 dark:border-slate-700/30"
                  style={{ transform: 'translateZ(20px)' }}>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mb-1">
                      Starting From
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">ETB</span>
                      <span className={`text-3xl sm:text-4xl font-black bg-gradient-to-r ${room.gradient} bg-clip-text text-transparent`}>
                        {room.price}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">/night</span>
                    </div>
                  </div>
                  <Link to="/reserve">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="group relative px-6 py-3 rounded-xl font-bold text-sm overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${room.glow.replace('0.35', '1').replace('0.4', '1').replace('0.35', '1')}, ${room.glow.replace('0.35', '0.8').replace('0.4', '0.8').replace('0.35', '0.8')})`,
                        boxShadow: `0 4px 20px ${room.glow}`,
                      }}
                    >
                      <span className="relative z-10 flex items-center gap-2 text-white">
                        Book Now
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <motion.div
                        className="absolute inset-0 bg-white/20"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.4 }}
                      />
                    </motion.button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MouseGlow() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouse = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };
    const handleLeave = () => setIsVisible(false);
    window.addEventListener('mousemove', handleMouse);
    document.addEventListener('mouseleave', handleLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouse);
      document.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  return (
    <motion.div
      className="fixed pointer-events-none z-[9999]"
      style={{
        left: mousePos.x - 200,
        top: mousePos.y - 200,
        width: 400,
        height: 400,
        background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s',
      }}
    />
  );
}

export default function PremiumRoomCollection() {
  const { darkMode } = useTheme();
  const sectionRef = useRef(null);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 sm:py-32 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-white to-slate-50/80 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />

      <FloatingBlob index={0} />
      <FloatingBlob index={1} />
      <FloatingBlob index={2} />
      <FloatingBlob index={3} />

      {[...Array(30)].map((_, i) => (
        <FloatingParticle key={i} index={i} />
      ))}

      <MouseGlow />

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-16 sm:mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 shadow-sm mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 tracking-wide">
              Luxury Stays
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-[1.1] mb-5"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white">
              Premium
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
              Room Collection
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Curate your perfect escape with our hand-selection of luxury accommodations,
            each designed to deliver an unforgettable experience of elegance and comfort.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {ROOMS.map((room, index) => (
            <RoomCard key={room.id} room={room} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-16"
        >
          <Link to="/dining">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="group relative px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl shadow-2xl shadow-slate-900/25 dark:shadow-white/10 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Explore Dining
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
            </motion.button>
          </Link>
          <Link to="/reserve">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="group px-8 py-4 bg-transparent text-slate-700 dark:text-slate-300 font-semibold rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-lg transition-colors duration-300"
            >
              <span className="flex items-center gap-2">
                Reserve Room
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
