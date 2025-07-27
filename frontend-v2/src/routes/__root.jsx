import { Toaster } from '@/components/ui/sonner';
import { checkAuth } from '@/lib/api/authQueries';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import React, { useEffect } from 'react';
import { toast } from 'sonner';

export const Route = createRootRoute({
  component: RootComponent
});
function RootComponent() {
  const { setAuthUser } = useAuthStore();

  useQuery({
    queryKey: ['authUser'],
    queryFn: checkAuth,
    onSuccess: user => {
      if (user) {
        setAuthUser(user);
      }
    },
    onError: () => {
      setAuthUser(null);
    },
    retry: false,
    staleTime: Infinity
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get('login') === 'success') {
      toast.success('Login successfull');
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  return (
    <div className="bg-neutral-950 text-foreground min-h-screen font-family-sans">
      <Outlet />
      <Toaster position="top-center" richColors />
      <TanStackRouterDevtools />
    </div>
  );
}
