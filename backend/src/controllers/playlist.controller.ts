import { apiSuccess } from '@/utils/ApiError';
import { asyncHandler } from '@/utils/asyncHandler';
import {
  createPlaylistService,
  getUserPlaylistsService,
  getPlaylistByIdService,
  updatePlaylistService,
  deletePlaylistService,
  addProblemsToPlaylistService,
  removeProblemFromPlaylistService,
} from '@/services/playlist.service';
import type {
  CreatePlaylistDTO,
  UpdatePlaylistDTO,
  AddProblemsDTO,
} from '@/validators/playlist.schema';

export const createPlaylist = asyncHandler(async (req, res) => {
  const data = req.validated!.body as CreatePlaylistDTO;
  const result = await createPlaylistService(req.user!.id, data);
  res.status(201).json(apiSuccess(201, 'Playlist created', result));
});

export const getUserPlaylists = asyncHandler(async (req, res) => {
  const result = await getUserPlaylistsService(req.user!.id);
  res.status(200).json(apiSuccess(200, 'Playlists retrieved', result));
});

export const getPlaylistById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await getPlaylistByIdService(id, req.user?.id);
  res.status(200).json(apiSuccess(200, 'Playlist retrieved', result));
});

export const updatePlaylist = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.validated!.body as UpdatePlaylistDTO;
  const result = await updatePlaylistService(id, req.user!.id, data);
  res.status(200).json(apiSuccess(200, 'Playlist updated', result));
});

export const deletePlaylist = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await deletePlaylistService(id, req.user!.id);
  res.status(200).json(apiSuccess(200, 'Playlist deleted'));
});

export const addProblems = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.validated!.body as AddProblemsDTO;
  const result = await addProblemsToPlaylistService(id, req.user!.id, data);
  res.status(200).json(apiSuccess(200, 'Problems added to playlist', result));
});

export const removeProblem = asyncHandler(async (req, res) => {
  const { id, problemId } = req.params;
  const result = await removeProblemFromPlaylistService(id, req.user!.id, problemId);
  res.status(200).json(apiSuccess(200, 'Problem removed from playlist', result));
});
