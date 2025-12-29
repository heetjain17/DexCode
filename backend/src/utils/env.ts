import { ApiError } from './ApiError';

export const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new ApiError(500, `Missing environment variable: ${key}`);
  }
  return value;
};
