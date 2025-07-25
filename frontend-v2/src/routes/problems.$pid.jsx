import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/problems/$pid')({
  component: RouteComponent
});

function RouteComponent() {
  const { pid } = Route.useParams();
  return (
    <div>
      Hello "/problems/$pid"!
      <h2>problem id {pid}</h2>
    </div>
  );
}
