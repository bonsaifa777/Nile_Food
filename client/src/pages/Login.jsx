import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back to Nile Food!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex transition-colors duration-500 ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
      {/* Left side - Branding */}
      <div className={`hidden lg:flex lg:w-[45%] relative overflow-hidden ${darkMode ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900' : 'bg-gradient-to-br from-indigo-50 via-white to-indigo-100'}`}>
        {/* Decorative elements */}
        <motion.div
          className={`absolute top-16 left-16 text-7xl ${darkMode ? 'opacity-10' : 'opacity-20'}`}
          animate={{ y: [0, -15, 0], rotate: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
        >
          🍃
        </motion.div>
        <motion.div
          className={`absolute bottom-32 right-20 text-6xl ${darkMode ? 'opacity-10' : 'opacity-15'}`}
          animate={{ y: [0, 12, 0], rotate: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
        >
          
        </motion.div>
        <motion.div
          className={`absolute top-1/3 right-12 text-5xl ${darkMode ? 'opacity-10' : 'opacity-10'}`}
          animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
        >
          🍃
        </motion.div>

        {/* Content */}
        <div className="flex flex-col items-center justify-center h-full p-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
          >
            {/* Food illustration circle */}
            <div className="relative mb-10">
              <div className={`w-60 h-60 mx-auto rounded-full shadow-2xl flex items-center justify-center ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                <span className="text-8xl">️</span>
              </div>
              <motion.div
                className="absolute -top-4 -right-4 w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/40"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
              >
                <span className="text-2xl">✨</span>
              </motion.div>
              <motion.div
                className={`absolute -bottom-3 -left-3 w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${darkMode ? 'bg-slate-700' : 'bg-white'}`}
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                <span className="text-2xl">⭐</span>
              </motion.div>
            </div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}
            >
              Welcome to{' '}
              <span className="text-indigo-600">Nile Food</span>
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className={`text-lg max-w-sm mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
            >
              Discover delicious meals delivered fresh to your doorstep
            </motion.p>
          </motion.div>

          {/* Feature cards */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-3 gap-4 mt-12 w-full max-w-md"
          >
            {[
              { icon: '🚀', label: 'Fast Delivery' },
              { icon: '', label: 'Fresh Food' },
              { icon: '💎', label: 'Best Price' },
            ].map((feature, i) => (
              <motion.div
                key={feature.label}
                className={`rounded-xl p-4 text-center shadow-sm ${darkMode ? 'bg-slate-800' : 'bg-white'}`}
                whileHover={{ y: -5 }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 + i * 0.1 }}
              >
                <span className="text-3xl block mb-2">{feature.icon}</span>
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{feature.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Background pattern */}
        <div className={`absolute inset-0 opacity-5 ${darkMode ? 'opacity-5' : 'opacity-[0.03]'}`}
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, ${darkMode ? '#818cf8' : '#6366f1'} 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Right side - Login form */}
      <div className={`flex-1 flex flex-col p-8 lg:p-12 relative ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
        {/* Dark mode toggle */}
        <div className="flex justify-end mb-8">
          <motion.button
            onClick={toggleDarkMode}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${darkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
          </motion.button>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              {/* Mobile logo (only shown on small screens) */}
              <div className="flex items-center gap-3 mb-8 lg:hidden">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">N</span>
                </div>
                <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Nile Food</span>
              </div>

              <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Welcome Back</h2>
              <p className={`mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sign in to continue your food journey</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email Address</label>
                  <div className="relative">
                    <FiMail className={`absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={18} />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="your@email.com"
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl focus:ring-0 focus:outline-none transition-colors ${darkMode ? 'bg-slate-800 border-2 border-slate-700 text-white placeholder-gray-500 focus:border-indigo-500' : 'bg-white border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500'}`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
                  <div className="relative">
                    <FiLock className={`absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Enter your password"
                      className={`w-full pl-12 pr-12 py-3.5 rounded-xl focus:ring-0 focus:outline-none transition-colors ${darkMode ? 'bg-slate-800 border-2 border-slate-700 text-white placeholder-gray-500 focus:border-indigo-500' : 'bg-white border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500'}`}
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute right-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                    Forgot password?
                  </Link>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-indigo-600 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/30 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <motion.div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} />
                  ) : (
                    <>
                      Sign In
                      <FiArrowRight size={18} />
                    </>
                  )}
                </motion.button>
              </form>

              <div className="mt-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`flex-1 h-px ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`} />
                  <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>or continue with</span>
                  <div className={`flex-1 h-px ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`} />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {['Google', 'Apple', 'Phone'].map((provider) => (
                    <motion.button
                      key={provider}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${darkMode ? 'border-slate-700 hover:border-indigo-500 hover:bg-slate-800' : 'border-gray-200 hover:border-indigo-500 hover:bg-indigo-50'}`}
                    >
                      <span className={`text-lg font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{provider[0]}</span>
                      <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{provider}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <p className={`text-center mt-8 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Don't have an account?{' '}
                <Link to="/register" className="text-indigo-600 hover:text-indigo-500 font-semibold">
                  Sign up
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
