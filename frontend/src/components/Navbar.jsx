import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, ChevronDown, User, Settings, LogOut, Menu, X } from 'lucide-react';

const Navbar = ({ onMobileMenuToggle, mobileMenuOpen }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    const notifications = [
        { id: 1, title: 'New attendance recorded', time: '2 min ago', read: false },
        { id: 2, title: 'Event started', time: '1 hour ago', read: false },
        { id: 3, title: 'Weekly report ready', time: '3 hours ago', read: true },
    ];

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Searching for:', searchQuery);
    };

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
            <button 
                className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={onMobileMenuToggle}
            >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4 hidden sm:block">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search for users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-100 border-0 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                </div>
            </form>

            <div className="flex items-center gap-2 md:gap-4">
                <button className="sm:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                    <Search className="w-5 h-5" />
                </button>

                <div className="relative">
                    <button 
                        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-medium">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                            <div className="px-4 py-2 border-b border-gray-100">
                                <h3 className="font-semibold text-gray-900">Notifications</h3>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {notifications.map((notification) => (
                                    <div key={notification.id} className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50/50' : ''}`}>
                                        <div className="flex items-start gap-3">
                                            {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>}
                                            <div className={!notification.read ? '' : 'ml-5'}>
                                                <p className="text-sm text-gray-900">{notification.title}</p>
                                                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="px-4 py-2 border-t border-gray-100">
                                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="relative">
                    <button 
                        className="flex items-center gap-2 md:gap-3 p-1.5 hover:bg-gray-100 rounded-xl transition-colors"
                        onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
                    >
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-medium text-gray-900">{user?.username || 'User'}</p>
                            <p className="text-xs text-gray-500 capitalize">{user?.role || 'Student'}</p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
                    </button>

                    {showProfileMenu && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                            <div className="px-4 py-3 border-b border-gray-100">
                                <p className="font-medium text-gray-900">{user?.username}</p>
                                <p className="text-sm text-gray-500">{user?.email}</p>
                            </div>
                            <div className="py-1">
                                <Link to={user?.role === 'host' ? '/host/profile' : '/student/profile'} className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setShowProfileMenu(false)}>
                                    <User className="w-4 h-4" /><span className="text-sm">My Profile</span>
                                </Link>
                                <Link to={user?.role === 'host' ? '/host/profile' : '/student/profile'} className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setShowProfileMenu(false)}>
                                    <Settings className="w-4 h-4" /><span className="text-sm">Settings</span>
                                </Link>
                            </div>
                            <div className="border-t border-gray-100 py-1">
                                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 w-full">
                                    <LogOut className="w-4 h-4" /><span className="text-sm">Logout</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {(showNotifications || showProfileMenu) && (
                <div className="fixed inset-0 z-40" onClick={() => { setShowNotifications(false); setShowProfileMenu(false); }} />
            )}
        </header>
    );
};

export default Navbar;
