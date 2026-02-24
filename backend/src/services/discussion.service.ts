import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '@/libs/db';
import {
  discussions,
  discussionComments,
  discussionVotes,
  commentVotes,
  problems,
  profiles,
} from '@/db/schema';
import { ApiError } from '@/utils/ApiError';
import type {
  CreateDiscussionDTO,
  UpdateDiscussionDTO,
  ListDiscussionsQueryDTO,
  CreateCommentDTO,
  UpdateCommentDTO,
  VoteDTO,
} from '@/validators/discussion.schema';

// -----------------------------------------------------------------------
// Internal helpers
// -----------------------------------------------------------------------

const assertProblemPublished = async (problemId: string) => {
  const p = await db.query.problems.findFirst({
    where: and(eq(problems.id, problemId), eq(problems.isPublished, true)),
    columns: { id: true },
  });
  if (!p) throw new ApiError(404, 'Problem not found');
};

const getDiscussionOrThrow = async (id: string) => {
  const d = await db.query.discussions.findFirst({
    where: eq(discussions.id, id),
  });
  if (!d) throw new ApiError(404, 'Discussion not found');
  return d;
};

const getCommentOrThrow = async (commentId: string, discussionId: string) => {
  const c = await db.query.discussionComments.findFirst({
    where: and(
      eq(discussionComments.id, commentId),
      eq(discussionComments.discussionId, discussionId)
    ),
  });
  if (!c) throw new ApiError(404, 'Comment not found');
  return c;
};

const assertOwner = (resourceUserId: string, requestUserId: string, role: string) => {
  if (resourceUserId !== requestUserId && role !== 'ADMIN') {
    throw new ApiError(403, 'Forbidden');
  }
};

// -----------------------------------------------------------------------
// Discussion CRUD
// -----------------------------------------------------------------------

export const createDiscussionService = async (userId: string, data: CreateDiscussionDTO) => {
  await assertProblemPublished(data.problemId);

  const [discussion] = await db
    .insert(discussions)
    .values({
      problemId: data.problemId,
      userId,
      title: data.title,
      content: data.content,
    })
    .returning();

  return discussion;
};

export const listDiscussionsService = async (
  query: ListDiscussionsQueryDTO
  // requestUserId?: string
) => {
  const { problemId, page, limit } = query;
  const offset = (page - 1) * limit;

  const rows = await db
    .select({
      id: discussions.id,
      title: discussions.title,
      content: discussions.content,
      upvotes: discussions.upvotes,
      downvotes: discussions.downvotes,
      isPinned: discussions.isPinned,
      isLocked: discussions.isLocked,
      createdAt: discussions.createdAt,
      updatedAt: discussions.updatedAt,
      userId: discussions.userId,
      authorUsername: profiles.username,
      authorAvatarUrl: profiles.avatarUrl,
    })
    .from(discussions)
    .leftJoin(profiles, eq(discussions.userId, profiles.userId))
    .where(eq(discussions.problemId, problemId))
    .orderBy(desc(discussions.isPinned), desc(discussions.createdAt))
    .limit(limit)
    .offset(offset);

  return rows;
};

export const getDiscussionService = async (id: string, requestUserId?: string) => {
  const discussion = await getDiscussionOrThrow(id);

  const comments = await db
    .select({
      id: discussionComments.id,
      content: discussionComments.content,
      upvotes: discussionComments.upvotes,
      downvotes: discussionComments.downvotes,
      createdAt: discussionComments.createdAt,
      updatedAt: discussionComments.updatedAt,
      userId: discussionComments.userId,
      authorUsername: profiles.username,
      authorAvatarUrl: profiles.avatarUrl,
    })
    .from(discussionComments)
    .leftJoin(profiles, eq(discussionComments.userId, profiles.userId))
    .where(eq(discussionComments.discussionId, id))
    .orderBy(discussionComments.createdAt);

  const authorProfile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, discussion.userId),
    columns: { username: true, avatarUrl: true },
  });

  let userVote: number | null = null;
  if (requestUserId) {
    const vote = await db.query.discussionVotes.findFirst({
      where: and(eq(discussionVotes.discussionId, id), eq(discussionVotes.userId, requestUserId)),
      columns: { value: true },
    });
    userVote = vote?.value ?? null;
  }

  return {
    ...discussion,
    authorUsername: authorProfile?.username ?? null,
    authorAvatarUrl: authorProfile?.avatarUrl ?? null,
    userVote,
    comments,
  };
};

export const updateDiscussionService = async (
  id: string,
  userId: string,
  role: string,
  data: UpdateDiscussionDTO
) => {
  const discussion = await getDiscussionOrThrow(id);
  assertOwner(discussion.userId, userId, role);

  if (discussion.isLocked) {
    throw new ApiError(403, 'Discussion is locked');
  }

  const [updated] = await db
    .update(discussions)
    .set({
      ...(data.title !== undefined && { title: data.title }),
      ...(data.content !== undefined && { content: data.content }),
    })
    .where(eq(discussions.id, id))
    .returning();

  return updated;
};

export const deleteDiscussionService = async (id: string, userId: string, role: string) => {
  const discussion = await getDiscussionOrThrow(id);
  assertOwner(discussion.userId, userId, role);

  await db.delete(discussions).where(eq(discussions.id, id));
};

// -----------------------------------------------------------------------
// Comments
// -----------------------------------------------------------------------

export const createCommentService = async (
  discussionId: string,
  userId: string,
  data: CreateCommentDTO
) => {
  const discussion = await getDiscussionOrThrow(discussionId);

  if (discussion.isLocked) {
    throw new ApiError(403, 'Discussion is locked — no new comments allowed');
  }

  const [comment] = await db
    .insert(discussionComments)
    .values({ discussionId, userId, content: data.content })
    .returning();

  return comment;
};

export const updateCommentService = async (
  discussionId: string,
  commentId: string,
  userId: string,
  role: string,
  data: UpdateCommentDTO
) => {
  await getDiscussionOrThrow(discussionId);
  const comment = await getCommentOrThrow(commentId, discussionId);
  assertOwner(comment.userId, userId, role);

  const [updated] = await db
    .update(discussionComments)
    .set({ content: data.content })
    .where(eq(discussionComments.id, commentId))
    .returning();

  return updated;
};

export const deleteCommentService = async (
  discussionId: string,
  commentId: string,
  userId: string,
  role: string
) => {
  await getDiscussionOrThrow(discussionId);
  const comment = await getCommentOrThrow(commentId, discussionId);
  assertOwner(comment.userId, userId, role);

  await db.delete(discussionComments).where(eq(discussionComments.id, commentId));
};

// -----------------------------------------------------------------------
// Voting
// -----------------------------------------------------------------------

export const voteDiscussionService = async (
  discussionId: string,
  userId: string,
  data: VoteDTO
) => {
  await getDiscussionOrThrow(discussionId);

  await db.transaction(async (tx) => {
    const existing = await tx.query.discussionVotes.findFirst({
      where: and(
        eq(discussionVotes.discussionId, discussionId),
        eq(discussionVotes.userId, userId)
      ),
      columns: { value: true },
    });

    if (data.value === 0) {
      if (!existing) return;
      await tx
        .delete(discussionVotes)
        .where(
          and(eq(discussionVotes.discussionId, discussionId), eq(discussionVotes.userId, userId))
        );
      if (existing.value === 1) {
        await tx
          .update(discussions)
          .set({ upvotes: sql`${discussions.upvotes} - 1` })
          .where(eq(discussions.id, discussionId));
      } else if (existing.value === -1) {
        await tx
          .update(discussions)
          .set({ downvotes: sql`${discussions.downvotes} - 1` })
          .where(eq(discussions.id, discussionId));
      }
    } else {
      await tx
        .insert(discussionVotes)
        .values({ discussionId, userId, value: data.value })
        .onConflictDoUpdate({
          target: [discussionVotes.discussionId, discussionVotes.userId],
          set: { value: data.value },
        });

      if (!existing) {
        if (data.value === 1) {
          await tx
            .update(discussions)
            .set({ upvotes: sql`${discussions.upvotes} + 1` })
            .where(eq(discussions.id, discussionId));
        } else {
          await tx
            .update(discussions)
            .set({ downvotes: sql`${discussions.downvotes} + 1` })
            .where(eq(discussions.id, discussionId));
        }
      } else if (existing.value !== data.value) {
        if (data.value === 1) {
          await tx
            .update(discussions)
            .set({
              upvotes: sql`${discussions.upvotes} + 1`,
              downvotes: sql`${discussions.downvotes} - 1`,
            })
            .where(eq(discussions.id, discussionId));
        } else {
          await tx
            .update(discussions)
            .set({
              upvotes: sql`${discussions.upvotes} - 1`,
              downvotes: sql`${discussions.downvotes} + 1`,
            })
            .where(eq(discussions.id, discussionId));
        }
      }
    }
  });
};

export const voteCommentService = async (
  discussionId: string,
  commentId: string,
  userId: string,
  data: VoteDTO
) => {
  await getCommentOrThrow(commentId, discussionId);

  await db.transaction(async (tx) => {
    const existing = await tx.query.commentVotes.findFirst({
      where: and(eq(commentVotes.commentId, commentId), eq(commentVotes.userId, userId)),
      columns: { value: true },
    });

    if (data.value === 0) {
      if (!existing) return;
      await tx
        .delete(commentVotes)
        .where(and(eq(commentVotes.commentId, commentId), eq(commentVotes.userId, userId)));
      if (existing.value === 1) {
        await tx
          .update(discussionComments)
          .set({ upvotes: sql`${discussionComments.upvotes} - 1` })
          .where(eq(discussionComments.id, commentId));
      } else if (existing.value === -1) {
        await tx
          .update(discussionComments)
          .set({ downvotes: sql`${discussionComments.downvotes} - 1` })
          .where(eq(discussionComments.id, commentId));
      }
    } else {
      await tx
        .insert(commentVotes)
        .values({ commentId, userId, value: data.value })
        .onConflictDoUpdate({
          target: [commentVotes.commentId, commentVotes.userId],
          set: { value: data.value },
        });

      if (!existing) {
        if (data.value === 1) {
          await tx
            .update(discussionComments)
            .set({ upvotes: sql`${discussionComments.upvotes} + 1` })
            .where(eq(discussionComments.id, commentId));
        } else {
          await tx
            .update(discussionComments)
            .set({ downvotes: sql`${discussionComments.downvotes} + 1` })
            .where(eq(discussionComments.id, commentId));
        }
      } else if (existing.value !== data.value) {
        if (data.value === 1) {
          await tx
            .update(discussionComments)
            .set({
              upvotes: sql`${discussionComments.upvotes} + 1`,
              downvotes: sql`${discussionComments.downvotes} - 1`,
            })
            .where(eq(discussionComments.id, commentId));
        } else {
          await tx
            .update(discussionComments)
            .set({
              upvotes: sql`${discussionComments.upvotes} - 1`,
              downvotes: sql`${discussionComments.downvotes} + 1`,
            })
            .where(eq(discussionComments.id, commentId));
        }
      }
    }
  });
};
