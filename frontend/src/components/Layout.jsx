import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, Menu } from 'lucide-react';

const Layout = () => {
    const { isDark, toggleTheme } = useTheme();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background text-tertiary dark:bg-gray-900 dark:text-gray-100 flex">
            {/* Sidebar with role-based navigation */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content */}
            <main className="flex-1 flex flex-col bg-background dark:bg-gray-900 min-h-screen">
                <header className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-8 bg-surface/50 dark:bg-gray-800/50 backdrop-blur-md sticky top-0 z-10 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 md:hidden rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Open menu"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <h2 className="text-lg font-medium">Welcome</h2>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        aria-label="Toggle theme"
                    >
                        {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-primary" />}
                    </button>
                </header>
                <div className="flex-1 p-8 bg-background dark:bg-gray-900 overflow-y-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;

