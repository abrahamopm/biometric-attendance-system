import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, Menu, PanelLeftClose, PanelLeftOpen, Search, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
    const { isDark, toggleTheme } = useTheme();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile
    const [isCollapsed, setIsCollapsed] = useState(false); // Desktop

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 selection:bg-primary/20">
            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                isCollapsed={isCollapsed}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out relative">

                {/* Floating/Sticky Navbar */}
                <header className="sticky top-0 z-40 px-6 py-4">
                    <div className="
                        bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-800 
                        shadow-lg shadow-gray-200/50 dark:shadow-gray-950/50
                        rounded-2xl h-16 flex items-center justify-between px-4 transition-all
                    ">

                        {/* Left: Toggles & Title */}
                        <div className="flex items-center gap-4">
                            {/* Mobile Toggle */}
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-2 md:hidden rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </button>

                            {/* Desktop Collapse Toggle */}
                            <button
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                className="hidden md:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                            >
                                {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
                            </button>

                            {/* Search Bar (Fake) */}
                            <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg border border-transparent focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                                <Search className="w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="bg-transparent border-none outline-none text-sm w-48 placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-3">
                            <button className="p-2 relative rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900" />
                            </button>

                            <div className="h-6 w-px bg-gray-200 dark:bg-gray-800" />

                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
                            >
                                {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content Scroll Area */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 pt-2 scroll-smooth">
                    <div className="max-w-7xl mx-auto pb-10">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
