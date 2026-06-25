import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/common/Footer';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

const DEFAULTS = {
  title: 'About Nile Food',
  subtitle: 'Discover our story, our passion, and our commitment to bringing you the finest dining experience.',
  story: {
    text: 'Founded in 2010, Nile Food has grown from a small family kitchen to a beloved dining destination, serving authentic cuisine with a modern twist.',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80',
    ctaLabel: 'Explore Our Menu',
    ctaLink: '/menu',
  },
  stats: [
    { label: 'Years of Excellence', value: '15+' },
    { label: 'Happy Customers', value: '50K+' },
    { label: 'Expert Chefs', value: '80+' },
    { label: 'Menu Items', value: '200+' },
  ],
  values: [
    { title: 'Quality Ingredients', desc: 'We source the freshest ingredients from local farms and trusted suppliers to ensure every dish meets our high standards.', icon: '🌿' },
    { title: 'Authentic Flavors', desc: 'Our recipes blend traditional Nile region cuisine with modern culinary techniques for an unforgettable dining experience.', icon: '🍲' },
    { title: 'Exceptional Service', desc: 'From the moment you walk in, our dedicated team ensures your dining experience is nothing short of perfect.', icon: '🤝' },
    { title: 'Sustainable Practices', desc: 'We are committed to eco-friendly practices, from reducing food waste to using sustainable packaging.', icon: '🌍' },
  ],
};

export default function About() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const { darkMode, toggleDarkMode } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    axios.get('/api/content/about_page')
      .then(res => setContent(res.data.data?.value || null))
      .catch(() => setContent(null))
      .finally(() => setLoading(false));
  }, []);

  const data = content || DEFAULTS;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
      <main className="pt-28 pb-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
              {data.title?.split(' ').map((word, i, arr) =>
                i === arr.length - 1 ? <span key={i} className="text-primary-500">{word}</span> : word + ' '
              )}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">{data.subtitle}</p>
          </motion.div>

          <div className="relative mb-20">
            <div className="w-full h-80 lg:h-96 rounded-2xl overflow-hidden">
              <img src={data.story?.image} alt={t('about.alt')} className="w-full h-full object-cover" />
            </div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 lg:p-8 text-center max-w-lg w-[90%]">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('about.ourStory')}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{data.story?.text}</p>
              <Link to={data.story?.ctaLink || '/menu'} className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl shadow-lg transition-colors text-sm">
                {data.story?.ctaLabel || t('about.exploreMenu')}
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {(data.stats || []).map((stat, i) => (
              <motion.div key={stat.label || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="text-center bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 shadow-sm">
                <div className="text-3xl font-extrabold text-primary-500 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-10">{t('about.ourCoreValues')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {(data.values || []).map((val, i) => (
              <motion.div key={val.title || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="text-center bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-8 shadow-sm hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">{val.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{val.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
