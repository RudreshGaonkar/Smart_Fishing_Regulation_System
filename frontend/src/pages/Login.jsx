import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Anchor, Shield, TrendingUp, ChevronRight, Lock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const [selectedRole, setSelectedRole] = useState('Fisherman');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        setIsLoggingIn(true);

        setTimeout(() => {
            login(selectedRole);
            navigate(`/${selectedRole.toLowerCase()}`);
            setIsLoggingIn(false);
        }, 1200);
    };

    const roles = [
        { name: 'Fisherman', icon: Anchor },
        { name: 'Admin', icon: Shield },
        { name: 'Researcher', icon: TrendingUp }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            {/* Left Side: 60% Image Placeholder */}
            <div className="hidden lg:flex lg:w-[60%] relative bg-slate-900 overflow-hidden">
                <img 
                    src="https://images.unsplash.com/photo-1582967788606-a171c1080cb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" 
                    alt="Ocean Conservation" 
                    className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-[20s] hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-cyan-950/90 to-transparent flex flex-col justify-end p-16">
                    <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl w-fit mb-6 shadow-xl border border-white/30">
                        <Anchor className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
                        Preserving Our Oceans <br/> For Tomorrow.
                    </h2>
                    <p className="text-xl text-cyan-50 font-medium max-w-2xl leading-relaxed">
                        The EcoReg Platform provides data-driven maritime conservation, 
                        sustainable quota regulation, and advanced ecological monitoring.
                    </p>
                </div>
            </div>

            {/* Right Side: 40% Login Form */}
            <div className="w-full lg:w-[40%] flex items-center justify-center p-8 sm:p-12 xl:p-20 bg-white border-l border-slate-200">
                <div className="w-full max-w-sm">
                    <div className="mb-12">
                        <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Welcome Back</h1>
                        <p className="text-slate-500 font-medium text-lg">Sign in to your EcoReg account</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-8">
                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
                                Access Level
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {roles.map((role) => (
                                    <button
                                        key={role.name}
                                        type="button"
                                        onClick={() => setSelectedRole(role.name)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${
                                            selectedRole === role.name 
                                            ? 'bg-cyan-50 border-cyan-500 text-cyan-700 shadow-sm' 
                                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                    >
                                        <role.icon className={`w-5 h-5 mb-1.5 ${selectedRole === role.name ? 'text-cyan-600' : 'text-slate-400'}`} />
                                        <span className="text-[10px] font-bold uppercase tracking-wide">{role.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Input Fields */}
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Corporate Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input 
                                        type="email" 
                                        placeholder="user@fishing.gov" 
                                        value="demo@fishing.gov"
                                        readOnly
                                        className="w-full bg-white border border-slate-300 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <label className="block text-sm font-medium text-slate-700">Password</label>
                                    <a href="#" className="text-xs font-semibold text-cyan-600 hover:text-cyan-700">Forgot?</a>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input 
                                        type="password" 
                                        placeholder="••••••••" 
                                        value="password"
                                        readOnly
                                        className="w-full bg-white border border-slate-300 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-transparent transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoggingIn}
                            className={`w-full mt-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 ${
                                isLoggingIn 
                                ? 'bg-cyan-400 text-white cursor-not-allowed shadow-none' 
                                : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-md hover:shadow-xl focus:ring-4 focus:ring-cyan-100'
                            }`}
                        >
                            {isLoggingIn ? (
                                <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Authenticate Access <ChevronRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                    
                    <div className="mt-12 pt-8 border-t border-slate-100 text-center">
                        <p className="text-xs text-slate-400 font-medium">
                            &copy; 2026 Atlantic Conservation Foundation.<br/> All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
