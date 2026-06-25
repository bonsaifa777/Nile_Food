import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiChevronRight, FiTrendingUp, FiStar, FiClock, FiZap } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const categories = [
  { id: '', name: 'All Foods', icon: '🍽️' },
  { id: 'Fast Food', name: 'Fast Food', icon: '🍟' },
  { id: 'Burgers', name: 'Burgers', icon: '🍔' },
  { id: 'Pizza', name: 'Pizza', icon: '🍕' },
  { id: 'Chicken', name: 'Chicken', icon: '🍗' },
  { id: 'Traditional', name: 'Traditional', icon: '🥘' },
  { id: 'Desserts', name: 'Desserts', icon: '🍰' },
  { id: 'Drinks', name: 'Drinks', icon: '🥤' },
  { id: 'Healthy', name: 'Healthy', icon: '🥗' },
  { id: 'Breakfast', name: 'Breakfast', icon: '🌅' },
  { id: 'Lunch', name: 'Lunch', icon: '☀️' },
  { id: 'Dinner', name: 'Dinner', icon: '🌙' },
  { id: 'Vegan', name: 'Vegan', icon: '🌱' },
  { id: 'Seafood', name: 'Seafood', icon: '🦐' },
  { id: 'BBQ & Grill', name: 'BBQ & Grill', icon: '🔥' },
  { id: 'Hotel Specials', name: 'Hotel Specials', icon: '⭐' },
  { id: 'Beverages', name: 'Beverages', icon: '🧃' },
  { id: 'Snacks', name: 'Snacks', icon: '🍿' },
];

const megaItems = [
  { label: 'Popular Near You', icon: FiZap, color: 'from-indigo-500 to-purple-600' },
  { label: 'Chef Picks', icon: FiStar, color: 'from-amber-400 to-yellow-500' },
  { label: 'Trending Foods', icon: FiTrendingUp, color: 'from-emerald-500 to-teal-500' },
  { label: 'Frequently Ordered', icon: FiClock, color: 'from-blue-500 to-indigo-500' },
];

const subcategories = {
  'Pizza': ['Margherita', 'Pepperoni', 'BBQ Chicken', 'Veggie', 'Hawaiian', 'Supreme', 'Cheese', 'Gluten-Free'],
  'Burgers': ['Classic', 'Cheese', 'Double', 'Chicken', 'Veggie', 'Bacon', 'Spicy', 'Special'],
  'Drinks': ['Soft Drinks', 'Juices', 'Coffee', 'Tea', 'Smoothies', 'Milkshakes', 'Water', 'Energy Drinks'],
  'Desserts': ['Cakes', 'Ice Cream', 'Pudding', 'Cookies', 'Pastries', 'Fruit', 'Chocolate', 'Special'],
};

export default function CategoryNav({ selectedCategory, onSelectCategory }) {
  const [activeCat, setActiveCat] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const timeoutRef = useRef(null);
  const { t } = useTranslation();

  const catKeys = {
    '': 'categories.allFoods',
    'Fast Food': 'categories.fastFood',
    'Burgers': 'categories.burgers',
    'Chicken': 'categories.chicken',
    'Traditional': 'categories.traditional',
    'Healthy': 'categories.healthy',
    'Breakfast': 'categories.breakfast',
    'Lunch': 'categories.lunch',
    'Dinner': 'categories.dinner',
    'Vegan': 'categories.vegan',
    'Seafood': 'categories.seafood',
    'BBQ & Grill': 'categories.bbqGrill',
    'Hotel Specials': 'categories.hotelSpecials',
    'Beverages': 'categories.beverages',
    'Snacks': 'categories.snacks',
  };

  const megaKeys = {
    'Popular Near You': 'categories.popularNearYou',
    'Chef Picks': 'categories.chefPicks',
    'Trending Foods': 'categories.trendingFoods',
    'Frequently Ordered': 'categories.frequentlyOrdered',
  };

  const handleMouseEnter = (catId) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveCat(catId);
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsHovering(false);
      setActiveCat(null);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const subs = subcategories[activeCat];

  return (
    <div className="relative">
      <div
        className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-1"
        onMouseLeave={handleMouseLeave}
      >
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const isHovered = activeCat === cat.id;
          return (
            <motion.button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              onMouseEnter={() => handleMouseEnter(cat.id)}
              layout
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="cat-pill"
                  className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg shadow-orange-500/25"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              {isHovered && !isActive && (
                <motion.div
                  layoutId="cat-hover"
                  className="absolute inset-0 bg-gray-100 dark:bg-slate-700/50 rounded-xl"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{cat.icon}</span>
              <span className="relative z-10">{t(catKeys[cat.id])}</span>
              {cat.id && (
                <FiChevronDown
                  size={12}
                  className={`relative z-10 transition-transform duration-200 ${isHovered ? 'rotate-180' : ''}`}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {isHovering && activeCat && subs && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onMouseEnter={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              setIsHovering(true);
            }}
            onMouseLeave={handleMouseLeave}
            className="absolute top-full left-0 mt-2 w-full max-w-4xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden z-50"
          >
            <div className="flex">
              <div className="w-64 p-6 bg-gray-50 dark:bg-slate-800/50 border-r border-gray-100 dark:border-slate-700">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
{t('categories.subcategories')}
                </h4>
                <div className="space-y-1">
                  {subs.map((sub) => (
                    <motion.button
                      key={sub}
                      whileHover={{ x: 4 }}
                      onClick={() => {
                        onSelectCategory(activeCat);
                        setIsHovering(false);
                        setActiveCat(null);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <FiChevronRight size={12} className="text-orange-400" />
                        {sub}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="flex-1 p-6">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
{t('categories.discover')}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {megaItems.map((item) => (
                    <motion.button
                      key={item.label}
                      whileHover={{ y: -2, scale: 1.02 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-700/30 hover:shadow-md transition-all group"
                      onClick={() => {
                        onSelectCategory(activeCat);
                        setIsHovering(false);
                        setActiveCat(null);
                      }}
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shadow-sm`}>
                        <item.icon size={16} className="text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 group-hover:text-orange-500 transition-colors">
{t(megaKeys[item.label])}
                      </span>
                    </motion.button>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                  <div className="flex gap-3">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        whileHover={{ y: -3 }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-700/30 cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center text-xs">
                          🍔
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">Food Item {i}</p>
                          <p className="text-[10px] text-orange-500 font-bold">ETB {199 + i * 50}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
