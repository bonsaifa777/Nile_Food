import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiStar, FiClock, FiCheck } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function EnhancedFoodCard({ food, index = 0 }) {
  const { addToCart, cart } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imgAttempt, setImgAttempt] = useState(0);
  const [added, setAdded] = useState(false);
  const { t } = useTranslation();

  const inCart = cart?.some((item) => item.food === food._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(food, 1);
    setAdded(true);
    toast.success(t('foodCard.addedToCart', { name: food.name }));
    setTimeout(() => setAdded(false), 1500);
  };

  const discount = food.originalPrice
    ? Math.round(((food.originalPrice - food.price) / food.originalPrice) * 100)
    : 0;

  const seed = useMemo(
    () => food.name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0),
    [food.name]
  );

  const imgSources = [
    food.image,
    `https://loremflickr.com/600/400/food?lock=${seed}`,
    `https://picsum.photos/seed/${seed}/600/400`,
    `https://placehold.co/600x400/e85d2c/ffffff?text=${encodeURIComponent(food.name)}`,
  ];

  const imgSrc = imgSources[Math.min(imgAttempt, imgSources.length - 1)];

  const stars = food.rating ? Math.round(food.rating) : 0;
  const deliveryTime = food.preparationTime
    ? `${food.preparationTime}-${(food.preparationTime || 15) + 10} min`
    : '25-35 min';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group"
    >
      <Link to={`/menu/${food._id}`} className="block">
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700/50 shadow-sm hover:shadow-2xl dark:hover:shadow-indigo-900/20 transition-shadow duration-500"
        >
          <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-slate-700">
            <motion.img
              src={imgSrc}
              alt={food.name}
              className="w-full h-full object-cover"
              animate={{ scale: isHovered ? 1.12 : 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onError={() => setImgAttempt((p) => p + 1)}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {discount > 0 && (
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute top-3 left-3 px-2.5 py-1 bg-gradient-to-r from-red-500 to-indigo-500 text-white text-[11px] font-bold rounded-lg shadow-lg z-10"
              >
                -{discount}%
              </motion.span>
            )}

            {food.featured && (
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="absolute top-3 right-3 px-2.5 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-lg shadow-lg z-10"
              >
                {t('foodCard.chefsPick')}
              </motion.span>
            )}

            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsFavorite(!isFavorite);
              }}
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-110 transition-transform z-10"
            >
              <FiHeart
                size={18}
                className={`transition-all duration-300 ${
                  isFavorite ? 'text-red-500 fill-red-500 scale-110' : 'text-gray-400'
                }`}
              />
            </motion.button>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-3 left-3 right-3 z-10"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleAddToCart}
                className={`w-full py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                  added || inCart
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-600'
                }`}
              >
                {added || inCart ? (
                  <><FiCheck size={16} /> {t('foodCard.added')}</>
                ) : (
                  <><FiShoppingCart size={16} /> {t('foodCard.addToCart')}</>
                )}
              </motion.button>
            </motion.div>

            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          </div>

          <div className="p-6 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight line-clamp-1 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                {food.name}
              </h3>
              {food.restaurant && (
                <span className="text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap bg-gray-50 dark:bg-slate-700/50 px-2 py-0.5 rounded-md">
                  {food.restaurant}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-400 dark:text-gray-500">
              <div className="flex items-center gap-1">
                <FiStar size={14} className="text-amber-400 fill-amber-400" />
                <span className="font-medium text-gray-600 dark:text-gray-300">{food.rating || '4.5'}</span>
                <span>({food.reviewCount || Math.floor(Math.random() * 200) + 10})</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
              <div className="flex items-center gap-1">
                <FiClock size={13} />
                <span>{deliveryTime}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  ETB {food.price?.toFixed(2)}
                </span>
                {food.originalPrice && food.originalPrice > food.price && (
                  <span className="text-sm text-gray-400 line-through">
                    ETB {food.originalPrice?.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="flex -space-x-2">
                {[1, 2, 3].slice(0, Math.min(3, stars || 3)).map((s) => (
                  <div
                    key={s}
                    className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center"
                  >
                    <span className="text-white text-[8px] font-bold">⭐</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {added && (
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="w-16 h-16 bg-indigo-500 rounded-full" />
            </motion.div>
          )}
        </motion.div>
      </Link>
    </motion.div>
  );
}
