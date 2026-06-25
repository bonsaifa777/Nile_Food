import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/common/Footer';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getIcon } from '../utils/icons';

export default function Experience() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const { darkMode, toggleDarkMode } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    axios.get('/api/listings/experience_feature')
      .then(res => setFeatures(res.data.data || []))
      .catch(() => setFeatures([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
      <main className="pt-28 pb-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">{t('experience.title').split('Nile Food').map((part, i, arr) =>
                  i < arr.length - 1 ? <>{part}<span key={i} className="text-primary-500">Nile Food</span></> : part
                )}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">{t('experience.subtitle')}</p>
          </motion.div>

          <div className="relative mb-20">
            <div className="w-full h-80 lg:h-96 rounded-2xl overflow-hidden">
              <img src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80" alt={t('experience.alt')} className="w-full h-full object-cover" />
            </div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 lg:p-8 text-center max-w-lg w-[90%]">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('experience.yourPerfectMeal')}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{t('experience.fromFarmToTable')}</p>
              <Link to="/menu" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl shadow-lg transition-colors text-sm">{t('experience.exploreMenu')}</Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-44 shimmer rounded-2xl" />)
            ) : (
              features.map((feat, i) => {
                const d = feat.data;
                const Icon = getIcon(d.icon);
                return (
                  <motion.div key={feat._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="text-center bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-8 shadow-sm hover:shadow-xl transition-shadow">
                    <div className="w-16 h-16 mx-auto mb-5 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center">
                      <Icon className="text-primary-600 dark:text-primary-400" size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{d.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{d.desc}</p>
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
