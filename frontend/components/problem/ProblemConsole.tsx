"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, AlertCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExecutionResponse, ExecutionResult } from "./types";
import { statusClasses } from "./utils";

// ─── CodeBlock ────────────────────────────────────────────────────────────────

function CodeBlock({ label, value, error }: { label: string; value: string; error?: boolean }) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold tracking-wider text-dex-muted uppercase">
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

// ─── TestCaseRow ──────────────────────────────────────────────────────────────

function TestCaseRow({ result }: { result: ExecutionResult }) {
  const [open, setOpen] = useState(false);
  const hasMeta = result.compileOutput || result.stderr || result.stdout !== null;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border transition-colors duration-150",
        result.passed ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"
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

        <span className="text-xs font-medium text-dex-text">Test {result.testCase}</span>

        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
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
            {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </span>
        )}
      </button>

      {open && hasMeta && (
        <div className="space-y-2.5 border-t border-white/5 px-3.5 pt-3 pb-3.5">
          {result.compileOutput && (
            <CodeBlock label="Compile Error" value={result.compileOutput} error />
          )}
          {result.stderr && <CodeBlock label="Runtime Error" value={result.stderr} error />}
          {result.stdout !== null && (
            <CodeBlock label="Output" value={result.stdout || "(empty)"} />
          )}
          <CodeBlock label="Expected" value={result.expected} />
        </div>
      )}
    </div>
  );
}

// ─── ProblemConsole ───────────────────────────────────────────────────────────

interface ProblemConsoleProps {
  runResult: ExecutionResponse | null;
  submitResult: ExecutionResponse | null;
  runError: string | null;
  isRunning: boolean;
  isSubmitting: boolean;
}

export function ProblemConsole({ runResult, submitResult, runError }: ProblemConsoleProps) {
  const isSubmitMode = !!submitResult;
  const activeResult = submitResult ?? runResult;

  return (
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

      <div className="flex-1 overflow-y-auto p-3.5 dex-scrollbar">
        {runError && (
          <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3.5 py-3 text-xs text-red-400">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{runError}</span>
          </div>
        )}

        {!activeResult && !runError && (
          <p className="pt-8 text-center text-xs text-dex-muted">Run your code to see results.</p>
        )}

        {isSubmitMode && activeResult?.allPassed && (
          <div className="mb-3.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-5 text-center">
            <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-emerald-400" />
            <p className="text-sm font-semibold tracking-widest text-emerald-400 uppercase">
              Accepted
            </p>
            <p className="mt-1 text-xs text-dex-muted">All test cases passed.</p>
          </div>
        )}

        {isSubmitMode && activeResult && !activeResult.allPassed && (
          <div className="mb-3.5 flex items-center gap-2.5 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3.5">
            <XCircle className="h-4 w-4 shrink-0 text-red-400" />
            <div>
              <p className="text-xs font-semibold tracking-widest text-red-400 uppercase">
                Wrong Answer
              </p>
              <p className="mt-0.5 text-xs text-dex-muted">Some test cases failed.</p>
            </div>
          </div>
        )}

        {activeResult?.detailedResults && activeResult.detailedResults.length > 0 && (
          <div className="space-y-2">
            {activeResult.detailedResults.map((result) => (
              <TestCaseRow key={result.testCase} result={result} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
