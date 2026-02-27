"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import Editor from "@monaco-editor/react";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import {
  Play,
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ChevronLeft,
  History,
  Cpu,
  MemoryStick,
  BarChart2,
} from "lucide-react";
import api, { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Language = "PYTHON" | "JAVA" | "JAVASCRIPT" | "CPP";

interface Problem {
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

interface ExecutionResult {
  testCase: number;
  passed: boolean;
  stdout: string | null;
  expected: string;
  status: string;
  time?: string | null;
  stderr?: string | null;
  compileOutput?: string | null;
}

interface ExecutionResponse {
  detailedResults: ExecutionResult[] | undefined;
  allPassed: boolean;
}

// Submit returns a richer SubmissionAnalysis shape — normalized to ExecutionResponse below
interface SubmissionAnalysis {
  submission: { status: string };
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

function normalizeSubmission(data: SubmissionAnalysis): ExecutionResponse {
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

// ── Submission list / detail types ──
interface SubmissionListItem {
  id: string;
  status: string;
  verdict: string | null;
  language: string;
  executionTime: number | null;
  memoryUsed: number | null;
  createdAt: string;
}

interface SubmissionDetail {
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

// ─── Constants ────────────────────────────────────────────────────────────────

const DIFFICULTY_CONFIG = {
  EASY: { label: "Easy", cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  MEDIUM: { label: "Medium", cls: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  HARD: { label: "Hard", cls: "text-red-400 bg-red-400/10 border-red-400/20" },
} as const;

const LANGUAGE_LABELS: Record<Language, string> = {
  PYTHON: "Python",
  JAVA: "Java",
  JAVASCRIPT: "JavaScript",
  CPP: "C++",
};

const MONACO_LANGUAGES: Record<Language, string> = {
  PYTHON: "python",
  JAVA: "java",
  JAVASCRIPT: "javascript",
  CPP: "cpp",
};

type LeftTab = "description" | "hints" | "editorial" | "submissions";

const LEFT_TABS: { id: LeftTab; label: string }[] = [
  { id: "description", label: "Description" },
  { id: "hints", label: "Hints" },
  { id: "editorial", label: "Editorial" },
  { id: "submissions", label: "Submissions" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusClasses(status: string, passed: boolean): string {
  if (passed) return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
  const normalized = status.toUpperCase().replace(/\s+/g, "_");
  if (normalized === "TIME_LIMIT_EXCEEDED")
    return "text-amber-400 bg-amber-400/10 border-amber-400/20";
  return "text-red-400 bg-red-400/10 border-red-400/20";
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function fmtMemory(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fmtTime(ms: number | null): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

// ─── Submission sub-components ────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  const accepted = status === "ACCEPTED";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        accepted
          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
          : "border-red-500/25 bg-red-500/10 text-red-400"
      )}
    >
      {accepted ? (
        <CheckCircle2 className="h-2.5 w-2.5" />
      ) : (
        <XCircle className="h-2.5 w-2.5" />
      )}
      {accepted ? "Accepted" : "Wrong Answer"}
    </span>
  );
}

/** Colored grid of squares — one per test case. No data revealed. */
function TestCaseGrid({
  results,
}: {
  results: SubmissionDetail["testResults"];
}) {
  const colors: Record<string, string> = {
    PASSED: "bg-emerald-500/70 border-emerald-500/30",
    FAILED: "bg-red-500/70 border-red-500/30",
    ERROR: "bg-amber-500/70 border-amber-500/30",
  };
  return (
    <div className="flex flex-wrap gap-1">
      {results.map((r) => (
        <div
          key={r.testCase}
          title={`Test ${r.testCase} — ${r.status}`}
          className={cn(
            "h-5 w-5 rounded-sm border",
            colors[r.status] ?? "bg-dex-border border-dex-border"
          )}
        />
      ))}
    </div>
  );
}

/** CSS bar chart — execution time per test case. No test data shown. */
function TimeBarChart({ results }: { results: SubmissionDetail["testResults"] }) {
  const values = results.map((r) => r.executionTimeMs ?? 0);
  const max = Math.max(...values, 1);
  return (
    <div className="space-y-1">
      {results.map((r, i) => {
        const pct = (values[i] / max) * 100;
        return (
          <div key={r.testCase} className="flex items-center gap-2">
            <span className="w-12 shrink-0 text-right text-[10px] text-dex-muted">
              #{r.testCase}
            </span>
            <div className="flex-1 overflow-hidden rounded-sm bg-dex-bg" style={{ height: 12 }}>
              <div
                className={cn(
                  "h-full rounded-sm transition-all",
                  r.passed ? "bg-emerald-500/50" : "bg-red-500/50"
                )}
                style={{ width: `${Math.max(pct, 2)}%` }}
              />
            </div>
            <span className="w-12 shrink-0 text-[10px] text-dex-muted">
              {r.executionTimeMs != null ? `${r.executionTimeMs}ms` : "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Circular SVG arc for pass rate */
function PassRateRing({ passed, total }: { passed: number; total: number }) {
  const pct = total > 0 ? passed / total : 0;
  const r = 24;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  return (
    <svg width={64} height={64} className="-rotate-90">
      <circle
        cx={32}
        cy={32}
        r={r}
        fill="none"
        strokeWidth={5}
        className="stroke-dex-border"
      />
      <circle
        cx={32}
        cy={32}
        r={r}
        fill="none"
        strokeWidth={5}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className={pct === 1 ? "stroke-emerald-400" : "stroke-dex-accent"}
      />
      <text
        x={32}
        y={32}
        textAnchor="middle"
        dominantBaseline="central"
        className="rotate-90 fill-dex-text text-[11px] font-semibold"
        style={{ fontSize: 11, transform: "rotate(90deg)", transformOrigin: "32px 32px" }}
      >
        {passed}/{total}
      </text>
    </svg>
  );
}

/** Single submission detail view */
function SubmissionDetailView({
  submissionId,
  onBack,
}: {
  submissionId: string;
  onBack: () => void;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["submission", submissionId],
    queryFn: () =>
      api<SubmissionDetail>(`/submission/${submissionId}`).then((r) => r.data),
    staleTime: 5 * 60_000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-dex-accent" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-xs text-dex-muted">Failed to load submission.</p>
      </div>
    );
  }

  const { submission, summary, testResults } = data;
  const accepted = submission.status === "ACCEPTED";

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-2.5 border-b border-dex-border px-4 py-2.5">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-dex-muted transition-colors hover:text-dex-text"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Submissions
        </button>
        <span className="text-dex-border">·</span>
        <span className="font-mono text-[11px] text-dex-muted">
          {submission.id.slice(0, 8)}…
        </span>
        <div className="ml-auto">
          <StatusPill status={submission.status} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* Status banner */}
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg border px-4 py-3.5",
            accepted
              ? "border-emerald-500/20 bg-emerald-500/5"
              : "border-red-500/20 bg-red-500/5"
          )}
        >
          {accepted ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          ) : (
            <XCircle className="h-5 w-5 shrink-0 text-red-400" />
          )}
          <div>
            <p
              className={cn(
                "text-sm font-semibold uppercase tracking-widest",
                accepted ? "text-emerald-400" : "text-red-400"
              )}
            >
              {accepted ? "Accepted" : "Wrong Answer"}
            </p>
            {submission.verdict && (
              <p className="mt-0.5 text-xs text-dex-muted">{submission.verdict}</p>
            )}
          </div>
          <div className="ml-auto text-right text-xs text-dex-muted">
            <p>{LANGUAGE_LABELS[submission.language as Language] ?? submission.language}</p>
            <p className="mt-0.5">{relativeTime(submission.createdAt)}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            {
              icon: <BarChart2 className="h-3.5 w-3.5" />,
              label: "Pass rate",
              value: summary.passRate,
            },
            {
              icon: <Clock className="h-3.5 w-3.5" />,
              label: "Avg time",
              value: fmtTime(summary.avgExecutionTimeMs),
            },
            {
              icon: <MemoryStick className="h-3.5 w-3.5" />,
              label: "Peak memory",
              value: fmtMemory(summary.peakMemoryBytes),
            },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-col gap-1 rounded-lg border border-dex-border bg-dex-bg/60 px-3 py-2.5"
            >
              <div className="flex items-center gap-1.5 text-dex-muted">
                {s.icon}
                <span className="text-[10px] uppercase tracking-wide">{s.label}</span>
              </div>
              <span className="text-sm font-semibold text-dex-text">{s.value}</span>
            </div>
          ))}
        </div>

        {/* Test case overview */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-dex-muted">
              Test Cases
            </p>
            <div className="flex items-center gap-3 text-[11px] text-dex-muted">
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/70" />
                Passed ({summary.passed})
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-sm bg-red-500/70" />
                Failed ({summary.failed})
              </span>
            </div>
          </div>
          <div className="rounded-lg border border-dex-border bg-dex-bg/40 p-3">
            <div className="mb-3 flex items-center gap-3">
              <PassRateRing passed={summary.passed} total={summary.totalTests} />
              <div className="flex-1">
                <p className="text-lg font-bold text-dex-text">
                  {summary.passed}
                  <span className="text-sm font-normal text-dex-muted">
                    /{summary.totalTests} tests
                  </span>
                </p>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-dex-border">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      summary.passed === summary.totalTests
                        ? "bg-emerald-500"
                        : "bg-dex-accent"
                    )}
                    style={{
                      width: `${summary.totalTests > 0 ? (summary.passed / summary.totalTests) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
            <TestCaseGrid results={testResults} />
          </div>
        </div>

        {/* Execution time chart */}
        {testResults.some((r) => r.executionTimeMs != null) && (
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-dex-muted">
              Execution Time per Test
            </p>
            <div className="rounded-lg border border-dex-border bg-dex-bg/40 p-3">
              <TimeBarChart results={testResults} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Submissions list + detail container */
function SubmissionsPanel({ problemId }: { problemId: string }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["submissions", problemId],
    queryFn: () =>
      api<{ submissions: SubmissionListItem[] }>(
        `/submission?problemId=${problemId}&limit=30`
      ).then((r) => r.data),
    staleTime: 30_000,
  });

  if (selectedId) {
    return (
      <SubmissionDetailView
        submissionId={selectedId}
        onBack={() => setSelectedId(null)}
      />
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-dex-border px-4 py-2.5">
        <span className="text-xs font-semibold text-dex-text-secondary">
          Your Submissions
        </span>
        {data && (
          <span className="text-[11px] text-dex-muted">
            {data.submissions.length} total
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-dex-accent" />
          </div>
        )}

        {isError && (
          <p className="py-12 text-center text-xs text-dex-muted">
            Failed to load submissions.
          </p>
        )}

        {data && data.submissions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <History className="mb-3 h-7 w-7 text-dex-border" />
            <p className="text-sm font-medium text-dex-text">No submissions yet</p>
            <p className="mt-1 text-xs text-dex-muted">
              Submit your solution to see it here.
            </p>
          </div>
        )}

        {data && data.submissions.length > 0 && (
          <div>
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_5rem_5rem_4rem] gap-2 border-b border-dex-border px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-dex-muted">
              <span>Status</span>
              <span className="text-center">Time</span>
              <span className="text-center">Memory</span>
              <span className="text-right">When</span>
            </div>

            {data.submissions.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className="grid w-full grid-cols-[1fr_5rem_5rem_4rem] items-center gap-2 border-b border-dex-border/50 px-4 py-3 text-left transition-colors last:border-0 hover:bg-dex-bg/40"
              >
                {/* Status + language */}
                <div className="flex flex-col gap-1 min-w-0">
                  <StatusPill status={s.status} />
                  <span className="text-[10px] text-dex-muted">
                    {LANGUAGE_LABELS[s.language as Language] ?? s.language}
                  </span>
                </div>

                {/* Time */}
                <span className="text-center font-mono text-xs text-dex-text-secondary">
                  {fmtTime(s.executionTime)}
                </span>

                {/* Memory */}
                <span className="text-center font-mono text-xs text-dex-text-secondary">
                  {fmtMemory(s.memoryUsed)}
                </span>

                {/* Age */}
                <span className="text-right text-[10px] text-dex-muted">
                  {relativeTime(s.createdAt)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Execution result sub-components ─────────────────────────────────────────

function CodeBlock({
  label,
  value,
  error,
}: {
  label: string;
  value: string;
  error?: boolean;
}) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-dex-muted">
        {label}
      </p>
      <pre
        className={cn(
          "overflow-x-auto rounded-md border border-dex-border bg-dex-bg p-2.5 font-mono text-xs leading-relaxed",
          error ? "text-red-400" : "text-dex-text-secondary"
        )}
      >
        {value}
      </pre>
    </div>
  );
}

function TestCaseRow({ result }: { result: ExecutionResult }) {
  const [open, setOpen] = useState(false);
  const hasMeta =
    result.compileOutput || result.stderr || result.stdout !== null;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border transition-colors duration-150",
        result.passed
          ? "border-emerald-500/20 bg-emerald-500/5"
          : "border-red-500/20 bg-red-500/5"
      )}
    >
      <button
        onClick={() => hasMeta && setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left",
          hasMeta && "cursor-pointer"
        )}
      >
        {result.passed ? (
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
        ) : (
          <XCircle className="h-3.5 w-3.5 shrink-0 text-red-400" />
        )}

        <span className="text-xs font-medium text-dex-text">
          Test {result.testCase}
        </span>

        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            statusClasses(result.status, result.passed)
          )}
        >
          {result.status}
        </span>

        {result.time && (
          <span className="ml-auto flex items-center gap-1 text-[11px] text-dex-muted">
            <Clock className="h-2.5 w-2.5" />
            {result.time}s
          </span>
        )}

        {hasMeta && (
          <span
            className={cn(
              "shrink-0 text-dex-muted",
              result.time ? "ml-1.5" : "ml-auto"
            )}
          >
            {open ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </span>
        )}
      </button>

      {open && hasMeta && (
        <div className="space-y-2.5 border-t border-white/5 px-3.5 pb-3.5 pt-3">
          {result.compileOutput && (
            <CodeBlock label="Compile Error" value={result.compileOutput} error />
          )}
          {result.stderr && (
            <CodeBlock label="Runtime Error" value={result.stderr} error />
          )}
          {result.stdout !== null && (
            <CodeBlock label="Output" value={result.stdout || "(empty)"} />
          )}
          <CodeBlock label="Expected" value={result.expected} />
        </div>
      )}
    </div>
  );
}

function HintItem({ hint, index }: { hint: { content: string }; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-lg border border-dex-border">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-dex-bg/40"
      >
        <span className="text-xs font-medium text-dex-text-secondary">
          Hint {index + 1}
        </span>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 text-dex-muted" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-dex-muted" />
        )}
      </button>
      {open && (
        <div className="border-t border-dex-border/60 bg-dex-bg/40 px-4 py-3 text-sm leading-relaxed text-dex-text-secondary">
          {hint.content}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProblemDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const {
    data: problem,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["problem", slug],
    queryFn: () => api<Problem>(`/problem/${slug}`).then((r) => r.data),
    staleTime: 5 * 60_000,
  });

  // ── Code state ──
  const [selectedLang, setSelectedLang] = useState<Language>("PYTHON");
  const [code, setCode] = useState<Record<Language, string>>({
    PYTHON: "",
    JAVA: "",
    JAVASCRIPT: "",
    CPP: "",
  });

  const [initialized, setInitialized] = useState(false);
  if (problem && !initialized) {
    const initial: Record<Language, string> = {
      PYTHON: "",
      JAVA: "",
      JAVASCRIPT: "",
      CPP: "",
    };
    (Object.keys(problem.codeTemplates) as Language[]).forEach((lang) => {
      initial[lang] = problem.codeTemplates[lang]?.userCode ?? "";
    });
    setCode(initial);
    setInitialized(true);
    const firstLang = Object.keys(problem.codeTemplates)[0] as Language;
    if (firstLang) setSelectedLang(firstLang);
  }

  // ── UI state ──
  const [activeLeftTab, setActiveLeftTab] = useState<LeftTab>("description");
  const [runResult, setRunResult] = useState<ExecutionResponse | null>(null);
  const [submitResult, setSubmitResult] = useState<ExecutionResponse | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  const availableLanguages = problem
    ? (Object.keys(problem.codeTemplates) as Language[])
    : (["PYTHON"] as Language[]);

  // ── Mutations ──
  const runMutation = useMutation({
    mutationFn: () =>
      api<ExecutionResponse>("/execute-code/run", {
        method: "POST",
        body: JSON.stringify({
          source_code: code[selectedLang],
          language: selectedLang,
          problemId: problem?.id,
        }),
      }).then((r) => r.data),
    onSuccess: (data) => {
      setRunResult(data);
      setSubmitResult(null);
      setRunError(null);
    },
    onError: (err: ApiError) => {
      setRunError(err.message ?? "Execution failed.");
    },
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      api<SubmissionAnalysis>("/execute-code/submit", {
        method: "POST",
        body: JSON.stringify({
          source_code: code[selectedLang],
          language: selectedLang,
          problemId: problem?.id,
        }),
      }).then((r) => r.data),
    onSuccess: (data) => {
      setSubmitResult(normalizeSubmission(data));
      setRunResult(null);
      setRunError(null);
    },
    onError: (err: ApiError) => {
      setRunError(err.message ?? "Submission failed.");
    },
  });

  const isRunning = runMutation.isPending;
  const isSubmitting = submitMutation.isPending;
  const isSubmitMode = !!submitResult;
  const activeResult = submitResult ?? runResult;

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-dex-accent" />
      </div>
    );
  }

  if (isError || !problem) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-dex-muted">Problem not found.</p>
      </div>
    );
  }

  const diffConf = DIFFICULTY_CONFIG[problem.difficulty];

  // ── Render ──
  return (
    <div className="flex flex-1 flex-col overflow-hidden">

      {/* ── Top header bar ── */}
      <div className="flex shrink-0 items-center gap-3 border-b border-dex-border bg-dex-surface px-4 py-2.5">
        <span className="max-w-[280px] truncate text-sm font-semibold text-dex-text">
          {problem.title}
        </span>

        <span
          className={cn(
            "inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5",
            "text-[11px] font-semibold uppercase tracking-wide",
            diffConf.cls
          )}
        >
          {diffConf.label}
        </span>

        {problem.isSolved && (
          <span className="flex shrink-0 items-center gap-1 text-xs text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Solved
          </span>
        )}

        <div className="ml-auto flex items-center gap-3 text-xs text-dex-muted">
          <span>{Number(problem.stats.acceptanceRate).toFixed(1)}% acceptance</span>
          <span className="text-dex-border">·</span>
          <span>{problem.stats.totalSubmissions.toLocaleString()} submissions</span>
        </div>
      </div>

      {/* ── Main resizable split ── */}
      <PanelGroup orientation="horizontal" className="flex-1 overflow-hidden">

        {/* ─── Left panel: Description ─── */}
        <Panel defaultSize={40} minSize={28}>
          <div className="flex h-full flex-col overflow-hidden bg-dex-surface">

            {/* Tabs */}
            <div className="flex shrink-0 border-b border-dex-border">
              {LEFT_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveLeftTab(tab.id)}
                  className={cn(
                    "relative px-4 py-2.5 text-xs font-medium transition-colors duration-150",
                    activeLeftTab === tab.id
                      ? "text-dex-text after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-dex-accent"
                      : "text-dex-muted hover:text-dex-text-secondary"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-5 text-sm">

              {/* ── Description ── */}
              {activeLeftTab === "description" && (
                <div className="space-y-7">
                  <p className="leading-7 text-dex-text-secondary whitespace-pre-wrap">
                    {problem.description}
                  </p>

                  {problem.examples.length > 0 && (
                    <div className="space-y-3">
                      {problem.examples.map((ex, i) => (
                        <div
                          key={i}
                          className="rounded-lg border border-dex-border bg-dex-bg/60 p-4"
                        >
                          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-dex-muted">
                            Example {i + 1}
                          </p>
                          <div className="space-y-2 font-mono text-xs">
                            <div className="flex gap-4">
                              <span className="w-20 shrink-0 text-dex-muted">Input</span>
                              <code className="text-dex-text-secondary">{ex.input}</code>
                            </div>
                            <div className="flex gap-4">
                              <span className="w-20 shrink-0 text-dex-muted">Output</span>
                              <code className="text-dex-text-secondary">{ex.output}</code>
                            </div>
                          </div>
                          {ex.explanation && (
                            <div className="mt-3 border-t border-dex-border/50 pt-3 text-xs text-dex-muted leading-relaxed">
                              {ex.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {problem.constraints.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-dex-muted">
                        Constraints
                      </h3>
                      <ul className="space-y-2">
                        {problem.constraints.map((c, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-xs">
                            <span className="mt-[3px] shrink-0 text-dex-border">—</span>
                            <code className="font-mono leading-relaxed text-dex-text-secondary">
                              {c.description}
                            </code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {problem.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 border-t border-dex-border/50 pt-5">
                      {problem.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="rounded-full border border-dex-border px-2.5 py-0.5 text-[11px] text-dex-muted"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Hints ── */}
              {activeLeftTab === "hints" && (
                <div className="space-y-2">
                  {problem.hints.length === 0 ? (
                    <p className="text-sm text-dex-muted">No hints available.</p>
                  ) : (
                    problem.hints.map((hint, i) => (
                      <HintItem key={i} hint={hint} index={i} />
                    ))
                  )}
                </div>
              )}

              {/* ── Editorial ── */}
              {activeLeftTab === "editorial" && (
                <div>
                  {problem.editorial ? (
                    <p className="leading-7 whitespace-pre-wrap text-dex-text-secondary">
                      {problem.editorial}
                    </p>
                  ) : (
                    <p className="text-sm text-dex-muted">Editorial not available yet.</p>
                  )}
                </div>
              )}

              {activeLeftTab === "submissions" && (
                <SubmissionsPanel problemId={problem.id} />
              )}
            </div>
          </div>
        </Panel>

        {/* Resize handle */}
        <PanelResizeHandle className="w-[3px] bg-dex-border transition-colors hover:bg-dex-accent/40 data-[resize-handle-active]:bg-dex-accent/60" />

        {/* ─── Right panel ─── */}
        <Panel defaultSize={60} minSize={36}>
          <div className="flex h-full flex-col overflow-hidden">

            {/* ── Code view ── */}
              <PanelGroup orientation="vertical" className="flex-1 overflow-hidden">

                {/* Editor */}
                <Panel defaultSize={65} minSize={30}>
                  <div className="flex h-full flex-col overflow-hidden">

                    {/* Toolbar */}
                    <div className="flex shrink-0 items-center justify-between border-b border-dex-border bg-dex-surface px-3 py-2">
                      <div className="flex gap-0.5">
                        {availableLanguages.map((lang) => (
                          <button
                            key={lang}
                            onClick={() => setSelectedLang(lang)}
                            className={cn(
                              "rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150",
                              selectedLang === lang
                                ? "bg-dex-accent/15 text-dex-accent"
                                : "text-dex-muted hover:bg-dex-border/40 hover:text-dex-text-secondary"
                            )}
                          >
                            {LANGUAGE_LABELS[lang]}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => runMutation.mutate()}
                          disabled={isRunning || isSubmitting}
                          className={cn(
                            "flex h-7 items-center gap-1.5 rounded-md border border-dex-border px-3",
                            "text-xs font-medium text-dex-text transition-all duration-150",
                            "hover:border-dex-text/25 hover:bg-dex-surface-elevated",
                            "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
                          )}
                        >
                          {isRunning ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Play className="h-3 w-3" />
                          )}
                          Run
                        </button>

                        <button
                          onClick={() => submitMutation.mutate()}
                          disabled={isRunning || isSubmitting}
                          className={cn(
                            "flex h-7 items-center gap-1.5 rounded-md bg-dex-accent px-3",
                            "text-xs font-semibold text-white transition-all duration-150",
                            "hover:bg-dex-accent-hover",
                            "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
                          )}
                        >
                          {isSubmitting ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Send className="h-3 w-3" />
                          )}
                          Submit
                        </button>
                      </div>
                    </div>

                    {/* Monaco */}
                    <div className="flex-1 overflow-hidden bg-dex-bg">
                      <Editor
                        language={MONACO_LANGUAGES[selectedLang]}
                        value={code[selectedLang]}
                        onChange={(val) =>
                          setCode((prev) => ({ ...prev, [selectedLang]: val ?? "" }))
                        }
                        theme="vs-dark"
                        options={{
                          fontSize: 13,
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          fontFamily: "'JetBrains Mono', 'Fira Code', 'Geist Mono', monospace",
                          padding: { top: 14, bottom: 14 },
                          lineNumbersMinChars: 3,
                          renderLineHighlight: "gutter",
                          tabSize: selectedLang === "PYTHON" ? 4 : 2,
                          lineHeight: 1.65,
                          cursorBlinking: "smooth",
                          smoothScrolling: true,
                        }}
                      />
                    </div>
                  </div>
                </Panel>

                {/* Resize handle */}
                <PanelResizeHandle className="h-[3px] bg-dex-border transition-colors hover:bg-dex-accent/40 data-[resize-handle-active]:bg-dex-accent/60" />

                {/* Console */}
                <Panel defaultSize={35} minSize={12}>
                  <div className="flex h-full flex-col overflow-hidden bg-dex-surface">

                    <div className="flex shrink-0 items-center gap-2.5 border-b border-dex-border px-4 py-2.5">
                      <span className="text-xs font-semibold text-dex-text-secondary">
                        {isSubmitMode ? "Submission" : "Test Results"}
                      </span>

                      {activeResult && (
                        <span
                          className={cn(
                            "flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                            activeResult.allPassed
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          )}
                        >
                          {activeResult.allPassed ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {activeResult.allPassed
                            ? isSubmitMode
                              ? "Accepted"
                              : "All Passed"
                            : isSubmitMode
                              ? "Wrong Answer"
                              : "Some Failed"}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-3.5">
                      {runError && (
                        <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3.5 py-3 text-xs text-red-400">
                          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span>{runError}</span>
                        </div>
                      )}

                      {!activeResult && !runError && (
                        <p className="pt-8 text-center text-xs text-dex-muted">
                          Run your code to see results.
                        </p>
                      )}

                      {isSubmitMode && activeResult?.allPassed && (
                        <div className="mb-3.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-5 text-center">
                          <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-emerald-400" />
                          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
                            Accepted
                          </p>
                          <p className="mt-1 text-xs text-dex-muted">
                            All test cases passed.
                          </p>
                        </div>
                      )}

                      {isSubmitMode && activeResult && !activeResult.allPassed && (
                        <div className="mb-3.5 flex items-center gap-2.5 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3.5">
                          <XCircle className="h-4 w-4 shrink-0 text-red-400" />
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-red-400">
                              Wrong Answer
                            </p>
                            <p className="mt-0.5 text-xs text-dex-muted">
                              Some test cases failed.
                            </p>
                          </div>
                        </div>
                      )}

                      {activeResult?.detailedResults &&
                        activeResult.detailedResults.length > 0 && (
                          <div className="space-y-2">
                            {activeResult.detailedResults.map((result) => (
                              <TestCaseRow key={result.testCase} result={result} />
                            ))}
                          </div>
                        )}
                    </div>
                  </div>
                </Panel>

              </PanelGroup>

          </div>
        </Panel>

      </PanelGroup>
    </div>
  );
}
