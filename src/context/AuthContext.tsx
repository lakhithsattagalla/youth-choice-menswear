import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../services/api';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'CUSTOMER' | 'ADMIN';
  gender?: string;
  dob?: string;
  profile_img?: string;
}

export interface OtpResponse {
  success: boolean;
  sessionId: string;
  email: string;
  phone: string;
  message: string;
  delivery?: {
    email: boolean;
    sms: boolean;
  };
}

export interface GoogleAuthResult {
  isNewUser: boolean;
  googleUser?: {
    googleId: string;
    email: string;
    name: string;
    picture?: string;
  };
  token?: string;
  user?: UserProfile;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  adminLogin: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  sendOtp: (payload: any) => Promise<OtpResponse>;
  verifyOtp: (sessionId: string, otp: string) => Promise<void>;
  resendOtp: (sessionId: string) => Promise<OtpResponse>;
  loginWithGoogle: (payload: any) => Promise<GoogleAuthResult>;
  completeGoogleRegistration: (payload: any) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (token) {
      apiRequest('/auth/me')
        .then(res => {
          setUser(res.user);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, pass: string) => {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass })
    });
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const sendOtp = async (payload: any): Promise<OtpResponse> => {
    return await apiRequest('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  };

  const verifyOtp = async (sessionId: string, otp: string) => {
    const res = await apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ sessionId, otp })
    });
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const resendOtp = async (sessionId: string): Promise<OtpResponse> => {
    return await apiRequest('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ sessionId })
    });
  };

  const loginWithGoogle = async (payload: any): Promise<GoogleAuthResult> => {
    const res = await apiRequest('/auth/google/verify', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (!res.isNewUser && res.token) {
      localStorage.setItem('token', res.token);
      setToken(res.token);
      setUser(res.user);
    }

    return res;
  };

  const completeGoogleRegistration = async (payload: any) => {
    const res = await apiRequest('/auth/google/complete-profile', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const adminLogin = async (email: string, pass: string) => {
    const res = await apiRequest('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass })
    });
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (data: any) => {
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    apiRequest('/auth/logout', { method: 'POST' }).catch(() => {});
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    const res = await apiRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    setUser(res.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        adminLogin,
        register,
        sendOtp,
        verifyOtp,
        resendOtp,
        loginWithGoogle,
        completeGoogleRegistration,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
