import { runCodePreview, submitCode } from '@/controllers/code.controller';
import { requireAuth } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';
import { createJudge0Limiter } from '@/middleware/rateLimit.middleware';
import { runCodeSchema } from '@/validators/code.schema';
import { Router } from 'express';

const router = Router();

// Rate limiter for code submissions (5 submissions per minute per user)
const judge0Limiter = createJudge0Limiter();

router.post('/run', requireAuth, validate({ body: runCodeSchema }), runCodePreview);

router.post('/submit', requireAuth, judge0Limiter, validate({ body: runCodeSchema }), submitCode);

export default router;
