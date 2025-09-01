// src/hooks/useStudentProgress.ts
import { useState, useEffect } from 'react';

interface StudentProgressData {
  totalArticlesAttempted: number;
  completedArticles: string[];
  averageScore: number;
  totalTimeSpent: number;
  articleProgress: Record<string, {
    isCompleted: boolean;
    bestScore: number;
    completionRate: number;
    lastAttempt: Date;
    totalAttempts: number;
  }>;
  recentSessions: Array<{
    articleName: string;
    articleTitle: string;
    score: number;
    completionRate: number;
    timestamp: Date;
    fragments: number;
  }>;
  lastPracticed?: {
    articleName: string;
    timestamp: Date;
  };
}

export const useStudentProgress = () => {
  const [data, setData] = useState<StudentProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // For Phase 1, load from localStorage
    // In Phase 4, this will connect to backend API
    const loadProgressFromStorage = () => {
      try {
        const allKeys = Object.keys(localStorage);
        const progressKeys = allKeys.filter(key => key.startsWith('dictation_progress_'));
        
        const articleProgress: Record<string, any> = {};
        const recentSessions: any[] = [];
        let totalTimeSpent = 0;
        let totalScore = 0;
        let totalSessions = 0;

        progressKeys.forEach(key => {
          const articleName = key.replace('dictation_progress_', '');
          const progressData = localStorage.getItem(key);
          
          if (progressData) {
            try {
              const parsed = JSON.parse(progressData);
              const session = parsed.session || parsed; // Support both formats
              
              if (session) {
                // Calculate article progress
                const bestScore = session.progress 
                  ? Math.max(...session.progress.map((p: any) => p.bestScore || 0))
                  : session.bestScore || 0;
                
                const completedFragments = session.progress 
                  ? session.progress.filter((p: any) => p.status === 'correct').length
                  : session.completedFragments || 0;
                
                const totalFragments = session.fragments 
                  ? session.fragments.length 
                  : session.totalFragments || 1;
                
                const completionRate = (completedFragments / totalFragments) * 100;
                const isCompleted = completionRate >= 100;
                
                articleProgress[articleName] = {
                  isCompleted,
                  bestScore,
                  completionRate,
                  lastAttempt: new Date(session.startTime || parsed.lastUpdated || Date.now()),
                  totalAttempts: session.progress 
                    ? session.progress.reduce((sum: number, p: any) => sum + (p.attempts?.length || 1), 0)
                    : 1
                };

                // Add to recent sessions
                recentSessions.push({
                  articleName,
                  articleTitle: session.articleTitle || articleName,
                  score: bestScore,
                  completionRate,
                  timestamp: new Date(session.startTime || parsed.lastUpdated || Date.now()),
                  fragments: totalFragments
                });

                // Calculate totals
                const sessionDuration = session.endTime 
                  ? (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / (1000 * 60)
                  : 10; // Default 10 minutes if no end time
                
                totalTimeSpent += sessionDuration;
                totalScore += bestScore;
                totalSessions++;
              }
            } catch (error) {
              console.warn(`Failed to parse progress for ${articleName}:`, error);
            }
          }
        });

        // Sort recent sessions by timestamp
        recentSessions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        const progressData: StudentProgressData = {
          totalArticlesAttempted: Object.keys(articleProgress).length,
          completedArticles: Object.keys(articleProgress).filter(key => articleProgress[key].isCompleted),
          averageScore: totalSessions > 0 ? totalScore / totalSessions : 0,
          totalTimeSpent,
          articleProgress,
          recentSessions: recentSessions.slice(0, 10),
          lastPracticed: recentSessions[0] ? {
            articleName: recentSessions[0].articleName,
            timestamp: recentSessions[0].timestamp
          } : undefined
        };

        setData(progressData);
      } catch (error) {
        console.error('Failed to load student progress:', error);
        // Set empty data on error
        setData({
          totalArticlesAttempted: 0,
          completedArticles: [],
          averageScore: 0,
          totalTimeSpent: 0,
          articleProgress: {},
          recentSessions: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProgressFromStorage();

    // Listen for localStorage changes to update progress in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('dictation_progress_')) {
        loadProgressFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { data, isLoading, error: null };
};