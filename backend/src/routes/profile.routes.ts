import { Router } from 'express';
import { requireAuth } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';
import { updateProfileSchema } from '@/validators/profile.schema';
import { getMyProfile, updateMyProfile } from '@/controllers/profile.controller';

const router = Router();

router.get('/me', requireAuth, getMyProfile);
router.put('/me', requireAuth, validate({ body: updateProfileSchema }), updateMyProfile);

export default router;
