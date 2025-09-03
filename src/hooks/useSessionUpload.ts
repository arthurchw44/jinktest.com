import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axios';
import type { DictationSession } from '../types/dictation.types'
import { useAuth } from '../context/AuthContext';

// Match server payload expectations (normalize UI status -> API status)
type UploadStatus = 'pending' | 'correct' | 'given-up';

const toUploadStatus = (s: 'pending' | 'correct' | 'givenup'): UploadStatus => 
  s === 'givenup' ? 'given-up' : s;

interface SessionUploadData {
  sessionId: string;
  studentUsername: string;
  articleName: string;
  startTime: Date;
  endTime?: Date;
  fragmentProgress: Array<{
    fragmentIndex: number;
    attempts: Array<{
      attempt: string;
      score: number;
      timestamp: Date;
      isCorrect: boolean;
    }>;
    status: UploadStatus; // normalized
    bestScore: number;
    timeSpent: number;
  }>;
  totalScore: number; // 0-1 average over fragments
  completionRate: number; // 0-100
  totalTimeSpent: number; // seconds
  isCompleted: boolean;
}

export const useSessionUpload = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (session: DictationSession) => {
      // Compute derived fields that aren't present on DictationSession
      const totalFragments = session.fragments.length || 1;
      const avgScore = session.totalScore / totalFragments;
      const totalTimeSpent = session.progress.reduce((sum, p) => sum + p.timeSpent, 0);
      const completionRate = (session.completedFragments / totalFragments) * 100;

      // Build a stable sessionId
      const sessionId = `${user?.username ?? 'student'}-${session.articleName}-${session.startTime.getTime()}`;

      const payload: SessionUploadData = {
        sessionId,
        studentUsername: user?.username ?? 'unknown',
        articleName: session.articleName,
        startTime: session.startTime,
        endTime: new Date(), // derive at save-time
        fragmentProgress: session.progress.map(p => ({
          fragmentIndex: p.fragmentIndex,
          attempts: p.attempts.map(a => ({
            attempt: a.attempt,
            score: a.result.score,
            timestamp: a.timestamp,
            isCorrect: a.result.isPerfect,
          })),
          status: toUploadStatus(p.status), // normalize 'givenup' -> 'given-up'
          bestScore: p.bestScore,
          timeSpent: p.timeSpent,
        })),
        totalScore: avgScore,
        completionRate,
        totalTimeSpent,
        isCompleted: session.completedFragments === session.fragments.length,
      };

      const { data } = await api.post('/sessions/upload', payload);
      return data;
    },
    onSuccess: () => {
      // Invalidate student progress queries to trigger UI updates
      queryClient.invalidateQueries({ queryKey: ['student-progress'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-analytics'] });
      
      console.log('Session uploaded successfully and caches invalidated');
    },
    onError: (error) => {
      console.error('Failed to upload session to server:', error);
    }
  });
};

// Enhanced hook that provides both localStorage backup and server sync
export const useServerDictationProgress = (articleName: string) => {
  const uploadMutation = useSessionUpload();
  
  const saveSession = async (session: DictationSession) => {
    // Save to localStorage as backup (unchanged)
    const storageKey = `dictation-session-${articleName}`;
    localStorage.setItem(storageKey, JSON.stringify({
      session,
      lastUpdated: new Date().toISOString(),
      isCompleted: session.completedFragments === session.fragments.length,
    }));

    // Upload to server (pass raw session, the upload hook will handle normalization)
    try {
      await uploadMutation.mutateAsync(session);
    } catch (error) {
      console.error('Failed to upload session to server, but local backup saved:', error);
      // Local backup already saved above
    }
  };

  return {
    saveSession,
    isUploading: uploadMutation.isPending,
    error: uploadMutation.error
  };
};

