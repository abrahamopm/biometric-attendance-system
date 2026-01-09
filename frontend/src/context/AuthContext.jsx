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
            return {
                success: false,
                message: error.response?.data?.error || "Login failed"
            };
        }
    };

    const signup = async (userData) => {
        try {
            await api.post('/auth/signup/', userData);
            return { success: true };
        } catch (error) {
            console.error("Signup failed:", error);
            return {
                success: false,
                message: JSON.stringify(error.response?.data)
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
