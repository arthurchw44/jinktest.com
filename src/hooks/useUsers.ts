// src/hooks/useUsers.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  apiListUsers, 
  apiGetUserByUsername, 
  apiCreateUser, 
  apiUpdateUser, 
  apiDeleteUser, 
  apiToggleUserStatus,
  apiResetPassword,
} from '../api/apiUsers';
import type { 
  IUserCreate,
  IUserUpdate 
} from '../api/apiUsers';
import { useAuth } from '../context/AuthContext';

// List users with caching
export const useUsers = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['users'],
    queryFn: apiListUsers,
    enabled: !!user && ['admin', 'teacher'].includes(user.role),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes (was cacheTime in v4)
  });
};

// Get single user
export const useUser = (username?: string) => {
  return useQuery({
    queryKey: ['user', username],
    queryFn: () => apiGetUserByUsername(username!),
    enabled: !!username,
  });
};

// Create user mutation
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: IUserCreate) => apiCreateUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// Update user mutation
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ username, userData }: { username: string; userData: IUserUpdate }) =>
      apiUpdateUser(username, userData),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.username] });
    },
  });
};

// // Delete user mutation
// export const useDeleteUser = () => {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: (username: string) => apiDeleteUser(username),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['users'] });
//     },
//   });
// };
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiDeleteUser, // (username: string) => apiDeleteUser(username) works too
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('Delete user error:', error);
    },
  });
};



// Toggle user status mutation
export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (username: string) => apiToggleUserStatus(username),
    onSuccess: (_data, username) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', username] });
    },
  });
};

// Reset password mutation
export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ username, newPassword }: { username: string; newPassword: string }) =>
      apiResetPassword(username, newPassword),
  });
};
