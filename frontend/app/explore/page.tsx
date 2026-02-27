"use client";

import { Compass } from "lucide-react";
import Navbar from "@/components/landing/navbar";

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-dex-bg text-dex-text">
      <Navbar />

      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-dex-border bg-dex-surface">
          <Compass className="h-7 w-7 text-dex-accent" />
        </div>
        <h1 className="text-2xl font-bold text-dex-text">Explore</h1>
        <p className="mt-2 max-w-sm text-sm text-dex-muted">
          Curated problem sets, learning paths, and challenges are on the way. Check back soon.
        </p>
        <span className="mt-6 inline-flex items-center rounded-full border border-dex-border bg-dex-surface px-4 py-1.5 text-xs font-medium text-dex-muted">
          Coming Soon
        </span>
      </div>
    </main>
  );
}
