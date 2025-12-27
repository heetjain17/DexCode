import { getAllProblems, getProblemById, problemKeys } from '@/api/problemService';
import { useQuery } from '@tanstack/react-query';

export const useProblem = problemId => {
  return useQuery({
    queryKey: problemKeys.detail(problemId),
    queryFn: () => getProblemById(problemId),
    enabled: !!problemId
  });
};

export const useProblems = () => {
  return useQuery({
    queryKey: problemKeys.lists(),
    queryFn: () => getAllProblems()
  });
};
