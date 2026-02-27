"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, User, Lock } from "lucide-react";
import Navbar from "@/components/landing/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useQueryClient } from "@tanstack/react-query";
import api, { ApiError } from "@/lib/api";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const optionalUrl = z.string().url("Must be a valid URL").or(z.literal("")).optional();

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  bio: z.string().max(500, "Bio must be 500 characters or less").optional(),
  location: z.string().max(100).optional(),
  website: optionalUrl,
  avatarUrl: optionalUrl,
  github: optionalUrl,
  twitter: optionalUrl,
  linkedin: optionalUrl,
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Must be at least 8 characters")
      .max(128)
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number")
      .regex(/[^a-zA-Z0-9]/, "Must contain a special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

// ─── SectionCard ──────────────────────────────────────────────────────────────

function SectionCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dex-border bg-dex-surface">
      <div className="flex items-center gap-3 border-b border-dex-border px-6 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-dex-bg text-dex-accent">
          {icon}
        </span>
        <div>
          <h2 className="text-sm font-semibold text-dex-text">{title}</h2>
          <p className="text-xs text-dex-muted">{description}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── ProfileSection ───────────────────────────────────────────────────────────

function ProfileSection() {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name ?? "",
        bio: user.bio ?? "",
        location: user.location ?? "",
        website: user.website ?? "",
        avatarUrl: user.avatarUrl ?? "",
        github: user.socialLinks?.github ?? "",
        twitter: user.socialLinks?.twitter ?? "",
        linkedin: user.socialLinks?.linkedin ?? "",
      });
    }
  }, [user, reset]);

  async function onSubmit(data: ProfileForm) {
    setServerError(null);
    setSuccess(false);
    try {
      await api("/profile/me", {
        method: "PUT",
        body: JSON.stringify({
          name: data.name,
          bio: data.bio || undefined,
          location: data.location || undefined,
          website: data.website || undefined,
          avatarUrl: data.avatarUrl || undefined,
          socialLinks: {
            github: data.github || undefined,
            twitter: data.twitter || undefined,
            linkedin: data.linkedin || undefined,
          },
        }),
      });
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    } catch (err) {
      const apiErr = err as ApiError;
      setServerError(apiErr.message ?? "Failed to save changes.");
    }
  }

  const inputCls =
    "border-dex-border bg-dex-bg text-dex-text placeholder:text-dex-muted focus-visible:ring-dex-accent/40";
  const labelCls = "text-xs text-dex-text-secondary";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Row: name + avatar */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name" className={labelCls}>
            Display name
          </Label>
          <Input id="name" className={inputCls} placeholder="Your name" {...register("name")} />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="avatarUrl" className={labelCls}>
            Avatar URL
          </Label>
          <Input
            id="avatarUrl"
            className={inputCls}
            placeholder="https://example.com/avatar.jpg"
            {...register("avatarUrl")}
          />
          {errors.avatarUrl && <p className="text-xs text-red-500">{errors.avatarUrl.message}</p>}
        </div>
      </div>

      {/* Bio */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bio" className={labelCls}>
          Bio
        </Label>
        <textarea
          id="bio"
          rows={3}
          className="w-full resize-none rounded-md border border-dex-border bg-dex-bg px-3 py-2 text-sm text-dex-text placeholder:text-dex-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-dex-accent/40"
          placeholder="Tell the community a bit about yourself…"
          {...register("bio")}
        />
        {errors.bio && <p className="text-xs text-red-500">{errors.bio.message}</p>}
      </div>

      {/* Row: location + website */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="location" className={labelCls}>
            Location
          </Label>
          <Input
            id="location"
            className={inputCls}
            placeholder="San Francisco, CA"
            {...register("location")}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="website" className={labelCls}>
            Website
          </Label>
          <Input
            id="website"
            className={inputCls}
            placeholder="https://yoursite.com"
            {...register("website")}
          />
        </div>
      </div>

      {/* Social links */}
      <div>
        <p className="mb-3 text-[11px] font-semibold tracking-wider text-dex-muted uppercase">
          Social Links
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="github" className={labelCls}>
              GitHub URL
            </Label>
            <Input id="github" className={inputCls} placeholder="https://github.com/octocat" {...register("github")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="twitter" className={labelCls}>
              Twitter / X URL
            </Label>
            <Input
              id="twitter"
              className={inputCls}
              placeholder="https://twitter.com/username"
              {...register("twitter")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="linkedin" className={labelCls}>
              LinkedIn URL
            </Label>
            <Input
              id="linkedin"
              className={inputCls}
              placeholder="https://linkedin.com/in/username"
              {...register("linkedin")}
            />
          </div>
        </div>
      </div>

      {serverError && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {serverError}
        </p>
      )}
      {success && (
        <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
          Profile updated successfully.
        </p>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="h-10 rounded-xl bg-dex-accent px-6 font-semibold text-white shadow-none hover:bg-dex-accent-hover disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              Saving…
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </form>
  );
}

// ─── PasswordSection ──────────────────────────────────────────────────────────

function PasswordSection() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  async function onSubmit(data: PasswordForm) {
    setServerError(null);
    setSuccess(false);
    try {
      await api("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });
      setSuccess(true);
      reset();
    } catch (err) {
      const apiErr = err as ApiError;
      setServerError(apiErr.message ?? "Failed to change password.");
    }
  }

  const inputCls =
    "border-dex-border bg-dex-bg text-dex-text placeholder:text-dex-muted focus-visible:ring-dex-accent/40";
  const labelCls = "text-xs text-dex-text-secondary";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="currentPassword" className={labelCls}>
          Current password
        </Label>
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className={inputCls}
          {...register("currentPassword")}
        />
        {errors.currentPassword && (
          <p className="text-xs text-red-500">{errors.currentPassword.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="newPassword" className={labelCls}>
            New password
          </Label>
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className={inputCls}
            {...register("newPassword")}
          />
          {errors.newPassword && (
            <p className="text-xs text-red-500">{errors.newPassword.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword" className={labelCls}>
            Confirm new password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className={inputCls}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      {serverError && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {serverError}
        </p>
      )}
      {success && (
        <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
          Password changed successfully.
        </p>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-10 rounded-xl bg-dex-accent px-6 font-semibold text-white shadow-none hover:bg-dex-accent-hover disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              Updating…
            </>
          ) : (
            "Change password"
          )}
        </Button>
      </div>
    </form>
  );
}

// ─── SettingsPage ─────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { data: user, isLoading } = useCurrentUser();

  return (
    <main className="min-h-screen bg-dex-bg text-dex-text">
      <Navbar />

      <div className="mx-auto max-w-2xl px-4 pt-24 pb-16">
        <div className="mb-7">
          <h1 className="text-xl font-bold text-dex-text">Settings</h1>
          <p className="mt-0.5 text-sm text-dex-muted">Manage your account and preferences.</p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-dex-accent" />
          </div>
        )}

        {!isLoading && !user && (
          <div className="rounded-2xl border border-dex-border bg-dex-surface p-8 text-center">
            <p className="text-sm text-dex-muted">You must be signed in to access settings.</p>
          </div>
        )}

        {!isLoading && user && (
          <div className="space-y-6">
            <SectionCard
              icon={<User className="h-4 w-4" />}
              title="Profile"
              description="Update your public profile information"
            >
              <ProfileSection />
            </SectionCard>

            <SectionCard
              icon={<Lock className="h-4 w-4" />}
              title="Password"
              description="Change your account password"
            >
              <PasswordSection />
            </SectionCard>
          </div>
        )}
      </div>
    </main>
  );
}
