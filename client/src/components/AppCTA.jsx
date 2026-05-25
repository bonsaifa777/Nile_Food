import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { FiArrowRight, FiSmartphone, FiDownload } from 'react-icons/fi';

export default function AppCTA() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section ref={sectionRef} className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900" />
      
      {/* Animated shapes */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ scale: [1.3, 1, 1.3], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl"
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}
      />

      <div className="w-full px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-8"
            >
              <FiSmartphone size={32} className="text-white" />
            </motion.div>

            <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
              Get the App
              <span className="block text-indigo-200">Experience More</span>
            </h2>
            <p className="text-xl text-indigo-200 mb-10 leading-relaxed max-w-lg">
              Download our app for exclusive deals, faster checkout, and real-time order tracking on the go.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <motion.button
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className="group flex items-center gap-4 px-8 py-5 bg-white text-indigo-600 font-bold rounded-2xl shadow-2xl hover:shadow-white/20 transition-all"
              >
                <FiDownload size={24} />
                <div className="text-left">
                  <div className="text-xs text-gray-500 font-medium">Download on</div>
                  <div className="text-lg font-black">App Store</div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
                className="group flex items-center gap-4 px-8 py-5 bg-white/10 backdrop-blur-sm text-white font-bold rounded-2xl border border-white/20 hover:bg-white/20 transition-all"
              >
                <FiDownload size={24} />
                <div className="text-left">
                  <div className="text-xs text-indigo-200 font-medium">Get it on</div>
                  <div className="text-lg font-black">Google Play</div>
                </div>
              </motion.button>
            </div>

            {/* Stats */}
            <div className="flex gap-10">
              {[
                { value: '100K+', label: 'Downloads' },
                { value: '4.9', label: 'App Rating' },
                { value: '50K+', label: 'Active Users' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div className="text-3xl font-black text-white">{stat.value}</div>
                  <div className="text-sm text-indigo-200">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Phone mockup */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative flex justify-center"
          >
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              {/* Phone frame */}
              <div className="w-72 h-[580px] bg-slate-900 rounded-[3rem] border-4 border-slate-700 shadow-2xl overflow-hidden relative">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-900 rounded-b-2xl z-10" />
                
                {/* Screen content */}
                <div className="w-full h-full bg-gradient-to-b from-indigo-600 to-indigo-800 p-6 pt-12">
                  {/* App header */}
                  <div className="text-center mb-8">
                    <div className="w-14 h-14 mx-auto bg-white rounded-2xl flex items-center justify-center mb-4 shadow-xl">
                      <span className="text-2xl font-black text-indigo-600">N</span>
                    </div>
                    <h3 className="text-white font-bold text-lg">Nile Food</h3>
                  </div>

                  {/* Search */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/60 rounded-sm" />
                    <span className="text-white/60 text-sm">Search food...</span>
                  </div>

                  {/* Categories */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {['🍔', '🍕', '🍣'].map((emoji, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.1 }}
                        className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center"
                      >
                        <span className="text-2xl">{emoji}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Featured card */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-3xl">
                        🍜
                      </div>
                      <div>
                        <div className="text-white font-bold text-sm">Special Ramen</div>
                        <div className="text-indigo-200 text-xs">$14.99</div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-yellow-300 text-xs">★</span>
                          <span className="text-white/80 text-xs">4.9</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom nav */}
                  <div className="absolute bottom-0 left-0 right-0 bg-white/10 backdrop-blur-sm px-6 py-4 flex justify-around">
                    {['🏠', '🔍', '🛒', '👤'].map((icon, i) => (
                      <div key={i} className="w-8 h-8 flex items-center justify-center">
                        <span className="text-lg">{icon}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Phone shadow */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-8 bg-black/20 rounded-full blur-xl" />

              {/* Floating badges */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                className="absolute -left-16 top-20 px-4 py-3 bg-white rounded-xl shadow-2xl"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm">🔔</span>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Order</div>
                    <div className="text-sm font-bold text-gray-900">Delivered!</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, delay: 2 }}
                className="absolute -right-12 bottom-32 px-4 py-3 bg-white rounded-xl shadow-2xl"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm">💰</span>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Saved</div>
                    <div className="text-sm font-bold text-indigo-600">$24.50</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
