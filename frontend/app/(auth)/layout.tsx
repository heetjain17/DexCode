import Link from "next/link";
import { Code2 } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-dex-bg">
      {/* Minimal header — just logo */}
      <header className="flex h-16 items-center px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-dex-text transition-opacity hover:opacity-80"
        >
          <Code2 className="h-5 w-5 text-dex-accent" />
          <span className="text-sm font-bold tracking-tight">DexCode</span>
        </Link>
      </header>

      {/* Centered content */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">{children}</main>
    </div>
  );
}
