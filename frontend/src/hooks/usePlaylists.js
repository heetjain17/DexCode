import { getAllPlaylist, getPlaylistById, playlistKeys } from '@/api/playlistService';
import { useQuery } from '@tanstack/react-query';

export const usePlaylist = playlistId => {
  return useQuery({
    queryKey: playlistKeys.detail(problemId),
    queryFn: () => getPlaylistById(problemId),
    enabled: !!problemId
  });
};

export const usePlaylists = () => {
  return useQuery({
    queryKey: playlistKeys.lists(),
    queryFn: () => getAllPlaylist()
  });
};
