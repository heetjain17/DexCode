/**
 * Rate Limiting Configuration
 *
 * Three-tier rate limiting strategy:
 * 1. Global - Basic protection against general DoS/spam
 * 2. Auth - Strict protection against credential stuffing and brute-force
 * 3. Judge0 - Prevents recursive/automated submissions and API cost overruns
 */

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
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

export const JUDGE0_LIMIT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: 'Too many code submissions. Please wait before submitting again.',
};
