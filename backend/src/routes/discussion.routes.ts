import { Router } from 'express';
import { requireAuth, optionalAuth } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';
import {
  createDiscussionSchema,
  updateDiscussionSchema,
  listDiscussionsQuerySchema,
  discussionIdParamSchema,
  commentIdParamSchema,
  createCommentSchema,
  updateCommentSchema,
  voteSchema,
} from '@/validators/discussion.schema';
import {
  createDiscussion,
  listDiscussions,
  getDiscussion,
  updateDiscussion,
  deleteDiscussion,
  createComment,
  updateComment,
  deleteComment,
  voteDiscussion,
  voteComment,
} from '@/controllers/discussion.controller';

const router = Router();

// Discussion CRUD
router.post('/', requireAuth, validate({ body: createDiscussionSchema }), createDiscussion);

router.get('/', optionalAuth, validate({ query: listDiscussionsQuerySchema }), listDiscussions);

router.get('/:id', optionalAuth, validate({ params: discussionIdParamSchema }), getDiscussion);

router.put(
  '/:id',
  requireAuth,
  validate({ params: discussionIdParamSchema, body: updateDiscussionSchema }),
  updateDiscussion
);

router.delete('/:id', requireAuth, validate({ params: discussionIdParamSchema }), deleteDiscussion);

// Comments
router.post(
  '/:id/comment',
  requireAuth,
  validate({ params: discussionIdParamSchema, body: createCommentSchema }),
  createComment
);

router.put(
  '/:id/comment/:commentId',
  requireAuth,
  validate({ params: commentIdParamSchema, body: updateCommentSchema }),
  updateComment
);

router.delete(
  '/:id/comment/:commentId',
  requireAuth,
  validate({ params: commentIdParamSchema }),
  deleteComment
);

// Voting
router.post(
  '/:id/vote',
  requireAuth,
  validate({ params: discussionIdParamSchema, body: voteSchema }),
  voteDiscussion
);

router.post(
  '/:id/comment/:commentId/vote',
  requireAuth,
  validate({ params: commentIdParamSchema, body: voteSchema }),
  voteComment
);

export default router;
