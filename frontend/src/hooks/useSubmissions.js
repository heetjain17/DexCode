import { submissionById, submissionKeys } from '@/api/submissionService';
import { useQuery } from '@tanstack/react-query';

export const useSubmission = submissionId => {
  return useQuery({
    queryKey: submissionKeys.detail(submissionId),
    queryFn: () => submissionById(submissionId),
    enabled: !!submissionId
  });
};
