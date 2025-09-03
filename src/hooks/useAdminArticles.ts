import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axios';

// Admin-specific article interfaces
// types or hook file where IAdminArticleView is declared
export interface IAdminArticleView {
  articleName: string;
  title: string;
  teacherUsername: string;
  status: 'editing' | 'processing' | 'ready' | 'error';
  sentenceCount: number;
  wordCount: number;
  hasAudio: boolean;
  createdAt: string;
  updatedAt: string;
  processingError?: string;

  // Optional: API may include only username now; fullname can be added later
  teacherInfo?: {
    username: string;
    fullname?: string;
  };
}

export interface IAdminSystemStats {
  totalArticles: number;
  byStatus: Record<string, number>;
  byTeacher: Array<{
    teacherUsername: string;
    teacherFullname: string;
    articleCount: number;
    audioSuccessRate: number;
  }>;
  audioStats: {
    withAudio: number;
    totalStorageGB: number;
    avgGenerationTime: number;
  };
  recentActivity: IAdminArticleView[];
}

// Get all articles for admin dashboard


export const useAdminArticles = () => {
  return useQuery({
    queryKey: ['admin', 'articles'],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; articles: any[] }>('/articles/admin/all');
      return (data.articles || []).map((a: any): IAdminArticleView => {
        const sentenceCount =
          a.stats?.sentenceCount ??
          (Array.isArray(a.sentences) ? a.sentences.length : 0);
        const wordCount =
          a.stats?.wordCount ??
          (Array.isArray(a.sentences)
            ? a.sentences.reduce((sum: number, s: any) => sum + (s?.wordCount || 0), 0)
            : 0);
        const hasAudio = a.stats?.hasAudio ?? !!a.fullAudioUrl;

        const teacherInfo = a.teacherInfo
          ? {
              username: a.teacherInfo.username ?? a.teacherUsername,
              fullname: a.teacherInfo.fullname, // may be undefined
            }
          : { username: a.teacherUsername };

        return {
          articleName: a.articleName,
          title: a.title,
          teacherUsername: a.teacherUsername,
          status: a.status,
          sentenceCount,
          wordCount,
          hasAudio,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
          processingError: a.processingError,
          teacherInfo,
        };
      });
    },
    staleTime: 30000,
  });
};



// Get admin system statistics
export const useAdminSystemStats = () => {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const response = await api.get<{
        success: boolean;
        stats: IAdminSystemStats;
      }>('/articles/admin/stats');
      return response.data.stats;
    },
    staleTime: 60000, // 1 minute
  });
};

// Force regenerate audio (admin only)
export const useForceRegenerateAudio = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      articleName, 
      quality = 'high' 
    }: { 
      articleName: string; 
      quality?: 'high' | 'medium' | 'low' 
    }) => {
      const response = await api.post(`/articles/${articleName}/admin/force-regenerate`, {
        quality
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
};

// Admin update article status
export const useAdminUpdateArticleStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      articleName, 
      status 
    }: { 
      articleName: string; 
      status: 'editing' | 'ready' 
    }) => {
      const response = await api.put(`/articles/${articleName}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
};

// Admin delete article
export const useAdminDeleteArticle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (articleName: string) => {
      const encoded = encodeURIComponent(articleName);
      const response = await api.delete(`/articles/${encoded}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
};
