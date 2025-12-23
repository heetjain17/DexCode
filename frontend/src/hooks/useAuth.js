import {
  authKeys,
  checkAuth,
  loginUser,
  logoutUser,
  registerUser
} from '@/api/authService';
import { useAuthStore } from '@/store/authStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

export const useLogin = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore(state => state.setUser);
  return useMutation({
    mutationFn: loginUser,
    onSuccess: user => {
      setUser(user);
      toast.success('Welcome back');
      navigate({ to: '/' });
    },
    onError: error => {
      console.error('Login failed:', error);
      toast.error('Invalid email or password.');
    }
  });
};

export const useRegister = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success('Account created!', {
        description: 'A verification link has been sent to your email.'
      });
      navigate({ to: '/login' });
    },
    onError: error => {
      console.error('Account not created:', error);
      toast.error('Could not create account.');
    }
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      logout();
      queryClient.clear();
      toast.success('You have been logged out.');
      navigate({ to: '/login' });
    },
    onError: error => {
      console.error('Error logging out:', error);
      toast.error('Logout failed. Please try again.');
    }
  });
};

export const useCheckUser = () => {
  const setUser = useAuthStore(state => state.setUser);
  const logout = useAuthStore(state => state.logout);

  return useQuery({
    queryKey: authKeys.user(),
    queryFn: checkAuth,
    onSuccess: user => {
      user ? setUser(user) : logout();
    },
    onError: () => {
      logout();
    },
    refetchOnWindowFocus: false,
    retry: false
  });
};
