import { useQuery } from '@tanstack/react-query';
import {
  apiGetStudentProgress,
  apiGetStudentArticleProgress,
} from '../api/apiSessions';
import type {
  StudentOverallProgress,
  StudentArticleProgress,
} from '../api/apiSessions';

// Small utility to coerce unknown values to a valid Date (or a safe epoch)
const toDateOrEpoch = (value: unknown): Date => {
  const d = new Date(value as any);
  return isNaN(d.getTime()) ? new Date(0) : d;
};

// Normalize server overall progress: ensure all timestamps are Date objects
const normalizeOverall = (
  p: StudentOverallProgress | null
): StudentOverallProgress | null => {
  if (!p) return null;
  const recentSessions = (p.recentSessions ?? []).map((s) => ({
    ...s,
    // Server sends ISO strings; coerce to Date for UI formatting
    timestamp: toDateOrEpoch(s.timestamp),
  }));
  return { ...p, recentSessions };
};

// Normalize server article progress: ensure lastPracticed is a Date
const normalizeArticle = (
  p: StudentArticleProgress | null
): StudentArticleProgress | null => {
  if (!p) return null;
  return {
    ...p,
    // Server sends ISO strings; coerce to Date for UI formatting
    lastPracticed: toDateOrEpoch((p as any).lastPracticed),
  };
};

// Overall student progress with server-first, localStorage fallback
export const useStudentProgress = () => {
  return useQuery<StudentOverallProgress | null, Error>({
    queryKey: ['student-progress'],
    queryFn: async () => {
      try {
        const resp = await apiGetStudentProgress();
        return normalizeOverall(resp);
      } catch (error: any) {
        console.warn(
          'Server progress failed, using localStorage fallback:',
          error?.message
        );
        return getLocalStorageProgress();
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 404 (no progress yet) or 403 (auth issues)
      if (error?.response?.status === 404 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Article-specific progress (normalized)
export const useStudentArticleProgress = (articleName: string) => {
  return useQuery<StudentArticleProgress | null, Error>({
    queryKey: ['student-progress', articleName],
    queryFn: async () => {
      const resp = await apiGetStudentArticleProgress(articleName);
      return normalizeArticle(resp);
    },
    enabled: !!articleName,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Fallback function to read from localStorage (keeps Date objects consistent)
const getLocalStorageProgress = (): StudentOverallProgress | null => {
  try {
    const allKeys = Object.keys(localStorage);
    const progressKeys = allKeys.filter((key) =>
      key.startsWith('dictation-progress-')
    );

    if (progressKeys.length === 0) return null;

    let totalArticles = 0;
    let completedArticles = 0;
    let totalScore = 0;
    let totalSessions = 0;
    const recentSessions: Array<{
      articleName: string;
      score: number;
      completionRate: number;
      timestamp: Date;
    }> = [];

    progressKeys.forEach((key) => {
      const articleName = key.replace('dictation-progress-', '');
      const progressData = localStorage.getItem(key);

      if (!progressData) return;

      try {
        const parsed = JSON.parse(progressData);
        const session = parsed.session || parsed;

        totalArticles += 1;

        const fragments = Array.isArray(session.fragments)
          ? session.fragments
          : [];
        const completedFragments = session.completedFragments || 0;
        const completionRate =
          (completedFragments / Math.max(1, fragments.length)) * 100;

        if (completionRate >= 80) completedArticles += 1;

        const bestScore = Array.isArray(session.progress)
          ? Math.max(...session.progress.map((p: any) => p?.bestScore || 0))
          : session.bestScore || 0;

        totalScore += bestScore;
        totalSessions += 1;

        // Normalize timestamp to Date consistently for UI use
        const tsCandidate =
          session.startTime || parsed.lastUpdated || Date.now();
        recentSessions.push({
          articleName,
          score: bestScore,
          completionRate,
          timestamp: toDateOrEpoch(tsCandidate),
        });
      } catch (err) {
        console.warn(`Failed to parse progress for ${articleName}:`, err);
      }
    });

    return normalizeOverall({
      studentUsername: 'local-user',
      totalArticlesAttempted: totalArticles,
      completedArticles,
      averageScore: totalSessions > 0 ? totalScore / totalSessions : 0,
      totalTimeSpent: 0, // Not accurately derivable from localStorage
      recentSessions: recentSessions.slice(0, 5),
      improvementTrend: 'stable',
    });
  } catch (error) {
    console.error('Failed to load localStorage progress:', error);
    return null;
  }
};
