// // tests/integration/audioStatus.test.ts
// import React from 'react';
// import { render, screen, waitFor, fireEvent } from '@testing-library/react';        
// import { createTestArticle, mockApiResponse, mockApiError, mockApiSuccess } from '../testUtils';
// import ArticleDetail from '../../pages/teacher/ArticleDetail';      

// describe('Audio Status Real-Time Updates', () => {
  
//   test('Teacher sees real-time audio generation progress', async () => {
//     // 1. Setup: Create article in editing state
//     const article = await createTestArticle({ status: 'editing' });
    
//     // 2. Navigate to article detail page
//     render(<ArticleDetail />, { 
//       route: `/teacher/articles/${article.articleName}` 
//     });
    
//     // 3. Click generate audio button
//     const generateButton = screen.getByText('Generate Audio');
//     fireEvent.click(generateButton);
    
//     // 4. VERIFY: Button shows "Starting Generation..."
//     expect(screen.getByText('Starting Generation...')).toBeInTheDocument();
    
//     // 5. VERIFY: Status changes to processing
//     await waitFor(() => {
//       expect(screen.getByText('Generating Audio')).toBeInTheDocument();
//     });
    
//     // 6. VERIFY: Polling indicator appears
//     expect(screen.getByText('Checking status...')).toBeInTheDocument();
    
//     // 7. SIMULATE: Backend completes audio generation
//     mockApiResponse('/api/articles/test-article/audio/status', {
//       article: { status: 'ready' },
//       audio: { 
//         fullAudioUrl: 'https://example.com/audio.mp3',
//         totalFragments: 5,
//         totalDuration: 120
//       }
//     });
    
//     // 8. VERIFY: Status updates to ready (polling should detect this)
//     await waitFor(() => {
//       expect(screen.getByText('Audio Ready')).toBeInTheDocument();
//     }, { timeout: 10000 }); // Wait up to 10 seconds for polling
    
//     // 9. VERIFY: Audio preview appears
//     expect(screen.getByText('Preview Audio:')).toBeInTheDocument();
//     const audioElement = screen.getByRole('audio');
//     expect(audioElement).toHaveAttribute('src', 'https://example.com/audio.mp3');
//   });

//   test('Student sees processing status with real-time updates', async () => {
//     // 1. Setup: Article in processing state
//     const article = await createTestArticle({ status: 'processing' });
    
//     // 2. Navigate to dictation page
//     render(<DictationPracticePage />, { 
//       route: `/student/practice/${article.articleName}` 
//     });
    
//     // 3. VERIFY: Processing message appears
//     expect(screen.getByText('Audio Processing')).toBeInTheDocument();
//     expect(screen.getByText('This usually takes 2-3 minutes')).toBeInTheDocument();
    
//     // 4. VERIFY: Checking status indicator appears
//     await waitFor(() => {
//       expect(screen.getByText('Checking status...')).toBeInTheDocument();
//     });
    
//     // 5. SIMULATE: Audio generation completes
//     mockApiResponse('/api/articles/test-article/audio/status', {
//       article: { status: 'ready' },
//       audio: { fullAudioUrl: 'https://example.com/audio.mp3' },
//       fragments: [
//         { fragmentIndex: 0, text: 'Hello world', startTime: 0, endTime: 2, duration: 2 }
//       ]
//     });
    
//     // 6. VERIFY: Page transitions to dictation interface
//     await waitFor(() => {
//       expect(screen.getByText('Fragment 1 of 1')).toBeInTheDocument();
//     }, { timeout: 10000 });
//   });

//   test('Error states are handled gracefully', async () => {
//     // 1. Setup: Network error scenario
//     mockApiError('/api/articles/test-article/audio/status', 500, 'Server Error');
    
//     const article = await createTestArticle({ status: 'processing' });
    
//     // 2. Navigate to page
//     render(<DictationPracticePage />, { 
//       route: `/student/practice/${article.articleName}` 
//     });
    
//     // 3. VERIFY: Error state appears after retries
//     await waitFor(() => {
//       expect(screen.getByText('Unable to Load Exercise')).toBeInTheDocument();
//     }, { timeout: 15000 }); // Account for retry delays
    
//     // 4. VERIFY: Retry functionality
//     const tryAgainButton = screen.getByText('Try Again');
//     expect(tryAgainButton).toBeInTheDocument();
    
//     // 5. Test retry
//     mockApiSuccess('/api/articles/test-article/audio/status');
//     fireEvent.click(tryAgainButton);
    
//     // Should attempt to reload
//     expect(window.location.reload).toHaveBeenCalled();
//   });
// });
