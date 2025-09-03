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
    // tighten: require non-empty, non-whitespace articleName
    enabled: enabled && !!articleName && articleName.trim().length > 0,
    staleTime: 0,
    // v5 signature: refetchInterval receives the Query object
    refetchInterval: (q: Query<AudioStatusResponse, Error, AudioStatusResponse, readonly unknown[]>) => {
      // stop polling entirely if the last fetch resulted in an error
      const hadError = !!q.state.error;
      if (hadError) return false;

      const d = q.state.data;
      const processing = d?.article?.status === 'processing';
      const ready = Boolean(d?.audio?.hasAudio && Array.isArray(d?.fragments) && d.fragments.length > 0);
      // poll every 5s only while processing and not yet fully ready
      return processing && !ready ? 5000 : false;
    },
    retry: (failureCount, err: any) => {
      const code = err?.response?.status;
      if (code === 403 || code === 404) {
        console.log('useAudioStatus: Not retrying on error code', code, err?.message);
        return false;
      }
      // at most 1 retry on network errors without a response code (often CORS/preflight)
      if (!code && (err?.message?.includes('Network Error') || err?.name === 'AxiosError')) {
        return failureCount < 1;
      }
      // otherwise cap at 2 retries
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
