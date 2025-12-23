import { Toaster } from '@/components/ui/sonner';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import React from 'react';

export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: ErrorFallback
});

function RootComponent() {
  return (
    <div className="bg-neutral-950 text-foreground min-h-screen font-family-sans">
      <Outlet />
      <Toaster position="top-center" richColors />
      {/* <TanStackRouterDevtools /> */}
    </div>
  );
}

function ErrorFallback({ error }) {
  return (
    <div className="text-red-500 p-4">
      <h2>Something went wrong</h2>
      <pre>{error.message}</pre>
    </div>
  );
}
