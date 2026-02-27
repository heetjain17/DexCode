"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  Play,
  Pause,
  RotateCcw,
  Code2,
  Timer,
  LogOut,
  User,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from "@/lib/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { fmtTimer } from "./utils";

interface ProblemBannerProps {
  elapsed: number;
  timerRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
}

export function ProblemBanner({
  elapsed,
  timerRunning,
  onToggleTimer,
  onResetTimer,
}: ProblemBannerProps) {
  const { data: currentUser } = useCurrentUser();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await api("/auth/logout", { method: "POST" });
    queryClient.removeQueries({ queryKey: ["currentUser"] });
    window.location.href = "/";
  };

  const bannerInitials =
    currentUser?.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "?";

  return (
    <div className="flex shrink-0 items-center justify-between border-b border-dex-border bg-dex-surface px-4 py-2">
      {/* Left: logo */}
      <div className="flex items-center gap-3">
        <Link
          href="/problems"
          className="group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-dex-border/30"
        >
          <Code2 className="h-4 w-4 text-dex-accent transition-transform duration-150 group-hover:scale-110" />
          <span className="text-sm font-bold tracking-tight text-dex-text">DexCode</span>
        </Link>
      </div>

      {/* Center: controllable stopwatch */}
      <div className="flex items-center gap-1 rounded-lg border border-dex-border bg-dex-bg/60 px-2 py-1">
        <button
          onClick={onToggleTimer}
          title={timerRunning ? "Pause" : "Resume"}
          className="flex h-6 w-6 items-center justify-center rounded text-dex-muted transition-colors hover:bg-dex-border/40 hover:text-dex-text"
        >
          {timerRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </button>

        <span className="min-w-[4.5rem] text-center font-mono text-sm font-medium text-dex-text-secondary">
          <Timer className="mr-1 inline h-3 w-3 text-dex-muted" />
          {fmtTimer(elapsed)}
        </span>

        <button
          onClick={onResetTimer}
          title="Reset"
          className="flex h-6 w-6 items-center justify-center rounded text-dex-muted transition-colors hover:bg-dex-border/40 hover:text-dex-text"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
      </div>

      {/* Right: profile */}
      <div className="flex items-center">
        {currentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-dex-accent focus-visible:ring-offset-2 focus-visible:ring-offset-dex-surface">
                <Avatar className="h-7 w-7 cursor-pointer transition-opacity hover:opacity-80">
                  {currentUser.avatarUrl && (
                    <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                  )}
                  <AvatarFallback className="bg-dex-accent text-[10px] font-semibold text-white">
                    {bannerInitials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="w-56 border-dex-border bg-dex-surface"
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-dex-text">{currentUser.name}</p>
                  <p className="text-xs text-dex-muted">{currentUser.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-dex-border" />
              <DropdownMenuItem
                asChild
                className="cursor-pointer text-dex-text-secondary focus:bg-dex-border/40 focus:text-dex-text"
              >
                <Link href={`/u/${currentUser.username}`}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="cursor-pointer text-dex-text-secondary focus:bg-dex-border/40 focus:text-dex-text"
              >
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-dex-border" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-500 focus:bg-red-500/10 focus:text-red-500"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link
            href="/login"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-dex-muted transition-colors hover:bg-dex-border/30 hover:text-dex-text"
          >
            Login
          </Link>
        )}
      </div>
    </div>
  );
}
