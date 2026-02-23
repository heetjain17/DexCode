import { and, asc, desc, eq, inArray, max, sql } from 'drizzle-orm';
import { db } from '@/libs/db';
import { playlists, problemInPlaylist, problems, problemSolved } from '@/db/schema';
import { ApiError } from '@/utils/ApiError';
import type {
  CreatePlaylistDTO,
  UpdatePlaylistDTO,
  AddProblemsDTO,
} from '@/validators/playlist.schema';

// Helpers

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function generatePlaylistSlug(userId: string, name: string): Promise<string> {
  const base = toSlug(name);
  const existing = await db.query.playlists.findFirst({
    where: and(eq(playlists.userId, userId), eq(playlists.slug, base)),
    columns: { slug: true },
  });
  if (!existing) return base;

  let i = 2;
  while (true) {
    const candidate = `${base}-${i}`;
    const exists = await db.query.playlists.findFirst({
      where: and(eq(playlists.userId, userId), eq(playlists.slug, candidate)),
      columns: { slug: true },
    });
    if (!exists) return candidate;
    i++;
  }
}

async function getPlaylistOrThrow(id: string) {
  const playlist = await db.query.playlists.findFirst({
    where: eq(playlists.id, id),
    columns: { id: true, userId: true, isPublic: true },
  });
  if (!playlist) throw new ApiError(404, 'Playlist not found');
  return playlist;
}

function assertOwner(playlist: { userId: string }, userId: string) {
  if (playlist.userId !== userId) throw new ApiError(403, 'Forbidden');
}

// Create

export async function createPlaylistService(userId: string, data: CreatePlaylistDTO) {
  const slug = await generatePlaylistSlug(userId, data.name);

  const [playlist] = await db
    .insert(playlists)
    .values({
      name: data.name,
      slug,
      description: data.description,
      isPublic: data.isPublic,
      userId,
    })
    .returning({ id: playlists.id, slug: playlists.slug });

  return { id: playlist.id, slug: playlist.slug };
}

// List (current user)

export async function getUserPlaylistsService(userId: string) {
  const rows = await db.query.playlists.findMany({
    where: eq(playlists.userId, userId),
    columns: {
      id: true,
      name: true,
      slug: true,
      description: true,
      isPublic: true,
      problemCount: true,
      createdAt: true,
    },
    orderBy: desc(playlists.createdAt),
  });
  return rows;
}

// Get by ID (detail)

export async function getPlaylistByIdService(id: string, userId?: string) {
  const playlist = await db.query.playlists.findFirst({
    where: eq(playlists.id, id),
    columns: {
      id: true,
      name: true,
      slug: true,
      description: true,
      isPublic: true,
      problemCount: true,
      userId: true,
    },
    with: {
      problems: {
        orderBy: asc(problemInPlaylist.order),
        with: {
          problem: {
            columns: {
              id: true,
              slug: true,
              title: true,
              difficulty: true,
              acceptanceRate: true,
            },
          },
        },
      },
    },
  });

  if (!playlist) throw new ApiError(404, 'Playlist not found');

  if (!playlist.isPublic && playlist.userId !== userId) {
    // Return 404 to unauthenticated to not leak existence; 403 to authenticated non-owners
    if (!userId) throw new ApiError(404, 'Playlist not found');
    throw new ApiError(403, 'Forbidden');
  }

  // Build isSolved set
  const solvedSet = userId
    ? await db
        .select({ problemId: problemSolved.problemId })
        .from(problemSolved)
        .where(eq(problemSolved.userId, userId))
        .then((rows) => new Set(rows.map((r) => r.problemId)))
    : new Set<string>();

  return {
    id: playlist.id,
    name: playlist.name,
    slug: playlist.slug,
    description: playlist.description,
    isPublic: playlist.isPublic,
    problemCount: playlist.problemCount,
    isOwner: playlist.userId === userId,
    problems: playlist.problems.map((pip) => ({
      order: pip.order,
      id: pip.problem.id,
      slug: pip.problem.slug,
      title: pip.problem.title,
      difficulty: pip.problem.difficulty,
      acceptanceRate: pip.problem.acceptanceRate,
      isSolved: solvedSet.has(pip.problem.id),
    })),
  };
}

// Update

export async function updatePlaylistService(id: string, userId: string, data: UpdatePlaylistDTO) {
  const existing = await db.query.playlists.findFirst({
    where: eq(playlists.id, id),
    columns: { id: true, name: true, userId: true },
  });
  if (!existing) throw new ApiError(404, 'Playlist not found');
  assertOwner(existing, userId);

  const update: Record<string, unknown> = {};

  if (data.name !== undefined) {
    update.name = data.name;
    if (data.name !== existing.name) {
      update.slug = await generatePlaylistSlug(userId, data.name);
    }
  }
  if (data.description !== undefined) update.description = data.description;
  if (data.isPublic !== undefined) update.isPublic = data.isPublic;

  if (Object.keys(update).length) {
    await db.update(playlists).set(update).where(eq(playlists.id, id));
  }

  const updated = await db.query.playlists.findFirst({
    where: eq(playlists.id, id),
    columns: { id: true, slug: true },
  });

  return { id: updated!.id, slug: updated!.slug };
}

// Delete

export async function deletePlaylistService(id: string, userId: string) {
  const playlist = await getPlaylistOrThrow(id);
  assertOwner(playlist, userId);
  await db.delete(playlists).where(eq(playlists.id, id));
}

// Add problems

export async function addProblemsToPlaylistService(
  id: string,
  userId: string,
  data: AddProblemsDTO
) {
  const playlist = await getPlaylistOrThrow(id);
  assertOwner(playlist, userId);

  const { problemIds } = data;

  // Verify all problems exist
  const existing = await db
    .select({ id: problems.id })
    .from(problems)
    .where(inArray(problems.id, problemIds));

  if (existing.length !== problemIds.length) {
    throw new ApiError(400, 'One or more problem IDs are invalid');
  }

  // Get current max order
  const [{ maxOrder }] = await db
    .select({ maxOrder: max(problemInPlaylist.order) })
    .from(problemInPlaylist)
    .where(eq(problemInPlaylist.playlistId, id));

  let nextOrder = (maxOrder ?? -1) + 1;

  const values = problemIds.map((problemId) => ({
    playlistId: id,
    problemId,
    order: nextOrder++,
  }));

  await db.insert(problemInPlaylist).values(values).onConflictDoNothing();

  // Sync problemCount from actual row count
  const [{ count }] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(problemInPlaylist)
    .where(eq(problemInPlaylist.playlistId, id));

  await db.update(playlists).set({ problemCount: count }).where(eq(playlists.id, id));

  return { problemCount: count };
}

// Remove problem

export async function removeProblemFromPlaylistService(
  id: string,
  userId: string,
  problemId: string
) {
  const playlist = await getPlaylistOrThrow(id);
  assertOwner(playlist, userId);

  await db
    .delete(problemInPlaylist)
    .where(and(eq(problemInPlaylist.playlistId, id), eq(problemInPlaylist.problemId, problemId)));

  // Sync problemCount
  const [{ count }] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(problemInPlaylist)
    .where(eq(problemInPlaylist.playlistId, id));

  await db.update(playlists).set({ problemCount: count }).where(eq(playlists.id, id));

  return { problemCount: count };
}
