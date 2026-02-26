"use client";

import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api, { ApiError } from "@/lib/api";

const resendSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

type ResendForm = z.infer<typeof resendSchema>;

type VerifyState = "loading" | "success" | "error" | "no-token";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [state, setState] = useState<VerifyState>(token ? "loading" : "no-token");
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResendForm>({ resolver: zodResolver(resendSchema) });

  useEffect(() => {
    if (!token) return;
    api(`/auth/verify/${token}`)
      .then(() => setState("success"))
      .catch((err: ApiError) => {
        setVerifyError(err.message ?? "Verification failed.");
        setState("error");
      });
  }, [token]);

  async function onResend(data: ResendForm) {
    setResendError(null);
    try {
      await api("/auth/resendEmailVerification", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setResendSuccess(true);
    } catch (err) {
      const apiErr = err as ApiError;
      setResendError(apiErr.message ?? "Something went wrong. Please try again.");
    }
  }

  if (state === "loading") {
    return (
      <div className="flex flex-col items-center gap-4 text-dex-muted">
        <Loader2 className="h-8 w-8 animate-spin text-dex-accent" />
        <p className="text-sm">Verifying your email…</p>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="rounded-2xl border border-dex-border bg-dex-surface p-8 shadow-xl shadow-black/20">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-dex-accent/15">
            <svg
              className="h-6 w-6 text-dex-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-lg font-bold text-dex-text">Email verified!</h2>
          <p className="text-sm text-dex-muted">
            Your account is now active. You&apos;re ready to start solving.
          </p>
          <Link href="/login">
            <Button className="mt-6 h-10 w-full rounded-xl bg-dex-accent font-semibold text-white shadow-none hover:bg-dex-accent-hover">
              Sign in
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // error state or no-token — show resend form
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-dex-text">
          {state === "error" ? "Verification failed" : "Verify your email"}
        </h1>
        <p className="mt-1 text-sm text-dex-muted">
          {state === "error"
            ? (verifyError ?? "The link may be expired or invalid.")
            : "Enter your email to resend the verification link."}
        </p>
      </div>

      <div className="rounded-2xl border border-dex-border bg-dex-surface p-6 shadow-xl shadow-black/20">
        {resendSuccess ? (
          <p className="text-center text-sm text-dex-text-secondary">
            Verification email sent. Please check your inbox.
          </p>
        ) : (
          <form onSubmit={handleSubmit(onResend)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-xs text-dex-text-secondary">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="border-dex-border bg-dex-bg text-dex-text placeholder:text-dex-muted focus-visible:ring-dex-accent/40"
                {...register("email")}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {resendError && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {resendError}
              </p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 h-10 rounded-xl bg-dex-accent font-semibold text-white shadow-none hover:bg-dex-accent-hover disabled:opacity-60"
            >
              {isSubmitting ? "Sending…" : "Resend verification email"}
            </Button>
          </form>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-dex-muted">
        Already verified?{" "}
        <Link href="/login" className="font-medium text-dex-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
