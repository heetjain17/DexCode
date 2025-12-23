import { axiosInstance } from '@/lib/axios';

export const playlistKeys = {
  all: ['playlist'],
  lists: () => [...playlistKeys.all, 'list'],
  list: filters => [...playlistKeys.lists(), filters],
  details: () => [...playlistKeys.all, 'detail'],
  detail: slug => [...playlistKeys.details(), slug]
};

export const createPlaylist = async data => {
  const res = await axiosInstance.post(`/playlist/create-playlist`, data);
  return res.data;
};

export const getAllPlaylist = async () => {
  const res = await axiosInstance.get(`/playlist/`);
  return res.data;
};

export const getPlaylistById = async id => {
  const res = await axiosInstance.get(`/playlist/${id}`);
  return res.data;
};

export const addProblemToPlaylist = async (playlistId, problemId) => {
  const res = await axiosInstance.post(`/playlist/${playlistId}/add-problem`, {
    problemId
  });
  return res.data;
};
export const removeProblemFromPlaylist = async (playlistId, problemId) => {
  const res = await axiosInstance.delete(`/playlist/${playlistId}/remove-problem`, {
    data: { problemId }
  });
  return res.data;
};
export const deletePlayList = async id => {
  const res = await axiosInstance.delete(`/playlist/${id}`);
  return res.data;
};
