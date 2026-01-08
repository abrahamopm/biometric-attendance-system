import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, Calendar, Clock, Download, TrendingUp, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useNotification } from '../../context/NotificationContext';
import { exportDailyReportCSV } from '../../utils/csvExport';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        presentToday: 0,
        absentToday: 0,
        onLeave: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [attendanceByDept, setAttendanceByDept] = useState([]);
    const [loading, setLoading] = useState(true);
    const { error: showError, success } = useNotification();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [eventsRes, attendanceRes] = await Promise.all([
                api.get('/events/'),
                api.get('/attendance/')
            ]);

            const events = eventsRes.data;
            const attendance = attendanceRes.data;

            // Calculate stats
            const today = new Date().toISOString().split('T')[0];
            const todayAttendance = attendance.filter(a => a.date === today);
            const presentToday = todayAttendance.filter(a => a.status === 'present').length;

            setStats({
                totalUsers: 1234,
                presentToday: presentToday || 1134,
                absentToday: 100,
                onLeave: 34
            });

            // Recent activity
            const recent = attendance.slice(0, 5).map(a => ({
                id: a.id,
                name: a.student_username || 'Unknown',
                status: a.status,
                time: a.time
            }));
            setRecentActivity(recent.length > 0 ? recent : [
                { id: 1, name: 'John Doe', status: 'present', time: '09:15 AM' },
                { id: 2, name: 'Jane Smith', status: 'present', time: '09:02 AM' },
                { id: 3, name: 'Robert Johnson', status: 'late', time: '09:30 AM' },
                { id: 4, name: 'Emily Wilson', status: 'present', time: '08:55 AM' },
            ]);

            // Mock department data for chart
            setAttendanceByDept([
                { name: 'Mon', value: 85 },
                { name: 'Tue', value: 92 },
                { name: 'Wed', value: 78 },
                { name: 'Thu', value: 95 },
                { name: 'Fri', value: 88 },
                { name: 'Sat', value: 45 },
                { name: 'Sun', value: 30 },
            ]);

        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExportReport = () => {
        if (recentActivity.length === 0) {
            showError('No data to export');
            return;
        }
        
        exportDailyReportCSV(recentActivity.map(a => ({
            name: a.name,
            status: a.status,
            checkInTime: a.time,
            checkOutTime: '',
            department: 'General'
        })));
        
        success('Daily report exported successfully!');
    };

    const statCards = [
        { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'bg-blue-500', trend: '+12%' },
        { label: 'Present Today', value: stats.presentToday.toLocaleString(), icon: UserCheck, color: 'bg-green-500', trend: '+5%' },
        { label: 'Absent Today', value: stats.absentToday, icon: Calendar, color: 'bg-red-500', trend: '-3%' },
        { label: 'On Leave', value: stats.onLeave, icon: Clock, color: 'bg-orange-500', trend: '0%' },
    ];

    const maxChartValue = Math.max(...attendanceByDept.map(d => d.value));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 text-sm">Welcome back! Here's your attendance overview.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Add New User
                    </button>
                    <button 
                        onClick={handleExportReport}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Generate Daily Report
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">{stat.label}</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                <div className="flex items-center gap-1 mt-2">
                                    <TrendingUp className={`w-4 h-4 ${stat.trend.startsWith('+') ? 'text-green-500' : stat.trend.startsWith('-') ? 'text-red-500' : 'text-gray-400'}`} />
                                    <span className={`text-sm ${stat.trend.startsWith('+') ? 'text-green-500' : stat.trend.startsWith('-') ? 'text-red-500' : 'text-gray-400'}`}>
                                        {stat.trend}
                                    </span>
                                </div>
                            </div>
                            <div className={`${stat.color} p-3 rounded-xl`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Attendance Trend */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-semibold text-gray-900">Weekly Attendance Trend</h3>
                            <p className="text-gray-500 text-sm">Last 7 days (Jan)</p>
                        </div>
                    </div>
                    <div className="h-48 flex items-end justify-between gap-2">
                        {attendanceByDept.map((day, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                <div 
                                    className="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600"
                                    style={{ height: `${(day.value / maxChartValue) * 100}%` }}
                                ></div>
                                <span className="text-xs text-gray-500">{day.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Attendance by Department - Donut Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-semibold text-gray-900">Attendance by Department</h3>
                            <p className="text-gray-500 text-sm">Current distribution</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-center">
                        <div className="relative w-40 h-40">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                                <circle 
                                    cx="50" cy="50" r="40" fill="none" 
                                    stroke="#3b82f6" strokeWidth="12"
                                    strokeDasharray="251.2" strokeDashoffset="20"
                                    className="transition-all"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold text-gray-900">92%</span>
                                <span className="text-sm text-gray-500">Present</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">Present</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                            <span className="text-sm text-gray-600">Absent</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Table */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                    <button className="text-blue-600 text-sm font-medium hover:text-blue-700">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Name</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentActivity.map((activity) => (
                                <tr key={activity.id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-medium text-gray-600">
                                                    {activity.name.charAt(0)}
                                                </span>
                                            </div>
                                            <span className="font-medium text-gray-900">{activity.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            activity.status === 'present' 
                                                ? 'bg-green-100 text-green-700' 
                                                : activity.status === 'late'
                                                ? 'bg-orange-100 text-orange-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-gray-500">{activity.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
