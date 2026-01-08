import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Calendar,
    Radio,
    FileText,
    User,
    Home,
    History,
    Camera,
    LogOut
} from 'lucide-react';

interface NavItem {
    label: string;
    icon: React.ElementType;
    path: string;
}

const Sidebar: React.FC = () => {
    const { user, logout, loading } = useAuth() as unknown as {
        user: any;
        logout: () => void;
        loading: boolean;
        refreshUserProfile: () => Promise<any>;
    };
    const location = useLocation();
    const navigate = useNavigate();

    const hostMenuItems: NavItem[] = [
        { label: 'Overview', icon: LayoutDashboard, path: '/host/dashboard' },
        { label: 'Manage Events', icon: Calendar, path: '/host/events' },
        { label: 'Live Tracking', icon: Radio, path: '/host/live' },
        { label: 'Reports', icon: FileText, path: '/host/reports' },
        { label: 'My Profile', icon: User, path: '/host/profile' },
    ];

    const studentMenuItems: NavItem[] = [
        { label: 'Dashboard', icon: Home, path: '/student/dashboard' },
        { label: 'My Attendance', icon: History, path: '/student/history' },
        { label: 'Face Data', icon: Camera, path: '/student/enroll' },
        { label: 'My Profile', icon: User, path: '/student/profile' },
    ];

    const menuItems = user?.role === 'host' ? hostMenuItems : studentMenuItems;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <nav className="w-64 bg-surface border-r border-gray-800 p-6 hidden md:block overflow-y-auto flex-shrink-0">
                <div className="mb-10">
                    <div className="h-8 w-32 bg-gray-800 rounded animate-pulse"></div>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-10 bg-gray-800 rounded animate-pulse"></div>
                    ))}
                </div>
            </nav>
        );
    }

    return (
        <nav className="w-64 bg-surface dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6 hidden md:block overflow-y-auto flex-shrink-0 flex flex-col">
            {/* Logo */}
            <div className="mb-10">
                <h1 className="text-2xl font-display font-bold text-primary tracking-wider">
                    MAHS
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {user?.role === 'host' ? 'Host Portal' : 'Student Portal'}
                </p>
            </div>

            {/* User Info */}
            <div className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 dark:bg-primary/30 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{user?.username}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <div className="space-y-2 flex-1">
                <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 px-3">
                    Navigation
                </div>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`
                                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                                ${isActive
                                    ? 'bg-primary/10 text-primary border border-primary/30'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary border border-transparent'
                                }
                            `}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <span className="font-medium text-sm">{item.label}</span>
                        </Link>
                    );
                })}
            </div>

            {/* Logout Button */}
            <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-500/10 hover:text-red-500 transition-all border border-transparent hover:border-red-500/30"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium text-sm">Logout</span>
                </button>
            </div>
        </nav>
    );
};

export default Sidebar;
