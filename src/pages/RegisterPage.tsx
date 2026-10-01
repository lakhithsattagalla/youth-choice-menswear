import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { OtpVerificationModal } from '../components/OtpVerificationModal';
import { GoogleAuthButton } from '../components/GoogleAuthButton';

export const RegisterPage: React.FC = () => {
  const { sendOtp } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('MALE');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [otpState, setOtpState] = useState<{
    sessionId: string;
    email: string;
    phone: string;
    message?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent double submission

    setError('');
    setLoading(true);

    try {
      const res = await sendOtp({
        purpose: 'register',
        name,
        email,
        phone,
        password,
        gender
      });

      setOtpState({
        sessionId: res.sessionId,
        email: res.email,
        phone: res.phone,
        message: res.message
      });
    } catch (err: any) {
      setError(err.message || "We couldn't send the OTP right now. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-8 space-y-6 shadow-2xl">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center font-serif text-black font-bold text-2xl mx-auto">
            YC
          </div>
          <h1 className="text-2xl font-display font-extrabold text-white uppercase">Create Account</h1>
          <p className="text-xs text-slate-400">Join Youth Choice Mens Wear for exclusive drops & order tracking.</p>
        </div>

        {error && (
          <div className="bg-red-950/80 border border-red-800 text-red-300 p-3 rounded-xl text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
            <div className="relative">
              <input 
                type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. John Doe"
                className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-amber-500"
              />
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
            <div className="relative">
              <input 
                type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="john@example.com"
                className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-amber-500"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
            <div className="relative">
              <input 
                type="text" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="+91 91234 56789"
                className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-amber-500"
              />
              <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Password</label>
            <div className="relative">
              <input 
                type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Create password"
                className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-amber-500"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-xl shadow-amber-500/10 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <span>{loading ? 'SENDING OTP...' : 'REGISTER & VERIFY OTP'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-neutral-800 w-full" />
          <span className="bg-neutral-900 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest absolute">
            OR
          </span>
        </div>

        {/* Google OAuth Register */}
        <GoogleAuthButton label="SIGN UP WITH GOOGLE" />

        <div className="text-center text-xs text-slate-400 border-t border-neutral-800 pt-4">
          <span>Already registered? </span>
          <Link to="/login" className="text-amber-400 font-bold hover:underline">
            Log In Here
          </Link>
        </div>

      </div>

      {otpState && (
        <OtpVerificationModal
          sessionId={otpState.sessionId}
          email={otpState.email}
          phone={otpState.phone}
          initialMessage={otpState.message}
          purpose="register"
          onSuccess={() => navigate('/account')}
          onCancel={() => setOtpState(null)}
        />
      )}
    </div>
  );
};
