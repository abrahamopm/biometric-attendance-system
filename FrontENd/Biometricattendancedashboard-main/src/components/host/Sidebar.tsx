import { Home, BookOpen, Calendar, Video, BarChart3, Settings, LogOut, Shield, ChevronLeft, ChevronRight, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import type { HostView } from '../HostDashboard';

interface SidebarProps {
  currentView: HostView;
  onViewChange: (view: HostView) => void;
  onLogout: () => void;
  userEmail: string;
  userName: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const navItems: { view: HostView; label: string; icon: any }[] = [
  { view: 'home', label: 'Dashboard', icon: Home },
  { view: 'subjects', label: 'Subjects', icon: BookOpen },
  { view: 'events', label: 'Events', icon: Calendar },
  { view: 'live', label: 'Live Session', icon: Video },
  { view: 'reports', label: 'Reports', icon: BarChart3 },
  { view: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ currentView, onViewChange, onLogout, userEmail, userName, collapsed, onToggleCollapse }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-xl transition-all duration-300 z-50 ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-slate-900 dark:text-white">Attendance</h1>
                <p className="text-xs text-blue-600 dark:text-blue-400">Host Panel</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl mx-auto">
              <Shield className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.view;
          
          return (
            <button
              key={item.view}
              onClick={() => onViewChange(item.view)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 ${collapsed ? 'mx-auto' : ''}`} />
              {!collapsed && <span className="text-sm">{item.label}</span>}
              {isActive && !collapsed && (
                <div className="absolute right-3 w-2 h-2 bg-white rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Toggle theme' : undefined}
        >
          {theme === 'dark' ? (
            <Sun className={`w-5 h-5 ${collapsed ? 'mx-auto' : ''}`} />
          ) : (
            <Moon className={`w-5 h-5 ${collapsed ? 'mx-auto' : ''}`} />
          )}
          {!collapsed && <span className="text-sm">Toggle Theme</span>}
        </button>

        {/* User Info */}
        {!collapsed && (
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-900 dark:text-white truncate">{userName}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{userEmail}</p>
              </div>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Sign out' : undefined}
        >
          <LogOut className={`w-5 h-5 ${collapsed ? 'mx-auto' : ''}`} />
          {!collapsed && <span className="text-sm">Sign Out</span>}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 mx-auto" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}