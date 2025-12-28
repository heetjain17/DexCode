import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, verifyEmailSchema } from '../validators/auth.schema';
import { register, verify } from '../controllers/auth.controllers';

const router = Router();

router.post('/register', validate(registerSchema as any), register);
router.get(
  '/verify/:emailVerificationToken',
  validate({ params: verifyEmailSchema }),
  verify
);
export default router;
