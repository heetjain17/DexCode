import z from 'zod';

export const discussionIdParamSchema = z.object({
  id: z.uuid('Discussion ID must be a valid UUID'),
});

export const commentIdParamSchema = z.object({
  id: z.uuid('Discussion ID must be a valid UUID'),
  commentId: z.string().uuid('Comment ID must be a valid UUID'),
});

export const listDiscussionsQuerySchema = z.object({
  problemId: z.uuid('problemId must be a valid UUID'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const createDiscussionSchema = z.object({
  problemId: z.string().uuid('problemId must be a valid UUID'),
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be under 200 characters'),
  content: z
    .string()
    .min(10, 'Content must be at least 10 characters')
    .max(10000, 'Content must be under 10000 characters'),
});

export const updateDiscussionSchema = z
  .object({
    title: z.string().min(3).max(200).optional(),
    content: z.string().min(10).max(10000).optional(),
  })
  .refine((data) => data.title || data.content, {
    message: 'At least one of title or content must be provided',
  });

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(5000, 'Comment must be under 5000 characters'),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(5000),
});

export const voteSchema = z.object({
  value: z.union([z.literal(1), z.literal(-1), z.literal(0)]),
});

export type DiscussionIdParamDTO = z.infer<typeof discussionIdParamSchema>;
export type CommentIdParamDTO = z.infer<typeof commentIdParamSchema>;
export type ListDiscussionsQueryDTO = z.infer<typeof listDiscussionsQuerySchema>;
export type CreateDiscussionDTO = z.infer<typeof createDiscussionSchema>;
export type UpdateDiscussionDTO = z.infer<typeof updateDiscussionSchema>;
export type CreateCommentDTO = z.infer<typeof createCommentSchema>;
export type UpdateCommentDTO = z.infer<typeof updateCommentSchema>;
export type VoteDTO = z.infer<typeof voteSchema>;
