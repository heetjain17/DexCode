import axios from 'axios';
import { judge0Config } from '@/config/judge0.config';
import { Judge0Result, Judge0Submission } from '@/validators/code.schema';

// LANGUAGE MAPPING
export const LANGUAGE_MAP = {
  PYTHON: 71,
  JAVA: 62,
  JAVASCRIPT: 63,
  CPP: 54,
} as const;

export type LanguageKey = keyof typeof LANGUAGE_MAP;

export const getLanguageId = (language: LanguageKey): number => LANGUAGE_MAP[language];

export const getLanguageName = (id: number): string => {
  const map: Record<number, string> = {
    71: 'Python',
    62: 'Java',
    63: 'JavaScript',
    54: 'C++',
  };
  return map[id] ?? 'Unknown';
};

// HTTP HEADERS
const getHeaders = () => {
  if (judge0Config.rapidApiKey && judge0Config.rapidApiHost) {
    return {
      'Content-Type': 'application/json',
      'x-rapidapi-key': judge0Config.rapidApiKey,
      'x-rapidapi-host': judge0Config.rapidApiHost,
    };
  }
  return { 'Content-Type': 'application/json' };
};

// post sumbmissions
export const submitBatch = async (
  submissions: Judge0Submission[]
): Promise<{ token: string }[]> => {
  const { data } = await axios.post(
    `${judge0Config.baseUrl}/submissions/batch?base64_encoded=false`,
    {
      submissions: submissions.map((s) => ({
        source_code: s.source_code,
        language_id: s.language_id,
        stdin: s.stdin,
      })),
    },
    { headers: getHeaders() }
  );
  return data;
};

// fetch results of submissions
export const pollBatchResults = async (tokens: string[]): Promise<Judge0Result[]> => {
  const tokenStr = tokens.join(',');
  let attempts = 0;

  while (attempts < judge0Config.maxPollingAttempts) {
    attempts++;

    const { data } = await axios.get(
      `${judge0Config.baseUrl}/submissions/batch?tokens=${tokenStr}&base64_encoded=false&fields=*`,
      { headers: getHeaders() }
    );

    const results: Judge0Result[] = data.submissions;
    const isDone = results.every((r) => r.status.id > 2);

    if (isDone) return results;

    await new Promise((r) => setTimeout(r, judge0Config.pollingIntervalMs));
  }

  throw new Error('Judge0 timeout: execution did not complete');
};
