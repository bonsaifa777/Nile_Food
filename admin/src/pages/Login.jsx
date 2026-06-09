import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff, FiShield, FiMoon, FiSun } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function FloatingShapes() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let w, h;

    const shapes = Array.from({ length: 15 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 60 + 20,
      speedX: (Math.random() - 0.5) * 0.15,
      speedY: (Math.random() - 0.5) * 0.15,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 0.5,
      type: Math.floor(Math.random() * 3),
      opacity: Math.random() * 0.08 + 0.03,
    }));

    const resize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      shapes.forEach((s) => {
        s.x += s.speedX;
        s.y += s.speedY;
        s.rotation += s.rotSpeed;

        if (s.x < -10 || s.x > 110) s.speedX *= -1;
        if (s.y < -10 || s.y > 110) s.speedY *= -1;

        const cx = (s.x / 100) * w;
        const cy = (s.y / 100) * h;
        const sz = s.size;
        const rad = (s.rotation * Math.PI) / 180;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rad);
        ctx.globalAlpha = s.opacity;
        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 1.5;

        if (s.type === 0) {
          ctx.beginPath();
          ctx.roundRect(-sz / 2, -sz / 2, sz, sz, 8);
          ctx.stroke();
        } else if (s.type === 1) {
          ctx.beginPath();
          ctx.arc(0, 0, sz / 2, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.beginPath();
          const sides = 6;
          for (let i = 0; i < sides; i++) {
            const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
            const px = (sz / 2) * Math.cos(angle);
            const py = (sz / 2) * Math.sin(angle);
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }

        ctx.restore();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}

function Blob({ className, color1, color2, size, delay, duration }) {
  return (
    <div
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 30%, ${color1}, ${color2})`,
        filter: 'blur(60px)',
        opacity: 0.4,
        animation: `blobMove ${duration}s ease-in-out ${delay}s infinite`,
      }}
    />
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      const role = res.data?.user?.role;
      if (role === 'kitchen_staff') {
        navigate('/kitchen');
      } else if (role === 'delivery_driver') {
        navigate('/delivery');
      } else       if (role === 'cashier' || role === 'waiter') {
        navigate('/cashier');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden relative" style={{ background: 'var(--bg-body)' }}>
      {/* Dark mode toggle */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleDarkMode}
        className="fixed top-4 right-4 z-50 p-2.5 rounded-xl transition-colors"
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--border-color)',
          backdropFilter: 'blur(12px)',
          color: 'var(--text-primary)',
        }}
      >
        {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
      </motion.button>

      {/* BLOBS */}
      <Blob
        className="-top-40 -left-40"
        color1="rgba(99,102,241,0.12)"
        color2="rgba(79,70,229,0.05)"
        size="500px"
        delay={0}
        duration={8}
      />
      <Blob
        className="-bottom-32 -right-32"
        color1="rgba(129,140,248,0.1)"
        color2="rgba(99,102,241,0.03)"
        size="400px"
        delay={-3}
        duration={10}
      />
      <Blob
        className="top-1/3 -right-20"
        color1="rgba(165,180,252,0.08)"
        color2="rgba(99,102,241,0.02)"
        size="300px"
        delay={-6}
        duration={12}
      />

      <FloatingShapes />

      {/* LEFT - BRANDING */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:flex w-1/2 min-h-screen relative items-center justify-center p-12 overflow-hidden"
      >
        {/* indigo gradient backdrop */}
        <div className="absolute inset-0" style={{ background: darkMode
          ? 'linear-gradient(135deg, rgba(15,23,42,1), rgba(30,27,75,0.8), rgba(15,23,42,1))'
          : 'linear-gradient(135deg, rgba(238,242,255,1), rgba(255,255,255,1), rgba(238,242,255,0.5))'
        }} />

        {/* decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* decorative curved line top */}
        <svg className="absolute top-0 right-0 w-64 h-64 text-indigo-200/30" viewBox="0 0 200 200" fill="none">
          <path d="M0 200 Q 50 50 200 0" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M0 150 Q 75 25 200 50" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6" />
          <path d="M0 100 Q 100 0 200 100" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3" />
        </svg>

        {/* decorative curved line bottom */}
        <svg className="absolute bottom-0 left-0 w-80 h-80 text-indigo-200/20" viewBox="0 0 300 300" fill="none">
          <path d="M300 0 Q 200 150 0 300" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M300 100 Q 175 200 0 250" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" />
        </svg>

        {/* dots pattern */}
        <div
          className="absolute right-16 top-16"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 16px)',
            gap: '16px',
          }}
        >
          {Array.from({ length: 36 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-indigo-300/30"
              animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.3, 1] }}
              transition={{ duration: 3, delay: i * 0.08, repeat: Infinity }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center max-w-lg">
          {/* avatar */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 150, damping: 12, delay: 0.3 }}
            className="mx-auto mb-8"
          >
            <div className="relative inline-flex">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-xl shadow-indigo-500/25 relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
                  animate={{ opacity: [0, 0.3, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <FiShield className="text-white" size={36} />
              </div>
              <motion.div
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-400 border-2 border-white rounded-full flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-white text-xs font-bold">&#10003;</span>
              </motion.div>
            </div>
          </motion.div>

          {/* brand text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              Nile Food
            </h1>
            <p className={`text-lg font-medium mb-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>Admin Dashboard</p>
            <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-indigo-300 rounded-full mx-auto mb-6" />
            <p className="leading-relaxed max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Manage your restaurant, track orders, and grow your business from one central hub.
            </p>
          </motion.div>

          {/* feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-3 mt-8"
          >
            {['Orders', 'Menu', 'Analytics', 'Users'].map((feat, i) => (
              <motion.span
                key={feat}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="px-4 py-2 rounded-full text-sm font-medium shadow-sm"
                style={{
                  background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.8)',
                  border: `1px solid ${darkMode ? 'rgba(99,102,241,0.2)' : 'rgba(224,231,255,1)'}`,
                  color: darkMode ? '#818cf8' : '#4f46e5',
                }}
                whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(99,102,241,0.15)' }}
              >
                {feat}
              </motion.span>
            ))}
          </motion.div>

          {/* decorative floating cards */}
          <motion.div
            className="absolute -left-12 top-1/4 w-20 h-14 rounded-xl flex items-center justify-center"
            style={{
              background: darkMode ? 'rgba(15,23,42,0.8)' : 'white',
              border: `1px solid ${darkMode ? 'rgba(99,102,241,0.15)' : 'rgba(224,231,255,1)'}`,
              boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.08)',
            }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-2xl">🍽️</span>
          </motion.div>
          <motion.div
            className="absolute -right-8 bottom-1/4 w-16 h-16 rounded-xl flex items-center justify-center"
            style={{
              background: darkMode ? 'rgba(15,23,42,0.8)' : 'white',
              border: `1px solid ${darkMode ? 'rgba(99,102,241,0.15)' : 'rgba(224,231,255,1)'}`,
              boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.08)',
            }}
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          >
            <span className="text-xl">📊</span>
          </motion.div>
        </div>
      </motion.div>

      {/* RIGHT - FORM */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full lg:w-1/2 min-h-screen flex items-center justify-center p-6 lg:p-12 relative`}
        style={{ background: darkMode ? 'rgba(15,23,42,0.95)' : 'white' }}
      >
        {/* subtle top border accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-300" />

        <div className="w-full max-w-sm relative z-10">
          {/* mobile logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden text-center mb-8"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/25">
              <FiShield className="text-white" size={24} />
            </div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Nile Food Admin</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Welcome back</h2>
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>Sign in to your account to continue</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm"
                  style={{
                    background: darkMode ? 'rgba(239,68,68,0.1)' : '#fef2f2',
                    border: `1px solid ${darkMode ? 'rgba(239,68,68,0.2)' : '#fecaca'}`,
                    color: darkMode ? '#fca5a5' : '#dc2626',
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <div className="relative group">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200" size={18} style={{ color: darkMode ? '#64748b' : '#9ca3af' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl outline-none transition-all duration-200 input-glass"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Password</label>
                <button type="button" className={`text-xs font-medium transition-colors ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}>
                  Forgot?
                </button>
              </div>
              <div className="relative group">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200" size={18} style={{ color: darkMode ? '#64748b' : '#9ca3af' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl outline-none transition-all duration-200 input-glass"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: darkMode ? '#64748b' : '#9ca3af' }}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01, boxShadow: '0 8px 30px rgba(99,102,241,0.3)' }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 relative overflow-hidden group shadow-lg shadow-indigo-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <>
                    Sign In <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </motion.div>

            {/* divider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="relative my-2"
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: 'var(--border-color)' }} />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-3" style={{ background: darkMode ? 'rgba(15,23,42,0.95)' : 'white', color: 'var(--text-muted)' }}>or continue with</span>
              </div>
            </motion.div>

            {/* google button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <button
                type="button"
                className="w-full py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2.5 transition-all duration-200 btn-ghost"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
            </motion.div>
          </form>

          {/* credentials hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-8 text-center text-xs leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            <span style={{ color: 'var(--text-secondary)' }} className="font-medium">Demo accounts</span><br />
            <span style={{ color: 'var(--text-secondary)' }}>Admin:</span> admin@foodapp.com<br />
            <span style={{ color: 'var(--text-secondary)' }}>Manager:</span> manager@foodapp.com<br />
            <span style={{ color: 'var(--text-secondary)' }}>Kitchen:</span> kitchen@foodapp.com<br />
            <span style={{ color: 'var(--text-secondary)' }}>Driver:</span> driver@foodapp.com<br />
            <span style={{ color: 'var(--text-secondary)' }}>Cashier:</span> cashier@foodapp.com<br />
            <span style={{ color: 'var(--text-secondary)' }}>Waiter:</span> waiter@foodapp.com<br />
            Password: <span style={{ color: 'var(--text-secondary)' }}>Admin@123</span>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
