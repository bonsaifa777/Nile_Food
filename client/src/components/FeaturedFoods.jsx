import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiStar } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

function ProductCard({ food, index = 0 }) {
  const { addToCart } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);
  const [imgAttempt, setImgAttempt] = useState(0);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(food, 1);
    toast.success(`${food.name} added to cart!`);
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
    `https://placehold.co/600x400/4f46e5/ffffff?text=${encodeURIComponent(food.name)}`,
  ];

  const imgSrc = imgSources[Math.min(imgAttempt, imgSources.length - 1)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
    >
      <Link to={`/menu/${food._id}`} className="group block">
        <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300">
          {/* Image - Circular style */}
          <div className="relative p-6 pb-0">
            <div className="relative w-full aspect-square rounded-full overflow-hidden bg-gray-50 dark:bg-slate-700/50 mx-auto w-64 h-64 sm:w-72 sm:h-72">
              {food.image ? (
                <motion.img
                  src={imgSrc}
                  alt={food.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  whileHover={{ scale: 1.08 }}
                  onError={() => setImgAttempt((p) => p + 1)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-6xl opacity-40">🍽️</span>
                </div>
              )}

              {/* Discount Badge */}
              {discount > 0 && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-primary-500 text-white text-[10px] font-bold rounded-full">
                  {discount}% OFF
                </div>
              )}
            </div>

            {/* Favorite Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsFavorite(!isFavorite);
              }}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-md hover:scale-110 transition-transform"
            >
              <FiHeart
                size={16}
                className={`transition-colors ${
                  isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'
                }`}
              />
            </button>

            {/* Cart Button - Floating */}
            <motion.button
              onClick={handleAddToCart}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute bottom-4 right-4 w-12 h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
            >
              <FiShoppingCart size={18} />
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-5 pt-3 text-center">
            {/* Name */}
            <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1 group-hover:text-primary-500 transition-colors">
              {food.name}
            </h3>

            {/* Rating */}
            {food.rating > 0 && (
              <div className="flex items-center justify-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar
                    key={star}
                    size={12}
                    className={
                      star <= Math.round(food.rating)
                        ? 'text-primary-400 fill-primary-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }
                  />
                ))}
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                  ({food.reviewCount || Math.floor(Math.random() * 200) + 10})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl font-bold text-primary-500">
                ETB {food.price?.toFixed(2)}
              </span>
              {food.originalPrice && food.originalPrice > food.price && (
                <span className="text-sm text-gray-400 line-through">
                  ETB {food.originalPrice?.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function FeaturedFoods({ foods, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-700">
            <div className="aspect-square bg-gray-100 dark:bg-slate-700 animate-pulse" />
            <div className="p-5 space-y-3">
              <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded-full w-3/4 mx-auto animate-pulse" />
              <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded-full w-1/2 mx-auto animate-pulse" />
              <div className="h-5 bg-gray-100 dark:bg-slate-700 rounded-full w-1/3 mx-auto animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {foods.map((food, index) => (
        <ProductCard key={food._id} food={food} index={index} />
      ))}
    </div>
  );
}
