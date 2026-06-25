import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/common/Footer';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

const DEFAULTS = {
  title: 'Contact Us',
  subtitle: "We'd love to hear from you. Get in touch with us for reservations, inquiries, or feedback.",
  contactInfo: [
    { label: 'Address', value: '123 Nile Street, Cairo, Egypt', icon: '📍' },
    { label: 'Phone', value: '+20 123 456 7890', icon: '📞' },
    { label: 'Email', value: 'info@nilefood.com', icon: '✉️' },
    { label: 'Hours', value: 'Daily: 10:00 AM - 11:00 PM', icon: '🕐' },
  ],
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3456.789!2d31.2345!3d30.0444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDAyJzQwLjAiTiAzMcKwMTQnMDQuMiJF!5e0!3m2!1sen!2seg!4v1',
};

export default function Contact() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const { darkMode, toggleDarkMode } = useTheme();
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axios.get('/api/content/contact_page')
      .then(res => setContent(res.data.data?.value || null))
      .catch(() => setContent(null))
      .finally(() => setLoading(false));
  }, []);

  const data = content || DEFAULTS;

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/api/contact', form);
      setSubmitted(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('contact.getInTouch')}</h2>
              <div className="space-y-6 mb-8">
                {(data.contactInfo || []).map((info, i) => (
                  <motion.div key={info.label || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 shadow-sm">
                    <div className="text-2xl">{info.icon}</div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{info.label}</div>
                      <div className="font-medium text-gray-900 dark:text-white">{info.value}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {data.mapEmbedUrl && (
                <div className="w-full h-64 rounded-2xl overflow-hidden">
                  <iframe src={data.mapEmbedUrl} className="w-full h-full" loading="lazy" />
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('contact.sendMessage')}</h2>
              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-8 text-center">
                  <div className="text-4xl mb-4">✅</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('contact.messageSent')}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">{t('contact.thankYou')}</p>
                  <button onClick={() => setSubmitted(false)} className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors text-sm">{t('contact.sendAnother')}</button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('contact.name')}</label>
                    <input type="text" name="name" value={form.name} onChange={handleChange} required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('contact.email')}</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('contact.subject')}</label>
                    <input type="text" name="subject" value={form.subject} onChange={handleChange} required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('contact.message')}</label>
                    <textarea name="message" rows={5} value={form.message} onChange={handleChange} required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none" />
                  </div>
                  <button type="submit" disabled={submitting}
                    className="w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-semibold rounded-xl shadow-lg transition-colors text-sm">
                    {submitting ? t('contact.sending') : t('contact.sendMessageLabel')}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
