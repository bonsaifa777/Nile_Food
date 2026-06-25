import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/common/Footer';
import { useTheme } from '../context/ThemeContext';
import { FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getIcon } from '../utils/icons';
import { useTranslation } from 'react-i18next';

export default function OnlineOrdering() {
  const { t } = useTranslation();
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const { darkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    axios.get('/api/listings/online_ordering_step')
      .then(res => setSteps(res.data.data || []))
      .catch(() => setSteps([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
      <main className="pt-28 pb-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">{t('onlineOrdering.titleBefore')} <span className="text-primary-500">{t('onlineOrdering.titleHighlight')}</span></h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">{t('onlineOrdering.subtitle')}</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-48 shimmer rounded-2xl" />)
            ) : (
              steps.map((step, i) => {
                const d = step.data;
                const Icon = getIcon(d.icon);
                return (
                  <motion.div key={step._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="text-center bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-8 shadow-sm hover:shadow-xl transition-shadow">
                    <div className="relative w-16 h-16 mx-auto mb-5">
                      <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center">
                        <Icon className="text-primary-600 dark:text-primary-400" size={28} />
                      </div>
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{i + 1}</div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{d.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{d.desc}</p>
                  </motion.div>
                );
              })
            )}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-r from-primary-500 to-primary-400 rounded-2xl p-8 lg:p-12 text-center">
              <h2 className="text-2xl lg:text-3xl font-black text-white mb-3">{t('onlineOrdering.readyTitle')}</h2>
              <p className="text-primary-100 mb-6">{t('onlineOrdering.browseText')}</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/menu" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-primary-600 font-bold rounded-xl shadow-lg hover:shadow-xl transition-shadow">{t('onlineOrdering.orderNow')} <FiArrowRight size={16} /></Link>
                <Link to="/packages" className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-shadow">{t('onlineOrdering.viewPackages')} <FiArrowRight size={16} /></Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
