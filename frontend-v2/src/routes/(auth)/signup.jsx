import { createFileRoute } from '@tanstack/react-router';
import { SignupForm } from '@/components/auth/signup-form';
export const Route = createFileRoute('/(auth)/signup')({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-lg">
        <SignupForm />
      </div>
    </div>
  );
}
