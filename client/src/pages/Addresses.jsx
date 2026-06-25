import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { FiMapPin, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

export default function Addresses() {
  const { t } = useTranslation();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ label: '', address: '', city: '', isDefault: false });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const { data } = await axios.get('/api/users/addresses');
      setAddresses(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/api/users/addresses/${editingId}`, form);
        toast.success(t('profile.addressUpdated'));
      } else {
        await axios.post('/api/users/addresses', form);
        toast.success(t('profile.addressAdded'));
      }
      fetchAddresses();
      setShowForm(false);
      setEditingId(null);
      setForm({ label: '', address: '', city: '', isDefault: false });
    } catch (error) {
      toast.error(t('addresses.failedToSave'));
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/users/addresses/${id}`);
      toast.success(t('profile.addressDeleted'));
      fetchAddresses();
    } catch (error) {
      toast.error(t('addresses.failedToDelete'));
    }
  };

  const handleEdit = (addr) => {
    setEditingId(addr._id);
    setForm({ label: addr.label, address: addr.address, city: addr.city, isDefault: addr.isDefault });
    setShowForm(true);
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center justify-between"
          >
            <div>
              <h1 className="text-4xl font-bold mb-4">{t('addresses.title')}</h1>
              <p className="text-white/60">{t('addresses.subtitle')}</p>
            </div>
            <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
              <FiPlus /> {t('addresses.add')}
            </button>
          </motion.div>

          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-card mb-8"
              >
                <h3 className="text-xl font-semibold mb-4">
                  {editingId ? t('addresses.editAddress') : t('addresses.addNewAddress')}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2">{t('addresses.labelPlaceholder')}</label>
                    <input
                      type="text"
                      value={form.label}
                      onChange={(e) => setForm({ ...form, label: e.target.value })}
                      className="input-glass w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">{t('addresses.addressPlaceholder')}</label>
                    <textarea
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="input-glass w-full h-20 resize-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">{t('checkout.city')}</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="input-glass w-full"
                      required
                    />
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.isDefault}
                      onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                      className="w-4 h-4"
                    />
                    {t('addresses.setAsDefault')}
                  </label>
                  <div className="flex gap-2">
                    <button type="submit" className="btn-primary">
                      {editingId ? t('addresses.update') : t('addresses.save')}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setEditingId(null); }}
                      className="btn-ghost"
                    >
                      {t('addresses.cancel')}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="text-center py-20">{t('addresses.loading')}</div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-20 glass">
              <FiMapPin size={40} className="mx-auto mb-4 text-white/50" />
              <p className="text-xl mb-4">{t('addresses.noAddresses')}</p>
              <p className="text-white/60 mb-4">{t('addresses.addAddressForCheckout')}</p>
              <button onClick={() => setShowForm(true)} className="btn-primary">
                {t('addresses.addAddress')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((addr, index) => (
                <motion.div
                  key={addr._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card flex items-start justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
                      <FiMapPin className="text-primary-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {addr.label}
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 rounded-full bg-primary-500/20 text-xs text-primary-500">
                            {t('addresses.default')}
                          </span>
                        )}
                      </h3>
                      <p className="text-white/60">{addr.address}</p>
                      <p className="text-white/60">{addr.city}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(addr)}
                      className="w-8 h-8 rounded-lg glass flex items-center justify-center"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(addr._id)}
                      className="w-8 h-8 rounded-lg glass flex items-center justify-center hover:bg-red-500/20"
                    >
                      <FiTrash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}