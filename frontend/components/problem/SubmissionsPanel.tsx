"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  Loader2,
  History,
  MemoryStick,
  BarChart2,
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { SubmissionDetail, SubmissionListItem, Language } from "./types";
import { relativeTime, fmtMemory, fmtTime } from "./utils";
import { LANGUAGE_LABELS } from "./constants";

// ─── StatusPill ───────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  const accepted = status === "ACCEPTED";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
        accepted
          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
          : "border-red-500/25 bg-red-500/10 text-red-400"
      )}
    >
      {accepted ? <CheckCircle2 className="h-2.5 w-2.5" /> : <XCircle className="h-2.5 w-2.5" />}
      {accepted ? "Accepted" : "Wrong Answer"}
    </span>
  );
}

// ─── TestCaseGrid ─────────────────────────────────────────────────────────────

function TestCaseGrid({ results }: { results: SubmissionDetail["testResults"] }) {
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
            colors[r.status] ?? "border-dex-border bg-dex-border"
          )}
        />
      ))}
    </div>
  );
}

// ─── TimeBarChart ─────────────────────────────────────────────────────────────

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

// ─── PassRateRing ─────────────────────────────────────────────────────────────

function PassRateRing({ passed, total }: { passed: number; total: number }) {
  const pct = total > 0 ? passed / total : 0;
  const r = 24;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  return (
    <svg width={64} height={64} className="-rotate-90">
      <circle cx={32} cy={32} r={r} fill="none" strokeWidth={5} className="stroke-dex-border" />
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

// ─── SubmissionDetailView ─────────────────────────────────────────────────────

function SubmissionDetailView({
  submissionId,
  onBack,
}: {
  submissionId: string;
  onBack: () => void;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["submission", submissionId],
    queryFn: () => api<SubmissionDetail>(`/submission/${submissionId}`).then((r) => r.data),
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
        <span className="font-mono text-[11px] text-dex-muted">{submission.id.slice(0, 8)}…</span>
        <div className="ml-auto">
          <StatusPill status={submission.status} />
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4 dex-scrollbar">
        {/* Status banner */}
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg border px-4 py-3.5",
            accepted ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"
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
                "text-sm font-semibold tracking-widest uppercase",
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
                <span className="text-[10px] tracking-wide uppercase">{s.label}</span>
              </div>
              <span className="text-sm font-semibold text-dex-text">{s.value}</span>
            </div>
          ))}
        </div>

        {/* Test case overview */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-semibold tracking-widest text-dex-muted uppercase">
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
                      summary.passed === summary.totalTests ? "bg-emerald-500" : "bg-dex-accent"
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
            <p className="mb-3 text-[11px] font-semibold tracking-widest text-dex-muted uppercase">
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

// ─── SubmissionsPanel ─────────────────────────────────────────────────────────

export function SubmissionsPanel({
  problemId,
  openSubmissionId,
}: {
  problemId: string;
  openSubmissionId?: string | null;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (openSubmissionId) setSelectedId(openSubmissionId);
  }, [openSubmissionId]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["submissions", problemId],
    queryFn: () =>
      api<{ submissions: SubmissionListItem[] }>(
        `/submission?problemId=${problemId}&limit=30`
      ).then((r) => r.data),
    staleTime: 30_000,
  });

  if (selectedId) {
    return <SubmissionDetailView submissionId={selectedId} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-dex-border px-4 py-2.5">
        <span className="text-xs font-semibold text-dex-text-secondary">Your Submissions</span>
        {data && (
          <span className="text-[11px] text-dex-muted">{data.submissions.length} total</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto dex-scrollbar">
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-dex-accent" />
          </div>
        )}

        {isError && (
          <p className="py-12 text-center text-xs text-dex-muted">Failed to load submissions.</p>
        )}

        {data && data.submissions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <History className="mb-3 h-7 w-7 text-dex-border" />
            <p className="text-sm font-medium text-dex-text">No submissions yet</p>
            <p className="mt-1 text-xs text-dex-muted">Submit your solution to see it here.</p>
          </div>
        )}

        {data && data.submissions.length > 0 && (
          <div>
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_5rem_5rem_4rem] gap-2 border-b border-dex-border px-4 py-2 text-[10px] font-semibold tracking-wider text-dex-muted uppercase">
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
                <div className="flex min-w-0 flex-col gap-1">
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
