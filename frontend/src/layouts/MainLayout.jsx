import React from 'react';
import Navbar from '../components/Navbar';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-600">
            {/* Sidebar acts as the Navbar */}
            <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 hidden md:block shadow-sm">
                <Navbar />
            </div>

            {/* Mobile Navbar overlay placeholder (optional enhancement) */}
            <div className="md:hidden">
                <Navbar />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 md:ml-64 p-6 md:p-10 transition-all overflow-y-auto">
                <div className="max-w-7xl mx-auto h-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
