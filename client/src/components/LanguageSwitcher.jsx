import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGlobe, FiCheck } from 'react-icons/fi';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'om', label: 'Oromiffa', flag: '🇪🇹' },
  { code: 'am', label: 'አማርኛ', flag: '🇪🇹' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
];

export default function LanguageSwitcher({ dark, btnBase }) {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const d = dark;

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const switchLanguage = (code) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <motion.button
        whileHover={{ scale: 1.12, y: -4 }}
        whileTap={{ scale: 0.88, y: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 12 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative cursor-pointer group p-2.5 rounded-xl ${btnBase}`}
      >
        <FiGlobe size={20} />
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
          bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl"
        >
          {t('languages.' + currentLang.code)}
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={`absolute right-0 top-12 w-48 rounded-2xl overflow-hidden border shadow-2xl z-50 ${
              d
                ? 'bg-slate-900 border-white/10 shadow-black/50'
                : 'bg-white border-gray-200 shadow-xl'
            }`}
          >
            <div className="py-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => switchLanguage(lang.code)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    lang.code === i18n.language
                      ? d
                        ? 'text-primary-300 bg-primary-500/10'
                        : 'text-primary-600 bg-primary-50'
                      : d
                        ? 'text-gray-400 hover:text-white hover:bg-white/5'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span className="flex-1 text-left">{lang.label}</span>
                  {lang.code === i18n.language && (
                    <FiCheck size={16} className="text-primary-500 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
