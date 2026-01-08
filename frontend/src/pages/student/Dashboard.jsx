import { useState, useEffect } from 'react';
import { PlusCircle, Clock, CheckCircle, XCircle, AlertCircle, Link as LinkIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';

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
            {/* Face Enrollment Banner */}
            {user && !user.hasFaceEnrolled && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                        <div>
                            <p className="font-bold text-yellow-500">Action Required: Enroll Your Face</p>
                            <p className="text-sm text-gray-400">You need to enroll your face before marking attendance.</p>
                        </div>
                    </div>
                    <Link
                        to="/student/enroll"
                        className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-bold transition-all"
                    >
                        Enroll Now
                    </Link>
                </motion.div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold">Hello, {user?.username}</h1>
                    <p className="text-gray-400">Ready to attend checks for today?</p>
                </div>

                <div className="bg-surface/50 p-1.5 rounded-xl border border-white/10 flex gap-2 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Enter Class Code"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                        className="bg-black/20 border-none rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:ring-0 w-full md:w-48"
                    />
                    <button
                        onClick={handleJoin}
                        className="bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all whitespace-nowrap"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Join
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col: Upcoming / Active */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold">Today's Schedule</h2>
                    <div className="grid gap-4">
                        {enrollments.map((enrol) => {
                            const event = enrol.event;
                            return (
                                <motion.div
                                    key={enrol.id}
                                    whileHover={{ scale: 1.01 }}
                                    className="bg-gradient-to-r from-surface to-surface/50 border border-primary/20 p-6 rounded-2xl relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-50">
                                        <Clock className="w-24 h-24 text-white/5" />
                                    </div>

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                {isEventActive(event) ? (
                                                    <span className="bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-xs font-bold mb-2 inline-block">Active Now</span>
                                                ) : (
                                                    <span className="bg-gray-500/20 text-gray-500 px-3 py-1 rounded-full text-xs font-bold mb-2 inline-block">Scheduled</span>
                                                )}
                                                <h3 className="text-2xl font-bold mt-1">{event.name}</h3>
                                                <p className="text-gray-400 text-sm">
                                                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {formatTime(event.time)}
                                                </p>
                                                <p className="text-gray-500 text-xs mt-1">Code: {event.join_code}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-display font-bold">{formatTime(event.time)}</p>
                                                <p className="text-xs text-gray-400">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => navigate('/attendance/live', { state: { eventId: event.id, eventName: event.name } })}
                                            disabled={!isEventActive(event)}
                                            className={`w-full font-bold py-3 rounded-xl transform translate-y-2 opacity-80 group-hover:translate-y-0 group-hover:opacity-100 transition-all flex justify-center items-center gap-2 ${isEventActive(event)
                                                    ? 'bg-white text-black hover:bg-gray-100'
                                                    : 'bg-gray-500/50 text-gray-400 cursor-not-allowed'
                                                }`}
                                        >
                                            {isEventActive(event) ? 'Mark Attendance' : 'Not Active'}
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {enrollments.length === 0 && <p className="text-gray-500">You haven't joined any classes yet.</p>}
                    </div>
                </div>

                {/* Right Col: Stats/History */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold">Recent History</h2>
                    <div className="bg-surface/30 border border-white/5 rounded-2xl p-4 space-y-4">
                        {loading ? (
                            <p className="text-gray-500 text-center py-4">Loading...</p>
                        ) : attendanceHistory.length > 0 ? (
                            attendanceHistory.map((record) => {
                                const statusColors = {
                                    present: { bg: 'bg-green-500/20', text: 'text-green-500', icon: CheckCircle },
                                    late: { bg: 'bg-yellow-500/20', text: 'text-yellow-500', icon: Clock },
                                    absent: { bg: 'bg-red-500/20', text: 'text-red-500', icon: XCircle }
                                };
                                const statusStyle = statusColors[record.status] || statusColors.present;
                                const StatusIcon = statusStyle.icon;

                                return (
                                    <div key={record.id} className="flex items-center gap-3 pb-3 border-b border-white/5 last:border-0 last:pb-0">
                                        <div className={`p-2 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                                            <StatusIcon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold">{record.event?.name || 'Unknown Event'}</p>
                                            <p className="text-xs text-gray-500">
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
                            <p className="text-gray-500 text-center py-4">No attendance records yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
