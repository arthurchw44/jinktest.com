// import React, { useState, useCallback, useEffect } from 'react';
// import { useFragmentAudioPlayer } from '../../hooks/useFragmentAudioPlayer';
// import type { FragmentTiming } from '../../hooks/useFragmentAudioPlayer';
// import { compareTexts, isAnswerAcceptable } from '../../utils/dictationUtils';
// import type { ComparisonResult } from '../../types/article.types';
// import { useServerDictationProgress } from '../../hooks/useSessionUpload'; // Updated import

// export interface DictationAttempt {
//   attempt: string;
//   result: ComparisonResult;
//   timestamp: Date;
// }

// export interface FragmentProgress {
//   fragmentIndex: number;
//   attempts: DictationAttempt[];
//   status: 'pending' | 'correct' | 'givenup';
//   bestScore: number;
//   timeSpent: number; // seconds
// }

// export interface DictationSession {
//   articleName: string;
//   articleTitle: string; // add
//   fragments: FragmentTiming[];
//   progress: FragmentProgress[];
//   currentFragmentIndex: number;
//   startTime: Date;
//   endTime?: Date;  
//   completedFragments: number;
//   totalScore: number;
//   isCompleted: boolean; // add
// }

// interface FragmentDictationProps {
//   articleName: string;
//   articleTitle: string;
//   fullAudioUrl: string;
//   fragments: FragmentTiming[];
//   onSessionComplete?: (session: DictationSession) => void;
//   onProgressUpdate?: (progress: FragmentProgress[]) => void;
//   showText?: boolean;
//   allowGiveUp?: boolean;
//   savedSession?: DictationSession | null ;
// }

// const FragmentDictation: React.FC<FragmentDictationProps> = ({
//   articleName,
//   articleTitle,
//   fullAudioUrl,
//   fragments,
//   onSessionComplete,
//   onProgressUpdate,
//   showText = false,
//   allowGiveUp = true,
//   savedSession,
// }) => {

//   // Initialize current fragment from saved session
//   const [currentFragmentIndex, setCurrentFragmentIndex] = useState(() => {
//     if (savedSession && savedSession.progress.length > 0) {
//       // Find the first incomplete fragment
//       const incompleteIndex = savedSession.progress.findIndex(p => p.status === 'pending')
//       return incompleteIndex !== -1 ? incompleteIndex : savedSession.progress.length - 1
//     }
//     return 0
//   });

//     // Initialize session state with saved data
//   const [session, setSession] = useState<DictationSession>(() => {
//     if (savedSession) {
//       // Resume from saved session
//       return savedSession
//     }
//     // Create new session
//     return {
//       sessionId: `${articleName}-${Date.now()}`,
//       articleName,
//       articleTitle,
//       startTime: new Date(),
//       endTime: undefined,
//       fragments,
//       progress: fragments.map((fragment, index) => ({
//         fragmentIndex: index,
//         text: fragment.text,
//         attempts: [],
//         status: 'pending' as const,
//         bestScore: 0,
//         timeSpent: 0,
//       })),
//       currentFragmentIndex: 0,
//       completedFragments: 0,
//       totalScore: 0,
//     }
//   });

//   const { state: audioState, controls: audioControls } = useFragmentAudioPlayer(
//     fullAudioUrl,
//     fragments,
//     true // autoStopAtFragmentEnd
//   );

//   // Use the enhanced server sync hook
//   const { saveSession, isUploading, error: uploadError } = useServerDictationProgress(articleName);

//   // // Session state
//   // const [session, setSession] = useState<DictationSession>({
//   //   articleName,
//   //   articleTitle, // add
//   //   fragments,
//   //   progress: fragments.map((_fragment, index) => ({
//   //     fragmentIndex: index,
//   //     attempts: [],
//   //     status: 'pending',
//   //     bestScore: 0,
//   //     timeSpent: 0,
//   //   })),
//   //   currentFragmentIndex: 0,
//   //   startTime: new Date(),
//   //   completedFragments: 0,
//   //   totalScore: 0,
//   //   isCompleted: false, // add
//   // });

//   // Current fragment state
//   const [currentInput, setCurrentInput] = useState('');
//   const [lastComparison, setLastComparison] = useState<ComparisonResult | null>(null);
//   const [showAnswer, setShowAnswer] = useState(false);
//   const [fragmentStartTime, setFragmentStartTime] = useState<Date | null>(null);

//   const currentFragment = fragments[session.currentFragmentIndex];
//   const currentProgress = session.progress[session.currentFragmentIndex];
//   const isLastFragment = session.currentFragmentIndex === fragments.length - 1;
//   const canProceed = currentProgress.status === 'correct' || currentProgress.status === 'givenup';

//   // Auto-start timing when fragment changes
//   useEffect(() => {
//     setFragmentStartTime(new Date());
//     setCurrentInput('');
//     setLastComparison(null);
//     setShowAnswer(false);
//   }, [session.currentFragmentIndex]);

//   // Audio controls
//   const handlePlayFragment = useCallback(() => {
//     audioControls.seekToFragment(session.currentFragmentIndex);
//     audioControls.play();
//   }, [audioControls, session.currentFragmentIndex]);

//   const handleReplayFragment = useCallback(() => {
//     audioControls.replayCurrentFragment();
//   }, [audioControls]);

//   const handlePlaybackRateChange = useCallback((rate: number) => {
//     audioControls.setPlaybackRate(rate);
//   }, [audioControls]);

//   // Dictation logic
//   const handleConfirm = useCallback(() => {
//     if (!currentInput.trim() || !currentFragment) return;

//     const result = compareTexts(currentFragment.text, currentInput.trim());
//     const attempt: DictationAttempt = {
//       attempt: currentInput.trim(),
//       result,
//       timestamp: new Date(),
//     };

//     // Calculate time spent on this fragment
//     const timeSpent = fragmentStartTime ? 
//       Math.round((Date.now() - fragmentStartTime.getTime()) / 1000) : 0;

//     setSession(prev => {
//       const newProgress = [...prev.progress];
//       const fragmentProgress = newProgress[session.currentFragmentIndex];
      
//       fragmentProgress.attempts.push(attempt);
//       fragmentProgress.bestScore = Math.max(fragmentProgress.bestScore, result.score);
//       fragmentProgress.timeSpent += timeSpent;
      
//       if (isAnswerAcceptable(result)) {
//         fragmentProgress.status = 'correct';
//       }

//       const completedFragments = newProgress.filter(p => p.status !== 'pending').length;
//       const totalScore = newProgress.reduce((sum, p) => sum + p.bestScore, 0) / newProgress.length;

//       const updatedSession = {
//         ...prev,
//         progress: newProgress,
//         completedFragments,
//         totalScore,
//       };

//       // Notify parent of progress update
//       onProgressUpdate?.(newProgress);
      
//       return updatedSession;
//     });

//     setLastComparison(result);
//     setFragmentStartTime(new Date()); // Reset timer for potential retry
//   }, [currentInput, currentFragment, fragmentStartTime, session.currentFragmentIndex, onProgressUpdate]);

//   const handleGiveUp = useCallback(() => {
//     if (!allowGiveUp || !currentFragment) return;

//     // Calculate time spent
//     const timeSpent = fragmentStartTime ? 
//       Math.round((Date.now() - fragmentStartTime.getTime()) / 1000) : 0;

//     setSession(prev => {
//       const newProgress = [...prev.progress];
//       const fragmentProgress = newProgress[session.currentFragmentIndex];
      
//       fragmentProgress.status = 'givenup';
//       fragmentProgress.timeSpent += timeSpent;

//       const completedFragments = newProgress.filter(p => p.status !== 'pending').length;
//       const totalScore = newProgress.reduce((sum, p) => sum + p.bestScore, 0) / newProgress.length;

//       const updatedSession = {
//         ...prev,
//         progress: newProgress,
//         completedFragments,
//         totalScore,
//       };

//       onProgressUpdate?.(newProgress);
      
//       return updatedSession;
//     });

//     setShowAnswer(true);
//     setLastComparison(null);
//   }, [allowGiveUp, currentFragment, fragmentStartTime, session.currentFragmentIndex, onProgressUpdate]);

//   const handleNext = useCallback(async () => {
//     if (!canProceed) return;

//     if (isLastFragment) {
//       // Session complete - mark as completed and auto-upload
//       const completedSession: DictationSession = {
//         ...session,
//         isCompleted: true,
//       };
      
//       try {
//         // Auto-upload to server
//         await saveSession(completedSession);
//         console.log('Session completed and uploaded to server');
//       } catch (error) {
//         console.error('Failed to upload completed session:', error);
//         // Continue with session completion even if upload fails
//       }

//       onSessionComplete?.(completedSession);
//     } else {
//       // Move to next fragment
//       setSession(prev => ({
//         ...prev,
//         currentFragmentIndex: prev.currentFragmentIndex + 1,
//       }));
//     }
//   }, [canProceed, isLastFragment, session, onSessionComplete, saveSession]);

//   return (
//     <div className="max-w-4xl mx-auto p-6 space-y-6">
//       {/* Header */}
//       <div className="text-center border-b pb-4">
//         <h1 className="text-2xl font-bold text-gray-900 mb-2">{articleTitle}</h1>
//         <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
//           <span>Fragment {session.currentFragmentIndex + 1} of {fragments.length}</span>
//           <span>•</span>
//           <span>{session.completedFragments} completed</span>
//           <span>•</span>
//           <span>Score: {Math.round(session.totalScore * 100)}%</span>
//         </div>
        
//         {/* Upload Status Indicator */}
//         <div className="mt-2">
//           {isUploading && (
//             <span className="text-sm text-blue-600">💾 Saving progress...</span>
//           )}
//           {uploadError && (
//             <span className="text-sm text-red-600">⚠️ Sync failed (saved locally)</span>
//           )}
//           {!isUploading && !uploadError && session.completedFragments > 0 && (
//             <span className="text-sm text-green-600">✓ Progress saved</span>
//           )}
//         </div>
//       </div>

//       {/* Progress Bar */}
//       <div className="w-full bg-gray-200 rounded-full h-2">
//         <div 
//           className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
//           style={{ width: `${(session.completedFragments / fragments.length) * 100}%` }}
//         />
//       </div>

//       {/* Audio Controls */}
//       <div className="bg-white rounded-lg shadow-sm border p-6">
//         <h2 className="text-lg font-semibold mb-4">Audio Controls</h2>
//         <div className="flex items-center space-x-4 mb-4">
//           <button
//             onClick={handlePlayFragment}
//             disabled={audioState.isLoading || !audioState.canPlay}
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
//           >
//             {audioState.isPlaying ? '⏸️' : '▶️'} Play Fragment
//           </button>
          
//           <button
//             onClick={handleReplayFragment}
//             disabled={audioState.isLoading || !audioState.canPlay}
//             className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             🔄 Replay
//           </button>

//           {allowGiveUp && (
//             <button
//               onClick={handleGiveUp}
//               disabled={canProceed}
//               className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Show Answer
//             </button>
//           )}
//         </div>

//         {/* Attempt Count */}
//         {currentProgress.attempts.length > 0 && (
//           <div className="text-sm text-gray-600">
//             Attempts: {currentProgress.attempts.length}
//             {currentProgress.bestScore > 0 && (
//               <span className="ml-2">Best score: {Math.round(currentProgress.bestScore * 100)}%</span>
//             )}
//           </div>
//         )}

//         {/* Speed Control */}
//         <div className="flex items-center space-x-2">
//           <label className="text-sm text-gray-700">Speed:</label>
//           <input
//             type="range"
//             min="0.5"
//             max="1.5"
//             step="0.1"
//             value={audioState.playbackRate}
//             onChange={(e) => handlePlaybackRateChange(Number(e.target.value))}
//             className="w-20"
//           />
//           <span className="text-sm text-gray-600">{audioState.playbackRate}x</span>
//         </div>
//       </div>

//       {/* Audio Error */}
//       {audioState.error && (
//         <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
//           Error: {audioState.error}
//         </div>
//       )}

//       {/* Text Display (Optional) */}
//       {(showText || showAnswer) && (
//         <div className="bg-gray-50 rounded-lg p-4">
//           <p className="text-gray-800 text-center italic">{currentFragment.text}</p>
//         </div>
//       )}

//       {/* Input Section */}
//       <div className="bg-white rounded-lg shadow-sm border p-6">
//         <h2 className="text-lg font-semibold mb-4">Your Answer</h2>
//         <div className="space-y-4">
//           <textarea
//             value={currentInput}
//             onChange={(e) => setCurrentInput(e.target.value)}
//             placeholder="Type what you heard..."
//             disabled={canProceed}
//             className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
//           />
          
//           <div className="flex items-center space-x-3">
//             <button
//               onClick={handleConfirm}
//               disabled={!currentInput.trim() || canProceed}
//               className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Confirm Answer
//             </button>

//             {canProceed && (
//               <button
//                 onClick={handleNext}
//                 className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//               >
//                 {isLastFragment ? 'Complete Session' : 'Next Fragment'} →
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Feedback Section */}
//       {(lastComparison || showAnswer) && (
//         <div className="bg-white rounded-lg shadow-sm border p-6">
//           <h2 className="text-lg font-semibold mb-4">Feedback</h2>
          
//           {lastComparison && !isAnswerAcceptable(lastComparison) && (
//             <div className="space-y-3">
//               <div className="flex items-center space-x-2">
//                 <span className="text-red-600 text-lg">❌</span>
//                 <span className="text-red-700 font-medium">
//                   {lastComparison.correctTokens}/{lastComparison.totalTokens} words correct 
//                   ({Math.round(lastComparison.score * 100)}%)
//                 </span>
//               </div>
              
//               <div className="bg-red-50 p-3 rounded border">
//                 <p className="text-sm text-gray-700 mb-1"><strong>Hint:</strong></p>
//                 <p className="font-mono text-red-800 text-lg">{lastComparison.feedback}</p>
//               </div>
              
//               <p className="text-sm text-gray-600">
//                 Try again or click "Show Answer" if you need help.
//               </p>
//             </div>
//           )}

//           {lastComparison && isAnswerAcceptable(lastComparison) && (
//             <div className="flex items-center space-x-2">
//               <span className="text-green-600 text-lg">✅</span>
//               <span className="text-green-700 font-medium">
//                 Excellent! {Math.round(lastComparison.score * 100)}% accuracy
//               </span>
//             </div>
//           )}

//           {showAnswer && (
//             <div className="bg-blue-50 p-3 rounded border">
//               <p className="text-sm text-gray-700 mb-1"><strong>Correct Answer:</strong></p>
//               <p className="font-mono text-blue-800 text-lg">{currentFragment.text}</p>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default FragmentDictation;
