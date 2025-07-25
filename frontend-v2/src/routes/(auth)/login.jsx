import { LoginForm } from '@/components/auth/login-form';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createFileRoute('/(auth)/login')({
  component: RouteComponent
});

function RouteComponent() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get('error') === 'oauth_failed') {
      toast.success('Authentication failed. Please try again');
      window.history.replaceState({}, document.title, '/(auth)/login');
    }
  }, []);
  return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
    
          <div className="w-full max-w-lg"> 
            <LoginForm /> 
          </div>
    
        </div>
  );
}
