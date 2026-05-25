import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiPhone, FiArrowRight, FiCheck, FiSun, FiMoon } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const features = [
  { icon: '🚀', title: 'Fast Delivery', desc: '30-45 mins' },
  { icon: '💎', title: 'Best Quality', desc: 'Fresh & hot' },
  { icon: '🎯', title: 'Best Offers', desc: 'Save more' },
];

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const { login, register } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsLogin(location.pathname !== '/register');
  }, [location.pathname]);

  const validateForm = () => {
    if (!email || !password) {
      setError('Please fill in all required fields');
      return false;
    }
    if (!isLogin) {
      if (!name || !phone || !confirmPassword) {
        setError('Please fill in all required fields');
        return false;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        toast.success('Welcome back to Nile Food!');
      } else {
        await register(name, email, password, phone);
        setSuccess('Account created successfully!');
        toast.success('Welcome to Nile Food!');
        setTimeout(() => {
          setIsLogin(true);
          navigate('/login');
        }, 1500);
      }
      if (isLogin) navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row transition-colors duration-500 ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
      {/* LEFT SIDE - Branding */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`w-full lg:w-[45%] relative overflow-hidden ${darkMode ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900' : 'bg-gradient-to-br from-indigo-50 via-white to-indigo-100'}`}
      >
        {/* Decorative leaves */}
        <motion.div
          className={`absolute top-16 left-16 text-7xl ${darkMode ? 'opacity-10' : 'opacity-20'}`}
          animate={{ y: [0, -15, 0], rotate: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
        >
          🍃
        </motion.div>
        <motion.div
          className={`absolute bottom-24 right-16 text-5xl ${darkMode ? 'opacity-10' : 'opacity-15'}`}
          animate={{ y: [0, 12, 0], rotate: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
        >
          
        </motion.div>
        <motion.div
          className={`absolute top-1/3 right-12 text-4xl ${darkMode ? 'opacity-10' : 'opacity-10'}`}
          animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
        >
          🍃
        </motion.div>

        {/* Content */}
        <div className="flex flex-col items-center justify-center h-full p-8 lg:p-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
          >
            {/* Hero food illustration */}
            <div className="relative mb-10">
              <div className={`w-56 h-56 lg:w-64 lg:h-64 mx-auto rounded-full shadow-2xl flex items-center justify-center ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                <span className="text-7xl lg:text-8xl">🍽️</span>
              </div>
              <motion.div
                className="absolute -top-4 -right-4 w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/40"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
              >
                <span className="text-xl">✨</span>
              </motion.div>
              <motion.div
                className={`absolute -bottom-3 -left-3 w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${darkMode ? 'bg-slate-700' : 'bg-white'}`}
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                <span className="text-lg">⭐</span>
              </motion.div>
            </div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className={`text-3xl lg:text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}
            >
              Delicious Food,<br />
              <span className="text-indigo-600">Delivered Fast</span>
            </motion.h1>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className={`text-sm lg:text-base max-w-md mx-auto mb-10 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
            >
              Order from your favorite local restaurants with just a few clicks. Fast, fresh, and hassle-free.
            </motion.p>

            {/* Feature cards */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              {features.map((feature, idx) => (
                <motion.div
                  key={feature.title}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.9 + idx * 0.1 }}
                  whileHover={{ y: -5 }}
                  className={`rounded-xl p-4 flex items-center gap-3 shadow-sm ${darkMode ? 'bg-slate-800' : 'bg-white'}`}
                >
                  <span className="text-2xl">{feature.icon}</span>
                  <div className="text-left">
                    <p className={`font-semibold text-sm ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{feature.title}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Background pattern */}
        <div className={`absolute inset-0 opacity-5 ${darkMode ? 'opacity-5' : 'opacity-[0.03]'}`}
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, ${darkMode ? '#818cf8' : '#6366f1'} 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </motion.div>

      {/* RIGHT SIDE - Form */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`w-full lg:w-[55%] flex flex-col p-8 lg:p-12 relative ${darkMode ? 'bg-slate-900' : 'bg-white'}`}
      >
        {/* Header with logo and dark mode toggle */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Nile Food</span>
          </div>
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className={`text-2xl lg:text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {isLogin ? 'Welcome Back!' : 'Create Account'}
              </h2>
              <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {isLogin ? 'Sign in to continue your food journey' : 'Join us for amazing food experiences'}
              </p>

              {/* Toggle */}
              <div className={`flex gap-2 mb-6 rounded-xl p-1 ${darkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                <button
                  onClick={() => { setIsLogin(true); navigate('/login'); }}
                  className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
                    isLogin ? 'bg-indigo-600 text-white shadow-md' : darkMode ? 'text-gray-400 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => { setIsLogin(false); navigate('/register'); }}
                  className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
                    !isLogin ? 'bg-indigo-600 text-white shadow-md' : darkMode ? 'text-gray-400 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Messages */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
                  >
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-600 text-sm flex items-center gap-2"
                  >
                    <FiCheck size={16} />
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <AnimatePresence mode="wait">
                <motion.form
                  key={isLogin ? 'login' : 'register'}
                  initial={{ x: isLogin ? 20 : -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: isLogin ? -20 : 20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  {!isLogin && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
                      <div className="relative">
                        <FiUser className={`absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={18} />
                        <input
                          type="text" value={name} onChange={(e) => setName(e.target.value)}
                          onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                          placeholder="John Doe" required
                          className={`w-full pl-12 pr-4 py-3.5 rounded-xl focus:ring-0 focus:outline-none transition-colors ${focusedField === 'name' ? 'border-indigo-500' : (darkMode ? 'border-slate-700' : 'border-gray-200')} border-2 ${darkMode ? 'bg-slate-800 text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                        />
                      </div>
                    </motion.div>
                  )}

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email Address</label>
                    <div className="relative">
                      <FiMail className={`absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={18} />
                      <input
                        type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                        placeholder="your@email.com" required
                        className={`w-full pl-12 pr-4 py-3.5 rounded-xl focus:ring-0 focus:outline-none transition-colors ${focusedField === 'email' ? 'border-indigo-500' : (darkMode ? 'border-slate-700' : 'border-gray-200')} border-2 ${darkMode ? 'bg-slate-800 text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                      />
                    </div>
                  </div>

                  {!isLogin && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phone Number</label>
                      <div className="relative">
                        <FiPhone className={`absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={18} />
                        <input
                          type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                          onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField(null)}
                          placeholder="+1 (555) 000-0000" required
                          className={`w-full pl-12 pr-4 py-3.5 rounded-xl focus:ring-0 focus:outline-none transition-colors ${focusedField === 'phone' ? 'border-indigo-500' : (darkMode ? 'border-slate-700' : 'border-gray-200')} border-2 ${darkMode ? 'bg-slate-800 text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                        />
                      </div>
                    </motion.div>
                  )}

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
                    <div className="relative">
                      <FiLock className={`absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={18} />
                      <input
                        type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                        placeholder="" required
                        className={`w-full pl-12 pr-12 py-3.5 rounded-xl focus:ring-0 focus:outline-none transition-colors ${focusedField === 'password' ? 'border-indigo-500' : (darkMode ? 'border-slate-700' : 'border-gray-200')} border-2 ${darkMode ? 'bg-slate-800 text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute right-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                  </div>

                  {!isLogin && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Confirm Password</label>
                      <div className="relative">
                        <FiLock className={`absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={18} />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                          onFocus={() => setFocusedField('confirmPassword')} onBlur={() => setFocusedField(null)}
                          placeholder="Confirm your password" required
                          className={`w-full pl-12 pr-12 py-3.5 rounded-xl focus:ring-0 focus:outline-none transition-colors ${focusedField === 'confirmPassword' ? 'border-indigo-500' : (darkMode ? 'border-slate-700' : 'border-gray-200')} border-2 ${darkMode ? 'bg-slate-800 text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className={`absolute right-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                          {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {isLogin && (
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Remember me</span>
                      </label>
                      <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">Forgot password?</Link>
                    </div>
                  )}

                  <motion.button
                    type="submit" disabled={loading}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="w-full bg-indigo-600 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 hover:shadow-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <motion.div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} />
                    ) : (
                      <>
                        {isLogin ? 'Sign In' : 'Create Account'}
                        <FiArrowRight size={18} />
                      </>
                    )}
                  </motion.button>
                </motion.form>
              </AnimatePresence>

              {/* Social login */}
              <div className="mt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`flex-1 h-px ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`} />
                  <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>or continue with</span>
                  <div className={`flex-1 h-px ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`} />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {['Google', 'Apple', 'Phone'].map((provider) => (
                    <motion.button
                      key={provider}
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${darkMode ? 'border-slate-700 hover:border-indigo-500 hover:bg-slate-800' : 'border-gray-200 hover:border-indigo-500 hover:bg-indigo-50'}`}
                    >
                      <span className={`text-lg font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{provider[0]}</span>
                      <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{provider}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <p className={`mt-6 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => { setIsLogin(!isLogin); navigate(isLogin ? '/register' : '/login'); }}
                  className="text-indigo-600 hover:text-indigo-500 font-semibold"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
