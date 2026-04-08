import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Anchor, Shield, TrendingUp, LogOut, Settings } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const allLinks = [
        { name: 'Fisherman Tools', path: '/fisherman', icon: Anchor, roleAccess: 'Fisherman' },
        { name: 'Admin Console', path: '/admin', icon: Shield, roleAccess: 'Admin' },
        { name: 'Analytics', path: '/researcher', icon: TrendingUp, roleAccess: 'Researcher' },
    ];

    // Filter links: Only show the link that matches the user's role.
    const navLinks = allLinks.filter(link => link.roleAccess === user?.role);

    return (
        <aside className="h-full flex flex-col justify-between bg-white w-full border-r border-slate-200">
            {/* Top Logo Area */}
            <div className="p-6">
                <div className="flex items-center gap-3">
                    <div className="bg-cyan-600 p-2 rounded-xl shadow-sm">
                        <Anchor className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <span className="text-2xl font-bold tracking-tighter text-slate-900 block leading-none pt-1">EcoReg</span>
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block pt-1">Conservation Dept</span>
                    </div>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-4">
                    Dashboard Menu
                </div>

                {navLinks.map((link) => (
                    <NavLink
                        key={link.name}
                        to={link.path}
                        className={({ isActive }) => 
                            `flex items-center gap-3 p-4 rounded-xl text-sm font-semibold transition-all relative ${
                                isActive 
                                ? 'bg-cyan-50 text-cyan-600 shadow-sm border border-cyan-100' 
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <span className="absolute left-[-16px] top-[10%] bottom-[10%] w-1 bg-cyan-600 rounded-r-full shadow-sm" />
                                )}
                                <link.icon className={`w-5 h-5 ${isActive ? 'text-cyan-600' : 'text-slate-400'}`} />
                                {link.name}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* User Info & Logout (Bottom) */}
            <div className="p-4 border-t border-slate-100">
                <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="w-9 h-9 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold shadow-sm">
                        {user?.role?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate tracking-tight">
                            {user?.name || 'System User'}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate uppercase filter-none font-bold tracking-wider">{user?.role || 'Guest'}</p>
                    </div>
                </div>

                <div className="mt-3 flex gap-2">
                    <button 
                        className="flex-1 flex items-center justify-center p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="flex-1 flex items-center justify-center p-2.5 text-rose-500 hover:text-white hover:bg-rose-500 rounded-xl transition-colors border border-transparent hover:border-rose-500 shadow-sm"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Navbar;
