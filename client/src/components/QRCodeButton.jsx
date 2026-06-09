import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function QRCodeButton() {
  const [open, setOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    QRCode.toDataURL('https://nilefood.vercel.app/menu', {
      width: 250,
      margin: 2,
      color: { dark: '#0f172a', light: '#ffffff' },
    }).then(setQrDataUrl);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-full shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-shadow"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <line x1="3" y1="10" x2="3" y2="21" />
          <line x1="10" y1="3" x2="10" y2="21" />
          <line x1="3" y1="14" x2="7" y2="14" />
          <line x1="17" y1="14" x2="17" y2="21" />
          <line x1="14" y1="17" x2="21" y2="17" />
          <line x1="10" y1="21" x2="21" y2="21" />
        </svg>
        <span className="text-sm font-semibold">Scan QR Code</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-2xl text-center max-w-sm mx-4"
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <FiX size={20} />
              </button>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Nile Cafe.</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Scan for Menu</p>

              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="QR Code for Nile Cafe Menu"
                  className="mx-auto rounded-lg"
                  width={250}
                  height={250}
                />
              )}

              <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                Point your camera at the QR code to view the menu
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
