import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiStar, FiClock } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function FoodCard({ food, index = 0 }) {
  const { addToCart } = useCart();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const tl = (item, field) => {
    if (lang === 'en' || !item) return item?.[field];
    return item[field + '_' + lang] || item[field];
  };
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imgAttempt, setImgAttempt] = useState(0);
  const [cartBounce, setCartBounce] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCartBounce(true);
    addToCart(food, 1);
    toast.success(t('foodCard.addedToCart', { name: tl(food, 'name') }));
    setTimeout(() => setCartBounce(false), 400);
  };

  const discount = food.originalPrice
    ? Math.round(((food.originalPrice - food.price) / food.originalPrice) * 100)
    : 0;

  const seed = useMemo(
      () => (food.name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0),
    [food.name]
  );

  const imgSources = [
    food.image,
    `https://loremflickr.com/600/400/food?lock=${seed}`,
    `https://picsum.photos/seed/${seed}/600/400`,
    `https://placehold.co/600x400/4f46e5/ffffff?text=${encodeURIComponent(food.name || '')}`,
  ];

  const imgSrc = imgSources[Math.min(imgAttempt, imgSources.length - 1)];

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setTilt({ x: y * -8, y: x * 8 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.6, ease: 'easeOut' }}
      className="perspective-1000"
    >
      <Link to={`/menu/${food._id}`} className="group block">
        <motion.div
          className="relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-800 shadow-md hover:shadow-2xl dark:hover:shadow-indigo-500/10 transition-shadow duration-500"
          animate={{ rotateX: tilt.x, rotateY: tilt.y }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          style={{ transformStyle: 'preserve-3d' }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
        >
          {/* Gleam overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent z-20 pointer-events-none"
            initial={{ x: '-100%' }}
            animate={{ x: isHovered ? '100%' : '-100%' }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />

          {/* Image section */}
          <div className="relative overflow-hidden bg-gray-100 dark:bg-slate-800" style={{ aspectRatio: '4/5' }}>
            <motion.img
              src={imgSrc}
              alt={tl(food, 'name')}
              className="w-full h-full object-cover"
              animate={{ scale: isHovered ? 1.15 : 1 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              onError={() => setImgAttempt((p) => p + 1)}
            />

            {/* Multi-layer gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 pointer-events-none" />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2 z-10">
              {discount > 0 && (
                <motion.span
                  initial={{ opacity: 0, x: -20, rotate: -10 }}
                  animate={{ opacity: 1, x: 0, rotate: 0 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                  className="px-3 py-1 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[11px] font-extrabold rounded-full shadow-lg shadow-red-500/30"
                >
                  {discount}% {t('foodCard.off')}
                </motion.span>
              )}
              {food.featured && (
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[11px] font-extrabold rounded-full shadow-lg shadow-amber-500/30"
                >
                  {t('foodCard.featured')}
                </motion.span>
              )}
            </div>

            {/* Favorite button */}
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsFavorite(!isFavorite);
              }}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-center shadow-lg hover:shadow-xl z-10"
            >
              <motion.div
                animate={isFavorite ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <FiHeart
                  size={18}
                  className={`transition-colors duration-300 ${
                    isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400 dark:text-gray-500'
                  }`}
                />
              </motion.div>
            </motion.button>

            {/* Add to cart overlay */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: isHovered ? 0 : 30, opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="absolute bottom-4 left-4 right-4 z-10"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition-all duration-300 ${
                  cartBounce
                    ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/30'
                }`}
              >
                <motion.span
                  animate={cartBounce ? { rotate: [0, -20, 20, 0] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <FiShoppingCart size={16} />
                </motion.span>
                {cartBounce ? t('foodCard.added') : t('foodCard.addToCart')}
              </motion.button>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2.5 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
              {tl(food, 'name')}
            </h3>

            {food.rating > 0 && (
              <div className="flex items-center gap-1.5 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.span
                    key={star}
                    className="relative"
                    whileHover={{ scale: 1.2 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <FiStar
                      size={14}
                      className={
                        star <= Math.round(food.rating)
                          ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                          : 'text-gray-200 dark:text-gray-700'
                      }
                    />
                  </motion.span>
                ))}
                <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 ml-0.5">
                  ({food.reviewCount || Math.floor(Math.random() * 200) + 10})
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-0.5">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  ETB {food.price?.toFixed(2)}
                </span>
                {food.originalPrice && food.originalPrice > food.price && (
                  <span className="text-sm text-gray-400 dark:text-gray-600 line-through decoration-2">
                    ETB {food.originalPrice?.toFixed(2)}
                  </span>
                )}
              </div>
              {food.preparationTime && (
                <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-slate-800/50 px-2.5 py-1.5 rounded-xl">
                  <FiClock size={12} className="text-indigo-400 dark:text-indigo-500" />
                  <span className="text-[11px] font-semibold">{food.preparationTime}m</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
