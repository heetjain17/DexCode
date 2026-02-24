import { ApiError } from '@/utils/ApiError';
import { ExecutionResponse, Judge0Result } from '@/validators/code.schema';
import { pollBatchResults, submitBatch } from './judge0.services';

interface Testcase {
  input: string;
  output: string;
}

function injectTemplate(template: string | null | undefined, sourceCode: string): string {
  if (!template) return sourceCode;
  if (!template.includes('[USER_CODE_HERE]')) {
    throw new ApiError(500, 'Code template is missing the [USER_CODE_HERE] marker');
  }
  return template.replace('[USER_CODE_HERE]', sourceCode);
}

export const executeCodeAgainstTestcases = async (
  sourceCode: string,
  languageId: number,
  testcases: Testcase[],
  template?: string | null
): Promise<ExecutionResponse> => {
  if (!Array.isArray(testcases) || testcases.length === 0) {
    throw new ApiError(400, 'Invalid or empty testcases');
  }

  const codeToRun = injectTemplate(template, sourceCode);

  const submissions = testcases.map((tc) => ({
    source_code: codeToRun,
    language_id: languageId,
    stdin: tc.input,
  }));

  const submitResponse = await submitBatch(submissions);
  const tokens = submitResponse.map((r) => r.token);

  const results = await pollBatchResults(tokens);

  let allPassed = true;

  const detailedResults = results.map((r: Judge0Result, i: number) => {
    const stdout = r.stdout?.trim() ?? '';
    const expected = testcases[i].output.trim();
    const passed = stdout === expected;

    if (!passed) allPassed = false;

    return {
      testCase: i + 1,
      passed,
      stdout,
      expected,
      status: r.status.description,
      memory: r.memory?.toString(),
      time: r.time,
      stderr: r.stderr,
      compileOutput: r.compile_output,
    };
  });

  return { detailedResults, allPassed };
};
