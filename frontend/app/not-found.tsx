import Link from "next/link";
import { Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-dex-bg px-4 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-dex-border bg-dex-surface">
        <Code2 className="h-8 w-8 text-dex-accent" />
      </div>
      <h1 className="mb-2 text-6xl font-bold text-dex-text">404</h1>
      <p className="mb-1 text-lg font-semibold text-dex-text">Page not found</p>
      <p className="mb-8 max-w-sm text-sm text-dex-muted">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link href="/">
          <Button className="h-10 rounded-xl bg-dex-accent px-6 font-semibold text-white shadow-none hover:bg-dex-accent-hover">
            Go Home
          </Button>
        </Link>
        <Link href="/problems">
          <Button
            variant="outline"
            className="h-10 rounded-xl border-dex-border bg-transparent px-6 text-dex-text hover:border-dex-text/30 hover:bg-dex-surface"
          >
            Browse Problems
          </Button>
        </Link>
      </div>
    </div>
  );
}
