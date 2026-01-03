import { useState } from 'react';
import { Sidebar } from './host/Sidebar';
import { DashboardHome } from './host/DashboardHome';
import { SubjectsView } from './host/SubjectsView';
import { EventsView } from './host/EventsView';
import { LiveAttendanceView } from './host/LiveAttendanceView';
import { ReportsView } from './host/ReportsView';
import { SettingsView } from './host/SettingsView';

interface HostDashboardProps {
  userId: string;
  userName: string;
  onLogout: () => void;
}

export type HostView = 'home' | 'subjects' | 'events' | 'live' | 'reports' | 'settings';

export function HostDashboard({ userId, userName, onLogout }: HostDashboardProps) {
  const [currentView, setCurrentView] = useState<HostView>('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainOffset = sidebarCollapsed ? 'md:ml-20' : 'md:ml-72';

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView}
        onLogout={onLogout}
        userEmail={userId}
        userName={userName}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      <main className={`flex-1 overflow-y-auto transition-all duration-300 ${mainOffset}`}>
        {/* Mobile top bar with menu toggle */}
        <div className="md:hidden sticky top-0 z-30 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur border-b border-slate-200/70 dark:border-slate-800/70 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="px-3 py-2 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-sm font-medium shadow"
          >
            Menu
          </button>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-xs text-slate-600 dark:text-slate-300"
          >
            {sidebarCollapsed ? 'Expand' : 'Compact'}
          </button>
        </div>

        <div className="p-4 md:p-8">
          {currentView === 'home' && <DashboardHome />}
          {currentView === 'subjects' && <SubjectsView />}
          {currentView === 'events' && <EventsView />}
          {currentView === 'live' && <LiveAttendanceView />}
          {currentView === 'reports' && <ReportsView />}
          {currentView === 'settings' && <SettingsView />}
        </div>
      </main>
    </div>
  );
}