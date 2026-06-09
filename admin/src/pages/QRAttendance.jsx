import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiToggleLeft, FiToggleRight, FiClock, FiCopy } from 'react-icons/fi';
import { getQRCode, regenerateQRCode, toggleQRCode, getQRHistory } from '../services/attendanceApi';
import toast from 'react-hot-toast';

export default function QRAttendance() {
  const [qr, setQr] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchQR(); }, []);

  const fetchQR = async () => {
    try {
      const [q, h] = await Promise.all([getQRCode(), getQRHistory()]);
      if (q.success) setQr(q.data);
      if (h.success) setHistory(h.data.qrs);
    } catch {
      toast.error('Failed to load QR data');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    try {
      const res = await regenerateQRCode();
      if (res.success) {
        setQr(res.data);
        toast.success('QR code regenerated');
        fetchQR();
      }
    } catch {
      toast.error('Failed to regenerate QR');
    }
  };

  const handleToggle = async () => {
    try {
      const res = await toggleQRCode();
      if (res.success) {
        setQr(prev => ({ ...prev, isActive: !prev.isActive }));
        toast.success(`QR code ${qr.isActive ? 'deactivated' : 'activated'}`);
      }
    } catch {
      toast.error('Failed to toggle QR');
    }
  };

  const handleCopy = () => {
    if (qr?.code) {
      navigator.clipboard.writeText(qr.code);
      toast.success('Code copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const timeLeft = qr?.expiresAt ? Math.max(0, Math.floor((new Date(qr.expiresAt) - new Date()) / 1000 / 60)) : 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>QR Attendance</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Generate and manage daily QR codes for attendance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 flex flex-col items-center">
          <div className="relative mb-6">
            {qr?.qrDataURL ? (
              <img src={qr.qrDataURL} alt="Daily QR Code" className="w-64 h-64 rounded-2xl" />
            ) : (
              <div className="w-64 h-64 rounded-2xl flex items-center justify-center bg-white/5">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No QR code</p>
              </div>
            )}
            {qr?.isActive !== undefined && (
              <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                qr.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {qr.isActive ? 'Active' : 'Inactive'}
              </span>
            )}
          </div>

          <div className="text-center mb-6">
            <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Today's QR Code</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{qr?.date || new Date().toISOString().split('T')[0]}</p>
          </div>

          <div className="flex items-center gap-2 text-sm mb-4">
            <FiClock size={14} className="text-indigo-400" />
            <span style={{ color: 'var(--text-muted)' }}>
              {timeLeft > 0 ? `Expires in ${timeLeft} minutes` : 'Expired'}
            </span>
            {qr?.usedCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-500/10 text-indigo-400">
                {qr.usedCount} uses
              </span>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={handleRegenerate} className="btn-primary flex items-center gap-2 text-sm">
              <FiRefreshCw size={14} /> Regenerate
            </button>
            <button onClick={handleToggle} className="btn-ghost flex items-center gap-2 text-sm">
              {qr?.isActive ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />}
              {qr?.isActive ? 'Deactivate' : 'Activate'}
            </button>
            <button onClick={handleCopy} className="btn-ghost flex items-center gap-2 text-sm">
              <FiCopy size={14} /> Copy Code
            </button>
          </div>

          {qr?.code && (
            <p className="mt-4 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              Code: {qr.code.slice(0, 16)}...
            </p>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>How It Works</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-indigo-500/10 text-indigo-400 shrink-0">1</div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Generate QR Code</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>A unique QR code is generated daily for secure attendance</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-indigo-500/10 text-indigo-400 shrink-0">2</div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Employees Scan</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Staff scan the QR code using their mobile phone camera</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-indigo-500/10 text-indigo-400 shrink-0">3</div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Instant Check-in</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>GPS location is verified and attendance is recorded instantly</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-indigo-500/10 text-indigo-400 shrink-0">4</div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Admin Controls</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Regenerate, activate/deactivate, and monitor usage in real-time</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-white/[0.03]">
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Security Features</p>
            <ul className="space-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <li>• Daily unique QR codes prevent reuse</li>
              <li>• QR codes auto-expire at midnight</li>
              <li>• GPS verification prevents remote check-ins</li>
              <li>• Each scan increments usage counter</li>
              <li>• Admins can instantly deactivate codes</li>
            </ul>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>QR Code History</h3>
        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Uses</th>
                  <th className="pb-3 pr-4">Generated By</th>
                  <th className="pb-3 pr-4">Expires</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={h._id} className="border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <td className="py-3 pr-4 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{h.date}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        h.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>{h.isActive ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="py-3 pr-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{h.usedCount || 0}</td>
                    <td className="py-3 pr-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{h.generatedBy?.name || 'System'}</td>
                    <td className="py-3 pr-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                      {h.expiresAt ? new Date(h.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No QR code history</p>
        )}
      </motion.div>
    </motion.div>
  );
}
