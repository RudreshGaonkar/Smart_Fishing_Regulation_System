import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Ship, Lock, Mail, User, Briefcase } from 'lucide-react';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'fisherman' as 'fisherman' | 'researcher'
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      await register(formData.name, formData.email, formData.password, formData.role);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ocean-50 p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-ocean-200/40 rounded-full blur-3xl shadow-[inset_10px_10px_50px_rgba(255,255,255,0.8)] pointer-events-none"></div>

      <div className="w-full max-w-md clay-card p-8 flex flex-col items-center z-10">
        <div className="w-16 h-16 clay-inset rounded-full flex items-center justify-center text-ocean-600 mb-4 shadow-sm">
          <Ship size={30} />
        </div>
        <h2 className="text-3xl font-extrabold text-ocean-900 tracking-tight mb-2">Join Smart<span className="text-ocean-500">Fish</span></h2>
        
        {error && <div className="w-full bg-red-100 text-red-600 p-3 rounded-lg text-sm mb-4 font-bold text-center border border-red-200 shadow-inner">{error}</div>}

        <form onSubmit={handleRegister} className="w-full flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-ocean-800 ml-2">Full Name</label>
            <div className="clay-inset h-12 rounded-2xl flex items-center px-4 gap-3 focus-within:shadow-[inset_4px_4px_8px_#b6cedd,inset_-4px_-4px_8px_#ffffff,0_0_0_2px_rgba(14,165,233,0.3)] transition-all">
              <User className="text-ocean-500/70" size={18} />
              <input type="text" name="name" className="bg-transparent border-none outline-none w-full text-slate-700 placeholder:text-slate-400 font-medium text-sm" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-ocean-800 ml-2">Email Address</label>
            <div className="clay-inset h-12 rounded-2xl flex items-center px-4 gap-3 focus-within:shadow-[inset_4px_4px_8px_#b6cedd,inset_-4px_-4px_8px_#ffffff,0_0_0_2px_rgba(14,165,233,0.3)] transition-all">
              <Mail className="text-ocean-500/70" size={18} />
              <input type="email" name="email" className="bg-transparent border-none outline-none w-full text-slate-700 placeholder:text-slate-400 font-medium text-sm" placeholder="fisher@smartfish.gov" value={formData.email} onChange={handleChange} required />
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-ocean-800 ml-2">Password</label>
            <div className="clay-inset h-12 rounded-2xl flex items-center px-4 gap-3 focus-within:shadow-[inset_4px_4px_8px_#b6cedd,inset_-4px_-4px_8px_#ffffff,0_0_0_2px_rgba(14,165,233,0.3)] transition-all">
              <Lock className="text-ocean-500/70" size={18} />
              <input type="password" name="password" className="bg-transparent border-none outline-none w-full text-slate-700 placeholder:text-slate-400 font-medium text-sm" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-ocean-800 ml-2">Role</label>
            <div className="clay-inset h-12 rounded-2xl flex items-center px-4 gap-3 relative focus-within:shadow-[inset_4px_4px_8px_#b6cedd,inset_-4px_-4px_8px_#ffffff,0_0_0_2px_rgba(14,165,233,0.3)] transition-all">
              <Briefcase className="text-ocean-500/70" size={18} />
              <select name="role" value={formData.role} onChange={handleChange} className="bg-transparent border-none outline-none w-full text-slate-700 font-medium appearance-none z-10 cursor-pointer text-sm">
                <option value="fisherman">Fisherman</option>
                <option value="researcher">Researcher</option>
              </select>
               <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-ocean-500 text-xs">▼</div>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="clay-button h-14 mt-2 text-lg bg-gradient-to-br from-ocean-50 to-ocean-100 text-ocean-800 hover:text-ocean-900 border-white/60">
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-500">
           Already have an account? <Link to="/login" className="text-ocean-600 font-bold hover:underline">Sign In here</Link>
        </p>
      </div>
    </div>
  );
};
