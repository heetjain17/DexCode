"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  return (
    <div className="w-full max-w-sm text-center">
      <div className="rounded-2xl border border-dex-border bg-dex-surface p-8 shadow-xl shadow-black/20">
        {/* Beta badge */}
        <div className="mx-auto mb-4 inline-flex items-center rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-400">
          BETA
        </div>

        <h2 className="mb-2 text-lg font-bold text-dex-text">
          Registration is closed
        </h2>
        <p className="text-sm text-dex-muted">
          DexCode is currently in private beta. New account registration is
          disabled. Please use your pre-assigned credentials to sign in.
        </p>

        <Link href="/login">
          <Button className="mt-6 h-10 w-full rounded-xl bg-dex-accent font-semibold text-white shadow-none hover:bg-dex-accent-hover">
            Go to Sign In
          </Button>
        </Link>
      </div>
    </div>
  );
}
