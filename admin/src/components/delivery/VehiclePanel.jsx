import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiTruck, FiDroplet, FiThermometer, FiAlertTriangle, FiCheckCircle, FiRefreshCw, FiFileText, FiActivity } from 'react-icons/fi';
import { vehicleInfo } from './data';

export default function VehiclePanel() {
  const [activeTab, setActiveTab] = useState('status');

  const fuelPercent = vehicleInfo.fuelLevel;
  const getFuelColor = (pct) => pct > 50 ? '#10b981' : pct > 25 ? '#f59e0b' : '#ef4444';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Vehicle Management</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{vehicleInfo.make} {vehicleInfo.model} · {vehicleInfo.plate}</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
          style={{ background: 'rgba(6,182,212,0.1)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.2)' }}
        >
          <FiRefreshCw size={12} /> Update Status
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${getFuelColor(fuelPercent)}15, transparent)`,
            border: `1px solid ${getFuelColor(fuelPercent)}25`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Fuel Level</span>
            <FiDroplet size={18} style={{ color: getFuelColor(fuelPercent) }} />
          </div>
          <div className="flex items-end gap-3 mb-3">
            <span className="text-3xl font-bold" style={{ color: getFuelColor(fuelPercent) }}>{fuelPercent}%</span>
            <span className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>{vehicleInfo.fuelType}</span>
          </div>
          <div className="h-2 rounded-full" style={{ background: 'var(--input-bg)' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${fuelPercent}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="h-full rounded-full" style={{ background: getFuelColor(fuelPercent) }}
            />
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{vehicleInfo.fuelTank}L tank capacity</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl p-5" style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.03))',
            border: '1px solid rgba(99,102,241,0.15)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Mileage</span>
            <FiActivity size={18} style={{ color: 'var(--primary)' }} />
          </div>
          <p className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>{vehicleInfo.mileage.toLocaleString()}</p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>km total</p>
          <div className="mt-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
            Next service: <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{vehicleInfo.nextService}</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-5" style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(52,211,153,0.03))',
            border: '1px solid rgba(16,185,129,0.15)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Tire Condition</span>
            <FiThermometer size={18} className="text-emerald-400" />
          </div>
          <div className="flex items-end gap-3 mb-3">
            <span className="text-3xl font-bold text-emerald-400">{vehicleInfo.tireCondition}%</span>
            <span className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Good</span>
          </div>
          <div className="h-2 rounded-full" style={{ background: 'var(--input-bg)' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${vehicleInfo.tireCondition}%` }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
              className="h-full rounded-full bg-emerald-400" />
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Battery health: {vehicleInfo.batteryHealth}%</p>
        </motion.div>
      </div>

      <div className="rounded-2xl p-5" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-color)' }}>
        <div className="flex items-center gap-4 mb-4">
          {[
            { key: 'status', label: 'Vehicle Status' },
            { key: 'documents', label: 'Documents' },
            { key: 'maintenance', label: 'Maintenance' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`text-sm font-medium pb-2 transition-all border-b-2 ${
                activeTab === tab.key ? 'text-cyan-400 border-cyan-400' : 'text-gray-500 border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'status' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Engine', status: 'Good', color: '#10b981' },
              { label: 'Transmission', status: 'Good', color: '#10b981' },
              { label: 'Brakes', status: 'Needs Check', color: '#f59e0b' },
              { label: 'Battery', status: 'Good', color: '#10b981' },
              { label: 'Tires', status: 'Good', color: '#10b981' },
              { label: 'Lights', status: 'All Working', color: '#10b981' },
              { label: 'AC', status: 'Good', color: '#10b981' },
              { label: 'Oil Level', status: 'Change Soon', color: '#f59e0b' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--input-bg)' }}
              >
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium" style={{ color: item.color }}>{item.status}</span>
                  <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-3">
            {vehicleInfo.documents.map((doc, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--input-bg)' }}
              >
                <div className="flex items-center gap-2">
                  <FiFileText size={16} className="text-cyan-400" />
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{doc}</span>
                </div>
                <FiCheckCircle size={16} className="text-emerald-400" />
              </motion.div>
            ))}
            <div className="p-3 rounded-xl" style={{ background: 'var(--input-bg)' }}>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Insurance</span>
                <span className="text-xs font-medium text-emerald-400">Valid until {vehicleInfo.insurance.split(' ').pop()}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="space-y-3">
            <div className="p-4 rounded-xl" style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(251,191,36,0.03))',
              border: '1px solid rgba(245,158,11,0.15)',
            }}>
              <div className="flex items-center gap-2 mb-2">
                <FiAlertTriangle size={14} className="text-amber-400" />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Upcoming Service</span>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Next maintenance due in {vehicleInfo.nextService}. Last service: {vehicleInfo.lastService}
              </p>
              <div className="mt-3">
                <div className="h-1.5 rounded-full" style={{ background: 'var(--input-bg)' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: '75%' }}
                    transition={{ duration: 1.5 }} className="h-full rounded-full bg-amber-400" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
