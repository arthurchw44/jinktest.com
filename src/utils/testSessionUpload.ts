import type { DictationSession, FragmentProgress } from '../types/dictation.types';
import type { FragmentTiming } from '../hooks/useFragmentAudioPlayer';

// Mock session data for testing
export const createMockSession = (articleName: string = 'test-article'): DictationSession => {
  const mockFragments: FragmentTiming[] = [
    {
      fragmentIndex: 0,
      order: 1,
      text: 'Climate change affects global weather patterns.',
      startTime: 0.0,
      endTime: 3.2,
      duration: 3.2,
      wordCount: 6,
    },
    {
      fragmentIndex: 1,
      order: 2,
      text: 'Rising temperatures cause ice caps to melt.',
      startTime: 3.5,
      endTime: 6.8,
      duration: 3.3,
      wordCount: 7,
    },
  ];

  const mockProgress: FragmentProgress[] = [
    {
      fragmentIndex: 0,
      attempts: [
        {
          attempt: 'Climate change affects global weather patterns.',
          result: {
            score: 1.0,
            totalTokens: 6,
            correctTokens: 6,
            feedback: 'Perfect!',
            isPerfect: true,
            tokenDiffs: []
          },
          timestamp: new Date(Date.now() - 120000), // 2 minutes ago
        }
      ],
      status: 'correct',
      bestScore: 1.0,
      timeSpent: 45, // seconds
    },
    {
      fragmentIndex: 1,
      attempts: [
        {
          attempt: 'Rising temperatures cause ice caps to melt.',
          result: {
            score: 1.0,
            totalTokens: 7,
            correctTokens: 7,
            feedback: 'Excellent!',
            isPerfect: true,
            tokenDiffs: []
          },
          timestamp: new Date(Date.now() - 60000), // 1 minute ago
        }
      ],
      status: 'correct',
      bestScore: 1.0,
      timeSpent: 38, // seconds
    },
  ];

  return {
    articleName,
    articleTitle: 'Climate Change Impact',
    fragments: mockFragments,
    progress: mockProgress,
    currentFragmentIndex: 2, // Completed
    startTime: new Date(Date.now() - 180000), // 3 minutes ago
    completedFragments: 2,
    totalScore: 1.0,
    isCompleted: true,
  };
};

// Test function to verify upload flow
export const testSessionUpload = async () => {
  const session = createMockSession('climate-change-test');
  
  console.log('Testing session upload with mock data:', session);
  
  try {
    // This would be called in your actual component
    const { useServerDictationProgress } = await import('../hooks/useSessionUpload');
    const { saveSession } = useServerDictationProgress(session.articleName);
    
    await saveSession(session);
    console.log('✅ Session upload test successful');
    
    return true;
  } catch (error) {
    console.error('❌ Session upload test failed:', error);
    return false;
  }
};
