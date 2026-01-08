import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Bell, ChevronRight, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const Dashboard = () => {
    const { user } = useAuth();
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [todayStatus, setTodayStatus] = useState(null);

    const notifications = [
        { id: 1, title: 'Attendance for 2024-07-28', message: 'Your attendance has been marked successfully', time: '2 hours ago', type: 'success' },
        { id: 2, title: 'Reminder: Clock out before 6 PM', message: 'Don\'t forget to clock out today', time: '5 hours ago', type: 'warning' },
        { id: 3, title: 'Your time-off request', message: 'Request has been approved by admin', time: '1 day ago', type: 'info' },
    ];

    useEffect(() => {
        fetchAttendanceHistory();
    }, []);

    const fetchAttendanceHistory = async () => {
        try {
            const response = await api.get('/attendance/');
            const userAttendance = response.data.slice(0, 5).map(record => ({
                id: record.id,
                date: record.date,
                timeIn: record.time || '09:00 AM',
                timeOut: '05:00 PM',
                status: record.status
            }));
            
            setAttendanceHistory(userAttendance.length > 0 ? userAttendance : [
                { id: 1, date: '2024-07-28', timeIn: '09:00 AM', timeOut: '05:00 PM', status: 'present' },
                { id: 2, date: '2024-07-27', timeIn: '08:55 AM', timeOut: '05:05 PM', status: 'present' },
                { id: 3, date: '2024-07-26', timeIn: '09:10 AM', timeOut: '05:00 PM', status: 'late' },
            ]);

            // Check today's status
            const today = new Date().toISOString().split('T')[0];
            const todayRecord = response.data.find(r => r.date === today);
            setTodayStatus(todayRecord?.status || null);
        } catch (err) {
            setAttendanceHistory([
                { id: 1, date: '2024-07-28', timeIn: '09:00 AM', timeOut: '05:00 PM', status: 'present' },
                { id: 2, date: '2024-07-27', timeIn: '08:55 AM', timeOut: '05:05 PM', status: 'present' },
                { id: 3, date: '2024-07-26', timeIn: '09:10 AM', timeOut: '05:00 PM', status: 'late' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'present':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'late':
                return <Clock className="w-4 h-4 text-orange-500" />;
            case 'absent':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome back, {user?.username || 'Student'}!
                    </h1>
                    <p className="text-gray-500 text-sm">Here's your attendance overview for today.</p>
                </div>
                {todayStatus && (
                    <div className={`px-4 py-2 rounded-xl flex items-center gap-2 ${
                        todayStatus === 'present' ? 'bg-green-100 text-green-700' :
                        todayStatus === 'late' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                    }`}>
                        {getStatusIcon(todayStatus)}
                        <span className="font-medium capitalize">{todayStatus} Today</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Left Side */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Face Recognition Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                    >
                        <h3 className="font-semibold text-gray-900 mb-4">Biometric Scan</h3>
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 text-center">
                            <div className="w-28 h-28 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                                <Camera className="w-14 h-14 text-blue-500" />
                            </div>
                            <h4 className="font-medium text-gray-900 mb-2">Face Recognition</h4>
                            <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
                                Position your face in front of the camera to clock in for today's attendance.
                            </p>
                            <Link
                                to="/student/check-in"
                                className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-600/25"
                            >
                                <Camera className="w-5 h-5" />
                                Start Scan
                            </Link>
                        </div>
                    </motion.div>

                    {/* Today's Attendance Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Today's Attendance</h3>
                            <Link 
                                to="/student/history" 
                                className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1"
                            >
                                View All <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                        
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Time In</th>
                                            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Time Out</th>
                                            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendanceHistory.map((record) => (
                                            <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50">
                                                <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                                                    {record.date}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600">
                                                    {record.timeIn}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-600">
                                                    {record.timeOut}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                                        record.status === 'present' 
                                                            ? 'bg-green-100 text-green-700' 
                                                            : record.status === 'late'
                                                            ? 'bg-orange-100 text-orange-700'
                                                            : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {getStatusIcon(record.status)}
                                                        {record.status?.charAt(0).toUpperCase() + record.status?.slice(1)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Right Sidebar - Notifications */}
                <div className="lg:col-span-1">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Bell className="w-5 h-5 text-blue-600" />
                                Notifications
                            </h3>
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                                {notifications.length}
                            </span>
                        </div>
                        
                        <div className="space-y-3">
                            {notifications.map((notification) => (
                                <div 
                                    key={notification.id}
                                    className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                            notification.type === 'success' ? 'bg-green-500' :
                                            notification.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                                        }`}></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 text-sm truncate">
                                                {notification.title}
                                            </p>
                                            <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-gray-400 text-xs mt-2">
                                                {notification.time}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-4 py-2 text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
                            View all notifications
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
