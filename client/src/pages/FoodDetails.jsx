import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import Header from '../components/common/Header';
import FoodCard from '../components/foods/FoodCard';
import Loading from '../components/common/Loading';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next';
import {
  FiShoppingCart, FiStar, FiClock, FiMinus, FiPlus, FiHeart,
  FiAlertTriangle, FiBarChart2,
  FiList, FiImage, FiInfo, FiMapPin, FiPackage, FiTruck
} from 'react-icons/fi';

function SectionTitle({ icon: Icon, title, dark }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className={`p-2 rounded-lg ${dark ? 'bg-primary-500/10' : 'bg-primary-100'}`}>
        <Icon className={`${dark ? 'text-primary-400' : 'text-primary-600'}`} size={16} />
      </div>
      <h3 className={`text-base font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
      <div className={`flex-1 h-px ml-2 ${dark ? 'bg-white/5' : 'bg-gray-200'}`} />
    </div>
  );
}

function NutriRow({ label, value, dark }) {
  return (
    <div className={`flex items-center justify-between py-1.5 px-3 rounded-lg ${dark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
      <span className={`text-xs font-medium ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</span>
      <span className={`text-xs font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>{value || '—'}</span>
    </div>
  );
}

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 }
};

export default function FoodDetails() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const tl = (item, field) => {
    if (lang === 'en' || !item) return item?.[field];
    return item[field + '_' + lang] || item[field];
  };
  const getTranslatedArr = (arr, lang) => {
    if (lang === 'en' || !arr) return arr || [];
    return arr[lang === 'en' ? 'allergens' : 'allergens_' + lang] || arr || [];
  };
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const d = darkMode;
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [removedIngredients, setRemovedIngredients] = useState([]);
  const [similarFoods, setSimilarFoods] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(true);
  const { addToCart, clearCart } = useCart();

  useEffect(() => {
    fetchFood();
  }, [id]);

  const fetchFood = async () => {
    try {
      const { data } = await axios.get(`/api/foods/${id}`);
      setFood(data.data);
      if (data.data.sizes?.length > 0) {
        setSelectedSize(data.data.sizes[0].name);
      }
      fetchSimilar(data.data);
    } catch (error) {
      toast.error(t('foodDetails.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilar = async (currentFood) => {
    try {
      const { data } = await axios.get(`/api/foods/${currentFood._id}/similar`);
      setSimilarFoods(data.data || []);
    } catch {
    } finally {
      setSimilarLoading(false);
    }
  };

  const calculatePrice = () => {
    let price = food.price;
    if (selectedSize) {
      const size = food.sizes?.find(s => s.name === selectedSize);
      if (size) price += size.price;
    }
    selectedExtras.forEach(extra => {
      price += extra.price * extra.qty;
    });
    return price * quantity;
  };

  const handleAddToCart = () => {
    const extrasPayload = selectedExtras.map(e => ({ name: e.name, price: e.price * e.qty }));
    addToCart(food, quantity, selectedSize, extrasPayload, specialInstructions, removedIngredients);
    toast.success(t('cart.addToCart', { name: tl(food, 'name') }));
  };

  const handleDelivery = () => {
    clearCart();
    handleAddToCart();
    navigate('/checkout');
  };

  const handleDineIn = () => {
    clearCart();
    handleAddToCart();
    navigate('/select-table', { state: { orderType: 'dine_in' } });
  };

  const handleTakeaway = () => {
    clearCart();
    handleAddToCart();
    navigate('/select-table', { state: { orderType: 'takeaway' } });
  };

  const toggleExtra = (extra) => {
    setSelectedExtras(prev => {
      const exists = prev.find(e => e.name === extra.name);
      if (exists) {
        return prev.filter(e => e.name !== extra.name);
      }
      return [...prev, { ...extra, qty: 1 }];
    });
  };

  const updateExtraQty = (name, delta) => {
    setSelectedExtras(prev => prev.map(e => {
      if (e.name !== name) return e;
      const newQty = e.qty + delta;
      return newQty <= 0 ? null : { ...e, qty: newQty };
    }).filter(Boolean));
  };

  const getExtraQty = (name) => {
    const found = selectedExtras.find(e => e.name === name);
    return found ? found.qty : 0;
  };

  if (loading) return <Loading />;
  if (!food) return (
    <div className="min-h-screen">
      <Header />
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center">
        <FiInfo size={48} className="text-gray-400 mb-4" />
        <p className={`text-lg font-medium ${d ? 'text-gray-400' : 'text-gray-600'}`}>{t('menu.noItems')}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Header />

      <main className={`pt-28 pb-20 transition-colors duration-300 ${d ? 'bg-slate-950' : 'bg-gray-50'}`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Image + Details side by side */}
          <div className="grid lg:grid-cols-2 gap-8 xl:gap-12 mb-16">
            {/* Left: Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative sticky top-28 self-start"
            >
              <div className={`aspect-square rounded-3xl overflow-hidden shadow-2xl ${d ? 'shadow-black/30' : 'shadow-primary-500/10'}`}>
                <img
                  src={food.image || '/placeholder-food.jpg'}
                  alt={tl(food, 'name')}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
              {food.images?.length > 0 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {food.images.map((img, i) => (
                    <img key={i} src={img} alt={`${tl(food, 'name')} ${i + 1}`}
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border-2 border-transparent hover:border-primary-500 transition-all cursor-pointer"
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Right: All Details */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Header Info */}
              <div className="flex items-start justify-between">
                <div>
                  <span className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold mb-3 ${
                    d ? 'bg-primary-500/15 text-primary-300' : 'bg-primary-100 text-primary-700'
                  }`}>
                    {food.category?.name}
                  </span>
                  <h1 className={`text-3xl lg:text-4xl font-black mb-2 ${d ? 'text-white' : 'text-gray-900'}`}>
                    {tl(food, 'name')}
                  </h1>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <FiStar className="text-yellow-500 fill-yellow-500" size={18} />
                      <span className={`font-semibold ${d ? 'text-white' : 'text-gray-900'}`}>
                        {food.rating?.toFixed(1) || '0'}
                      </span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${d ? 'text-gray-400' : 'text-gray-500'}`}>
                      <FiClock size={16} />
                      <span className="font-medium">{t('foodDetails.prepTime', { time: food.preparationTime })}</span>
                    </div>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-3 rounded-xl transition-all ${
                    d ? 'bg-white/5 hover:bg-white/10 border border-white/10' : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm'
                  }`}
                >
                  <FiHeart size={20} className={isFavorite ? 'text-red-500 fill-red-500' : d ? 'text-gray-400' : 'text-gray-500'} />
                </motion.button>
              </div>

              <div className={`text-2xl font-black ${d ? 'text-primary-400' : 'text-primary-600'}`}>
                {t('common.currencyETB')} {calculatePrice().toFixed(2)}
              </div>

              {/* Description */}
              <motion.div {...fadeUp} transition={{ delay: 0.05 }}
                className={`p-5 rounded-2xl ${d ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}
              >
                <SectionTitle icon={FiList} title={t('foodDetails.description')} dark={d} />
                <p className={`text-sm leading-relaxed ${d ? 'text-gray-300' : 'text-gray-600'}`}>
                  {tl(food, 'description')}
                </p>
              </motion.div>

              {/* Ingredients */}
              <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
                <SectionTitle icon={FiImage} title={t('foodDetails.ingredients')} dark={d} />
                {(food.ingredients?.length > 0 ? food.ingredients : []).length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {food.ingredients.map((ing, i) => {
                      const removed = removedIngredients.includes(ing.name);
                      return (
                        <motion.div key={ing.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                          className={`relative rounded-xl overflow-hidden transition-all duration-200 ${
                            removed
                              ? d ? 'ring-2 ring-red-500/50 bg-red-500/5 opacity-60' : 'ring-2 ring-red-400 bg-red-50 opacity-60'
                              : d ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white border border-gray-200 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-center gap-3 p-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                              <img src={ing.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'}
                                 alt={tl(ing, 'name')} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold ${d ? 'text-white' : 'text-gray-900'}`}>{tl(ing, 'name')}</p>
                              <p className={`text-[10px] ${d ? 'text-gray-400' : 'text-gray-500'}`}>{ing.amount}</p>
                            </div>
                          </div>
                          <div className={`px-3 pb-3 ${d ? 'border-t border-white/5' : 'border-t border-gray-100'}`} style={{ paddingTop: '8px' }}>
                            <motion.button whileTap={{ scale: 0.9 }} onClick={() => {
                              setRemovedIngredients(prev =>
                                prev.includes(ing.name)
                                  ? prev.filter(n => n !== ing.name)
                                  : [...prev, ing.name]
                              );
                            }}
                              className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all ${
                                removed
                                  ? d ? 'bg-primary-500/20 text-primary-300 hover:bg-primary-500/30' : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                                  : d ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-600'
                              }`}
                                >{removed ? t('kiosk.addToCart') : t('cart.remove')}</motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <p className={`text-xs text-center py-6 ${d ? 'text-gray-500' : 'text-gray-400'}`}>{t('foodDetails.noIngredients')}</p>
                )}
              </motion.div>

              {/* Extras */}
              <motion.div {...fadeUp} transition={{ delay: 0.15 }}>
                <SectionTitle icon={FiPlus} title={t('foodDetails.extras')} dark={d} />
                {(food.extras?.length > 0 ? food.extras : []).length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {food.extras.map((extra, i) => {
                      const qty = getExtraQty(extra.name);
                      return (
                        <motion.div key={extra.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                          className={`relative rounded-xl overflow-hidden transition-all duration-200 ${
                            qty > 0
                              ? d ? 'ring-2 ring-primary-500 bg-primary-500/5' : 'ring-2 ring-primary-500 bg-primary-50'
                              : d ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white border border-gray-200 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-center gap-3 p-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                              <img src={extra.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'}
                                alt={tl(extra, 'name')} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold ${d ? 'text-white' : 'text-gray-900'}`}>{tl(extra, 'name')}</p>
                              <p className={`text-xs font-medium ${d ? 'text-primary-400' : 'text-primary-600'}`}>+{extra.price} {t('common.currencyETB')}</p>
                            </div>
                          </div>
                          <div className={`flex items-center justify-between px-3 pb-3 ${d ? 'border-t border-white/5' : 'border-t border-gray-100'}`} style={{ paddingTop: '8px' }}>
                            <motion.button whileTap={{ scale: 0.9 }} onClick={() => toggleExtra(extra)}
                              className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all ${
                                qty > 0
                                  ? d ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-600'
                                  : d ? 'bg-primary-500/20 text-primary-300 hover:bg-primary-500/30' : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                              }`}
                              >{qty > 0 ? t('cart.remove') : t('kiosk.addToCart')}</motion.button>
                            {qty > 0 && (
                              <div className={`flex items-center gap-2 rounded-lg px-1.5 ${d ? 'bg-white/10' : 'bg-gray-100'}`}>
                                <motion.button whileTap={{ scale: 0.9 }} onClick={() => updateExtraQty(extra.name, -1)}
                                  className={`w-7 h-7 rounded-md flex items-center justify-center ${d ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-200 text-gray-700'}`}
                                ><FiMinus size={12} /></motion.button>
                                <span className={`text-xs font-bold w-4 text-center ${d ? 'text-white' : 'text-gray-900'}`}>{qty}</span>
                                <motion.button whileTap={{ scale: 0.9 }} onClick={() => updateExtraQty(extra.name, 1)}
                                  className={`w-7 h-7 rounded-md flex items-center justify-center ${d ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-200 text-gray-700'}`}
                                ><FiPlus size={12} /></motion.button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <p className={`text-xs text-center py-6 ${d ? 'text-gray-500' : 'text-gray-400'}`}>{t('foodDetails.noExtras')}</p>
                )}
              </motion.div>

              {/* Allergens */}
              <motion.div {...fadeUp} transition={{ delay: 0.2 }}
                className={`p-5 rounded-2xl ${d ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}
              >
                <SectionTitle icon={FiAlertTriangle} title={t('foodDetails.allergens')} dark={d} />
                {(food.allergens?.length > 0 ? food.allergens : []).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {(lang === 'en' ? food.allergens : (food['allergens_' + lang] || food.allergens || [])).map(allergen => (
                      <motion.span key={allergen} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          d ? 'bg-red-500/10 text-red-300 border border-red-500/20' : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >{allergen}</motion.span>
                    ))}
                  </div>
                ) : (
                  <p className={`text-xs ${d ? 'text-gray-500' : 'text-gray-400'}`}>{t('foodDetails.noAllergens')}</p>
                )}
              </motion.div>

              {/* Nutritional Info */}
              <motion.div {...fadeUp} transition={{ delay: 0.25 }}
                className={`p-5 rounded-2xl ${d ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}
              >
                <SectionTitle icon={FiBarChart2} title={t('foodDetails.nutritionalInfo')} dark={d} />
                {food.nutritionalInfo ? (
                  <div>
                    {food.nutritionalInfo.servingSize && (
                      <div className={`mb-2 pb-2 border-b ${d ? 'border-white/5' : 'border-gray-100'}`}>
                        <span className={`text-[10px] ${d ? 'text-gray-500' : 'text-gray-400'}`}>{t('foodDetails.serving')}: </span>
                        <span className={`text-xs font-semibold ${d ? 'text-white' : 'text-gray-900'}`}>{food.nutritionalInfo.servingSize}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-x-4">
                      {[
                        { label: t('foodDetails.calories'), value: food.nutritionalInfo.calories ? `${food.nutritionalInfo.calories} kcal` : null },
                        { label: t('foodDetails.totalFat'), value: food.nutritionalInfo.totalFat },
                        { label: t('foodDetails.carbs'), value: food.nutritionalInfo.totalCarbohydrates },
                        { label: t('foodDetails.protein'), value: food.nutritionalInfo.protein },
                        { label: t('foodDetails.fiber'), value: food.nutritionalInfo.dietaryFiber },
                        { label: t('foodDetails.sodium'), value: food.nutritionalInfo.sodium },
                        { label: t('foodDetails.sugar'), value: food.nutritionalInfo.sugars },
                        { label: t('foodDetails.cholesterol'), value: food.nutritionalInfo.cholesterol },
                      ].map(item => (
                        <NutriRow key={item.label} label={item.label} value={item.value} dark={d} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className={`text-xs ${d ? 'text-gray-500' : 'text-gray-400'}`}>{t('foodDetails.noNutrition')}</p>
                )}
              </motion.div>

              {/* Sizes */}
              {food.sizes?.length > 0 && (
                <motion.div {...fadeUp} transition={{ delay: 0.3 }}>
                  <h3 className={`text-sm font-semibold mb-3 ${d ? 'text-white' : 'text-gray-900'}`}>{t('foodDetails.size')}</h3>
                  <div className="flex gap-2">
                    {food.sizes.map(size => (
                      <motion.button key={size.name} whileTap={{ scale: 0.95 }} onClick={() => setSelectedSize(size.name)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          selectedSize === size.name
                            ? d ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                            : d ? 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                        }`}
                      >{tl(size, 'name')} {size.price > 0 && <span className="opacity-80">(+{size.price} {t('common.currencyETB')})</span>}</motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Qty + Add to Cart */}
              <motion.div {...fadeUp} transition={{ delay: 0.35 }}
                className={`flex items-center justify-between p-4 rounded-2xl ${
                  d ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${d ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
                  ><FiMinus size={16} /></motion.button>
                  <span className={`text-lg font-bold w-6 text-center ${d ? 'text-white' : 'text-gray-900'}`}>{quantity}</span>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => setQuantity(quantity + 1)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${d ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
                  ><FiPlus size={16} /></motion.button>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAddToCart}
                  className="btn-primary flex items-center gap-2 text-sm"
                ><FiShoppingCart size={16} /> {t('foodDetails.addToCart')}</motion.button>
              </motion.div>

              {/* Special Instructions */}
              <motion.div {...fadeUp} transition={{ delay: 0.4 }}>
                <SectionTitle icon={FiInfo} title={t('foodDetails.specialInstructions')} dark={d} />
                <textarea value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder={t('foodDetails.specialInstructionsPlaceholder')}
                  className={`w-full h-20 resize-none rounded-xl p-3.5 text-xs transition-all ${
                    d ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20' : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                  }`}
                />
              </motion.div>

              {/* 3 Action Buttons */}
              <motion.div {...fadeUp} transition={{ delay: 0.45 }} className="grid grid-cols-3 gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={handleDineIn}
                  className={`flex flex-col items-center gap-1.5 py-4 px-3 rounded-2xl font-semibold text-sm transition-all ${
                    d ? 'bg-primary-500/10 text-primary-300 border border-primary-500/20 hover:bg-primary-500/20' : 'bg-primary-50 text-primary-700 border border-primary-200 hover:bg-primary-100'
                  }`}
                >
                  <FiMapPin size={22} />
                  {t('foodDetails.dineHere')}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={handleTakeaway}
                  className={`flex flex-col items-center gap-1.5 py-4 px-3 rounded-2xl font-semibold text-sm transition-all ${
                    d ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20' : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <FiPackage size={22} />
                  {t('foodDetails.takeAway')}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={handleDelivery}
                  className={`flex flex-col items-center gap-1.5 py-4 px-3 rounded-2xl font-semibold text-sm transition-all ${
                    d ? 'bg-green-500/10 text-green-300 border border-green-500/20 hover:bg-green-500/20' : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                  }`}
                >
                  <FiTruck size={22} />
                  {t('foodDetails.delivery')}
                </motion.button>
              </motion.div>
            </motion.div>
          </div>

          {/* Similar Foods at the bottom */}
          {!similarLoading && similarFoods.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="flex items-center gap-3 mb-8">
                <div className={`p-3 rounded-xl ${d ? 'bg-primary-500/10' : 'bg-primary-100'}`}>
                  <FiStar className={`${d ? 'text-primary-400' : 'text-primary-600'}`} size={20} />
                </div>
                <h2 className={`text-2xl font-bold ${d ? 'text-white' : 'text-gray-900'}`}>{t('foodDetails.relatedItems')}</h2>
                <div className={`flex-1 h-px ml-3 ${d ? 'bg-white/5' : 'bg-gray-200'}`} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {similarFoods.map((item, i) => (
                  <FoodCard key={item._id} food={item} index={i} />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
