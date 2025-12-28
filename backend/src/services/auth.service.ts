import bcrypt from 'bcryptjs';
import { db } from '../libs/db';
import { ApiError, apiSuccess } from '../utils/ApiError';
import type { RegisterDto } from '../validators/auth.schema';

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

  const user = await db.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
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

  return {
    id: user.id,
    email: user.email,
    username: user.profile?.username,
  };
};
