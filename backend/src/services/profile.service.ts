import { eq } from 'drizzle-orm';
import { db } from '@/libs/db';
import { profiles, users } from '@/db/schema';
import { ApiError } from '@/utils/ApiError';
import type { UpdateProfileDTO } from '@/validators/profile.schema';

export const getMyProfileService = async (userId: string) => {
  const result = await db
    .select({
      id: profiles.id,
      userId: profiles.userId,
      username: profiles.username,
      name: profiles.name,
      bio: profiles.bio,
      location: profiles.location,
      avatarUrl: profiles.avatarUrl,
      website: profiles.website,
      socialLinks: profiles.socialLinks,
      problemsSolved: profiles.problemsSolved,
      easySolved: profiles.easySolved,
      mediumSolved: profiles.mediumSolved,
      hardSolved: profiles.hardSolved,
      currentStreak: profiles.currentStreak,
      longestStreak: profiles.longestStreak,
      lastSolvedAt: profiles.lastSolvedAt,
      totalSubmissions: profiles.totalSubmissions,
      acceptedSubmissions: profiles.acceptedSubmissions,
      createdAt: profiles.createdAt,
      email: users.email,
      role: users.role,
      provider: users.provider,
      isEmailVerified: users.isEmailVerified,
    })
    .from(profiles)
    .innerJoin(users, eq(profiles.userId, users.id))
    .where(eq(profiles.userId, userId))
    .limit(1);

  if (!result[0]) {
    throw new ApiError(404, 'Profile not found');
  }

  return result[0];
};

export const updateMyProfileService = async (userId: string, data: UpdateProfileDTO) => {
  const existing = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
    columns: { id: true },
  });

  if (!existing) {
    throw new ApiError(404, 'Profile not found');
  }

  // Build partial update — skip undefined keys, coerce '' to null for URL fields
  const updatePayload: Record<string, unknown> = {};

  if (data.name !== undefined) updatePayload.name = data.name || null;
  if (data.bio !== undefined) updatePayload.bio = data.bio || null;
  if (data.location !== undefined) updatePayload.location = data.location || null;
  if (data.avatarUrl !== undefined) updatePayload.avatarUrl = data.avatarUrl || null;
  if (data.website !== undefined) updatePayload.website = data.website || null;
  if (data.socialLinks !== undefined) {
    updatePayload.socialLinks = {
      github: data.socialLinks.github || null,
      twitter: data.socialLinks.twitter || null,
      linkedin: data.socialLinks.linkedin || null,
    };
  }

  if (Object.keys(updatePayload).length === 0) {
    throw new ApiError(400, 'No fields provided to update');
  }

  const [updated] = await db
    .update(profiles)
    .set(updatePayload)
    .where(eq(profiles.userId, userId))
    .returning();

  return updated;
};
