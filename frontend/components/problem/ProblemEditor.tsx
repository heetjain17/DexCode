"use client";

import Editor from "@monaco-editor/react";
import { Play, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Language } from "./types";
import { LANGUAGE_LABELS, MONACO_LANGUAGES } from "./constants";

interface ProblemEditorProps {
  code: Record<Language, string>;
  onCodeChange: (code: Record<Language, string>) => void;
  selectedLang: Language;
  onLangChange: (lang: Language) => void;
  availableLanguages: Language[];
  onRun: () => void;
  onSubmit: () => void;
  isRunning: boolean;
  isSubmitting: boolean;
}

export function ProblemEditor({
  code,
  onCodeChange,
  selectedLang,
  onLangChange,
  availableLanguages,
  onRun,
  onSubmit,
  isRunning,
  isSubmitting,
}: ProblemEditorProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center justify-between border-b border-dex-border bg-dex-surface px-3 py-2">
        <div className="flex gap-0.5">
          {availableLanguages.map((lang) => (
            <button
              key={lang}
              onClick={() => onLangChange(lang)}
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
            onClick={onRun}
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
            onClick={onSubmit}
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
          onChange={(val) => onCodeChange({ ...code, [selectedLang]: val ?? "" })}
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
  );
}
