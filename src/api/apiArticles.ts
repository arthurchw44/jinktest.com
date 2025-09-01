import type { AudioStatusResponse, FragmentTimingResponse, SignedAudioUrlResponse } from '../types/audio.types'
import api from './axios';

// Get audio status and timing information
export const apiGetAudioStatus = async (articleName: string): Promise<AudioStatusResponse> => {
  const { data } = await api.get<AudioStatusResponse>(`/articles/${articleName}/audio/status`)
  return data
}

// Get specific fragment timing
export const apiGetFragmentTiming = async (articleName: string, fragmentIndex: number): Promise<FragmentTimingResponse> => {
  const { data } = await api.get<FragmentTimingResponse>(`/articles/${articleName}/audio/fragment/${fragmentIndex}`)
  return data
}

// Get signed URL for audio file (30-minute expiry)
export const apiGetSignedAudioUrl = async (articleName: string): Promise<SignedAudioUrlResponse> => {
  const { data } = await api.get<SignedAudioUrlResponse>(`/articles/${articleName}/audio/url`)
  return data
}

// Generate audio with quality selection
export const apiGenerateAudio = async (articleName: string, quality: 'high' | 'medium' | 'low' = 'high') => {
  const { data } = await api.post(`/articles/${articleName}/generate-audio`, { quality })
  return data
}
