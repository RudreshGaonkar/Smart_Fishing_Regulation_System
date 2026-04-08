import React from 'react';
import Navbar from '../components/Navbar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-600">
            {/* Sidebar nav persistent layout */}
            <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 hidden md:block shadow-sm">
                <Navbar />
            </div>

            {/* Mobile Nav Overlay placeholder */}
            <div className="md:hidden">
                <Navbar />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 md:ml-64 p-6 sm:p-10 transition-all overflow-y-auto">
                <div className="max-w-7xl mx-auto h-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
