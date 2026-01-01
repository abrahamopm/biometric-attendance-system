import { useState } from 'react';
import { Shield, Mail, Lock, User, ArrowRight, Sparkles, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import api from '../api';
import { toast } from 'sonner';

interface AuthScreenProps {
  onAuth: (email: string, name: string) => void;
}

export function AuthScreen({ onAuth }: AuthScreenProps) {
  const { theme, toggleTheme } = useTheme();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Attendee',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignUp && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    try {
      if (isSignUp) {
        // Default new users to Attendee role if not chosen here
        const payload = { full_name: formData.name || formData.email, email: formData.email, password: formData.password, role: formData.role };
        const data = await api.register(payload);
        // register endpoint returns tokens
        if (data?.access) {
          localStorage.setItem('access', data.access);
        }
        if (data?.refresh) localStorage.setItem('refresh', data.refresh);
        toast.success('Account created');
        onAuth(formData.email, formData.name || formData.email);
      } else {
        const data = await api.login({ email: formData.email, password: formData.password });
        if (data?.access) {
          localStorage.setItem('access', data.access);
        }
        if (data?.refresh) localStorage.setItem('refresh', data.refresh);
        toast.success('Signed in');
        onAuth(formData.email, formData.name || formData.email);
      }
    } catch (err: any) {
      const msg = (err && err.detail) || (err && err.message) || 'Authentication failed';
      toast.error(String(msg));
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

      {/* Animated background elements */}
      {theme === 'dark' && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-700 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-slate-700 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '2s' }} />
        </div>
      )}

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left side - Branding */}
        <div className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'} space-y-8`}>
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div>
                <h1 className="text-5xl mb-1 gradient-text">Biometric</h1>
                <p className={`text-xl ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>Attendance System</p>
              </div>
            </div>
            <p className={`text-lg leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
              Secure, intelligent, and effortless attendance tracking powered by advanced facial recognition technology.
            </p>
          </div>

          <div className="space-y-5">
            {[
              {
                icon: '🎯',
                title: 'Real-Time Face Detection',
                desc: 'Instant attendance marking with advanced biometric recognition',
                color: 'from-blue-600 to-blue-700'
              },
              {
                icon: '🔒',
                title: 'Enterprise-Grade Security',
                desc: 'Encrypted data storage with GDPR compliance',
                color: 'from-slate-600 to-slate-700'
              },
              {
                icon: '📊',
                title: 'Analytics & Reporting',
                desc: 'Comprehensive insights and exportable reports',
                color: 'from-blue-700 to-slate-700'
              }
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start gap-4 group">
                <div className={`p-4 bg-gradient-to-br ${feature.color} rounded-xl shadow-lg transform group-hover:scale-110 transition-transform`}>
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl mb-1 text-white">{feature.title}</h3>
                  <p className="text-slate-400">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Auth Form */}
        <div className={`glass rounded-3xl shadow-2xl p-8 backdrop-blur-xl border ${
          theme === 'dark' ? 'border-white/20' : 'border-slate-900/20'
        }`}>
          <div className="mb-8">
            <h2 className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'} text-4xl mb-3`}>
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
              {isSignUp 
                ? 'Join us and experience the future of attendance' 
                : 'Sign in to access your dashboard'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div>
                <label htmlFor="name" className={`block text-sm mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  Full Name
                </label>
                <div className="relative group">
                  <User className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 group-focus-within:text-blue-400 transition-colors ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                  }`} />
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full pl-12 pr-4 py-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${
                      theme === 'dark'
                        ? 'bg-white/10 border-white/20 text-white placeholder-slate-400'
                        : 'bg-slate-900/10 border-slate-900/20 text-slate-900 placeholder-slate-500'
                    }`}
                    placeholder="John Doe"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}
              {isSignUp && (
                <div>
                  <label htmlFor="role" className={`block text-sm mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    Role
                  </label>
                  <div className="relative group">
                    <select
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className={`w-full pl-4 pr-10 py-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm appearance-none ${
                        theme === 'dark'
                          ? 'bg-white/10 border-white/20 text-white'
                          : 'bg-slate-900/10 border-slate-900/20 text-slate-900'
                      }`}
                      required
                    >
                      <option value="Host">Host / Instructor</option>
                      <option value="Attendee">Student / Attendee</option>
                    </select>
                    <span className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                      ▼
                    </span>
                  </div>
                </div>
              )}

            <div>
              <label htmlFor="email" className={`block text-sm mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                Email Address
              </label>
              <div className="relative group">
                <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 group-focus-within:text-blue-400 transition-colors ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`} />
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full pl-12 pr-4 py-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${
                    theme === 'dark'
                      ? 'bg-white/10 border-white/20 text-white placeholder-slate-400'
                      : 'bg-slate-900/10 border-slate-900/20 text-slate-900 placeholder-slate-500'
                  }`}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                Password
              </label>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 group-focus-within:text-blue-400 transition-colors ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`} />
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full pl-12 pr-4 py-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${
                    theme === 'dark'
                      ? 'bg-white/10 border-white/20 text-white placeholder-slate-400'
                      : 'bg-slate-900/10 border-slate-900/20 text-slate-900 placeholder-slate-500'
                  }`}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className={`block text-sm mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 group-focus-within:text-blue-400 transition-colors ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                  }`} />
                  <input
                    type="password"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className={`w-full pl-12 pr-4 py-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm ${
                      theme === 'dark'
                        ? 'bg-white/10 border-white/20 text-white placeholder-slate-400'
                        : 'bg-slate-900/10 border-slate-900/20 text-slate-900 placeholder-slate-500'
                    }`}
                    placeholder="••••••••"
                    required={isSignUp}
                    minLength={6}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-2xl hover:from-blue-700 hover:to-blue-800 transition-all"
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setFormData({ name: '', email: '', password: '', confirmPassword: '' });
              }}
              className={`transition-colors ${
                theme === 'dark' ? 'text-blue-300 hover:text-blue-200' : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"}
            </button>
          </div>

          {!isSignUp && (
            <div className="mt-4 text-center">
              <button className="text-sm text-slate-400 hover:text-slate-300 transition-colors">
                Forgot password?
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}