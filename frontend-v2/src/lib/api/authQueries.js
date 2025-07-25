import { axiosInstance } from '../axios';

export const authKeys = {
  all: ['auth'],
  user: () => [...authKeys.all, 'user']
};

export const checkAuth = async () => {
  const res = await axiosInstance.get('/auth/check');
  return res.data.data;
};
export const loginUser = async credentials => {
  const res = await axiosInstance.post('/auth/login', credentials);
  console.log(res);

  return res;
};
export const registerUser = async userData => {
  const res = await axiosInstance.post('/auth/register', userData);
  return res;
};
export const logoutUser = async () => {
  const res = await axiosInstance.get('/auth/check');
  return res;
};

export const changePassword = async () => {
  const res = await axiosInstance.post('/auth/changePassword');
  return res;
};

export const refreshToken = async () => {
  const res = await axiosInstance.get('/auth/refresh-token');
  return res;
};

export const githubLogin = async () => {
  const res = await axiosInstance.get('/auth/github');
  return res.data;
};

export const googleLogin = async () => {
  const res = await axiosInstance.get('/auth/google');
  return res.data;
};
