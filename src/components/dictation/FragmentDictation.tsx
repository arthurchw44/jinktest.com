// Enhanced FragmentDictation Component with Robust Session Handling
// src/components/dictation/FragmentDictation.tsx

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { useFragmentAudioPlayer } from '../../hooks/useFragmentAudioPlayer'
import type { FragmentTiming } from '../../hooks/useFragmentAudioPlayer'
import { compareTexts, isAnswerAcceptable } from '../../utils/dictationUtils'
import type { ComparisonResult } from '../../types/article.types'
import { useServerDictationProgress } from '../../hooks/useServerDictationProgress'
import type { DictationAttempt, FragmentProgress, DictationSession } from '../../types/dictation.types'
import { 
  validateSavedSession, 
  migrateSession, 
  createFreshSession,
  type SessionValidationResult 
} from '../../utils/sessionValidation'

// ... existing interfaces (DictationAttempt, FragmentProgress, DictationSession) ...

interface FragmentDictationProps {
  articleName: string
  articleTitle: string
  fullAudioUrl: string
  fragments: FragmentTiming[]
  onSessionComplete?: (session: DictationSession) => void
  onProgressUpdate?: (progress: FragmentProgress[]) => void
  showText?: boolean
  allowGiveUp?: boolean
  savedSession?: DictationSession | null
}

const FragmentDictation: React.FC<FragmentDictationProps> = ({
  articleName,
  articleTitle,
  fullAudioUrl,
  fragments,
  onSessionComplete,
  onProgressUpdate,
  showText = false,
  allowGiveUp = true,
  savedSession,
}) => {
  // Enhanced session initialization with validation
  const [session, setSession] = useState<DictationSession>(() => {
    const validation = validateSavedSession(savedSession, fragments)
    
    if (validation.canRestore && savedSession) {
      console.log('Restoring valid saved session')
      return {
        ...savedSession,
        fragments, // Always use current fragments as source of truth
      }
    }
    
    if (validation.requiresMigration && savedSession) {
      console.log('Migrating saved session due to changes:', validation.issues)
      return migrateSession(savedSession, fragments)
    }
    
    console.log('Creating fresh session')
    return createFreshSession(articleName, articleTitle, fragments)
  })

  // Session validation state for UI feedback
  const [sessionValidation, setSessionValidation] = useState<SessionValidationResult | null>(null)

  // Enhanced audio player with fragment timing
  const { state: audioState, controls: audioControls } = useFragmentAudioPlayer(
    fullAudioUrl, 
    fragments, 
    true // autoStopAtFragmentEnd
  )

  // Server sync hook with enhanced error handling
  const { 
    saveSession, 
    syncStatus, 
    retrySyncFailed, 
    // getSyncInfo,
    // clearFailedSync 
  } = useServerDictationProgress(articleName)



  // Component state
  const [currentInput, setCurrentInput] = useState('')
  const [lastComparison, setLastComparison] = useState<ComparisonResult | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [fragmentStartTime, setFragmentStartTime] = useState<Date | null>(null)

  // Enhanced bounds checking for current fragment and progress
  const currentFragment = useMemo(() => {
    if (session.currentFragmentIndex < 0 || session.currentFragmentIndex >= fragments.length) {
      console.error(`Fragment index out of bounds: ${session.currentFragmentIndex} (max: ${fragments.length - 1})`)
      return fragments[0] || null
    }
    return fragments[session.currentFragmentIndex]
  }, [fragments, session.currentFragmentIndex])

  const currentProgress = useMemo(() => {
    if (session.currentFragmentIndex < 0 || session.currentFragmentIndex >= session.progress.length) {
      console.error(`Progress index out of bounds: ${session.currentFragmentIndex} (max: ${session.progress.length - 1})`)
      // Return a safe default progress object
      return {
        fragmentIndex: 0,
        attempts: [],
        status: 'pending' as const,
        bestScore: 0,
        timeSpent: 0,
      }
    }
    return session.progress[session.currentFragmentIndex]
  }, [session.progress, session.currentFragmentIndex])

  const isLastFragment = useMemo(() => {
    return session.currentFragmentIndex >= fragments.length - 1
  }, [session.currentFragmentIndex, fragments.length])

  const canProceed = useMemo(() => {
    return currentProgress.status === 'correct' || currentProgress.status === 'givenup'
  }, [currentProgress.status])

  // Session validation effect for UI feedback
  useEffect(() => {
    if (savedSession) {
      const validation = validateSavedSession(savedSession, fragments)
      setSessionValidation(validation)
    }
  }, [savedSession, fragments])

  // Auto-start timing when fragment changes
  useEffect(() => {
    setFragmentStartTime(new Date())
    setCurrentInput('')
    setLastComparison(null)
    setShowAnswer(false)
  }, [session.currentFragmentIndex])

  // Audio controls
  const handlePlayFragment = useCallback(() => {
    if (session.currentFragmentIndex >= 0 && session.currentFragmentIndex < fragments.length) {
      audioControls.seekToFragment(session.currentFragmentIndex)
      audioControls.play()
    }
  }, [audioControls, session.currentFragmentIndex, fragments.length])

  const handleReplayFragment = useCallback(() => {
    audioControls.replayCurrentFragment()
  }, [audioControls])

  const handlePlaybackRateChange = useCallback((rate: number) => {
    audioControls.setPlaybackRate(rate)
  }, [audioControls])

  // Enhanced dictation logic with comprehensive error handling
  const handleConfirm = useCallback(async () => {
    if (!currentInput.trim() || !currentFragment) return

    const result = compareTexts(currentFragment.text, currentInput.trim())
    const attempt: DictationAttempt = {
      attempt: currentInput.trim(),
      result,
      timestamp: new Date(),
    }

    // Calculate time spent on this fragment
    const timeSpent = fragmentStartTime 
      ? Math.round((Date.now() - fragmentStartTime.getTime()) / 1000) 
      : 0

    setSession(prev => {
      const newProgress = [...prev.progress]
      const fragmentProgress = newProgress[session.currentFragmentIndex]
      
      if (!fragmentProgress) {
        console.error('Fragment progress not found for index:', session.currentFragmentIndex)
        return prev
      }

      fragmentProgress.attempts.push(attempt)
      fragmentProgress.bestScore = Math.max(fragmentProgress.bestScore, result.score)
      fragmentProgress.timeSpent += timeSpent

      if (isAnswerAcceptable(result)) {
        fragmentProgress.status = 'correct'
      }

      const completedFragments = newProgress.filter(p => p.status !== 'pending').length
      const totalScore = newProgress.reduce((sum, p) => sum + p.bestScore, 0) / newProgress.length

      const updatedSession = {
        ...prev,
        progress: newProgress,
        completedFragments,
        totalScore,
      }

      // Auto-save progress after each attempt
      saveSession(updatedSession).catch(error => {
        console.error('Failed to auto-save progress:', error)
      })

      // Notify parent of progress update
      onProgressUpdate?.(newProgress)

      return updatedSession
    })

    setLastComparison(result)
    setFragmentStartTime(new Date()) // Reset timer for potential retry
  }, [
    currentInput, 
    currentFragment, 
    fragmentStartTime, 
    session.currentFragmentIndex, 
    saveSession,
    onProgressUpdate
  ])

  // Enhanced give up logic
  const handleGiveUp = useCallback(async () => {
    if (!allowGiveUp || !currentFragment) return

    const timeSpent = fragmentStartTime 
      ? Math.round((Date.now() - fragmentStartTime.getTime()) / 1000) 
      : 0

    setSession(prev => {
      const newProgress = [...prev.progress]
      const fragmentProgress = newProgress[session.currentFragmentIndex]
      
      if (!fragmentProgress) {
        console.error('Fragment progress not found for index:', session.currentFragmentIndex)
        return prev
      }

      fragmentProgress.status = 'givenup'
      fragmentProgress.timeSpent += timeSpent

      const completedFragments = newProgress.filter(p => p.status !== 'pending').length
      const totalScore = newProgress.reduce((sum, p) => sum + p.bestScore, 0) / newProgress.length

      const updatedSession = {
        ...prev,
        progress: newProgress,
        completedFragments,
        totalScore,
      }

      // Auto-save progress
      saveSession(updatedSession).catch(error => {
        console.error('Failed to auto-save progress:', error)
      })

      onProgressUpdate?.(newProgress)
      return updatedSession
    })

    setShowAnswer(true)
    setLastComparison(null)
  }, [
    allowGiveUp, 
    currentFragment, 
    fragmentStartTime, 
    session.currentFragmentIndex,
    saveSession,
    onProgressUpdate
  ])

  // Enhanced navigation with comprehensive validation
  const handleNext = useCallback(async () => {
    if (!canProceed) return

    const nextIndex = session.currentFragmentIndex + 1
    const isSessionComplete = nextIndex >= fragments.length

    if (isSessionComplete) {
      // Session completion with proper validation
      const completedSession: DictationSession = {
        ...session,
        isCompleted: true,
        endTime: new Date(),
        currentFragmentIndex: Math.max(0, fragments.length - 1), // Ensure valid index
      }

      try {
        await saveSession(completedSession)
        console.log('Session completed and saved successfully')
        onSessionComplete?.(completedSession)
      } catch (error) {
        console.error('Failed to save completed session:', error)
        // Still call completion callback even if save fails
        onSessionComplete?.(completedSession)
      }
    } else {
      // Move to next fragment with bounds checking
      const validNextIndex = Math.min(nextIndex, fragments.length - 1)
      setSession(prev => ({
        ...prev,
        currentFragmentIndex: validNextIndex,
      }))
    }
  }, [
    canProceed, 
    session, 
    fragments.length, 
    saveSession, 
    onSessionComplete
  ])

  const handlePrevious = useCallback(() => {
    if (session.currentFragmentIndex > 0) {
      setSession(prev => ({
        ...prev,
        currentFragmentIndex: prev.currentFragmentIndex - 1,
      }))
    }
  }, [session.currentFragmentIndex])

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in input fields
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
        // Allow normal typing in input fields
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault()
          handleConfirm()
        }
        return
      }

      switch (e.key) {
        case ' ':
          e.preventDefault()
          audioControls.togglePlayback()
          break
        case 'r':
          e.preventDefault()
          handleReplayFragment()
          break
        case 'Enter':
          e.preventDefault()
          if (canProceed) {
            handleNext()
          } else {
            handleConfirm()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [audioControls, handleConfirm, handleNext, handleReplayFragment, canProceed])

  // Show error if no fragments or invalid session
  if (!currentFragment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No fragments available
          </h2>
          <p className="text-gray-600">
            Please check the article configuration or try refreshing the page.
          </p>
          {sessionValidation && sessionValidation.issues.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-700 text-sm font-medium">Session Issues:</p>
              <ul className="text-red-600 text-xs mt-1">
                {sessionValidation.issues.map((issue, idx) => (
                  <li key={idx}>• {issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    )
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

        {/* Enhanced sync status indicator */}
        <div className="mt-2">
          {syncStatus.isUploading && (
            <div className="flex items-center justify-center space-x-2 text-sm text-blue-600">
              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Saving progress...</span>
            </div>
          )}
          {syncStatus.error && (
            <div className="flex items-center justify-center space-x-2 text-sm text-orange-600">
              <span>⚠️</span>
              <span>Saved locally (sync pending)</span>
              <button 
                onClick={retrySyncFailed}
                className="text-orange-700 underline hover:no-underline text-xs"
              >
                retry
              </button>
            </div>
          )}
          {!syncStatus.isUploading && !syncStatus.error && syncStatus.lastSyncAttempt && (
            <div className="flex items-center justify-center space-x-1 text-sm text-green-600">
              <span>✓</span>
              <span>Progress saved</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
          style={{ width: `${(session.completedFragments / fragments.length) * 100}%` }}
        />
      </div>

      {/* ... Rest of the component UI remains the same but with enhanced error handling ... */}
      
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

        {/* Speed Control */}
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-700">Speed</label>
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

        {/* Attempt Count */}
        {currentProgress.attempts.length > 0 && (
          <div className="text-sm text-gray-600 mt-2">
            Attempts: {currentProgress.attempts.length}
            {currentProgress.bestScore > 0 && (
              <span className="ml-2">Best score: {Math.round(currentProgress.bestScore * 100)}%</span>
            )}
          </div>
        )}

        {/* Audio Error */}
        {audioState.error && (
          <div className="text-red-600 text-sm bg-red-50 p-2 rounded mt-2">
            Error: {audioState.error}
          </div>
        )}
      </div>

      {/* Text Display (Optional) */}
      {(showText && !showAnswer) && (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-800 text-center italic">{currentFragment.text}</p>
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

            {canProceed && (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {isLastFragment ? 'Complete Session' : 'Next Fragment'}
              </button>
            )}
          </div>
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
                <p className="text-sm text-gray-700 mb-1"><strong>Hint:</strong></p>
                <p className="font-mono text-red-800 text-lg">{lastComparison.feedback}</p>
              </div>
              <p className="text-sm text-gray-600">
                Try again or click "Show Answer" if you need help.
              </p>
            </div>
          )}

          {lastComparison && isAnswerAcceptable(lastComparison) && (
            <div className="flex items-center space-x-2">
              <span className="text-green-600 text-lg">✅</span>
              <span className="text-green-700 font-medium">
                Excellent! {Math.round(lastComparison.score * 100)}% accuracy
              </span>
            </div>
          )}

          {showAnswer && (
            <div className="bg-blue-50 p-3 rounded border">
              <p className="text-sm text-gray-700 mb-1"><strong>Correct Answer:</strong></p>
              <p className="font-mono text-blue-800 text-lg">{currentFragment.text}</p>
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
          Previous
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
          {isLastFragment ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  )
}

export default FragmentDictation