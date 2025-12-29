import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import {
  loginSchema,
  oAuthSchema,
  registerSchema,
  resendEmailVerfication,
  verifyEmailSchema,
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
} from '../controllers/auth.controllers';
import { requireAuth } from '@/middleware/auth.middleware';

const router = Router();

router.post('/register', validate({ body: registerSchema }), register);

router.get(
  '/verify/:emailVerificationToken',
  validate({ params: verifyEmailSchema }),
  verify
);

router.post(
  '/resendEmailVerification',
  validate({ body: resendEmailVerfication }),
  resendEmail
);

router.post('/login', validate({ body: loginSchema }), login);

router.post('/refresh', refreshAccessToken);

router.post('/logout', requireAuth, logout);

router.get('/google', googleOAuthRedirect);

router.get(
  '/google/callback',
  validate({ query: oAuthSchema }),
  googleOAuthCallback
);

router.get('/github', githubOAuthRedirect);

router.get(
  '/github/callback',
  validate({ query: oAuthSchema }),
  githubOAuthCallback
);

// router.post('/forgotPassword');
// router.post('/resetPassword/:token');
// router.post('/changePassword');
export default router;
