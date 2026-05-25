import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiMail, FiLock, FiUser, FiPhone, FiArrowRight, FiEye, FiEyeOff, FiCheck, FiSun, FiMoon } from 'react-icons/fi';

const PasswordStrength = ({ password, darkMode }) => {
  const getStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(password);
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
  const colors = ['', 'bg-red-500', 'bg-primary-500', 'bg-yellow-500', 'bg-green-500', 'bg-indigo-500'];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
            <div className={`h-full ${colors[strength]}`} style={{ width: i <= strength ? '100%' : '0%', transition: 'width 0.3s' }} />
          </div>
        ))}
      </div>
      {password && (
        <p className={`text-xs ${strength >= 4 ? 'text-indigo-500' : strength >= 2 ? 'text-yellow-500' : 'text-red-500'}`}>
          {labels[strength]} password
        </p>
      )}
    </div>
  );
};

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const { register } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!acceptedTerms) {
      setError('Please accept the terms and conditions');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, phone);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex transition-colors duration-500 ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
      {/* Left side - Benefits */}
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
          className={`absolute bottom-24 right-16 text-5xl ${darkMode ? 'opacity-10' : 'opacity-15'}`}
          animate={{ y: [0, 12, 0], rotate: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
        >
          
        </motion.div>

        <div className="flex flex-col items-center justify-center h-full p-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
          >
            <div className="relative mb-10">
              <div className={`w-60 h-60 mx-auto rounded-full shadow-2xl flex items-center justify-center ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                <span className="text-8xl">🍕</span>
              </div>
              <motion.div
                className="absolute -top-4 -right-4 w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/40"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
              >
                <span className="text-2xl">✨</span>
              </motion.div>
            </div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}
            >
              Join <span className="text-indigo-600">Nile Food</span>
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className={`text-lg max-w-sm mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
            >
              Create your account and start ordering delicious meals today
            </motion.p>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 space-y-4 w-full max-w-sm"
          >
            {[
              { icon: '🎁', title: 'Exclusive Offers', desc: 'Get special discounts on your first order' },
              { icon: '📱', title: 'Easy Ordering', desc: 'Order in just a few taps' },
              { icon: '🚚', title: 'Free Delivery', desc: 'Free shipping on orders over $20' },
            ].map((benefit, i) => (
              <motion.div
                key={benefit.title}
                className={`rounded-xl p-4 flex items-center gap-4 shadow-sm ${darkMode ? 'bg-slate-800' : 'bg-white'}`}
                whileHover={{ y: -3 }}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1 + i * 0.1 }}
              >
                <span className="text-3xl">{benefit.icon}</span>
                <div>
                  <p className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{benefit.title}</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{benefit.desc}</p>
                </div>
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

      {/* Right side - Register form */}
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
              {/* Mobile logo */}
              <div className="flex items-center gap-3 mb-8 lg:hidden">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">N</span>
                </div>
                <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Nile Food</span>
              </div>

              <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Create Account</h2>
              <p className={`mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Join us for an amazing food experience</p>

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
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
                  <div className="relative">
                    <FiUser className={`absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={18} />
                    <input
                      type="text" value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl focus:ring-0 focus:outline-none transition-colors ${darkMode ? 'bg-slate-800 border-2 border-slate-700 text-white placeholder-gray-500 focus:border-indigo-500' : 'bg-white border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500'}`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email Address</label>
                  <div className="relative">
                    <FiMail className={`absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={18} />
                    <input
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl focus:ring-0 focus:outline-none transition-colors ${darkMode ? 'bg-slate-800 border-2 border-slate-700 text-white placeholder-gray-500 focus:border-indigo-500' : 'bg-white border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500'}`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Phone Number <span className={`font-normal ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>(optional)</span>
                  </label>
                  <div className="relative">
                    <FiPhone className={`absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={18} />
                    <input
                      type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl focus:ring-0 focus:outline-none transition-colors ${darkMode ? 'bg-slate-800 border-2 border-slate-700 text-white placeholder-gray-500 focus:border-indigo-500' : 'bg-white border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
                  <div className="relative">
                    <FiLock className={`absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      className={`w-full pl-12 pr-12 py-3.5 rounded-xl focus:ring-0 focus:outline-none transition-colors ${darkMode ? 'bg-slate-800 border-2 border-slate-700 text-white placeholder-gray-500 focus:border-indigo-500' : 'bg-white border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500'}`}
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute right-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  <PasswordStrength password={password} darkMode={darkMode} />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Confirm Password</label>
                  <div className="relative">
                    <FiLock className={`absolute left-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={18} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className={`w-full pl-12 pr-12 py-3.5 rounded-xl focus:ring-0 focus:outline-none transition-colors ${darkMode ? 'bg-slate-800 border-2 border-slate-700 text-white placeholder-gray-500 focus:border-indigo-500' : 'bg-white border-2 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500'}`}
                      required
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className={`absolute right-4 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                      {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                  {confirmPassword && password === confirmPassword && (
                    <p className="text-xs text-indigo-500 mt-1 flex items-center gap-1"><FiCheck size={12} /> Passwords match</p>
                  )}
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <button type="button" onClick={() => setAcceptedTerms(!acceptedTerms)} className="mt-0.5">
                    <div className="w-5 h-5 border-2 rounded flex items-center justify-center transition-all" style={{ backgroundColor: acceptedTerms ? '#4f46e5' : 'transparent', borderColor: acceptedTerms ? '#4f46e5' : (darkMode ? '#475569' : '#d1d5db') }}>
                      {acceptedTerms && <FiCheck size={12} className="text-white" />}
                    </div>
                  </button>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    I agree to the <Link to="/terms" className="text-indigo-600 hover:text-indigo-500">Terms of Service</Link> and <Link to="/privacy" className="text-indigo-600 hover:text-indigo-500">Privacy Policy</Link>
                  </p>
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
                      Create Account
                      <FiArrowRight size={18} />
                    </>
                  )}
                </motion.button>
              </form>

              <p className={`text-center mt-8 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-semibold">
                  Sign In
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
