import type { AudioStatusResponse } from '../types/audio.types'

export const validateAudioStatusResponse = (response: any): response is AudioStatusResponse => {
  if (process.env.NODE_ENV !== 'development') return true
  
  try {
    // Check required structure
    if (!response.success || typeof response.success !== 'boolean') {
      console.warn('AudioStatusResponse: missing or invalid success field')
      return false
    }
    
    if (!response.article || typeof response.article.articleName !== 'string') {
      console.warn('AudioStatusResponse: missing or invalid article.articleName')
      return false
    }
    
    if (!['editing', 'processing', 'ready', 'error'].includes(response.article.status)) {
      console.warn('AudioStatusResponse: invalid article.status', response.article.status)
      return false
    }
    
    if (!response.audio || typeof response.audio.hasAudio !== 'boolean') {
      console.warn('AudioStatusResponse: missing or invalid audio.hasAudio')
      return false
    }
    
    return true
  } catch (error) {
    console.warn('AudioStatusResponse validation failed:', error)
    return false
  }
}
