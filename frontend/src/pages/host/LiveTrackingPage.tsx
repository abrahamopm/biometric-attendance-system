import React, { useState, useEffect } from 'react';
import { Radio, Users, Clock, CheckCircle, Loader, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { useNotification } from '../../context/NotificationContext';

interface AttendanceRecord {
    id: number;
    student_username: string;
    status: string;
    timestamp: string;
    confidence_score: number;
    event: number;
}

interface Event {
    id: number;
    name: string;
    date: string;
    time: string;
}

const LiveTrackingPage: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { error: showError } = useNotification();

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        if (selectedEvent) {
            fetchAttendance();
            // Auto-refresh every 5 seconds
            const interval = setInterval(fetchAttendance, 5000);
            return () => clearInterval(interval);
        }
    }, [selectedEvent]);

    const fetchEvents = async () => {
        try {
            const response = await api.get('/events/');
            const sortedEvents = response.data.sort((a: Event, b: Event) => {
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            });
            setEvents(sortedEvents);
            if (sortedEvents.length > 0) {
                setSelectedEvent(sortedEvents[0]);
            }
        } catch (error) {
            showError('Failed to fetch events');
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendance = async () => {
        if (!selectedEvent) return;

        setRefreshing(true);
        try {
            const response = await api.get('/attendance/');
            const filtered = response.data.filter((record: AttendanceRecord) =>
                record.event === selectedEvent.id
            );
            // Sort by most recent first
            filtered.sort((a: AttendanceRecord, b: AttendanceRecord) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
            setAttendanceRecords(filtered);
        } catch (error) {
            console.error('Failed to fetch attendance', error);
        } finally {
            setRefreshing(false);
        }
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'present':
                return 'bg-green-500/20 text-green-500 border-green-500/50';
            case 'late':
                return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
            default:
                return 'bg-red-500/20 text-red-500 border-red-500/50';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-display font-bold">Live Tracking</h1>
                    <p className="text-gray-400 mt-1">Monitor attendance in real-time</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Auto-refreshing every 5s</span>
                </div>
            </div>

            {/* Event Selector */}
            {!loading && events.length > 0 && (
                <div className="bg-surface/50 border border-white/5 rounded-xl p-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Select Event</label>
                    <select
                        value={selectedEvent?.id || ''}
                        onChange={(e) => {
                            const event = events.find((ev) => ev.id === parseInt(e.target.value));
                            setSelectedEvent(event || null);
                        }}
                        className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        {events.map((event) => (
                            <option key={event.id} value={event.id}>
                                {event.name} - {new Date(event.date).toLocaleDateString()}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Stats Cards */}
            {selectedEvent && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-surface/50 backdrop-blur-md border border-white/5 p-6 rounded-2xl"
                    >
                        <div className="flex items-center justify-between">
                            <div className="p-3 bg-green-500/20 rounded-xl">
                                <CheckCircle className="w-6 h-6 text-green-500" />
                            </div>
                            <span className="text-3xl font-bold font-display">
                                {attendanceRecords.filter((r) => r.status === 'present').length}
                            </span>
                        </div>
                        <p className="text-gray-400 mt-4">Present</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-surface/50 backdrop-blur-md border border-white/5 p-6 rounded-2xl"
                    >
                        <div className="flex items-center justify-between">
                            <div className="p-3 bg-yellow-500/20 rounded-xl">
                                <Clock className="w-6 h-6 text-yellow-500" />
                            </div>
                            <span className="text-3xl font-bold font-display">
                                {attendanceRecords.filter((r) => r.status === 'late').length}
                            </span>
                        </div>
                        <p className="text-gray-400 mt-4">Late</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-surface/50 backdrop-blur-md border border-white/5 p-6 rounded-2xl"
                    >
                        <div className="flex items-center justify-between">
                            <div className="p-3 bg-blue-500/20 rounded-xl">
                                <Users className="w-6 h-6 text-blue-500" />
                            </div>
                            <span className="text-3xl font-bold font-display">{attendanceRecords.length}</span>
                        </div>
                        <p className="text-gray-400 mt-4">Total Check-ins</p>
                    </motion.div>
                </div>
            )}

            {/* Live Feed */}
            <div className="bg-surface/30 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Radio className="w-6 h-6 text-primary" />
                        Live Feed
                    </h2>
                    <button
                        onClick={fetchAttendance}
                        disabled={refreshing}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : attendanceRecords.length > 0 ? (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                        {attendanceRecords.map((record, index) => (
                            <motion.div
                                key={record.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.02 }}
                                className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/5"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                                        <Users className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-bold">{record.student_username}</p>
                                        <p className="text-xs text-gray-400">{formatTime(record.timestamp)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-400">
                                        {(record.confidence_score * 100).toFixed(1)}%
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(record.status)}`}>
                                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <Radio className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No attendance records yet. Waiting for check-ins...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveTrackingPage;
