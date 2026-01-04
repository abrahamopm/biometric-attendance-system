import { useState } from 'react';
import { HostDashboard } from './components/HostDashboard';
import { AttendeeDashboard } from './components/AttendeeDashboard';
import { AuthScreen } from './components/AuthScreen';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'sonner';
import { AIChat } from './components/AIChat';

export type UserRole = 'Host' | 'Attendee' | null;

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<UserRole>(null);

  const handleAuth = (email: string, name: string, role?: string) => {
    setUserEmail(email);
    setUserName(name);
    setIsAuthenticated(true);
    if (role) {
      setUserRole(role as UserRole);
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setIsAuthenticated(false);
    setUserEmail('');
    setUserName('');
  };

  return (
    <ThemeProvider>
      {/* Show auth screen if not authenticated */}
      {!isAuthenticated && (
        <>
          <AuthScreen onAuth={handleAuth} />
          <Toaster position="top-right" richColors />
        </>
      )}

      {/* Show dashboard based on role */}
      {isAuthenticated && userRole && (
        <>
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {userRole === 'Host' ? (
              <HostDashboard userId={userEmail} userName={userName} onLogout={handleLogout} />
            ) : (
              <AttendeeDashboard userId={userEmail} userName={userName} onLogout={handleLogout} />
            )}
            <AIChat />
          </div>
          <Toaster position="top-right" richColors />
        </>
      )}
    </ThemeProvider>
  );
}