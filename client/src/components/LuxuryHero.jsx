import { useRef, useCallback, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { CalendarDays, Users, Search, ChevronDown, SlidersHorizontal, ArrowUpDown, Sparkles } from 'lucide-react';

function FloatingBlob({ index }) {
  const positions = [
    { top: '-5%', left: '-5%', size: 550, gradient: 'from-indigo-200/40 via-indigo-300/20 to-transparent' },
    { top: '40%', right: '-8%', size: 500, gradient: 'from-indigo-100/30 via-indigo-200/15 to-transparent' },
    { top: '65%', left: '10%', size: 400, gradient: 'from-indigo-300/25 via-indigo-400/10 to-transparent' },
    { top: '15%', right: '20%', size: 350, gradient: 'from-indigo-200/20 via-white/10 to-transparent' },
  ];
  const p = positions[index % positions.length];

  const darkPositions = [
    { top: '-5%', left: '-5%', size: 550, gradient: 'from-indigo-500/20 via-indigo-600/10 to-transparent' },
    { top: '40%', right: '-8%', size: 500, gradient: 'from-indigo-400/15 via-indigo-500/8 to-transparent' },
    { top: '65%', left: '10%', size: 400, gradient: 'from-indigo-600/15 via-indigo-700/8 to-transparent' },
    { top: '15%', right: '20%', size: 350, gradient: 'from-indigo-500/12 via-indigo-400/6 to-transparent' },
  ];
  const dp = darkPositions[index % darkPositions.length];

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none hidden dark:block"
      style={{
        top: dp.top, left: dp.left, right: dp.right,
        width: dp.size, height: dp.size,
        background: `linear-gradient(135deg, ${dp.gradient})`,
        filter: 'blur(100px)',
      }}
      animate={{
        scale: [1, 1.3, 1], rotate: [0, 18, 0],
        x: [0, 35, 0], y: [0, -35, 0],
      }}
      transition={{ duration: 16 + index * 2, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

function FloatingBlobLight({ index }) {
  const positions = [
    { top: '-5%', left: '-5%', size: 550, gradient: 'from-indigo-200/40 via-indigo-100/20 to-transparent' },
    { top: '40%', right: '-8%', size: 500, gradient: 'from-indigo-100/30 via-indigo-50/15 to-transparent' },
    { top: '65%', left: '10%', size: 400, gradient: 'from-indigo-200/25 via-indigo-100/10 to-transparent' },
    { top: '15%', right: '20%', size: 350, gradient: 'from-indigo-100/20 via-white/10 to-transparent' },
  ];
  const p = positions[index % positions.length];

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none dark:hidden"
      style={{
        top: p.top, left: p.left, right: p.right,
        width: p.size, height: p.size,
        background: `linear-gradient(135deg, ${p.gradient})`,
        filter: 'blur(100px)',
      }}
      animate={{
        scale: [1, 1.3, 1], rotate: [0, 18, 0],
        x: [0, 35, 0], y: [0, -35, 0],
      }}
      transition={{ duration: 16 + index * 2, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

function FloatingParticle({ index }) {
  const duration = 6 + Math.random() * 6;
  const delay = Math.random() * 5;
  const size = 2 + Math.random() * 4;
  const startX = Math.random() * 100;
  const startY = Math.random() * 100;

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size, height: size,
        left: `${startX}%`, top: `${startY}%`,
        background: [
          'rgba(99,102,241,0.4)', 'rgba(129,140,248,0.3)',
          'rgba(165,180,252,0.3)', 'rgba(99,102,241,0.5)',
          'rgba(199,210,254,0.4)',
        ][index % 5],
        boxShadow: `0 0 ${size * 4}px ${['rgba(99,102,241,0.2)', 'rgba(129,140,248,0.15)', 'rgba(165,180,252,0.15)', 'rgba(99,102,241,0.25)', 'rgba(199,210,254,0.2)'][index % 5]}`,
      }}
      animate={{
        y: [0, -(25 + Math.random() * 35), 0],
        x: [0, (Math.random() - 0.5) * 25, 0],
        opacity: [0, 0.9, 0],
        scale: [0, 1.3, 0],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

function FilterBar() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('default');

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="flex flex-wrap items-center gap-3 max-w-5xl mx-auto mt-12"
    >
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-300" />
        <input
          type="text"
          placeholder="Search rooms, cuisines, experiences..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-indigo-200/50 dark:border-indigo-400/20 rounded-xl text-sm text-indigo-950 dark:text-white placeholder-indigo-300 dark:placeholder-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400/50 transition-all duration-300"
        />
      </div>
      <div className="relative">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="appearance-none pl-10 pr-10 py-3 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-indigo-200/50 dark:border-indigo-400/20 rounded-xl text-sm text-indigo-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400/50 transition-all duration-300 cursor-pointer"
        >
          <option value="default">Sort by: Default</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
          <option value="popular">Most Popular</option>
        </select>
        <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-300 pointer-events-none" />
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-300 pointer-events-none" />
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-5 py-3 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-indigo-200/50 dark:border-indigo-400/20 rounded-xl text-sm font-semibold text-indigo-700 dark:text-indigo-300 hover:border-indigo-400/50 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filters
      </motion.button>
    </motion.div>
  );
}

export default function LuxuryHero({ variant = 'rooms' }) {
  const { darkMode } = useTheme();
  const sectionRef = useRef(null);
  const searchRef = useRef(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  const [focusedField, setFocusedField] = useState(null);

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const tiltX = useSpring(useTransform(y, [0, 1], [3, -3]), { damping: 25, stiffness: 150 });
  const tiltY = useSpring(useTransform(x, [0, 1], [-3, 3]), { damping: 25, stiffness: 150 });

  const handleMouseMove = useCallback((e) => {
    if (!searchRef.current) return;
    const rect = searchRef.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  }, [x, y]);

  const isRooms = variant === 'rooms';

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[90vh] sm:min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-b from-white via-indigo-50/40 to-white dark:from-indigo-950 dark:via-[#0a0a2e] dark:to-indigo-950"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/20 via-transparent to-indigo-50/20 dark:from-indigo-900/10 dark:via-transparent dark:to-indigo-800/10" />

      <FloatingBlobLight index={0} />
      <FloatingBlobLight index={1} />
      <FloatingBlobLight index={2} />
      <FloatingBlobLight index={3} />

      <FloatingBlob index={0} />
      <FloatingBlob index={1} />
      <FloatingBlob index={2} />
      <FloatingBlob index={3} />

      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(99,102,241,0.5) 1px, transparent 0)',
        backgroundSize: '40px 40px',
      }} />

      {[...Array(35)].map((_, i) => (
        <FloatingParticle key={i} index={i} />
      ))}

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-center mb-10 sm:mb-14"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/70 dark:bg-indigo-900/30 backdrop-blur-md border border-indigo-200/60 dark:border-indigo-700/30 shadow-lg shadow-indigo-500/5 mb-8"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-300" />
              <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-200 tracking-wide">
                Reserve Your Delicious Experience
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-[1.05] mb-5"
            >
              <span className="text-indigo-950 dark:text-white">Find Your Perfect<br />
              </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 dark:from-indigo-300 dark:via-indigo-200 dark:to-indigo-400">
                {isRooms ? 'Room & Dining' : 'Meal & Dining'}{' '}
              </span>
              <span className="text-indigo-950 dark:text-white">Experience</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-base sm:text-lg text-indigo-400/80 dark:text-indigo-300/70 max-w-2xl mx-auto leading-relaxed"
            >
              Discover {isRooms ? 'premium rooms, ' : ''}delicious dishes, premium dining spaces, breathtaking ambiance, and unforgettable culinary experiences tailored for your taste.
            </motion.p>
          </motion.div>

          <motion.div
            ref={searchRef}
            onMouseMove={handleMouseMove}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ rotateX: tiltX, rotateY: tiltY, perspective: 1000, transformStyle: 'preserve-3d' }}
            className="relative mx-auto max-w-5xl"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400/30 via-indigo-500/20 to-indigo-400/30 rounded-3xl blur-xl opacity-60" />
            <div className="absolute -inset-2 bg-gradient-to-r from-indigo-400/15 via-transparent to-indigo-400/15 rounded-3xl blur-2xl" />

            <div className="relative bg-white/70 dark:bg-white/5 backdrop-blur-2xl border border-indigo-200/50 dark:border-indigo-400/20 rounded-3xl p-1 shadow-2xl shadow-indigo-500/10 dark:shadow-black/30">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/60 to-transparent dark:from-white/5 to-transparent pointer-events-none" />
              <div
                className="absolute inset-0 rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at ${x.get() * 100}% ${y.get() * 100}%, rgba(99,102,241,0.08) 0%, transparent 60%)`,
                }}
              />

              <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center gap-0 lg:gap-0 p-3 sm:p-4">
                <div className={`flex-1 relative group ${focusedField === 'checkin' ? 'z-20' : 'z-10'}`}>
                  <div className={`px-4 sm:px-6 py-4 sm:py-5 rounded-2xl transition-all duration-300 ${focusedField === 'checkin' ? 'bg-indigo-50/60 dark:bg-white/10 ring-1 ring-indigo-400/40 shadow-lg shadow-indigo-500/10' : 'hover:bg-indigo-50/30 dark:hover:bg-white/5'}`}>
                    <label className="block text-[10px] uppercase tracking-[0.15em] font-semibold text-indigo-500 dark:text-indigo-300 mb-1.5">
                      Check In
                    </label>
                    <div className="flex items-center gap-2.5">
                      <CalendarDays className="w-4 h-4 text-indigo-400/70 dark:text-indigo-300/70 shrink-0" />
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        onFocus={() => setFocusedField('checkin')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full bg-transparent text-indigo-950 dark:text-white text-sm font-medium focus:outline-none [color-scheme:light] dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                        placeholder="Select date"
                      />
                    </div>
                  </div>
                  <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-10 bg-indigo-200/50 dark:bg-white/10" />
                </div>

                <div className={`flex-1 relative group ${focusedField === 'checkout' ? 'z-20' : 'z-10'}`}>
                  <div className={`px-4 sm:px-6 py-4 sm:py-5 rounded-2xl transition-all duration-300 ${focusedField === 'checkout' ? 'bg-indigo-50/60 dark:bg-white/10 ring-1 ring-indigo-400/40 shadow-lg shadow-indigo-500/10' : 'hover:bg-indigo-50/30 dark:hover:bg-white/5'}`}>
                    <label className="block text-[10px] uppercase tracking-[0.15em] font-semibold text-indigo-500 dark:text-indigo-300 mb-1.5">
                      Check Out
                    </label>
                    <div className="flex items-center gap-2.5">
                      <CalendarDays className="w-4 h-4 text-indigo-400/70 dark:text-indigo-300/70 shrink-0" />
                      <input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        onFocus={() => setFocusedField('checkout')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full bg-transparent text-indigo-950 dark:text-white text-sm font-medium focus:outline-none [color-scheme:light] dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                        placeholder="Select date"
                      />
                    </div>
                  </div>
                  <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-10 bg-indigo-200/50 dark:bg-white/10" />
                </div>

                <div className={`flex-1 relative group ${focusedField === 'guests' ? 'z-20' : 'z-10'}`}>
                  <div className={`px-4 sm:px-6 py-4 sm:py-5 rounded-2xl transition-all duration-300 ${focusedField === 'guests' ? 'bg-indigo-50/60 dark:bg-white/10 ring-1 ring-indigo-400/40 shadow-lg shadow-indigo-500/10' : 'hover:bg-indigo-50/30 dark:hover:bg-white/5'}`}>
                    <label className="block text-[10px] uppercase tracking-[0.15em] font-semibold text-indigo-500 dark:text-indigo-300 mb-1.5">
                      Guests
                    </label>
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-indigo-400/70 dark:text-indigo-300/70 shrink-0" />
                      <select
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        onFocus={() => setFocusedField('guests')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full bg-transparent text-indigo-950 dark:text-white text-sm font-medium focus:outline-none appearance-none cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                          <option key={n} value={n} className="bg-white dark:bg-indigo-950 text-indigo-950 dark:text-white">
                            {n} {n === 1 ? 'Guest' : 'Guests'}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-indigo-400/50 dark:text-indigo-300/50 shrink-0 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="lg:self-stretch flex items-stretch p-1 lg:p-0">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="group relative w-full lg:w-auto px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-bold text-sm sm:text-base overflow-hidden"
                    style={{ transform: 'translateZ(15px)' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-indigo-700 dark:from-indigo-500 dark:to-indigo-600" />
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 bg-white/20 blur-xl" />
                    </div>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
                    />
                    <span className="relative z-10 flex items-center justify-center gap-2.5 text-white">
                      <Search className="w-4 h-4" />
                      Search Meals
                    </span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          <FilterBar />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />
    </section>
  );
}
