// src/pages/student/DictationPractice.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useArticle } from '../../hooks/useArticles';
import { useDictationProgress } from '../../hooks/useDictationProgress';
import FragmentDictation from '../../components/dictation/FragmentDictation';
import type { DictationSession, FragmentProgress } from '../../components/dictation/FragmentDictation';
import SessionResults from '../../components/dictation/SessionResults';
import {LoadingSpinner} from '../../components/common/LoadingSpinner';
import type { FragmentTiming } from '../../hooks/useFragmentAudioPlayer';


type ViewMode = 'loading' | 'practice' | 'results' | 'resume';

const DictationPracticePage: React.FC = () => {
  const { articleName } = useParams<{ articleName: string }>();
  const navigate = useNavigate();
  
  const { data: article, isLoading: articleLoading, error: articleError } = useArticle(articleName!);
  const { 
    savedSession, 
    isLoading: progressLoading, 
    saveSession, 
    clearSession 
  } = useDictationProgress(articleName!);

  const [currentView, setCurrentView] = useState<ViewMode>('loading');
  const [completedSession, setCompletedSession] = useState<DictationSession | null>(null);

  // Determine initial view once data is loaded
  useEffect(() => {
    if (articleLoading || progressLoading) {
      setCurrentView('loading');
      return;
    }

    if (articleError || !article) {
      navigate('/student/articles', { replace: true });
      return;
    }

    // Check if there's a saved session to resume
    if (savedSession && savedSession.completedFragments < savedSession.fragments.length) {
      setCurrentView('resume');
    } else if (savedSession && savedSession.completedFragments === savedSession.fragments.length) {
      // Session was already completed
      setCompletedSession(savedSession);
      setCurrentView('results');
    } else {
      // Start new session
      setCurrentView('practice');
    }
  }, [article, articleLoading, articleError, savedSession, progressLoading, navigate]);

  // Convert article sentences to fragment timing format
  const convertToFragmentTiming = (article: any): FragmentTiming[] => {
    if (!article?.sentences) return [];

    return article.sentences.map((sentence: any, index: number) => ({
      fragmentIndex: index,
      order: sentence.order || index + 1,
      text: sentence.text,
      startTime: sentence.startTime || 0,
      endTime: sentence.endTime || 0,
      duration: sentence.endTime - sentence.startTime || 0,
      wordCount: sentence.wordCount || sentence.text.split(' ').length
    }));
  };

  const handleSessionComplete = (session: DictationSession) => {
    saveSession(session);
    setCompletedSession(session);
    setCurrentView('results');
  };

const handleProgressUpdate = (progress: FragmentProgress[]) => {
// If you want to persist the whole session on every update,
// either lift state up or pass a session object down from FragmentDictation.
// For now, you can no-op or, better, keep partial progress somewhere.
// If you have access to the current session in this component,
// you could merge in the updated progress and call saveSession(updatedSession).
  console.log('Progress updated:', progress);
};

  const handleStartNew = () => {
    clearSession();
    setCurrentView('practice');
  };

  const handleResumeSession = () => {
    setCurrentView('practice');
  };

  const handleRetrySession = () => {
    clearSession();
    setCurrentView('practice');
  };

  const handleBackToArticles = () => {
    navigate('/student/articles');
  };

  // Loading state
  if (currentView === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading dictation exercise..." />
      </div>
    );
  }

  // Article not found or error
  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Article Not Found</h2>
          <p className="text-gray-600 mb-4">The requested dictation exercise could not be found.</p>
          <button
            onClick={handleBackToArticles}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Articles
          </button>
        </div>
      </div>
    );
  }

  // Resume session prompt
  if (currentView === 'resume') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto p-6">
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-4xl mb-4">📚</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Resume Practice?</h2>
            <p className="text-gray-600 mb-4">
              You have an incomplete dictation session for "{article.title}".
            </p>
            
            {savedSession && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
                <div className="flex justify-between mb-1">
                  <span>Progress:</span>
                  <span>{savedSession.completedFragments} / {savedSession.fragments.length} fragments</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ 
                      width: `${(savedSession.completedFragments / savedSession.fragments.length) * 100}%` 
                    }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleResumeSession}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Resume Session
              </button>
              
              <button
                onClick={handleStartNew}
                className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
              >
                Start Over
              </button>

              <button
                onClick={handleBackToArticles}
                className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
              >
                Back to Articles
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results view
  if (currentView === 'results' && completedSession) {
    return (
      <SessionResults
        session={completedSession}
        onRetry={handleRetrySession}
        onReturnToList={handleBackToArticles}
      />
    );
  }

  // Main dictation practice view
  const fragments = convertToFragmentTiming(article);

  // Check if article has audio generated
  if (!article.fullAudioUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-4xl mb-4">🎵</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Audio Not Ready</h2>
          <p className="text-gray-600 mb-4">
            The audio for this article is still being generated. Please try again in a few moments.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh Page
            </button>
            <button
              onClick={handleBackToArticles}
              className="w-full px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Back to Articles
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <FragmentDictation
      articleName={article.articleName}
      articleTitle={article.title}
      fullAudioUrl={article.fullAudioUrl}
      fragments={fragments}
      onSessionComplete={handleSessionComplete}
      onProgressUpdate={handleProgressUpdate}
      showText={false} // Hide text by default for dictation
      allowGiveUp={true}
      // initialSession={savedSession || undefined}
    />
  );
};

export default DictationPracticePage;
