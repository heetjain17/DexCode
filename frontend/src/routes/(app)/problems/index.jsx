import { createFileRoute } from '@tanstack/react-router';
import ProblemListPage from '@/components/problems_list/ProblemListPage';
import Navbar from '@/components/landing page/Navbar';

export const Route = createFileRoute('/(app)/problems/')({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <div>
      <Navbar />
      <ProblemListPage />
    </div>
  );
}
