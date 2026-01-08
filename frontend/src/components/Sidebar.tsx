import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Calendar,
    FileText,
    User,
    Home,
    ScanFace,
    History,
    Camera,
    LogOut,
    Users,
    Settings
} from 'lucide-react';

interface NavItem {
    label: string;
    icon: React.ElementType;
    path: string;
}

interface UserType {
    username?: string;
    email?: string;
    role?: string;
}

const Sidebar: React.FC = () => {
    const auth = useAuth() as { user: UserType | null; logout: () => void; loading: boolean } | null;
    const user = auth?.user;
    const logout = auth?.logout;
    const loading = auth?.loading ?? true;
    const location = useLocation();
    const navigate = useNavigate();

    const hostMenuItems: NavItem[] = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/host/dashboard' },
        { label: 'Manage Events', icon: Calendar, path: '/host/events' },
        { label: 'Attendance Records', icon: Users, path: '/host/live' },
        { label: 'Reports', icon: FileText, path: '/host/reports' },
    ];

    const studentMenuItems: NavItem[] = [
        { label: 'Dashboard', icon: Home, path: '/student/dashboard' },
        { label: 'Check In', icon: ScanFace, path: '/student/check-in' },
        { label: 'My Attendance', icon: History, path: '/student/history' },
        { label: 'Face Data', icon: Camera, path: '/student/enroll' },
        { label: 'My Profile', icon: User, path: '/student/profile' },
    ];

    const menuItems = user?.role === 'host' ? hostMenuItems : studentMenuItems;

    const handleLogout = () => {
        if (logout) {
            logout();
        }
        navigate('/login');
    };

    if (loading) {
        return (
            <nav className="w-64 bg-[#1a1f37] p-6 hidden md:flex flex-col flex-shrink-0">
                <div className="mb-10">
                    <div className="h-8 w-32 bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-10 bg-gray-700 rounded animate-pulse"></div>
                    ))}
                </div>
            </nav>
        );
    }

    return (
        <nav className="w-64 bg-[#1a1f37] p-6 hidden md:flex flex-col flex-shrink-0 min-h-screen">
            {/* Logo */}
            <div className="mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-lg">B</span>
                    </div>
                    <span className="text-white font-semibold text-lg">Biometric</span>
                </div>
            </div>

            {/* User Info */}
            <div className="mb-8 pb-6 border-b border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm truncate">{user?.username || 'Admin User'}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.email || 'admin@example.com'}</p>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <div className="space-y-1 flex-1">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`
                                flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                                ${isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }
                            `}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <span className="font-medium text-sm">{item.label}</span>
                        </Link>
                    );
                })}
            </div>

            {/* Bottom Section */}
            <div className="pt-6 border-t border-gray-700 space-y-1">
                <Link
                    to={user?.role === 'host' ? '/host/profile' : '/student/profile'}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all"
                >
                    <Settings className="w-5 h-5" />
                    <span className="font-medium text-sm">Settings</span>
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium text-sm">Logout</span>
                </button>
            </div>
        </nav>
    );
};

export default Sidebar;
