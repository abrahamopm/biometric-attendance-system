import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

const Layout = () => {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-background text-white flex">
            {/* Sidebar (simplified for now) */}
            <nav className="w-64 bg-surface border-r border-gray-800 p-6 hidden md:block overflow-y-auto flex-shrink-0">
                <div className="mb-10">
                    <h1 className="text-2xl font-display font-bold text-primary tracking-wider">
                        BioAttend
                    </h1>
                </div>
                <div className="space-y-4">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-4">Student</div>
                    <NavLink to="/student/dashboard" label="Dashboard" />
                    <NavLink to="/student/enroll" label="Face Encryption" />
                    <NavLink to="/attendance/live" label="Live Check-In" />

                    <div className="mt-8 text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-4">Host</div>
                    <NavLink to="/host/dashboard" label="Host Console" />
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 flex flex-col bg-background min-h-screen">
                <header className="h-16 border-b border-gray-800 flex items-center justify-between px-8 bg-surface/50 backdrop-blur-md sticky top-0 z-10 flex-shrink-0">
                    <h2 className="text-lg font-medium">Welcome</h2>
                </header>
                <div className="flex-1 p-8 bg-background overflow-y-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

const NavLink = ({ to, label }) => (
    <Link to={to} className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-300 hover:text-white">
        {label}
    </Link>
);

export default Layout;
