import { runCodePreview, submitCode } from '@/controllers/code.controller';
import { requireAuth } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';
import { runCodeSchema } from '@/validators/code.schema';
import { Router } from 'express';

const router = Router();

router.post('/run', requireAuth, validate({ body: runCodeSchema }), runCodePreview);

router.post('/submit', requireAuth, validate({ body: runCodeSchema }), submitCode);

export default router;
