"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Inbox,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import Navbar from "@/components/landing/navbar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface Problem {
  id: string;
  slug: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  acceptanceRate: number;
  totalSubmissions: number;
  tags: Tag[];
  isSolved: boolean;
}

interface ProblemsData {
  problems: Problem[];
  pagination: { page: number; limit: number; total: number };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DIFFICULTY_CONFIG = {
  EASY: {
    label: "Easy",
    badge: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    active: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  },
  MEDIUM: {
    label: "Medium",
    badge: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    active: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  },
  HARD: {
    label: "Hard",
    badge: "text-red-400 bg-red-400/10 border-red-400/20",
    active: "text-red-400 bg-red-400/10 border-red-400/30",
  },
} as const;

type Difficulty = "EASY" | "MEDIUM" | "HARD";
const DIFFICULTIES: Difficulty[] = ["EASY", "MEDIUM", "HARD"];
const LIMIT = 12;

// ─── Skeleton Card ────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-dex-border bg-dex-surface p-5">
      <div className="mb-4 flex items-start justify-between">
        <div className="h-5 w-14 rounded-full bg-dex-border" />
        <div className="h-4 w-4 rounded-full bg-dex-border" />
      </div>
      <div className="mb-2 h-4 w-4/5 rounded bg-dex-border" />
      <div className="mb-5 h-4 w-3/5 rounded bg-dex-border" />
      <div className="flex gap-1.5">
        <div className="h-5 w-16 rounded-full bg-dex-border" />
        <div className="h-5 w-12 rounded-full bg-dex-border" />
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-dex-border/60 pt-4">
        <div className="h-3 w-24 rounded bg-dex-border" />
        <div className="h-3 w-3 rounded bg-dex-border" />
      </div>
    </div>
  );
}

// ─── Problem Card ─────────────────────────────────────────────────────────────

function ProblemCard({ problem }: { problem: Problem }) {
  const config = DIFFICULTY_CONFIG[problem.difficulty];

  return (
    <Link
      href={`/problems/${problem.slug}`}
      className={cn(
        "group flex flex-col rounded-xl border border-dex-border bg-dex-surface p-5",
        "transition-all duration-150 ease-out",
        "hover:-translate-y-0.5 hover:border-dex-accent/25 hover:bg-dex-surface-elevated",
        "hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
      )}
    >
      {/* Top row: difficulty badge + solved indicator */}
      <div className="mb-3.5 flex items-start justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5",
            "text-[11px] font-semibold uppercase tracking-wide",
            config.badge
          )}
        >
          {config.label}
        </span>
        {problem.isSolved ? (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
        ) : (
          <Circle className="mt-0.5 h-4 w-4 shrink-0 text-dex-border" />
        )}
      </div>

      {/* Title */}
      <h3 className="mb-3.5 line-clamp-2 text-sm font-semibold leading-snug text-dex-text transition-colors duration-150 group-hover:text-dex-accent">
        {problem.title}
      </h3>

      {/* Tag pills */}
      {problem.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {problem.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="rounded-full border border-dex-border px-2 py-0.5 text-[11px] text-dex-muted"
            >
              {tag.name}
            </span>
          ))}
          {problem.tags.length > 3 && (
            <span className="rounded-full border border-dex-border px-2 py-0.5 text-[11px] text-dex-muted">
              +{problem.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between border-t border-dex-border/60 pt-4">
        <span className="text-xs text-dex-muted">
          {Number(problem.acceptanceRate).toFixed(1)}% acceptance
        </span>
        <ChevronRight className="h-3.5 w-3.5 text-dex-muted opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
      </div>
    </Link>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-dex-border bg-dex-surface">
        <Inbox className="h-5 w-5 text-dex-muted" />
      </div>
      <h3 className="mb-1.5 text-sm font-semibold text-dex-text">No problems found</h3>
      <p className="mb-5 text-xs text-dex-muted">
        {hasFilters ? "Try adjusting your filters." : "No problems are available yet."}
      </p>
      {hasFilters && (
        <button
          onClick={onClear}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-dex-border px-3.5 text-xs font-medium text-dex-muted transition-colors hover:border-dex-accent/30 hover:text-dex-text"
        >
          <X className="h-3.5 w-3.5" />
          Clear filters
        </button>
      )}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  // Build visible page list with ellipsis
  const visible: (number | "…")[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) visible.push(i);
  } else {
    const show = new Set(
      [1, 2, page - 1, page, page + 1, totalPages - 1, totalPages].filter(
        (p) => p >= 1 && p <= totalPages
      )
    );
    const sorted = Array.from(show).sort((a, b) => a - b);
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i] - sorted[i - 1] > 1) visible.push("…");
      visible.push(sorted[i]);
    }
  }

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-dex-border text-dex-muted transition-colors hover:border-dex-text/20 hover:text-dex-text disabled:pointer-events-none disabled:opacity-30"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>

      {visible.map((v, i) =>
        v === "…" ? (
          <span
            key={`ellipsis-${i}`}
            className="flex h-8 w-8 items-center justify-center text-xs text-dex-muted"
          >
            …
          </span>
        ) : (
          <button
            key={v}
            onClick={() => onPage(v as number)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-medium transition-colors",
              v === page
                ? "border-dex-accent bg-dex-accent text-white"
                : "border-dex-border text-dex-muted hover:border-dex-text/20 hover:text-dex-text"
            )}
          >
            {v}
          </button>
        )
      )}

      <button
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-dex-border text-dex-muted transition-colors hover:border-dex-text/20 hover:text-dex-text disabled:pointer-events-none disabled:opacity-30"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Page Content ─────────────────────────────────────────────────────────────

function ProblemsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const difficulty = (searchParams.get("difficulty") as Difficulty | null) ?? undefined;
  const tag = searchParams.get("tag") ?? undefined;
  const sort = searchParams.get("sort") ?? "newest";
  const page = Number(searchParams.get("page") ?? "1");

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["problems", { search: debouncedSearch, difficulty, tag, sort, page }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (difficulty) params.set("difficulty", difficulty);
      if (tag) params.set("tag", tag);
      if (sort) params.set("sort", sort);
      params.set("page", String(page));
      params.set("limit", String(LIMIT));
      return api<ProblemsData>(`/problem?${params.toString()}`).then((r) => r.data);
    },
    staleTime: 30_000,
  });

  function setParam(key: string, value: string | null) {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    if (key !== "page") p.delete("page");
    router.push(`/problems?${p.toString()}`);
  }

  const totalPages = data ? Math.ceil(data.pagination.total / data.pagination.limit) : 1;
  const hasActiveFilters = !!(search || difficulty || tag);

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-[88px] md:px-8 lg:px-12">
      {/* ── Header ── */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-dex-text">Problems</h1>
          <p className="mt-1.5 text-sm text-dex-muted">
            Solve curated coding challenges and track your progress.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-dex-muted" />
          <Input
            value={search}
            onChange={(e) => setParam("search", e.target.value || null)}
            placeholder="Search problems..."
            className="h-9 border-dex-border bg-dex-surface pl-9 text-sm text-dex-text placeholder:text-dex-muted focus-visible:ring-1 focus-visible:ring-dex-accent/40 focus-visible:border-dex-accent/50"
          />
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
        {/* Difficulty */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setParam("difficulty", null)}
            className={cn(
              "h-8 rounded-lg px-3.5 text-xs font-medium transition-all duration-150",
              !difficulty
                ? "bg-dex-accent text-white"
                : "border border-dex-border text-dex-muted hover:border-dex-text/20 hover:text-dex-text"
            )}
          >
            All
          </button>
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setParam("difficulty", difficulty === d ? null : d)}
              className={cn(
                "h-8 rounded-lg border px-3.5 text-xs font-medium transition-all duration-150",
                difficulty === d
                  ? DIFFICULTY_CONFIG[d].active
                  : "border-dex-border text-dex-muted hover:border-dex-text/20 hover:text-dex-text"
              )}
            >
              {DIFFICULTY_CONFIG[d].label}
            </button>
          ))}
        </div>

        {/* Right side: count + sort */}
        <div className="flex items-center gap-3">
          {data && (
            <span className="text-xs text-dex-muted">
              {data.pagination.total.toLocaleString()} problems
            </span>
          )}

          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setParam("sort", e.target.value)}
              className="h-8 cursor-pointer appearance-none rounded-lg border border-dex-border bg-dex-surface pl-3 pr-7 text-xs text-dex-text transition-colors hover:border-dex-text/20 focus:border-dex-accent/50 focus:outline-none"
            >
              <option value="newest">Newest</option>
              <option value="difficulty">Difficulty</option>
              <option value="most-solved">Most Solved</option>
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-3 w-3 -translate-y-1/2 text-dex-muted" />
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      {isError ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-sm text-red-400">Failed to load problems. Please try again.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading ? (
            Array.from({ length: LIMIT }).map((_, i) => <CardSkeleton key={i} />)
          ) : !data || data.problems.length === 0 ? (
            <EmptyState hasFilters={hasActiveFilters} onClear={() => router.push("/problems")} />
          ) : (
            data.problems.map((problem) => <ProblemCard key={problem.id} problem={problem} />)
          )}
        </div>
      )}

      {/* ── Pagination ── */}
      {data && totalPages > 1 && (
        <div className="mt-10">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPage={(p) => setParam("page", String(p))}
          />
        </div>
      )}
    </div>
    </>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function ProblemsPage() {
  return (
    <Suspense>
      <ProblemsPageContent />
    </Suspense>
  );
}
