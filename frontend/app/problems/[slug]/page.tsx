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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api, { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

// --- Types ---

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
  detailedResults: ExecutionResult[];
  allPassed: boolean;
}

// --- Constants ---

const DIFFICULTY_COLORS = {
  EASY: "text-green-400 bg-green-400/10 border-green-400/20",
  MEDIUM: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  HARD: "text-red-400 bg-red-400/10 border-red-400/20",
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

type Tab = "description" | "hints" | "editorial";
type ResultTab = "results" | "output";

// --- Components ---

function DifficultyBadge({ difficulty }: { difficulty: Problem["difficulty"] }) {
  const labels = { EASY: "Easy", MEDIUM: "Medium", HARD: "Hard" };
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
        DIFFICULTY_COLORS[difficulty]
      )}
    >
      {labels[difficulty]}
    </span>
  );
}

function HintItem({ hint, index }: { hint: { content: string }; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-dex-border bg-dex-bg">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-dex-text-secondary hover:text-dex-text"
      >
        <span>Hint {index + 1}</span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && (
        <div className="border-t border-dex-border px-4 py-3 text-sm leading-relaxed text-dex-text-secondary">
          {hint.content}
        </div>
      )}
    </div>
  );
}

function ResultRow({ result }: { result: ExecutionResult }) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        result.passed ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        {result.passed ? (
          <CheckCircle2 className="h-4 w-4 text-green-400" />
        ) : (
          <XCircle className="h-4 w-4 text-red-400" />
        )}
        <span className="text-sm font-medium text-dex-text">
          Test Case {result.testCase} — {result.status}
        </span>
        {result.time && <span className="ml-auto text-xs text-dex-muted">{result.time}s</span>}
      </div>
      {result.compileOutput && (
        <pre className="mb-2 overflow-x-auto rounded bg-dex-bg p-2 text-xs text-red-400">
          {result.compileOutput}
        </pre>
      )}
      {result.stderr && (
        <pre className="mb-2 overflow-x-auto rounded bg-dex-bg p-2 text-xs text-red-400">
          {result.stderr}
        </pre>
      )}
      {!result.passed && result.stdout !== null && (
        <div className="space-y-1 text-xs">
          <div className="flex gap-2">
            <span className="min-w-20 text-dex-muted">Output:</span>
            <code className="text-dex-text">{result.stdout || "(empty)"}</code>
          </div>
          <div className="flex gap-2">
            <span className="min-w-20 text-dex-muted">Expected:</span>
            <code className="text-dex-text">{result.expected}</code>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Main Page ---

export default function ProblemDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  // Problem data
  const {
    data: problem,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["problem", slug],
    queryFn: () => api<Problem>(`/problem/${slug}`).then((r) => r.data),
    staleTime: 5 * 60_000,
  });

  // Active language + editor code state
  const [selectedLang, setSelectedLang] = useState<Language>("PYTHON");
  const [code, setCode] = useState<Record<Language, string>>({
    PYTHON: "",
    JAVA: "",
    JAVASCRIPT: "",
    CPP: "",
  });

  // Initialize code from templates when problem loads
  const [initialized, setInitialized] = useState(false);
  if (problem && !initialized) {
    const initial: Record<Language, string> = { PYTHON: "", JAVA: "", JAVASCRIPT: "", CPP: "" };
    (Object.keys(problem.codeTemplates) as Language[]).forEach((lang) => {
      initial[lang] = problem.codeTemplates[lang]?.userCode ?? "";
    });
    setCode(initial);
    setInitialized(true);
    // Pick first available language
    const firstLang = Object.keys(problem.codeTemplates)[0] as Language;
    if (firstLang) setSelectedLang(firstLang);
  }

  // UI state
  const [activeTab, setActiveTab] = useState<Tab>("description");
  const [resultTab, setResultTab] = useState<ResultTab>("results");
  const [runResult, setRunResult] = useState<ExecutionResponse | null>(null);
  const [submitResult, setSubmitResult] = useState<ExecutionResponse | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  const availableLanguages = problem
    ? (Object.keys(problem.codeTemplates) as Language[])
    : (["PYTHON"] as Language[]);

  // Run mutation
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
      setRunError(null);
      setResultTab("results");
    },
    onError: (err: ApiError) => {
      setRunError(err.message ?? "Execution failed.");
    },
  });

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: () =>
      api<ExecutionResponse>("/execute-code/submit", {
        method: "POST",
        body: JSON.stringify({
          source_code: code[selectedLang],
          language: selectedLang,
          problemId: problem?.id,
        }),
      }).then((r) => r.data),
    onSuccess: (data) => {
      setSubmitResult(data);
      setRunError(null);
      setResultTab("results");
    },
    onError: (err: ApiError) => {
      setRunError(err.message ?? "Submission failed.");
    },
  });

  const isRunning = runMutation.isPending;
  const isSubmitting = submitMutation.isPending;
  const activeResult = submitMutation.data ?? runResult;

  // --- Render ---

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-dex-accent" />
      </div>
    );
  }

  if (isError || !problem) {
    return (
      <div className="flex flex-1 items-center justify-center text-dex-muted">
        Problem not found.
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-dex-border px-4 py-2 text-sm">
        <span className="font-semibold text-dex-text">{problem.title}</span>
        <DifficultyBadge difficulty={problem.difficulty} />
        {problem.isSolved && <CheckCircle2 className="h-4 w-4 text-green-400" />}
        <div className="ml-auto flex items-center gap-1.5 text-xs text-dex-muted">
          <span>{Number(problem.stats.acceptanceRate).toFixed(1)}% acceptance</span>
          <span>·</span>
          <span>{problem.stats.totalSubmissions.toLocaleString()} submissions</span>
        </div>
      </div>

      {/* Main split */}
      <PanelGroup orientation="horizontal" className="flex-1 overflow-hidden">
        {/* ─── Left: Description ─── */}
        <Panel defaultSize={40} minSize={28}>
          <div className="flex h-full flex-col overflow-hidden border-r border-dex-border">
            {/* Tabs */}
            <div className="flex border-b border-dex-border">
              {(["description", "hints", "editorial"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-2.5 text-xs font-medium capitalize transition-colors",
                    activeTab === tab
                      ? "border-b-2 border-dex-accent text-dex-text"
                      : "text-dex-muted hover:text-dex-text"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === "description" && (
                <div className="space-y-6">
                  {/* Description */}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-dex-text-secondary">
                    {problem.description}
                  </p>

                  {/* Examples */}
                  {problem.examples.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-dex-text">Examples</h3>
                      {problem.examples.map((ex, i) => (
                        <div key={i} className="rounded-xl border border-dex-border bg-dex-bg p-4">
                          <p className="mb-1 text-xs font-semibold text-dex-text">
                            Example {i + 1}
                          </p>
                          <div className="space-y-1 text-xs">
                            <div>
                              <span className="font-medium text-dex-text">Input:</span>{" "}
                              <code className="text-dex-text-secondary">{ex.input}</code>
                            </div>
                            <div>
                              <span className="font-medium text-dex-text">Output:</span>{" "}
                              <code className="text-dex-text-secondary">{ex.output}</code>
                            </div>
                            {ex.explanation && (
                              <div>
                                <span className="font-medium text-dex-text">Explanation:</span>{" "}
                                <span className="text-dex-muted">{ex.explanation}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Constraints */}
                  {problem.constraints.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-dex-text">Constraints</h3>
                      <ul className="space-y-1">
                        {problem.constraints.map((c, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-xs text-dex-text-secondary"
                          >
                            <span className="mt-0.5 text-dex-muted">•</span>
                            <code>{c.description}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tags */}
                  {problem.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {problem.tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="border-dex-border text-xs text-dex-muted"
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "hints" && (
                <div className="space-y-2">
                  {problem.hints.length === 0 ? (
                    <p className="text-sm text-dex-muted">No hints available.</p>
                  ) : (
                    problem.hints.map((hint, i) => <HintItem key={i} hint={hint} index={i} />)
                  )}
                </div>
              )}

              {activeTab === "editorial" && (
                <div>
                  {problem.editorial ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-dex-text-secondary">
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

        <PanelResizeHandle className="w-1 bg-dex-border transition-colors hover:bg-dex-accent/40" />

        {/* ─── Right: Editor ─── */}
        <Panel defaultSize={60} minSize={36}>
          <PanelGroup orientation="vertical" className="h-full">
            {/* Editor panel */}
            <Panel defaultSize={65} minSize={30}>
              <div className="flex h-full flex-col overflow-hidden">
                {/* Editor toolbar */}
                <div className="flex items-center justify-between border-b border-dex-border px-3 py-2">
                  {/* Language selector */}
                  <div className="flex gap-1">
                    {availableLanguages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setSelectedLang(lang)}
                        className={cn(
                          "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                          selectedLang === lang
                            ? "bg-dex-accent/15 text-dex-accent"
                            : "text-dex-muted hover:text-dex-text"
                        )}
                      >
                        {LANGUAGE_LABELS[lang]}
                      </button>
                    ))}
                  </div>

                  {/* Run / Submit */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runMutation.mutate()}
                      disabled={isRunning || isSubmitting}
                      className="h-7 gap-1.5 border-dex-border bg-transparent text-xs text-dex-text hover:bg-dex-surface"
                    >
                      {isRunning ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                      Run
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => submitMutation.mutate()}
                      disabled={isRunning || isSubmitting}
                      className="h-7 gap-1.5 bg-dex-accent text-xs font-semibold text-white shadow-none hover:bg-dex-accent-hover"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Send className="h-3 w-3" />
                      )}
                      Submit
                    </Button>
                  </div>
                </div>

                {/* Monaco Editor */}
                <div className="flex-1 overflow-hidden">
                  <Editor
                    language={MONACO_LANGUAGES[selectedLang]}
                    value={code[selectedLang]}
                    onChange={(val) => setCode((prev) => ({ ...prev, [selectedLang]: val ?? "" }))}
                    theme="vs-dark"
                    options={{
                      fontSize: 13,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontFamily: "var(--font-geist-mono), 'JetBrains Mono', monospace",
                      padding: { top: 12, bottom: 12 },
                      lineNumbersMinChars: 3,
                      renderLineHighlight: "gutter",
                      tabSize: selectedLang === "PYTHON" ? 4 : 2,
                    }}
                  />
                </div>
              </div>
            </Panel>

            <PanelResizeHandle className="h-1 bg-dex-border transition-colors hover:bg-dex-accent/40" />

            {/* Results panel */}
            <Panel defaultSize={35} minSize={15}>
              <div className="flex h-full flex-col overflow-hidden">
                {/* Result tabs */}
                <div className="flex items-center gap-1 border-b border-dex-border px-3 py-1.5">
                  <span className="mr-1 text-xs font-semibold text-dex-text-secondary">
                    Test Results
                  </span>
                  {activeResult && (
                    <span
                      className={cn(
                        "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                        activeResult.allPassed
                          ? "bg-green-500/10 text-green-400"
                          : "bg-red-500/10 text-red-400"
                      )}
                    >
                      {activeResult.allPassed ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {activeResult.allPassed ? "All Passed" : "Some Failed"}
                    </span>
                  )}
                </div>

                {/* Results body */}
                <div className="flex-1 overflow-y-auto p-3">
                  {runError && (
                    <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{runError}</span>
                    </div>
                  )}

                  {!activeResult && !runError && (
                    <p className="pt-6 text-center text-xs text-dex-muted">
                      Run your code to see results.
                    </p>
                  )}

                  {activeResult && (
                    <div className="space-y-2">
                      {activeResult.detailedResults.map((result) => (
                        <ResultRow key={result.testCase} result={result} />
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
