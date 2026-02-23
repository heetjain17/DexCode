// src/types/express.d.ts
import type { users } from '@/db/schema';

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
        role: (typeof users.$inferSelect)['role'];
      };
    }
  }
}
