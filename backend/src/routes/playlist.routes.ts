import { Router } from 'express';
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addProblems,
  removeProblem,
} from '@/controllers/playlist.controller';
import { optionalAuth, requireAuth } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';
import {
  createPlaylistSchema,
  updatePlaylistSchema,
  addProblemsSchema,
  playlistIdParamSchema,
  playlistProblemParamSchema,
} from '@/validators/playlist.schema';

const router = Router();

router.post('/', requireAuth, validate({ body: createPlaylistSchema }), createPlaylist);
router.get('/', requireAuth, getUserPlaylists);
router.get('/:id', optionalAuth, validate({ params: playlistIdParamSchema }), getPlaylistById);
router.put(
  '/:id',
  requireAuth,
  validate({ params: playlistIdParamSchema, body: updatePlaylistSchema }),
  updatePlaylist
);
router.delete('/:id', requireAuth, validate({ params: playlistIdParamSchema }), deletePlaylist);
router.post(
  '/:id/problem',
  requireAuth,
  validate({ params: playlistIdParamSchema, body: addProblemsSchema }),
  addProblems
);
router.delete(
  '/:id/problem/:problemId',
  requireAuth,
  validate({ params: playlistProblemParamSchema }),
  removeProblem
);

export default router;
