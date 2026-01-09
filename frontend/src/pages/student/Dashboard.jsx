import { useState, useEffect } from 'react';
import { PlusCircle, Clock, CheckCircle, XCircle, AlertCircle, Link as LinkIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import AutomatedReminders from '../../components/student/AutomatedReminders';
import AttendanceForecaster from '../../components/student/AttendanceForecaster';

const StudentDashboard = () => {
    const [joinCode, setJoinCode] = useState('');
    const [enrollments, setEnrollments] = useState([]);
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, refreshUserProfile } = useAuth();
    const navigate = useNavigate();
    const { success, error: showError } = useNotification();

    useEffect(() => {
        fetchEnrollments();
        fetchAttendanceHistory();
        // Refresh user profile to get latest face enrollment status
        refreshUserProfile();
    }, []);

    const fetchEnrollments = async () => {
        try {
            const response = await api.get('/enrollments/');
            setEnrollments(response.data);
        } catch (error) {
            console.error("Failed to fetch enrollments", error);
            showError("Failed to load enrollments");
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendanceHistory = async () => {
        try {
            const response = await api.get('/attendance/');
            // Sort by most recent first
            const sorted = response.data.sort((a, b) =>
                new Date(b.timestamp) - new Date(a.timestamp)
            );
            setAttendanceHistory(sorted.slice(0, 5)); // Show last 5 records
        } catch (error) {
            console.error("Failed to fetch attendance history", error);
        }
    };

    const handleJoin = async () => {
        if (!joinCode.trim()) {
            showError("Please enter a valid join code");
            return;
        }
        try {
            await api.post('/events/join_event/', { join_code: joinCode.toUpperCase().trim() });
            setJoinCode('');
            await fetchEnrollments();
            success("Class joined successfully!");
        } catch (error) {
            const errorMsg = error.response?.data?.error || error.response?.data?.message || "Failed to join class";
            showError(errorMsg);
        }
    };

    const isEventActive = (event) => {
        const now = new Date();
        const eventDate = new Date(event.date);
        const [hours, minutes] = event.time.split(':').map(Number);
        const eventStart = new Date(eventDate);
        eventStart.setHours(hours, minutes, 0, 0);

        // Parse duration (format: "HH:MM:SS")
        const [durHours, durMins] = event.duration.split(':').map(Number);
        const eventEnd = new Date(eventStart);
        eventEnd.setHours(eventEnd.getHours() + durHours, eventEnd.getMinutes() + durMins);

        // Add grace period
        const graceEnd = new Date(eventEnd);
        graceEnd.setMinutes(graceEnd.getMinutes() + event.grace_period);

        return now >= eventStart && now <= graceEnd;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    return (
        <div className="space-y-8 min-h-full">
            {/* Automated Reminders Widget */}
            <AutomatedReminders enrollments={enrollments} />

            {/* Face Enrollment Banner */}
            {user && !user.hasFaceEnrolled && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4 flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="font-bold text-yellow-800 dark:text-yellow-200">Action Required: Enroll Your Face</p>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">You need to enroll your face before marking attendance.</p>
                        </div>
                    </div>
                    <Link
                        to="/student/enroll"
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-md hover:shadow-lg"
                    >
                        Enroll Now
                    </Link>
                </motion.div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Hello, {user?.username}</h1>
                    <p className="text-gray-600 dark:text-gray-300">Ready to attend checks for today?</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex gap-2 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Enter Class Code"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                        className="bg-transparent border-none rounded-lg px-4 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-0 w-full md:w-48 outline-none"
                    />
                    <button
                        onClick={handleJoin}
                        className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all whitespace-nowrap shadow-sm"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Join
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col: Upcoming / Active */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Today's Schedule</h2>
                    <div className="grid gap-4">
                        {enrollments.map((enrol) => {
                            const event = enrol.event;
                            const isActive = isEventActive(event);
                            return (
                                <motion.div
                                    key={enrol.id}
                                    whileHover={{ scale: 1.01 }}
                                    className={`relative overflow-hidden border p-6 rounded-2xl transition-all group ${isActive
                                        ? 'bg-white dark:bg-gray-800 border-primary/20 shadow-lg ring-1 ring-primary/10'
                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm opacity-90'
                                        }`}
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-5">
                                        <Clock className="w-24 h-24 text-primary" />
                                    </div>

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                {isActive ? (
                                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold mb-2 inline-block">Active Now</span>
                                                ) : (
                                                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold mb-2 inline-block">Scheduled</span>
                                                )}
                                                <h3 className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{event.name}</h3>
                                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {formatTime(event.time)}
                                                </p>
                                                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1 font-mono">Code: {event.join_code}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-display font-bold text-primary">{formatTime(event.time)}</p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                            </div>
                                        </div>

                                        <div className={`w-full font-bold py-3 rounded-xl flex justify-center items-center gap-2 ${isActive
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-400 opacity-80'
                                            }`}
                                        >
                                            {isActive ? 'Live Session Active' : 'Not Active'}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {enrollments.length === 0 && (
                            <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                                <p className="text-gray-500 dark:text-gray-400">You haven't joined any classes yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Col: Stats/History */}
                <div className="space-y-6">
                    {/* Forecaster Widget */}
                    <AttendanceForecaster history={attendanceHistory} />

                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent History</h2>
                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 space-y-4 shadow-sm">
                        {loading ? (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">Loading...</p>
                        ) : attendanceHistory.length > 0 ? (
                            attendanceHistory.map((record) => {
                                const statusColors = {
                                    present: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
                                    late: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
                                    absent: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle }
                                };
                                const statusStyle = statusColors[record.status] || statusColors.present;
                                const StatusIcon = statusStyle.icon;

                                return (
                                    <div key={record.id} className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors">
                                        <div className={`p-2 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                                            <StatusIcon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{record.event?.name || 'Unknown Event'}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatDate(record.date)} at {formatTime(record.time)}
                                            </p>
                                        </div>
                                        <span className={`text-xs font-bold ${statusStyle.text}`}>
                                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No attendance records yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
