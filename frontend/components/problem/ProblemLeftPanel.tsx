"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Problem, LeftTab } from "./types";
import { LEFT_TABS, DIFFICULTY_CONFIG } from "./constants";
import { SubmissionsPanel } from "./SubmissionsPanel";

// ─── HintItem ─────────────────────────────────────────────────────────────────

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

// ─── ProblemLeftPanel ─────────────────────────────────────────────────────────

interface ProblemLeftPanelProps {
  problem: Problem;
  activeTab: LeftTab;
  onTabChange: (tab: LeftTab) => void;
}

export function ProblemLeftPanel({ problem, activeTab, onTabChange }: ProblemLeftPanelProps) {
  const diffConf = DIFFICULTY_CONFIG[problem.difficulty];

  return (
    <div className="flex h-full flex-col overflow-hidden bg-dex-surface">
      {/* Tabs */}
      <div className="@container flex shrink-0 border-b border-dex-border">
        {LEFT_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            title={tab.label}
            className={cn(
              "relative flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors duration-150",
              activeTab === tab.id
                ? "text-dex-text after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-dex-accent"
                : "text-dex-muted hover:text-dex-text-secondary"
            )}
          >
            <tab.icon className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden truncate @[320px]:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Submissions tab fills the panel (no extra padding) */}
      {activeTab === "submissions" && (
        <div className="flex-1 overflow-hidden">
          <SubmissionsPanel problemId={problem.id} />
        </div>
      )}

      {/* Scrollable content for other tabs */}
      {activeTab !== "submissions" && (
        <div className="flex-1 overflow-y-auto px-5 py-5 text-sm dex-scrollbar">
          {/* ── Description ── */}
          {activeTab === "description" && (
            <div className="space-y-7">
              {/* Problem header */}
              <div className="space-y-3 border-b border-dex-border/50 pb-5">
                <h1 className="text-lg leading-snug font-bold text-dex-text">{problem.title}</h1>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
                      diffConf.cls
                    )}
                  >
                    {diffConf.label}
                  </span>
                  {problem.isSolved && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      Solved
                    </span>
                  )}
                  <span className="text-xs text-dex-muted">
                    {Number(problem.stats.acceptanceRate).toFixed(1)}% acceptance
                  </span>
                  <span className="text-dex-border">·</span>
                  <span className="text-xs text-dex-muted">
                    {problem.stats.totalSubmissions.toLocaleString()} submissions
                  </span>
                </div>
              </div>

              <p className="leading-7 whitespace-pre-wrap text-dex-text-secondary">
                {problem.description}
              </p>

              {problem.examples.length > 0 && (
                <div className="space-y-3">
                  {problem.examples.map((ex, i) => (
                    <div key={i} className="rounded-lg border border-dex-border bg-dex-bg/60 p-4">
                      <p className="mb-3 text-[11px] font-semibold tracking-widest text-dex-muted uppercase">
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
                        <div className="mt-3 border-t border-dex-border/50 pt-3 text-xs leading-relaxed text-dex-muted">
                          {ex.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {problem.constraints.length > 0 && (
                <div>
                  <h3 className="mb-3 text-[11px] font-semibold tracking-widest text-dex-muted uppercase">
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
          {activeTab === "hints" && (
            <div className="space-y-2">
              {problem.hints.length === 0 ? (
                <p className="text-sm text-dex-muted">No hints available.</p>
              ) : (
                problem.hints.map((hint, i) => <HintItem key={i} hint={hint} index={i} />)
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
      )}
    </div>
  );
}
