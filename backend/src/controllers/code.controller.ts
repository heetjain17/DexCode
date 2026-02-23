import { eq, sql } from 'drizzle-orm';
import { executeCodeAgainstTestcases } from '@/services/codeExecution.service';
import { ApiError, apiSuccess } from '@/utils/ApiError';
import { asyncHandler } from '@/utils/asyncHandler';
import { db } from '@/libs/db';
import { problems, submissions, testCaseResults, problemSolved } from '@/db/schema';
import { RunCodeDTO } from '@/validators/code.schema';
import { getLanguageId } from '@/libs/judge0.client';

type TestCaseStatusValue = 'PASSED' | 'FAILED' | 'ERROR';

function toTestCaseStatus(passed: boolean, statusDescription: string): TestCaseStatusValue {
  if (passed) return 'PASSED';
  const s = statusDescription.toLowerCase();
  if (s.includes('error') || s.includes('compilation')) return 'ERROR';
  return 'FAILED';
}

export const runCodePreview = asyncHandler(async (req, res) => {
  const body = req.validated!.body as RunCodeDTO;

  const problem = await db.query.problems.findFirst({
    where: eq(problems.id, body.problemId),
    with: { examples: true },
  });

  if (!problem) {
    throw new ApiError(404, 'Problem not found');
  }

  if (!problem.examples?.length) {
    throw new ApiError(500, 'Problem examples not configured');
  }

  const exampleTestcases = problem.examples
    .sort((a, b) => a.order - b.order)
    .map((ex) => ({ input: ex.input, output: ex.output }));

  const result = await executeCodeAgainstTestcases(
    body.source_code,
    getLanguageId(body.language),
    exampleTestcases
  );

  res.status(200).json(apiSuccess(200, 'Code executed', result));
});

export const submitCode = asyncHandler(async (req, res) => {
  const { source_code, language, problemId } = req.validated!.body as RunCodeDTO;
  const userId = req.user!.id;

  const problem = await db.query.problems.findFirst({
    where: eq(problems.id, problemId),
    with: { testCases: true },
  });

  if (!problem) {
    throw new ApiError(404, 'Problem not found');
  }

  if (!problem.testCases?.length) {
    throw new ApiError(500, 'Problem test cases not configured');
  }

  const languageId = getLanguageId(language);

  const testcases = problem.testCases
    .sort((a, b) => a.order - b.order)
    .map((tc) => ({ input: tc.input, output: tc.output }));

  const { detailedResults, allPassed } = await executeCodeAgainstTestcases(
    source_code,
    languageId,
    testcases
  );

  const executionTime = Math.max(
    ...detailedResults.map((r) => Math.round(parseFloat(r.time ?? '0') * 1000))
  );
  const memoryUsed = Math.max(...detailedResults.map((r) => (r.memory as number) ?? 0));

  const [submission] = await db
    .insert(submissions)
    .values({
      userId,
      problemId,
      code: source_code,
      language,
      status: allPassed ? 'ACCEPTED' : 'WRONG_ANSWER',
      verdict: allPassed ? 'All test cases passed' : 'Some test cases failed',
      executionTime,
      memoryUsed,
    })
    .returning();

  await db.insert(testCaseResults).values(
    detailedResults.map((r) => ({
      submissionId: submission.id,
      testCase: r.testCase,
      status: toTestCaseStatus(r.passed, r.status),
      passed: r.passed,
      output: r.stdout ?? null,
      expected: r.expected,
      stderr: r.stderr ?? null,
      compileOutput: r.compileOutput ?? null,
      executionTime: Math.round(parseFloat(r.time ?? '0') * 1000),
      memoryUsed: (r.memory as number) ?? null,
    }))
  );

  if (allPassed) {
    await db
      .insert(problemSolved)
      .values({
        userId,
        problemId,
        bestSubmissionId: submission.id,
        attemptCount: 1,
      })
      .onConflictDoUpdate({
        target: [problemSolved.userId, problemSolved.problemId],
        set: {
          attemptCount: sql`${problemSolved.attemptCount} + 1`,
          bestSubmissionId: submission.id,
          solvedAt: new Date(),
          updatedAt: new Date(),
        },
      });
  }

  res.status(200).json(
    apiSuccess(200, 'Code submitted', {
      submissionId: submission.id,
      status: submission.status,
    })
  );
});
