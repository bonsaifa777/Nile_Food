import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/common/Footer';
import { useTheme } from '../context/ThemeContext';
import { FiMapPin, FiSearch, FiNavigation } from 'react-icons/fi';
import axios from 'axios';

export default function Location() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { darkMode, toggleDarkMode } = useTheme();
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get('/api/listings/location')
      .then(res => setLocations(res.data.data || []))
      .catch(() => setLocations([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = locations.filter(l =>
    l.data.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
      <main className="pt-28 pb-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">Our <span className="text-primary-500">Locations</span></h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">Find the Nile Food branch nearest to you</p>
          </motion.div>

          <div className="max-w-md mx-auto mb-10">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-full border border-gray-200 dark:border-slate-700">
              <FiSearch className="text-gray-400" size={18} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search location..." className="flex-1 bg-transparent text-sm focus:outline-none text-gray-900 dark:text-white placeholder-gray-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-44 shimmer rounded-2xl" />)
            ) : (
              filtered.map((loc, i) => {
                const d = loc.data;
                return (
                  <motion.div key={loc._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 shadow-sm hover:shadow-xl transition-shadow">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-4">
                      <FiMapPin className="text-primary-600 dark:text-primary-400" size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{d.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">{d.address}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">{d.phone}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{d.hours}</p>
                    <button className="flex items-center gap-2 text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors">
                      <FiNavigation size={14} /> Get Directions
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
