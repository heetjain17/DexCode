import Navbar2 from '@/components/landing_page/Navbar';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(app)/playlists/$playlistSlug')({
  component: RouteComponent
});

function RouteComponent() {
  const { playlistSlug } = Route.useParams();

  return (
    <div>
      <Navbar2 />
    </div>
  );
}
