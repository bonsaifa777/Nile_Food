import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/common/Footer';
import { useTheme } from '../context/ThemeContext';
import { FiBox, FiCheck, FiStar, FiShoppingCart } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { darkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    axios.get('/api/listings/package')
      .then(res => setPackages(res.data.data || []))
      .catch(() => setPackages([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
      <main className="pt-28 pb-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">Our <span className="text-primary-500">Packages</span></h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">Choose the perfect meal package for any occasion</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-80 shimmer rounded-2xl" />)
            ) : (
              packages.map((pkg, i) => {
                const d = pkg.data;
                return (
                  <motion.div key={pkg._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className={`relative bg-white dark:bg-slate-800 rounded-2xl border-2 p-6 shadow-sm transition-all duration-300 hover:shadow-xl ${d.popular ? 'border-primary-500 dark:border-primary-400' : 'border-gray-100 dark:border-slate-700'}`}>
                    {d.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                        <FiStar size={12} /> Most Popular
                      </div>
                    )}
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-4">
                      <FiBox className="text-primary-600 dark:text-primary-400" size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{d.name}</h3>
                    <p className="text-2xl font-extrabold text-primary-500 mb-4">{d.price}</p>
                    <ul className="space-y-2.5 mb-6">
                      {(d.items || []).map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <FiCheck className="text-primary-500 flex-shrink-0" size={14} /> {item}
                        </li>
                      ))}
                    </ul>
                    <button onClick={() => toast.success(`${d.name} package added to cart!`)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors">
                      <FiShoppingCart size={14} /> Order Now
                    </button>
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
