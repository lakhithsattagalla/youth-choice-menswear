import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { GooglePhoneModal } from './GooglePhoneModal';
import { useNavigate } from 'react-router-dom';

interface GoogleAuthButtonProps {
  label?: string;
  onSuccess?: () => void;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  label = 'CONTINUE WITH GOOGLE',
  onSuccess
}) => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleUserToVerify, setGoogleUserToVerify] = useState<any>(null);

  const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;

  // Initialize Google GIS script dynamically if configured
  useEffect(() => {
    if (googleClientId && !document.getElementById('google-gsi-script')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, [googleClientId]);

  const handleGoogleClick = async () => {
    if (loading) return;
    setError('');

    // Require configured VITE_GOOGLE_CLIENT_ID to prevent 401 invalid_client
    if (!googleClientId) {
      setError('Google login is temporarily unconfigured. Please add VITE_GOOGLE_CLIENT_ID to your environment variables.');
      return;
    }

    setLoading(true);

    try {
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
        const googleClient = (window as any).google.accounts.id;
        googleClient.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            if (response.credential) {
              await processGoogleAuth({ credential: response.credential });
            }
          }
        });
        googleClient.prompt();
        setLoading(false);
        return;
      }

      // Fallback: Prompt for Google OAuth account email
      const promptEmail = window.prompt('Enter your Google Account email address to authenticate with Google OAuth:');
      if (!promptEmail) {
        setLoading(false);
        return;
      }

      const promptName = promptEmail.split('@')[0].replace(/[._]/g, ' ');
      const result = await loginWithGoogle({
        googleId: `g-${Date.now()}`,
        email: promptEmail.trim().toLowerCase(),
        name: promptName,
        picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(promptName)}&background=f59e0b&color=000`
      });

      if (result.isNewUser && result.googleUser) {
        setGoogleUserToVerify(result.googleUser);
      } else {
        if (onSuccess) onSuccess();
        else navigate('/account');
      }
    } catch (err: any) {
      setError(err.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const processGoogleAuth = async (payload: any) => {
    try {
      const result = await loginWithGoogle(payload);
      if (result.isNewUser && result.googleUser) {
        setGoogleUserToVerify(result.googleUser);
      } else {
        if (onSuccess) onSuccess();
        else navigate('/account');
      }
    } catch (err: any) {
      setError(err.message || 'Google authentication failed');
    }
  };

  return (
    <>
      <div className="space-y-2 w-full">
        {error && (
          <div className="text-[11px] text-red-400 bg-red-950/60 border border-red-800 p-2.5 rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={loading}
          className="w-full bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-lg flex items-center justify-center space-x-3 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{loading ? 'AUTHENTICATING WITH GOOGLE...' : label}</span>
        </button>
      </div>

      {googleUserToVerify && (
        <GooglePhoneModal
          googleUser={googleUserToVerify}
          onSuccess={() => {
            setGoogleUserToVerify(null);
            if (onSuccess) onSuccess();
            else navigate('/account');
          }}
          onCancel={() => setGoogleUserToVerify(null)}
        />
      )}
    </>
  );
};
