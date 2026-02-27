"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { Code2, Sun, Moon, Menu, X, LogOut, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import api from "@/lib/api";

const NAV_LINKS = [
  { label: "Problems", href: "/problems" },
  { label: "Explore", href: "/explore" },
  { label: "Discuss", href: "/discuss" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const { data: user, isLoading: authLoading } = useCurrentUser();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await api("/auth/logout", { method: "POST" });
    queryClient.removeQueries({ queryKey: ["currentUser"] });
    window.location.href = "/";
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "?";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* ─── Floating dock ─── */}
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="fixed top-4 left-1/2 z-50 -translate-x-1/2"
      >
        <div className="flex items-center justify-between rounded-full border border-dex-border bg-dex-bg/70 px-5 py-2 shadow-lg shadow-black/5 backdrop-blur-xl md:min-w-[680px]">
          {/* Left: Logo */}
          <Link
            href="/"
            className="group flex items-center gap-1.5 rounded-full px-3.5 py-2 transition-colors hover:bg-dex-surface/60"
          >
            <Code2 className="h-4 w-4 text-dex-accent transition-transform duration-200 group-hover:scale-110" />
            <span className="text-sm font-bold tracking-tight text-dex-text">DexCode</span>
          </Link>

          {/* Center: Desktop nav links */}
          <div className="hidden items-center gap-0.5 md:flex">
            {NAV_LINKS.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-dex-surface text-dex-text"
                      : "text-dex-muted hover:bg-dex-surface/50 hover:text-dex-text-secondary"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right: actions (desktop) */}
          <div className="hidden items-center gap-2 md:flex">
            {/* Theme toggle */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              whileHover={{ rotate: 15 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full p-2.5 text-dex-muted transition-colors hover:bg-dex-surface/50 hover:text-dex-text focus:outline-none focus-visible:ring-2 focus-visible:ring-dex-accent"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                {mounted && (
                  <motion.span
                    key={theme}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex"
                  >
                    {theme === "dark" ? (
                      <Sun className="h-3.5 w-3.5" />
                    ) : (
                      <Moon className="h-3.5 w-3.5" />
                    )}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Auth */}
            {authLoading ? (
              <div className="h-7 w-7 animate-pulse rounded-full bg-dex-border/50" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-dex-accent focus-visible:ring-offset-2 focus-visible:ring-offset-transparent">
                    <Avatar className="h-7 w-7 cursor-pointer transition-opacity hover:opacity-80">
                      {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                      <AvatarFallback className="bg-dex-accent text-[10px] font-semibold text-white">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={12}
                  className="w-56 border-dex-border bg-dex-surface"
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-dex-text">{user.name}</p>
                      <p className="text-xs text-dex-muted">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-dex-border" />
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer text-dex-text-secondary focus:bg-dex-border/40 focus:text-dex-text"
                  >
                    <Link href={`/u/${user.username}`}>
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
                className="rounded-full px-3.5 py-2 text-sm font-medium text-dex-muted transition-colors hover:bg-dex-surface/50 hover:text-dex-text"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile: theme + hamburger */}
          <div className="ml-10 flex items-center gap-2 md:hidden">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full p-2.5 text-dex-muted transition-colors hover:bg-dex-surface/50 hover:text-dex-text"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-3.5 w-3.5" />
                ) : (
                  <Moon className="h-3.5 w-3.5" />
                )}
              </button>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-full p-2.5 text-dex-muted transition-colors hover:bg-dex-surface/50 hover:text-dex-text"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ─── Mobile full-screen overlay ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-dex-bg/95 backdrop-blur-lg md:hidden"
          >
            <nav className="flex flex-col items-center gap-2">
              {NAV_LINKS.map((link, i) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ delay: i * 0.05, duration: 0.25 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "block rounded-xl px-6 py-3 text-lg font-medium transition-colors",
                        isActive
                          ? "bg-dex-surface text-dex-text"
                          : "text-dex-text-secondary hover:text-dex-text"
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Auth section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.15, duration: 0.25 }}
              className="mt-8 flex flex-col items-center gap-3"
            >
              {authLoading ? (
                <div className="h-10 w-10 animate-pulse rounded-full bg-dex-border" />
              ) : user ? (
                <>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                      <AvatarFallback className="bg-dex-accent text-sm font-semibold text-white">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-dex-text">{user.name}</span>
                      <span className="text-xs text-dex-muted">{user.email}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/u/${user.username}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-1.5 rounded-full bg-dex-surface px-4 py-2 text-sm text-dex-text-secondary transition-colors hover:text-dex-text"
                    >
                      <User className="h-3.5 w-3.5" />
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-1.5 rounded-full bg-dex-surface px-4 py-2 text-sm text-dex-text-secondary transition-colors hover:text-dex-text"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      Settings
                    </Link>
                  </div>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-red-500 transition-colors hover:bg-red-500/10"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Log out
                  </button>
                </>
              ) : (
                <div className="flex gap-3">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-full bg-dex-surface px-5 py-2.5 text-sm font-medium text-dex-text-secondary transition-colors hover:text-dex-text"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-full bg-dex-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-dex-accent-hover"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
