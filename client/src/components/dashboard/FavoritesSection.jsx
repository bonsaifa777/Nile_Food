import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiHeart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

export default function FavoritesSection({ favorites }) {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const d = darkMode;

  if (!favorites || favorites.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 px-6"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-red-400/20 to-rose-400/20 flex items-center justify-center mx-auto mb-6"
        >
          <FiHeart className="text-red-400" size={32} />
        </motion.div>
        <h3 className={`text-xl font-bold mb-2 ${d ? 'text-white' : 'text-gray-900'}`}>{t('dashboard.noFavoritesYet')}</h3>
        <p className={`${d ? 'text-white/40' : 'text-gray-500'} text-sm mb-4`}>{t('dashboard.saveFavoriteDishes')}</p>
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-2xl shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all"
        >
          {t('dashboard.browseMenu')}
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {favorites.slice(0, 6).map((item, i) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onMouseEnter={() => setHoveredId(item._id)}
              onMouseLeave={() => setHoveredId(null)}
              className="relative group rounded-2xl overflow-hidden"
            >
              <Link to={`/menu/${item._id}`}>
                <div className="aspect-[4/3] overflow-hidden">
                  <motion.img
                    src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    animate={{ scale: hoveredId === item._id ? 1.1 : 1 }}
                    transition={{ duration: 0.4 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-sm font-semibold text-white">{item.name}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-indigo-300 text-sm font-bold">ETB {item.price?.toFixed(2)}</span>
                    <div className="flex items-center gap-1">
                      <FiStar size={12} className="text-amber-400" />
                      <span className="text-xs text-white/60">{item.rating?.toFixed(1) || '4.5'}</span>
                    </div>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: hoveredId === item._id ? 1 : 0, y: hoveredId === item._id ? 0 : 10 }}
                  className="absolute top-3 right-3"
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/80 backdrop-blur flex items-center justify-center">
                    <FiShoppingCart className="text-white" size={14} />
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
  );
}
