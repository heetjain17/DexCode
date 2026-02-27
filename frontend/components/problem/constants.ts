import { type LucideIcon, FileText, Lightbulb, BookOpen, History } from "lucide-react";
import { Language, LeftTab } from "./types";

export const DIFFICULTY_CONFIG = {
  EASY: { label: "Easy", cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  MEDIUM: { label: "Medium", cls: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  HARD: { label: "Hard", cls: "text-red-400 bg-red-400/10 border-red-400/20" },
} as const;

export const LANGUAGE_LABELS: Record<Language, string> = {
  PYTHON: "Python",
  JAVA: "Java",
  JAVASCRIPT: "JavaScript",
  CPP: "C++",
};

export const MONACO_LANGUAGES: Record<Language, string> = {
  PYTHON: "python",
  JAVA: "java",
  JAVASCRIPT: "javascript",
  CPP: "cpp",
};

export const LEFT_TABS: { id: LeftTab; label: string; icon: LucideIcon }[] = [
  { id: "description", label: "Description", icon: FileText },
  { id: "hints", label: "Hints", icon: Lightbulb },
  { id: "editorial", label: "Editorial", icon: BookOpen },
  { id: "submissions", label: "Submissions", icon: History },
];
