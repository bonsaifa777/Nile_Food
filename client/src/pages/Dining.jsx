import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import LuxuryHero from '../components/LuxuryHero';
import Footer from '../components/common/Footer';
import { useTheme } from '../context/ThemeContext';
import { FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getIcon } from '../utils/icons';

export default function Dining() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const { darkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    axios.get('/api/listings/dining_experience')
      .then(res => setExperiences(res.data.data || []))
      .catch(() => setExperiences([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
      <LuxuryHero variant="dining" />
      <main className="pb-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">

          {loading ? (
            <div className="space-y-8">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-72 shimmer rounded-2xl" />)}
            </div>
          ) : (
            <div className="space-y-8">
              {experiences.map((exp, i) => {
                const d = exp.data;
                const Icon = getIcon(d.icon);
                return (
                  <motion.div key={exp._id} initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-6 items-center bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl transition-shadow`}>
                    <div className="w-full lg:w-1/2 h-64 lg:h-80 overflow-hidden">
                      <img src={d.image} alt={d.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="w-full lg:w-1/2 p-6 lg:p-10">
                      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-4">
                        <Icon className="text-primary-600 dark:text-primary-400" size={24} />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{d.title}</h3>
                      <p className="text-sm text-primary-500 font-semibold mb-3">{d.time}</p>
                      <p className="text-gray-500 dark:text-gray-400 mb-5">{d.desc}</p>
                      <Link to="/menu" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors">View Menu <FiArrowRight size={14} /></Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
