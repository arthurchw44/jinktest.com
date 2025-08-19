// src/types/article.types.ts

// Article interface - matches backend, NO id field
export interface IArticle {
  articleName: string;          // Unique user-assigned identifier
  title: string;
  originalText: string;
  teacherUsername: string;
  metadata: {
    grade?: string;
    subject?: string;
    difficulty?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
    estimatedTime?: number;
  };
  status: 'editing' | 'processing' | 'ready' | 'error';
  processingError?: string;
  fullAudioUrl?: string;
  sentences: ISentence[];
  createdAt?: string;
  updatedAt?: string;
}

// Sentence interface - NO id field, uses sentenceId
export interface ISentence {
  sentenceId: string;           // Generated: articleName + "_" + order
  order: number;
  text: string;
  wordCount: number;
  startTime?: number;
  endTime?: number;
  individualAudioUrl?: string;
  status: 'pending' | 'ready' | 'error';
  isLong: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// API Request Types
export interface CreateArticleRequest {
  articleName: string;
  title: string;
  originalText: string;
  metadata?: IArticle['metadata'];
  sentences: Omit<ISentence, 'sentenceId'>[];
}

export interface UpdateArticleRequest {
  title?: string;
  metadata?: IArticle['metadata'];
}

export interface UpdateSentencesRequest {
  sentences: Omit<ISentence, 'sentenceId'>[];
}

export interface SuggestNameRequest {
  title: string;
}

// API Response Types
export interface ArticleResponse {
  success: boolean;
  article: IArticle;
  message?: string;
}

export interface ArticlesResponse {
  success: boolean;
  count: number;
  articles: IArticle[];
}

export interface SuggestNameResponse {
  success: boolean;
  suggestedName: string;
}

export interface CheckNameResponse {
  success: boolean;
  isAvailable: boolean;
  articleName: string;
}

export interface SentenceResponse {
  success: boolean;
  sentence: ISentence;
  message?: string;
}

export interface TeacherStatsResponse {
  success: boolean;
  stats: {
    total: number;
    byStatus: Record<string, number>;
    recentActivity: IArticle[];
  };
}

// Form Types for React Components
export interface ArticleFormData {
  articleName: string;
  title: string;
  originalText: string;
  metadata: {
    grade: string;
    subject: string;
    difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  };
}

export interface SentenceFormData {
  order: number;
  text: string;
  wordCount: number;
  isLong: boolean;
}


export interface IArticleMetadata {
grade?: string;
subject?: string;
difficulty: 'easy' | 'medium' | 'hard';
estimatedTime?: number;
}

// Utility Types
export type ArticleStatus = IArticle['status'];
export type SentenceStatus = ISentence['status'];
export type DifficultyLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';