import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/common/Footer';
import { useTheme } from '../context/ThemeContext';
import { FiTag, FiClock, FiShoppingCart } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { darkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    axios.get('/api/listings/offer')
      .then(res => setOffers(res.data.data || []))
      .catch(() => setOffers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
      <main className="pt-28 pb-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">Offers & <span className="text-primary-500">Deals</span></h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">Exclusive promotions and discounts just for you</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-72 shimmer rounded-2xl" />)
            ) : (
              offers.map((offer, i) => {
                const d = offer.data;
                return (
                  <motion.div key={offer._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className="relative bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl transition-shadow group">
                    <div className={`bg-gradient-to-r ${d.color || 'from-primary-500 to-primary-400'} p-6 text-white`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <FiTag size={20} className="mb-2 opacity-80" />
                          <p className="text-sm font-semibold opacity-80">{d.discount}</p>
                          <h3 className="text-xl font-black mt-1">{d.title}</h3>
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{d.desc}</p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mb-4">
                        <FiClock size={12} /> {d.valid}
                      </div>
                      <button onClick={() => toast.success('Promo applied!')} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors">
                        <FiShoppingCart size={14} /> Claim Offer
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
