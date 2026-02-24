import z from 'zod';

export const registerSchema = z.object({
  email: z
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),

  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password must be less than 128 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
});

export const verifyEmailSchema = z.object({
  emailVerificationToken: z.string().min(1, 'Verification token is expired'),
});

export const resendEmailVerfication = z.object({
  email: z.email(),
});

export const loginSchema = z
  .object({
    identifier: z.string().optional(),
    email: z.string().optional(),
    password: z.string().min(1, 'Password is required'),
  })
  .refine((data) => data.identifier || data.email, {
    message: 'Email or username is required',
    path: ['identifier'],
  })
  .transform((data) => ({
    identifier: data.identifier || data.email || '',
    password: data.password,
  }));

export const oAuthSchema = z.object({
  code: z.string().min(1, 'Code is required'),
});

const strongPassword = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

export const forgotPasswordSchema = z.object({
  email: z.email('Please enter a valid email address'),
});

export const resetPasswordParamSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
});

export const resetPasswordSchema = z.object({
  password: strongPassword,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: strongPassword,
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type VerifyEmailDTO = z.infer<typeof verifyEmailSchema>;
export type ResendEmailVerficationDTO = z.infer<typeof resendEmailVerfication>;
export type LoginSchemaDTO = z.infer<typeof loginSchema>;
export type oAuthSchemaDTO = z.infer<typeof oAuthSchema>;
export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordParamDTO = z.infer<typeof resetPasswordParamSchema>;
export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>;

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
