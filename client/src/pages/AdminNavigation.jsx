import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Loading from '../components/common/Loading';
import { FiPlus, FiTrash2, FiChevronUp, FiChevronDown, FiSave, FiRefreshCw } from 'react-icons/fi';

const DEFAULT_NAV = {
  menuItems: [
    { label: 'Home', path: '/' },
    { label: 'Menu', path: '/menu' },
  ],
  categoryItems: [],
  bookingDropdownItems: [],
  primLinks: [],
  secLinks: [],
  locationLabel: 'Location',
  locationPath: '/location',
};

const SECTIONS = [
  { key: 'menuItems', label: 'Menu Items', desc: 'Main navigation links in the top bar' },
  { key: 'categoryItems', label: 'Category Items', desc: 'Quick category links in mobile menu (emoji optional)' },
  { key: 'bookingDropdownItems', label: 'Booking Dropdown', desc: 'Items under the Booking dropdown' },
  { key: 'primLinks', label: 'Primary Links', desc: 'Links shown in the top bar' },
  { key: 'secLinks', label: 'Secondary Links', desc: 'Links shown in mobile menu' },
];

const ICON_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'FiCalendar', label: 'Calendar' },
  { value: 'FiBox', label: 'Box' },
  { value: 'FiGift', label: 'Gift' },
  { value: 'FiHome', label: 'Home' },
  { value: 'FiCoffee', label: 'Coffee' },
  { value: 'FiSmartphone', label: 'Smartphone' },
  { value: 'FiTag', label: 'Tag' },
  { value: 'FiMapPin', label: 'Map Pin' },
  { value: 'FiImage', label: 'Image' },
  { value: 'FiAward', label: 'Award' },
];

export default function AdminNavigation() {
  const [navData, setNavData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('menuItems');
  const [newItem, setNewItem] = useState({ label: '', path: '', icon: '', emoji: '' });

  useEffect(() => {
    fetchNav();
  }, []);

  const fetchNav = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/content/navbar');
      setNavData({ ...DEFAULT_NAV, ...data.data.value });
    } catch {
      setNavData({ ...DEFAULT_NAV });
    } finally {
      setLoading(false);
    }
  };

  const saveNav = async () => {
    setSaving(true);
    try {
      await axios.put('/api/content/navbar', { value: navData });
      toast.success('Navigation saved');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => {
    if (!newItem.label.trim()) return toast.error('Label is required');
    setNavData(prev => ({
      ...prev,
      [activeSection]: [...(prev[activeSection] || []), { ...newItem, label: newItem.label.trim(), path: newItem.path.trim() }],
    }));
    setNewItem({ label: '', path: '', icon: '', emoji: '' });
  };

  const removeItem = (section, index) => {
    setNavData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  const moveItem = (section, index, direction) => {
    const items = [...navData[section]];
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    setNavData(prev => ({ ...prev, [section]: items }));
  };

  const updateItem = (section, index, field, value) => {
    setNavData(prev => {
      const items = [...prev[section]];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, [section]: items };
    });
  };

  if (loading) return <Loading />;

  const section = SECTIONS.find(s => s.key === activeSection);
  const items = navData[activeSection] || [];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-20">
        <div className="w-full px-4 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">Navigation Manager</h1>
              <p className="text-white/60 text-sm">Customize navbar links and menu items</p>
            </div>
            <div className="flex gap-3">
              <button onClick={fetchNav} className="btn-ghost flex items-center gap-2 px-4 py-2 text-sm">
                <FiRefreshCw size={14} /> Reset
              </button>
              <button onClick={saveNav} disabled={saving} className="btn-primary flex items-center gap-2 px-5 py-2 text-sm">
                <FiSave size={14} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>

          <div className="flex gap-2 mb-8 flex-wrap">
            {SECTIONS.map(sec => (
              <button key={sec.key} onClick={() => setActiveSection(sec.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeSection === sec.key
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'glass-card text-white/70 hover:text-white hover:bg-white/10'
                }`}>
                {sec.label}
              </button>
            ))}
          </div>

          {section && (
            <motion.div key={section.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-1">{section.label}</h2>
                <p className="text-white/60 text-sm">{section.desc}</p>
              </div>

              <div className="flex items-end gap-3 mb-8 p-4 bg-white/5 rounded-xl">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-white/60 mb-1">Label</label>
                  <input type="text" value={newItem.label} onChange={e => setNewItem(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="e.g. About Us" className="input-glass w-full text-sm" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-white/60 mb-1">Path</label>
                  <input type="text" value={newItem.path} onChange={e => setNewItem(prev => ({ ...prev, path: e.target.value }))}
                    placeholder="e.g. /about" className="input-glass w-full text-sm" />
                </div>
                {section.key === 'bookingDropdownItems' && (
                  <div className="w-32">
                    <label className="block text-xs font-medium text-white/60 mb-1">Icon</label>
                    <select value={newItem.icon} onChange={e => setNewItem(prev => ({ ...prev, icon: e.target.value }))}
                      className="input-glass w-full text-sm">
                      {ICON_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                )}
                {section.key === 'categoryItems' && (
                  <div className="w-20">
                    <label className="block text-xs font-medium text-white/60 mb-1">Emoji</label>
                    <input type="text" value={newItem.emoji} onChange={e => setNewItem(prev => ({ ...prev, emoji: e.target.value }))}
                      placeholder="🍕" className="input-glass w-full text-sm text-center" />
                  </div>
                )}
                <button onClick={addItem} className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm whitespace-nowrap">
                  <FiPlus size={14} /> Add
                </button>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-12 text-white/40">
                  <p className="text-lg font-medium">No items yet</p>
                  <p className="text-sm mt-1">Add your first item above</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-xl group hover:bg-white/10 transition-colors">
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => moveItem(activeSection, i, -1)} disabled={i === 0}
                          className="p-0.5 text-white/30 hover:text-white disabled:opacity-20"><FiChevronUp size={14} /></button>
                        <button onClick={() => moveItem(activeSection, i, 1)} disabled={i === items.length - 1}
                          className="p-0.5 text-white/30 hover:text-white disabled:opacity-20"><FiChevronDown size={14} /></button>
                      </div>
                      <div className="flex-1 flex items-center gap-3">
                        {item.emoji && <span className="text-lg">{item.emoji}</span>}
                        {item.icon && <span className="text-primary-400 text-xs bg-primary-500/10 px-2 py-0.5 rounded">{item.icon}</span>}
                        <input type="text" value={item.label} onChange={e => updateItem(activeSection, i, 'label', e.target.value)}
                          className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-primary-500 outline-none text-white font-medium text-sm flex-1 transition-colors" />
                        <input type="text" value={item.path} onChange={e => updateItem(activeSection, i, 'path', e.target.value)}
                          className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-primary-500 outline-none text-white/60 text-xs flex-1 transition-colors font-mono" />
                        {section.key === 'bookingDropdownItems' && (
                          <select value={item.icon || ''} onChange={e => updateItem(activeSection, i, 'icon', e.target.value)}
                            className="bg-transparent text-white/60 text-xs border border-white/10 rounded-lg px-2 py-1">
                            {ICON_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        )}
                        {section.key === 'categoryItems' && (
                          <input type="text" value={item.emoji || ''} onChange={e => updateItem(activeSection, i, 'emoji', e.target.value)}
                            className="bg-transparent text-center text-lg w-10 border border-white/10 rounded-lg" />
                        )}
                      </div>
                      <button onClick={() => removeItem(activeSection, i)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                        <FiTrash2 size={14} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
