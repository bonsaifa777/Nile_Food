import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/common/Footer';
import { useTheme } from '../context/ThemeContext';
import { FiCalendar, FiGift, FiMusic, FiCamera, FiPhone, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getIcon } from '../utils/icons';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { darkMode, toggleDarkMode } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    axios.get('/api/listings/event')
      .then(res => setEvents(res.data.data || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
      <main className="pt-28 pb-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4"><span className="text-primary-500">{t('events.title').split(' & ')[0]}</span> & {t('events.title').split(' & ')[1]}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">{t('events.subtitle')}</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-48 shimmer rounded-2xl" />
              ))
            ) : (
              events.map((evt, i) => {
                const d = evt.data;
                const Icon = getIcon(d.icon);
                return (
                  <motion.div key={evt._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-8 shadow-sm hover:shadow-xl transition-shadow">
                    <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-5">
                      <Icon className="text-primary-600 dark:text-primary-400" size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{d.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">{d.desc}</p>
                    <Link to="/reserve" className="text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors">{t('events.inquireNow')} →</Link>
                  </motion.div>
                );
              })
            )}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="max-w-2xl mx-auto bg-gradient-to-r from-primary-500 to-primary-400 rounded-2xl p-8 lg:p-12 text-center">
            <h2 className="text-2xl lg:text-3xl font-black text-white mb-2">{t('events.planYourEvent')}</h2>
            <p className="text-primary-100 mb-6">{t('events.contactTeam')}</p>
            <a href="tel:+251112345678" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-primary-600 font-bold rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <FiPhone size={18} /> {t('events.callUs')}
            </a>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
