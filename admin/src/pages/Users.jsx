import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { RiAdminLine, RiUserLine, RiVipDiamondLine } from 'react-icons/ri';
import { FiSearch, FiEdit, FiTrash2, FiShield } from 'react-icons/fi';

const roleColors = {
  customer: 'text-blue-500 bg-blue-500/20',
  admin: 'text-purple-500 bg-purple-500/20',
  super_admin: 'text-yellow-500 bg-yellow-500/20'
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/admin/users');
      setUsers(data.data?.users || []);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId, role) => {
    setUpdating(true);
    try {
      await axios.put(`/api/admin/users/${userId}/role`, { role });
      toast.success('User role updated');
      fetchUsers();
      setSelectedUser(null);
    } catch (error) {
      toast.error('Failed to update role');
    } finally {
      setUpdating(false);
    }
  };

  const filteredUsers = users.filter(user => {
    if (!search && !filter) return true;
    const matchesSearch = !search || 
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = !filter || user.role === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Users</h1>
          <p className="text-gray-500 mt-1">Manage registered users</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="input-glass pl-10"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-glass"
        >
          <option value="">All Roles</option>
          <option value="customer">Customer</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['User', 'Email', 'Phone', 'Role', 'Loyalty Points', 'Joined', 'Actions'].map((header) => (
                  <th key={header} className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">No users found</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    className="hover:bg-white/[0.02] transition-colors cursor-pointer">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-semibold text-sm"
                          style={{
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))',
                            border: '1px solid rgba(99,102,241,0.15)',
                          }}
                        >
                          {user.name?.charAt(0) || 'U'}
                        </div>
                        <span className="font-medium text-sm">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-400">{user.email}</td>
                    <td className="py-4 px-4 text-sm text-gray-400">{user.phone || '-'}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium capitalize ${roleColors[user.role]}`}>
                        {user.role?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm">{user.loyaltyPoints || 0}</td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <FiEdit size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Edit User Role</h2>
              <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-700 rounded-lg">
                ×
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-2xl font-bold">
                {selectedUser.name?.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold">{selectedUser.name}</h3>
                <p className="text-sm text-gray-400">{selectedUser.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-400 mb-2">Select Role</p>
              <button
                onClick={() => updateRole(selectedUser._id, 'customer')}
                disabled={updating}
                className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${
                  selectedUser.role === 'customer' 
                    ? 'bg-blue-500/20 border border-blue-500' 
                    : 'bg-gray-700 hover:bg-gray-600'
                } disabled:opacity-50`}
              >
                <RiUserLine size={20} />
                <div className="text-left">
                  <p className="font-medium">Customer</p>
                  <p className="text-xs text-gray-400">Regular user access</p>
                </div>
              </button>

              <button
                onClick={() => updateRole(selectedUser._id, 'admin')}
                disabled={updating}
                className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${
                  selectedUser.role === 'admin' 
                    ? 'bg-purple-500/20 border border-purple-500' 
                    : 'bg-gray-700 hover:bg-gray-600'
                } disabled:opacity-50`}
              >
                <RiAdminLine size={20} />
                <div className="text-left">
                  <p className="font-medium">Admin</p>
                  <p className="text-xs text-gray-400">Dashboard & menu management</p>
                </div>
              </button>

              <button
                onClick={() => updateRole(selectedUser._id, 'super_admin')}
                disabled={updating}
                className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${
                  selectedUser.role === 'super_admin' 
                    ? 'bg-yellow-500/20 border border-yellow-500' 
                    : 'bg-gray-700 hover:bg-gray-600'
                } disabled:opacity-50`}
              >
                <RiVipDiamondLine size={20} />
                <div className="text-left">
                  <p className="font-medium">Super Admin</p>
                  <p className="text-xs text-gray-400">Full system access</p>
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}