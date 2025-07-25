import Navbar from '@/components/navbar';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Index
});

function Index() {
  return (
    <div className="p-2 font-extrabold">
      <Navbar />
      <p>Welcome Home!</p>
    </div>
  );
}
