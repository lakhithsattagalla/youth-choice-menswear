import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { isTokenRevoked, logSecurityEvent } from '../services/security.js';

const JWT_SECRET = process.env.JWT_SECRET || 'youth_choice_mens_wear_jwt_secret_key_2026';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'CUSTOMER' | 'ADMIN';
    name: string;
    jti?: string;
  };
}

// Helper to extract JWT token from Authorization header or HttpOnly Cookie
function extractToken(req: Request): string | null {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  
  if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    if (cookies.token) {
      return cookies.token;
    }
  }

  return null;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired session. Please log in again.' });
    }

    if (user && user.jti && isTokenRevoked(user.jti)) {
      logSecurityEvent('UNAUTHORIZED_ACCESS', user.email || 'REVOKED_USER', req.ip || '', req.headers['user-agent'] || '', 'Attempted use of revoked JWT token');
      return res.status(401).json({ error: 'Session has been revoked. Please log in again.' });
    }

    req.user = user as AuthRequest['user'];
    next();
  });
};

export const requireRole = (role: 'CUSTOMER' | 'ADMIN') => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      logSecurityEvent(
        'UNAUTHORIZED_ACCESS',
        req.user?.email || 'ANONYMOUS',
        req.ip || '',
        req.headers['user-agent'] || '',
        `Insufficient permissions. Required: ${role}, Present: ${req.user?.role || 'NONE'}`
      );
      return res.status(403).json({ error: 'Access denied. You do not have permission to perform this action.' });
    }
    next();
  };
};

export const requireAdmin = requireRole('ADMIN');

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = extractToken(req);

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user: any) => {
      if (!err && user && (!user.jti || !isTokenRevoked(user.jti))) {
        req.user = user as AuthRequest['user'];
      }
      next();
    });
  } else {
    next();
  }
};
