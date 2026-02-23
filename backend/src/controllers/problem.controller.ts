import { createProblemService } from '@/services/problem.service';
import { apiSuccess } from '@/utils/ApiError';
import { asyncHandler } from '@/utils/asyncHandler';
import { CreateProblemDTO } from '@/validators/problem.schema';

export const createProblem = asyncHandler(async (req, res) => {
  const data = req.validated!.body as CreateProblemDTO;

  const problem = await createProblemService(data, req.user!.id);

  res.status(201).json(apiSuccess(201, 'Problem created', problem));
});
export const getAllProblems = asyncHandler(async (_req, _res) => {});
export const getProblem = asyncHandler(async (_req, _res) => {});
export const updateProblem = asyncHandler(async (_req, _res) => {});
export const deleteProblem = asyncHandler(async (_req, _res) => {});
