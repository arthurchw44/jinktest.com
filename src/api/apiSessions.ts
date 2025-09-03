import { api } from './axios';

export interface StudentOverallProgress {
  studentUsername: string;
  totalArticlesAttempted: number;
  completedArticles: number;
  averageScore: number; // 0-1
  totalTimeSpent: number; // seconds
  recentSessions: Array<{
    articleName: string;
    score: number;
    completionRate: number;
    timestamp: Date;
  }>;
  improvementTrend: 'improving' | 'declining' | 'stable';
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

// Get student's overall progress from server
export const apiGetStudentProgress = async (): Promise<StudentOverallProgress> => {
  const { data } = await api.get<{ success: boolean; progress: StudentOverallProgress }>('/sessions/my-progress');
  return data.progress;
};

// Get student's progress for specific article
export const apiGetStudentArticleProgress = async (articleName: string): Promise<StudentArticleProgress | null> => {
  const { data } = await api.get<{ success: boolean; progress: StudentArticleProgress | null }>(`/sessions/my-progress/${articleName}`);
  return data.progress;
};


export const apiGetStudentsProgress = async () => {
  const response = await api.get('/sessions/analytics/students');
  return response.data;
};
