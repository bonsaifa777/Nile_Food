import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit, FiTrash2, FiX, FiEye, FiEyeOff, FiChevronDown, FiChevronUp } from 'react-icons/fi';

export default function Filters() {
  const [filterGroups, setFilterGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [saving, setSaving] = useState(false);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    order: 0,
    showInMenu: true,
    options: []
  });

  useEffect(() => {
    fetchFilterGroups();
  }, []);

  const fetchFilterGroups = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/filter-groups');
      setFilterGroups(data.data || []);
    } catch (error) {
      toast.error('Failed to load filter groups');
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
        options: formData.options.filter(opt => opt.name.trim())
      };
      
      if (editingGroup) {
        await axios.put(`/api/filter-groups/${editingGroup._id}`, payload);
        toast.success('Filter group updated');
      } else {
        await axios.post('/api/filter-groups', payload);
        toast.success('Filter group created');
      }
      
      setShowModal(false);
      setEditingGroup(null);
      setFormData({ name: '', description: '', order: 0, showInMenu: true, options: [] });
      fetchFilterGroups();
    } catch (error) {
      toast.error('Failed to save filter group');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this filter group?')) return;
    
    try {
      await axios.delete(`/api/filter-groups/${id}`);
      toast.success('Filter group deleted');
      fetchFilterGroups();
    } catch (error) {
      toast.error('Failed to delete filter group');
    }
  };

  const openEdit = (group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description || '',
      order: group.order || 0,
      showInMenu: group.showInMenu !== false,
      options: group.options?.length ? group.options.map(o => ({ name: o.name, order: o.order || 0 })) : []
    });
    setShowModal(true);
  };

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, { name: '', order: formData.options.length }] });
  };

  const updateOption = (index, field, value) => {
    const options = [...formData.options];
    options[index] = { ...options[index], [field]: value };
    setFormData({ ...formData, options });
  };

  const removeOption = (index) => {
    setFormData({ ...formData, options: formData.options.filter((_, i) => i !== index) });
  };

  const toggleExpanded = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Filters</h1>
          <p className="text-gray-500 mt-1">Manage filter groups and options for the menu page</p>
        </div>
        <button
          onClick={() => { setEditingGroup(null); setShowModal(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus size={20} /> Add Filter Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card animate-pulse">
              <div className="h-6 bg-gray-700 rounded w-3/4 mb-4" />
              <div className="h-4 bg-gray-700 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-700 rounded w-2/3" />
            </div>
          ))
        ) : filterGroups.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No filter groups found. Create your first filter group to display filters on the menu page.
          </div>
        ) : (
          filterGroups.map((group) => {
            const isExpanded = expandedIds.has(group._id);
            return (
              <motion.div
                key={group._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold flex items-center gap-2">
                      {group.name}
                      {!group.showInMenu && (
                        <span className="px-2 py-0.5 bg-gray-600 text-gray-300 text-[10px] font-semibold rounded-full">Hidden</span>
                      )}
                    </h3>
                    {group.description && (
                      <p className="text-sm text-gray-400 mt-1">{group.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <button
                      onClick={() => openEdit(group)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <FiEdit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(group._id)}
                      className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <span>{group.options?.length || 0} options</span>
                  <span>·</span>
                  <span>Order: {group.order || 0}</span>
                </div>

                {group.options?.length > 0 && (
                  <>
                    <button
                      onClick={() => toggleExpanded(group._id)}
                      className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      {isExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                      {isExpanded ? 'Hide options' : 'Show options'}
                    </button>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mt-2"
                        >
                          <div className="flex flex-wrap gap-1.5">
                            {group.options.map((opt, i) => (
                              <span key={i} className="px-2 py-1 bg-white/5 rounded-lg text-xs text-gray-300 border border-white/10">
                                {opt.name}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </motion.div>
            );
          })
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
              {editingGroup ? 'Edit Filter Group' : 'Add New Filter Group'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Group Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-glass"
                  placeholder="e.g. Cuisine, Spice Level, Dietary Preferences"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Description (optional)</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-glass"
                  placeholder="Brief description of this filter group"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="input-glass"
                    min="0"
                  />
                </div>

                <div className="flex items-end pb-2">
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
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm">Filter Options</label>
                  <button type="button" onClick={addOption} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
                    <FiPlus size={12} /> Add Option
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-2">Options are the selectable items within this filter group</p>
                {formData.options.map((opt, i) => (
                  <div key={i} className="flex gap-2 mb-2 items-center">
                    <input
                      type="text"
                      value={opt.name}
                      onChange={(e) => updateOption(i, 'name', e.target.value)}
                      className="input-glass flex-1"
                      placeholder="Option name (e.g. Italian)"
                    />
                    <button type="button" onClick={() => removeOption(i)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0">
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
                {formData.options.length === 0 && (
                  <p className="text-xs text-gray-500 italic">No options yet. Click "Add Option" to add filter choices.</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingGroup(null); }}
                  className="flex-1 btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingGroup ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
