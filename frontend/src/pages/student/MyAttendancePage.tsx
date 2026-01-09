import React, { useState, useEffect } from 'react';
import { History, CheckCircle, XCircle, Clock, Calendar, Filter, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { useNotification } from '../../context/NotificationContext';

interface AttendanceRecord {
    id: number;
    event: {
        id: number;
        name: string;
    };
    status: string;
    date: string;
    time: string;
    timestamp: string;
    confidence_score: number;
}

const MyAttendancePage: React.FC = () => {
    const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
    const [filteredHistory, setFilteredHistory] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const { error: showError } = useNotification();

    useEffect(() => {
        fetchAttendanceHistory();
    }, []);

    useEffect(() => {
        if (statusFilter === 'all') {
            setFilteredHistory(attendanceHistory);
        } else {
            setFilteredHistory(attendanceHistory.filter((record) => record.status === statusFilter));
        }
    }, [statusFilter, attendanceHistory]);

    const fetchAttendanceHistory = async () => {
        try {
            const response = await api.get('/attendance/');
            const sorted = response.data.sort(
                (a: AttendanceRecord, b: AttendanceRecord) =>
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
            setAttendanceHistory(sorted);
            setFilteredHistory(sorted);
        } catch (error) {
            showError('Failed to fetch attendance history');
        } finally {
            setLoading(false);
        }
    };

    const getStats = () => {
        const present = attendanceHistory.filter((r) => r.status === 'present').length;
        const late = attendanceHistory.filter((r) => r.status === 'late').length;
        const total = attendanceHistory.length;
        const attendanceRate = total > 0 ? ((present + late) / total) * 100 : 0;

        return { present, late, total, attendanceRate };
    };

    const stats = getStats();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
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
                <h1 className="text-3xl font-display font-bold">My Attendance</h1>
                <p className="text-gray-400 mt-1">View your complete attendance history</p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    {
                        label: 'Total Sessions',
                        value: stats.total,
                        icon: History,
                        color: 'bg-blue-500/10 text-blue-500',
                    },
                    {
                        label: 'Present',
                        value: stats.present,
                        icon: CheckCircle,
                        color: 'bg-green-500/10 text-green-500',
                    },
                    {
                        label: 'Late',
                        value: stats.late,
                        icon: Clock,
                        color: 'bg-yellow-500/10 text-yellow-500',
                    },
                    {
                        label: 'Attendance Rate',
                        value: `${stats.attendanceRate.toFixed(0)}%`,
                        icon: Calendar,
                        color: 'bg-purple-500/10 text-purple-500',
                    },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-surface/50 backdrop-blur-md border border-white/5 p-6 rounded-2xl"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className="text-3xl font-bold font-display">{stat.value}</span>
                        </div>
                        <p className="text-gray-400">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Filter */}
            <div className="bg-surface/50 border border-white/5 rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <label className="text-sm font-medium text-gray-300">Filter by status:</label>
                    <div className="flex gap-2">
                        {['all', 'present', 'late', 'absent'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${statusFilter === status
                                    ? 'bg-primary text-white'
                                    : 'bg-black/40 text-gray-400 hover:bg-black/60'
                                    }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Attendance List */}
            <div className="bg-surface/30 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-6">
                    History ({filteredHistory.length} {filteredHistory.length === 1 ? 'record' : 'records'})
                </h2>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : filteredHistory.length > 0 ? (
                    <div className="space-y-3">
                        {filteredHistory.map((record, index) => {
                            const statusColors = {
                                present: {
                                    bg: 'bg-green-500/20',
                                    text: 'text-green-500',
                                    icon: CheckCircle,
                                    border: 'border-green-500/50',
                                },
                                late: {
                                    bg: 'bg-yellow-500/20',
                                    text: 'text-yellow-500',
                                    icon: Clock,
                                    border: 'border-yellow-500/50',
                                },
                                absent: {
                                    bg: 'bg-red-500/20',
                                    text: 'text-red-500',
                                    icon: XCircle,
                                    border: 'border-red-500/50',
                                },
                            };
                            const statusStyle = statusColors[record.status as keyof typeof statusColors] || statusColors.present;
                            const StatusIcon = statusStyle.icon;

                            return (
                                <motion.div
                                    key={record.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.02 }}
                                    className="flex items-center justify-between p-5 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 transition-all"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={`p-3 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                                            <StatusIcon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg">{record.event?.name || 'Unknown Event'}</h3>
                                            <div className="flex gap-4 text-sm text-gray-400 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(record.date)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {formatTime(record.time)}
                                                </span>
                                                <span>Confidence: {(record.confidence_score * 100).toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span
                                        className={`px-4 py-2 rounded-lg text-sm font-bold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                                    >
                                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                    </span>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No attendance records found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyAttendancePage;
