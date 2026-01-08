import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar.jsx';

const Layout = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#f8f9fc] flex">
            {/* Sidebar - Desktop */}
            <Sidebar />

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <div className="fixed left-0 top-0 bottom-0 w-64 z-50 md:hidden">
                        <Sidebar />
                    </div>
                </>
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen">
                {/* Top Navbar */}
                <Navbar 
                    onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
                    mobileMenuOpen={mobileMenuOpen}
                />

                {/* Page Content */}
                <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
