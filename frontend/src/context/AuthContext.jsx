import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = async () => {
        try {
            const response = await api.get('/users/me/');
            const userData = {
                id: response.data.id,
                username: response.data.username,
                role: response.data.role,
                hasFaceEnrolled: response.data.has_face_enrolled,
                email: response.data.email,
                phone: response.data.phone
            };
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return userData;
        } catch (error) {
            console.error("Failed to fetch user profile:", error);
            // If token is invalid, clear storage
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('refresh');
                localStorage.removeItem('user');
                setUser(null);
            }
            return null;
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Fetch fresh user profile on mount
            fetchUserProfile().finally(() => {
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, []);

    const formatError = (errorResponse) => {
        if (!errorResponse) return "An unexpected error occurred.";
        
        // Handle simple string error
        if (typeof errorResponse === 'string') return errorResponse;
        
        // Handle DRF standard error formats
        if (errorResponse.detail) return errorResponse.detail;
        if (errorResponse.error) return errorResponse.error;
        if (errorResponse.message) return errorResponse.message;
        
        // Handle field validation errors (e.g., {"username": ["field required"]})
        if (typeof errorResponse === 'object') {
            const messages = [];
            for (const key in errorResponse) {
                const value = errorResponse[key];
                // Skip non-error technical fields if any
                if (Array.isArray(value)) {
                    // "username": ["This field is required."] -> "Username: This field is required."
                    const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ');
                    messages.push(`${formattedKey}: ${value.join(', ')}`);
                } else if (typeof value === 'string') {
                    const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ');
                    messages.push(`${formattedKey}: ${value}`);
                }
            }
            if (messages.length > 0) return messages.join('\n');
        }
        
        return "An unexpected error occurred. Please try again.";
    };

    const login = async (username, password) => {
        try {
            const response = await api.post('/auth/login/', { username, password });
            const { access, refresh, role } = response.data;

            localStorage.setItem('token', access);
            localStorage.setItem('refresh', refresh);

            // Fetch full user profile after login
            const userData = await fetchUserProfile();
            if (userData) {
                return { success: true, role: userData.role };
            }
            return { success: false, message: "Failed to fetch user profile" };
        } catch (error) {
            console.error("Login failed:", error);
            const errorMsg = formatError(error.response?.data);
            return {
                success: false,
                message: errorMsg
            };
        }
    };

    const signup = async (userData) => {
        try {
            await api.post('/auth/signup/', userData);
            return { success: true };
        } catch (error) {
            console.error("Signup failed:", error);
            const errorMsg = formatError(error.response?.data);
            return {
                success: false,
                message: errorMsg
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user');
        setUser(null);
    };

    const refreshUserProfile = async () => {
        return await fetchUserProfile();
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading, refreshUserProfile }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
