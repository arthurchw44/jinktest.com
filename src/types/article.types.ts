// Complete article.types.ts with all missing types

// Core interfaces
export interface IArticle {
  articleName: string;  // Unique identifier
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

export interface ISentence {
  sentenceId: string;  // Generated: articleName_order
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
  metadata: {
    grade?: string;
    subject?: string;
    difficulty?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
    estimatedTime?: number;
  };
  // Sentences without sentenceId - backend will generate them
  sentences: Array<{
    order: number;
    text: string;
    wordCount: number;
    isLong: boolean;
  }>;
}

export interface UpdateArticleRequest {
  title?: string;
  metadata?: {
    grade?: string;
    subject?: string;
    difficulty?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
    estimatedTime?: number;
  };
}

export interface UpdateSentencesRequest {
  sentences: Array<{
    order: number;
    text: string;
    wordCount: number;
    isLong: boolean;
  }>;
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
  difficulty?: 'easy' | 'medium' | 'hard';
  estimatedTime?: number;
}


// Add to existing article.types.ts
export interface FragmentTiming {
  fragmentIndex: number;
  order: number;
  text: string;
  startTime: number;
  endTime: number;
  duration: number;
  wordCount: number;
}

export interface DictationAttempt {
  attempt: string;
  result: ComparisonResult;
  timestamp: Date;
}

export interface FragmentProgress {
  fragmentIndex: number;
  attempts: DictationAttempt[];
  status: 'pending' | 'correct' | 'given_up';
  bestScore: number;
  timeSpent: number;
}

export interface ComparisonResult {
score: number; // 0-1
totalTokens: number;
correctTokens: number;
feedback: string; // masked hint
tokenDiffs: TokenDiff[]; // define TokenDiff as below
isPerfect: boolean;
}

export interface TokenDiff {
original: string;
attempt: string;
isCorrect: boolean;
type: 'match' | 'substitution' | 'insertion' | 'deletion';
}

// Utility Types
export type ArticleStatus = IArticle['status'];
export type SentenceStatus = ISentence['status'];
export type DifficultyLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';