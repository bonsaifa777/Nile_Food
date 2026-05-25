import { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { FiPlay, FiShoppingCart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useRef, useCallback } from 'react';
import axios from 'axios';

const DEFAULT_HERO = {
  title: 'Fastest Delivery & Easy Pickup.',
  subtitle: 'Grocen ensures fresh grocery every morning to your family without getting out in this pandemic.',
  badge: 'Bike Delivery',
  cta: { label: 'Order Now', link: '/menu' },
  secondaryCta: { label: 'Order Process', link: '#' },
  quote: { text: 'When you are too lazy to cook,\nwe are just a click away!', author: 'Chef' },
  images: {
    main: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
    chef: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100&q=80',
    floating: [
      { image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=100&h=100&fit=crop&q=80', label: 'Pasta' },
      { image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=100&h=100&fit=crop&q=80', label: 'Steak' },
      { image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=100&h=100&fit=crop&q=80', label: 'Ramen' },
      { image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=100&h=100&fit=crop&q=80', label: 'Tacos' },
      { image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=100&h=100&fit=crop&q=80', label: 'Pancakes' },
    ]
  }
};

const FLOATING_POSITIONS = [
  { top: '0%', left: '50%', transform: 'translate(-50%, -50%)' },
  { top: '50%', left: '0%', transform: 'translate(-50%, -50%)' },
  { top: '50%', right: '0%', transform: 'translate(50%, -50%)' },
  { bottom: '5%', left: '12%' },
  { bottom: '5%', right: '12%' },
];

export default function Hero() {
  const [hero, setHero] = useState(null);
  const containerRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [15, -15]), { damping: 20, stiffness: 100 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-15, 15]), { damping: 20, stiffness: 100 });

  useEffect(() => {
    axios.get('/api/content/hero')
      .then(res => setHero(res.data.data?.value))
      .catch(() => setHero(null));
  }, []);

  const data = hero || DEFAULT_HERO;
  const { images, quote, badge, cta, secondaryCta } = data;

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  const titleParts = data.title?.split(/(Delivery|Pickup)/) || [];

  return (
    <section className="bg-gray-50 dark:bg-slate-950 relative overflow-hidden min-h-[90vh] flex items-center">
      <div className="absolute right-0 lg:right-[-5%] top-1/2 -translate-y-1/2 w-[70%] lg:w-[55%] h-[85%] lg:h-[80%] bg-white dark:bg-slate-900 rounded-full shadow-2xl shadow-gray-200/50 dark:shadow-black/30 pointer-events-none" />

      <div className="w-full px-4 sm:px-6 lg:px-12 py-12 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="relative max-w-xl mx-auto lg:mx-0"
          >
            {badge && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full mb-8 shadow-sm"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{badge}</span>
              </motion.div>
            )}

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 dark:text-white leading-[1.1] mb-6 tracking-tight">
              {titleParts.length > 1 ? (
                <>{titleParts[0]}<span className="text-primary-500">{titleParts[1]}</span>{titleParts[2]}</>
              ) : data.title}
            </h1>

            <p className="text-gray-500 dark:text-gray-400 text-base lg:text-lg max-w-lg mb-10 leading-relaxed">{data.subtitle}</p>

            <div className="flex flex-wrap items-center gap-4 mb-12">
              {cta && (
                <Link to={cta.link || '/menu'}>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-xl shadow-slate-900/20 transition-colors">
                    {cta.label || 'Order Now'}
                  </motion.button>
                </Link>
              )}
              {secondaryCta && (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-semibold rounded-full shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-slate-700">
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white"><FiPlay size={14} className="ml-0.5" /></div>
                  {secondaryCta.label || 'Order Process'}
                </motion.button>
              )}
            </div>

            {quote && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex items-center gap-4">
                {images?.chef && (
                  <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 border-2 border-primary-200 dark:border-primary-800/50 overflow-hidden shadow-md flex-shrink-0">
                    <img src={images.chef} alt={quote.author} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="border-l-2 border-primary-400 pl-4">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {quote.text?.split('\n').map((line, i) => (
                      <span key={i}>{line}{i === 0 && <br />}</span>
                    ))}
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative flex justify-center"
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <motion.div style={{ rotateX, rotateY }} className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[450px] lg:h-[450px] xl:w-[500px] xl:h-[500px]">
              <div className="absolute inset-0 bg-white dark:bg-slate-800 rounded-full shadow-2xl shadow-gray-200/50 dark:shadow-black/30 overflow-hidden z-0">
                {images?.main && (
                  <img src={images.main} alt="Fast delivery" className="w-full h-full object-cover object-center" />
                )}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none" />
              </div>

              {images?.floating?.map((food, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
                  className="absolute w-[52px] h-[52px] sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-white dark:bg-slate-700 rounded-full shadow-xl overflow-hidden border-[3px] border-white dark:border-slate-600"
                  style={{
                    ...FLOATING_POSITIONS[i],
                    zIndex: 10 - i,
                  }}
                >
                  <img src={food.image} alt={food.label} className="w-full h-full object-cover" />
                  <div className="absolute -top-0.5 -right-0.5 w-5 h-5 sm:w-6 sm:h-6 bg-slate-900 dark:bg-white rounded-full flex items-center justify-center shadow-sm">
                    <FiShoppingCart size={10} className="text-white dark:text-slate-900" />
                  </div>
                </motion.div>
              ))}

              <svg className="absolute -top-6 left-6 w-24 h-24 pointer-events-none opacity-60" viewBox="0 0 120 120">
                <path d="M10 100 Q 40 20, 100 30" stroke="#6366f1" strokeWidth="2.5" fill="none" strokeDasharray="6 6" />
                <polygon points="100,30 95,25 97,35" fill="#6366f1" />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
