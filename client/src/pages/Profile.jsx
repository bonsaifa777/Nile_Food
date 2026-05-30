import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import OrderHistory from '../components/dashboard/OrderHistory';
import OrderStatus from '../components/dashboard/OrderStatus';
import HotelBookings from '../components/dashboard/HotelBookings';
import FavoritesSection from '../components/dashboard/FavoritesSection';
import RoomStatus from '../components/dashboard/RoomStatus';
import SettingsSection from '../components/dashboard/SettingsSection';
import {
  FiUser, FiHeart, FiClock, FiLogOut, FiLayout, FiKey,
  FiMail, FiPhone, FiStar, FiAward, FiShield, FiChevronRight, FiEdit2, FiSave,
  FiDollarSign, FiCalendar, FiShoppingBag, FiRefreshCw, FiPlus, FiTrash2,
  FiArrowRight, FiBox, FiTruck, FiCheckCircle, FiTrendingUp, FiSettings
} from 'react-icons/fi';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: FiLayout, color: 'from-indigo-500 to-blue-500' },
  { id: 'profile', label: 'Profile', icon: FiUser, color: 'from-purple-500 to-pink-500' },
  { id: 'orders', label: 'Orders', icon: FiClock, color: 'from-amber-500 to-orange-500' },
  { id: 'order-status', label: 'Order Status', icon: FiRefreshCw, color: 'from-cyan-500 to-teal-500' },
  { id: 'bookings', label: 'Hotel Bookings', icon: FiCalendar, color: 'from-sky-500 to-indigo-500' },
  { id: 'room-status', label: 'Room Status', icon: FiKey, color: 'from-teal-500 to-emerald-500' },
  { id: 'favorites', label: 'Favorites', icon: FiHeart, color: 'from-red-500 to-rose-500' },
  { id: 'settings', label: 'Settings', icon: FiSettings, color: 'from-gray-500 to-slate-500' },
];

const statCards = [
  { label: 'Total Orders', value: '24', icon: FiShoppingBag, color: 'from-blue-500 to-cyan-500' },
  { label: 'Points Earned', value: '1,280', icon: FiStar, color: 'from-amber-500 to-yellow-500' },
  { label: 'Total Spent', value: 'ETB 45.8k', icon: FiDollarSign, color: 'from-green-500 to-emerald-500' },
  { label: 'Member Since', value: '2025', icon: FiCalendar, color: 'from-purple-500 to-violet-500' },
];

function FloatingParticles({ d }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-1 h-1 rounded-full ${d ? 'bg-indigo-400/20' : 'bg-indigo-400/10'}`}
          style={{ left: `${(i * 13 + 7) % 100}%`, top: `${(i * 19 + 3) % 100}%` }}
          animate={{
            y: [0, -40, 0],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{ duration: 4 + i * 0.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.7 }}
        />
      ))}
    </div>
  );
}

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const { darkMode } = useTheme();
  const d = darkMode;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  useEffect(() => {
    fetchOrders();
    fetchFavorites();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('/api/orders');
      setOrders(data.data.orders || []);
    } catch (error) {
      console.error('Failed to load orders');
    }
  };

  const fetchFavorites = async () => {
    try {
      const { data } = await axios.get('/api/users/favorites');
      setFavorites(data.data || []);
    } catch (error) {
      console.error('Failed to load favorites');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const deliveredOrders = orders.filter(o => o.status === 'delivered');

  const sections = {
    dashboard: (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <h2 className={`text-2xl font-bold flex items-center gap-2 ${d ? 'text-white' : 'text-gray-900'}`}>
              <FiLayout className="text-indigo-400" />
              Welcome back, {user?.name?.split(' ')[0] || 'there'}
            </h2>
            <p className={`text-sm ${d ? 'text-white/40' : 'text-gray-500'} mt-1`}>Here's an overview of your account activity</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl backdrop-blur-xl transition-all ${
                d ? 'bg-slate-900/60 border border-white/10 hover:bg-white/[0.15]' : 'bg-white/90 border border-gray-200/60 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-3 shadow-sm">
                <FiShoppingBag size={16} className="text-white" />
              </div>
              <p className={`text-lg font-bold ${d ? 'text-white' : 'text-gray-900'}`}>{orders.length}</p>
              <p className={`text-xs ${d ? 'text-white/40' : 'text-gray-500'}`}>Total Orders</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className={`p-4 rounded-2xl backdrop-blur-xl transition-all ${
                d ? 'bg-slate-900/60 border border-white/10 hover:bg-white/[0.15]' : 'bg-white/90 border border-gray-200/60 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-3 shadow-sm">
                <FiCheckCircle size={16} className="text-white" />
              </div>
              <p className={`text-lg font-bold ${d ? 'text-white' : 'text-gray-900'}`}>{deliveredOrders.length}</p>
              <p className={`text-xs ${d ? 'text-white/40' : 'text-gray-500'}`}>Delivered</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className={`p-4 rounded-2xl backdrop-blur-xl transition-all ${
                d ? 'bg-slate-900/60 border border-white/10 hover:bg-white/[0.15]' : 'bg-white/90 border border-gray-200/60 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-3 shadow-sm">
                <FiTruck size={16} className="text-white" />
              </div>
              <p className={`text-lg font-bold ${d ? 'text-white' : 'text-gray-900'}`}>{activeOrders.length}</p>
              <p className={`text-xs ${d ? 'text-white/40' : 'text-gray-500'}`}>Active Orders</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className={`p-4 rounded-2xl backdrop-blur-xl transition-all ${
                d ? 'bg-slate-900/60 border border-white/10 hover:bg-white/[0.15]' : 'bg-white/90 border border-gray-200/60 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center mb-3 shadow-sm">
                <FiStar size={16} className="text-white" />
              </div>
              <p className={`text-lg font-bold ${d ? 'text-white' : 'text-gray-900'}`}>{user?.loyaltyPoints || 0}</p>
              <p className={`text-xs ${d ? 'text-white/40' : 'text-gray-500'}`}>Loyalty Points</p>
            </motion.div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`rounded-3xl backdrop-blur-xl p-6 ${
              d ? 'bg-slate-900/60 border border-white/10' : 'bg-white/90 border border-gray-200/60 shadow-xl'
            }`}
          >
            <h3 className={`text-lg font-bold flex items-center gap-2 mb-4 ${d ? 'text-white' : 'text-gray-900'}`}>
              <FiBox className="text-indigo-400" size={18} />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setActiveTab('orders')}
                className={`p-4 rounded-2xl text-left transition-all ${
                  d ? 'glass hover:bg-white/10' : 'bg-gray-100/80 border border-gray-200 hover:bg-gray-200/50'
                }`}
              >
                <FiClock className="text-amber-400 mb-2" size={20} />
                <p className={`text-sm font-semibold ${d ? 'text-white' : 'text-gray-900'}`}>View Orders</p>
                <p className={`text-xs ${d ? 'text-white/40' : 'text-gray-500'} mt-0.5`}>Track your orders</p>
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`p-4 rounded-2xl text-left transition-all ${
                  d ? 'glass hover:bg-white/10' : 'bg-gray-100/80 border border-gray-200 hover:bg-gray-200/50'
                }`}
              >
                <FiHeart className="text-red-400 mb-2" size={20} />
                <p className={`text-sm font-semibold ${d ? 'text-white' : 'text-gray-900'}`}>Favorites</p>
                <p className={`text-xs ${d ? 'text-white/40' : 'text-gray-500'} mt-0.5`}>Your saved items</p>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`p-4 rounded-2xl text-left transition-all ${
                  d ? 'glass hover:bg-white/10' : 'bg-gray-100/80 border border-gray-200 hover:bg-gray-200/50'
                }`}
              >
                <FiUser className="text-purple-400 mb-2" size={20} />
                <p className={`text-sm font-semibold ${d ? 'text-white' : 'text-gray-900'}`}>Edit Profile</p>
                <p className={`text-xs ${d ? 'text-white/40' : 'text-gray-500'} mt-0.5`}>Update your details</p>
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`rounded-3xl backdrop-blur-xl p-6 ${
              d ? 'bg-slate-900/60 border border-white/10' : 'bg-white/90 border border-gray-200/60 shadow-xl'
            }`}
          >
            <h3 className={`text-lg font-bold flex items-center gap-2 mb-4 ${d ? 'text-white' : 'text-gray-900'}`}>
              <FiTrendingUp className="text-emerald-400" size={18} />
              Account Summary
            </h3>
            <div className="space-y-4">
              <div className={`flex items-center justify-between p-3 rounded-xl ${d ? 'bg-white/5' : 'bg-gray-100'}`}>
                <span className={`text-sm ${d ? 'text-white/60' : 'text-gray-600'}`}>Member Since</span>
                <span className={`text-sm font-semibold ${d ? 'text-white' : 'text-gray-900'}`}>
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '2025'}
                </span>
              </div>
              <div className={`flex items-center justify-between p-3 rounded-xl ${d ? 'bg-white/5' : 'bg-gray-100'}`}>
                <span className={`text-sm ${d ? 'text-white/60' : 'text-gray-600'}`}>Membership Tier</span>
                <span className="text-sm font-semibold text-amber-500">Gold</span>
              </div>
              <div className={`flex items-center justify-between p-3 rounded-xl ${d ? 'bg-white/5' : 'bg-gray-100'}`}>
                <span className={`text-sm ${d ? 'text-white/60' : 'text-gray-600'}`}>Total Orders</span>
                <span className={`text-sm font-semibold ${d ? 'text-white' : 'text-gray-900'}`}>{orders.length}</span>
              </div>
              <div className={`flex items-center justify-between p-3 rounded-xl ${d ? 'bg-white/5' : 'bg-gray-100'}`}>
                <span className={`text-sm ${d ? 'text-white/60' : 'text-gray-600'}`}>Total Spent</span>
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  ETB {orders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString()}
                </span>
              </div>
              <div className={`flex items-center justify-between p-3 rounded-xl ${d ? 'bg-white/5' : 'bg-gray-100'}`}>
                <span className={`text-sm ${d ? 'text-white/60' : 'text-gray-600'}`}>Email Verified</span>
                <span className="flex items-center gap-1 text-sm font-semibold text-green-500">
                  <FiCheckCircle size={14} /> Yes
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold flex items-center gap-2 ${d ? 'text-white' : 'text-gray-900'}`}>
                <FiClock className="text-amber-400" size={18} />
                Recent Orders
              </h3>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 text-sm flex items-center gap-1"
              >
                View All <FiArrowRight size={14} />
              </button>
            </div>
            <OrderHistory orders={orders.slice(0, 3)} />
          </motion.div>
        )}
      </div>
    ),

    profile: (
      <>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden rounded-3xl backdrop-blur-xl ${
            d ? 'bg-slate-900/60 border border-white/10' : 'bg-white/90 border border-gray-200/60 shadow-xl'
          }`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${d ? 'from-indigo-500/3' : 'from-indigo-500/[0.01]'} to-transparent pointer-events-none`} />
          <div className={`absolute -top-40 -right-40 w-80 h-80 ${d ? 'bg-indigo-500/5' : 'bg-indigo-500/[0.02]'} rounded-full blur-3xl`} />

          <div className="relative p-6 md:p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className={`text-2xl font-bold flex items-center gap-2 ${d ? 'text-white' : 'text-gray-900'}`}>
                  <FiUser className="text-indigo-400" />
                  Profile Information
                </h2>
                <p className={`text-sm ${d ? 'text-white/40' : 'text-gray-500'} mt-1`}>Manage your personal details</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditing(!editing)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                  editing
                    ? d ? 'bg-white/10 text-white/70 hover:bg-white/20' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    : 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/30'
                }`}
              >
                {editing ? (
                  <><FiRefreshCw size={14} /> Cancel</>
                ) : (
                  <><FiEdit2 size={14} /> Edit Profile</>
                )}
              </motion.button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-xs font-medium ${d ? 'text-white/50' : 'text-gray-500'} mb-2 uppercase tracking-wider`}>
                    <FiUser className="inline mr-1" size={12} />
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      disabled={!editing}
                      className={`w-full px-4 py-3.5 rounded-xl text-sm transition-all ${
                        editing
                          ? d
                            ? 'bg-white/10 border border-indigo-500/50 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30'
                            : 'bg-white border border-indigo-500/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30'
                          : d
                            ? 'bg-white/5 border border-white/10 text-white/80 cursor-default'
                            : 'bg-gray-50 border border-gray-200 text-gray-700 cursor-default'
                      }`}
                    />
                    {editing && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-400 animate-pulse"
                      />
                    )}
                  </div>
                </div>
                <div>
                  <label className={`block text-xs font-medium ${d ? 'text-white/50' : 'text-gray-500'} mb-2 uppercase tracking-wider`}>
                    <FiPhone className="inline mr-1" size={12} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    disabled={!editing}
                    className={`w-full px-4 py-3.5 rounded-xl text-sm transition-all ${
                      editing
                        ? d
                          ? 'bg-white/10 border border-indigo-500/50 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30'
                          : 'bg-white border border-indigo-500/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30'
                        : d
                          ? 'bg-white/5 border border-white/10 text-white/80 cursor-default'
                          : 'bg-gray-50 border border-gray-200 text-gray-700 cursor-default'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium ${d ? 'text-white/50' : 'text-gray-500'} mb-2 uppercase tracking-wider`}>
                    <FiMail className="inline mr-1" size={12} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className={`w-full px-4 py-3.5 rounded-xl text-sm cursor-not-allowed ${
                      d ? 'bg-white/5 border border-white/10 text-white/40' : 'bg-gray-50 border border-gray-200 text-gray-400'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium ${d ? 'text-white/50' : 'text-gray-500'} mb-2 uppercase tracking-wider`}>
                    <FiStar className="inline mr-1" size={12} />
                    Membership Tier
                  </label>
                  <div className={`w-full px-4 py-3.5 rounded-xl text-sm flex items-center gap-2 ${
                    d ? 'bg-white/5 border border-white/10 text-white/80' : 'bg-gray-50 border border-gray-200 text-gray-700'
                  }`}>
                    <FiAward className="text-amber-400" size={16} />
                    <span>Gold Member</span>
                    <span className={`ml-auto text-xs ${d ? 'text-white/30' : 'text-gray-400'}`}>Active</span>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {editing && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex gap-3 mt-8 pt-6 border-t ${d ? 'border-white/10' : 'border-gray-200'}`}
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50"
                    >
                      <FiSave size={16} />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setEditing(false)}
                      className={`px-8 py-3 rounded-xl text-sm font-medium transition-all ${
                        d ? 'glass text-white/60 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Cancel
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className={`relative overflow-hidden rounded-3xl backdrop-blur-xl ${
            d ? 'bg-slate-900/60 border border-white/10' : 'bg-white/90 border border-gray-200/60 shadow-xl'
          }`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${d ? 'from-amber-500/3' : 'from-amber-500/[0.01]'} to-transparent pointer-events-none`} />

          <div className="relative p-6 md:p-8">
            <h3 className={`text-xl font-bold flex items-center gap-2 mb-6 ${d ? 'text-white' : 'text-gray-900'}`}>
              <FiAward className="text-amber-400" />
              Loyalty Program
            </h3>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                { tier: 'Silver', points: 0, color: 'from-slate-400 to-slate-300', current: user?.loyaltyPoints >= 0 },
                { tier: 'Gold', points: 500, color: 'from-amber-400 to-yellow-300', current: user?.loyaltyPoints >= 500 },
                { tier: 'Platinum', points: 2000, color: 'from-indigo-400 to-purple-300', current: user?.loyaltyPoints >= 2000 },
              ].map((tier, i) => (
                <motion.div
                  key={tier.tier}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className={`p-5 rounded-2xl border transition-all ${
                    tier.current
                      ? 'bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border-amber-500/30'
                      : d ? 'glass border-white/10 opacity-60' : 'bg-gray-100 border-gray-200 opacity-60'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-3 shadow-sm`}>
                    <FiAward size={18} className="text-white" />
                  </div>
                  <p className={`text-lg font-bold ${d ? 'text-white' : 'text-gray-900'}`}>{tier.tier}</p>
                  <p className={`text-xs ${d ? 'text-white/40' : 'text-gray-500'} mb-2`}>{tier.points} points required</p>
                  {tier.current && (
                    <span className="px-2.5 py-1 rounded-full bg-green-500/20 text-green-600 dark:text-green-300 text-xs font-medium">
                      {tier.tier === 'Gold' ? 'Current' : 'Unlocked'}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </>
    ),

    orders: (
      <OrderHistory orders={orders} />
    ),

    'order-status': (
      <OrderStatus />
    ),

    bookings: (
      <HotelBookings />
    ),

    favorites: (
      <FavoritesSection favorites={favorites} />
    ),
    'room-status': (
      <RoomStatus />
    ),
    settings: (
      <SettingsSection />
    ),
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className={`fixed inset-0 transition-colors duration-700 ${d ? 'bg-slate-950' : 'bg-gray-50'}`}>
        <div className={`absolute inset-0 ${d ? 'bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.12)_0%,_transparent_70%)]' : 'bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.04)_0%,_transparent_70%)]'}`} />
        <FloatingParticles d={d} />
      </div>

      <Header />

      <main className="relative z-10 pt-24 pb-20">
        <div className="w-full px-4">
          <div className="grid lg:grid-cols-12 gap-6">
            <motion.aside
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3 lg:sticky lg:top-24 lg:self-start"
            >
              <div className={`relative overflow-hidden rounded-3xl backdrop-blur-xl ${
                d ? 'bg-slate-900/60 border border-white/10' : 'bg-white/90 border border-gray-200/60 shadow-xl'
              }`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${d ? 'from-indigo-500/5' : 'from-indigo-500/[0.02]'} to-transparent pointer-events-none`} />
                <div className={`absolute -top-20 -right-20 w-40 h-40 ${d ? 'bg-indigo-500/10' : 'bg-indigo-500/[0.03]'} rounded-full blur-3xl`} />

                <div className="relative p-6 text-center">
                  <div className="relative inline-block mb-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                      className="absolute -inset-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-40 blur-sm"
                    />
                    <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mx-auto flex items-center justify-center text-4xl font-bold text-white shadow-2xl shadow-indigo-500/30">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full rounded-2xl object-cover" />
                      ) : (
                        user?.name?.charAt(0).toUpperCase()
                      )}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring' }}
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-white dark:border-slate-900"
                      />
                    </div>
                  </div>

                  <h2 className={`text-xl font-bold ${d ? 'text-white' : 'text-gray-900'} mb-1`}>{user?.name}</h2>
                  <p className={`text-sm ${d ? 'text-white/50' : 'text-gray-500'} mb-3`}>{user?.email}</p>

                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1">
                      <FiShield size={12} /> Verified
                    </span>
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs font-semibold">
                      Gold
                    </span>
                  </div>

                  <div className={`p-4 rounded-2xl mb-4 ${d ? 'glass' : 'bg-gray-100 border border-gray-200'}`}>
                    <p className={`text-xs ${d ? 'text-white/40' : 'text-gray-500'} mb-1`}>Loyalty Points</p>
                    <div className="flex items-center justify-center gap-2">
                      <FiStar className="text-amber-400" size={20} />
                      <span className={`text-3xl font-bold ${d ? 'text-white' : 'text-gray-900'}`}>{user?.loyaltyPoints || 0}</span>
                    </div>
                    <div className={`mt-3 h-1.5 rounded-full ${d ? 'bg-white/10' : 'bg-gray-200'} overflow-hidden`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((user?.loyaltyPoints || 0) / 10, 100)}%` }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      />
                    </div>
                    <p className={`text-xs ${d ? 'text-white/30' : 'text-gray-400'} mt-2`}>500 points to next level</p>
                  </div>
                </div>

                <nav className="px-4 pb-4 space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                          isActive
                            ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 shadow-lg shadow-indigo-500/10'
                            : d
                              ? 'text-white/50 hover:text-white/80 hover:bg-white/5'
                              : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shadow-sm`}>
                          <Icon size={14} className="text-white" />
                        </div>
                        <span className="text-sm font-medium">{item.label}</span>
                        <FiChevronRight size={14} className={`ml-auto ${d ? 'text-white/20' : 'text-gray-300'}`} />
                      </button>
                    );
                  })}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <FiLogOut size={14} className="text-red-400" />
                    </div>
                    <span className="text-sm font-medium">Sign Out</span>
                  </button>
                </nav>
              </div>
            </motion.aside>

            <div className="lg:col-span-9 space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {sections[activeTab]}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
