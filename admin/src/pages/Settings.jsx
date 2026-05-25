import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';
import { FiSave, FiGlobe, FiMail, FiDollarSign, FiTruck } from 'react-icons/fi';

export default function Settings() {
  const [settings, setSettings] = useState({
    restaurantName: 'Nile Food',
    email: 'contact@nilefood.com',
    phone: '+251-XXX-XXX-XXX',
    address: 'Addis Ababa, Ethiopia',
    deliveryFee: 50,
    deliveryRadius: 10,
    taxRate: 15,
    currency: 'ETB',
    timezone: 'Africa/Addis_Ababa',
    estimatedDeliveryTime: 45,
    paymentMethods: { cashOnDelivery: true, chapa: true, bankTransfer: false },
    chapaSecretKey: '',
    chapaPublicKey: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get('/api/settings');
      if (data.data) {
        setSettings(prev => ({ ...prev, ...data.data }));
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put('/api/settings', settings);
      toast.success('Settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const update = (field, value) => setSettings(prev => ({ ...prev, [field]: value }));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 shimmer rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-48 shimmer rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Settings</h1>
          <p className="text-gray-500 mt-1">Configure your restaurant</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          <FiSave size={18} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FiGlobe size={20} /> Restaurant Info
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Restaurant Name</label>
              <input type="text" value={settings.restaurantName} onChange={e => update('restaurantName', e.target.value)} className="input-glass" />
            </div>
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input type="email" value={settings.email} onChange={e => update('email', e.target.value)} className="input-glass" />
            </div>
            <div>
              <label className="block text-sm mb-1">Phone</label>
              <input type="text" value={settings.phone} onChange={e => update('phone', e.target.value)} className="input-glass" />
            </div>
            <div>
              <label className="block text-sm mb-1">Address</label>
              <textarea value={settings.address} onChange={e => update('address', e.target.value)} className="input-glass" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Currency</label>
                <select value={settings.currency} onChange={e => update('currency', e.target.value)} className="input-glass">
                  <option value="ETB">ETB (Ethiopian Birr)</option>
                  <option value="USD">USD (US Dollar)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Timezone</label>
                <select value={settings.timezone} onChange={e => update('timezone', e.target.value)} className="input-glass">
                  <option value="Africa/Addis_Ababa">Africa/Addis_Ababa</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FiTruck size={20} /> Delivery Settings
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Delivery Fee (ETB)</label>
                <input type="number" value={settings.deliveryFee} onChange={e => update('deliveryFee', Number(e.target.value))} className="input-glass" />
              </div>
              <div>
                <label className="block text-sm mb-1">Delivery Radius (km)</label>
                <input type="number" value={settings.deliveryRadius} onChange={e => update('deliveryRadius', Number(e.target.value))} className="input-glass" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Tax Rate (%)</label>
                <input type="number" value={settings.taxRate} onChange={e => update('taxRate', Number(e.target.value))} className="input-glass" />
              </div>
              <div>
                <label className="block text-sm mb-1">Est. Delivery Time (min)</label>
                <input type="number" value={settings.estimatedDeliveryTime} onChange={e => update('estimatedDeliveryTime', Number(e.target.value))} className="input-glass" />
              </div>
            </div>
            <div className="border-t border-gray-700 pt-4 mt-4">
              <p className="text-sm text-gray-400 mb-3">Payment Methods</p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={settings.paymentMethods?.cashOnDelivery} onChange={e => update('paymentMethods', { ...settings.paymentMethods, cashOnDelivery: e.target.checked })} className="w-4 h-4 rounded" />
                  <span className="text-sm">Cash on Delivery</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={settings.paymentMethods?.chapa} onChange={e => update('paymentMethods', { ...settings.paymentMethods, chapa: e.target.checked })} className="w-4 h-4 rounded" />
                  <span className="text-sm">Chapa Online Payment</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={settings.paymentMethods?.bankTransfer} onChange={e => update('paymentMethods', { ...settings.paymentMethods, bankTransfer: e.target.checked })} className="w-4 h-4 rounded" />
                  <span className="text-sm">Bank Transfer</span>
                </label>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FiDollarSign size={20} /> Payment Settings
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Chapa Secret Key</label>
              <input type="password" value={settings.chapaSecretKey} onChange={e => update('chapaSecretKey', e.target.value)} placeholder="sk_live_..." className="input-glass" />
            </div>
            <div>
              <label className="block text-sm mb-1">Chapa Public Key</label>
              <input type="text" value={settings.chapaPublicKey} onChange={e => update('chapaPublicKey', e.target.value)} placeholder="pk_live_..." className="input-glass" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
