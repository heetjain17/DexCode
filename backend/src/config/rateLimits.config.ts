/**
 * Rate Limiting Configuration
 *
 * Four-tier Judge0 protection strategy:
 * 1. Per-minute limit (5 submissions) - Prevents immediate spam
 * 2. Per-day limit (50 submissions) - Hard cost control
 * 3. Concurrent limit (1 submission) - Prevents simultaneous API calls
 * 4. Global limits - Basic DoS/brute-force protection
 */

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
}

export interface Judge0LimitConfig extends RateLimitConfig {
  dailyMax?: number;
  maxConcurrent?: number;
}

export const GLOBAL_LIMIT_CONFIG: RateLimitConfig = {
  windowMs: parseInt(process.env.GLOBAL_RATE_WINDOW_MS || String(15 * 60 * 1000)),
  max: parseInt(process.env.GLOBAL_RATE_LIMIT || '100'),
  message: 'Too many requests from this IP. Please try again later.',
};

const authWindow = parseInt(process.env.AUTH_RATE_WINDOW_MS || String(60 * 60 * 1000));

export const AUTH_LIMITS_CONFIG = {
  register: {
    windowMs: authWindow,
    max: parseInt(process.env.AUTH_REGISTER_RATE_LIMIT || '5'),
    message: 'Too many registration attempts. Please try again after 1 hour.',
  },
  login: {
    windowMs: authWindow,
    max: parseInt(process.env.AUTH_LOGIN_RATE_LIMIT || '5'),
    message: 'Too many login attempts. Please try again after 1 hour.',
  },
  verify: {
    windowMs: authWindow,
    max: parseInt(process.env.AUTH_VERIFY_RATE_LIMIT || '10'),
    message: 'Too many verification attempts. Please try again after 1 hour.',
  },
  resendEmailVerification: {
    windowMs: authWindow,
    max: parseInt(process.env.AUTH_RESEND_RATE_LIMIT || '3'),
    message: 'Too many resend requests. Please try again after 1 hour.',
  },
  refresh: {
    windowMs: authWindow,
    max: parseInt(process.env.AUTH_REFRESH_RATE_LIMIT || '20'),
    message: 'Too many token refresh attempts. Please try again later.',
  },
  logout: {
    windowMs: authWindow,
    max: parseInt(process.env.AUTH_LOGOUT_RATE_LIMIT || '20'),
    message: 'Too many logout attempts. Please try again later.',
  },
  forgotPassword: {
    windowMs: authWindow,
    max: parseInt(process.env.AUTH_FORGOT_PASSWORD_RATE_LIMIT || '3'),
    message: 'Too many password reset requests. Please try again after 1 hour.',
  },
  resetPassword: {
    windowMs: authWindow,
    max: parseInt(process.env.AUTH_RESET_PASSWORD_RATE_LIMIT || '5'),
    message: 'Too many password reset attempts. Please try again after 1 hour.',
  },
  changePassword: {
    windowMs: authWindow,
    max: parseInt(process.env.AUTH_CHANGE_PASSWORD_RATE_LIMIT || '5'),
    message: 'Too many password change attempts. Please try again after 1 hour.',
  },
} as const;

export const JUDGE0_LIMIT_CONFIG: Judge0LimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.JUDGE0_RATE_LIMIT_PER_MINUTE || '5'),
  message: 'Too many code submissions. Please wait before submitting again.',
  dailyMax: parseInt(process.env.JUDGE0_RATE_LIMIT_PER_DAY || '50'),
  maxConcurrent: parseInt(process.env.JUDGE0_MAX_CONCURRENT || '1'),
};
