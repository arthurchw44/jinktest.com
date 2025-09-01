// src/hooks/useAudioStatus.ts
import { useQuery, type UseQueryResult, type Query } from '@tanstack/react-query';
import { apiGetAudioStatus } from '../api/apiArticles';
import type { AudioStatusResponse } from '../types/audio.types';

export const useAudioStatus = (
  articleName: string,
  enabled: boolean = true
): UseQueryResult<AudioStatusResponse, Error> => {
  return useQuery<AudioStatusResponse, Error, AudioStatusResponse, readonly unknown[]>({
    queryKey: ['audioStatus', articleName],
    queryFn: () => apiGetAudioStatus(articleName),
    enabled: enabled && !!articleName,
    staleTime: 0,
    // v5 signature: refetchInterval receives the Query object, not the data value
    refetchInterval: (q: Query<AudioStatusResponse, Error, AudioStatusResponse, readonly unknown[]>) => {
      const last = q.state.data; // AudioStatusResponse | undefined
      const status = last?.article?.status; // 'editing' | 'processing' | 'ready' | 'error'
      return status === 'processing' ? 5000 : false;
    },
    retry: (failureCount, err: any) => {
      const code = err?.response?.status;
      if (code === 403 || code === 404) 
      {
        console.log('useAudioStatus: Not retrying on error code', code, err?.message);
        return false;
      }
      else
      {
        console.log('useAudioStatus: Retrying after error code', code, err?.message);
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
