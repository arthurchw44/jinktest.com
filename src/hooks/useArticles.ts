// src/hooks/useArticles.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import type {
  // IArticle,
  ISentence,
  CreateArticleRequest,
  ArticleResponse,
  ArticlesResponse,
  SuggestNameRequest,
  SuggestNameResponse,
  CheckNameResponse,
  UpdateArticleRequest,
  UpdateSentencesRequest,
  SentenceResponse,
  TeacherStatsResponse
} from '../types/article.types';

// API functions
const articleAPI = {
  // Suggest article name from title
  suggestName: async (data: SuggestNameRequest): Promise<SuggestNameResponse> => {
    const response = await api.post('/articles/suggest-name', data);
    return response.data;
  },

  // Check if article name is available
  checkNameAvailability: async (articleName: string): Promise<CheckNameResponse> => {
    const response = await api.get(`/articles/check-name/${articleName}`);
    return response.data;
  },

  // Create new article
  create: async (data: CreateArticleRequest): Promise<ArticleResponse> => {
    const response = await api.post('/articles', data);
    return response.data;
  },

  // Get all articles for teacher
  getAll: async (): Promise<ArticlesResponse> => {
    const response = await api.get('/articles');
    return response.data;
  },

  // Get single article by articleName
  getByName: async (articleName: string): Promise<ArticleResponse> => {
    const response = await api.get(`/articles/${articleName}`);
    return response.data;
  },

  // Update article metadata
  updateMetadata: async (articleName: string, data: UpdateArticleRequest): Promise<ArticleResponse> => {
    const response = await api.put(`/articles/${articleName}`, data);
    return response.data;
  },

  // Update article sentences
  updateSentences: async (articleName: string, data: UpdateSentencesRequest): Promise<ArticleResponse> => {
    const response = await api.put(`/articles/${articleName}/sentences`, data);
    return response.data;
  },

  // Delete article
  delete: async (articleName: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/articles/${articleName}`);
    return response.data;
  },

  // Get teacher stats
  getStats: async (): Promise<TeacherStatsResponse> => {
    const response = await api.get('/articles/stats');
    return response.data;
  }
};

const sentenceAPI = {
  // Get single sentence by sentenceId
  getById: async (sentenceId: string): Promise<SentenceResponse> => {
    const response = await api.get(`/articles/sentences/${sentenceId}`);
    return response.data;
  },

  // Update single sentence
  update: async (sentenceId: string, data: Partial<Pick<ISentence, 'text' | 'status' | 'individualAudioUrl'>>): Promise<SentenceResponse> => {
    const response = await api.put(`/articles/sentences/${sentenceId}`, data);
    return response.data;
  }
};

// React Query Hooks

/**
 * Suggest article name from title
 */
export const useSuggestArticleName = () => {
  return useMutation({
    mutationFn: articleAPI.suggestName,
    onError: (error: any) => {
      console.error('Suggest name error:', error);
    }
  });
};

/**
 * Check article name availability
 */
export const useCheckArticleNameAvailability = (articleName: string) => {
  return useQuery({
    queryKey: ['articleNameAvailability', articleName],
    queryFn: () => articleAPI.checkNameAvailability(articleName),
    enabled: !!articleName && articleName.length >= 3,
    staleTime: 30000 // Cache for 30 seconds
  });
};

/**
 * Get all articles for teacher
 */
export const useArticles = () => {
  return useQuery({
    queryKey: ['articles'],
    queryFn: async () => {
      const result = await articleAPI.getAll();
      return result.articles;
    }
  });
};

/**
 * Get single article by articleName
 */
export const useArticle = (articleName: string) => {
  return useQuery({
    queryKey: ['article', articleName],
    queryFn: async () => {
      const result = await articleAPI.getByName(articleName);
      return result.article;
    },
    enabled: !!articleName
  });
};

/**
 * Create new article
 */
export const useCreateArticle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: articleAPI.create,
    onSuccess: (data) => {
      // Invalidate articles list to show new article
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['articleStats'] });
      
      // Set the new article in cache
      queryClient.setQueryData(['article', data.article.articleName], data.article);
    },
    onError: (error: any) => {
      console.error('Create article error:', error);
    }
  });
};

/**
 * Update article metadata
 */
export const useUpdateArticleMetadata = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ articleName, data }: { articleName: string; data: UpdateArticleRequest }) => 
      articleAPI.updateMetadata(articleName, data),
    onSuccess: (response, variables) => {
      // Update specific article and articles list
      queryClient.setQueryData(['article', variables.articleName], response.article);
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    }
  });
};

/**
 * Update article sentences
 */
export const useUpdateArticleSentences = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ articleName, sentences }: { 
      articleName: string; 
      sentences: Omit<ISentence, 'sentenceId'>[] 
    }) => articleAPI.updateSentences(articleName, { sentences }),
    onSuccess: (response, variables) => {
      // Update specific article and articles list
      queryClient.setQueryData(['article', variables.articleName], response.article);
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    }
  });
};

/**
 * Delete article
 */
export const useDeleteArticle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: articleAPI.delete,
    onSuccess: (_, articleName) => {
      // Remove from articles list and individual cache
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['articleStats'] });
      queryClient.removeQueries({ queryKey: ['article', articleName] });
    }
  });
};

/**
 * Get teacher statistics
 */
export const useArticleStats = () => {
  return useQuery({
    queryKey: ['articleStats'],
    queryFn: async () => {
      const result = await articleAPI.getStats();
      return result.stats;
    }
  });
};

/**
 * Get single sentence by sentenceId
 */
export const useSentence = (sentenceId: string) => {
  return useQuery({
    queryKey: ['sentence', sentenceId],
    queryFn: async () => {
      const result = await sentenceAPI.getById(sentenceId);
      return result.sentence;
    },
    enabled: !!sentenceId
  });
};

/**
 * Update single sentence
 */
export const useUpdateSentence = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ sentenceId, data }: { 
      sentenceId: string; 
      data: Partial<Pick<ISentence, 'text' | 'status' | 'individualAudioUrl'>> 
    }) => sentenceAPI.update(sentenceId, data),
    onSuccess: (response, variables) => {
      // Update sentence in cache
      queryClient.setQueryData(['sentence', variables.sentenceId], response.sentence);
      
      // Parse articleName from sentenceId to invalidate article
      const lastUnderscoreIndex = variables.sentenceId.lastIndexOf('_');
      if (lastUnderscoreIndex !== -1) {
        const articleName = variables.sentenceId.substring(0, lastUnderscoreIndex);
        queryClient.invalidateQueries({ queryKey: ['article', articleName] });
      }
    }
  });
};