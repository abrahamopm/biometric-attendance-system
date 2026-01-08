import React, { useState, useEffect } from 'react';
import { Download, FileText, Loader, BarChart, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { useNotification } from '../../context/NotificationContext';
import { exportAttendanceCSV } from '../../utils/csvExport';

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

        exportAttendanceCSV(attendanceData, selectedEvent.name);
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                    <p className="text-gray-500 text-sm">Export and analyze attendance data</p>
                </div>
            </div>

            {/* Event Selector */}
            {!loading && events.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Event</label>
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                value={selectedEvent?.id || ''}
                                onChange={(e) => {
                                    const event = events.find((ev) => ev.id === parseInt(e.target.value));
                                    setSelectedEvent(event || null);
                                }}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                            >
                                {events.map((event) => (
                                    <option key={event.id} value={event.id}>
                                        {event.name} - {new Date(event.date).toLocaleDateString()}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={handleExportCSV}
                            disabled={attendanceData.length === 0}
                            className="bg-green-600 text-white hover:bg-green-700 px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                        { label: 'Avg Confidence', value: `${stats.avgConfidence.toFixed(1)}%`, color: 'purple' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                        >
                            <div className={`p-3 bg-${stat.color}-100 rounded-xl inline-flex mb-4`}>
                                <BarChart className={`w-6 h-6 text-${stat.color}-600`} />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                            <p className="text-gray-500 mt-1 text-sm">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Attendance Table */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Attendance Records
                    </h2>
                </div>

                {loadingAttendance ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : attendanceData.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Student</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Time</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Confidence</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceData.map((record) => (
                                    <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <span className="text-sm font-medium text-gray-600">
                                                        {(record.student_username || 'U').charAt(0)}
                                                    </span>
                                                </div>
                                                <span className="font-medium text-gray-900">
                                                    {record.student_username || record.student || 'Unknown'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                record.status === 'present' 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : record.status === 'late'
                                                    ? 'bg-orange-100 text-orange-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}>
                                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-500">{formatDate(record.date)}</td>
                                        <td className="py-3 px-4 text-gray-500">{formatTime(record.time)}</td>
                                        <td className="py-3 px-4 text-gray-500">
                                            {(record.confidence_score * 100).toFixed(1)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p>No attendance records for this event yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportsPage;
