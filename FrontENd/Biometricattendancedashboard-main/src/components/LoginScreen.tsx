import { useState } from 'react';
import { Shield, Users, UserCheck, Sparkles, ArrowRight, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import type { UserRole } from '../App';

interface LoginScreenProps {
  onLogin: (role: UserRole, id: string) => void;
  userName: string;
  userEmail: string;
}

export function LoginScreen({ onLogin, userName, userEmail }: LoginScreenProps) {
  const { theme, toggleTheme } = useTheme();
  const [selectedRole, setSelectedRole] = useState<'host' | 'attendee' | null>(null);

  const handleContinue = () => {
    if (selectedRole) {
      onLogin(selectedRole, userEmail);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900'
        : 'bg-gradient-to-br from-blue-50 via-white to-blue-50'
    }`}>
      {/* Header with Theme Toggle */}
      <header className="w-full p-4 flex justify-end">
        <button
          onClick={toggleTheme}
          className={`p-3 backdrop-blur-md border rounded-full transition-all duration-200 shadow-lg ${
            theme === 'dark'
              ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              : 'bg-slate-900/10 border-slate-900/20 text-slate-900 hover:bg-slate-900/20'
          }`}
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">

      {/* Animated background */}
      {theme === 'dark' && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-700 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '1s' }} />
        </div>
      )}

      <div className="w-full max-w-5xl relative z-10">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-2xl">
                <Shield className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-8 h-8 text-blue-400 animate-pulse" />
              </div>
            </div>
          </div>
          <h1 className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'} text-5xl mb-3`}>Choose Your Role</h1>
          <p className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} text-lg`}>Welcome back, {userName}!</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => setSelectedRole('host')}
            className={`group relative overflow-hidden rounded-3xl p-8 text-left transition-all duration-500 ${
              selectedRole === 'host'
                ? 'glass ring-4 ring-blue-500 shadow-2xl shadow-blue-500/50 scale-105'
                : 'glass hover:scale-102'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-slate-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Users className="w-9 h-9 text-white" />
              </div>
              <h2 className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'} text-3xl mb-3`}>Host / Instructor</h2>
              <p className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} mb-6 leading-relaxed`}>
                Manage subjects, events, and monitor live attendance with real-time face detection
              </p>
              <ul className="space-y-3">
                {[
                  'Live attendance monitoring',
                  'Subject & event management',
                  'Analytics & reports',
                  'AI-powered insights'
                ].map((feature, idx) => (
                  <li key={idx} className={`flex items-center gap-3 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </button>

          <button
            onClick={() => setSelectedRole('attendee')}
            className={`group relative overflow-hidden rounded-3xl p-8 text-left transition-all duration-500 ${
              selectedRole === 'attendee'
                ? 'glass ring-4 ring-emerald-500 shadow-2xl shadow-emerald-500/50 scale-105'
                : 'glass hover:scale-102'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-teal-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <UserCheck className="w-9 h-9 text-white" />
              </div>
              <h2 className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'} text-3xl mb-3`}>Student / Attendee</h2>
              <p className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} mb-6 leading-relaxed`}>
                Enroll in subjects, register your face data, and manage your attendance profile
              </p>
              <ul className="space-y-3">
                {[
                  'Face enrollment & verification',
                  'Subject enrollment with code',
                  'Attendance history',
                  'Privacy data controls'
                ].map((feature, idx) => (
                  <li key={idx} className={`flex items-center gap-3 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </button>
        </div>

        {selectedRole && (
          <div className={`glass rounded-3xl p-8 shadow-2xl max-w-md mx-auto backdrop-blur-xl animate-in fade-in ${
            theme === 'dark' ? 'border-white/20' : 'border-slate-900/20'
          }`}>
            <h3 className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'} text-2xl mb-6`}>Confirm Selection</h3>
            <div className={`mb-6 p-5 rounded-2xl backdrop-blur-sm ${
              theme === 'dark' ? 'bg-white/10 border-white/10' : 'bg-slate-900/10 border-slate-900/10'
            }`}>
              <div className="flex items-center gap-4 mb-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${
                  selectedRole === 'host' ? 'from-blue-600 to-blue-800' : 'from-emerald-600 to-teal-700'
                } rounded-xl flex items-center justify-center`}>
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Signed in as:</p>
                  <p className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{userName}</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{userEmail}</p>
                </div>
              </div>
            </div>
            <p className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} mb-6`}>
              Continue as <span className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{selectedRole === 'host' ? 'Host / Instructor' : 'Student / Attendee'}</span>
            </p>
            <button
              onClick={handleContinue}
              className={`w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r ${
                selectedRole === 'host'
                  ? 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                  : 'from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800'
              } text-white rounded-xl hover:shadow-2xl transition-all`}
            >
              Continue to Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}