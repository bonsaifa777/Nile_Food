import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  FiShoppingCart, FiPlus, FiMinus, FiX, FiMaximize, FiMinimize,
  FiSearch, FiClock, FiStar, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';

const IDLE_TIMEOUT = 5 * 60 * 1000;

function useIdleTimer(timeout, onIdle) {
  const timerRef = useRef(null);
  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(onIdle, timeout);
  }, [timeout, onIdle]);
  useEffect(() => {
    reset();
    const events = ['mousedown', 'touchstart', 'keydown', 'scroll', 'wheel'];
    events.forEach(e => window.addEventListener(e, reset));
    return () => {
      events.forEach(e => window.removeEventListener(e, reset));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [reset]);
}

export default function Kiosk() {
  const { t } = useTranslation();
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isIdleReset, setIsIdleReset] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const catScrollRef = useRef(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [addedItem, setAddedItem] = useState(null);

  useEffect(() => { fetchData(); }, [selectedCategory]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [foodsRes, catsRes] = await Promise.all([
        axios.get(`/api/foods?limit=50${selectedCategory ? `&category=${selectedCategory}` : ''}`),
        axios.get('/api/categories')
      ]);
      setFoods(foodsRes.data.data?.foods || []);
      setCategories(catsRes.data.data || []);
    } catch { toast.error('Failed to load menu'); } finally { setLoading(false); }
  };

  const filtered = foods.filter(f =>
    !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (food) => {
    setCart(prev => {
      const ex = prev.find(i => i.food._id === food._id);
      if (ex) return prev.map(i => i.food._id === food._id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { food, quantity: 1 }];
    });
    setAddedItem(food._id);
    setTimeout(() => setAddedItem(null), 600);
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => i.food._id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter(i => i.quantity > 0));
  };

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const subtotal = cart.reduce((s, i) => s + i.food.price * i.quantity, 0);
  const tax = subtotal * 0.15;
  const total = subtotal + tax;

  const placeOrder = async () => {
    if (!guestName || !guestPhone) { toast.error('Enter your name and phone'); return; }
    if (cart.length === 0) { toast.error('Cart is empty'); return; }
    setPlacingOrder(true);
    try {
      await axios.post('/api/orders', {
        items: cart.map(i => ({ food: i.food._id, quantity: i.quantity })),
        type: 'dine_in',
        guestName, guestPhone,
        paymentMethod: 'cash'
      });
      toast.success('Order placed!');
      setCart([]);
      setShowCart(false);
      setShowCheckout(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to place order'); }
    finally { setPlacingOrder(false); }
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const resetKiosk = useCallback(() => {
    setCart([]);
    setShowCart(false);
    setShowCheckout(false);
    setSelectedCategory('');
    setSearchQuery('');
    setGuestName('');
    setGuestPhone('');
    setIsIdleReset(true);
    setTimeout(() => setIsIdleReset(false), 500);
  }, []);

  useIdleTimer(IDLE_TIMEOUT, resetKiosk);

  const scrollCategory = (dir) => {
    if (catScrollRef.current) {
      catScrollRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[120px] animate-float-drift" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-500/8 rounded-full blur-[100px] animate-float-drift" style={{ animationDelay: '-4s' }} />
      </div>

      {/* Top bar */}
      <header className="relative z-20 sticky top-0 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between px-4 md:px-8 h-16 md:h-20">
          <div className="flex items-center gap-4">
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-200 bg-clip-text text-transparent">
              Nile Food
            </h1>
            <span className="hidden md:inline-flex text-xs text-white/40 border border-white/10 rounded-full px-3 py-1">
              {t('kiosk.badge')}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              onClick={toggleFullscreen}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              {isFullscreen ? <FiMinimize size={18} /> : <FiMaximize size={18} />}
            </motion.button>
            <motion.button
              onClick={() => setShowCart(true)}
              whileTap={{ scale: 0.9 }}
              className="relative w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center hover:bg-indigo-500/30 transition-colors"
            >
              <FiShoppingCart size={20} className="text-indigo-400" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 rounded-full text-[10px] font-bold flex items-center justify-center"
                >
                  {cartCount}
                </motion.span>
              )}
            </motion.button>
          </div>
        </div>

        {/* Search bar */}
        <div className="px-4 md:px-8 pb-3">
          <div className={`relative transition-all duration-300 ${searchFocused ? 'scale-[1.02]' : ''}`}>
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder={t('kiosk.search')}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 md:py-4 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all text-base md:text-lg"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                <FiX size={18} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 pb-32">
        {/* Categories */}
        <div className="px-4 md:px-8 mb-6">
          <div className="relative">
            <button onClick={() => scrollCategory(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-slate-900/80 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors md:hidden">
              <FiChevronLeft size={16} />
            </button>
            <div ref={catScrollRef} className="flex gap-2 overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-pl-4 py-2 px-4 -mx-4 md:mx-0 md:px-0"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <button onClick={() => setSelectedCategory('')}
                className={`snap-start shrink-0 px-5 py-2.5 md:px-6 md:py-3 rounded-full text-sm md:text-base font-medium transition-all whitespace-nowrap ${!selectedCategory ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'}`}>
                {t('menu.all')}
              </button>
              {categories.map(cat => (
                <button key={cat._id} onClick={() => setSelectedCategory(cat._id)}
                  className={`snap-start shrink-0 px-5 py-2.5 md:px-6 md:py-3 rounded-full text-sm md:text-base font-medium transition-all whitespace-nowrap ${selectedCategory === cat._id ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'}`}>
                  {cat.name}
                </button>
              ))}
            </div>
            <button onClick={() => scrollCategory(1)} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-slate-900/80 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors md:hidden">
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Food grid */}
        <div className="px-4 md:px-8">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white/5 rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-white/5" />
                  <div className="p-3 md:p-4 space-y-2">
                    <div className="h-4 bg-white/5 rounded-full w-3/4" />
                    <div className="h-3 bg-white/5 rounded-full w-1/2" />
                    <div className="h-8 bg-white/5 rounded-xl w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/40 text-lg">{t('common.noResults')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {filtered.map((food, i) => {
                const inCart = cart.find(c => c.food._id === food._id);
                return (
                  <motion.div
                    key={food._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.4 }}
                    className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/30 hover:bg-white/[0.07] transition-all duration-300"
                  >
                    <div className="aspect-[4/3] bg-slate-800/50 relative overflow-hidden">
                      <img
                        src={food.image || 'https://placehold.co/600x400/1e293b/6366f1?text=' + encodeURIComponent(food.name)}
                        alt={food.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                      {food.rating && (
                        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 text-xs">
                          <FiStar size={10} className="text-amber-400" />
                          <span className="text-white/90">{food.rating}</span>
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2">
                        <span className="text-lg md:text-xl font-bold text-white drop-shadow-lg">
                          ETB {food.price}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 md:p-4">
                      <h3 className="font-semibold text-sm md:text-base mb-1 leading-tight line-clamp-1">{food.name}</h3>
                      <p className="text-white/40 text-xs md:text-sm line-clamp-1 mb-3">{food.description || t('kiosk.deliciousDish')}</p>
                      <AnimatePresence mode="wait">
                        {inCart ? (
                          <motion.div
                            key="qty"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center justify-between bg-indigo-500/20 border border-indigo-500/30 rounded-xl p-1"
                          >
                            <button onClick={() => updateQty(food._id, -1)}
                              className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-indigo-500/30 flex items-center justify-center hover:bg-indigo-500/50 transition-colors active:scale-90">
                              <FiMinus size={14} />
                            </button>
                            <span className="font-bold text-sm md:text-base text-indigo-400 min-w-[24px] text-center">
                              {inCart.quantity}
                            </span>
                            <button onClick={() => updateQty(food._id, 1)}
                              className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-indigo-500/30 flex items-center justify-center hover:bg-indigo-500/50 transition-colors active:scale-90">
                              <FiPlus size={14} />
                            </button>
                          </motion.div>
                        ) : (
                          <motion.button
                            key="add"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={() => addToCart(food)}
                            whileTap={{ scale: 0.95 }}
                            className={`w-full py-2.5 md:py-3 rounded-xl font-medium text-sm md:text-base transition-all duration-200 ${addedItem === food._id ? 'bg-emerald-500/30 border border-emerald-500/50 text-emerald-400' : 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/30'} `}
                          >
                            {addedItem === food._id ? t('kiosk.added') : t('kiosk.addToCart')}
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Floating cart button */}
      <AnimatePresence>
        {cartCount > 0 && !showCart && (
          <motion.button
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            onClick={() => setShowCart(true)}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-6 right-6 z-30 bg-indigo-500 border border-indigo-400/50 shadow-2xl shadow-indigo-500/30 rounded-2xl px-5 py-3.5 md:px-6 md:py-4 flex items-center gap-3 hover:bg-indigo-600 transition-colors"
          >
            <FiShoppingCart size={22} />
            <span className="font-bold text-base md:text-lg">{cartCount} {cartCount === 1 ? t('kiosk.item') : t('kiosk.items')}</span>
            <span className="text-white/70">•</span>
            <span className="font-bold">ETB {total.toFixed(0)}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cart slide-up panel */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCart(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-slate-900 border-t border-white/10 rounded-t-3xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">{t('cart.title')}</h2>
                  <p className="text-white/40 text-sm">{cartCount} {cartCount === 1 ? t('kiosk.item') : t('kiosk.items')}</p>
                </div>
                <button onClick={() => setShowCart(false)}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <FiX size={18} />
                </button>
              </div>

              <div className="overflow-y-auto px-4 md:px-6 py-4 space-y-3 max-h-[40vh]">
                {cart.length === 0 ? (
                  <p className="text-center text-white/40 py-10">{t('cart.empty')}</p>
                ) : (
                  cart.map(item => (
                    <div key={item.food._id} className="flex items-center gap-3 md:gap-4 bg-white/5 rounded-2xl p-3 md:p-4">
                      <img src={item.food.image || 'https://placehold.co/80'} alt={item.food.name}
                        className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm md:text-base truncate">{item.food.name}</h4>
                        <p className="text-indigo-400 text-sm font-medium">ETB {item.food.price}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => updateQty(item.food._id, -1)}
                          className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all">
                          <FiMinus size={14} />
                        </button>
                        <span className="w-8 text-center font-bold">{item.quantity}</span>
                        <button onClick={() => updateQty(item.food._id, 1)}
                          className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all">
                          <FiPlus size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-white/10 p-4 md:p-6 space-y-4">
                  <div className="space-y-1 text-sm md:text-base">
                    <div className="flex justify-between text-white/60"><span>{t('cart.subtotal')}</span><span>ETB {subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-white/60"><span>{t('cart.tax')} (15%)</span><span>ETB {tax.toFixed(2)}</span></div>
                    <div className="flex justify-between text-lg md:text-xl font-bold pt-2 border-t border-white/10">
                      <span>{t('cart.total')}</span><span className="text-indigo-400">ETB {total.toFixed(2)}</span>
                    </div>
                  </div>

                  {!showCheckout ? (
                    <motion.button
                      onClick={() => setShowCheckout(true)}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3.5 md:py-4 bg-indigo-500 hover:bg-indigo-600 rounded-2xl font-bold text-base md:text-lg transition-colors"
                    >
                      {t('kiosk.checkout')}
                    </motion.button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <input type="text" value={guestName} onChange={e => setGuestName(e.target.value)}
                        placeholder={t('auth.name')}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 text-base md:text-lg" />
                      <input type="tel" value={guestPhone} onChange={e => setGuestPhone(e.target.value)}
                        placeholder={t('auth.phone')}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 text-base md:text-lg" />
                      <div className="flex gap-3">
                        <button onClick={() => setShowCheckout(false)}
                          className="flex-1 py-3.5 border border-white/20 rounded-2xl font-medium hover:bg-white/5 transition-colors text-base">
                          {t('common.back')}
                        </button>
                        <button onClick={placeOrder} disabled={placingOrder}
                          className="flex-1 py-3.5 md:py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 rounded-2xl font-bold text-base md:text-lg transition-colors">
                          {placingOrder ? t('common.loading') : t('kiosk.placeOrder')}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Idle reset flash */}
      <AnimatePresence>
        {isIdleReset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-indigo-500/20 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-slate-900 border border-white/10 rounded-3xl p-8 text-center max-w-sm mx-4"
            >
              <h2 className="text-2xl font-bold mb-2">Nile Food</h2>
              <p className="text-white/60 mb-6">{t('kiosk.tapToStart')}</p>
              <motion.button
                onClick={resetKiosk}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-indigo-500 rounded-2xl font-bold text-lg"
              >
                {t('kiosk.start')}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
