"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import { Loader2 } from "lucide-react";
import api, { ApiError } from "@/lib/api";

import type { Language, LeftTab, Problem, ExecutionResponse, SubmissionAnalysis } from "@/components/problem/types";
import { normalizeSubmission } from "@/components/problem/utils";
import { ProblemBanner } from "@/components/problem/ProblemBanner";
import { ProblemLeftPanel } from "@/components/problem/ProblemLeftPanel";
import { ProblemEditor } from "@/components/problem/ProblemEditor";
import { ProblemConsole } from "@/components/problem/ProblemConsole";

export default function ProblemDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  // ── Problem data ──
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
  const [activeLeftTab, setActiveLeftTab] = useState<LeftTab>("description");
  const [runResult, setRunResult] = useState<ExecutionResponse | null>(null);
  const [submitResult, setSubmitResult] = useState<ExecutionResponse | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [lastSubmissionId, setLastSubmissionId] = useState<string | null>(null);

  // ── Stopwatch ──
  const [elapsed, setElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

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

  const queryClient = useQueryClient();
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
      setLastSubmissionId(data.submission.id);
      setActiveLeftTab("submissions");
      // Invalidate submissions list so the new submission appears
      queryClient.invalidateQueries({ queryKey: ["submissions", problem?.id] });
    },
    onError: (err: ApiError) => {
      setRunError(err.message ?? "Submission failed.");
    },
  });

  const isRunning = runMutation.isPending;
  const isSubmitting = submitMutation.isPending;

  // ── Loading / error states ──
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

  // ── Render ──
  return (
    <div className="flex h-screen flex-col overflow-hidden">

      <ProblemBanner
        elapsed={elapsed}
        timerRunning={timerRunning}
        onToggleTimer={() => setTimerRunning((r) => !r)}
        onResetTimer={() => { setElapsed(0); setTimerRunning(false); }}
      />

      <PanelGroup orientation="horizontal" className="flex-1 overflow-hidden">

        <Panel defaultSize={40} minSize={28}>
          <ProblemLeftPanel
            problem={problem}
            activeTab={activeLeftTab}
            onTabChange={setActiveLeftTab}
            openSubmissionId={lastSubmissionId}
          />
        </Panel>

        <PanelResizeHandle className="w-[3px] bg-dex-border transition-colors hover:bg-dex-accent/40 data-[resize-handle-active]:bg-dex-accent/60" />

        <Panel defaultSize={60} minSize={36}>
          <div className="flex h-full flex-col overflow-hidden">
            <PanelGroup orientation="vertical" className="flex-1 overflow-hidden">

              <Panel defaultSize={65} minSize={30}>
                <ProblemEditor
                  code={code}
                  onCodeChange={setCode}
                  selectedLang={selectedLang}
                  onLangChange={setSelectedLang}
                  availableLanguages={availableLanguages}
                  onRun={() => runMutation.mutate()}
                  onSubmit={() => submitMutation.mutate()}
                  isRunning={isRunning}
                  isSubmitting={isSubmitting}
                />
              </Panel>

              <PanelResizeHandle className="h-[3px] bg-dex-border transition-colors hover:bg-dex-accent/40 data-[resize-handle-active]:bg-dex-accent/60" />

              <Panel defaultSize={35} minSize={12}>
                <ProblemConsole
                  runResult={runResult}
                  submitResult={submitResult}
                  runError={runError}
                  isRunning={isRunning}
                  isSubmitting={isSubmitting}
                />
              </Panel>

            </PanelGroup>
          </div>
        </Panel>

      </PanelGroup>
    </div>
  );
}
