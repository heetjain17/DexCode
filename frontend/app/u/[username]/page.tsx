"use client";

import { useParams } from "next/navigation";
import { Loader2, MapPin, Globe, Github, Twitter, Linkedin, Calendar, Code2, Flame, Trophy, BarChart2 } from "lucide-react";
import Navbar from "@/components/landing/navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-dex-border bg-dex-surface p-4 text-center">
      <p className="text-2xl font-bold text-dex-text">{value}</p>
      <p className="text-xs text-dex-muted">{label}</p>
      {sub && <p className="text-[11px] text-dex-muted/70">{sub}</p>}
    </div>
  );
}

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { data: currentUser, isLoading } = useCurrentUser();

  const isOwnProfile = currentUser?.username === username;
  const user = isOwnProfile ? currentUser : null;

  const initials =
    user?.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "?";

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  const acceptanceRate =
    user && user.totalSubmissions > 0
      ? ((user.acceptedSubmissions / user.totalSubmissions) * 100).toFixed(1)
      : null;

  return (
    <main className="min-h-screen bg-dex-bg text-dex-text">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        {isLoading && (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-7 w-7 animate-spin text-dex-accent" />
          </div>
        )}

        {/* Not own profile or unauthenticated */}
        {!isLoading && !isOwnProfile && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-dex-border bg-dex-surface">
              <Code2 className="h-7 w-7 text-dex-muted" />
            </div>
            {!currentUser ? (
              <>
                <h2 className="text-lg font-semibold text-dex-text">Sign in to view profiles</h2>
                <p className="mt-1 text-sm text-dex-muted">
                  Public profiles are coming soon. Sign in to view your own profile.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-dex-text">Public profiles coming soon</h2>
                <p className="mt-1 text-sm text-dex-muted">
                  Viewing other users&apos; profiles is not yet available.
                </p>
              </>
            )}
          </div>
        )}

        {user && (
          <div className="space-y-5">
            {/* Profile card */}
            <div className="rounded-2xl border border-dex-border bg-dex-surface p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                {/* Avatar */}
                <Avatar className="h-20 w-20 shrink-0 text-xl">
                  {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                  <AvatarFallback className="bg-dex-accent text-lg font-bold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-bold text-dex-text">{user.name}</h1>
                  <p className="mt-0.5 text-sm text-dex-muted">@{user.username}</p>

                  {user.bio && (
                    <p className="mt-3 text-sm leading-relaxed text-dex-text-secondary">
                      {user.bio}
                    </p>
                  )}

                  {/* Meta row */}
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                    {user.location && (
                      <span className="flex items-center gap-1.5 text-xs text-dex-muted">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {user.location}
                      </span>
                    )}
                    {user.website && (
                      <a
                        href={
                          user.website.startsWith("http") ? user.website : `https://${user.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-dex-accent transition-opacity hover:opacity-80"
                      >
                        <Globe className="h-3.5 w-3.5 shrink-0" />
                        {user.website.replace(/^https?:\/\//, "")}
                      </a>
                    )}
                    {memberSince && (
                      <span className="flex items-center gap-1.5 text-xs text-dex-muted">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        Member since {memberSince}
                      </span>
                    )}
                  </div>

                  {/* Social links */}
                  {(user.socialLinks?.github ||
                    user.socialLinks?.twitter ||
                    user.socialLinks?.linkedin) && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {user.socialLinks.github && (
                        <a
                          href={user.socialLinks.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-full border border-dex-border px-3 py-1.5 text-xs text-dex-text-secondary transition-colors hover:border-dex-text/30 hover:text-dex-text"
                        >
                          <Github className="h-3.5 w-3.5" />
                          GitHub
                        </a>
                      )}
                      {user.socialLinks.twitter && (
                        <a
                          href={user.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-full border border-dex-border px-3 py-1.5 text-xs text-dex-text-secondary transition-colors hover:border-dex-text/30 hover:text-dex-text"
                        >
                          <Twitter className="h-3.5 w-3.5" />
                          Twitter
                        </a>
                      )}
                      {user.socialLinks.linkedin && (
                        <a
                          href={user.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-full border border-dex-border px-3 py-1.5 text-xs text-dex-text-secondary transition-colors hover:border-dex-text/30 hover:text-dex-text"
                        >
                          <Linkedin className="h-3.5 w-3.5" />
                          LinkedIn
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Problems Solved" value={user.problemsSolved} />
              <StatCard label="Submissions" value={user.totalSubmissions} sub={acceptanceRate ? `${acceptanceRate}% accepted` : undefined} />
              <StatCard label="Current Streak" value={user.currentStreak} sub="days" />
              <StatCard label="Longest Streak" value={user.longestStreak} sub="days" />
            </div>

            {/* Difficulty breakdown */}
            <div className="rounded-2xl border border-dex-border bg-dex-surface p-5">
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold tracking-wider text-dex-muted uppercase">
                <BarChart2 className="h-3.5 w-3.5" />
                Difficulty Breakdown
              </div>
              <div className="space-y-3">
                {[
                  { label: "Easy", count: user.easySolved, color: "bg-emerald-500" },
                  { label: "Medium", count: user.mediumSolved, color: "bg-amber-500" },
                  { label: "Hard", count: user.hardSolved, color: "bg-red-500" },
                ].map(({ label, count, color }) => {
                  const total = user.problemsSolved || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={label} className="flex items-center gap-3">
                      <span className="w-14 shrink-0 text-xs text-dex-text-secondary">{label}</span>
                      <div className="flex-1 overflow-hidden rounded-full bg-dex-bg" style={{ height: 6 }}>
                        <div
                          className={cn("h-full rounded-full transition-all", color)}
                          style={{ width: `${Math.max(pct, count > 0 ? 2 : 0)}%` }}
                        />
                      </div>
                      <span className="w-6 shrink-0 text-right text-xs font-semibold text-dex-text">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Streak badge */}
            {user.currentStreak > 0 && (
              <div className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-5 py-4">
                <Flame className="h-5 w-5 shrink-0 text-amber-400" />
                <div>
                  <p className="text-sm font-semibold text-dex-text">
                    {user.currentStreak}-day streak
                  </p>
                  <p className="text-xs text-dex-muted">Keep coding every day!</p>
                </div>
                {user.longestStreak > 0 && (
                  <div className="ml-auto text-right">
                    <p className="text-xs text-dex-muted">Best</p>
                    <p className="text-sm font-semibold text-dex-text">{user.longestStreak} days</p>
                  </div>
                )}
              </div>
            )}

            {/* Trophy row for milestones */}
            {user.problemsSolved >= 10 && (
              <div className="flex items-center gap-3 rounded-2xl border border-dex-accent/20 bg-dex-accent/5 px-5 py-4">
                <Trophy className="h-5 w-5 shrink-0 text-dex-accent" />
                <p className="text-sm font-medium text-dex-text">
                  {user.problemsSolved >= 100
                    ? "Century Club — 100+ problems solved!"
                    : user.problemsSolved >= 50
                      ? "Half-century — 50+ problems solved!"
                      : "10+ problems solved. Keep it up!"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
