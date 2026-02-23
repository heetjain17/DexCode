import { getEnv } from '@/utils/env';

export const judge0Config = {
  baseUrl: getEnv('JUDGE0_BASE_URL'),
  rapidApiKey: process.env.JUDGE0_RAPIDAPI_KEY,
  rapidApiHost: process.env.JUDGE0_RAPIDAPI_HOST,
  pollingIntervalMs: Number(process.env.JUDGE0_POLLING_INTERVAL_MS ?? 1000),
  maxPollingAttempts: Number(process.env.JUDGE0_MAX_POLLING_ATTEMPTS ?? 30),
  rateLimitPerMinute: Number(process.env.JUDGE0_RATE_LIMIT_PER_MINUTE ?? 5),
  rateLimitPerDay: Number(process.env.JUDGE0_RATE_LIMIT_PER_DAY ?? 50),
  maxConcurrent: Number(process.env.JUDGE0_MAX_CONCURRENT ?? 1),
};
