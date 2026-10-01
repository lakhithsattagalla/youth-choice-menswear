import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@youthchoice.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await adminLogin(email, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 bg-gradient-to-br from-neutral-950 via-black to-neutral-950">
      <div className="max-w-md w-full bg-neutral-900/90 border border-amber-500/30 rounded-3xl p-8 space-y-6 shadow-2xl backdrop-blur-md">
        
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-black flex items-center justify-center font-bold text-2xl mx-auto shadow-lg shadow-amber-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-display font-extrabold text-white uppercase tracking-wider">Admin Portal Login</h1>
          <p className="text-xs text-amber-400 font-medium">Youth Choice Mens Wear • Executive Dashboard</p>
        </div>

        {error && (
          <div className="bg-red-950/90 border border-red-800 text-red-300 p-3 rounded-xl text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Admin Email or Phone Number</label>
            <div className="relative">
              <input 
                type="text" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@youthchoice.com or 9032644552"
                required
                className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl pl-10 pr-4 py-3.5 focus:outline-none focus:border-amber-500 text-xs"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-4" />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Admin Password</label>
            <div className="relative">
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl pl-10 pr-4 py-3.5 focus:outline-none focus:border-amber-500"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-4" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider py-4 rounded-xl shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all"
          >
            <span>{loading ? 'AUTHENTICATING...' : 'ACCESS ADMIN DASHBOARD'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl text-[11px] text-slate-400 space-y-1">
          <p className="text-amber-400 font-bold">Secure Admin Access Credentials:</p>
          <p>Email: <code className="text-white font-mono">admin@youthchoice.com</code></p>
          <p>Password: <code className="text-white font-mono">admin123</code></p>
        </div>

      </div>
    </div>
  );
};
