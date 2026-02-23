import { getEnv } from '@/utils/env';
import { Judge0Result, Judge0Submission } from '@/validators/code.schema';
import axios from 'axios';

const JUDGE0_URL = getEnv('JUDGE0_URL');

export const submitBatch = async (
  submissions: Judge0Submission[]
): Promise<{ token: string }[]> => {
  const { data } = await axios.post(`${JUDGE0_URL}/submissions/batch?base64_encoded=false`, {
    submissions: submissions.map((s) => ({
      source_code: s.source_code,
      language_id: s.language_id,
      stdin: s.stdin,
      base64_encoded: false,
    })),
  });
  return data;
};

export const pollBatchResults = async (tokens: string[]): Promise<Judge0Result[]> => {
  const MAX_ATTEMPTS = 30; // ~30 seconds
  let attempts = 0;
  while (attempts < MAX_ATTEMPTS) {
    attempts++;

    const { data } = await axios.get(
      `${JUDGE0_URL}/submissions/batch?tokens=${tokens[0]},${tokens[1]}&base64_encoded=false`
    );

    const results: Judge0Result[] = data.submissions;

    // DEBUG LOG (KEEP THIS FOR NOW)
    console.log(
      'Judge0 statuses:',
      results.map((r) => r.status)
    );

    const isDone = results.every((r) => r.status.id > 2);

    if (isDone) return results;

    await new Promise((r) => setTimeout(r, 1000));
  }

  throw new Error('Judge0 timeout: execution did not complete');
};
