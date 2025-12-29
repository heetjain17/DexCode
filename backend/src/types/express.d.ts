// src/types/express.d.ts
import { z } from 'zod';
import type { User } from '@/generated/prisma';

declare global {
  namespace Express {
    interface Request {
      validated?: {
        body?: unknown;
        params?: unknown;
        query?: unknown;
      };
    }
  }
}
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: User['role'];
      };
    }
  }
}
