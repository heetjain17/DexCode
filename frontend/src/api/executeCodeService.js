import { axiosInstance } from '@/lib/axios';

export const runCode = async data => {
  const res = await axiosInstance.post(`/execute-code/run`, data);
  console.log(res.data.data);

  return res.data.data;
};

export const submitCode = async data => {
  const res = await axiosInstance.post(`/execute-code/submit`, data);
  return res.data.data;
};
