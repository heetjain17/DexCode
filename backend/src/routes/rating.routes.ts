import { Router } from 'express';
import { requireAuth, optionalAuth } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';
import { ratingProblemParamSchema, rateProblemSchema } from '@/validators/rating.schema';
import { rateProblem, getProblemRating } from '@/controllers/rating.controller';

const router = Router();

router.post(
  '/:id/rate',
  requireAuth,
  validate({ params: ratingProblemParamSchema, body: rateProblemSchema }),
  rateProblem
);

router.get(
  '/:id/rating',
  optionalAuth,
  validate({ params: ratingProblemParamSchema }),
  getProblemRating
);

export default router;
