import z from 'zod';

const optionalUrl = z.string().url('Must be a valid URL').optional().or(z.literal(''));

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').max(100).optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  location: z.string().max(100).optional(),
  avatarUrl: optionalUrl,
  website: optionalUrl,
  socialLinks: z
    .object({
      github: optionalUrl,
      twitter: optionalUrl,
      linkedin: optionalUrl,
    })
    .optional(),
});

export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>;
