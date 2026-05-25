import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/common/Footer';
import { useTheme } from '../context/ThemeContext';
import { FiX } from 'react-icons/fi';
import axios from 'axios';

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { darkMode, toggleDarkMode } = useTheme();
  const [active, setActive] = useState('All');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    axios.get('/api/listings/gallery')
      .then(res => setImages(res.data.data || []))
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...new Set(images.map(i => i.data.category).filter(Boolean))];
  const filtered = active === 'All' ? images : images.filter(i => i.data.category === active);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
      <main className="pt-28 pb-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">Our <span className="text-primary-500">Gallery</span></h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">A glimpse into the Nile Food experience</p>
          </motion.div>

          {categories.length > 1 && (
            <div className="flex justify-center gap-2 mb-10">
              {categories.map(cat => (
                <button key={cat} onClick={() => setActive(cat)}
                  className={`px-5 py-2 text-sm font-semibold rounded-full transition-all ${active === cat ? 'bg-primary-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'}`}>{cat}</button>
              ))}
            </div>
          )}

          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-64 shimmer rounded-xl" />)
            ) : (
              filtered.map((img, i) => {
                const d = img.data;
                return (
                  <motion.div key={img._id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                    className="relative group cursor-pointer rounded-xl overflow-hidden" onClick={() => setSelected(img)}>
                    <img src={d.src} alt={d.title} className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-end">
                      <p className="text-white font-semibold p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">{d.title}</p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </div>
      </main>

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
              <img src={selected.data.src} alt={selected.data.title} className="w-full rounded-2xl" />
              <p className="text-white text-lg font-semibold mt-3 text-center">{selected.data.title}</p>
              <button onClick={() => setSelected(null)} className="absolute -top-10 right-0 text-white/80 hover:text-white"><FiX size={28} /></button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
