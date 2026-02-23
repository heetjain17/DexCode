import { eq, sql } from 'drizzle-orm';
import { executeCodeAgainstTestcases } from '@/services/codeExecution.service';
import { ApiError, apiSuccess } from '@/utils/ApiError';
import { asyncHandler } from '@/utils/asyncHandler';
import { db } from '@/libs/db';
import { problems, submissions, testCaseResults, problemSolved } from '@/db/schema';
import { RunCodeDTO } from '@/validators/code.schema';
import { getLanguageId } from '@/services/judge0.services';
import { SubmissionAnalysis, SubmissionTestResult } from '@/validators/submission.schema';

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
  const memoryUsed = Math.max(...detailedResults.map((r) => Number(r.memory ?? 0)));

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
    detailedResults.map((r, i) => ({
      submissionId: submission.id,
      testCase: r.testCase,
      status: toTestCaseStatus(r.passed, r.status),
      passed: r.passed,
      input: testcases[i].input,
      output: r.stdout ?? null,
      expected: r.expected,
      stderr: r.stderr ?? null,
      compileOutput: r.compileOutput ?? null,
      executionTime: Math.round(parseFloat(r.time ?? '0') * 1000),
      memoryUsed: r.memory != null ? Number(r.memory) : null,
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

  // Build detailed analysis from in-memory results (no extra DB query)
  const passed = detailedResults.filter((r) => r.passed).length;
  const failed = detailedResults.length - passed;
  const avgExecutionTimeMs = Math.round(
    detailedResults.reduce((sum, r) => sum + Math.round(parseFloat(r.time ?? '0') * 1000), 0) /
      detailedResults.length
  );

  const testResultsOut: SubmissionTestResult[] = detailedResults.map((r, i) => ({
    testCase: r.testCase,
    status: toTestCaseStatus(r.passed, r.status),
    passed: r.passed,
    input: testcases[i].input,
    output: r.stdout ?? null,
    expected: r.expected,
    executionTimeMs: Math.round(parseFloat(r.time ?? '0') * 1000),
    memoryBytes: r.memory != null ? Number(r.memory) : null,
    stderr: r.stderr ?? null,
    compileOutput: r.compileOutput ?? null,
  }));

  const analysis: SubmissionAnalysis = {
    submission: {
      id: submission.id,
      status: submission.status,
      verdict: submission.verdict,
      language: submission.language,
      executionTime: submission.executionTime,
      memoryUsed: submission.memoryUsed,
      createdAt: submission.createdAt,
    },
    problem: {
      id: problem.id,
      title: problem.title,
      difficulty: problem.difficulty,
    },
    summary: {
      totalTests: detailedResults.length,
      passed,
      failed,
      passRate: `${((passed / detailedResults.length) * 100).toFixed(2)}%`,
      avgExecutionTimeMs,
      peakMemoryBytes: memoryUsed,
    },
    testResults: testResultsOut,
  };

  res.status(200).json(apiSuccess(200, 'Code submitted', analysis));
});
