import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiSearch, FiPlus, FiEdit, FiTrash2, FiStar, FiImage, FiUpload, FiLink, FiX, FiCheck, FiChevronDown, FiAlertTriangle, FiBarChart2, FiList } from 'react-icons/fi';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const INPUT_CLASS = "w-full rounded-xl px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300 backdrop-blur-sm outline-none";
const LABEL_CLASS = "block text-sm font-medium text-gray-300 mb-1.5";
const SELECT_CLASS = "w-full rounded-xl px-4 py-3 bg-white/5 border border-white/10 text-white focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300 backdrop-blur-sm outline-none appearance-none cursor-pointer";

export default function Menu() {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imgTab, setImgTab] = useState('url');
  const [imgPreview, setImgPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    featured: false,
    available: true,
    sizes: [],
    extras: [],
    ingredients: [],
    allergens: [],
    nutritionalInfo: {},
    spiceLevel: 'Medium',
    preparationTime: 20,
    calories: ''
  });

  const [activeDetailTab, setActiveDetailTab] = useState('extras');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [foodsRes, categoriesRes] = await Promise.all([
        axios.get('/api/foods?limit=100'),
        axios.get('/api/categories')
      ]);
      setFoods(foodsRes.data.data.foods || []);
      setCategories(categoriesRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        category: formData.category,
        calories: formData.calories ? Number(formData.calories) : undefined,
        preparationTime: Number(formData.preparationTime) || 20
      };

      if (editingFood) {
        await axios.put(`/api/foods/${editingFood._id}`, payload);
        toast.success('Food updated');
      } else {
        await axios.post('/api/foods', payload);
        toast.success('Food created');
      }

      setShowModal(false);
      setEditingFood(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
        featured: false,
        available: true,
        sizes: [],
        extras: [],
        ingredients: [],
        allergens: [],
        nutritionalInfo: {},
        spiceLevel: 'Medium',
        preparationTime: 20,
        calories: ''
      });
      setImgPreview(null);
      setImgTab('url');
      fetchData();
    } catch (error) {
      toast.error('Failed to save food');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this food?')) return;

    try {
      await axios.delete(`/api/foods/${id}`);
      toast.success('Food deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete food');
    }
  };

  const openEdit = (food) => {
    setEditingFood(food);
    setFormData({
      name: food.name,
      description: food.description,
      price: food.price,
      category: food.category?._id || food.category,
      image: food.image || '',
      featured: food.featured || false,
      available: food.available !== false,
      sizes: food.sizes || [],
      extras: food.extras || [],
      ingredients: food.ingredients || [],
      allergens: food.allergens || [],
      nutritionalInfo: food.nutritionalInfo || {},
      spiceLevel: food.spiceLevel || 'Medium',
      preparationTime: food.preparationTime || 20,
      calories: food.calories || ''
    });
    setImgPreview(food.image || null);
    setImgTab(food.image && !food.image.startsWith('data:') ? 'url' : 'upload');
    setShowModal(true);
  };

  const openCreate = () => {
    setEditingFood(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      featured: false,
      available: true,
      sizes: [],
      extras: [],
      ingredients: [],
      allergens: [],
      nutritionalInfo: {},
      spiceLevel: 'Medium',
      preparationTime: 20,
      calories: ''
    });
    setImgPreview(null);
    setImgTab('url');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingFood(null);
    setImgPreview(null);
    setImgTab('url');
    setActiveDetailTab('extras');
  };

  const handleFileSelect = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setImgPreview(dataUrl);
      setFormData(prev => ({ ...prev, image: dataUrl }));
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const filteredFoods = foods.filter(food => {
    if (!search) return true;
    return food.name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Menu</h1>
          <p className="text-gray-500 mt-1">Manage your food items</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openCreate}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus size={20} /> Add Food
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search foods..."
          className="input-glass pl-10"
        />
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card animate-pulse">
              <div className="h-32 bg-gray-700 rounded-lg mb-4" />
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-700 rounded w-1/2" />
            </div>
          ))
        ) : filteredFoods.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No foods found
          </div>
        ) : (
          filteredFoods.map((food) => (
            <motion.div
              key={food._id}
              variants={itemVariants}
              layout
              className="glass-card group relative overflow-hidden"
            >
              <div className="relative mb-4">
                <img
                  src={food.image || 'https://placehold.co/300x200/e2e8f0/64748b?text=No+Image'}
                  alt={food.name}
                  className="w-full h-32 object-cover rounded-lg"
                  onError={(e) => { e.target.src = 'https://placehold.co/300x200/e2e8f0/64748b?text=No+Image'; }}
                />
                {food.featured && (
                  <div className="absolute top-2 right-2 bg-primary-600 px-2 py-1 rounded-full text-xs flex items-center gap-1 shadow-lg">
                    <FiStar size={12} /> Featured
                  </div>
                )}
                {!food.available && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg backdrop-blur-sm">
                    <span className="text-red-400 font-semibold text-sm">Unavailable</span>
                  </div>
                )}
              </div>

              <h3 className="font-semibold mb-1">{food.name}</h3>
              <p className="text-sm text-gray-400 mb-2 line-clamp-2">{food.description}</p>

              <div className="flex flex-wrap gap-1.5 mb-2">
                {food.extras?.length > 0 && (
                  <span className="px-2 py-0.5 bg-primary-500/10 text-primary-300 rounded-md text-[10px] font-semibold border border-primary-500/20">
                    {food.extras.length} extras
                  </span>
                )}
                {food.ingredients?.length > 0 && (
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 rounded-md text-[10px] font-semibold border border-emerald-500/20">
                    {food.ingredients.length} ingredients
                  </span>
                )}
                {food.allergens?.length > 0 && (
                  <span className="px-2 py-0.5 bg-red-500/10 text-red-300 rounded-md text-[10px] font-semibold border border-red-500/20">
                    {food.allergens.length} allergens
                  </span>
                )}
                {food.sizes?.length > 0 && (
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-300 rounded-md text-[10px] font-semibold border border-amber-500/20">
                    {food.sizes.length} sizes
                  </span>
                )}
                {food.nutritionalInfo && food.nutritionalInfo.calories && (
                  <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-300 rounded-md text-[10px] font-semibold border border-cyan-500/20">
                    {food.nutritionalInfo.calories} kcal
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between mt-3">
                <span className="text-primary-400 font-bold text-lg">ETB {food.price}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => openEdit(food)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <FiEdit size={18} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(food._id)}
                    className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                  >
                    <FiTrash2 size={18} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-gradient-to-b from-slate-800/90 to-slate-900/90 backdrop-blur-2xl shadow-2xl"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between p-6 pb-4 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
                >
                  {editingFood ? 'Edit Food' : 'Add New Food'}
                </motion.h2>
                <motion.button
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeModal}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <FiX size={18} />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Name & Price row */}
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div>
                    <label className={LABEL_CLASS}>Food Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={INPUT_CLASS}
                      placeholder="e.g. Pepperoni Pizza"
                      required
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Price (ETB)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className={INPUT_CLASS}
                      placeholder="e.g. 350"
                      required
                    />
                  </div>
                </motion.div>

                {/* Description */}
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <label className={LABEL_CLASS}>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={INPUT_CLASS}
                    rows={3}
                    placeholder="Describe the food item..."
                    required
                  />
                </motion.div>

                {/* Category + Image Tab */}
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  <div>
                    <label className={LABEL_CLASS}>Category</label>
                    <div className="relative">
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className={SELECT_CLASS}
                        required
                      >
                        <option value="" className="bg-slate-800">Select category</option>
                        {categories.map(cat => (
                          <option key={cat._id} value={cat._id} className="bg-slate-800">{cat.name}</option>
                        ))}
                      </select>
                      <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Preparation Time (min)</label>
                    <input
                      type="number"
                      value={formData.preparationTime || ''}
                      onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                      className={INPUT_CLASS}
                      placeholder="e.g. 20"
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Spice Level</label>
                    <div className="relative">
                      <select
                        value={formData.spiceLevel}
                        onChange={(e) => setFormData({ ...formData, spiceLevel: e.target.value })}
                        className={SELECT_CLASS}
                      >
                        {['Not Spicy', 'Mild', 'Medium', 'Hot', 'Extra Hot'].map(s => (
                          <option key={s} value={s} className="bg-slate-800">{s}</option>
                        ))}
                      </select>
                      <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Calories</label>
                    <input
                      type="number"
                      value={formData.calories || ''}
                      onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                      className={INPUT_CLASS}
                      placeholder="e.g. 350"
                    />
                  </div>
                </motion.div>

                {/* Image Section */}
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <label className={LABEL_CLASS}>Food Image</label>
                  <div className="flex gap-2 mb-3">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setImgTab('url')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        imgTab === 'url'
                          ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                          : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <FiLink size={14} /> URL
                    </motion.button>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setImgTab('upload')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        imgTab === 'upload'
                          ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                          : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <FiUpload size={14} /> Upload
                    </motion.button>
                  </div>

                  <AnimatePresence mode="wait">
                    {imgTab === 'url' ? (
                      <motion.div
                        key="url"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <input
                          type="url"
                          value={formData.image}
                          onChange={(e) => {
                            setFormData({ ...formData, image: e.target.value });
                            setImgPreview(e.target.value || null);
                          }}
                          placeholder="https://images.unsplash.com/photo-..."
                          className={INPUT_CLASS}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="upload"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div
                          onDrop={handleDrop}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onClick={() => fileInputRef.current?.click()}
                          className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-300 ${
                            dragOver
                              ? 'border-primary-500 bg-primary-500/10 scale-[1.02]'
                              : 'border-white/10 hover:border-primary-500/50 hover:bg-white/5'
                          }`}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileSelect(e.target.files[0])}
                          />
                          <FiUpload size={32} className="text-gray-500 mb-3" />
                          <p className="text-sm text-gray-400">
                            <span className="text-primary-400 font-medium">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP up to 5MB</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Image Preview */}
                  <AnimatePresence>
                    {imgPreview && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 relative rounded-xl overflow-hidden group"
                      >
                        <img
                          src={imgPreview}
                          alt="Preview"
                          className="w-full h-40 object-cover rounded-xl"
                          onError={() => setImgPreview(null)}
                        />
                        <motion.button
                          type="button"
                          initial={{ opacity: 0 }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setImgPreview(null);
                            setFormData(prev => ({ ...prev, image: '' }));
                          }}
                          className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FiX size={14} />
                        </motion.button>
                        <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-xs text-green-400 flex items-center gap-1">
                          <FiCheck size={12} /> Image ready
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Status toggles */}
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-wrap gap-6 pt-2"
                >
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`w-10 h-6 rounded-full transition-colors duration-300 ${formData.featured ? 'bg-primary-600' : 'bg-white/10'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 mt-1 ${formData.featured ? 'translate-x-5' : 'translate-x-1'}`} />
                      </div>
                    </div>
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors flex items-center gap-1.5">
                      <FiStar size={14} className="text-amber-400" /> Featured
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={formData.available}
                        onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                        className="sr-only"
                      />
                      <div className={`w-10 h-6 rounded-full transition-colors duration-300 ${formData.available ? 'bg-green-600' : 'bg-white/10'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 mt-1 ${formData.available ? 'translate-x-5' : 'translate-x-1'}`} />
                      </div>
                    </div>
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                      Available
                    </span>
                  </label>
                </motion.div>

                {/* Detail Fields Tabs */}
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="flex gap-2 mb-4 overflow-x-auto">
                    {[
                      { id: 'extras', label: 'Sizes & Extras', icon: FiPlus },
                      { id: 'ingredients', label: 'Ingredients', icon: FiList },
                      { id: 'allergens', label: 'Allergens', icon: FiAlertTriangle },
                      { id: 'nutrition', label: 'Nutrition', icon: FiBarChart2 },
                    ].map(tab => (
                      <motion.button
                        key={tab.id}
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveDetailTab(tab.id)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                          activeDetailTab === tab.id
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                            : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <tab.icon size={14} /> {tab.label}
                      </motion.button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {activeDetailTab === 'extras' && (
                      <motion.div key="extras" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                        <div>
                          <label className={LABEL_CLASS}>Sizes (name + price)</label>
                          {formData.sizes.map((size, i) => (
                            <div key={i} className="flex gap-2 mb-2">
                              <input
                                type="text"
                                value={size.name}
                                onChange={(e) => {
                                  const sizes = [...formData.sizes];
                                  sizes[i].name = e.target.value;
                                  setFormData({ ...formData, sizes });
                                }}
                                className={INPUT_CLASS}
                                placeholder="Size name"
                              />
                              <input
                                type="number"
                                value={size.price}
                                onChange={(e) => {
                                  const sizes = [...formData.sizes];
                                  sizes[i].price = Number(e.target.value);
                                  setFormData({ ...formData, sizes });
                                }}
                                className={`${INPUT_CLASS} w-28`}
                                placeholder="Price"
                              />
                              <motion.button
                                type="button"
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setFormData({ ...formData, sizes: formData.sizes.filter((_, j) => j !== i) })}
                                className="p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                              >
                                <FiX size={16} />
                              </motion.button>
                            </div>
                          ))}
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFormData({ ...formData, sizes: [...formData.sizes, { name: '', price: 0 }] })}
                            className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
                          >
                            <FiPlus size={14} /> Add Size
                          </motion.button>
                        </div>
                        <div className="pt-2 border-t border-white/5">
                          <label className={LABEL_CLASS}>Extras (name + price + image)</label>
                          {formData.extras.map((extra, i) => (
                            <div key={i} className="flex gap-2 mb-2 items-start">
                              <input
                                type="text"
                                value={extra.name}
                                onChange={(e) => {
                                  const extras = [...formData.extras];
                                  extras[i].name = e.target.value;
                                  setFormData({ ...formData, extras });
                                }}
                                className={INPUT_CLASS}
                                placeholder="Extra name"
                              />
                              <input
                                type="number"
                                value={extra.price}
                                onChange={(e) => {
                                  const extras = [...formData.extras];
                                  extras[i].price = Number(e.target.value);
                                  setFormData({ ...formData, extras });
                                }}
                                className={`${INPUT_CLASS} w-24`}
                                placeholder="Price"
                              />
                              <div className="flex gap-1 items-center">
                                <input
                                  type="text"
                                  value={extra.image || ''}
                                  onChange={(e) => {
                                    const extras = [...formData.extras];
                                    extras[i].image = e.target.value;
                                    setFormData({ ...formData, extras });
                                  }}
                                  className={`${INPUT_CLASS} w-28`}
                                  placeholder="Image URL"
                                />
                                <label className="cursor-pointer p-2 hover:bg-white/10 rounded-lg transition-colors">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      if (!file.type.startsWith('image/')) {
                                        toast.error('Please select an image file');
                                        return;
                                      }
                                      const reader = new FileReader();
                                      reader.onload = (ev) => {
                                        const extras = [...formData.extras];
                                        extras[i].image = ev.target.result;
                                        setFormData({ ...formData, extras });
                                      };
                                      reader.readAsDataURL(file);
                                    }}
                                  />
                                  <FiUpload size={14} className="text-gray-400 hover:text-white" />
                                </label>
                                {extra.image && (
                                  <div className="relative group/image">
                                    <img
                                      src={extra.image}
                                      alt=""
                                      className="w-8 h-8 rounded-lg object-cover border border-white/10"
                                      onError={() => {
                                        const extras = [...formData.extras];
                                        extras[i].image = '';
                                        setFormData({ ...formData, extras });
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const extras = [...formData.extras];
                                        extras[i].image = '';
                                        setFormData({ ...formData, extras });
                                      }}
                                      className="absolute -top-1 -right-1 w-3.5 h-3.5 flex items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover/image:opacity-100 transition-opacity"
                                      style={{ fontSize: 8 }}
                                    >
                                      <FiX size={8} />
                                    </button>
                                  </div>
                                )}
                              </div>
                              <motion.button
                                type="button"
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setFormData({ ...formData, extras: formData.extras.filter((_, j) => j !== i) })}
                                className="p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                              >
                                <FiX size={16} />
                              </motion.button>
                            </div>
                          ))}
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFormData({ ...formData, extras: [...formData.extras, { name: '', price: 0, image: '' }] })}
                            className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
                          >
                            <FiPlus size={14} /> Add Extra
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

                    {activeDetailTab === 'ingredients' && (
                      <motion.div key="ingredients" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <label className={LABEL_CLASS}>Ingredients (name + amount + image)</label>
                        {formData.ingredients.map((ing, i) => (
                          <div key={i} className="flex gap-2 mb-2 items-start">
                            <input
                              type="text"
                              value={ing.name}
                              onChange={(e) => {
                                const ingredients = [...formData.ingredients];
                                ingredients[i].name = e.target.value;
                                setFormData({ ...formData, ingredients });
                              }}
                              className={INPUT_CLASS}
                              placeholder="Name"
                            />
                            <input
                              type="text"
                              value={ing.amount || ''}
                              onChange={(e) => {
                                const ingredients = [...formData.ingredients];
                                ingredients[i].amount = e.target.value;
                                setFormData({ ...formData, ingredients });
                              }}
                              className={`${INPUT_CLASS} w-24`}
                              placeholder="Amount"
                            />
                            <div className="flex gap-1 items-center">
                              <input
                                type="text"
                                value={ing.image || ''}
                                onChange={(e) => {
                                  const ingredients = [...formData.ingredients];
                                  ingredients[i].image = e.target.value;
                                  setFormData({ ...formData, ingredients });
                                }}
                                className={`${INPUT_CLASS} w-28`}
                                placeholder="Image URL"
                              />
                              <label className="cursor-pointer p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    if (!file.type.startsWith('image/')) {
                                      toast.error('Please select an image file');
                                      return;
                                    }
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                      const ingredients = [...formData.ingredients];
                                      ingredients[i].image = ev.target.result;
                                      setFormData({ ...formData, ingredients });
                                    };
                                    reader.readAsDataURL(file);
                                  }}
                                />
                                <FiUpload size={14} className="text-gray-400 hover:text-white" />
                              </label>
                              {ing.image && (
                                <div className="relative group/image">
                                  <img
                                    src={ing.image}
                                    alt=""
                                    className="w-8 h-8 rounded-lg object-cover border border-white/10"
                                    onError={() => {
                                      const ingredients = [...formData.ingredients];
                                      ingredients[i].image = '';
                                      setFormData({ ...formData, ingredients });
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const ingredients = [...formData.ingredients];
                                      ingredients[i].image = '';
                                      setFormData({ ...formData, ingredients });
                                    }}
                                    className="absolute -top-1 -right-1 w-3.5 h-3.5 flex items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover/image:opacity-100 transition-opacity"
                                    style={{ fontSize: 8 }}
                                  >
                                    <FiX size={8} />
                                  </button>
                                </div>
                              )}
                            </div>
                            <motion.button
                              type="button"
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setFormData({ ...formData, ingredients: formData.ingredients.filter((_, j) => j !== i) })}
                              className="p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                            >
                              <FiX size={16} />
                            </motion.button>
                          </div>
                        ))}
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setFormData({ ...formData, ingredients: [...formData.ingredients, { name: '', amount: '', image: '' }] })}
                          className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
                        >
                          <FiPlus size={14} /> Add Ingredient
                        </motion.button>
                      </motion.div>
                    )}

                    {activeDetailTab === 'allergens' && (
                      <motion.div key="allergens" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <label className={LABEL_CLASS}>Allergens</label>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {['Dairy', 'Gluten', 'Eggs', 'Fish', 'Shellfish', 'Nuts', 'Peanuts', 'Soy', 'Sesame'].map(a => {
                            const has = formData.allergens.includes(a);
                            return (
                              <motion.button
                                key={a}
                                type="button"
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  const allergens = has
                                    ? formData.allergens.filter(x => x !== a)
                                    : [...formData.allergens, a];
                                  setFormData({ ...formData, allergens });
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                  has
                                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                                }`}
                              >
                                {a}
                              </motion.button>
                            );
                          })}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Custom allergen"
                            className={INPUT_CLASS}
                            id="customAllergen"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const val = e.target.value.trim();
                                if (val && !formData.allergens.includes(val)) {
                                  setFormData({ ...formData, allergens: [...formData.allergens, val] });
                                }
                                e.target.value = '';
                              }
                            }}
                          />
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              const input = document.getElementById('customAllergen');
                              const val = input.value.trim();
                              if (val && !formData.allergens.includes(val)) {
                                setFormData({ ...formData, allergens: [...formData.allergens, val] });
                              }
                              input.value = '';
                            }}
                            className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold"
                          >
                            Add
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

                    {activeDetailTab === 'nutrition' && (
                      <motion.div key="nutrition" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <label className={LABEL_CLASS}>Nutritional Information</label>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { key: 'servingSize', label: 'Serving Size' },
                            { key: 'calories', label: 'Calories' },
                            { key: 'totalFat', label: 'Total Fat' },
                            { key: 'saturatedFat', label: 'Saturated Fat' },
                            { key: 'transFat', label: 'Trans Fat' },
                            { key: 'cholesterol', label: 'Cholesterol' },
                            { key: 'sodium', label: 'Sodium' },
                            { key: 'totalCarbohydrates', label: 'Total Carbs' },
                            { key: 'dietaryFiber', label: 'Fiber' },
                            { key: 'sugars', label: 'Sugars' },
                            { key: 'protein', label: 'Protein' },
                          ].map(field => (
                            <div key={field.key}>
                              <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wider">{field.label}</label>
                              <input
                                type="text"
                                value={formData.nutritionalInfo[field.key] || ''}
                                onChange={(e) => setFormData({ ...formData, nutritionalInfo: { ...formData.nutritionalInfo, [field.key]: e.target.value } })}
                                className={INPUT_CLASS}
                                placeholder="—"
                              />
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Buttons */}
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex gap-3 pt-4 border-t border-white/10"
                >
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={closeModal}
                    className="flex-1 btn-ghost py-3"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={saving}
                    className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Saving...
                      </span>
                    ) : editingFood ? 'Update Food' : 'Create Food'}
                  </motion.button>
                </motion.div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
