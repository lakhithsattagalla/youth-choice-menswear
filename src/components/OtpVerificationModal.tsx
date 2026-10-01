import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, RefreshCw, AlertCircle, CheckCircle2, X, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface OtpVerificationModalProps {
  sessionId: string;
  email: string;
  phone: string;
  purpose: 'login' | 'register';
  initialMessage?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  sessionId: initialSessionId,
  email,
  phone,
  purpose,
  initialMessage,
  onSuccess,
  onCancel
}) => {
  const { verifyOtp, resendOtp } = useAuth();

  const [sessionId, setSessionId] = useState(initialSessionId);
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState(initialMessage || 'OTP sent to your registered mobile number and email address.');

  // 5-minute (300 seconds) OTP expiration timer
  const [expiryTimeLeft, setExpiryTimeLeft] = useState(300);
  
  // 60-second Resend cooldown timer
  const [resendCooldown, setResendCooldown] = useState(60);

  // Expiration countdown
  useEffect(() => {
    if (expiryTimeLeft <= 0) return;
    const timer = setInterval(() => {
      setExpiryTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setErrorMsg('OTP has expired. Please request a new OTP.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [expiryTimeLeft]);

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Format seconds into mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDigitChange = (index: number, value: string) => {
    const cleanVal = value.replace(/[^0-9]/g, '');
    if (!cleanVal) {
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
      return;
    }

    // Handle paste of 6 digits
    if (cleanVal.length === 6) {
      const pastedDigits = cleanVal.split('');
      setDigits(pastedDigits);
      inputRefs.current[5]?.focus();
      return;
    }

    // Single digit input
    const singleDigit = cleanVal.charAt(cleanVal.length - 1);
    const newDigits = [...digits];
    newDigits[index] = singleDigit;
    setDigits(newDigits);

    // Auto-advance focus to next input
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').trim();
    if (pastedData.length >= 6) {
      const sixDigits = pastedData.slice(0, 6).split('');
      setDigits(sixDigits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const otpCode = digits.join('');
    if (otpCode.length < 6) {
      setErrorMsg('Invalid OTP. Please enter the full 6-digit code.');
      return;
    }

    if (expiryTimeLeft <= 0) {
      setErrorMsg('OTP has expired. Please request a new OTP.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await verifyOtp(sessionId, otpCode);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;

    setResending(true);
    setErrorMsg('');

    try {
      const res = await resendOtp(sessionId);
      if (res.sessionId) {
        setSessionId(res.sessionId);
      }
      setDigits(Array(6).fill(''));
      setExpiryTimeLeft(300); // Reset 5-minute countdown
      setResendCooldown(60); // Reset 60-second cooldown
      setInfoMsg(res.message || 'OTP sent to your registered mobile number and email address.');
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setErrorMsg(err.message || 'Please wait before requesting another OTP.');
    } finally {
      setResending(false);
    }
  };

  // Mask email and phone for user privacy
  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(?=@)/, (_, b, c) => b + '*'.repeat(c.length))
    : '';
  const maskedPhone = phone
    ? phone.slice(0, 3) + '*'.repeat(Math.max(0, phone.length - 5)) + phone.slice(-2)
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-white">
        
        {/* Close Modal */}
        <button
          onClick={onCancel}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-display font-extrabold uppercase tracking-wide text-white">
            Verify Your Account
          </h2>
          <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
            Enter the 6-digit OTP sent to your registered mobile number and email.
          </p>

          <div className="pt-1 text-[11px] text-amber-400 font-semibold space-x-1">
            <span>Sent to:</span>
            <span className="text-white font-mono">{maskedPhone || 'Mobile'}</span>
            <span>&</span>
            <span className="text-white font-mono">{maskedEmail || 'Email'}</span>
          </div>
        </div>

        {/* Info Banner */}
        {infoMsg && !errorMsg && (
          <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 p-3 rounded-xl text-xs flex items-center justify-center space-x-2 text-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* Error Banner */}
        {errorMsg && (
          <div className="bg-red-950/80 border border-red-800 text-red-300 p-3 rounded-xl text-xs flex items-center justify-center space-x-2 text-center">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 6-Digit Form Input */}
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-center items-center space-x-2 sm:space-x-3">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={el => { inputRefs.current[idx] = el; }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={e => handleDigitChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                autoFocus={idx === 0}
                className="w-11 h-13 sm:w-12 sm:h-14 bg-neutral-950 border-2 border-neutral-700 focus:border-amber-500 text-center font-mono text-2xl font-bold text-amber-400 rounded-xl focus:outline-none transition-all shadow-inner"
              />
            ))}
          </div>

          {/* Countdown Timer */}
          <div className="text-center">
            <p className="text-xs text-slate-400 font-mono">
              {expiryTimeLeft > 0 ? (
                <span>OTP expires in <strong className="text-amber-400 font-bold">{formatTime(expiryTimeLeft)}</strong></span>
              ) : (
                <span className="text-red-400 font-semibold">OTP has expired</span>
              )}
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || expiryTimeLeft <= 0 || digits.join('').length < 6}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-xl shadow-amber-500/10 flex items-center justify-center space-x-2 transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{loading ? 'VERIFYING OTP...' : 'VERIFY OTP'}</span>
          </button>
        </form>

        {/* Resend Section */}
        <div className="text-center text-xs space-y-1.5 border-t border-neutral-800 pt-4">
          <p className="text-slate-400">Didn't receive the OTP?</p>
          <button
            type="button"
            disabled={resendCooldown > 0 || resending}
            onClick={handleResend}
            className={`inline-flex items-center space-x-1.5 font-bold transition-all ${
              resendCooldown > 0 || resending
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-amber-400 hover:text-amber-300 hover:underline cursor-pointer'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
            <span>
              {resending
                ? 'Sending new OTP...'
                : resendCooldown > 0
                ? `Resend OTP in ${resendCooldown}s`
                : 'Resend OTP'}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
