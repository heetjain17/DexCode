import {
  createProblem,
  deleteProblem,
  getAllProblems,
  getProblem,
  updateProblem,
} from '@/controllers/problem.controller';
import { requireAuth, reuireRole } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';
import { createProblemSchema } from '@/validators/problem.schema';
import { Router } from 'express';

const router = Router();

router.post(
  '/problem',
  requireAuth,
  reuireRole('ADMIN'),
  validate({ body: createProblemSchema }),
  createProblem
);
router.get('/problem', getAllProblems);
router.get('/problem/:id', getProblem);
router.put('/problem/:id', updateProblem);
router.delete('/problem/:id', deleteProblem);
// router.get(':id');

export default router;
