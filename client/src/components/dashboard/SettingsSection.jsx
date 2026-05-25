import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiLock, FiBell, FiMoon, FiGlobe, FiEye, FiShield, FiCreditCard, FiMapPin, FiChevronRight } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

function Toggle({ enabled, setEnabled }) {
  const { darkMode } = useTheme();
  const d = darkMode;
  return (
    <button
      onClick={() => setEnabled(!enabled)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${enabled ? 'bg-indigo-500' : d ? 'bg-white/10' : 'bg-gray-200'}`}
    >
      <motion.div
        animate={{ x: enabled ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
      />
    </button>
  );
}

function SettingRow({ icon: Icon, label, description, children, d }) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl ${d ? 'hover:bg-white/5' : 'hover:bg-gray-50'} transition-all`}>
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${d ? 'glass' : 'bg-gray-100 border border-gray-200'}`}>
          <Icon className="text-indigo-500" size={16} />
        </div>
        <div>
          <p className={`text-sm font-medium ${d ? 'text-white/80' : 'text-gray-700'}`}>{label}</p>
          {description && <p className={`text-xs ${d ? 'text-white/40' : 'text-gray-500'}`}>{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

export default function SettingsSection() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const d = darkMode;
  const [notifications, setNotifications] = useState(true);
  const [localDarkMode, setLocalDarkMode] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [editing, setEditing] = useState(null);
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });

  const handleSave = () => {
    setEditing(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl overflow-hidden backdrop-blur-xl ${
        d ? 'bg-slate-900/60 border border-white/10' : 'bg-white/90 border border-gray-200/60 shadow-xl'
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${d ? 'from-sky-500/3' : 'from-sky-500/[0.01]'} to-transparent pointer-events-none`} />

      <div className="relative p-6 space-y-6">
        <h2 className={`text-xl font-bold flex items-center gap-2 ${d ? 'text-white' : 'text-gray-900'}`}>
          <FiUser className="text-sky-400" />
          Account Settings
        </h2>

        <div>
          <h3 className={`text-xs font-semibold ${d ? 'text-white/40' : 'text-gray-500'} uppercase tracking-wider mb-3`}>Profile Information</h3>
          <div className="space-y-2">
            {[
              { key: 'name', icon: FiUser, label: 'Full Name', value: profile.name },
              { key: 'email', icon: FiMail, label: 'Email', value: profile.email },
              { key: 'phone', icon: FiPhone, label: 'Phone', value: profile.phone || 'Not set' },
            ].map(field => (
              <div key={field.key} className={`flex items-center justify-between p-3 rounded-xl ${d ? 'hover:bg-white/5' : 'hover:bg-gray-50'} transition-all`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${d ? 'glass' : 'bg-gray-100 border border-gray-200'}`}>
                    <field.icon className="text-indigo-500" size={16} />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${d ? 'text-white/80' : 'text-gray-700'}`}>{field.label}</p>
                    {editing === field.key ? (
                      <input
                        value={profile[field.key]}
                        onChange={e => setProfile({ ...profile, [field.key]: e.target.value })}
                        className={`mt-1 px-2 py-1 rounded-lg text-sm focus:outline-none ${
                          d ? 'bg-white/10 text-white border border-white/20 focus:border-indigo-500/50' : 'bg-white text-gray-900 border border-gray-300 focus:border-indigo-500'
                        }`}
                        autoFocus
                      />
                    ) : (
                      <p className={`text-xs ${d ? 'text-white/40' : 'text-gray-500'}`}>{field.value}</p>
                    )}
                  </div>
                </div>
                {editing === field.key ? (
                  <div className="flex gap-1">
                    <button onClick={handleSave} className="px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs">Save</button>
                    <button onClick={() => setEditing(null)} className={`px-3 py-1 rounded-lg text-xs ${d ? 'glass text-white/60' : 'bg-gray-100 text-gray-600'}`}>Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setEditing(field.key)} className={d ? 'text-white/40 hover:text-white/70' : 'text-gray-400 hover:text-gray-600'}>
                    <FiChevronRight size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className={`text-xs font-semibold ${d ? 'text-white/40' : 'text-gray-500'} uppercase tracking-wider mb-3`}>Notifications</h3>
          <div className="space-y-1">
            <SettingRow icon={FiBell} label="Push Notifications" description="Order updates and promotions" d={d}>
              <Toggle enabled={notifications} setEnabled={setNotifications} />
            </SettingRow>
            <SettingRow icon={FiMail} label="Email Updates" description="Weekly deals and offers" d={d}>
              <Toggle enabled={emailUpdates} setEnabled={setEmailUpdates} />
            </SettingRow>
          </div>
        </div>

        <div>
          <h3 className={`text-xs font-semibold ${d ? 'text-white/40' : 'text-gray-500'} uppercase tracking-wider mb-3`}>Preferences</h3>
          <div className="space-y-1">
            <SettingRow icon={FiMoon} label="Dark Mode" description="Toggle dark/light theme" d={d}>
              <Toggle enabled={localDarkMode} setEnabled={setLocalDarkMode} />
            </SettingRow>
            <SettingRow icon={FiGlobe} label="Language" description="English" d={d}>
              <span className={`text-xs ${d ? 'text-white/40' : 'text-gray-500'}`}>English</span>
            </SettingRow>
          </div>
        </div>

        <div>
          <h3 className={`text-xs font-semibold ${d ? 'text-white/40' : 'text-gray-500'} uppercase tracking-wider mb-3`}>Security</h3>
          <div className="space-y-1">
            <SettingRow icon={FiLock} label="Change Password" description="Update your password" d={d}>
              <FiChevronRight className={d ? 'text-white/30' : 'text-gray-400'} size={16} />
            </SettingRow>
            <SettingRow icon={FiShield} label="Two-Factor Auth" description="Extra security layer" d={d}>
              <Toggle enabled={twoFactor} setEnabled={setTwoFactor} />
            </SettingRow>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="flex-1 py-3 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 text-sm font-medium hover:bg-indigo-500/30 transition-all">
            Save Changes
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
              d ? 'glass text-white/60 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            Reset
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
