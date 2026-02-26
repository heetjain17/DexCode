"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

/**
 * OAuth callback landing page.
 * The backend sets HttpOnly auth cookies and then redirects to this page.
 * We simply wait for the current-user query to resolve and then push to /problems.
 */
export default function CallbackPage() {
  const router = useRouter();
  const { data, isError } = useCurrentUser();

  useEffect(() => {
    if (data) {
      router.replace("/problems");
    } else if (isError) {
      router.replace("/login");
    }
  }, [data, isError, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-dex-bg text-dex-muted">
      <Loader2 className="h-8 w-8 animate-spin text-dex-accent" />
      <p className="text-sm">Completing sign in…</p>
    </div>
  );
}
