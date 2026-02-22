import { db } from '@/libs/db';
import { ApiError } from '@/utils/ApiError';
import { pollBatchResults, submitBatch } from './judge0.services';

interface Testcase {
  input: string;
  output: string;
}

export const executeCodeAgainstTestcases = async (
  sourceCode: string,
  languageId: number,
  testcases: Testcase[]
) => {
  if (!Array.isArray(testcases) || testcases.length === 0) {
    throw new ApiError(400, 'Invalid or empty testcases');
  }

  const submissions = testcases.map((tc) => ({
    source_code: sourceCode,
    language_id: languageId,
    stdin: tc.input,
  }));

  console.log(submissions);

  const submitResponse = await submitBatch(submissions);
  const tokens = submitResponse.map((r: any) => r.token);

  const results = await pollBatchResults(tokens);

  let allPassed = true;

  const detailedResults = results.map((r: any, i: number) => {
    const stdout = r.stdout?.trim() ?? '';
    const expected = testcases[i].output.trim();
    const passed = stdout === expected;

    if (!passed) allPassed = false;
    console.log(r.message, r.stderr);

    return {
      testCase: i + 1,
      passed,
      stdout,
      expected,
      status: r.status.description,
      memory: r.memory,
      time: r.time,
      stderr: r.stderr,
      compileOutput: r.compile_output,
    };
  });

  return { detailedResults, allPassed };
};
