import { create } from 'zustand';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  authKeys,
  checkAuth,
  loginUser,
  registerUser,
  logoutUser,
  changePassword
} from '@/lib/api/authQueries';
import { toast } from 'sonner';

export const useAuthStore = create(set => ({
  authUser: null,
  setAuthUser: user => set({ authUser: user }),
  clearAuthUser: user => set({ authUser: null })
  // isLoggingIn: false,
  // isSigningIn: false,
  // isCheckingAuth: false,

  // useCheckAuth: async () => useQuery({
  //   queryKey: authKeys.user(),
  //   queryFn: checkAuth,
  //   onSuccess: user => set({authUser: user}),
  //   onError: () => set({authUser: null}),
  //   retry: false,
  //   staleTime: Infinity
  // }),

  // useLogin: async () => useMutation({
  //   mutationFn: loginUser,
  //   onSuccess: user => {
  //     set({authUser: user}),
  //     toast.success('Login sucessful')
  //   },
  //   onError: error => {
  //     set({authUser: null})
  //     console.log(error);
  //     toast.error(error.response?.data?.message || 'Login failed');
  //   },
  // }),

  // useRegister: async () => useMutation({
  //   mutationFn: registerUser,
  //   onSuccess: user => {
  //     set({authUser: user}),
  //     toast.success('Registration sucessful')
  //   },
  //   onError: error => {
  //     set({authUser: null})
  //     console.log(error);
  //     toast.error(error.response?.data?.message || 'Registration failed');
  //   },
  // }),

  // useLogout: async () => useMutation({
  //   mutationFn: logoutUser,
  //   onSucess: user => {
  //     set({authUser: user}),
  //     toast.success('Logout sucessful')
  //   },
  //   onError: error => {
  //     set({authUser: null})
  //     console.log(error);
  //     toast.error(error.response?.data?.message || 'Logout failed');
  //   },
  // }),

  // useChangePassword: async () => useMutation({
  //   mutationFn: changePassword,
  //   onSucess: user => {
  //     set({authUser: user}),
  //     toast.success('Logout sucessful')
  //   },
  //   onError: error => {
  //     set({authUser: null})
  //     console.log(error);
  //     toast.error(error.response?.data?.message || 'Logout failed');
  //   },
  // })
}));
