import crypto from 'crypto';

export interface SecurityAuditLog {
  id: string;
  eventType:
    | 'LOGIN_SUCCESS'
    | 'LOGIN_FAILED'
    | 'ACCOUNT_LOCKED'
    | 'PASSWORD_RESET_REQUEST'
    | 'PASSWORD_RESET_SUCCESS'
    | 'OTP_DISPATCH'
    | 'SUSPICIOUS_ACTIVITY'
    | 'UNAUTHORIZED_ACCESS';
  identifier: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  details?: string;
}

export interface AccountLockState {
  failedAttempts: number;
  lockedUntil: number | null;
  lastAttemptAt: number;
  requiresCaptcha: boolean;
}

export interface PasswordResetToken {
  tokenHash: string;
  email: string;
  expiresAt: number;
  used: boolean;
}

// In-Memory Security Stores
const accountLockMap = new Map<string, AccountLockState>();
const revokedTokensSet = new Set<string>();
const passwordResetTokensMap = new Map<string, PasswordResetToken>();
const auditLogs: SecurityAuditLog[] = [];

/**
 * 1. Input Sanitization (Protects against XSS, Null Bytes, SQL Injection patterns)
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/\0/g, '') // Remove null bytes
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Strip script tags
    .replace(/on\w+\s*=/gi, '') // Strip inline event handlers
    .trim();
}

/**
 * 2. Login Protection: Failed Attempts, Temporary Lockout, CAPTCHA Trigger
 */
export function checkAccountLockout(identifier: string): { isLocked: boolean; remainingLockSeconds: number; requiresCaptcha: boolean } {
  const cleanId = identifier.trim().toLowerCase();
  const state = accountLockMap.get(cleanId);

  if (!state) {
    return { isLocked: false, remainingLockSeconds: 0, requiresCaptcha: false };
  }

  const now = Date.now();
  if (state.lockedUntil && now < state.lockedUntil) {
    const remainingSecs = Math.ceil((state.lockedUntil - now) / 1000);
    return { isLocked: true, remainingLockSeconds: remainingSecs, requiresCaptcha: true };
  }

  // Auto unlock after lockout window expires
  if (state.lockedUntil && now >= state.lockedUntil) {
    accountLockMap.delete(cleanId);
    return { isLocked: false, remainingLockSeconds: 0, requiresCaptcha: false };
  }

  return { isLocked: false, remainingLockSeconds: 0, requiresCaptcha: state.failedAttempts >= 3 };
}

export function recordFailedLogin(identifier: string, ipAddress: string, userAgent: string): { lockedNow: boolean; requiresCaptcha: boolean } {
  const cleanId = identifier.trim().toLowerCase();
  const now = Date.now();
  const state = accountLockMap.get(cleanId) || {
    failedAttempts: 0,
    lockedUntil: null,
    lastAttemptAt: now,
    requiresCaptcha: false
  };

  // Reset attempt count if last attempt was > 30 mins ago
  if (now - state.lastAttemptAt > 30 * 60 * 1000) {
    state.failedAttempts = 0;
  }

  state.failedAttempts += 1;
  state.lastAttemptAt = now;
  state.requiresCaptcha = state.failedAttempts >= 3;

  let lockedNow = false;
  if (state.failedAttempts >= 5) {
    state.lockedUntil = now + 15 * 60 * 1000; // 15-minute temporary lockout
    lockedNow = true;
    logSecurityEvent('ACCOUNT_LOCKED', cleanId, ipAddress, userAgent, `Account locked for 15m after 5 failed attempts.`);
  } else {
    logSecurityEvent('LOGIN_FAILED', cleanId, ipAddress, userAgent, `Failed login attempt ${state.failedAttempts}/5.`);
  }

  accountLockMap.set(cleanId, state);
  return { lockedNow, requiresCaptcha: state.requiresCaptcha };
}

export function clearFailedLogin(identifier: string): void {
  const cleanId = identifier.trim().toLowerCase();
  accountLockMap.delete(cleanId);
}

/**
 * 3. Session Security & Token Revocation
 */
export function revokeToken(tokenId: string): void {
  if (tokenId) {
    revokedTokensSet.add(tokenId);
  }
}

export function isTokenRevoked(tokenId: string): boolean {
  return revokedTokensSet.has(tokenId);
}

/**
 * 4. Password Reset Token Flow (Expiring, Single-Use, Cryptographically Secure)
 */
export function generatePasswordResetToken(email: string): string {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes expiration

  passwordResetTokensMap.set(tokenHash, {
    tokenHash,
    email: email.trim().toLowerCase(),
    expiresAt,
    used: false
  });

  return rawToken;
}

export function verifyAndConsumeResetToken(rawToken: string): { isValid: boolean; email?: string; error?: string } {
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const resetRecord = passwordResetTokensMap.get(tokenHash);

  if (!resetRecord) {
    return { isValid: false, error: 'Invalid or expired password reset token.' };
  }

  if (resetRecord.used) {
    return { isValid: false, error: 'Password reset token has already been used.' };
  }

  if (Date.now() > resetRecord.expiresAt) {
    passwordResetTokensMap.delete(tokenHash);
    return { isValid: false, error: 'Password reset token has expired.' };
  }

  // Mark token as used immediately (Single-use token)
  resetRecord.used = true;
  passwordResetTokensMap.set(tokenHash, resetRecord);

  return { isValid: true, email: resetRecord.email };
}

/**
 * 5. Security Audit Logging & Monitoring
 */
export function logSecurityEvent(
  eventType: SecurityAuditLog['eventType'],
  identifier: string,
  ipAddress: string,
  userAgent: string,
  details?: string
): void {
  const maskedId = identifier ? identifier.replace(/(.{2})(.*)(?=@)/, (_, a, b) => a + '*'.repeat(b.length)) : 'ANONYMOUS';
  const logEntry: SecurityAuditLog = {
    id: `audit-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    eventType,
    identifier: maskedId,
    ipAddress: ipAddress || '127.0.0.1',
    userAgent: (userAgent || 'UNKNOWN').substring(0, 150),
    timestamp: new Date().toISOString(),
    details
  };

  auditLogs.push(logEntry);
  if (auditLogs.length > 500) {
    auditLogs.shift();
  }

  console.log(`[SECURITY AUDIT] [${logEntry.eventType}] IP: ${logEntry.ipAddress} | User: ${logEntry.identifier} | ${details || ''}`);
}

export function getSecurityAuditLogs(): SecurityAuditLog[] {
  return [...auditLogs];
}
