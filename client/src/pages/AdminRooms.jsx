import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Loading from '../components/common/Loading';
import {
  Bed, CalendarDays, Clock, Users, Phone, Mail, Search, Filter,
  ChevronDown, ChevronRight, MoreHorizontal, X, CheckCircle,
  AlertCircle, Trash2, Edit, Eye, RefreshCw, MapPin,
  Star, ArrowLeft, Send, AlertTriangle, Plus, DollarSign,
  Wifi, Tv, Wind, Coffee, Bath, Utensils, Shield,
  Sun, Monitor, Music, Sparkles, Image as ImageIcon,
  ChevronUp, GripVertical, ToggleLeft, ToggleRight, Save,
  Maximize2, Minimize2, Info, BadgeCheck, Flame, Zap, CircleDot,
  Wine, ChefHat, Cake, Bell, TreePine, Palette, PartyPopper,
  Luggage, DoorOpen, Settings, Award, CheckSquare,
  Home, LayoutGrid, List, ArrowUp, ArrowDown, MoveVertical,
  Car
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

const AMENITY_OPTIONS = [
  { label: 'Free Wi-Fi', icon: Wifi },
  { label: '65\" OLED Smart TV', icon: Tv },
  { label: 'Premium Climate Control', icon: Wind },
  { label: 'Espresso & Tea Bar', icon: Coffee },
  { label: 'Luxury En-suite Bathroom', icon: Bath },
  { label: '24/7 Room Service', icon: Utensils },
  { label: 'Personal Butler Service', icon: Shield },
  { label: 'Dedicated Workstation', icon: Monitor },
  { label: 'Sonic Sound System', icon: Music },
  { label: 'Panoramic City Views', icon: Sun },
  { label: 'King Size Bed', icon: Bed },
  { label: 'Private Balcony', icon: TreePine },
  { label: 'Mini Kitchen', icon: ChefHat },
  { label: 'Jacuzzi', icon: Bath },
  { label: 'Safety Deposit Box', icon: Shield },
  { label: 'Iron & Ironing Board', icon: Settings },
  { label: 'Hair Dryer', icon: Wind },
  { label: 'Bathrobes & Slippers', icon: Luggage },
  { label: 'Daily Housekeeping', icon: Sparkles },
  { label: 'Airport Transfer', icon: Car },
];

const IMAGE_PRESETS = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80',
  'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=1200&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80',
  'https://images.unsplash.com/photo-1590490359683-658d3d23f972?w=1200&q=80',
  'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&q=80',
  'https://images.unsplash.com/photo-1602872030216-3af72d4d59d9?w=1200&q=80',
];

function AnimatedCounter({ value, duration = 1500 }) {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    let startTime = null;
    let raf = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor((value || 0) * ease));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [value, duration]);
  return <span>{displayValue.toLocaleString()}</span>;
}

function QuickStats({ rooms, darkMode }) {
  const d = darkMode;
  const activeRooms = rooms.filter(r => r.isActive).length;
  const featuredRooms = rooms.filter(r => r.data?.featured).length;

  const stats = [
    { label: 'Total Rooms', value: rooms.length, icon: Bed, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/30', gradient: 'from-indigo-500 to-purple-500' },
    { label: 'Active', value: activeRooms, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30', gradient: 'from-emerald-500 to-teal-500' },
    { label: 'Featured', value: featuredRooms, icon: Star, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30', gradient: 'from-amber-500 to-orange-500' },
    { label: 'Inactive', value: rooms.length - activeRooms, icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800/50', gradient: 'from-gray-500 to-slate-600' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className={`relative overflow-hidden rounded-3xl p-6 group ${
              d
                ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 shadow-2xl'
                : 'bg-white border border-gray-100 shadow-xl hover:shadow-2xl'
            }`}
          >
            <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-10 bg-gradient-to-br ${stat.gradient} transition-transform duration-500 group-hover:scale-110`} />

            <div className="relative">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br ${stat.gradient} shadow-lg shadow-indigo-500/20`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <motion.p
                key={stat.value}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className={`text-3xl sm:text-4xl font-black mb-1 ${d ? 'text-white' : 'text-gray-900'}`}
              >
                <AnimatedCounter value={stat.value} />
              </motion.p>
              <p className={`text-sm font-medium ${d ? 'text-white/50' : 'text-gray-500'}`}>
                {stat.label}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function RoomCard({ room, index, onEdit, onToggleActive, onDelete, darkMode }) {
  const d = darkMode;
  const [showActions, setShowActions] = useState(false);
  const data = room.data || {};
  const images = data.images || [];
  const amenities = data.amenities || [];

  const getPriceValue = (priceStr) => {
    const cleaned = String(priceStr || '0').replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  };

  const handleToggle = async () => {
    try {
      await onToggleActive(room._id, !room.isActive);
      toast.success(`Room ${room.isActive ? 'deactivated' : 'activated'}`);
    } catch {
      toast.error('Failed to update room');
    }
  };

  const handleDelete = () => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">Delete room "{data.name || 'Untitled'}"?</p>
        <p className="text-xs text-gray-400">This action cannot be undone</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-1.5 text-xs font-medium bg-gray-100 dark:bg-slate-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              try {
                await onDelete(room._id);
                toast.dismiss(t.id);
                toast.success('Room deleted');
              } catch {
                toast.dismiss(t.id);
                toast.error('Failed to delete');
              }
            }}
            className="px-4 py-1.5 text-xs font-medium bg-red-500 text-white rounded-lg"
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: 10000 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      layout
    >
      <div className={`group relative overflow-hidden rounded-3xl transition-all duration-500 ${
        room.isActive
          ? d
            ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10'
            : 'bg-white border border-gray-100 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10'
          : d
            ? 'bg-slate-900/50 border border-white/5 opacity-70'
            : 'bg-gray-50/60 border border-gray-200/50 opacity-70'
      }`}>
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-80 h-64 sm:h-72 lg:h-auto flex-shrink-0 relative overflow-hidden">
            {images.length > 0 && images[0]?.src ? (
              <motion.div
                className="w-full h-full"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.7 }}
              >
                <img
                  src={images[0].src}
                  alt={data.name || 'Room'}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${
                d ? 'bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-pink-500/10' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'
              }`}>
                <div className="text-center">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="w-20 h-20 mx-auto rounded-3xl bg-white/50 dark:bg-white/10 flex items-center justify-center mb-3"
                  >
                    <Bed className={`w-10 h-10 ${d ? 'text-indigo-400/50' : 'text-indigo-300/60'}`} />
                  </motion.div>
                  <p className={`text-sm font-medium ${d ? 'text-white/40' : 'text-gray-400'}`}>No Image</p>
                </div>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
              {data.featured && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30"
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  Featured
                </motion.span>
              )}
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md ${
                room.isActive
                  ? d ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  : d ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : 'bg-gray-100 text-gray-600 border-gray-200'
              }`}>
                <span className={`w-2 h-2 rounded-full ${room.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                {room.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {images.length > 1 && (
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-black/50 text-white backdrop-blur-md border border-white/10">
                  <ImageIcon className="w-3.5 h-3.5" />
                  {images.length} Photos
                </span>
              </div>
            )}

            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md">
                    <Users className="w-3.5 h-3.5 text-white/80" />
                    <span className="text-xs text-white font-medium">{data.capacity || '—'} Guests</span>
                  </div>
                </div>
                <div className="text-right">
                  {data.price !== undefined && data.price !== null && (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-white drop-shadow-lg">
                        ${getPriceValue(data.price)}
                      </span>
                      <span className="text-white/60 text-xs font-medium">/night</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 sm:p-7">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${
                    d ? 'text-indigo-400' : 'text-indigo-600'
                  }`}>
                    {data.featured ? 'FEATURED LISTING' : index === 0 ? 'PREMIUM ROOM' : 'ROOM LISTING'}
                  </span>
                </div>
                <h3 className={`text-2xl sm:text-3xl font-black mb-2 ${d ? 'text-white' : 'text-gray-900'}`}>
                  {data.name || 'Untitled Room'}
                </h3>
                {data.description && (
                  <p className={`text-sm leading-relaxed line-clamp-2 ${d ? 'text-white/60' : 'text-gray-500'}`}>
                    {data.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 sm:items-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onEdit(room)}
                  className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 ${
                    d
                      ? 'bg-gradient-to-r from-indigo-500/20 to-violet-500/20 text-indigo-400 hover:from-indigo-500/30 hover:to-violet-500/30 border border-indigo-500/20'
                      : 'bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-600 hover:from-indigo-100 hover:to-violet-100 border border-indigo-100'
                  }`}
                >
                  <Edit className="w-4 h-4" />
                  Edit Room
                </motion.button>

                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowActions(!showActions)}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                      d ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                    }`}
                  >
                    <MoreHorizontal className={`w-5 h-5 ${d ? 'text-white/50' : 'text-gray-400'}`} />
                  </motion.button>

                  <AnimatePresence>
                    {showActions && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className={`absolute right-0 top-12 w-56 rounded-3xl overflow-hidden border shadow-2xl z-30 ${
                          d ? 'bg-slate-800 border-white/10' : 'bg-white border-gray-200'
                        }`}
                      >
                        <button
                          onClick={() => { handleToggle(); setShowActions(false); }}
                          className={`w-full flex items-center gap-3 px-5 py-4 text-sm font-medium transition-all ${
                            d ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                          } ${room.isActive ? 'text-amber-500' : 'text-emerald-500'}`}
                        >
                          {room.isActive ? <ToggleLeft className="w-5 h-5" /> : <ToggleRight className="w-5 h-5" />}
                          {room.isActive ? 'Deactivate Room' : 'Activate Room'}
                        </button>
                        <button
                          onClick={() => { handleDelete(); setShowActions(false); }}
                          className={`w-full flex items-center gap-3 px-5 py-4 text-sm font-medium text-red-500 transition-all ${
                            d ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                          }`}
                        >
                          <Trash2 className="w-5 h-5" />
                          Delete Room
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {amenities.length > 0 && (
              <div className="mb-4">
                <p className={`text-xs uppercase tracking-[0.15em] font-bold mb-3 ${
                  d ? 'text-white/40' : 'text-gray-400'
                }`}>
                  AMENITIES
                </p>
                <div className="flex flex-wrap gap-2">
                  {amenities.slice(0, 8).map((amenity, i) => (
                    <motion.span
                      key={amenity}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.03 }}
                      whileHover={{ scale: 1.05 }}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium ${
                        d
                          ? 'bg-white/5 text-white/70 border border-white/10'
                          : 'bg-gray-50 text-gray-600 border border-gray-100'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      {amenity}
                    </motion.span>
                  ))}
                  {amenities.length > 8 && (
                    <span className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold ${
                      d ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      +{amenities.length - 8} more
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className={`flex flex-wrap gap-6 pt-4 border-t ${
              d ? 'border-white/10' : 'border-gray-100'
            }`}>
              {data.capacity && (
                <div className="flex items-center gap-2">
                  <Users className={`w-4 h-4 ${d ? 'text-indigo-400' : 'text-indigo-500'}`} />
                  <span className={`text-sm ${d ? 'text-white/70' : 'text-gray-600'}`}>
                    <span className={`font-bold ${d ? 'text-white' : 'text-gray-900'}`}>{data.capacity}</span> Guests Max
                  </span>
                </div>
              )}
              {images.length > 0 && (
                <div className="flex items-center gap-2">
                  <ImageIcon className={`w-4 h-4 ${d ? 'text-indigo-400' : 'text-indigo-500'}`} />
                  <span className={`text-sm ${d ? 'text-white/70' : 'text-gray-600'}`}>
                    <span className={`font-bold ${d ? 'text-white' : 'text-gray-900'}`}>{images.length}</span> Images
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Award className={`w-4 h-4 ${d ? 'text-indigo-400' : 'text-indigo-500'}`} />
                <span className={`text-sm ${d ? 'text-white/70' : 'text-gray-600'}`}>
                  Order: <span className={`font-bold ${d ? 'text-white' : 'text-gray-900'}`}>{room.order || 0}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function RoomFormModal({ room, onClose, onSave, darkMode }) {
  const d = darkMode;
  const isEdit = !!room;
  const [form, setForm] = useState({
    name: room?.data?.name || '',
    description: room?.data?.description || '',
    price: room?.data?.price || '',
    capacity: room?.data?.capacity || '',
    featured: room?.data?.featured || false,
    amenities: room?.data?.amenities || [],
    images: room?.data?.images || [],
    order: room?.order || 0,
  });
  const [newAmenity, setNewAmenity] = useState('');
  const [newImage, setNewImage] = useState({ src: '', alt: '', label: '' });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Home },
    { id: 'images', label: 'Images', icon: ImageIcon },
    { id: 'amenities', label: 'Amenities', icon: CheckSquare },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Room name is required');
      return;
    }

    setSaving(true);
    try {
      await onSave(isEdit ? room._id : null, {
        type: 'room',
        data: {
          name: form.name.trim(),
          description: form.description.trim(),
          price: form.price,
          capacity: form.capacity,
          featured: form.featured,
          amenities: form.amenities,
          images: form.images,
        },
        isActive: isEdit ? room.isActive : true,
        order: Number(form.order) || 0,
      });
      toast.success(isEdit ? 'Room updated successfully!' : 'Room created successfully!');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save room');
    } finally {
      setSaving(false);
    }
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !form.amenities.includes(newAmenity.trim())) {
      setForm({ ...form, amenities: [...form.amenities, newAmenity.trim()] });
      setNewAmenity('');
    }
  };

  const removeAmenity = (amenity) => {
    setForm({ ...form, amenities: form.amenities.filter(a => a !== amenity) });
  };

  const toggleAmenityPreset = (amenity) => {
    if (form.amenities.includes(amenity)) {
      removeAmenity(amenity);
    } else {
      setForm({ ...form, amenities: [...form.amenities, amenity] });
    }
  };

  const addImage = () => {
    if (newImage.src.trim()) {
      setForm({
        ...form,
        images: [...form.images, {
          src: newImage.src.trim(),
          alt: newImage.alt.trim() || 'Room Image',
          label: newImage.label.trim() || 'Image'
        }]
      });
      setNewImage({ src: '', alt: '', label: '' });
    }
  };

  const addPresetImage = (url) => {
    const label = `Image ${form.images.length + 1}`;
    setForm({
      ...form,
      images: [...form.images, { src: url, alt: label, label }]
    });
  };

  const removeImage = (index) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== index) });
  };

  const moveImage = (index, direction) => {
    const newImages = [...form.images];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newImages.length) {
      [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
      setForm({ ...form, images: newImages });
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          onClick={(e) => e.stopPropagation()}
          className={`relative w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-3xl shadow-2xl ${
            d ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10' : 'bg-white'
          }`}
        >
          <div className={`p-6 sm:p-7 border-b ${d ? 'border-white/10' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 shadow-xl shadow-indigo-500/30`}
                >
                  <Bed className="w-7 h-7 text-white" />
                </motion.div>
                <div>
                  <h2 className={`text-2xl font-black ${d ? 'text-white' : 'text-gray-900'}`}>
                    {isEdit ? 'Edit Room' : 'Add New Room'}
                  </h2>
                  <p className={`text-sm mt-0.5 ${d ? 'text-white/50' : 'text-gray-500'}`}>
                    {isEdit ? 'Update your room listing information' : 'Create a stunning new room listing'}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                  d ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                }`}
              >
                <X className={`w-5 h-5 ${d ? 'text-white/50' : 'text-gray-400'}`} />
              </motion.button>
            </div>

            <div className={`flex gap-1 mt-6 p-1 rounded-2xl overflow-x-auto ${
              d ? 'bg-white/5' : 'bg-gray-50'
            }`}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex-shrink-0 ${
                      activeTab === tab.id
                        ? d
                          ? 'bg-slate-700 text-white shadow-lg'
                          : 'bg-white text-indigo-600 shadow-sm'
                        : d
                          ? 'text-white/40 hover:text-white/60'
                          : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 sm:p-7">
            <AnimatePresence mode="wait">
              {activeTab === 'basic' && (
                <motion.div
                  key="basic"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                      d ? 'text-white/50' : 'text-gray-500'
                    }`}>
                      Room Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g., Premium Ocean View Suite"
                      className={`w-full px-4 py-3.5 rounded-2xl text-sm outline-none transition-all ${
                        d
                          ? 'bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20'
                          : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                        d ? 'text-white/50' : 'text-gray-500'
                      }`}>
                        Price per Night ($)
                      </label>
                      <div className="relative">
                        <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                          d ? 'text-white/30' : 'text-gray-400'
                        }`}>$</span>
                        <input
                          type="number"
                          value={form.price}
                          onChange={(e) => setForm({ ...form, price: e.target.value })}
                          placeholder="150"
                          className={`w-full pl-9 pr-4 py-3.5 rounded-2xl text-sm outline-none transition-all ${
                            d
                              ? 'bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20'
                              : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                        d ? 'text-white/50' : 'text-gray-500'
                      }`}>
                        Guest Capacity
                      </label>
                      <div className="relative">
                        <Users className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${
                          d ? 'text-white/30' : 'text-gray-400'
                        }`} />
                        <input
                          type="text"
                          value={form.capacity}
                          onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                          placeholder="e.g., 4"
                          className={`w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm outline-none transition-all ${
                            d
                              ? 'bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20'
                              : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                      d ? 'text-white/50' : 'text-gray-500'
                    }`}>
                      Description
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Describe this beautiful room in detail..."
                      rows={4}
                      className={`w-full px-4 py-3.5 rounded-2xl text-sm outline-none resize-none transition-all ${
                        d
                          ? 'bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20'
                          : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                        d ? 'text-white/50' : 'text-gray-500'
                      }`}>
                        Display Order
                      </label>
                      <div className="relative">
                        <MoveVertical className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${
                          d ? 'text-white/30' : 'text-gray-400'
                        }`} />
                        <input
                          type="number"
                          value={form.order}
                          onChange={(e) => setForm({ ...form, order: e.target.value })}
                          placeholder="0"
                          className={`w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm outline-none transition-all ${
                            d
                              ? 'bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20'
                              : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex items-end">
                      <div className={`flex items-center gap-4 p-4 rounded-2xl w-full ${
                        d ? 'bg-white/5 border border-white/10' : 'bg-amber-50 border border-amber-100'
                      }`}>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, featured: !form.featured })}
                          className={`w-14 h-7 rounded-full transition-all duration-300 relative ${
                            form.featured
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                              : d ? 'bg-white/10' : 'bg-gray-200'
                          }`}
                        >
                          <motion.div
                            animate={{ x: form.featured ? 30 : 4 }}
                            className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center"
                          >
                            <Star className={`w-3.5 h-3.5 ${form.featured ? 'text-amber-500 fill-amber-500' : 'text-gray-400'}`} />
                          </motion.div>
                        </button>
                        <div>
                          <p className={`text-sm font-bold ${d ? 'text-white' : 'text-gray-900'}`}>
                            Featured Room
                          </p>
                          <p className={`text-xs ${d ? 'text-white/40' : 'text-gray-500'}`}>
                            Show in featured section
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'images' && (
                <motion.div
                  key="images"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ${
                      d ? 'text-white/50' : 'text-gray-500'
                    }`}>
                      Room Images ({form.images.length})
                    </label>

                    {form.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
                        {form.images.map((img, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`group relative rounded-2xl overflow-hidden border ${
                              d ? 'border-white/10' : 'border-gray-200'
                            }`}
                          >
                            <div className="aspect-[4/3] overflow-hidden">
                              <img
                                src={img.src}
                                alt={img.alt}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  const parent = e.target.parentElement;
                                  parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/10 ${d ? '' : ''}"><Bed class="w-8 h-8 ${d ? 'text-white/30' : 'text-indigo-300/50'}" /></div>`;
                                }}
                              />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                              <p className="text-white text-sm font-medium truncate">{img.label}</p>
                            </div>
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {i > 0 && (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  type="button"
                                  onClick={() => moveImage(i, 'up')}
                                  className="w-7 h-7 rounded-lg bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </motion.button>
                              )}
                              {i < form.images.length - 1 && (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  type="button"
                                  onClick={() => moveImage(i, 'down')}
                                  className="w-7 h-7 rounded-lg bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </motion.button>
                              )}
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                type="button"
                                onClick={() => removeImage(i)}
                                className="w-7 h-7 rounded-lg bg-red-500/80 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-600"
                              >
                                <X className="w-3.5 h-3.5" />
                              </motion.button>
                            </div>
                            <div className="absolute top-2 left-2">
                              <span className="px-2 py-0.5 rounded-lg bg-black/50 backdrop-blur-md text-white text-xs font-bold">
                                #{i + 1}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    <div className={`p-5 rounded-2xl space-y-4 ${
                      d ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-100'
                    }`}>
                      <p className={`text-sm font-bold ${d ? 'text-white' : 'text-gray-900'}`}>Add New Image</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={newImage.src}
                          onChange={(e) => setNewImage({ ...newImage, src: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                          placeholder="Image URL"
                          className={`md:col-span-2 w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
                            d
                              ? 'bg-black/20 border border-white/10 text-white placeholder-white/30 focus:border-indigo-500/50'
                              : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400'
                          }`}
                        />
                        <input
                          type="text"
                          value={newImage.label}
                          onChange={(e) => setNewImage({ ...newImage, label: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                          placeholder="Label (e.g., Bedroom)"
                          className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
                            d
                              ? 'bg-black/20 border border-white/10 text-white placeholder-white/30 focus:border-indigo-500/50'
                              : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400'
                          }`}
                        />
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={addImage}
                        disabled={!newImage.src.trim()}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4 inline mr-1.5" />
                        Add Image
                      </motion.button>

                      <div className="pt-4 border-t border-dashed border-gray-200/50 dark:border-white/10">
                        <p className={`text-xs font-medium mb-3 ${d ? 'text-white/40' : 'text-gray-400'}`}>Or use a preset:</p>
                        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                          {IMAGE_PRESETS.slice(0, 8).map((url, i) => (
                            <motion.button
                              key={i}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              type="button"
                              onClick={() => addPresetImage(url)}
                              className="aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-indigo-500 transition-all"
                            >
                              <img
                                src={url}
                                alt={`Preset ${i + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'amenities' && (
                <motion.div
                  key="amenities"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ${
                      d ? 'text-white/50' : 'text-gray-500'
                    }`}>
                      Selected Amenities ({form.amenities.length})
                    </label>
                    {form.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-5">
                        {form.amenities.map((amenity, i) => (
                          <motion.span
                            key={amenity}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.03 }}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium ${
                              d
                                ? 'bg-gradient-to-r from-indigo-500/20 to-violet-500/20 text-indigo-400 border border-indigo-500/20'
                                : 'bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-600 border border-indigo-100'
                            }`}
                          >
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                            {amenity}
                            <motion.button
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              type="button"
                              onClick={() => removeAmenity(amenity)}
                              className="ml-1 hover:text-red-500 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </motion.button>
                          </motion.span>
                        ))}
                      </div>
                    )}

                    <div className={`p-5 rounded-2xl space-y-3 ${
                      d ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-100'
                    }`}>
                      <p className={`text-sm font-bold ${d ? 'text-white' : 'text-gray-900'}`}>Add Custom Amenity</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newAmenity}
                          onChange={(e) => setNewAmenity(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                          placeholder="e.g., Ocean View, Private Pool, etc."
                          className={`flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
                            d
                              ? 'bg-black/20 border border-white/10 text-white placeholder-white/30 focus:border-indigo-500/50'
                              : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400'
                          }`}
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={addAmenity}
                          disabled={!newAmenity.trim()}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ${
                      d ? 'text-white/50' : 'text-gray-500'
                    }`}>
                      Quick Select Presets
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {AMENITY_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        const isSelected = form.amenities.includes(option.label);
                        return (
                          <motion.button
                            key={option.label}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            onClick={() => toggleAmenityPreset(option.label)}
                            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all text-left ${
                              isSelected
                                ? d
                                  ? 'bg-gradient-to-r from-indigo-500/20 to-violet-500/20 text-indigo-400 border-2 border-indigo-500/30'
                                  : 'bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-600 border-2 border-indigo-200'
                                : d
                                  ? 'bg-white/5 text-white/60 border-2 border-transparent hover:bg-white/10'
                                  : 'bg-white text-gray-600 border-2 border-transparent hover:bg-gray-50'
                            }`}
                          >
                            <Icon className={`w-4.5 h-4.5 ${isSelected ? 'text-indigo-500' : ''}`} />
                            <span className="truncate">{option.label}</span>
                            {isSelected && <CheckCircle className="w-4 h-4 ml-auto text-emerald-500" />}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className={`p-6 sm:p-7 border-t ${d ? 'border-white/10' : 'border-gray-100'}`}>
            <div className="flex flex-col sm:flex-row gap-3 justify-between sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all order-2 sm:order-1 ${
                  d
                    ? 'bg-white/10 text-white/70 hover:bg-white/15'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 text-white text-sm font-bold shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-2.5 disabled:opacity-60 order-1 sm:order-2"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4.5 h-4.5" />
                    {isEdit ? 'Update Room' : 'Create Room'}
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function EmptyState({ onAdd, darkMode }) {
  const d = darkMode;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center py-20 rounded-3xl overflow-hidden relative ${
        d ? 'bg-slate-800/50 border border-white/10' : 'bg-white border border-gray-100 shadow-xl'
      }`}
    >
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10 bg-gradient-to-br from-indigo-500 to-purple-500" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-10 bg-gradient-to-br from-violet-500 to-pink-500" />

      <div className="relative">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className={`w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-pink-500/10 flex items-center justify-center ${
            d ? 'border border-white/10' : 'border border-indigo-100'
          }`}
        >
          <Bed className={`w-12 h-12 ${d ? 'text-indigo-400/50' : 'text-indigo-400'}`} />
        </motion.div>
        <h3 className={`text-2xl font-black mb-2 ${d ? 'text-white' : 'text-gray-900'}`}>No Rooms Yet</h3>
        <p className={`text-base mb-8 max-w-md mx-auto ${d ? 'text-white/50' : 'text-gray-500'}`}>
          Create your first room listing to start accepting bookings. Add beautiful rooms with stunning images and detailed amenities.
        </p>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={onAdd}
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 text-white text-base font-bold shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all flex items-center gap-3 mx-auto"
        >
          <div className="w-6 h-6 rounded-xl bg-white/20 flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          Create Your First Room
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function AdminRooms() {
  const { darkMode } = useTheme();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  const d = darkMode;

  const fetchRooms = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/listings/room?all=true`);
      setRooms(data.data || []);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchRooms();
    setTimeout(() => setIsRefreshing(false), 600);
    toast.success('Rooms refreshed');
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingRoom(null);
    setShowForm(true);
  };

  const handleSave = async (id, roomData) => {
    if (id) {
      await axios.put(`${API_BASE}/api/listings/${id}`, roomData);
      setRooms(prev => prev.map(r => r._id === id ? { ...r, ...roomData } : r));
    } else {
      const { data } = await axios.post(`${API_BASE}/api/listings/room`, roomData);
      setRooms(prev => [...prev, data.data]);
    }
  };

  const handleToggleActive = async (id, isActive) => {
    await axios.put(`${API_BASE}/api/listings/${id}`, { isActive });
    setRooms(prev => prev.map(r => r._id === id ? { ...r, isActive } : r));
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API_BASE}/api/listings/${id}`);
    setRooms(prev => prev.filter(r => r._id !== id));
  };

  const filteredRooms = useMemo(() => {
    let result = rooms;
    if (filterActive !== 'all') {
      result = result.filter(r => r.isActive === (filterActive === 'active'));
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(r => {
        const data = r.data || {};
        return (
          (data.name || '').toLowerCase().includes(term) ||
          (data.description || '').toLowerCase().includes(term) ||
          (data.amenities || []).some(a => a.toLowerCase().includes(term))
        );
      });
    }
    return result.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [rooms, filterActive, searchTerm]);

  const tabs = [
    { id: 'all', label: 'All Rooms' },
    { id: 'active', label: 'Active' },
    { id: 'inactive', label: 'Inactive' },
  ];

  if (loading) return <Loading />;

  return (
    <div className={`min-h-screen ${d ? 'bg-slate-950' : 'bg-gradient-to-b from-slate-50 to-white'}`}>
      <Header />

      {showForm && (
        <RoomFormModal
          room={editingRoom}
          onClose={() => { setShowForm(false); setEditingRoom(null); }}
          onSave={handleSave}
          darkMode={darkMode}
        />
      )}

      <main className="pt-24 pb-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                    d ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    ROOM MANAGEMENT
                  </span>
                </div>
                <h1 className={`text-3xl sm:text-4xl font-black mb-1 ${d ? 'text-white' : 'text-gray-900'}`}>
                  Manage Rooms
                </h1>
                <p className={`text-base ${d ? 'text-white/50' : 'text-gray-500'}`}>
                  Create beautiful room listings and manage your inventory
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRefresh}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all ${
                    d
                      ? 'bg-white/10 text-white/80 hover:bg-white/15 border border-white/10'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
                  }`}
                >
                  <RefreshCw className={`w-4.5 h-4.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAdd}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 text-white text-sm font-bold shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all"
                >
                  <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  Add Room
                </motion.button>
              </div>
            </div>

            <QuickStats rooms={rooms} darkMode={darkMode} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className={`mb-6 rounded-3xl overflow-hidden p-5 sm:p-6 ${
              d
                ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10'
                : 'bg-white border border-gray-100 shadow-xl'
            }`}
          >
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className={`relative flex items-center gap-3 px-5 py-3.5 rounded-2xl ${
                  d ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-100'
                }`}>
                  <Search className={`w-5 h-5 ${d ? 'text-white/40' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    placeholder="Search rooms by name, description, or amenities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`flex-1 bg-transparent text-sm outline-none ${
                      d ? 'text-white placeholder-white/30' : 'text-gray-900 placeholder-gray-400'
                    }`}
                  />
                  {searchTerm && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSearchTerm('')}
                      className={`p-1.5 rounded-xl ${
                        d ? 'hover:bg-white/10' : 'hover:bg-gray-200'
                      }`}
                    >
                      <X className={`w-4 h-4 ${d ? 'text-white/40' : 'text-gray-400'}`} />
                    </motion.button>
                  )}
                </div>
              </div>

              <div className={`flex items-center gap-1 p-1.5 rounded-2xl overflow-x-auto ${
                d ? 'bg-white/5' : 'bg-gray-50'
              }`}>
                {tabs.map((tab) => {
                  const count = tab.id === 'all'
                    ? rooms.length
                    : tab.id === 'active'
                      ? rooms.filter(r => r.isActive).length
                      : rooms.filter(r => !r.isActive).length;
                  return (
                    <motion.button
                      key={tab.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFilterActive(tab.id)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                        filterActive === tab.id
                          ? d
                            ? 'bg-slate-700 text-white shadow-lg'
                            : 'bg-white text-indigo-600 shadow-sm'
                          : d
                            ? 'text-white/40 hover:text-white/60'
                            : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                      <span className="ml-2 opacity-60">({count})</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          <AnimatePresence mode="popLayout">
            {filteredRooms.length === 0 ? (
              <EmptyState key="empty" onAdd={handleAdd} darkMode={darkMode} />
            ) : (
              <motion.div key="list" className="space-y-5">
                {filteredRooms.map((room, i) => (
                  <RoomCard
                    key={room._id}
                    room={room}
                    index={i}
                    onEdit={handleEdit}
                    onToggleActive={handleToggleActive}
                    onDelete={handleDelete}
                    darkMode={darkMode}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
