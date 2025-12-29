import bcrypt from 'bcryptjs';
import { db } from '../libs/db';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { ApiError, apiSuccess } from '../utils/ApiError';

import type {
  LoginSchemaDTO,
  oAuthSchema,
  oAuthSchemaDTO,
  RegisterDto,
  ResendEmailVerficationDTO,
  VerifyEmailDTO,
} from '../validators/auth.schema';
import crypto, { randomBytes } from 'crypto';
import { emailVerificationContent, sendMail } from '@/utils/mail';
import { getEnv } from '@/utils/env';
import axios from 'axios';

const hashToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');

const generateUniqueUsername = async (base: string) => {
  let username = base.toLowerCase();
  let exists = true;

  while (exists) {
    const count = await db.profile.count({
      where: { username },
    });

    if (count === 0) break;

    username = `${base}${Math.floor(Math.random() * 1000)}`;
  }

  return username;
};

export const registerService = async ({
  email,
  username,
  password,
}: RegisterDto) => {
  const existingUser = await db.user.findUnique({
    where: {
      email: email,
    },
  });

  if (existingUser) {
    throw new ApiError(409, 'User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const emailVerificationToken = randomBytes(32).toString('hex');
  const emailVerificationTokenExpiry = new Date(
    // Date.now() + 24 * 60 * 60 * 1000 // 24h
    Date.now() + 60 * 1000 // 24h
  );

  const newUser = await db.user.create({
    data: {
      email: email,
      password: hashedPassword,
      emailVerificationToken: emailVerificationToken,
      emailVerificationExpiry: emailVerificationTokenExpiry,
      profile: {
        create: {
          username: username,
        },
      },
    },
    include: {
      profile: {
        select: {
          username: true,
        },
      },
    },
  });

  const verificationUrl = `${getEnv('BASE_URL')}/api/v1/auth/verify/${newUser.emailVerificationToken}`;
  try {
    await sendMail({
      email: newUser.email,
      subject: 'Email verification',
      mailGenContent: emailVerificationContent(
        newUser.profile?.username || 'User',
        verificationUrl
      ),
    });
  } catch (err) {
    console.error('Failed to send verification email', err);
  }

  return {
    id: newUser.id,
    email: newUser.email,
    username: newUser.profile?.username,
  };
};

export const verifyService = async ({
  emailVerificationToken,
}: VerifyEmailDTO) => {
  const user = await db.user.findFirst({
    where: {
      emailVerificationToken: emailVerificationToken,
    },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.isEmailVerified) {
    throw new ApiError(400, 'Email already verified');
  }

  if (
    user.emailVerificationExpiry &&
    user.emailVerificationExpiry < new Date(Date.now())
  ) {
    throw new ApiError(410, 'Verification token has expired');
  }

  await db.user.update({
    where: {
      id: user.id,
    },
    data: {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpiry: null,
    },
  });
};

export const resendEmailVerificationService = async ({
  email,
}: ResendEmailVerficationDTO) => {
  const user = await db.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.isEmailVerified) {
    throw new ApiError(400, 'Email is already verified');
  }

  if (
    user.emailVerificationExpiry &&
    user.emailVerificationExpiry > new Date()
  ) {
    throw new ApiError(429, 'Email already sent. Please wait or check spam');
  }

  const emailVerificationToken = randomBytes(32).toString('hex');
  const emailVerificationTokenExpiry = new Date(
    Date.now() + 24 * 60 * 60 * 1000 // 24h
  );

  const newUser = await db.user.update({
    where: {
      email: email,
    },
    data: {
      emailVerificationToken: emailVerificationToken,
      emailVerificationExpiry: emailVerificationTokenExpiry,
    },
    include: {
      profile: {
        select: {
          username: true,
        },
      },
    },
  });

  const verificationUrl = `${getEnv('BASE_URL')}/api/v1/auth/verify/${newUser.emailVerificationToken}`;
  try {
    await sendMail({
      email: newUser.email,
      subject: 'Email verification',
      mailGenContent: emailVerificationContent(
        newUser.profile?.username || 'User',
        verificationUrl
      ),
    });
  } catch (err) {
    console.error('Failed to send verification email', err);
  }
};

export const loginService = async ({
  identifier,
  password,
}: LoginSchemaDTO) => {
  const user = await db.user.findFirst({
    where: {
      OR: [{ email: identifier }, { profile: { username: identifier } }],
    },
    include: {
      profile: true,
    },
  });

  if (!user || !user.password) {
    throw new ApiError(401, 'Invaliid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new ApiError(400, 'Invalid credentials');
  }

  if (!user.isEmailVerified) {
    throw new ApiError(403, 'Please verify your email first');
  }

  return {
    id: user.id,
    email: user.email,
    username: user.profile?.username,
    avatar: user.profile?.avatarUrl,
    name: user.profile?.displayName,
  };
};

export const generateAccessandRefreshTokenService = async (userId: string) => {
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const accessToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    getEnv('ACCESS_TOKEN_SECRET') as string,
    {
      expiresIn: getEnv('ACCESS_TOKEN_EXPIRY'),
    } as SignOptions
  );

  const refreshToken = jwt.sign(
    {
      id: user.id,
    },
    getEnv('REFRESH_TOKEN_SECRET') as string,
    {
      expiresIn: getEnv('REFRESH_TOKEN_EXPIRY'),
    } as SignOptions
  );

  await db.user.update({
    where: { id: userId },
    data: { refreshToken: hashToken(refreshToken) },
  });

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

  const user = await db.user.findUnique({
    where: { id: payload.id },
  });

  if (!user || !user.refreshToken) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const incomingHash = hashToken(incomingRefToken);

  if (incomingHash !== user.refreshToken) {
    await db.user.update({
      where: { id: user.id },
      data: { refreshToken: null },
    });

    throw new ApiError(401, 'Refresh token reuse detected');
  }

  if (!user.isEmailVerified) {
    throw new ApiError(401, 'Email not verified');
  }

  return generateAccessandRefreshTokenService(user.id);
};

export const logoutService = async (userId: string) => {
  const user = await db.user.update({
    where: { id: userId },
    data: {
      refreshToken: null,
    },
  });
};

export const googleOAuthCallbackService = async ({ code }: oAuthSchemaDTO) => {
  const tokenRes = await axios.post(
    `https://oauth2.googleapis.com/token`,
    null,
    {
      params: {
        code,
        client_id: getEnv('GOOGLE_CLIENT_ID'),
        client_secret: getEnv('GOOGLE_CLIENT_SECRET'),
        redirect_uri: getEnv('GOOGLE_REDIRECT_URI'),
        grant_type: 'authorization_code',
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  const googleAccessToken = tokenRes.data.access_token;

  const userInfoRes = await axios.get(
    `https://www.googleapis.com/oauth2/v3/userinfo`,
    {
      headers: {
        Authorization: `Bearer ${googleAccessToken}`,
      },
    }
  );
  const userInfo = userInfoRes.data;

  let user = await db.user.findUnique({
    where: { email: userInfo.email },
  });

  const baseUsername = userInfo.email.split('@')[0];

  const username = await generateUniqueUsername(baseUsername);

  if (!user) {
    user = await db.user.create({
      data: {
        email: userInfo.email,
        isEmailVerified: true,
        provider: 'GOOGLE',
        profile: {
          create: {
            username: username,
            displayName: userInfo.name,
            avatarUrl: userInfo.picture,
          },
        },
      },
    });
  }
  return {
    id: user.id,
  };
};

export const githubOAuthCallbackService = async () => {};
