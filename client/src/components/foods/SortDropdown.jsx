import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiCheck } from 'react-icons/fi';

const sortKeys = {
  popularity: 'menu.sort.popularity',
  rating: 'menu.sort.bestRating',
  fastest: 'menu.sort.fastestDelivery',
  'price-low': 'menu.sort.lowestPrice',
  'price-high': 'menu.sort.highestPrice',
  trending: 'menu.sort.trending',
  recommended: 'menu.sort.recommended',
};

const sortOptions = [
  { value: 'popularity', icon: '🔥' },
  { value: 'rating', icon: '⭐' },
  { value: 'fastest', icon: '⚡' },
  { value: 'price-low', icon: '💰' },
  { value: 'price-high', icon: '💎' },
  { value: 'trending', icon: '📈' },
  { value: 'recommended', icon: '✅' },
];

export default function SortDropdown({ sortBy, onSortChange }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const active = sortOptions.find((o) => o.value === sortBy) || sortOptions[0];

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:border-orange-400 dark:hover:border-orange-500 transition-all shadow-sm"
      >
        <span>{active.icon}</span>
        <span className="font-medium">{t(sortKeys[active.value])}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <FiChevronDown size={14} className="text-gray-400" />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 py-2 z-50 overflow-hidden"
          >
            {sortOptions.map((opt) => {
              const isActive = sortBy === opt.value;
              return (
                <motion.button
                  key={opt.value}
                  whileHover={{ x: 4 }}
                  onClick={() => {
                    onSortChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${
                    isActive
                      ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-semibold'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700/30'
                  }`}
                >
                  <span className="text-base">{opt.icon}</span>
                  <span className="flex-1 text-left">{t(sortKeys[opt.value])}</span>
                  {isActive && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    >
                      <FiCheck size={14} className="text-orange-500" />
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
