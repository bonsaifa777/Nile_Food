import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2, FiImage, FiX, FiEye, FiEyeOff } from 'react-icons/fi';

const EMOJI_LIST = ['🍽️', '🍟', '🍔', '🍕', '🍗', '🥘', '🍰', '🥤', '🥗', '🌅', '☀️', '🌙', '🌱', '🦐', '🔥', '⭐', '🧃', '🍿', '🥩', '🍜', '🥟', '🫓', '🧁', '☕', '🧋'];

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6366f1',
    image: '',
    icon: '🍽️',
    subcategories: [],
    showInMenu: true,
    filterTags: []
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/categories');
      setCategories(data.data || []);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (editingCategory) {
        await axios.put(`/api/categories/${editingCategory._id}`, formData);
        toast.success('Category updated');
      } else {
        await axios.post('/api/categories', formData);
        toast.success('Category created');
      }
      
      setShowModal(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '', color: '#6366f1', image: '', icon: '🍽️', subcategories: [], showInMenu: true, filterTags: [] });
      fetchCategories();
    } catch (error) {
      toast.error('Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await axios.delete(`/api/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const openEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#6366f1',
      image: category.image || '',
      icon: category.icon || '🍽️',
      subcategories: category.subcategories || [],
      showInMenu: category.showInMenu !== false,
      filterTags: category.filterTags || []
    });
    setShowModal(true);
  };

  const addSubcategory = () => {
    setFormData({ ...formData, subcategories: [...formData.subcategories, ''] });
  };

  const updateSubcategory = (index, value) => {
    const subs = [...formData.subcategories];
    subs[index] = value;
    setFormData({ ...formData, subcategories: subs });
  };

  const removeSubcategory = (index) => {
    setFormData({ ...formData, subcategories: formData.subcategories.filter((_, i) => i !== index) });
  };

  const addFilterTag = () => {
    setFormData({ ...formData, filterTags: [...formData.filterTags, ''] });
  };

  const updateFilterTag = (index, value) => {
    const tags = [...formData.filterTags];
    tags[index] = value;
    setFormData({ ...formData, filterTags: tags });
  };

  const removeFilterTag = (index) => {
    setFormData({ ...formData, filterTags: formData.filterTags.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Categories</h1>
          <p className="text-gray-500 mt-1">Manage food categories</p>
        </div>
        <button
          onClick={() => { setEditingCategory(null); setShowModal(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus size={20} /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card animate-pulse">
              <div className="h-20 bg-gray-700 rounded-lg mb-4" />
              <div className="h-4 bg-gray-700 rounded w-3/4" />
            </div>
          ))
        ) : categories.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No categories found
          </div>
        ) : (
          categories.map((category) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card group relative"
            >
              <div 
                className="w-full h-20 rounded-lg mb-4 flex items-center justify-center text-3xl relative overflow-hidden"
                style={{ background: category.color || '#6366f1' }}
              >
                {category.image ? (
                  <img src={category.image} alt={category.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <span>{category.icon || '🍽️'}</span>
                )}
                {!category.showInMenu && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                    <span className="text-xs font-semibold text-gray-300 bg-black/60 px-2 py-1 rounded-full">Hidden</span>
                  </div>
                )}
              </div>

              <h3 className="font-semibold mb-1 flex items-center gap-2">
                {category.icon && <span>{category.icon}</span>}
                {category.name}
              </h3>
              <p className="text-sm text-gray-400 line-clamp-2">{category.description}</p>
              {category.subcategories?.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">{category.subcategories.length} subcategories</p>
              )}
              
              <div className="flex gap-1 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(category)}
                  className="flex-1 p-2 hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <FiEdit size={16} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(category._id)}
                  className="flex-1 p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <FiTrash2 size={16} /> Delete
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-glass"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-glass"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Color</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="input-glass h-12"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Icon (Emoji)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="input-glass text-2xl"
                      placeholder="🍽️"
                    />
                    <div className="flex flex-wrap gap-1 mt-2">
                      {EMOJI_LIST.map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon: emoji })}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg text-lg transition-all ${
                            formData.icon === emoji ? 'bg-primary-600 ring-2 ring-primary-400' : 'bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1">Image URL (optional)</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                  className="input-glass"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => setFormData({ ...formData, showInMenu: !formData.showInMenu })}
                    className={`relative w-10 h-6 rounded-full transition-colors cursor-pointer ${formData.showInMenu ? 'bg-green-600' : 'bg-white/10'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 mt-1 ${formData.showInMenu ? 'translate-x-5' : 'translate-x-1'}`} />
                  </div>
                  <span className="text-sm text-gray-300 flex items-center gap-1">
                    {formData.showInMenu ? <FiEye size={14} /> : <FiEyeOff size={14} />}
                    Show in Menu
                  </span>
                </label>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm">Subcategories</label>
                  <button type="button" onClick={addSubcategory} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
                    <FiPlus size={12} /> Add
                  </button>
                </div>
                {formData.subcategories.map((sub, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={sub}
                      onChange={(e) => updateSubcategory(i, e.target.value)}
                      className="input-glass flex-1"
                      placeholder="Subcategory name"
                    />
                    <button type="button" onClick={() => removeSubcategory(i)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm">Filter Tags</label>
                  <button type="button" onClick={addFilterTag} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
                    <FiPlus size={12} /> Add
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-2">Tags help match food items to this category on the frontend</p>
                {formData.filterTags.map((tag, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => updateFilterTag(i, e.target.value)}
                      className="input-glass flex-1"
                      placeholder="e.g. fast-food, burger"
                    />
                    <button type="button" onClick={() => removeFilterTag(i)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingCategory(null); }}
                  className="flex-1 btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
