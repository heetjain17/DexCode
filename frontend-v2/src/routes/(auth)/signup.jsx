import { SignUpForm } from '@/components/auth/Sign-up-form';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(auth)/signup')({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <div className="flex justify-center items-center h-screen">
      <SignUpForm />
    </div>
  );
}
