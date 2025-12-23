import { axiosInstance } from '@/lib/axios';

export const submissionKeys = {
  all: ['submissions'],
  lists: () => [...submissionKeys.all, 'list'],
  list: userId => [...submissionKeys.lists(), userId],
  details: () => [...submissionKeys.all, 'detail'],
  detail: submissionId => [...submissionKeys.details(), submissionId]
};

export const allSubmission = async () => {
  const res = await axiosInstance.get('/submission/get-all-submissions');
  return res.data.data;
};

export const submissionById = async id => {
  const res = await axiosInstance.get(`/submission/get-submission/${id}`);
  return res.data.data;
};

export const submissionCount = async id => {
  const res = await axiosInstance.get(`/submission/get-submissions-count/${id}`);
  return res.data.data;
};
