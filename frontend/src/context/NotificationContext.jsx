import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const NotificationContext = createContext();

// Simple ID generator
let notificationIdCounter = 0;
const generateId = () => {
    notificationIdCounter += 1;
    return `notification-${notificationIdCounter}-${Date.now()}`;
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const showNotification = useCallback((message, type = 'info', duration = 5000) => {
        const id = generateId();
        const notification = {
            id,
            message,
            type, // 'success', 'error', 'info', 'warning'
            duration,
        };

        setNotifications((prev) => [...prev, notification]);

        // Auto-dismiss after duration
        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }

        return id;
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const success = useCallback((message, duration) => {
        return showNotification(message, 'success', duration);
    }, [showNotification]);

    const error = useCallback((message, duration) => {
        return showNotification(message, 'error', duration);
    }, [showNotification]);

    const info = useCallback((message, duration) => {
        return showNotification(message, 'info', duration);
    }, [showNotification]);

    const warning = useCallback((message, duration) => {
        return showNotification(message, 'warning', duration);
    }, [showNotification]);

    const value = {
        notifications,
        showNotification,
        removeNotification,
        success,
        error,
        info,
        warning,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
