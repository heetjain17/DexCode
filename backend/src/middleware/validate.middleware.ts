import type { Request, Response, NextFunction } from 'express';
import type { ZodTypeAny } from 'zod/v3';

export const validate =
  (schema: ZodTypeAny) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      next(err);
    }
  };
