import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import LuxuryHero from '../components/LuxuryHero';
import Footer from '../components/common/Footer';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Users, Star, Wifi, Tv, Wind, Coffee, Bath, Monitor,
  Speaker, Sun, MapPin, Music, Utensils, Projector,
  Search, ArrowUpDown, ChevronDown, SlidersHorizontal,
  ArrowRight, Sparkles, Shield, Clock, X, Heart,
  Share2, Eye, CheckCircle, CalendarDays
} from 'lucide-react';

const amenityIcons = {
  'wifi': Wifi, 'wi-fi': Wifi, 'internet': Wifi,
  'tv': Tv, 'television': Tv,
   'ac': Wind, 'air conditioning': Wind,
  'coffee': Coffee, 'mini bar': Coffee, 'espresso': Coffee,
  'bath': Bath, 'spa': Bath, 'jacuzzi': Bath, 'shower': Bath,
  'premium seating': Monitor, 'comfortable seating': Monitor,
  'personal server': Shield, 'butler': Shield, 'concierge': Shield,
  'projector': Projector,
  'sound system': Speaker, 'music': Music, 'music system': Music,
  'catering': Utensils,
  'open air': Sun, 'city view': MapPin, 'view': MapPin,
  'bbq grill': Coffee, 'grill': Coffee,
  'private space': Shield, 'exclusive': Shield,
  'custom menu': Utensils,
  'kids menu': Utensils,
  'kitchen': Coffee,
};

function getAmenityIcon(label) {
  const key = label.toLowerCase().trim();
  for (const [k, Icon] of Object.entries(amenityIcons)) {
    if (key.includes(k)) return Icon;
  }
  return CheckCircle;
}

function getPriceValue(priceStr) {
  const cleaned = priceStr.replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

function StarRating({ rating = 0, size = 'sm' }) {
  const stars = Math.round(rating);
  const sizeClass = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${sizeClass} ${s <= stars ? 'fill-indigo-400 text-indigo-400' : 'text-slate-600/40'}`}
        />
      ))}
    </div>
  );
}

function FloatingBlob({ index }) {
  const positions = [
    { top: '10%', left: '0%', size: 450, gradient: 'from-indigo-300/20 via-indigo-400/10 to-transparent' },
    { top: '50%', right: '0%', size: 500, gradient: 'from-indigo-500/15 via-purple-400/8 to-transparent' },
    { top: '75%', left: '15%', size: 400, gradient: 'from-indigo-200/15 via-indigo-300/8 to-transparent' },
    { top: '20%', right: '20%', size: 350, gradient: 'from-indigo-400/12 via-purple-300/6 to-transparent' },
  ];
  const p = positions[index % positions.length];

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        top: p.top, left: p.left, right: p.right,
        width: p.size, height: p.size,
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
        duration: 14 + index * 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

function FloatingParticle({ index }) {
  const duration = 5 + Math.random() * 7;
  const delay = Math.random() * 6;
  const size = 2 + Math.random() * 4;
  const startX = Math.random() * 100;
  const startY = Math.random() * 100;

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size, height: size,
        left: `${startX}%`, top: `${startY}%`,
        background: ['rgba(99,102,241,0.4)', 'rgba(129,140,248,0.3)', 'rgba(165,180,252,0.3)', 'rgba(99,102,241,0.5)'][index % 4],
        boxShadow: `0 0 ${size * 3}px ${['rgba(99,102,241,0.2)', 'rgba(129,140,248,0.15)', 'rgba(165,180,252,0.15)', 'rgba(99,102,241,0.25)'][index % 4]}`,
      }}
      animate={{
        y: [0, -(20 + Math.random() * 30), 0],
        x: [0, (Math.random() - 0.5) * 20, 0],
        opacity: [0, 0.8, 0],
        scale: [0, 1.2, 0],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

function ShimmerCard() {
  return (
    <div className="rounded-3xl overflow-hidden bg-white/50 dark:bg-slate-800/50 animate-pulse">
      <div className="h-52 bg-slate-200/50 dark:bg-slate-700/50" />
      <div className="p-6 space-y-4">
        <div className="h-4 w-1/3 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg" />
        <div className="h-6 w-2/3 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg" />
        <div className="h-3 w-full bg-slate-200/50 dark:bg-slate-700/50 rounded-lg" />
        <div className="flex gap-2">
          {[1, 2, 3].map(i => <div key={i} className="h-7 w-16 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg" />)}
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="h-8 w-24 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg" />
          <div className="h-10 w-28 bg-slate-200/50 dark:bg-slate-700/50 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function TiltCard({ room, roomId, index, onBook, isReserved }) {
  const cardRef = useRef(null);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const rotateX = useSpring(useTransform(y, [0, 1], [12, -12]), { damping: 18, stiffness: 100 });
  const rotateY = useSpring(useTransform(x, [0, 1], [-12, 12]), { damping: 18, stiffness: 100 });
  const glareX = useTransform(x, [0, 1], [0, 100]);
  const glareY = useTransform(y, [0, 1], [0, 100]);

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  }, [x, y]);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = useCallback(() => {
    x.set(0.5);
    y.set(0.5);
    setIsHovered(false);
  }, [x, y]);

  const priceVal = getPriceValue(room.price);
  const isFree = room.price?.toLowerCase().includes('free');

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, perspective: 1200, transformStyle: 'preserve-3d' }}
        className="group relative"
      >
        <div className="relative rounded-3xl p-[1.5px] transition-all duration-500"
          style={{
            background: isHovered
              ? 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(129,140,248,0.2), rgba(99,102,241,0.1))'
              : 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(255,255,255,0.05))',
          }}
        >
          <div className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-3xl overflow-hidden border border-white/40 dark:border-slate-700/30 shadow-xl shadow-black/5">

            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(99,102,241,0.1) 0%, transparent 60%)`,
              }}
            />

            <div className="absolute -inset-20 opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none"
              style={{
                background: `radial-gradient(800px circle at 50% 50%, rgba(99,102,241,0.06), transparent 40%)`,
              }}
            />

            <div className="relative z-10" style={{ transformStyle: 'preserve-3d' }}>
              <div className="relative h-52 sm:h-56 overflow-hidden" style={{ transform: 'translateZ(25px)' }}>
                {!imageLoaded && !imageError && (
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/30 dark:to-indigo-800/20 animate-pulse" />
                )}
                {imageError ? (
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/30 dark:to-indigo-800/20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-100 dark:bg-indigo-800/40 flex items-center justify-center mb-2">
                        <span className="text-3xl">🏠</span>
                      </div>
                      <p className="text-xs text-indigo-400 dark:text-indigo-300 font-medium">{room.name}</p>
                    </div>
                  </div>
                ) : (
                  <img
                    src={room.image}
                    alt={room.name}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                    className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-2" style={{ transform: 'translateZ(30px)' }}>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 backdrop-blur-md rounded-full border border-white/20">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-white">{4 + (index % 5) * 0.2}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 backdrop-blur-md rounded-full border border-white/20">
                    <Users className="w-3 h-3 text-white/80" />
                    <span className="text-xs font-medium text-white">{room.capacity}</span>
                  </div>
                </div>

                {!isFree && (
                  <div className="absolute top-3 right-3" style={{ transform: 'translateZ(30px)' }}>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/25 transition-colors"
                    >
                      <Heart className="w-4 h-4 text-white" />
                    </motion.button>
                  </div>
                )}

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between" style={{ transform: 'translateZ(20px)' }}>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full">
                    <MapPin className="w-3 h-3 text-indigo-300" />
                    <span className="text-[10px] font-medium text-white/80">Premium Space</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full">
                    <Clock className="w-3 h-3 text-indigo-300" />
                    <span className="text-[10px] font-medium text-white/80">Available Now</span>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6" style={{ transform: 'translateZ(15px)' }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-indigo-400 dark:text-indigo-300">
                      {index === 0 ? 'Premium Choice' : index === 1 ? 'Best Value' : 'Elite Selection'}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 leading-tight">
                      {room.name}
                    </h3>
                  </div>
                  <StarRating rating={4 + (index % 5) * 0.2} />
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4 line-clamp-2">
                  {room.description || `Experience unparalleled comfort in our ${room.name.toLowerCase()}. Designed for ${room.capacity?.toLowerCase() || 'an intimate gathering'}, this space offers premium amenities and elegant ambiance.`}
                </p>

                <div className="mb-4">
                  <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-slate-400 dark:text-slate-500 mb-2.5">
                    Amenities
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {room.amenities?.slice(0, 5).map((a) => {
                      const Icon = getAmenityIcon(a);
                      return (
                        <motion.div
                          key={a}
                          whileHover={{ scale: 1.05 }}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50/80 dark:bg-indigo-900/30 rounded-lg border border-indigo-100/50 dark:border-indigo-700/20"
                        >
                          <Icon className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                          <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">{a}</span>
                        </motion.div>
                      );
                    })}
                    {room.amenities?.length > 5 && (
                      <span className="text-[10px] text-indigo-400 font-semibold self-center ml-1">
                        +{room.amenities.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-end justify-between pt-4 border-t border-slate-200/50 dark:border-slate-700/30"
                  style={{ transform: 'translateZ(20px)' }}>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mb-1">
                      {isFree ? '' : 'Starting From'}
                    </p>
                    {isFree ? (
                      <span className="text-2xl sm:text-3xl font-black text-indigo-500 dark:text-indigo-400">Free</span>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-indigo-500 dark:text-indigo-400">{room.price}</span>
                      </div>
                    )}
                  </div>
                  {isReserved ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="group relative px-5 py-2.5 rounded-xl font-semibold text-sm overflow-hidden bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 transition-all duration-300"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Reserved
                        <CheckCircle className="w-3.5 h-3.5" />
                      </span>
                    </motion.button>
                  ) : (
                    <Link to="/reserve" state={{ roomName: room.name, roomId: roomId }}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative px-5 py-2.5 rounded-xl font-semibold text-sm overflow-hidden bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 transition-all duration-300"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          Book Now
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        />
                      </motion.button>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-slate-900/[0.04] dark:ring-white/[0.04] pointer-events-none" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const { darkMode, toggleDarkMode } = useTheme();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [reservedRoomIds, setReservedRoomIds] = useState(new Set());

  useEffect(() => {
    axios.get('/api/listings/room')
      .then(res => setRooms(res.data.data || []))
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    axios.get('/api/reservations/confirmed')
      .then(res => {
        const ids = new Set();
        const reservations = res.data.data || [];
        console.log('[Reserved] API response:', reservations);
        reservations.forEach(r => {
          const statusOk = r.status === 'confirmed';
          const hasRoomId = !!r.roomId;
          const paidOk = r.paymentMethod === 'telebirr' || r.paymentMethod === 'bank';
          console.log('[Reserved] Reservation:', r._id, 'status:', r.status, 'roomId:', r.roomId, 'payment:', r.paymentMethod, '→', { statusOk, hasRoomId, paidOk });
          if (statusOk && hasRoomId && paidOk) {
            ids.add(String(r.roomId));
          }
        });
        console.log('[Reserved] Reserved room IDs:', [...ids]);
        setReservedRoomIds(ids);
      })
      .catch(err => {
        console.error('[Reserved] API error:', err);
        setReservedRoomIds(new Set());
      });
  }, []);

  const allAmenities = useMemo(() => {
    const set = new Set();
    rooms.forEach(r => (r.data?.amenities || []).forEach(a => set.add(a)));
    return Array.from(set).sort();
  }, [rooms]);

  const toggleAmenity = (amenity) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const filteredRooms = useMemo(() => {
    let result = [...rooms];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => {
        const d = r.data;
        const name = (d.name || '').toLowerCase();
        const desc = (d.description || '').toLowerCase();
        const amenities = (d.amenities || []).join(' ').toLowerCase();
        const capacity = (d.capacity || '').toLowerCase();
        return name.includes(q) || desc.includes(q) || amenities.includes(q) || capacity.includes(q);
      });
    }

    if (selectedAmenities.length > 0) {
      result = result.filter(r => {
        const roomAmenities = (r.data?.amenities || []).map(a => a.toLowerCase());
        return selectedAmenities.every(a => roomAmenities.includes(a.toLowerCase()));
      });
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => getPriceValue(a.data?.price || '0') - getPriceValue(b.data?.price || '0'));
        break;
      case 'price-desc':
        result.sort((a, b) => getPriceValue(b.data?.price || '0') - getPriceValue(a.data?.price || '0'));
        break;
      case 'name':
        result.sort((a, b) => (a.data?.name || '').localeCompare(b.data?.name || ''));
        break;
      default:
        break;
    }

    return result;
  }, [rooms, searchQuery, sortBy, selectedAmenities]);

  const clearFilters = () => {
    setSearchQuery('');
    setSortBy('default');
    setSelectedAmenities([]);
  };

  const hasActiveFilters = searchQuery || sortBy !== 'default' || selectedAmenities.length > 0;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
      <LuxuryHero variant="rooms" />

      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-indigo-50/30 to-white dark:from-slate-950 dark:via-indigo-950/10 dark:to-slate-950" />

        <FloatingBlob index={0} />
        <FloatingBlob index={1} />
        <FloatingBlob index={2} />
        <FloatingBlob index={3} />

        {[...Array(25)].map((_, i) => (
          <FloatingParticle key={i} index={i} />
        ))}

        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12 sm:mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-50/80 dark:bg-indigo-900/30 backdrop-blur-md border border-indigo-100/50 dark:border-indigo-700/30 shadow-sm mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
              </span>
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-300 tracking-wide">
                Explore Our Spaces
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-4"
            >
              Premium{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-indigo-700 dark:from-indigo-400 dark:to-indigo-300">
                Rooms & Lounges
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto"
            >
              Choose from our curated selection of elegant spaces designed for every occasion
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="max-w-5xl mx-auto mb-10"
          >
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                <input
                  type="text"
                  placeholder="Search rooms, amenities, capacity..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-10 py-3.5 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-indigo-100/60 dark:border-slate-700/60 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400/50 transition-all duration-300 shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-10 pr-10 py-3.5 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-indigo-100/60 dark:border-slate-700/60 rounded-2xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400/50 transition-all duration-300 shadow-sm cursor-pointer"
                >
                  <option value="default">Sort: Default</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Name: A-Z</option>
                </select>
                <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 pointer-events-none" />
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 pointer-events-none" />
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 shadow-sm border ${
                  showFilters || selectedAmenities.length > 0
                    ? 'bg-indigo-500 text-white border-indigo-500 shadow-indigo-500/20'
                    : 'bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl text-slate-700 dark:text-slate-300 border-indigo-100/60 dark:border-slate-700/60 hover:border-indigo-400/50'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {selectedAmenities.length > 0 && (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-[10px] font-bold">
                    {selectedAmenities.length}
                  </span>
                )}
              </motion.button>

              {hasActiveFilters && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear
                </motion.button>
              )}
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 p-5 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-indigo-100/60 dark:border-slate-700/60 rounded-2xl shadow-sm">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                      Filter by Amenities
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {allAmenities.map((amenity) => {
                        const isSelected = selectedAmenities.includes(amenity);
                        const Icon = getAmenityIcon(amenity);
                        return (
                          <motion.button
                            key={amenity}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleAmenity(amenity)}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                              isSelected
                                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                                : 'bg-indigo-50/50 dark:bg-indigo-900/20 text-slate-600 dark:text-slate-300 hover:bg-indigo-100/50 dark:hover:bg-indigo-800/30 border border-indigo-100/50 dark:border-indigo-700/20'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {amenity}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {Array.from({ length: 6 }).map((_, i) => <ShimmerCard key={i} />)}
            </div>
          ) : filteredRooms.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-5">
                <Search className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No rooms found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Try adjusting your search or filter criteria</p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
              >
                Clear All Filters
              </button>
            </motion.div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-between mb-6"
              >
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filteredRooms.length}</span> {filteredRooms.length === 1 ? 'space' : 'spaces'}
                </p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                <AnimatePresence mode="popLayout">
                  {filteredRooms.map((room, i) => (
                    <TiltCard
                      key={room._id}
                      room={room.data}
                      roomId={room._id}
                      index={i}
                      isReserved={reservedRoomIds.has(room._id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-700 dark:from-indigo-600 dark:to-indigo-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-300/10 blur-3xl" />
        </div>

        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 mb-6"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
              <span className="text-xs font-semibold text-white/90 tracking-wide">Luxury Experience</span>
            </motion.div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
              Ready for an Unforgettable Experience?
            </h2>
            <p className="text-indigo-100/80 text-lg max-w-xl mx-auto mb-8">
              Reserve your premium space today and indulge in the finest dining and ambiance the city has to offer.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/reserve">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group px-8 py-4 bg-white text-indigo-600 font-bold rounded-2xl shadow-2xl shadow-black/20 overflow-hidden relative"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Reserve Your Space
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>
              </Link>
              <Link to="/dining">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-transparent text-white font-semibold rounded-2xl border-2 border-white/30 hover:border-white/50 transition-colors"
                >
                  Explore Dining
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
