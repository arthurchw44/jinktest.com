
// Enhanced DictationPracticePage Integration
// src/pages/student/DictationPracticePage.tsx (Updated sections)

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useArticle } from '../../hooks/useArticles'
import { useDictationProgress } from '../../hooks/useDictationProgress'
import { useAudioStatus } from '../../hooks/useAudioStatus'
import FragmentDictation from '../../components/dictation/FragmentDictation'
import SessionResults from '../../components/dictation/SessionResults'
import SessionRecoveryPrompt from '../../components/dictation/SessionRecoveryPrompt'
// import { SyncStatusIndicator } from '../../components/dictation/SyncStatusIndicator'
import { validateSavedSession } from '../../utils/sessionValidation'
import type { DictationSession } from '../../types/dictation.types';
import type { SessionValidationResult } from '../../utils/sessionValidation'

type ViewMode = 'loading' | 'recovery' | 'practice' | 'results'

const DictationPracticePage: React.FC = () => {
  const { articleName } = useParams<{ articleName: string }>()
  const navigate = useNavigate()
  
  // View state management
  const [currentView, setCurrentView] = useState<ViewMode>('loading')
  const [completedSession, setCompletedSession] = useState<DictationSession | null>(null)
  const [userChoice, setUserChoice] = useState<'restore' | 'fresh' | null>(null)

  // Data hooks
  const { data: article, isLoading: articleLoading, error: articleError } = useArticle(articleName!)
  const { data: audioStatus, isLoading: audioLoading } = useAudioStatus(
    articleName!, 
    !!article && (article.status === 'processing' || article.status === 'ready')
  )
  const { savedSession, isLoading: sessionLoading } = useDictationProgress(articleName!)

  // Session validation
  const [sessionValidation, setSessionValidation] = useState<SessionValidationResult | null>(null)

  // Validate saved session when data is ready
  useEffect(() => {
    // if (article?.fragments && savedSession) {
    //   const validation = validateSavedSession(savedSession, audioStatus?.fragments || [])
    //   setSessionValidation(validation)
      
    //   if (validation.canRestore || validation.requiresMigration) {
    //     setCurrentView('recovery')
    //   } else {
    //     setCurrentView('practice')
    //   }
    // } else if (article?.fragments && !savedSession && !sessionLoading) {
    //   setCurrentView('practice')
    // }

    if (audioStatus?.fragments && audioStatus.fragments.length > 0 && savedSession) {
      const validation = validateSavedSession(savedSession, audioStatus.fragments)
      setSessionValidation(validation)
      setCurrentView(validation.canRestore || validation.requiresMigration ? 'recovery' : 'practice')
    } else if (audioStatus?.fragments && audioStatus.fragments.length > 0 && !savedSession && !sessionLoading) {
      setCurrentView('practice')
    }

  }, [article, savedSession, audioStatus, sessionLoading])

  // Session completion handler
  const handleSessionComplete = (session: DictationSession) => {
    setCompletedSession(session)
    setCurrentView('results')
  }

  // Recovery choice handlers
  const handleRestoreSession = () => {
    setUserChoice('restore')
    setCurrentView('practice')
  }

  const handleStartFresh = () => {
    setUserChoice('fresh')
    setCurrentView('practice')
  }

  // Navigation handlers
  const handlePracticeAgain = () => {
    setCompletedSession(null)
    setUserChoice('fresh')
    setCurrentView('practice')
  }

  const handleBackToArticles = () => {
    navigate('/student/articles')
  }

  // Loading state
  if (articleLoading || sessionLoading || audioLoading || currentView === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading practice session...</p>
        </div>
      </div>
    )
  }

  // Error states
  if (articleError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 mb-4 text-4xl">❌</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Unable to Load Article</h2>
          <p className="text-gray-600 mb-4">{(articleError as Error).message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // if (loadError) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-center max-w-md mx-auto p-6">
  //         <div className="text-yellow-600 mb-4 text-4xl">⚠️</div>
  //         <h2 className="text-2xl font-semibold text-gray-900 mb-2">Session Load Error</h2>
  //         <p className="text-gray-600 mb-4">{loadError}</p>
  //         <button 
  //           onClick={handleStartFresh}
  //           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
  //         >
  //           Start Fresh Session
  //         </button>
  //       </div>
  //     </div>
  //   )
  // }

  // Audio not ready
  if (!audioStatus?.audio?.hasAudio || !audioStatus?.fragments?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-yellow-600 mb-4 text-4xl">🔊</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Audio Not Available</h2>
          <p className="text-gray-600 mb-4">
            This article doesn't have audio available yet. Please try another article or check back later.
          </p>
          <button 
            onClick={handleBackToArticles}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Articles
          </button>
        </div>
      </div>
    )
  }

  // Render based on current view
  switch (currentView) {
    case 'recovery':
      return (
        <div className="max-w-4xl mx-auto p-6">
          <SessionRecoveryPrompt
            validation={sessionValidation!}
            articleTitle={article!.title}
            savedSessionInfo={{
              lastUpdated: savedSession!.startTime,
              completedFragments: savedSession!.completedFragments,
              totalFragments: savedSession!.fragments.length,
            }}
            onRestore={handleRestoreSession}
            onStartFresh={handleStartFresh}
          />
        </div>
      )

    case 'results':
      return (
        <SessionResults
          session={completedSession!}
          onRetry={handlePracticeAgain}
          onReturnToList={handleBackToArticles}
        />
      )

    case 'practice':

      const fullAudioUrl = audioStatus?.audio?.fullAudioUrl ?? ''
      return (
        <FragmentDictation
          articleName={article!.articleName}
          articleTitle={article!.title}
          fullAudioUrl={fullAudioUrl}
          fragments={audioStatus.fragments}
          onSessionComplete={handleSessionComplete}
          savedSession={userChoice === 'restore' ? savedSession : null}
          showText={false}
          allowGiveUp={true}
        />
      )

    default:
      return null
  }
}

export default DictationPracticePage