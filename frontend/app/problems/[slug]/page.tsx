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

type LeftTab = "description" | "hints" | "editorial";

const LEFT_TABS: { id: LeftTab; label: string }[] = [
  { id: "description", label: "Description" },
  { id: "hints", label: "Hints" },
  { id: "editorial", label: "Editorial" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusClasses(status: string, passed: boolean): string {
  if (passed) return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
  const normalized = status.toUpperCase().replace(/\s+/g, "_");
  if (normalized === "TIME_LIMIT_EXCEEDED") return "text-amber-400 bg-amber-400/10 border-amber-400/20";
  return "text-red-400 bg-red-400/10 border-red-400/20";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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
          <span className={cn("shrink-0 text-dex-muted", result.time ? "ml-1.5" : "ml-auto")}>
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
        <span className="text-xs font-medium text-dex-text-secondary">Hint {index + 1}</span>
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
    const initial: Record<Language, string> = { PYTHON: "", JAVA: "", JAVASCRIPT: "", CPP: "" };
    (Object.keys(problem.codeTemplates) as Language[]).forEach((lang) => {
      initial[lang] = problem.codeTemplates[lang]?.userCode ?? "";
    });
    setCode(initial);
    setInitialized(true);
    const firstLang = Object.keys(problem.codeTemplates)[0] as Language;
    if (firstLang) setSelectedLang(firstLang);
  }

  // ── UI state ──
  const [activeTab, setActiveTab] = useState<LeftTab>("description");
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
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative px-4 py-2.5 text-xs font-medium transition-colors duration-150",
                    activeTab === tab.id
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
              {activeTab === "description" && (
                <div className="space-y-7">
                  <p className="leading-7 text-dex-text-secondary whitespace-pre-wrap">
                    {problem.description}
                  </p>

                  {/* Examples */}
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

                  {/* Constraints */}
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

                  {/* Tags */}
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
              {activeTab === "hints" && (
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
              {activeTab === "editorial" && (
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
            </div>
          </div>
        </Panel>

        {/* Resize handle */}
        <PanelResizeHandle className="w-[3px] bg-dex-border transition-colors hover:bg-dex-accent/40 data-[resize-handle-active]:bg-dex-accent/60" />

        {/* ─── Right panel: Editor + Console ─── */}
        <Panel defaultSize={60} minSize={36}>
          <PanelGroup orientation="vertical" className="h-full">

            {/* ──── Editor ──── */}
            <Panel defaultSize={65} minSize={30}>
              <div className="flex h-full flex-col overflow-hidden">

                {/* Toolbar */}
                <div className="flex shrink-0 items-center justify-between border-b border-dex-border bg-dex-surface px-3 py-2">
                  {/* Language pills */}
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

                  {/* Run / Submit */}
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

                {/* Monaco editor */}
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

            {/* ──── Console ──── */}
            <Panel defaultSize={35} minSize={12}>
              <div className="flex h-full flex-col overflow-hidden bg-dex-surface">

                {/* Console header */}
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

                {/* Console body */}
                <div className="flex-1 overflow-y-auto p-3.5">

                  {/* Error */}
                  {runError && (
                    <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3.5 py-3 text-xs text-red-400">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>{runError}</span>
                    </div>
                  )}

                  {/* Empty state */}
                  {!activeResult && !runError && (
                    <p className="pt-8 text-center text-xs text-dex-muted">
                      Run your code to see results.
                    </p>
                  )}

                  {/* Submit: ACCEPTED banner */}
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

                  {/* Submit: failed banner */}
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

                  {/* Test case list */}
                  {activeResult?.detailedResults && activeResult.detailedResults.length > 0 && (
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
        </Panel>

      </PanelGroup>
    </div>
  );
}
