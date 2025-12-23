import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallback
});

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('oauth_login_success', 'true');

    navigate({ to: '/' });
  }, [navigate]);

  return (
    <div className="flex justify-center items-center h-screen ">
      <Loader2 className="h-20 w-20 animate-spin" />
    </div>
  );
}
