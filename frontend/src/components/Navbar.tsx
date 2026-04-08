import React from 'react';
import { Bell, Search, Menu, LogOut } from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { alerts } = useAlert();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-20 clay-card mx-4 mt-4 px-6 flex items-center justify-between sticky top-4 z-10">
      <div className="flex items-center gap-4">
        <button className="clay-button w-10 h-10 md:hidden">
          <Menu size={20} />
        </button>
        <div className="clay-inset h-10 w-64 hidden md:flex items-center px-4 gap-2">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative w-12 h-12 clay-button rounded-full">
          <Bell size={20} className="text-ocean-600" />
          {alerts.length > 0 && (
            <span className="absolute top-2 right-2 w-3 h-3 bg-red-400 border border-white rounded-full animate-pulse shadow-[0_0_8px_rgba(248,113,113,0.8)]"></span>
          )}
        </button>
        <button onClick={handleLogout} className="clay-button px-6 py-2 flex items-center gap-2 text-ocean-700 hover:text-red-500">
          <LogOut size={16} />
          <span className="font-bold">Logout</span>
        </button>
      </div>
    </header>
  );
};
