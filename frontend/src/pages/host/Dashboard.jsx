import React, { useState, useEffect } from 'react';
import { Plus, Users, Calendar, BarChart, Loader, Download, Eye, X, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import CreateSessionModal from '../../components/CreateSessionModal';

const HostDashboard = () => {
    const [events, setEvents] = useState([]);
    const [stats, setStats] = useState({
        total_students: 0,
        active_sessions: 0,
        avg_attendance: 0
    });
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [attendanceData, setAttendanceData] = useState([]);
    const [loadingAttendance, setLoadingAttendance] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    const { success, error: showError } = useNotification();

    useEffect(() => {
        fetchEvents();
        fetchStats();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await api.get('/events/');
            // Handle both array (no pagination) and paginated response
            const eventList = Array.isArray(response.data) ? response.data : (response.data.results || []);
            setEvents(eventList);
        } catch (error) {
            console.error("Failed to fetch events", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/events/stats/');
            setStats(response.data);
        } catch (error) {
            console.error("Failed to fetch stats", error);
        }
    };

    const handleViewReport = async (event) => {
        setSelectedEvent(event);
        setLoadingAttendance(true);
        try {
            const response = await api.get('/attendance/');
            // Filter by event_id
            const filtered = response.data.filter(record => record.event === event.id);
            // Sort by timestamp descending
            filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setAttendanceData(filtered);
        } catch (error) {
            showError("Failed to load attendance data");
            console.error(error);
        } finally {
            setLoadingAttendance(false);
        }
    };

    const handleExportCSV = () => {
        if (!selectedEvent || attendanceData.length === 0) return;

        // Escape CSV special characters and handle quotes
        const escapeCSV = (value) => {
            if (value === null || value === undefined) return '';
            const stringValue = String(value);
            // If contains comma, quote, or newline, wrap in quotes and escape internal quotes
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        };

        const headers = ['Student', 'Status', 'Date', 'Time', 'Confidence Score'];
        const rows = attendanceData.map(record => [
            escapeCSV(record.student_username || record.student || 'Unknown'),
            escapeCSV(record.status),
            escapeCSV(record.date),
            escapeCSV(record.time),
            escapeCSV((record.confidence_score * 100).toFixed(2) + '%')
        ]);

        const csvContent = [
            headers.map(escapeCSV).join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Add BOM for Excel compatibility with special characters
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        // Sanitize filename: remove special characters that might break file system
        const sanitizedEventName = selectedEvent.name
            .replace(/[<>:"/\\|?*]/g, '_')  // Replace invalid filename chars
            .replace(/\s+/g, '_')  // Replace spaces with underscores
            .substring(0, 50);  // Limit length

        a.download = `${sanitizedEventName}_attendance_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        success("CSV exported successfully!");
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const handleStartSession = async (event) => {
        try {
            await api.post(`/events/${event.id}/start_session/`);
            navigate('/host/live', { state: { eventId: event.id, eventName: event.name } });
        } catch (error) {
            console.error("Failed to start session", error);
            const msg = error.response?.data?.error || error.response?.data?.detail || "Failed to start session";
            showError(msg);
        }
    };

    return (
        <div className="space-y-8 min-h-full">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Host Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-300">Manage your sessions and attendance.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-primary/20"
                >
                    <Plus className="w-5 h-5" />
                    Create Session
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Students', value: stats.total_students, icon: Users, color: 'bg-blue-100 text-blue-600' },
                    { label: 'Active Sessions', value: stats.active_sessions, icon: Calendar, color: 'bg-purple-100 text-purple-600' },
                    { label: 'Avg Attendance', value: `${stats.avg_attendance}%`, icon: BarChart, color: 'bg-green-100 text-green-600' },
                ].map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 p-6 rounded-2xl"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className="text-3xl font-bold font-display text-gray-900 dark:text-white">{stat.value}</span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Active Sessions List */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Your Sessions</h2>
                <div className="space-y-4">
                    {loading ? <Loader className="animate-spin mx-auto text-primary" /> : events.map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600 hover:border-primary/30 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full bg-green-500 animate-pulse`} />
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{event.name}</h3>
                                    <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-300">
                                        <span>{event.time}</span>
                                        <span className="font-mono bg-gray-200 dark:bg-gray-600 px-2 rounded text-xs py-0.5 text-gray-700 dark:text-gray-200">Code: {event.join_code}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleViewReport(event)}
                                    className="px-4 py-2 bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 border border-gray-200 dark:border-gray-500 rounded-lg text-sm flex items-center gap-2 text-gray-700 dark:text-white"
                                >
                                    <Eye className="w-4 h-4" />
                                    View Report
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleStartSession(event);
                                    }}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm flex items-center gap-2 font-bold shadow-md"
                                >
                                    <Video className="w-4 h-4" />
                                    Start Session
                                </button>
                            </div>
                        </div>
                    ))}
                    {!loading && events.length === 0 && <p className="text-gray-500 dark:text-gray-400 text-center">No sessions created yet.</p>}
                </div>
            </div>

            {/* Attendance Report Modal */}
            <AnimatePresence>
                {selectedEvent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedEvent(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white border border-gray-200 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{selectedEvent.name}</h2>
                                    <p className="text-gray-500 text-sm">
                                        {formatDate(selectedEvent.date)} at {formatTime(selectedEvent.time)}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {attendanceData.length > 0 && (
                                        <button
                                            onClick={handleExportCSV}
                                            className="bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                                        >
                                            <Download className="w-4 h-4" />
                                            Export CSV
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setSelectedEvent(null)}
                                        className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg text-gray-500 hover:text-gray-700"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {loadingAttendance ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : attendanceData.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 font-bold text-gray-700">Student</th>
                                                <th className="text-left py-3 px-4 font-bold text-gray-700">Status</th>
                                                <th className="text-left py-3 px-4 font-bold text-gray-700">Date</th>
                                                <th className="text-left py-3 px-4 font-bold text-gray-700">Time</th>
                                                <th className="text-left py-3 px-4 font-bold text-gray-700">Confidence</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {attendanceData.map((record) => {
                                                const statusColors = {
                                                    present: 'text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold inline-block',
                                                    late: 'text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-xs font-bold inline-block',
                                                    absent: 'text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-bold inline-block'
                                                };
                                                return (
                                                    <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                        <td className="py-3 px-4 font-medium text-gray-900">{record.student_username || record.student || 'Unknown'}</td>
                                                        <td className="py-3 px-4">
                                                            <span className={`${statusColors[record.status] || ''}`}>
                                                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-gray-500">{formatDate(record.date)}</td>
                                                        <td className="py-3 px-4 text-gray-500">{formatTime(record.time)}</td>
                                                        <td className="py-3 px-4 text-gray-500">
                                                            {(record.confidence_score * 100).toFixed(1)}%
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <p>No attendance records for this event yet.</p>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create Session Modal */}
            <CreateSessionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchEvents}
            />
        </div >
    );
};

export default HostDashboard;
