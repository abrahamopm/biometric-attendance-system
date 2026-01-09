import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, Users, Trash2, Search, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { useNotification } from '../../context/NotificationContext';
import CreateSessionModal from '../../components/CreateSessionModal';

interface Event {
    id: number;
    name: string;
    description: string;
    date: string;
    time: string;
    duration: string;
    grace_period: number;
    join_code: string;
}

const ManageEventsPage: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { success, error: showError } = useNotification();

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const response = await api.get('/events/');
            const eventList = Array.isArray(response.data) ? response.data : (response.data.results || []);
            setEvents(eventList);
        } catch (error) {
            showError('Failed to fetch events');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEvent = async (eventId: number, eventName: string) => {
        if (!confirm(`Are you sure you want to delete "${eventName}"?`)) {
            return;
        }

        try {
            await api.delete(`/events/${eventId}/`);
            success(`Event "${eventName}" deleted successfully`);
            fetchEvents();
        } catch (err: any) {
            showError(err.response?.data?.error || 'Failed to delete event');
        }
    };

    const filteredEvents = events.filter((event) =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.join_code.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Manage Events</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">Create and manage your attendance sessions</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-primary/20"
                >
                    <Plus className="w-5 h-5" />
                    Create Session
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-surface/50 border border-white/5 rounded-xl flex items-center gap-3 px-4 py-3">
                <Search className="w-5 h-5 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search by name or join code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
                />
            </div>

            {/* Events List */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Your Events ({filteredEvents.length})</h2>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : filteredEvents.length > 0 ? (
                    <div className="space-y-4">
                        {filteredEvents.map((event, index) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600 hover:border-primary/30 transition-all group gap-4"
                            >
                                <div className="flex-1">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-primary/20 rounded-lg">
                                            <Calendar className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg">{event.name}</h3>
                                            {event.description && (
                                                <p className="text-sm text-gray-400 mt-1">{event.description}</p>
                                            )}
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-400 mt-2">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(event.date)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {formatTime(event.time)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-4 h-4" />
                                                    Duration: {event.duration}
                                                </span>
                                            </div>
                                            <div className="mt-2">
                                                <span className="font-mono bg-white/5 px-3 py-1 rounded text-xs">
                                                    Code: {event.join_code}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleDeleteEvent(event.id, event.name)}
                                        className="px-4 py-2 bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 text-red-500 rounded-lg text-sm flex items-center gap-2 font-bold"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No events found. Create your first session!</p>
                    </div>
                )}
            </div>

            {/* Create Session Modal */}
            <CreateSessionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchEvents}
            />
        </div>
    );
};

export default ManageEventsPage;
