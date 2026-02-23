import { z } from 'zod';

export const createPlaylistSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export const updatePlaylistSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export const addProblemsSchema = z.object({
  problemIds: z.array(z.string().uuid()).min(1),
});

export const playlistIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const playlistProblemParamSchema = z.object({
  id: z.string().uuid(),
  problemId: z.string().uuid(),
});

export type CreatePlaylistDTO = z.infer<typeof createPlaylistSchema>;
export type UpdatePlaylistDTO = z.infer<typeof updatePlaylistSchema>;
export type AddProblemsDTO = z.infer<typeof addProblemsSchema>;
