// src/types/progress.types.ts
export interface ArticleProgress {
  isCompleted: boolean;
  bestScore: number;        // 0..1
  completionRate: number;   // 0..100
  lastAttempt: Date;        // non-null for card rendering
  totalAttempts: number;
}

export interface StudentArticleProgress {
  studentUsername: string;
  articleName: string;
  totalAttempts: number;
  bestScore: number; // 0-1
  averageScore: number; // 0-1
  totalTimeSpent: number; // seconds
  lastPracticed: Date;
  completionRate: number; // 0-100
}