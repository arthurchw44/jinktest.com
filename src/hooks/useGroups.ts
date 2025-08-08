// src/hooks/useGroups.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  apiListGroups, 
  apiGetGroup, 
  apiCreateGroup, 
  apiUpdateGroup, 
  apiDeleteGroup,
  apiManageGroupMembers,

} from '../api/apiGroups';
import type { 

  IGroupCreate,
  IGroupUpdate 
} from '../api/apiGroups';
import { useAuth } from '../context/AuthContext';

// List groups with caching
export const useGroups = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['groups'],
    queryFn: apiListGroups,
    enabled: !!user && ['admin', 'teacher'].includes(user.role),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });
};

// Get single group
export const useGroup = (groupId?: string) => {
  return useQuery({
    queryKey: ['group', groupId],
    queryFn: () => apiGetGroup(groupId!),
    enabled: !!groupId,
  });
};

// Create group mutation
export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (groupData: IGroupCreate) => apiCreateGroup(groupData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};

// Update group mutation
export const useUpdateGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ groupId, groupData }: { groupId: string; groupData: IGroupUpdate }) =>
      apiUpdateGroup(groupId, groupData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group', variables.groupId] });
    },
  });
};

// Delete group mutation
export const useDeleteGroup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (groupId: string) => apiDeleteGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
};

// Manage group members mutation
export const useManageGroupMembers = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      groupId, 
      memberData 
    }: { 
      groupId: string; 
      memberData: { add?: string[], remove?: string[] } 
    }) => apiManageGroupMembers(groupId, memberData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group', variables.groupId] });
    },
  });
};
