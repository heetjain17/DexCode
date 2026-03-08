export type Language = "PYTHON" | "JAVA" | "JAVASCRIPT" | "CPP";

export interface Problem {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  editorial?: string;
  stats: {
    totalSubmissions: number;
    successfulSubmissions: number;
    acceptanceRate: number;
    likes: number;
    dislikes: number;
  };
  examples: { input: string; output: string; explanation?: string; order: number }[];
  constraints: { description: string; order: number }[];
  hints: { content: string; order: number }[];
  tags: { id: string; name: string; slug: string }[];
  codeTemplates: Record<Language, { template: string; userCode: string }>;
  isSolved: boolean;
}

export interface ExecutionResult {
  testCase: number;
  passed: boolean;
  stdout: string | null;
  expected: string;
  status: string;
  time?: string | null;
  stderr?: string | null;
  compileOutput?: string | null;
}

export interface ExecutionResponse {
  detailedResults: ExecutionResult[] | undefined;
  allPassed: boolean;
}

// Submit returns a richer SubmissionAnalysis shape — normalized to ExecutionResponse
export interface SubmissionAnalysis {
  submission: { id: string; status: string };
  testResults: {
    testCase: number;
    passed: boolean;
    output: string | null;
    expected: string;
    status: string;
    executionTimeMs: number | null;
    stderr: string | null;
    compileOutput: string | null;
  }[];
}

export interface SubmissionListItem {
  id: string;
  status: string;
  verdict: string | null;
  language: string;
  executionTime: number | null;
  memoryUsed: number | null;
  createdAt: string;
}

export interface SubmissionDetail {
  submission: {
    id: string;
    status: string;
    verdict: string | null;
    language: string;
    executionTime: number | null;
    memoryUsed: number | null;
    createdAt: string;
  };
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    passRate: string;
    avgExecutionTimeMs: number;
    peakMemoryBytes: number;
  };
  testResults: {
    testCase: number;
    status: "PASSED" | "FAILED" | "ERROR";
    passed: boolean;
    executionTimeMs: number | null;
    memoryBytes: number | null;
  }[];
}

export type LeftTab = "description" | "hints" | "editorial" | "submissions";
