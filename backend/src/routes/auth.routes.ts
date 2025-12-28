import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import { registerSchema } from '../validators/auth.schema';
import { register } from '../controllers/auth.controllers';

const router = Router();

router.post('/register', validate(registerSchema as any), register);

export default router;
