import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Timer, HelpCircle } from 'lucide-react';
import api from '../api/axios';
import { useNotification } from '../context/NotificationContext';

interface CreateSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CreateSessionModal: React.FC<CreateSessionModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { success, error: showError } = useNotification();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        duration: '01:00:00',
        grace_period: 15,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Session name is required';
        }

        if (!formData.date) {
            newErrors.date = 'Date is required';
        }

        if (!formData.time) {
            newErrors.time = 'Time is required';
        }

        // Validate duration format (HH:MM:SS)
        const durationRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
        if (!durationRegex.test(formData.duration)) {
            newErrors.duration = 'Duration must be in HH:MM:SS format';
        }

        if (formData.grace_period < 0 || formData.grace_period > 60) {
            newErrors.grace_period = 'Grace period must be between 0 and 60 minutes';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            showError('Please fix the form errors');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/events/', formData);
            const joinCode = response.data.join_code;

            success(`Session "${formData.name}" created successfully! Join Code: ${joinCode}`, 8000);

            // Reset form
            setFormData({
                name: '',
                description: '',
                date: new Date().toISOString().split('T')[0],
                time: new Date().toTimeString().slice(0, 5),
                duration: '01:00:00',
                grace_period: 15,
            });

            onSuccess();
            onClose();
        } catch (err: any) {
            showError(err.response?.data?.error || err.response?.data?.message || 'Failed to create session');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setErrors({});
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        onClick={handleClose}
                    />

                    {/* Slide-over Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-white border-l border-gray-200 shadow-2xl z-50 overflow-y-auto"
                    >
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Create Session</h2>
                                    <p className="text-sm text-gray-500 mt-1">Set up a new attendance session</p>
                                </div>
                                <button
                                    onClick={handleClose}
                                    disabled={loading}
                                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors disabled:opacity-50"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Session Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Session Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g., CS101 Lecture"
                                        className={`w-full bg-white border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary`}
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description (optional)
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Add session details..."
                                        rows={3}
                                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                                    />
                                </div>

                                {/* Date and Time Row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Calendar className="w-4 h-4 inline mr-1" />
                                            Date *
                                        </label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleChange}
                                            className={`w-full bg-white border ${errors.date ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary`}
                                        />
                                        {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Clock className="w-4 h-4 inline mr-1" />
                                            Time *
                                        </label>
                                        <input
                                            type="time"
                                            name="time"
                                            value={formData.time}
                                            onChange={handleChange}
                                            className={`w-full bg-white border ${errors.time ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary`}
                                        />
                                        {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
                                    </div>
                                </div>

                                {/* Duration */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Timer className="w-4 h-4 inline mr-1" />
                                        Duration (HH:MM:SS) *
                                    </label>
                                    <input
                                        type="text"
                                        name="duration"
                                        value={formData.duration}
                                        onChange={handleChange}
                                        placeholder="01:00:00"
                                        className={`w-full bg-white border ${errors.duration ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary font-mono`}
                                    />
                                    {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration}</p>}
                                    <p className="text-xs text-gray-500 mt-1">Format: Hours:Minutes:Seconds</p>
                                </div>

                                {/* Grace Period */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <HelpCircle className="w-4 h-4 inline mr-1" />
                                        Grace Period (minutes) *
                                    </label>
                                    <input
                                        type="number"
                                        name="grace_period"
                                        value={formData.grace_period}
                                        onChange={handleChange}
                                        min="0"
                                        max="60"
                                        className={`w-full bg-white border ${errors.grace_period ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary`}
                                    />
                                    {errors.grace_period && <p className="text-red-500 text-xs mt-1">{errors.grace_period}</p>}
                                    <p className="text-xs text-gray-500 mt-1">Late entry allowed after session ends</p>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        disabled={loading}
                                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-primary/20 disabled:opacity-50"
                                    >
                                        {loading ? 'Creating...' : 'Create Session'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CreateSessionModal;
