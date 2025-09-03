import { useQuery } from '@tanstack/react-query';
import { apiGetStudentsProgress } from '../api/apiSessions';

export const useStudentsProgress = () => {
  return useQuery({
    queryKey: ['teacher-analytics', 'students'],
    queryFn: apiGetStudentsProgress,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,   // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 403) {
        return false; // Don't retry unauthorized
      }
      return failureCount < 2;
    },
  });
};
