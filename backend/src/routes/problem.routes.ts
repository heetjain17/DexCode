import { Router } from 'express';
import {
  createProblem,
  deleteProblem,
  getAllProblems,
  getProblem,
  updateProblem,
} from '@/controllers/problem.controller';
import { optionalAuth, requireAuth, reuireRole } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';
import {
  createProblemSchema,
  problemIdParamSchema,
  problemQuerySchema,
  updateProblemSchema,
} from '@/validators/problem.schema';

const router = Router();

router.post(
  '/',
  requireAuth,
  reuireRole('ADMIN'),
  validate({ body: createProblemSchema }),
  createProblem
);
router.get('/', optionalAuth, validate({ query: problemQuerySchema }), getAllProblems);
router.get('/:id', optionalAuth, validate({ params: problemIdParamSchema }), getProblem);
router.put(
  '/:id',
  requireAuth,
  reuireRole('ADMIN'),
  validate({ params: problemIdParamSchema, body: updateProblemSchema }),
  updateProblem
);
router.delete(
  '/:id',
  requireAuth,
  reuireRole('ADMIN'),
  validate({ params: problemIdParamSchema }),
  deleteProblem
);

export default router;
