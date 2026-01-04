import { useEffect, useState } from 'react';
import { Plus, Calendar, Clock, MapPin, Users, Play, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api';

interface Event {
  id: number;
  subject: number;
  event_date: string;
  start_time: string;
  venue?: string;
  title: string;
  status: 'Scheduled' | 'Ongoing' | 'Completed';
  subject_name?: string;
  late_threshold?: number;
}

interface SubjectOption {
  id: number;
  name: string;
  code: string;
}

export function EventsView() {
  const [events, setEvents] = useState<Event[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    subject: '',
    title: '',
    date: '',
    startTime: '',
    venue: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [eventsData, subjectsData] = await Promise.all([api.listEvents(), api.listSubjects()]);
        setEvents(eventsData || []);
        setSubjects(subjectsData || []);
      } catch (err: any) {
        toast.error((err && err.message) || 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDeleteEvent = (id: number) => {
    (async () => {
      try {
        await api.deleteEvent(id);
        setEvents(events.filter(e => e.id !== id));
        toast.success('Event deleted');
      } catch (err: any) {
        toast.error((err && err.message) || 'Delete failed');
      }
    })();
  };

  const handleStartSession = (id: number) => {
    (async () => {
      try {
        await api.startSession(id);
        toast.success('Session started');
        const eventsData = await api.listEvents();
        setEvents(eventsData || []);
      } catch (err: any) {
        toast.error((err && err.message) || 'Start failed');
      }
    })();
  };

  const getStatusBadge = (status: Event['status']) => {
    const styles = {
      Scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
      Ongoing: 'bg-green-100 text-green-700 border-green-200',
      Completed: 'bg-slate-100 text-slate-700 border-slate-200',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs border ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-slate-900 text-3xl mb-2">Events</h1>
          <p className="text-slate-600">Schedule and manage attendance events</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Event
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading events...
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-slate-900 text-xl">{event.title}</h3>
                  {getStatusBadge(event.status)}
                </div>
                <p className="text-sm text-slate-600 mb-3">
                  {event.subject} - {event.subject_name || 'Subject'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {event.status === 'Scheduled' && (
                  <button
                    onClick={() => handleStartSession(event.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Start Session
                  </button>
                )}
                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Date</p>
                  <p className="text-sm text-slate-900">
                    {event.event_date ? new Date(event.event_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }) : '—'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Time</p>
                  <p className="text-sm text-slate-900">
                    {event.start_time}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Location</p>
                  <p className="text-sm text-slate-900">{event.venue || '—'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Attendance</p>
                  <p className="text-sm text-slate-900">
                    —
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full">
            <h2 className="text-slate-900 text-2xl mb-4">Create New Event</h2>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                (async () => {
                  try {
                    setCreating(true);
                    await api.createEvent({
                      subject: Number(form.subject),
                      title: form.title,
                      event_date: form.date,
                      start_time: form.startTime,
                      venue: form.venue,
                    });
                    toast.success('Event created');
                    setShowCreateModal(false);
                    setForm({ subject: '', title: '', date: '', startTime: '', venue: '' });
                    const eventsData = await api.listEvents();
                    setEvents(eventsData || []);
                  } catch (err: any) {
                    toast.error((err && err.message) || 'Create failed');
                  } finally {
                    setCreating(false);
                  }
                })();
              }}
            >
              <div>
                <label className="block text-sm text-slate-700 mb-2">Subject</label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{`${s.code} - ${s.name}`}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-2">Event Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Lecture 6: Advanced Topics"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Room 301"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  {creating ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
