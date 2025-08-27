// Add to existing error handling
export const handleAudioError = (error: Error) => {
  console.error('Audio playback error:', error);
  
  // Add user-friendly error messages
  if (error.message.includes('CORS')) {
    return 'Audio file cannot be loaded due to security restrictions';
  }
  
  if (error.message.includes('network')) {
    return 'Network error - please check your connection';
  }
  
  return 'Audio playback failed - please try again';
};