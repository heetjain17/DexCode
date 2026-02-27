import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  username: string;
  bio: string | null;
  location: string | null;
  avatarUrl: string | null;
  website: string | null;
  socialLinks: {
    github: string | null;
    twitter: string | null;
    linkedin: string | null;
  };
  problemsSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  currentStreak: number;
  longestStreak: number;
  totalSubmissions: number;
  acceptedSubmissions: number;
  createdAt: string;
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: () => api<CurrentUser>("/profile/me").then((res) => res.data),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
