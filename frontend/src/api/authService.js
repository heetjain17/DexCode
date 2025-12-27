import { axiosInstance } from '../lib/axios';

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
  return res.data;
};
export const registerUser = async userData => {
  const res = await axiosInstance.post('/auth/register', userData);
  return res.data;
};
export const logoutUser = async () => {
  const res = await axiosInstance.get('/auth/logout');
  return res.data;
};

export const refreshToken = async () => {
  const res = await axiosInstance.get('/auth/refresh-token');
  return res.data;
};

export const changePassword = async passwords => {
  const res = await axiosInstance.post('/auth/changePassword', passwords);
  return res.data;
};

// export const githubLogin = async () => {
//   const res = await axiosInstance.get('/auth/github');
//   return res.data;
// };

// export const googleLogin = async () => {
//   const res = await axiosInstance.get('/auth/google');
//   return res.data;
// };
