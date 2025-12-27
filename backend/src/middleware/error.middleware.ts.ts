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

const apiSuccess = <T>(statusCode: number, message: string, data: T) => ({
  success: true,
  statusCode,
  message,
  data,
});

export { ApiError, apiSuccess };
