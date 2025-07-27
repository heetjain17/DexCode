import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(app)/problems/')({
  component: RouteComponent
});

function RouteComponent() {
  return <div>Hello "/(app)/problems/"!</div>;
}
