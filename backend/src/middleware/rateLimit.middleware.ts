/**
 * Rate Limiting Middleware Factory
 *
 * Creates customized rate limiters for different parts of the application:
 * - Global limiter: General DDoS protection
 * - Auth limiters: Brute-force protection for authentication endpoints
 * - Judge0 limiter: Submission limit to prevent API cost overruns
 */

import rateLimit from 'express-rate-limit';
import type { Request, Response, NextFunction } from 'express';
import {
  AUTH_LIMITS_CONFIG,
  GLOBAL_LIMIT_CONFIG,
  JUDGE0_LIMIT_CONFIG,
} from '@/config/rateLimits.config';
import { canSubmit, startSubmission, endSubmission } from '@/libs/judge0Tracker';

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
 * Judge0 rate limiter with multi-layer protection
 * Applies FOUR protection layers:
 * 1. Per-minute rate limit (5 submissions/min) - Prevents immediate spam
 * 2. Per-day rate limit (50 submissions/day) - Hard cost control
 * 3. Concurrent limit (1 submission at a time) - Prevents simultaneous API calls
 * 4. Uses userId as key to limit per-user submissions
 */
export const createJudge0Limiter = () => {
  const baseRateLimiter = rateLimit({
    windowMs: JUDGE0_LIMIT_CONFIG.windowMs,
    max: JUDGE0_LIMIT_CONFIG.max,
    keyGenerator: (req: Request) => {
      return req.user?.id || getClientIp(req);
    },
    skip: (req) => {
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

  // Return a middleware that applies baseRateLimiter + additional checks
  return (req: Request, res: Response, next: NextFunction) => {
    // First apply the per-minute rate limiter
    baseRateLimiter(req, res, () => {
      // Then apply concurrent + daily checks
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          statusCode: 401,
          message: 'Authentication required',
        });
      }

      // Check daily and concurrent limits
      const { allowed, reason } = canSubmit(
        userId,
        JUDGE0_LIMIT_CONFIG.dailyMax || 50,
        JUDGE0_LIMIT_CONFIG.maxConcurrent || 1
      );

      if (!allowed) {
        return res.status(429).json({
          statusCode: 429,
          message: reason || 'Submission limit exceeded',
          retryAfter: 60,
        });
      }

      // Track that submission is starting
      startSubmission(userId);

      // Hook into response to end tracking when done
      const originalSend = res.send;
      res.send = function (data: any) {
        endSubmission(userId);
        return originalSend.call(this, data);
      };

      next();
    });
  };
};
