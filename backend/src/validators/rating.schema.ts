import z from 'zod';

export const rateProblemSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
});

export const ratingProblemParamSchema = z.object({
  id: z.string().uuid('Problem ID must be a valid UUID'),
});

export type RateProblemDTO = z.infer<typeof rateProblemSchema>;
export type RatingParamDTO = z.infer<typeof ratingProblemParamSchema>;
