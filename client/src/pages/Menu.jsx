import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  FiSearch, FiFilter, FiX, FiMapPin, FiBell, FiHeart, FiShoppingCart,
  FiUser, FiChevronDown, FiMenu, FiMic, FiClock, FiArrowLeft,
  FiSliders, FiGrid, FiList,
} from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import EnhancedFoodCard from '../components/foods/EnhancedFoodCard';
import CategoryNav from '../components/foods/CategoryNav';
import FilterSidebar from '../components/foods/FilterSidebar';
import SortDropdown from '../components/foods/SortDropdown';
import FloatingCart from '../components/foods/FloatingCart';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useTheme } from '../context/ThemeContext';

const SORT_OPTIONS = {
  popularity: (a, b) => (b.reviewCount || 0) - (a.reviewCount || 0),
  rating: (a, b) => (b.rating || 0) - (a.rating || 0),
  fastest: (a, b) => (a.preparationTime || 30) - (b.preparationTime || 30),
  'price-low': (a, b) => (a.price || 0) - (b.price || 0),
  'price-high': (a, b) => (b.price || 0) - (a.price || 0),
  trending: (a, b) => ((b.rating || 0) + (b.reviewCount || 0) / 100) - ((a.rating || 0) + (a.reviewCount || 0) / 100),
  recommended: (a, b) => ((b.rating || 0) * 0.7 + (b.reviewCount || 0) * 0.3) - ((a.rating || 0) * 0.7 + (a.reviewCount || 0) * 0.3),
};

export default function Menu() {
  const { t } = useTranslation();
  const { darkMode } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [foods, setFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('popularity');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [activeFilters, setActiveFilters] = useState({});
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const { cart, totalItems } = useCart();
  const { user } = useAuth();
  const cartCount = totalItems();

  const [recentlyViewed] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('recentFoods') || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/foods?limit=100');
      setFoods(data.data?.foods || []);
    } catch {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...foods];

    if (selectedCategory) {
      const sc = selectedCategory.toLowerCase();
      result = result.filter((f) => {
        if (!f.category) return false;
        const catId = typeof f.category === 'object' ? f.category._id : f.category;
        const catName = typeof f.category === 'object' ? f.category.name : String(f.category);
        return (
          catId === selectedCategory ||
          catName === selectedCategory ||
          catName.toLowerCase() === sc ||
          catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') === sc
        );
      });
    }

    Object.entries(activeFilters).forEach(([groupId, options]) => {
      if (!options.length) return;
      result = result.filter((f) => {
        const name = (f.name || '').toLowerCase();
        const tags = (f.tags || []).map((t) => t.toLowerCase());
        const desc = (f.description || '').toLowerCase();
        const cuisine = (f.cuisine || '').toLowerCase();
        const allText = [name, desc, cuisine, ...tags].join(' ');
        return options.some((opt) => allText.includes(opt.toLowerCase()));
      });
    });

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.name?.toLowerCase().includes(q) ||
          f.description?.toLowerCase().includes(q) ||
          f.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    const sorter = SORT_OPTIONS[sortBy];
    if (sorter) result.sort(sorter);

    setFilteredFoods(result);
  }, [foods, selectedCategory, searchQuery, sortBy, activeFilters]);

  const handleSearch = (e) => {
    e?.preventDefault();
    setShowSuggestions(false);
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    setSearchParams(params);
  };

  const clearFilters = useCallback(() => {
    setSelectedCategory('');
    setSearchQuery('');
    setSortBy('popularity');
    setActiveFilters({});
    setSearchParams({});
  }, [setSearchParams]);

  const toggleFilter = useCallback((groupId, option) => {
    setActiveFilters((prev) => {
      const current = [...(prev[groupId] || [])];
      const idx = current.indexOf(option);
      if (idx >= 0) current.splice(idx, 1);
      else current.push(option);
      return { ...prev, [groupId]: current };
    });
  }, []);

  const totalActiveFilters = Object.values(activeFilters).reduce((acc, arr) => acc + arr.length, 0);

  const searchSuggestions = foods
    .filter((f) => searchQuery && f.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* GLASS NAVBAR */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl shadow-lg shadow-black/5 h-16'
            : 'bg-white dark:bg-slate-950 h-20'
        }`}
      >
        <div className="w-full px-4 sm:px-8 h-full flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <span className="text-white font-black text-lg">N</span>
            </div>
            <span className={`font-bold transition-all duration-300 hidden sm:block ${scrolled ? 'text-lg' : 'text-xl'} text-gray-900 dark:text-white`}>
              {t('footer.brandName')}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400">
            <FiMapPin size={14} className="text-indigo-500" />
            <span>{t('menu.deliverTo')}</span>
            <button className="flex items-center gap-1 text-gray-900 dark:text-white font-semibold hover:text-indigo-500 transition-colors">
              {t('nav.home')} <FiChevronDown size={12} />
            </button>
          </div>

          <div className="hidden md:flex flex-1 max-w-xl relative">
            <form onSubmit={handleSearch} className="w-full">
              <div className={`relative flex items-center bg-gray-100 dark:bg-slate-800 rounded-2xl border-2 transition-all duration-300 ${
                showSuggestions ? 'border-indigo-400 shadow-lg shadow-indigo-500/10' : 'border-transparent hover:border-gray-200 dark:hover:border-slate-700'
              }`}>
                <FiSearch size={18} className="absolute left-4 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder={t('menu.search')}
                  className="w-full bg-transparent pl-12 pr-12 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none"
                />
                <button type="button" className="absolute right-3 p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-400 transition-colors">
                  <FiMic size={16} />
                </button>
              </div>
            </form>

            <AnimatePresence>
              {showSuggestions && searchQuery && searchSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 py-3 z-50 overflow-hidden"
                >
                  {searchSuggestions.map((food) => (
                    <Link
                      key={food._id}
                      to={`/menu/${food._id}`}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                        {food.image && <img src={food.image} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{food.name}</p>
                        <p className="text-xs text-gray-500">{t('common.currencyETB')} {food.price?.toFixed(2)}</p>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <LanguageSwitcher
              dark={darkMode}
              btnBase="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-500 transition-all"
            />
            {[FiHeart, FiBell, FiShoppingCart].map((Icon, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={i === 2 ? () => navigate('/cart') : undefined}
                className="relative w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-500 transition-all"
              >
                <Icon size={17} />
                {i === 2 && cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </motion.button>
            ))}

            <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 mx-1 hidden sm:block" />

            {user ? (
              <Link to="/profile" className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20">
                {user.name?.charAt(0).toUpperCase()}
              </Link>
            ) : (
              <Link to="/login" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all">
                <FiUser size={14} /> {t('nav.signIn')}
              </Link>
            )}

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="md:hidden w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center"
            >
              <FiSearch size={17} className="text-gray-600 dark:text-gray-300" />
            </motion.button>
          </div>
        </div>

        {/* MOBILE SEARCH */}
        <AnimatePresence>
          {showMobileSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden px-4 pb-3"
            >
              <form onSubmit={handleSearch}>
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 rounded-xl px-4 py-2.5">
                  <FiSearch size={16} className="text-gray-400" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('menu.search')}
                    className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none"
                    autoFocus
                  />
                  <button type="button" className="text-gray-400"><FiMic size={16} /></button>
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="text-gray-400"><FiX size={16} /></button>
                  )}
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <main className={`pt-20 ${scrolled ? 'pt-16' : 'pt-20'} transition-all duration-500`}>
        {/* MEGA CATEGORY NAV */}
        <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
          <div className="w-full px-4 sm:px-8">
            <div className="py-3">
              <CategoryNav selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
            </div>
          </div>
        </div>

        <div className="w-full px-4 sm:px-8 py-6">
          {/* TOP BAR: Search + Sort + Toggle */}
          <div className="flex items-center gap-3 mb-6">
            <div className="hidden lg:block w-[280px] flex-shrink-0" />

            <div className="flex-1" />

            <p className="hidden sm:block text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">{filteredFoods.length}</span> {t('menu.dishes')}
            </p>

            <SortDropdown sortBy={sortBy} onSortChange={setSortBy} />

            <div className="hidden sm:flex items-center bg-gray-100 dark:bg-slate-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-500' : 'text-gray-400'}`}
              >
                <FiGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-500' : 'text-gray-400'}`}
              >
                <FiList size={15} />
              </button>
            </div>

            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:border-indigo-400 transition-all"
            >
              <FiFilter size={15} />
              {t('menu.filter')}
              {totalActiveFilters > 0 && (
                <span className="px-1.5 py-0.5 bg-indigo-500 text-white text-[10px] rounded-full">{totalActiveFilters}</span>
              )}
            </button>
          </div>

          {/* ACTIVE FILTER TAGS */}
          <AnimatePresence>
            {(selectedCategory || searchQuery || totalActiveFilters > 0) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 mb-6 flex-wrap"
              >
                <span className="text-xs text-gray-400">{t('menu.active')}:</span>
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-100
              dark:bg-indigo-900/30
              text-indigo-700
              dark:text-indigo-300 text-xs font-semibold rounded-full">
                    {typeof selectedCategory === 'string' && selectedCategory.length < 20
                      ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)
                      : t('menu.categories')}
                    <button onClick={() => setSelectedCategory('')} className="hover:text-indigo-900"><FiX size={11} /></button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold rounded-full">
                    "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="hover:text-amber-900"><FiX size={11} /></button>
                  </span>
                )}
                {Object.entries(activeFilters).map(([g, opts]) =>
                  opts.map((opt) => (
                    <span
                      key={`${g}-${opt}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-full"
                    >
                      {opt}
                      <button onClick={() => toggleFilter(g, opt)} className="hover:text-indigo-900"><FiX size={11} /></button>
                    </span>
                  ))
                )}
                <button onClick={clearFilters} className="text-xs font-semibold text-indigo-500 hover:text-indigo-600 underline underline-offset-2">
                  {t('menu.clearAll')}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* MAIN CONTENT: Sidebar + Grid */}
          <div className="flex gap-8">
            {/* DESKTOP SIDEBAR */}
            <aside className="hidden lg:block w-[280px] flex-shrink-0">
              <div className="sticky top-28">
                <FilterSidebar
                  activeFilters={activeFilters}
                  onToggleFilter={toggleFilter}
                  onClearAll={clearFilters}
                />
              </div>
            </aside>

            {/* FOOD GRID */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="flex flex-wrap gap-5">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="w-[calc(50%-0.625rem)] sm:w-[calc(50%-0.625rem)] lg:w-[270px] flex-shrink-0 bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700 animate-pulse">
                      <div className="aspect-[4/5] bg-gray-200 dark:bg-slate-700" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-full w-3/4" />
                        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded-full w-1/2" />
                        <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded-full w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredFoods.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-20"
                >
                  <div className="text-7xl mb-6">🔍</div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('menu.noItems')}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">{t('menu.adjustFilters')}</p>
                  <button onClick={clearFilters} className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-xl transition-all">
                    {t('menu.clearAllFilters')}
                  </button>
                </motion.div>
              ) : (
                <>
                  {/* RECENTLY VIEWED + TRENDING */}
                  {recentlyViewed.length > 0 && !selectedCategory && !searchQuery && totalActiveFilters === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-8"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <FiClock size={16} className="text-indigo-500" />
                          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('menu.recentlyViewed')}</h2>
                        </div>
                      </div>
                      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                        {recentlyViewed.slice(0, 6).map((food) => (
                          <Link
                            key={food._id}
                            to={`/menu/${food._id}`}
                            className="flex-shrink-0 w-36 bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-all group"
                          >
                            <div className="aspect-square bg-gray-100 dark:bg-slate-700 overflow-hidden">
                              <img src={food.image || `https://placehold.co/200x200/e85d2c/ffffff?text=${food.name?.charAt(0)}`} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="p-2.5">
                              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{food.name}</p>
                              <p className="text-xs font-bold text-indigo-500">{t('common.currencyETB')} {food.price?.toFixed(2)}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* TRENDING CAROUSEL */}
                  {filteredFoods.length > 0 && !selectedCategory && !searchQuery && totalActiveFilters === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="mb-8"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🔥</span>
                          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('menu.trendingNow')}</h2>
                        </div>
                      </div>
                      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                        {[...filteredFoods].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8).map((food) => (
                          <Link
                            key={food._id}
                            to={`/menu/${food._id}`}
                            className="flex-shrink-0 w-32 text-center group"
                          >
                            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-indigo-100 to-purple-100
              dark:from-indigo-900/30 dark:to-purple-900/30 p-1 mb-2">
                              <div className="w-full h-full rounded-full overflow-hidden border-2 border-white dark:border-slate-800">
                                <img
                                  src={food.image || `https://placehold.co/150x150/e85d2c/ffffff?text=${food.name?.charAt(0)}`}
                                  alt=""
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                              </div>
                            </div>
                            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{food.name}</p>
                            <p className="text-[11px] font-bold text-indigo-500">{t('common.currencyETB')} {food.price?.toFixed(2)}</p>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* RESULTS COUNT */}
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('menu.showing')} <span className="font-semibold text-gray-900 dark:text-white">{filteredFoods.length}</span> {t('menu.results')}
                    </p>
                  </div>

                  {/* FOOD GRID */}
                  <motion.div layout className="flex flex-wrap gap-5">
                    <AnimatePresence mode="popLayout">
                      {filteredFoods.map((food, index) => (
                        <div key={food._id} className="w-full sm:w-[calc(50%-0.625rem)] lg:w-[340px] xl:w-[360px] flex-shrink-0">
                          <EnhancedFoodCard food={food} index={index} />
                        </div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MOBILE FILTER DRAWER */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileFilterOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl lg:hidden overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <FiSliders size={16} className="text-indigo-500" />
                  <span className="font-bold text-gray-900 dark:text-white">{t('menu.filter')}</span>
                </div>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center"
                >
                  <FiX size={14} />
                </button>
              </div>
              <div className="overflow-y-auto p-6 pb-24">
                <FilterSidebar
                  activeFilters={activeFilters}
                  onToggleFilter={toggleFilter}
                  onClearAll={clearFilters}
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20"
                >
                  {t('menu.applyFilters')} {totalActiveFilters > 0 ? `(${totalActiveFilters})` : ''}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* FLOATING CART */}
      <FloatingCart />

      {/* MOBILE BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 lg:hidden safe-area-bottom">
        <div className="flex items-center justify-around py-2">
          {[
            { icon: FiGrid, label: t('nav.menu'), active: true, onClick: undefined },
            { icon: FiSearch, label: t('common.search'), onClick: undefined },
            { icon: FiShoppingCart, label: t('nav.cart'), badge: cartCount, onClick: () => navigate('/cart') },
            { icon: FiHeart, label: t('dashboard.favorites'), onClick: undefined },
            { icon: FiUser, label: t('nav.profile'), onClick: () => navigate(user ? '/profile' : '/login') },
          ].map(({ icon: Icon, label, active, badge, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className={`flex flex-col items-center gap-0.5 px-4 py-1 relative ${
                active ? 'text-indigo-500' : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <Icon size={20} />
              {badge > 0 && (
                <span className="absolute -top-1 right-1/3 w-5 h-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">
                  {badge}
                </span>
              )}
              <span className="text-[10px] font-semibold">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
