import { runCode, submitCode } from '@/api/executeCodeService';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useRunCode = () => {
  return useMutation({
    mutationFn: runCode,
    // onSuccess: data => {
    //   toast.success('Code run successful!');
    //   console.log(data);
    // },
    onError: error => {
      toast.error('An error occured.');
    }
  });
};

export const useSubmitCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitCode,
    // onSuccess: data => {
    //   toast.success('Code submitted!');
    //   queryClient.invalidateQueries({ queryKey: ['submissions'] });
    //   console.log(data);
    // },
    onError: error => {
      toast.error('An error occured.');
    }
  });
};
