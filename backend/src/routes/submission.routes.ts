import { Router } from 'express';
import { requireAuth } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';
import { getSubmission, listSubmissions } from '@/controllers/submission.controller';
import { submissionQuerySchema } from '@/validators/submission.schema';

const router = Router();

router.get('/', requireAuth, validate({ query: submissionQuerySchema }), listSubmissions);
router.get('/:id', requireAuth, getSubmission);

export default router;
