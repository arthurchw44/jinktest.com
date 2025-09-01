// Audio status response from GET /api/articles/:articleName/audio/status
export interface AudioStatusResponse {
  success: boolean
  article: {
    articleName: string
    title: string
    status: 'editing' | 'processing' | 'ready' | 'error'
    processingError?: string
  }
  audio: {
    hasAudio: boolean
    hasTiming: boolean
    audioSize?: number
    totalFragments?: number
    totalDuration?: number
    fullAudioUrl: string | null
  }
  fragments?: FragmentTiming[]
}

// Fragment timing from audio generation
export interface FragmentTiming {
  fragmentIndex: number
  order: number
  text: string
  startTime: number
  endTime: number
  duration: number
  wordCount: number
}

// Fragment timing response from GET /api/articles/:articleName/audio/fragment/:idx
export interface FragmentTimingResponse {
  success: boolean
  fragment: FragmentTiming
  audioUrl: string
  playbackInfo: {
    startTime: number
    endTime: number
    duration: number
  }
}

// Signed URL response
export interface SignedAudioUrlResponse {
  success: boolean
  url: string
  expiresAt: string  // ISO8601
}
