"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api, { ApiError } from "@/lib/api";

const loginSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/problems";

  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginForm) {
    setServerError(null);
    try {
      await api("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
      router.push(from);
    } catch (err) {
      const apiErr = err as ApiError;
      setServerError(apiErr.message ?? "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-dex-text">Welcome back</h1>
        <p className="mt-1 text-sm text-dex-muted">Sign in to your DexCode account</p>
      </div>

      <div className="rounded-2xl border border-dex-border bg-dex-surface p-6 shadow-xl shadow-black/20">
        {/* OAuth buttons */}
        <div className="mb-5 flex flex-col gap-2.5">
          <a href={`${BASE_URL}/auth/google`}>
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 border-dex-border bg-transparent text-dex-text hover:border-dex-text/30 hover:bg-dex-bg"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
          </a>
          <a href={`${BASE_URL}/auth/github`}>
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 border-dex-border bg-transparent text-dex-text hover:border-dex-text/30 hover:bg-dex-bg"
            >
              <Github className="h-4 w-4" />
              Continue with GitHub
            </Button>
          </a>
        </div>

        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-dex-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-dex-surface px-3 text-dex-muted">or continue with email</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="identifier" className="text-xs text-dex-text-secondary">
              Email or username
            </Label>
            <Input
              id="identifier"
              autoComplete="username"
              placeholder="you@example.com"
              className="border-dex-border bg-dex-bg text-dex-text placeholder:text-dex-muted focus-visible:ring-dex-accent/40"
              {...register("identifier")}
            />
            {errors.identifier && (
              <p className="text-xs text-red-500">{errors.identifier.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs text-dex-text-secondary">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs text-dex-muted transition-colors hover:text-dex-text"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="border-dex-border bg-dex-bg text-dex-text placeholder:text-dex-muted focus-visible:ring-dex-accent/40"
              {...register("password")}
            />
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
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
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-dex-muted">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-dex-accent hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  );
}
