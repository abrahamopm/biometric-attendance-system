import { useEffect, useState } from 'react';
import { Shield, LogOut, BookOpen, Camera, History, Settings, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { EnrollSubjectCard } from './attendee/EnrollSubjectCard';
import { FaceEnrollmentCard } from './attendee/FaceEnrollmentCard';
import { AttendanceHistoryCard } from './attendee/AttendanceHistoryCard';
import { PrivacySettingsCard } from './attendee/PrivacySettingsCard';
import api from '../api';
import { toast } from 'sonner';

interface AttendeeDashboardProps {
  userId: string;
  userName: string;
  onLogout: () => void;
}

export function AttendeeDashboard({ userId, userName, onLogout }: AttendeeDashboardProps) {
  const { theme, toggleTheme } = useTheme();
  const [enrolledSubjects, setEnrolledSubjects] = useState<{ id: number; code: string; name: string }[]>([]);
  const [attendanceRate, setAttendanceRate] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [subjectsData, attendanceData] = await Promise.all([
          api.listSubjects(),
          api.listAttendance(),
        ]);
        setEnrolledSubjects((subjectsData || []).map((s: any) => ({ id: s.id, code: s.code, name: s.name })));
        if (attendanceData && Array.isArray(attendanceData)) {
          const total = attendanceData.length;
          const present = attendanceData.filter((r: any) => (r.status || '').toLowerCase() === 'present').length;
          setAttendanceRate(total ? Math.round((present / total) * 100) : 0);
        }
      } catch (err: any) {
        toast.error((err && err.message) || 'Failed to load data');
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-slate-900 dark:text-white text-xl">Attendance System</h1>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Student Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <div className="text-right hidden sm:block">
                <p className="text-sm text-slate-900 dark:text-white">{userName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{userId}</p>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl text-slate-900 dark:text-white mb-2">Welcome back, {userName.split(' ')[0]}!</h2>
          <p className="text-slate-600 dark:text-slate-400">Manage your enrollment and attendance profile</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg hover-lift">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-6 h-6" />
              <span className="text-sm opacity-90">Enrolled Subjects</span>
            </div>
            <p className="text-4xl mb-2">{enrolledSubjects.length}</p>
            <p className="text-xs opacity-75">Active courses</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg hover-lift">
            <div className="flex items-center gap-3 mb-2">
              <Camera className="w-6 h-6" />
              <span className="text-sm opacity-90">Face Data Status</span>
            </div>
            <p className="text-xl mb-2">Enrolled</p>
            <p className="text-xs opacity-75">Ready for scanning</p>
          </div>

          <div className="bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl p-6 text-white shadow-lg hover-lift">
            <div className="flex items-center gap-3 mb-2">
              <History className="w-6 h-6" />
              <span className="text-sm opacity-90">Attendance Rate</span>
            </div>
            <p className="text-4xl mb-2">{attendanceRate || 0}%</p>
            <p className="text-xs opacity-75">From your records</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <EnrollSubjectCard
              enrolledSubjects={enrolledSubjects}
              onEnrolled={(s) => setEnrolledSubjects((prev) => [...prev, s])}
            />
            <AttendanceHistoryCard userId={userId} />
          </div>

          <div className="space-y-6">
            <FaceEnrollmentCard />
            <PrivacySettingsCard />
          </div>
        </div>
      </main>
    </div>
  );
}