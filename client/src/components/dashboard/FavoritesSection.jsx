import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { FiHeart, FiStar, FiShoppingCart, FiChevronRight } from 'react-icons/fi';

export default function FavoritesSection({ favorites }) {
  const { darkMode } = useTheme();
  const d = darkMode;
  const [hoveredId, setHoveredId] = useState(null);

  if (!favorites || favorites.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl overflow-hidden backdrop-blur-xl ${
          d ? 'bg-slate-900/60 border border-white/10' : 'bg-white/90 border border-gray-200/60 shadow-xl'
        }`}
      >
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-red-500/20 flex items-center justify-center mx-auto mb-4">
            <FiHeart className="text-pink-400" size={24} />
          </div>
          <h3 className={`text-lg font-semibold ${d ? 'text-white' : 'text-gray-900'} mb-2`}>No Favorites Yet</h3>
          <p className={`${d ? 'text-white/40' : 'text-gray-500'} text-sm mb-4`}>Save your favorite dishes for quick access</p>
          <Link to="/menu" className="px-6 py-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 text-sm font-medium inline-block hover:bg-indigo-500/30 transition-all">
            Browse Menu
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl overflow-hidden backdrop-blur-xl ${
        d ? 'bg-slate-900/60 border border-white/10' : 'bg-white/90 border border-gray-200/60 shadow-xl'
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${d ? 'from-pink-500/3' : 'from-pink-500/[0.01]'} to-transparent pointer-events-none`} />

      <div className="relative p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold flex items-center gap-2 ${d ? 'text-white' : 'text-gray-900'}`}>
            <FiHeart className="text-pink-400" />
            Favorites
          </h2>
          <Link to="/menu" className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 text-xs flex items-center gap-1">
            View All <FiChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
      </div>
    </motion.div>
  );
}
