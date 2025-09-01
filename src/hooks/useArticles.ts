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
  TeacherStatsResponse,
  IArticle
} from '../types/article.types';
// import { apiGetAudioStatus } from '../api/apiArticles'
// import { validateAudioStatusResponse } from '../utils/apiValidation'
// import type { AudioStatusResponse } from '../types/audio.types';

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
  // create: async (data: CreateArticleRequest): Promise<ArticleResponse> => {
  //   const response = await api.post('/articles', data);
  //   return response.data;
  // },

  create: async (data: CreateArticleRequest): Promise<{ success: boolean; article: IArticle; message: string }> => {
    console.log('Creating article with payload:', data);

    // Validate payload before sending
    if (!data.articleName || !data.title || !data.originalText) {
      throw new Error('Missing required fields: articleName, title, or originalText');
    }

    if (!data.sentences || data.sentences.length === 0) {
      throw new Error('At least one sentence is required');
    }

    // Ensure all sentences have required fields
    data.sentences.forEach((sentence, index) => {
      if (!sentence.text || sentence.text.trim().length === 0) {
        throw new Error(`Sentence ${index + 1} is empty`);
      }
      if (typeof sentence.order !== 'number') {
        sentence.order = index + 1;
      }
      if (typeof sentence.wordCount !== 'number') {
        sentence.wordCount = sentence.text.split(/\s+/).filter(w => w.trim().length > 0).length;
      }
      if (typeof sentence.isLong !== 'boolean') {
        sentence.isLong = sentence.wordCount > 15;
      }
    });

    try {
      const response = await api.post<{ success: boolean; article: IArticle; message: string }>('/articles', data);
      return response.data;
    } catch (error: any) {
      console.error('API Error Details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config
      });

      // Enhanced error message handling
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }

      // Handle specific HTTP status codes with user-friendly messages
      if (error.response?.status === 409) {
        throw new Error(`Article name "${data.articleName}" already exists. Please choose a different name.`);
      }

      if (error.response?.status === 400) {
        throw new Error('Invalid article data. Please check your input and try again.');
      }

      if (error.response?.status === 401) {
        throw new Error('You are not authorized to create articles. Please log in again.');
      }

      if (error.response?.status === 403) {
        throw new Error('You do not have permission to create articles. Contact your administrator.');
      }

      if (error.response?.status === 500) {
        throw new Error('Server error occurred. Please try again in a moment.');
      }

      // Network or other errors
      if (!error.response) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }

      throw error;
    }
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
    mutationFn: async ({
      articleName,
      updateData
    }: {
      articleName: string;
      updateData: UpdateArticleRequest
    }) => {
      const response = await api.put<ArticleResponse>(`/articles/${articleName}`, updateData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update specific article and articles list
      queryClient.setQueryData(['article', variables.articleName], data.article);
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      console.log('Article metadata updated successfully');
    },
    onError: (error: any) => {
      console.error('Update article metadata error:', error);
    }
  });
};

/**
 * Update article sentences
 */
export const useUpdateArticleSentences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      articleName,
      sentences
    }: {
      articleName: string;
      sentences: UpdateSentencesRequest
    }) => {
      const response = await api.put<ArticleResponse>(`/articles/${articleName}/sentences`, sentences);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update specific article and articles list
      queryClient.setQueryData(['article', variables.articleName], data.article);
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      console.log('Article sentences updated successfully');
    },
    onError: (error: any) => {
      console.error('Update article sentences error:', error);
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

const toAbsoluteUrlFromAxios = (url?: string) => {
  if (!url) return url;
  try {
    // If url is already absolute, this succeeds
    return new URL(url).toString();
  } catch {
    // Otherwise, resolve against baseURL
    const base = api.defaults.baseURL ?? '';
    return new URL(url, base).toString();
  }
};


// Add to existing useArticles hook
export const useArticleWithAudio = (articleName: string) => {
  return useQuery({
    queryKey: ['article', articleName, 'audio'],
    queryFn: async () => {
      const result = await articleAPI.getByName(articleName);

      result.article.fullAudioUrl = toAbsoluteUrlFromAxios(result.article.fullAudioUrl);

      // // Ensure audio URL is properly formatted
      // if (result.article.fullAudioUrl) {
      //   result.article.fullAudioUrl = result.article.fullAudioUrl.startsWith('http')
      //     ? result.article.fullAudioUrl
      //     : `${api.defaults.baseURL}/${result.article.fullAudioUrl}`;
      // }


      return result.article;
    },
    enabled: !!articleName,
  });
};


export const useUpdateArticleStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ articleName, status }: { 
      articleName: string; 
      status: 'editing' | 'ready' 
    }) => {
      const response = await api.put(`/articles/${articleName}/status`, { status });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update the specific article in cache
      queryClient.setQueryData(['article', variables.articleName], data.article);
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['studentArticles'] });
    },
  });
};
