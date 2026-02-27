import { ExecutionResponse, SubmissionAnalysis } from "./types";

export function statusClasses(status: string, passed: boolean): string {
  if (passed) return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
  const normalized = status.toUpperCase().replace(/\s+/g, "_");
  if (normalized === "TIME_LIMIT_EXCEEDED")
    return "text-amber-400 bg-amber-400/10 border-amber-400/20";
  return "text-red-400 bg-red-400/10 border-red-400/20";
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function fmtMemory(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function fmtTime(ms: number | null): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export function fmtTimer(s: number): string {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function normalizeSubmission(data: SubmissionAnalysis): ExecutionResponse {
  return {
    allPassed: data.submission.status === "ACCEPTED",
    detailedResults: data.testResults.map((r) => ({
      testCase: r.testCase,
      passed: r.passed,
      stdout: r.output,
      expected: r.expected,
      status: r.status,
      time: r.executionTimeMs != null ? (r.executionTimeMs / 1000).toFixed(3) : null,
      stderr: r.stderr,
      compileOutput: r.compileOutput,
    })),
  };
}
