import { and, avg, count, eq } from 'drizzle-orm';
import { db } from '@/libs/db';
import { problemRatings, problems } from '@/db/schema';
import { ApiError } from '@/utils/ApiError';
import type { RateProblemDTO } from '@/validators/rating.schema';

const assertProblemExists = async (problemId: string) => {
  const problem = await db.query.problems.findFirst({
    where: and(eq(problems.id, problemId), eq(problems.isPublished, true)),
    columns: { id: true },
  });
  if (!problem) throw new ApiError(404, 'Problem not found');
};

export const rateProblemService = async (
  userId: string,
  problemId: string,
  data: RateProblemDTO
) => {
  await assertProblemExists(problemId);

  const [result] = await db
    .insert(problemRatings)
    .values({ problemId, userId, rating: data.rating })
    .onConflictDoUpdate({
      target: [problemRatings.problemId, problemRatings.userId],
      set: { rating: data.rating },
    })
    .returning();

  return result;
};

export const getProblemRatingService = async (problemId: string, userId?: string) => {
  await assertProblemExists(problemId);

  const [aggregate] = await db
    .select({
      averageRating: avg(problemRatings.rating),
      totalRatings: count(problemRatings.id),
    })
    .from(problemRatings)
    .where(eq(problemRatings.problemId, problemId));

  let userRating: number | null = null;
  if (userId) {
    const own = await db.query.problemRatings.findFirst({
      where: and(eq(problemRatings.problemId, problemId), eq(problemRatings.userId, userId)),
      columns: { rating: true },
    });
    userRating = own?.rating ?? null;
  }

  return {
    averageRating: aggregate?.averageRating ? parseFloat(aggregate.averageRating) : null,
    totalRatings: Number(aggregate?.totalRatings ?? 0),
    userRating,
  };
};
