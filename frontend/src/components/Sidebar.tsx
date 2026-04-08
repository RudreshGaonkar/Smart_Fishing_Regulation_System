import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Ship, 
  AlertTriangle, 
  ShieldAlert, 
  FileText 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard', roles: ['admin', 'fisherman', 'researcher'] },
    { to: '/simulation', icon: <Ship size={20} />, label: 'Simulation', roles: ['fisherman'] },
    { to: '/map', icon: <MapIcon size={20} />, label: 'Zone Map', roles: ['admin', 'fisherman', 'researcher'] },
    { to: '/alerts', icon: <AlertTriangle size={20} />, label: 'Alerts', roles: ['admin', 'fisherman', 'researcher'] },
    { to: '/admin', icon: <ShieldAlert size={20} />, label: 'Admin Panel', roles: ['admin'] },
    { to: '/reports', icon: <FileText size={20} />, label: 'Reports', roles: ['researcher'] },
  ];

  const visibleNavItems = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <aside className="w-64 h-[calc(100vh-2rem)] m-4 clay-card flex flex-col p-6 sticky top-4">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 clay-inset rounded-full flex items-center justify-center text-ocean-600">
          <Ship size={24} />
        </div>
        <h1 className="font-bold text-xl text-ocean-900 tracking-tight">Smart<span className="text-ocean-500">Fish</span></h1>
      </div>

      <nav className="flex flex-col gap-4 flex-1">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `px-4 py-3 rounded-2xl flex items-center gap-3 transition-all duration-300 font-medium ${
                isActive
                  ? 'clay-inset text-ocean-700 bg-ocean-100/50'
                  : 'text-slate-500 hover:text-ocean-600 hover:bg-white/20'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
      
      <div className="mt-auto pt-6 border-t border-white/30">
        <div className="clay-inset p-4 flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-ocean-200 flex items-center justify-center font-bold text-ocean-700 shadow-sm border border-white/50">
             {user?.name?.charAt(0).toUpperCase() || 'U'}
           </div>
           <div>
             <p className="text-sm font-semibold text-ocean-900">{user?.name || 'User Name'}</p>
             <p className="text-xs text-slate-500 capitalize">{user?.role || 'Fisherman'}</p>
           </div>
        </div>
      </div>
    </aside>
  );
};
