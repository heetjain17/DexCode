import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '@/libs/db';
import { submissions } from '@/db/schema';
import { ApiError } from '@/utils/ApiError';
import {
  SubmissionAnalysis,
  SubmissionListItem,
  SubmissionTestResult,
  SubmissionSummary,
} from '@/validators/submission.schema';

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
