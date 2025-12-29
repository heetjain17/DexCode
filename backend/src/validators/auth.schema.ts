import z from 'zod';

export const registerSchema = z.object({
  email: z
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),

  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores'
    ),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password must be less than 128 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(
      /[^a-zA-Z0-9]/,
      'Password must contain at least one special character'
    ),
});

export const verifyEmailSchema = z.object({
  emailVerificationToken: z.string().min(1, 'Verification token is expired'),
});

export const resendEmailVerfication = z.object({
  email: z.email(),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string(),
});

export const oAuthSchema = z.object({
  code: z.string().min(1, 'Code is required'),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type VerifyEmailDTO = z.infer<typeof verifyEmailSchema>;
export type ResendEmailVerficationDTO = z.infer<typeof resendEmailVerfication>;
export type LoginSchemaDTO = z.infer<typeof loginSchema>;
export type oAuthSchemaDTO = z.infer<typeof oAuthSchema>;

export type GitHubUser = {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
};

export type GitHubEmail = {
  email: string;
  primary: boolean;
  verified: boolean;
};
