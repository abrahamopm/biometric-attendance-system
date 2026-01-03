import { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, TrendingUp, Users, Clock, BookOpen, Play, Calendar, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api';

interface AttendanceRecord {
  id: string | number;
  studentName: string;
  studentId?: string | number;
  status: 'Present' | 'Late' | 'Absent';
  checkInTime: string | null;
  subject: string;
}

interface DashboardStats {
  totalStudents: number;
  attendanceRate: number;
  activeSubjects: number;
  eventsThisWeek: number;
}

export function DashboardHome() {
  const [cameraActive, setCameraActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    attendanceRate: 0,
    activeSubjects: 0,
    eventsThisWeek: 0,
  });
  const [schedule, setSchedule] = useState<{ time: string; subject: string; status: 'ongoing' | 'upcoming' | 'Completed' | 'Ongoing' | 'Scheduled'; title?: string }[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (cameraActive) {
      startCamera();
      setIsScanning(true);
    } else {
      stopCamera();
      setIsScanning(false);
    }
    return () => stopCamera();
  }, [cameraActive]);

  useEffect(() => {
    (async () => {
      try {
        setLoadingMetrics(true);
        const data = await api.getDashboardMetrics();
        if (data?.stats) setStats(data.stats);
        if (Array.isArray(data?.schedule)) {
          setSchedule(
            data.schedule.map((item: any) => ({
              time: item.time,
              subject: item.subject,
              title: item.title,
              status: item.status === 'Ongoing' ? 'ongoing' : item.status === 'Scheduled' ? 'upcoming' : 'Completed',
            }))
          );
        }
        if (Array.isArray(data?.recent_attendance)) {
          setAttendanceRecords(
            data.recent_attendance.map((rec: any) => ({
              id: rec.id,
              studentName: rec.studentName,
              studentId: rec.studentId,
              status: rec.status,
              checkInTime: rec.checkInTime,
              subject: rec.subject,
            }))
          );
        }
      } catch (err: any) {
        const msg = err?.detail || err?.message || 'Failed to load metrics';
        toast.error(String(msg));
      } finally {
        setLoadingMetrics(false);
      }
    })();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      toast.success('Camera activated');
    } catch (error) {
      toast.error('Failed to access camera');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const getStatusBadge = (status: AttendanceRecord['status']) => {
    const key = status.toLowerCase() as 'present' | 'late' | 'absent';
    const styles = {
      present: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      late: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      absent: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs border ${styles[key]}`}>
        {status}
      </span>
    );
  };

  const todaysSchedule = schedule;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-4xl text-slate-900 dark:text-white mb-2">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white hover-lift shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Users className="w-6 h-6" />
              </div>
              <TrendingUp className="w-5 h-5 opacity-75" />
            </div>
            <p className="text-sm opacity-90 mb-1">Total Students</p>
            <p className="text-3xl">{stats.totalStudents}</p>
            <p className="text-xs mt-2 opacity-75">{loadingMetrics ? 'Loading...' : 'Live from backend'}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white hover-lift shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <CheckCircle className="w-6 h-6" />
              </div>
              <TrendingUp className="w-5 h-5 opacity-75" />
            </div>
            <p className="text-sm opacity-90 mb-1">Attendance Rate</p>
            <p className="text-3xl">{stats.attendanceRate}%</p>
            <p className="text-xs mt-2 opacity-75">{loadingMetrics ? 'Loading...' : 'Live from backend'}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl p-6 text-white hover-lift shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm opacity-90 mb-1">Active Subjects</p>
            <p className="text-3xl">{stats.activeSubjects}</p>
            <p className="text-xs mt-2 opacity-75">{loadingMetrics ? 'Loading...' : 'Live from backend'}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-600 to-orange-700 rounded-2xl p-6 text-white hover-lift shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm opacity-90 mb-1">Events This Week</p>
            <p className="text-3xl">{stats.eventsThisWeek}</p>
            <p className="text-xs mt-2 opacity-75">{loadingMetrics ? 'Loading...' : 'Live from backend'}</p>
          </div>
        </div>
      </div>

      {/* Live Session Card */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl text-slate-900 dark:text-white mb-1">Live Session</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Real-time attendance monitoring</p>
            </div>
            <button
              onClick={() => setCameraActive(!cameraActive)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                cameraActive
                  ? 'bg-rose-500 hover:bg-rose-600 text-white'
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white'
              }`}
            >
              {cameraActive ? (
                <>
                  <VideoOff className="w-4 h-4" />
                  Stop
                </>
              ) : (
                <>
                  <Video className="w-4 h-4" />
                  Start
                </>
              )}
            </button>
          </div>

          <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Scanning Indicator */}
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 via-transparent to-indigo-500/20 animate-scan-line"></div>
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-indigo-500/90 backdrop-blur-sm px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse-glow"></div>
                  <span className="text-white text-sm">Scanning...</span>
                </div>
              </div>
            )}

            {!cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                <div className="text-center">
                  <Video className="w-16 h-16 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">Camera preview</p>
                  <button
                    onClick={() => setCameraActive(true)}
                    className="mt-4 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Play className="w-4 h-4" />
                    Start Session
                  </button>
                </div>
              </div>
            )}
          </div>

          {cameraActive && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 text-center">
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Detected</p>
                <p className="text-2xl text-emerald-700 dark:text-emerald-300">0</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-center">
                <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">Unknown</p>
                <p className="text-2xl text-amber-700 dark:text-amber-300">0</p>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-3 text-center">
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-1">Processing</p>
                <p className="text-2xl text-indigo-700 dark:text-indigo-300">0</p>
              </div>
            </div>
          )}
        </div>

        {/* Today's Schedule */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg">
          <h3 className="text-xl text-slate-900 dark:text-white mb-4">Today's Schedule</h3>
          <div className="space-y-3">
            {todaysSchedule.length === 0 ? (
              <div className="p-4 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                {loadingMetrics ? 'Loading schedule...' : 'No events scheduled yet.'}
              </div>
            ) : (
              todaysSchedule.map((event, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors cursor-pointer group"
                >
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg group-hover:scale-110 transition-transform">
                    <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-900 dark:text-white">{event.subject} {event.title ? `- ${event.title}` : ''}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{event.time}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    event.status === 'ongoing'
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 status-badge-active'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {event.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg">
        <h3 className="text-xl text-slate-900 dark:text-white mb-4">Recent Attendance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="text-left py-3 px-4 text-sm text-slate-600 dark:text-slate-400">Student</th>
                <th className="text-left py-3 px-4 text-sm text-slate-600 dark:text-slate-400">ID</th>
                <th className="text-left py-3 px-4 text-sm text-slate-600 dark:text-slate-400">Subject</th>
                <th className="text-left py-3 px-4 text-sm text-slate-600 dark:text-slate-400">Check-in</th>
                <th className="text-left py-3 px-4 text-sm text-slate-600 dark:text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.length === 0 ? (
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-6 px-4 text-slate-500 dark:text-slate-400 text-sm" colSpan={5}>
                    {loadingMetrics ? 'Loading attendance...' : 'No attendance records yet.'}
                  </td>
                </tr>
              ) : (
                attendanceRecords.map((record) => (
                  <tr key={record.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="py-4 px-4 text-slate-900 dark:text-white">{record.studentName}</td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400 text-sm">{record.studentId}</td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400 text-sm">{record.subject}</td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400 text-sm">{record.checkInTime || '-'}</td>
                    <td className="py-4 px-4">{getStatusBadge(record.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}