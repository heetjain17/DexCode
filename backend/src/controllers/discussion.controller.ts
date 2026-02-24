import { asyncHandler } from '@/utils/asyncHandler';
import { apiSuccess } from '@/utils/ApiError';
import {
  createDiscussionService,
  listDiscussionsService,
  getDiscussionService,
  updateDiscussionService,
  deleteDiscussionService,
  createCommentService,
  updateCommentService,
  deleteCommentService,
  voteDiscussionService,
  voteCommentService,
} from '@/services/discussion.service';
import type {
  CreateDiscussionDTO,
  UpdateDiscussionDTO,
  ListDiscussionsQueryDTO,
  CreateCommentDTO,
  UpdateCommentDTO,
  VoteDTO,
  DiscussionIdParamDTO,
  CommentIdParamDTO,
} from '@/validators/discussion.schema';

export const createDiscussion = asyncHandler(async (req, res) => {
  const data = req.validated!.body as CreateDiscussionDTO;
  const result = await createDiscussionService(req.user!.id, data);
  res.status(201).json(apiSuccess(201, 'Discussion created', result));
});

export const listDiscussions = asyncHandler(async (req, res) => {
  const query = req.validated!.query as ListDiscussionsQueryDTO;
  const result = await listDiscussionsService(query);
  res.status(200).json(apiSuccess(200, 'Discussions retrieved', result));
});

export const getDiscussion = asyncHandler(async (req, res) => {
  const { id } = req.validated!.params as DiscussionIdParamDTO;
  const result = await getDiscussionService(id, req.user?.id);
  res.status(200).json(apiSuccess(200, 'Discussion retrieved', result));
});

export const updateDiscussion = asyncHandler(async (req, res) => {
  const { id } = req.validated!.params as DiscussionIdParamDTO;
  const data = req.validated!.body as UpdateDiscussionDTO;
  const result = await updateDiscussionService(id, req.user!.id, req.user!.role, data);
  res.status(200).json(apiSuccess(200, 'Discussion updated', result));
});

export const deleteDiscussion = asyncHandler(async (req, res) => {
  const { id } = req.validated!.params as DiscussionIdParamDTO;
  await deleteDiscussionService(id, req.user!.id, req.user!.role);
  res.status(200).json(apiSuccess(200, 'Discussion deleted'));
});

export const createComment = asyncHandler(async (req, res) => {
  const { id } = req.validated!.params as DiscussionIdParamDTO;
  const data = req.validated!.body as CreateCommentDTO;
  const result = await createCommentService(id, req.user!.id, data);
  res.status(201).json(apiSuccess(201, 'Comment created', result));
});

export const updateComment = asyncHandler(async (req, res) => {
  const { id, commentId } = req.validated!.params as CommentIdParamDTO;
  const data = req.validated!.body as UpdateCommentDTO;
  const result = await updateCommentService(id, commentId, req.user!.id, req.user!.role, data);
  res.status(200).json(apiSuccess(200, 'Comment updated', result));
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { id, commentId } = req.validated!.params as CommentIdParamDTO;
  await deleteCommentService(id, commentId, req.user!.id, req.user!.role);
  res.status(200).json(apiSuccess(200, 'Comment deleted'));
});

export const voteDiscussion = asyncHandler(async (req, res) => {
  const { id } = req.validated!.params as DiscussionIdParamDTO;
  const data = req.validated!.body as VoteDTO;
  await voteDiscussionService(id, req.user!.id, data);
  res.status(200).json(apiSuccess(200, 'Vote recorded'));
});

export const voteComment = asyncHandler(async (req, res) => {
  const { id, commentId } = req.validated!.params as CommentIdParamDTO;
  const data = req.validated!.body as VoteDTO;
  await voteCommentService(id, commentId, req.user!.id, data);
  res.status(200).json(apiSuccess(200, 'Vote recorded'));
});
