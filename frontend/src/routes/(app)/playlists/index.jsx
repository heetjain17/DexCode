import Navbar2 from '@/components/landing_page/Navbar';
import PlaylistListPage from '@/components/playlists_list/PlaylistListPage';
import PlaylistListPage2 from '@/components/playlists_list/PlaylistListPage2';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(app)/playlists/')({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <div>
      <Navbar2 />
      {/* <PlaylistListPage /> */}
      <PlaylistListPage2 />
    </div>
  );
}
