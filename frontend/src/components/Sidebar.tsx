import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Calendar,
    Radio,
    FileText,
    User,
    Home,
    History,
    Camera,
    LogOut,
    X,
    ChevronLeft,
    ChevronRight,
    Zap
} from 'lucide-react';

interface NavItem {
    label: string;
    icon: React.ElementType;
    path: string;
}

interface SidebarProps {
    isOpen?: boolean;
    isCollapsed?: boolean;
    onClose?: () => void;
    toggleCollapse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    isOpen = false,
    isCollapsed = false,
    onClose,
    toggleCollapse
}) => {
    const { user, logout, loading } = useAuth() as any;
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

    const sidebarVariants = {
        expanded: { width: 280 },
        collapsed: { width: 80 }
    };

    if (loading) return null;

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                        onClick={onClose}
                    />
                )}
            </AnimatePresence>

            <motion.nav
                initial={false}
                animate={/* Mobile vs Desktop logic handled by layout classes mostly, but width animates here for desktop */
                    isCollapsed ? "collapsed" : "expanded"
                }
                variants={sidebarVariants}
                transition={{ duration: 0.4, type: "spring", stiffness: 100, damping: 20 }}
                className={`
                    fixed md:relative inset-y-0 left-0 z-50
                    bg-white dark:bg-gray-900 
                    border-r border-gray-200 dark:border-gray-800 
                    flex flex-col h-full
                    md:translate-x-0
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    transition-transform md:transition-none duration-300
                    shadow-2xl md:shadow-none
                    overflow-x-hidden
                `}
            >
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                    <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                </div>

                {/* Header */}
                <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} relative z-10`}>
                    <motion.div
                        layout
                        className="flex items-center gap-2 overflow-hidden"
                    >
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <Zap className="w-6 h-6 text-white" fill="white" />
                        </div>
                        {!isCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                className="whitespace-nowrap"
                            >
                                <h1 className="text-xl font-display font-bold text-gray-900 dark:text-white tracking-tight">
                                    MAHS
                                </h1>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Attendance</p>
                            </motion.div>
                        )}
                    </motion.div>


                    {/* Close (Mobile) */}
                    <button onClick={onClose} className="md:hidden text-gray-500">
                        <X />
                    </button>
                </div>

                {/* User Card (Mini) */}
                <div className={`mx-4 mb-6 p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} relative z-10 transition-all duration-300`}>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                        <User className="w-4 h-4 text-primary" />
                    </div>
                    {!isCollapsed && (
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.username}</p>
                            <p className="text-xs text-gray-500 truncate capitalize">{user?.role}</p>
                        </div>
                    )}
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar">
                    {!isCollapsed && <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 sticky top-0">Menu</p>}

                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`
                                    relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                                    ${isActive
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                                    }
                                    ${isCollapsed ? 'justify-center' : ''}
                                `}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="active-indicator"
                                        className="absolute inset-0 bg-primary rounded-xl z-0"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}

                                <Icon className={`w-5 h-5 relative z-10 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : ''}`} />

                                {!isCollapsed && (
                                    <span className={`text-sm font-medium relative z-10 whitespace-nowrap`}>
                                        {item.label}
                                    </span>
                                )}

                                {/* Hover Tooltip for Collapsed Mode */}
                                {isCollapsed && (
                                    <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-xl">
                                        {item.label}
                                        <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45 transform" />
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Footer / Logout */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 relative z-10">
                    <button
                        onClick={handleLogout}
                        className={`
                            w-full flex items-center rounded-xl p-3 transition-colors
                            ${isCollapsed ? 'justify-center' : 'gap-3'}
                            text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20
                        `}
                    >
                        <LogOut className="w-5 h-5" />
                        {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
                    </button>
                </div>
            </motion.nav>
        </>
    );
};

export default Sidebar;
