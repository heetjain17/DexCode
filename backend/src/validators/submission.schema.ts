import { z } from 'zod';

export const submissionQuerySchema = z.object({
  problemId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type SubmissionQueryDTO = z.infer<typeof submissionQuerySchema>;

export interface SubmissionTestResult {
  testCase: number;
  status: 'PASSED' | 'FAILED' | 'ERROR';
  passed: boolean;
  input: string | null;
  output: string | null;
  expected: string;
  executionTimeMs: number | null;
  memoryBytes: number | null;
  stderr: string | null;
  compileOutput: string | null;
}

export interface SubmissionSummary {
  totalTests: number;
  passed: number;
  failed: number;
  passRate: string;
  avgExecutionTimeMs: number;
  peakMemoryBytes: number;
}

export interface SubmissionAnalysis {
  submission: {
    id: string;
    status: string;
    verdict: string | null;
    language: string;
    executionTime: number | null;
    memoryUsed: number | null;
    createdAt: Date;
  };
  problem: {
    id: string;
    title: string;
    difficulty: string;
  };
  summary: SubmissionSummary;
  testResults: SubmissionTestResult[];
}

export interface SubmissionListItem {
  id: string;
  status: string;
  verdict: string | null;
  language: string;
  executionTime: number | null;
  memoryUsed: number | null;
  createdAt: Date;
  problem: {
    id: string;
    title: string;
    difficulty: string;
  };
}
