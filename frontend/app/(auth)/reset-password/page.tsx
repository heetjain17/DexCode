"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api, { ApiError } from "@/lib/api";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Must be at least 8 characters")
      .max(128)
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number")
      .regex(/[^a-zA-Z0-9]/, "Must contain a special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordForm = z.infer<typeof schema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({ resolver: zodResolver(schema) });

  async function onSubmit(data: ResetPasswordForm) {
    if (!token) {
      setServerError("Invalid or missing reset token.");
      return;
    }
    setServerError(null);
    try {
      await api(`/auth/resetPassword/${token}`, {
        method: "POST",
        body: JSON.stringify({ password: data.password }),
      });
      setSuccess(true);
    } catch (err) {
      const apiErr = err as ApiError;
      setServerError(apiErr.message ?? "Something went wrong. Please try again.");
    }
  }

  if (!token) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="rounded-2xl border border-dex-border bg-dex-surface p-8 shadow-xl shadow-black/20">
          <p className="text-sm text-red-400">Invalid or expired reset link.</p>
          <Link href="/forgot-password">
            <Button className="mt-4 h-10 w-full rounded-xl bg-dex-accent font-semibold text-white shadow-none hover:bg-dex-accent-hover">
              Request a new link
            </Button>
          </Link>
        </div>
      </div>
    );
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-lg font-bold text-dex-text">Password updated</h2>
          <p className="text-sm text-dex-muted">Your password has been reset successfully.</p>
          <Link href="/login">
            <Button className="mt-6 h-10 w-full rounded-xl bg-dex-accent font-semibold text-white shadow-none hover:bg-dex-accent-hover">
              Sign in
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-dex-text">Reset password</h1>
        <p className="mt-1 text-sm text-dex-muted">Choose a new password for your account.</p>
      </div>

      <div className="rounded-2xl border border-dex-border bg-dex-surface p-6 shadow-xl shadow-black/20">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password" className="text-xs text-dex-text-secondary">
              New password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              className="border-dex-border bg-dex-bg text-dex-text placeholder:text-dex-muted focus-visible:ring-dex-accent/40"
              {...register("password")}
            />
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirmPassword" className="text-xs text-dex-text-secondary">
              Confirm new password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              className="border-dex-border bg-dex-bg text-dex-text placeholder:text-dex-muted focus-visible:ring-dex-accent/40"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
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
            {isSubmitting ? "Saving…" : "Set new password"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
