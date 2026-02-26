"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api, { ApiError } from "@/lib/api";

const schema = z.object({
  email: z.email("Please enter a valid email address"),
});

type ForgotPasswordForm = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({ resolver: zodResolver(schema) });

  async function onSubmit(data: ForgotPasswordForm) {
    setServerError(null);
    try {
      await api("/auth/forgotPassword", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setSuccess(true);
    } catch (err) {
      const apiErr = err as ApiError;
      setServerError(apiErr.message ?? "Something went wrong. Please try again.");
    }
  }

  if (success) {
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-lg font-bold text-dex-text">Check your inbox</h2>
          <p className="text-sm text-dex-muted">
            If an account with that email exists, we&apos;ve sent reset instructions.
          </p>
          <Link href="/login">
            <Button className="mt-6 h-10 w-full rounded-xl bg-dex-accent font-semibold text-white shadow-none hover:bg-dex-accent-hover">
              Back to sign in
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-dex-text">Forgot password?</h1>
        <p className="mt-1 text-sm text-dex-muted">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <div className="rounded-2xl border border-dex-border bg-dex-surface p-6 shadow-xl shadow-black/20">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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

          {serverError && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {serverError}
            </p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 h-10 rounded-xl bg-dex-accent font-semibold text-white shadow-none hover:bg-dex-accent-hover disabled:opacity-60"
          >
            {isSubmitting ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      </div>

      <Link
        href="/login"
        className="mt-6 flex items-center justify-center gap-1.5 text-sm text-dex-muted transition-colors hover:text-dex-text"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to sign in
      </Link>
    </div>
  );
}
