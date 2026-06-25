import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import {
  ChevronLeft, Check, ShoppingBag, Clock, Truck,
  Sun, Moon, Sparkles, MapPin, Star, Zap, Home, Building2
} from 'lucide-react';

export default function SelectTable() {
  const { t } = useTranslation();
  const categoryConfig = {
    regular: {
      label: t('selectTable.regularTables'),
      icon: MapPin,
      color: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
    },
    vip: {
      label: t('selectTable.vipClass'),
      icon: Star,
      color: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
    },
  };

  const navigate = useNavigate();
  const location = useLocation();
  const routeOrderType = location.state?.orderType || 'dine_in';
  const { cart, orderType, getSubtotal, getDeliveryFee, getTax, getTotal, clearCart, setOrderType } = useCart();
  const { darkMode, toggleDarkMode } = useTheme();
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    setOrderType('dine_in');
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const { data } = await axios.get('/api/tables?status=available');
      setTables(data.data);
    } catch (error) {
      toast.error(t('selectTable.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const handleOrderNow = async () => {
    if (!selectedTable) {
      toast.error(t('selectTable.pleaseSelectTable'));
      return;
    }
    if (cart.length === 0) {
      toast.error(t('selectTable.cartEmpty'));
      return;
    }

    setOrdering(true);
    try {
      const orderData = {
        items: cart.map((item) => ({
          food: item.food,
          quantity: item.quantity,
          size: item.size,
          extras: item.extras,
          specialInstructions: item.specialInstructions,
        })),
        type: 'dine_in',
        tableId: selectedTable,
        paymentMethod: 'cash',
      };

      const { data } = await axios.post('/api/orders', orderData);
      clearCart();
      toast.success(t('selectTable.orderSuccess'), {
        position: 'top-right',
        style: {
          background: '#10b981',
          color: '#fff',
          borderRadius: '16px',
          padding: '16px 24px',
          fontWeight: 600,
        },
        icon: '✅',
        duration: 4000,
      });
      navigate(`/order/${data.data.orderId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || t('selectTable.orderFailed'), {
        position: 'top-right',
      });
    } finally {
      setOrdering(false);
    }
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const selectedTableData = tables.find(t => t._id === selectedTable);
  const selectedCatConfig = selectedTableData ? categoryConfig[selectedTableData.category] || categoryConfig.regular : null;

  const grouped = tables.reduce((acc, table) => {
    const cat = table.category || 'regular';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(table);
    return acc;
  }, {});

  const categoryOrder = ['regular', 'vip'];

  const tablesCount = tables.length;
  const regularCount = (grouped.regular || []).length;
  const vipCount = (grouped.vip || []).length;

  return (
    <div className="min-h-screen relative">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-aurora" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-aurora" style={{ animationDelay: '-5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl animate-aurora" style={{ animationDelay: '-10s' }} />
      </div>

      <Header />

      <main className="pt-24 pb-20 relative z-10">
        <div className="w-full max-w-6xl mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 text-center"
          >
            <motion.button
              type="button"
              onClick={() => navigate('/menu')}
              whileHover={{ scale: 1.02, x: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 text-gray-400 hover:text-indigo-400 mb-6 transition-colors text-sm font-medium"
            >
              <ChevronLeft size={16} /> {t('selectTable.backToMenu')}
            </motion.button>

            <div className="flex items-center justify-center gap-4">
              <div>
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Sparkles size={12} /> {t('selectTable.dineInExperience')}
                </motion.div>
                <motion.h1
                  className="text-4xl sm:text-5xl font-black gradient-text"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {t('selectTable.title')}
                </motion.h1>
                <motion.p
                  className="text-gray-500 dark:text-gray-400 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {t('selectTable.subtitle')}
                </motion.p>
              </div>

              <motion.button
                type="button"
                onClick={toggleDarkMode}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                whileHover={{ scale: 1.1, rotate: darkMode ? -15 : 15 }}
                whileTap={{ scale: 0.9 }}
                className="relative w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden shadow-xl transition-all duration-500 group"
              >
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    background: darkMode
                      ? 'linear-gradient(135deg, #1e293b, #334155)'
                      : 'linear-gradient(135deg, #fef3c7, #fde68a)',
                  }}
                  transition={{ duration: 0.5 }}
                />
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: darkMode
                      ? 'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.2), transparent 70%)'
                      : 'radial-gradient(circle at 50% 50%, rgba(245,158,11,0.2), transparent 70%)',
                  }}
                />
                <AnimatePresence mode="wait">
                  {darkMode ? (
                    <motion.span
                      key="sun"
                      initial={{ rotate: -90, scale: 0, opacity: 0 }}
                      animate={{ rotate: 0, scale: 1, opacity: 1 }}
                      exit={{ rotate: 90, scale: 0, opacity: 0 }}
                      transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
                      className="relative z-10"
                    >
                      <Sun size={20} className="text-amber-400" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="moon"
                      initial={{ rotate: 90, scale: 0, opacity: 0 }}
                      animate={{ rotate: 0, scale: 1, opacity: 1 }}
                      exit={{ rotate: -90, scale: 0, opacity: 0 }}
                      transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
                      className="relative z-10"
                    >
                      <Moon size={20} className="text-indigo-600" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            {/* Category stats */}
            {!loading && tables.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center gap-4 sm:gap-6 mt-6 flex-wrap"
              >
                {regularCount > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <MapPin size={12} className="text-emerald-400" /> {regularCount} {t('selectTable.regular')}
                  </div>
                )}
                {vipCount > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <Star size={12} className="text-amber-400" /> {vipCount} {t('selectTable.vip')}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Table Grid */}
            <div className="lg:col-span-2">
              {loading ? (
                <div className="rounded-[2rem] border border-white/20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl shadow-2xl p-12 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full mx-auto mb-4"
                  />
                  <p className="text-gray-400">{t('selectTable.loadingTables')}</p>
                </div>
              ) : tables.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[2rem] border border-white/20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl shadow-2xl p-12 text-center"
                >
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 mx-auto mb-6 flex items-center justify-center">
                    <Clock size={32} className="text-indigo-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{t('selectTable.noTables')}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">{t('selectTable.noTablesDesc')}</p>
                  <button
                    type="button"
                    onClick={() => navigate('/menu')}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-xl"
                  >
                    {t('selectTable.browseMenuInstead')}
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[2rem] border border-white/20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl shadow-2xl overflow-hidden"
                >
                  <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                          <MapPin size={22} className="text-indigo-400" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('selectTable.availableTables')}</h2>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t('selectTable.tablesAvailable', { count: tables.length })}</p>
                        </div>
                      </div>
                      <motion.div
                        className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-semibold"
                        animate={{ scale: [1, 1.03, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {t('selectTable.dineIn')}
                      </motion.div>
                    </div>

                    <div className="space-y-8">
                      {categoryOrder.map(cat => {
                        const catTables = grouped[cat];
                        if (!catTables || catTables.length === 0) return null;
                        const config = categoryConfig[cat];
                        const Icon = config.icon;
                        return (
                          <div key={cat}>
                            <div className="flex items-center gap-2 mb-3">
                              <div className={`w-7 h-7 rounded-lg ${config.bg} flex items-center justify-center`}>
                                <Icon size={14} className={config.text} />
                              </div>
                              <span className={`text-sm font-semibold ${config.text}`}>{config.label}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}>
                                {catTables.length}
                              </span>
                            </div>
                            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                              {catTables.map((table, index) => (
                                <motion.button
                                  key={table._id}
                                  type="button"
                                  initial={{ opacity: 0, scale: 0.5 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: index * 0.03, type: 'spring', stiffness: 200 }}
                                  whileHover={{ scale: 1.08, y: -4 }}
                                  whileTap={{ scale: 0.92 }}
                                  onClick={() => setSelectedTable(table._id)}
                                  className={`relative p-5 rounded-2xl font-bold text-lg transition-all ${
                                    selectedTable === table._id
                                      ? `bg-gradient-to-br ${config.color} text-white shadow-2xl shadow-${cat === 'regular' ? 'emerald' : cat === 'vip' ? 'amber' : 'indigo'}-500/30 scale-105`
                                      : 'bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 border border-white/20 hover:border-indigo-500/30'
                                  }`}
                                >
                                  {selectedTable === table._id && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ type: 'spring', stiffness: 300 }}
                                      className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg"
                                    >
                                      <Check size={14} className="text-indigo-600" />
                                    </motion.div>
                                  )}
                                  <motion.span
                                    className="block"
                                    animate={selectedTable === table._id ? { scale: [1, 1.1, 1] } : {}}
                                    transition={{ duration: 2, repeat: Infinity }}
                                  >
                                    {table.tableNumber}
                                  </motion.span>
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Order Now CTA */}
              <AnimatePresence>
                {selectedTable && (
                  <motion.button
                    type="button"
                    onClick={handleOrderNow}
                    disabled={ordering}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-lg shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:200%_200%]"
                      animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />
                    {ordering ? (
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full inline-block"
                          />
                          {t('selectTable.placingOrder')}
                      </span>
                    ) : (
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <Zap size={20} /> {t('selectTable.orderNow')}
                      </span>
                    )}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Order Summary Sidebar */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
                className="lg:sticky lg:top-24"
              >
                <div className="rounded-[2rem] border border-white/20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl shadow-2xl overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                  <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                        <ShoppingBag size={20} className="text-indigo-400" />
{t('selectTable.orderSummary')}
                      </h3>
                      <motion.span
                        className="px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-400 text-xs font-semibold"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {t('selectTable.itemCount', { count: cart.reduce((sum, i) => sum + i.quantity, 0) })}
                      </motion.span>
                    </div>

                    <div className="space-y-2 mb-6 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                      {cart.map((item, idx) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-all"
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 ring-2 ring-indigo-500/10">
                            <img
                              src={item.image || '/placeholder-food.jpg'}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.name}</p>
                            <p className="text-xs text-gray-400">{item.quantity}x</p>
                          </div>
                          <span className="text-sm font-bold text-indigo-400 flex-shrink-0">
                            {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    <div className="space-y-3 border-t border-white/10 pt-5">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">{t('selectTable.subtotal')}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{getSubtotal().toFixed(2)} {t('common.currencyETB')}</span>
                      </div>
                      {orderType === 'delivery' && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400 flex items-center gap-1">
                            <Truck size={12} /> {t('selectTable.delivery')}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
          {getDeliveryFee() === 0 ? (
              <span className="text-emerald-400 font-semibold">{t('selectTable.free')}</span>
            ) : (
              <>{getDeliveryFee().toFixed(2)} {t('common.currencyETB')}</>
            )}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">{t('selectTable.tax')}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{getTax().toFixed(2)} {t('common.currencyETB')}</span>
                      </div>

                      <div className="border-t border-white/10 pt-4 mt-4">
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-xs text-gray-400">{t('selectTable.total')}</p>
                            <p className="text-xs text-gray-400">{t('selectTable.includingTaxes')}</p>
                          </div>
                          <motion.div
                            className="text-right"
                            key={getTotal()}
                            initial={{ scale: 1.2, opacity: 0.5 }}
                            animate={{ scale: 1, opacity: 1 }}
                          >
                            <span className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                              {getTotal().toFixed(2)}
                            </span>
                            <span className="text-sm font-medium text-gray-400 ml-1">{t('common.currencyETB')}</span>
                          </motion.div>
                        </div>
                      </div>
                    </div>

                    <motion.div
                      className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/20 flex items-center gap-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {selectedCatConfig ? <selectedCatConfig.icon size={18} className={selectedCatConfig.text} /> : <Star size={18} className="text-amber-400" />}
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {selectedTableData?.tableNumber || '—'}
                          {selectedTableData?.category && (
                            <span className={`ml-2 text-xs font-medium ${selectedCatConfig?.text || 'text-amber-400'}`}>
                              ({selectedCatConfig?.label || selectedTableData.category})
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400">{t('selectTable.seats', { count: selectedTableData?.capacity || 0 })}</p>
                      </div>
                    </motion.div>

                    {/* Mobile CTA */}
                    <motion.button
                      type="button"
                      onClick={handleOrderNow}
                      disabled={!selectedTable || ordering}
                      className="lg:hidden w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      {ordering ? (
                        <span className="flex items-center justify-center gap-2">
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full inline-block"
                          />
                        {t('selectTable.placingOrder')}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Zap size={18} /> {selectedTable ? t('selectTable.orderNow') : t('selectTable.selectTable')}
                        </span>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
