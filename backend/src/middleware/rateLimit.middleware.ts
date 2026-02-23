/**
 * Rate Limiting Middleware Factory
 *
 * Creates customized rate limiters for different parts of the application:
 * - Global limiter: General DDoS protection
 * - Auth limiters: Brute-force protection for authentication endpoints
 * - Judge0 limiter: Submission limit to prevent API cost overruns
 */

import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';
import {
  AUTH_LIMITS_CONFIG,
  GLOBAL_LIMIT_CONFIG,
  JUDGE0_LIMIT_CONFIG,
} from '@/config/rateLimits.config';

/**
 * Get client IP from request, handling proxies (AWS Load Balancer, Nginx, etc.)
 * Checks X-Forwarded-For, X-Real-IP, then falls back to connection remote address
 */
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string') {
    return realIp;
  }
  return req.socket.remoteAddress || 'unknown';
}

/**
 * Global rate limiter - applied to all routes
 * Protects against general DoS and spam
 * Skips health check endpoint
 */
export const createGlobalLimiter = () =>
  rateLimit({
    ...GLOBAL_LIMIT_CONFIG,
    keyGenerator: getClientIp,
    skip: (req) => req.path === '/health',
    handler: (_req: Request, res: Response) => {
      res.status(429).json({
        statusCode: 429,
        message: GLOBAL_LIMIT_CONFIG.message,
        retryAfter: Math.ceil(GLOBAL_LIMIT_CONFIG.windowMs / 1000),
      });
    },
    standardHeaders: false, // Disable the `RateLimit-*` headers
    legacyHeaders: false,
  });

/**
 * Create endpoint-specific auth rate limiter
 * Used for register, login, verify, etc.
 *
 * @param endpoint - 'register' | 'login' | 'verify' | 'resendEmailVerification' | 'refresh' | 'logout'
 */
export const createAuthLimiter = (endpoint: keyof typeof AUTH_LIMITS_CONFIG) => {
  const config = AUTH_LIMITS_CONFIG[endpoint];
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    keyGenerator: getClientIp,
    handler: (_req: Request, res: Response) => {
      res.status(429).json({
        statusCode: 429,
        message: config.message,
        retryAfter: Math.ceil(config.windowMs / 1000),
      });
    },
    standardHeaders: false,
    legacyHeaders: false,
  });
};

/**
 * Judge0 rate limiter - applied only to code submission endpoint
 * Uses userId as key to limit per-user submissions
 * Prevents recursive submission loops and excessive API charges
 */
export const createJudge0Limiter = () =>
  rateLimit({
    ...JUDGE0_LIMIT_CONFIG,
    keyGenerator: (req: Request) => {
      // User must exist (middleware ensures auth)
      return req.user?.id || getClientIp(req);
    },
    skip: (req) => {
      // Only rate limit authenticated requests
      return !req.user;
    },
    handler: (_req: Request, res: Response) => {
      res.status(429).json({
        statusCode: 429,
        message: JUDGE0_LIMIT_CONFIG.message,
        retryAfter: Math.ceil(JUDGE0_LIMIT_CONFIG.windowMs / 1000),
      });
    },
    standardHeaders: false,
    legacyHeaders: false,
  });
