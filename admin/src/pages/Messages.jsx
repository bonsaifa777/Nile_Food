import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiMail, FiUser, FiMessageSquare, FiTrash2, FiRefreshCw,
  FiEye, FiEyeOff, FiClock, FiSend, FiPlus, FiEdit2,
  FiSave, FiX, FiSearch, FiCheck, FiChevronLeft
} from 'react-icons/fi';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const INPUT_CLASS = "w-full rounded-xl px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all duration-300 outline-none";
const LABEL_CLASS = "block text-sm font-medium text-gray-300 mb-1.5";

function ComposeModal({ onClose, onSent }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', userId: '' });
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (!search.trim()) { setUsers([]); return; }
    const timer = setTimeout(async () => {
      setLoadingUsers(true);
      try {
        const res = await axios.get(`/api/users?search=${encodeURIComponent(search)}&limit=10`);
        setUsers(res.data.data?.users || []);
        setShowDropdown(true);
      } catch { } finally { setLoadingUsers(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const selectUser = (u) => {
    setForm({ ...form, name: u.name, email: u.email, userId: u._id });
    setSearch('');
    setUsers([]);
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error('All fields are required');
      return;
    }
    setSending(true);
    try {
      await axios.post('/api/contact', form);
      toast.success('Message sent');
      onSent();
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-gradient-to-b from-slate-800/90 to-slate-900/90 backdrop-blur-2xl shadow-2xl"
      >
        <div className="flex items-center justify-between p-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <FiSend className="text-white" size={16} />
            </div>
            <h2 className="text-xl font-bold text-white">New Message</h2>
          </div>
          <motion.button
            whileHover={{ rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <FiX size={18} />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="relative">
            <label className={LABEL_CLASS}>Recipient</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="text"
                ref={searchRef}
                value={search}
                onChange={(e) => { setSearch(e.target.value); if (!e.target.value) setForm({ ...form, name: '', email: '', userId: '' }); }}
                onFocus={() => users.length > 0 && setShowDropdown(true)}
                className={INPUT_CLASS + ' pl-10'}
                placeholder="Search for a customer..."
              />
            </div>
            {form.userId && (
              <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm">
                <FiCheck size={14} /> {form.name} ({form.email})
              </div>
            )}
            {showDropdown && users.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-20 mt-1 w-full rounded-xl border border-white/10 bg-slate-800 shadow-2xl overflow-hidden"
              >
                {users.map((u) => (
                  <button
                    key={u._id}
                    type="button"
                    onClick={() => selectUser(u)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS}>Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, userId: '' })}
                className={INPUT_CLASS} placeholder="Recipient name" required />
            </div>
            <div>
              <label className={LABEL_CLASS}>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value, userId: '' })}
                className={INPUT_CLASS} placeholder="recipient@email.com" required />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS}>Subject</label>
            <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className={INPUT_CLASS} placeholder="Message subject" required />
          </div>
          <div>
            <label className={LABEL_CLASS}>Message</label>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
              className={INPUT_CLASS} rows={5} placeholder="Write your message..." required />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 font-medium transition-all text-sm">
              Cancel
            </button>
            <button type="submit" disabled={sending}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold shadow-lg shadow-primary-500/25 hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
              {sending && (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </span>
              )}
              {!sending && (
                <span className="flex items-center gap-2">
                  <FiSend size={16} /> Send Message
                </span>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editSubject, setEditSubject] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [showCompose, setShowCompose] = useState(false);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/contact');
      setMessages(res.data.data || []);
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const toggleRead = async (id, currentRead) => {
    try {
      await axios.put(`/api/contact/${id}`, { read: !currentRead });
      setMessages(prev => prev.map(m => m._id === id ? { ...m, read: !currentRead } : m));
      if (selected?._id === id) setSelected(prev => ({ ...prev, read: !currentRead }));
    } catch {
      toast.error('Failed to update message');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this message?')) return;
    try {
      await axios.delete(`/api/contact/${id}`);
      toast.success('Message deleted');
      if (selected?._id === id) setSelected(null);
      setMessages(prev => prev.filter(m => m._id !== id));
    } catch {
      toast.error('Failed to delete');
    }
  };

  const startEdit = () => {
    setEditSubject(selected.subject);
    setEditMessage(selected.message);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditSubject('');
    setEditMessage('');
  };

  const saveEdit = async () => {
    if (!editSubject.trim() || !editMessage.trim()) {
      toast.error('Subject and message cannot be empty');
      return;
    }
    setSaving(true);
    try {
      const res = await axios.put(`/api/contact/${selected._id}`, {
        subject: editSubject,
        message: editMessage,
      });
      const updated = res.data.data;
      setMessages(prev => prev.map(m => m._id === updated._id ? updated : m));
      setSelected(updated);
      setEditing(false);
      toast.success('Message updated');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const selectMessage = (msg) => {
    setEditing(false);
    if (selected?._id === msg._id) {
      setSelected(null);
      return;
    }
    setSelected(msg);
    if (!msg.read) toggleRead(msg._id, false);
  };

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Messages
          </h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            {unreadCount > 0 ? (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/15 text-primary-400 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                {unreadCount} unread
              </motion.span>
            ) : 'All messages read'}
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setShowCompose(true)}
            className="btn-primary flex items-center gap-2">
            <FiPlus size={18} /> Compose
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={fetchMessages} className="btn-ghost flex items-center gap-2 px-4 py-2 text-sm">
            <FiRefreshCw size={14} /> Refresh
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-2">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
            ))
          ) : messages.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 text-gray-500">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                <FiMail className="text-3xl text-gray-500" />
              </motion.div>
              <p className="text-lg font-medium">No messages yet</p>
              <p className="text-sm mt-1 text-gray-400">Contact form submissions will appear here</p>
            </motion.div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-2">
              {messages.map((msg, i) => (
                <motion.div
                  key={msg._id}
                  variants={itemVariants}
                  layout
                  onClick={() => selectMessage(msg)}
                  className={`relative rounded-2xl p-4 cursor-pointer transition-all duration-200 group ${
                    selected?._id === msg._id
                      ? 'bg-primary-600/10 ring-1 ring-primary-500/40 shadow-lg shadow-primary-500/5'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      !msg.read ? 'bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/20' : 'bg-white/10'
                    }`}>
                      <FiUser className={!msg.read ? 'text-white' : 'text-gray-500'} size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <h3 className={`text-sm truncate ${!msg.read ? 'font-bold text-white' : 'font-medium text-gray-300'}`}>
                            {msg.name}
                          </h3>
                          {!msg.read && (
                            <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />
                          )}
                        </div>
                        <span className="text-[11px] text-gray-500 shrink-0 flex items-center gap-1">
                          <FiClock size={10} />
                          {new Date(msg.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate mb-1">{msg.subject}</p>
                      <p className="text-xs text-gray-500 truncate">{msg.email}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden"
              >
                <div className="p-5 border-b border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-white">Message Details</h2>
                    <div className="flex gap-1">
                      {editing ? (
                        <>
                          <motion.button whileTap={{ scale: 0.9 }}
                            onClick={cancelEdit}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Cancel">
                            <FiX size={15} className="text-gray-400" />
                          </motion.button>
                          <motion.button whileTap={{ scale: 0.9 }}
                            onClick={saveEdit} disabled={saving}
                            className="p-2 hover:bg-emerald-500/20 rounded-lg transition-colors" title="Save">
                            {saving ? (
                              <svg className="animate-spin h-4 w-4 text-emerald-400" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            ) : <FiSave size={15} className="text-emerald-400" />}
                          </motion.button>
                        </>
                      ) : (
                        <>
                          <motion.button whileTap={{ scale: 0.9 }}
                            onClick={startEdit}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Edit">
                            <FiEdit2 size={15} className="text-gray-400" />
                          </motion.button>
                          <motion.button whileTap={{ scale: 0.9 }}
                            onClick={() => toggleRead(selected._id, selected.read)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title={selected.read ? 'Mark as unread' : 'Mark as read'}>
                            {selected.read ? <FiEyeOff size={15} className="text-gray-400" /> : <FiEye size={15} className="text-primary-400" />}
                          </motion.button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                      <FiUser className="text-white" size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{selected.name}</p>
                      <a href={`mailto:${selected.email}`} className="text-xs text-primary-400 hover:underline">{selected.email}</a>
                      {selected.user?.name && (
                        <p className="text-[10px] text-emerald-400 mt-0.5">Linked account: {selected.user.name}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-3">
                    <FiClock size={11} />
                    {new Date(selected.createdAt).toLocaleString()}
                    {selected.read && (
                      <span className="flex items-center gap-1 ml-2 text-emerald-400">
                        <FiCheck size={11} /> Read
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <label className={LABEL_CLASS}>Subject</label>
                    {editing ? (
                      <input type="text" value={editSubject}
                        onChange={(e) => setEditSubject(e.target.value)}
                        className={INPUT_CLASS} />
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-white font-medium bg-white/5 rounded-xl px-4 py-3">
                        <FiMessageSquare size={14} className="text-gray-500 shrink-0" />
                        {selected.subject}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className={LABEL_CLASS}>Message</label>
                    {editing ? (
                      <textarea value={editMessage}
                        onChange={(e) => setEditMessage(e.target.value)}
                        className={INPUT_CLASS} rows={6} />
                    ) : (
                      <div className="text-sm text-gray-300 bg-white/5 rounded-xl p-4">
                        <p className="whitespace-pre-wrap leading-relaxed">{selected.message}</p>
                      </div>
                    )}
                  </div>

                  {!editing && (
                    <div className="flex gap-2 pt-2">
                      <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white shadow-lg shadow-primary-500/20 transition-all">
                        <FiSend size={14} /> Reply via Email
                      </a>
                      <motion.button whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(selected._id)}
                        className="px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
                        <FiTrash2 size={16} />
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/5 rounded-2xl border border-white/10 p-10 text-center h-full flex flex-col items-center justify-center"
              >
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                  <FiMail className="text-3xl text-gray-500" />
                </motion.div>
                <p className="text-gray-400 text-sm">Select a message to read</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showCompose && (
          <ComposeModal
            onClose={() => setShowCompose(false)}
            onSent={() => { setShowCompose(false); fetchMessages(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}