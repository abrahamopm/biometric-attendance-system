import { useEffect, useState } from 'react';
import { Calendar, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import api from '../../api';
import { toast } from 'sonner';

interface AttendanceRecord {
  id: string;
  subject: string;
  eventName: string;
  date: string;
  status: 'present' | 'late' | 'absent';
  checkInTime?: string;
}

interface Props {
  userId: string;
}

export function AttendanceHistoryCard({ userId }: Props) {
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.listAttendance();
        const mapped = (data || []).map((r: any) => ({
          id: String(r.id),
          subject: r.subject_name || 'Subject',
          eventName: r.event_title || 'Event',
          date: r.timestamp || r.event_date || new Date().toISOString(),
          status: ((r.status || 'absent').toLowerCase()) as 'present' | 'late' | 'absent',
          checkInTime: r.timestamp ? new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
          attendee: r.attendee_name,
        }));
        const filtered = mapped.filter((r: any) => !r.attendee || r.attendee === userId);
        setHistory(filtered);
      } catch (err: any) {
        toast.error((err && err.message) || 'Failed to load attendance');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);
  const getStatusIcon = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'late':
        return <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
    }
  };

  const getStatusBadge = (status: AttendanceRecord['status']) => {
    const styles = {
      present: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
      late: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
      absent: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg">
      <h3 className="text-xl text-slate-900 dark:text-white mb-4">Attendance History</h3>

      {loading ? (
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading history...
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((record) => (
          <div
            key={record.id}
            className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start gap-3">
                {getStatusIcon(record.status)}
                <div>
                  <p className="text-slate-900 dark:text-white">{record.eventName}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {record.subject} • {new Date(record.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              {getStatusBadge(record.status)}
            </div>
            {record.checkInTime && (
              <div className="flex items-center gap-2 mt-2 ml-8">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Check-in: {record.checkInTime}
                </span>
              </div>
            )}
          </div>
          ))}
        </div>
      )}
    </div>
  );
}