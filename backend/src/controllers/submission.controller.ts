import { apiSuccess } from '@/utils/ApiError';
import { asyncHandler } from '@/utils/asyncHandler';
import { getSubmissionById, listUserSubmissions } from '@/services/submission.service';
import { SubmissionQueryDTO } from '@/validators/submission.schema';

export const getSubmission = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const analysis = await getSubmissionById(id, userId);

  res.status(200).json(apiSuccess(200, 'Submission retrieved', analysis));
});

export const listSubmissions = asyncHandler(async (req, res) => {
  const { problemId, page, limit } = req.validated!.query as SubmissionQueryDTO;
  const userId = req.user!.id;

  const result = await listUserSubmissions(userId, { problemId, page, limit });

  res.status(200).json(apiSuccess(200, 'Submissions retrieved', result));
});
