import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Camera, Shield, RefreshCw, Save, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import api from '../../api/axios';

const ProfilePage: React.FC = () => {
    const { user, refreshUserProfile } = useAuth() as any;
    const { success, error: showError } = useNotification();
    const [loading, setLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
    });

    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.patch('/users/me/', {
                email: formData.email,
                phone: formData.phone,
            });

            await refreshUserProfile();
            success('Profile updated successfully!');
        } catch (err: any) {
            showError(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.new_password !== passwordData.confirm_password) {
            showError('New passwords do not match');
            return;
        }

        if (passwordData.new_password.length < 8) {
            showError('Password must be at least 8 characters');
            return;
        }

        setPasswordLoading(true);

        try {
            await api.post('/users/change_password/', {
                old_password: passwordData.old_password,
                new_password: passwordData.new_password,
            });

            setPasswordData({
                old_password: '',
                new_password: '',
                confirm_password: '',
            });

            success('Password changed successfully!');
        } catch (err: any) {
            showError(err.response?.data?.error || err.response?.data?.message || 'Failed to change password');
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleFaceReset = async () => {
        if (!confirm('Are you sure you want to reset your face data? You will need to re-enroll.')) {
            return;
        }

        try {
            await api.post('/users/reset_face/');
            await refreshUserProfile();
            success('Face data reset successfully! Please re-enroll your face.');
        } catch (err: any) {
            showError(err.response?.data?.error || 'Failed to reset face data');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-display font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
            </div>

            {/* Profile Information */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                        <p className="text-sm text-gray-500">Update your personal details</p>
                    </div>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-4">
                    {/* Username (Read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Username
                        </label>
                        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                            <User className="w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={formData.username}
                                disabled
                                className="flex-1 bg-transparent text-gray-600 cursor-not-allowed focus:outline-none"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="flex-1 bg-transparent text-gray-900 focus:outline-none placeholder-gray-400"
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                        </label>
                        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary">
                            <Phone className="w-5 h-5 text-gray-400" />
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter phone number"
                                className="flex-1 bg-transparent text-gray-900 focus:outline-none placeholder-gray-400"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
                    >
                        {loading ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Changes
                            </>
                        )}
                    </button>
                </form>
            </motion.div>

            {/* Face Enrollment Status (Students only) */}
            {user?.role === 'student' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <Camera className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Face Recognition</h2>
                            <p className="text-sm text-gray-500">Manage your biometric data</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${user.hasFaceEnrolled ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
                                <div>
                                    <p className="font-medium text-gray-900">Enrollment Status</p>
                                    <p className="text-sm text-gray-500">
                                        {user.hasFaceEnrolled ? 'Face data enrolled' : 'Not enrolled'}
                                    </p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.hasFaceEnrolled ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {user.hasFaceEnrolled ? 'Active' : 'Pending'}
                            </span>
                        </div>

                        {user.hasFaceEnrolled && (
                            <button
                                onClick={handleFaceReset}
                                className="w-full bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
                            >
                                <RefreshCw className="w-5 h-5" />
                                Reset Face Data
                            </button>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Change Password (All roles) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-yellow-100 rounded-xl">
                        <Shield className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Security</h2>
                        <p className="text-sm text-gray-500">Change your password</p>
                    </div>
                </div>

                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    {/* Old Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                        </label>
                        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary">
                            <Lock className="w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                name="old_password"
                                value={passwordData.old_password}
                                onChange={handlePasswordChange}
                                className="flex-1 bg-transparent text-gray-900 focus:outline-none placeholder-gray-400"
                                required
                            />
                        </div>
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                        </label>
                        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary">
                            <Lock className="w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                name="new_password"
                                value={passwordData.new_password}
                                onChange={handlePasswordChange}
                                className="flex-1 bg-transparent text-gray-900 focus:outline-none placeholder-gray-400"
                                required
                            />
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                        </label>
                        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary">
                            <Lock className="w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                name="confirm_password"
                                value={passwordData.confirm_password}
                                onChange={handlePasswordChange}
                                className="flex-1 bg-transparent text-gray-900 focus:outline-none placeholder-gray-400"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={passwordLoading}
                        className="w-full bg-yellow-50 border border-yellow-200 hover:bg-yellow-100 text-yellow-700 px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                        {passwordLoading ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                Changing...
                            </>
                        ) : (
                            <>
                                <Lock className="w-5 h-5" />
                                Change Password
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default ProfilePage;
