// src/hooks/useStudentArticles.ts
import { useQuery } from '@tanstack/react-query';
// import apiClient from '../api/axios';
// import type { IArticle } from '../types/article.types';
import api from '../api/axios';

// Student-specific API function
const apiGetReadyArticles = async () => {
  const response = await api.get('/articles/ready/list');
  return response.data;
};

export const useStudentArticles = () => {
  return useQuery({
    queryKey: ['studentArticles'],
    queryFn: async () => {
      const result = await apiGetReadyArticles();
      return result.articles || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 403) return false; // Don't retry forbidden
      return failureCount < 2;
    }
  });
};

