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
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.GLOBAL_RATE_LIMIT || '100'),
  message: 'Too many requests from this IP. Please try again later.',
};

export const AUTH_LIMITS_CONFIG = {
  register: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: 'Too many registration attempts. Please try again after 1 hour.',
  },
  login: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: 'Too many login attempts. Please try again after 1 hour.',
  },
  verify: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: 'Too many verification attempts. Please try again after 1 hour.',
  },
  resendEmailVerification: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: 'Too many resend requests. Please try again after 1 hour.',
  },
  refresh: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    message: 'Too many token refresh attempts. Please try again later.',
  },
  logout: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    message: 'Too many logout attempts. Please try again later.',
  },
} as const;

export const JUDGE0_LIMIT_CONFIG: Judge0LimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: 'Too many code submissions. Please wait before submitting again.',
  dailyMax: 50, // 50 submissions per day per user
  maxConcurrent: 1, // Only 1 submission can run at a time
};
