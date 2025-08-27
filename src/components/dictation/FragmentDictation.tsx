
// src/components/dictation/FragmentDictation.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { useFragmentAudioPlayer } from '../../hooks/useFragmentAudioPlayer';
import type { FragmentTiming } from '../../hooks/useFragmentAudioPlayer';
import { compareTexts, isAnswerAcceptable } from '../../utils/dictationUtils';
import type { ComparisonResult } from '../../types/article.types';

export interface DictationAttempt {
  attempt: string;
  result: ComparisonResult;
  timestamp: Date;
}

export interface FragmentProgress {
  fragmentIndex: number;
  attempts: DictationAttempt[];
  status: 'pending' | 'correct' | 'given_up';
  bestScore: number;
  timeSpent: number; // seconds
}

export interface DictationSession {
  articleName: string;
  fragments: FragmentTiming[];
  progress: FragmentProgress[];
  currentFragmentIndex: number;
  startTime: Date;
  completedFragments: number;
  totalScore: number;
}

interface FragmentDictationProps {
  articleName: string;
  articleTitle: string;
  fullAudioUrl: string;
  fragments: FragmentTiming[];
  onSessionComplete?: (session: DictationSession) => void;
  onProgressUpdate?: (progress: FragmentProgress[]) => void;
  showText?: boolean;
  allowGiveUp?: boolean;
}

const FragmentDictation: React.FC<FragmentDictationProps> = ({
  articleName,
  articleTitle,
  fullAudioUrl,
  fragments,
  onSessionComplete,
  onProgressUpdate,
  showText = false,
  allowGiveUp = true
}) => {
  const { state: audioState, controls: audioControls } = useFragmentAudioPlayer(
    fullAudioUrl,
    fragments,
    true // autoStopAtFragmentEnd
  );

  // Session state
  const [session, setSession] = useState<DictationSession>(() => ({
    articleName,
    fragments,
    progress: fragments.map((_fragment, index) => ({
      fragmentIndex: index,
      attempts: [],
      status: 'pending',
      bestScore: 0,
      timeSpent: 0
    })),
    currentFragmentIndex: 0,
    startTime: new Date(),
    completedFragments: 0,
    totalScore: 0
  }));

  // Current fragment state
  const [currentInput, setCurrentInput] = useState('');
  const [lastComparison, setLastComparison] = useState<ComparisonResult | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [fragmentStartTime, setFragmentStartTime] = useState<Date | null>(null);

  const currentFragment = fragments[session.currentFragmentIndex];
  const currentProgress = session.progress[session.currentFragmentIndex];
  const isLastFragment = session.currentFragmentIndex === fragments.length - 1;
  const canProceed = currentProgress.status === 'correct' || currentProgress.status === 'given_up';

  // Auto-start timing when fragment changes
  useEffect(() => {
    setFragmentStartTime(new Date());
    setCurrentInput('');
    setLastComparison(null);
    setShowAnswer(false);
  }, [session.currentFragmentIndex]);

  // Audio controls
  const handlePlayFragment = useCallback(() => {
    audioControls.seekToFragment(session.currentFragmentIndex);
    audioControls.play();
  }, [audioControls, session.currentFragmentIndex]);

  const handleReplayFragment = useCallback(() => {
    audioControls.replayCurrentFragment();
  }, [audioControls]);

  const handlePlaybackRateChange = useCallback((rate: number) => {
    audioControls.setPlaybackRate(rate);
  }, [audioControls]);

  // Dictation logic
  const handleConfirm = useCallback(() => {
    if (!currentInput.trim() || !currentFragment) return;

    const result = compareTexts(currentFragment.text, currentInput.trim());
    const attempt: DictationAttempt = {
      attempt: currentInput.trim(),
      result,
      timestamp: new Date()
    };

    // Calculate time spent on this fragment
    const timeSpent = fragmentStartTime 
      ? Math.round((Date.now() - fragmentStartTime.getTime()) / 1000)
      : 0;

    setSession(prev => {
      const newProgress = [...prev.progress];
      const fragmentProgress = newProgress[session.currentFragmentIndex];
      
      fragmentProgress.attempts.push(attempt);
      fragmentProgress.bestScore = Math.max(fragmentProgress.bestScore, result.score);
      fragmentProgress.timeSpent += timeSpent;

      if (isAnswerAcceptable(result)) {
        fragmentProgress.status = 'correct';
      }

      const completedFragments = newProgress.filter(p => p.status !== 'pending').length;
      const totalScore = newProgress.reduce((sum, p) => sum + p.bestScore, 0) / newProgress.length;

      const updatedSession = {
        ...prev,
        progress: newProgress,
        completedFragments,
        totalScore
      };

      // Notify parent of progress update
      onProgressUpdate?.(newProgress);

      return updatedSession;
    });

    setLastComparison(result);
    setFragmentStartTime(new Date()); // Reset timer for potential retry
  }, [currentInput, currentFragment, fragmentStartTime, session.currentFragmentIndex, onProgressUpdate]);

  const handleGiveUp = useCallback(() => {
    if (!allowGiveUp || !currentFragment) return;

    // Calculate time spent
    const timeSpent = fragmentStartTime 
      ? Math.round((Date.now() - fragmentStartTime.getTime()) / 1000)
      : 0;

    setSession(prev => {
      const newProgress = [...prev.progress];
      const fragmentProgress = newProgress[session.currentFragmentIndex];
      
      fragmentProgress.status = 'given_up';
      fragmentProgress.timeSpent += timeSpent;

      const completedFragments = newProgress.filter(p => p.status !== 'pending').length;
      const totalScore = newProgress.reduce((sum, p) => sum + p.bestScore, 0) / newProgress.length;

      const updatedSession = {
        ...prev,
        progress: newProgress,
        completedFragments,
        totalScore
      };

      onProgressUpdate?.(newProgress);
      return updatedSession;
    });

    setShowAnswer(true);
    setLastComparison(null);
  }, [allowGiveUp, currentFragment, fragmentStartTime, session.currentFragmentIndex, onProgressUpdate]);

  const handleNext = useCallback(() => {
    if (!canProceed) return;

    if (isLastFragment) {
      // Session complete
      onSessionComplete?.(session);
    } else {
      setSession(prev => ({
        ...prev,
        currentFragmentIndex: prev.currentFragmentIndex + 1
      }));
    }
  }, [canProceed, isLastFragment, session, onSessionComplete]);

  const handlePrevious = useCallback(() => {
    if (session.currentFragmentIndex > 0) {
      setSession(prev => ({
        ...prev,
        currentFragmentIndex: prev.currentFragmentIndex - 1
      }));
    }
  }, [session.currentFragmentIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
        // Allow normal typing in input fields
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          handleConfirm();
        }
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          audioControls.togglePlayback();
          break;
        case 'r':
          e.preventDefault();
          handleReplayFragment();
          break;
        case 'Enter':
          e.preventDefault();
          if (canProceed) {
            handleNext();
          } else {
            handleConfirm();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [audioControls, handleConfirm, handleNext, handleReplayFragment, canProceed]);

  if (!currentFragment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No fragments available</h2>
          <p className="text-gray-600">Please check the article configuration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{articleTitle}</h1>
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
          <span>Fragment {session.currentFragmentIndex + 1} of {fragments.length}</span>
          <span>•</span>
          <span>{session.completedFragments} completed</span>
          <span>•</span>
          <span>Score: {Math.round(session.totalScore * 100)}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(session.completedFragments / fragments.length) * 100}%` }}
        />
      </div>

      {/* Audio Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Audio Controls</h2>
        
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={handlePlayFragment}
            disabled={audioState.isLoading || !audioState.canPlay}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {audioState.isPlaying ? '⏸️' : '▶️'} Play Fragment
          </button>
          
          <button
            onClick={handleReplayFragment}
            disabled={audioState.isLoading || !audioState.canPlay}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🔄 Replay
          </button>

          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-700">Speed:</label>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={audioState.playbackRate}
              onChange={(e) => handlePlaybackRateChange(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-sm text-gray-600">{audioState.playbackRate}x</span>
          </div>
        </div>

        {audioState.error && (
          <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
            Error: {audioState.error}
          </div>
        )}
      </div>

      {/* Text Display (Optional) */}
      {showText && !showAnswer && (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-800 text-center italic">"{currentFragment.text}"</p>
        </div>
      )}

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-4">Your Answer</h2>
        
        <div className="space-y-4">
          <textarea
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            placeholder="Type what you heard..."
            disabled={canProceed}
            className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          />

          <div className="flex items-center space-x-3">
            <button
              onClick={handleConfirm}
              disabled={!currentInput.trim() || canProceed}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Answer
            </button>

            {allowGiveUp && (
              <button
                onClick={handleGiveUp}
                disabled={canProceed}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Show Answer
              </button>
            )}
          </div>

          {/* Attempt Count */}
          {currentProgress.attempts.length > 0 && (
            <div className="text-sm text-gray-600">
              Attempts: {currentProgress.attempts.length}
              {currentProgress.bestScore > 0 && (
                <span className="ml-2">• Best score: {Math.round(currentProgress.bestScore * 100)}%</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Feedback Section */}
      {(lastComparison || showAnswer) && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Feedback</h2>
          
          {lastComparison && !isAnswerAcceptable(lastComparison) && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-red-600 text-lg">❌</span>
                <span className="text-red-700 font-medium">
                  {lastComparison.correctTokens}/{lastComparison.totalTokens} words correct 
                  ({Math.round(lastComparison.score * 100)}%)
                </span>
              </div>
              
              <div className="bg-red-50 p-3 rounded border">
                <p className="text-sm text-gray-700 mb-1">Hint:</p>
                <p className="font-mono text-red-800 text-lg">{lastComparison.feedback}</p>
              </div>
              
              <p className="text-sm text-gray-600">
                Try again or click "Show Answer" if you need help.
              </p>
            </div>
          )}

          {lastComparison && isAnswerAcceptable(lastComparison) && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-green-600 text-lg">✅</span>
                <span className="text-green-700 font-medium">Perfect! Well done!</span>
              </div>
              
              <div className="bg-green-50 p-3 rounded border">
                <p className="font-medium text-green-800">"{currentFragment.text}"</p>
              </div>
            </div>
          )}

          {showAnswer && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-blue-600 text-lg">💡</span>
                <span className="text-blue-700 font-medium">Correct Answer:</span>
              </div>
              
              <div className="bg-blue-50 p-3 rounded border">
                <p className="font-medium text-blue-800">"{currentFragment.text}"</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <button
          onClick={handlePrevious}
          disabled={session.currentFragmentIndex === 0}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Press <kbd className="px-2 py-1 bg-gray-100 rounded">Space</kbd> to play/pause, 
            <kbd className="px-2 py-1 bg-gray-100 rounded ml-1">R</kbd> to replay
          </p>
        </div>

        <button
          onClick={handleNext}
          disabled={!canProceed}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLastFragment ? 'Finish' : 'Next'} →
        </button>
      </div>
    </div>
  );
};

export default FragmentDictation;
