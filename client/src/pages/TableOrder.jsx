import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import FoodCard from '../components/foods/FoodCard';
import Loading from '../components/common/Loading';
import { FiSearch, FiMapPin, FiShoppingCart, FiPlus, FiMinus, FiX } from 'react-icons/fi';

export default function TableOrder() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [table, setTable] = useState(null);
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [guestInfo, setGuestInfo] = useState({ name: '', phone: '' });
  const [showCart, setShowCart] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tableRes, foodsRes, categoriesRes] = await Promise.all([
        axios.get(`/api/tables/${tableId}`),
        axios.get(`/api/foods?limit=50${selectedCategory ? `&category=${selectedCategory}` : ''}`),
        axios.get('/api/categories')
      ]);
      setTable(tableRes.data.data);
      setFoods(foodsRes.data.data.foods);
      setCategories(categoriesRes.data.data);
    } catch (error) {
      toast.error('Invalid QR code or table not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const filteredFoods = foods.filter(food => {
    if (!searchQuery) return true;
    return food.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const addToCart = (food) => {
    setCart(prev => {
      const existing = prev.find(item => item.food._id === food._id && !item.size && item.extras.length === 0);
      if (existing) {
        return prev.map(item => 
          item.food._id === food._id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { food, quantity: 1, size: null, extras: [] }];
    });
    toast.success(`${food.name} added to cart`);
  };

  const updateQuantity = (index, delta) => {
    setCart(prev => prev.map((item, i) => {
      if (i === index) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const getSubtotal = () => cart.reduce((acc, item) => acc + (item.food.price * item.quantity), 0);
  const getTax = () => getSubtotal() * 0.15;
  const getTotal = () => getSubtotal() + getTax();

  const placeOrder = async () => {
    if (!guestInfo.name || !guestInfo.phone) {
      toast.error('Please enter your name and phone number');
      return;
    }
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setPlacingOrder(true);
    try {
      const items = cart.map(item => ({
        food: item.food._id,
        quantity: item.quantity
      }));
      
      const { data } = await axios.post('/api/orders', {
        items,
        type: 'dine_in',
        tableId: table._id,
        guestName: guestInfo.name,
        guestPhone: guestInfo.phone,
        paymentMethod: 'cash'
      });
      
      toast.success('Order placed successfully!');
      navigate(`/order/${data.data.order.orderId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) return <Loading />;
  if (!table) return null;

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="w-full px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Table {table.tableNumber}</h1>
                <p className="text-white/60">Scan & Order - No login required</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/60">Your Table</p>
                <p className="text-2xl font-bold text-primary-500">#{table.tableNumber}</p>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="mb-6">
                <div className="relative">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search dishes..."
                    className="input-glass pl-12"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    !selectedCategory ? 'bg-primary-500' : 'glass hover:bg-white/10'
                  }`}
                >
                  All
                </button>
                {categories.map(category => (
                  <button
                    key={category._id}
                    onClick={() => setSelectedCategory(category._id)}
                    className={`px-4 py-2 rounded-full transition-colors ${
                      selectedCategory === category._id ? 'bg-primary-500' : 'glass hover:bg-white/10'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFoods.map((food, index) => (
                  <motion.div
                    key={food._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-card"
                  >
                    <div className="flex gap-4">
                      <img
                        src={food.image || 'https://via.placeholder.com/80'}
                        alt={food.name}
                        className="w-20 h-20 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{food.name}</h3>
                        <p className="text-white/60 text-sm mb-2 line-clamp-2">{food.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-primary-500 font-bold">ETB {food.price}</span>
                          <button
                            onClick={() => addToCart(food)}
                            className="btn-primary px-3 py-1 text-sm"
                          >
                            <FiPlus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="lg:w-96">
              <div className="sticky top-24">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Your Order</h2>
                    <span className="text-primary-500">{cart.length} items</span>
                  </div>

                  {cart.length === 0 ? (
                    <p className="text-white/60 text-center py-8">Cart is empty</p>
                  ) : (
                    <div className="space-y-4 mb-4">
                      {cart.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.food.image || 'https://via.placeholder.com/40'}
                              alt={item.food.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-medium text-sm">{item.food.name}</p>
                              <p className="text-white/60 text-xs">ETB {item.food.price}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(index, -1)}
                              className="w-8 h-8 rounded-lg glass flex items-center justify-center"
                            >
                              <FiMinus size={14} />
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(index, 1)}
                              className="w-8 h-8 rounded-lg glass flex items-center justify-center"
                            >
                              <FiPlus size={14} />
                            </button>
                          </div>
                        </div>
                      ))}

                      <div className="border-t border-white/10 pt-4 mt-4">
                        <div className="flex justify-between mb-2">
                          <span className="text-white/60">Subtotal</span>
                          <span>ETB {getSubtotal()}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-white/60">Tax (15%)</span>
                          <span>ETB {getTax().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total</span>
                          <span className="text-primary-500">ETB {getTotal().toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 mt-6">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={guestInfo.name}
                      onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                      className="input-glass"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={guestInfo.phone}
                      onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                      className="input-glass"
                      required
                    />
                    <button
                      onClick={placeOrder}
                      disabled={placingOrder || cart.length === 0}
                      className="w-full btn-primary disabled:opacity-50"
                    >
                      {placingOrder ? 'Placing Order...' : 'Place Order'}
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}