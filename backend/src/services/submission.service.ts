import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '@/libs/db';
import { submissions, testCaseResults, problemSolved, problems } from '@/db/schema';
import { ApiError } from '@/utils/ApiError';
import {
  SubmissionAnalysis,
  SubmissionListItem,
  SubmissionTestResult,
  SubmissionSummary,
} from '@/validators/submission.schema';
import type { ExecutionResponse } from '@/validators/code.schema';
import type { LanguageKey } from '@/services/judge0.service';

export type TestCaseStatusValue = 'PASSED' | 'FAILED' | 'ERROR';

export function toTestCaseStatus(passed: boolean, statusDescription: string): TestCaseStatusValue {
  if (passed) return 'PASSED';
  const s = statusDescription.toLowerCase();
  if (s.includes('error') || s.includes('compilation')) return 'ERROR';
  return 'FAILED';
}

function buildSummary(
  testResults: SubmissionTestResult[],
  peakMemoryBytes: number | null
): SubmissionSummary {
  const total = testResults.length;
  const passed = testResults.filter((r) => r.passed).length;
  const failed = total - passed;
  const avgExecutionTimeMs =
    total > 0
      ? Math.round(testResults.reduce((sum, r) => sum + (r.executionTimeMs ?? 0), 0) / total)
      : 0;

  return {
    totalTests: total,
    passed,
    failed,
    passRate: total > 0 ? `${((passed / total) * 100).toFixed(2)}%` : '0.00%',
    avgExecutionTimeMs,
    peakMemoryBytes: peakMemoryBytes ?? 0,
  };
}

export async function saveSubmission(params: {
  userId: string;
  problemId: string;
  source_code: string;
  language: LanguageKey;
  testcases: { input: string; output: string }[];
  executionResults: ExecutionResponse;
  problem: { id: string; title: string; difficulty: string };
}): Promise<SubmissionAnalysis> {
  const { userId, problemId, source_code, language, testcases, executionResults, problem } = params;
  const { detailedResults, allPassed } = executionResults;

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

  await db
    .update(problems)
    .set({
      totalSubmissions: sql`${problems.totalSubmissions} + 1`,
      successfulSubmissions: allPassed
        ? sql`${problems.successfulSubmissions} + 1`
        : problems.successfulSubmissions,
      acceptanceRate: sql`
        round(
          cast(${problems.successfulSubmissions} + ${allPassed ? 1 : 0} as numeric)
          / cast(${problems.totalSubmissions} + 1 as numeric) * 100,
          2
        )
      `,
    })
    .where(eq(problems.id, problemId));

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

  return {
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
    summary: buildSummary(testResultsOut, memoryUsed),
    testResults: testResultsOut,
  };
}

export async function getSubmissionById(id: string, userId: string): Promise<SubmissionAnalysis> {
  const submission = await db.query.submissions.findFirst({
    where: eq(submissions.id, id),
    with: {
      problem: { columns: { id: true, title: true, difficulty: true } },
      testResults: true,
    },
  });

  if (!submission) {
    throw new ApiError(404, 'Submission not found');
  }

  if (submission.userId !== userId) {
    throw new ApiError(403, 'Access denied');
  }

  const testResultsOut: SubmissionTestResult[] = submission.testResults
    .sort((a, b) => a.testCase - b.testCase)
    .map((r) => ({
      testCase: r.testCase,
      status: r.status as 'PASSED' | 'FAILED' | 'ERROR',
      passed: r.passed,
      input: r.input ?? null,
      output: r.output ?? null,
      expected: r.expected,
      executionTimeMs: r.executionTime ?? null,
      memoryBytes: r.memoryUsed ?? null,
      stderr: r.stderr ?? null,
      compileOutput: r.compileOutput ?? null,
    }));

  return {
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
      id: submission.problem.id,
      title: submission.problem.title,
      difficulty: submission.problem.difficulty,
    },
    summary: buildSummary(testResultsOut, submission.memoryUsed),
    testResults: testResultsOut,
  };
}

export async function listUserSubmissions(
  userId: string,
  options: { problemId?: string; page: number; limit: number }
): Promise<{
  submissions: SubmissionListItem[];
  pagination: { page: number; limit: number; total: number };
}> {
  const { problemId, page, limit } = options;
  const offset = (page - 1) * limit;

  const where = problemId
    ? and(eq(submissions.userId, userId), eq(submissions.problemId, problemId))
    : eq(submissions.userId, userId);

  const [rows, [{ total }]] = await Promise.all([
    db.query.submissions.findMany({
      where,
      with: { problem: { columns: { id: true, title: true, difficulty: true } } },
      orderBy: desc(submissions.createdAt),
      limit,
      offset,
    }),
    db
      .select({ total: sql<number>`cast(count(*) as int)` })
      .from(submissions)
      .where(where),
  ]);

  return {
    submissions: rows.map((s) => ({
      id: s.id,
      status: s.status,
      verdict: s.verdict,
      language: s.language,
      executionTime: s.executionTime,
      memoryUsed: s.memoryUsed,
      createdAt: s.createdAt,
      problem: {
        id: s.problem.id,
        title: s.problem.title,
        difficulty: s.problem.difficulty,
      },
    })),
    pagination: { page, limit, total },
  };
}
