// src/pages/student/DictationPractice.tsx

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useArticle } from '../../hooks/useArticles';
import { useDictationProgress } from '../../hooks/useDictationProgress';
import FragmentDictation from '../../components/dictation/FragmentDictation';
import type { DictationSession, FragmentProgress } from '../../components/dictation/FragmentDictation';
// import SessionResults from '../../components/dictation/SessionResults';
// import {LoadingSpinner} from '../../components/common/LoadingSpinner';
// import type { FragmentTiming } from '../../hooks/useFragmentAudioPlayer';
// import { useQuery } from '@tanstack/react-query';
// import { apiGetAudioStatus } from '../../api/apiArticles';
// import type { AudioStatusResponse } from '../../types/audio.types';

import { useAudioStatus } from '../../hooks/useAudioStatus';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';


// type ViewMode = 'loading' | 'practice' | 'results' | 'resume';

const DictationPracticePage: React.FC = () => {
  const { articleName } = useParams<{ articleName: string }>();
  const navigate = useNavigate();

  // Main article data
  const { data: article, isLoading: articleLoading, error: articleError } = useArticle(articleName!);
  
  // REAL-TIME AUDIO STATUS MONITORING
  const { 
    data: audioStatus, 
    isLoading: audioLoading, 
    error: audioError,
    isRefetching 
  } = useAudioStatus(
    articleName!, 
    !!article && (article.status === 'processing' || article.status === 'ready')
  );
  const { saveSession } = useDictationProgress(articleName!);



  const handleSessionComplete = (session: DictationSession) => {
    // Persist final session and show results view
    saveSession(session);
    // Optionally, set a local state for results view if used in this page
    // setCompletedSession(session); setCurrentView('results');
  };

  const handleProgressUpdate = (_progress: FragmentProgress[]) => {
    // Optional: merge partial progress into a session and persist
    // For a lightweight MVP, log only; or implement merge if session state is held here
    // console.log('Progress updated', progress);
    // If current session state is available, merge and save:
    // const updatedSession = { ...existingSession, progress: mergedProgressArray };
    // saveSession(updatedSession);
  };

  // Loading state with detailed feedback
  if (articleLoading || audioLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <div>
            <p className="text-lg font-semibold text-gray-900">Loading Exercise</p>
            <p className="text-sm text-gray-600">
              {articleLoading ? 'Loading article...' : 'Checking audio status...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (articleError || audioError || !article || !audioStatus || !audioStatus?.audio?.fullAudioUrl || !audioStatus?.fragments) {
    console.log("article:",article, "audioStatus", audioStatus);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 mb-4">
            <ExclamationTriangleIcon className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Exercise</h2>
          <p className="text-gray-600 mb-4">
            {articleError?.message || audioError?.message || 'Something went wrong'}
          </p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/student/articles')}
              className="w-full px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Back to Articles
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Audio still processing - REAL-TIME STATUS
  if (article?.status === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-blue-600 mb-4">
            <div className="animate-spin w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Audio Processing</h2>
          <p className="text-gray-600 mb-4">
            The audio for this article is being generated. This usually takes 2-3 minutes.
          </p>
          
          {/* REAL-TIME STATUS INDICATOR */}
          {isRefetching && (
            <div className="flex items-center justify-center text-blue-600 text-sm mb-4">
              <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
              Checking status...
            </div>
          )}
          
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Check Again
            </button>
            <button
              onClick={() => navigate('/student/articles')}
              className="w-full px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Back to Articles
            </button>
          </div>
        </div>
      </div>
    );
  }


// Ready check: require URL and timing
const fullUrl = audioStatus?.audio?.fullAudioUrl; // ?? audioStatus?.fullAudioUrl ?? article?.fullAudioUrl;
const fragments = audioStatus?.fragments;

const hasReadyAudio = Boolean(fullUrl) && Array.isArray(fragments) && fragments.length > 0;

  // Audio not ready
  if (!hasReadyAudio){//(!article?.fullAudioUrl || !audioStatus?.fragments?.length) {
    console.log(article, audioStatus);
    console.log(article?.fullAudioUrl, audioStatus?.fragments?.length);
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-yellow-600 mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Audio Not Available</h2>
          <p className="text-gray-600 mb-4">
            This article doesn't have audio available yet. Please try another article or check back later.
          </p>
          <button
            onClick={() => navigate('/student/articles')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Articles
          </button>
        </div>
      </div>
    );
  }

  // SUCCESS - Ready for dictation
  return (
    <FragmentDictation
      articleName={article.articleName}
      articleTitle={article.title}
      fullAudioUrl={audioStatus.audio.fullAudioUrl}
      fragments={audioStatus.fragments??[]}
      onSessionComplete={handleSessionComplete}
      onProgressUpdate={handleProgressUpdate}
      showText={false}
      allowGiveUp={true}
    />
  );
};


export default DictationPracticePage;
