import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiSearch, FiPlus, FiMinus, FiTrash2, FiShoppingBag, FiX, FiUser, FiPhone, FiPrinter, FiDollarSign } from 'react-icons/fi';
import { fetchPOSFoods, fetchPOSCategories, createPOSOrder, fetchCashierTables } from '../../services/cashierApi';

export default function POS() {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderType, setOrderType] = useState('dine_in');
  const [selectedTable, setSelectedTable] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [foodsRes, catsRes, tablesRes] = await Promise.all([
        fetchPOSFoods({ limit: 100 }),
        fetchPOSCategories(),
        fetchCashierTables()
      ]);
      setFoods(foodsRes.foods || []);
      setCategories(catsRes || []);
      setTables(tablesRes || []);
    } catch (err) {
      toast.error('Failed to load POS data');
    }
  };

  const filteredFoods = useMemo(() => {
    let filtered = foods;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(f => f.category?._id === selectedCategory || f.category === selectedCategory);
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(f => f.name.toLowerCase().includes(s) || f.description?.toLowerCase().includes(s));
    }
    return filtered;
  }, [foods, selectedCategory, search]);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const addToCart = (food) => {
    setCart(prev => {
      const existing = prev.find(i => i.food === food._id);
      if (existing) {
        return prev.map(i => i.food === food._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        food: food._id,
        name: food.name,
        price: food.price,
        quantity: 1,
        size: null,
        extras: []
      }];
    });
  };

  const updateQuantity = (foodId, delta) => {
    setCart(prev => {
      const existing = prev.find(i => i.food === foodId);
      if (!existing) return prev;
      const newQty = existing.quantity + delta;
      if (newQty <= 0) return prev.filter(i => i.food !== foodId);
      return prev.map(i => i.food === foodId ? { ...i, quantity: newQty } : i);
    });
  };

  const removeFromCart = (foodId) => {
    setCart(prev => prev.filter(i => i.food !== foodId));
  };

  const handleSubmit = async () => {
    if (cart.length === 0) { toast.error('Cart is empty'); return; }
    if (orderType === 'dine_in' && !selectedTable) { toast.error('Please select a table'); return; }
    setSubmitting(true);
    try {
      const res = await createPOSOrder({
        items: cart.map(i => ({
          food: i.food,
          quantity: i.quantity,
          size: i.size,
          extras: i.extras,
          specialInstructions: i.specialInstructions
        })),
        type: orderType,
        tableId: selectedTable || undefined,
        guestName: guestName || undefined,
        guestPhone: guestPhone || undefined
      });

      if (res.success) {
        toast.success('Order created!');
        setCart([]);
        setGuestName('');
        setGuestPhone('');
        setSelectedTable('');
        setShowCheckout(false);
        setCartOpen(false);
      } else {
        toast.error(res.message || 'Failed to create order');
      }
    } catch (err) {
      toast.error('Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4">
      <div className="flex-1 flex flex-col rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="flex gap-2">
              {['dine_in', 'takeaway', 'delivery'].map(type => (
                <button
                  key={type}
                  onClick={() => setOrderType(type)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    orderType === type
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat._id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat._id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredFoods.map((food, i) => (
              <motion.button
                key={food._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.02 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => addToCart(food)}
                className="relative p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500/50 text-left transition-all"
              >
                {food.image && (
                  <img src={food.image} alt={food.name} className="w-full h-20 object-cover rounded-lg mb-2" />
                )}
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{food.name}</p>
                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1">ETB {food.price}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        animate={{ width: cartOpen ? 380 : 0 }}
        className="overflow-hidden rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 shrink-0"
      >
        <div className="w-[380px] h-full flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiShoppingBag className="text-indigo-600 dark:text-indigo-400" size={20} />
              <span className="font-bold text-gray-900 dark:text-white">Cart ({cartCount})</span>
            </div>
            <button onClick={() => setCartOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
              <FiX size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <FiShoppingBag size={48} className="mb-3 opacity-50" />
                <p className="text-sm">Cart is empty</p>
                <p className="text-xs">Tap products to add them</p>
              </div>
            ) : (
              cart.map((item, i) => (
                <motion.div
                  key={item.food}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">ETB {item.price} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.food, -1)} className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500">
                      <FiMinus size={14} />
                    </button>
                    <span className="w-6 text-center text-sm font-medium text-gray-900 dark:text-white">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.food, 1)} className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500">
                      <FiPlus size={14} />
                    </button>
                    <button onClick={() => removeFromCart(item.food)} className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-500 hover:bg-red-200 dark:hover:bg-red-900/60">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            {orderType === 'dine_in' && (
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white outline-none text-sm"
              >
                <option value="">Select Table</option>
                {tables.filter(t => t.status === 'available').map(t => (
                  <option key={t._id} value={t._id}>Table {t.tableNumber} ({t.capacity} seats)</option>
                ))}
              </select>
            )}
            <div className="flex items-center justify-between text-lg font-bold text-gray-900 dark:text-white">
              <span>Total</span>
              <span>ETB {cartTotal.toLocaleString()}</span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting || cart.length === 0}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-600/25"
            >
              {submitting ? 'Creating Order...' : `Create Order · ETB ${cartTotal.toLocaleString()}`}
            </button>
          </div>
        </div>
      </motion.div>

      {!cartOpen && cartCount > 0 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-xl shadow-indigo-600/40 z-50"
        >
          <FiShoppingBag size={22} />
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center font-bold">{cartCount}</span>
        </motion.button>
      )}
    </div>
  );
}
