import { apiSuccess } from '@/utils/ApiError';
import { asyncHandler } from '@/utils/asyncHandler';
import {
  createProblemService,
  deleteProblemService,
  getAllProblemsService,
  getProblemService,
  updateProblemService,
} from '@/services/problem.service';
import type {
  CreateProblemDTO,
  ProblemQueryDTO,
  UpdateProblemDTO,
} from '@/validators/problem.schema';

export const createProblem = asyncHandler(async (req, res) => {
  const data = req.validated!.body as CreateProblemDTO;

  const result = await createProblemService(data, req.user!.id);

  if (!result.success) {
    res.status(400).json({
      success: false,
      statusCode: 400,
      message: 'One or more reference solutions failed test cases',
      data: { failures: result.failures },
    });
    return;
  }

  res.status(201).json(apiSuccess(201, 'Problem created', { id: result.id, slug: result.slug }));
});

export const getAllProblems = asyncHandler(async (req, res) => {
  const filters = req.validated!.query as ProblemQueryDTO;
  const userId = req.user?.id;

  const result = await getAllProblemsService(userId, filters);

  res.status(200).json(apiSuccess(200, 'Problems retrieved', result));
});

export const getProblem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const problem = await getProblemService(id, userId);

  res.status(200).json(apiSuccess(200, 'Problem retrieved', problem));
});

export const updateProblem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.validated!.body as UpdateProblemDTO;

  const result = await updateProblemService(id, data);

  if (!result.success) {
    res.status(400).json({
      success: false,
      statusCode: 400,
      message: 'One or more reference solutions failed test cases after update',
      data: { failures: result.failures },
    });
    return;
  }

  res.status(200).json(apiSuccess(200, 'Problem updated', { id: result.id, slug: result.slug }));
});

export const deleteProblem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await deleteProblemService(id);

  res.status(200).json(apiSuccess(200, 'Problem deleted'));
});
