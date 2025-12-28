import bcrypt from 'bcryptjs';
import { db } from '../libs/db';
import { ApiError, apiSuccess } from '../utils/ApiError';
import type { RegisterDto, VerifyEmailDTO } from '../validators/auth.schema';
import { randomBytes } from 'crypto';
import { emailVerificationContent, sendMail } from '@/utils/mail';

export const registerUser = async (data: RegisterDto) => {
  const existingUser = await db.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (existingUser) {
    throw new ApiError(409, 'User already exists');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const emailVerificationToken = randomBytes(32).toString('hex');
  const emailVerificationTokenExpiry = new Date(
    Date.now() + 24 * 60 * 60 * 1000 // 24h
  );

  const newUser = await db.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      emailVerificationToken: emailVerificationToken,
      emailVerificationExpiry: emailVerificationTokenExpiry,
      profile: {
        create: {
          username: data.username,
        },
      },
    },
    include: {
      profile: true,
    },
  });

  const verificationUrl = `${process.env.BASE_URL}/api/v1/auth/verify/${newUser.emailVerificationToken}`;
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

export const verifyUser = async (data: VerifyEmailDTO) => {};
