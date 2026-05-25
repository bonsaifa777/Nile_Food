import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import axios from 'axios';

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    Promise.all([
      axios.get('/api/listings/testimonial'),
      axios.get('/api/listings/testimonial/real')
    ])
      .then(([listingsRes, reviewsRes]) => {
        const listings = listingsRes.data.data || [];
        const realReviews = reviewsRes.data.data || [];
        const combined = [...realReviews, ...listings];
        setTestimonials(combined);
      })
      .catch(() => setTestimonials([]));
  }, []);

  const visibleCount = 3;
  const maxIndex = Math.max(0, testimonials.length - visibleCount);

  useEffect(() => {
    if (isAutoPlaying && testimonials.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
      }, 4000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isAutoPlaying, maxIndex, testimonials.length]);

  const next = () => {
    setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const prev = () => {
    setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  if (testimonials.length === 0) return null;

  return (
    <section className="py-24 bg-gradient-to-b from-white to-indigo-50/30 dark:from-slate-950 dark:to-slate-900 relative overflow-hidden">
      <div className="w-full px-4">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <motion.span initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} className="inline-block px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-semibold text-sm mb-6">
            Testimonials
          </motion.span>
          <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-gray-900 via-indigo-700 to-gray-900 dark:from-white dark:via-indigo-400 dark:to-white bg-clip-text text-transparent">
            Loved by Thousands
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">See what our customers are saying about their experience</p>
        </motion.div>

        <div className="relative">
          <div className="grid md:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {testimonials.slice(currentIndex, currentIndex + visibleCount).map((t, index) => {
                const d = t.data;
                return (
                  <motion.div key={t._id} layout initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -40, scale: 0.95 }} transition={{ delay: index * 0.1 }} whileHover={{ y: -8 }} className="group">
                    <div className="h-full p-8 bg-white dark:bg-slate-800/80 rounded-3xl border border-gray-100 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-all duration-500">
                      <div className="flex gap-1 mb-6">
                        {[...Array(d.rating || 5)].map((_, i) => (
                          <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: index * 0.1 + i * 0.05 }}>
                            <FiStar className="w-5 h-5 text-indigo-500 fill-indigo-500" />
                          </motion.div>
                        ))}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-lg mb-8 italic leading-relaxed">&quot;{d.text}&quot;</p>
                      <div className="flex items-center gap-4 pt-6 border-t border-gray-100 dark:border-slate-700/50">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-lg">
                          {d.initial || d.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">{d.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{d.role}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center gap-4 mt-12">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={prev} className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
              <FiChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </motion.button>
            <div className="flex gap-2">
              {[...Array(maxIndex + 1)].map((_, i) => (
                <motion.button key={i} whileHover={{ scale: 1.2 }} onClick={() => { setCurrentIndex(i); setIsAutoPlaying(false); setTimeout(() => setIsAutoPlaying(true), 8000); }}
                  className={`rounded-full transition-all duration-300 ${i === currentIndex ? 'w-8 h-3 bg-indigo-600' : 'w-3 h-3 bg-gray-300 dark:bg-slate-600 hover:bg-gray-400'}`} />
              ))}
            </div>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={next} className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
              <FiChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}
