import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(app)/problems/$problemSlug')({
  component: RouteComponent
});

function RouteComponent() {
  return <div>Hello "/(app)/problems/$problemSlug"!</div>;
}
