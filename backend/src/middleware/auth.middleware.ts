import type { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { ApiError } from '../utils/ApiError';
import { getEnv } from '../utils/env';
import { db } from '../libs/db';
import { users } from '../db/schema';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.accessToken;

  if (!token) {
    throw new ApiError(401, 'Access token missing');
  }

  let payload: JwtPayload;

  try {
    payload = jwt.verify(token, getEnv('ACCESS_TOKEN_SECRET')) as JwtPayload;
  } catch {
    return res.status(401).json({ message: 'Unauthorized - Invalid token' });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, payload.id),
    columns: { id: true, email: true, role: true },
  });

  if (!user) {
    throw new ApiError(401, 'User no longer exists');
  }

  req.user = user;

  next();
};

export const reuireRole =
  (...roles: Array<'ADMIN' | 'USER'>) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, 'Forbidden');
    }
    next();
  };
