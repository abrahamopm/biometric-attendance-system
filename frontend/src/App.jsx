import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Login from './pages/auth/Login.jsx';
import Signup from './pages/auth/Signup.jsx';
// import VerifyEmail from './pages/auth/VerifyEmail.jsx'; // COMMENTED OUT - Email verification disabled
import StudentDashboard from './pages/student/Dashboard.jsx';
import HostDashboard from './pages/host/Dashboard.jsx';
import FaceEnroll from './pages/student/FaceEnroll.jsx';
import LiveAttendance from './pages/common/LiveAttendance.jsx';
import ProfilePage from './pages/common/ProfilePage';
import ManageEventsPage from './pages/host/ManageEventsPage';
import LiveTrackingPage from './pages/host/LiveTrackingPage';
import ReportsPage from './pages/host/ReportsPage';
import MyAttendancePage from './pages/student/MyAttendancePage';
import NotificationContainer from './components/NotificationContainer.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        if (user.role === 'host') {
            return <Navigate to="/host/dashboard" replace />;
        }
        return <Navigate to="/student/dashboard" replace />;
    }

    return <>{children}</>;
};

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                {/* Public routes - no layout */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                {/* <Route path="/verify-email" element={<VerifyEmail />} /> */} {/* COMMENTED OUT - Email verification disabled */}

                {/* Protected routes - with layout */}
                <Route path="/" element={<Layout />}>
                    <Route index element={<Navigate to="/login" replace />} />

                    {/* Student Routes */}
                    <Route
                        path="student/dashboard"
                        element={
                            <PrivateRoute allowedRoles={['student']}>
                                <StudentDashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="student/enroll"
                        element={
                            <PrivateRoute allowedRoles={['student']}>
                                <FaceEnroll />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="student/check-in"
                        element={
                            <PrivateRoute allowedRoles={['student']}>
                                <LiveAttendance />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="student/history"
                        element={
                            <PrivateRoute allowedRoles={['student']}>
                                <MyAttendancePage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="student/profile"
                        element={
                            <PrivateRoute allowedRoles={['student']}>
                                <ProfilePage />
                            </PrivateRoute>
                        }
                    />

                    {/* Host Routes */}
                    <Route
                        path="host/dashboard"
                        element={
                            <PrivateRoute allowedRoles={['host']}>
                                <HostDashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="host/events"
                        element={
                            <PrivateRoute allowedRoles={['host']}>
                                <ManageEventsPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="host/live"
                        element={
                            <PrivateRoute allowedRoles={['host']}>
                                <LiveTrackingPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="host/reports"
                        element={
                            <PrivateRoute allowedRoles={['host']}>
                                <ReportsPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="host/profile"
                        element={
                            <PrivateRoute allowedRoles={['host']}>
                                <ProfilePage />
                            </PrivateRoute>
                        }
                    />

                    {/* Common - Both roles can access */}
                    <Route
                        path="attendance/live"
                        element={
                            <PrivateRoute allowedRoles={['student', 'host']}>
                                <LiveAttendance />
                            </PrivateRoute>
                        }
                    />
                </Route>
            </Routes>
            <NotificationContainer />
        </Router>
    );
};

function App() {
    return (
        <ErrorBoundary>
            <NotificationProvider>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </NotificationProvider>
        </ErrorBoundary>
    );
}

export default App;
