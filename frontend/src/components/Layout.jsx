import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    return (
        <div className="min-h-screen bg-background text-white flex">
            {/* Sidebar with role-based navigation */}
            <Sidebar />

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

export default Layout;

