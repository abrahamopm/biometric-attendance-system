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

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView}
        onLogout={onLogout}
        userEmail={userId}
        userName={userName}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <main className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
        <div className="p-8">
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