// src/hooks/useMyProgressMap.ts
import { useQuery } from '@tanstack/react-query';
import { apiGetStudentArticleProgress } from '../api/apiSessions';
import type { ArticleProgress } from '../types/progress.types';

export const useMyProgressMap = (articleNames: string[]) => {
  const key = ['student-progress-map', [...articleNames].sort().join('|')];

  return useQuery<Record<string, ArticleProgress>, Error>({
    queryKey: key,
    enabled: articleNames.length > 0,
    staleTime: 30_000,
    queryFn: async () => {
      const pairs = await Promise.all(
        articleNames.map(async (name) => {
          try {
            const p = await apiGetStudentArticleProgress(name);
            if (!p) return [name, undefined] as const;

            const lastAttempt = p.lastPracticed ? new Date(p.lastPracticed) : new Date(0);

            return [
              name,
              {
                isCompleted: (p.completionRate ?? 0) >= 100,
                bestScore: p.bestScore ?? 0,
                completionRate: p.completionRate ?? 0,
                lastAttempt,              // always Date
                totalAttempts: p.totalAttempts ?? 0,
              } as ArticleProgress,
            ] as const;
          } catch {
            return [name, undefined] as const;
          }
        })
      );

      const map: Record<string, ArticleProgress> = {};
      for (const [name, val] of pairs) if (val) map[name] = val;
      return map;
    },
  });
};
