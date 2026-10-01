import React, { useState } from 'react';
import { Phone, ShieldCheck, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface GooglePhoneModalProps {
  googleUser: {
    googleId: string;
    email: string;
    name: string;
    picture?: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export const GooglePhoneModal: React.FC<GooglePhoneModalProps> = ({
  googleUser,
  onSuccess,
  onCancel
}) => {
  const { sendOtp, completeGoogleRegistration } = useAuth();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'PHONE_INPUT' | 'OTP_INPUT'>('PHONE_INPUT');
  const [sessionId, setSessionId] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleSendMobileOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile phone number');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await sendOtp({
        purpose: 'register',
        name: googleUser.name,
        email: googleUser.email,
        phone: cleanPhone,
        password: password || 'GoogleAuthPass2026!'
      });

      setSessionId(res.sessionId);
      setInfo(res.message || 'OTP sent to your registered mobile number and email.');
      setStep('OTP_INPUT');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP to mobile number');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!otp || otp.length < 6) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await completeGoogleRegistration({
        googleId: googleUser.googleId,
        email: googleUser.email,
        name: googleUser.name,
        phone,
        password: password || 'GoogleAuthPass2026!',
        picture: googleUser.picture,
        otp,
        sessionId
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-white">
        
        <button
          onClick={onCancel}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Google User Profile Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full border-2 border-amber-500 overflow-hidden mx-auto shadow-lg">
            <img
              src={googleUser.picture || 'https://lh3.googleusercontent.com/a/default-user'}
              alt={googleUser.name}
              className="w-full h-full object-cover"
              onError={e => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <h2 className="text-xl font-display font-extrabold uppercase text-white">
            Complete Registration
          </h2>
          <p className="text-xs text-amber-400 font-medium">
            Authenticated via Google: <span className="text-white font-mono">{googleUser.email}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-950/80 border border-red-800 text-red-300 p-3 rounded-xl text-xs flex items-center justify-center space-x-2 text-center">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {info && !error && (
          <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 p-3 rounded-xl text-xs flex items-center justify-center space-x-2 text-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{info}</span>
          </div>
        )}

        {step === 'PHONE_INPUT' ? (
          <form onSubmit={handleSendMobileOtp} className="space-y-4 text-xs">
            <p className="text-slate-300 text-center">
              Please link your mobile phone number to complete your Youth Choice account creation.
            </p>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Mobile Phone Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 90326 44552"
                  required
                  autoFocus
                  className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-amber-500 font-mono text-sm"
                />
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-xl flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'SENDING OTP...' : 'VERIFY MOBILE NUMBER & SEND OTP'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndComplete} className="space-y-4 text-xs">
            <p className="text-slate-300 text-center">
              Enter the 6-digit OTP code sent to <strong className="text-amber-400 font-mono">{phone}</strong>.
            </p>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-center">6-Digit OTP Code</label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="123456"
                required
                autoFocus
                className="w-full bg-neutral-950 border-2 border-amber-500 text-center font-mono text-2xl font-bold text-amber-400 rounded-xl py-3 tracking-widest focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-xl flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'VERIFYING...' : 'VERIFY OTP & COMPLETE LOGIN'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
