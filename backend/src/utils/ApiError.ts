import type { ZodError } from 'zod';

class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const errorHandler = (err: Error | ApiError | ZodError) => {};

export function apiSuccess(
  statusCode: number,
  message: string
): {
  success: true;
  statusCode: number;
  message: string;
};

export function apiSuccess<T>(
  statusCode: number,
  message: string,
  data: T
): {
  success: true;
  statusCode: number;
  message: string;
  data: T;
};

export function apiSuccess<T>(statusCode: number, message: string, data?: T) {
  return {
    success: true,
    statusCode,
    message,
    ...(data !== undefined ? { data } : {}),
  };
}

export { ApiError };
