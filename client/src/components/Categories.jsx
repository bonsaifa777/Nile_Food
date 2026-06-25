import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiShoppingCart } from 'react-icons/fi';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const CATEGORY_ICONS = {
  'Fast Food': '🍟', 'Burgers': '🍔', 'Pizza': '🍕', 'Chicken': '🍗',
  'Traditional': '🥘', 'Desserts': '🍰', 'Drinks': '🥤', 'Healthy': '🥗',
  'Breakfast': '🌅', 'Lunch': '☀️', 'Dinner': '🌙', 'Vegan': '🌱',
  'Seafood': '🦐', 'BBQ & Grill': '🔥', 'Hotel Specials': '⭐',
  'Beverages': '🧃', 'Snacks': '🍿', 'Coffee': '☕'
};

const CATEGORY_FALLBACK = [
  'Fast Food', 'Burgers', 'Pizza', 'Chicken', 'Traditional',
  'Desserts', 'Drinks', 'Healthy', 'Breakfast', 'Lunch', 'Dinner',
  'Vegan', 'Seafood', 'BBQ & Grill', 'Hotel Specials', 'Beverages', 'Snacks', 'Coffee'
];

export default function Categories() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/api/categories');
        const data = (res.data.data || []).filter(c => c.isActive !== false);
        if (data.length) return setCategories(data);
      } catch {}
      try {
        const res = await axios.get('/api/foods?limit=200');
        const foods = res.data.data?.foods || [];
        const seen = new Set();
        const fromFoods = foods
          .filter(f => f.category && f.category.name)
          .map(f => {
            const cat = typeof f.category === 'object' ? f.category : { name: f.category, _id: f.category };
            return { _id: cat._id || cat.name, name: cat.name, image: f.image };
          })
          .filter(c => { const key = c.name; return seen.has(key) ? false : seen.add(key); });
        if (fromFoods.length) return setCategories(fromFoods);
      } catch {}
      setCategories(CATEGORY_FALLBACK.map((name, i) => ({ _id: name, name, image: '' })));
      setLoading(false);
    };
    fetchCategories().finally(() => setLoading(false));
  }, []);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      return () => el.removeEventListener('scroll', checkScroll);
    }
  }, [categories]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction === 'left' ? -250 : 250, behavior: 'smooth' });
    }
  };

  if (!loading && categories.length === 0) return null;

  return (
    <section className="py-12 bg-white dark:bg-slate-950">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            {t('home.howItWorks')} <span className="text-primary-500">{t('menu.categories')}</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">{t('home.featuredDishes')}</p>
        </div>

        <div className="relative">
          {canScrollLeft && (
            <button onClick={() => scroll('left')} className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 flex items-center justify-center shadow-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 transition-colors">
              <FiChevronLeft size={20} />
            </button>
          )}
          {canScrollRight && (
            <button onClick={() => scroll('right')} className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 flex items-center justify-center shadow-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 transition-colors">
              <FiChevronRight size={20} />
            </button>
          )}

          <div ref={scrollRef} className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-2 px-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full shimmer" />
                  <div className="h-4 w-16 mx-auto mt-3 shimmer rounded" />
                </div>
              ))
            ) : (
              categories.map((cat, index) => (
                <motion.div key={cat._id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} className="flex-shrink-0">
                  <Link to={`/menu?category=${cat._id}`}>
                    <motion.div whileHover={{ y: -8 }} className="group cursor-pointer">
                      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gray-50 dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 overflow-hidden shadow-md group-hover:shadow-xl group-hover:border-primary-200 dark:group-hover:border-primary-800/50 transition-all duration-300 relative">
                        {cat.image ? (
                          <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">{CATEGORY_ICONS[cat.name] || '🍽️'}</div>
                        )}
                        <div className="absolute top-1 right-1 w-7 h-7 bg-slate-900 dark:bg-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          <FiShoppingCart size={12} className="text-white dark:text-slate-900" />
                        </div>
                      </div>
                      <p className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mt-3 group-hover:text-primary-500 transition-colors">{cat.name}</p>
                    </motion.div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div className="text-center mt-8">
          <Link to="/menu" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl shadow-lg transition-colors">
            {t('common.viewAll')} <FiChevronRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
