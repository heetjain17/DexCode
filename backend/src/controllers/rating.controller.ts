import { asyncHandler } from '@/utils/asyncHandler';
import { apiSuccess } from '@/utils/ApiError';
import { rateProblemService, getProblemRatingService } from '@/services/rating.service';
import type { RateProblemDTO, RatingParamDTO } from '@/validators/rating.schema';

export const rateProblem = asyncHandler(async (req, res) => {
  const { id } = req.validated!.params as RatingParamDTO;
  const data = req.validated!.body as RateProblemDTO;
  const result = await rateProblemService(req.user!.id, id, data);
  res.status(200).json(apiSuccess(200, 'Rating submitted', result));
});

export const getProblemRating = asyncHandler(async (req, res) => {
  const { id } = req.validated!.params as RatingParamDTO;
  const result = await getProblemRatingService(id, req.user?.id);
  res.status(200).json(apiSuccess(200, 'Rating retrieved', result));
});
