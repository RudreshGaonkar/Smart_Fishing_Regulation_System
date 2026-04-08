import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const Layout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-ocean-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pr-4">
        <Navbar />
        <main className="flex-1 p-6 mt-2 overflow-y-auto w-full max-w-7xl mx-auto">
          {/* Outlet is where the nested routes will render their components */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};
