import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Moon, Sun, Bell, Lock, User, Palette, Shield, Mail, Globe } from 'lucide-react';
import { toast } from 'sonner';

export function SettingsView() {
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    attendance: true,
    reports: true,
  });

  const handleSaveSettings = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl text-slate-900 dark:text-white mb-2">Settings</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage your account and preferences</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Appearance */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <Palette className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xl text-slate-900 dark:text-white">Appearance</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Customize the look and feel</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                ) : (
                  <Sun className="w-5 h-5 text-slate-600" />
                )}
                <div>
                  <p className="text-slate-900 dark:text-white">Theme</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {theme === 'dark' ? 'Dark mode' : 'Light mode'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  theme === 'dark' ? 'bg-indigo-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                    theme === 'dark' ? 'translate-x-7' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
              <Bell className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl text-slate-900 dark:text-white">Notifications</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Manage notification preferences</p>
            </div>
          </div>

          <div className="space-y-3">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div>
                  <p className="text-slate-900 dark:text-white capitalize">{key} Notifications</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Receive {key} notifications
                  </p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, [key]: !value })}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    value ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                      value ? 'translate-x-7' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Profile */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl text-slate-900 dark:text-white">Profile</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Update your information</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2">Display Name</label>
              <input
                type="text"
                defaultValue="Dr. John Doe"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-700 dark:text-slate-300 mb-2">Email</label>
              <input
                type="email"
                defaultValue="john.doe@university.edu"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-xl">
              <Shield className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h3 className="text-xl text-slate-900 dark:text-white">Security</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Manage security settings</p>
            </div>
          </div>

          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <span className="text-slate-900 dark:text-white">Change Password</span>
              </div>
              <span className="text-sm text-indigo-600 dark:text-indigo-400">Update</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <span className="text-slate-900 dark:text-white">Two-Factor Auth</span>
              </div>
              <span className="text-sm text-emerald-600 dark:text-emerald-400">Enabled</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
