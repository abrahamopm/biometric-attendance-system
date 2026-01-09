import React, { useState, useEffect } from 'react';
import { Download, FileText, Loader, BarChart } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { useNotification } from '../../context/NotificationContext';

interface Event {
    id: number;
    name: string;
    date: string;
    time: string;
}

interface AttendanceRecord {
    id: number;
    student_username: string;
    student: number;
    status: string;
    date: string;
    time: string;
    timestamp: string;
    confidence_score: number;
    event: number;
}

const ReportsPage: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingAttendance, setLoadingAttendance] = useState(false);
    const { success, error: showError } = useNotification();

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        if (selectedEvent) {
            fetchAttendance();
        }
    }, [selectedEvent]);

    const fetchEvents = async () => {
        try {
            const response = await api.get('/events/');
            setEvents(response.data);
            if (response.data.length > 0) {
                setSelectedEvent(response.data[0]);
            }
        } catch (error) {
            showError('Failed to fetch events');
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendance = async () => {
        if (!selectedEvent) return;

        setLoadingAttendance(true);
        try {
            const response = await api.get('/attendance/');
            const filtered = response.data.filter((record: AttendanceRecord) => record.event === selectedEvent.id);
            filtered.sort((a: AttendanceRecord, b: AttendanceRecord) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
            setAttendanceData(filtered);
        } catch (error) {
            showError('Failed to load attendance data');
        } finally {
            setLoadingAttendance(false);
        }
    };

    const handleExportCSV = () => {
        if (!selectedEvent || attendanceData.length === 0) {
            showError('No data to export');
            return;
        }

        const escapeCSV = (value: any) => {
            if (value === null || value === undefined) return '';
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        };

        const headers = ['Student', 'Status', 'Date', 'Time', 'Confidence Score'];
        const rows = attendanceData.map((record) => [
            escapeCSV(record.student_username || record.student || 'Unknown'),
            escapeCSV(record.status),
            escapeCSV(record.date),
            escapeCSV(record.time),
            escapeCSV((record.confidence_score * 100).toFixed(2) + '%'),
        ]);

        const csvContent = [
            headers.map(escapeCSV).join(','),
            ...rows.map((row) => row.join(',')),
        ].join('\n');

        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        const sanitizedEventName = selectedEvent.name
            .replace(/[<>:"/\\|?*]/g, '_')
            .replace(/\s+/g, '_')
            .substring(0, 50);

        a.download = `${sanitizedEventName}_attendance_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        success('CSV exported successfully!');
    };

    const getStats = () => {
        const present = attendanceData.filter((r) => r.status === 'present').length;
        const late = attendanceData.filter((r) => r.status === 'late').length;
        const total = attendanceData.length;
        const avgConfidence = total > 0
            ? (attendanceData.reduce((sum, r) => sum + r.confidence_score, 0) / total) * 100
            : 0;

        return { present, late, total, avgConfidence };
    };

    const stats = getStats();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (timeString: string) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Reports</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Export and analyze attendance data</p>
            </div>

            {/* Event Selector */}
            {!loading && events.length > 0 && (
                <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl p-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Event</label>
                    <div className="flex gap-3">
                        <select
                            value={selectedEvent?.id || ''}
                            onChange={(e) => {
                                const event = events.find((ev) => ev.id === parseInt(e.target.value));
                                setSelectedEvent(event || null);
                            }}
                            className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            {events.map((event) => (
                                <option key={event.id} value={event.id}>
                                    {event.name} - {new Date(event.date).toLocaleDateString()}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={handleExportCSV}
                            disabled={attendanceData.length === 0}
                            className="bg-green-500/20 text-green-500 border border-green-500/50 hover:bg-green-500/30 px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download className="w-5 h-5" />
                            Export CSV
                        </button>
                    </div>
                </div>
            )}

            {/* Statistics */}
            {selectedEvent && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Records', value: stats.total, color: 'blue' },
                        { label: 'Present', value: stats.present, color: 'green' },
                        { label: 'Late', value: stats.late, color: 'yellow' },
                        {
                            label: 'Avg Confidence',
                            value: `${stats.avgConfidence.toFixed(1)}%`,
                            color: 'purple',
                        },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 p-6 rounded-2xl"
                        >
                            <div className={`p-3 bg-${stat.color}-500/20 rounded-xl inline-flex mb-4`}>
                                <BarChart className={`w-6 h-6 text-${stat.color}-500`} />
                            </div>
                            <p className="text-3xl font-bold font-display text-gray-900 dark:text-white">{stat.value}</p>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Attendance Table */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <FileText className="w-6 h-6 text-primary" />
                        Attendance Records
                    </h2>
                </div>

                {loadingAttendance ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : attendanceData.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-3 px-4 font-bold">Student</th>
                                    <th className="text-left py-3 px-4 font-bold">Status</th>
                                    <th className="text-left py-3 px-4 font-bold">Date</th>
                                    <th className="text-left py-3 px-4 font-bold">Time</th>
                                    <th className="text-left py-3 px-4 font-bold">Confidence</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceData.map((record) => {
                                    const statusColors = {
                                        present: 'text-green-500',
                                        late: 'text-yellow-500',
                                        absent: 'text-red-500',
                                    };
                                    return (
                                        <tr key={record.id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="py-3 px-4">
                                                {record.student_username || record.student || 'Unknown'}
                                            </td>
                                            <td className={`py-3 px-4 font-bold ${statusColors[record.status as keyof typeof statusColors] || ''}`}>
                                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                            </td>
                                            <td className="py-3 px-4 text-gray-400">{formatDate(record.date)}</td>
                                            <td className="py-3 px-4 text-gray-400">{formatTime(record.time)}</td>
                                            <td className="py-3 px-4 text-gray-400">
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
                        <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No attendance records for this event yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportsPage;
