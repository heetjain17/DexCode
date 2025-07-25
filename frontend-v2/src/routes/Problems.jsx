import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/Problems')({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <div>
      Hello "/problems"!
      <Link to="/problems/1">Problem 1</Link>
      <Link to="/problems/2">Problem 2</Link>
      <Link to="/problems/3">Problem 3</Link>
    </div>
  );
}
