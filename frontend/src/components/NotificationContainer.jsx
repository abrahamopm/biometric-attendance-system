import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const NotificationContainer = () => {
    const { notifications, removeNotification } = useNotification();

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5" />;
            case 'error':
                return <XCircle className="w-5 h-5" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5" />;
            case 'info':
            default:
                return <Info className="w-5 h-5" />;
        }
    };

    const getStyles = (type) => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-green-500/10',
                    border: 'border-green-500/30',
                    text: 'text-green-400',
                    iconBg: 'bg-green-500/20',
                };
            case 'error':
                return {
                    bg: 'bg-red-500/10',
                    border: 'border-red-500/30',
                    text: 'text-red-400',
                    iconBg: 'bg-red-500/20',
                };
            case 'warning':
                return {
                    bg: 'bg-yellow-500/10',
                    border: 'border-yellow-500/30',
                    text: 'text-yellow-400',
                    iconBg: 'bg-yellow-500/20',
                };
            case 'info':
            default:
                return {
                    bg: 'bg-blue-500/10',
                    border: 'border-blue-500/30',
                    text: 'text-blue-400',
                    iconBg: 'bg-blue-500/20',
                };
        }
    };

    return (
        <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md w-full pointer-events-none">
            <AnimatePresence>
                {notifications.map((notification) => {
                    const styles = getStyles(notification.type);
                    return (
                        <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: 100, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 100, scale: 0.9 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className={`${styles.bg} ${styles.border} border backdrop-blur-md rounded-xl p-4 shadow-lg pointer-events-auto relative overflow-hidden`}
                        >
                            {/* Background gradient effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-50" />
                            
                            <div className="relative flex items-start gap-3">
                                {/* Icon */}
                                <div className={`${styles.iconBg} ${styles.text} p-2 rounded-lg flex-shrink-0`}>
                                    {getIcon(notification.type)}
                                </div>

                                {/* Message */}
                                <div className="flex-1 min-w-0">
                                    <p className={`${styles.text} font-medium text-sm leading-relaxed`}>
                                        {notification.message}
                                    </p>
                                </div>

                                {/* Dismiss button */}
                                <button
                                    onClick={() => removeNotification(notification.id)}
                                    className="flex-shrink-0 text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
                                    aria-label="Dismiss notification"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Progress bar for auto-dismiss */}
                            {notification.duration > 0 && (
                                <motion.div
                                    initial={{ width: '100%' }}
                                    animate={{ width: '0%' }}
                                    transition={{ duration: notification.duration / 1000, ease: 'linear' }}
                                    className={`absolute bottom-0 left-0 h-0.5 ${styles.bg.replace('/10', '/30')}`}
                                />
                            )}
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

export default NotificationContainer;
