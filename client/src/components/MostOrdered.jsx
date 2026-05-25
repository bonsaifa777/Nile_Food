import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiStar, FiTrendingUp } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

function MostOrderedCard({ food, index = 0 }) {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(food, 1);
    toast.success(`${food.name} added to cart!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
    >
      <Link to={`/menu/${food._id}`} className="group block">
        <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 relative">
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 text-white text-[10px] font-bold rounded-full shadow-md">
            <FiTrendingUp size={12} />
            <span>{food.orderCount} ordered</span>
          </div>

          <div className="relative p-6 pb-0">
            <div className="relative w-full aspect-square rounded-full overflow-hidden bg-gray-50 dark:bg-slate-700/50 mx-auto w-48 h-48 sm:w-56 sm:h-56">
              {food.image ? (
                <motion.img
                  src={food.image}
                  alt={food.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  whileHover={{ scale: 1.08 }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-6xl opacity-40">🍽️</span>
                </div>
              )}
            </div>

            <motion.button
              onClick={handleAddToCart}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute bottom-4 right-4 w-12 h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
            >
              <FiShoppingCart size={18} />
            </motion.button>
          </div>

          <div className="p-5 pt-3 text-center">
            <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1 group-hover:text-primary-500 transition-colors">
              {food.name}
            </h3>

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
                  ({food.reviewCount || 0})
                </span>
              </div>
            )}

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

export default function MostOrdered({ foods, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
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

  if (!foods.length) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {foods.map((food, index) => (
        <MostOrderedCard key={food._id} food={food} index={index} />
      ))}
    </div>
  );
}
