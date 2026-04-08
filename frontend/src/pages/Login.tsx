import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Ship, Lock, Mail } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ocean-50 p-4 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-ocean-200/40 rounded-full blur-3xl shadow-[inset_10px_10px_50px_rgba(255,255,255,0.8)] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-ocean-300/30 rounded-full blur-3xl shadow-[inset_10px_10px_50px_rgba(255,255,255,0.8)] pointer-events-none"></div>

      <div className="w-full max-w-md clay-card p-8 flex flex-col items-center z-10">
        <div className="w-20 h-20 clay-inset rounded-full flex items-center justify-center text-ocean-600 mb-6 shadow-sm">
          <Ship size={36} />
        </div>
        <h2 className="text-3xl font-extrabold text-ocean-900 tracking-tight mb-2">Smart<span className="text-ocean-500">Fish</span></h2>
        
        {error && <div className="w-full bg-red-100 text-red-600 p-3 rounded-lg text-sm mb-4 font-bold text-center border border-red-200 shadow-inner">{error}</div>}
        
        <p className="text-slate-500 mb-6 text-center text-sm px-4">Enter your credentials to access the cooperative regulation system</p>
        
        <form onSubmit={handleLogin} className="w-full flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-ocean-800 ml-2">Email Address</label>
            <div className="clay-inset h-14 rounded-2xl flex items-center px-4 gap-3 focus-within:shadow-[inset_4px_4px_8px_#b6cedd,inset_-4px_-4px_8px_#ffffff,0_0_0_2px_rgba(14,165,233,0.3)] transition-all">
              <Mail className="text-ocean-500/70" size={20} />
              <input 
                type="email" 
                className="bg-transparent border-none outline-none w-full text-slate-700 placeholder:text-slate-400 font-medium"
                placeholder="fisher@smartfish.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-ocean-800 ml-2">Password</label>
            <div className="clay-inset h-14 rounded-2xl flex items-center px-4 gap-3 focus-within:shadow-[inset_4px_4px_8px_#b6cedd,inset_-4px_-4px_8px_#ffffff,0_0_0_2px_rgba(14,165,233,0.3)] transition-all">
              <Lock className="text-ocean-500/70" size={20} />
              <input 
                type="password" 
                className="bg-transparent border-none outline-none w-full text-slate-700 placeholder:text-slate-400 font-medium"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="clay-button h-14 mt-4 text-lg bg-gradient-to-br from-ocean-50 to-ocean-100 text-ocean-800 hover:text-ocean-900 border-white/60">
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-500">
           Don't have an account? <a href="/register" className="text-ocean-600 font-bold hover:underline">Register here</a>
        </p>
      </div>
    </div>
  );
};
