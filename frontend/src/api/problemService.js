import { axiosInstance } from '@/lib/axios';

export const problemKeys = {
  all: ['problems'],
  lists: () => [...problemKeys.all, 'list'],
  list: filters => [...problemKeys.lists(), filters],
  details: () => [...problemKeys.all, 'detail'],
  detail: slug => [...problemKeys.details(), slug]
};

export const createProblem = async data => {
  const res = await axiosInstance.post('/problem/create-problem', data);
  return res.data.data;
};

export const getAllProblems = async () => {
  const res = await axiosInstance.get('/problem/get-all-problems');
  // console.log('Raw backend response in service:', res);

  return res.data.data;
};

export const getProblemById = async id => {
  const res = await axiosInstance.get(`/problem/get-problem/${id}`);
  return res.data.data;
};

export const updateProblem = async id => {
  const res = await axiosInstance.put(`/problem/update-problem/${id}`);
  return res.data.data;
};

export const deleteProblem = async id => {
  const res = await axiosInstance.delete(`/problem/delete-problem/${id}`);
  return res.data.data;
};
