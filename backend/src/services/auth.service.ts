import bcrypt from 'bcryptjs';
import { eq, or, count } from 'drizzle-orm';
import { db } from '../libs/db';
import { users, profiles } from '../db/schema';
import jwt, { SignOptions } from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError';
import crypto, { randomBytes } from 'crypto';
import { emailVerificationContent, forgotPasswordContent, sendMail } from '@/utils/mail';
import { getEnv } from '@/utils/env';
import axios from 'axios';

import type {
  ChangePasswordDTO,
  ForgotPasswordDTO,
  GitHubEmail,
  GitHubUser,
  LoginSchemaDTO,
  oAuthSchemaDTO,
  RegisterDto,
  ResendEmailVerficationDTO,
  ResetPasswordDTO,
  ResetPasswordParamDTO,
  VerifyEmailDTO,
} from '../validators/auth.schema';

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

const generateUniqueUsername = async (base: string) => {
  if (!base || typeof base !== 'string') {
    base = 'user';
  }

  let username = base.toLowerCase();

  while (true) {
    const result = await db
      .select({ cnt: count() })
      .from(profiles)
      .where(eq(profiles.username, username));

    if (Number(result[0]?.cnt ?? 0) === 0) break;

    username = `${base.toLowerCase()}${Math.floor(Math.random() * 1000)}`;
  }

  return username;
};

export const registerService = async ({ email, username, password }: RegisterDto) => {
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    throw new ApiError(409, 'User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const emailVerificationToken = randomBytes(32).toString('hex');
  const emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const { newUser, profile } = await db.transaction(async (tx) => {
    const [u] = await tx
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        emailVerificationToken,
        emailVerificationExpiry,
      })
      .returning();

    const [p] = await tx.insert(profiles).values({ userId: u.id, username }).returning();

    return { newUser: u, profile: p };
  });

  const verificationUrl = `${getEnv('BASE_URL')}/api/v1/auth/verify/${newUser.emailVerificationToken}`;
  try {
    await sendMail({
      email: newUser.email,
      subject: 'Email verification',
      mailGenContent: emailVerificationContent(profile.username, verificationUrl),
    });
  } catch (err) {
    console.error('Failed to send verification email', err);
  }

  return {
    id: newUser.id,
    email: newUser.email,
    username: profile.username,
  };
};

export const verifyService = async ({ emailVerificationToken }: VerifyEmailDTO) => {
  const user = await db.query.users.findFirst({
    where: eq(users.emailVerificationToken, emailVerificationToken),
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.isEmailVerified) {
    throw new ApiError(400, 'Email already verified');
  }

  if (user.emailVerificationExpiry && user.emailVerificationExpiry < new Date()) {
    throw new ApiError(410, 'Verification token has expired');
  }

  await db
    .update(users)
    .set({
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpiry: null,
    })
    .where(eq(users.id, user.id));
};

export const resendEmailVerificationService = async ({ email }: ResendEmailVerficationDTO) => {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.isEmailVerified) {
    throw new ApiError(400, 'Email is already verified');
  }

  if (user.emailVerificationExpiry && user.emailVerificationExpiry > new Date()) {
    throw new ApiError(429, 'Email already sent. Please wait or check spam');
  }

  const emailVerificationToken = randomBytes(32).toString('hex');
  const emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const [updatedUser] = await db
    .update(users)
    .set({ emailVerificationToken, emailVerificationExpiry })
    .where(eq(users.email, email))
    .returning();

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, updatedUser.id),
    columns: { username: true },
  });

  const verificationUrl = `${getEnv('BASE_URL')}/api/v1/auth/verify/${updatedUser.emailVerificationToken}`;
  try {
    await sendMail({
      email: updatedUser.email,
      subject: 'Email verification',
      mailGenContent: emailVerificationContent(profile?.username ?? 'User', verificationUrl),
    });
  } catch (err) {
    console.error('Failed to send verification email', err);
  }
};

export const loginService = async ({ identifier, password }: LoginSchemaDTO) => {
  const result = await db
    .select({ user: users, profile: profiles })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(or(eq(users.email, identifier), eq(profiles.username, identifier)))
    .limit(1);

  const row = result[0];

  if (!row?.user || !row.user.password) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, row.user.password);

  if (!isMatch) {
    throw new ApiError(400, 'Invalid credentials');
  }

  if (!row.user.isEmailVerified) {
    throw new ApiError(403, 'Please verify your email first');
  }

  return {
    id: row.user.id,
    email: row.user.email,
    username: row.profile?.username,
    avatar: row.profile?.avatarUrl,
    name: row.profile?.name,
  };
};

export const generateAccessandRefreshTokenService = async (userId: string) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const accessToken = jwt.sign(
    { id: user.id, email: user.email },
    getEnv('ACCESS_TOKEN_SECRET') as string,
    { expiresIn: getEnv('ACCESS_TOKEN_EXPIRY') } as SignOptions
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    getEnv('REFRESH_TOKEN_SECRET') as string,
    { expiresIn: getEnv('REFRESH_TOKEN_EXPIRY') } as SignOptions
  );

  await db
    .update(users)
    .set({ refreshToken: hashToken(refreshToken) })
    .where(eq(users.id, userId));

  return { accessToken, refreshToken };
};

export const refreshAccessTokenService = async (incomingRefToken: string) => {
  let payload: { id: string };

  try {
    payload = jwt.verify(incomingRefToken, getEnv('REFRESH_TOKEN_SECRET')) as {
      id: string;
    };
  } catch {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, payload.id),
  });

  if (!user || !user.refreshToken) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const incomingHash = hashToken(incomingRefToken);

  if (incomingHash !== user.refreshToken) {
    await db.update(users).set({ refreshToken: null }).where(eq(users.id, user.id));
    throw new ApiError(401, 'Refresh token reuse detected');
  }

  if (!user.isEmailVerified) {
    throw new ApiError(401, 'Email not verified');
  }

  return generateAccessandRefreshTokenService(user.id);
};

export const logoutService = async (userId: string) => {
  await db.update(users).set({ refreshToken: null }).where(eq(users.id, userId));
};

export const googleOAuthCallbackService = async ({ code }: oAuthSchemaDTO) => {
  const tokenRes = await axios.post(`https://oauth2.googleapis.com/token`, null, {
    params: {
      code,
      client_id: getEnv('GOOGLE_CLIENT_ID'),
      client_secret: getEnv('GOOGLE_CLIENT_SECRET'),
      redirect_uri: getEnv('GOOGLE_REDIRECT_URI'),
      grant_type: 'authorization_code',
    },
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  const googleAccessToken = tokenRes.data.access_token;

  const userInfoRes = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo`, {
    headers: { Authorization: `Bearer ${googleAccessToken}` },
  });
  const userInfo = userInfoRes.data;

  let user = await db.query.users.findFirst({
    where: eq(users.email, userInfo.email),
  });

  if (!user) {
    const username = await generateUniqueUsername(userInfo.email.split('@')[0]);

    user = await db.transaction(async (tx) => {
      const [u] = await tx
        .insert(users)
        .values({
          email: userInfo.email,
          isEmailVerified: true,
          provider: 'GOOGLE',
        })
        .returning();

      await tx.insert(profiles).values({
        userId: u.id,
        username,
        name: userInfo.name,
        avatarUrl: userInfo.picture,
      });

      return u;
    });
  }

  return { id: user.id };
};

export const githubOAuthCallbackService = async ({ code }: oAuthSchemaDTO) => {
  const tokenRes = await axios.post(
    `https://github.com/login/oauth/access_token`,
    {
      client_id: getEnv('GITHUB_CLIENT_ID'),
      client_secret: getEnv('GITHUB_CLIENT_SECRET'),
      code,
      redirect_uri: getEnv('GITHUB_REDIRECT_URI'),
    },
    { headers: { Accept: 'application/json' } }
  );

  const githubAccessToken = tokenRes.data.access_token;

  const userInfo = await axios.get<GitHubUser>(`https://api.github.com/user`, {
    headers: { Authorization: `Bearer ${githubAccessToken}` },
  });

  const emailRes = await axios.get<GitHubEmail[]>(`https://api.github.com/user/emails`, {
    headers: { Authorization: `Bearer ${githubAccessToken}` },
  });

  const emailObj = emailRes.data.find((e) => e.primary && e.verified);
  const email = emailObj?.email;

  if (!email) {
    throw new ApiError(400, 'GitHub email not found or verified');
  }

  let user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    const username = await generateUniqueUsername(email.split('@')[0]);

    user = await db.transaction(async (tx) => {
      const [u] = await tx
        .insert(users)
        .values({ email, isEmailVerified: true, provider: 'GITHUB' })
        .returning();

      await tx.insert(profiles).values({
        userId: u.id,
        username,
        name: userInfo.data.name ?? userInfo.data.login,
        avatarUrl: userInfo.data.avatar_url,
      });

      return u;
    });
  }

  return { id: user.id };
};

export const forgotPasswordService = async ({ email }: ForgotPasswordDTO) => {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  // Silently return if user not found — prevents email enumeration
  if (!user) return;

  const rawToken = randomBytes(32).toString('hex');
  const hashedToken = hashToken(rawToken);
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db
    .update(users)
    .set({ forgotPasswordToken: hashedToken, forgotPasswordExpiry: expiry })
    .where(eq(users.id, user.id));

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, user.id),
    columns: { username: true },
  });

  const resetUrl = `${getEnv('BASE_URL')}/api/v1/auth/resetPassword/${rawToken}`;
  try {
    await sendMail({
      email: user.email,
      subject: 'Reset your password',
      mailGenContent: forgotPasswordContent(profile?.username ?? 'User', resetUrl),
    });
  } catch (err) {
    console.error('Failed to send password reset email', err);
  }
};

export const resetPasswordService = async (
  { token }: ResetPasswordParamDTO,
  { password }: ResetPasswordDTO
) => {
  const hashedToken = hashToken(token);

  const user = await db.query.users.findFirst({
    where: eq(users.forgotPasswordToken, hashedToken),
  });

  if (!user) {
    throw new ApiError(404, 'Invalid or expired reset token');
  }

  if (!user.forgotPasswordExpiry || user.forgotPasswordExpiry < new Date()) {
    throw new ApiError(410, 'Reset token has expired');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db
    .update(users)
    .set({
      password: hashedPassword,
      forgotPasswordToken: null,
      forgotPasswordExpiry: null,
      refreshToken: null, // force re-login on all devices
    })
    .where(eq(users.id, user.id));
};

export const changePasswordService = async (
  userId: string,
  { currentPassword, newPassword }: ChangePasswordDTO
) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (!user.password) {
    throw new ApiError(400, 'Cannot change password for OAuth accounts');
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await db
    .update(users)
    .set({
      password: hashedPassword,
      refreshToken: null, // force re-login on all devices
    })
    .where(eq(users.id, userId));
};
