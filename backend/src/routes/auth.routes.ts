import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import { createAuthLimiter } from '../middleware/rateLimit.middleware';
import {
  loginSchema,
  oAuthSchema,
  registerSchema,
  resendEmailVerfication,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordParamSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../validators/auth.schema';
import {
  githubOAuthCallback,
  githubOAuthRedirect,
  googleOAuthCallback,
  googleOAuthRedirect,
  login,
  logout,
  refreshAccessToken,
  register,
  resendEmail,
  verify,
  forgotPassword,
  resetPassword,
  changePassword,
} from '../controllers/auth.controllers';
import { requireAuth } from '@/middleware/auth.middleware';

const router = Router();

// Rate limiters for different auth endpoints
const registerLimiter = createAuthLimiter('register');
const loginLimiter = createAuthLimiter('login');
const verifyLimiter = createAuthLimiter('verify');
const resendEmailLimiter = createAuthLimiter('resendEmailVerification');
const refreshLimiter = createAuthLimiter('refresh');
const logoutLimiter = createAuthLimiter('logout');
const forgotPasswordLimiter = createAuthLimiter('forgotPassword');
const resetPasswordLimiter = createAuthLimiter('resetPassword');
const changePasswordLimiter = createAuthLimiter('changePassword');

// Auth endpoints with rate limiting
router.post('/register', registerLimiter, validate({ body: registerSchema }), register);

router.get(
  '/verify/:emailVerificationToken',
  verifyLimiter,
  validate({ params: verifyEmailSchema }),
  verify
);

router.post(
  '/resendEmailVerification',
  resendEmailLimiter,
  validate({ body: resendEmailVerfication }),
  resendEmail
);

router.post('/login', loginLimiter, validate({ body: loginSchema }), login);

router.post('/refresh', refreshLimiter, refreshAccessToken);

router.post('/logout', logoutLimiter, requireAuth, logout);

// OAuth endpoints (no rate limiting - inherently protected against brute-force)
router.get('/google', googleOAuthRedirect);

router.get('/google/callback', validate({ query: oAuthSchema }), googleOAuthCallback);

router.get('/github', githubOAuthRedirect);

router.get('/github/callback', validate({ query: oAuthSchema }), githubOAuthCallback);

router.post(
  '/forgotPassword',
  forgotPasswordLimiter,
  validate({ body: forgotPasswordSchema }),
  forgotPassword
);

router.post(
  '/resetPassword/:token',
  resetPasswordLimiter,
  validate({ params: resetPasswordParamSchema, body: resetPasswordSchema }),
  resetPassword
);

router.post(
  '/changePassword',
  changePasswordLimiter,
  requireAuth,
  validate({ body: changePasswordSchema }),
  changePassword
);

export default router;
