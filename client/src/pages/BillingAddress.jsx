import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FiMapPin, FiArrowLeft, FiPlus } from 'react-icons/fi';

export default function BillingAddress() {
  const navigate = useNavigate();
  const { cart, getSubtotal, getDeliveryFee, getTax, getTotal, setOrderType } = useCart();
  
  useEffect(() => {
    setOrderType('delivery');
  }, []);
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guestInfo, setGuestInfo] = useState({ name: '', phone: '', address: '' });
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: '', address: '', city: '', isDefault: false });

  useEffect(() => {
    if (user) {
      fetchAddresses();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const { data } = await axios.get('/api/users/addresses');
      setAddresses(data.data);
      const defaultAddr = data.data.find(a => a.isDefault);
      if (defaultAddr) setSelectedAddress(defaultAddr._id);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/users/addresses', form);
      toast.success('Address added');
      setAddresses(prev => [...prev, data.data]);
      setSelectedAddress(data.data._id);
      setShowForm(false);
      setForm({ label: '', address: '', city: '', isDefault: false });
    } catch (error) {
      toast.error('Failed to save address');
    }
  };

  const handleProceed = () => {
    if (!user) {
      if (!guestInfo.name || !guestInfo.phone || !guestInfo.address) {
        toast.error('Please fill in all fields');
        return;
      }
      navigate('/checkout', {
        state: {
          orderType: 'delivery',
          guestName: guestInfo.name,
          guestPhone: guestInfo.phone,
          guestAddress: guestInfo.address,
          deliveryNotes
        }
      });
      return;
    }

    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    navigate('/checkout', {
      state: {
        orderType: 'delivery',
        addressId: selectedAddress,
        deliveryNotes
      }
    });
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-24 pb-20">
        <div className="w-full px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate('/checkout')}
              className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors"
            >
              <FiArrowLeft /> Back to order type
            </button>
            <h1 className="text-4xl font-bold mb-2">Delivery Address</h1>
            <p className="text-white/60">Where should we deliver your order?</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {!user ? (
                <div className="glass-card">
                  <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <FiMapPin /> Your Information
                  </h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Your name"
                      value={guestInfo.name}
                      onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                      className="input-glass w-full"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={guestInfo.phone}
                      onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                      className="input-glass w-full"
                      required
                    />
                    <textarea
                      placeholder="Delivery address"
                      value={guestInfo.address}
                      onChange={(e) => setGuestInfo({ ...guestInfo, address: e.target.value })}
                      className="input-glass w-full h-24 resize-none"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="glass-card">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <FiMapPin /> Saved Addresses
                    </h3>
                    <button
                      onClick={() => setShowForm(true)}
                      className="btn-primary flex items-center gap-2 text-sm"
                    >
                      <FiPlus /> Add New
                    </button>
                  </div>

                  {showForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mb-6 p-4 rounded-xl glass"
                    >
                      <form onSubmit={handleAddAddress} className="space-y-3">
                        <input
                          type="text"
                          placeholder="Label (e.g., Home, Office)"
                          value={form.label}
                          onChange={(e) => setForm({ ...form, label: e.target.value })}
                          className="input-glass w-full"
                          required
                        />
                        <textarea
                          placeholder="Address"
                          value={form.address}
                          onChange={(e) => setForm({ ...form, address: e.target.value })}
                          className="input-glass w-full h-20 resize-none"
                          required
                        />
                        <input
                          type="text"
                          placeholder="City"
                          value={form.city}
                          onChange={(e) => setForm({ ...form, city: e.target.value })}
                          className="input-glass w-full"
                          required
                        />
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={form.isDefault}
                            onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                            className="w-4 h-4"
                          />
                          Set as default address
                        </label>
                        <div className="flex gap-2">
                          <button type="submit" className="btn-primary">Save</button>
                          <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {loading ? (
                    <p className="text-white/60">Loading addresses...</p>
                  ) : addresses.length === 0 ? (
                    <p className="text-white/60 text-center py-8">
                      No saved addresses. Add one to continue.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map((addr, index) => (
                        <motion.button
                          key={addr._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => setSelectedAddress(addr._id)}
                          className={`w-full text-left p-4 rounded-xl transition-all ${
                            selectedAddress === addr._id
                              ? 'bg-primary-500/20 border-2 border-primary-500'
                              : 'glass hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <FiMapPin className="mt-1 text-primary-500" />
                            <div>
                              <p className="font-semibold flex items-center gap-2">
                                {addr.label}
                                {addr.isDefault && (
                                  <span className="px-2 py-0.5 rounded-full bg-primary-500/20 text-xs text-primary-500">
                                    Default
                                  </span>
                                )}
                              </p>
                              <p className="text-white/60 text-sm">{addr.address}, {addr.city}</p>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="glass-card">
                <label className="block text-sm mb-2">Delivery Notes (Optional)</label>
                <textarea
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Any special instructions for delivery..."
                  className="input-glass w-full h-20 resize-none"
                />
              </div>
            </div>

            <div>
              <div className="glass-card sticky top-24">
                <h3 className="text-xl font-semibold mb-6">Order Summary</h3>

                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-white/80">{item.quantity}x {item.name}</span>
                      <span>{(item.price).toFixed(2)} ETB</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-t border-white/10 pt-4">
                  <div className="flex justify-between">
                    <span className="text-white/60">Subtotal</span>
                    <span>{getSubtotal().toFixed(2)} ETB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Delivery</span>
                    <span>{getDeliveryFee().toFixed(2)} ETB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Tax</span>
                    <span>{getTax().toFixed(2)} ETB</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-3">
                    <span>Total</span>
                    <span className="text-primary-500">{getTotal().toFixed(2)} ETB</span>
                  </div>
                </div>

                <button
                  onClick={handleProceed}
                  className="btn-primary w-full mt-6"
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
